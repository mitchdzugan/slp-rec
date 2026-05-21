import * as $ from "@dz/-";
import { fs } from "@dz/-/node";
import path from "node:path";
import TailFile from "@logdna/tail-file";
import envPaths from "env-paths";
import * as toml from "smol-toml";
import { SlippiGame } from "@slippi/slippi-js/node";

const paths = envPaths("slp-rec", { suffix: "" });
// const configPath = path.join(paths.config, "config.toml");

type IniChange = [string, string, string];

type Opts = {
  ffmpegBin: $.Maybe<string>;
  slippiPlaybackBin: $.Maybe<string>;
  startFrame: $.Maybe<number>;
  totalFrames: $.Maybe<number>;
  input: $.Maybe<string>;
  output: $.Maybe<string>;
  iso: $.Maybe<string>;
  iniChanges: IniChange[];
  geckoCodes: string[];
  geckoEnables: string[];
  geckoDisables: string[];
  texturePaths: string[];
};

type ParialOpts = $.Maybe<Opts>;

type Array<T> = T[];

type OptVal<K extends keyof Opts> =
  Opts[K] extends $.Maybe<infer MT>
    ? MT
    : Opts[K] extends Array<infer AT>
      ? $.Maybe<AT>
      : never;

type _OptUpsert<K extends keyof Opts> = [K, OptVal<K>];
type OptUpsert = _OptUpsert<keyof Opts>;

type OptErr =
  | { type: "unknown opt"; opt: string }
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

const forceTakeArg = $.DoRSE<OptR, OptS, OptErr, string>(function* (M) {
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

const procOpt = $.DoRWSEA<OptR, OptW, OptS, OptErr, number, [string, string[]]>(
  function* (M, opt, args) {
    const opts = yield* M.ask();
    if (!opt.startsWith("--")) {
      opts.input = opt;
      return 1;
    }
    const optName = opt.substring(2);
    const arg1 = yield* forceTakeArg();
    if (optName === "ini") {
      if (arg1 === ":") {
        opts.iniChanges = [];
        yield* OptUpsert("iniChanges", $.None());
        return 2;
      }
      const arg2 = yield* forceTakeArg();
      const arg3 = yield* forceTakeArg();
      opts.iniChanges.push([arg1, arg2, arg3]);
      yield* OptUpsert("iniChanges", $.Some([arg1, arg2, arg3]));
      return 4;
    }

    function upsertArg<K extends string>(
      k: K,
      s: string,
      obj: Record<K, string[]>,
    ) {
      if (s === ":") {
        obj[k] = [];
      } else {
        obj[k].push(s);
      }
      return 2;
    }

    const arg1Opt = arg1 !== ":" ? $.Some(arg1) : $.None<string>();
    if (optName === "gecko-code") {
      yield* OptUpsert("geckoCodes", arg1Opt);
      return upsertArg("geckoCodes", arg1, opts);
    } else if (optName === "gecko-enable") {
      return upsertArg("geckoEnables", arg1, opts);
    } else if (optName === "gecko-disable") {
      return upsertArg("geckoDisables", arg1, opts);
    } else if (optName === "texture-path") {
      return upsertArg("texturePaths", arg1, opts);
    }

    console.log({ optName });
    return 1;
  },
);

const impl = $.DoWEA_<OptUpsert[], OptErr>(function* () {
  let argPos = 0;
  const args = process.argv.slice(2);
  while (argPos < args.length) {
    const opt = args[argPos] || "";
    console.log({ argPos, opt });
    const optArgs = args.slice(argPos + 1);
    argPos += yield* procOpt(opt, optArgs);
  }
});

async function main() {
  const baseOpts: Opts = {
    ffmpegBin: $.None(),
    slippiPlaybackBin: $.None(),
    startFrame: $.None(),
    totalFrames: $.None(),
    input: $.None(),
    output: $.None(),
    iso: $.None(),
    iniChanges: [],
    geckoCodes: [],
    geckoEnables: [],
    geckoDisables: [],
    texturePaths: [],
  };
  const res = await $.rw(baseOpts, (...oss: OptUpsert[][]) =>
    oss.flatMap((os) => os),
  ).execAsync(impl());
  console.log(res);
  console.log(baseOpts);
}

$.execAndExit(main());
