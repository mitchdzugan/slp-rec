#!/usr/bin/env node

import path from "node:path";
import * as fs from "node:fs/promises";
import TailFile from "@logdna/tail-file";
import envPaths from "env-paths";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
import { mkdirp } from "mkdirp";
import { hash } from "hash-it";
import { execa } from "execa";
import * as SLP_PKG from "@slippi/slippi-js/node";
import * as ini from "ini";
import os from "os";
import userBaseInisStr from "./userBaseInis.json";
const userBaseInis = JSON.parse(userBaseInisStr);
const { SlippiGame } = SLP_PKG;

const isWindows = os.platform() === "win32";

function mkGeckoLn(g) {
  return `$Optional: ${g}`;
}
function mkGeckoLns(gs) {
  return gs.map(mkGeckoLn).join("\n");
}
function mkGameSettings(plusCodes, enabled, disabled) {
  return `
        [Gecko]
  ${plusCodes.join("\n")}
        [Gecko_Enabled]
	${mkGeckoLns(enabled)}
        [Gecko_Disabled]
	${mkGeckoLns(disabled)}
    `
    .split("\n")
    .map((s) => s.trim())
    .join("\n");
}

function geckoCode(...lines) {
  return `${lines.join("\n")}\n`;
}

const plusCodes = [
  geckoCode(
    "$Optional: Prevent Character Crowd Chants [Fizzi]",
    "*Disables crowd chanting for characters",
    "04321D70 38600000",
  ),
  geckoCode(
    "$Optional: Prevent Crowd Noises [Fizzi]",
    "*Disables all other crowd oohs, ahs and whoahs",
    "04024170 3860FFFF",
  ),
];
const defaultEnabled = [
  "Game Music OFF",
  "Hide Waiting For Game",
  "Prevent Character Crowd Chants",
  "Prevent Crowd Noises",
];
const defaultDisabled = ["Show Player Names"];

const GAME_FIRST_FRAME = 0 - 123;

async function slurp(filename, opts = {}) {
  try {
    return await fs.readFile(filename, { encoding: "utf8", ...opts });
  } catch (e) {
    return undefined;
  }
}

async function slurpJson(...args) {
  try {
    const contents = await slurp(...args);
    return JSON.parse(contents.trim());
  } catch (e) {
    return undefined;
  }
}

const paths = envPaths("slp-rec", { suffix: "" });
const configPath = path.join(paths.config, "config.json");

const launcherSettingsPath = path.join(
  paths.config,
  "..",
  "Slippi Launcher",
  "Settings",
);
const optionDefinitions = [
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Display this usage guide.",
  },
  {
    name: "start-frame",
    alias: "s",
    type: Number,
    description: "First frame to begin recording (default GAME_FRAME_START)",
    typeLabel: "<frame>",
  },
  {
    name: "total-frames",
    alias: "t",
    type: Number,
    description: "Total frames to record (default all remaining)",
    typeLabel: "<frames>",
  },
  {
    name: "quality",
    alias: "q",
    type: String,
    description: "Quality preset to use for recording",
    typeLabel: "<qual>",
  },
  {
    name: "output",
    alias: "o",
    type: String,
    description: "The output mp4 filename",
    typeLabel: "<mp4>",
    defaultValue: "output.mp4",
  },
  {
    name: "iso",
    alias: "i",
    type: String,
    description: "The melee iso to use while recording",
    typeLabel: "<iso>",
  },
  {
    name: "ini",
    alias: "I",
    lazyMultiple: true,
    type: String,
    description: "modifications to default INI configs",
    typeLabel: "'[INI_FILE, ...KEYS, VALUE]'",
  },
  {
    name: "file",
    alias: "f",
    type: String,
    description: "The slp file to record",
    typeLabel: "<slp>",
    defaultOption: true,
  },
];

function informUsageAndExit(opts = {}) {
  const { exitCode = 0, stderr } = opts;
  if (stderr) {
    console.error(stderr);
  }
  const usage = commandLineUsage([
    {
      header: "Usage:",
      content: "slp-rec [OPT]* <slp>",
    },
    {
      header: "Options",
      optionList: optionDefinitions,
    },
    {
      content:
        "Project home: {underline https://github.com/mitchdzugan/slp-rec}",
    },
  ]);
  console.log(usage);
  process.exit(exitCode);
}

function failOptions(message) {
  informUsageAndExit({ exitCode: 1, stderr: `ERROR -- ${message}` });
}

const options = commandLineArgs(optionDefinitions, { camelCase: true });
if (options.help) {
  informUsageAndExit();
}

let _configPromise = null;
function getConfigJson() {
  if (!_configPromise) {
    _configPromise = (async function () {
      const launcherSettings = (await slurpJson(launcherSettingsPath)) || {
        settings: {},
      };
      const userConfig = await slurpJson(configPath);
      const defaultConfig = {
        ssbmIsoPath:
          launcherSettings.settings && launcherSettings.settings.isoPath,
        slippiPlaybackBin: "slippi-playback",
        ffmpegBin: "ffmpeg",
      };

      return {
        ...defaultConfig,
        ...(userConfig || {}),
      };
    })();
  }
  return _configPromise;
}

function mkConfigGetter(g) {
  return async function () {
    const config = await getConfigJson();
    return config && config[g];
  };
}

const cfg_slippiPlaybackBin = mkConfigGetter("slippiPlaybackBin");
const cfg_ssbmIsoPath = mkConfigGetter("ssbmIsoPath");
const cfg_ffmpegBin = mkConfigGetter("ffmpegBin");
const cfg_texturePath = mkConfigGetter("texturePath");

if (!options.file) {
  failOptions("input .slp file must be provided");
}

const workRoot = path.join(paths.temp, "work");

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
    messageSizes[command] =
      (buffer[position + i + 3] << 8) | buffer[position + i + 4];
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
  return path.join(workDir, "record.json");
}

async function writeRecordJson(workDir) {
  const slpFilename = path.join(workDir, "input.slp");
  const jsonFilename = getRecordJsonPath(workDir);
  const jsonContent = mkRecordJson(slpFilename);
  const content = JSON.stringify(jsonContent) + "\n";
  await fs.writeFile(jsonFilename, content, "utf8");
}

function limitExecutionTime(timeout, fn) {
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

class UPATH_CLASS {
  constructor(fileParts) {
    this.rawPath = path.join(...fileParts);
  }

  async resolve(shouldConPaths) {
    if (!shouldConPaths) {
      return this.rawPath;
    }
    const { stdout } = await execa("wslpath", ["-w", this.rawPath]);
    return stdout.trim();
  }
}
function isUPATH(any) {
  return any instanceof UPATH_CLASS;
}
function UPATH(...fileParts) {
  return new UPATH_CLASS(fileParts);
}
async function mkExe(bin, rawArgs, ...rest) {
  const args = [];
  const isWinExe = bin.endsWith(".exe");
  const isWslExecutingWindows = isWinExe && !isWindows;
  for (const rawArg of rawArgs) {
    if (isUPATH(rawArg)) {
      args.push(await rawArg.resolve(isWslExecutingWindows));
    } else {
      args.push(rawArg);
    }
  }
  return () => execa(bin, args, ...rest);
}
async function doExe(...args) {
  return await (
    await mkExe(...args)
  )();
}

async function execSlippi(
  slippiPlaybackBin,
  playbackArgs,
  lastFrame,
  isAviBlackScreen,
) {
  const recordedFrames = new Set();
  const isWinExe = slippiPlaybackBin.endsWith(".exe");
  let latestFrame;
  let didFinish = false;
  try {
    const slippiProcessExe = await mkExe(slippiPlaybackBin, playbackArgs);
    const slippiProcess = slippiProcessExe();
    for await (const stdoutLine of slippiProcess) {
      if (stdoutLine.startsWith("[CURRENT_FRAME]")) {
        const currentFrame = parseInt(stdoutLine.substring(15).trim());
        recordedFrames.add(currentFrame);
        if (latestFrame === undefined || currentFrame > latestFrame) {
          latestFrame = currentFrame;
        }
        console.error("recordedFrame", latestFrame, "of", lastFrame);
        if (latestFrame >= lastFrame) {
          await isAviBlackScreen();
          didFinish = true;
          if (isWinExe) {
            await execa("taskkill.exe", [
              "/IM",
              "Slippi Dolphin.exe",
              "/F",
              "/T",
            ]);
          } else {
            slippiProcess.kill();
          }
          break;
        }
      }
    }
  } catch (e) {
    if (!didFinish) {
      throw e;
    }
  }
  return;
}

async function isDirectory(path) {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function recordSlp(filename) {
  const slippiPlaybackBin = await cfg_slippiPlaybackBin();
  const ssbmIsoPath = await cfg_ssbmIsoPath();
  const ffmpegBin = await cfg_ffmpegBin();
  const texturePath = await cfg_texturePath();

  const ts = timestamp();
  const fileHash = hash(path.normalize(filename));
  const pid = process.pid;
  const workId = `wd-${ts}-${fileHash}-${pid}`;
  const workDir = path.join(workRoot, workId);
  const userDir = path.join(workDir, "User");
  await mkdirp(userDir);

  const iniOverridesByPath = {};
  for (const overrideStr of options.ini || []) {
    const [pathParts, val] = overrideStr.split("=");
    const [baseFile, ...path] = pathParts.split(".");
    iniOverridesByPath[`Config/${baseFile}.ini`] ||= [];
    iniOverridesByPath[`Config/${baseFile}.ini`].push({ path, val });
  }

  for (const { path: relPath, ini: rawIniJson } of userBaseInis) {
    const iniJson = JSON.parse(JSON.stringify(rawIniJson));
    const fullPath = path.join(userDir, relPath);
    const iniDir = path.dirname(fullPath);

    for (const { path, val } of iniOverridesByPath[relPath] || []) {
      const ST = { focus: iniJson, complete: () => {} };
      for (const step of path) {
        ST.complete();
        ST.complete = (val) => {
          if (!ST.focus[step] && !val) {
            ST.focus[step] = {};
          } else if (val) {
            ST.focus[step] = val;
          }
          ST.focus = ST.focus[step];
        };
      }
      ST.complete(val);
    }

    await mkdirp(iniDir);
    await fs.writeFile(fullPath, ini.stringify(iniJson));
  }

  const gsDir = path.join(userDir, "GameSettings");
  const gsFile = path.join(gsDir, "GALE01.ini");
  const gsContent = mkGameSettings(plusCodes, defaultEnabled, defaultDisabled);
  await mkdirp(gsDir);
  await fs.writeFile(gsFile, gsContent);

  if (texturePath && (await isDirectory(texturePath))) {
    const texDir = path.join(userDir, "Load", "Textures");
    await mkdirp(texDir);
    const texLink = path.join(texDir, "GALE01");
    await fs.symlink(texturePath, texLink, "junction");
  }

  const buffer = await fs.readFile(filename);
  const rawPosition = getRawDataPosition(buffer);
  const messageSizes = getMessageSizes(buffer, rawPosition);

  let pos = rawPosition;
  while (pos < buffer.length) {
    const cmd = buffer[pos];
    if (cmd === Command.GAME_START) {
      const start = pos;
      for (let myPortId = 0; myPortId < 4; myPortId++) {
        const offset = myPortId * 0x24;
        const charId = buffer[0x68 + offset + start - 3];
        if (charId === 17) {
          // buffer[0x68 + offset + start] = 0;
        }
      }
    }
    pos += 1 + messageSizes[buffer[pos]];
  }
  const slpFile = path.join(workDir, "input.slp");
  await fs.writeFile(slpFile, buffer);
  await writeRecordJson(workDir);
  const playbackArgs = [
    "--cout",
    "--batch",
    ...["--user", UPATH(userDir)],
    ...["--slippi-input", UPATH(getRecordJsonPath(workDir))],
    ...["--exec", UPATH(ssbmIsoPath)],
  ];
  const game = new SlippiGame(slpFile);
  const stats = game.getStats();
  const lastFrame = stats.lastFrame;
  const aviFile = UPATH(userDir, "Dump", "Frames", "framedump0.avi");
  const wavFile = UPATH(userDir, "Dump", "Audio", "dspdump.wav");
  await limitExecutionTime(1000 * 60 * 1000, () =>
    execSlippi(slippiPlaybackBin, playbackArgs, lastFrame, async function () {
      const execaArgs = [
        ffmpegBin,
        [
          "-loglevel",
          "debug",
          "-i",
          "pipe:0",
          "-vf",
          "blackdetect=d=2:pix_th=0.01",
          "-an",
          "-f",
          "null",
          "-",
        ],
      ];
      const tail = new TailFile(aviFile.rawPath);
      await tail.start();
      const detectExe = await mkExe(...execaArgs, { stderr: "pipe" });
      const detectPrc = detectExe();
      tail.pipe(detectPrc.stdin);
      let isDone = false;
      detectPrc.stderr.on("data", async (rawStderrLine) => {
        const stderrLine = rawStderrLine.toString("utf8");
        try {
          if (stderrLine.startsWith("[Parsed_blackdetect_0")) {
            const oframe = Number(stderrLine.split(" frame:")[1].split(" ")[0]);
            const bratio = Number(
              stderrLine.split(" picture_black_ratio:")[1].split(" ")[0],
            );
            if (oframe > 1 && bratio > 0.99 && !isDone) {
              isDone = true;
              tail.unpipe(detectPrc.stdin);
              await tail.quit();
              detectPrc.kill();
            }
          }
        } catch (e) {
          console.log(e);
        }
      });
      try {
        await detectPrc;
      } catch (____) {}
      return true;
    }),
  );

  const outFile = UPATH(workDir, "output.avi");

  const execaArgs = [
    ffmpegBin,
    ["-i", aviFile, "-i", wavFile, "-c:v", "copy", "-c:a", "copy", outFile],
  ];

  await doExe(execaArgs[0], execaArgs[1]);
  await fs.copyFile(outFile.rawPath, options.output);
  await fs.rm(workDir, { recursive: true, force: true });
}

recordSlp(options.file)
  .then(() => process.exit())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
