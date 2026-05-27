#!/usr/bin/env node
"use strict";

var _nodePath = _interopRequireDefault(require("node:path"));
var fs = _interopRequireWildcard(require("node:fs/promises"));
var _tailFile = _interopRequireDefault(require("@logdna/tail-file"));
var _envPaths = _interopRequireDefault(require("env-paths"));
var _commandLineArgs = _interopRequireDefault(require("command-line-args"));
var _commandLineUsage = _interopRequireDefault(require("command-line-usage"));
var _mkdirp = require("mkdirp");
var _hashIt = require("hash-it");
var _execa = require("execa");
var SLP_PKG = _interopRequireWildcard(require("@slippi/slippi-js/node"));
var ini = _interopRequireWildcard(require("ini"));
var toml = _interopRequireWildcard(require("smol-toml"));
var _cliProgress = _interopRequireDefault(require("cli-progress"));
var _os = _interopRequireDefault(require("os"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* babel-plugin-inline-import './userBaseInis.json' */
const userBaseInisStr = "[\n  {\n    \"path\": \"Config/Dolphin.ini\",\n    \"ini\": {\n      \"General\": {\n        \"ShowLag\": \"False\",\n        \"ShowFrameCount\": \"False\",\n        \"ISOPaths\": \"2\",\n        \"RecursiveISOPaths\": \"False\",\n        \"NANDRootPath\": \"\",\n        \"DumpPath\": \"\",\n        \"WirelessMac\": \"\",\n        \"WiiSDCardPath\": \"\"\n      },\n      \"Interface\": {\n        \"ConfirmStop\": \"False\",\n        \"UsePanicHandlers\": \"False\",\n        \"OnScreenDisplayMessages\": \"False\",\n        \"HideCursor\": \"True\",\n        \"AutoHideCursor\": \"False\",\n        \"LanguageCode\": \"\",\n        \"ShowToolbar\": \"True\",\n        \"ShowStatusbar\": \"True\",\n        \"ShowSeekbar\": \"True\",\n        \"ShowLogWindow\": \"False\",\n        \"ShowLogConfigWindow\": \"False\",\n        \"ExtendedFPSInfo\": \"False\",\n        \"ThemeName\": \"Clean Blue\",\n        \"PauseOnFocusLost\": \"False\",\n        \"DisableTooltips\": \"False\"\n      },\n      \"Display\": {\n        \"FullscreenResolution\": \"Auto\",\n        \"Fullscreen\": \"False\",\n        \"RenderToMain\": \"False\",\n        \"RenderWindowAutoSize\": \"True\",\n        \"KeepWindowOnTop\": \"False\",\n        \"ProgressiveScan\": \"False\",\n        \"PAL60\": \"True\",\n        \"DisableScreenSaver\": \"True\",\n        \"ForceNTSCJ\": \"False\"\n      },\n      \"GameList\": {\n        \"ListDrives\": \"False\",\n        \"ListWad\": \"True\",\n        \"ListElfDol\": \"True\",\n        \"ListWii\": \"True\",\n        \"ListGC\": \"True\",\n        \"ListJap\": \"True\",\n        \"ListPal\": \"True\",\n        \"ListUsa\": \"True\",\n        \"ListAustralia\": \"True\",\n        \"ListFrance\": \"True\",\n        \"ListGermany\": \"True\",\n        \"ListItaly\": \"True\",\n        \"ListKorea\": \"True\",\n        \"ListNetherlands\": \"True\",\n        \"ListRussia\": \"True\",\n        \"ListSpain\": \"True\",\n        \"ListTaiwan\": \"True\",\n        \"ListWorld\": \"True\",\n        \"ListUnknown\": \"True\",\n        \"ListSort\": \"3\",\n        \"ListSortSecondary\": \"0\",\n        \"ColorCompressed\": \"True\",\n        \"ColumnPlatform\": \"True\",\n        \"ColumnBanner\": \"True\",\n        \"ColumnNotes\": \"True\",\n        \"ColumnFileName\": \"True\",\n        \"ColumnID\": \"True\",\n        \"ColumnRegion\": \"True\",\n        \"ColumnSize\": \"True\",\n        \"ColumnState\": \"False\"\n      },\n      \"Core\": {\n        \"HLE_BS2\": \"False\",\n        \"TimingVariance\": \"8\",\n        \"CPUCore\": \"1\",\n        \"Fastmem\": \"True\",\n        \"CPUThread\": \"True\",\n        \"DSPHLE\": \"True\",\n        \"SyncOnSkipIdle\": \"True\",\n        \"SyncGPU\": \"False\",\n        \"SyncGpuMaxDistance\": \"200000\",\n        \"SyncGpuMinDistance\": \"-200000\",\n        \"SyncGpuOverclock\": \"1.00000000\",\n        \"FPRF\": \"False\",\n        \"AccurateNaNs\": \"False\",\n        \"DefaultISO\": \"\",\n        \"BootDefaultISO\": \"False\",\n        \"DVDRoot\": \"\",\n        \"Apploader\": \"\",\n        \"SelectedLanguage\": \"0\",\n        \"OverrideGCLang\": \"False\",\n        \"DPL2Decoder\": \"False\",\n        \"TimeStretching\": \"False\",\n        \"RSHACK\": \"False\",\n        \"Latency\": \"0\",\n        \"ReduceTimingDispersion\": \"False\",\n        \"SlippiOnlineDelay\": \"2\",\n        \"SlippiEnableSpectator\": \"True\",\n        \"SlippiSpectatorLocalPort\": \"51441\",\n        \"SlippiSaveReplays\": \"True\",\n        \"SlippiEnableQuickChat\": \"0\",\n        \"SlippiForceNetplayPort\": \"False\",\n        \"SlippiNetplayPort\": \"2626\",\n        \"SlippiForceLanIp\": \"False\",\n        \"SlippiLanIp\": \"\",\n        \"SlippiReplayMonthFolders\": \"False\",\n        \"SlippiPlaybackDisplayFrameIndex\": \"False\",\n        \"BlockingPipes\": \"False\",\n        \"AgpCartAPath\": \"\",\n        \"AgpCartBPath\": \"\",\n        \"SlotA\": \"255\",\n        \"SerialPort1\": \"255\",\n        \"BBA_MAC\": \"\",\n        \"SIDevice0\": \"12\",\n        \"AdapterRumble0\": \"True\",\n        \"SimulateKonga0\": \"False\",\n        \"SIDevice1\": \"12\",\n        \"AdapterRumble1\": \"True\",\n        \"SimulateKonga1\": \"False\",\n        \"SIDevice2\": \"12\",\n        \"AdapterRumble2\": \"True\",\n        \"SimulateKonga2\": \"False\",\n        \"SIDevice3\": \"12\",\n        \"AdapterRumble3\": \"True\",\n        \"SimulateKonga3\": \"False\",\n        \"WiiSDCard\": \"False\",\n        \"WiiKeyboard\": \"False\",\n        \"WiimoteContinuousScanning\": \"False\",\n        \"WiimoteEnableSpeaker\": \"False\",\n        \"RunCompareServer\": \"False\",\n        \"RunCompareClient\": \"False\",\n        \"EmulationSpeed\": \"1.00000000\",\n        \"FrameSkip\": \"0x00000000\",\n        \"Overclock\": \"1.00000000\",\n        \"OverclockEnable\": \"False\",\n        \"GFXBackend\": \"OGL\",\n        \"GPUDeterminismMode\": \"auto\",\n        \"PerfMapDir\": \"\",\n        \"EnableCustomRTC\": \"False\",\n        \"CustomRTCValue\": \"0x386d4380\",\n        \"AllowAllNetplayVersions\": \"False\",\n        \"QoSEnabled\": \"True\",\n        \"AdapterWarning\": \"True\",\n        \"ShownLagReductionWarning\": \"False\"\n      },\n      \"Movie\": {\n        \"PauseMovie\": \"False\",\n        \"Author\": \"\",\n        \"DumpFrames\": \"True\",\n        \"DumpFramesSilent\": \"False\",\n        \"ShowInputDisplay\": \"False\",\n        \"ShowRTC\": \"False\"\n      },\n      \"DSP\": {\n        \"EnableJIT\": \"True\",\n        \"DumpAudio\": \"True\",\n        \"DumpAudioSilent\": \"False\",\n        \"DumpUCode\": \"False\",\n        \"Backend\": \"No audio output\",\n        \"Volume\": \"26\",\n        \"CaptureLog\": \"False\"\n      },\n      \"Input\": { \"BackgroundInput\": \"False\" },\n      \"FifoPlayer\": { \"LoopReplay\": \"True\" },\n      \"Analytics\": {\n        \"ID\": \"f21af0d6e773dd537a188b6da4530e81\",\n        \"Enabled\": \"False\",\n        \"PermissionAsked\": \"True\"\n      },\n      \"Network\": {\n        \"SSLDumpRead\": \"False\",\n        \"SSLDumpWrite\": \"False\",\n        \"SSLVerifyCert\": \"False\",\n        \"SSLDumpRootCA\": \"False\",\n        \"SSLDumpPeerCert\": \"False\"\n      },\n      \"BluetoothPassthrough\": {\n        \"Enabled\": \"False\",\n        \"VID\": \"-1\",\n        \"PID\": \"-1\",\n        \"LinkKeys\": \"\"\n      },\n      \"Sysconf\": {\n        \"SensorBarPosition\": \"1\",\n        \"SensorBarSensitivity\": \"50331648\",\n        \"SpeakerVolume\": \"88\",\n        \"WiimoteMotor\": \"True\",\n        \"WiiLanguage\": \"1\",\n        \"AspectRatio\": \"1\",\n        \"Screensaver\": \"0\"\n      }\n    }\n  },\n  {\n    \"path\": \"Config/GFX.ini\",\n    \"ini\": {\n      \"Hardware\": { \"VSync\": \"False\", \"Adapter\": \"0\" },\n      \"Settings\": {\n        \"AspectRatio\": \"5\",\n        \"Crop\": \"False\",\n        \"wideScreenHack\": \"False\",\n        \"UseXFB\": \"False\",\n        \"UseRealXFB\": \"False\",\n        \"SafeTextureCacheColorSamples\": \"128\",\n        \"ShowFPS\": \"False\",\n        \"ShowNetPlayPing\": \"False\",\n        \"ShowNetPlayMessages\": \"False\",\n        \"ShowOSDClock\": \"False\",\n        \"ShowFrameTimes\": \"False\",\n        \"LogRenderTimeToFile\": \"False\",\n        \"ShowInputDisplay\": \"False\",\n        \"OverlayStats\": \"False\",\n        \"OverlayProjStats\": \"False\",\n        \"DumpTextures\": \"True\",\n        \"DumpVertexLoader\": \"False\",\n        \"HiresTextures\": \"True\",\n        \"HiresMaterialMaps\": \"False\",\n        \"HiresMaterialMapsBuild\": \"False\",\n        \"ConvertHiresTextures\": \"False\",\n        \"CacheHiresTextures\": \"False\",\n        \"DumpEFBTarget\": \"False\",\n        \"DumpFramesAsImages\": \"False\",\n        \"FreeLook\": \"False\",\n        \"InternalResolutionFrameDumps\": \"True\",\n        \"CompileShaderOnStartup\": \"True\",\n        \"UseFFV1\": \"False\",\n        \"DumpFormat\": \"avi\",\n        \"DumpCodec\": \"\",\n        \"DumpPath\": \"\",\n        \"BitrateKbps\": \"1000000\",\n        \"EnablePixelLighting\": \"False\",\n        \"ForcedLighting\": \"False\",\n        \"ForcePhongShading\": \"False\",\n        \"RimPower\": \"80\",\n        \"RimIntesity\": \"0\",\n        \"RimBase\": \"10\",\n        \"SpecularMultiplier\": \"255\",\n        \"SimBumpEnabled\": \"False\",\n        \"SimBumpStrength\": \"0\",\n        \"SimBumpDetailFrequency\": \"128\",\n        \"SimBumpThreshold\": \"16\",\n        \"SimBumpDetailBlend\": \"16\",\n        \"FastDepthCalc\": \"True\",\n        \"MSAA\": \"2\",\n        \"SSAA\": \"True\",\n        \"EFBScale\": \"1\",\n        \"TexFmtOverlayEnable\": \"False\",\n        \"TexFmtOverlayCenter\": \"False\",\n        \"Wireframe\": \"False\",\n        \"DisableFog\": \"False\",\n        \"EnableOpenCL\": \"False\",\n        \"BorderlessFullscreen\": \"False\",\n        \"SWZComploc\": \"True\",\n        \"SWZFreeze\": \"True\",\n        \"SWDumpObjects\": \"False\",\n        \"SWDumpTevStages\": \"False\",\n        \"SWDumpTevTexFetches\": \"False\",\n        \"SWDrawStart\": \"0\",\n        \"SWDrawEnd\": \"100000\",\n        \"EnableValidationLayer\": \"False\",\n        \"BackendMultithreading\": \"True\",\n        \"CommandBufferExecuteInterval\": \"100\"\n      },\n      \"Enhancements\": {\n        \"ForceFiltering\": \"False\",\n        \"DisableFiltering\": \"False\",\n        \"MaxAnisotropy\": \"3\",\n        \"PostProcessingEnable\": \"False\",\n        \"PostProcessingTrigger\": \"0\",\n        \"PostProcessingShaders\": \"\",\n        \"ScalingShader\": \"\",\n        \"UseScalingFilter\": \"True\",\n        \"TextureScalingType\": \"0\",\n        \"TextureScalingFactor\": \"2\",\n        \"UseDePosterize\": \"True\",\n        \"Tessellation\": \"False\",\n        \"TessellationEarlyCulling\": \"False\",\n        \"TessellationDistance\": \"0\",\n        \"TessellationMax\": \"6\",\n        \"TessellationRoundingIntensity\": \"0\",\n        \"TessellationDisplacementIntensity\": \"0\",\n        \"ForceTrueColor\": \"False\"\n      },\n      \"Stereoscopy\": {\n        \"StereoMode\": \"0\",\n        \"StereoDepth\": \"20\",\n        \"StereoConvergencePercentage\": \"100\",\n        \"StereoSwapEyes\": \"False\",\n        \"StereoShader\": \"Anaglyph/dubois\"\n      },\n      \"Hacks\": {\n        \"EFBAccessEnable\": \"False\",\n        \"EFBFastAccess\": \"False\",\n        \"ForceProgressive\": \"True\",\n        \"EFBToTextureEnable\": \"True\",\n        \"EFBScaledCopy\": \"True\",\n        \"EFBEmulateFormatChanges\": \"False\",\n        \"ForceDualSourceBlend\": \"False\",\n        \"FullAsyncShaderCompilation\": \"True\",\n        \"WaitForShaderCompilation\": \"False\",\n        \"EnableGPUTextureDecoding\": \"False\",\n        \"EnableComputeTextureEncoding\": \"False\",\n        \"PredictiveFifo\": \"False\",\n        \"BoundingBoxMode\": \"0\",\n        \"LastStoryEFBToRam\": \"False\",\n        \"ForceLogicOpBlend\": \"False\",\n        \"VertexRounding\": \"False\"\n      }\n    }\n  },\n  {\n    \"path\": \"Config/Logger.ini\",\n    \"ini\": {\n      \"LogWindow\": { \"x\": \"400\", \"y\": \"600\", \"pos\": \"2\" },\n      \"Options\": { \"Font\": \"0\", \"WrapLines\": \"False\" }\n    }\n  }\n]\n";
const userBaseInis = JSON.parse(userBaseInisStr);
const {
  SlippiGame
} = SLP_PKG;
async function doesFileExist(path) {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
const isWindows = _os.default.platform() === "win32";
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
    `.split("\n").map(s => s.trim()).join("\n");
}
function geckoCode(...lines) {
  return `${lines.join("\n")}\n`;
}
const GAME_FIRST_FRAME = 0 - 123;
async function slurp(filename, opts = {}) {
  try {
    return await fs.readFile(filename, {
      encoding: "utf8",
      ...opts
    });
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
const paths = (0, _envPaths.default)("slp-rec", {
  suffix: ""
});
const configPath = _nodePath.default.join(paths.config, "config.toml");
const launcherSettingsPath = _nodePath.default.join(paths.config, "..", "Slippi Launcher", "Settings");
const optionDefinitions = [{
  name: "help",
  alias: "h",
  type: Boolean,
  description: "Display this usage guide."
}, {
  name: "start-frame",
  alias: "s",
  type: Number,
  description: "First frame to begin recording (default GAME_FRAME_START)",
  typeLabel: "<frame>"
}, {
  name: "total-frames",
  alias: "t",
  type: Number,
  description: "Total frames to record (default all remaining)",
  typeLabel: "<frames>"
}, {
  name: "quality",
  alias: "q",
  type: String,
  description: "Quality preset to use for recording",
  typeLabel: "<qual>"
}, {
  name: "output",
  alias: "o",
  type: String,
  description: "The output mp4 filename",
  typeLabel: "<mp4>",
  defaultValue: "output.mp4"
}, {
  name: "iso",
  alias: "i",
  type: String,
  description: "The melee iso to use while recording",
  typeLabel: "<iso>"
}, {
  name: "ini",
  alias: "I",
  lazyMultiple: true,
  type: String,
  description: "modifications to default INI configs",
  typeLabel: "<ini_filename>.<property>=<value>"
}, {
  name: "file",
  alias: "f",
  type: String,
  description: "The slp file to record",
  typeLabel: "<slp>",
  defaultOption: true
}, {
  name: "gecko-code",
  alias: "c",
  lazyMultiple: true,
  type: String,
  description: "gecko code to include",
  typeLabel: "<gecko_filename>"
}, {
  name: "gecko-enable",
  alias: "g",
  lazyMultiple: true,
  type: String,
  description: "non-default gecko codes to enable",
  typeLabel: "<gecko_codename>"
}, {
  name: "gecko-disable",
  alias: "G",
  lazyMultiple: true,
  type: String,
  description: "default gecko codes to disable",
  typeLabel: "<gecko_codename>"
}, {
  name: "texture-path",
  alias: "x",
  type: String,
  description: "folder containing textures to inject",
  typeLabel: "<directory>"
}, {
  name: "temp-root",
  alias: "T",
  type: String,
  description: "directory to place temporary work files",
  typeLabel: "<directory>"
}, {
  name: "port-colors",
  alias: "p",
  type: String,
  lazyMultiple: true,
  description: "color override for port",
  typeLabel: "<1|2|3|4>=<0|1|2|3|4|5>"
}];
function informUsageAndExit(opts = {}) {
  const {
    exitCode = 0,
    stderr
  } = opts;
  if (stderr) {
    console.error(stderr);
  }
  const usage = (0, _commandLineUsage.default)([{
    header: "Usage:",
    content: "slp-rec [OPT]* <slp>"
  }, {
    header: "Options",
    optionList: optionDefinitions
  }, {
    content: ["{bold Project home:} {underline https://github.com/mitchdzugan/slp-rec}", "{bold Config Path:} " + configPath].join("\n")
  }]);
  console.log(usage);
  process.exit(exitCode);
}
function failOptions(message) {
  informUsageAndExit({
    exitCode: 1,
    stderr: `ERROR -- ${message}`
  });
}
const options = (0, _commandLineArgs.default)(optionDefinitions, {
  camelCase: true
});
if (options.help) {
  informUsageAndExit();
}
const portColors = {};
for (const pc of options.portColors || []) {
  const [p, c] = pc.split("=");
  portColors[parseInt(p) - 1] = parseInt(c);
}
let _configPromise = null;
function getConfigJson() {
  if (!_configPromise) {
    _configPromise = async function () {
      const launcherSettings = (await slurpJson(launcherSettingsPath)) || {
        settings: {}
      };
      const userConfig = await fs.readFile(configPath, "utf8").then(s => toml.parse(s));
      if (userConfig.geckoCode) {
        userConfig.geckoCode = userConfig.geckoCode.map(code => code.startsWith("/") ? code : _nodePath.default.join(_nodePath.default.dirname(configPath), code));
      }
      const defaultConfig = {
        ssbmIsoPath: launcherSettings.settings && launcherSettings.settings.isoPath,
        slippiPlaybackBin: "slippi-playback",
        ffmpegBin: "ffmpeg"
      };
      return {
        ...defaultConfig,
        ...(userConfig || {}),
        ...(options.iso ? {
          ssbmIsoPath: options.iso
        } : {}),
        ...options
      };
    }();
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
const cfg_geckoCode = mkConfigGetter("geckoCode");
const cfg_geckoEnabled = mkConfigGetter("geckoEnabled");
const cfg_geckoDisabled = mkConfigGetter("geckoDisabled");
if (!options.file) {
  failOptions("input .slp file must be provided");
}
const tempRoot = options.tempRoot || paths.temp;
const workRoot = _nodePath.default.join(tempRoot, "work");
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
  FRAME_BOOKEND: 0x3c
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
    messageSizes[command] = buffer[position + i + 3] << 8 | buffer[position + i + 4];
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
  isRealTimeMode: false
};
function mkRecordJson(replay) {
  const recordJson = {
    ...RECORD_JSON_BASE,
    replay
  };
  recordJson.commandId = _nodePath.default.basename(_nodePath.default.dirname(replay));
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
  return _nodePath.default.join(workDir, "record.json");
}
async function writeRecordJson(workDir) {
  const slpFilename = _nodePath.default.join(workDir, "input.slp");
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
    this.rawPath = _nodePath.default.join(...fileParts);
  }
  async resolve(shouldConPaths) {
    if (!shouldConPaths) {
      return this.rawPath;
    }
    const {
      stdout
    } = await (0, _execa.execa)("wslpath", ["-w", this.rawPath]);
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
  return () => (0, _execa.execa)(bin, args, ...rest);
}
async function doExe(...args) {
  return await (await mkExe(...args))();
}
async function execSlippi(slippiPlaybackBin, aviFile, playbackArgs, lastFrame, waitForAviBlackScreen) {
  const recordedFrames = new Set();
  const isWinExe = slippiPlaybackBin.endsWith(".exe");
  let latestFrame;
  let didFinish = false;
  let didStartWaitingEnd = false;
  let res;
  const totalFrames = options.totalFrames;
  const {
    SingleBar,
    Presets
  } = _cliProgress.default;
  const progressBar = new SingleBar({}, Presets.legacy);
  progressBar.start(totalFrames || 1 + lastFrame - GAME_FIRST_FRAME, 0);
  try {
    const slippiProcessExe = await mkExe(slippiPlaybackBin, playbackArgs);
    const slippiProcess = slippiProcessExe();
    for await (const stdoutLine of slippiProcess) {
      if (didFinish) {
        break;
      }
      if (stdoutLine.startsWith("[CURRENT_FRAME]")) {
        const currentFrame = parseInt(stdoutLine.substring(15).trim());
        if (!didStartWaitingEnd) {
          const isReady = await doesFileExist(aviFile);
          if (isReady) {
            didStartWaitingEnd = true;
            waitForAviBlackScreen().then(waitingResult => res = waitingResult).catch(console.error).finally(async () => {
              progressBar.stop();
              didFinish = true;
              if (isWinExe) {
                await (0, _execa.execa)("taskkill.exe", ["/IM", "Slippi Dolphin.exe", "/F", "/T"]);
              } else {
                slippiProcess.kill();
              }
            });
          }
        }
        recordedFrames.add(currentFrame);
        if (latestFrame === undefined || currentFrame > latestFrame) {
          latestFrame = currentFrame;
          if (totalFrames && totalFrames <= recordedFrames.size) {
            progressBar.stop();
            didFinish = true;
            if (isWinExe) {
              await (0, _execa.execa)("taskkill.exe", ["/IM", "Slippi Dolphin.exe", "/F", "/T"]);
            } else {
              slippiProcess.kill();
            }
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
  const fileHash = (0, _hashIt.hash)(_nodePath.default.normalize(filename));
  const pid = process.pid;
  const workId = `wd-${ts}-${fileHash}-${pid}`;
  const workDir = _nodePath.default.join(workRoot, workId);
  const userDir = _nodePath.default.join(workDir, "User");
  await (0, _mkdirp.mkdirp)(userDir);
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
  for (const {
    path: relPath,
    ini: rawIniJson
  } of userBaseInis) {
    const iniJson = JSON.parse(JSON.stringify(rawIniJson));
    const fullPath = _nodePath.default.join(userDir, relPath);
    const iniDir = _nodePath.default.dirname(fullPath);
    for (const {
      path,
      val
    } of iniOverridesByPath[relPath] || []) {
      const ST = {
        focus: iniJson,
        complete: () => {}
      };
      for (const step of path) {
        ST.complete();
        ST.complete = val => {
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
    await (0, _mkdirp.mkdirp)(iniDir);
    await fs.writeFile(fullPath, ini.stringify(iniJson));
  }
  const gsDir = _nodePath.default.join(userDir, "GameSettings");
  const gsFile = _nodePath.default.join(gsDir, "GALE01.ini");
  const cfgCode = await cfg_geckoCode();
  const cfgEnabled = await cfg_geckoEnabled();
  const allEnabled = [...(cfgEnabled || []), ...(options.geckoEnable || [])];
  const cfgDisabled = await cfg_geckoDisabled();
  const allDisabled = [...(cfgDisabled || []), ...(options.geckoDisable || [])];
  const plusCodes_s = await Promise.all(cfgCode.map(f => fs.readFile(f, "utf8")));
  const gsContent = mkGameSettings(plusCodes_s, allEnabled, allDisabled);
  await (0, _mkdirp.mkdirp)(gsDir);
  await fs.writeFile(gsFile, gsContent);
  if (texturePath && (await isDirectory(texturePath))) {
    const texDir = _nodePath.default.join(userDir, "Load", "Textures");
    await (0, _mkdirp.mkdirp)(texDir);
    const texLink = _nodePath.default.join(texDir, "GALE01");
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
        const colorOverride = portColors[myPortId];
        const offset = myPortId * 0x24;
        if (colorOverride !== undefined) {
          buffer[0x68 + offset + start] = colorOverride;
        }
      }
    }
    pos += 1 + messageSizes[buffer[pos]];
  }
  const slpFile = _nodePath.default.join(workDir, "input.slp");
  await fs.writeFile(slpFile, buffer);
  await writeRecordJson(workDir);
  const playbackArgs = ["--cout", "--batch", ...["--user", UPATH(userDir)], ...["--slippi-input", UPATH(getRecordJsonPath(workDir))], ...["--exec", UPATH(ssbmIsoPath)]];
  const game = new SlippiGame(slpFile);
  const stats = game.getStats();
  const lastFrame = stats.lastFrame;
  const aviFile = UPATH(userDir, "Dump", "Frames", "framedump0.avi");
  const wavFile = UPATH(userDir, "Dump", "Audio", "dspdump.wav");
  const totalVideoFrames = await limitExecutionTime(1000 * 60 * 1000, () => execSlippi(slippiPlaybackBin, aviFile.rawPath, playbackArgs, lastFrame, async function () {
    const execaArgs = [ffmpegBin, ["-loglevel", "debug", "-i", "pipe:0", "-vf", "blackdetect=d=2:pix_th=0.01", "-an", "-f", "null", "-"]];
    const tail = new _tailFile.default(aviFile.rawPath, {
      startPos: 0,
      pollFileIntervalMs: 10
    });
    await tail.start();
    const detectExe = await mkExe(...execaArgs, {
      stderr: "pipe"
    });
    const detectPrc = detectExe();
    tail.pipe(detectPrc.stdin);
    let offFrame = false;
    detectPrc.stderr.on("data", async rawStderrLine => {
      if (offFrame) {
        return;
      }
      console.log(rawStderrLine.toString("utf8"));
      const stderrLine = rawStderrLine.toString("utf8");
      try {
        if (stderrLine.startsWith("[Parsed_blackdetect_0")) {
          function getFrameNumberIfBlackScreenImpl() {
            const oframe = Number(stderrLine.split(" frame:")[1].split(" ")[0]);
            const bratio = Number(stderrLine.split(" picture_black_ratio:")[1].split(" ")[0]);
            const isValid = !Number.isNaN(oframe) && !Number.isNaN(bratio) && bratio > 0.99;
            return isValid ? oframe : undefined;
          }
          function getFrameNumberIfBlackScreen() {
            try {
              return getFrameNumberIfBlackScreenImpl();
            } catch (_e) {
              return undefined;
            }
          }
          offFrame ||= getFrameNumberIfBlackScreen();
          console.log({
            offFrame
          });
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
    console.log({
      offFrame
    });
    return offFrame + 1;
  }));
  const outFile = UPATH(workDir, "output.avi");
  const execaArgs = [ffmpegBin, [...["-i", aviFile, "-i", wavFile], ...(totalVideoFrames ? ["-t", `${totalVideoFrames / 60}`] : []), ...["-c:v", "copy", "-c:a", "copy"], outFile]];
  await doExe(execaArgs[0], execaArgs[1]);
  await fs.copyFile(outFile.rawPath, options.output);
  await fs.rm(workDir, {
    recursive: true,
    force: true
  });
}
recordSlp(options.file).then(() => process.exit()).catch(e => {
  console.error(e);
  process.exit(1);
});
