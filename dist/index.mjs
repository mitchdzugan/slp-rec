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
import * as toml from "smol-toml";
import cliProgress from "cli-progress";
import os from "os";
//#region userBaseInis.json
var userBaseInis_default = [
	{
		"path": "Config/Dolphin.ini",
		"ini": {
			"General": {
				"ShowLag": "False",
				"ShowFrameCount": "False",
				"ISOPaths": "2",
				"RecursiveISOPaths": "False",
				"NANDRootPath": "",
				"DumpPath": "",
				"WirelessMac": "",
				"WiiSDCardPath": ""
			},
			"Interface": {
				"ConfirmStop": "False",
				"UsePanicHandlers": "False",
				"OnScreenDisplayMessages": "False",
				"HideCursor": "True",
				"AutoHideCursor": "False",
				"LanguageCode": "",
				"ShowToolbar": "True",
				"ShowStatusbar": "True",
				"ShowSeekbar": "True",
				"ShowLogWindow": "False",
				"ShowLogConfigWindow": "False",
				"ExtendedFPSInfo": "False",
				"ThemeName": "Clean Blue",
				"PauseOnFocusLost": "False",
				"DisableTooltips": "False"
			},
			"Display": {
				"FullscreenResolution": "Auto",
				"Fullscreen": "False",
				"RenderToMain": "False",
				"RenderWindowAutoSize": "True",
				"KeepWindowOnTop": "False",
				"ProgressiveScan": "False",
				"PAL60": "True",
				"DisableScreenSaver": "True",
				"ForceNTSCJ": "False"
			},
			"GameList": {
				"ListDrives": "False",
				"ListWad": "True",
				"ListElfDol": "True",
				"ListWii": "True",
				"ListGC": "True",
				"ListJap": "True",
				"ListPal": "True",
				"ListUsa": "True",
				"ListAustralia": "True",
				"ListFrance": "True",
				"ListGermany": "True",
				"ListItaly": "True",
				"ListKorea": "True",
				"ListNetherlands": "True",
				"ListRussia": "True",
				"ListSpain": "True",
				"ListTaiwan": "True",
				"ListWorld": "True",
				"ListUnknown": "True",
				"ListSort": "3",
				"ListSortSecondary": "0",
				"ColorCompressed": "True",
				"ColumnPlatform": "True",
				"ColumnBanner": "True",
				"ColumnNotes": "True",
				"ColumnFileName": "True",
				"ColumnID": "True",
				"ColumnRegion": "True",
				"ColumnSize": "True",
				"ColumnState": "False"
			},
			"Core": {
				"HLE_BS2": "False",
				"TimingVariance": "8",
				"CPUCore": "1",
				"Fastmem": "True",
				"CPUThread": "True",
				"DSPHLE": "True",
				"SyncOnSkipIdle": "True",
				"SyncGPU": "False",
				"SyncGpuMaxDistance": "200000",
				"SyncGpuMinDistance": "-200000",
				"SyncGpuOverclock": "1.00000000",
				"FPRF": "False",
				"AccurateNaNs": "False",
				"DefaultISO": "",
				"BootDefaultISO": "False",
				"DVDRoot": "",
				"Apploader": "",
				"SelectedLanguage": "0",
				"OverrideGCLang": "False",
				"DPL2Decoder": "False",
				"TimeStretching": "False",
				"RSHACK": "False",
				"Latency": "0",
				"ReduceTimingDispersion": "False",
				"SlippiOnlineDelay": "2",
				"SlippiEnableSpectator": "True",
				"SlippiSpectatorLocalPort": "51441",
				"SlippiSaveReplays": "True",
				"SlippiEnableQuickChat": "0",
				"SlippiForceNetplayPort": "False",
				"SlippiNetplayPort": "2626",
				"SlippiForceLanIp": "False",
				"SlippiLanIp": "",
				"SlippiReplayMonthFolders": "False",
				"SlippiPlaybackDisplayFrameIndex": "False",
				"BlockingPipes": "False",
				"AgpCartAPath": "",
				"AgpCartBPath": "",
				"SlotA": "255",
				"SerialPort1": "255",
				"BBA_MAC": "",
				"SIDevice0": "12",
				"AdapterRumble0": "True",
				"SimulateKonga0": "False",
				"SIDevice1": "12",
				"AdapterRumble1": "True",
				"SimulateKonga1": "False",
				"SIDevice2": "12",
				"AdapterRumble2": "True",
				"SimulateKonga2": "False",
				"SIDevice3": "12",
				"AdapterRumble3": "True",
				"SimulateKonga3": "False",
				"WiiSDCard": "False",
				"WiiKeyboard": "False",
				"WiimoteContinuousScanning": "False",
				"WiimoteEnableSpeaker": "False",
				"RunCompareServer": "False",
				"RunCompareClient": "False",
				"EmulationSpeed": "1.00000000",
				"FrameSkip": "0x00000000",
				"Overclock": "1.00000000",
				"OverclockEnable": "False",
				"GFXBackend": "OGL",
				"GPUDeterminismMode": "auto",
				"PerfMapDir": "",
				"EnableCustomRTC": "False",
				"CustomRTCValue": "0x386d4380",
				"AllowAllNetplayVersions": "False",
				"QoSEnabled": "True",
				"AdapterWarning": "True",
				"ShownLagReductionWarning": "False"
			},
			"Movie": {
				"PauseMovie": "False",
				"Author": "",
				"DumpFrames": "True",
				"DumpFramesSilent": "False",
				"ShowInputDisplay": "False",
				"ShowRTC": "False"
			},
			"DSP": {
				"EnableJIT": "True",
				"DumpAudio": "True",
				"DumpAudioSilent": "False",
				"DumpUCode": "False",
				"Backend": "No audio output",
				"Volume": "26",
				"CaptureLog": "False"
			},
			"Input": { "BackgroundInput": "False" },
			"FifoPlayer": { "LoopReplay": "True" },
			"Analytics": {
				"ID": "f21af0d6e773dd537a188b6da4530e81",
				"Enabled": "False",
				"PermissionAsked": "True"
			},
			"Network": {
				"SSLDumpRead": "False",
				"SSLDumpWrite": "False",
				"SSLVerifyCert": "False",
				"SSLDumpRootCA": "False",
				"SSLDumpPeerCert": "False"
			},
			"BluetoothPassthrough": {
				"Enabled": "False",
				"VID": "-1",
				"PID": "-1",
				"LinkKeys": ""
			},
			"Sysconf": {
				"SensorBarPosition": "1",
				"SensorBarSensitivity": "50331648",
				"SpeakerVolume": "88",
				"WiimoteMotor": "True",
				"WiiLanguage": "1",
				"AspectRatio": "1",
				"Screensaver": "0"
			}
		}
	},
	{
		"path": "Config/GFX.ini",
		"ini": {
			"Hardware": {
				"VSync": "False",
				"Adapter": "0"
			},
			"Settings": {
				"AspectRatio": "5",
				"Crop": "False",
				"wideScreenHack": "False",
				"UseXFB": "False",
				"UseRealXFB": "False",
				"SafeTextureCacheColorSamples": "128",
				"ShowFPS": "False",
				"ShowNetPlayPing": "False",
				"ShowNetPlayMessages": "False",
				"ShowOSDClock": "False",
				"ShowFrameTimes": "False",
				"LogRenderTimeToFile": "False",
				"ShowInputDisplay": "False",
				"OverlayStats": "False",
				"OverlayProjStats": "False",
				"DumpTextures": "True",
				"DumpVertexLoader": "False",
				"HiresTextures": "True",
				"HiresMaterialMaps": "False",
				"HiresMaterialMapsBuild": "False",
				"ConvertHiresTextures": "False",
				"CacheHiresTextures": "False",
				"DumpEFBTarget": "False",
				"DumpFramesAsImages": "False",
				"FreeLook": "False",
				"InternalResolutionFrameDumps": "True",
				"CompileShaderOnStartup": "True",
				"UseFFV1": "False",
				"DumpFormat": "avi",
				"DumpCodec": "",
				"DumpPath": "",
				"BitrateKbps": "1000000",
				"EnablePixelLighting": "False",
				"ForcedLighting": "False",
				"ForcePhongShading": "False",
				"RimPower": "80",
				"RimIntesity": "0",
				"RimBase": "10",
				"SpecularMultiplier": "255",
				"SimBumpEnabled": "False",
				"SimBumpStrength": "0",
				"SimBumpDetailFrequency": "128",
				"SimBumpThreshold": "16",
				"SimBumpDetailBlend": "16",
				"FastDepthCalc": "True",
				"MSAA": "2",
				"SSAA": "True",
				"EFBScale": "1",
				"TexFmtOverlayEnable": "False",
				"TexFmtOverlayCenter": "False",
				"Wireframe": "False",
				"DisableFog": "False",
				"EnableOpenCL": "False",
				"BorderlessFullscreen": "False",
				"SWZComploc": "True",
				"SWZFreeze": "True",
				"SWDumpObjects": "False",
				"SWDumpTevStages": "False",
				"SWDumpTevTexFetches": "False",
				"SWDrawStart": "0",
				"SWDrawEnd": "100000",
				"EnableValidationLayer": "False",
				"BackendMultithreading": "True",
				"CommandBufferExecuteInterval": "100"
			},
			"Enhancements": {
				"ForceFiltering": "False",
				"DisableFiltering": "False",
				"MaxAnisotropy": "3",
				"PostProcessingEnable": "False",
				"PostProcessingTrigger": "0",
				"PostProcessingShaders": "",
				"ScalingShader": "",
				"UseScalingFilter": "True",
				"TextureScalingType": "0",
				"TextureScalingFactor": "2",
				"UseDePosterize": "True",
				"Tessellation": "False",
				"TessellationEarlyCulling": "False",
				"TessellationDistance": "0",
				"TessellationMax": "6",
				"TessellationRoundingIntensity": "0",
				"TessellationDisplacementIntensity": "0",
				"ForceTrueColor": "False"
			},
			"Stereoscopy": {
				"StereoMode": "0",
				"StereoDepth": "20",
				"StereoConvergencePercentage": "100",
				"StereoSwapEyes": "False",
				"StereoShader": "Anaglyph/dubois"
			},
			"Hacks": {
				"EFBAccessEnable": "False",
				"EFBFastAccess": "False",
				"ForceProgressive": "True",
				"EFBToTextureEnable": "True",
				"EFBScaledCopy": "True",
				"EFBEmulateFormatChanges": "False",
				"ForceDualSourceBlend": "False",
				"FullAsyncShaderCompilation": "True",
				"WaitForShaderCompilation": "False",
				"EnableGPUTextureDecoding": "False",
				"EnableComputeTextureEncoding": "False",
				"PredictiveFifo": "False",
				"BoundingBoxMode": "0",
				"LastStoryEFBToRam": "False",
				"ForceLogicOpBlend": "False",
				"VertexRounding": "False"
			}
		}
	},
	{
		"path": "Config/Logger.ini",
		"ini": {
			"LogWindow": {
				"x": "400",
				"y": "600",
				"pos": "2"
			},
			"Options": {
				"Font": "0",
				"WrapLines": "False"
			}
		}
	}
];
//#endregion
//#region index.js
const { SlippiGame } = SLP_PKG;
async function doesFileExist(path) {
	try {
		await fs.access(path, fs.constants.F_OK);
		return true;
	} catch {
		return false;
	}
}
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
    `.split("\n").map((s) => s.trim()).join("\n");
}
const GAME_FIRST_FRAME = -123;
async function slurp(filename, opts = {}) {
	try {
		return await fs.readFile(filename, {
			encoding: "utf8",
			...opts
		});
	} catch (e) {
		return;
	}
}
async function slurpJson(...args) {
	try {
		const contents = await slurp(...args);
		return JSON.parse(contents.trim());
	} catch (e) {
		return;
	}
}
const paths = envPaths("slp-rec", { suffix: "" });
const configPath = path.join(paths.config, "config.toml");
const launcherSettingsPath = path.join(paths.config, "..", "Slippi Launcher", "Settings");
const optionDefinitions = [
	{
		name: "help",
		alias: "h",
		type: Boolean,
		description: "Display this usage guide."
	},
	{
		name: "start-frame",
		alias: "s",
		type: Number,
		description: "First frame to begin recording (default GAME_FRAME_START)",
		typeLabel: "<frame>"
	},
	{
		name: "total-frames",
		alias: "t",
		type: Number,
		description: "Total frames to record (default all remaining)",
		typeLabel: "<frames>"
	},
	{
		name: "quality",
		alias: "q",
		type: String,
		description: "Quality preset to use for recording",
		typeLabel: "<qual>"
	},
	{
		name: "output",
		alias: "o",
		type: String,
		description: "The output mp4 filename",
		typeLabel: "<mp4>",
		defaultValue: "output.mp4"
	},
	{
		name: "iso",
		alias: "i",
		type: String,
		description: "The melee iso to use while recording",
		typeLabel: "<iso>"
	},
	{
		name: "ini",
		alias: "I",
		lazyMultiple: true,
		type: String,
		description: "modifications to default INI configs",
		typeLabel: "<ini_filename>.<property>=<value>"
	},
	{
		name: "file",
		alias: "f",
		type: String,
		description: "The slp file to record",
		typeLabel: "<slp>",
		defaultOption: true
	},
	{
		name: "gecko-code",
		alias: "c",
		lazyMultiple: true,
		type: String,
		description: "gecko code to include",
		typeLabel: "<gecko_filename>"
	},
	{
		name: "gecko-enable",
		alias: "g",
		lazyMultiple: true,
		type: String,
		description: "non-default gecko codes to enable",
		typeLabel: "<gecko_codename>"
	},
	{
		name: "gecko-disable",
		alias: "G",
		lazyMultiple: true,
		type: String,
		description: "default gecko codes to disable",
		typeLabel: "<gecko_codename>"
	},
	{
		name: "texture-path",
		alias: "x",
		type: String,
		description: "folder containing textures to inject",
		typeLabel: "<directory>"
	},
	{
		name: "temp-root",
		alias: "T",
		type: String,
		description: "directory to place temporary work files",
		typeLabel: "<directory>"
	},
	{
		name: "port-colors",
		alias: "p",
		type: String,
		lazyMultiple: true,
		description: "color override for port",
		typeLabel: "<1|2|3|4>=<0|1|2|3|4|5>"
	}
];
function informUsageAndExit(opts = {}) {
	const { exitCode = 0, stderr } = opts;
	if (stderr) console.error(stderr);
	const usage = commandLineUsage([
		{
			header: "Usage:",
			content: "slp-rec [OPT]* <slp>"
		},
		{
			header: "Options",
			optionList: optionDefinitions
		},
		{ content: ["{bold Project home:} {underline https://github.com/mitchdzugan/slp-rec}", "{bold Config Path:} " + configPath].join("\n") }
	]);
	console.log(usage);
	process.exit(exitCode);
}
function failOptions(message) {
	informUsageAndExit({
		exitCode: 1,
		stderr: `ERROR -- ${message}`
	});
}
const options = commandLineArgs(optionDefinitions, { camelCase: true });
if (options.help) informUsageAndExit();
const portColors = {};
for (const pc of options.portColors || []) {
	const [p, c] = pc.split("=");
	portColors[parseInt(p) - 1] = parseInt(c);
}
let _configPromise = null;
function getConfigJson() {
	if (!_configPromise) _configPromise = (async function() {
		const launcherSettings = await slurpJson(launcherSettingsPath) || { settings: {} };
		const userConfig = await fs.readFile(configPath, "utf8").then((s) => toml.parse(s));
		if (userConfig.geckoCode) userConfig.geckoCode = userConfig.geckoCode.map((code) => code.startsWith("/") ? code : path.join(path.dirname(configPath), code));
		return {
			ssbmIsoPath: launcherSettings.settings && launcherSettings.settings.isoPath,
			slippiPlaybackBin: "slippi-playback",
			ffmpegBin: "ffmpeg",
			...userConfig || {},
			...options.iso ? { ssbmIsoPath: options.iso } : {},
			...options
		};
	})();
	return _configPromise;
}
function mkConfigGetter(g) {
	return async function() {
		const config = await getConfigJson();
		return config && config[g];
	};
}
const cfg_slippiPlaybackBin = mkConfigGetter("slippiPlaybackBin");
const cfg_ssbmIsoPath = mkConfigGetter("ssbmIsoPath");
const cfg_ffmpegBin = mkConfigGetter("ffmpegBin");
const cfg_texturePath = mkConfigGetter("texturePath");
const cfg_geckoCode = mkConfigGetter("geckoCode");
const cfg_geckoEnabled = mkConfigGetter("geckoEnabled");
const cfg_geckoDisabled = mkConfigGetter("geckoDisabled");
if (!options.file) failOptions("input .slp file must be provided");
const tempRoot = options.tempRoot || paths.temp;
const workRoot = path.join(tempRoot, "work");
function timestamp() {
	return Math.floor(Date.now() / 1e3);
}
const Command = {
	MESSAGE_SIZES: 53,
	GAME_START: 54,
	PRE_FRAME_UPDATE: 55,
	POST_FRAME_UPDATE: 56,
	GAME_END: 57,
	ITEM_UPDATE: 59,
	FRAME_BOOKEND: 60
};
function getMessageSizes(buffer, position) {
	const messageSizes = {};
	if (position === 0) {
		messageSizes[54] = 320;
		messageSizes[55] = 6;
		messageSizes[56] = 70;
		messageSizes[57] = 1;
		return messageSizes;
	}
	if (buffer[position + 0] !== Command.MESSAGE_SIZES) return {};
	const payloadLength = buffer[position + 1];
	messageSizes[53] = payloadLength;
	for (let i = 0; i < payloadLength - 1; i += 3) {
		const command = buffer[position + i + 2];
		messageSizes[command] = buffer[position + i + 3] << 8 | buffer[position + i + 4];
	}
	return messageSizes;
}
function getRawDataPosition(buffer) {
	if (buffer[0] === 54) return 0;
	if (buffer[0] !== "{".charCodeAt(0)) return 0;
	return 15;
}
const RECORD_JSON_BASE = {
	mode: "normal",
	isRealTimeMode: false
};
function mkRecordJson(replay) {
	const recordJson = {
		...RECORD_JSON_BASE,
		replay
	};
	recordJson.commandId = path.basename(path.dirname(replay));
	let startFrame = GAME_FIRST_FRAME;
	if (options.startFrame !== void 0) {
		startFrame = options.startFrame;
		recordJson.startFrame = startFrame;
	}
	if (options.totalFrames !== void 0) recordJson.endFrame = startFrame + options.totalFrames;
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
var UPATH_CLASS = class {
	constructor(fileParts) {
		this.rawPath = path.join(...fileParts);
	}
	async resolve(shouldConPaths) {
		if (!shouldConPaths) return this.rawPath;
		const { stdout } = await execa("wslpath", ["-w", this.rawPath]);
		return stdout.trim();
	}
};
function isUPATH(any) {
	return any instanceof UPATH_CLASS;
}
function UPATH(...fileParts) {
	return new UPATH_CLASS(fileParts);
}
async function mkExe(bin, rawArgs, ...rest) {
	const args = [];
	const isWslExecutingWindows = bin.endsWith(".exe") && !isWindows;
	for (const rawArg of rawArgs) if (isUPATH(rawArg)) args.push(await rawArg.resolve(isWslExecutingWindows));
	else args.push(rawArg);
	return () => execa(bin, args, ...rest);
}
async function doExe(...args) {
	return await (await mkExe(...args))();
}
async function execSlippi(slippiPlaybackBin, aviFile, playbackArgs, lastFrame, waitForAviBlackScreen) {
	const recordedFrames = /* @__PURE__ */ new Set();
	const isWinExe = slippiPlaybackBin.endsWith(".exe");
	let latestFrame;
	let didFinish = false;
	let didStartWaitingEnd = false;
	let res;
	const totalFrames = options.totalFrames;
	const { SingleBar, Presets } = cliProgress;
	const progressBar = new SingleBar({}, Presets.legacy);
	progressBar.start(totalFrames || 1 + lastFrame - GAME_FIRST_FRAME, 0);
	try {
		const slippiProcess = (await mkExe(slippiPlaybackBin, playbackArgs))();
		for await (const stdoutLine of slippiProcess) {
			if (didFinish) break;
			if (stdoutLine.startsWith("[CURRENT_FRAME]")) {
				const currentFrame = parseInt(stdoutLine.substring(15).trim());
				if (!didStartWaitingEnd) {
					if (await doesFileExist(aviFile)) {
						didStartWaitingEnd = true;
						waitForAviBlackScreen().then((waitingResult) => res = waitingResult).catch(console.error).finally(async () => {
							progressBar.stop();
							didFinish = true;
							if (isWinExe) await execa("taskkill.exe", [
								"/IM",
								"Slippi Dolphin.exe",
								"/F",
								"/T"
							]);
							else slippiProcess.kill();
						});
					}
				}
				recordedFrames.add(currentFrame);
				if (latestFrame === void 0 || currentFrame > latestFrame) {
					latestFrame = currentFrame;
					if (totalFrames && totalFrames <= recordedFrames.size) {
						progressBar.stop();
						didFinish = true;
						if (isWinExe) await execa("taskkill.exe", [
							"/IM",
							"Slippi Dolphin.exe",
							"/F",
							"/T"
						]);
						else slippiProcess.kill();
					}
				}
				progressBar.update(recordedFrames.size);
			}
		}
	} catch (e) {
		if (!didFinish) {
			progressBar.stop();
			throw e;
		}
	}
	return res;
}
async function isDirectory(path) {
	try {
		return (await fs.stat(path)).isDirectory();
	} catch (error) {
		if (error.code === "ENOENT") return false;
		throw error;
	}
}
async function recordSlp(filename) {
	const slippiPlaybackBin = await cfg_slippiPlaybackBin();
	const ssbmIsoPath = await cfg_ssbmIsoPath();
	const ffmpegBin = await cfg_ffmpegBin();
	const texturePath = await cfg_texturePath();
	const workId = `wd-${timestamp()}-${hash(path.normalize(filename))}-${process.pid}`;
	const workDir = path.join(workRoot, workId);
	const userDir = path.join(workDir, "User");
	await mkdirp(userDir);
	const iniOverridesByPath = {};
	for (const overrideStr of options.ini || []) {
		const [pathParts, val] = overrideStr.split("=");
		const [baseFile, ...path] = pathParts.split(".");
		iniOverridesByPath[`Config/${baseFile}.ini`] ||= [];
		iniOverridesByPath[`Config/${baseFile}.ini`].push({
			path,
			val
		});
	}
	for (const { path: relPath, ini: rawIniJson } of userBaseInis_default) {
		const iniJson = JSON.parse(JSON.stringify(rawIniJson));
		const fullPath = path.join(userDir, relPath);
		const iniDir = path.dirname(fullPath);
		for (const { path, val } of iniOverridesByPath[relPath] || []) {
			const ST = {
				focus: iniJson,
				complete: () => {}
			};
			for (const step of path) {
				ST.complete();
				ST.complete = (val) => {
					if (!ST.focus[step] && !val) ST.focus[step] = {};
					else if (val) ST.focus[step] = val;
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
	const cfgCode = await cfg_geckoCode();
	const allEnabled = [...await cfg_geckoEnabled() || [], ...options.geckoEnable || []];
	const allDisabled = [...await cfg_geckoDisabled() || [], ...options.geckoDisable || []];
	const gsContent = mkGameSettings(await Promise.all(cfgCode.map((f) => fs.readFile(f, "utf8"))), allEnabled, allDisabled);
	await mkdirp(gsDir);
	await fs.writeFile(gsFile, gsContent);
	if (texturePath && await isDirectory(texturePath)) {
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
		if (buffer[pos] === Command.GAME_START) {
			const start = pos;
			for (let myPortId = 0; myPortId < 4; myPortId++) {
				const colorOverride = portColors[myPortId];
				const offset = myPortId * 36;
				if (colorOverride !== void 0) buffer[104 + offset + start] = colorOverride;
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
		...["--exec", UPATH(ssbmIsoPath)]
	];
	const lastFrame = new SlippiGame(slpFile).getStats().lastFrame;
	const aviFile = UPATH(userDir, "Dump", "Frames", "framedump0.avi");
	const wavFile = UPATH(userDir, "Dump", "Audio", "dspdump.wav");
	const totalVideoFrames = await limitExecutionTime(1e3 * 60 * 1e3, () => execSlippi(slippiPlaybackBin, aviFile.rawPath, playbackArgs, lastFrame, async function() {
		const execaArgs = [ffmpegBin, [
			"-loglevel",
			"debug",
			"-i",
			"pipe:0",
			"-vf",
			"blackdetect=d=2:pix_th=0.01",
			"-an",
			"-f",
			"null",
			"-"
		]];
		const tail = new TailFile(aviFile.rawPath, {
			startPos: 0,
			pollFileIntervalMs: 10
		});
		await tail.start();
		const detectPrc = (await mkExe(...execaArgs, { stderr: "pipe" }))();
		tail.pipe(detectPrc.stdin);
		let offFrame = false;
		detectPrc.stderr.on("data", async (rawStderrLine) => {
			if (offFrame) return;
			console.log(rawStderrLine.toString("utf8"));
			const stderrLine = rawStderrLine.toString("utf8");
			try {
				if (stderrLine.startsWith("[Parsed_blackdetect_0")) {
					function getFrameNumberIfBlackScreenImpl() {
						const oframe = Number(stderrLine.split(" frame:")[1].split(" ")[0]);
						const bratio = Number(stderrLine.split(" picture_black_ratio:")[1].split(" ")[0]);
						return !Number.isNaN(oframe) && !Number.isNaN(bratio) && bratio > .99 ? oframe : void 0;
					}
					function getFrameNumberIfBlackScreen() {
						try {
							return getFrameNumberIfBlackScreenImpl();
						} catch (_e) {
							return;
						}
					}
					offFrame ||= getFrameNumberIfBlackScreen();
					console.log({ offFrame });
					if (offFrame) {
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
		} catch (____e) {}
		console.log({ offFrame });
		return offFrame + 1;
	}));
	const outFile = UPATH(workDir, "output.avi");
	const execaArgs = [ffmpegBin, [
		...[
			"-i",
			aviFile,
			"-i",
			wavFile
		],
		...totalVideoFrames ? ["-t", `${totalVideoFrames / 60}`] : [],
		...[
			"-c:v",
			"copy",
			"-c:a",
			"copy"
		],
		outFile
	]];
	await doExe(execaArgs[0], execaArgs[1]);
	await fs.copyFile(outFile.rawPath, options.output);
	await fs.rm(workDir, {
		recursive: true,
		force: true
	});
}
recordSlp(options.file).then(() => process.exit()).catch((e) => {
	console.error(e);
	process.exit(1);
});
//#endregion
export {};
