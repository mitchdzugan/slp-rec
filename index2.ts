import * as $ from "@dz/-";
import { fs } from "@dz/-/node";
import TailFile from "@logdna/tail-file";
import envPaths from "env-paths";
import { SlippiGame } from "@slippi/slippi-js/node";

const paths = fs.AppPathBuilders("slp-rec", { asDataSubdir: $.Set("temp") });
const configPath = paths.config("config");

type IniChange = [string, string, string];

type Opts = {
  "ffmpeg-bin": string;
  "slippi-playback-bin": string;
  output: string;
  iso: string;
  "ini-changes": IniChange[];
  "gecko-codes": string[];
  "gecko-enables": string[];
  "gecko-disables": string[];
  "texture-paths": string[];
  input: $.Maybe<string>;
  "start-frame": $.Maybe<number>;
  "total-frames": $.Maybe<number>;
};

type OptDef<T, Argn extends number = 1> = $.Proxy.Of<{ t: T; argn: Argn }>;

type OptDefs = {
  "ffmpeg-bin": OptDef<string>;
  "slippi-playback-bin": string;
  output: string;
  iso: string;
  "ini-changes": IniChange[];
  "gecko-codes": string[];
  "gecko-enables": string[];
  "gecko-disables": string[];
  "texture-paths": string[];
  input: $.Maybe<string>;
  "start-frame": $.Maybe<number>;
  "total-frames": $.Maybe<number>;
};

const OptShortnames: Record<string, string> = {
  X: "texture-path",
  I: "ini-change",
  i: "iso",
  s: "start-frame",
  t: "toral-frames",
};

type Array<T> = T[];

type OptVal<K extends keyof Opts> =
  Opts[K] extends $.Maybe<infer MT>
    ? MT
    : Opts[K] extends Array<infer AT>
      ? $.Maybe<AT>
      : Opts[K];

type _OptUpsert<K extends keyof Opts> = [K, OptVal<K>];
type OptUpsert = _OptUpsert<keyof Opts>;

type OptE =
  | { type: "unknown opt"; opt: string }
  | { type: "unknown shorthand"; shorthand: string }
  | { type: "unsupplied arg"; opt: string; nth: number; args: string[] };

const OptUpsert: <K extends keyof Opts>(
  k: K,
  v: OptVal<K>,
) => $.W<void, OptUpsert[]> = (<K extends keyof Opts>() =>
  $.DoW_<OptUpsert[], [K, OptVal<K>]>(function* (M, k, v) {
    return yield* M.tell([[k, v] as OptUpsert]);
  }))();

type OptR = { args: string[] };
type OptS = { argn: number };

const takeArg = $.DoRS<OptR, OptS, $.Maybe<string>>(function* (M) {
  const { args } = yield* M.ask();
  const { argn } = yield* M.get();
  for (const arg of args.slice(argn)) {
    yield* M.put({ argn: argn + 1 });
    return $.Some(arg);
  }
  return $.None();
});

const forceTakeArg = $.DoRSE<OptR, OptS, OptE, string>(function* (M) {
  const arg = yield* takeArg();
  return yield* $.maybe(arg, $.pure, function* () {
    const { args } = yield* M.ask();
    const { argn } = yield* M.get();
    return yield* M.fail({
      type: "unsupplied arg",
      opt: args[argn - 1],
      args: args.slice(argn),
      nth: argn,
    });
  });
});

type OptW = OptUpsert[];

const procOpt: (s: string) => $.RWSEA<OptR, OptW, OptS, OptE, null> = $.DoRWSEA<
  OptR,
  OptW,
  OptS,
  OptE,
  null,
  [string]
>(function* (M, opt) {
  if (!opt.startsWith("--")) {
    if (opt.startsWith("-")) {
      const shorthandName = opt.substring(1);
      const fullOpt = OptShortnames[shorthandName];
      if (!fullOpt) {
        return yield* M.fail({
          type: "unknown shorthand",
          shorthand: shorthandName,
        });
      }
      return yield* procOpt(`--${fullOpt}`);
    }
    return yield* OptUpsert("input", opt);
  }
  const optName = opt.substring(2);
  const arg1 = yield* forceTakeArg();
  if (optName === "ini") {
    if (arg1 === ":") {
      return yield* OptUpsert("ini-changes", $.None());
    }
    const arg2 = yield* forceTakeArg();
    const arg3 = yield* forceTakeArg();
    return yield* OptUpsert("ini-changes", $.Some([arg1, arg2, arg3]));
  }

  const arg1Opt = arg1 !== ":" ? $.Some(arg1) : $.None<string>();
  if (optName === "gecko-code") {
    return yield* OptUpsert("gecko-codes", arg1Opt);
  } else if (optName === "gecko-enable") {
    return yield* OptUpsert("gecko-enables", arg1Opt);
  } else if (optName === "gecko-disable") {
    return yield* OptUpsert("gecko-disables", arg1Opt);
  } else if (optName === "texture-path") {
    return yield* OptUpsert("texture-paths", arg1Opt);
  } else if (optName === "input") {
    return yield* OptUpsert("input", arg1);
  }

  return yield* M.fail({ type: "unknown opt", opt: optName });
});

const procOpts = $.DoRWSEA<OptR, OptW, OptS, OptE>(function* () {
  let isDone = false;
  while (!isDone) {
    isDone = true;
    for (const opt of $.iMaybe<string>(yield* takeArg())) {
      isDone = false;
      yield* procOpt(opt);
    }
  }
});

const impl = $.DoRWSEA_<OptR, OptW, OptS, OptE>(function* () {
  yield* procOpts();
});

const launcherSettingsPath = paths.config("..", "Slippi Launcher", "Settings");

function errorString(e: OptE) {
  if (e.type === "unknown opt") {
    return `Unknown Opt  [ ${e.opt} ]`;
  }
  return ["Unknown error:", JSON.stringify(e)].join("\n");
}

async function main() {
  const launcherSettings = (await fs.slurp<any>(launcherSettingsPath)) || {};
  const baseOpts: Opts = {
    "ffmpeg-bin": "ffmpeg",
    "slippi-playback-bin": "Slippi_Playback-x86_64.AppImage",
    "start-frame": $.None(),
    "total-frames": $.None(),
    input: $.None(),
    output: "output.mp4",
    iso: launcherSettings?.settings?.isoPath || "",
    "ini-changes": [],
    "gecko-codes": [],
    "gecko-enables": [],
    "gecko-disables": [],
    "texture-paths": [],
  };
  const res = await $.rws(
    { args: process.argv.slice(2) },
    (...oss: OptW[]) => oss.flatMap((os) => os),
    { argn: 0 },
  ).execAsync(impl());
  if (!res.isOk) {
    console.error(errorString(res.err));
    process.exit(1);
  }
  console.log(res.written);
}

$.execAndExit(main());
