import path from 'node:path';
import * as fs from 'node:fs/promises';
import envPaths from 'env-paths';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { mkdirp } from 'mkdirp';
import { hash } from 'hash-it';
import { execa } from 'execa';
import _ from 'lodash';
import { SlippiGame } from '@slippi/slippi-js';

const BASE_INI = {
    Dolphin: {
        Movie: {
            DumpFrames: 'True',
        },
        DSP: {
            DumpAudio: 'True',
            Backend: 'No audio output',
            Volume: 100,
        },
    },
    GFX: {
        Settings: {
            AspectRatio: '6',
            InternalResolutionFrameDumps: 'True',
        },
    },
};

const GAME_FIRST_FRAME = (0 - 123);

async function slurp(filename, opts = {}) {
    try {
        return await fs.readFile(filename, { encoding: 'utf8', ...opts });
    } catch (e) {
        return undefined;
    }
}

async function slurpJson(...args) {
    try {
        const contents = await slurp(...args);
        return JSON.parse(contents);
    } catch (e) {
        return undefined;
    }
}

const paths = envPaths('slp-rec', { suffix: '' });
const configPath = path.join(paths.config, 'config.json');

const launcherSettingsPath = (
    path.join(paths.config, '..', 'Slippi Launcher', 'Settings')
);
const launcherSettings = (
    await slurpJson(launcherSettingsPath)
) || { settings: {} };

const optionDefinitions = [
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display this usage guide.'
    },
    {
        name: 'start-frame',
        alias: 's',
        type: Number,
        description: 'First frame to begin recording (default GAME_FRAME_START)',
        typeLabel: '<frame>',
    },
    {
        name: 'total-frames',
        alias: 't',
        type: Number,
        description: 'Total frames to record (default all remaining)',
        typeLabel: '<frames>',
    },
    {
        name: 'quality',
        alias: 'q',
        type: String,
        description: 'Quality preset to use for recording',
        typeLabel: '<qual>',
    },
    {
        name: 'output',
        alias: 'o',
        type: String,
        description: 'The output mp4 filename',
        typeLabel: '<mp4>',
        defaultValue: 'output.mp4',
    },
    {
        name: 'iso',
        alias: 'i',
        type: String,
        description: 'The melee iso to use while recording',
        typeLabel: '<iso>',
    },
    {
        name: 'file',
        alias: 'f',
        type: String,
        description: 'The slp file to record',
        typeLabel: '<slp>',
        defaultOption: true,
    },
]

function informUsageAndExit(opts = {}) {
    const { exitCode = 0, stderr } = opts;
    if (stderr) {
        console.error(stderr);
    }
    const usage = commandLineUsage([
        {
            header: 'Usage:',
            content: 'slp-rec [OPT]* <slp>'
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        },
        {
            content: 'Project home: {underline https://github.com/mitchdzugan/slp-rec}'
        }
    ]);
    console.log(usage);
    process.exit(exitCode);
}

function failOptions(message) {
    informUsageAndExit({ exitCode: 1, stderr: `ERROR -- ${message}` });
}

const options = commandLineArgs(optionDefinitions, { camelCase: true });
if (options.help) { informUsageAndExit(); }

const defaultConfig = {
    ssbmIsoPath: launcherSettings.settings.isoPath,
    slippiPlaybackBin: 'slippi-playback',
    ffmpegBin: 'ffmpeg',
};

let _configPromise = null;
function getConfigJson() {
    if (!_configPromise) {
        _configPromise = ((async function() {
            const userConfig = await slurpJson(configPath);
            return {
                ...defaultConfig,
                ...(userConfig || {})
            };
        })());
    }
    return _configPromise;
}

function mkConfigGetter(g) {
    return async function() {
        const config = await getConfigJson();
        return _.get(config, g);
    };
}

const cfg_slippiPlaybackBin = mkConfigGetter('slippiPlaybackBin');
const cfg_ssbmIsoPath = mkConfigGetter('ssbmIsoPath');

if (!options.file) {
    failOptions('input .slp file must be provided');
}

const workRoot = path.join(paths.temp, 'work');

function timestamp() {
    return Math.floor(Date.now() / 1000);
}

const Command = {
    MESSAGE_SIZES: 0x35,
    GAME_START: 0x36,
    PRE_FRAME_UPDATE: 0x37,
    POST_FRAME_UPDATE: 0x38,
    GAME_END: 0x39,
    ITEM_UPDATE: 0x3b,
    FRAME_BOOKEND: 0x3c,
};

function getMessageSizes(buffer, position) {
    const messageSizes = {};
    // Support old file format
    if (position === 0) {
        messageSizes[0x36] = 0x140;
        messageSizes[0x37] = 0x6;
        messageSizes[0x38] = 0x46;
        messageSizes[0x39] = 0x1;
        return messageSizes;
    }

    if (buffer[position + 0] !== Command.MESSAGE_SIZES) {
        return {};
    }

    const payloadLength = buffer[position + 1];
    messageSizes[0x35] = payloadLength;

    for (let i = 0; i < payloadLength - 1; i += 3) {
        const command = buffer[position + i + 2];

        // Get size of command
        messageSizes[command] = (buffer[position + i + 3] << 8) | buffer[position + i + 4];
    }

    return messageSizes;
}

function getRawDataPosition(buffer) {
    if (buffer[0] === 0x36) {
        return 0;
    }
    if (buffer[0] !== "{".charCodeAt(0)) {
        return 0; // return error?
    }
    return 15;
}

const RECORD_JSON_BASE = {
    mode: "normal",
    isRealTimeMode: false,
};

function mkRecordJson(replay) {
    const recordJson = { ...RECORD_JSON_BASE, replay };
    recordJson.commandId = path.basename(path.dirname(replay));
    let startFrame = GAME_FIRST_FRAME;
    if (options.startFrame !== undefined) {
        startFrame = options.startFrame;
        recordJson.startFrame = startFrame;
    }
    if (options.totalFrames !== undefined) {
        recordJson.endFrame = startFrame + options.totalFrames;
    }
    return recordJson;
}

function getRecordJsonPath(workDir) {
    return path.join(workDir, 'record.json');
}

async function writeRecordJson(workDir) {
    const slpFilename = path.join(workDir, 'input.slp');
    const jsonFilename = getRecordJsonPath(workDir);
    const jsonContent = mkRecordJson(slpFilename);
    const content = JSON.stringify(jsonContent) + "\n";
    await fs.writeFile(jsonFilename, content, 'utf8');
}

function limitExecutionTime(fn, timeout) {
    return new Promise((resolve, reject) => {
        function throwTimeoutError() {
            reject(`Execution did not complete within ${timeout}ms`);
        }
        const timeoutId = setTimeout(throwTimeoutError, timeout);
        const res = fn();
        clearTimeout(timeoutId);
        resolve(res);
    });
}

async function execSlippi(slippiPlaybackBin, playbackArgs, lastFrame) {
    const recordedFrames = new Set();
    let latestFrame;
    const slippiProcess = execa(slippiPlaybackBin, playbackArgs);
    for await (const stdoutLine of slippiProcess) {
        if (stdoutLine.startsWith('[CURRENT_FRAME]')) {
            const currentFrame = parseInt(stdoutLine.substring(15).trim());
            recordedFrames.add(currentFrame);
            if (latestFrame === undefined || currentFrame > latestFrame) {
                latestFrame = currentFrame;
            }
            console.log({
                totalActualFrames: lastFrame - GAME_FIRST_FRAME,
                lastActualFrame: lastFrame,
                lastRecordedFrame: latestFrame,
                totalRecordedFrames: recordedFrames.size,
            });
            // console.log('is greater?', latestFrame >= lastFrame);
            if (latestFrame >= lastFrame) {
                slippiProcess.kill();
                break;
            }
        }
    }
    return;
}

async function recordSlp(filename) {
    const ts = timestamp();
    const fileHash = hash(path.normalize(filename));
    const pid = process.pid;
    const workId = `wd-${ts}-${fileHash}-${pid}`;
    const workDir = path.join(workRoot, workId);
    await mkdirp(workDir);
    const buffer = await fs.readFile(filename);
    const rawPosition = getRawDataPosition(buffer);
    const messageSizes = getMessageSizes(buffer, rawPosition);

    let pos = rawPosition;
    while (pos < buffer.length) {
        const cmd = buffer[pos];
        if (cmd === Command.GAME_START) {
            // const start = pos;
            // const offset = myPortId * 0x24;
            // buffer[0x68 + offset + start] = 0;
        }
        pos += 1 + messageSizes[buffer[pos]];
    }
    const slpFile = path.join(workDir, 'input.slp');
    await fs.writeFile(slpFile, buffer);
    await writeRecordJson(workDir);
    const slippiPlaybackBin = await cfg_slippiPlaybackBin();
    const ssbmIsoPath = await cfg_ssbmIsoPath();
    const playbackArgs = ([
        '--cout', '--batch',
        ...['--slippi-input', getRecordJsonPath(workDir)],
        ...['--exec', ssbmIsoPath],
    ]);
    const game = new SlippiGame(slpFile);
    const stats = game.getStats();
    const lastFrame = stats.lastFrame;
    await execSlippi(slippiPlaybackBin, playbackArgs, lastFrame);
    console.log({ slippiPlaybackBin, ssbmIsoPath, workDir });
    await fs.rm(workDir, { recursive: true, force: true });
}

// console.log({ workRoot });
await recordSlp(options.file);
