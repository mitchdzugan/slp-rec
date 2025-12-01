import path from 'node:path';
import * as fs from 'node:fs/promises';
import envPaths from 'env-paths';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { mkdirp } from 'mkdirp';
import { hash } from 'hash-it';

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
        description: 'First frame to begin recording',
        typeLabel: '<frame>',
        defaultValue: 0,
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
        name: 'input',
        alias: 'i',
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
if (options.help) {
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
    process.exit(0);
}

const defaultConfig = {
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

export async function slippiPlaybackBin() {
    const config = await getConfigJson();
    return config.slippiPlaybackBin;
}

if (!options.input) {
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
    let updated = false;
    while (!updated) {
        const cmd = buffer[pos];
        if (cmd === Command.GAME_START) {
            const start = pos;
            const offset = myPortId * 0x24;
            buffer[0x68 + offset + start] = 0;
            updated = true;
        }
        pos += 1 + messageSizes[buffer[pos]];
    }
    // await fs.writeFile(__dirname + "\\ready.slp", buffer);
    await fs.rm(workDir, { recursive: true, force: true });
}

// console.log({ workRoot });
await recordSlp(options.input);
