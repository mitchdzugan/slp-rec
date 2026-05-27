#!/usr/bin/env node
import { createRequire } from "node:module";
import path from "node:path";
import * as fs from "node:fs/promises";
import { mkdir, mkdirSync, stat, statSync } from "fs";
import os, { constants } from "node:os";
import process$1, { execArgv, execPath, hrtime, platform } from "node:process";
import os$1 from "os";
import { dirname, parse, resolve } from "path";
import { fileURLToPath } from "node:url";
import { ChildProcess, execFile, spawn, spawnSync } from "node:child_process";
import { StringDecoder } from "node:string_decoder";
import { aborted, callbackify, debuglog, inspect, promisify, stripVTControlCharacters } from "node:util";
import tty from "node:tty";
import { scheduler, setImmediate as setImmediate$1, setTimeout as setTimeout$1 } from "node:timers/promises";
import { EventEmitter, addAbortListener, on, once, setMaxListeners } from "node:events";
import { serialize } from "node:v8";
import { appendFileSync, createReadStream, createWriteStream, readFileSync, statSync as statSync$1, writeFileSync } from "node:fs";
import { finished } from "node:stream/promises";
import { Duplex, PassThrough, Readable, Transform, Writable, getDefaultHighWaterMark } from "node:stream";
import { Buffer as Buffer$1 } from "node:buffer";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp$1(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp$1(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __require = /* @__PURE__ */ createRequire(import.meta.url);
//#endregion
//#region node_modules/@logdna/tail-file/lib/tail-file.js
var require_tail_file$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Readable: Readable$1 } = __require("stream");
	const fs$4 = __require("fs");
	const { once: once$1 } = __require("events");
	const kOpts = Symbol("opts");
	const kFileName = Symbol("filename");
	const kPollFileIntervalMs = Symbol("pollFileIntervalMs");
	const kPollFailureRetryMs = Symbol("pollFailureRetryMs");
	const kMaxPollFailures = Symbol("maxPollFailures");
	const kPollFailureCount = Symbol("pollFailureCount");
	const kStartPos = Symbol("startPos");
	const kStream = Symbol("stream");
	const kFileHandle = Symbol("fileHandle");
	const kPollTimer = Symbol("pollTimer");
	const kQuitting = Symbol("quitting");
	const kInode = Symbol("inode");
	function NOOP() {}
	var TailFile = class extends Readable$1 {
		constructor(filename, opts) {
			opts = opts || {};
			const { pollFileIntervalMs, pollFailureRetryMs, maxPollFailures, readStreamOpts, startPos, ...superOpts } = opts;
			if (typeof filename !== "string" || !filename.length) {
				const err = /* @__PURE__ */ new TypeError("filename must be a non-empty string");
				err.code = "EFILENAME";
				throw err;
			}
			if (pollFileIntervalMs && typeof pollFileIntervalMs !== "number") {
				const err = /* @__PURE__ */ new TypeError("pollFileIntervalMs must be a number");
				err.code = "EPOLLINTERVAL";
				err.meta = { got: pollFileIntervalMs };
				throw err;
			}
			if (pollFailureRetryMs && typeof pollFailureRetryMs !== "number") {
				const err = /* @__PURE__ */ new TypeError("pollFailureRetryMs must be a number");
				err.code = "EPOLLRETRY";
				err.meta = { got: pollFailureRetryMs };
				throw err;
			}
			if (maxPollFailures && typeof maxPollFailures !== "number") {
				const err = /* @__PURE__ */ new TypeError("maxPollFailures must be a number");
				err.code = "EMAXPOLLFAIL";
				err.meta = { got: maxPollFailures };
				throw err;
			}
			if (readStreamOpts && typeof readStreamOpts !== "object") {
				const err = /* @__PURE__ */ new TypeError("readStreamOpts must be an object");
				err.code = "EREADSTREAMOPTS";
				err.meta = { got: typeof readStreamOpts };
				throw err;
			}
			if (startPos !== null && startPos !== void 0) {
				if (typeof startPos !== "number") {
					const err = /* @__PURE__ */ new TypeError("startPos must be an integer >= 0");
					err.code = "ESTARTPOS";
					err.meta = { got: typeof startPos };
					throw err;
				}
				if (startPos < 0 || !Number.isInteger(startPos)) {
					const err = /* @__PURE__ */ new RangeError("startPos must be an integer >= 0");
					err.code = "ESTARTPOS";
					err.meta = { got: startPos };
					throw err;
				}
			}
			super(superOpts);
			this[kOpts] = opts;
			this[kFileName] = filename;
			this[kPollFileIntervalMs] = pollFileIntervalMs || 1e3;
			this[kPollFailureRetryMs] = pollFailureRetryMs || 200;
			this[kMaxPollFailures] = maxPollFailures || 10;
			this[kPollFailureCount] = 0;
			this[kStartPos] = startPos >= 0 ? startPos : null;
			this[kStream] = null;
			this[kFileHandle] = null;
			this[kPollTimer] = null;
			this[kQuitting] = false;
			this[kInode] = null;
		}
		async start() {
			await this._openFile();
			await this._pollFileForChanges();
		}
		async _openFile() {
			this[kFileHandle] = await fs$4.promises.open(this[kFileName], "r");
		}
		async _readRemainderFromFileHandle() {
			const fileHandleTemp = this[kFileHandle];
			this[kFileHandle] = null;
			const lengthToEnd = (await fileHandleTemp.stat()).size - this[kStartPos];
			const { buffer } = await fileHandleTemp.read(Buffer.alloc(lengthToEnd), 0, lengthToEnd, this[kStartPos]);
			this.push(buffer);
			await fileHandleTemp.close();
		}
		async _readChunks(stream) {
			/* istanbul ignore next */
			const iterator = stream.iterator ? stream.iterator({ destroyOnReturn: false }) : stream;
			for await (const chunk of iterator) {
				this[kStartPos] += chunk.length;
				if (!this.push(chunk)) {
					this[kStream] = stream;
					this[kPollTimer] = null;
					return;
				}
			}
			if (this[kStream]) this._scheduleTimer(this[kPollFileIntervalMs]);
			this[kStream] = null;
			setImmediate(this.emit.bind(this), "flush", { lastReadPosition: this[kStartPos] });
		}
		async _pollFileForChanges() {
			try {
				const stats = await fs$4.promises.stat(this[kFileName]);
				this[kPollFailureCount] = 0;
				const eof = stats.size;
				let fileHasChanged = false;
				if (!this[kInode]) this[kInode] = stats.ino;
				if (this[kStartPos] === null) this[kStartPos] = eof;
				else if (this[kInode] !== stats.ino) {
					if (this[kFileHandle]) try {
						await this._readRemainderFromFileHandle();
					} catch (error) {
						const err = /* @__PURE__ */ new Error("Could not read remaining bytes from old FH");
						err.meta = {
							error: error.message,
							code: error.code
						};
						this.emit("tail_error", err);
					}
					await this._openFile();
					this[kStartPos] = 0;
					this[kInode] = stats.ino;
					fileHasChanged = true;
					this.emit("renamed", {
						message: "The file was renamed or rolled.  Tailing resumed from the beginning.",
						filename: this[kFileName],
						when: /* @__PURE__ */ new Date()
					});
				} else if (eof < this[kStartPos]) {
					this[kStartPos] = 0;
					this[kInode] = stats.ino;
					fileHasChanged = true;
					this.emit("truncated", {
						message: "The file was truncated.  Tailing resumed from the beginning.",
						filename: this[kFileName],
						when: /* @__PURE__ */ new Date()
					});
				} else if (this[kStartPos] !== eof) fileHasChanged = true;
				if (fileHasChanged) {
					await this._streamFileChanges();
					if (this[kStream]) return;
				} else setImmediate(this.emit.bind(this), "flush", { lastReadPosition: this[kStartPos] });
				this._scheduleTimer(this[kPollFileIntervalMs]);
			} catch (err) {
				if (err.code === "ENOENT") {
					if (this[kFileHandle]) try {
						await this._readRemainderFromFileHandle();
					} catch (error) {
						this.emit("tail_error", error);
					}
					this[kPollFailureCount]++;
					if (this[kPollFailureCount] >= this[kMaxPollFailures]) return this.quit(err);
					this.emit("retry", {
						message: "File disappeared. Retrying.",
						filename: this[kFileName],
						attempts: this[kPollFailureCount],
						when: /* @__PURE__ */ new Date()
					});
					this._scheduleTimer(this[kPollFailureRetryMs]);
					return;
				}
				return this.quit(err);
			}
		}
		_scheduleTimer(ms) {
			clearTimeout(this[kPollTimer]);
			if (this[kQuitting]) return;
			this[kPollTimer] = setTimeout(this._pollFileForChanges.bind(this), ms);
		}
		async _streamFileChanges() {
			try {
				const stream = fs$4.createReadStream(this[kFileName], {
					...this[kOpts].readStreamOpts,
					start: this[kStartPos]
				});
				stream.setMaxListeners(100);
				await this._readChunks(stream);
			} catch (err) {
				this[kPollFailureCount]++;
				const error = /* @__PURE__ */ new Error("An error was encountered while tailing the file");
				error.code = "ETAIL";
				error.meta = { actual: err };
				this.emit("tail_error", error);
			}
		}
		_read() {
			if (this[kStream]) this._readChunks(this[kStream]);
		}
		async quit(err) {
			this[kQuitting] = true;
			clearTimeout(this[kPollTimer]);
			if (err) this.emit("error", err);
			else {
				this._pollFileForChanges().catch(NOOP);
				await once$1(this, "flush");
			}
			this.push(null);
			if (this[kFileHandle]) this[kFileHandle].close().catch(NOOP);
			if (this[kStream]) this[kStream].destroy();
			process.nextTick(() => {
				if (this._readableState && !this._readableState.endEmitted) this.emit("end");
			});
		}
	};
	module.exports = TailFile;
}));
//#endregion
//#region node_modules/is-safe-filename/index.js
var import_tail_file = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_tail_file$1();
})))(), 1);
Object.freeze([
	"",
	"   ",
	".",
	"..",
	" .",
	". ",
	" ..",
	".. ",
	"../",
	"../foo",
	"foo/../bar",
	"foo/bar",
	"foo\\bar",
	"foo\0bar"
]);
function isSafeFilename(filename) {
	if (typeof filename !== "string") return false;
	const trimmed = filename.trim();
	return trimmed !== "" && trimmed !== "." && trimmed !== ".." && !filename.includes("/") && !filename.includes("\\") && !filename.includes("\0");
}
function assertSafeFilename(filename) {
	if (typeof filename !== "string") throw new TypeError("Expected a string");
	if (!isSafeFilename(filename)) throw new Error(`Unsafe filename: ${JSON.stringify(filename)}`);
}
//#endregion
//#region node_modules/env-paths/index.js
const homedir = os.homedir();
const tmpdir = os.tmpdir();
const { env } = process$1;
const macos = (name) => {
	const library = path.join(homedir, "Library");
	return {
		data: path.join(library, "Application Support", name),
		config: path.join(library, "Preferences", name),
		cache: path.join(library, "Caches", name),
		log: path.join(library, "Logs", name),
		temp: path.join(tmpdir, name)
	};
};
const windows = (name) => {
	const appData = env.APPDATA || path.join(homedir, "AppData", "Roaming");
	const localAppData = env.LOCALAPPDATA || path.join(homedir, "AppData", "Local");
	return {
		data: path.join(localAppData, name, "Data"),
		config: path.join(appData, name, "Config"),
		cache: path.join(localAppData, name, "Cache"),
		log: path.join(localAppData, name, "Log"),
		temp: path.join(tmpdir, name)
	};
};
const linux = (name) => {
	const username = path.basename(homedir);
	return {
		data: path.join(env.XDG_DATA_HOME || path.join(homedir, ".local", "share"), name),
		config: path.join(env.XDG_CONFIG_HOME || path.join(homedir, ".config"), name),
		cache: path.join(env.XDG_CACHE_HOME || path.join(homedir, ".cache"), name),
		log: path.join(env.XDG_STATE_HOME || path.join(homedir, ".local", "state"), name),
		temp: path.join(tmpdir, username, name)
	};
};
function envPaths(name, { suffix = "nodejs" } = {}) {
	assertSafeFilename(name);
	if (suffix) name += `-${suffix}`;
	assertSafeFilename(name);
	if (process$1.platform === "darwin") return macos(name);
	if (process$1.platform === "win32") return windows(name);
	return linux(name);
}
//#endregion
//#region node_modules/array-back/index.js
/**
* Takes any input and guarantees an array back.
*
* - Converts array-like objects (e.g. `arguments`, `Set`) to a real array.
* - Converts `undefined` to an empty array.
* - Converts any another other, singular value (including `null`, objects and iterables other than `Set`) into an array containing that value.
* - Ignores input which is already an array.
*
* @module array-back
* @example
* > const arrayify = require('array-back')
*
* > arrayify(undefined)
* []
*
* > arrayify(null)
* [ null ]
*
* > arrayify(0)
* [ 0 ]
*
* > arrayify([ 1, 2 ])
* [ 1, 2 ]
*
* > arrayify(new Set([ 1, 2 ]))
* [ 1, 2 ]
*
* > function f(){ return arrayify(arguments); }
* > f(1,2,3)
* [ 1, 2, 3 ]
*/
function isObject$3(input) {
	return typeof input === "object" && input !== null;
}
function isArrayLike$1(input) {
	return isObject$3(input) && typeof input.length === "number";
}
/**
* @param {*} - The input value to convert to an array
* @returns {Array}
* @alias module:array-back
*/
function arrayify(input) {
	if (Array.isArray(input)) return input;
	else if (input === void 0) return [];
	else if (isArrayLike$1(input) || input instanceof Set) return Array.from(input);
	else return [input];
}
//#endregion
//#region node_modules/find-replace/index.js
/**
* @module find-replace
*/
/**
* @param {array} - The input array
* @param {function} - A predicate function which, if returns `true` causes the current item to be operated on.
* @param [replaceWith] {...any} - If not specified, each found value will be removed. If specified, each found value will be replaced with this value. If the `replaceWith` value is a function, it will be invoked with the found value and its result used as the replace value. If the `replaceWith` function returns an array, the found value will be replaced with each item in the array (not replaced with the array itself).
* @returns {array}
* @alias module:find-replace
*/
function findReplace(array, findFn, ...replaceWiths) {
	const found = [];
	if (!Array.isArray(array)) throw new Error("Input must be an array");
	for (const [index, value] of array.entries()) {
		let expanded = [];
		replaceWiths.forEach((replaceWith) => {
			if (typeof replaceWith === "function") expanded = expanded.concat(replaceWith(value));
			else expanded.push(replaceWith);
		});
		if (findFn(value)) found.push({
			index,
			replaceWithValue: expanded
		});
	}
	for (const item of found.reverse()) {
		const spliceArgs = [item.index, 1].concat(item.replaceWithValue);
		array.splice.apply(array, spliceArgs);
	}
	return array;
}
//#endregion
//#region node_modules/command-line-args/lib/argv-tools.js
/**
* Some useful tools for working with `process.argv`.
*
* @module argv-tools
* @typicalName argvTools
* @example
* const argvTools = require('argv-tools')
*/
/**
* Regular expressions for matching option formats.
* @static
*/
const re$1 = {
	short: /^-([^\d-])$/,
	long: /^--(\S+)/,
	combinedShort: /^-[^\d-]{2,}$/,
	optEquals: /^(--\S+?)=(.*)/
};
/**
* Array subclass encapsulating common operations on `process.argv`.
* @static
*/
var ArgvArray = class extends Array {
	/**
	* Clears the array has loads the supplied input.
	* @param {string[]} argv - The argv list to load. Defaults to `process.argv`.
	*/
	load(argv) {
		this.clear();
		if (argv && argv !== process.argv) argv = arrayify(argv);
		else {
			argv = process.argv.slice(0);
			const deleteCount = process.execArgv.some(isExecArg) ? 1 : 2;
			argv.splice(0, deleteCount);
		}
		argv.forEach((arg) => this.push(String(arg)));
	}
	/**
	* Clear the array.
	*/
	clear() {
		this.length = 0;
	}
	/**
	* expand ``--option=value` style args.
	*/
	expandOptionEqualsNotation() {
		if (this.some((arg) => re$1.optEquals.test(arg))) {
			const expandedArgs = [];
			this.forEach((arg) => {
				const matches = arg.match(re$1.optEquals);
				if (matches) expandedArgs.push(matches[1], matches[2]);
				else expandedArgs.push(arg);
			});
			this.clear();
			this.load(expandedArgs);
		}
	}
	/**
	* expand getopt-style combinedShort options.
	*/
	expandGetoptNotation() {
		if (this.hasCombinedShortOptions()) findReplace(this, re$1.combinedShort, expandCombinedShortArg);
	}
	/**
	* Returns true if the array contains combined short options (e.g. `-ab`).
	* @returns {boolean}
	*/
	hasCombinedShortOptions() {
		return this.some((arg) => re$1.combinedShort.test(arg));
	}
	static from(argv) {
		const result = new this();
		result.load(argv);
		return result;
	}
};
/**
* Expand a combined short option.
* @param {string} - the string to expand, e.g. `-ab`
* @returns {string[]}
* @static
*/
function expandCombinedShortArg(arg) {
	arg = arg.slice(1);
	return arg.split("").map((letter) => "-" + letter);
}
/**
* Returns true if the supplied arg matches `--option=value` notation.
* @param {string} - the arg to test, e.g. `--one=something`
* @returns {boolean}
* @static
*/
function isOptionEqualsNotation(arg) {
	return re$1.optEquals.test(arg);
}
/**
* Returns true if the supplied arg is in either long (`--one`) or short (`-o`) format.
* @param {string} - the arg to test, e.g. `--one`
* @returns {boolean}
* @static
*/
function isOption(arg) {
	return (re$1.short.test(arg) || re$1.long.test(arg)) && !re$1.optEquals.test(arg);
}
/**
* Returns true if the supplied arg is in long (`--one`) format.
* @param {string} - the arg to test, e.g. `--one`
* @returns {boolean}
* @static
*/
function isLongOption(arg) {
	return re$1.long.test(arg) && !isOptionEqualsNotation(arg);
}
/**
* Returns the name from a long, short or `--options=value` arg.
* @param {string} - the arg to inspect, e.g. `--one`
* @returns {string}
* @static
*/
function getOptionName$1(arg) {
	if (re$1.short.test(arg)) return arg.match(re$1.short)[1];
	else if (isLongOption(arg)) return arg.match(re$1.long)[1];
	else if (isOptionEqualsNotation(arg)) return arg.match(re$1.optEquals)[1].replace(/^--/, "");
	else return null;
}
function isValue(arg) {
	return !(isOption(arg) || re$1.combinedShort.test(arg) || re$1.optEquals.test(arg));
}
function isExecArg(arg) {
	return ["--eval", "-e"].indexOf(arg) > -1 || arg.startsWith("--eval=");
}
//#endregion
//#region node_modules/typical/index.js
/**
* Isomorphic, functional type-checking for Javascript.
* @module typical
* @typicalname t
* @example
* import t from 'typical'
* const allDefined = array.every(t.isDefined)
*/
/**
* Returns true if input is a number (including infinity). It is a more reasonable alternative to `typeof n` which returns `number` for `NaN`.
*
* @param {*} n - The input to test
* @returns {boolean} `true` if input is a number
* @static
* @example
* > t.isNumber(0)
* true
* > t.isNumber(1)
* true
* > t.isNumber(1.1)
* true
* > t.isNumber(0xff)
* true
* > t.isNumber(0644)
* true
* > t.isNumber(6.2e5)
* true
* > t.isNumber(NaN)
* false
* > t.isNumber(Infinity)
* true
*/
function isNumber(n) {
	return !isNaN(parseFloat(n));
}
/**
* Returns true if input is a finite number. Identical to `isNumber` beside excluding infinity.
*
* @param {*} n - The input to test
* @returns {boolean}
* @static
* @example
* > t.isFiniteNumber(0)
* true
* > t.isFiniteNumber(1)
* true
* > t.isFiniteNumber(1.1)
* true
* > t.isFiniteNumber(0xff)
* true
* > t.isFiniteNumber(0644)
* true
* > t.isFiniteNumber(6.2e5)
* true
* > t.isFiniteNumber(NaN)
* false
* > t.isFiniteNumber(Infinity)
* false
*/
function isFiniteNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
/**
* A plain object is a simple object literal, it is not an instance of a class. Returns true if the input `typeof` is `object` and directly decends from `Object`.
*
* @param {*} input - The input to test
* @returns {boolean}
* @static
* @example
* > t.isPlainObject({ something: 'one' })
* true
* > t.isPlainObject(new Date())
* false
* > t.isPlainObject([ 0, 1 ])
* false
* > t.isPlainObject(/test/)
* false
* > t.isPlainObject(1)
* false
* > t.isPlainObject('one')
* false
* > t.isPlainObject(null)
* false
* > t.isPlainObject((function * () {})())
* false
* > t.isPlainObject(function * () {})
* false
*/
function isPlainObject$1(input) {
	return input !== null && typeof input === "object" && input.constructor === Object;
}
/**
* An array-like value has all the properties of an array yet is not an array instance. An example is the `arguments` object. Returns `true`` if the input value is an object, not `null`` and has a `length` property set with a numeric value.
*
* @param {*} input - The input to test
* @returns {boolean}
* @static
* @example
* function sum(x, y){
*   console.log(t.isArrayLike(arguments))
*   // prints `true`
* }
*/
function isArrayLike(input) {
	return isObject$2(input) && typeof input.length === "number";
}
/**
* Returns true if the typeof input is `'object'` but not null.
* @param {*} input - The input to test
* @returns {boolean}
* @static
*/
function isObject$2(input) {
	return typeof input === "object" && input !== null;
}
/**
* Returns true if the input value is defined.
* @param {*} input - The input to test
* @returns {boolean}
* @static
*/
function isDefined(input) {
	return typeof input !== "undefined";
}
/**
* Returns true if the input value is undefined.
* @param {*} input - The input to test
* @returns {boolean}
* @static
*/
function isUndefined(input) {
	return !isDefined(input);
}
/**
* Returns true if the input value is null.
* @param {*} input - The input to test
* @returns {boolean}
* @static
*/
function isNull$1(input) {
	return input === null;
}
/**
* Returns true if the input value is not one of `undefined`, `null`, or `NaN`.
* @param {*} input - The input to test
* @returns {boolean}
* @static
*/
function isDefinedValue(input) {
	return isDefined(input) && !isNull$1(input) && !Number.isNaN(input);
}
/**
* Returns true if the input value is an ES2015 `class`.
* @param {*} input - The input to test
* @returns {boolean}
* @static
*/
function isClass(input) {
	if (typeof input === "function") return /^class /.test(Function.prototype.toString.call(input));
	else return false;
}
/**
* Returns true if the input is a string, number, symbol, boolean, null or undefined value.
* @param {*} input - The input to test
* @returns {boolean}
* @static
*/
function isPrimitive(input) {
	if (input === null) return true;
	switch (typeof input) {
		case "string":
		case "number":
		case "symbol":
		case "undefined":
		case "boolean": return true;
		default: return false;
	}
}
/**
* Returns true if the input is a Promise.
* @param {*} input - The input to test
* @returns {boolean}
* @static
*/
function isPromise(input) {
	if (input) {
		const isPromise = isDefined(Promise) && input instanceof Promise;
		const isThenable = input.then && typeof input.then === "function";
		return !!(isPromise || isThenable);
	} else return false;
}
/**
* Returns true if the input is an iterable (`Map`, `Set`, `Array`, Generator etc.).
* @param {*} input - The input to test
* @returns {boolean}
* @static
* @example
* > t.isIterable('string')
* true
* > t.isIterable(new Map())
* true
* > t.isIterable([])
* true
* > t.isIterable((function * () {})())
* true
* > t.isIterable(Promise.resolve())
* false
* > t.isIterable(Promise)
* false
* > t.isIterable(true)
* false
* > t.isIterable({})
* false
* > t.isIterable(0)
* false
* > t.isIterable(1.1)
* false
* > t.isIterable(NaN)
* false
* > t.isIterable(Infinity)
* false
* > t.isIterable(function () {})
* false
* > t.isIterable(Date)
* false
* > t.isIterable()
* false
* > t.isIterable({ then: function () {} })
* false
*/
function isIterable(input) {
	if (input === null || !isDefined(input)) return false;
	else return typeof input[Symbol.iterator] === "function" || typeof input[Symbol.asyncIterator] === "function";
}
/**
* Returns true if the input value is a string. The equivalent of `typeof input === 'string'` for use in funcitonal contexts.
* @param {*} input - The input to test
* @returns {boolean}
* @static
*/
function isString(input) {
	return typeof input === "string";
}
/**
* Returns true if the input value is a function. The equivalent of `typeof input === 'function'` for use in funcitonal contexts.
* @param {*} input - The input to test
* @returns {boolean}
* @static
*/
function isFunction(input) {
	return typeof input === "function";
}
/**
* Returns true if the input value is an async function or method.
* @param {*} input - The input to test
* @returns {boolean}
* @static
* @example
* > t.isAsyncFunction(function () {})
* false
* > t.isAsyncFunction(new Function())
* false
* > t.isAsyncFunction(() => {})
* false
* > t.isAsyncFunction(async function () {})
* true
* > const AsyncFunction = async function () {}.constructor
* > t.isAsyncFunction(new AsyncFunction())
* true
* > t.isAsyncFunction(async () => {})
* true
* > class Command { async execute () {} }
* > t.isAsyncFunction(new Command().execute)
* true
*/
function isAsyncFunction(input) {
	return typeof input === "function" && input.constructor.name === "AsyncFunction";
}
var typical_default = {
	isNumber,
	isFiniteNumber,
	isPlainObject: isPlainObject$1,
	isArrayLike,
	isObject: isObject$2,
	isDefined,
	isUndefined,
	isNull: isNull$1,
	isDefinedValue,
	isClass,
	isPrimitive,
	isPromise,
	isIterable,
	isString,
	isFunction,
	isAsyncFunction
};
//#endregion
//#region node_modules/command-line-args/lib/option-definition.js
/**
* @module option-definition
*/
/**
* Describes a command-line option. Additionally, if generating a usage guide with [command-line-usage](https://github.com/75lb/command-line-usage) you could optionally add `description` and `typeLabel` properties to each definition.
*
* @alias module:option-definition
* @typicalname option
*/
var OptionDefinition = class {
	constructor(definition) {
		/**
		* The only required definition property is `name`, so the simplest working example is
		* ```js
		* const optionDefinitions = [
		*   { name: 'file' },
		*   { name: 'depth' }
		* ]
		* ```
		*
		* Where a `type` property is not specified it will default to `String`.
		*
		* | #   | argv input | commandLineArgs() output |
		* | --- | -------------------- | ------------ |
		* | 1   | `--file` | `{ file: null }` |
		* | 2   | `--file lib.js` | `{ file: 'lib.js' }` |
		* | 3   | `--depth 2` | `{ depth: '2' }` |
		*
		* Unicode option names and aliases are valid, for example:
		* ```js
		* const optionDefinitions = [
		*   { name: 'один' },
		*   { name: '两' },
		*   { name: 'три', alias: 'т' }
		* ]
		* ```
		* @type {string}
		*/
		this.name = definition.name;
		/**
		* The `type` value is a setter function (you receive the output from this), enabling you to be specific about the type and value received.
		*
		* The most common values used are `String` (the default), `Number` and `Boolean` but you can use a custom function, for example:
		*
		* ```js
		* const fs = require('fs')
		*
		* class FileDetails {
		*   constructor (filename) {
		*     this.filename = filename
		*     this.exists = fs.existsSync(filename)
		*   }
		* }
		*
		* const cli = commandLineArgs([
		*   { name: 'file', type: filename => new FileDetails(filename) },
		*   { name: 'depth', type: Number }
		* ])
		* ```
		*
		* | #   | argv input | commandLineArgs() output |
		* | --- | ----------------- | ------------ |
		* | 1   | `--file asdf.txt` | `{ file: { filename: 'asdf.txt', exists: false } }` |
		*
		* The `--depth` option expects a `Number`. If no value was set, you will receive `null`.
		*
		* | #   | argv input | commandLineArgs() output |
		* | --- | ----------------- | ------------ |
		* | 2   | `--depth` | `{ depth: null }` |
		* | 3   | `--depth 2` | `{ depth: 2 }` |
		*
		* @type {function}
		* @default String
		*/
		this.type = definition.type || String;
		/**
		* getopt-style short option names. Can be any single character (unicode included) except a digit or hyphen.
		*
		* ```js
		* const optionDefinitions = [
		*   { name: 'hot', alias: 'h', type: Boolean },
		*   { name: 'discount', alias: 'd', type: Boolean },
		*   { name: 'courses', alias: 'c' , type: Number }
		* ]
		* ```
		*
		* | #   | argv input | commandLineArgs() output |
		* | --- | ------------ | ------------ |
		* | 1   | `-hcd` | `{ hot: true, courses: null, discount: true }` |
		* | 2   | `-hdc 3` | `{ hot: true, discount: true, courses: 3 }` |
		*
		* @type {string}
		*/
		this.alias = definition.alias;
		/**
		* Set this flag if the option takes a list of values. You will receive an array of values, each passed through the `type` function (if specified).
		*
		* ```js
		* const optionDefinitions = [
		*   { name: 'files', type: String, multiple: true }
		* ]
		* ```
		*
		* Note, examples 1 and 3 below demonstrate "greedy" parsing which can be disabled by using `lazyMultiple`.
		*
		* | #   | argv input | commandLineArgs() output |
		* | --- | ------------ | ------------ |
		* | 1   | `--files one.js two.js` | `{ files: [ 'one.js', 'two.js' ] }` |
		* | 2   | `--files one.js --files two.js` | `{ files: [ 'one.js', 'two.js' ] }` |
		* | 3   | `--files *` | `{ files: [ 'one.js', 'two.js' ] }` |
		*
		* @type {boolean}
		*/
		this.multiple = definition.multiple;
		/**
		* Identical to `multiple` but with greedy parsing disabled.
		*
		* ```js
		* const optionDefinitions = [
		*   { name: 'files', lazyMultiple: true },
		*   { name: 'verbose', alias: 'v', type: Boolean, lazyMultiple: true }
		* ]
		* ```
		*
		* | #   | argv input | commandLineArgs() output |
		* | --- | ------------ | ------------ |
		* | 1   | `--files one.js --files two.js` | `{ files: [ 'one.js', 'two.js' ] }` |
		* | 2   | `-vvv` | `{ verbose: [ true, true, true ] }` |
		*
		* @type {boolean}
		*/
		this.lazyMultiple = definition.lazyMultiple;
		/**
		* Any values unaccounted for by an option definition will be set on the `defaultOption`. This flag is typically set on the most commonly-used option to make for more concise usage (i.e. `$ example *.js` instead of `$ example --files *.js`).
		*
		* ```js
		* const optionDefinitions = [
		*   { name: 'files', multiple: true, defaultOption: true }
		* ]
		* ```
		*
		* | #   | argv input | commandLineArgs() output |
		* | --- | ------------ | ------------ |
		* | 1   | `--files one.js two.js` | `{ files: [ 'one.js', 'two.js' ] }` |
		* | 2   | `one.js two.js` | `{ files: [ 'one.js', 'two.js' ] }` |
		* | 3   | `*` | `{ files: [ 'one.js', 'two.js' ] }` |
		*
		* @type {boolean}
		*/
		this.defaultOption = definition.defaultOption;
		/**
		* An initial value for the option.
		*
		* ```js
		* const optionDefinitions = [
		*   { name: 'files', multiple: true, defaultValue: [ 'one.js' ] },
		*   { name: 'max', type: Number, defaultValue: 3 }
		* ]
		* ```
		*
		* | #   | argv input | commandLineArgs() output |
		* | --- | ------------ | ------------ |
		* | 1   |  | `{ files: [ 'one.js' ], max: 3 }` |
		* | 2   | `--files two.js` | `{ files: [ 'two.js' ], max: 3 }` |
		* | 3   | `--max 4` | `{ files: [ 'one.js' ], max: 4 }` |
		*
		* @type {*}
		*/
		this.defaultValue = definition.defaultValue;
		/**
		* When your app has a large amount of options it makes sense to organise them in groups.
		*
		* There are two automatic groups: `_all` (contains all options) and `_none` (contains options without a `group` specified in their definition).
		*
		* ```js
		* const optionDefinitions = [
		*   { name: 'verbose', group: 'standard' },
		*   { name: 'help', group: [ 'standard', 'main' ] },
		*   { name: 'compress', group: [ 'server', 'main' ] },
		*   { name: 'static', group: 'server' },
		*   { name: 'debug' }
		* ]
		* ```
		*
		*<table>
		*  <tr>
		*    <th>#</th><th>Command Line</th><th>commandLineArgs() output</th>
		*  </tr>
		*  <tr>
		*    <td>1</td><td><code>--verbose</code></td><td><pre><code>
		*{
		*  _all: { verbose: true },
		*  standard: { verbose: true }
		*}
		*</code></pre></td>
		*  </tr>
		*  <tr>
		*    <td>2</td><td><code>--debug</code></td><td><pre><code>
		*{
		*  _all: { debug: true },
		*  _none: { debug: true }
		*}
		*</code></pre></td>
		*  </tr>
		*  <tr>
		*    <td>3</td><td><code>--verbose --debug --compress</code></td><td><pre><code>
		*{
		*  _all: {
		*    verbose: true,
		*    debug: true,
		*    compress: true
		*  },
		*  standard: { verbose: true },
		*  server: { compress: true },
		*  main: { compress: true },
		*  _none: { debug: true }
		*}
		*</code></pre></td>
		*  </tr>
		*  <tr>
		*    <td>4</td><td><code>--compress</code></td><td><pre><code>
		*{
		*  _all: { compress: true },
		*  server: { compress: true },
		*  main: { compress: true }
		*}
		*</code></pre></td>
		*  </tr>
		*</table>
		*
		* @type {string|string[]}
		*/
		this.group = definition.group;
		for (const prop in definition) if (!this[prop]) this[prop] = definition[prop];
	}
	isBoolean() {
		return this.type === Boolean || typical_default.isFunction(this.type) && this.type.name === "Boolean";
	}
	isMultiple() {
		return this.multiple || this.lazyMultiple;
	}
	static create(def) {
		return new this(def);
	}
};
//#endregion
//#region node_modules/command-line-args/lib/option-definitions.js
/**
* @module option-definitions
*/
/**
* @alias module:option-definitions
*/
var Definitions = class extends Array {
	/**
	* validate option definitions
	* @param {boolean} [caseInsensitive=false] - whether arguments will be parsed in a case insensitive manner
	* @returns {string}
	*/
	validate(caseInsensitive) {
		if (this.some((def) => !def.name)) halt("INVALID_DEFINITIONS", "Invalid option definitions: the `name` property is required on each definition");
		if (this.some((def) => def.type && typeof def.type !== "function")) halt("INVALID_DEFINITIONS", "Invalid option definitions: the `type` property must be a setter fuction (default: `Boolean`)");
		let invalidOption;
		if (this.some((def) => {
			invalidOption = def;
			return typical_default.isDefined(def.alias) && typical_default.isNumber(def.alias);
		})) halt("INVALID_DEFINITIONS", "Invalid option definition: to avoid ambiguity an alias cannot be numeric [--" + invalidOption.name + " alias is -" + invalidOption.alias + "]");
		if (this.some((def) => {
			invalidOption = def;
			return typical_default.isDefined(def.alias) && def.alias.length !== 1;
		})) halt("INVALID_DEFINITIONS", "Invalid option definition: an alias must be a single character");
		if (this.some((def) => {
			invalidOption = def;
			return def.alias === "-";
		})) halt("INVALID_DEFINITIONS", "Invalid option definition: an alias cannot be \"-\"");
		if (hasDuplicates(this.map((def) => caseInsensitive ? def.name.toLowerCase() : def.name))) halt("INVALID_DEFINITIONS", "Two or more option definitions have the same name");
		if (hasDuplicates(this.map((def) => caseInsensitive && typical_default.isDefined(def.alias) ? def.alias.toLowerCase() : def.alias))) halt("INVALID_DEFINITIONS", "Two or more option definitions have the same alias");
		if (this.filter((def) => def.defaultOption === true).length > 1) halt("INVALID_DEFINITIONS", "Only one option definition can be the defaultOption");
		if (this.some((def) => {
			invalidOption = def;
			return def.isBoolean() && def.defaultOption;
		})) halt("INVALID_DEFINITIONS", `A boolean option ["${invalidOption.name}"] can not also be the defaultOption.`);
	}
	/**
	* Get definition by option arg (e.g. `--one` or `-o`)
	* @param {string} [arg] the argument name to get the definition for
	* @param {boolean} [caseInsensitive] whether to use case insensitive comparisons when finding the appropriate definition
	* @returns {Definition}
	*/
	get(arg, caseInsensitive) {
		if (isOption(arg)) if (re$1.short.test(arg)) {
			const shortOptionName = getOptionName$1(arg);
			if (caseInsensitive) {
				const lowercaseShortOptionName = shortOptionName.toLowerCase();
				return this.find((def) => typical_default.isDefined(def.alias) && def.alias.toLowerCase() === lowercaseShortOptionName);
			} else return this.find((def) => def.alias === shortOptionName);
		} else {
			const optionName = getOptionName$1(arg);
			if (caseInsensitive) {
				const lowercaseOptionName = optionName.toLowerCase();
				return this.find((def) => def.name.toLowerCase() === lowercaseOptionName);
			} else return this.find((def) => def.name === optionName);
		}
		else return this.find((def) => def.name === arg);
	}
	getDefault() {
		return this.find((def) => def.defaultOption === true);
	}
	isGrouped() {
		return this.some((def) => def.group);
	}
	whereGrouped() {
		return this.filter(containsValidGroup);
	}
	whereNotGrouped() {
		return this.filter((def) => !containsValidGroup(def));
	}
	whereDefaultValueSet() {
		return this.filter((def) => typical_default.isDefined(def.defaultValue));
	}
	static from(definitions, caseInsensitive) {
		if (definitions instanceof this) return definitions;
		const result = super.from(arrayify(definitions), (def) => OptionDefinition.create(def));
		result.validate(caseInsensitive);
		return result;
	}
};
function halt(name, message) {
	const err = new Error(message);
	err.name = name;
	throw err;
}
function containsValidGroup(def) {
	return arrayify(def.group).some((group) => group);
}
function hasDuplicates(array) {
	const items = {};
	for (let i = 0; i < array.length; i++) {
		const value = array[i];
		if (items[value]) return true;
		else if (typical_default.isDefined(value)) items[value] = true;
	}
}
//#endregion
//#region node_modules/command-line-args/lib/argv-parser.js
/**
* @module argv-parser
*/
/**
* @alias module:argv-parser
*/
var ArgvParser = class {
	/**
	* @param {OptionDefinitions} - Definitions array
	* @param {object} [options] - Options
	* @param {string[]} [options.argv] - Overrides `process.argv`
	* @param {boolean} [options.stopAtFirstUnknown] -
	* @param {boolean} [options.caseInsensitive] - Arguments will be parsed in a case insensitive manner. Defaults to false.
	*/
	constructor(definitions, options) {
		this.options = Object.assign({}, options);
		/**
		* Option Definitions
		*/
		this.definitions = Definitions.from(definitions, this.options.caseInsensitive);
		/**
		* Argv
		*/
		this.argv = ArgvArray.from(this.options.argv);
		if (this.argv.hasCombinedShortOptions()) findReplace(this.argv, re$1.combinedShort.test.bind(re$1.combinedShort), (arg) => {
			arg = arg.slice(1);
			return arg.split("").map((letter) => ({
				origArg: `-${arg}`,
				arg: "-" + letter
			}));
		});
	}
	/**
	* Yields one `{ event, name, value, arg, def }` argInfo object for each arg in `process.argv` (or `options.argv`).
	*/
	*[Symbol.iterator]() {
		const definitions = this.definitions;
		let def;
		let value;
		let name;
		let event;
		let singularDefaultSet = false;
		let unknownFound = false;
		let origArg;
		for (let arg of this.argv) {
			if (typical_default.isPlainObject(arg)) {
				origArg = arg.origArg;
				arg = arg.arg;
			}
			if (unknownFound && this.options.stopAtFirstUnknown) {
				yield {
					event: "unknown_value",
					arg,
					name: "_unknown",
					value: void 0
				};
				continue;
			}
			if (isOption(arg)) {
				def = definitions.get(arg, this.options.caseInsensitive);
				value = void 0;
				if (def) {
					value = def.isBoolean() ? true : null;
					event = "set";
				} else event = "unknown_option";
			} else if (isOptionEqualsNotation(arg)) {
				const matches = arg.match(re$1.optEquals);
				def = definitions.get(matches[1], this.options.caseInsensitive);
				if (def) if (def.isBoolean()) {
					yield {
						event: "unknown_value",
						arg,
						name: "_unknown",
						value,
						def
					};
					event = "set";
					value = true;
				} else {
					event = "set";
					value = matches[2];
				}
				else event = "unknown_option";
			} else if (isValue(arg)) if (def) {
				value = arg;
				event = "set";
			} else {
				def = this.definitions.getDefault();
				if (def && !singularDefaultSet) {
					value = arg;
					event = "set";
				} else {
					event = "unknown_value";
					def = void 0;
				}
			}
			name = def ? def.name : "_unknown";
			const argInfo = {
				event,
				arg,
				name,
				value,
				def
			};
			if (origArg) {
				argInfo.subArg = arg;
				argInfo.arg = origArg;
			}
			yield argInfo;
			if (name === "_unknown") unknownFound = true;
			if (def && def.defaultOption && !def.isMultiple() && event === "set") singularDefaultSet = true;
			if (def && def.isBoolean()) def = void 0;
			if (def && !def.multiple && typical_default.isDefined(value) && value !== null) def = void 0;
			value = void 0;
			event = void 0;
			name = void 0;
			origArg = void 0;
		}
	}
};
//#endregion
//#region node_modules/command-line-args/lib/option.js
const _value$1 = /* @__PURE__ */ new WeakMap();
/**
* Encapsulates behaviour (defined by an OptionDefinition) when setting values
*/
var Option = class {
	constructor(definition) {
		this.definition = new OptionDefinition(definition);
		this.state = null;
		this.resetToDefault();
	}
	get() {
		return _value$1.get(this);
	}
	set(val) {
		this._set(val, "set");
	}
	_set(val, state) {
		const def = this.definition;
		if (def.isMultiple()) {
			if (val !== null && val !== void 0) {
				const arr = this.get();
				if (this.state === "default") arr.length = 0;
				arr.push(def.type(val));
				this.state = state;
			}
		} else if (!def.isMultiple() && this.state === "set") {
			const err = /* @__PURE__ */ new Error(`Singular option already set [${this.definition.name}=${this.get()}]`);
			err.name = "ALREADY_SET";
			err.value = val;
			err.optionName = def.name;
			throw err;
		} else if (val === null || val === void 0) _value$1.set(this, val);
		else {
			_value$1.set(this, def.type(val));
			this.state = state;
		}
	}
	resetToDefault() {
		if (typical_default.isDefined(this.definition.defaultValue)) if (this.definition.isMultiple()) _value$1.set(this, arrayify(this.definition.defaultValue).slice());
		else _value$1.set(this, this.definition.defaultValue);
		else if (this.definition.isMultiple()) _value$1.set(this, []);
		else _value$1.set(this, null);
		this.state = "default";
	}
	static create(definition) {
		definition = new OptionDefinition(definition);
		if (definition.isBoolean()) return FlagOption.create(definition);
		else return new this(definition);
	}
};
var FlagOption = class extends Option {
	set(val) {
		super.set(true);
	}
	static create(def) {
		return new this(def);
	}
};
//#endregion
//#region node_modules/command-line-args/lib/output.js
var import_lodash_camelcase = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* lodash (Custom Build) <https://lodash.com/>
	* Build: `lodash modularize exports="npm" -o ./`
	* Copyright jQuery Foundation and other contributors <https://jquery.org/>
	* Released under MIT license <https://lodash.com/license>
	* Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	* Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	*/
	/** Used as references for various `Number` constants. */
	var INFINITY = Infinity;
	/** `Object#toString` result references. */
	var symbolTag = "[object Symbol]";
	/** Used to match words composed of alphanumeric characters. */
	var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
	/** Used to match Latin Unicode letters (excluding mathematical operators). */
	var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
	/** Used to compose unicode character classes. */
	var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23", rsComboSymbolsRange = "\\u20d0-\\u20f0", rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
	/** Used to compose unicode capture groups. */
	var rsApos = "['’]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboMarksRange + rsComboSymbolsRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
	/** Used to compose unicode regexes. */
	var rsLowerMisc = "(?:" + rsLower + "|" + rsMisc + ")", rsUpperMisc = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptLowerContr = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptUpperContr = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [
		rsNonAstral,
		rsRegional,
		rsSurrPair
	].join("|") + ")" + rsOptVar + reOptMod + ")*", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [
		rsDingbat,
		rsRegional,
		rsSurrPair
	].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [
		rsNonAstral + rsCombo + "?",
		rsCombo,
		rsRegional,
		rsSurrPair,
		rsAstral
	].join("|") + ")";
	/** Used to match apostrophes. */
	var reApos = RegExp(rsApos, "g");
	/**
	* Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
	* [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
	*/
	var reComboMark = RegExp(rsCombo, "g");
	/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
	var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
	/** Used to match complex or compound words. */
	var reUnicodeWord = RegExp([
		rsUpper + "?" + rsLower + "+" + rsOptLowerContr + "(?=" + [
			rsBreak,
			rsUpper,
			"$"
		].join("|") + ")",
		rsUpperMisc + "+" + rsOptUpperContr + "(?=" + [
			rsBreak,
			rsUpper + rsLowerMisc,
			"$"
		].join("|") + ")",
		rsUpper + "?" + rsLowerMisc + "+" + rsOptLowerContr,
		rsUpper + "+" + rsOptUpperContr,
		rsDigits,
		rsEmoji
	].join("|"), "g");
	/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
	var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + "]");
	/** Used to detect strings that need a more robust regexp to match words. */
	var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
	/** Used to map Latin Unicode letters to basic Latin letters. */
	var deburredLetters = {
		"À": "A",
		"Á": "A",
		"Â": "A",
		"Ã": "A",
		"Ä": "A",
		"Å": "A",
		"à": "a",
		"á": "a",
		"â": "a",
		"ã": "a",
		"ä": "a",
		"å": "a",
		"Ç": "C",
		"ç": "c",
		"Ð": "D",
		"ð": "d",
		"È": "E",
		"É": "E",
		"Ê": "E",
		"Ë": "E",
		"è": "e",
		"é": "e",
		"ê": "e",
		"ë": "e",
		"Ì": "I",
		"Í": "I",
		"Î": "I",
		"Ï": "I",
		"ì": "i",
		"í": "i",
		"î": "i",
		"ï": "i",
		"Ñ": "N",
		"ñ": "n",
		"Ò": "O",
		"Ó": "O",
		"Ô": "O",
		"Õ": "O",
		"Ö": "O",
		"Ø": "O",
		"ò": "o",
		"ó": "o",
		"ô": "o",
		"õ": "o",
		"ö": "o",
		"ø": "o",
		"Ù": "U",
		"Ú": "U",
		"Û": "U",
		"Ü": "U",
		"ù": "u",
		"ú": "u",
		"û": "u",
		"ü": "u",
		"Ý": "Y",
		"ý": "y",
		"ÿ": "y",
		"Æ": "Ae",
		"æ": "ae",
		"Þ": "Th",
		"þ": "th",
		"ß": "ss",
		"Ā": "A",
		"Ă": "A",
		"Ą": "A",
		"ā": "a",
		"ă": "a",
		"ą": "a",
		"Ć": "C",
		"Ĉ": "C",
		"Ċ": "C",
		"Č": "C",
		"ć": "c",
		"ĉ": "c",
		"ċ": "c",
		"č": "c",
		"Ď": "D",
		"Đ": "D",
		"ď": "d",
		"đ": "d",
		"Ē": "E",
		"Ĕ": "E",
		"Ė": "E",
		"Ę": "E",
		"Ě": "E",
		"ē": "e",
		"ĕ": "e",
		"ė": "e",
		"ę": "e",
		"ě": "e",
		"Ĝ": "G",
		"Ğ": "G",
		"Ġ": "G",
		"Ģ": "G",
		"ĝ": "g",
		"ğ": "g",
		"ġ": "g",
		"ģ": "g",
		"Ĥ": "H",
		"Ħ": "H",
		"ĥ": "h",
		"ħ": "h",
		"Ĩ": "I",
		"Ī": "I",
		"Ĭ": "I",
		"Į": "I",
		"İ": "I",
		"ĩ": "i",
		"ī": "i",
		"ĭ": "i",
		"į": "i",
		"ı": "i",
		"Ĵ": "J",
		"ĵ": "j",
		"Ķ": "K",
		"ķ": "k",
		"ĸ": "k",
		"Ĺ": "L",
		"Ļ": "L",
		"Ľ": "L",
		"Ŀ": "L",
		"Ł": "L",
		"ĺ": "l",
		"ļ": "l",
		"ľ": "l",
		"ŀ": "l",
		"ł": "l",
		"Ń": "N",
		"Ņ": "N",
		"Ň": "N",
		"Ŋ": "N",
		"ń": "n",
		"ņ": "n",
		"ň": "n",
		"ŋ": "n",
		"Ō": "O",
		"Ŏ": "O",
		"Ő": "O",
		"ō": "o",
		"ŏ": "o",
		"ő": "o",
		"Ŕ": "R",
		"Ŗ": "R",
		"Ř": "R",
		"ŕ": "r",
		"ŗ": "r",
		"ř": "r",
		"Ś": "S",
		"Ŝ": "S",
		"Ş": "S",
		"Š": "S",
		"ś": "s",
		"ŝ": "s",
		"ş": "s",
		"š": "s",
		"Ţ": "T",
		"Ť": "T",
		"Ŧ": "T",
		"ţ": "t",
		"ť": "t",
		"ŧ": "t",
		"Ũ": "U",
		"Ū": "U",
		"Ŭ": "U",
		"Ů": "U",
		"Ű": "U",
		"Ų": "U",
		"ũ": "u",
		"ū": "u",
		"ŭ": "u",
		"ů": "u",
		"ű": "u",
		"ų": "u",
		"Ŵ": "W",
		"ŵ": "w",
		"Ŷ": "Y",
		"ŷ": "y",
		"Ÿ": "Y",
		"Ź": "Z",
		"Ż": "Z",
		"Ž": "Z",
		"ź": "z",
		"ż": "z",
		"ž": "z",
		"Ĳ": "IJ",
		"ĳ": "ij",
		"Œ": "Oe",
		"œ": "oe",
		"ŉ": "'n",
		"ſ": "ss"
	};
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
	/** Detect free variable `self`. */
	var freeSelf = typeof self == "object" && self && self.Object === Object && self;
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function("return this")();
	/**
	* A specialized version of `_.reduce` for arrays without support for
	* iteratee shorthands.
	*
	* @private
	* @param {Array} [array] The array to iterate over.
	* @param {Function} iteratee The function invoked per iteration.
	* @param {*} [accumulator] The initial value.
	* @param {boolean} [initAccum] Specify using the first element of `array` as
	*  the initial value.
	* @returns {*} Returns the accumulated value.
	*/
	function arrayReduce(array, iteratee, accumulator, initAccum) {
		var index = -1, length = array ? array.length : 0;
		if (initAccum && length) accumulator = array[++index];
		while (++index < length) accumulator = iteratee(accumulator, array[index], index, array);
		return accumulator;
	}
	/**
	* Converts an ASCII `string` to an array.
	*
	* @private
	* @param {string} string The string to convert.
	* @returns {Array} Returns the converted array.
	*/
	function asciiToArray(string) {
		return string.split("");
	}
	/**
	* Splits an ASCII `string` into an array of its words.
	*
	* @private
	* @param {string} The string to inspect.
	* @returns {Array} Returns the words of `string`.
	*/
	function asciiWords(string) {
		return string.match(reAsciiWord) || [];
	}
	/**
	* The base implementation of `_.propertyOf` without support for deep paths.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Function} Returns the new accessor function.
	*/
	function basePropertyOf(object) {
		return function(key) {
			return object == null ? void 0 : object[key];
		};
	}
	/**
	* Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
	* letters to basic Latin letters.
	*
	* @private
	* @param {string} letter The matched letter to deburr.
	* @returns {string} Returns the deburred letter.
	*/
	var deburrLetter = basePropertyOf(deburredLetters);
	/**
	* Checks if `string` contains Unicode symbols.
	*
	* @private
	* @param {string} string The string to inspect.
	* @returns {boolean} Returns `true` if a symbol is found, else `false`.
	*/
	function hasUnicode(string) {
		return reHasUnicode.test(string);
	}
	/**
	* Checks if `string` contains a word composed of Unicode symbols.
	*
	* @private
	* @param {string} string The string to inspect.
	* @returns {boolean} Returns `true` if a word is found, else `false`.
	*/
	function hasUnicodeWord(string) {
		return reHasUnicodeWord.test(string);
	}
	/**
	* Converts `string` to an array.
	*
	* @private
	* @param {string} string The string to convert.
	* @returns {Array} Returns the converted array.
	*/
	function stringToArray(string) {
		return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
	}
	/**
	* Converts a Unicode `string` to an array.
	*
	* @private
	* @param {string} string The string to convert.
	* @returns {Array} Returns the converted array.
	*/
	function unicodeToArray(string) {
		return string.match(reUnicode) || [];
	}
	/**
	* Splits a Unicode `string` into an array of its words.
	*
	* @private
	* @param {string} The string to inspect.
	* @returns {Array} Returns the words of `string`.
	*/
	function unicodeWords(string) {
		return string.match(reUnicodeWord) || [];
	}
	/**
	* Used to resolve the
	* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	* of values.
	*/
	var objectToString = Object.prototype.toString;
	/** Built-in value references. */
	var Symbol = root.Symbol;
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
	/**
	* The base implementation of `_.slice` without an iteratee call guard.
	*
	* @private
	* @param {Array} array The array to slice.
	* @param {number} [start=0] The start position.
	* @param {number} [end=array.length] The end position.
	* @returns {Array} Returns the slice of `array`.
	*/
	function baseSlice(array, start, end) {
		var index = -1, length = array.length;
		if (start < 0) start = -start > length ? 0 : length + start;
		end = end > length ? length : end;
		if (end < 0) end += length;
		length = start > end ? 0 : end - start >>> 0;
		start >>>= 0;
		var result = Array(length);
		while (++index < length) result[index] = array[index + start];
		return result;
	}
	/**
	* The base implementation of `_.toString` which doesn't convert nullish
	* values to empty strings.
	*
	* @private
	* @param {*} value The value to process.
	* @returns {string} Returns the string.
	*/
	function baseToString(value) {
		if (typeof value == "string") return value;
		if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : "";
		var result = value + "";
		return result == "0" && 1 / value == -INFINITY ? "-0" : result;
	}
	/**
	* Casts `array` to a slice if it's needed.
	*
	* @private
	* @param {Array} array The array to inspect.
	* @param {number} start The start position.
	* @param {number} [end=array.length] The end position.
	* @returns {Array} Returns the cast slice.
	*/
	function castSlice(array, start, end) {
		var length = array.length;
		end = end === void 0 ? length : end;
		return !start && end >= length ? array : baseSlice(array, start, end);
	}
	/**
	* Creates a function like `_.lowerFirst`.
	*
	* @private
	* @param {string} methodName The name of the `String` case method to use.
	* @returns {Function} Returns the new case function.
	*/
	function createCaseFirst(methodName) {
		return function(string) {
			string = toString(string);
			var strSymbols = hasUnicode(string) ? stringToArray(string) : void 0;
			var chr = strSymbols ? strSymbols[0] : string.charAt(0);
			var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
			return chr[methodName]() + trailing;
		};
	}
	/**
	* Creates a function like `_.camelCase`.
	*
	* @private
	* @param {Function} callback The function to combine each word.
	* @returns {Function} Returns the new compounder function.
	*/
	function createCompounder(callback) {
		return function(string) {
			return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
		};
	}
	/**
	* Checks if `value` is object-like. A value is object-like if it's not `null`
	* and has a `typeof` result of "object".
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	* @example
	*
	* _.isObjectLike({});
	* // => true
	*
	* _.isObjectLike([1, 2, 3]);
	* // => true
	*
	* _.isObjectLike(_.noop);
	* // => false
	*
	* _.isObjectLike(null);
	* // => false
	*/
	function isObjectLike(value) {
		return !!value && typeof value == "object";
	}
	/**
	* Checks if `value` is classified as a `Symbol` primitive or object.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	* @example
	*
	* _.isSymbol(Symbol.iterator);
	* // => true
	*
	* _.isSymbol('abc');
	* // => false
	*/
	function isSymbol(value) {
		return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
	}
	/**
	* Converts `value` to a string. An empty string is returned for `null`
	* and `undefined` values. The sign of `-0` is preserved.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to process.
	* @returns {string} Returns the string.
	* @example
	*
	* _.toString(null);
	* // => ''
	*
	* _.toString(-0);
	* // => '-0'
	*
	* _.toString([1, 2, 3]);
	* // => '1,2,3'
	*/
	function toString(value) {
		return value == null ? "" : baseToString(value);
	}
	/**
	* Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
	*
	* @static
	* @memberOf _
	* @since 3.0.0
	* @category String
	* @param {string} [string=''] The string to convert.
	* @returns {string} Returns the camel cased string.
	* @example
	*
	* _.camelCase('Foo Bar');
	* // => 'fooBar'
	*
	* _.camelCase('--foo-bar--');
	* // => 'fooBar'
	*
	* _.camelCase('__FOO_BAR__');
	* // => 'fooBar'
	*/
	var camelCase = createCompounder(function(result, word, index) {
		word = word.toLowerCase();
		return result + (index ? capitalize(word) : word);
	});
	/**
	* Converts the first character of `string` to upper case and the remaining
	* to lower case.
	*
	* @static
	* @memberOf _
	* @since 3.0.0
	* @category String
	* @param {string} [string=''] The string to capitalize.
	* @returns {string} Returns the capitalized string.
	* @example
	*
	* _.capitalize('FRED');
	* // => 'Fred'
	*/
	function capitalize(string) {
		return upperFirst(toString(string).toLowerCase());
	}
	/**
	* Deburrs `string` by converting
	* [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
	* and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
	* letters to basic Latin letters and removing
	* [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
	*
	* @static
	* @memberOf _
	* @since 3.0.0
	* @category String
	* @param {string} [string=''] The string to deburr.
	* @returns {string} Returns the deburred string.
	* @example
	*
	* _.deburr('déjà vu');
	* // => 'deja vu'
	*/
	function deburr(string) {
		string = toString(string);
		return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
	}
	/**
	* Converts the first character of `string` to upper case.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category String
	* @param {string} [string=''] The string to convert.
	* @returns {string} Returns the converted string.
	* @example
	*
	* _.upperFirst('fred');
	* // => 'Fred'
	*
	* _.upperFirst('FRED');
	* // => 'FRED'
	*/
	var upperFirst = createCaseFirst("toUpperCase");
	/**
	* Splits `string` into an array of its words.
	*
	* @static
	* @memberOf _
	* @since 3.0.0
	* @category String
	* @param {string} [string=''] The string to inspect.
	* @param {RegExp|string} [pattern] The pattern to match words.
	* @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	* @returns {Array} Returns the words of `string`.
	* @example
	*
	* _.words('fred, barney, & pebbles');
	* // => ['fred', 'barney', 'pebbles']
	*
	* _.words('fred, barney, & pebbles', /[^, ]+/g);
	* // => ['fred', 'barney', '&', 'pebbles']
	*/
	function words(string, pattern, guard) {
		string = toString(string);
		pattern = guard ? void 0 : pattern;
		if (pattern === void 0) return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
		return string.match(pattern) || [];
	}
	module.exports = camelCase;
})))(), 1);
/**
* A map of { DefinitionNameString: Option }. By default, an Output has an `_unknown` property and any options with defaultValues.
*/
var Output = class extends Map {
	constructor(definitions) {
		super();
		/**
		* @type {OptionDefinitions}
		*/
		this.definitions = Definitions.from(definitions);
		this.set("_unknown", Option.create({
			name: "_unknown",
			multiple: true
		}));
		for (const def of this.definitions.whereDefaultValueSet()) this.set(def.name, Option.create(def));
	}
	toObject(options) {
		options = options || {};
		const output = {};
		for (const item of this) {
			const name = options.camelCase && item[0] !== "_unknown" ? (0, import_lodash_camelcase.default)(item[0]) : item[0];
			const option = item[1];
			if (name === "_unknown" && !option.get().length) continue;
			output[name] = option.get();
		}
		if (options.skipUnknown) delete output._unknown;
		return output;
	}
};
//#endregion
//#region node_modules/command-line-args/lib/output-grouped.js
var GroupedOutput = class extends Output {
	toObject(options) {
		const superOutputNoCamel = super.toObject({ skipUnknown: options.skipUnknown });
		const superOutput = super.toObject(options);
		const unknown = superOutput._unknown;
		delete superOutput._unknown;
		const grouped = { _all: superOutput };
		if (unknown && unknown.length) grouped._unknown = unknown;
		this.definitions.whereGrouped().forEach((def) => {
			const name = options.camelCase ? (0, import_lodash_camelcase.default)(def.name) : def.name;
			const outputValue = superOutputNoCamel[def.name];
			for (const groupName of arrayify(def.group)) {
				grouped[groupName] = grouped[groupName] || {};
				if (typical_default.isDefined(outputValue)) grouped[groupName][name] = outputValue;
			}
		});
		this.definitions.whereNotGrouped().forEach((def) => {
			const name = options.camelCase ? (0, import_lodash_camelcase.default)(def.name) : def.name;
			const outputValue = superOutputNoCamel[def.name];
			if (typical_default.isDefined(outputValue)) {
				if (!grouped._none) grouped._none = {};
				grouped._none[name] = outputValue;
			}
		});
		return grouped;
	}
};
//#endregion
//#region node_modules/command-line-args/index.js
/**
* @module command-line-args
*/
/**
* Returns an object containing all option values set on the command line. By default it parses the global  [`process.argv`](https://nodejs.org/api/process.html#process_process_argv) array.
*
* Parsing is strict by default - an exception is thrown if the user sets a singular option more than once or sets an unknown value or option (one without a valid [definition](https://github.com/75lb/command-line-args/blob/master/doc/option-definition.md)). To be more permissive, enabling [partial](https://github.com/75lb/command-line-args/wiki/Partial-mode-example) or [stopAtFirstUnknown](https://github.com/75lb/command-line-args/wiki/stopAtFirstUnknown) modes will return known options in the usual manner while collecting unknown arguments in a separate `_unknown` property.
*
* @param {Array<OptionDefinition>} - An array of [OptionDefinition](https://github.com/75lb/command-line-args/blob/master/doc/option-definition.md) objects
* @param {object} [options] - Options.
* @param {string[]} [options.argv] - An array of strings which, if present will be parsed instead  of `process.argv`.
* @param {boolean} [options.partial] - If `true`, an array of unknown arguments is returned in the `_unknown` property of the output.
* @param {boolean} [options.stopAtFirstUnknown] - If `true`, parsing will stop at the first unknown argument and the remaining arguments returned in `_unknown`. When set, `partial: true` is also implied.
* @param {boolean} [options.camelCase] - If `true`, options with hypenated names (e.g. `move-to`) will be returned in camel-case (e.g. `moveTo`).
* @param {boolean} [options.caseInsensitive] - If `true`, the case of each option name or alias parsed is insignificant. In other words, both `--Verbose` and `--verbose`, `-V` and `-v` would be equivalent. Defaults to false.
* @returns {object}
* @throws `UNKNOWN_OPTION` If `options.partial` is false and the user set an undefined option. The `err.optionName` property contains the arg that specified an unknown option, e.g. `--one`.
* @throws `UNKNOWN_VALUE` If `options.partial` is false and the user set a value unaccounted for by an option definition. The `err.value` property contains the unknown value, e.g. `5`.
* @throws `ALREADY_SET` If a user sets a singular, non-multiple option more than once. The `err.optionName` property contains the option name that has already been set, e.g. `one`.
* @throws `INVALID_DEFINITIONS`
*   - If an option definition is missing the required `name` property
*   - If an option definition has a `type` value that's not a function
*   - If an alias is numeric, a hyphen or a length other than 1
*   - If an option definition name was used more than once
*   - If an option definition alias was used more than once
*   - If more than one option definition has `defaultOption: true`
*   - If a `Boolean` option is also set as the `defaultOption`.
* @alias module:command-line-args
*/
function commandLineArgs(optionDefinitions, options) {
	options = options || {};
	if (options.stopAtFirstUnknown) options.partial = true;
	optionDefinitions = Definitions.from(optionDefinitions, options.caseInsensitive);
	const parser = new ArgvParser(optionDefinitions, {
		argv: options.argv,
		stopAtFirstUnknown: options.stopAtFirstUnknown,
		caseInsensitive: options.caseInsensitive
	});
	const output = new (optionDefinitions.isGrouped() ? GroupedOutput : Output)(optionDefinitions);
	for (const argInfo of parser) {
		const arg = argInfo.subArg || argInfo.arg;
		if (!options.partial) {
			if (argInfo.event === "unknown_value") {
				const err = /* @__PURE__ */ new Error(`Unknown value: ${arg}`);
				err.name = "UNKNOWN_VALUE";
				err.value = arg;
				throw err;
			} else if (argInfo.event === "unknown_option") {
				const err = /* @__PURE__ */ new Error(`Unknown option: ${arg}`);
				err.name = "UNKNOWN_OPTION";
				err.optionName = arg;
				throw err;
			}
		}
		let option;
		if (output.has(argInfo.name)) option = output.get(argInfo.name);
		else {
			option = Option.create(argInfo.def);
			output.set(argInfo.name, option);
		}
		if (argInfo.name === "_unknown") option.set(arg);
		else option.set(argInfo.value);
	}
	return output.toObject({
		skipUnknown: !options.partial,
		camelCase: options.camelCase
	});
}
//#endregion
//#region node_modules/color-name/index.js
var require_color_name = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		"aliceblue": [
			240,
			248,
			255
		],
		"antiquewhite": [
			250,
			235,
			215
		],
		"aqua": [
			0,
			255,
			255
		],
		"aquamarine": [
			127,
			255,
			212
		],
		"azure": [
			240,
			255,
			255
		],
		"beige": [
			245,
			245,
			220
		],
		"bisque": [
			255,
			228,
			196
		],
		"black": [
			0,
			0,
			0
		],
		"blanchedalmond": [
			255,
			235,
			205
		],
		"blue": [
			0,
			0,
			255
		],
		"blueviolet": [
			138,
			43,
			226
		],
		"brown": [
			165,
			42,
			42
		],
		"burlywood": [
			222,
			184,
			135
		],
		"cadetblue": [
			95,
			158,
			160
		],
		"chartreuse": [
			127,
			255,
			0
		],
		"chocolate": [
			210,
			105,
			30
		],
		"coral": [
			255,
			127,
			80
		],
		"cornflowerblue": [
			100,
			149,
			237
		],
		"cornsilk": [
			255,
			248,
			220
		],
		"crimson": [
			220,
			20,
			60
		],
		"cyan": [
			0,
			255,
			255
		],
		"darkblue": [
			0,
			0,
			139
		],
		"darkcyan": [
			0,
			139,
			139
		],
		"darkgoldenrod": [
			184,
			134,
			11
		],
		"darkgray": [
			169,
			169,
			169
		],
		"darkgreen": [
			0,
			100,
			0
		],
		"darkgrey": [
			169,
			169,
			169
		],
		"darkkhaki": [
			189,
			183,
			107
		],
		"darkmagenta": [
			139,
			0,
			139
		],
		"darkolivegreen": [
			85,
			107,
			47
		],
		"darkorange": [
			255,
			140,
			0
		],
		"darkorchid": [
			153,
			50,
			204
		],
		"darkred": [
			139,
			0,
			0
		],
		"darksalmon": [
			233,
			150,
			122
		],
		"darkseagreen": [
			143,
			188,
			143
		],
		"darkslateblue": [
			72,
			61,
			139
		],
		"darkslategray": [
			47,
			79,
			79
		],
		"darkslategrey": [
			47,
			79,
			79
		],
		"darkturquoise": [
			0,
			206,
			209
		],
		"darkviolet": [
			148,
			0,
			211
		],
		"deeppink": [
			255,
			20,
			147
		],
		"deepskyblue": [
			0,
			191,
			255
		],
		"dimgray": [
			105,
			105,
			105
		],
		"dimgrey": [
			105,
			105,
			105
		],
		"dodgerblue": [
			30,
			144,
			255
		],
		"firebrick": [
			178,
			34,
			34
		],
		"floralwhite": [
			255,
			250,
			240
		],
		"forestgreen": [
			34,
			139,
			34
		],
		"fuchsia": [
			255,
			0,
			255
		],
		"gainsboro": [
			220,
			220,
			220
		],
		"ghostwhite": [
			248,
			248,
			255
		],
		"gold": [
			255,
			215,
			0
		],
		"goldenrod": [
			218,
			165,
			32
		],
		"gray": [
			128,
			128,
			128
		],
		"green": [
			0,
			128,
			0
		],
		"greenyellow": [
			173,
			255,
			47
		],
		"grey": [
			128,
			128,
			128
		],
		"honeydew": [
			240,
			255,
			240
		],
		"hotpink": [
			255,
			105,
			180
		],
		"indianred": [
			205,
			92,
			92
		],
		"indigo": [
			75,
			0,
			130
		],
		"ivory": [
			255,
			255,
			240
		],
		"khaki": [
			240,
			230,
			140
		],
		"lavender": [
			230,
			230,
			250
		],
		"lavenderblush": [
			255,
			240,
			245
		],
		"lawngreen": [
			124,
			252,
			0
		],
		"lemonchiffon": [
			255,
			250,
			205
		],
		"lightblue": [
			173,
			216,
			230
		],
		"lightcoral": [
			240,
			128,
			128
		],
		"lightcyan": [
			224,
			255,
			255
		],
		"lightgoldenrodyellow": [
			250,
			250,
			210
		],
		"lightgray": [
			211,
			211,
			211
		],
		"lightgreen": [
			144,
			238,
			144
		],
		"lightgrey": [
			211,
			211,
			211
		],
		"lightpink": [
			255,
			182,
			193
		],
		"lightsalmon": [
			255,
			160,
			122
		],
		"lightseagreen": [
			32,
			178,
			170
		],
		"lightskyblue": [
			135,
			206,
			250
		],
		"lightslategray": [
			119,
			136,
			153
		],
		"lightslategrey": [
			119,
			136,
			153
		],
		"lightsteelblue": [
			176,
			196,
			222
		],
		"lightyellow": [
			255,
			255,
			224
		],
		"lime": [
			0,
			255,
			0
		],
		"limegreen": [
			50,
			205,
			50
		],
		"linen": [
			250,
			240,
			230
		],
		"magenta": [
			255,
			0,
			255
		],
		"maroon": [
			128,
			0,
			0
		],
		"mediumaquamarine": [
			102,
			205,
			170
		],
		"mediumblue": [
			0,
			0,
			205
		],
		"mediumorchid": [
			186,
			85,
			211
		],
		"mediumpurple": [
			147,
			112,
			219
		],
		"mediumseagreen": [
			60,
			179,
			113
		],
		"mediumslateblue": [
			123,
			104,
			238
		],
		"mediumspringgreen": [
			0,
			250,
			154
		],
		"mediumturquoise": [
			72,
			209,
			204
		],
		"mediumvioletred": [
			199,
			21,
			133
		],
		"midnightblue": [
			25,
			25,
			112
		],
		"mintcream": [
			245,
			255,
			250
		],
		"mistyrose": [
			255,
			228,
			225
		],
		"moccasin": [
			255,
			228,
			181
		],
		"navajowhite": [
			255,
			222,
			173
		],
		"navy": [
			0,
			0,
			128
		],
		"oldlace": [
			253,
			245,
			230
		],
		"olive": [
			128,
			128,
			0
		],
		"olivedrab": [
			107,
			142,
			35
		],
		"orange": [
			255,
			165,
			0
		],
		"orangered": [
			255,
			69,
			0
		],
		"orchid": [
			218,
			112,
			214
		],
		"palegoldenrod": [
			238,
			232,
			170
		],
		"palegreen": [
			152,
			251,
			152
		],
		"paleturquoise": [
			175,
			238,
			238
		],
		"palevioletred": [
			219,
			112,
			147
		],
		"papayawhip": [
			255,
			239,
			213
		],
		"peachpuff": [
			255,
			218,
			185
		],
		"peru": [
			205,
			133,
			63
		],
		"pink": [
			255,
			192,
			203
		],
		"plum": [
			221,
			160,
			221
		],
		"powderblue": [
			176,
			224,
			230
		],
		"purple": [
			128,
			0,
			128
		],
		"rebeccapurple": [
			102,
			51,
			153
		],
		"red": [
			255,
			0,
			0
		],
		"rosybrown": [
			188,
			143,
			143
		],
		"royalblue": [
			65,
			105,
			225
		],
		"saddlebrown": [
			139,
			69,
			19
		],
		"salmon": [
			250,
			128,
			114
		],
		"sandybrown": [
			244,
			164,
			96
		],
		"seagreen": [
			46,
			139,
			87
		],
		"seashell": [
			255,
			245,
			238
		],
		"sienna": [
			160,
			82,
			45
		],
		"silver": [
			192,
			192,
			192
		],
		"skyblue": [
			135,
			206,
			235
		],
		"slateblue": [
			106,
			90,
			205
		],
		"slategray": [
			112,
			128,
			144
		],
		"slategrey": [
			112,
			128,
			144
		],
		"snow": [
			255,
			250,
			250
		],
		"springgreen": [
			0,
			255,
			127
		],
		"steelblue": [
			70,
			130,
			180
		],
		"tan": [
			210,
			180,
			140
		],
		"teal": [
			0,
			128,
			128
		],
		"thistle": [
			216,
			191,
			216
		],
		"tomato": [
			255,
			99,
			71
		],
		"turquoise": [
			64,
			224,
			208
		],
		"violet": [
			238,
			130,
			238
		],
		"wheat": [
			245,
			222,
			179
		],
		"white": [
			255,
			255,
			255
		],
		"whitesmoke": [
			245,
			245,
			245
		],
		"yellow": [
			255,
			255,
			0
		],
		"yellowgreen": [
			154,
			205,
			50
		]
	};
}));
//#endregion
//#region node_modules/color-convert/conversions.js
var require_conversions = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const cssKeywords = require_color_name();
	const reverseKeywords = {};
	for (const key of Object.keys(cssKeywords)) reverseKeywords[cssKeywords[key]] = key;
	const convert = {
		rgb: {
			channels: 3,
			labels: "rgb"
		},
		hsl: {
			channels: 3,
			labels: "hsl"
		},
		hsv: {
			channels: 3,
			labels: "hsv"
		},
		hwb: {
			channels: 3,
			labels: "hwb"
		},
		cmyk: {
			channels: 4,
			labels: "cmyk"
		},
		xyz: {
			channels: 3,
			labels: "xyz"
		},
		lab: {
			channels: 3,
			labels: "lab"
		},
		lch: {
			channels: 3,
			labels: "lch"
		},
		hex: {
			channels: 1,
			labels: ["hex"]
		},
		keyword: {
			channels: 1,
			labels: ["keyword"]
		},
		ansi16: {
			channels: 1,
			labels: ["ansi16"]
		},
		ansi256: {
			channels: 1,
			labels: ["ansi256"]
		},
		hcg: {
			channels: 3,
			labels: [
				"h",
				"c",
				"g"
			]
		},
		apple: {
			channels: 3,
			labels: [
				"r16",
				"g16",
				"b16"
			]
		},
		gray: {
			channels: 1,
			labels: ["gray"]
		}
	};
	module.exports = convert;
	for (const model of Object.keys(convert)) {
		if (!("channels" in convert[model])) throw new Error("missing channels property: " + model);
		if (!("labels" in convert[model])) throw new Error("missing channel labels property: " + model);
		if (convert[model].labels.length !== convert[model].channels) throw new Error("channel and label counts mismatch: " + model);
		const { channels, labels } = convert[model];
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], "channels", { value: channels });
		Object.defineProperty(convert[model], "labels", { value: labels });
	}
	convert.rgb.hsl = function(rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const min = Math.min(r, g, b);
		const max = Math.max(r, g, b);
		const delta = max - min;
		let h;
		let s;
		if (max === min) h = 0;
		else if (r === max) h = (g - b) / delta;
		else if (g === max) h = 2 + (b - r) / delta;
		else if (b === max) h = 4 + (r - g) / delta;
		h = Math.min(h * 60, 360);
		if (h < 0) h += 360;
		const l = (min + max) / 2;
		if (max === min) s = 0;
		else if (l <= .5) s = delta / (max + min);
		else s = delta / (2 - max - min);
		return [
			h,
			s * 100,
			l * 100
		];
	};
	convert.rgb.hsv = function(rgb) {
		let rdif;
		let gdif;
		let bdif;
		let h;
		let s;
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const v = Math.max(r, g, b);
		const diff = v - Math.min(r, g, b);
		const diffc = function(c) {
			return (v - c) / 6 / diff + 1 / 2;
		};
		if (diff === 0) {
			h = 0;
			s = 0;
		} else {
			s = diff / v;
			rdif = diffc(r);
			gdif = diffc(g);
			bdif = diffc(b);
			if (r === v) h = bdif - gdif;
			else if (g === v) h = 1 / 3 + rdif - bdif;
			else if (b === v) h = 2 / 3 + gdif - rdif;
			if (h < 0) h += 1;
			else if (h > 1) h -= 1;
		}
		return [
			h * 360,
			s * 100,
			v * 100
		];
	};
	convert.rgb.hwb = function(rgb) {
		const r = rgb[0];
		const g = rgb[1];
		let b = rgb[2];
		const h = convert.rgb.hsl(rgb)[0];
		const w = 1 / 255 * Math.min(r, Math.min(g, b));
		b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
		return [
			h,
			w * 100,
			b * 100
		];
	};
	convert.rgb.cmyk = function(rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const k = Math.min(1 - r, 1 - g, 1 - b);
		const c = (1 - r - k) / (1 - k) || 0;
		const m = (1 - g - k) / (1 - k) || 0;
		const y = (1 - b - k) / (1 - k) || 0;
		return [
			c * 100,
			m * 100,
			y * 100,
			k * 100
		];
	};
	function comparativeDistance(x, y) {
		return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
	}
	convert.rgb.keyword = function(rgb) {
		const reversed = reverseKeywords[rgb];
		if (reversed) return reversed;
		let currentClosestDistance = Infinity;
		let currentClosestKeyword;
		for (const keyword of Object.keys(cssKeywords)) {
			const value = cssKeywords[keyword];
			const distance = comparativeDistance(rgb, value);
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
		return currentClosestKeyword;
	};
	convert.keyword.rgb = function(keyword) {
		return cssKeywords[keyword];
	};
	convert.rgb.xyz = function(rgb) {
		let r = rgb[0] / 255;
		let g = rgb[1] / 255;
		let b = rgb[2] / 255;
		r = r > .04045 ? ((r + .055) / 1.055) ** 2.4 : r / 12.92;
		g = g > .04045 ? ((g + .055) / 1.055) ** 2.4 : g / 12.92;
		b = b > .04045 ? ((b + .055) / 1.055) ** 2.4 : b / 12.92;
		const x = r * .4124 + g * .3576 + b * .1805;
		const y = r * .2126 + g * .7152 + b * .0722;
		const z = r * .0193 + g * .1192 + b * .9505;
		return [
			x * 100,
			y * 100,
			z * 100
		];
	};
	convert.rgb.lab = function(rgb) {
		const xyz = convert.rgb.xyz(rgb);
		let x = xyz[0];
		let y = xyz[1];
		let z = xyz[2];
		x /= 95.047;
		y /= 100;
		z /= 108.883;
		x = x > .008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
		y = y > .008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
		z = z > .008856 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
		return [
			116 * y - 16,
			500 * (x - y),
			200 * (y - z)
		];
	};
	convert.hsl.rgb = function(hsl) {
		const h = hsl[0] / 360;
		const s = hsl[1] / 100;
		const l = hsl[2] / 100;
		let t2;
		let t3;
		let val;
		if (s === 0) {
			val = l * 255;
			return [
				val,
				val,
				val
			];
		}
		if (l < .5) t2 = l * (1 + s);
		else t2 = l + s - l * s;
		const t1 = 2 * l - t2;
		const rgb = [
			0,
			0,
			0
		];
		for (let i = 0; i < 3; i++) {
			t3 = h + 1 / 3 * -(i - 1);
			if (t3 < 0) t3++;
			if (t3 > 1) t3--;
			if (6 * t3 < 1) val = t1 + (t2 - t1) * 6 * t3;
			else if (2 * t3 < 1) val = t2;
			else if (3 * t3 < 2) val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
			else val = t1;
			rgb[i] = val * 255;
		}
		return rgb;
	};
	convert.hsl.hsv = function(hsl) {
		const h = hsl[0];
		let s = hsl[1] / 100;
		let l = hsl[2] / 100;
		let smin = s;
		const lmin = Math.max(l, .01);
		l *= 2;
		s *= l <= 1 ? l : 2 - l;
		smin *= lmin <= 1 ? lmin : 2 - lmin;
		const v = (l + s) / 2;
		return [
			h,
			(l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s)) * 100,
			v * 100
		];
	};
	convert.hsv.rgb = function(hsv) {
		const h = hsv[0] / 60;
		const s = hsv[1] / 100;
		let v = hsv[2] / 100;
		const hi = Math.floor(h) % 6;
		const f = h - Math.floor(h);
		const p = 255 * v * (1 - s);
		const q = 255 * v * (1 - s * f);
		const t = 255 * v * (1 - s * (1 - f));
		v *= 255;
		switch (hi) {
			case 0: return [
				v,
				t,
				p
			];
			case 1: return [
				q,
				v,
				p
			];
			case 2: return [
				p,
				v,
				t
			];
			case 3: return [
				p,
				q,
				v
			];
			case 4: return [
				t,
				p,
				v
			];
			case 5: return [
				v,
				p,
				q
			];
		}
	};
	convert.hsv.hsl = function(hsv) {
		const h = hsv[0];
		const s = hsv[1] / 100;
		const v = hsv[2] / 100;
		const vmin = Math.max(v, .01);
		let sl;
		let l;
		l = (2 - s) * v;
		const lmin = (2 - s) * vmin;
		sl = s * vmin;
		sl /= lmin <= 1 ? lmin : 2 - lmin;
		sl = sl || 0;
		l /= 2;
		return [
			h,
			sl * 100,
			l * 100
		];
	};
	convert.hwb.rgb = function(hwb) {
		const h = hwb[0] / 360;
		let wh = hwb[1] / 100;
		let bl = hwb[2] / 100;
		const ratio = wh + bl;
		let f;
		if (ratio > 1) {
			wh /= ratio;
			bl /= ratio;
		}
		const i = Math.floor(6 * h);
		const v = 1 - bl;
		f = 6 * h - i;
		if ((i & 1) !== 0) f = 1 - f;
		const n = wh + f * (v - wh);
		let r;
		let g;
		let b;
		switch (i) {
			default:
			case 6:
			case 0:
				r = v;
				g = n;
				b = wh;
				break;
			case 1:
				r = n;
				g = v;
				b = wh;
				break;
			case 2:
				r = wh;
				g = v;
				b = n;
				break;
			case 3:
				r = wh;
				g = n;
				b = v;
				break;
			case 4:
				r = n;
				g = wh;
				b = v;
				break;
			case 5:
				r = v;
				g = wh;
				b = n;
				break;
		}
		return [
			r * 255,
			g * 255,
			b * 255
		];
	};
	convert.cmyk.rgb = function(cmyk) {
		const c = cmyk[0] / 100;
		const m = cmyk[1] / 100;
		const y = cmyk[2] / 100;
		const k = cmyk[3] / 100;
		const r = 1 - Math.min(1, c * (1 - k) + k);
		const g = 1 - Math.min(1, m * (1 - k) + k);
		const b = 1 - Math.min(1, y * (1 - k) + k);
		return [
			r * 255,
			g * 255,
			b * 255
		];
	};
	convert.xyz.rgb = function(xyz) {
		const x = xyz[0] / 100;
		const y = xyz[1] / 100;
		const z = xyz[2] / 100;
		let r;
		let g;
		let b;
		r = x * 3.2406 + y * -1.5372 + z * -.4986;
		g = x * -.9689 + y * 1.8758 + z * .0415;
		b = x * .0557 + y * -.204 + z * 1.057;
		r = r > .0031308 ? 1.055 * r ** (1 / 2.4) - .055 : r * 12.92;
		g = g > .0031308 ? 1.055 * g ** (1 / 2.4) - .055 : g * 12.92;
		b = b > .0031308 ? 1.055 * b ** (1 / 2.4) - .055 : b * 12.92;
		r = Math.min(Math.max(0, r), 1);
		g = Math.min(Math.max(0, g), 1);
		b = Math.min(Math.max(0, b), 1);
		return [
			r * 255,
			g * 255,
			b * 255
		];
	};
	convert.xyz.lab = function(xyz) {
		let x = xyz[0];
		let y = xyz[1];
		let z = xyz[2];
		x /= 95.047;
		y /= 100;
		z /= 108.883;
		x = x > .008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
		y = y > .008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
		z = z > .008856 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
		return [
			116 * y - 16,
			500 * (x - y),
			200 * (y - z)
		];
	};
	convert.lab.xyz = function(lab) {
		const l = lab[0];
		const a = lab[1];
		const b = lab[2];
		let x;
		let y;
		let z;
		y = (l + 16) / 116;
		x = a / 500 + y;
		z = y - b / 200;
		const y2 = y ** 3;
		const x2 = x ** 3;
		const z2 = z ** 3;
		y = y2 > .008856 ? y2 : (y - 16 / 116) / 7.787;
		x = x2 > .008856 ? x2 : (x - 16 / 116) / 7.787;
		z = z2 > .008856 ? z2 : (z - 16 / 116) / 7.787;
		x *= 95.047;
		y *= 100;
		z *= 108.883;
		return [
			x,
			y,
			z
		];
	};
	convert.lab.lch = function(lab) {
		const l = lab[0];
		const a = lab[1];
		const b = lab[2];
		let h;
		h = Math.atan2(b, a) * 360 / 2 / Math.PI;
		if (h < 0) h += 360;
		return [
			l,
			Math.sqrt(a * a + b * b),
			h
		];
	};
	convert.lch.lab = function(lch) {
		const l = lch[0];
		const c = lch[1];
		const hr = lch[2] / 360 * 2 * Math.PI;
		return [
			l,
			c * Math.cos(hr),
			c * Math.sin(hr)
		];
	};
	convert.rgb.ansi16 = function(args, saturation = null) {
		const [r, g, b] = args;
		let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
		value = Math.round(value / 50);
		if (value === 0) return 30;
		let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
		if (value === 2) ansi += 60;
		return ansi;
	};
	convert.hsv.ansi16 = function(args) {
		return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
	};
	convert.rgb.ansi256 = function(args) {
		const r = args[0];
		const g = args[1];
		const b = args[2];
		if (r === g && g === b) {
			if (r < 8) return 16;
			if (r > 248) return 231;
			return Math.round((r - 8) / 247 * 24) + 232;
		}
		return 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
	};
	convert.ansi16.rgb = function(args) {
		let color = args % 10;
		if (color === 0 || color === 7) {
			if (args > 50) color += 3.5;
			color = color / 10.5 * 255;
			return [
				color,
				color,
				color
			];
		}
		const mult = (~~(args > 50) + 1) * .5;
		return [
			(color & 1) * mult * 255,
			(color >> 1 & 1) * mult * 255,
			(color >> 2 & 1) * mult * 255
		];
	};
	convert.ansi256.rgb = function(args) {
		if (args >= 232) {
			const c = (args - 232) * 10 + 8;
			return [
				c,
				c,
				c
			];
		}
		args -= 16;
		let rem;
		return [
			Math.floor(args / 36) / 5 * 255,
			Math.floor((rem = args % 36) / 6) / 5 * 255,
			rem % 6 / 5 * 255
		];
	};
	convert.rgb.hex = function(args) {
		const string = (((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255)).toString(16).toUpperCase();
		return "000000".substring(string.length) + string;
	};
	convert.hex.rgb = function(args) {
		const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
		if (!match) return [
			0,
			0,
			0
		];
		let colorString = match[0];
		if (match[0].length === 3) colorString = colorString.split("").map((char) => {
			return char + char;
		}).join("");
		const integer = parseInt(colorString, 16);
		return [
			integer >> 16 & 255,
			integer >> 8 & 255,
			integer & 255
		];
	};
	convert.rgb.hcg = function(rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const max = Math.max(Math.max(r, g), b);
		const min = Math.min(Math.min(r, g), b);
		const chroma = max - min;
		let grayscale;
		let hue;
		if (chroma < 1) grayscale = min / (1 - chroma);
		else grayscale = 0;
		if (chroma <= 0) hue = 0;
		else if (max === r) hue = (g - b) / chroma % 6;
		else if (max === g) hue = 2 + (b - r) / chroma;
		else hue = 4 + (r - g) / chroma;
		hue /= 6;
		hue %= 1;
		return [
			hue * 360,
			chroma * 100,
			grayscale * 100
		];
	};
	convert.hsl.hcg = function(hsl) {
		const s = hsl[1] / 100;
		const l = hsl[2] / 100;
		const c = l < .5 ? 2 * s * l : 2 * s * (1 - l);
		let f = 0;
		if (c < 1) f = (l - .5 * c) / (1 - c);
		return [
			hsl[0],
			c * 100,
			f * 100
		];
	};
	convert.hsv.hcg = function(hsv) {
		const s = hsv[1] / 100;
		const v = hsv[2] / 100;
		const c = s * v;
		let f = 0;
		if (c < 1) f = (v - c) / (1 - c);
		return [
			hsv[0],
			c * 100,
			f * 100
		];
	};
	convert.hcg.rgb = function(hcg) {
		const h = hcg[0] / 360;
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;
		if (c === 0) return [
			g * 255,
			g * 255,
			g * 255
		];
		const pure = [
			0,
			0,
			0
		];
		const hi = h % 1 * 6;
		const v = hi % 1;
		const w = 1 - v;
		let mg = 0;
		switch (Math.floor(hi)) {
			case 0:
				pure[0] = 1;
				pure[1] = v;
				pure[2] = 0;
				break;
			case 1:
				pure[0] = w;
				pure[1] = 1;
				pure[2] = 0;
				break;
			case 2:
				pure[0] = 0;
				pure[1] = 1;
				pure[2] = v;
				break;
			case 3:
				pure[0] = 0;
				pure[1] = w;
				pure[2] = 1;
				break;
			case 4:
				pure[0] = v;
				pure[1] = 0;
				pure[2] = 1;
				break;
			default:
				pure[0] = 1;
				pure[1] = 0;
				pure[2] = w;
		}
		mg = (1 - c) * g;
		return [
			(c * pure[0] + mg) * 255,
			(c * pure[1] + mg) * 255,
			(c * pure[2] + mg) * 255
		];
	};
	convert.hcg.hsv = function(hcg) {
		const c = hcg[1] / 100;
		const v = c + hcg[2] / 100 * (1 - c);
		let f = 0;
		if (v > 0) f = c / v;
		return [
			hcg[0],
			f * 100,
			v * 100
		];
	};
	convert.hcg.hsl = function(hcg) {
		const c = hcg[1] / 100;
		const l = hcg[2] / 100 * (1 - c) + .5 * c;
		let s = 0;
		if (l > 0 && l < .5) s = c / (2 * l);
		else if (l >= .5 && l < 1) s = c / (2 * (1 - l));
		return [
			hcg[0],
			s * 100,
			l * 100
		];
	};
	convert.hcg.hwb = function(hcg) {
		const c = hcg[1] / 100;
		const v = c + hcg[2] / 100 * (1 - c);
		return [
			hcg[0],
			(v - c) * 100,
			(1 - v) * 100
		];
	};
	convert.hwb.hcg = function(hwb) {
		const w = hwb[1] / 100;
		const v = 1 - hwb[2] / 100;
		const c = v - w;
		let g = 0;
		if (c < 1) g = (v - c) / (1 - c);
		return [
			hwb[0],
			c * 100,
			g * 100
		];
	};
	convert.apple.rgb = function(apple) {
		return [
			apple[0] / 65535 * 255,
			apple[1] / 65535 * 255,
			apple[2] / 65535 * 255
		];
	};
	convert.rgb.apple = function(rgb) {
		return [
			rgb[0] / 255 * 65535,
			rgb[1] / 255 * 65535,
			rgb[2] / 255 * 65535
		];
	};
	convert.gray.rgb = function(args) {
		return [
			args[0] / 100 * 255,
			args[0] / 100 * 255,
			args[0] / 100 * 255
		];
	};
	convert.gray.hsl = function(args) {
		return [
			0,
			0,
			args[0]
		];
	};
	convert.gray.hsv = convert.gray.hsl;
	convert.gray.hwb = function(gray) {
		return [
			0,
			100,
			gray[0]
		];
	};
	convert.gray.cmyk = function(gray) {
		return [
			0,
			0,
			0,
			gray[0]
		];
	};
	convert.gray.lab = function(gray) {
		return [
			gray[0],
			0,
			0
		];
	};
	convert.gray.hex = function(gray) {
		const val = Math.round(gray[0] / 100 * 255) & 255;
		const string = ((val << 16) + (val << 8) + val).toString(16).toUpperCase();
		return "000000".substring(string.length) + string;
	};
	convert.rgb.gray = function(rgb) {
		return [(rgb[0] + rgb[1] + rgb[2]) / 3 / 255 * 100];
	};
}));
//#endregion
//#region node_modules/color-convert/route.js
var require_route = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const conversions = require_conversions();
	function buildGraph() {
		const graph = {};
		const models = Object.keys(conversions);
		for (let len = models.length, i = 0; i < len; i++) graph[models[i]] = {
			distance: -1,
			parent: null
		};
		return graph;
	}
	function deriveBFS(fromModel) {
		const graph = buildGraph();
		const queue = [fromModel];
		graph[fromModel].distance = 0;
		while (queue.length) {
			const current = queue.pop();
			const adjacents = Object.keys(conversions[current]);
			for (let len = adjacents.length, i = 0; i < len; i++) {
				const adjacent = adjacents[i];
				const node = graph[adjacent];
				if (node.distance === -1) {
					node.distance = graph[current].distance + 1;
					node.parent = current;
					queue.unshift(adjacent);
				}
			}
		}
		return graph;
	}
	function link(from, to) {
		return function(args) {
			return to(from(args));
		};
	}
	function wrapConversion(toModel, graph) {
		const path = [graph[toModel].parent, toModel];
		let fn = conversions[graph[toModel].parent][toModel];
		let cur = graph[toModel].parent;
		while (graph[cur].parent) {
			path.unshift(graph[cur].parent);
			fn = link(conversions[graph[cur].parent][cur], fn);
			cur = graph[cur].parent;
		}
		fn.conversion = path;
		return fn;
	}
	module.exports = function(fromModel) {
		const graph = deriveBFS(fromModel);
		const conversion = {};
		const models = Object.keys(graph);
		for (let len = models.length, i = 0; i < len; i++) {
			const toModel = models[i];
			if (graph[toModel].parent === null) continue;
			conversion[toModel] = wrapConversion(toModel, graph);
		}
		return conversion;
	};
}));
//#endregion
//#region node_modules/color-convert/index.js
var require_color_convert = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const conversions = require_conversions();
	const route = require_route();
	const convert = {};
	const models = Object.keys(conversions);
	function wrapRaw(fn) {
		const wrappedFn = function(...args) {
			const arg0 = args[0];
			if (arg0 === void 0 || arg0 === null) return arg0;
			if (arg0.length > 1) args = arg0;
			return fn(args);
		};
		if ("conversion" in fn) wrappedFn.conversion = fn.conversion;
		return wrappedFn;
	}
	function wrapRounded(fn) {
		const wrappedFn = function(...args) {
			const arg0 = args[0];
			if (arg0 === void 0 || arg0 === null) return arg0;
			if (arg0.length > 1) args = arg0;
			const result = fn(args);
			if (typeof result === "object") for (let len = result.length, i = 0; i < len; i++) result[i] = Math.round(result[i]);
			return result;
		};
		if ("conversion" in fn) wrappedFn.conversion = fn.conversion;
		return wrappedFn;
	}
	models.forEach((fromModel) => {
		convert[fromModel] = {};
		Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
		Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
		const routes = route(fromModel);
		Object.keys(routes).forEach((toModel) => {
			const fn = routes[toModel];
			convert[fromModel][toModel] = wrapRounded(fn);
			convert[fromModel][toModel].raw = wrapRaw(fn);
		});
	});
	module.exports = convert;
}));
//#endregion
//#region node_modules/ansi-styles/index.js
var require_ansi_styles = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const wrapAnsi16 = (fn, offset) => (...args) => {
		return `\u001B[${fn(...args) + offset}m`;
	};
	const wrapAnsi256 = (fn, offset) => (...args) => {
		const code = fn(...args);
		return `\u001B[${38 + offset};5;${code}m`;
	};
	const wrapAnsi16m = (fn, offset) => (...args) => {
		const rgb = fn(...args);
		return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
	};
	const ansi2ansi = (n) => n;
	const rgb2rgb = (r, g, b) => [
		r,
		g,
		b
	];
	const setLazyProperty = (object, property, get) => {
		Object.defineProperty(object, property, {
			get: () => {
				const value = get();
				Object.defineProperty(object, property, {
					value,
					enumerable: true,
					configurable: true
				});
				return value;
			},
			enumerable: true,
			configurable: true
		});
	};
	/** @type {typeof import('color-convert')} */
	let colorConvert;
	const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
		if (colorConvert === void 0) colorConvert = require_color_convert();
		const offset = isBackground ? 10 : 0;
		const styles = {};
		for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
			const name = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
			if (sourceSpace === targetSpace) styles[name] = wrap(identity, offset);
			else if (typeof suite === "object") styles[name] = wrap(suite[targetSpace], offset);
		}
		return styles;
	};
	function assembleStyles() {
		const codes = /* @__PURE__ */ new Map();
		const styles = {
			modifier: {
				reset: [0, 0],
				bold: [1, 22],
				dim: [2, 22],
				italic: [3, 23],
				underline: [4, 24],
				inverse: [7, 27],
				hidden: [8, 28],
				strikethrough: [9, 29]
			},
			color: {
				black: [30, 39],
				red: [31, 39],
				green: [32, 39],
				yellow: [33, 39],
				blue: [34, 39],
				magenta: [35, 39],
				cyan: [36, 39],
				white: [37, 39],
				blackBright: [90, 39],
				redBright: [91, 39],
				greenBright: [92, 39],
				yellowBright: [93, 39],
				blueBright: [94, 39],
				magentaBright: [95, 39],
				cyanBright: [96, 39],
				whiteBright: [97, 39]
			},
			bgColor: {
				bgBlack: [40, 49],
				bgRed: [41, 49],
				bgGreen: [42, 49],
				bgYellow: [43, 49],
				bgBlue: [44, 49],
				bgMagenta: [45, 49],
				bgCyan: [46, 49],
				bgWhite: [47, 49],
				bgBlackBright: [100, 49],
				bgRedBright: [101, 49],
				bgGreenBright: [102, 49],
				bgYellowBright: [103, 49],
				bgBlueBright: [104, 49],
				bgMagentaBright: [105, 49],
				bgCyanBright: [106, 49],
				bgWhiteBright: [107, 49]
			}
		};
		styles.color.gray = styles.color.blackBright;
		styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
		styles.color.grey = styles.color.blackBright;
		styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
		for (const [groupName, group] of Object.entries(styles)) {
			for (const [styleName, style] of Object.entries(group)) {
				styles[styleName] = {
					open: `\u001B[${style[0]}m`,
					close: `\u001B[${style[1]}m`
				};
				group[styleName] = styles[styleName];
				codes.set(style[0], style[1]);
			}
			Object.defineProperty(styles, groupName, {
				value: group,
				enumerable: false
			});
		}
		Object.defineProperty(styles, "codes", {
			value: codes,
			enumerable: false
		});
		styles.color.close = "\x1B[39m";
		styles.bgColor.close = "\x1B[49m";
		setLazyProperty(styles.color, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false));
		setLazyProperty(styles.color, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false));
		setLazyProperty(styles.color, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false));
		setLazyProperty(styles.bgColor, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true));
		setLazyProperty(styles.bgColor, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true));
		setLazyProperty(styles.bgColor, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true));
		return styles;
	}
	Object.defineProperty(module, "exports", {
		enumerable: true,
		get: assembleStyles
	});
}));
//#endregion
//#region node_modules/has-flag/index.js
var require_has_flag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = (flag, argv = process.argv) => {
		const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
		const position = argv.indexOf(prefix + flag);
		const terminatorPosition = argv.indexOf("--");
		return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
	};
}));
//#endregion
//#region node_modules/supports-color/index.js
var require_supports_color = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const os$2 = __require("os");
	const tty$1 = __require("tty");
	const hasFlag = require_has_flag();
	const { env } = process;
	let forceColor;
	if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) forceColor = 0;
	else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) forceColor = 1;
	if ("FORCE_COLOR" in env) if (env.FORCE_COLOR === "true") forceColor = 1;
	else if (env.FORCE_COLOR === "false") forceColor = 0;
	else forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	function translateLevel(level) {
		if (level === 0) return false;
		return {
			level,
			hasBasic: true,
			has256: level >= 2,
			has16m: level >= 3
		};
	}
	function supportsColor(haveStream, streamIsTTY) {
		if (forceColor === 0) return 0;
		if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) return 3;
		if (hasFlag("color=256")) return 2;
		if (haveStream && !streamIsTTY && forceColor === void 0) return 0;
		const min = forceColor || 0;
		if (env.TERM === "dumb") return min;
		if (process.platform === "win32") {
			const osRelease = os$2.release().split(".");
			if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) return Number(osRelease[2]) >= 14931 ? 3 : 2;
			return 1;
		}
		if ("CI" in env) {
			if ([
				"TRAVIS",
				"CIRCLECI",
				"APPVEYOR",
				"GITLAB_CI",
				"GITHUB_ACTIONS",
				"BUILDKITE"
			].some((sign) => sign in env) || env.CI_NAME === "codeship") return 1;
			return min;
		}
		if ("TEAMCITY_VERSION" in env) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
		if (env.COLORTERM === "truecolor") return 3;
		if ("TERM_PROGRAM" in env) {
			const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
			switch (env.TERM_PROGRAM) {
				case "iTerm.app": return version >= 3 ? 3 : 2;
				case "Apple_Terminal": return 2;
			}
		}
		if (/-256(color)?$/i.test(env.TERM)) return 2;
		if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) return 1;
		if ("COLORTERM" in env) return 1;
		return min;
	}
	function getSupportLevel(stream) {
		return translateLevel(supportsColor(stream, stream && stream.isTTY));
	}
	module.exports = {
		supportsColor: getSupportLevel,
		stdout: translateLevel(supportsColor(true, tty$1.isatty(1))),
		stderr: translateLevel(supportsColor(true, tty$1.isatty(2)))
	};
}));
//#endregion
//#region node_modules/chalk/source/util.js
var require_util = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const stringReplaceAll = (string, substring, replacer) => {
		let index = string.indexOf(substring);
		if (index === -1) return string;
		const substringLength = substring.length;
		let endIndex = 0;
		let returnValue = "";
		do {
			returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
			endIndex = index + substringLength;
			index = string.indexOf(substring, endIndex);
		} while (index !== -1);
		returnValue += string.substr(endIndex);
		return returnValue;
	};
	const stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
		let endIndex = 0;
		let returnValue = "";
		do {
			const gotCR = string[index - 1] === "\r";
			returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
			endIndex = index + 1;
			index = string.indexOf("\n", endIndex);
		} while (index !== -1);
		returnValue += string.substr(endIndex);
		return returnValue;
	};
	module.exports = {
		stringReplaceAll,
		stringEncaseCRLFWithFirstIndex
	};
}));
//#endregion
//#region node_modules/chalk/source/templates.js
var require_templates = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
	const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
	const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
	const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;
	const ESCAPES = new Map([
		["n", "\n"],
		["r", "\r"],
		["t", "	"],
		["b", "\b"],
		["f", "\f"],
		["v", "\v"],
		["0", "\0"],
		["\\", "\\"],
		["e", "\x1B"],
		["a", "\x07"]
	]);
	function unescape(c) {
		const u = c[0] === "u";
		const bracket = c[1] === "{";
		if (u && !bracket && c.length === 5 || c[0] === "x" && c.length === 3) return String.fromCharCode(parseInt(c.slice(1), 16));
		if (u && bracket) return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
		return ESCAPES.get(c) || c;
	}
	function parseArguments(name, arguments_) {
		const results = [];
		const chunks = arguments_.trim().split(/\s*,\s*/g);
		let matches;
		for (const chunk of chunks) {
			const number = Number(chunk);
			if (!Number.isNaN(number)) results.push(number);
			else if (matches = chunk.match(STRING_REGEX)) results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
			else throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
		}
		return results;
	}
	function parseStyle(style) {
		STYLE_REGEX.lastIndex = 0;
		const results = [];
		let matches;
		while ((matches = STYLE_REGEX.exec(style)) !== null) {
			const name = matches[1];
			if (matches[2]) {
				const args = parseArguments(name, matches[2]);
				results.push([name].concat(args));
			} else results.push([name]);
		}
		return results;
	}
	function buildStyle(chalk, styles) {
		const enabled = {};
		for (const layer of styles) for (const style of layer.styles) enabled[style[0]] = layer.inverse ? null : style.slice(1);
		let current = chalk;
		for (const [styleName, styles] of Object.entries(enabled)) {
			if (!Array.isArray(styles)) continue;
			if (!(styleName in current)) throw new Error(`Unknown Chalk style: ${styleName}`);
			current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
		}
		return current;
	}
	module.exports = (chalk, temporary) => {
		const styles = [];
		const chunks = [];
		let chunk = [];
		temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
			if (escapeCharacter) chunk.push(unescape(escapeCharacter));
			else if (style) {
				const string = chunk.join("");
				chunk = [];
				chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
				styles.push({
					inverse,
					styles: parseStyle(style)
				});
			} else if (close) {
				if (styles.length === 0) throw new Error("Found extraneous } in Chalk template literal");
				chunks.push(buildStyle(chalk, styles)(chunk.join("")));
				chunk = [];
				styles.pop();
			} else chunk.push(character);
		});
		chunks.push(chunk.join(""));
		if (styles.length > 0) {
			const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? "" : "s"} (\`}\`)`;
			throw new Error(errMessage);
		}
		return chunks.join("");
	};
}));
//#endregion
//#region node_modules/chalk-template/index.js
var import_source = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	const ansiStyles = require_ansi_styles();
	const { stdout: stdoutColor, stderr: stderrColor } = require_supports_color();
	const { stringReplaceAll, stringEncaseCRLFWithFirstIndex } = require_util();
	const { isArray } = Array;
	const levelMapping = [
		"ansi",
		"ansi",
		"ansi256",
		"ansi16m"
	];
	const styles = Object.create(null);
	const applyOptions = (object, options = {}) => {
		if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) throw new Error("The `level` option should be an integer from 0 to 3");
		const colorLevel = stdoutColor ? stdoutColor.level : 0;
		object.level = options.level === void 0 ? colorLevel : options.level;
	};
	var ChalkClass = class {
		constructor(options) {
			return chalkFactory(options);
		}
	};
	const chalkFactory = (options) => {
		const chalk = {};
		applyOptions(chalk, options);
		chalk.template = (...arguments_) => chalkTag(chalk.template, ...arguments_);
		Object.setPrototypeOf(chalk, Chalk.prototype);
		Object.setPrototypeOf(chalk.template, chalk);
		chalk.template.constructor = () => {
			throw new Error("`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.");
		};
		chalk.template.Instance = ChalkClass;
		return chalk.template;
	};
	function Chalk(options) {
		return chalkFactory(options);
	}
	for (const [styleName, style] of Object.entries(ansiStyles)) styles[styleName] = { get() {
		const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
		Object.defineProperty(this, styleName, { value: builder });
		return builder;
	} };
	styles.visible = { get() {
		const builder = createBuilder(this, this._styler, true);
		Object.defineProperty(this, "visible", { value: builder });
		return builder;
	} };
	const usedModels = [
		"rgb",
		"hex",
		"keyword",
		"hsl",
		"hsv",
		"hwb",
		"ansi",
		"ansi256"
	];
	for (const model of usedModels) styles[model] = { get() {
		const { level } = this;
		return function(...arguments_) {
			const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
			return createBuilder(this, styler, this._isEmpty);
		};
	} };
	for (const model of usedModels) {
		const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
		styles[bgModel] = { get() {
			const { level } = this;
			return function(...arguments_) {
				const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		} };
	}
	const proto = Object.defineProperties(() => {}, {
		...styles,
		level: {
			enumerable: true,
			get() {
				return this._generator.level;
			},
			set(level) {
				this._generator.level = level;
			}
		}
	});
	const createStyler = (open, close, parent) => {
		let openAll;
		let closeAll;
		if (parent === void 0) {
			openAll = open;
			closeAll = close;
		} else {
			openAll = parent.openAll + open;
			closeAll = close + parent.closeAll;
		}
		return {
			open,
			close,
			openAll,
			closeAll,
			parent
		};
	};
	const createBuilder = (self, _styler, _isEmpty) => {
		const builder = (...arguments_) => {
			if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) return applyStyle(builder, chalkTag(builder, ...arguments_));
			return applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
		};
		Object.setPrototypeOf(builder, proto);
		builder._generator = self;
		builder._styler = _styler;
		builder._isEmpty = _isEmpty;
		return builder;
	};
	const applyStyle = (self, string) => {
		if (self.level <= 0 || !string) return self._isEmpty ? "" : string;
		let styler = self._styler;
		if (styler === void 0) return string;
		const { openAll, closeAll } = styler;
		if (string.indexOf("\x1B") !== -1) while (styler !== void 0) {
			string = stringReplaceAll(string, styler.close, styler.open);
			styler = styler.parent;
		}
		const lfIndex = string.indexOf("\n");
		if (lfIndex !== -1) string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
		return openAll + string + closeAll;
	};
	let template;
	const chalkTag = (chalk, ...strings) => {
		const [firstString] = strings;
		if (!isArray(firstString) || !isArray(firstString.raw)) return strings.join(" ");
		const arguments_ = strings.slice(1);
		const parts = [firstString.raw[0]];
		for (let i = 1; i < firstString.length; i++) parts.push(String(arguments_[i - 1]).replace(/[{}\\]/g, "\\$&"), String(firstString.raw[i]));
		if (template === void 0) template = require_templates();
		return template(chalk, parts.join(""));
	};
	Object.defineProperties(Chalk.prototype, styles);
	const chalk = Chalk();
	chalk.supportsColor = stdoutColor;
	chalk.stderr = Chalk({ level: stderrColor ? stderrColor.level : 0 });
	chalk.stderr.supportsColor = stderrColor;
	module.exports = chalk;
})))(), 1);
const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.))|(?:{(~)?(#?[\w:]+(?:\([^)]*\))?(?:\.#?[\w:]+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(?:(?:(\w+)(?:\(([^)]*)\))?)|(?:#(?=[:a-fA-F\d]{2,})([a-fA-F\d]{6})?(?::([a-fA-F\d]{6}))?))/g;
const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
const ESCAPE_REGEX$1 = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;
const ESCAPES = new Map([
	["n", "\n"],
	["r", "\r"],
	["t", "	"],
	["b", "\b"],
	["f", "\f"],
	["v", "\v"],
	["0", "\0"],
	["\\", "\\"],
	["e", "\x1B"],
	["a", "\x07"]
]);
function unescape$1(c) {
	const u = c[0] === "u";
	const bracket = c[1] === "{";
	if (u && !bracket && c.length === 5 || c[0] === "x" && c.length === 3) return String.fromCharCode(Number.parseInt(c.slice(1), 16));
	if (u && bracket) return String.fromCodePoint(Number.parseInt(c.slice(2, -1), 16));
	return ESCAPES.get(c) || c;
}
function parseArguments$1(name, arguments_) {
	const results = [];
	const chunks = arguments_.trim().split(/\s*,\s*/g);
	let matches;
	for (const chunk of chunks) {
		const number = Number(chunk);
		if (!Number.isNaN(number)) results.push(number);
		else if (matches = chunk.match(STRING_REGEX)) results.push(matches[2].replace(ESCAPE_REGEX$1, (_, escape, character) => escape ? unescape$1(escape) : character));
		else throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
	}
	return results;
}
function parseHex(hex) {
	const n = Number.parseInt(hex, 16);
	return [
		n >> 16 & 255,
		n >> 8 & 255,
		n & 255
	];
}
function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;
	const results = [];
	let matches;
	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		const name = matches[1];
		if (matches[2]) results.push([name, ...parseArguments$1(name, matches[2])]);
		else if (matches[3] || matches[4]) {
			if (matches[3]) results.push(["rgb", ...parseHex(matches[3])]);
			if (matches[4]) results.push(["bgRgb", ...parseHex(matches[4])]);
		} else results.push([name]);
	}
	return results;
}
function buildStyle(styles) {
	const enabled = {};
	for (const layer of styles) for (const style of layer.styles) enabled[style[0]] = layer.inverse ? null : style.slice(1);
	let current = import_source.default;
	for (const [styleName, styles] of Object.entries(enabled)) {
		if (!Array.isArray(styles)) continue;
		if (!(styleName in current)) throw new Error(`Unknown Chalk style: ${styleName}`);
		current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
	}
	return current;
}
function template(string) {
	const styles = [];
	const chunks = [];
	let chunk = [];
	string.replace(TEMPLATE_REGEX, (_, escapeCharacter, inverse, style, close, character) => {
		if (escapeCharacter) chunk.push(unescape$1(escapeCharacter));
		else if (style) {
			const string = chunk.join("");
			chunk = [];
			chunks.push(styles.length === 0 ? string : buildStyle(styles)(string));
			styles.push({
				inverse,
				styles: parseStyle(style)
			});
		} else if (close) {
			if (styles.length === 0) throw new Error("Found extraneous } in Chalk template literal");
			chunks.push(buildStyle(styles)(chunk.join("")));
			chunk = [];
			styles.pop();
		} else chunk.push(character);
	});
	chunks.push(chunk.join(""));
	if (styles.length > 0) throw new Error(`Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? "" : "s"} (\`}\`)`);
	return chunks.join("");
}
function chalkTemplate(firstString, ...arguments_) {
	if (!Array.isArray(firstString) || !Array.isArray(firstString.raw)) throw new TypeError("A tagged template literal must be provided");
	const parts = [firstString.raw[0]];
	for (let index = 1; index < firstString.raw.length; index++) parts.push(String(arguments_[index - 1]).replace(/[{}\\]/g, "\\$&"), String(firstString.raw[index]));
	return template(parts.join(""));
}
//#endregion
//#region node_modules/command-line-usage/lib/chalk-format.js
function chalkFormat(str) {
	if (str) {
		str = str.replace(/`/g, "\\`");
		return chalkTemplate(Object.assign([], { raw: [str] }));
	} else return "";
}
//#endregion
//#region node_modules/command-line-usage/lib/section.js
var Section = class {
	constructor() {
		this.lines = [];
	}
	add(lines) {
		if (lines) arrayify(lines).forEach((line) => this.lines.push(line));
		else this.lines.push("");
	}
	toString() {
		return this.lines.join(os$1.EOL);
	}
	header(text) {
		if (text) {
			this.add(chalkFormat(`{bold ${text}}`));
			this.add();
		}
	}
};
//#endregion
//#region node_modules/table-layout/lib/cell.js
const _value = /* @__PURE__ */ new WeakMap();
const _column = /* @__PURE__ */ new WeakMap();
var Cell = class {
	constructor(value, column) {
		this.value = value;
		_column.set(this, column);
	}
	set value(val) {
		_value.set(this, val);
	}
	/**
	* Must return a string or object with a `.toString()` method.
	* @returns {string}
	*/
	get value() {
		let cellValue = _value.get(this);
		const column = _column.get(this);
		if (column.get) cellValue = column.get(cellValue);
		if (cellValue === void 0) cellValue = "";
		else cellValue = String(cellValue);
		return cellValue;
	}
};
//#endregion
//#region node_modules/table-layout/lib/rows.js
/**
* @module rows
*/
/**
≈ Each row is a map of column/cell pairs.
*/
var Rows = class {
	constructor(rows, columns) {
		this.list = [];
		this.load(rows, columns);
	}
	load(rows, columns) {
		for (const row of arrayify(rows)) {
			const map = new Map(columns.list.map((column) => [column, new Cell(row[column.name], column)]));
			this.list.push(map);
		}
	}
};
//#endregion
//#region node_modules/table-layout/lib/padding.js
/**
* @module padding
*/
var Padding = class {
	constructor(padding) {
		this.left = padding.left;
		this.right = padding.right;
	}
	length() {
		return this.left.length + this.right.length;
	}
};
//#endregion
//#region node_modules/table-layout/lib/column.js
/**
* @module column
*/
const _padding = /* @__PURE__ */ new WeakMap();
/**
* Represents the configuration and generatedWidth for a table column.
*/
var Column = class {
	constructor(column = {}) {
		this.name = column.name;
		this.width = column.width;
		this.maxWidth = column.maxWidth;
		this.minWidth = column.minWidth;
		this.noWrap = column.noWrap;
		this.break = column.break;
		this.contentWrappable = column.contentWrappable;
		this.contentWidth = column.contentWidth;
		this.minContentWidth = column.minContentWidth;
		this.padding = column.padding || {
			left: " ",
			right: " "
		};
		this.generatedWidth = null;
	}
	set padding(padding) {
		_padding.set(this, new Padding(padding));
	}
	get padding() {
		return _padding.get(this);
	}
	/**
	* The width of the content (excluding padding) after being wrapped
	*/
	get wrappedContentWidth() {
		return Math.max(this.generatedWidth - this.padding.length(), 0);
	}
	isResizable() {
		return !this.isFixed();
	}
	isFixed() {
		return this.width !== void 0 || this.noWrap || !this.contentWrappable;
	}
	generateWidth() {
		this.generatedWidth = this.width || this.contentWidth + this.padding.length();
	}
	generateMinWidth() {
		this.minWidth = this.minContentWidth + this.padding.length();
	}
};
//#endregion
//#region node_modules/table-layout/lib/columns.js
const _maxWidth = /* @__PURE__ */ new WeakMap();
/**
* @module columns
*/
var Columns = class Columns {
	constructor(columns) {
		this.list = [];
		for (const column of arrayify(columns)) this.add(column);
	}
	/**
	* sum of all generatedWidth fields
	* @return {number}
	*/
	totalWidth() {
		return this.list.length ? this.list.map((col) => col.generatedWidth).reduce((a, b) => a + b) : 0;
	}
	totalFixedWidth() {
		return this.getFixed().map((col) => col.generatedWidth).reduce((a, b) => a + b, 0);
	}
	get(columnName) {
		return this.list.find((column) => column.name === columnName);
	}
	getResizable() {
		return this.list.filter((column) => column.isResizable());
	}
	getFixed() {
		return this.list.filter((column) => column.isFixed());
	}
	add(column) {
		const col = column instanceof Column ? column : new Column(column);
		this.list.push(col);
		return col;
	}
	get maxWidth() {
		_maxWidth.get(this);
	}
	set maxWidth(val) {
		_maxWidth.set(this, val);
	}
	/**
	* sets `generatedWidth` for each column
	* @chainable
	*/
	autoSize() {
		const maxWidth = _maxWidth.get(this);
		for (const column of this.list) {
			column.generateWidth();
			column.generateMinWidth();
		}
		for (const column of this.list) {
			if (column.maxWidth !== void 0 && column.generatedWidth > column.maxWidth) column.generatedWidth = column.maxWidth;
			if (column.minWidth !== void 0 && column.generatedWidth < column.minWidth) column.generatedWidth = column.minWidth;
		}
		const width = {
			total: this.totalWidth(),
			view: maxWidth,
			diff: this.totalWidth() - maxWidth,
			totalFixed: this.totalFixedWidth(),
			totalResizable: Math.max(maxWidth - this.totalFixedWidth(), 0)
		};
		if (width.diff > 0) {
			const resizableColumns = this.getResizable();
			for (const column of resizableColumns) column.generatedWidth = Math.floor(width.totalResizable / resizableColumns.length);
			const grownColumns = this.list.filter((column) => column.generatedWidth > column.contentWidth);
			const shrunkenColumns = this.list.filter((column) => column.generatedWidth < column.contentWidth);
			let salvagedSpace = 0;
			for (const column of grownColumns) {
				const currentGeneratedWidth = column.generatedWidth;
				column.generateWidth();
				salvagedSpace += currentGeneratedWidth - column.generatedWidth;
			}
			for (const column of shrunkenColumns) column.generatedWidth += Math.floor(salvagedSpace / shrunkenColumns.length);
		}
		return this;
	}
	/**
	* Factory method returning all distinct columns from input
	* @param  {object[]} - input recordset
	* @return {module:columns}
	*/
	static getColumns(rows) {
		const columns = new Columns();
		for (const row of arrayify(rows)) for (const columnName in row) {
			let column = columns.get(columnName);
			if (!column) column = columns.add({
				name: columnName,
				contentWidth: 0,
				minContentWidth: 0
			});
		}
		return columns;
	}
};
//#endregion
//#region node_modules/wordwrapjs/index.js
/**
* @module wordwrapjs
*/
/**
* Wordwrap options.
* @typedef {Object} WordwrapOptions
* @property {number} [width=30] - The max column width in characters.
* @property {boolean} [break=false] - If true, words exceeding the specified `width` will be forcefully broken
* @property {boolean} [noTrim=false] - By default, each line output is trimmed. If `noTrim` is set, no line-trimming occurs - all whitespace from the input text is left in.
* @property {string} [eol='\n'] - The end of line character to use. Defaults to `\n`.
*/
const re = {
	chunk: /[^\s-]+?-\b|\S+|\s+|\r\n?|\n/g,
	ansiEscapeSequence: /\u001b.*?m/g
};
const EMPTY_LINE = Symbol("emptyLine");
/**
* @alias module:wordwrapjs
* @typicalname wordwrap
*/
var Wordwrap = class {
	/**
	* @param {string} text - The input text to wrap.
	* @param {module:wordwrapjs~WordwrapOptions} [options]
	*/
	constructor(text = "", options = {}) {
		this._lines = String(text).split(/\r\n|\n/g);
		this.options = {
			eol: "\n",
			width: 30,
			...options
		};
	}
	lines() {
		return this._lines.map(trimLine, this).map((line) => {
			const chunks = line.match(re.chunk);
			return chunks && chunks.length ? chunks : [EMPTY_LINE];
		}).map((lineWords) => this.options.break ? lineWords.map(breakWord, this) : lineWords).map((lineWords) => lineWords.flat()).map((lineWords) => {
			if (lineWords.length === 1 && lineWords[0] === EMPTY_LINE) return lineWords;
			return lineWords.reduce((lines, word) => {
				const currentLine = lines[lines.length - 1];
				if (replaceAnsi(word).length + replaceAnsi(currentLine).length > this.options.width) lines.push(word);
				else lines[lines.length - 1] += word;
				return lines;
			}, [""]);
		}).flat().map((line) => line === EMPTY_LINE ? "" : trimLine.call(this, line)).filter((line, idx) => {
			return line !== "" || this._lines[idx] === "" || typeof this._lines[idx] !== "undefined" && this._lines[idx].match(/^\s*$/);
		});
	}
	wrap() {
		return this.lines().join(this.options.eol);
	}
	toString() {
		return this.wrap();
	}
	/**
	* @param {string} text - the input text to wrap
	* @param {module:wordwrapjs~WordwrapOptions} [options]
	*/
	static wrap(text, options) {
		return new this(text, options).wrap();
	}
	/**
	* Wraps the input text, returning an array of strings (lines).
	* @param {string} text - input text
	* @param {module:wordwrapjs~WordwrapOptions} [options]
	*/
	static lines(text, options) {
		return new this(text, options).lines();
	}
	/**
	* Returns true if the input text would be wrapped if passed into `.wrap()`.
	* @param {string} text - input text
	* @return {boolean}
	*/
	static isWrappable(text = "") {
		const matches = String(text).match(re.chunk);
		return matches ? matches.length > 1 : false;
	}
	/**
	* Splits the input text into an array of words and whitespace.
	* @param {string} text - input text
	* @returns {string[]}
	*/
	static getChunks(text) {
		return text.match(re.chunk) || [];
	}
};
function trimLine(line) {
	return this.options.noTrim ? line : line.trim();
}
function replaceAnsi(string) {
	return string.replace(re.ansiEscapeSequence, "");
}
/**
* break a word into several pieces
* @param {string} word
* @private
*/
function breakWord(word) {
	if (word === EMPTY_LINE) return word;
	if (replaceAnsi(word).length > this.options.width) {
		const letters = word.split("");
		let piece;
		const pieces = [];
		while ((piece = letters.splice(0, this.options.width)).length) pieces.push(piece.join(""));
		return pieces;
	} else return word;
}
//#endregion
//#region node_modules/table-layout/lib/ansi.js
/**
* @module ansi
*/
const ansiEscapeSequence = /\u001b.*?m/g;
function remove(input) {
	return input.replace(ansiEscapeSequence, "");
}
function has$1(input) {
	return ansiEscapeSequence.test(input);
}
//#endregion
//#region node_modules/table-layout/lib/util.js
/**
* Array of arrays in.. Returns the length of the longest one
* @returns {number}
* @private
*/
function getLongestArray(arrays) {
	const lengths = arrays.map((array) => array.length);
	return Math.max(...lengths);
}
function padCell(cellValue, padding, width) {
	const ansiLength = cellValue.length - remove(cellValue).length;
	cellValue = cellValue || "";
	return (padding.left || "") + cellValue.padEnd(width - padding.length() + ansiLength) + (padding.right || "");
}
function getLongestWord(line) {
	return Wordwrap.getChunks(line).reduce((max, word) => Math.max(word.length, max), 0);
}
function removeEmptyColumns(data) {
	const emptyColumns = data.reduce((columnNames, row) => {
		for (const key of Object.keys(row)) if (!columnNames.includes(key)) columnNames.push(key);
		return columnNames;
	}, []).filter((columnName) => {
		return !data.some((row) => {
			const value = row[columnName];
			return value !== void 0 && typeof value !== "string" || typeof value === "string" && /\S+/.test(value);
		});
	});
	return data.map((row) => {
		for (const emptyCol of emptyColumns) delete row[emptyCol];
		return row;
	});
}
function applyDefaultValues(options = {}, defaults = {}) {
	const result = Object.assign({}, options);
	if (typeof result.padding === "object") {
		if (result.padding.left === void 0) result.padding.left = defaults.padding.left;
		if (result.padding.right === void 0) result.padding.right = defaults.padding.right;
	} else result.padding = defaults.padding;
	if (result.maxWidth === void 0) result.maxWidth = defaults.maxWidth;
	if (result.columns === void 0) result.columns = defaults.columns;
	if (result.eol === void 0) result.eol = defaults.eol;
	return result;
}
//#endregion
//#region node_modules/table-layout/index.js
/**
* @module table-layout
*/
/**
* Recordset data in (array of objects), text table out.
* @alias module:table-layout
*/
var Table = class {
	/**
	* @param {object[]} - input data
	* @param [options] {object} - optional settings
	* @param [options.maxWidth] {number} - maximum width of layout
	* @param [options.noWrap] {boolean} - disable wrapping on all columns
	* @param [options.noTrim] {boolean} - disable line-trimming
	* @param [options.break] {boolean} - enable word-breaking on all columns
	* @param [options.columns] {module:table-layout~columnOption} - array of column-specific options
	* @param [options.ignoreEmptyColumns] {boolean} - If set, empty columns or columns containing only whitespace are not rendered.
	* @param [options.padding] {object} - Padding values to set on each column. Per-column overrides can be set in the `options.columns` array.
	* @param [options.padding.left] {string} - Defaults to a single space.
	* @param [options.padding.right] {string} - Defaults to a single space.
	* @param [options.eol] {string} - EOL character used. Defaults to `\n`.
	* @alias module:table-layout
	*/
	constructor(data, options = {}) {
		const defaults = {
			padding: {
				left: " ",
				right: " "
			},
			maxWidth: 80,
			columns: [],
			eol: "\n"
		};
		this.options = applyDefaultValues(options, defaults);
		this.rows = null;
		this.columns = null;
		this.load(data);
	}
	/**
	* Set the input data to display. Must be an array of objects.
	* @param data {object[]}
	*/
	load(data) {
		const options = this.options;
		if (options.ignoreEmptyColumns) data = removeEmptyColumns(data);
		this.columns = Columns.getColumns(data);
		this.columns.maxWidth = options.maxWidth;
		for (const column of this.columns.list) {
			column.padding = options.padding;
			column.noWrap = options.noWrap;
			column.break = options.break;
			if (options.break) column.contentWrappable = true;
		}
		for (const optionColumn of options.columns) {
			const column = this.columns.get(optionColumn.name);
			if (column) {
				if (optionColumn.padding) {
					column.padding.left = optionColumn.padding.left;
					column.padding.right = optionColumn.padding.right;
				}
				column.width = optionColumn.width;
				column.maxWidth = optionColumn.maxWidth;
				column.minWidth = optionColumn.minWidth;
				column.noWrap = optionColumn.noWrap;
				column.break = optionColumn.break;
				if (optionColumn.break) column.contentWrappable = true;
				column.get = optionColumn.get;
			}
		}
		for (const row of arrayify(data)) for (const columnName in row) {
			const column = this.columns.get(columnName);
			let cellValue = new Cell(row[columnName], column).value;
			if (has$1(cellValue)) cellValue = remove(cellValue);
			if (cellValue.length > column.contentWidth) column.contentWidth = cellValue.length;
			const longestWord = getLongestWord(cellValue);
			if (longestWord > column.minContentWidth) column.minContentWidth = longestWord;
			if (!column.contentWrappable) column.contentWrappable = Wordwrap.isWrappable(cellValue);
		}
		this.columns.autoSize();
		this.rows = new Rows(data, this.columns);
		return this;
	}
	getWrapped() {
		this.columns.autoSize();
		return this.rows.list.map((row) => {
			const line = [];
			for (const [column, cell] of row.entries()) if (column.noWrap) line.push(cell.value.split(/\r\n?|\n/));
			else line.push(Wordwrap.lines(cell.value, {
				width: column.wrappedContentWidth,
				break: column.break,
				noTrim: this.options.noTrim
			}));
			return line;
		});
	}
	getLines() {
		const wrappedLines = this.getWrapped();
		const lines = [];
		wrappedLines.forEach((wrapped) => {
			const mostLines = getLongestArray(wrapped);
			for (let i = 0; i < mostLines; i++) {
				const line = [];
				wrapped.forEach((cell) => {
					line.push(cell[i] || "");
				});
				lines.push(line);
			}
		});
		return lines;
	}
	/**
	* Identical to `.toString()` with the exception that the result will be an array of lines, rather than a single, multi-line string.
	* @returns {string[]}
	*/
	renderLines() {
		return this.getLines().map((line) => {
			return line.reduce((prev, cell, index) => {
				const column = this.columns.list[index];
				return prev + padCell(cell, column.padding, column.generatedWidth);
			}, "");
		});
	}
	/**
	* Returns the input data as a text table.
	* @returns {string}
	*/
	toString() {
		return this.renderLines().join(this.options.eol) + this.options.eol;
	}
};
//#endregion
//#region node_modules/command-line-usage/lib/section/option-list.js
var OptionList = class extends Section {
	constructor(data) {
		super();
		let definitions = arrayify(data.optionList);
		const hide = arrayify(data.hide);
		const groups = arrayify(data.group);
		if (hide.length) definitions = definitions.filter((definition) => {
			return hide.indexOf(definition.name) === -1;
		});
		if (data.header) this.header(data.header);
		if (groups.length) definitions = definitions.filter((def) => {
			const noGroupMatch = groups.indexOf("_none") > -1 && def.group === void 0;
			const groupMatch = intersect(arrayify(def.group), groups);
			return noGroupMatch || groupMatch ? def : void 0;
		});
		const table = new Table(definitions.map((def) => {
			return {
				option: getOptionNames(def, data.reverseNameOrder),
				description: chalkFormat(def.description)
			};
		}), data.tableOptions || {
			padding: {
				left: "  ",
				right: " "
			},
			columns: [{
				name: "option",
				noWrap: true
			}, {
				name: "description",
				maxWidth: 80
			}]
		});
		this.add(table.renderLines());
		this.add();
	}
};
function getOptionNames(definition, reverseNameOrder) {
	let type = definition.type ? definition.type.name.toLowerCase() : "string";
	const multiple = definition.multiple || definition.lazyMultiple ? "[]" : "";
	if (type) type = type === "boolean" ? "" : `{underline ${type}${multiple}}`;
	type = chalkFormat(definition.typeLabel || type);
	let result = "";
	if (definition.alias) if (definition.name) if (reverseNameOrder) result = chalkFormat(`{bold --${definition.name}}, {bold -${definition.alias}} ${type}`);
	else result = chalkFormat(`{bold -${definition.alias}}, {bold --${definition.name}} ${type}`);
	else if (reverseNameOrder) result = chalkFormat(`{bold -${definition.alias}} ${type}`);
	else result = chalkFormat(`{bold -${definition.alias}} ${type}`);
	else result = chalkFormat(`{bold --${definition.name}} ${type}`);
	return result;
}
function intersect(arr1, arr2) {
	return arr1.some(function(item1) {
		return arr2.some(function(item2) {
			return item1 === item2;
		});
	});
}
/**
* An OptionList section adds a table displaying the supplied option definitions.
* @typedef module:command-line-usage~optionList
* @property {string} [header] - The section header, always bold and underlined.
* @property optionList {OptionDefinition[]} - An array of [option definition](https://github.com/75lb/command-line-args/blob/master/doc/option-definition.md) objects. In addition to the regular definition properties, command-line-usage will look for:
*
* - `description` - a string describing the option.
* - `typeLabel` - a string to replace the default type string (e.g. `<string>`). It's often more useful to set a more descriptive type label, like `<ms>`, `<files>`, `<command>` etc.
* @property {string|string[]} [group] - If specified, only options from this particular group will be printed. [Example](https://github.com/75lb/command-line-usage/blob/master/example/groups.js).
* @property {string|string[]} [hide] - The names of one of more option definitions to hide from the option list. [Example](https://github.com/75lb/command-line-usage/blob/master/example/hide.js).
* @property {boolean} [reverseNameOrder] - If true, the option alias will be displayed after the name, i.e. `--verbose, -v` instead of `-v, --verbose`).
* @property {object} [tableOptions] - An options object suitable for passing into [table-layout](https://github.com/75lb/table-layout#table-). See [here for an example](https://github.com/75lb/command-line-usage/blob/master/example/option-list-options.js).
*
* @example
* {
*   header: 'Options',
*   optionList: [
*     {
*       name: 'help',
*       alias: 'h',
*       description: 'Display this usage guide.'
*     },
*     {
*       name: 'src',
*       description: 'The input files to process',
*       multiple: true,
*       defaultOption: true,
*       typeLabel: '{underline file} ...'
*     },
*     {
*       name: 'timeout',
*       description: 'Timeout value in ms.',
*       alias: 't',
*       typeLabel: '{underline ms}'
*     }
*   ]
* }
*/
//#endregion
//#region node_modules/command-line-usage/lib/section/content.js
var ContentSection = class extends Section {
	constructor(section) {
		super();
		this.header(section.header);
		if (section.content) {
			if (section.raw) {
				const content = arrayify(section.content).map((line) => chalkFormat(line));
				this.add(content);
			} else this.add(getContentLines(section.content));
			this.add();
		}
	}
};
function getContentLines(content) {
	const defaultPadding = {
		left: "  ",
		right: " "
	};
	if (content) if (typical_default.isString(content)) return new Table({ column: chalkFormat(content) }, {
		padding: defaultPadding,
		maxWidth: 80
	}).renderLines();
	else if (Array.isArray(content) && content.every(typical_default.isString)) return new Table(content.map((string) => ({ column: chalkFormat(string) })), {
		padding: defaultPadding,
		maxWidth: 80
	}).renderLines();
	else if (Array.isArray(content) && content.every(typical_default.isPlainObject)) return new Table(content.map((row) => ansiFormatRow(row)), { padding: defaultPadding }).renderLines();
	else if (typical_default.isPlainObject(content)) {
		if (!content.options || !content.data) throw new Error("must have an \"options\" or \"data\" property\n" + JSON.stringify(content));
		const options = Object.assign({ padding: defaultPadding }, content.options);
		if (options.columns) options.columns = options.columns.map((column) => {
			if (column.nowrap) {
				column.noWrap = column.nowrap;
				delete column.nowrap;
			}
			return column;
		});
		return new Table(content.data.map((row) => ansiFormatRow(row)), options).renderLines();
	} else {
		const message = `invalid input - 'content' must be a string, array of strings, or array of plain objects:\n\n${JSON.stringify(content)}`;
		throw new Error(message);
	}
}
function ansiFormatRow(row) {
	for (const key in row) row[key] = chalkFormat(row[key]);
	return row;
}
/**
* A Content section comprises a header and one or more lines of content.
* @typedef module:command-line-usage~content
* @property header {string} - The section header, always bold and underlined.
* @property content {string|string[]|object[]} - Overloaded property, accepting data in one of four formats:
*
* 1. A single string (one line of text)
* 2. An array of strings (multiple lines of text)
* 3. An array of objects (recordset-style data). In this case, the data will be rendered in table format. The property names of each object are not important, so long as they are consistent throughout the array.
* 4. An object with two properties - `data` and `options`. In this case, the data and options will be passed directly to the underlying [table layout](https://github.com/75lb/table-layout) module for rendering.
*
* @property raw {boolean} - Set to true to avoid indentation and wrapping. Useful for banners.
* @example
* Simple string of content. For ansi formatting, use [chalk template literal syntax](https://github.com/chalk/chalk#tagged-template-literal).
* ```js
* {
*   header: 'A typical app',
*   content: 'Generates something {rgb(255,200,0).italic very {underline.bgRed important}}.'
* }
* ```
*
* An array of strings is interpreted as lines, to be joined by the system newline character.
* ```js
* {
*   header: 'A typical app',
*   content: [
*     'First line.',
*     'Second line.'
*   ]
* }
* ```
*
* An array of recordset-style objects are rendered in table layout.
* ```js
* {
*   header: 'A typical app',
*   content: [
*     { colA: 'First row, first column.', colB: 'First row, second column.'},
*     { colA: 'Second row, first column.', colB: 'Second row, second column.'}
*   ]
* }
* ```
*
* An object with `data` and `options` properties will be passed directly to the underlying [table layout](https://github.com/75lb/table-layout) module for rendering.
* ```js
* {
*   header: 'A typical app',
*   content: {
*     data: [
*      { colA: 'First row, first column.', colB: 'First row, second column.'},
*      { colA: 'Second row, first column.', colB: 'Second row, second column.'}
*     ],
*     options: {
*       maxWidth: 60
*     }
*   }
* }
* ```
*/
//#endregion
//#region node_modules/command-line-usage/index.js
/**
* @module command-line-usage
*/
/**
* Generates a usage guide suitable for a command-line app.
* @param {Section|Section[]} - One or more section objects ({@link module:command-line-usage~content} or {@link module:command-line-usage~optionList}).
* @returns {string}
* @alias module:command-line-usage
*/
function commandLineUsage(sections) {
	sections = arrayify(sections);
	if (sections.length) return "\n" + sections.map((section) => {
		if (section.optionList) return new OptionList(section);
		else return new ContentSection(section);
	}).join("\n");
	else return "";
}
//#endregion
//#region node_modules/mkdirp/dist/mjs/opts-arg.js
const optsArg = (opts) => {
	if (!opts) opts = { mode: 511 };
	else if (typeof opts === "object") opts = {
		mode: 511,
		...opts
	};
	else if (typeof opts === "number") opts = { mode: opts };
	else if (typeof opts === "string") opts = { mode: parseInt(opts, 8) };
	else throw new TypeError("invalid options argument");
	const resolved = opts;
	const optsFs = opts.fs || {};
	opts.mkdir = opts.mkdir || optsFs.mkdir || mkdir;
	opts.mkdirAsync = opts.mkdirAsync ? opts.mkdirAsync : async (path, options) => {
		return new Promise((res, rej) => resolved.mkdir(path, options, (er, made) => er ? rej(er) : res(made)));
	};
	opts.stat = opts.stat || optsFs.stat || stat;
	opts.statAsync = opts.statAsync ? opts.statAsync : async (path) => new Promise((res, rej) => resolved.stat(path, (err, stats) => err ? rej(err) : res(stats)));
	opts.statSync = opts.statSync || optsFs.statSync || statSync;
	opts.mkdirSync = opts.mkdirSync || optsFs.mkdirSync || mkdirSync;
	return resolved;
};
//#endregion
//#region node_modules/mkdirp/dist/mjs/mkdirp-manual.js
const mkdirpManualSync = (path, options, made) => {
	const parent = dirname(path);
	const opts = {
		...optsArg(options),
		recursive: false
	};
	if (parent === path) try {
		return opts.mkdirSync(path, opts);
	} catch (er) {
		const fer = er;
		if (fer && fer.code !== "EISDIR") throw er;
		return;
	}
	try {
		opts.mkdirSync(path, opts);
		return made || path;
	} catch (er) {
		const fer = er;
		if (fer && fer.code === "ENOENT") return mkdirpManualSync(path, opts, mkdirpManualSync(parent, opts, made));
		if (fer && fer.code !== "EEXIST" && fer && fer.code !== "EROFS") throw er;
		try {
			if (!opts.statSync(path).isDirectory()) throw er;
		} catch (_) {
			throw er;
		}
	}
};
const mkdirpManual = Object.assign(async (path, options, made) => {
	const opts = optsArg(options);
	opts.recursive = false;
	const parent = dirname(path);
	if (parent === path) return opts.mkdirAsync(path, opts).catch((er) => {
		const fer = er;
		if (fer && fer.code !== "EISDIR") throw er;
	});
	return opts.mkdirAsync(path, opts).then(() => made || path, async (er) => {
		const fer = er;
		if (fer && fer.code === "ENOENT") return mkdirpManual(parent, opts).then((made) => mkdirpManual(path, opts, made));
		if (fer && fer.code !== "EEXIST" && fer.code !== "EROFS") throw er;
		return opts.statAsync(path).then((st) => {
			if (st.isDirectory()) return made;
			else throw er;
		}, () => {
			throw er;
		});
	});
}, { sync: mkdirpManualSync });
//#endregion
//#region node_modules/mkdirp/dist/mjs/find-made.js
const findMade = async (opts, parent, path) => {
	if (path === parent) return;
	return opts.statAsync(parent).then((st) => st.isDirectory() ? path : void 0, (er) => {
		const fer = er;
		return fer && fer.code === "ENOENT" ? findMade(opts, dirname(parent), parent) : void 0;
	});
};
const findMadeSync = (opts, parent, path) => {
	if (path === parent) return;
	try {
		return opts.statSync(parent).isDirectory() ? path : void 0;
	} catch (er) {
		const fer = er;
		return fer && fer.code === "ENOENT" ? findMadeSync(opts, dirname(parent), parent) : void 0;
	}
};
//#endregion
//#region node_modules/mkdirp/dist/mjs/mkdirp-native.js
const mkdirpNativeSync = (path, options) => {
	const opts = optsArg(options);
	opts.recursive = true;
	if (dirname(path) === path) return opts.mkdirSync(path, opts);
	const made = findMadeSync(opts, path);
	try {
		opts.mkdirSync(path, opts);
		return made;
	} catch (er) {
		const fer = er;
		if (fer && fer.code === "ENOENT") return mkdirpManualSync(path, opts);
		else throw er;
	}
};
const mkdirpNative = Object.assign(async (path, options) => {
	const opts = {
		...optsArg(options),
		recursive: true
	};
	if (dirname(path) === path) return await opts.mkdirAsync(path, opts);
	return findMade(opts, path).then((made) => opts.mkdirAsync(path, opts).then((m) => made || m).catch((er) => {
		const fer = er;
		if (fer && fer.code === "ENOENT") return mkdirpManual(path, opts);
		else throw er;
	}));
}, { sync: mkdirpNativeSync });
//#endregion
//#region node_modules/mkdirp/dist/mjs/path-arg.js
const platform$1 = process.env.__TESTING_MKDIRP_PLATFORM__ || process.platform;
const pathArg = (path) => {
	if (/\0/.test(path)) throw Object.assign(/* @__PURE__ */ new TypeError("path must be a string without null bytes"), {
		path,
		code: "ERR_INVALID_ARG_VALUE"
	});
	path = resolve(path);
	if (platform$1 === "win32") {
		const badWinChars = /[*|"<>?:]/;
		const { root } = parse(path);
		if (badWinChars.test(path.substring(root.length))) throw Object.assign(/* @__PURE__ */ new Error("Illegal characters in path."), {
			path,
			code: "EINVAL"
		});
	}
	return path;
};
//#endregion
//#region node_modules/mkdirp/dist/mjs/use-native.js
const versArr = (process.env.__TESTING_MKDIRP_NODE_VERSION__ || process.version).replace(/^v/, "").split(".");
const hasNative = +versArr[0] > 10 || +versArr[0] === 10 && +versArr[1] >= 12;
const useNativeSync = !hasNative ? () => false : (opts) => optsArg(opts).mkdirSync === mkdirSync;
const useNative = Object.assign(!hasNative ? () => false : (opts) => optsArg(opts).mkdir === mkdir, { sync: useNativeSync });
//#endregion
//#region node_modules/mkdirp/dist/mjs/index.js
/* c8 ignore stop */
const mkdirpSync = (path, opts) => {
	path = pathArg(path);
	const resolved = optsArg(opts);
	return useNativeSync(resolved) ? mkdirpNativeSync(path, resolved) : mkdirpManualSync(path, resolved);
};
const mkdirp = Object.assign(async (path, opts) => {
	path = pathArg(path);
	const resolved = optsArg(opts);
	return useNative(resolved) ? mkdirpNative(path, resolved) : mkdirpManual(path, resolved);
}, {
	mkdirpSync,
	mkdirpNative,
	mkdirpNativeSync,
	mkdirpManual,
	mkdirpManualSync,
	sync: mkdirpSync,
	native: mkdirpNative,
	nativeSync: mkdirpNativeSync,
	manual: mkdirpManual,
	manualSync: mkdirpManualSync,
	useNative,
	useNativeSync
});
//#endregion
//#region node_modules/hash-it/dist/es/index.mjs
/**
* based on string passed, get the integer hash value
* through bitwise operation (based on spinoff of dbj2
* with enhancements for reduced collisions)
*/
function hash$1(string) {
	let index = string.length;
	let hashA = 5381;
	let hashB = 52711;
	let charCode;
	while (index--) {
		charCode = string.charCodeAt(index);
		hashA = hashA * 33 ^ charCode;
		hashB = hashB * 33 ^ charCode;
	}
	return (hashA >>> 0) * 4096 + (hashB >>> 0);
}
const SEPARATOR = "|";
const XML_ELEMENT_REGEXP = /\[object ([HTML|SVG](.*)Element)\]/;
const CLASSES = {
	"[object Arguments]": 0,
	"[object Array]": 1,
	"[object ArrayBuffer]": 2,
	"[object AsyncFunction]": 3,
	"[object AsyncGeneratorFunction]": 4,
	"[object BigInt]": 5,
	"[object BigInt64Array]": 6,
	"[object BigUint64Array]": 7,
	"[object Blob]": 8,
	"[object Boolean]": 9,
	"[object DataView]": 10,
	"[object Date]": 11,
	"[object DocumentFragment]": 12,
	"[object Error]": 13,
	"[object Event]": 14,
	"[object Float32Array]": 15,
	"[object Float64Array]": 16,
	"[object Function]": 17,
	"[object Generator]": 18,
	"[object GeneratorFunction]": 19,
	"[object Int8Array]": 20,
	"[object Int16Array]": 21,
	"[object Map]": 22,
	"[object Number]": 23,
	"[object Object]": 24,
	"[object Promise]": 25,
	"[object RegExp]": 26,
	"[object Set]": 27,
	"[object SharedArrayBuffer]": 28,
	"[object String]": 29,
	"[object Uint8Array]": 30,
	"[object Uint8ClampedArray]": 31,
	"[object Uint16Array]": 32,
	"[object Uint32Array]": 33,
	"[object WeakMap]": 34,
	"[object WeakRef]": 35,
	"[object WeakSet]": 36,
	CUSTOM: 37,
	ELEMENT: 38
};
const ARRAY_LIKE_CLASSES = {
	"[object Arguments]": 1,
	"[object Array]": 2
};
const NON_ENUMERABLE_CLASSES = {
	"[object Blob]": 1,
	"[object Generator]": 2,
	"[object Promise]": 3,
	"[object WeakMap]": 4,
	"[object WeakRef]": 5,
	"[object WeakSet]": 6
};
const PRIMITIVE_WRAPPER_CLASSES = {
	"[object AsyncFunction]": 1,
	"[object AsyncGeneratorFunction]": 2,
	"[object Boolean]": 3,
	"[object Function]": 4,
	"[object GeneratorFunction]": 5,
	"[object Number]": 6,
	"[object String]": 7
};
const TYPED_ARRAY_CLASSES = {
	"[object BigInt64Array]": 1,
	"[object BigUint64Array]": 2,
	"[object Float32Array]": 3,
	"[object Float64Array]": 4,
	"[object Int8Array]": 5,
	"[object Int16Array]": 6,
	"[object Uint8Array]": 7,
	"[object Uint8ClampedArray]": 8,
	"[object Uint16Array]": 9,
	"[object Uint32Array]": 10
};
const RECURSIVE_CLASSES = {
	"[object Arguments]": 1,
	"[object Array]": 2,
	"[object ArrayBuffer]": 3,
	"[object BigInt64Array]": 4,
	"[object BigUint64Array]": 5,
	"[object DataView]": 6,
	"[object Float32Array]": 7,
	"[object Float64Array]": 8,
	"[object Int8Array]": 9,
	"[object Int16Array]": 10,
	"[object Map]": 11,
	"[object Object]": 12,
	"[object Set]": 13,
	"[object SharedArrayBuffer]": 14,
	"[object Uint8Array]": 15,
	"[object Uint8ClampedArray]": 16,
	"[object Uint16Array]": 17,
	"[object Uint32Array]": 18,
	CUSTOM: 19
};
const HASHABLE_TYPES = {
	bigint: "i",
	boolean: "b",
	empty: "e",
	function: "g",
	number: "n",
	object: "o",
	string: "s",
	symbol: "s"
};
function namespaceComplexValue(classType, value) {
	return HASHABLE_TYPES.object + SEPARATOR + CLASSES[classType] + SEPARATOR + value;
}
const NON_ENUMERABLE_CLASS_CACHE = /* @__PURE__ */ new WeakMap();
let refId = 0;
function getUnsupportedHash(value, classType) {
	const cached = NON_ENUMERABLE_CLASS_CACHE.get(value);
	if (cached) return cached;
	const toCache = namespaceComplexValue(classType, "NOT_ENUMERABLE|" + refId++);
	NON_ENUMERABLE_CLASS_CACHE.set(value, toCache);
	return toCache;
}
function sortByKey(first, second) {
	return first[0] > second[0];
}
function sortBySelf(first, second) {
	return first > second;
}
function sort(array, fn) {
	let subIndex;
	let value;
	for (let index = 0; index < array.length; ++index) {
		value = array[index];
		for (subIndex = index - 1; ~subIndex && fn(array[subIndex], value); --subIndex) array[subIndex + 1] = array[subIndex];
		array[subIndex + 1] = value;
	}
	return array;
}
const toString$1 = Object.prototype.toString;
function stringifyComplexType(value, classType, state) {
	if (RECURSIVE_CLASSES[classType]) return stringifyRecursiveAsJson(classType, value, state);
	if (classType === "[object Date]") return namespaceComplexValue(classType, value.getTime());
	if (classType === "[object RegExp]") return namespaceComplexValue(classType, value.toString());
	if (classType === "[object Event]") return namespaceComplexValue(classType, [
		value.bubbles,
		value.cancelBubble,
		value.cancelable,
		value.composed,
		value.currentTarget,
		value.defaultPrevented,
		value.eventPhase,
		value.isTrusted,
		value.returnValue,
		value.target,
		value.type
	].join());
	if (classType === "[object Error]") return namespaceComplexValue(classType, value.message + SEPARATOR + value.stack);
	if (classType === "[object DocumentFragment]") return namespaceComplexValue(classType, stringifyDocumentFragment(value));
	const element = classType.match(XML_ELEMENT_REGEXP);
	if (element) return namespaceComplexValue("ELEMENT", element[1] + SEPARATOR + value.outerHTML);
	if (NON_ENUMERABLE_CLASSES[classType]) return getUnsupportedHash(value, classType);
	if (PRIMITIVE_WRAPPER_CLASSES[classType]) return namespaceComplexValue(classType, value.toString());
	return stringifyRecursiveAsJson("CUSTOM", value, state);
}
function stringifyRecursiveAsJson(classType, value, state) {
	const cached = state.cache.get(value);
	if (cached) return namespaceComplexValue(classType, "RECURSIVE~" + cached);
	state.cache.set(value, ++state.id);
	if (classType === "[object Object]") return value[Symbol.iterator] ? getUnsupportedHash(value, classType) : namespaceComplexValue(classType, stringifyObject(value, state));
	if (ARRAY_LIKE_CLASSES[classType]) return namespaceComplexValue(classType, stringifyArray(value, state));
	if (classType === "[object Map]") return namespaceComplexValue(classType, stringifyMap(value, state));
	if (classType === "[object Set]") return namespaceComplexValue(classType, stringifySet(value, state));
	if (TYPED_ARRAY_CLASSES[classType]) return namespaceComplexValue(classType, value.join());
	if (classType === "[object ArrayBuffer]") return namespaceComplexValue(classType, stringifyArrayBuffer(value));
	if (classType === "[object DataView]") return namespaceComplexValue(classType, stringifyArrayBuffer(value.buffer));
	if (NON_ENUMERABLE_CLASSES[classType]) return getUnsupportedHash(value, classType);
	return namespaceComplexValue("CUSTOM", stringifyObject(value, state));
}
function stringifyArray(value, state) {
	let index = value.length;
	const result = new Array(index);
	while (--index >= 0) result[index] = stringify(value[index], state);
	return result.join();
}
function stringifyArrayBufferModern(buffer) {
	return Buffer.from(buffer).toString("utf8");
}
function stringifyArrayBufferFallback(buffer) {
	return String.fromCharCode.apply(null, new Uint16Array(buffer));
}
function stringifyArrayBufferNone() {
	return "UNSUPPORTED";
}
function stringifyDocumentFragment(fragment) {
	const children = fragment.children;
	let index = children.length;
	const innerHTML = new Array(index);
	while (--index >= 0) innerHTML[index] = children[index].outerHTML;
	return innerHTML.join();
}
const stringifyArrayBuffer = typeof Buffer !== "undefined" && typeof Buffer.from === "function" ? stringifyArrayBufferModern : typeof Uint16Array === "function" ? stringifyArrayBufferFallback : stringifyArrayBufferNone;
function stringifyMap(map, state) {
	const result = new Array(map.size);
	let index = 0;
	map.forEach((value, key) => {
		result[index++] = [stringify(key, state), stringify(value, state)];
	});
	sort(result, sortByKey);
	while (--index >= 0) result[index] = "[" + result[index][0] + "," + result[index][1] + "]";
	return "[" + result.join() + "]";
}
function stringifyObject(value, state) {
	const properties = sort(Object.getOwnPropertyNames(value), sortBySelf);
	const length = properties.length;
	const result = new Array(length);
	let index = length;
	while (--index >= 0) result[index] = properties[index] + ":" + stringify(value[properties[index]], state);
	return "{" + result.join() + "}";
}
function stringifySet(set, state) {
	const result = new Array(set.size);
	let index = 0;
	set.forEach((value) => {
		result[index++] = stringify(value, state);
	});
	return "[" + sort(result, sortBySelf).join() + "]";
}
function stringify(value, state) {
	const type = typeof value;
	if (value == null || type === "undefined") return HASHABLE_TYPES.empty + value;
	if (type === "object") return stringifyComplexType(value, toString$1.call(value), state || {
		cache: /* @__PURE__ */ new WeakMap(),
		id: 1
	});
	if (type === "function" || type === "symbol") return HASHABLE_TYPES[type] + value.toString();
	if (type === "boolean") return HASHABLE_TYPES.boolean + +value;
	return HASHABLE_TYPES[type] + value;
}
function hash(value) {
	return hash$1(stringify(value, void 0));
}
//#endregion
//#region node_modules/is-plain-obj/index.js
function isPlainObject(value) {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
//#endregion
//#region node_modules/execa/lib/arguments/file-url.js
const safeNormalizeFileUrl = (file, name) => {
	const fileString = normalizeFileUrl(normalizeDenoExecPath(file));
	if (typeof fileString !== "string") throw new TypeError(`${name} must be a string or a file URL: ${fileString}.`);
	return fileString;
};
const normalizeDenoExecPath = (file) => isDenoExecPath(file) ? file.toString() : file;
const isDenoExecPath = (file) => typeof file !== "string" && file && Object.getPrototypeOf(file) === String.prototype;
const normalizeFileUrl = (file) => file instanceof URL ? fileURLToPath(file) : file;
//#endregion
//#region node_modules/execa/lib/methods/parameters.js
const normalizeParameters = (rawFile, rawArguments = [], rawOptions = {}) => {
	const filePath = safeNormalizeFileUrl(rawFile, "First argument");
	const [commandArguments, options] = isPlainObject(rawArguments) ? [[], rawArguments] : [rawArguments, rawOptions];
	if (!Array.isArray(commandArguments)) throw new TypeError(`Second argument must be either an array of arguments or an options object: ${commandArguments}`);
	if (commandArguments.some((commandArgument) => typeof commandArgument === "object" && commandArgument !== null)) throw new TypeError(`Second argument must be an array of strings: ${commandArguments}`);
	const normalizedArguments = commandArguments.map(String);
	const nullByteArgument = normalizedArguments.find((normalizedArgument) => normalizedArgument.includes("\0"));
	if (nullByteArgument !== void 0) throw new TypeError(`Arguments cannot contain null bytes ("\\0"): ${nullByteArgument}`);
	if (!isPlainObject(options)) throw new TypeError(`Last argument must be an options object: ${options}`);
	return [
		filePath,
		normalizedArguments,
		options
	];
};
//#endregion
//#region node_modules/execa/lib/utils/uint-array.js
const { toString: objectToString$1 } = Object.prototype;
const isArrayBuffer = (value) => objectToString$1.call(value) === "[object ArrayBuffer]";
const isUint8Array = (value) => objectToString$1.call(value) === "[object Uint8Array]";
const bufferToUint8Array = (buffer) => new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
const textEncoder$1 = new TextEncoder();
const stringToUint8Array = (string) => textEncoder$1.encode(string);
const textDecoder = new TextDecoder();
const uint8ArrayToString = (uint8Array) => textDecoder.decode(uint8Array);
const joinToString = (uint8ArraysOrStrings, encoding) => {
	return uint8ArraysToStrings(uint8ArraysOrStrings, encoding).join("");
};
const uint8ArraysToStrings = (uint8ArraysOrStrings, encoding) => {
	if (encoding === "utf8" && uint8ArraysOrStrings.every((uint8ArrayOrString) => typeof uint8ArrayOrString === "string")) return uint8ArraysOrStrings;
	const decoder = new StringDecoder(encoding);
	const strings = uint8ArraysOrStrings.map((uint8ArrayOrString) => typeof uint8ArrayOrString === "string" ? stringToUint8Array(uint8ArrayOrString) : uint8ArrayOrString).map((uint8Array) => decoder.write(uint8Array));
	const finalString = decoder.end();
	return finalString === "" ? strings : [...strings, finalString];
};
const joinToUint8Array = (uint8ArraysOrStrings) => {
	if (uint8ArraysOrStrings.length === 1 && isUint8Array(uint8ArraysOrStrings[0])) return uint8ArraysOrStrings[0];
	return concatUint8Arrays(stringsToUint8Arrays(uint8ArraysOrStrings));
};
const stringsToUint8Arrays = (uint8ArraysOrStrings) => uint8ArraysOrStrings.map((uint8ArrayOrString) => typeof uint8ArrayOrString === "string" ? stringToUint8Array(uint8ArrayOrString) : uint8ArrayOrString);
const concatUint8Arrays = (uint8Arrays) => {
	const result = new Uint8Array(getJoinLength(uint8Arrays));
	let index = 0;
	for (const uint8Array of uint8Arrays) {
		result.set(uint8Array, index);
		index += uint8Array.length;
	}
	return result;
};
const getJoinLength = (uint8Arrays) => {
	let joinLength = 0;
	for (const uint8Array of uint8Arrays) joinLength += uint8Array.length;
	return joinLength;
};
//#endregion
//#region node_modules/execa/lib/methods/template.js
const isTemplateString = (templates) => Array.isArray(templates) && Array.isArray(templates.raw);
const parseTemplates = (templates, expressions) => {
	let tokens = [];
	for (const [index, template] of templates.entries()) tokens = parseTemplate({
		templates,
		expressions,
		tokens,
		index,
		template
	});
	if (tokens.length === 0) throw new TypeError("Template script must not be empty");
	const [file, ...commandArguments] = tokens;
	return [
		file,
		commandArguments,
		{}
	];
};
const parseTemplate = ({ templates, expressions, tokens, index, template }) => {
	if (template === void 0) throw new TypeError(`Invalid backslash sequence: ${templates.raw[index]}`);
	const { nextTokens, leadingWhitespaces, trailingWhitespaces } = splitByWhitespaces(template, templates.raw[index]);
	const newTokens = concatTokens(tokens, nextTokens, leadingWhitespaces);
	if (index === expressions.length) return newTokens;
	const expression = expressions[index];
	return concatTokens(newTokens, Array.isArray(expression) ? expression.map((expression) => parseExpression(expression)) : [parseExpression(expression)], trailingWhitespaces);
};
const splitByWhitespaces = (template, rawTemplate) => {
	if (rawTemplate.length === 0) return {
		nextTokens: [],
		leadingWhitespaces: false,
		trailingWhitespaces: false
	};
	const nextTokens = [];
	let templateStart = 0;
	const leadingWhitespaces = DELIMITERS.has(rawTemplate[0]);
	for (let templateIndex = 0, rawIndex = 0; templateIndex < template.length; templateIndex += 1, rawIndex += 1) {
		const rawCharacter = rawTemplate[rawIndex];
		if (DELIMITERS.has(rawCharacter)) {
			if (templateStart !== templateIndex) nextTokens.push(template.slice(templateStart, templateIndex));
			templateStart = templateIndex + 1;
		} else if (rawCharacter === "\\") {
			const nextRawCharacter = rawTemplate[rawIndex + 1];
			if (nextRawCharacter === "\n") {
				templateIndex -= 1;
				rawIndex += 1;
			} else if (nextRawCharacter === "u" && rawTemplate[rawIndex + 2] === "{") rawIndex = rawTemplate.indexOf("}", rawIndex + 3);
			else rawIndex += ESCAPE_LENGTH[nextRawCharacter] ?? 1;
		}
	}
	const trailingWhitespaces = templateStart === template.length;
	if (!trailingWhitespaces) nextTokens.push(template.slice(templateStart));
	return {
		nextTokens,
		leadingWhitespaces,
		trailingWhitespaces
	};
};
const DELIMITERS = new Set([
	" ",
	"	",
	"\r",
	"\n"
]);
const ESCAPE_LENGTH = {
	x: 3,
	u: 5
};
const concatTokens = (tokens, nextTokens, isSeparated) => isSeparated || tokens.length === 0 || nextTokens.length === 0 ? [...tokens, ...nextTokens] : [
	...tokens.slice(0, -1),
	`${tokens.at(-1)}${nextTokens[0]}`,
	...nextTokens.slice(1)
];
const parseExpression = (expression) => {
	const typeOfExpression = typeof expression;
	if (typeOfExpression === "string") return expression;
	if (typeOfExpression === "number") return String(expression);
	if (isPlainObject(expression) && ("stdout" in expression || "isMaxBuffer" in expression)) return getSubprocessResult(expression);
	if (expression instanceof ChildProcess || Object.prototype.toString.call(expression) === "[object Promise]") throw new TypeError("Unexpected subprocess in template expression. Please use ${await subprocess} instead of ${subprocess}.");
	throw new TypeError(`Unexpected "${typeOfExpression}" in template expression`);
};
const getSubprocessResult = ({ stdout }) => {
	if (typeof stdout === "string") return stdout;
	if (isUint8Array(stdout)) return uint8ArrayToString(stdout);
	if (stdout === void 0) throw new TypeError("Missing result.stdout in template expression. This is probably due to the previous subprocess' \"stdout\" option.");
	throw new TypeError(`Unexpected "${typeof stdout}" stdout in template expression`);
};
//#endregion
//#region node_modules/execa/lib/utils/standard-stream.js
const isStandardStream = (stream) => STANDARD_STREAMS.includes(stream);
const STANDARD_STREAMS = [
	process$1.stdin,
	process$1.stdout,
	process$1.stderr
];
const STANDARD_STREAMS_ALIASES = [
	"stdin",
	"stdout",
	"stderr"
];
const getStreamName = (fdNumber) => STANDARD_STREAMS_ALIASES[fdNumber] ?? `stdio[${fdNumber}]`;
//#endregion
//#region node_modules/execa/lib/arguments/specific.js
const normalizeFdSpecificOptions = (options) => {
	const optionsCopy = { ...options };
	for (const optionName of FD_SPECIFIC_OPTIONS) optionsCopy[optionName] = normalizeFdSpecificOption(options, optionName);
	return optionsCopy;
};
const normalizeFdSpecificOption = (options, optionName) => {
	const optionBaseArray = Array.from({ length: getStdioLength(options) + 1 });
	return addDefaultValue$1(normalizeFdSpecificValue(options[optionName], optionBaseArray, optionName), optionName);
};
const getStdioLength = ({ stdio }) => Array.isArray(stdio) ? Math.max(stdio.length, STANDARD_STREAMS_ALIASES.length) : STANDARD_STREAMS_ALIASES.length;
const normalizeFdSpecificValue = (optionValue, optionArray, optionName) => isPlainObject(optionValue) ? normalizeOptionObject(optionValue, optionArray, optionName) : optionArray.fill(optionValue);
const normalizeOptionObject = (optionValue, optionArray, optionName) => {
	for (const fdName of Object.keys(optionValue).sort(compareFdName)) for (const fdNumber of parseFdName(fdName, optionName, optionArray)) optionArray[fdNumber] = optionValue[fdName];
	return optionArray;
};
const compareFdName = (fdNameA, fdNameB) => getFdNameOrder(fdNameA) < getFdNameOrder(fdNameB) ? 1 : -1;
const getFdNameOrder = (fdName) => {
	if (fdName === "stdout" || fdName === "stderr") return 0;
	return fdName === "all" ? 2 : 1;
};
const parseFdName = (fdName, optionName, optionArray) => {
	if (fdName === "ipc") return [optionArray.length - 1];
	const fdNumber = parseFd(fdName);
	if (fdNumber === void 0 || fdNumber === 0) throw new TypeError(`"${optionName}.${fdName}" is invalid.
It must be "${optionName}.stdout", "${optionName}.stderr", "${optionName}.all", "${optionName}.ipc", or "${optionName}.fd3", "${optionName}.fd4" (and so on).`);
	if (fdNumber >= optionArray.length) throw new TypeError(`"${optionName}.${fdName}" is invalid: that file descriptor does not exist.
Please set the "stdio" option to ensure that file descriptor exists.`);
	return fdNumber === "all" ? [1, 2] : [fdNumber];
};
const parseFd = (fdName) => {
	if (fdName === "all") return fdName;
	if (STANDARD_STREAMS_ALIASES.includes(fdName)) return STANDARD_STREAMS_ALIASES.indexOf(fdName);
	const regexpResult = FD_REGEXP.exec(fdName);
	if (regexpResult !== null) return Number(regexpResult[1]);
};
const FD_REGEXP = /^fd(\d+)$/;
const addDefaultValue$1 = (optionArray, optionName) => optionArray.map((optionValue) => optionValue === void 0 ? DEFAULT_OPTIONS[optionName] : optionValue);
const DEFAULT_OPTIONS = {
	lines: false,
	buffer: true,
	maxBuffer: 1e3 * 1e3 * 100,
	verbose: debuglog("execa").enabled ? "full" : "none",
	stripFinalNewline: true
};
const FD_SPECIFIC_OPTIONS = [
	"lines",
	"buffer",
	"maxBuffer",
	"verbose",
	"stripFinalNewline"
];
const getFdSpecificValue = (optionArray, fdNumber) => fdNumber === "ipc" ? optionArray.at(-1) : optionArray[fdNumber];
//#endregion
//#region node_modules/execa/lib/verbose/values.js
const isVerbose = ({ verbose }, fdNumber) => getFdVerbose(verbose, fdNumber) !== "none";
const isFullVerbose = ({ verbose }, fdNumber) => !["none", "short"].includes(getFdVerbose(verbose, fdNumber));
const getVerboseFunction = ({ verbose }, fdNumber) => {
	const fdVerbose = getFdVerbose(verbose, fdNumber);
	return isVerboseFunction(fdVerbose) ? fdVerbose : void 0;
};
const getFdVerbose = (verbose, fdNumber) => fdNumber === void 0 ? getFdGenericVerbose(verbose) : getFdSpecificValue(verbose, fdNumber);
const getFdGenericVerbose = (verbose) => verbose.find((fdVerbose) => isVerboseFunction(fdVerbose)) ?? VERBOSE_VALUES.findLast((fdVerbose) => verbose.includes(fdVerbose));
const isVerboseFunction = (fdVerbose) => typeof fdVerbose === "function";
const VERBOSE_VALUES = [
	"none",
	"short",
	"full"
];
//#endregion
//#region node_modules/execa/lib/arguments/escape.js
const joinCommand = (filePath, rawArguments) => {
	const fileAndArguments = [filePath, ...rawArguments];
	return {
		command: fileAndArguments.join(" "),
		escapedCommand: fileAndArguments.map((fileAndArgument) => quoteString(escapeControlCharacters(fileAndArgument))).join(" ")
	};
};
const escapeLines = (lines) => stripVTControlCharacters(lines).split("\n").map((line) => escapeControlCharacters(line)).join("\n");
const escapeControlCharacters = (line) => line.replaceAll(SPECIAL_CHAR_REGEXP, (character) => escapeControlCharacter(character));
const escapeControlCharacter = (character) => {
	const commonEscape = COMMON_ESCAPES[character];
	if (commonEscape !== void 0) return commonEscape;
	const codepoint = character.codePointAt(0);
	const codepointHex = codepoint.toString(16);
	return codepoint <= ASTRAL_START ? `\\u${codepointHex.padStart(4, "0")}` : `\\U${codepointHex}`;
};
const getSpecialCharRegExp = () => {
	try {
		return /* @__PURE__ */ new RegExp("\\p{Separator}|\\p{Other}", "gu");
	} catch {
		return /[\s\u0000-\u001F\u007F-\u009F\u00AD]/g;
	}
};
const SPECIAL_CHAR_REGEXP = getSpecialCharRegExp();
const COMMON_ESCAPES = {
	" ": " ",
	"\b": "\\b",
	"\f": "\\f",
	"\n": "\\n",
	"\r": "\\r",
	"	": "\\t"
};
const ASTRAL_START = 65535;
const quoteString = (escapedArgument) => {
	if (NO_ESCAPE_REGEXP.test(escapedArgument)) return escapedArgument;
	return platform === "win32" ? `"${escapedArgument.replaceAll("\"", "\"\"")}"` : `'${escapedArgument.replaceAll("'", "'\\''")}'`;
};
const NO_ESCAPE_REGEXP = /^[\w./-]+$/;
//#endregion
//#region node_modules/is-unicode-supported/index.js
function isUnicodeSupported() {
	const { env } = process$1;
	const { TERM, TERM_PROGRAM } = env;
	if (process$1.platform !== "win32") return TERM !== "linux";
	return Boolean(env.WT_SESSION) || Boolean(env.TERMINUS_SUBLIME) || env.ConEmuTask === "{cmd::Cmder}" || TERM_PROGRAM === "Terminus-Sublime" || TERM_PROGRAM === "vscode" || TERM === "xterm-256color" || TERM === "alacritty" || TERM === "rxvt-unicode" || TERM === "rxvt-unicode-256color" || env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
//#endregion
//#region node_modules/figures/index.js
const common$1 = {
	circleQuestionMark: "(?)",
	questionMarkPrefix: "(?)",
	square: "█",
	squareDarkShade: "▓",
	squareMediumShade: "▒",
	squareLightShade: "░",
	squareTop: "▀",
	squareBottom: "▄",
	squareLeft: "▌",
	squareRight: "▐",
	squareCenter: "■",
	bullet: "●",
	dot: "․",
	ellipsis: "…",
	pointerSmall: "›",
	triangleUp: "▲",
	triangleUpSmall: "▴",
	triangleDown: "▼",
	triangleDownSmall: "▾",
	triangleLeftSmall: "◂",
	triangleRightSmall: "▸",
	home: "⌂",
	heart: "♥",
	musicNote: "♪",
	musicNoteBeamed: "♫",
	arrowUp: "↑",
	arrowDown: "↓",
	arrowLeft: "←",
	arrowRight: "→",
	arrowLeftRight: "↔",
	arrowUpDown: "↕",
	almostEqual: "≈",
	notEqual: "≠",
	lessOrEqual: "≤",
	greaterOrEqual: "≥",
	identical: "≡",
	infinity: "∞",
	subscriptZero: "₀",
	subscriptOne: "₁",
	subscriptTwo: "₂",
	subscriptThree: "₃",
	subscriptFour: "₄",
	subscriptFive: "₅",
	subscriptSix: "₆",
	subscriptSeven: "₇",
	subscriptEight: "₈",
	subscriptNine: "₉",
	oneHalf: "½",
	oneThird: "⅓",
	oneQuarter: "¼",
	oneFifth: "⅕",
	oneSixth: "⅙",
	oneEighth: "⅛",
	twoThirds: "⅔",
	twoFifths: "⅖",
	threeQuarters: "¾",
	threeFifths: "⅗",
	threeEighths: "⅜",
	fourFifths: "⅘",
	fiveSixths: "⅚",
	fiveEighths: "⅝",
	sevenEighths: "⅞",
	line: "─",
	lineBold: "━",
	lineDouble: "═",
	lineDashed0: "┄",
	lineDashed1: "┅",
	lineDashed2: "┈",
	lineDashed3: "┉",
	lineDashed4: "╌",
	lineDashed5: "╍",
	lineDashed6: "╴",
	lineDashed7: "╶",
	lineDashed8: "╸",
	lineDashed9: "╺",
	lineDashed10: "╼",
	lineDashed11: "╾",
	lineDashed12: "−",
	lineDashed13: "–",
	lineDashed14: "‐",
	lineDashed15: "⁃",
	lineVertical: "│",
	lineVerticalBold: "┃",
	lineVerticalDouble: "║",
	lineVerticalDashed0: "┆",
	lineVerticalDashed1: "┇",
	lineVerticalDashed2: "┊",
	lineVerticalDashed3: "┋",
	lineVerticalDashed4: "╎",
	lineVerticalDashed5: "╏",
	lineVerticalDashed6: "╵",
	lineVerticalDashed7: "╷",
	lineVerticalDashed8: "╹",
	lineVerticalDashed9: "╻",
	lineVerticalDashed10: "╽",
	lineVerticalDashed11: "╿",
	lineDownLeft: "┐",
	lineDownLeftArc: "╮",
	lineDownBoldLeftBold: "┓",
	lineDownBoldLeft: "┒",
	lineDownLeftBold: "┑",
	lineDownDoubleLeftDouble: "╗",
	lineDownDoubleLeft: "╖",
	lineDownLeftDouble: "╕",
	lineDownRight: "┌",
	lineDownRightArc: "╭",
	lineDownBoldRightBold: "┏",
	lineDownBoldRight: "┎",
	lineDownRightBold: "┍",
	lineDownDoubleRightDouble: "╔",
	lineDownDoubleRight: "╓",
	lineDownRightDouble: "╒",
	lineUpLeft: "┘",
	lineUpLeftArc: "╯",
	lineUpBoldLeftBold: "┛",
	lineUpBoldLeft: "┚",
	lineUpLeftBold: "┙",
	lineUpDoubleLeftDouble: "╝",
	lineUpDoubleLeft: "╜",
	lineUpLeftDouble: "╛",
	lineUpRight: "└",
	lineUpRightArc: "╰",
	lineUpBoldRightBold: "┗",
	lineUpBoldRight: "┖",
	lineUpRightBold: "┕",
	lineUpDoubleRightDouble: "╚",
	lineUpDoubleRight: "╙",
	lineUpRightDouble: "╘",
	lineUpDownLeft: "┤",
	lineUpBoldDownBoldLeftBold: "┫",
	lineUpBoldDownBoldLeft: "┨",
	lineUpDownLeftBold: "┥",
	lineUpBoldDownLeftBold: "┩",
	lineUpDownBoldLeftBold: "┪",
	lineUpDownBoldLeft: "┧",
	lineUpBoldDownLeft: "┦",
	lineUpDoubleDownDoubleLeftDouble: "╣",
	lineUpDoubleDownDoubleLeft: "╢",
	lineUpDownLeftDouble: "╡",
	lineUpDownRight: "├",
	lineUpBoldDownBoldRightBold: "┣",
	lineUpBoldDownBoldRight: "┠",
	lineUpDownRightBold: "┝",
	lineUpBoldDownRightBold: "┡",
	lineUpDownBoldRightBold: "┢",
	lineUpDownBoldRight: "┟",
	lineUpBoldDownRight: "┞",
	lineUpDoubleDownDoubleRightDouble: "╠",
	lineUpDoubleDownDoubleRight: "╟",
	lineUpDownRightDouble: "╞",
	lineDownLeftRight: "┬",
	lineDownBoldLeftBoldRightBold: "┳",
	lineDownLeftBoldRightBold: "┯",
	lineDownBoldLeftRight: "┰",
	lineDownBoldLeftBoldRight: "┱",
	lineDownBoldLeftRightBold: "┲",
	lineDownLeftRightBold: "┮",
	lineDownLeftBoldRight: "┭",
	lineDownDoubleLeftDoubleRightDouble: "╦",
	lineDownDoubleLeftRight: "╥",
	lineDownLeftDoubleRightDouble: "╤",
	lineUpLeftRight: "┴",
	lineUpBoldLeftBoldRightBold: "┻",
	lineUpLeftBoldRightBold: "┷",
	lineUpBoldLeftRight: "┸",
	lineUpBoldLeftBoldRight: "┹",
	lineUpBoldLeftRightBold: "┺",
	lineUpLeftRightBold: "┶",
	lineUpLeftBoldRight: "┵",
	lineUpDoubleLeftDoubleRightDouble: "╩",
	lineUpDoubleLeftRight: "╨",
	lineUpLeftDoubleRightDouble: "╧",
	lineUpDownLeftRight: "┼",
	lineUpBoldDownBoldLeftBoldRightBold: "╋",
	lineUpDownBoldLeftBoldRightBold: "╈",
	lineUpBoldDownLeftBoldRightBold: "╇",
	lineUpBoldDownBoldLeftRightBold: "╊",
	lineUpBoldDownBoldLeftBoldRight: "╉",
	lineUpBoldDownLeftRight: "╀",
	lineUpDownBoldLeftRight: "╁",
	lineUpDownLeftBoldRight: "┽",
	lineUpDownLeftRightBold: "┾",
	lineUpBoldDownBoldLeftRight: "╂",
	lineUpDownLeftBoldRightBold: "┿",
	lineUpBoldDownLeftBoldRight: "╃",
	lineUpBoldDownLeftRightBold: "╄",
	lineUpDownBoldLeftBoldRight: "╅",
	lineUpDownBoldLeftRightBold: "╆",
	lineUpDoubleDownDoubleLeftDoubleRightDouble: "╬",
	lineUpDoubleDownDoubleLeftRight: "╫",
	lineUpDownLeftDoubleRightDouble: "╪",
	lineCross: "╳",
	lineBackslash: "╲",
	lineSlash: "╱"
};
const specialMainSymbols = {
	tick: "✔",
	info: "ℹ",
	warning: "⚠",
	cross: "✘",
	squareSmall: "◻",
	squareSmallFilled: "◼",
	circle: "◯",
	circleFilled: "◉",
	circleDotted: "◌",
	circleDouble: "◎",
	circleCircle: "ⓞ",
	circleCross: "ⓧ",
	circlePipe: "Ⓘ",
	radioOn: "◉",
	radioOff: "◯",
	checkboxOn: "☒",
	checkboxOff: "☐",
	checkboxCircleOn: "ⓧ",
	checkboxCircleOff: "Ⓘ",
	pointer: "❯",
	triangleUpOutline: "△",
	triangleLeft: "◀",
	triangleRight: "▶",
	lozenge: "◆",
	lozengeOutline: "◇",
	hamburger: "☰",
	smiley: "㋡",
	mustache: "෴",
	star: "★",
	play: "▶",
	nodejs: "⬢",
	oneSeventh: "⅐",
	oneNinth: "⅑",
	oneTenth: "⅒"
};
const specialFallbackSymbols = {
	tick: "√",
	info: "i",
	warning: "‼",
	cross: "×",
	squareSmall: "□",
	squareSmallFilled: "■",
	circle: "( )",
	circleFilled: "(*)",
	circleDotted: "( )",
	circleDouble: "( )",
	circleCircle: "(○)",
	circleCross: "(×)",
	circlePipe: "(│)",
	radioOn: "(*)",
	radioOff: "( )",
	checkboxOn: "[×]",
	checkboxOff: "[ ]",
	checkboxCircleOn: "(×)",
	checkboxCircleOff: "( )",
	pointer: ">",
	triangleUpOutline: "∆",
	triangleLeft: "◄",
	triangleRight: "►",
	lozenge: "♦",
	lozengeOutline: "◊",
	hamburger: "≡",
	smiley: "☺",
	mustache: "┌─┐",
	star: "✶",
	play: "►",
	nodejs: "♦",
	oneSeventh: "1/7",
	oneNinth: "1/9",
	oneTenth: "1/10"
};
const mainSymbols = {
	...common$1,
	...specialMainSymbols
};
const fallbackSymbols = {
	...common$1,
	...specialFallbackSymbols
};
const figures = isUnicodeSupported() ? mainSymbols : fallbackSymbols;
Object.entries(specialMainSymbols);
//#endregion
//#region node_modules/yoctocolors/base.js
const hasColors = tty?.WriteStream?.prototype?.hasColors?.() ?? false;
const format = (open, close) => {
	if (!hasColors) return (input) => input;
	const openCode = `\u001B[${open}m`;
	const closeCode = `\u001B[${close}m`;
	return (input) => {
		const string = input + "";
		let index = string.indexOf(closeCode);
		if (index === -1) return openCode + string + closeCode;
		let result = openCode;
		let lastIndex = 0;
		const replaceCode = (close === 22 ? closeCode : "") + openCode;
		while (index !== -1) {
			result += string.slice(lastIndex, index) + replaceCode;
			lastIndex = index + closeCode.length;
			index = string.indexOf(closeCode, lastIndex);
		}
		result += string.slice(lastIndex) + closeCode;
		return result;
	};
};
format(0, 0);
const bold = format(1, 22);
format(2, 22);
format(3, 23);
format(4, 24);
format(53, 55);
format(7, 27);
format(8, 28);
format(9, 29);
format(30, 39);
format(31, 39);
format(32, 39);
format(33, 39);
format(34, 39);
format(35, 39);
format(36, 39);
format(37, 39);
const gray = format(90, 39);
format(40, 49);
format(41, 49);
format(42, 49);
format(43, 49);
format(44, 49);
format(45, 49);
format(46, 49);
format(47, 49);
format(100, 49);
const redBright = format(91, 39);
format(92, 39);
const yellowBright = format(93, 39);
format(94, 39);
format(95, 39);
format(96, 39);
format(97, 39);
format(101, 49);
format(102, 49);
format(103, 49);
format(104, 49);
format(105, 49);
format(106, 49);
format(107, 49);
//#endregion
//#region node_modules/execa/lib/verbose/default.js
const defaultVerboseFunction = ({ type, message, timestamp, piped, commandId, result: { failed = false } = {}, options: { reject = true } }) => {
	const timestampString = serializeTimestamp(timestamp);
	const icon = ICONS[type]({
		failed,
		reject,
		piped
	});
	const color = COLORS[type]({ reject });
	return `${gray(`[${timestampString}]`)} ${gray(`[${commandId}]`)} ${color(icon)} ${color(message)}`;
};
const serializeTimestamp = (timestamp) => `${padField(timestamp.getHours(), 2)}:${padField(timestamp.getMinutes(), 2)}:${padField(timestamp.getSeconds(), 2)}.${padField(timestamp.getMilliseconds(), 3)}`;
const padField = (field, padding) => String(field).padStart(padding, "0");
const getFinalIcon = ({ failed, reject }) => {
	if (!failed) return figures.tick;
	return reject ? figures.cross : figures.warning;
};
const ICONS = {
	command: ({ piped }) => piped ? "|" : "$",
	output: () => " ",
	ipc: () => "*",
	error: getFinalIcon,
	duration: getFinalIcon
};
const identity$1 = (string) => string;
const COLORS = {
	command: () => bold,
	output: () => identity$1,
	ipc: () => identity$1,
	error: ({ reject }) => reject ? redBright : yellowBright,
	duration: () => gray
};
//#endregion
//#region node_modules/execa/lib/verbose/custom.js
const applyVerboseOnLines = (printedLines, verboseInfo, fdNumber) => {
	const verboseFunction = getVerboseFunction(verboseInfo, fdNumber);
	return printedLines.map(({ verboseLine, verboseObject }) => applyVerboseFunction(verboseLine, verboseObject, verboseFunction)).filter((printedLine) => printedLine !== void 0).map((printedLine) => appendNewline(printedLine)).join("");
};
const applyVerboseFunction = (verboseLine, verboseObject, verboseFunction) => {
	if (verboseFunction === void 0) return verboseLine;
	const printedLine = verboseFunction(verboseLine, verboseObject);
	if (typeof printedLine === "string") return printedLine;
};
const appendNewline = (printedLine) => printedLine.endsWith("\n") ? printedLine : `${printedLine}\n`;
//#endregion
//#region node_modules/execa/lib/verbose/log.js
const verboseLog = ({ type, verboseMessage, fdNumber, verboseInfo, result }) => {
	const finalLines = applyVerboseOnLines(getPrintedLines(verboseMessage, getVerboseObject({
		type,
		result,
		verboseInfo
	})), verboseInfo, fdNumber);
	if (finalLines !== "") console.warn(finalLines.slice(0, -1));
};
const getVerboseObject = ({ type, result, verboseInfo: { escapedCommand, commandId, rawOptions: { piped = false, ...options } } }) => ({
	type,
	escapedCommand,
	commandId: `${commandId}`,
	timestamp: /* @__PURE__ */ new Date(),
	piped,
	result,
	options
});
const getPrintedLines = (verboseMessage, verboseObject) => verboseMessage.split("\n").map((message) => getPrintedLine({
	...verboseObject,
	message
}));
const getPrintedLine = (verboseObject) => {
	return {
		verboseLine: defaultVerboseFunction(verboseObject),
		verboseObject
	};
};
const serializeVerboseMessage = (message) => {
	return escapeLines(typeof message === "string" ? message : inspect(message)).replaceAll("	", " ".repeat(TAB_SIZE));
};
const TAB_SIZE = 2;
//#endregion
//#region node_modules/execa/lib/verbose/start.js
const logCommand = (escapedCommand, verboseInfo) => {
	if (!isVerbose(verboseInfo)) return;
	verboseLog({
		type: "command",
		verboseMessage: escapedCommand,
		verboseInfo
	});
};
//#endregion
//#region node_modules/execa/lib/verbose/info.js
const getVerboseInfo = (verbose, escapedCommand, rawOptions) => {
	validateVerbose(verbose);
	return {
		verbose,
		escapedCommand,
		commandId: getCommandId(verbose),
		rawOptions
	};
};
const getCommandId = (verbose) => isVerbose({ verbose }) ? COMMAND_ID++ : void 0;
let COMMAND_ID = 0n;
const validateVerbose = (verbose) => {
	for (const fdVerbose of verbose) {
		if (fdVerbose === false) throw new TypeError("The \"verbose: false\" option was renamed to \"verbose: 'none'\".");
		if (fdVerbose === true) throw new TypeError("The \"verbose: true\" option was renamed to \"verbose: 'short'\".");
		if (!VERBOSE_VALUES.includes(fdVerbose) && !isVerboseFunction(fdVerbose)) {
			const allowedValues = VERBOSE_VALUES.map((allowedValue) => `'${allowedValue}'`).join(", ");
			throw new TypeError(`The "verbose" option must not be ${fdVerbose}. Allowed values are: ${allowedValues} or a function.`);
		}
	}
};
//#endregion
//#region node_modules/execa/lib/return/duration.js
const getStartTime = () => hrtime.bigint();
const getDurationMs = (startTime) => Number(hrtime.bigint() - startTime) / 1e6;
//#endregion
//#region node_modules/execa/lib/arguments/command.js
const handleCommand = (filePath, rawArguments, rawOptions) => {
	const startTime = getStartTime();
	const { command, escapedCommand } = joinCommand(filePath, rawArguments);
	const verboseInfo = getVerboseInfo(normalizeFdSpecificOption(rawOptions, "verbose"), escapedCommand, { ...rawOptions });
	logCommand(escapedCommand, verboseInfo);
	return {
		command,
		escapedCommand,
		startTime,
		verboseInfo
	};
};
//#endregion
//#region node_modules/isexe/windows.js
var require_windows = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = isexe;
	isexe.sync = sync;
	var fs$3 = __require("fs");
	function checkPathExt(path, options) {
		var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
		if (!pathext) return true;
		pathext = pathext.split(";");
		if (pathext.indexOf("") !== -1) return true;
		for (var i = 0; i < pathext.length; i++) {
			var p = pathext[i].toLowerCase();
			if (p && path.substr(-p.length).toLowerCase() === p) return true;
		}
		return false;
	}
	function checkStat(stat, path, options) {
		if (!stat.isSymbolicLink() && !stat.isFile()) return false;
		return checkPathExt(path, options);
	}
	function isexe(path, options, cb) {
		fs$3.stat(path, function(er, stat) {
			cb(er, er ? false : checkStat(stat, path, options));
		});
	}
	function sync(path, options) {
		return checkStat(fs$3.statSync(path), path, options);
	}
}));
//#endregion
//#region node_modules/isexe/mode.js
var require_mode = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = isexe;
	isexe.sync = sync;
	var fs$2 = __require("fs");
	function isexe(path, options, cb) {
		fs$2.stat(path, function(er, stat) {
			cb(er, er ? false : checkStat(stat, options));
		});
	}
	function sync(path, options) {
		return checkStat(fs$2.statSync(path), options);
	}
	function checkStat(stat, options) {
		return stat.isFile() && checkMode(stat, options);
	}
	function checkMode(stat, options) {
		var mod = stat.mode;
		var uid = stat.uid;
		var gid = stat.gid;
		var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
		var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
		var u = parseInt("100", 8);
		var g = parseInt("010", 8);
		var o = parseInt("001", 8);
		var ug = u | g;
		return mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
	}
}));
//#endregion
//#region node_modules/isexe/index.js
var require_isexe = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	__require("fs");
	var core;
	if (process.platform === "win32" || global.TESTING_WINDOWS) core = require_windows();
	else core = require_mode();
	module.exports = isexe;
	isexe.sync = sync;
	function isexe(path, options, cb) {
		if (typeof options === "function") {
			cb = options;
			options = {};
		}
		if (!cb) {
			if (typeof Promise !== "function") throw new TypeError("callback not provided");
			return new Promise(function(resolve, reject) {
				isexe(path, options || {}, function(er, is) {
					if (er) reject(er);
					else resolve(is);
				});
			});
		}
		core(path, options || {}, function(er, is) {
			if (er) {
				if (er.code === "EACCES" || options && options.ignoreErrors) {
					er = null;
					is = false;
				}
			}
			cb(er, is);
		});
	}
	function sync(path, options) {
		try {
			return core.sync(path, options || {});
		} catch (er) {
			if (options && options.ignoreErrors || er.code === "EACCES") return false;
			else throw er;
		}
	}
}));
//#endregion
//#region node_modules/which/which.js
var require_which = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
	const path$3 = __require("path");
	const COLON = isWindows ? ";" : ":";
	const isexe = require_isexe();
	const getNotFoundError = (cmd) => Object.assign(/* @__PURE__ */ new Error(`not found: ${cmd}`), { code: "ENOENT" });
	const getPathInfo = (cmd, opt) => {
		const colon = opt.colon || COLON;
		const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [...isWindows ? [process.cwd()] : [], ...(opt.path || process.env.PATH || "").split(colon)];
		const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
		const pathExt = isWindows ? pathExtExe.split(colon) : [""];
		if (isWindows) {
			if (cmd.indexOf(".") !== -1 && pathExt[0] !== "") pathExt.unshift("");
		}
		return {
			pathEnv,
			pathExt,
			pathExtExe
		};
	};
	const which = (cmd, opt, cb) => {
		if (typeof opt === "function") {
			cb = opt;
			opt = {};
		}
		if (!opt) opt = {};
		const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
		const found = [];
		const step = (i) => new Promise((resolve, reject) => {
			if (i === pathEnv.length) return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
			const ppRaw = pathEnv[i];
			const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
			const pCmd = path$3.join(pathPart, cmd);
			resolve(subStep(!pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd, i, 0));
		});
		const subStep = (p, i, ii) => new Promise((resolve, reject) => {
			if (ii === pathExt.length) return resolve(step(i + 1));
			const ext = pathExt[ii];
			isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
				if (!er && is) if (opt.all) found.push(p + ext);
				else return resolve(p + ext);
				return resolve(subStep(p, i, ii + 1));
			});
		});
		return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
	};
	const whichSync = (cmd, opt) => {
		opt = opt || {};
		const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
		const found = [];
		for (let i = 0; i < pathEnv.length; i++) {
			const ppRaw = pathEnv[i];
			const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
			const pCmd = path$3.join(pathPart, cmd);
			const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
			for (let j = 0; j < pathExt.length; j++) {
				const cur = p + pathExt[j];
				try {
					if (isexe.sync(cur, { pathExt: pathExtExe })) if (opt.all) found.push(cur);
					else return cur;
				} catch (ex) {}
			}
		}
		if (opt.all && found.length) return found;
		if (opt.nothrow) return null;
		throw getNotFoundError(cmd);
	};
	module.exports = which;
	which.sync = whichSync;
}));
//#endregion
//#region node_modules/path-key/index.js
var require_path_key = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const pathKey = (options = {}) => {
		const environment = options.env || process.env;
		if ((options.platform || process.platform) !== "win32") return "PATH";
		return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
	};
	module.exports = pathKey;
	module.exports.default = pathKey;
}));
//#endregion
//#region node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const path$2 = __require("path");
	const which = require_which();
	const getPathKey = require_path_key();
	function resolveCommandAttempt(parsed, withoutPathExt) {
		const env = parsed.options.env || process.env;
		const cwd = process.cwd();
		const hasCustomCwd = parsed.options.cwd != null;
		const shouldSwitchCwd = hasCustomCwd && process.chdir !== void 0 && !process.chdir.disabled;
		if (shouldSwitchCwd) try {
			process.chdir(parsed.options.cwd);
		} catch (err) {}
		let resolved;
		try {
			resolved = which.sync(parsed.command, {
				path: env[getPathKey({ env })],
				pathExt: withoutPathExt ? path$2.delimiter : void 0
			});
		} catch (e) {} finally {
			if (shouldSwitchCwd) process.chdir(cwd);
		}
		if (resolved) resolved = path$2.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
		return resolved;
	}
	function resolveCommand(parsed) {
		return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
	}
	module.exports = resolveCommand;
}));
//#endregion
//#region node_modules/cross-spawn/lib/util/escape.js
var require_escape = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
	function escapeCommand(arg) {
		arg = arg.replace(metaCharsRegExp, "^$1");
		return arg;
	}
	function escapeArgument(arg, doubleEscapeMetaChars) {
		arg = `${arg}`;
		arg = arg.replace(/(?=(\\+?)?)\1"/g, "$1$1\\\"");
		arg = arg.replace(/(?=(\\+?)?)\1$/, "$1$1");
		arg = `"${arg}"`;
		arg = arg.replace(metaCharsRegExp, "^$1");
		if (doubleEscapeMetaChars) arg = arg.replace(metaCharsRegExp, "^$1");
		return arg;
	}
	module.exports.command = escapeCommand;
	module.exports.argument = escapeArgument;
}));
//#endregion
//#region node_modules/shebang-regex/index.js
var require_shebang_regex = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = /^#!(.*)/;
}));
//#endregion
//#region node_modules/shebang-command/index.js
var require_shebang_command = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const shebangRegex = require_shebang_regex();
	module.exports = (string = "") => {
		const match = string.match(shebangRegex);
		if (!match) return null;
		const [path, argument] = match[0].replace(/#! ?/, "").split(" ");
		const binary = path.split("/").pop();
		if (binary === "env") return argument;
		return argument ? `${binary} ${argument}` : binary;
	};
}));
//#endregion
//#region node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const fs$1 = __require("fs");
	const shebangCommand = require_shebang_command();
	function readShebang(command) {
		const size = 150;
		const buffer = Buffer.alloc(size);
		let fd;
		try {
			fd = fs$1.openSync(command, "r");
			fs$1.readSync(fd, buffer, 0, size, 0);
			fs$1.closeSync(fd);
		} catch (e) {}
		return shebangCommand(buffer.toString());
	}
	module.exports = readShebang;
}));
//#endregion
//#region node_modules/cross-spawn/lib/parse.js
var require_parse$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const path$1 = __require("path");
	const resolveCommand = require_resolveCommand();
	const escape = require_escape();
	const readShebang = require_readShebang();
	const isWin = process.platform === "win32";
	const isExecutableRegExp = /\.(?:com|exe)$/i;
	const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
	function detectShebang(parsed) {
		parsed.file = resolveCommand(parsed);
		const shebang = parsed.file && readShebang(parsed.file);
		if (shebang) {
			parsed.args.unshift(parsed.file);
			parsed.command = shebang;
			return resolveCommand(parsed);
		}
		return parsed.file;
	}
	function parseNonShell(parsed) {
		if (!isWin) return parsed;
		const commandFile = detectShebang(parsed);
		const needsShell = !isExecutableRegExp.test(commandFile);
		if (parsed.options.forceShell || needsShell) {
			const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
			parsed.command = path$1.normalize(parsed.command);
			parsed.command = escape.command(parsed.command);
			parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
			parsed.args = [
				"/d",
				"/s",
				"/c",
				`"${[parsed.command].concat(parsed.args).join(" ")}"`
			];
			parsed.command = process.env.comspec || "cmd.exe";
			parsed.options.windowsVerbatimArguments = true;
		}
		return parsed;
	}
	function parse(command, args, options) {
		if (args && !Array.isArray(args)) {
			options = args;
			args = null;
		}
		args = args ? args.slice(0) : [];
		options = Object.assign({}, options);
		const parsed = {
			command,
			args,
			options,
			file: void 0,
			original: {
				command,
				args
			}
		};
		return options.shell ? parsed : parseNonShell(parsed);
	}
	module.exports = parse;
}));
//#endregion
//#region node_modules/cross-spawn/lib/enoent.js
var require_enoent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const isWin = process.platform === "win32";
	function notFoundError(original, syscall) {
		return Object.assign(/* @__PURE__ */ new Error(`${syscall} ${original.command} ENOENT`), {
			code: "ENOENT",
			errno: "ENOENT",
			syscall: `${syscall} ${original.command}`,
			path: original.command,
			spawnargs: original.args
		});
	}
	function hookChildProcess(cp, parsed) {
		if (!isWin) return;
		const originalEmit = cp.emit;
		cp.emit = function(name, arg1) {
			if (name === "exit") {
				const err = verifyENOENT(arg1, parsed);
				if (err) return originalEmit.call(cp, "error", err);
			}
			return originalEmit.apply(cp, arguments);
		};
	}
	function verifyENOENT(status, parsed) {
		if (isWin && status === 1 && !parsed.file) return notFoundError(parsed.original, "spawn");
		return null;
	}
	function verifyENOENTSync(status, parsed) {
		if (isWin && status === 1 && !parsed.file) return notFoundError(parsed.original, "spawnSync");
		return null;
	}
	module.exports = {
		hookChildProcess,
		verifyENOENT,
		verifyENOENTSync,
		notFoundError
	};
}));
//#endregion
//#region node_modules/npm-run-path/node_modules/path-key/index.js
var import_cross_spawn = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	const cp = __require("child_process");
	const parse = require_parse$1();
	const enoent = require_enoent();
	function spawn(command, args, options) {
		const parsed = parse(command, args, options);
		const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
		enoent.hookChildProcess(spawned, parsed);
		return spawned;
	}
	function spawnSync(command, args, options) {
		const parsed = parse(command, args, options);
		const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
		result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
		return result;
	}
	module.exports = spawn;
	module.exports.spawn = spawn;
	module.exports.sync = spawnSync;
	module.exports._parse = parse;
	module.exports._enoent = enoent;
})))(), 1);
function pathKey(options = {}) {
	const { env = process.env, platform = process.platform } = options;
	if (platform !== "win32") return "PATH";
	return Object.keys(env).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
}
promisify(execFile);
function toPath(urlOrPath) {
	return urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;
}
function traversePathUp(startPath) {
	return { *[Symbol.iterator]() {
		let currentPath = path.resolve(toPath(startPath));
		let previousPath;
		while (previousPath !== currentPath) {
			yield currentPath;
			previousPath = currentPath;
			currentPath = path.resolve(currentPath, "..");
		}
	} };
}
//#endregion
//#region node_modules/npm-run-path/index.js
const npmRunPath = ({ cwd = process$1.cwd(), path: pathOption = process$1.env[pathKey()], preferLocal = true, execPath = process$1.execPath, addExecPath = true } = {}) => {
	const cwdPath = path.resolve(toPath(cwd));
	const result = [];
	const pathParts = pathOption.split(path.delimiter);
	if (preferLocal) applyPreferLocal(result, pathParts, cwdPath);
	if (addExecPath) applyExecPath(result, pathParts, execPath, cwdPath);
	return pathOption === "" || pathOption === path.delimiter ? `${result.join(path.delimiter)}${pathOption}` : [...result, pathOption].join(path.delimiter);
};
const applyPreferLocal = (result, pathParts, cwdPath) => {
	for (const directory of traversePathUp(cwdPath)) {
		const pathPart = path.join(directory, "node_modules/.bin");
		if (!pathParts.includes(pathPart)) result.push(pathPart);
	}
};
const applyExecPath = (result, pathParts, execPath, cwdPath) => {
	const pathPart = path.resolve(cwdPath, toPath(execPath), "..");
	if (!pathParts.includes(pathPart)) result.push(pathPart);
};
const npmRunPathEnv = ({ env = process$1.env, ...options } = {}) => {
	env = { ...env };
	const pathName = pathKey({ env });
	options.path = env[pathName];
	env[pathName] = npmRunPath(options);
	return env;
};
//#endregion
//#region node_modules/execa/lib/return/final-error.js
const getFinalError = (originalError, message, isSync) => {
	return new (isSync ? ExecaSyncError : ExecaError)(message, originalError instanceof DiscardedError ? {} : { cause: originalError });
};
var DiscardedError = class extends Error {};
const setErrorName = (ErrorClass, value) => {
	Object.defineProperty(ErrorClass.prototype, "name", {
		value,
		writable: true,
		enumerable: false,
		configurable: true
	});
	Object.defineProperty(ErrorClass.prototype, execaErrorSymbol, {
		value: true,
		writable: false,
		enumerable: false,
		configurable: false
	});
};
const isExecaError = (error) => isErrorInstance(error) && execaErrorSymbol in error;
const execaErrorSymbol = Symbol("isExecaError");
const isErrorInstance = (value) => Object.prototype.toString.call(value) === "[object Error]";
var ExecaError = class extends Error {};
setErrorName(ExecaError, ExecaError.name);
var ExecaSyncError = class extends Error {};
setErrorName(ExecaSyncError, ExecaSyncError.name);
//#endregion
//#region node_modules/human-signals/build/src/realtime.js
const getRealtimeSignals = () => {
	const length = 64 - SIGRTMIN + 1;
	return Array.from({ length }, getRealtimeSignal);
};
const getRealtimeSignal = (value, index) => ({
	name: `SIGRT${index + 1}`,
	number: SIGRTMIN + index,
	action: "terminate",
	description: "Application-specific signal (realtime)",
	standard: "posix"
});
const SIGRTMIN = 34;
//#endregion
//#region node_modules/human-signals/build/src/core.js
const SIGNALS = [
	{
		name: "SIGHUP",
		number: 1,
		action: "terminate",
		description: "Terminal closed",
		standard: "posix"
	},
	{
		name: "SIGINT",
		number: 2,
		action: "terminate",
		description: "User interruption with CTRL-C",
		standard: "ansi"
	},
	{
		name: "SIGQUIT",
		number: 3,
		action: "core",
		description: "User interruption with CTRL-\\",
		standard: "posix"
	},
	{
		name: "SIGILL",
		number: 4,
		action: "core",
		description: "Invalid machine instruction",
		standard: "ansi"
	},
	{
		name: "SIGTRAP",
		number: 5,
		action: "core",
		description: "Debugger breakpoint",
		standard: "posix"
	},
	{
		name: "SIGABRT",
		number: 6,
		action: "core",
		description: "Aborted",
		standard: "ansi"
	},
	{
		name: "SIGIOT",
		number: 6,
		action: "core",
		description: "Aborted",
		standard: "bsd"
	},
	{
		name: "SIGBUS",
		number: 7,
		action: "core",
		description: "Bus error due to misaligned, non-existing address or paging error",
		standard: "bsd"
	},
	{
		name: "SIGEMT",
		number: 7,
		action: "terminate",
		description: "Command should be emulated but is not implemented",
		standard: "other"
	},
	{
		name: "SIGFPE",
		number: 8,
		action: "core",
		description: "Floating point arithmetic error",
		standard: "ansi"
	},
	{
		name: "SIGKILL",
		number: 9,
		action: "terminate",
		description: "Forced termination",
		standard: "posix",
		forced: true
	},
	{
		name: "SIGUSR1",
		number: 10,
		action: "terminate",
		description: "Application-specific signal",
		standard: "posix"
	},
	{
		name: "SIGSEGV",
		number: 11,
		action: "core",
		description: "Segmentation fault",
		standard: "ansi"
	},
	{
		name: "SIGUSR2",
		number: 12,
		action: "terminate",
		description: "Application-specific signal",
		standard: "posix"
	},
	{
		name: "SIGPIPE",
		number: 13,
		action: "terminate",
		description: "Broken pipe or socket",
		standard: "posix"
	},
	{
		name: "SIGALRM",
		number: 14,
		action: "terminate",
		description: "Timeout or timer",
		standard: "posix"
	},
	{
		name: "SIGTERM",
		number: 15,
		action: "terminate",
		description: "Termination",
		standard: "ansi"
	},
	{
		name: "SIGSTKFLT",
		number: 16,
		action: "terminate",
		description: "Stack is empty or overflowed",
		standard: "other"
	},
	{
		name: "SIGCHLD",
		number: 17,
		action: "ignore",
		description: "Child process terminated, paused or unpaused",
		standard: "posix"
	},
	{
		name: "SIGCLD",
		number: 17,
		action: "ignore",
		description: "Child process terminated, paused or unpaused",
		standard: "other"
	},
	{
		name: "SIGCONT",
		number: 18,
		action: "unpause",
		description: "Unpaused",
		standard: "posix",
		forced: true
	},
	{
		name: "SIGSTOP",
		number: 19,
		action: "pause",
		description: "Paused",
		standard: "posix",
		forced: true
	},
	{
		name: "SIGTSTP",
		number: 20,
		action: "pause",
		description: "Paused using CTRL-Z or \"suspend\"",
		standard: "posix"
	},
	{
		name: "SIGTTIN",
		number: 21,
		action: "pause",
		description: "Background process cannot read terminal input",
		standard: "posix"
	},
	{
		name: "SIGBREAK",
		number: 21,
		action: "terminate",
		description: "User interruption with CTRL-BREAK",
		standard: "other"
	},
	{
		name: "SIGTTOU",
		number: 22,
		action: "pause",
		description: "Background process cannot write to terminal output",
		standard: "posix"
	},
	{
		name: "SIGURG",
		number: 23,
		action: "ignore",
		description: "Socket received out-of-band data",
		standard: "bsd"
	},
	{
		name: "SIGXCPU",
		number: 24,
		action: "core",
		description: "Process timed out",
		standard: "bsd"
	},
	{
		name: "SIGXFSZ",
		number: 25,
		action: "core",
		description: "File too big",
		standard: "bsd"
	},
	{
		name: "SIGVTALRM",
		number: 26,
		action: "terminate",
		description: "Timeout or timer",
		standard: "bsd"
	},
	{
		name: "SIGPROF",
		number: 27,
		action: "terminate",
		description: "Timeout or timer",
		standard: "bsd"
	},
	{
		name: "SIGWINCH",
		number: 28,
		action: "ignore",
		description: "Terminal window size changed",
		standard: "bsd"
	},
	{
		name: "SIGIO",
		number: 29,
		action: "terminate",
		description: "I/O is available",
		standard: "other"
	},
	{
		name: "SIGPOLL",
		number: 29,
		action: "terminate",
		description: "Watched event",
		standard: "other"
	},
	{
		name: "SIGINFO",
		number: 29,
		action: "ignore",
		description: "Request for process information",
		standard: "other"
	},
	{
		name: "SIGPWR",
		number: 30,
		action: "terminate",
		description: "Device running out of power",
		standard: "systemv"
	},
	{
		name: "SIGSYS",
		number: 31,
		action: "core",
		description: "Invalid system call",
		standard: "other"
	},
	{
		name: "SIGUNUSED",
		number: 31,
		action: "terminate",
		description: "Invalid system call",
		standard: "other"
	}
];
//#endregion
//#region node_modules/human-signals/build/src/signals.js
const getSignals = () => {
	const realtimeSignals = getRealtimeSignals();
	return [...SIGNALS, ...realtimeSignals].map(normalizeSignal$1);
};
const normalizeSignal$1 = ({ name, number: defaultNumber, description, action, forced = false, standard }) => {
	const { signals: { [name]: constantSignal } } = constants;
	const supported = constantSignal !== void 0;
	return {
		name,
		number: supported ? constantSignal : defaultNumber,
		description,
		supported,
		action,
		forced,
		standard
	};
};
//#endregion
//#region node_modules/human-signals/build/src/main.js
const getSignalsByName = () => {
	const signals = getSignals();
	return Object.fromEntries(signals.map(getSignalByName));
};
const getSignalByName = ({ name, number, description, supported, action, forced, standard }) => [name, {
	name,
	number,
	description,
	supported,
	action,
	forced,
	standard
}];
const signalsByName = getSignalsByName();
const getSignalsByNumber = () => {
	const signals = getSignals();
	const signalsA = Array.from({ length: 65 }, (value, number) => getSignalByNumber(number, signals));
	return Object.assign({}, ...signalsA);
};
const getSignalByNumber = (number, signals) => {
	const signal = findSignalByNumber(number, signals);
	if (signal === void 0) return {};
	const { name, description, supported, action, forced, standard } = signal;
	return { [number]: {
		name,
		number,
		description,
		supported,
		action,
		forced,
		standard
	} };
};
const findSignalByNumber = (number, signals) => {
	const signal = signals.find(({ name }) => constants.signals[name] === number);
	if (signal !== void 0) return signal;
	return signals.find((signalA) => signalA.number === number);
};
getSignalsByNumber();
//#endregion
//#region node_modules/execa/lib/terminate/signal.js
const normalizeKillSignal = (killSignal) => {
	const optionName = "option `killSignal`";
	if (killSignal === 0) throw new TypeError(`Invalid ${optionName}: 0 cannot be used.`);
	return normalizeSignal(killSignal, optionName);
};
const normalizeSignalArgument = (signal) => signal === 0 ? signal : normalizeSignal(signal, "`subprocess.kill()`'s argument");
const normalizeSignal = (signalNameOrInteger, optionName) => {
	if (Number.isInteger(signalNameOrInteger)) return normalizeSignalInteger(signalNameOrInteger, optionName);
	if (typeof signalNameOrInteger === "string") return normalizeSignalName(signalNameOrInteger, optionName);
	throw new TypeError(`Invalid ${optionName} ${String(signalNameOrInteger)}: it must be a string or an integer.\n${getAvailableSignals()}`);
};
const normalizeSignalInteger = (signalInteger, optionName) => {
	if (signalsIntegerToName.has(signalInteger)) return signalsIntegerToName.get(signalInteger);
	throw new TypeError(`Invalid ${optionName} ${signalInteger}: this signal integer does not exist.\n${getAvailableSignals()}`);
};
const getSignalsIntegerToName = () => new Map(Object.entries(constants.signals).reverse().map(([signalName, signalInteger]) => [signalInteger, signalName]));
const signalsIntegerToName = getSignalsIntegerToName();
const normalizeSignalName = (signalName, optionName) => {
	if (signalName in constants.signals) return signalName;
	if (signalName.toUpperCase() in constants.signals) throw new TypeError(`Invalid ${optionName} '${signalName}': please rename it to '${signalName.toUpperCase()}'.`);
	throw new TypeError(`Invalid ${optionName} '${signalName}': this signal name does not exist.\n${getAvailableSignals()}`);
};
const getAvailableSignals = () => `Available signal names: ${getAvailableSignalNames()}.
Available signal numbers: ${getAvailableSignalIntegers()}.`;
const getAvailableSignalNames = () => Object.keys(constants.signals).sort().map((signalName) => `'${signalName}'`).join(", ");
const getAvailableSignalIntegers = () => [...new Set(Object.values(constants.signals).sort((signalInteger, signalIntegerTwo) => signalInteger - signalIntegerTwo))].join(", ");
const getSignalDescription = (signal) => signalsByName[signal].description;
//#endregion
//#region node_modules/execa/lib/terminate/kill.js
const normalizeForceKillAfterDelay = (forceKillAfterDelay) => {
	if (forceKillAfterDelay === false) return forceKillAfterDelay;
	if (forceKillAfterDelay === true) return DEFAULT_FORCE_KILL_TIMEOUT;
	if (!Number.isFinite(forceKillAfterDelay) || forceKillAfterDelay < 0) throw new TypeError(`Expected the \`forceKillAfterDelay\` option to be a non-negative integer, got \`${forceKillAfterDelay}\` (${typeof forceKillAfterDelay})`);
	return forceKillAfterDelay;
};
const DEFAULT_FORCE_KILL_TIMEOUT = 1e3 * 5;
const subprocessKill = ({ kill, options: { forceKillAfterDelay, killSignal }, onInternalError, context, controller }, signalOrError, errorArgument) => {
	const { signal, error } = parseKillArguments(signalOrError, errorArgument, killSignal);
	emitKillError(error, onInternalError);
	const killResult = kill(signal);
	setKillTimeout({
		kill,
		signal,
		forceKillAfterDelay,
		killSignal,
		killResult,
		context,
		controller
	});
	return killResult;
};
const parseKillArguments = (signalOrError, errorArgument, killSignal) => {
	const [signal = killSignal, error] = isErrorInstance(signalOrError) ? [void 0, signalOrError] : [signalOrError, errorArgument];
	if (typeof signal !== "string" && !Number.isInteger(signal)) throw new TypeError(`The first argument must be an error instance or a signal name string/integer: ${String(signal)}`);
	if (error !== void 0 && !isErrorInstance(error)) throw new TypeError(`The second argument is optional. If specified, it must be an error instance: ${error}`);
	return {
		signal: normalizeSignalArgument(signal),
		error
	};
};
const emitKillError = (error, onInternalError) => {
	if (error !== void 0) onInternalError.reject(error);
};
const setKillTimeout = async ({ kill, signal, forceKillAfterDelay, killSignal, killResult, context, controller }) => {
	if (signal === killSignal && killResult) killOnTimeout({
		kill,
		forceKillAfterDelay,
		context,
		controllerSignal: controller.signal
	});
};
const killOnTimeout = async ({ kill, forceKillAfterDelay, context, controllerSignal }) => {
	if (forceKillAfterDelay === false) return;
	try {
		await setTimeout$1(forceKillAfterDelay, void 0, { signal: controllerSignal });
		if (kill("SIGKILL")) context.isForcefullyTerminated ??= true;
	} catch {}
};
//#endregion
//#region node_modules/execa/lib/utils/abort-signal.js
const onAbortedSignal = async (mainSignal, stopSignal) => {
	if (!mainSignal.aborted) await once(mainSignal, "abort", { signal: stopSignal });
};
//#endregion
//#region node_modules/execa/lib/terminate/cancel.js
const validateCancelSignal = ({ cancelSignal }) => {
	if (cancelSignal !== void 0 && Object.prototype.toString.call(cancelSignal) !== "[object AbortSignal]") throw new Error(`The \`cancelSignal\` option must be an AbortSignal: ${String(cancelSignal)}`);
};
const throwOnCancel = ({ subprocess, cancelSignal, gracefulCancel, context, controller }) => cancelSignal === void 0 || gracefulCancel ? [] : [terminateOnCancel(subprocess, cancelSignal, context, controller)];
const terminateOnCancel = async (subprocess, cancelSignal, context, { signal }) => {
	await onAbortedSignal(cancelSignal, signal);
	context.terminationReason ??= "cancel";
	subprocess.kill();
	throw cancelSignal.reason;
};
//#endregion
//#region node_modules/execa/lib/ipc/validation.js
const validateIpcMethod = ({ methodName, isSubprocess, ipc, isConnected }) => {
	validateIpcOption(methodName, isSubprocess, ipc);
	validateConnection(methodName, isSubprocess, isConnected);
};
const validateIpcOption = (methodName, isSubprocess, ipc) => {
	if (!ipc) throw new Error(`${getMethodName(methodName, isSubprocess)} can only be used if the \`ipc\` option is \`true\`.`);
};
const validateConnection = (methodName, isSubprocess, isConnected) => {
	if (!isConnected) throw new Error(`${getMethodName(methodName, isSubprocess)} cannot be used: the ${getOtherProcessName(isSubprocess)} has already exited or disconnected.`);
};
const throwOnEarlyDisconnect = (isSubprocess) => {
	throw new Error(`${getMethodName("getOneMessage", isSubprocess)} could not complete: the ${getOtherProcessName(isSubprocess)} exited or disconnected.`);
};
const throwOnStrictDeadlockError = (isSubprocess) => {
	throw new Error(`${getMethodName("sendMessage", isSubprocess)} failed: the ${getOtherProcessName(isSubprocess)} is sending a message too, instead of listening to incoming messages.
This can be fixed by both sending a message and listening to incoming messages at the same time:

const [receivedMessage] = await Promise.all([
	${getMethodName("getOneMessage", isSubprocess)},
	${getMethodName("sendMessage", isSubprocess, "message, {strict: true}")},
]);`);
};
const getStrictResponseError = (error, isSubprocess) => new Error(`${getMethodName("sendMessage", isSubprocess)} failed when sending an acknowledgment response to the ${getOtherProcessName(isSubprocess)}.`, { cause: error });
const throwOnMissingStrict = (isSubprocess) => {
	throw new Error(`${getMethodName("sendMessage", isSubprocess)} failed: the ${getOtherProcessName(isSubprocess)} is not listening to incoming messages.`);
};
const throwOnStrictDisconnect = (isSubprocess) => {
	throw new Error(`${getMethodName("sendMessage", isSubprocess)} failed: the ${getOtherProcessName(isSubprocess)} exited without listening to incoming messages.`);
};
const getAbortDisconnectError = () => /* @__PURE__ */ new Error(`\`cancelSignal\` aborted: the ${getOtherProcessName(true)} disconnected.`);
const throwOnMissingParent = () => {
	throw new Error("`getCancelSignal()` cannot be used without setting the `cancelSignal` subprocess option.");
};
const handleEpipeError = ({ error, methodName, isSubprocess }) => {
	if (error.code === "EPIPE") throw new Error(`${getMethodName(methodName, isSubprocess)} cannot be used: the ${getOtherProcessName(isSubprocess)} is disconnecting.`, { cause: error });
};
const handleSerializationError = ({ error, methodName, isSubprocess, message }) => {
	if (isSerializationError(error)) throw new Error(`${getMethodName(methodName, isSubprocess)}'s argument type is invalid: the message cannot be serialized: ${String(message)}.`, { cause: error });
};
const isSerializationError = ({ code, message }) => SERIALIZATION_ERROR_CODES.has(code) || SERIALIZATION_ERROR_MESSAGES.some((serializationErrorMessage) => message.includes(serializationErrorMessage));
const SERIALIZATION_ERROR_CODES = new Set(["ERR_MISSING_ARGS", "ERR_INVALID_ARG_TYPE"]);
const SERIALIZATION_ERROR_MESSAGES = [
	"could not be cloned",
	"circular structure",
	"call stack size exceeded"
];
const getMethodName = (methodName, isSubprocess, parameters = "") => methodName === "cancelSignal" ? "`cancelSignal`'s `controller.abort()`" : `${getNamespaceName(isSubprocess)}${methodName}(${parameters})`;
const getNamespaceName = (isSubprocess) => isSubprocess ? "" : "subprocess.";
const getOtherProcessName = (isSubprocess) => isSubprocess ? "parent process" : "subprocess";
const disconnect = (anyProcess) => {
	if (anyProcess.connected) anyProcess.disconnect();
};
//#endregion
//#region node_modules/execa/lib/utils/deferred.js
const createDeferred = () => {
	const methods = {};
	const promise = new Promise((resolve, reject) => {
		Object.assign(methods, {
			resolve,
			reject
		});
	});
	return Object.assign(promise, methods);
};
//#endregion
//#region node_modules/execa/lib/arguments/fd-options.js
const getToStream = (destination, to = "stdin") => {
	const isWritable = true;
	const { options, fileDescriptors } = SUBPROCESS_OPTIONS.get(destination);
	const fdNumber = getFdNumber(fileDescriptors, to, isWritable);
	const destinationStream = destination.stdio[fdNumber];
	if (destinationStream === null) throw new TypeError(getInvalidStdioOptionMessage(fdNumber, to, options, isWritable));
	return destinationStream;
};
const getFromStream = (source, from = "stdout") => {
	const isWritable = false;
	const { options, fileDescriptors } = SUBPROCESS_OPTIONS.get(source);
	const fdNumber = getFdNumber(fileDescriptors, from, isWritable);
	const sourceStream = fdNumber === "all" ? source.all : source.stdio[fdNumber];
	if (sourceStream === null || sourceStream === void 0) throw new TypeError(getInvalidStdioOptionMessage(fdNumber, from, options, isWritable));
	return sourceStream;
};
const SUBPROCESS_OPTIONS = /* @__PURE__ */ new WeakMap();
const getFdNumber = (fileDescriptors, fdName, isWritable) => {
	const fdNumber = parseFdNumber(fdName, isWritable);
	validateFdNumber(fdNumber, fdName, isWritable, fileDescriptors);
	return fdNumber;
};
const parseFdNumber = (fdName, isWritable) => {
	const fdNumber = parseFd(fdName);
	if (fdNumber !== void 0) return fdNumber;
	const { validOptions, defaultValue } = isWritable ? {
		validOptions: "\"stdin\"",
		defaultValue: "stdin"
	} : {
		validOptions: "\"stdout\", \"stderr\", \"all\"",
		defaultValue: "stdout"
	};
	throw new TypeError(`"${getOptionName(isWritable)}" must not be "${fdName}".
It must be ${validOptions} or "fd3", "fd4" (and so on).
It is optional and defaults to "${defaultValue}".`);
};
const validateFdNumber = (fdNumber, fdName, isWritable, fileDescriptors) => {
	const fileDescriptor = fileDescriptors[getUsedDescriptor(fdNumber)];
	if (fileDescriptor === void 0) throw new TypeError(`"${getOptionName(isWritable)}" must not be ${fdName}. That file descriptor does not exist.
Please set the "stdio" option to ensure that file descriptor exists.`);
	if (fileDescriptor.direction === "input" && !isWritable) throw new TypeError(`"${getOptionName(isWritable)}" must not be ${fdName}. It must be a readable stream, not writable.`);
	if (fileDescriptor.direction !== "input" && isWritable) throw new TypeError(`"${getOptionName(isWritable)}" must not be ${fdName}. It must be a writable stream, not readable.`);
};
const getInvalidStdioOptionMessage = (fdNumber, fdName, options, isWritable) => {
	if (fdNumber === "all" && !options.all) return "The \"all\" option must be true to use \"from: 'all'\".";
	const { optionName, optionValue } = getInvalidStdioOption(fdNumber, options);
	return `The "${optionName}: ${serializeOptionValue(optionValue)}" option is incompatible with using "${getOptionName(isWritable)}: ${serializeOptionValue(fdName)}".
Please set this option with "pipe" instead.`;
};
const getInvalidStdioOption = (fdNumber, { stdin, stdout, stderr, stdio }) => {
	const usedDescriptor = getUsedDescriptor(fdNumber);
	if (usedDescriptor === 0 && stdin !== void 0) return {
		optionName: "stdin",
		optionValue: stdin
	};
	if (usedDescriptor === 1 && stdout !== void 0) return {
		optionName: "stdout",
		optionValue: stdout
	};
	if (usedDescriptor === 2 && stderr !== void 0) return {
		optionName: "stderr",
		optionValue: stderr
	};
	return {
		optionName: `stdio[${usedDescriptor}]`,
		optionValue: stdio[usedDescriptor]
	};
};
const getUsedDescriptor = (fdNumber) => fdNumber === "all" ? 1 : fdNumber;
const getOptionName = (isWritable) => isWritable ? "to" : "from";
const serializeOptionValue = (value) => {
	if (typeof value === "string") return `'${value}'`;
	return typeof value === "number" ? `${value}` : "Stream";
};
//#endregion
//#region node_modules/execa/lib/utils/max-listeners.js
const incrementMaxListeners = (eventEmitter, maxListenersIncrement, signal) => {
	const maxListeners = eventEmitter.getMaxListeners();
	if (maxListeners === 0 || maxListeners === Number.POSITIVE_INFINITY) return;
	eventEmitter.setMaxListeners(maxListeners + maxListenersIncrement);
	addAbortListener(signal, () => {
		eventEmitter.setMaxListeners(eventEmitter.getMaxListeners() - maxListenersIncrement);
	});
};
//#endregion
//#region node_modules/execa/lib/ipc/reference.js
const addReference = (channel, reference) => {
	if (reference) addReferenceCount(channel);
};
const addReferenceCount = (channel) => {
	channel.refCounted();
};
const removeReference = (channel, reference) => {
	if (reference) removeReferenceCount(channel);
};
const removeReferenceCount = (channel) => {
	channel.unrefCounted();
};
const undoAddedReferences = (channel, isSubprocess) => {
	if (isSubprocess) {
		removeReferenceCount(channel);
		removeReferenceCount(channel);
	}
};
const redoAddedReferences = (channel, isSubprocess) => {
	if (isSubprocess) {
		addReferenceCount(channel);
		addReferenceCount(channel);
	}
};
//#endregion
//#region node_modules/execa/lib/ipc/incoming.js
const onMessage = async ({ anyProcess, channel, isSubprocess, ipcEmitter }, wrappedMessage) => {
	if (handleStrictResponse(wrappedMessage) || handleAbort(wrappedMessage)) return;
	if (!INCOMING_MESSAGES.has(anyProcess)) INCOMING_MESSAGES.set(anyProcess, []);
	const incomingMessages = INCOMING_MESSAGES.get(anyProcess);
	incomingMessages.push(wrappedMessage);
	if (incomingMessages.length > 1) return;
	while (incomingMessages.length > 0) {
		await waitForOutgoingMessages(anyProcess, ipcEmitter, wrappedMessage);
		await scheduler.yield();
		const message = await handleStrictRequest({
			wrappedMessage: incomingMessages[0],
			anyProcess,
			channel,
			isSubprocess,
			ipcEmitter
		});
		incomingMessages.shift();
		ipcEmitter.emit("message", message);
		ipcEmitter.emit("message:done");
	}
};
const onDisconnect = async ({ anyProcess, channel, isSubprocess, ipcEmitter, boundOnMessage }) => {
	abortOnDisconnect();
	const incomingMessages = INCOMING_MESSAGES.get(anyProcess);
	while (incomingMessages?.length > 0) await once(ipcEmitter, "message:done");
	anyProcess.removeListener("message", boundOnMessage);
	redoAddedReferences(channel, isSubprocess);
	ipcEmitter.connected = false;
	ipcEmitter.emit("disconnect");
};
const INCOMING_MESSAGES = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/execa/lib/ipc/forward.js
const getIpcEmitter = (anyProcess, channel, isSubprocess) => {
	if (IPC_EMITTERS.has(anyProcess)) return IPC_EMITTERS.get(anyProcess);
	const ipcEmitter = new EventEmitter();
	ipcEmitter.connected = true;
	IPC_EMITTERS.set(anyProcess, ipcEmitter);
	forwardEvents({
		ipcEmitter,
		anyProcess,
		channel,
		isSubprocess
	});
	return ipcEmitter;
};
const IPC_EMITTERS = /* @__PURE__ */ new WeakMap();
const forwardEvents = ({ ipcEmitter, anyProcess, channel, isSubprocess }) => {
	const boundOnMessage = onMessage.bind(void 0, {
		anyProcess,
		channel,
		isSubprocess,
		ipcEmitter
	});
	anyProcess.on("message", boundOnMessage);
	anyProcess.once("disconnect", onDisconnect.bind(void 0, {
		anyProcess,
		channel,
		isSubprocess,
		ipcEmitter,
		boundOnMessage
	}));
	undoAddedReferences(channel, isSubprocess);
};
const isConnected = (anyProcess) => {
	const ipcEmitter = IPC_EMITTERS.get(anyProcess);
	return ipcEmitter === void 0 ? anyProcess.channel !== null : ipcEmitter.connected;
};
//#endregion
//#region node_modules/execa/lib/ipc/strict.js
const handleSendStrict = ({ anyProcess, channel, isSubprocess, message, strict }) => {
	if (!strict) return message;
	const hasListeners = hasMessageListeners(anyProcess, getIpcEmitter(anyProcess, channel, isSubprocess));
	return {
		id: count++,
		type: REQUEST_TYPE,
		message,
		hasListeners
	};
};
let count = 0n;
const validateStrictDeadlock = (outgoingMessages, wrappedMessage) => {
	if (wrappedMessage?.type !== REQUEST_TYPE || wrappedMessage.hasListeners) return;
	for (const { id } of outgoingMessages) if (id !== void 0) STRICT_RESPONSES[id].resolve({
		isDeadlock: true,
		hasListeners: false
	});
};
const handleStrictRequest = async ({ wrappedMessage, anyProcess, channel, isSubprocess, ipcEmitter }) => {
	if (wrappedMessage?.type !== REQUEST_TYPE || !anyProcess.connected) return wrappedMessage;
	const { id, message } = wrappedMessage;
	const response = {
		id,
		type: RESPONSE_TYPE,
		message: hasMessageListeners(anyProcess, ipcEmitter)
	};
	try {
		await sendMessage$1({
			anyProcess,
			channel,
			isSubprocess,
			ipc: true
		}, response);
	} catch (error) {
		ipcEmitter.emit("strict:error", error);
	}
	return message;
};
const handleStrictResponse = (wrappedMessage) => {
	if (wrappedMessage?.type !== RESPONSE_TYPE) return false;
	const { id, message: hasListeners } = wrappedMessage;
	STRICT_RESPONSES[id]?.resolve({
		isDeadlock: false,
		hasListeners
	});
	return true;
};
const waitForStrictResponse = async (wrappedMessage, anyProcess, isSubprocess) => {
	if (wrappedMessage?.type !== REQUEST_TYPE) return;
	const deferred = createDeferred();
	STRICT_RESPONSES[wrappedMessage.id] = deferred;
	const controller = new AbortController();
	try {
		const { isDeadlock, hasListeners } = await Promise.race([deferred, throwOnDisconnect$1(anyProcess, isSubprocess, controller)]);
		if (isDeadlock) throwOnStrictDeadlockError(isSubprocess);
		if (!hasListeners) throwOnMissingStrict(isSubprocess);
	} finally {
		controller.abort();
		delete STRICT_RESPONSES[wrappedMessage.id];
	}
};
const STRICT_RESPONSES = {};
const throwOnDisconnect$1 = async (anyProcess, isSubprocess, { signal }) => {
	incrementMaxListeners(anyProcess, 1, signal);
	await once(anyProcess, "disconnect", { signal });
	throwOnStrictDisconnect(isSubprocess);
};
const REQUEST_TYPE = "execa:ipc:request";
const RESPONSE_TYPE = "execa:ipc:response";
//#endregion
//#region node_modules/execa/lib/ipc/outgoing.js
const startSendMessage = (anyProcess, wrappedMessage, strict) => {
	if (!OUTGOING_MESSAGES.has(anyProcess)) OUTGOING_MESSAGES.set(anyProcess, /* @__PURE__ */ new Set());
	const outgoingMessages = OUTGOING_MESSAGES.get(anyProcess);
	const outgoingMessage = {
		onMessageSent: createDeferred(),
		id: strict ? wrappedMessage.id : void 0
	};
	outgoingMessages.add(outgoingMessage);
	return {
		outgoingMessages,
		outgoingMessage
	};
};
const endSendMessage = ({ outgoingMessages, outgoingMessage }) => {
	outgoingMessages.delete(outgoingMessage);
	outgoingMessage.onMessageSent.resolve();
};
const waitForOutgoingMessages = async (anyProcess, ipcEmitter, wrappedMessage) => {
	while (!hasMessageListeners(anyProcess, ipcEmitter) && OUTGOING_MESSAGES.get(anyProcess)?.size > 0) {
		const outgoingMessages = [...OUTGOING_MESSAGES.get(anyProcess)];
		validateStrictDeadlock(outgoingMessages, wrappedMessage);
		await Promise.all(outgoingMessages.map(({ onMessageSent }) => onMessageSent));
	}
};
const OUTGOING_MESSAGES = /* @__PURE__ */ new WeakMap();
const hasMessageListeners = (anyProcess, ipcEmitter) => ipcEmitter.listenerCount("message") > getMinListenerCount(anyProcess);
const getMinListenerCount = (anyProcess) => SUBPROCESS_OPTIONS.has(anyProcess) && !getFdSpecificValue(SUBPROCESS_OPTIONS.get(anyProcess).options.buffer, "ipc") ? 1 : 0;
//#endregion
//#region node_modules/execa/lib/ipc/send.js
const sendMessage$1 = ({ anyProcess, channel, isSubprocess, ipc }, message, { strict = false } = {}) => {
	const methodName = "sendMessage";
	validateIpcMethod({
		methodName,
		isSubprocess,
		ipc,
		isConnected: anyProcess.connected
	});
	return sendMessageAsync({
		anyProcess,
		channel,
		methodName,
		isSubprocess,
		message,
		strict
	});
};
const sendMessageAsync = async ({ anyProcess, channel, methodName, isSubprocess, message, strict }) => {
	const wrappedMessage = handleSendStrict({
		anyProcess,
		channel,
		isSubprocess,
		message,
		strict
	});
	const outgoingMessagesState = startSendMessage(anyProcess, wrappedMessage, strict);
	try {
		await sendOneMessage({
			anyProcess,
			methodName,
			isSubprocess,
			wrappedMessage,
			message
		});
	} catch (error) {
		disconnect(anyProcess);
		throw error;
	} finally {
		endSendMessage(outgoingMessagesState);
	}
};
const sendOneMessage = async ({ anyProcess, methodName, isSubprocess, wrappedMessage, message }) => {
	const sendMethod = getSendMethod(anyProcess);
	try {
		await Promise.all([waitForStrictResponse(wrappedMessage, anyProcess, isSubprocess), sendMethod(wrappedMessage)]);
	} catch (error) {
		handleEpipeError({
			error,
			methodName,
			isSubprocess
		});
		handleSerializationError({
			error,
			methodName,
			isSubprocess,
			message
		});
		throw error;
	}
};
const getSendMethod = (anyProcess) => {
	if (PROCESS_SEND_METHODS.has(anyProcess)) return PROCESS_SEND_METHODS.get(anyProcess);
	const sendMethod = promisify(anyProcess.send.bind(anyProcess));
	PROCESS_SEND_METHODS.set(anyProcess, sendMethod);
	return sendMethod;
};
const PROCESS_SEND_METHODS = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/execa/lib/ipc/graceful.js
const sendAbort = (subprocess, message) => {
	const methodName = "cancelSignal";
	validateConnection(methodName, false, subprocess.connected);
	return sendOneMessage({
		anyProcess: subprocess,
		methodName,
		isSubprocess: false,
		wrappedMessage: {
			type: GRACEFUL_CANCEL_TYPE,
			message
		},
		message
	});
};
const getCancelSignal$1 = async ({ anyProcess, channel, isSubprocess, ipc }) => {
	await startIpc({
		anyProcess,
		channel,
		isSubprocess,
		ipc
	});
	return cancelController.signal;
};
const startIpc = async ({ anyProcess, channel, isSubprocess, ipc }) => {
	if (cancelListening) return;
	cancelListening = true;
	if (!ipc) {
		throwOnMissingParent();
		return;
	}
	if (channel === null) {
		abortOnDisconnect();
		return;
	}
	getIpcEmitter(anyProcess, channel, isSubprocess);
	await scheduler.yield();
};
let cancelListening = false;
const handleAbort = (wrappedMessage) => {
	if (wrappedMessage?.type !== GRACEFUL_CANCEL_TYPE) return false;
	cancelController.abort(wrappedMessage.message);
	return true;
};
const GRACEFUL_CANCEL_TYPE = "execa:ipc:cancel";
const abortOnDisconnect = () => {
	cancelController.abort(getAbortDisconnectError());
};
const cancelController = new AbortController();
//#endregion
//#region node_modules/execa/lib/terminate/graceful.js
const validateGracefulCancel = ({ gracefulCancel, cancelSignal, ipc, serialization }) => {
	if (!gracefulCancel) return;
	if (cancelSignal === void 0) throw new Error("The `cancelSignal` option must be defined when setting the `gracefulCancel` option.");
	if (!ipc) throw new Error("The `ipc` option cannot be false when setting the `gracefulCancel` option.");
	if (serialization === "json") throw new Error("The `serialization` option cannot be 'json' when setting the `gracefulCancel` option.");
};
const throwOnGracefulCancel = ({ subprocess, cancelSignal, gracefulCancel, forceKillAfterDelay, context, controller }) => gracefulCancel ? [sendOnAbort({
	subprocess,
	cancelSignal,
	forceKillAfterDelay,
	context,
	controller
})] : [];
const sendOnAbort = async ({ subprocess, cancelSignal, forceKillAfterDelay, context, controller: { signal } }) => {
	await onAbortedSignal(cancelSignal, signal);
	await sendAbort(subprocess, getReason(cancelSignal));
	killOnTimeout({
		kill: subprocess.kill,
		forceKillAfterDelay,
		context,
		controllerSignal: signal
	});
	context.terminationReason ??= "gracefulCancel";
	throw cancelSignal.reason;
};
const getReason = ({ reason }) => {
	if (!(reason instanceof DOMException)) return reason;
	const error = new Error(reason.message);
	Object.defineProperty(error, "stack", {
		value: reason.stack,
		enumerable: false,
		configurable: true,
		writable: true
	});
	return error;
};
//#endregion
//#region node_modules/execa/lib/terminate/timeout.js
const validateTimeout = ({ timeout }) => {
	if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
};
const throwOnTimeout = (subprocess, timeout, context, controller) => timeout === 0 || timeout === void 0 ? [] : [killAfterTimeout(subprocess, timeout, context, controller)];
const killAfterTimeout = async (subprocess, timeout, context, { signal }) => {
	await setTimeout$1(timeout, void 0, { signal });
	context.terminationReason ??= "timeout";
	subprocess.kill();
	throw new DiscardedError();
};
//#endregion
//#region node_modules/execa/lib/methods/node.js
const mapNode = ({ options }) => {
	if (options.node === false) throw new TypeError("The \"node\" option cannot be false with `execaNode()`.");
	return { options: {
		...options,
		node: true
	} };
};
const handleNodeOption = (file, commandArguments, { node: shouldHandleNode = false, nodePath = execPath, nodeOptions = execArgv.filter((nodeOption) => !nodeOption.startsWith("--inspect")), cwd, execPath: formerNodePath, ...options }) => {
	if (formerNodePath !== void 0) throw new TypeError("The \"execPath\" option has been removed. Please use the \"nodePath\" option instead.");
	const normalizedNodePath = safeNormalizeFileUrl(nodePath, "The \"nodePath\" option");
	const resolvedNodePath = path.resolve(cwd, normalizedNodePath);
	const newOptions = {
		...options,
		nodePath: resolvedNodePath,
		node: shouldHandleNode,
		cwd
	};
	if (!shouldHandleNode) return [
		file,
		commandArguments,
		newOptions
	];
	if (path.basename(file, ".exe") === "node") throw new TypeError("When the \"node\" option is true, the first argument does not need to be \"node\".");
	return [
		resolvedNodePath,
		[
			...nodeOptions,
			file,
			...commandArguments
		],
		{
			ipc: true,
			...newOptions,
			shell: false
		}
	];
};
//#endregion
//#region node_modules/execa/lib/ipc/ipc-input.js
const validateIpcInputOption = ({ ipcInput, ipc, serialization }) => {
	if (ipcInput === void 0) return;
	if (!ipc) throw new Error("The `ipcInput` option cannot be set unless the `ipc` option is `true`.");
	validateIpcInput[serialization](ipcInput);
};
const validateAdvancedInput = (ipcInput) => {
	try {
		serialize(ipcInput);
	} catch (error) {
		throw new Error("The `ipcInput` option is not serializable with a structured clone.", { cause: error });
	}
};
const validateJsonInput = (ipcInput) => {
	try {
		JSON.stringify(ipcInput);
	} catch (error) {
		throw new Error("The `ipcInput` option is not serializable with JSON.", { cause: error });
	}
};
const validateIpcInput = {
	advanced: validateAdvancedInput,
	json: validateJsonInput
};
const sendIpcInput = async (subprocess, ipcInput) => {
	if (ipcInput === void 0) return;
	await subprocess.sendMessage(ipcInput);
};
//#endregion
//#region node_modules/execa/lib/arguments/encoding-option.js
const validateEncoding = ({ encoding }) => {
	if (ENCODINGS.has(encoding)) return;
	const correctEncoding = getCorrectEncoding(encoding);
	if (correctEncoding !== void 0) throw new TypeError(`Invalid option \`encoding: ${serializeEncoding(encoding)}\`.
Please rename it to ${serializeEncoding(correctEncoding)}.`);
	const correctEncodings = [...ENCODINGS].map((correctEncoding) => serializeEncoding(correctEncoding)).join(", ");
	throw new TypeError(`Invalid option \`encoding: ${serializeEncoding(encoding)}\`.
Please rename it to one of: ${correctEncodings}.`);
};
const TEXT_ENCODINGS = new Set(["utf8", "utf16le"]);
const BINARY_ENCODINGS = new Set([
	"buffer",
	"hex",
	"base64",
	"base64url",
	"latin1",
	"ascii"
]);
const ENCODINGS = new Set([...TEXT_ENCODINGS, ...BINARY_ENCODINGS]);
const getCorrectEncoding = (encoding) => {
	if (encoding === null) return "buffer";
	if (typeof encoding !== "string") return;
	const lowerEncoding = encoding.toLowerCase();
	if (lowerEncoding in ENCODING_ALIASES) return ENCODING_ALIASES[lowerEncoding];
	if (ENCODINGS.has(lowerEncoding)) return lowerEncoding;
};
const ENCODING_ALIASES = {
	"utf-8": "utf8",
	"utf-16le": "utf16le",
	"ucs-2": "utf16le",
	ucs2: "utf16le",
	binary: "latin1"
};
const serializeEncoding = (encoding) => typeof encoding === "string" ? `"${encoding}"` : String(encoding);
//#endregion
//#region node_modules/execa/lib/arguments/cwd.js
const normalizeCwd = (cwd = getDefaultCwd()) => {
	const cwdString = safeNormalizeFileUrl(cwd, "The \"cwd\" option");
	return path.resolve(cwdString);
};
const getDefaultCwd = () => {
	try {
		return process$1.cwd();
	} catch (error) {
		error.message = `The current directory does not exist.\n${error.message}`;
		throw error;
	}
};
const fixCwdError = (originalMessage, cwd) => {
	if (cwd === getDefaultCwd()) return originalMessage;
	let cwdStat;
	try {
		cwdStat = statSync$1(cwd);
	} catch (error) {
		return `The "cwd" option is invalid: ${cwd}.\n${error.message}\n${originalMessage}`;
	}
	if (!cwdStat.isDirectory()) return `The "cwd" option is not a directory: ${cwd}.\n${originalMessage}`;
	return originalMessage;
};
//#endregion
//#region node_modules/execa/lib/arguments/options.js
const normalizeOptions = (filePath, rawArguments, rawOptions) => {
	rawOptions.cwd = normalizeCwd(rawOptions.cwd);
	const [processedFile, processedArguments, processedOptions] = handleNodeOption(filePath, rawArguments, rawOptions);
	const { command: file, args: commandArguments, options: initialOptions } = import_cross_spawn.default._parse(processedFile, processedArguments, processedOptions);
	const options = addDefaultOptions(normalizeFdSpecificOptions(initialOptions));
	validateTimeout(options);
	validateEncoding(options);
	validateIpcInputOption(options);
	validateCancelSignal(options);
	validateGracefulCancel(options);
	options.shell = normalizeFileUrl(options.shell);
	options.env = getEnv(options);
	options.killSignal = normalizeKillSignal(options.killSignal);
	options.forceKillAfterDelay = normalizeForceKillAfterDelay(options.forceKillAfterDelay);
	options.lines = options.lines.map((lines, fdNumber) => lines && !BINARY_ENCODINGS.has(options.encoding) && options.buffer[fdNumber]);
	if (process$1.platform === "win32" && path.basename(file, ".exe") === "cmd") commandArguments.unshift("/q");
	return {
		file,
		commandArguments,
		options
	};
};
const addDefaultOptions = ({ extendEnv = true, preferLocal = false, cwd, localDir: localDirectory = cwd, encoding = "utf8", reject = true, cleanup = true, all = false, windowsHide = true, killSignal = "SIGTERM", forceKillAfterDelay = true, gracefulCancel = false, ipcInput, ipc = ipcInput !== void 0 || gracefulCancel, serialization = "advanced", ...options }) => ({
	...options,
	extendEnv,
	preferLocal,
	cwd,
	localDirectory,
	encoding,
	reject,
	cleanup,
	all,
	windowsHide,
	killSignal,
	forceKillAfterDelay,
	gracefulCancel,
	ipcInput,
	ipc,
	serialization
});
const getEnv = ({ env: envOption, extendEnv, preferLocal, node, localDirectory, nodePath }) => {
	const env = extendEnv ? {
		...process$1.env,
		...envOption
	} : envOption;
	if (preferLocal || node) return npmRunPathEnv({
		env,
		cwd: localDirectory,
		execPath: nodePath,
		preferLocal,
		addExecPath: node
	});
	return env;
};
//#endregion
//#region node_modules/execa/lib/arguments/shell.js
const concatenateShell = (file, commandArguments, options) => options.shell && commandArguments.length > 0 ? [
	[file, ...commandArguments].join(" "),
	[],
	options
] : [
	file,
	commandArguments,
	options
];
//#endregion
//#region node_modules/strip-final-newline/index.js
function stripFinalNewline(input) {
	if (typeof input === "string") return stripFinalNewlineString(input);
	if (!(ArrayBuffer.isView(input) && input.BYTES_PER_ELEMENT === 1)) throw new Error("Input must be a string or a Uint8Array");
	return stripFinalNewlineBinary(input);
}
const stripFinalNewlineString = (input) => input.at(-1) === LF ? input.slice(0, input.at(-2) === CR ? -2 : -1) : input;
const stripFinalNewlineBinary = (input) => input.at(-1) === LF_BINARY ? input.subarray(0, input.at(-2) === CR_BINARY ? -2 : -1) : input;
const LF = "\n";
const LF_BINARY = LF.codePointAt(0);
const CR = "\r";
const CR_BINARY = CR.codePointAt(0);
//#endregion
//#region node_modules/is-stream/index.js
function isStream(stream, { checkOpen = true } = {}) {
	return stream !== null && typeof stream === "object" && (stream.writable || stream.readable || !checkOpen || stream.writable === void 0 && stream.readable === void 0) && typeof stream.pipe === "function";
}
function isWritableStream$1(stream, { checkOpen = true } = {}) {
	return isStream(stream, { checkOpen }) && (stream.writable || !checkOpen) && typeof stream.write === "function" && typeof stream.end === "function" && typeof stream.writable === "boolean" && typeof stream.writableObjectMode === "boolean" && typeof stream.destroy === "function" && typeof stream.destroyed === "boolean";
}
function isReadableStream$1(stream, { checkOpen = true } = {}) {
	return isStream(stream, { checkOpen }) && (stream.readable || !checkOpen) && typeof stream.read === "function" && typeof stream.readable === "boolean" && typeof stream.readableObjectMode === "boolean" && typeof stream.destroy === "function" && typeof stream.destroyed === "boolean";
}
function isDuplexStream(stream, options) {
	return isWritableStream$1(stream, options) && isReadableStream$1(stream, options);
}
//#endregion
//#region node_modules/@sec-ant/readable-stream/dist/ponyfill/asyncIterator.js
const a = Object.getPrototypeOf(Object.getPrototypeOf(
	/* istanbul ignore next */
	async function* () {}
).prototype);
var c = class {
	#t;
	#n;
	#r = !1;
	#e = void 0;
	constructor(e, t) {
		this.#t = e, this.#n = t;
	}
	next() {
		const e = () => this.#s();
		return this.#e = this.#e ? this.#e.then(e, e) : e(), this.#e;
	}
	return(e) {
		const t = () => this.#i(e);
		return this.#e ? this.#e.then(t, t) : t();
	}
	async #s() {
		if (this.#r) return {
			done: !0,
			value: void 0
		};
		let e;
		try {
			e = await this.#t.read();
		} catch (t) {
			throw this.#e = void 0, this.#r = !0, this.#t.releaseLock(), t;
		}
		return e.done && (this.#e = void 0, this.#r = !0, this.#t.releaseLock()), e;
	}
	async #i(e) {
		if (this.#r) return {
			done: !0,
			value: e
		};
		if (this.#r = !0, !this.#n) {
			const t = this.#t.cancel(e);
			return this.#t.releaseLock(), await t, {
				done: !0,
				value: e
			};
		}
		return this.#t.releaseLock(), {
			done: !0,
			value: e
		};
	}
};
const n = Symbol();
function i$1() {
	return this[n].next();
}
Object.defineProperty(i$1, "name", { value: "next" });
function o(r) {
	return this[n].return(r);
}
Object.defineProperty(o, "name", { value: "return" });
const u = Object.create(a, {
	next: {
		enumerable: !0,
		configurable: !0,
		writable: !0,
		value: i$1
	},
	return: {
		enumerable: !0,
		configurable: !0,
		writable: !0,
		value: o
	}
});
function h({ preventCancel: r = !1 } = {}) {
	const t = new c(this.getReader(), r), s = Object.create(u);
	return s[n] = t, s;
}
//#endregion
//#region node_modules/get-stream/source/stream.js
const getAsyncIterable = (stream) => {
	if (isReadableStream$1(stream, { checkOpen: false }) && nodeImports.on !== void 0) return getStreamIterable(stream);
	if (typeof stream?.[Symbol.asyncIterator] === "function") return stream;
	if (toString.call(stream) === "[object ReadableStream]") return h.call(stream);
	throw new TypeError("The first argument must be a Readable, a ReadableStream, or an async iterable.");
};
const { toString } = Object.prototype;
const getStreamIterable = async function* (stream) {
	const controller = new AbortController();
	const state = {};
	handleStreamEnd(stream, controller, state);
	try {
		for await (const [chunk] of nodeImports.on(stream, "data", { signal: controller.signal })) yield chunk;
	} catch (error) {
		if (state.error !== void 0) throw state.error;
		else if (!controller.signal.aborted) throw error;
	} finally {
		stream.destroy();
	}
};
const handleStreamEnd = async (stream, controller, state) => {
	try {
		await nodeImports.finished(stream, {
			cleanup: true,
			readable: true,
			writable: false,
			error: false
		});
	} catch (error) {
		state.error = error;
	} finally {
		controller.abort();
	}
};
const nodeImports = {};
//#endregion
//#region node_modules/get-stream/source/contents.js
const getStreamContents$1 = async (stream, { init, convertChunk, getSize, truncateChunk, addChunk, getFinalChunk, finalize }, { maxBuffer = Number.POSITIVE_INFINITY } = {}) => {
	const asyncIterable = getAsyncIterable(stream);
	const state = init();
	state.length = 0;
	try {
		for await (const chunk of asyncIterable) appendChunk({
			convertedChunk: convertChunk[getChunkType(chunk)](chunk, state),
			state,
			getSize,
			truncateChunk,
			addChunk,
			maxBuffer
		});
		appendFinalChunk({
			state,
			convertChunk,
			getSize,
			truncateChunk,
			addChunk,
			getFinalChunk,
			maxBuffer
		});
		return finalize(state);
	} catch (error) {
		const normalizedError = typeof error === "object" && error !== null ? error : new Error(error);
		normalizedError.bufferedData = finalize(state);
		throw normalizedError;
	}
};
const appendFinalChunk = ({ state, getSize, truncateChunk, addChunk, getFinalChunk, maxBuffer }) => {
	const convertedChunk = getFinalChunk(state);
	if (convertedChunk !== void 0) appendChunk({
		convertedChunk,
		state,
		getSize,
		truncateChunk,
		addChunk,
		maxBuffer
	});
};
const appendChunk = ({ convertedChunk, state, getSize, truncateChunk, addChunk, maxBuffer }) => {
	const chunkSize = getSize(convertedChunk);
	const newLength = state.length + chunkSize;
	if (newLength <= maxBuffer) {
		addNewChunk(convertedChunk, state, addChunk, newLength);
		return;
	}
	const truncatedChunk = truncateChunk(convertedChunk, maxBuffer - state.length);
	if (truncatedChunk !== void 0) addNewChunk(truncatedChunk, state, addChunk, maxBuffer);
	throw new MaxBufferError();
};
const addNewChunk = (convertedChunk, state, addChunk, newLength) => {
	state.contents = addChunk(convertedChunk, state, newLength);
	state.length = newLength;
};
const getChunkType = (chunk) => {
	const typeOfChunk = typeof chunk;
	if (typeOfChunk === "string") return "string";
	if (typeOfChunk !== "object" || chunk === null) return "others";
	if (globalThis.Buffer?.isBuffer(chunk)) return "buffer";
	const prototypeName = objectToString.call(chunk);
	if (prototypeName === "[object ArrayBuffer]") return "arrayBuffer";
	if (prototypeName === "[object DataView]") return "dataView";
	if (Number.isInteger(chunk.byteLength) && Number.isInteger(chunk.byteOffset) && objectToString.call(chunk.buffer) === "[object ArrayBuffer]") return "typedArray";
	return "others";
};
const { toString: objectToString } = Object.prototype;
var MaxBufferError = class extends Error {
	name = "MaxBufferError";
	constructor() {
		super("maxBuffer exceeded");
	}
};
//#endregion
//#region node_modules/get-stream/source/utils.js
const identity = (value) => value;
const noop$1 = () => void 0;
const getContentsProperty = ({ contents }) => contents;
const throwObjectStream = (chunk) => {
	throw new Error(`Streams in object mode are not supported: ${String(chunk)}`);
};
const getLengthProperty = (convertedChunk) => convertedChunk.length;
//#endregion
//#region node_modules/get-stream/source/array.js
async function getStreamAsArray(stream, options) {
	return getStreamContents$1(stream, arrayMethods, options);
}
const initArray = () => ({ contents: [] });
const increment = () => 1;
const addArrayChunk = (convertedChunk, { contents }) => {
	contents.push(convertedChunk);
	return contents;
};
const arrayMethods = {
	init: initArray,
	convertChunk: {
		string: identity,
		buffer: identity,
		arrayBuffer: identity,
		dataView: identity,
		typedArray: identity,
		others: identity
	},
	getSize: increment,
	truncateChunk: noop$1,
	addChunk: addArrayChunk,
	getFinalChunk: noop$1,
	finalize: getContentsProperty
};
//#endregion
//#region node_modules/get-stream/source/array-buffer.js
async function getStreamAsArrayBuffer(stream, options) {
	return getStreamContents$1(stream, arrayBufferMethods, options);
}
const initArrayBuffer = () => ({ contents: /* @__PURE__ */ new ArrayBuffer(0) });
const useTextEncoder = (chunk) => textEncoder.encode(chunk);
const textEncoder = new TextEncoder();
const useUint8Array = (chunk) => new Uint8Array(chunk);
const useUint8ArrayWithOffset = (chunk) => new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
const truncateArrayBufferChunk = (convertedChunk, chunkSize) => convertedChunk.slice(0, chunkSize);
const addArrayBufferChunk = (convertedChunk, { contents, length: previousLength }, length) => {
	const newContents = hasArrayBufferResize() ? resizeArrayBuffer(contents, length) : resizeArrayBufferSlow(contents, length);
	new Uint8Array(newContents).set(convertedChunk, previousLength);
	return newContents;
};
const resizeArrayBufferSlow = (contents, length) => {
	if (length <= contents.byteLength) return contents;
	const arrayBuffer = new ArrayBuffer(getNewContentsLength(length));
	new Uint8Array(arrayBuffer).set(new Uint8Array(contents), 0);
	return arrayBuffer;
};
const resizeArrayBuffer = (contents, length) => {
	if (length <= contents.maxByteLength) {
		contents.resize(length);
		return contents;
	}
	const arrayBuffer = new ArrayBuffer(length, { maxByteLength: getNewContentsLength(length) });
	new Uint8Array(arrayBuffer).set(new Uint8Array(contents), 0);
	return arrayBuffer;
};
const getNewContentsLength = (length) => SCALE_FACTOR ** Math.ceil(Math.log(length) / Math.log(SCALE_FACTOR));
const SCALE_FACTOR = 2;
const finalizeArrayBuffer = ({ contents, length }) => hasArrayBufferResize() ? contents : contents.slice(0, length);
const hasArrayBufferResize = () => "resize" in ArrayBuffer.prototype;
const arrayBufferMethods = {
	init: initArrayBuffer,
	convertChunk: {
		string: useTextEncoder,
		buffer: useUint8Array,
		arrayBuffer: useUint8Array,
		dataView: useUint8ArrayWithOffset,
		typedArray: useUint8ArrayWithOffset,
		others: throwObjectStream
	},
	getSize: getLengthProperty,
	truncateChunk: truncateArrayBufferChunk,
	addChunk: addArrayBufferChunk,
	getFinalChunk: noop$1,
	finalize: finalizeArrayBuffer
};
//#endregion
//#region node_modules/get-stream/source/string.js
async function getStreamAsString(stream, options) {
	return getStreamContents$1(stream, stringMethods, options);
}
const initString = () => ({
	contents: "",
	textDecoder: new TextDecoder()
});
const useTextDecoder = (chunk, { textDecoder }) => textDecoder.decode(chunk, { stream: true });
const addStringChunk = (convertedChunk, { contents }) => contents + convertedChunk;
const truncateStringChunk = (convertedChunk, chunkSize) => convertedChunk.slice(0, chunkSize);
const getFinalStringChunk = ({ textDecoder }) => {
	const finalChunk = textDecoder.decode();
	return finalChunk === "" ? void 0 : finalChunk;
};
const stringMethods = {
	init: initString,
	convertChunk: {
		string: identity,
		buffer: useTextDecoder,
		arrayBuffer: useTextDecoder,
		dataView: useTextDecoder,
		typedArray: useTextDecoder,
		others: throwObjectStream
	},
	getSize: getLengthProperty,
	truncateChunk: truncateStringChunk,
	addChunk: addStringChunk,
	getFinalChunk: getFinalStringChunk,
	finalize: getContentsProperty
};
//#endregion
//#region node_modules/execa/lib/io/max-buffer.js
const handleMaxBuffer = ({ error, stream, readableObjectMode, lines, encoding, fdNumber }) => {
	if (!(error instanceof MaxBufferError)) throw error;
	if (fdNumber === "all") return error;
	error.maxBufferInfo = {
		fdNumber,
		unit: getMaxBufferUnit(readableObjectMode, lines, encoding)
	};
	stream.destroy();
	throw error;
};
const getMaxBufferUnit = (readableObjectMode, lines, encoding) => {
	if (readableObjectMode) return "objects";
	if (lines) return "lines";
	if (encoding === "buffer") return "bytes";
	return "characters";
};
const checkIpcMaxBuffer = (subprocess, ipcOutput, maxBuffer) => {
	if (ipcOutput.length !== maxBuffer) return;
	const error = new MaxBufferError();
	error.maxBufferInfo = { fdNumber: "ipc" };
	throw error;
};
const getMaxBufferMessage = (error, maxBuffer) => {
	const { streamName, threshold, unit } = getMaxBufferInfo(error, maxBuffer);
	return `Command's ${streamName} was larger than ${threshold} ${unit}`;
};
const getMaxBufferInfo = (error, maxBuffer) => {
	if (error?.maxBufferInfo === void 0) return {
		streamName: "output",
		threshold: maxBuffer[1],
		unit: "bytes"
	};
	const { maxBufferInfo: { fdNumber, unit } } = error;
	delete error.maxBufferInfo;
	const threshold = getFdSpecificValue(maxBuffer, fdNumber);
	if (fdNumber === "ipc") return {
		streamName: "IPC output",
		threshold,
		unit: "messages"
	};
	return {
		streamName: getStreamName(fdNumber),
		threshold,
		unit
	};
};
const isMaxBufferSync = (resultError, output, maxBuffer) => resultError?.code === "ENOBUFS" && output !== null && output.some((result) => result !== null && result.length > getMaxBufferSync(maxBuffer));
const truncateMaxBufferSync = (result, isMaxBuffer, maxBuffer) => {
	if (!isMaxBuffer) return result;
	const maxBufferValue = getMaxBufferSync(maxBuffer);
	return result.length > maxBufferValue ? result.slice(0, maxBufferValue) : result;
};
const getMaxBufferSync = ([, stdoutMaxBuffer]) => stdoutMaxBuffer;
//#endregion
//#region node_modules/execa/lib/return/message.js
const createMessages = ({ stdio, all, ipcOutput, originalError, signal, signalDescription, exitCode, escapedCommand, timedOut, isCanceled, isGracefullyCanceled, isMaxBuffer, isForcefullyTerminated, forceKillAfterDelay, killSignal, maxBuffer, timeout, cwd }) => {
	const errorCode = originalError?.code;
	const prefix = getErrorPrefix({
		originalError,
		timedOut,
		timeout,
		isMaxBuffer,
		maxBuffer,
		errorCode,
		signal,
		signalDescription,
		exitCode,
		isCanceled,
		isGracefullyCanceled,
		isForcefullyTerminated,
		forceKillAfterDelay,
		killSignal
	});
	const originalMessage = getOriginalMessage(originalError, cwd);
	const shortMessage = `${prefix}: ${escapedCommand}${originalMessage === void 0 ? "" : `\n${originalMessage}`}`;
	return {
		originalMessage,
		shortMessage,
		message: [
			shortMessage,
			...all === void 0 ? [stdio[2], stdio[1]] : [all],
			...stdio.slice(3),
			ipcOutput.map((ipcMessage) => serializeIpcMessage(ipcMessage)).join("\n")
		].map((messagePart) => escapeLines(stripFinalNewline(serializeMessagePart(messagePart)))).filter(Boolean).join("\n\n")
	};
};
const getErrorPrefix = ({ originalError, timedOut, timeout, isMaxBuffer, maxBuffer, errorCode, signal, signalDescription, exitCode, isCanceled, isGracefullyCanceled, isForcefullyTerminated, forceKillAfterDelay, killSignal }) => {
	const forcefulSuffix = getForcefulSuffix(isForcefullyTerminated, forceKillAfterDelay);
	if (timedOut) return `Command timed out after ${timeout} milliseconds${forcefulSuffix}`;
	if (isGracefullyCanceled) {
		if (signal === void 0) return `Command was gracefully canceled with exit code ${exitCode}`;
		return isForcefullyTerminated ? `Command was gracefully canceled${forcefulSuffix}` : `Command was gracefully canceled with ${signal} (${signalDescription})`;
	}
	if (isCanceled) return `Command was canceled${forcefulSuffix}`;
	if (isMaxBuffer) return `${getMaxBufferMessage(originalError, maxBuffer)}${forcefulSuffix}`;
	if (errorCode !== void 0) return `Command failed with ${errorCode}${forcefulSuffix}`;
	if (isForcefullyTerminated) return `Command was killed with ${killSignal} (${getSignalDescription(killSignal)})${forcefulSuffix}`;
	if (signal !== void 0) return `Command was killed with ${signal} (${signalDescription})`;
	if (exitCode !== void 0) return `Command failed with exit code ${exitCode}`;
	return "Command failed";
};
const getForcefulSuffix = (isForcefullyTerminated, forceKillAfterDelay) => isForcefullyTerminated ? ` and was forcefully terminated after ${forceKillAfterDelay} milliseconds` : "";
const getOriginalMessage = (originalError, cwd) => {
	if (originalError instanceof DiscardedError) return;
	const escapedOriginalMessage = escapeLines(fixCwdError(isExecaError(originalError) ? originalError.originalMessage : String(originalError?.message ?? originalError), cwd));
	return escapedOriginalMessage === "" ? void 0 : escapedOriginalMessage;
};
const serializeIpcMessage = (ipcMessage) => typeof ipcMessage === "string" ? ipcMessage : inspect(ipcMessage);
const serializeMessagePart = (messagePart) => Array.isArray(messagePart) ? messagePart.map((messageItem) => stripFinalNewline(serializeMessageItem(messageItem))).filter(Boolean).join("\n") : serializeMessageItem(messagePart);
const serializeMessageItem = (messageItem) => {
	if (typeof messageItem === "string") return messageItem;
	if (isUint8Array(messageItem)) return uint8ArrayToString(messageItem);
	return "";
};
//#endregion
//#region node_modules/execa/lib/return/result.js
const makeSuccessResult = ({ command, escapedCommand, stdio, all, ipcOutput, options: { cwd }, startTime }) => omitUndefinedProperties({
	command,
	escapedCommand,
	cwd,
	durationMs: getDurationMs(startTime),
	failed: false,
	timedOut: false,
	isCanceled: false,
	isGracefullyCanceled: false,
	isTerminated: false,
	isMaxBuffer: false,
	isForcefullyTerminated: false,
	exitCode: 0,
	stdout: stdio[1],
	stderr: stdio[2],
	all,
	stdio,
	ipcOutput,
	pipedFrom: []
});
const makeEarlyError = ({ error, command, escapedCommand, fileDescriptors, options, startTime, isSync }) => makeError({
	error,
	command,
	escapedCommand,
	startTime,
	timedOut: false,
	isCanceled: false,
	isGracefullyCanceled: false,
	isMaxBuffer: false,
	isForcefullyTerminated: false,
	stdio: Array.from({ length: fileDescriptors.length }),
	ipcOutput: [],
	options,
	isSync
});
const makeError = ({ error: originalError, command, escapedCommand, startTime, timedOut, isCanceled, isGracefullyCanceled, isMaxBuffer, isForcefullyTerminated, exitCode: rawExitCode, signal: rawSignal, stdio, all, ipcOutput, options: { timeoutDuration, timeout = timeoutDuration, forceKillAfterDelay, killSignal, cwd, maxBuffer }, isSync }) => {
	const { exitCode, signal, signalDescription } = normalizeExitPayload(rawExitCode, rawSignal);
	const { originalMessage, shortMessage, message } = createMessages({
		stdio,
		all,
		ipcOutput,
		originalError,
		signal,
		signalDescription,
		exitCode,
		escapedCommand,
		timedOut,
		isCanceled,
		isGracefullyCanceled,
		isMaxBuffer,
		isForcefullyTerminated,
		forceKillAfterDelay,
		killSignal,
		maxBuffer,
		timeout,
		cwd
	});
	const error = getFinalError(originalError, message, isSync);
	Object.assign(error, getErrorProperties({
		error,
		command,
		escapedCommand,
		startTime,
		timedOut,
		isCanceled,
		isGracefullyCanceled,
		isMaxBuffer,
		isForcefullyTerminated,
		exitCode,
		signal,
		signalDescription,
		stdio,
		all,
		ipcOutput,
		cwd,
		originalMessage,
		shortMessage
	}));
	return error;
};
const getErrorProperties = ({ error, command, escapedCommand, startTime, timedOut, isCanceled, isGracefullyCanceled, isMaxBuffer, isForcefullyTerminated, exitCode, signal, signalDescription, stdio, all, ipcOutput, cwd, originalMessage, shortMessage }) => omitUndefinedProperties({
	shortMessage,
	originalMessage,
	command,
	escapedCommand,
	cwd,
	durationMs: getDurationMs(startTime),
	failed: true,
	timedOut,
	isCanceled,
	isGracefullyCanceled,
	isTerminated: signal !== void 0,
	isMaxBuffer,
	isForcefullyTerminated,
	exitCode,
	signal,
	signalDescription,
	code: error.cause?.code,
	stdout: stdio[1],
	stderr: stdio[2],
	all,
	stdio,
	ipcOutput,
	pipedFrom: []
});
const omitUndefinedProperties = (result) => Object.fromEntries(Object.entries(result).filter(([, value]) => value !== void 0));
const normalizeExitPayload = (rawExitCode, rawSignal) => {
	const exitCode = rawExitCode === null ? void 0 : rawExitCode;
	const signal = rawSignal === null ? void 0 : rawSignal;
	return {
		exitCode,
		signal,
		signalDescription: signal === void 0 ? void 0 : getSignalDescription(rawSignal)
	};
};
//#endregion
//#region node_modules/parse-ms/index.js
const toZeroIfInfinity = (value) => Number.isFinite(value) ? value : 0;
function parseNumber(milliseconds) {
	return {
		days: Math.trunc(milliseconds / 864e5),
		hours: Math.trunc(milliseconds / 36e5 % 24),
		minutes: Math.trunc(milliseconds / 6e4 % 60),
		seconds: Math.trunc(milliseconds / 1e3 % 60),
		milliseconds: Math.trunc(milliseconds % 1e3),
		microseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1e3) % 1e3),
		nanoseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1e6) % 1e3)
	};
}
function parseBigint(milliseconds) {
	return {
		days: milliseconds / 86400000n,
		hours: milliseconds / 3600000n % 24n,
		minutes: milliseconds / 60000n % 60n,
		seconds: milliseconds / 1000n % 60n,
		milliseconds: milliseconds % 1000n,
		microseconds: 0n,
		nanoseconds: 0n
	};
}
function parseMilliseconds(milliseconds) {
	switch (typeof milliseconds) {
		case "number":
			if (Number.isFinite(milliseconds)) return parseNumber(milliseconds);
			break;
		case "bigint": return parseBigint(milliseconds);
	}
	throw new TypeError("Expected a finite number or bigint");
}
//#endregion
//#region node_modules/pretty-ms/index.js
const isZero = (value) => value === 0 || value === 0n;
const pluralize = (word, count) => count === 1 || count === 1n ? word : `${word}s`;
const SECOND_ROUNDING_EPSILON = 1e-7;
const ONE_DAY_IN_MILLISECONDS = 24n * 60n * 60n * 1000n;
function prettyMilliseconds(milliseconds, options) {
	const isBigInt = typeof milliseconds === "bigint";
	if (!isBigInt && !Number.isFinite(milliseconds)) throw new TypeError("Expected a finite number or bigint");
	options = { ...options };
	const sign = milliseconds < 0 ? "-" : "";
	milliseconds = milliseconds < 0 ? -milliseconds : milliseconds;
	if (options.colonNotation) {
		options.compact = false;
		options.formatSubMilliseconds = false;
		options.separateMilliseconds = false;
		options.verbose = false;
	}
	if (options.compact) {
		options.unitCount = 1;
		options.secondsDecimalDigits = 0;
		options.millisecondsDecimalDigits = 0;
	}
	let result = [];
	const floorDecimals = (value, decimalDigits) => {
		const flooredInterimValue = Math.floor(value * 10 ** decimalDigits + SECOND_ROUNDING_EPSILON);
		return (Math.round(flooredInterimValue) / 10 ** decimalDigits).toFixed(decimalDigits);
	};
	const add = (value, long, short, valueString) => {
		if ((result.length === 0 || !options.colonNotation) && isZero(value) && !(options.colonNotation && short === "m")) return;
		valueString ??= String(value);
		if (options.colonNotation) {
			const wholeDigits = valueString.includes(".") ? valueString.split(".")[0].length : valueString.length;
			const minLength = result.length > 0 ? 2 : 1;
			valueString = "0".repeat(Math.max(0, minLength - wholeDigits)) + valueString;
		} else valueString += options.verbose ? " " + pluralize(long, value) : short;
		result.push(valueString);
	};
	const parsed = parseMilliseconds(milliseconds);
	const days = BigInt(parsed.days);
	if (options.hideYearAndDays) add(BigInt(days) * 24n + BigInt(parsed.hours), "hour", "h");
	else {
		if (options.hideYear) add(days, "day", "d");
		else {
			add(days / 365n, "year", "y");
			add(days % 365n, "day", "d");
		}
		add(Number(parsed.hours), "hour", "h");
	}
	add(Number(parsed.minutes), "minute", "m");
	if (!options.hideSeconds) if (options.separateMilliseconds || options.formatSubMilliseconds || !options.colonNotation && milliseconds < 1e3 && !options.subSecondsAsDecimals) {
		const seconds = Number(parsed.seconds);
		const milliseconds = Number(parsed.milliseconds);
		const microseconds = Number(parsed.microseconds);
		const nanoseconds = Number(parsed.nanoseconds);
		add(seconds, "second", "s");
		if (options.formatSubMilliseconds) {
			add(milliseconds, "millisecond", "ms");
			add(microseconds, "microsecond", "µs");
			add(nanoseconds, "nanosecond", "ns");
		} else {
			const millisecondsAndBelow = milliseconds + microseconds / 1e3 + nanoseconds / 1e6;
			const millisecondsDecimalDigits = typeof options.millisecondsDecimalDigits === "number" ? options.millisecondsDecimalDigits : 0;
			const millisecondsString = millisecondsDecimalDigits ? millisecondsAndBelow.toFixed(millisecondsDecimalDigits) : millisecondsAndBelow >= 1 ? Math.round(millisecondsAndBelow) : Math.ceil(millisecondsAndBelow);
			add(Number.parseFloat(millisecondsString), "millisecond", "ms", millisecondsString);
		}
	} else {
		const secondsFixed = floorDecimals((isBigInt ? Number(milliseconds % ONE_DAY_IN_MILLISECONDS) : milliseconds) / 1e3 % 60, typeof options.secondsDecimalDigits === "number" ? options.secondsDecimalDigits : 1);
		const secondsString = options.keepDecimalsOnWholeSeconds ? secondsFixed : secondsFixed.replace(/\.0+$/, "");
		add(Number.parseFloat(secondsString), "second", "s", secondsString);
	}
	if (result.length === 0) return sign + "0" + (options.verbose ? " milliseconds" : "ms");
	const separator = options.colonNotation ? ":" : " ";
	if (typeof options.unitCount === "number") result = result.slice(0, Math.max(options.unitCount, 1));
	return sign + result.join(separator);
}
//#endregion
//#region node_modules/execa/lib/verbose/error.js
const logError = (result, verboseInfo) => {
	if (result.failed) verboseLog({
		type: "error",
		verboseMessage: result.shortMessage,
		verboseInfo,
		result
	});
};
//#endregion
//#region node_modules/execa/lib/verbose/complete.js
const logResult = (result, verboseInfo) => {
	if (!isVerbose(verboseInfo)) return;
	logError(result, verboseInfo);
	logDuration(result, verboseInfo);
};
const logDuration = (result, verboseInfo) => {
	verboseLog({
		type: "duration",
		verboseMessage: `(done in ${prettyMilliseconds(result.durationMs)})`,
		verboseInfo,
		result
	});
};
//#endregion
//#region node_modules/execa/lib/return/reject.js
const handleResult = (result, verboseInfo, { reject }) => {
	logResult(result, verboseInfo);
	if (result.failed && reject) throw result;
	return result;
};
//#endregion
//#region node_modules/execa/lib/stdio/type.js
const getStdioItemType = (value, optionName) => {
	if (isAsyncGenerator(value)) return "asyncGenerator";
	if (isSyncGenerator(value)) return "generator";
	if (isUrl(value)) return "fileUrl";
	if (isFilePathObject(value)) return "filePath";
	if (isWebStream(value)) return "webStream";
	if (isStream(value, { checkOpen: false })) return "native";
	if (isUint8Array(value)) return "uint8Array";
	if (isAsyncIterableObject(value)) return "asyncIterable";
	if (isIterableObject(value)) return "iterable";
	if (isTransformStream(value)) return getTransformStreamType({ transform: value }, optionName);
	if (isTransformOptions(value)) return getTransformObjectType(value, optionName);
	return "native";
};
const getTransformObjectType = (value, optionName) => {
	if (isDuplexStream(value.transform, { checkOpen: false })) return getDuplexType(value, optionName);
	if (isTransformStream(value.transform)) return getTransformStreamType(value, optionName);
	return getGeneratorObjectType(value, optionName);
};
const getDuplexType = (value, optionName) => {
	validateNonGeneratorType(value, optionName, "Duplex stream");
	return "duplex";
};
const getTransformStreamType = (value, optionName) => {
	validateNonGeneratorType(value, optionName, "web TransformStream");
	return "webTransform";
};
const validateNonGeneratorType = ({ final, binary, objectMode }, optionName, typeName) => {
	checkUndefinedOption(final, `${optionName}.final`, typeName);
	checkUndefinedOption(binary, `${optionName}.binary`, typeName);
	checkBooleanOption(objectMode, `${optionName}.objectMode`);
};
const checkUndefinedOption = (value, optionName, typeName) => {
	if (value !== void 0) throw new TypeError(`The \`${optionName}\` option can only be defined when using a generator, not a ${typeName}.`);
};
const getGeneratorObjectType = ({ transform, final, binary, objectMode }, optionName) => {
	if (transform !== void 0 && !isGenerator(transform)) throw new TypeError(`The \`${optionName}.transform\` option must be a generator, a Duplex stream or a web TransformStream.`);
	if (isDuplexStream(final, { checkOpen: false })) throw new TypeError(`The \`${optionName}.final\` option must not be a Duplex stream.`);
	if (isTransformStream(final)) throw new TypeError(`The \`${optionName}.final\` option must not be a web TransformStream.`);
	if (final !== void 0 && !isGenerator(final)) throw new TypeError(`The \`${optionName}.final\` option must be a generator.`);
	checkBooleanOption(binary, `${optionName}.binary`);
	checkBooleanOption(objectMode, `${optionName}.objectMode`);
	return isAsyncGenerator(transform) || isAsyncGenerator(final) ? "asyncGenerator" : "generator";
};
const checkBooleanOption = (value, optionName) => {
	if (value !== void 0 && typeof value !== "boolean") throw new TypeError(`The \`${optionName}\` option must use a boolean.`);
};
const isGenerator = (value) => isAsyncGenerator(value) || isSyncGenerator(value);
const isAsyncGenerator = (value) => Object.prototype.toString.call(value) === "[object AsyncGeneratorFunction]";
const isSyncGenerator = (value) => Object.prototype.toString.call(value) === "[object GeneratorFunction]";
const isTransformOptions = (value) => isPlainObject(value) && (value.transform !== void 0 || value.final !== void 0);
const isUrl = (value) => Object.prototype.toString.call(value) === "[object URL]";
const isRegularUrl = (value) => isUrl(value) && value.protocol !== "file:";
const isFilePathObject = (value) => isPlainObject(value) && Object.keys(value).length > 0 && Object.keys(value).every((key) => FILE_PATH_KEYS.has(key)) && isFilePathString(value.file);
const FILE_PATH_KEYS = new Set(["file", "append"]);
const isFilePathString = (file) => typeof file === "string";
const isUnknownStdioString = (type, value) => type === "native" && typeof value === "string" && !KNOWN_STDIO_STRINGS.has(value);
const KNOWN_STDIO_STRINGS = new Set([
	"ipc",
	"ignore",
	"inherit",
	"overlapped",
	"pipe"
]);
const isReadableStream = (value) => Object.prototype.toString.call(value) === "[object ReadableStream]";
const isWritableStream = (value) => Object.prototype.toString.call(value) === "[object WritableStream]";
const isWebStream = (value) => isReadableStream(value) || isWritableStream(value);
const isTransformStream = (value) => isReadableStream(value?.readable) && isWritableStream(value?.writable);
const isAsyncIterableObject = (value) => isObject$1(value) && typeof value[Symbol.asyncIterator] === "function";
const isIterableObject = (value) => isObject$1(value) && typeof value[Symbol.iterator] === "function";
const isObject$1 = (value) => typeof value === "object" && value !== null;
const TRANSFORM_TYPES = new Set([
	"generator",
	"asyncGenerator",
	"duplex",
	"webTransform"
]);
const FILE_TYPES = new Set([
	"fileUrl",
	"filePath",
	"fileNumber"
]);
const SPECIAL_DUPLICATE_TYPES_SYNC = new Set(["fileUrl", "filePath"]);
const SPECIAL_DUPLICATE_TYPES = new Set([
	...SPECIAL_DUPLICATE_TYPES_SYNC,
	"webStream",
	"nodeStream"
]);
const FORBID_DUPLICATE_TYPES = new Set(["webTransform", "duplex"]);
const TYPE_TO_MESSAGE = {
	generator: "a generator",
	asyncGenerator: "an async generator",
	fileUrl: "a file URL",
	filePath: "a file path string",
	fileNumber: "a file descriptor number",
	webStream: "a web stream",
	nodeStream: "a Node.js stream",
	webTransform: "a web TransformStream",
	duplex: "a Duplex stream",
	native: "any value",
	iterable: "an iterable",
	asyncIterable: "an async iterable",
	string: "a string",
	uint8Array: "a Uint8Array"
};
//#endregion
//#region node_modules/execa/lib/transform/object-mode.js
const getTransformObjectModes = (objectMode, index, newTransforms, direction) => direction === "output" ? getOutputObjectModes(objectMode, index, newTransforms) : getInputObjectModes(objectMode, index, newTransforms);
const getOutputObjectModes = (objectMode, index, newTransforms) => {
	const writableObjectMode = index !== 0 && newTransforms[index - 1].value.readableObjectMode;
	return {
		writableObjectMode,
		readableObjectMode: objectMode ?? writableObjectMode
	};
};
const getInputObjectModes = (objectMode, index, newTransforms) => {
	const writableObjectMode = index === 0 ? objectMode === true : newTransforms[index - 1].value.readableObjectMode;
	return {
		writableObjectMode,
		readableObjectMode: index !== newTransforms.length - 1 && (objectMode ?? writableObjectMode)
	};
};
const getFdObjectMode = (stdioItems, direction) => {
	const lastTransform = stdioItems.findLast(({ type }) => TRANSFORM_TYPES.has(type));
	if (lastTransform === void 0) return false;
	return direction === "input" ? lastTransform.value.writableObjectMode : lastTransform.value.readableObjectMode;
};
//#endregion
//#region node_modules/execa/lib/transform/normalize.js
const normalizeTransforms = (stdioItems, optionName, direction, options) => [...stdioItems.filter(({ type }) => !TRANSFORM_TYPES.has(type)), ...getTransforms(stdioItems, optionName, direction, options)];
const getTransforms = (stdioItems, optionName, direction, { encoding }) => {
	const transforms = stdioItems.filter(({ type }) => TRANSFORM_TYPES.has(type));
	const newTransforms = Array.from({ length: transforms.length });
	for (const [index, stdioItem] of Object.entries(transforms)) newTransforms[index] = normalizeTransform({
		stdioItem,
		index: Number(index),
		newTransforms,
		optionName,
		direction,
		encoding
	});
	return sortTransforms(newTransforms, direction);
};
const normalizeTransform = ({ stdioItem, stdioItem: { type }, index, newTransforms, optionName, direction, encoding }) => {
	if (type === "duplex") return normalizeDuplex({
		stdioItem,
		optionName
	});
	if (type === "webTransform") return normalizeTransformStream({
		stdioItem,
		index,
		newTransforms,
		direction
	});
	return normalizeGenerator({
		stdioItem,
		index,
		newTransforms,
		direction,
		encoding
	});
};
const normalizeDuplex = ({ stdioItem, stdioItem: { value: { transform, transform: { writableObjectMode, readableObjectMode }, objectMode = readableObjectMode } }, optionName }) => {
	if (objectMode && !readableObjectMode) throw new TypeError(`The \`${optionName}.objectMode\` option can only be \`true\` if \`new Duplex({objectMode: true})\` is used.`);
	if (!objectMode && readableObjectMode) throw new TypeError(`The \`${optionName}.objectMode\` option cannot be \`false\` if \`new Duplex({objectMode: true})\` is used.`);
	return {
		...stdioItem,
		value: {
			transform,
			writableObjectMode,
			readableObjectMode
		}
	};
};
const normalizeTransformStream = ({ stdioItem, stdioItem: { value }, index, newTransforms, direction }) => {
	const { transform, objectMode } = isPlainObject(value) ? value : { transform: value };
	const { writableObjectMode, readableObjectMode } = getTransformObjectModes(objectMode, index, newTransforms, direction);
	return {
		...stdioItem,
		value: {
			transform,
			writableObjectMode,
			readableObjectMode
		}
	};
};
const normalizeGenerator = ({ stdioItem, stdioItem: { value }, index, newTransforms, direction, encoding }) => {
	const { transform, final, binary: binaryOption = false, preserveNewlines = false, objectMode } = isPlainObject(value) ? value : { transform: value };
	const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
	const { writableObjectMode, readableObjectMode } = getTransformObjectModes(objectMode, index, newTransforms, direction);
	return {
		...stdioItem,
		value: {
			transform,
			final,
			binary,
			preserveNewlines,
			writableObjectMode,
			readableObjectMode
		}
	};
};
const sortTransforms = (newTransforms, direction) => direction === "input" ? newTransforms.reverse() : newTransforms;
//#endregion
//#region node_modules/execa/lib/stdio/direction.js
const getStreamDirection = (stdioItems, fdNumber, optionName) => {
	const directions = stdioItems.map((stdioItem) => getStdioItemDirection(stdioItem, fdNumber));
	if (directions.includes("input") && directions.includes("output")) throw new TypeError(`The \`${optionName}\` option must not be an array of both readable and writable values.`);
	return directions.find(Boolean) ?? DEFAULT_DIRECTION;
};
const getStdioItemDirection = ({ type, value }, fdNumber) => KNOWN_DIRECTIONS[fdNumber] ?? guessStreamDirection[type](value);
const KNOWN_DIRECTIONS = [
	"input",
	"output",
	"output"
];
const anyDirection = () => void 0;
const alwaysInput = () => "input";
const guessStreamDirection = {
	generator: anyDirection,
	asyncGenerator: anyDirection,
	fileUrl: anyDirection,
	filePath: anyDirection,
	iterable: alwaysInput,
	asyncIterable: alwaysInput,
	uint8Array: alwaysInput,
	webStream: (value) => isWritableStream(value) ? "output" : "input",
	nodeStream(value) {
		if (!isReadableStream$1(value, { checkOpen: false })) return "output";
		return isWritableStream$1(value, { checkOpen: false }) ? void 0 : "input";
	},
	webTransform: anyDirection,
	duplex: anyDirection,
	native(value) {
		const standardStreamDirection = getStandardStreamDirection(value);
		if (standardStreamDirection !== void 0) return standardStreamDirection;
		if (isStream(value, { checkOpen: false })) return guessStreamDirection.nodeStream(value);
	}
};
const getStandardStreamDirection = (value) => {
	if ([0, process$1.stdin].includes(value)) return "input";
	if ([
		1,
		2,
		process$1.stdout,
		process$1.stderr
	].includes(value)) return "output";
};
const DEFAULT_DIRECTION = "output";
//#endregion
//#region node_modules/execa/lib/ipc/array.js
const normalizeIpcStdioArray = (stdioArray, ipc) => ipc && !stdioArray.includes("ipc") ? [...stdioArray, "ipc"] : stdioArray;
//#endregion
//#region node_modules/execa/lib/stdio/stdio-option.js
const normalizeStdioOption = ({ stdio, ipc, buffer, ...options }, verboseInfo, isSync) => {
	const stdioArray = getStdioArray(stdio, options).map((stdioOption, fdNumber) => addDefaultValue(stdioOption, fdNumber));
	return isSync ? normalizeStdioSync(stdioArray, buffer, verboseInfo) : normalizeIpcStdioArray(stdioArray, ipc);
};
const getStdioArray = (stdio, options) => {
	if (stdio === void 0) return STANDARD_STREAMS_ALIASES.map((alias) => options[alias]);
	if (hasAlias(options)) throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${STANDARD_STREAMS_ALIASES.map((alias) => `\`${alias}\``).join(", ")}`);
	if (typeof stdio === "string") return [
		stdio,
		stdio,
		stdio
	];
	if (!Array.isArray(stdio)) throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
	const length = Math.max(stdio.length, STANDARD_STREAMS_ALIASES.length);
	return Array.from({ length }, (_, fdNumber) => stdio[fdNumber]);
};
const hasAlias = (options) => STANDARD_STREAMS_ALIASES.some((alias) => options[alias] !== void 0);
const addDefaultValue = (stdioOption, fdNumber) => {
	if (Array.isArray(stdioOption)) return stdioOption.map((item) => addDefaultValue(item, fdNumber));
	if (stdioOption === null || stdioOption === void 0) return fdNumber >= STANDARD_STREAMS_ALIASES.length ? "ignore" : "pipe";
	return stdioOption;
};
const normalizeStdioSync = (stdioArray, buffer, verboseInfo) => stdioArray.map((stdioOption, fdNumber) => !buffer[fdNumber] && fdNumber !== 0 && !isFullVerbose(verboseInfo, fdNumber) && isOutputPipeOnly(stdioOption) ? "ignore" : stdioOption);
const isOutputPipeOnly = (stdioOption) => stdioOption === "pipe" || Array.isArray(stdioOption) && stdioOption.every((item) => item === "pipe");
//#endregion
//#region node_modules/execa/lib/stdio/native.js
const handleNativeStream = ({ stdioItem, stdioItem: { type }, isStdioArray, fdNumber, direction, isSync }) => {
	if (!isStdioArray || type !== "native") return stdioItem;
	return isSync ? handleNativeStreamSync({
		stdioItem,
		fdNumber,
		direction
	}) : handleNativeStreamAsync({
		stdioItem,
		fdNumber
	});
};
const handleNativeStreamSync = ({ stdioItem, stdioItem: { value, optionName }, fdNumber, direction }) => {
	const targetFd = getTargetFd({
		value,
		optionName,
		fdNumber,
		direction
	});
	if (targetFd !== void 0) return targetFd;
	if (isStream(value, { checkOpen: false })) throw new TypeError(`The \`${optionName}: Stream\` option cannot both be an array and include a stream with synchronous methods.`);
	return stdioItem;
};
const getTargetFd = ({ value, optionName, fdNumber, direction }) => {
	const targetFdNumber = getTargetFdNumber(value, fdNumber);
	if (targetFdNumber === void 0) return;
	if (direction === "output") return {
		type: "fileNumber",
		value: targetFdNumber,
		optionName
	};
	if (tty.isatty(targetFdNumber)) throw new TypeError(`The \`${optionName}: ${serializeOptionValue(value)}\` option is invalid: it cannot be a TTY with synchronous methods.`);
	return {
		type: "uint8Array",
		value: bufferToUint8Array(readFileSync(targetFdNumber)),
		optionName
	};
};
const getTargetFdNumber = (value, fdNumber) => {
	if (value === "inherit") return fdNumber;
	if (typeof value === "number") return value;
	const standardStreamIndex = STANDARD_STREAMS.indexOf(value);
	if (standardStreamIndex !== -1) return standardStreamIndex;
};
const handleNativeStreamAsync = ({ stdioItem, stdioItem: { value, optionName }, fdNumber }) => {
	if (value === "inherit") return {
		type: "nodeStream",
		value: getStandardStream(fdNumber, value, optionName),
		optionName
	};
	if (typeof value === "number") return {
		type: "nodeStream",
		value: getStandardStream(value, value, optionName),
		optionName
	};
	if (isStream(value, { checkOpen: false })) return {
		type: "nodeStream",
		value,
		optionName
	};
	return stdioItem;
};
const getStandardStream = (fdNumber, value, optionName) => {
	const standardStream = STANDARD_STREAMS[fdNumber];
	if (standardStream === void 0) throw new TypeError(`The \`${optionName}: ${value}\` option is invalid: no such standard stream.`);
	return standardStream;
};
//#endregion
//#region node_modules/execa/lib/stdio/input-option.js
const handleInputOptions = ({ input, inputFile }, fdNumber) => fdNumber === 0 ? [...handleInputOption(input), ...handleInputFileOption(inputFile)] : [];
const handleInputOption = (input) => input === void 0 ? [] : [{
	type: getInputType(input),
	value: input,
	optionName: "input"
}];
const getInputType = (input) => {
	if (isReadableStream$1(input, { checkOpen: false })) return "nodeStream";
	if (typeof input === "string") return "string";
	if (isUint8Array(input)) return "uint8Array";
	throw new Error("The `input` option must be a string, a Uint8Array or a Node.js Readable stream.");
};
const handleInputFileOption = (inputFile) => inputFile === void 0 ? [] : [{
	...getInputFileType(inputFile),
	optionName: "inputFile"
}];
const getInputFileType = (inputFile) => {
	if (isUrl(inputFile)) return {
		type: "fileUrl",
		value: inputFile
	};
	if (isFilePathString(inputFile)) return {
		type: "filePath",
		value: { file: inputFile }
	};
	throw new Error("The `inputFile` option must be a file path string or a file URL.");
};
//#endregion
//#region node_modules/execa/lib/stdio/duplicate.js
const filterDuplicates = (stdioItems) => stdioItems.filter((stdioItemOne, indexOne) => stdioItems.every((stdioItemTwo, indexTwo) => stdioItemOne.value !== stdioItemTwo.value || indexOne >= indexTwo || stdioItemOne.type === "generator" || stdioItemOne.type === "asyncGenerator"));
const getDuplicateStream = ({ stdioItem: { type, value, optionName }, direction, fileDescriptors, isSync }) => {
	const otherStdioItems = getOtherStdioItems(fileDescriptors, type);
	if (otherStdioItems.length === 0) return;
	if (isSync) {
		validateDuplicateStreamSync({
			otherStdioItems,
			type,
			value,
			optionName,
			direction
		});
		return;
	}
	if (SPECIAL_DUPLICATE_TYPES.has(type)) return getDuplicateStreamInstance({
		otherStdioItems,
		type,
		value,
		optionName,
		direction
	});
	if (FORBID_DUPLICATE_TYPES.has(type)) validateDuplicateTransform({
		otherStdioItems,
		type,
		value,
		optionName
	});
};
const getOtherStdioItems = (fileDescriptors, type) => fileDescriptors.flatMap(({ direction, stdioItems }) => stdioItems.filter((stdioItem) => stdioItem.type === type).map(((stdioItem) => ({
	...stdioItem,
	direction
}))));
const validateDuplicateStreamSync = ({ otherStdioItems, type, value, optionName, direction }) => {
	if (SPECIAL_DUPLICATE_TYPES_SYNC.has(type)) getDuplicateStreamInstance({
		otherStdioItems,
		type,
		value,
		optionName,
		direction
	});
};
const getDuplicateStreamInstance = ({ otherStdioItems, type, value, optionName, direction }) => {
	const duplicateStdioItems = otherStdioItems.filter((stdioItem) => hasSameValue(stdioItem, value));
	if (duplicateStdioItems.length === 0) return;
	throwOnDuplicateStream(duplicateStdioItems.find((stdioItem) => stdioItem.direction !== direction), optionName, type);
	return direction === "output" ? duplicateStdioItems[0].stream : void 0;
};
const hasSameValue = ({ type, value }, secondValue) => {
	if (type === "filePath") return value.file === secondValue.file;
	if (type === "fileUrl") return value.href === secondValue.href;
	return value === secondValue;
};
const validateDuplicateTransform = ({ otherStdioItems, type, value, optionName }) => {
	throwOnDuplicateStream(otherStdioItems.find(({ value: { transform } }) => transform === value.transform), optionName, type);
};
const throwOnDuplicateStream = (stdioItem, optionName, type) => {
	if (stdioItem !== void 0) throw new TypeError(`The \`${stdioItem.optionName}\` and \`${optionName}\` options must not target ${TYPE_TO_MESSAGE[type]} that is the same.`);
};
//#endregion
//#region node_modules/execa/lib/stdio/handle.js
const handleStdio = (addProperties, options, verboseInfo, isSync) => {
	const fileDescriptors = getFinalFileDescriptors({
		initialFileDescriptors: normalizeStdioOption(options, verboseInfo, isSync).map((stdioOption, fdNumber) => getFileDescriptor({
			stdioOption,
			fdNumber,
			options,
			isSync
		})),
		addProperties,
		options,
		isSync
	});
	options.stdio = fileDescriptors.map(({ stdioItems }) => forwardStdio(stdioItems));
	return fileDescriptors;
};
const getFileDescriptor = ({ stdioOption, fdNumber, options, isSync }) => {
	const optionName = getStreamName(fdNumber);
	const { stdioItems: initialStdioItems, isStdioArray } = initializeStdioItems({
		stdioOption,
		fdNumber,
		options,
		optionName
	});
	const direction = getStreamDirection(initialStdioItems, fdNumber, optionName);
	const normalizedStdioItems = normalizeTransforms(initialStdioItems.map((stdioItem) => handleNativeStream({
		stdioItem,
		isStdioArray,
		fdNumber,
		direction,
		isSync
	})), optionName, direction, options);
	const objectMode = getFdObjectMode(normalizedStdioItems, direction);
	validateFileObjectMode(normalizedStdioItems, objectMode);
	return {
		direction,
		objectMode,
		stdioItems: normalizedStdioItems
	};
};
const initializeStdioItems = ({ stdioOption, fdNumber, options, optionName }) => {
	const stdioItems = filterDuplicates([...(Array.isArray(stdioOption) ? stdioOption : [stdioOption]).map((value) => initializeStdioItem(value, optionName)), ...handleInputOptions(options, fdNumber)]);
	const isStdioArray = stdioItems.length > 1;
	validateStdioArray(stdioItems, isStdioArray, optionName);
	validateStreams(stdioItems);
	return {
		stdioItems,
		isStdioArray
	};
};
const initializeStdioItem = (value, optionName) => ({
	type: getStdioItemType(value, optionName),
	value,
	optionName
});
const validateStdioArray = (stdioItems, isStdioArray, optionName) => {
	if (stdioItems.length === 0) throw new TypeError(`The \`${optionName}\` option must not be an empty array.`);
	if (!isStdioArray) return;
	for (const { value, optionName } of stdioItems) if (INVALID_STDIO_ARRAY_OPTIONS.has(value)) throw new Error(`The \`${optionName}\` option must not include \`${value}\`.`);
};
const INVALID_STDIO_ARRAY_OPTIONS = new Set(["ignore", "ipc"]);
const validateStreams = (stdioItems) => {
	for (const stdioItem of stdioItems) validateFileStdio(stdioItem);
};
const validateFileStdio = ({ type, value, optionName }) => {
	if (isRegularUrl(value)) throw new TypeError(`The \`${optionName}: URL\` option must use the \`file:\` scheme.
For example, you can use the \`pathToFileURL()\` method of the \`url\` core module.`);
	if (isUnknownStdioString(type, value)) throw new TypeError(`The \`${optionName}: { file: '...' }\` option must be used instead of \`${optionName}: '...'\`.`);
};
const validateFileObjectMode = (stdioItems, objectMode) => {
	if (!objectMode) return;
	const fileStdioItem = stdioItems.find(({ type }) => FILE_TYPES.has(type));
	if (fileStdioItem !== void 0) throw new TypeError(`The \`${fileStdioItem.optionName}\` option cannot use both files and transforms in objectMode.`);
};
const getFinalFileDescriptors = ({ initialFileDescriptors, addProperties, options, isSync }) => {
	const fileDescriptors = [];
	try {
		for (const fileDescriptor of initialFileDescriptors) fileDescriptors.push(getFinalFileDescriptor({
			fileDescriptor,
			fileDescriptors,
			addProperties,
			options,
			isSync
		}));
		return fileDescriptors;
	} catch (error) {
		cleanupCustomStreams(fileDescriptors);
		throw error;
	}
};
const getFinalFileDescriptor = ({ fileDescriptor: { direction, objectMode, stdioItems }, fileDescriptors, addProperties, options, isSync }) => {
	return {
		direction,
		objectMode,
		stdioItems: stdioItems.map((stdioItem) => addStreamProperties({
			stdioItem,
			addProperties,
			direction,
			options,
			fileDescriptors,
			isSync
		}))
	};
};
const addStreamProperties = ({ stdioItem, addProperties, direction, options, fileDescriptors, isSync }) => {
	const duplicateStream = getDuplicateStream({
		stdioItem,
		direction,
		fileDescriptors,
		isSync
	});
	if (duplicateStream !== void 0) return {
		...stdioItem,
		stream: duplicateStream
	};
	return {
		...stdioItem,
		...addProperties[direction][stdioItem.type](stdioItem, options)
	};
};
const cleanupCustomStreams = (fileDescriptors) => {
	for (const { stdioItems } of fileDescriptors) for (const { stream } of stdioItems) if (stream !== void 0 && !isStandardStream(stream)) stream.destroy();
};
const forwardStdio = (stdioItems) => {
	if (stdioItems.length > 1) return stdioItems.some(({ value }) => value === "overlapped") ? "overlapped" : "pipe";
	const [{ type, value }] = stdioItems;
	return type === "native" ? value : "pipe";
};
//#endregion
//#region node_modules/execa/lib/stdio/handle-sync.js
const handleStdioSync = (options, verboseInfo) => handleStdio(addPropertiesSync, options, verboseInfo, true);
const forbiddenIfSync = ({ type, optionName }) => {
	throwInvalidSyncValue(optionName, TYPE_TO_MESSAGE[type]);
};
const forbiddenNativeIfSync = ({ optionName, value }) => {
	if (value === "ipc" || value === "overlapped") throwInvalidSyncValue(optionName, `"${value}"`);
	return {};
};
const throwInvalidSyncValue = (optionName, value) => {
	throw new TypeError(`The \`${optionName}\` option cannot be ${value} with synchronous methods.`);
};
const addProperties$1 = {
	generator() {},
	asyncGenerator: forbiddenIfSync,
	webStream: forbiddenIfSync,
	nodeStream: forbiddenIfSync,
	webTransform: forbiddenIfSync,
	duplex: forbiddenIfSync,
	asyncIterable: forbiddenIfSync,
	native: forbiddenNativeIfSync
};
const addPropertiesSync = {
	input: {
		...addProperties$1,
		fileUrl: ({ value }) => ({ contents: [bufferToUint8Array(readFileSync(value))] }),
		filePath: ({ value: { file } }) => ({ contents: [bufferToUint8Array(readFileSync(file))] }),
		fileNumber: forbiddenIfSync,
		iterable: ({ value }) => ({ contents: [...value] }),
		string: ({ value }) => ({ contents: [value] }),
		uint8Array: ({ value }) => ({ contents: [value] })
	},
	output: {
		...addProperties$1,
		fileUrl: ({ value }) => ({ path: value }),
		filePath: ({ value: { file, append } }) => ({
			path: file,
			append
		}),
		fileNumber: ({ value }) => ({ path: value }),
		iterable: forbiddenIfSync,
		string: forbiddenIfSync,
		uint8Array: forbiddenIfSync
	}
};
//#endregion
//#region node_modules/execa/lib/io/strip-newline.js
const stripNewline = (value, { stripFinalNewline: stripFinalNewline$1 }, fdNumber) => getStripFinalNewline(stripFinalNewline$1, fdNumber) && value !== void 0 && !Array.isArray(value) ? stripFinalNewline(value) : value;
const getStripFinalNewline = (stripFinalNewline, fdNumber) => fdNumber === "all" ? stripFinalNewline[1] || stripFinalNewline[2] : stripFinalNewline[fdNumber];
//#endregion
//#region node_modules/execa/lib/transform/split.js
const getSplitLinesGenerator = (binary, preserveNewlines, skipped, state) => binary || skipped ? void 0 : initializeSplitLines(preserveNewlines, state);
const splitLinesSync = (chunk, preserveNewlines, objectMode) => objectMode ? chunk.flatMap((item) => splitLinesItemSync(item, preserveNewlines)) : splitLinesItemSync(chunk, preserveNewlines);
const splitLinesItemSync = (chunk, preserveNewlines) => {
	const { transform, final } = initializeSplitLines(preserveNewlines, {});
	return [...transform(chunk), ...final()];
};
const initializeSplitLines = (preserveNewlines, state) => {
	state.previousChunks = "";
	return {
		transform: splitGenerator.bind(void 0, state, preserveNewlines),
		final: linesFinal.bind(void 0, state)
	};
};
const splitGenerator = function* (state, preserveNewlines, chunk) {
	if (typeof chunk !== "string") {
		yield chunk;
		return;
	}
	let { previousChunks } = state;
	let start = -1;
	for (let end = 0; end < chunk.length; end += 1) if (chunk[end] === "\n") {
		const newlineLength = getNewlineLength(chunk, end, preserveNewlines, state);
		let line = chunk.slice(start + 1, end + 1 - newlineLength);
		if (previousChunks.length > 0) {
			line = concatString(previousChunks, line);
			previousChunks = "";
		}
		yield line;
		start = end;
	}
	if (start !== chunk.length - 1) previousChunks = concatString(previousChunks, chunk.slice(start + 1));
	state.previousChunks = previousChunks;
};
const getNewlineLength = (chunk, end, preserveNewlines, state) => {
	if (preserveNewlines) return 0;
	state.isWindowsNewline = end !== 0 && chunk[end - 1] === "\r";
	return state.isWindowsNewline ? 2 : 1;
};
const linesFinal = function* ({ previousChunks }) {
	if (previousChunks.length > 0) yield previousChunks;
};
const getAppendNewlineGenerator = ({ binary, preserveNewlines, readableObjectMode, state }) => binary || preserveNewlines || readableObjectMode ? void 0 : { transform: appendNewlineGenerator.bind(void 0, state) };
const appendNewlineGenerator = function* ({ isWindowsNewline = false }, chunk) {
	const { unixNewline, windowsNewline, LF, concatBytes } = typeof chunk === "string" ? linesStringInfo : linesUint8ArrayInfo;
	if (chunk.at(-1) === LF) {
		yield chunk;
		return;
	}
	yield concatBytes(chunk, isWindowsNewline ? windowsNewline : unixNewline);
};
const concatString = (firstChunk, secondChunk) => `${firstChunk}${secondChunk}`;
const linesStringInfo = {
	windowsNewline: "\r\n",
	unixNewline: "\n",
	LF: "\n",
	concatBytes: concatString
};
const concatUint8Array = (firstChunk, secondChunk) => {
	const chunk = new Uint8Array(firstChunk.length + secondChunk.length);
	chunk.set(firstChunk, 0);
	chunk.set(secondChunk, firstChunk.length);
	return chunk;
};
const linesUint8ArrayInfo = {
	windowsNewline: new Uint8Array([13, 10]),
	unixNewline: new Uint8Array([10]),
	LF: 10,
	concatBytes: concatUint8Array
};
//#endregion
//#region node_modules/execa/lib/transform/validate.js
const getValidateTransformInput = (writableObjectMode, optionName) => writableObjectMode ? void 0 : validateStringTransformInput.bind(void 0, optionName);
const validateStringTransformInput = function* (optionName, chunk) {
	if (typeof chunk !== "string" && !isUint8Array(chunk) && !Buffer$1.isBuffer(chunk)) throw new TypeError(`The \`${optionName}\` option's transform must use "objectMode: true" to receive as input: ${typeof chunk}.`);
	yield chunk;
};
const getValidateTransformReturn = (readableObjectMode, optionName) => readableObjectMode ? validateObjectTransformReturn.bind(void 0, optionName) : validateStringTransformReturn.bind(void 0, optionName);
const validateObjectTransformReturn = function* (optionName, chunk) {
	validateEmptyReturn(optionName, chunk);
	yield chunk;
};
const validateStringTransformReturn = function* (optionName, chunk) {
	validateEmptyReturn(optionName, chunk);
	if (typeof chunk !== "string" && !isUint8Array(chunk)) throw new TypeError(`The \`${optionName}\` option's function must yield a string or an Uint8Array, not ${typeof chunk}.`);
	yield chunk;
};
const validateEmptyReturn = (optionName, chunk) => {
	if (chunk === null || chunk === void 0) throw new TypeError(`The \`${optionName}\` option's function must not call \`yield ${chunk}\`.
Instead, \`yield\` should either be called with a value, or not be called at all. For example:
  if (condition) { yield value; }`);
};
//#endregion
//#region node_modules/execa/lib/transform/encoding-transform.js
const getEncodingTransformGenerator = (binary, encoding, skipped) => {
	if (skipped) return;
	if (binary) return { transform: encodingUint8ArrayGenerator.bind(void 0, new TextEncoder()) };
	const stringDecoder = new StringDecoder(encoding);
	return {
		transform: encodingStringGenerator.bind(void 0, stringDecoder),
		final: encodingStringFinal.bind(void 0, stringDecoder)
	};
};
const encodingUint8ArrayGenerator = function* (textEncoder, chunk) {
	if (Buffer$1.isBuffer(chunk)) yield bufferToUint8Array(chunk);
	else if (typeof chunk === "string") yield textEncoder.encode(chunk);
	else yield chunk;
};
const encodingStringGenerator = function* (stringDecoder, chunk) {
	yield isUint8Array(chunk) ? stringDecoder.write(chunk) : chunk;
};
const encodingStringFinal = function* (stringDecoder) {
	const lastChunk = stringDecoder.end();
	if (lastChunk !== "") yield lastChunk;
};
//#endregion
//#region node_modules/execa/lib/transform/run-async.js
const pushChunks = callbackify(async (getChunks, state, getChunksArguments, transformStream) => {
	state.currentIterable = getChunks(...getChunksArguments);
	try {
		for await (const chunk of state.currentIterable) transformStream.push(chunk);
	} finally {
		delete state.currentIterable;
	}
});
const transformChunk = async function* (chunk, generators, index) {
	if (index === generators.length) {
		yield chunk;
		return;
	}
	const { transform = identityGenerator$1 } = generators[index];
	for await (const transformedChunk of transform(chunk)) yield* transformChunk(transformedChunk, generators, index + 1);
};
const finalChunks = async function* (generators) {
	for (const [index, { final }] of Object.entries(generators)) yield* generatorFinalChunks(final, Number(index), generators);
};
const generatorFinalChunks = async function* (final, index, generators) {
	if (final === void 0) return;
	for await (const finalChunk of final()) yield* transformChunk(finalChunk, generators, index + 1);
};
const destroyTransform = callbackify(async ({ currentIterable }, error) => {
	if (currentIterable !== void 0) {
		await (error ? currentIterable.throw(error) : currentIterable.return());
		return;
	}
	if (error) throw error;
});
const identityGenerator$1 = function* (chunk) {
	yield chunk;
};
//#endregion
//#region node_modules/execa/lib/transform/run-sync.js
const pushChunksSync = (getChunksSync, getChunksArguments, transformStream, done) => {
	try {
		for (const chunk of getChunksSync(...getChunksArguments)) transformStream.push(chunk);
		done();
	} catch (error) {
		done(error);
	}
};
const runTransformSync = (generators, chunks) => [...chunks.flatMap((chunk) => [...transformChunkSync(chunk, generators, 0)]), ...finalChunksSync(generators)];
const transformChunkSync = function* (chunk, generators, index) {
	if (index === generators.length) {
		yield chunk;
		return;
	}
	const { transform = identityGenerator } = generators[index];
	for (const transformedChunk of transform(chunk)) yield* transformChunkSync(transformedChunk, generators, index + 1);
};
const finalChunksSync = function* (generators) {
	for (const [index, { final }] of Object.entries(generators)) yield* generatorFinalChunksSync(final, Number(index), generators);
};
const generatorFinalChunksSync = function* (final, index, generators) {
	if (final === void 0) return;
	for (const finalChunk of final()) yield* transformChunkSync(finalChunk, generators, index + 1);
};
const identityGenerator = function* (chunk) {
	yield chunk;
};
//#endregion
//#region node_modules/execa/lib/transform/generator.js
const generatorToStream = ({ value, value: { transform, final, writableObjectMode, readableObjectMode }, optionName }, { encoding }) => {
	const state = {};
	const generators = addInternalGenerators(value, encoding, optionName);
	const transformAsync = isAsyncGenerator(transform);
	const finalAsync = isAsyncGenerator(final);
	const transformMethod = transformAsync ? pushChunks.bind(void 0, transformChunk, state) : pushChunksSync.bind(void 0, transformChunkSync);
	const finalMethod = transformAsync || finalAsync ? pushChunks.bind(void 0, finalChunks, state) : pushChunksSync.bind(void 0, finalChunksSync);
	const destroyMethod = transformAsync || finalAsync ? destroyTransform.bind(void 0, state) : void 0;
	return { stream: new Transform({
		writableObjectMode,
		writableHighWaterMark: getDefaultHighWaterMark(writableObjectMode),
		readableObjectMode,
		readableHighWaterMark: getDefaultHighWaterMark(readableObjectMode),
		transform(chunk, encoding, done) {
			transformMethod([
				chunk,
				generators,
				0
			], this, done);
		},
		flush(done) {
			finalMethod([generators], this, done);
		},
		destroy: destroyMethod
	}) };
};
const runGeneratorsSync = (chunks, stdioItems, encoding, isInput) => {
	const generators = stdioItems.filter(({ type }) => type === "generator");
	const reversedGenerators = isInput ? generators.reverse() : generators;
	for (const { value, optionName } of reversedGenerators) chunks = runTransformSync(addInternalGenerators(value, encoding, optionName), chunks);
	return chunks;
};
const addInternalGenerators = ({ transform, final, binary, writableObjectMode, readableObjectMode, preserveNewlines }, encoding, optionName) => {
	const state = {};
	return [
		{ transform: getValidateTransformInput(writableObjectMode, optionName) },
		getEncodingTransformGenerator(binary, encoding, writableObjectMode),
		getSplitLinesGenerator(binary, preserveNewlines, writableObjectMode, state),
		{
			transform,
			final
		},
		{ transform: getValidateTransformReturn(readableObjectMode, optionName) },
		getAppendNewlineGenerator({
			binary,
			preserveNewlines,
			readableObjectMode,
			state
		})
	].filter(Boolean);
};
//#endregion
//#region node_modules/execa/lib/io/input-sync.js
const addInputOptionsSync = (fileDescriptors, options) => {
	for (const fdNumber of getInputFdNumbers(fileDescriptors)) addInputOptionSync(fileDescriptors, fdNumber, options);
};
const getInputFdNumbers = (fileDescriptors) => new Set(Object.entries(fileDescriptors).filter(([, { direction }]) => direction === "input").map(([fdNumber]) => Number(fdNumber)));
const addInputOptionSync = (fileDescriptors, fdNumber, options) => {
	const { stdioItems } = fileDescriptors[fdNumber];
	const allStdioItems = stdioItems.filter(({ contents }) => contents !== void 0);
	if (allStdioItems.length === 0) return;
	if (fdNumber !== 0) {
		const [{ type, optionName }] = allStdioItems;
		throw new TypeError(`Only the \`stdin\` option, not \`${optionName}\`, can be ${TYPE_TO_MESSAGE[type]} with synchronous methods.`);
	}
	options.input = joinToUint8Array(allStdioItems.map(({ contents }) => contents).map((contents) => applySingleInputGeneratorsSync(contents, stdioItems)));
};
const applySingleInputGeneratorsSync = (contents, stdioItems) => {
	const newContents = runGeneratorsSync(contents, stdioItems, "utf8", true);
	validateSerializable(newContents);
	return joinToUint8Array(newContents);
};
const validateSerializable = (newContents) => {
	const invalidItem = newContents.find((item) => typeof item !== "string" && !isUint8Array(item));
	if (invalidItem !== void 0) throw new TypeError(`The \`stdin\` option is invalid: when passing objects as input, a transform must be used to serialize them to strings or Uint8Arrays: ${invalidItem}.`);
};
//#endregion
//#region node_modules/execa/lib/verbose/output.js
const shouldLogOutput = ({ stdioItems, encoding, verboseInfo, fdNumber }) => fdNumber !== "all" && isFullVerbose(verboseInfo, fdNumber) && !BINARY_ENCODINGS.has(encoding) && fdUsesVerbose(fdNumber) && (stdioItems.some(({ type, value }) => type === "native" && PIPED_STDIO_VALUES.has(value)) || stdioItems.every(({ type }) => TRANSFORM_TYPES.has(type)));
const fdUsesVerbose = (fdNumber) => fdNumber === 1 || fdNumber === 2;
const PIPED_STDIO_VALUES = new Set(["pipe", "overlapped"]);
const logLines = async (linesIterable, stream, fdNumber, verboseInfo) => {
	for await (const line of linesIterable) if (!isPipingStream(stream)) logLine(line, fdNumber, verboseInfo);
};
const logLinesSync = (linesArray, fdNumber, verboseInfo) => {
	for (const line of linesArray) logLine(line, fdNumber, verboseInfo);
};
const isPipingStream = (stream) => stream._readableState.pipes.length > 0;
const logLine = (line, fdNumber, verboseInfo) => {
	verboseLog({
		type: "output",
		verboseMessage: serializeVerboseMessage(line),
		fdNumber,
		verboseInfo
	});
};
//#endregion
//#region node_modules/execa/lib/io/output-sync.js
const transformOutputSync = ({ fileDescriptors, syncResult: { output }, options, isMaxBuffer, verboseInfo }) => {
	if (output === null) return { output: Array.from({ length: 3 }) };
	const state = {};
	const outputFiles = /* @__PURE__ */ new Set([]);
	return {
		output: output.map((result, fdNumber) => transformOutputResultSync({
			result,
			fileDescriptors,
			fdNumber,
			state,
			outputFiles,
			isMaxBuffer,
			verboseInfo
		}, options)),
		...state
	};
};
const transformOutputResultSync = ({ result, fileDescriptors, fdNumber, state, outputFiles, isMaxBuffer, verboseInfo }, { buffer, encoding, lines, stripFinalNewline, maxBuffer }) => {
	if (result === null) return;
	const uint8ArrayResult = bufferToUint8Array(truncateMaxBufferSync(result, isMaxBuffer, maxBuffer));
	const { stdioItems, objectMode } = fileDescriptors[fdNumber];
	const { serializedResult, finalResult = serializedResult } = serializeChunks({
		chunks: runOutputGeneratorsSync([uint8ArrayResult], stdioItems, encoding, state),
		objectMode,
		encoding,
		lines,
		stripFinalNewline,
		fdNumber
	});
	logOutputSync({
		serializedResult,
		fdNumber,
		state,
		verboseInfo,
		encoding,
		stdioItems,
		objectMode
	});
	const returnedResult = buffer[fdNumber] ? finalResult : void 0;
	try {
		if (state.error === void 0) writeToFiles(serializedResult, stdioItems, outputFiles);
		return returnedResult;
	} catch (error) {
		state.error = error;
		return returnedResult;
	}
};
const runOutputGeneratorsSync = (chunks, stdioItems, encoding, state) => {
	try {
		return runGeneratorsSync(chunks, stdioItems, encoding, false);
	} catch (error) {
		state.error = error;
		return chunks;
	}
};
const serializeChunks = ({ chunks, objectMode, encoding, lines, stripFinalNewline, fdNumber }) => {
	if (objectMode) return { serializedResult: chunks };
	if (encoding === "buffer") return { serializedResult: joinToUint8Array(chunks) };
	const serializedResult = joinToString(chunks, encoding);
	if (lines[fdNumber]) return {
		serializedResult,
		finalResult: splitLinesSync(serializedResult, !stripFinalNewline[fdNumber], objectMode)
	};
	return { serializedResult };
};
const logOutputSync = ({ serializedResult, fdNumber, state, verboseInfo, encoding, stdioItems, objectMode }) => {
	if (!shouldLogOutput({
		stdioItems,
		encoding,
		verboseInfo,
		fdNumber
	})) return;
	const linesArray = splitLinesSync(serializedResult, false, objectMode);
	try {
		logLinesSync(linesArray, fdNumber, verboseInfo);
	} catch (error) {
		state.error ??= error;
	}
};
const writeToFiles = (serializedResult, stdioItems, outputFiles) => {
	for (const { path, append } of stdioItems.filter(({ type }) => FILE_TYPES.has(type))) {
		const pathString = typeof path === "string" ? path : path.toString();
		if (append || outputFiles.has(pathString)) appendFileSync(path, serializedResult);
		else {
			outputFiles.add(pathString);
			writeFileSync(path, serializedResult);
		}
	}
};
//#endregion
//#region node_modules/execa/lib/resolve/all-sync.js
const getAllSync = ([, stdout, stderr], options) => {
	if (!options.all) return;
	if (stdout === void 0) return stderr;
	if (stderr === void 0) return stdout;
	if (Array.isArray(stdout)) return Array.isArray(stderr) ? [...stdout, ...stderr] : [...stdout, stripNewline(stderr, options, "all")];
	if (Array.isArray(stderr)) return [stripNewline(stdout, options, "all"), ...stderr];
	if (isUint8Array(stdout) && isUint8Array(stderr)) return concatUint8Arrays([stdout, stderr]);
	return `${stdout}${stderr}`;
};
//#endregion
//#region node_modules/execa/lib/resolve/exit-async.js
const waitForExit = async (subprocess, context) => {
	const [exitCode, signal] = await waitForExitOrError(subprocess);
	context.isForcefullyTerminated ??= false;
	return [exitCode, signal];
};
const waitForExitOrError = async (subprocess) => {
	const [spawnPayload, exitPayload] = await Promise.allSettled([once(subprocess, "spawn"), once(subprocess, "exit")]);
	if (spawnPayload.status === "rejected") return [];
	return exitPayload.status === "rejected" ? waitForSubprocessExit(subprocess) : exitPayload.value;
};
const waitForSubprocessExit = async (subprocess) => {
	try {
		return await once(subprocess, "exit");
	} catch {
		return waitForSubprocessExit(subprocess);
	}
};
const waitForSuccessfulExit = async (exitPromise) => {
	const [exitCode, signal] = await exitPromise;
	if (!isSubprocessErrorExit(exitCode, signal) && isFailedExit(exitCode, signal)) throw new DiscardedError();
	return [exitCode, signal];
};
const isSubprocessErrorExit = (exitCode, signal) => exitCode === void 0 && signal === void 0;
const isFailedExit = (exitCode, signal) => exitCode !== 0 || signal !== null;
//#endregion
//#region node_modules/execa/lib/resolve/exit-sync.js
const getExitResultSync = ({ error, status: exitCode, signal, output }, { maxBuffer }) => {
	const resultError = getResultError(error, exitCode, signal);
	return {
		resultError,
		exitCode,
		signal,
		timedOut: resultError?.code === "ETIMEDOUT",
		isMaxBuffer: isMaxBufferSync(resultError, output, maxBuffer)
	};
};
const getResultError = (error, exitCode, signal) => {
	if (error !== void 0) return error;
	return isFailedExit(exitCode, signal) ? new DiscardedError() : void 0;
};
//#endregion
//#region node_modules/execa/lib/methods/main-sync.js
const execaCoreSync = (rawFile, rawArguments, rawOptions) => {
	const { file, commandArguments, command, escapedCommand, startTime, verboseInfo, options, fileDescriptors } = handleSyncArguments(rawFile, rawArguments, rawOptions);
	return handleResult(spawnSubprocessSync({
		file,
		commandArguments,
		options,
		command,
		escapedCommand,
		verboseInfo,
		fileDescriptors,
		startTime
	}), verboseInfo, options);
};
const handleSyncArguments = (rawFile, rawArguments, rawOptions) => {
	const { command, escapedCommand, startTime, verboseInfo } = handleCommand(rawFile, rawArguments, rawOptions);
	const { file, commandArguments, options } = normalizeOptions(rawFile, rawArguments, normalizeSyncOptions(rawOptions));
	validateSyncOptions(options);
	return {
		file,
		commandArguments,
		command,
		escapedCommand,
		startTime,
		verboseInfo,
		options,
		fileDescriptors: handleStdioSync(options, verboseInfo)
	};
};
const normalizeSyncOptions = (options) => options.node && !options.ipc ? {
	...options,
	ipc: false
} : options;
const validateSyncOptions = ({ ipc, ipcInput, detached, cancelSignal }) => {
	if (ipcInput) throwInvalidSyncOption("ipcInput");
	if (ipc) throwInvalidSyncOption("ipc: true");
	if (detached) throwInvalidSyncOption("detached: true");
	if (cancelSignal) throwInvalidSyncOption("cancelSignal");
};
const throwInvalidSyncOption = (value) => {
	throw new TypeError(`The "${value}" option cannot be used with synchronous methods.`);
};
const spawnSubprocessSync = ({ file, commandArguments, options, command, escapedCommand, verboseInfo, fileDescriptors, startTime }) => {
	const syncResult = runSubprocessSync({
		file,
		commandArguments,
		options,
		command,
		escapedCommand,
		fileDescriptors,
		startTime
	});
	if (syncResult.failed) return syncResult;
	const { resultError, exitCode, signal, timedOut, isMaxBuffer } = getExitResultSync(syncResult, options);
	const { output, error = resultError } = transformOutputSync({
		fileDescriptors,
		syncResult,
		options,
		isMaxBuffer,
		verboseInfo
	});
	return getSyncResult({
		error,
		exitCode,
		signal,
		timedOut,
		isMaxBuffer,
		stdio: output.map((stdioOutput, fdNumber) => stripNewline(stdioOutput, options, fdNumber)),
		all: stripNewline(getAllSync(output, options), options, "all"),
		options,
		command,
		escapedCommand,
		startTime
	});
};
const runSubprocessSync = ({ file, commandArguments, options, command, escapedCommand, fileDescriptors, startTime }) => {
	try {
		addInputOptionsSync(fileDescriptors, options);
		return spawnSync(...concatenateShell(file, commandArguments, normalizeSpawnSyncOptions(options)));
	} catch (error) {
		return makeEarlyError({
			error,
			command,
			escapedCommand,
			fileDescriptors,
			options,
			startTime,
			isSync: true
		});
	}
};
const normalizeSpawnSyncOptions = ({ encoding, maxBuffer, ...options }) => ({
	...options,
	encoding: "buffer",
	maxBuffer: getMaxBufferSync(maxBuffer)
});
const getSyncResult = ({ error, exitCode, signal, timedOut, isMaxBuffer, stdio, all, options, command, escapedCommand, startTime }) => error === void 0 ? makeSuccessResult({
	command,
	escapedCommand,
	stdio,
	all,
	ipcOutput: [],
	options,
	startTime
}) : makeError({
	error,
	command,
	escapedCommand,
	timedOut,
	isCanceled: false,
	isGracefullyCanceled: false,
	isMaxBuffer,
	isForcefullyTerminated: false,
	exitCode,
	signal,
	stdio,
	all,
	ipcOutput: [],
	options,
	startTime,
	isSync: true
});
//#endregion
//#region node_modules/execa/lib/ipc/get-one.js
const getOneMessage$1 = ({ anyProcess, channel, isSubprocess, ipc }, { reference = true, filter } = {}) => {
	validateIpcMethod({
		methodName: "getOneMessage",
		isSubprocess,
		ipc,
		isConnected: isConnected(anyProcess)
	});
	return getOneMessageAsync({
		anyProcess,
		channel,
		isSubprocess,
		filter,
		reference
	});
};
const getOneMessageAsync = async ({ anyProcess, channel, isSubprocess, filter, reference }) => {
	addReference(channel, reference);
	const ipcEmitter = getIpcEmitter(anyProcess, channel, isSubprocess);
	const controller = new AbortController();
	try {
		return await Promise.race([
			getMessage(ipcEmitter, filter, controller),
			throwOnDisconnect(ipcEmitter, isSubprocess, controller),
			throwOnStrictError(ipcEmitter, isSubprocess, controller)
		]);
	} catch (error) {
		disconnect(anyProcess);
		throw error;
	} finally {
		controller.abort();
		removeReference(channel, reference);
	}
};
const getMessage = async (ipcEmitter, filter, { signal }) => {
	if (filter === void 0) {
		const [message] = await once(ipcEmitter, "message", { signal });
		return message;
	}
	for await (const [message] of on(ipcEmitter, "message", { signal })) if (filter(message)) return message;
};
const throwOnDisconnect = async (ipcEmitter, isSubprocess, { signal }) => {
	await once(ipcEmitter, "disconnect", { signal });
	throwOnEarlyDisconnect(isSubprocess);
};
const throwOnStrictError = async (ipcEmitter, isSubprocess, { signal }) => {
	const [error] = await once(ipcEmitter, "strict:error", { signal });
	throw getStrictResponseError(error, isSubprocess);
};
//#endregion
//#region node_modules/execa/lib/ipc/get-each.js
const getEachMessage$1 = ({ anyProcess, channel, isSubprocess, ipc }, { reference = true } = {}) => loopOnMessages({
	anyProcess,
	channel,
	isSubprocess,
	ipc,
	shouldAwait: !isSubprocess,
	reference
});
const loopOnMessages = ({ anyProcess, channel, isSubprocess, ipc, shouldAwait, reference }) => {
	validateIpcMethod({
		methodName: "getEachMessage",
		isSubprocess,
		ipc,
		isConnected: isConnected(anyProcess)
	});
	addReference(channel, reference);
	const ipcEmitter = getIpcEmitter(anyProcess, channel, isSubprocess);
	const controller = new AbortController();
	const state = {};
	stopOnDisconnect(anyProcess, ipcEmitter, controller);
	abortOnStrictError({
		ipcEmitter,
		isSubprocess,
		controller,
		state
	});
	return iterateOnMessages({
		anyProcess,
		channel,
		ipcEmitter,
		isSubprocess,
		shouldAwait,
		controller,
		state,
		reference
	});
};
const stopOnDisconnect = async (anyProcess, ipcEmitter, controller) => {
	try {
		await once(ipcEmitter, "disconnect", { signal: controller.signal });
		controller.abort();
	} catch {}
};
const abortOnStrictError = async ({ ipcEmitter, isSubprocess, controller, state }) => {
	try {
		const [error] = await once(ipcEmitter, "strict:error", { signal: controller.signal });
		state.error = getStrictResponseError(error, isSubprocess);
		controller.abort();
	} catch {}
};
const iterateOnMessages = async function* ({ anyProcess, channel, ipcEmitter, isSubprocess, shouldAwait, controller, state, reference }) {
	try {
		for await (const [message] of on(ipcEmitter, "message", { signal: controller.signal })) {
			throwIfStrictError(state);
			yield message;
		}
	} catch {
		throwIfStrictError(state);
	} finally {
		controller.abort();
		removeReference(channel, reference);
		if (!isSubprocess) disconnect(anyProcess);
		if (shouldAwait) await anyProcess;
	}
};
const throwIfStrictError = ({ error }) => {
	if (error) throw error;
};
//#endregion
//#region node_modules/execa/lib/ipc/methods.js
const addIpcMethods = (subprocess, { ipc }) => {
	Object.assign(subprocess, getIpcMethods(subprocess, false, ipc));
};
const getIpcExport = () => {
	const anyProcess = process$1;
	const isSubprocess = true;
	const ipc = process$1.channel !== void 0;
	return {
		...getIpcMethods(anyProcess, isSubprocess, ipc),
		getCancelSignal: getCancelSignal$1.bind(void 0, {
			anyProcess,
			channel: anyProcess.channel,
			isSubprocess,
			ipc
		})
	};
};
const getIpcMethods = (anyProcess, isSubprocess, ipc) => ({
	sendMessage: sendMessage$1.bind(void 0, {
		anyProcess,
		channel: anyProcess.channel,
		isSubprocess,
		ipc
	}),
	getOneMessage: getOneMessage$1.bind(void 0, {
		anyProcess,
		channel: anyProcess.channel,
		isSubprocess,
		ipc
	}),
	getEachMessage: getEachMessage$1.bind(void 0, {
		anyProcess,
		channel: anyProcess.channel,
		isSubprocess,
		ipc
	})
});
//#endregion
//#region node_modules/execa/lib/return/early-error.js
const handleEarlyError = ({ error, command, escapedCommand, fileDescriptors, options, startTime, verboseInfo }) => {
	cleanupCustomStreams(fileDescriptors);
	const subprocess = new ChildProcess();
	createDummyStreams(subprocess, fileDescriptors);
	Object.assign(subprocess, {
		readable: readable$1,
		writable,
		duplex
	});
	return {
		subprocess,
		promise: handleDummyPromise(makeEarlyError({
			error,
			command,
			escapedCommand,
			fileDescriptors,
			options,
			startTime,
			isSync: false
		}), verboseInfo, options)
	};
};
const createDummyStreams = (subprocess, fileDescriptors) => {
	const stdin = createDummyStream();
	const stdout = createDummyStream();
	const stderr = createDummyStream();
	const extraStdio = Array.from({ length: fileDescriptors.length - 3 }, createDummyStream);
	const all = createDummyStream();
	const stdio = [
		stdin,
		stdout,
		stderr,
		...extraStdio
	];
	Object.assign(subprocess, {
		stdin,
		stdout,
		stderr,
		all,
		stdio
	});
};
const createDummyStream = () => {
	const stream = new PassThrough();
	stream.end();
	return stream;
};
const readable$1 = () => new Readable({ read() {} });
const writable = () => new Writable({ write() {} });
const duplex = () => new Duplex({
	read() {},
	write() {}
});
const handleDummyPromise = async (error, verboseInfo, options) => handleResult(error, verboseInfo, options);
//#endregion
//#region node_modules/execa/lib/stdio/handle-async.js
const handleStdioAsync = (options, verboseInfo) => handleStdio(addPropertiesAsync, options, verboseInfo, false);
const forbiddenIfAsync = ({ type, optionName }) => {
	throw new TypeError(`The \`${optionName}\` option cannot be ${TYPE_TO_MESSAGE[type]}.`);
};
const addProperties = {
	fileNumber: forbiddenIfAsync,
	generator: generatorToStream,
	asyncGenerator: generatorToStream,
	nodeStream: ({ value }) => ({ stream: value }),
	webTransform({ value: { transform, writableObjectMode, readableObjectMode } }) {
		const objectMode = writableObjectMode || readableObjectMode;
		return { stream: Duplex.fromWeb(transform, { objectMode }) };
	},
	duplex: ({ value: { transform } }) => ({ stream: transform }),
	native() {}
};
const addPropertiesAsync = {
	input: {
		...addProperties,
		fileUrl: ({ value }) => ({ stream: createReadStream(value) }),
		filePath: ({ value: { file } }) => ({ stream: createReadStream(file) }),
		webStream: ({ value }) => ({ stream: Readable.fromWeb(value) }),
		iterable: ({ value }) => ({ stream: Readable.from(value) }),
		asyncIterable: ({ value }) => ({ stream: Readable.from(value) }),
		string: ({ value }) => ({ stream: Readable.from(value) }),
		uint8Array: ({ value }) => ({ stream: Readable.from(Buffer$1.from(value)) })
	},
	output: {
		...addProperties,
		fileUrl: ({ value }) => ({ stream: createWriteStream(value) }),
		filePath: ({ value: { file, append } }) => ({ stream: createWriteStream(file, append ? { flags: "a" } : {}) }),
		webStream: ({ value }) => ({ stream: Writable.fromWeb(value) }),
		iterable: forbiddenIfAsync,
		asyncIterable: forbiddenIfAsync,
		string: forbiddenIfAsync,
		uint8Array: forbiddenIfAsync
	}
};
//#endregion
//#region node_modules/@sindresorhus/merge-streams/index.js
function mergeStreams(streams) {
	if (!Array.isArray(streams)) throw new TypeError(`Expected an array, got \`${typeof streams}\`.`);
	for (const stream of streams) validateStream(stream);
	const objectMode = streams.some(({ readableObjectMode }) => readableObjectMode);
	const highWaterMark = getHighWaterMark(streams, objectMode);
	const passThroughStream = new MergedStream({
		objectMode,
		writableHighWaterMark: highWaterMark,
		readableHighWaterMark: highWaterMark
	});
	for (const stream of streams) passThroughStream.add(stream);
	return passThroughStream;
}
const getHighWaterMark = (streams, objectMode) => {
	if (streams.length === 0) return getDefaultHighWaterMark(objectMode);
	const highWaterMarks = streams.filter(({ readableObjectMode }) => readableObjectMode === objectMode).map(({ readableHighWaterMark }) => readableHighWaterMark);
	return Math.max(...highWaterMarks);
};
var MergedStream = class extends PassThrough {
	#streams = /* @__PURE__ */ new Set([]);
	#ended = /* @__PURE__ */ new Set([]);
	#aborted = /* @__PURE__ */ new Set([]);
	#onFinished;
	#unpipeEvent = Symbol("unpipe");
	#streamPromises = /* @__PURE__ */ new WeakMap();
	add(stream) {
		validateStream(stream);
		if (this.#streams.has(stream)) return;
		this.#streams.add(stream);
		this.#onFinished ??= onMergedStreamFinished(this, this.#streams, this.#unpipeEvent);
		const streamPromise = endWhenStreamsDone({
			passThroughStream: this,
			stream,
			streams: this.#streams,
			ended: this.#ended,
			aborted: this.#aborted,
			onFinished: this.#onFinished,
			unpipeEvent: this.#unpipeEvent
		});
		this.#streamPromises.set(stream, streamPromise);
		stream.pipe(this, { end: false });
	}
	async remove(stream) {
		validateStream(stream);
		if (!this.#streams.has(stream)) return false;
		const streamPromise = this.#streamPromises.get(stream);
		if (streamPromise === void 0) return false;
		this.#streamPromises.delete(stream);
		stream.unpipe(this);
		await streamPromise;
		return true;
	}
};
const onMergedStreamFinished = async (passThroughStream, streams, unpipeEvent) => {
	updateMaxListeners(passThroughStream, PASSTHROUGH_LISTENERS_COUNT);
	const controller = new AbortController();
	try {
		await Promise.race([onMergedStreamEnd(passThroughStream, controller), onInputStreamsUnpipe(passThroughStream, streams, unpipeEvent, controller)]);
	} finally {
		controller.abort();
		updateMaxListeners(passThroughStream, -PASSTHROUGH_LISTENERS_COUNT);
	}
};
const onMergedStreamEnd = async (passThroughStream, { signal }) => {
	try {
		await finished(passThroughStream, {
			signal,
			cleanup: true
		});
	} catch (error) {
		errorOrAbortStream(passThroughStream, error);
		throw error;
	}
};
const onInputStreamsUnpipe = async (passThroughStream, streams, unpipeEvent, { signal }) => {
	for await (const [unpipedStream] of on(passThroughStream, "unpipe", { signal })) if (streams.has(unpipedStream)) unpipedStream.emit(unpipeEvent);
};
const validateStream = (stream) => {
	if (typeof stream?.pipe !== "function") throw new TypeError(`Expected a readable stream, got: \`${typeof stream}\`.`);
};
const endWhenStreamsDone = async ({ passThroughStream, stream, streams, ended, aborted, onFinished, unpipeEvent }) => {
	updateMaxListeners(passThroughStream, PASSTHROUGH_LISTENERS_PER_STREAM);
	const controller = new AbortController();
	try {
		await Promise.race([
			afterMergedStreamFinished(onFinished, stream, controller),
			onInputStreamEnd({
				passThroughStream,
				stream,
				streams,
				ended,
				aborted,
				controller
			}),
			onInputStreamUnpipe({
				stream,
				streams,
				ended,
				aborted,
				unpipeEvent,
				controller
			})
		]);
	} finally {
		controller.abort();
		updateMaxListeners(passThroughStream, -PASSTHROUGH_LISTENERS_PER_STREAM);
	}
	if (streams.size > 0 && streams.size === ended.size + aborted.size) if (ended.size === 0 && aborted.size > 0) abortStream(passThroughStream);
	else endStream(passThroughStream);
};
const afterMergedStreamFinished = async (onFinished, stream, { signal }) => {
	try {
		await onFinished;
		if (!signal.aborted) abortStream(stream);
	} catch (error) {
		if (!signal.aborted) errorOrAbortStream(stream, error);
	}
};
const onInputStreamEnd = async ({ passThroughStream, stream, streams, ended, aborted, controller: { signal } }) => {
	try {
		await finished(stream, {
			signal,
			cleanup: true,
			readable: true,
			writable: false
		});
		if (streams.has(stream)) ended.add(stream);
	} catch (error) {
		if (signal.aborted || !streams.has(stream)) return;
		if (isAbortError(error)) aborted.add(stream);
		else errorStream(passThroughStream, error);
	}
};
const onInputStreamUnpipe = async ({ stream, streams, ended, aborted, unpipeEvent, controller: { signal } }) => {
	await once(stream, unpipeEvent, { signal });
	if (!stream.readable) return once(signal, "abort", { signal });
	streams.delete(stream);
	ended.delete(stream);
	aborted.delete(stream);
};
const endStream = (stream) => {
	if (stream.writable) stream.end();
};
const errorOrAbortStream = (stream, error) => {
	if (isAbortError(error)) abortStream(stream);
	else errorStream(stream, error);
};
const isAbortError = (error) => error?.code === "ERR_STREAM_PREMATURE_CLOSE";
const abortStream = (stream) => {
	if (stream.readable || stream.writable) stream.destroy();
};
const errorStream = (stream, error) => {
	if (!stream.destroyed) {
		stream.once("error", noop);
		stream.destroy(error);
	}
};
const noop = () => {};
const updateMaxListeners = (passThroughStream, increment) => {
	const maxListeners = passThroughStream.getMaxListeners();
	if (maxListeners !== 0 && maxListeners !== Number.POSITIVE_INFINITY) passThroughStream.setMaxListeners(maxListeners + increment);
};
const PASSTHROUGH_LISTENERS_COUNT = 2;
const PASSTHROUGH_LISTENERS_PER_STREAM = 1;
//#endregion
//#region node_modules/execa/lib/io/pipeline.js
const pipeStreams = (source, destination) => {
	source.pipe(destination);
	onSourceFinish(source, destination);
	onDestinationFinish(source, destination);
};
const onSourceFinish = async (source, destination) => {
	if (isStandardStream(source) || isStandardStream(destination)) return;
	try {
		await finished(source, {
			cleanup: true,
			readable: true,
			writable: false
		});
	} catch {}
	endDestinationStream(destination);
};
const endDestinationStream = (destination) => {
	if (destination.writable) destination.end();
};
const onDestinationFinish = async (source, destination) => {
	if (isStandardStream(source) || isStandardStream(destination)) return;
	try {
		await finished(destination, {
			cleanup: true,
			readable: false,
			writable: true
		});
	} catch {}
	abortSourceStream(source);
};
const abortSourceStream = (source) => {
	if (source.readable) source.destroy();
};
//#endregion
//#region node_modules/execa/lib/io/output-async.js
const pipeOutputAsync = (subprocess, fileDescriptors, controller) => {
	const pipeGroups = /* @__PURE__ */ new Map();
	for (const [fdNumber, { stdioItems, direction }] of Object.entries(fileDescriptors)) {
		for (const { stream } of stdioItems.filter(({ type }) => TRANSFORM_TYPES.has(type))) pipeTransform(subprocess, stream, direction, fdNumber);
		for (const { stream } of stdioItems.filter(({ type }) => !TRANSFORM_TYPES.has(type))) pipeStdioItem({
			subprocess,
			stream,
			direction,
			fdNumber,
			pipeGroups,
			controller
		});
	}
	for (const [outputStream, inputStreams] of pipeGroups.entries()) pipeStreams(inputStreams.length === 1 ? inputStreams[0] : mergeStreams(inputStreams), outputStream);
};
const pipeTransform = (subprocess, stream, direction, fdNumber) => {
	if (direction === "output") pipeStreams(subprocess.stdio[fdNumber], stream);
	else pipeStreams(stream, subprocess.stdio[fdNumber]);
	const streamProperty = SUBPROCESS_STREAM_PROPERTIES[fdNumber];
	if (streamProperty !== void 0) subprocess[streamProperty] = stream;
	subprocess.stdio[fdNumber] = stream;
};
const SUBPROCESS_STREAM_PROPERTIES = [
	"stdin",
	"stdout",
	"stderr"
];
const pipeStdioItem = ({ subprocess, stream, direction, fdNumber, pipeGroups, controller }) => {
	if (stream === void 0) return;
	setStandardStreamMaxListeners(stream, controller);
	const [inputStream, outputStream] = direction === "output" ? [stream, subprocess.stdio[fdNumber]] : [subprocess.stdio[fdNumber], stream];
	const outputStreams = pipeGroups.get(inputStream) ?? [];
	pipeGroups.set(inputStream, [...outputStreams, outputStream]);
};
const setStandardStreamMaxListeners = (stream, { signal }) => {
	if (isStandardStream(stream)) incrementMaxListeners(stream, MAX_LISTENERS_INCREMENT, signal);
};
const MAX_LISTENERS_INCREMENT = 2;
//#endregion
//#region node_modules/signal-exit/dist/mjs/signals.js
/**
* This is not the set of all possible signals.
*
* It IS, however, the set of all signals that trigger
* an exit on either Linux or BSD systems.  Linux is a
* superset of the signal names supported on BSD, and
* the unknown signals just fail to register, so we can
* catch that easily enough.
*
* Windows signals are a different set, since there are
* signals that terminate Windows processes, but don't
* terminate (or don't even exist) on Posix systems.
*
* Don't bother with SIGKILL.  It's uncatchable, which
* means that we can't fire any callbacks anyway.
*
* If a user does happen to register a handler on a non-
* fatal signal like SIGWINCH or something, and then
* exit, it'll end up firing `process.emit('exit')`, so
* the handler will be fired anyway.
*
* SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
* artificially, inherently leave the process in a
* state from which it is not safe to try and enter JS
* listeners.
*/
const signals = [];
signals.push("SIGHUP", "SIGINT", "SIGTERM");
if (process.platform !== "win32") signals.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
if (process.platform === "linux") signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
//#endregion
//#region node_modules/signal-exit/dist/mjs/index.js
const processOk = (process) => !!process && typeof process === "object" && typeof process.removeListener === "function" && typeof process.emit === "function" && typeof process.reallyExit === "function" && typeof process.listeners === "function" && typeof process.kill === "function" && typeof process.pid === "number" && typeof process.on === "function";
const kExitEmitter = Symbol.for("signal-exit emitter");
const global$1 = globalThis;
const ObjectDefineProperty = Object.defineProperty.bind(Object);
var Emitter = class {
	emitted = {
		afterExit: false,
		exit: false
	};
	listeners = {
		afterExit: [],
		exit: []
	};
	count = 0;
	id = Math.random();
	constructor() {
		if (global$1[kExitEmitter]) return global$1[kExitEmitter];
		ObjectDefineProperty(global$1, kExitEmitter, {
			value: this,
			writable: false,
			enumerable: false,
			configurable: false
		});
	}
	on(ev, fn) {
		this.listeners[ev].push(fn);
	}
	removeListener(ev, fn) {
		const list = this.listeners[ev];
		const i = list.indexOf(fn);
		/* c8 ignore start */
		if (i === -1) return;
		/* c8 ignore stop */
		if (i === 0 && list.length === 1) list.length = 0;
		else list.splice(i, 1);
	}
	emit(ev, code, signal) {
		if (this.emitted[ev]) return false;
		this.emitted[ev] = true;
		let ret = false;
		for (const fn of this.listeners[ev]) ret = fn(code, signal) === true || ret;
		if (ev === "exit") ret = this.emit("afterExit", code, signal) || ret;
		return ret;
	}
};
var SignalExitBase = class {};
const signalExitWrap = (handler) => {
	return {
		onExit(cb, opts) {
			return handler.onExit(cb, opts);
		},
		load() {
			return handler.load();
		},
		unload() {
			return handler.unload();
		}
	};
};
var SignalExitFallback = class extends SignalExitBase {
	onExit() {
		return () => {};
	}
	load() {}
	unload() {}
};
var SignalExit = class extends SignalExitBase {
	/* c8 ignore start */
	#hupSig = process$2.platform === "win32" ? "SIGINT" : "SIGHUP";
	/* c8 ignore stop */
	#emitter = new Emitter();
	#process;
	#originalProcessEmit;
	#originalProcessReallyExit;
	#sigListeners = {};
	#loaded = false;
	constructor(process) {
		super();
		this.#process = process;
		this.#sigListeners = {};
		for (const sig of signals) this.#sigListeners[sig] = () => {
			const listeners = this.#process.listeners(sig);
			let { count } = this.#emitter;
			/* c8 ignore start */
			const p = process;
			if (typeof p.__signal_exit_emitter__ === "object" && typeof p.__signal_exit_emitter__.count === "number") count += p.__signal_exit_emitter__.count;
			/* c8 ignore stop */
			if (listeners.length === count) {
				this.unload();
				const ret = this.#emitter.emit("exit", null, sig);
				/* c8 ignore start */
				const s = sig === "SIGHUP" ? this.#hupSig : sig;
				if (!ret) process.kill(process.pid, s);
			}
		};
		this.#originalProcessReallyExit = process.reallyExit;
		this.#originalProcessEmit = process.emit;
	}
	onExit(cb, opts) {
		/* c8 ignore start */
		if (!processOk(this.#process)) return () => {};
		/* c8 ignore stop */
		if (this.#loaded === false) this.load();
		const ev = opts?.alwaysLast ? "afterExit" : "exit";
		this.#emitter.on(ev, cb);
		return () => {
			this.#emitter.removeListener(ev, cb);
			if (this.#emitter.listeners["exit"].length === 0 && this.#emitter.listeners["afterExit"].length === 0) this.unload();
		};
	}
	load() {
		if (this.#loaded) return;
		this.#loaded = true;
		this.#emitter.count += 1;
		for (const sig of signals) try {
			const fn = this.#sigListeners[sig];
			if (fn) this.#process.on(sig, fn);
		} catch (_) {}
		this.#process.emit = (ev, ...a) => {
			return this.#processEmit(ev, ...a);
		};
		this.#process.reallyExit = (code) => {
			return this.#processReallyExit(code);
		};
	}
	unload() {
		if (!this.#loaded) return;
		this.#loaded = false;
		signals.forEach((sig) => {
			const listener = this.#sigListeners[sig];
			/* c8 ignore start */
			if (!listener) throw new Error("Listener not defined for signal: " + sig);
			/* c8 ignore stop */
			try {
				this.#process.removeListener(sig, listener);
			} catch (_) {}
			/* c8 ignore stop */
		});
		this.#process.emit = this.#originalProcessEmit;
		this.#process.reallyExit = this.#originalProcessReallyExit;
		this.#emitter.count -= 1;
	}
	#processReallyExit(code) {
		/* c8 ignore start */
		if (!processOk(this.#process)) return 0;
		this.#process.exitCode = code || 0;
		/* c8 ignore stop */
		this.#emitter.emit("exit", this.#process.exitCode, null);
		return this.#originalProcessReallyExit.call(this.#process, this.#process.exitCode);
	}
	#processEmit(ev, ...args) {
		const og = this.#originalProcessEmit;
		if (ev === "exit" && processOk(this.#process)) {
			if (typeof args[0] === "number") this.#process.exitCode = args[0];
			/* c8 ignore start */
			const ret = og.call(this.#process, ev, ...args);
			/* c8 ignore start */
			this.#emitter.emit("exit", this.#process.exitCode, null);
			/* c8 ignore stop */
			return ret;
		} else return og.call(this.#process, ev, ...args);
	}
};
const process$2 = globalThis.process;
const { onExit, load: load$2, unload } = signalExitWrap(processOk(process$2) ? new SignalExit(process$2) : new SignalExitFallback());
//#endregion
//#region node_modules/execa/lib/terminate/cleanup.js
const cleanupOnExit = (subprocess, { cleanup, detached }, { signal }) => {
	if (!cleanup || detached) return;
	const removeExitHandler = onExit(() => {
		subprocess.kill();
	});
	addAbortListener(signal, () => {
		removeExitHandler();
	});
};
//#endregion
//#region node_modules/execa/lib/pipe/pipe-arguments.js
const normalizePipeArguments = ({ source, sourcePromise, boundOptions, createNested }, ...pipeArguments) => {
	const startTime = getStartTime();
	const { destination, destinationStream, destinationError, from, unpipeSignal } = getDestinationStream(boundOptions, createNested, pipeArguments);
	const { sourceStream, sourceError } = getSourceStream(source, from);
	const { options: sourceOptions, fileDescriptors } = SUBPROCESS_OPTIONS.get(source);
	return {
		sourcePromise,
		sourceStream,
		sourceOptions,
		sourceError,
		destination,
		destinationStream,
		destinationError,
		unpipeSignal,
		fileDescriptors,
		startTime
	};
};
const getDestinationStream = (boundOptions, createNested, pipeArguments) => {
	try {
		const { destination, pipeOptions: { from, to, unpipeSignal } = {} } = getDestination(boundOptions, createNested, ...pipeArguments);
		return {
			destination,
			destinationStream: getToStream(destination, to),
			from,
			unpipeSignal
		};
	} catch (error) {
		return { destinationError: error };
	}
};
const getDestination = (boundOptions, createNested, firstArgument, ...pipeArguments) => {
	if (Array.isArray(firstArgument)) return {
		destination: createNested(mapDestinationArguments, boundOptions)(firstArgument, ...pipeArguments),
		pipeOptions: boundOptions
	};
	if (typeof firstArgument === "string" || firstArgument instanceof URL || isDenoExecPath(firstArgument)) {
		if (Object.keys(boundOptions).length > 0) throw new TypeError("Please use .pipe(\"file\", ..., options) or .pipe(execa(\"file\", ..., options)) instead of .pipe(options)(\"file\", ...).");
		const [rawFile, rawArguments, rawOptions] = normalizeParameters(firstArgument, ...pipeArguments);
		return {
			destination: createNested(mapDestinationArguments)(rawFile, rawArguments, rawOptions),
			pipeOptions: rawOptions
		};
	}
	if (SUBPROCESS_OPTIONS.has(firstArgument)) {
		if (Object.keys(boundOptions).length > 0) throw new TypeError("Please use .pipe(options)`command` or .pipe($(options)`command`) instead of .pipe(options)($`command`).");
		return {
			destination: firstArgument,
			pipeOptions: pipeArguments[0]
		};
	}
	throw new TypeError(`The first argument must be a template string, an options object, or an Execa subprocess: ${firstArgument}`);
};
const mapDestinationArguments = ({ options }) => ({ options: {
	...options,
	stdin: "pipe",
	piped: true
} });
const getSourceStream = (source, from) => {
	try {
		return { sourceStream: getFromStream(source, from) };
	} catch (error) {
		return { sourceError: error };
	}
};
//#endregion
//#region node_modules/execa/lib/pipe/throw.js
const handlePipeArgumentsError = ({ sourceStream, sourceError, destinationStream, destinationError, fileDescriptors, sourceOptions, startTime }) => {
	const error = getPipeArgumentsError({
		sourceStream,
		sourceError,
		destinationStream,
		destinationError
	});
	if (error !== void 0) throw createNonCommandError({
		error,
		fileDescriptors,
		sourceOptions,
		startTime
	});
};
const getPipeArgumentsError = ({ sourceStream, sourceError, destinationStream, destinationError }) => {
	if (sourceError !== void 0 && destinationError !== void 0) return destinationError;
	if (destinationError !== void 0) {
		abortSourceStream(sourceStream);
		return destinationError;
	}
	if (sourceError !== void 0) {
		endDestinationStream(destinationStream);
		return sourceError;
	}
};
const createNonCommandError = ({ error, fileDescriptors, sourceOptions, startTime }) => makeEarlyError({
	error,
	command: PIPE_COMMAND_MESSAGE,
	escapedCommand: PIPE_COMMAND_MESSAGE,
	fileDescriptors,
	options: sourceOptions,
	startTime,
	isSync: false
});
const PIPE_COMMAND_MESSAGE = "source.pipe(destination)";
//#endregion
//#region node_modules/execa/lib/pipe/sequence.js
const waitForBothSubprocesses = async (subprocessPromises) => {
	const [{ status: sourceStatus, reason: sourceReason, value: sourceResult = sourceReason }, { status: destinationStatus, reason: destinationReason, value: destinationResult = destinationReason }] = await subprocessPromises;
	if (!destinationResult.pipedFrom.includes(sourceResult)) destinationResult.pipedFrom.push(sourceResult);
	if (destinationStatus === "rejected") throw destinationResult;
	if (sourceStatus === "rejected") throw sourceResult;
	return destinationResult;
};
//#endregion
//#region node_modules/execa/lib/pipe/streaming.js
const pipeSubprocessStream = (sourceStream, destinationStream, maxListenersController) => {
	const mergedStream = MERGED_STREAMS.has(destinationStream) ? pipeMoreSubprocessStream(sourceStream, destinationStream) : pipeFirstSubprocessStream(sourceStream, destinationStream);
	incrementMaxListeners(sourceStream, SOURCE_LISTENERS_PER_PIPE, maxListenersController.signal);
	incrementMaxListeners(destinationStream, DESTINATION_LISTENERS_PER_PIPE, maxListenersController.signal);
	cleanupMergedStreamsMap(destinationStream);
	return mergedStream;
};
const pipeFirstSubprocessStream = (sourceStream, destinationStream) => {
	const mergedStream = mergeStreams([sourceStream]);
	pipeStreams(mergedStream, destinationStream);
	MERGED_STREAMS.set(destinationStream, mergedStream);
	return mergedStream;
};
const pipeMoreSubprocessStream = (sourceStream, destinationStream) => {
	const mergedStream = MERGED_STREAMS.get(destinationStream);
	mergedStream.add(sourceStream);
	return mergedStream;
};
const cleanupMergedStreamsMap = async (destinationStream) => {
	try {
		await finished(destinationStream, {
			cleanup: true,
			readable: false,
			writable: true
		});
	} catch {}
	MERGED_STREAMS.delete(destinationStream);
};
const MERGED_STREAMS = /* @__PURE__ */ new WeakMap();
const SOURCE_LISTENERS_PER_PIPE = 2;
const DESTINATION_LISTENERS_PER_PIPE = 1;
//#endregion
//#region node_modules/execa/lib/pipe/abort.js
const unpipeOnAbort = (unpipeSignal, unpipeContext) => unpipeSignal === void 0 ? [] : [unpipeOnSignalAbort(unpipeSignal, unpipeContext)];
const unpipeOnSignalAbort = async (unpipeSignal, { sourceStream, mergedStream, fileDescriptors, sourceOptions, startTime }) => {
	await aborted(unpipeSignal, sourceStream);
	await mergedStream.remove(sourceStream);
	throw createNonCommandError({
		error: /* @__PURE__ */ new Error("Pipe canceled by `unpipeSignal` option."),
		fileDescriptors,
		sourceOptions,
		startTime
	});
};
//#endregion
//#region node_modules/execa/lib/pipe/setup.js
const pipeToSubprocess = (sourceInfo, ...pipeArguments) => {
	if (isPlainObject(pipeArguments[0])) return pipeToSubprocess.bind(void 0, {
		...sourceInfo,
		boundOptions: {
			...sourceInfo.boundOptions,
			...pipeArguments[0]
		}
	});
	const { destination, ...normalizedInfo } = normalizePipeArguments(sourceInfo, ...pipeArguments);
	const promise = handlePipePromise({
		...normalizedInfo,
		destination
	});
	promise.pipe = pipeToSubprocess.bind(void 0, {
		...sourceInfo,
		source: destination,
		sourcePromise: promise,
		boundOptions: {}
	});
	return promise;
};
const handlePipePromise = async ({ sourcePromise, sourceStream, sourceOptions, sourceError, destination, destinationStream, destinationError, unpipeSignal, fileDescriptors, startTime }) => {
	const subprocessPromises = getSubprocessPromises(sourcePromise, destination);
	handlePipeArgumentsError({
		sourceStream,
		sourceError,
		destinationStream,
		destinationError,
		fileDescriptors,
		sourceOptions,
		startTime
	});
	const maxListenersController = new AbortController();
	try {
		const mergedStream = pipeSubprocessStream(sourceStream, destinationStream, maxListenersController);
		return await Promise.race([waitForBothSubprocesses(subprocessPromises), ...unpipeOnAbort(unpipeSignal, {
			sourceStream,
			mergedStream,
			sourceOptions,
			fileDescriptors,
			startTime
		})]);
	} finally {
		maxListenersController.abort();
	}
};
const getSubprocessPromises = (sourcePromise, destination) => Promise.allSettled([sourcePromise, destination]);
//#endregion
//#region node_modules/execa/lib/io/iterate.js
const iterateOnSubprocessStream = ({ subprocessStdout, subprocess, binary, shouldEncode, encoding, preserveNewlines }) => {
	const controller = new AbortController();
	stopReadingOnExit(subprocess, controller);
	return iterateOnStream({
		stream: subprocessStdout,
		controller,
		binary,
		shouldEncode: !subprocessStdout.readableObjectMode && shouldEncode,
		encoding,
		shouldSplit: !subprocessStdout.readableObjectMode,
		preserveNewlines
	});
};
const stopReadingOnExit = async (subprocess, controller) => {
	try {
		await subprocess;
	} catch {} finally {
		controller.abort();
	}
};
const iterateForResult = ({ stream, onStreamEnd, lines, encoding, stripFinalNewline, allMixed }) => {
	const controller = new AbortController();
	stopReadingOnStreamEnd(onStreamEnd, controller, stream);
	const objectMode = stream.readableObjectMode && !allMixed;
	return iterateOnStream({
		stream,
		controller,
		binary: encoding === "buffer",
		shouldEncode: !objectMode,
		encoding,
		shouldSplit: !objectMode && lines,
		preserveNewlines: !stripFinalNewline
	});
};
const stopReadingOnStreamEnd = async (onStreamEnd, controller, stream) => {
	try {
		await onStreamEnd;
	} catch {
		stream.destroy();
	} finally {
		controller.abort();
	}
};
const iterateOnStream = ({ stream, controller, binary, shouldEncode, encoding, shouldSplit, preserveNewlines }) => {
	return iterateOnData({
		onStdoutChunk: on(stream, "data", {
			signal: controller.signal,
			highWaterMark: HIGH_WATER_MARK,
			highWatermark: HIGH_WATER_MARK
		}),
		controller,
		binary,
		shouldEncode,
		encoding,
		shouldSplit,
		preserveNewlines
	});
};
const DEFAULT_OBJECT_HIGH_WATER_MARK = getDefaultHighWaterMark(true);
const HIGH_WATER_MARK = DEFAULT_OBJECT_HIGH_WATER_MARK;
const iterateOnData = async function* ({ onStdoutChunk, controller, binary, shouldEncode, encoding, shouldSplit, preserveNewlines }) {
	const generators = getGenerators({
		binary,
		shouldEncode,
		encoding,
		shouldSplit,
		preserveNewlines
	});
	try {
		for await (const [chunk] of onStdoutChunk) yield* transformChunkSync(chunk, generators, 0);
	} catch (error) {
		if (!controller.signal.aborted) throw error;
	} finally {
		yield* finalChunksSync(generators);
	}
};
const getGenerators = ({ binary, shouldEncode, encoding, shouldSplit, preserveNewlines }) => [getEncodingTransformGenerator(binary, encoding, !shouldEncode), getSplitLinesGenerator(binary, preserveNewlines, !shouldSplit, {})].filter(Boolean);
//#endregion
//#region node_modules/execa/lib/io/contents.js
const getStreamOutput = async ({ stream, onStreamEnd, fdNumber, encoding, buffer, maxBuffer, lines, allMixed, stripFinalNewline, verboseInfo, streamInfo }) => {
	const logPromise = logOutputAsync({
		stream,
		onStreamEnd,
		fdNumber,
		encoding,
		allMixed,
		verboseInfo,
		streamInfo
	});
	if (!buffer) {
		await Promise.all([resumeStream(stream), logPromise]);
		return;
	}
	const iterable = iterateForResult({
		stream,
		onStreamEnd,
		lines,
		encoding,
		stripFinalNewline: getStripFinalNewline(stripFinalNewline, fdNumber),
		allMixed
	});
	const [output] = await Promise.all([getStreamContents({
		stream,
		iterable,
		fdNumber,
		encoding,
		maxBuffer,
		lines
	}), logPromise]);
	return output;
};
const logOutputAsync = async ({ stream, onStreamEnd, fdNumber, encoding, allMixed, verboseInfo, streamInfo: { fileDescriptors } }) => {
	if (!shouldLogOutput({
		stdioItems: fileDescriptors[fdNumber]?.stdioItems,
		encoding,
		verboseInfo,
		fdNumber
	})) return;
	await logLines(iterateForResult({
		stream,
		onStreamEnd,
		lines: true,
		encoding,
		stripFinalNewline: true,
		allMixed
	}), stream, fdNumber, verboseInfo);
};
const resumeStream = async (stream) => {
	await setImmediate$1();
	if (stream.readableFlowing === null) stream.resume();
};
const getStreamContents = async ({ stream, stream: { readableObjectMode }, iterable, fdNumber, encoding, maxBuffer, lines }) => {
	try {
		if (readableObjectMode || lines) return await getStreamAsArray(iterable, { maxBuffer });
		if (encoding === "buffer") return new Uint8Array(await getStreamAsArrayBuffer(iterable, { maxBuffer }));
		return await getStreamAsString(iterable, { maxBuffer });
	} catch (error) {
		return handleBufferedData(handleMaxBuffer({
			error,
			stream,
			readableObjectMode,
			lines,
			encoding,
			fdNumber
		}));
	}
};
const getBufferedData = async (streamPromise) => {
	try {
		return await streamPromise;
	} catch (error) {
		return handleBufferedData(error);
	}
};
const handleBufferedData = ({ bufferedData }) => isArrayBuffer(bufferedData) ? new Uint8Array(bufferedData) : bufferedData;
//#endregion
//#region node_modules/execa/lib/resolve/wait-stream.js
const waitForStream = async (stream, fdNumber, streamInfo, { isSameDirection, stopOnExit = false } = {}) => {
	const state = handleStdinDestroy(stream, streamInfo);
	const abortController = new AbortController();
	try {
		await Promise.race([...stopOnExit ? [streamInfo.exitPromise] : [], finished(stream, {
			cleanup: true,
			signal: abortController.signal
		})]);
	} catch (error) {
		if (!state.stdinCleanedUp) handleStreamError(error, fdNumber, streamInfo, isSameDirection);
	} finally {
		abortController.abort();
	}
};
const handleStdinDestroy = (stream, { originalStreams: [originalStdin], subprocess }) => {
	const state = { stdinCleanedUp: false };
	if (stream === originalStdin) spyOnStdinDestroy(stream, subprocess, state);
	return state;
};
const spyOnStdinDestroy = (subprocessStdin, subprocess, state) => {
	const { _destroy } = subprocessStdin;
	subprocessStdin._destroy = (...destroyArguments) => {
		setStdinCleanedUp(subprocess, state);
		_destroy.call(subprocessStdin, ...destroyArguments);
	};
};
const setStdinCleanedUp = ({ exitCode, signalCode }, state) => {
	if (exitCode !== null || signalCode !== null) state.stdinCleanedUp = true;
};
const handleStreamError = (error, fdNumber, streamInfo, isSameDirection) => {
	if (!shouldIgnoreStreamError(error, fdNumber, streamInfo, isSameDirection)) throw error;
};
const shouldIgnoreStreamError = (error, fdNumber, streamInfo, isSameDirection = true) => {
	if (streamInfo.propagating) return isStreamEpipe(error) || isStreamAbort(error);
	streamInfo.propagating = true;
	return isInputFileDescriptor(streamInfo, fdNumber) === isSameDirection ? isStreamEpipe(error) : isStreamAbort(error);
};
const isInputFileDescriptor = ({ fileDescriptors }, fdNumber) => fdNumber !== "all" && fileDescriptors[fdNumber].direction === "input";
const isStreamAbort = (error) => error?.code === "ERR_STREAM_PREMATURE_CLOSE";
const isStreamEpipe = (error) => error?.code === "EPIPE";
//#endregion
//#region node_modules/execa/lib/resolve/stdio.js
const waitForStdioStreams = ({ subprocess, encoding, buffer, maxBuffer, lines, stripFinalNewline, verboseInfo, streamInfo }) => subprocess.stdio.map((stream, fdNumber) => waitForSubprocessStream({
	stream,
	fdNumber,
	encoding,
	buffer: buffer[fdNumber],
	maxBuffer: maxBuffer[fdNumber],
	lines: lines[fdNumber],
	allMixed: false,
	stripFinalNewline,
	verboseInfo,
	streamInfo
}));
const waitForSubprocessStream = async ({ stream, fdNumber, encoding, buffer, maxBuffer, lines, allMixed, stripFinalNewline, verboseInfo, streamInfo }) => {
	if (!stream) return;
	const onStreamEnd = waitForStream(stream, fdNumber, streamInfo);
	if (isInputFileDescriptor(streamInfo, fdNumber)) {
		await onStreamEnd;
		return;
	}
	const [output] = await Promise.all([getStreamOutput({
		stream,
		onStreamEnd,
		fdNumber,
		encoding,
		buffer,
		maxBuffer,
		lines,
		allMixed,
		stripFinalNewline,
		verboseInfo,
		streamInfo
	}), onStreamEnd]);
	return output;
};
//#endregion
//#region node_modules/execa/lib/resolve/all-async.js
const makeAllStream = ({ stdout, stderr }, { all }) => all && (stdout || stderr) ? mergeStreams([stdout, stderr].filter(Boolean)) : void 0;
const waitForAllStream = ({ subprocess, encoding, buffer, maxBuffer, lines, stripFinalNewline, verboseInfo, streamInfo }) => waitForSubprocessStream({
	...getAllStream(subprocess, buffer),
	fdNumber: "all",
	encoding,
	maxBuffer: maxBuffer[1] + maxBuffer[2],
	lines: lines[1] || lines[2],
	allMixed: getAllMixed(subprocess),
	stripFinalNewline,
	verboseInfo,
	streamInfo
});
const getAllStream = ({ stdout, stderr, all }, [, bufferStdout, bufferStderr]) => {
	const buffer = bufferStdout || bufferStderr;
	if (!buffer) return {
		stream: all,
		buffer
	};
	if (!bufferStdout) return {
		stream: stderr,
		buffer
	};
	if (!bufferStderr) return {
		stream: stdout,
		buffer
	};
	return {
		stream: all,
		buffer
	};
};
const getAllMixed = ({ all, stdout, stderr }) => all && stdout && stderr && stdout.readableObjectMode !== stderr.readableObjectMode;
//#endregion
//#region node_modules/execa/lib/verbose/ipc.js
const shouldLogIpc = (verboseInfo) => isFullVerbose(verboseInfo, "ipc");
const logIpcOutput = (message, verboseInfo) => {
	verboseLog({
		type: "ipc",
		verboseMessage: serializeVerboseMessage(message),
		fdNumber: "ipc",
		verboseInfo
	});
};
//#endregion
//#region node_modules/execa/lib/ipc/buffer-messages.js
const waitForIpcOutput = async ({ subprocess, buffer: bufferArray, maxBuffer: maxBufferArray, ipc, ipcOutput, verboseInfo }) => {
	if (!ipc) return ipcOutput;
	const isVerbose = shouldLogIpc(verboseInfo);
	const buffer = getFdSpecificValue(bufferArray, "ipc");
	const maxBuffer = getFdSpecificValue(maxBufferArray, "ipc");
	for await (const message of loopOnMessages({
		anyProcess: subprocess,
		channel: subprocess.channel,
		isSubprocess: false,
		ipc,
		shouldAwait: false,
		reference: true
	})) {
		if (buffer) {
			checkIpcMaxBuffer(subprocess, ipcOutput, maxBuffer);
			ipcOutput.push(message);
		}
		if (isVerbose) logIpcOutput(message, verboseInfo);
	}
	return ipcOutput;
};
const getBufferedIpcOutput = async (ipcOutputPromise, ipcOutput) => {
	await Promise.allSettled([ipcOutputPromise]);
	return ipcOutput;
};
//#endregion
//#region node_modules/execa/lib/resolve/wait-subprocess.js
const waitForSubprocessResult = async ({ subprocess, options: { encoding, buffer, maxBuffer, lines, timeoutDuration: timeout, cancelSignal, gracefulCancel, forceKillAfterDelay, stripFinalNewline, ipc, ipcInput }, context, verboseInfo, fileDescriptors, originalStreams, onInternalError, controller }) => {
	const exitPromise = waitForExit(subprocess, context);
	const streamInfo = {
		originalStreams,
		fileDescriptors,
		subprocess,
		exitPromise,
		propagating: false
	};
	const stdioPromises = waitForStdioStreams({
		subprocess,
		encoding,
		buffer,
		maxBuffer,
		lines,
		stripFinalNewline,
		verboseInfo,
		streamInfo
	});
	const allPromise = waitForAllStream({
		subprocess,
		encoding,
		buffer,
		maxBuffer,
		lines,
		stripFinalNewline,
		verboseInfo,
		streamInfo
	});
	const ipcOutput = [];
	const ipcOutputPromise = waitForIpcOutput({
		subprocess,
		buffer,
		maxBuffer,
		ipc,
		ipcOutput,
		verboseInfo
	});
	const originalPromises = waitForOriginalStreams(originalStreams, subprocess, streamInfo);
	const customStreamsEndPromises = waitForCustomStreamsEnd(fileDescriptors, streamInfo);
	try {
		return await Promise.race([
			Promise.all([
				{},
				waitForSuccessfulExit(exitPromise),
				Promise.all(stdioPromises),
				allPromise,
				ipcOutputPromise,
				sendIpcInput(subprocess, ipcInput),
				...originalPromises,
				...customStreamsEndPromises
			]),
			onInternalError,
			throwOnSubprocessError(subprocess, controller),
			...throwOnTimeout(subprocess, timeout, context, controller),
			...throwOnCancel({
				subprocess,
				cancelSignal,
				gracefulCancel,
				context,
				controller
			}),
			...throwOnGracefulCancel({
				subprocess,
				cancelSignal,
				gracefulCancel,
				forceKillAfterDelay,
				context,
				controller
			})
		]);
	} catch (error) {
		context.terminationReason ??= "other";
		return Promise.all([
			{ error },
			exitPromise,
			Promise.all(stdioPromises.map((stdioPromise) => getBufferedData(stdioPromise))),
			getBufferedData(allPromise),
			getBufferedIpcOutput(ipcOutputPromise, ipcOutput),
			Promise.allSettled(originalPromises),
			Promise.allSettled(customStreamsEndPromises)
		]);
	}
};
const waitForOriginalStreams = (originalStreams, subprocess, streamInfo) => originalStreams.map((stream, fdNumber) => stream === subprocess.stdio[fdNumber] ? void 0 : waitForStream(stream, fdNumber, streamInfo));
const waitForCustomStreamsEnd = (fileDescriptors, streamInfo) => fileDescriptors.flatMap(({ stdioItems }, fdNumber) => stdioItems.filter(({ value, stream = value }) => isStream(stream, { checkOpen: false }) && !isStandardStream(stream)).map(({ type, value, stream = value }) => waitForStream(stream, fdNumber, streamInfo, {
	isSameDirection: TRANSFORM_TYPES.has(type),
	stopOnExit: type === "native"
})));
const throwOnSubprocessError = async (subprocess, { signal }) => {
	const [error] = await once(subprocess, "error", { signal });
	throw error;
};
//#endregion
//#region node_modules/execa/lib/convert/concurrent.js
const initializeConcurrentStreams = () => ({
	readableDestroy: /* @__PURE__ */ new WeakMap(),
	writableFinal: /* @__PURE__ */ new WeakMap(),
	writableDestroy: /* @__PURE__ */ new WeakMap()
});
const addConcurrentStream = (concurrentStreams, stream, waitName) => {
	const weakMap = concurrentStreams[waitName];
	if (!weakMap.has(stream)) weakMap.set(stream, []);
	const promises = weakMap.get(stream);
	const promise = createDeferred();
	promises.push(promise);
	return {
		resolve: promise.resolve.bind(promise),
		promises
	};
};
const waitForConcurrentStreams = async ({ resolve, promises }, subprocess) => {
	resolve();
	const [isSubprocessExit] = await Promise.race([Promise.allSettled([true, subprocess]), Promise.all([false, ...promises])]);
	return !isSubprocessExit;
};
//#endregion
//#region node_modules/execa/lib/convert/shared.js
const safeWaitForSubprocessStdin = async (subprocessStdin) => {
	if (subprocessStdin === void 0) return;
	try {
		await waitForSubprocessStdin(subprocessStdin);
	} catch {}
};
const safeWaitForSubprocessStdout = async (subprocessStdout) => {
	if (subprocessStdout === void 0) return;
	try {
		await waitForSubprocessStdout(subprocessStdout);
	} catch {}
};
const waitForSubprocessStdin = async (subprocessStdin) => {
	await finished(subprocessStdin, {
		cleanup: true,
		readable: false,
		writable: true
	});
};
const waitForSubprocessStdout = async (subprocessStdout) => {
	await finished(subprocessStdout, {
		cleanup: true,
		readable: true,
		writable: false
	});
};
const waitForSubprocess = async (subprocess, error) => {
	await subprocess;
	if (error) throw error;
};
const destroyOtherStream = (stream, isOpen, error) => {
	if (error && !isStreamAbort(error)) stream.destroy(error);
	else if (isOpen) stream.destroy();
};
//#endregion
//#region node_modules/execa/lib/convert/readable.js
const createReadable = ({ subprocess, concurrentStreams, encoding }, { from, binary: binaryOption = true, preserveNewlines = true } = {}) => {
	const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
	const { subprocessStdout, waitReadableDestroy } = getSubprocessStdout(subprocess, from, concurrentStreams);
	const { readableEncoding, readableObjectMode, readableHighWaterMark } = getReadableOptions(subprocessStdout, binary);
	const { read, onStdoutDataDone } = getReadableMethods({
		subprocessStdout,
		subprocess,
		binary,
		encoding,
		preserveNewlines
	});
	const readable = new Readable({
		read,
		destroy: callbackify(onReadableDestroy.bind(void 0, {
			subprocessStdout,
			subprocess,
			waitReadableDestroy
		})),
		highWaterMark: readableHighWaterMark,
		objectMode: readableObjectMode,
		encoding: readableEncoding
	});
	onStdoutFinished({
		subprocessStdout,
		onStdoutDataDone,
		readable,
		subprocess
	});
	return readable;
};
const getSubprocessStdout = (subprocess, from, concurrentStreams) => {
	const subprocessStdout = getFromStream(subprocess, from);
	return {
		subprocessStdout,
		waitReadableDestroy: addConcurrentStream(concurrentStreams, subprocessStdout, "readableDestroy")
	};
};
const getReadableOptions = ({ readableEncoding, readableObjectMode, readableHighWaterMark }, binary) => binary ? {
	readableEncoding,
	readableObjectMode,
	readableHighWaterMark
} : {
	readableEncoding,
	readableObjectMode: true,
	readableHighWaterMark: DEFAULT_OBJECT_HIGH_WATER_MARK
};
const getReadableMethods = ({ subprocessStdout, subprocess, binary, encoding, preserveNewlines }) => {
	const onStdoutDataDone = createDeferred();
	const onStdoutData = iterateOnSubprocessStream({
		subprocessStdout,
		subprocess,
		binary,
		shouldEncode: !binary,
		encoding,
		preserveNewlines
	});
	return {
		read() {
			onRead(this, onStdoutData, onStdoutDataDone);
		},
		onStdoutDataDone
	};
};
const onRead = async (readable, onStdoutData, onStdoutDataDone) => {
	try {
		const { value, done } = await onStdoutData.next();
		if (done) onStdoutDataDone.resolve();
		else readable.push(value);
	} catch {}
};
const onStdoutFinished = async ({ subprocessStdout, onStdoutDataDone, readable, subprocess, subprocessStdin }) => {
	try {
		await waitForSubprocessStdout(subprocessStdout);
		await subprocess;
		await safeWaitForSubprocessStdin(subprocessStdin);
		await onStdoutDataDone;
		if (readable.readable) readable.push(null);
	} catch (error) {
		await safeWaitForSubprocessStdin(subprocessStdin);
		destroyOtherReadable(readable, error);
	}
};
const onReadableDestroy = async ({ subprocessStdout, subprocess, waitReadableDestroy }, error) => {
	if (await waitForConcurrentStreams(waitReadableDestroy, subprocess)) {
		destroyOtherReadable(subprocessStdout, error);
		await waitForSubprocess(subprocess, error);
	}
};
const destroyOtherReadable = (stream, error) => {
	destroyOtherStream(stream, stream.readable, error);
};
//#endregion
//#region node_modules/execa/lib/convert/writable.js
const createWritable = ({ subprocess, concurrentStreams }, { to } = {}) => {
	const { subprocessStdin, waitWritableFinal, waitWritableDestroy } = getSubprocessStdin(subprocess, to, concurrentStreams);
	const writable = new Writable({
		...getWritableMethods(subprocessStdin, subprocess, waitWritableFinal),
		destroy: callbackify(onWritableDestroy.bind(void 0, {
			subprocessStdin,
			subprocess,
			waitWritableFinal,
			waitWritableDestroy
		})),
		highWaterMark: subprocessStdin.writableHighWaterMark,
		objectMode: subprocessStdin.writableObjectMode
	});
	onStdinFinished(subprocessStdin, writable);
	return writable;
};
const getSubprocessStdin = (subprocess, to, concurrentStreams) => {
	const subprocessStdin = getToStream(subprocess, to);
	return {
		subprocessStdin,
		waitWritableFinal: addConcurrentStream(concurrentStreams, subprocessStdin, "writableFinal"),
		waitWritableDestroy: addConcurrentStream(concurrentStreams, subprocessStdin, "writableDestroy")
	};
};
const getWritableMethods = (subprocessStdin, subprocess, waitWritableFinal) => ({
	write: onWrite.bind(void 0, subprocessStdin),
	final: callbackify(onWritableFinal.bind(void 0, subprocessStdin, subprocess, waitWritableFinal))
});
const onWrite = (subprocessStdin, chunk, encoding, done) => {
	if (subprocessStdin.write(chunk, encoding)) done();
	else subprocessStdin.once("drain", done);
};
const onWritableFinal = async (subprocessStdin, subprocess, waitWritableFinal) => {
	if (await waitForConcurrentStreams(waitWritableFinal, subprocess)) {
		if (subprocessStdin.writable) subprocessStdin.end();
		await subprocess;
	}
};
const onStdinFinished = async (subprocessStdin, writable, subprocessStdout) => {
	try {
		await waitForSubprocessStdin(subprocessStdin);
		if (writable.writable) writable.end();
	} catch (error) {
		await safeWaitForSubprocessStdout(subprocessStdout);
		destroyOtherWritable(writable, error);
	}
};
const onWritableDestroy = async ({ subprocessStdin, subprocess, waitWritableFinal, waitWritableDestroy }, error) => {
	await waitForConcurrentStreams(waitWritableFinal, subprocess);
	if (await waitForConcurrentStreams(waitWritableDestroy, subprocess)) {
		destroyOtherWritable(subprocessStdin, error);
		await waitForSubprocess(subprocess, error);
	}
};
const destroyOtherWritable = (stream, error) => {
	destroyOtherStream(stream, stream.writable, error);
};
//#endregion
//#region node_modules/execa/lib/convert/duplex.js
const createDuplex = ({ subprocess, concurrentStreams, encoding }, { from, to, binary: binaryOption = true, preserveNewlines = true } = {}) => {
	const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
	const { subprocessStdout, waitReadableDestroy } = getSubprocessStdout(subprocess, from, concurrentStreams);
	const { subprocessStdin, waitWritableFinal, waitWritableDestroy } = getSubprocessStdin(subprocess, to, concurrentStreams);
	const { readableEncoding, readableObjectMode, readableHighWaterMark } = getReadableOptions(subprocessStdout, binary);
	const { read, onStdoutDataDone } = getReadableMethods({
		subprocessStdout,
		subprocess,
		binary,
		encoding,
		preserveNewlines
	});
	const duplex = new Duplex({
		read,
		...getWritableMethods(subprocessStdin, subprocess, waitWritableFinal),
		destroy: callbackify(onDuplexDestroy.bind(void 0, {
			subprocessStdout,
			subprocessStdin,
			subprocess,
			waitReadableDestroy,
			waitWritableFinal,
			waitWritableDestroy
		})),
		readableHighWaterMark,
		writableHighWaterMark: subprocessStdin.writableHighWaterMark,
		readableObjectMode,
		writableObjectMode: subprocessStdin.writableObjectMode,
		encoding: readableEncoding
	});
	onStdoutFinished({
		subprocessStdout,
		onStdoutDataDone,
		readable: duplex,
		subprocess,
		subprocessStdin
	});
	onStdinFinished(subprocessStdin, duplex, subprocessStdout);
	return duplex;
};
const onDuplexDestroy = async ({ subprocessStdout, subprocessStdin, subprocess, waitReadableDestroy, waitWritableFinal, waitWritableDestroy }, error) => {
	await Promise.all([onReadableDestroy({
		subprocessStdout,
		subprocess,
		waitReadableDestroy
	}, error), onWritableDestroy({
		subprocessStdin,
		subprocess,
		waitWritableFinal,
		waitWritableDestroy
	}, error)]);
};
//#endregion
//#region node_modules/execa/lib/convert/iterable.js
const createIterable = (subprocess, encoding, { from, binary: binaryOption = false, preserveNewlines = false } = {}) => {
	const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
	const subprocessStdout = getFromStream(subprocess, from);
	return iterateOnStdoutData(iterateOnSubprocessStream({
		subprocessStdout,
		subprocess,
		binary,
		shouldEncode: true,
		encoding,
		preserveNewlines
	}), subprocessStdout, subprocess);
};
const iterateOnStdoutData = async function* (onStdoutData, subprocessStdout, subprocess) {
	try {
		yield* onStdoutData;
	} finally {
		if (subprocessStdout.readable) subprocessStdout.destroy();
		await subprocess;
	}
};
//#endregion
//#region node_modules/execa/lib/convert/add.js
const addConvertedStreams = (subprocess, { encoding }) => {
	const concurrentStreams = initializeConcurrentStreams();
	subprocess.readable = createReadable.bind(void 0, {
		subprocess,
		concurrentStreams,
		encoding
	});
	subprocess.writable = createWritable.bind(void 0, {
		subprocess,
		concurrentStreams
	});
	subprocess.duplex = createDuplex.bind(void 0, {
		subprocess,
		concurrentStreams,
		encoding
	});
	subprocess.iterable = createIterable.bind(void 0, subprocess, encoding);
	subprocess[Symbol.asyncIterator] = createIterable.bind(void 0, subprocess, encoding, {});
};
//#endregion
//#region node_modules/execa/lib/methods/promise.js
const mergePromise = (subprocess, promise) => {
	for (const [property, descriptor] of descriptors) {
		const value = descriptor.value.bind(promise);
		Reflect.defineProperty(subprocess, property, {
			...descriptor,
			value
		});
	}
};
const nativePromisePrototype = (async () => {})().constructor.prototype;
const descriptors = [
	"then",
	"catch",
	"finally"
].map((property) => [property, Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)]);
//#endregion
//#region node_modules/execa/lib/methods/main-async.js
const execaCoreAsync = (rawFile, rawArguments, rawOptions, createNested) => {
	const { file, commandArguments, command, escapedCommand, startTime, verboseInfo, options, fileDescriptors } = handleAsyncArguments(rawFile, rawArguments, rawOptions);
	const { subprocess, promise } = spawnSubprocessAsync({
		file,
		commandArguments,
		options,
		startTime,
		verboseInfo,
		command,
		escapedCommand,
		fileDescriptors
	});
	subprocess.pipe = pipeToSubprocess.bind(void 0, {
		source: subprocess,
		sourcePromise: promise,
		boundOptions: {},
		createNested
	});
	mergePromise(subprocess, promise);
	SUBPROCESS_OPTIONS.set(subprocess, {
		options,
		fileDescriptors
	});
	return subprocess;
};
const handleAsyncArguments = (rawFile, rawArguments, rawOptions) => {
	const { command, escapedCommand, startTime, verboseInfo } = handleCommand(rawFile, rawArguments, rawOptions);
	const { file, commandArguments, options: normalizedOptions } = normalizeOptions(rawFile, rawArguments, rawOptions);
	const options = handleAsyncOptions(normalizedOptions);
	return {
		file,
		commandArguments,
		command,
		escapedCommand,
		startTime,
		verboseInfo,
		options,
		fileDescriptors: handleStdioAsync(options, verboseInfo)
	};
};
const handleAsyncOptions = ({ timeout, signal, ...options }) => {
	if (signal !== void 0) throw new TypeError("The \"signal\" option has been renamed to \"cancelSignal\" instead.");
	return {
		...options,
		timeoutDuration: timeout
	};
};
const spawnSubprocessAsync = ({ file, commandArguments, options, startTime, verboseInfo, command, escapedCommand, fileDescriptors }) => {
	let subprocess;
	try {
		subprocess = spawn(...concatenateShell(file, commandArguments, options));
	} catch (error) {
		return handleEarlyError({
			error,
			command,
			escapedCommand,
			fileDescriptors,
			options,
			startTime,
			verboseInfo
		});
	}
	const controller = new AbortController();
	setMaxListeners(Number.POSITIVE_INFINITY, controller.signal);
	const originalStreams = [...subprocess.stdio];
	pipeOutputAsync(subprocess, fileDescriptors, controller);
	cleanupOnExit(subprocess, options, controller);
	const context = {};
	const onInternalError = createDeferred();
	subprocess.kill = subprocessKill.bind(void 0, {
		kill: subprocess.kill.bind(subprocess),
		options,
		onInternalError,
		context,
		controller
	});
	subprocess.all = makeAllStream(subprocess, options);
	addConvertedStreams(subprocess, options);
	addIpcMethods(subprocess, options);
	const promise = handlePromise({
		subprocess,
		options,
		startTime,
		verboseInfo,
		fileDescriptors,
		originalStreams,
		command,
		escapedCommand,
		context,
		onInternalError,
		controller
	});
	return {
		subprocess,
		promise
	};
};
const handlePromise = async ({ subprocess, options, startTime, verboseInfo, fileDescriptors, originalStreams, command, escapedCommand, context, onInternalError, controller }) => {
	const [errorInfo, [exitCode, signal], stdioResults, allResult, ipcOutput] = await waitForSubprocessResult({
		subprocess,
		options,
		context,
		verboseInfo,
		fileDescriptors,
		originalStreams,
		onInternalError,
		controller
	});
	controller.abort();
	onInternalError.resolve();
	return handleResult(getAsyncResult({
		errorInfo,
		exitCode,
		signal,
		stdio: stdioResults.map((stdioResult, fdNumber) => stripNewline(stdioResult, options, fdNumber)),
		all: stripNewline(allResult, options, "all"),
		ipcOutput,
		context,
		options,
		command,
		escapedCommand,
		startTime
	}), verboseInfo, options);
};
const getAsyncResult = ({ errorInfo, exitCode, signal, stdio, all, ipcOutput, context, options, command, escapedCommand, startTime }) => "error" in errorInfo ? makeError({
	error: errorInfo.error,
	command,
	escapedCommand,
	timedOut: context.terminationReason === "timeout",
	isCanceled: context.terminationReason === "cancel" || context.terminationReason === "gracefulCancel",
	isGracefullyCanceled: context.terminationReason === "gracefulCancel",
	isMaxBuffer: errorInfo.error instanceof MaxBufferError,
	isForcefullyTerminated: context.isForcefullyTerminated,
	exitCode,
	signal,
	stdio,
	all,
	ipcOutput,
	options,
	startTime,
	isSync: false
}) : makeSuccessResult({
	command,
	escapedCommand,
	stdio,
	all,
	ipcOutput,
	options,
	startTime
});
//#endregion
//#region node_modules/execa/lib/methods/bind.js
const mergeOptions = (boundOptions, options) => {
	const newOptions = Object.fromEntries(Object.entries(options).map(([optionName, optionValue]) => [optionName, mergeOption(optionName, boundOptions[optionName], optionValue)]));
	return {
		...boundOptions,
		...newOptions
	};
};
const mergeOption = (optionName, boundOptionValue, optionValue) => {
	if (DEEP_OPTIONS.has(optionName) && isPlainObject(boundOptionValue) && isPlainObject(optionValue)) return {
		...boundOptionValue,
		...optionValue
	};
	return optionValue;
};
const DEEP_OPTIONS = new Set(["env", ...FD_SPECIFIC_OPTIONS]);
//#endregion
//#region node_modules/execa/lib/methods/create.js
const createExeca = (mapArguments, boundOptions, deepOptions, setBoundExeca) => {
	const createNested = (mapArguments, boundOptions, setBoundExeca) => createExeca(mapArguments, boundOptions, deepOptions, setBoundExeca);
	const boundExeca = (...execaArguments) => callBoundExeca({
		mapArguments,
		deepOptions,
		boundOptions,
		setBoundExeca,
		createNested
	}, ...execaArguments);
	if (setBoundExeca !== void 0) setBoundExeca(boundExeca, createNested, boundOptions);
	return boundExeca;
};
const callBoundExeca = ({ mapArguments, deepOptions = {}, boundOptions = {}, setBoundExeca, createNested }, firstArgument, ...nextArguments) => {
	if (isPlainObject(firstArgument)) return createNested(mapArguments, mergeOptions(boundOptions, firstArgument), setBoundExeca);
	const { file, commandArguments, options, isSync } = parseArguments({
		mapArguments,
		firstArgument,
		nextArguments,
		deepOptions,
		boundOptions
	});
	return isSync ? execaCoreSync(file, commandArguments, options) : execaCoreAsync(file, commandArguments, options, createNested);
};
const parseArguments = ({ mapArguments, firstArgument, nextArguments, deepOptions, boundOptions }) => {
	const [initialFile, initialArguments, initialOptions] = normalizeParameters(...isTemplateString(firstArgument) ? parseTemplates(firstArgument, nextArguments) : [firstArgument, ...nextArguments]);
	const mergedOptions = mergeOptions(mergeOptions(deepOptions, boundOptions), initialOptions);
	const { file = initialFile, commandArguments = initialArguments, options = mergedOptions, isSync = false } = mapArguments({
		file: initialFile,
		commandArguments: initialArguments,
		options: mergedOptions
	});
	return {
		file,
		commandArguments,
		options,
		isSync
	};
};
//#endregion
//#region node_modules/execa/lib/methods/command.js
const mapCommandAsync = ({ file, commandArguments }) => parseCommand(file, commandArguments);
const mapCommandSync = ({ file, commandArguments }) => ({
	...parseCommand(file, commandArguments),
	isSync: true
});
const parseCommand = (command, unusedArguments) => {
	if (unusedArguments.length > 0) throw new TypeError(`The command and its arguments must be passed as a single string: ${command} ${unusedArguments}.`);
	const [file, ...commandArguments] = parseCommandString(command);
	return {
		file,
		commandArguments
	};
};
const parseCommandString = (command) => {
	if (typeof command !== "string") throw new TypeError(`The command must be a string: ${String(command)}.`);
	const trimmedCommand = command.trim();
	if (trimmedCommand === "") return [];
	const tokens = [];
	for (const token of trimmedCommand.split(SPACES_REGEXP)) {
		const previousToken = tokens.at(-1);
		if (previousToken && previousToken.endsWith("\\")) tokens[tokens.length - 1] = `${previousToken.slice(0, -1)} ${token}`;
		else tokens.push(token);
	}
	return tokens;
};
const SPACES_REGEXP = / +/g;
//#endregion
//#region node_modules/execa/lib/methods/script.js
const setScriptSync = (boundExeca, createNested, boundOptions) => {
	boundExeca.sync = createNested(mapScriptSync, boundOptions);
	boundExeca.s = boundExeca.sync;
};
const mapScriptAsync = ({ options }) => getScriptOptions(options);
const mapScriptSync = ({ options }) => ({
	...getScriptOptions(options),
	isSync: true
});
const getScriptOptions = (options) => ({ options: {
	...getScriptStdinOption(options),
	...options
} });
const getScriptStdinOption = ({ input, inputFile, stdio }) => input === void 0 && inputFile === void 0 && stdio === void 0 ? { stdin: "inherit" } : {};
const deepScriptOptions = { preferLocal: true };
//#endregion
//#region node_modules/execa/index.js
const execa = createExeca(() => ({}));
createExeca(() => ({ isSync: true }));
createExeca(mapCommandAsync);
createExeca(mapCommandSync);
createExeca(mapNode);
createExeca(mapScriptAsync, {}, deepScriptOptions, setScriptSync);
const { sendMessage, getOneMessage, getEachMessage, getCancelSignal } = getIpcExport();
//#endregion
//#region node_modules/ini/lib/ini.js
var require_ini = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { hasOwnProperty } = Object.prototype;
	const encode = (obj, opt = {}) => {
		if (typeof opt === "string") opt = { section: opt };
		opt.align = opt.align === true;
		opt.newline = opt.newline === true;
		opt.sort = opt.sort === true;
		opt.whitespace = opt.whitespace === true || opt.align === true;
		/* istanbul ignore next */
		opt.platform = opt.platform || typeof process !== "undefined" && process.platform;
		opt.bracketedArray = opt.bracketedArray !== false;
		/* istanbul ignore next */
		const eol = opt.platform === "win32" ? "\r\n" : "\n";
		const separator = opt.whitespace ? " = " : "=";
		const children = [];
		const keys = opt.sort ? Object.keys(obj).sort() : Object.keys(obj);
		let padToChars = 0;
		if (opt.align) padToChars = safe(keys.filter((k) => obj[k] === null || Array.isArray(obj[k]) || typeof obj[k] !== "object").map((k) => Array.isArray(obj[k]) ? `${k}[]` : k).concat([""]).reduce((a, b) => safe(a).length >= safe(b).length ? a : b)).length;
		let out = "";
		const arraySuffix = opt.bracketedArray ? "[]" : "";
		for (const k of keys) {
			const val = obj[k];
			if (val && Array.isArray(val)) for (const item of val) out += safe(`${k}${arraySuffix}`).padEnd(padToChars, " ") + separator + safe(item) + eol;
			else if (val && typeof val === "object") children.push(k);
			else out += safe(k).padEnd(padToChars, " ") + separator + safe(val) + eol;
		}
		if (opt.section && out.length) out = "[" + safe(opt.section) + "]" + (opt.newline ? eol + eol : eol) + out;
		for (const k of children) {
			const nk = splitSections(k, ".").join("\\.");
			const section = (opt.section ? opt.section + "." : "") + nk;
			const child = encode(obj[k], {
				...opt,
				section
			});
			if (out.length && child.length) out += eol;
			out += child;
		}
		return out;
	};
	function splitSections(str, separator) {
		var lastMatchIndex = 0;
		var lastSeparatorIndex = 0;
		var nextIndex = 0;
		var sections = [];
		do {
			nextIndex = str.indexOf(separator, lastMatchIndex);
			if (nextIndex !== -1) {
				lastMatchIndex = nextIndex + separator.length;
				if (nextIndex > 0 && str[nextIndex - 1] === "\\") continue;
				sections.push(str.slice(lastSeparatorIndex, nextIndex));
				lastSeparatorIndex = nextIndex + separator.length;
			}
		} while (nextIndex !== -1);
		sections.push(str.slice(lastSeparatorIndex));
		return sections;
	}
	const decode = (str, opt = {}) => {
		opt.bracketedArray = opt.bracketedArray !== false;
		const out = Object.create(null);
		let p = out;
		let section = null;
		const re = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/i;
		const lines = str.split(/[\r\n]+/g);
		const duplicates = {};
		for (const line of lines) {
			if (!line || line.match(/^\s*[;#]/) || line.match(/^\s*$/)) continue;
			const match = line.match(re);
			if (!match) continue;
			if (match[1] !== void 0) {
				section = unsafe(match[1]);
				if (section === "__proto__") {
					p = Object.create(null);
					continue;
				}
				p = out[section] = out[section] || Object.create(null);
				continue;
			}
			const keyRaw = unsafe(match[2]);
			let isArray;
			if (opt.bracketedArray) isArray = keyRaw.length > 2 && keyRaw.slice(-2) === "[]";
			else {
				duplicates[keyRaw] = (duplicates?.[keyRaw] || 0) + 1;
				isArray = duplicates[keyRaw] > 1;
			}
			const key = isArray && keyRaw.endsWith("[]") ? keyRaw.slice(0, -2) : keyRaw;
			if (key === "__proto__") continue;
			const valueRaw = match[3] ? unsafe(match[4]) : true;
			const value = valueRaw === "true" || valueRaw === "false" || valueRaw === "null" ? JSON.parse(valueRaw) : valueRaw;
			if (isArray) {
				if (!hasOwnProperty.call(p, key)) p[key] = [];
				else if (!Array.isArray(p[key])) p[key] = [p[key]];
			}
			if (Array.isArray(p[key])) p[key].push(value);
			else p[key] = value;
		}
		const remove = [];
		for (const k of Object.keys(out)) {
			if (!hasOwnProperty.call(out, k) || typeof out[k] !== "object" || Array.isArray(out[k])) continue;
			const parts = splitSections(k, ".");
			p = out;
			const l = parts.pop();
			const nl = l.replace(/\\\./g, ".");
			for (const part of parts) {
				if (part === "__proto__") continue;
				if (!hasOwnProperty.call(p, part) || typeof p[part] !== "object") p[part] = Object.create(null);
				p = p[part];
			}
			if (p === out && nl === l) continue;
			p[nl] = out[k];
			remove.push(k);
		}
		for (const del of remove) delete out[del];
		return out;
	};
	const isQuoted = (val) => {
		return val.startsWith("\"") && val.endsWith("\"") || val.startsWith("'") && val.endsWith("'");
	};
	const safe = (val) => {
		if (typeof val !== "string" || val.match(/[=\r\n]/) || val.match(/^\[/) || val.length > 1 && isQuoted(val) || val !== val.trim()) return JSON.stringify(val);
		return val.split(";").join("\\;").split("#").join("\\#");
	};
	const unsafe = (val) => {
		val = (val || "").trim();
		if (isQuoted(val)) {
			if (val.charAt(0) === "'") val = val.slice(1, -1);
			try {
				val = JSON.parse(val);
			} catch {}
		} else {
			let esc = false;
			let unesc = "";
			for (let i = 0, l = val.length; i < l; i++) {
				const c = val.charAt(i);
				if (esc) {
					if ("\\;#".indexOf(c) !== -1) unesc += c;
					else unesc += "\\" + c;
					esc = false;
				} else if (";#".indexOf(c) !== -1) break;
				else if (c === "\\") esc = true;
				else unesc += c;
			}
			if (esc) unesc += "\\";
			return unesc.trim();
		}
		return val;
	};
	module.exports = {
		parse: decode,
		decode,
		stringify: encode,
		encode,
		safe,
		unsafe
	};
}));
//#endregion
//#region node_modules/smol-toml/dist/error.js
/*!
* Copyright (c) Squirrel Chat et al., All rights reserved.
* SPDX-License-Identifier: BSD-3-Clause
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
*    list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the
*    documentation and/or other materials provided with the distribution.
* 3. Neither the name of the copyright holder nor the names of its contributors
*    may be used to endorse or promote products derived from this software without
*    specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function getLineColFromPtr(string, ptr) {
	let lines = string.slice(0, ptr).split(/\r\n|\n|\r/g);
	return [lines.length, lines.pop().length + 1];
}
function makeCodeBlock(string, line, column) {
	let lines = string.split(/\r\n|\n|\r/g);
	let codeblock = "";
	let numberLen = (Math.log10(line + 1) | 0) + 1;
	for (let i = line - 1; i <= line + 1; i++) {
		let l = lines[i - 1];
		if (!l) continue;
		codeblock += i.toString().padEnd(numberLen, " ");
		codeblock += ":  ";
		codeblock += l;
		codeblock += "\n";
		if (i === line) {
			codeblock += " ".repeat(numberLen + column + 2);
			codeblock += "^\n";
		}
	}
	return codeblock;
}
var TomlError = class extends Error {
	line;
	column;
	codeblock;
	constructor(message, options) {
		const [line, column] = getLineColFromPtr(options.toml, options.ptr);
		const codeblock = makeCodeBlock(options.toml, line, column);
		super(`Invalid TOML document: ${message}\n\n${codeblock}`, options);
		this.line = line;
		this.column = column;
		this.codeblock = codeblock;
	}
};
//#endregion
//#region node_modules/smol-toml/dist/util.js
/*!
* Copyright (c) Squirrel Chat et al., All rights reserved.
* SPDX-License-Identifier: BSD-3-Clause
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
*    list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the
*    documentation and/or other materials provided with the distribution.
* 3. Neither the name of the copyright holder nor the names of its contributors
*    may be used to endorse or promote products derived from this software without
*    specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function isEscaped(str, ptr) {
	let i = 0;
	while (str[ptr - ++i] === "\\");
	return --i && i % 2;
}
function indexOfNewline(str, start = 0, end = str.length) {
	let idx = str.indexOf("\n", start);
	if (str[idx - 1] === "\r") idx--;
	return idx <= end ? idx : -1;
}
function skipComment(str, ptr) {
	for (let i = ptr; i < str.length; i++) {
		let c = str[i];
		if (c === "\n") return i;
		if (c === "\r" && str[i + 1] === "\n") return i + 1;
		if (c < " " && c !== "	" || c === "") throw new TomlError("control characters are not allowed in comments", {
			toml: str,
			ptr
		});
	}
	return str.length;
}
function skipVoid(str, ptr, banNewLines, banComments) {
	let c;
	while (1) {
		while ((c = str[ptr]) === " " || c === "	" || !banNewLines && (c === "\n" || c === "\r" && str[ptr + 1] === "\n")) ptr++;
		if (banComments || c !== "#") break;
		ptr = skipComment(str, ptr);
	}
	return ptr;
}
function skipUntil(str, ptr, sep, end, banNewLines = false) {
	if (!end) {
		ptr = indexOfNewline(str, ptr);
		return ptr < 0 ? str.length : ptr;
	}
	for (let i = ptr; i < str.length; i++) {
		let c = str[i];
		if (c === "#") i = indexOfNewline(str, i);
		else if (c === sep) return i + 1;
		else if (c === end || banNewLines && (c === "\n" || c === "\r" && str[i + 1] === "\n")) return i;
	}
	throw new TomlError("cannot find end of structure", {
		toml: str,
		ptr
	});
}
function getStringEnd(str, seek) {
	let first = str[seek];
	let target = first === str[seek + 1] && str[seek + 1] === str[seek + 2] ? str.slice(seek, seek + 3) : first;
	seek += target.length - 1;
	do
		seek = str.indexOf(target, ++seek);
	while (seek > -1 && first !== "'" && isEscaped(str, seek));
	if (seek > -1) {
		seek += target.length;
		if (target.length > 1) {
			if (str[seek] === first) seek++;
			if (str[seek] === first) seek++;
		}
	}
	return seek;
}
//#endregion
//#region node_modules/smol-toml/dist/date.js
/*!
* Copyright (c) Squirrel Chat et al., All rights reserved.
* SPDX-License-Identifier: BSD-3-Clause
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
*    list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the
*    documentation and/or other materials provided with the distribution.
* 3. Neither the name of the copyright holder nor the names of its contributors
*    may be used to endorse or promote products derived from this software without
*    specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
let DATE_TIME_RE = /^(\d{4}-\d{2}-\d{2})?[T ]?(?:(\d{2}):\d{2}(?::\d{2}(?:\.\d+)?)?)?(Z|[-+]\d{2}:\d{2})?$/i;
var TomlDate = class TomlDate extends Date {
	#hasDate = false;
	#hasTime = false;
	#offset = null;
	constructor(date) {
		let hasDate = true;
		let hasTime = true;
		let offset = "Z";
		if (typeof date === "string") {
			let match = date.match(DATE_TIME_RE);
			if (match) {
				if (!match[1]) {
					hasDate = false;
					date = `0000-01-01T${date}`;
				}
				hasTime = !!match[2];
				hasTime && date[10] === " " && (date = date.replace(" ", "T"));
				if (match[2] && +match[2] > 23) date = "";
				else {
					offset = match[3] || null;
					date = date.toUpperCase();
					if (!offset && hasTime) date += "Z";
				}
			} else date = "";
		}
		super(date);
		if (!isNaN(this.getTime())) {
			this.#hasDate = hasDate;
			this.#hasTime = hasTime;
			this.#offset = offset;
		}
	}
	isDateTime() {
		return this.#hasDate && this.#hasTime;
	}
	isLocal() {
		return !this.#hasDate || !this.#hasTime || !this.#offset;
	}
	isDate() {
		return this.#hasDate && !this.#hasTime;
	}
	isTime() {
		return this.#hasTime && !this.#hasDate;
	}
	isValid() {
		return this.#hasDate || this.#hasTime;
	}
	toISOString() {
		let iso = super.toISOString();
		if (this.isDate()) return iso.slice(0, 10);
		if (this.isTime()) return iso.slice(11, 23);
		if (this.#offset === null) return iso.slice(0, -1);
		if (this.#offset === "Z") return iso;
		let offset = +this.#offset.slice(1, 3) * 60 + +this.#offset.slice(4, 6);
		offset = this.#offset[0] === "-" ? offset : -offset;
		return (/* @__PURE__ */ new Date(this.getTime() - offset * 6e4)).toISOString().slice(0, -1) + this.#offset;
	}
	static wrapAsOffsetDateTime(jsDate, offset = "Z") {
		let date = new TomlDate(jsDate);
		date.#offset = offset;
		return date;
	}
	static wrapAsLocalDateTime(jsDate) {
		let date = new TomlDate(jsDate);
		date.#offset = null;
		return date;
	}
	static wrapAsLocalDate(jsDate) {
		let date = new TomlDate(jsDate);
		date.#hasTime = false;
		date.#offset = null;
		return date;
	}
	static wrapAsLocalTime(jsDate) {
		let date = new TomlDate(jsDate);
		date.#hasDate = false;
		date.#offset = null;
		return date;
	}
};
//#endregion
//#region node_modules/smol-toml/dist/primitive.js
/*!
* Copyright (c) Squirrel Chat et al., All rights reserved.
* SPDX-License-Identifier: BSD-3-Clause
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
*    list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the
*    documentation and/or other materials provided with the distribution.
* 3. Neither the name of the copyright holder nor the names of its contributors
*    may be used to endorse or promote products derived from this software without
*    specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
let INT_REGEX = /^((0x[0-9a-fA-F](_?[0-9a-fA-F])*)|(([+-]|0[ob])?\d(_?\d)*))$/;
let FLOAT_REGEX = /^[+-]?\d(_?\d)*(\.\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?$/;
let LEADING_ZERO = /^[+-]?0[0-9_]/;
let ESCAPE_REGEX = /^[0-9a-f]{2,8}$/i;
let ESC_MAP = {
	b: "\b",
	t: "	",
	n: "\n",
	f: "\f",
	r: "\r",
	e: "\x1B",
	"\"": "\"",
	"\\": "\\"
};
function parseString(str, ptr = 0, endPtr = str.length) {
	let isLiteral = str[ptr] === "'";
	let isMultiline = str[ptr++] === str[ptr] && str[ptr] === str[ptr + 1];
	if (isMultiline) {
		endPtr -= 2;
		if (str[ptr += 2] === "\r") ptr++;
		if (str[ptr] === "\n") ptr++;
	}
	let tmp = 0;
	let isEscape;
	let parsed = "";
	let sliceStart = ptr;
	while (ptr < endPtr - 1) {
		let c = str[ptr++];
		if (c === "\n" || c === "\r" && str[ptr] === "\n") {
			if (!isMultiline) throw new TomlError("newlines are not allowed in strings", {
				toml: str,
				ptr: ptr - 1
			});
		} else if (c < " " && c !== "	" || c === "") throw new TomlError("control characters are not allowed in strings", {
			toml: str,
			ptr: ptr - 1
		});
		if (isEscape) {
			isEscape = false;
			if (c === "x" || c === "u" || c === "U") {
				let code = str.slice(ptr, ptr += c === "x" ? 2 : c === "u" ? 4 : 8);
				if (!ESCAPE_REGEX.test(code)) throw new TomlError("invalid unicode escape", {
					toml: str,
					ptr: tmp
				});
				try {
					parsed += String.fromCodePoint(parseInt(code, 16));
				} catch {
					throw new TomlError("invalid unicode escape", {
						toml: str,
						ptr: tmp
					});
				}
			} else if (isMultiline && (c === "\n" || c === " " || c === "	" || c === "\r")) {
				ptr = skipVoid(str, ptr - 1, true);
				if (str[ptr] !== "\n" && str[ptr] !== "\r") throw new TomlError("invalid escape: only line-ending whitespace may be escaped", {
					toml: str,
					ptr: tmp
				});
				ptr = skipVoid(str, ptr);
			} else if (c in ESC_MAP) parsed += ESC_MAP[c];
			else throw new TomlError("unrecognized escape sequence", {
				toml: str,
				ptr: tmp
			});
			sliceStart = ptr;
		} else if (!isLiteral && c === "\\") {
			tmp = ptr - 1;
			isEscape = true;
			parsed += str.slice(sliceStart, tmp);
		}
	}
	return parsed + str.slice(sliceStart, endPtr - 1);
}
function parseValue(value, toml, ptr, integersAsBigInt) {
	if (value === "true") return true;
	if (value === "false") return false;
	if (value === "-inf") return -Infinity;
	if (value === "inf" || value === "+inf") return Infinity;
	if (value === "nan" || value === "+nan" || value === "-nan") return NaN;
	if (value === "-0") return integersAsBigInt ? 0n : 0;
	let isInt = INT_REGEX.test(value);
	if (isInt || FLOAT_REGEX.test(value)) {
		if (LEADING_ZERO.test(value)) throw new TomlError("leading zeroes are not allowed", {
			toml,
			ptr
		});
		value = value.replace(/_/g, "");
		let numeric = +value;
		if (isNaN(numeric)) throw new TomlError("invalid number", {
			toml,
			ptr
		});
		if (isInt) {
			if ((isInt = !Number.isSafeInteger(numeric)) && !integersAsBigInt) throw new TomlError("integer value cannot be represented losslessly", {
				toml,
				ptr
			});
			if (isInt || integersAsBigInt === true) numeric = BigInt(value);
		}
		return numeric;
	}
	const date = new TomlDate(value);
	if (!date.isValid()) throw new TomlError("invalid value", {
		toml,
		ptr
	});
	return date;
}
//#endregion
//#region node_modules/smol-toml/dist/extract.js
/*!
* Copyright (c) Squirrel Chat et al., All rights reserved.
* SPDX-License-Identifier: BSD-3-Clause
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
*    list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the
*    documentation and/or other materials provided with the distribution.
* 3. Neither the name of the copyright holder nor the names of its contributors
*    may be used to endorse or promote products derived from this software without
*    specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function sliceAndTrimEndOf(str, startPtr, endPtr) {
	let value = str.slice(startPtr, endPtr);
	let commentIdx = value.indexOf("#");
	if (commentIdx > -1) {
		skipComment(str, commentIdx);
		value = value.slice(0, commentIdx);
	}
	return [value.trimEnd(), commentIdx];
}
function extractValue(str, ptr, end, depth, integersAsBigInt) {
	if (depth === 0) throw new TomlError("document contains excessively nested structures. aborting.", {
		toml: str,
		ptr
	});
	let c = str[ptr];
	if (c === "[" || c === "{") {
		let [value, endPtr] = c === "[" ? parseArray(str, ptr, depth, integersAsBigInt) : parseInlineTable(str, ptr, depth, integersAsBigInt);
		if (end) {
			endPtr = skipVoid(str, endPtr);
			if (str[endPtr] === ",") endPtr++;
			else if (str[endPtr] !== end) throw new TomlError("expected comma or end of structure", {
				toml: str,
				ptr: endPtr
			});
		}
		return [value, endPtr];
	}
	let endPtr;
	if (c === "\"" || c === "'") {
		endPtr = getStringEnd(str, ptr);
		let parsed = parseString(str, ptr, endPtr);
		if (end) {
			endPtr = skipVoid(str, endPtr);
			if (str[endPtr] && str[endPtr] !== "," && str[endPtr] !== end && str[endPtr] !== "\n" && str[endPtr] !== "\r") throw new TomlError("unexpected character encountered", {
				toml: str,
				ptr: endPtr
			});
			endPtr += +(str[endPtr] === ",");
		}
		return [parsed, endPtr];
	}
	endPtr = skipUntil(str, ptr, ",", end);
	let slice = sliceAndTrimEndOf(str, ptr, endPtr - +(str[endPtr - 1] === ","));
	if (!slice[0]) throw new TomlError("incomplete key-value declaration: no value specified", {
		toml: str,
		ptr
	});
	if (end && slice[1] > -1) {
		endPtr = skipVoid(str, ptr + slice[1]);
		endPtr += +(str[endPtr] === ",");
	}
	return [parseValue(slice[0], str, ptr, integersAsBigInt), endPtr];
}
//#endregion
//#region node_modules/smol-toml/dist/struct.js
/*!
* Copyright (c) Squirrel Chat et al., All rights reserved.
* SPDX-License-Identifier: BSD-3-Clause
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
*    list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the
*    documentation and/or other materials provided with the distribution.
* 3. Neither the name of the copyright holder nor the names of its contributors
*    may be used to endorse or promote products derived from this software without
*    specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
let KEY_PART_RE = /^[a-zA-Z0-9-_]+[ \t]*$/;
function parseKey(str, ptr, end = "=") {
	let dot = ptr - 1;
	let parsed = [];
	let endPtr = str.indexOf(end, ptr);
	if (endPtr < 0) throw new TomlError("incomplete key-value: cannot find end of key", {
		toml: str,
		ptr
	});
	do {
		let c = str[ptr = ++dot];
		if (c !== " " && c !== "	") if (c === "\"" || c === "'") {
			if (c === str[ptr + 1] && c === str[ptr + 2]) throw new TomlError("multiline strings are not allowed in keys", {
				toml: str,
				ptr
			});
			let eos = getStringEnd(str, ptr);
			if (eos < 0) throw new TomlError("unfinished string encountered", {
				toml: str,
				ptr
			});
			dot = str.indexOf(".", eos);
			let strEnd = str.slice(eos, dot < 0 || dot > endPtr ? endPtr : dot);
			let newLine = indexOfNewline(strEnd);
			if (newLine > -1) throw new TomlError("newlines are not allowed in keys", {
				toml: str,
				ptr: ptr + dot + newLine
			});
			if (strEnd.trimStart()) throw new TomlError("found extra tokens after the string part", {
				toml: str,
				ptr: eos
			});
			if (endPtr < eos) {
				endPtr = str.indexOf(end, eos);
				if (endPtr < 0) throw new TomlError("incomplete key-value: cannot find end of key", {
					toml: str,
					ptr
				});
			}
			parsed.push(parseString(str, ptr, eos));
		} else {
			dot = str.indexOf(".", ptr);
			let part = str.slice(ptr, dot < 0 || dot > endPtr ? endPtr : dot);
			if (!KEY_PART_RE.test(part)) throw new TomlError("only letter, numbers, dashes and underscores are allowed in keys", {
				toml: str,
				ptr
			});
			parsed.push(part.trimEnd());
		}
	} while (dot + 1 && dot < endPtr);
	return [parsed, skipVoid(str, endPtr + 1, true, true)];
}
function parseInlineTable(str, ptr, depth, integersAsBigInt) {
	let res = {};
	let seen = /* @__PURE__ */ new Set();
	let c;
	ptr++;
	while ((c = str[ptr++]) !== "}" && c) if (c === ",") throw new TomlError("expected value, found comma", {
		toml: str,
		ptr: ptr - 1
	});
	else if (c === "#") ptr = skipComment(str, ptr);
	else if (c !== " " && c !== "	" && c !== "\n" && c !== "\r") {
		let k;
		let t = res;
		let hasOwn = false;
		let [key, keyEndPtr] = parseKey(str, ptr - 1);
		for (let i = 0; i < key.length; i++) {
			if (i) t = hasOwn ? t[k] : t[k] = {};
			k = key[i];
			if ((hasOwn = Object.hasOwn(t, k)) && (typeof t[k] !== "object" || seen.has(t[k]))) throw new TomlError("trying to redefine an already defined value", {
				toml: str,
				ptr
			});
			if (!hasOwn && k === "__proto__") Object.defineProperty(t, k, {
				enumerable: true,
				configurable: true,
				writable: true
			});
		}
		if (hasOwn) throw new TomlError("trying to redefine an already defined value", {
			toml: str,
			ptr
		});
		let [value, valueEndPtr] = extractValue(str, keyEndPtr, "}", depth - 1, integersAsBigInt);
		seen.add(value);
		t[k] = value;
		ptr = valueEndPtr;
	}
	if (!c) throw new TomlError("unfinished table encountered", {
		toml: str,
		ptr
	});
	return [res, ptr];
}
function parseArray(str, ptr, depth, integersAsBigInt) {
	let res = [];
	let c;
	ptr++;
	while ((c = str[ptr++]) !== "]" && c) if (c === ",") throw new TomlError("expected value, found comma", {
		toml: str,
		ptr: ptr - 1
	});
	else if (c === "#") ptr = skipComment(str, ptr);
	else if (c !== " " && c !== "	" && c !== "\n" && c !== "\r") {
		let e = extractValue(str, ptr - 1, "]", depth - 1, integersAsBigInt);
		res.push(e[0]);
		ptr = e[1];
	}
	if (!c) throw new TomlError("unfinished array encountered", {
		toml: str,
		ptr
	});
	return [res, ptr];
}
//#endregion
//#region node_modules/smol-toml/dist/parse.js
/*!
* Copyright (c) Squirrel Chat et al., All rights reserved.
* SPDX-License-Identifier: BSD-3-Clause
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
*    list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the
*    documentation and/or other materials provided with the distribution.
* 3. Neither the name of the copyright holder nor the names of its contributors
*    may be used to endorse or promote products derived from this software without
*    specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function peekTable(key, table, meta, type) {
	let t = table;
	let m = meta;
	let k;
	let hasOwn = false;
	let state;
	for (let i = 0; i < key.length; i++) {
		if (i) {
			t = hasOwn ? t[k] : t[k] = {};
			m = (state = m[k]).c;
			if (type === 0 && (state.t === 1 || state.t === 2)) return null;
			if (state.t === 2) {
				let l = t.length - 1;
				t = t[l];
				m = m[l].c;
			}
		}
		k = key[i];
		if ((hasOwn = Object.hasOwn(t, k)) && m[k]?.t === 0 && m[k]?.d) return null;
		if (!hasOwn) {
			if (k === "__proto__") {
				Object.defineProperty(t, k, {
					enumerable: true,
					configurable: true,
					writable: true
				});
				Object.defineProperty(m, k, {
					enumerable: true,
					configurable: true,
					writable: true
				});
			}
			m[k] = {
				t: i < key.length - 1 && type === 2 ? 3 : type,
				d: false,
				i: 0,
				c: {}
			};
		}
	}
	state = m[k];
	if (state.t !== type && !(type === 1 && state.t === 3)) return null;
	if (type === 2) {
		if (!state.d) {
			state.d = true;
			t[k] = [];
		}
		t[k].push(t = {});
		state.c[state.i++] = state = {
			t: 1,
			d: false,
			i: 0,
			c: {}
		};
	}
	if (state.d) return null;
	state.d = true;
	if (type === 1) t = hasOwn ? t[k] : t[k] = {};
	else if (type === 0 && hasOwn) return null;
	return [
		k,
		t,
		state.c
	];
}
function parse$1(toml, { maxDepth = 1e3, integersAsBigInt } = {}) {
	let res = {};
	let meta = {};
	let tbl = res;
	let m = meta;
	for (let ptr = skipVoid(toml, 0); ptr < toml.length;) {
		if (toml[ptr] === "[") {
			let isTableArray = toml[++ptr] === "[";
			let k = parseKey(toml, ptr += +isTableArray, "]");
			if (isTableArray) {
				if (toml[k[1] - 1] !== "]") throw new TomlError("expected end of table declaration", {
					toml,
					ptr: k[1] - 1
				});
				k[1]++;
			}
			let p = peekTable(k[0], res, meta, isTableArray ? 2 : 1);
			if (!p) throw new TomlError("trying to redefine an already defined table or value", {
				toml,
				ptr
			});
			m = p[2];
			tbl = p[1];
			ptr = k[1];
		} else {
			let k = parseKey(toml, ptr);
			let p = peekTable(k[0], tbl, m, 0);
			if (!p) throw new TomlError("trying to redefine an already defined table or value", {
				toml,
				ptr
			});
			let v = extractValue(toml, k[1], void 0, maxDepth, integersAsBigInt);
			p[1][p[0]] = v[0];
			ptr = v[1];
		}
		ptr = skipVoid(toml, ptr, true);
		if (toml[ptr] && toml[ptr] !== "\n" && toml[ptr] !== "\r") throw new TomlError("each key-value declaration must be followed by an end-of-line", {
			toml,
			ptr
		});
		ptr = skipVoid(toml, ptr);
	}
	return res;
}
//#endregion
//#region node_modules/cli-progress/lib/eta.js
var require_eta = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ETA = class {
		constructor(length, initTime, initValue) {
			this.etaBufferLength = length || 100;
			this.valueBuffer = [initValue];
			this.timeBuffer = [initTime];
			this.eta = "0";
		}
		update(time, value, total) {
			this.valueBuffer.push(value);
			this.timeBuffer.push(time);
			this.calculate(total - value);
		}
		getTime() {
			return this.eta;
		}
		calculate(remaining) {
			const currentBufferSize = this.valueBuffer.length;
			const buffer = Math.min(this.etaBufferLength, currentBufferSize);
			const vt_rate = (this.valueBuffer[currentBufferSize - 1] - this.valueBuffer[currentBufferSize - buffer]) / (this.timeBuffer[currentBufferSize - 1] - this.timeBuffer[currentBufferSize - buffer]);
			this.valueBuffer = this.valueBuffer.slice(-this.etaBufferLength);
			this.timeBuffer = this.timeBuffer.slice(-this.etaBufferLength);
			const eta = Math.ceil(remaining / vt_rate / 1e3);
			if (isNaN(eta)) this.eta = "NULL";
			else if (!isFinite(eta)) this.eta = "INF";
			else if (eta > 1e7) this.eta = "INF";
			else if (eta < 0) this.eta = 0;
			else this.eta = eta;
		}
	};
	module.exports = ETA;
}));
//#endregion
//#region node_modules/cli-progress/lib/terminal.js
var require_terminal = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const _readline = __require("readline");
	var Terminal = class {
		constructor(outputStream) {
			this.stream = outputStream;
			this.linewrap = true;
			this.dy = 0;
		}
		cursorSave() {
			if (!this.stream.isTTY) return;
			this.stream.write("\x1B7");
		}
		cursorRestore() {
			if (!this.stream.isTTY) return;
			this.stream.write("\x1B8");
		}
		cursor(enabled) {
			if (!this.stream.isTTY) return;
			if (enabled) this.stream.write("\x1B[?25h");
			else this.stream.write("\x1B[?25l");
		}
		cursorTo(x = null, y = null) {
			if (!this.stream.isTTY) return;
			_readline.cursorTo(this.stream, x, y);
		}
		cursorRelative(dx = null, dy = null) {
			if (!this.stream.isTTY) return;
			this.dy = this.dy + dy;
			_readline.moveCursor(this.stream, dx, dy);
		}
		cursorRelativeReset() {
			if (!this.stream.isTTY) return;
			_readline.moveCursor(this.stream, 0, -this.dy);
			_readline.cursorTo(this.stream, 0, null);
			this.dy = 0;
		}
		clearRight() {
			if (!this.stream.isTTY) return;
			_readline.clearLine(this.stream, 1);
		}
		clearLine() {
			if (!this.stream.isTTY) return;
			_readline.clearLine(this.stream, 0);
		}
		clearBottom() {
			if (!this.stream.isTTY) return;
			_readline.clearScreenDown(this.stream);
		}
		newline() {
			this.stream.write("\n");
			this.dy++;
		}
		write(s, rawWrite = false) {
			if (this.linewrap === true && rawWrite === false) this.stream.write(s.substr(0, this.getWidth()));
			else this.stream.write(s);
		}
		lineWrapping(enabled) {
			if (!this.stream.isTTY) return;
			this.linewrap = enabled;
			if (enabled) this.stream.write("\x1B[?7h");
			else this.stream.write("\x1B[?7l");
		}
		isTTY() {
			return this.stream.isTTY === true;
		}
		getWidth() {
			return this.stream.columns || (this.stream.isTTY ? 80 : 200);
		}
	};
	module.exports = Terminal;
}));
//#endregion
//#region node_modules/ansi-regex/index.js
var require_ansi_regex = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = ({ onlyFirst = false } = {}) => {
		const pattern = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|");
		return new RegExp(pattern, onlyFirst ? void 0 : "g");
	};
}));
//#endregion
//#region node_modules/strip-ansi/index.js
var require_strip_ansi = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const ansiRegex = require_ansi_regex();
	module.exports = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
}));
//#endregion
//#region node_modules/is-fullwidth-code-point/index.js
var require_is_fullwidth_code_point = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const isFullwidthCodePoint = (codePoint) => {
		if (Number.isNaN(codePoint)) return false;
		if (codePoint >= 4352 && (codePoint <= 4447 || codePoint === 9001 || codePoint === 9002 || 11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || 12880 <= codePoint && codePoint <= 19903 || 19968 <= codePoint && codePoint <= 42182 || 43360 <= codePoint && codePoint <= 43388 || 44032 <= codePoint && codePoint <= 55203 || 63744 <= codePoint && codePoint <= 64255 || 65040 <= codePoint && codePoint <= 65049 || 65072 <= codePoint && codePoint <= 65131 || 65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || 110592 <= codePoint && codePoint <= 110593 || 127488 <= codePoint && codePoint <= 127569 || 131072 <= codePoint && codePoint <= 262141)) return true;
		return false;
	};
	module.exports = isFullwidthCodePoint;
	module.exports.default = isFullwidthCodePoint;
}));
//#endregion
//#region node_modules/emoji-regex/index.js
var require_emoji_regex = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function() {
		return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
	};
}));
//#endregion
//#region node_modules/string-width/index.js
var require_string_width = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const stripAnsi = require_strip_ansi();
	const isFullwidthCodePoint = require_is_fullwidth_code_point();
	const emojiRegex = require_emoji_regex();
	const stringWidth = (string) => {
		if (typeof string !== "string" || string.length === 0) return 0;
		string = stripAnsi(string);
		if (string.length === 0) return 0;
		string = string.replace(emojiRegex(), "  ");
		let width = 0;
		for (let i = 0; i < string.length; i++) {
			const code = string.codePointAt(i);
			if (code <= 31 || code >= 127 && code <= 159) continue;
			if (code >= 768 && code <= 879) continue;
			if (code > 65535) i++;
			width += isFullwidthCodePoint(code) ? 2 : 1;
		}
		return width;
	};
	module.exports = stringWidth;
	module.exports.default = stringWidth;
}));
//#endregion
//#region node_modules/cli-progress/lib/format-value.js
var require_format_value = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function formatValue(v, options, type) {
		if (options.autopadding !== true) return v;
		function autopadding(value, length) {
			return (options.autopaddingChar + value).slice(-length);
		}
		switch (type) {
			case "percentage": return autopadding(v, 3);
			default: return v;
		}
	};
}));
//#endregion
//#region node_modules/cli-progress/lib/format-bar.js
var require_format_bar = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function formatBar(progress, options) {
		const completeSize = Math.round(progress * options.barsize);
		const incompleteSize = options.barsize - completeSize;
		return options.barCompleteString.substr(0, completeSize) + options.barGlue + options.barIncompleteString.substr(0, incompleteSize);
	};
}));
//#endregion
//#region node_modules/cli-progress/lib/format-time.js
var require_format_time = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function formatTime(t, options, roundToMultipleOf) {
		function round(input) {
			if (roundToMultipleOf) return roundToMultipleOf * Math.round(input / roundToMultipleOf);
			else return input;
		}
		function autopadding(v) {
			return (options.autopaddingChar + v).slice(-2);
		}
		if (t > 3600) return autopadding(Math.floor(t / 3600)) + "h" + autopadding(round(t % 3600 / 60)) + "m";
		else if (t > 60) return autopadding(Math.floor(t / 60)) + "m" + autopadding(round(t % 60)) + "s";
		else if (t > 10) return autopadding(round(t)) + "s";
		else return autopadding(t) + "s";
	};
}));
//#endregion
//#region node_modules/cli-progress/lib/formatter.js
var require_formatter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const _stringWidth = require_string_width();
	const _defaultFormatValue = require_format_value();
	const _defaultFormatBar = require_format_bar();
	const _defaultFormatTime = require_format_time();
	module.exports = function defaultFormatter(options, params, payload) {
		let s = options.format;
		const formatTime = options.formatTime || _defaultFormatTime;
		const formatValue = options.formatValue || _defaultFormatValue;
		const formatBar = options.formatBar || _defaultFormatBar;
		const percentage = Math.floor(params.progress * 100) + "";
		const stopTime = params.stopTime || Date.now();
		const elapsedTime = Math.round((stopTime - params.startTime) / 1e3);
		const context = Object.assign({}, payload, {
			bar: formatBar(params.progress, options),
			percentage: formatValue(percentage, options, "percentage"),
			total: formatValue(params.total, options, "total"),
			value: formatValue(params.value, options, "value"),
			eta: formatValue(params.eta, options, "eta"),
			eta_formatted: formatTime(params.eta, options, 5),
			duration: formatValue(elapsedTime, options, "duration"),
			duration_formatted: formatTime(elapsedTime, options, 1)
		});
		s = s.replace(/\{(\w+)\}/g, function(match, key) {
			if (typeof context[key] !== "undefined") return context[key];
			return match;
		});
		const fullMargin = Math.max(0, params.maxWidth - _stringWidth(s) - 2);
		const halfMargin = Math.floor(fullMargin / 2);
		switch (options.align) {
			case "right":
				s = fullMargin > 0 ? " ".repeat(fullMargin) + s : s;
				break;
			case "center":
				s = halfMargin > 0 ? " ".repeat(halfMargin) + s : s;
				break;
			default: break;
		}
		return s;
	};
}));
//#endregion
//#region node_modules/cli-progress/lib/options.js
var require_options = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function mergeOption(v, defaultValue) {
		if (typeof v === "undefined" || v === null) return defaultValue;
		else return v;
	}
	module.exports = {
		parse: function parse(rawOptions, preset) {
			const options = {};
			const opt = Object.assign({}, preset, rawOptions);
			options.throttleTime = 1e3 / mergeOption(opt.fps, 10);
			options.stream = mergeOption(opt.stream, process.stderr);
			options.terminal = mergeOption(opt.terminal, null);
			options.clearOnComplete = mergeOption(opt.clearOnComplete, false);
			options.stopOnComplete = mergeOption(opt.stopOnComplete, false);
			options.barsize = mergeOption(opt.barsize, 40);
			options.align = mergeOption(opt.align, "left");
			options.hideCursor = mergeOption(opt.hideCursor, false);
			options.linewrap = mergeOption(opt.linewrap, false);
			options.barGlue = mergeOption(opt.barGlue, "");
			options.barCompleteChar = mergeOption(opt.barCompleteChar, "=");
			options.barIncompleteChar = mergeOption(opt.barIncompleteChar, "-");
			options.format = mergeOption(opt.format, "progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}");
			options.formatTime = mergeOption(opt.formatTime, null);
			options.formatValue = mergeOption(opt.formatValue, null);
			options.formatBar = mergeOption(opt.formatBar, null);
			options.etaBufferLength = mergeOption(opt.etaBuffer, 10);
			options.etaAsynchronousUpdate = mergeOption(opt.etaAsynchronousUpdate, false);
			options.progressCalculationRelative = mergeOption(opt.progressCalculationRelative, false);
			options.synchronousUpdate = mergeOption(opt.synchronousUpdate, true);
			options.noTTYOutput = mergeOption(opt.noTTYOutput, false);
			options.notTTYSchedule = mergeOption(opt.notTTYSchedule, 2e3);
			options.emptyOnZero = mergeOption(opt.emptyOnZero, false);
			options.forceRedraw = mergeOption(opt.forceRedraw, false);
			options.autopadding = mergeOption(opt.autopadding, false);
			options.gracefulExit = mergeOption(opt.gracefulExit, false);
			return options;
		},
		assignDerivedOptions: function assignDerivedOptions(options) {
			options.barCompleteString = options.barCompleteChar.repeat(options.barsize + 1);
			options.barIncompleteString = options.barIncompleteChar.repeat(options.barsize + 1);
			options.autopaddingChar = options.autopadding ? mergeOption(options.autopaddingChar, "   ") : "";
			return options;
		}
	};
}));
//#endregion
//#region node_modules/cli-progress/lib/generic-bar.js
var require_generic_bar = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const _ETA = require_eta();
	const _Terminal = require_terminal();
	const _formatter = require_formatter();
	const _options = require_options();
	const _EventEmitter$1 = __require("events");
	module.exports = class GenericBar extends _EventEmitter$1 {
		constructor(options) {
			super();
			this.options = _options.assignDerivedOptions(options);
			this.terminal = this.options.terminal ? this.options.terminal : new _Terminal(this.options.stream);
			this.value = 0;
			this.startValue = 0;
			this.total = 100;
			this.lastDrawnString = null;
			this.startTime = null;
			this.stopTime = null;
			this.lastRedraw = Date.now();
			this.eta = new _ETA(this.options.etaBufferLength, 0, 0);
			this.payload = {};
			this.isActive = false;
			this.formatter = typeof this.options.format === "function" ? this.options.format : _formatter;
		}
		render(forceRendering = false) {
			const params = {
				progress: this.getProgress(),
				eta: this.eta.getTime(),
				startTime: this.startTime,
				stopTime: this.stopTime,
				total: this.total,
				value: this.value,
				maxWidth: this.terminal.getWidth()
			};
			if (this.options.etaAsynchronousUpdate) this.updateETA();
			const s = this.formatter(this.options, params, this.payload);
			if (forceRendering || this.options.forceRedraw || this.options.noTTYOutput && !this.terminal.isTTY() || this.lastDrawnString != s) {
				this.emit("redraw-pre");
				this.terminal.cursorTo(0, null);
				this.terminal.write(s);
				this.terminal.clearRight();
				this.lastDrawnString = s;
				this.lastRedraw = Date.now();
				this.emit("redraw-post");
			}
		}
		start(total, startValue, payload) {
			this.value = startValue || 0;
			this.total = typeof total !== "undefined" && total >= 0 ? total : 100;
			this.startValue = startValue || 0;
			this.payload = payload || {};
			this.startTime = Date.now();
			this.stopTime = null;
			this.lastDrawnString = "";
			this.eta = new _ETA(this.options.etaBufferLength, this.startTime, this.value);
			this.isActive = true;
			this.emit("start", total, startValue);
		}
		stop() {
			this.isActive = false;
			this.stopTime = Date.now();
			this.emit("stop", this.total, this.value);
		}
		update(arg0, arg1 = {}) {
			if (typeof arg0 === "number") {
				this.value = arg0;
				this.eta.update(Date.now(), arg0, this.total);
			}
			const payloadData = (typeof arg0 === "object" ? arg0 : arg1) || {};
			this.emit("update", this.total, this.value);
			for (const key in payloadData) this.payload[key] = payloadData[key];
			if (this.value >= this.getTotal() && this.options.stopOnComplete) this.stop();
		}
		getProgress() {
			let progress = this.value / this.total;
			if (this.options.progressCalculationRelative) progress = (this.value - this.startValue) / (this.total - this.startValue);
			if (isNaN(progress)) progress = this.options && this.options.emptyOnZero ? 0 : 1;
			progress = Math.min(Math.max(progress, 0), 1);
			return progress;
		}
		increment(arg0 = 1, arg1 = {}) {
			if (typeof arg0 === "object") this.update(this.value + 1, arg0);
			else this.update(this.value + arg0, arg1);
		}
		getTotal() {
			return this.total;
		}
		setTotal(total) {
			if (typeof total !== "undefined" && total >= 0) this.total = total;
		}
		updateETA() {
			this.eta.update(Date.now(), this.value, this.total);
		}
	};
}));
//#endregion
//#region node_modules/cli-progress/lib/single-bar.js
var require_single_bar = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const _GenericBar = require_generic_bar();
	const _options = require_options();
	module.exports = class SingleBar extends _GenericBar {
		constructor(options, preset) {
			super(_options.parse(options, preset));
			this.timer = null;
			if (this.options.noTTYOutput && this.terminal.isTTY() === false) this.options.synchronousUpdate = false;
			this.schedulingRate = this.terminal.isTTY() ? this.options.throttleTime : this.options.notTTYSchedule;
			this.sigintCallback = null;
		}
		render() {
			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = null;
			}
			super.render();
			if (this.options.noTTYOutput && this.terminal.isTTY() === false) this.terminal.newline();
			this.timer = setTimeout(this.render.bind(this), this.schedulingRate);
		}
		update(current, payload) {
			if (!this.timer) return;
			super.update(current, payload);
			if (this.options.synchronousUpdate && this.lastRedraw + this.options.throttleTime * 2 < Date.now()) this.render();
		}
		start(total, startValue, payload) {
			if (this.options.noTTYOutput === false && this.terminal.isTTY() === false) return;
			if (this.sigintCallback === null && this.options.gracefulExit) {
				this.sigintCallback = this.stop.bind(this);
				process.once("SIGINT", this.sigintCallback);
				process.once("SIGTERM", this.sigintCallback);
			}
			this.terminal.cursorSave();
			if (this.options.hideCursor === true) this.terminal.cursor(false);
			if (this.options.linewrap === false) this.terminal.lineWrapping(false);
			super.start(total, startValue, payload);
			this.render();
		}
		stop() {
			if (!this.timer) return;
			if (this.sigintCallback) {
				process.removeListener("SIGINT", this.sigintCallback);
				process.removeListener("SIGTERM", this.sigintCallback);
				this.sigintCallback = null;
			}
			this.render();
			super.stop();
			clearTimeout(this.timer);
			this.timer = null;
			if (this.options.hideCursor === true) this.terminal.cursor(true);
			if (this.options.linewrap === false) this.terminal.lineWrapping(true);
			this.terminal.cursorRestore();
			if (this.options.clearOnComplete) {
				this.terminal.cursorTo(0, null);
				this.terminal.clearLine();
			} else this.terminal.newline();
		}
	};
}));
//#endregion
//#region node_modules/cli-progress/lib/multi-bar.js
var require_multi_bar = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const _Terminal = require_terminal();
	const _BarElement = require_generic_bar();
	const _options = require_options();
	const _EventEmitter = __require("events");
	module.exports = class MultiBar extends _EventEmitter {
		constructor(options, preset) {
			super();
			this.bars = [];
			this.options = _options.parse(options, preset);
			this.options.synchronousUpdate = false;
			this.terminal = this.options.terminal ? this.options.terminal : new _Terminal(this.options.stream);
			this.timer = null;
			this.isActive = false;
			this.schedulingRate = this.terminal.isTTY() ? this.options.throttleTime : this.options.notTTYSchedule;
			this.loggingBuffer = [];
			this.sigintCallback = null;
		}
		create(total, startValue, payload, barOptions = {}) {
			const bar = new _BarElement(Object.assign({}, this.options, { terminal: this.terminal }, barOptions));
			this.bars.push(bar);
			if (this.options.noTTYOutput === false && this.terminal.isTTY() === false) return bar;
			if (this.sigintCallback === null && this.options.gracefulExit) {
				this.sigintCallback = this.stop.bind(this);
				process.once("SIGINT", this.sigintCallback);
				process.once("SIGTERM", this.sigintCallback);
			}
			if (!this.isActive) {
				if (this.options.hideCursor === true) this.terminal.cursor(false);
				if (this.options.linewrap === false) this.terminal.lineWrapping(false);
				this.timer = setTimeout(this.update.bind(this), this.schedulingRate);
			}
			this.isActive = true;
			bar.start(total, startValue, payload);
			this.emit("start");
			return bar;
		}
		remove(bar) {
			const index = this.bars.indexOf(bar);
			if (index < 0) return false;
			this.bars.splice(index, 1);
			this.update();
			this.terminal.newline();
			this.terminal.clearBottom();
			return true;
		}
		update() {
			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = null;
			}
			this.emit("update-pre");
			this.terminal.cursorRelativeReset();
			this.emit("redraw-pre");
			if (this.loggingBuffer.length > 0) {
				this.terminal.clearLine();
				while (this.loggingBuffer.length > 0) this.terminal.write(this.loggingBuffer.shift(), true);
			}
			for (let i = 0; i < this.bars.length; i++) {
				if (i > 0) this.terminal.newline();
				this.bars[i].render();
			}
			this.emit("redraw-post");
			if (this.options.noTTYOutput && this.terminal.isTTY() === false) {
				this.terminal.newline();
				this.terminal.newline();
			}
			this.timer = setTimeout(this.update.bind(this), this.schedulingRate);
			this.emit("update-post");
			if (this.options.stopOnComplete && !this.bars.find((bar) => bar.isActive)) this.stop();
		}
		stop() {
			clearTimeout(this.timer);
			this.timer = null;
			if (this.sigintCallback) {
				process.removeListener("SIGINT", this.sigintCallback);
				process.removeListener("SIGTERM", this.sigintCallback);
				this.sigintCallback = null;
			}
			this.isActive = false;
			if (this.options.hideCursor === true) this.terminal.cursor(true);
			if (this.options.linewrap === false) this.terminal.lineWrapping(true);
			this.terminal.cursorRelativeReset();
			this.emit("stop-pre-clear");
			if (this.options.clearOnComplete) this.terminal.clearBottom();
			else {
				for (let i = 0; i < this.bars.length; i++) {
					if (i > 0) this.terminal.newline();
					this.bars[i].render();
					this.bars[i].stop();
				}
				this.terminal.newline();
			}
			this.emit("stop");
		}
		log(s) {
			this.loggingBuffer.push(s);
		}
	};
}));
//#endregion
//#region node_modules/cli-progress/presets/legacy.js
var require_legacy = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		format: "progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
		barCompleteChar: "=",
		barIncompleteChar: "-"
	};
}));
//#endregion
//#region node_modules/cli-progress/presets/shades-classic.js
var require_shades_classic = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		format: " {bar} {percentage}% | ETA: {eta}s | {value}/{total}",
		barCompleteChar: "█",
		barIncompleteChar: "░"
	};
}));
//#endregion
//#region node_modules/cli-progress/presets/shades-grey.js
var require_shades_grey = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		format: " \x1B[90m{bar}\x1B[0m {percentage}% | ETA: {eta}s | {value}/{total}",
		barCompleteChar: "█",
		barIncompleteChar: "░"
	};
}));
//#endregion
//#region node_modules/cli-progress/presets/rect.js
var require_rect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		format: " {bar}■ {percentage}% | ETA: {eta}s | {value}/{total}",
		barCompleteChar: "■",
		barIncompleteChar: " "
	};
}));
//#endregion
//#region node_modules/cli-progress/presets/index.js
var require_presets = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		legacy: require_legacy(),
		shades_classic: require_shades_classic(),
		shades_grey: require_shades_grey(),
		rect: require_rect()
	};
}));
//#endregion
//#region node_modules/cli-progress/cli-progress.js
var require_cli_progress = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const _SingleBar = require_single_bar();
	const _MultiBar = require_multi_bar();
	const _Presets = require_presets();
	const _Formatter = require_formatter();
	const _defaultFormatValue = require_format_value();
	module.exports = {
		Bar: _SingleBar,
		SingleBar: _SingleBar,
		MultiBar: _MultiBar,
		Presets: _Presets,
		Format: {
			Formatter: _Formatter,
			BarFormat: require_format_bar(),
			ValueFormat: _defaultFormatValue,
			TimeFormat: require_format_time()
		}
	};
}));
//#endregion
//#region node_modules/@dz/-/dist/chunk.mjs
var import_ini = /* @__PURE__ */ __toESM(require_ini(), 1);
var import_cli_progress = /* @__PURE__ */ __toESM(require_cli_progress(), 1);
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/js-yaml/dist/js-yaml.mjs
/*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT */
function isNothing(subject) {
	return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
	return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
	if (Array.isArray(sequence)) return sequence;
	else if (isNothing(sequence)) return [];
	return [sequence];
}
function extend(target, source) {
	var index, length, key, sourceKeys;
	if (source) {
		sourceKeys = Object.keys(source);
		for (index = 0, length = sourceKeys.length; index < length; index += 1) {
			key = sourceKeys[index];
			target[key] = source[key];
		}
	}
	return target;
}
function repeat(string, count) {
	var result = "", cycle;
	for (cycle = 0; cycle < count; cycle += 1) result += string;
	return result;
}
function isNegativeZero(number) {
	return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var common = {
	isNothing,
	isObject,
	toArray,
	repeat,
	isNegativeZero,
	extend
};
function formatError(exception, compact) {
	var where = "", message = exception.reason || "(unknown reason)";
	if (!exception.mark) return message;
	if (exception.mark.name) where += "in \"" + exception.mark.name + "\" ";
	where += "(" + (exception.mark.line + 1) + ":" + (exception.mark.column + 1) + ")";
	if (!compact && exception.mark.snippet) where += "\n\n" + exception.mark.snippet;
	return message + " " + where;
}
function YAMLException$1(reason, mark) {
	Error.call(this);
	this.name = "YAMLException";
	this.reason = reason;
	this.mark = mark;
	this.message = formatError(this, false);
	if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
	else this.stack = (/* @__PURE__ */ new Error()).stack || "";
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
	return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
	var head = "";
	var tail = "";
	var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
	if (position - lineStart > maxHalfLength) {
		head = " ... ";
		lineStart = position - maxHalfLength + head.length;
	}
	if (lineEnd - position > maxHalfLength) {
		tail = " ...";
		lineEnd = position + maxHalfLength - tail.length;
	}
	return {
		str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "→") + tail,
		pos: position - lineStart + head.length
	};
}
function padStart(string, max) {
	return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
	options = Object.create(options || null);
	if (!mark.buffer) return null;
	if (!options.maxLength) options.maxLength = 79;
	if (typeof options.indent !== "number") options.indent = 1;
	if (typeof options.linesBefore !== "number") options.linesBefore = 3;
	if (typeof options.linesAfter !== "number") options.linesAfter = 2;
	var re = /\r?\n|\r|\0/g;
	var lineStarts = [0];
	var lineEnds = [];
	var match;
	var foundLineNo = -1;
	while (match = re.exec(mark.buffer)) {
		lineEnds.push(match.index);
		lineStarts.push(match.index + match[0].length);
		if (mark.position <= match.index && foundLineNo < 0) foundLineNo = lineStarts.length - 2;
	}
	if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
	var result = "", i, line;
	var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
	var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
	for (i = 1; i <= options.linesBefore; i++) {
		if (foundLineNo - i < 0) break;
		line = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
		result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
	}
	line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
	result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
	result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
	for (i = 1; i <= options.linesAfter; i++) {
		if (foundLineNo + i >= lineEnds.length) break;
		line = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
		result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
	}
	return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
	"kind",
	"multi",
	"resolve",
	"construct",
	"instanceOf",
	"predicate",
	"represent",
	"representName",
	"defaultStyle",
	"styleAliases"
];
var YAML_NODE_KINDS = [
	"scalar",
	"sequence",
	"mapping"
];
function compileStyleAliases(map) {
	var result = {};
	if (map !== null) Object.keys(map).forEach(function(style) {
		map[style].forEach(function(alias) {
			result[String(alias)] = style;
		});
	});
	return result;
}
function Type$1(tag, options) {
	options = options || {};
	Object.keys(options).forEach(function(name) {
		if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) throw new exception("Unknown option \"" + name + "\" is met in definition of \"" + tag + "\" YAML type.");
	});
	this.options = options;
	this.tag = tag;
	this.kind = options["kind"] || null;
	this.resolve = options["resolve"] || function() {
		return true;
	};
	this.construct = options["construct"] || function(data) {
		return data;
	};
	this.instanceOf = options["instanceOf"] || null;
	this.predicate = options["predicate"] || null;
	this.represent = options["represent"] || null;
	this.representName = options["representName"] || null;
	this.defaultStyle = options["defaultStyle"] || null;
	this.multi = options["multi"] || false;
	this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
	if (YAML_NODE_KINDS.indexOf(this.kind) === -1) throw new exception("Unknown kind \"" + this.kind + "\" is specified for \"" + tag + "\" YAML type.");
}
var type = Type$1;
function compileList(schema, name) {
	var result = [];
	schema[name].forEach(function(currentType) {
		var newIndex = result.length;
		result.forEach(function(previousType, previousIndex) {
			if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) newIndex = previousIndex;
		});
		result[newIndex] = currentType;
	});
	return result;
}
function compileMap() {
	var result = {
		scalar: {},
		sequence: {},
		mapping: {},
		fallback: {},
		multi: {
			scalar: [],
			sequence: [],
			mapping: [],
			fallback: []
		}
	}, index, length;
	function collectType(type) {
		if (type.multi) {
			result.multi[type.kind].push(type);
			result.multi["fallback"].push(type);
		} else result[type.kind][type.tag] = result["fallback"][type.tag] = type;
	}
	for (index = 0, length = arguments.length; index < length; index += 1) arguments[index].forEach(collectType);
	return result;
}
function Schema$1(definition) {
	return this.extend(definition);
}
Schema$1.prototype.extend = function extend(definition) {
	var implicit = [];
	var explicit = [];
	if (definition instanceof type) explicit.push(definition);
	else if (Array.isArray(definition)) explicit = explicit.concat(definition);
	else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
		if (definition.implicit) implicit = implicit.concat(definition.implicit);
		if (definition.explicit) explicit = explicit.concat(definition.explicit);
	} else throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
	implicit.forEach(function(type$1) {
		if (!(type$1 instanceof type)) throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
		if (type$1.loadKind && type$1.loadKind !== "scalar") throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
		if (type$1.multi) throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
	});
	explicit.forEach(function(type$1) {
		if (!(type$1 instanceof type)) throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
	});
	var result = Object.create(Schema$1.prototype);
	result.implicit = (this.implicit || []).concat(implicit);
	result.explicit = (this.explicit || []).concat(explicit);
	result.compiledImplicit = compileList(result, "implicit");
	result.compiledExplicit = compileList(result, "explicit");
	result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
	return result;
};
var failsafe = new Schema$1({ explicit: [
	new type("tag:yaml.org,2002:str", {
		kind: "scalar",
		construct: function(data) {
			return data !== null ? data : "";
		}
	}),
	new type("tag:yaml.org,2002:seq", {
		kind: "sequence",
		construct: function(data) {
			return data !== null ? data : [];
		}
	}),
	new type("tag:yaml.org,2002:map", {
		kind: "mapping",
		construct: function(data) {
			return data !== null ? data : {};
		}
	})
] });
function resolveYamlNull(data) {
	if (data === null) return true;
	var max = data.length;
	return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
	return null;
}
function isNull(object) {
	return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
	kind: "scalar",
	resolve: resolveYamlNull,
	construct: constructYamlNull,
	predicate: isNull,
	represent: {
		canonical: function() {
			return "~";
		},
		lowercase: function() {
			return "null";
		},
		uppercase: function() {
			return "NULL";
		},
		camelcase: function() {
			return "Null";
		},
		empty: function() {
			return "";
		}
	},
	defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
	if (data === null) return false;
	var max = data.length;
	return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
	return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
	return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
	kind: "scalar",
	resolve: resolveYamlBoolean,
	construct: constructYamlBoolean,
	predicate: isBoolean,
	represent: {
		lowercase: function(object) {
			return object ? "true" : "false";
		},
		uppercase: function(object) {
			return object ? "TRUE" : "FALSE";
		},
		camelcase: function(object) {
			return object ? "True" : "False";
		}
	},
	defaultStyle: "lowercase"
});
function isHexCode(c) {
	return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
	return 48 <= c && c <= 55;
}
function isDecCode(c) {
	return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
	if (data === null) return false;
	var max = data.length, index = 0, hasDigits = false, ch;
	if (!max) return false;
	ch = data[index];
	if (ch === "-" || ch === "+") ch = data[++index];
	if (ch === "0") {
		if (index + 1 === max) return true;
		ch = data[++index];
		if (ch === "b") {
			index++;
			for (; index < max; index++) {
				ch = data[index];
				if (ch === "_") continue;
				if (ch !== "0" && ch !== "1") return false;
				hasDigits = true;
			}
			return hasDigits && ch !== "_";
		}
		if (ch === "x") {
			index++;
			for (; index < max; index++) {
				ch = data[index];
				if (ch === "_") continue;
				if (!isHexCode(data.charCodeAt(index))) return false;
				hasDigits = true;
			}
			return hasDigits && ch !== "_";
		}
		if (ch === "o") {
			index++;
			for (; index < max; index++) {
				ch = data[index];
				if (ch === "_") continue;
				if (!isOctCode(data.charCodeAt(index))) return false;
				hasDigits = true;
			}
			return hasDigits && ch !== "_";
		}
	}
	if (ch === "_") return false;
	for (; index < max; index++) {
		ch = data[index];
		if (ch === "_") continue;
		if (!isDecCode(data.charCodeAt(index))) return false;
		hasDigits = true;
	}
	if (!hasDigits || ch === "_") return false;
	return true;
}
function constructYamlInteger(data) {
	var value = data, sign = 1, ch;
	if (value.indexOf("_") !== -1) value = value.replace(/_/g, "");
	ch = value[0];
	if (ch === "-" || ch === "+") {
		if (ch === "-") sign = -1;
		value = value.slice(1);
		ch = value[0];
	}
	if (value === "0") return 0;
	if (ch === "0") {
		if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
		if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
		if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
	}
	return sign * parseInt(value, 10);
}
function isInteger(object) {
	return Object.prototype.toString.call(object) === "[object Number]" && object % 1 === 0 && !common.isNegativeZero(object);
}
var int = new type("tag:yaml.org,2002:int", {
	kind: "scalar",
	resolve: resolveYamlInteger,
	construct: constructYamlInteger,
	predicate: isInteger,
	represent: {
		binary: function(obj) {
			return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
		},
		octal: function(obj) {
			return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
		},
		decimal: function(obj) {
			return obj.toString(10);
		},
		hexadecimal: function(obj) {
			return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
		}
	},
	defaultStyle: "decimal",
	styleAliases: {
		binary: [2, "bin"],
		octal: [8, "oct"],
		decimal: [10, "dec"],
		hexadecimal: [16, "hex"]
	}
});
var YAML_FLOAT_PATTERN = /* @__PURE__ */ new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(data) {
	if (data === null) return false;
	if (!YAML_FLOAT_PATTERN.test(data) || data[data.length - 1] === "_") return false;
	return true;
}
function constructYamlFloat(data) {
	var value = data.replace(/_/g, "").toLowerCase(), sign = value[0] === "-" ? -1 : 1;
	if ("+-".indexOf(value[0]) >= 0) value = value.slice(1);
	if (value === ".inf") return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
	else if (value === ".nan") return NaN;
	return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
	var res;
	if (isNaN(object)) switch (style) {
		case "lowercase": return ".nan";
		case "uppercase": return ".NAN";
		case "camelcase": return ".NaN";
	}
	else if (Number.POSITIVE_INFINITY === object) switch (style) {
		case "lowercase": return ".inf";
		case "uppercase": return ".INF";
		case "camelcase": return ".Inf";
	}
	else if (Number.NEGATIVE_INFINITY === object) switch (style) {
		case "lowercase": return "-.inf";
		case "uppercase": return "-.INF";
		case "camelcase": return "-.Inf";
	}
	else if (common.isNegativeZero(object)) return "-0.0";
	res = object.toString(10);
	return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
	return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
	kind: "scalar",
	resolve: resolveYamlFloat,
	construct: constructYamlFloat,
	predicate: isFloat,
	represent: representYamlFloat,
	defaultStyle: "lowercase"
});
var core = failsafe.extend({ implicit: [
	_null,
	bool,
	int,
	float
] });
var YAML_DATE_REGEXP = /* @__PURE__ */ new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$");
var YAML_TIMESTAMP_REGEXP = /* @__PURE__ */ new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");
function resolveYamlTimestamp(data) {
	if (data === null) return false;
	if (YAML_DATE_REGEXP.exec(data) !== null) return true;
	if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
	return false;
}
function constructYamlTimestamp(data) {
	var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
	match = YAML_DATE_REGEXP.exec(data);
	if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
	if (match === null) throw new Error("Date resolve error");
	year = +match[1];
	month = +match[2] - 1;
	day = +match[3];
	if (!match[4]) return new Date(Date.UTC(year, month, day));
	hour = +match[4];
	minute = +match[5];
	second = +match[6];
	if (match[7]) {
		fraction = match[7].slice(0, 3);
		while (fraction.length < 3) fraction += "0";
		fraction = +fraction;
	}
	if (match[9]) {
		tz_hour = +match[10];
		tz_minute = +(match[11] || 0);
		delta = (tz_hour * 60 + tz_minute) * 6e4;
		if (match[9] === "-") delta = -delta;
	}
	date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
	if (delta) date.setTime(date.getTime() - delta);
	return date;
}
function representYamlTimestamp(object) {
	return object.toISOString();
}
var timestamp$1 = new type("tag:yaml.org,2002:timestamp", {
	kind: "scalar",
	resolve: resolveYamlTimestamp,
	construct: constructYamlTimestamp,
	instanceOf: Date,
	represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
	return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
	kind: "scalar",
	resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
	if (data === null) return false;
	var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;
	for (idx = 0; idx < max; idx++) {
		code = map.indexOf(data.charAt(idx));
		if (code > 64) continue;
		if (code < 0) return false;
		bitlen += 6;
	}
	return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
	var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map = BASE64_MAP, bits = 0, result = [];
	for (idx = 0; idx < max; idx++) {
		if (idx % 4 === 0 && idx) {
			result.push(bits >> 16 & 255);
			result.push(bits >> 8 & 255);
			result.push(bits & 255);
		}
		bits = bits << 6 | map.indexOf(input.charAt(idx));
	}
	tailbits = max % 4 * 6;
	if (tailbits === 0) {
		result.push(bits >> 16 & 255);
		result.push(bits >> 8 & 255);
		result.push(bits & 255);
	} else if (tailbits === 18) {
		result.push(bits >> 10 & 255);
		result.push(bits >> 2 & 255);
	} else if (tailbits === 12) result.push(bits >> 4 & 255);
	return new Uint8Array(result);
}
function representYamlBinary(object) {
	var result = "", bits = 0, idx, tail, max = object.length, map = BASE64_MAP;
	for (idx = 0; idx < max; idx++) {
		if (idx % 3 === 0 && idx) {
			result += map[bits >> 18 & 63];
			result += map[bits >> 12 & 63];
			result += map[bits >> 6 & 63];
			result += map[bits & 63];
		}
		bits = (bits << 8) + object[idx];
	}
	tail = max % 3;
	if (tail === 0) {
		result += map[bits >> 18 & 63];
		result += map[bits >> 12 & 63];
		result += map[bits >> 6 & 63];
		result += map[bits & 63];
	} else if (tail === 2) {
		result += map[bits >> 10 & 63];
		result += map[bits >> 4 & 63];
		result += map[bits << 2 & 63];
		result += map[64];
	} else if (tail === 1) {
		result += map[bits >> 2 & 63];
		result += map[bits << 4 & 63];
		result += map[64];
		result += map[64];
	}
	return result;
}
function isBinary(obj) {
	return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
	kind: "scalar",
	resolve: resolveYamlBinary,
	construct: constructYamlBinary,
	predicate: isBinary,
	represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
	if (data === null) return true;
	var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
	for (index = 0, length = object.length; index < length; index += 1) {
		pair = object[index];
		pairHasKey = false;
		if (_toString$2.call(pair) !== "[object Object]") return false;
		for (pairKey in pair) if (_hasOwnProperty$3.call(pair, pairKey)) if (!pairHasKey) pairHasKey = true;
		else return false;
		if (!pairHasKey) return false;
		if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
		else return false;
	}
	return true;
}
function constructYamlOmap(data) {
	return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
	kind: "sequence",
	resolve: resolveYamlOmap,
	construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
	if (data === null) return true;
	var index, length, pair, keys, result, object = data;
	result = new Array(object.length);
	for (index = 0, length = object.length; index < length; index += 1) {
		pair = object[index];
		if (_toString$1.call(pair) !== "[object Object]") return false;
		keys = Object.keys(pair);
		if (keys.length !== 1) return false;
		result[index] = [keys[0], pair[keys[0]]];
	}
	return true;
}
function constructYamlPairs(data) {
	if (data === null) return [];
	var index, length, pair, keys, result, object = data;
	result = new Array(object.length);
	for (index = 0, length = object.length; index < length; index += 1) {
		pair = object[index];
		keys = Object.keys(pair);
		result[index] = [keys[0], pair[keys[0]]];
	}
	return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
	kind: "sequence",
	resolve: resolveYamlPairs,
	construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
	if (data === null) return true;
	var key, object = data;
	for (key in object) if (_hasOwnProperty$2.call(object, key)) {
		if (object[key] !== null) return false;
	}
	return true;
}
function constructYamlSet(data) {
	return data !== null ? data : {};
}
var set$2 = new type("tag:yaml.org,2002:set", {
	kind: "mapping",
	resolve: resolveYamlSet,
	construct: constructYamlSet
});
var _default = core.extend({
	implicit: [timestamp$1, merge],
	explicit: [
		binary,
		omap,
		pairs,
		set$2
	]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
	return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
	return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
	return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
	return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
	return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
	var lc;
	if (48 <= c && c <= 57) return c - 48;
	lc = c | 32;
	if (97 <= lc && lc <= 102) return lc - 97 + 10;
	return -1;
}
function escapedHexLen(c) {
	if (c === 120) return 2;
	if (c === 117) return 4;
	if (c === 85) return 8;
	return 0;
}
function fromDecimalCode(c) {
	if (48 <= c && c <= 57) return c - 48;
	return -1;
}
function simpleEscapeSequence(c) {
	return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? "\"" : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
	if (c <= 65535) return String.fromCharCode(c);
	return String.fromCharCode((c - 65536 >> 10) + 55296, (c - 65536 & 1023) + 56320);
}
function setProperty(object, key, value) {
	if (key === "__proto__") Object.defineProperty(object, key, {
		configurable: true,
		enumerable: true,
		writable: true,
		value
	});
	else object[key] = value;
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
	simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
	simpleEscapeMap[i] = simpleEscapeSequence(i);
}
function State$1(input, options) {
	this.input = input;
	this.filename = options["filename"] || null;
	this.schema = options["schema"] || _default;
	this.onWarning = options["onWarning"] || null;
	this.legacy = options["legacy"] || false;
	this.json = options["json"] || false;
	this.listener = options["listener"] || null;
	this.implicitTypes = this.schema.compiledImplicit;
	this.typeMap = this.schema.compiledTypeMap;
	this.length = input.length;
	this.position = 0;
	this.line = 0;
	this.lineStart = 0;
	this.lineIndent = 0;
	this.firstTabInLine = -1;
	this.documents = [];
}
function generateError(state, message) {
	var mark = {
		name: state.filename,
		buffer: state.input.slice(0, -1),
		position: state.position,
		line: state.line,
		column: state.position - state.lineStart
	};
	mark.snippet = snippet(mark);
	return new exception(message, mark);
}
function throwError(state, message) {
	throw generateError(state, message);
}
function throwWarning(state, message) {
	if (state.onWarning) state.onWarning.call(null, generateError(state, message));
}
var directiveHandlers = {
	YAML: function handleYamlDirective(state, name, args) {
		var match, major, minor;
		if (state.version !== null) throwError(state, "duplication of %YAML directive");
		if (args.length !== 1) throwError(state, "YAML directive accepts exactly one argument");
		match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
		if (match === null) throwError(state, "ill-formed argument of the YAML directive");
		major = parseInt(match[1], 10);
		minor = parseInt(match[2], 10);
		if (major !== 1) throwError(state, "unacceptable YAML version of the document");
		state.version = args[0];
		state.checkLineBreaks = minor < 2;
		if (minor !== 1 && minor !== 2) throwWarning(state, "unsupported YAML version of the document");
	},
	TAG: function handleTagDirective(state, name, args) {
		var handle, prefix;
		if (args.length !== 2) throwError(state, "TAG directive accepts exactly two arguments");
		handle = args[0];
		prefix = args[1];
		if (!PATTERN_TAG_HANDLE.test(handle)) throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
		if (_hasOwnProperty$1.call(state.tagMap, handle)) throwError(state, "there is a previously declared suffix for \"" + handle + "\" tag handle");
		if (!PATTERN_TAG_URI.test(prefix)) throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
		try {
			prefix = decodeURIComponent(prefix);
		} catch (err) {
			throwError(state, "tag prefix is malformed: " + prefix);
		}
		state.tagMap[handle] = prefix;
	}
};
function captureSegment(state, start, end, checkJson) {
	var _position, _length, _character, _result;
	if (start < end) {
		_result = state.input.slice(start, end);
		if (checkJson) for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
			_character = _result.charCodeAt(_position);
			if (!(_character === 9 || 32 <= _character && _character <= 1114111)) throwError(state, "expected valid JSON character");
		}
		else if (PATTERN_NON_PRINTABLE.test(_result)) throwError(state, "the stream contains non-printable characters");
		state.result += _result;
	}
}
function mergeMappings(state, destination, source, overridableKeys) {
	var sourceKeys, key, index, quantity;
	if (!common.isObject(source)) throwError(state, "cannot merge mappings; the provided source object is unacceptable");
	sourceKeys = Object.keys(source);
	for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
		key = sourceKeys[index];
		if (!_hasOwnProperty$1.call(destination, key)) {
			setProperty(destination, key, source[key]);
			overridableKeys[key] = true;
		}
	}
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
	var index, quantity;
	if (Array.isArray(keyNode)) {
		keyNode = Array.prototype.slice.call(keyNode);
		for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
			if (Array.isArray(keyNode[index])) throwError(state, "nested arrays are not supported inside keys");
			if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") keyNode[index] = "[object Object]";
		}
	}
	if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") keyNode = "[object Object]";
	keyNode = String(keyNode);
	if (_result === null) _result = {};
	if (keyTag === "tag:yaml.org,2002:merge") if (Array.isArray(valueNode)) for (index = 0, quantity = valueNode.length; index < quantity; index += 1) mergeMappings(state, _result, valueNode[index], overridableKeys);
	else mergeMappings(state, _result, valueNode, overridableKeys);
	else {
		if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
			state.line = startLine || state.line;
			state.lineStart = startLineStart || state.lineStart;
			state.position = startPos || state.position;
			throwError(state, "duplicated mapping key");
		}
		setProperty(_result, keyNode, valueNode);
		delete overridableKeys[keyNode];
	}
	return _result;
}
function readLineBreak(state) {
	var ch = state.input.charCodeAt(state.position);
	if (ch === 10) state.position++;
	else if (ch === 13) {
		state.position++;
		if (state.input.charCodeAt(state.position) === 10) state.position++;
	} else throwError(state, "a line break is expected");
	state.line += 1;
	state.lineStart = state.position;
	state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
	var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
	while (ch !== 0) {
		while (is_WHITE_SPACE(ch)) {
			if (ch === 9 && state.firstTabInLine === -1) state.firstTabInLine = state.position;
			ch = state.input.charCodeAt(++state.position);
		}
		if (allowComments && ch === 35) do
			ch = state.input.charCodeAt(++state.position);
		while (ch !== 10 && ch !== 13 && ch !== 0);
		if (is_EOL(ch)) {
			readLineBreak(state);
			ch = state.input.charCodeAt(state.position);
			lineBreaks++;
			state.lineIndent = 0;
			while (ch === 32) {
				state.lineIndent++;
				ch = state.input.charCodeAt(++state.position);
			}
		} else break;
	}
	if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) throwWarning(state, "deficient indentation");
	return lineBreaks;
}
function testDocumentSeparator(state) {
	var _position = state.position, ch = state.input.charCodeAt(_position);
	if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
		_position += 3;
		ch = state.input.charCodeAt(_position);
		if (ch === 0 || is_WS_OR_EOL(ch)) return true;
	}
	return false;
}
function writeFoldedLines(state, count) {
	if (count === 1) state.result += " ";
	else if (count > 1) state.result += common.repeat("\n", count - 1);
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
	var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch = state.input.charCodeAt(state.position);
	if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) return false;
	if (ch === 63 || ch === 45) {
		following = state.input.charCodeAt(state.position + 1);
		if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) return false;
	}
	state.kind = "scalar";
	state.result = "";
	captureStart = captureEnd = state.position;
	hasPendingContent = false;
	while (ch !== 0) {
		if (ch === 58) {
			following = state.input.charCodeAt(state.position + 1);
			if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) break;
		} else if (ch === 35) {
			preceding = state.input.charCodeAt(state.position - 1);
			if (is_WS_OR_EOL(preceding)) break;
		} else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) break;
		else if (is_EOL(ch)) {
			_line = state.line;
			_lineStart = state.lineStart;
			_lineIndent = state.lineIndent;
			skipSeparationSpace(state, false, -1);
			if (state.lineIndent >= nodeIndent) {
				hasPendingContent = true;
				ch = state.input.charCodeAt(state.position);
				continue;
			} else {
				state.position = captureEnd;
				state.line = _line;
				state.lineStart = _lineStart;
				state.lineIndent = _lineIndent;
				break;
			}
		}
		if (hasPendingContent) {
			captureSegment(state, captureStart, captureEnd, false);
			writeFoldedLines(state, state.line - _line);
			captureStart = captureEnd = state.position;
			hasPendingContent = false;
		}
		if (!is_WHITE_SPACE(ch)) captureEnd = state.position + 1;
		ch = state.input.charCodeAt(++state.position);
	}
	captureSegment(state, captureStart, captureEnd, false);
	if (state.result) return true;
	state.kind = _kind;
	state.result = _result;
	return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
	var ch = state.input.charCodeAt(state.position), captureStart, captureEnd;
	if (ch !== 39) return false;
	state.kind = "scalar";
	state.result = "";
	state.position++;
	captureStart = captureEnd = state.position;
	while ((ch = state.input.charCodeAt(state.position)) !== 0) if (ch === 39) {
		captureSegment(state, captureStart, state.position, true);
		ch = state.input.charCodeAt(++state.position);
		if (ch === 39) {
			captureStart = state.position;
			state.position++;
			captureEnd = state.position;
		} else return true;
	} else if (is_EOL(ch)) {
		captureSegment(state, captureStart, captureEnd, true);
		writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
		captureStart = captureEnd = state.position;
	} else if (state.position === state.lineStart && testDocumentSeparator(state)) throwError(state, "unexpected end of the document within a single quoted scalar");
	else {
		state.position++;
		captureEnd = state.position;
	}
	throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
	var captureStart, captureEnd, hexLength, hexResult, tmp, ch = state.input.charCodeAt(state.position);
	if (ch !== 34) return false;
	state.kind = "scalar";
	state.result = "";
	state.position++;
	captureStart = captureEnd = state.position;
	while ((ch = state.input.charCodeAt(state.position)) !== 0) if (ch === 34) {
		captureSegment(state, captureStart, state.position, true);
		state.position++;
		return true;
	} else if (ch === 92) {
		captureSegment(state, captureStart, state.position, true);
		ch = state.input.charCodeAt(++state.position);
		if (is_EOL(ch)) skipSeparationSpace(state, false, nodeIndent);
		else if (ch < 256 && simpleEscapeCheck[ch]) {
			state.result += simpleEscapeMap[ch];
			state.position++;
		} else if ((tmp = escapedHexLen(ch)) > 0) {
			hexLength = tmp;
			hexResult = 0;
			for (; hexLength > 0; hexLength--) {
				ch = state.input.charCodeAt(++state.position);
				if ((tmp = fromHexCode(ch)) >= 0) hexResult = (hexResult << 4) + tmp;
				else throwError(state, "expected hexadecimal character");
			}
			state.result += charFromCodepoint(hexResult);
			state.position++;
		} else throwError(state, "unknown escape sequence");
		captureStart = captureEnd = state.position;
	} else if (is_EOL(ch)) {
		captureSegment(state, captureStart, captureEnd, true);
		writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
		captureStart = captureEnd = state.position;
	} else if (state.position === state.lineStart && testDocumentSeparator(state)) throwError(state, "unexpected end of the document within a double quoted scalar");
	else {
		state.position++;
		captureEnd = state.position;
	}
	throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
	var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = Object.create(null), keyNode, keyTag, valueNode, ch = state.input.charCodeAt(state.position);
	if (ch === 91) {
		terminator = 93;
		isMapping = false;
		_result = [];
	} else if (ch === 123) {
		terminator = 125;
		isMapping = true;
		_result = {};
	} else return false;
	if (state.anchor !== null) state.anchorMap[state.anchor] = _result;
	ch = state.input.charCodeAt(++state.position);
	while (ch !== 0) {
		skipSeparationSpace(state, true, nodeIndent);
		ch = state.input.charCodeAt(state.position);
		if (ch === terminator) {
			state.position++;
			state.tag = _tag;
			state.anchor = _anchor;
			state.kind = isMapping ? "mapping" : "sequence";
			state.result = _result;
			return true;
		} else if (!readNext) throwError(state, "missed comma between flow collection entries");
		else if (ch === 44) throwError(state, "expected the node content, but found ','");
		keyTag = keyNode = valueNode = null;
		isPair = isExplicitPair = false;
		if (ch === 63) {
			following = state.input.charCodeAt(state.position + 1);
			if (is_WS_OR_EOL(following)) {
				isPair = isExplicitPair = true;
				state.position++;
				skipSeparationSpace(state, true, nodeIndent);
			}
		}
		_line = state.line;
		_lineStart = state.lineStart;
		_pos = state.position;
		composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
		keyTag = state.tag;
		keyNode = state.result;
		skipSeparationSpace(state, true, nodeIndent);
		ch = state.input.charCodeAt(state.position);
		if ((isExplicitPair || state.line === _line) && ch === 58) {
			isPair = true;
			ch = state.input.charCodeAt(++state.position);
			skipSeparationSpace(state, true, nodeIndent);
			composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
			valueNode = state.result;
		}
		if (isMapping) storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
		else if (isPair) _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
		else _result.push(keyNode);
		skipSeparationSpace(state, true, nodeIndent);
		ch = state.input.charCodeAt(state.position);
		if (ch === 44) {
			readNext = true;
			ch = state.input.charCodeAt(++state.position);
		} else readNext = false;
	}
	throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
	var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch = state.input.charCodeAt(state.position);
	if (ch === 124) folding = false;
	else if (ch === 62) folding = true;
	else return false;
	state.kind = "scalar";
	state.result = "";
	while (ch !== 0) {
		ch = state.input.charCodeAt(++state.position);
		if (ch === 43 || ch === 45) if (CHOMPING_CLIP === chomping) chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
		else throwError(state, "repeat of a chomping mode identifier");
		else if ((tmp = fromDecimalCode(ch)) >= 0) if (tmp === 0) throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
		else if (!detectedIndent) {
			textIndent = nodeIndent + tmp - 1;
			detectedIndent = true;
		} else throwError(state, "repeat of an indentation width identifier");
		else break;
	}
	if (is_WHITE_SPACE(ch)) {
		do
			ch = state.input.charCodeAt(++state.position);
		while (is_WHITE_SPACE(ch));
		if (ch === 35) do
			ch = state.input.charCodeAt(++state.position);
		while (!is_EOL(ch) && ch !== 0);
	}
	while (ch !== 0) {
		readLineBreak(state);
		state.lineIndent = 0;
		ch = state.input.charCodeAt(state.position);
		while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
			state.lineIndent++;
			ch = state.input.charCodeAt(++state.position);
		}
		if (!detectedIndent && state.lineIndent > textIndent) textIndent = state.lineIndent;
		if (is_EOL(ch)) {
			emptyLines++;
			continue;
		}
		if (state.lineIndent < textIndent) {
			if (chomping === CHOMPING_KEEP) state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
			else if (chomping === CHOMPING_CLIP) {
				if (didReadContent) state.result += "\n";
			}
			break;
		}
		if (folding) if (is_WHITE_SPACE(ch)) {
			atMoreIndented = true;
			state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
		} else if (atMoreIndented) {
			atMoreIndented = false;
			state.result += common.repeat("\n", emptyLines + 1);
		} else if (emptyLines === 0) {
			if (didReadContent) state.result += " ";
		} else state.result += common.repeat("\n", emptyLines);
		else state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
		didReadContent = true;
		detectedIndent = true;
		emptyLines = 0;
		captureStart = state.position;
		while (!is_EOL(ch) && ch !== 0) ch = state.input.charCodeAt(++state.position);
		captureSegment(state, captureStart, state.position, false);
	}
	return true;
}
function readBlockSequence(state, nodeIndent) {
	var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
	if (state.firstTabInLine !== -1) return false;
	if (state.anchor !== null) state.anchorMap[state.anchor] = _result;
	ch = state.input.charCodeAt(state.position);
	while (ch !== 0) {
		if (state.firstTabInLine !== -1) {
			state.position = state.firstTabInLine;
			throwError(state, "tab characters must not be used in indentation");
		}
		if (ch !== 45) break;
		following = state.input.charCodeAt(state.position + 1);
		if (!is_WS_OR_EOL(following)) break;
		detected = true;
		state.position++;
		if (skipSeparationSpace(state, true, -1)) {
			if (state.lineIndent <= nodeIndent) {
				_result.push(null);
				ch = state.input.charCodeAt(state.position);
				continue;
			}
		}
		_line = state.line;
		composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
		_result.push(state.result);
		skipSeparationSpace(state, true, -1);
		ch = state.input.charCodeAt(state.position);
		if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) throwError(state, "bad indentation of a sequence entry");
		else if (state.lineIndent < nodeIndent) break;
	}
	if (detected) {
		state.tag = _tag;
		state.anchor = _anchor;
		state.kind = "sequence";
		state.result = _result;
		return true;
	}
	return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
	var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
	if (state.firstTabInLine !== -1) return false;
	if (state.anchor !== null) state.anchorMap[state.anchor] = _result;
	ch = state.input.charCodeAt(state.position);
	while (ch !== 0) {
		if (!atExplicitKey && state.firstTabInLine !== -1) {
			state.position = state.firstTabInLine;
			throwError(state, "tab characters must not be used in indentation");
		}
		following = state.input.charCodeAt(state.position + 1);
		_line = state.line;
		if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
			if (ch === 63) {
				if (atExplicitKey) {
					storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
					keyTag = keyNode = valueNode = null;
				}
				detected = true;
				atExplicitKey = true;
				allowCompact = true;
			} else if (atExplicitKey) {
				atExplicitKey = false;
				allowCompact = true;
			} else throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
			state.position += 1;
			ch = following;
		} else {
			_keyLine = state.line;
			_keyLineStart = state.lineStart;
			_keyPos = state.position;
			if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) break;
			if (state.line === _line) {
				ch = state.input.charCodeAt(state.position);
				while (is_WHITE_SPACE(ch)) ch = state.input.charCodeAt(++state.position);
				if (ch === 58) {
					ch = state.input.charCodeAt(++state.position);
					if (!is_WS_OR_EOL(ch)) throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
					if (atExplicitKey) {
						storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
						keyTag = keyNode = valueNode = null;
					}
					detected = true;
					atExplicitKey = false;
					allowCompact = false;
					keyTag = state.tag;
					keyNode = state.result;
				} else if (detected) throwError(state, "can not read an implicit mapping pair; a colon is missed");
				else {
					state.tag = _tag;
					state.anchor = _anchor;
					return true;
				}
			} else if (detected) throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
			else {
				state.tag = _tag;
				state.anchor = _anchor;
				return true;
			}
		}
		if (state.line === _line || state.lineIndent > nodeIndent) {
			if (atExplicitKey) {
				_keyLine = state.line;
				_keyLineStart = state.lineStart;
				_keyPos = state.position;
			}
			if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) if (atExplicitKey) keyNode = state.result;
			else valueNode = state.result;
			if (!atExplicitKey) {
				storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
				keyTag = keyNode = valueNode = null;
			}
			skipSeparationSpace(state, true, -1);
			ch = state.input.charCodeAt(state.position);
		}
		if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) throwError(state, "bad indentation of a mapping entry");
		else if (state.lineIndent < nodeIndent) break;
	}
	if (atExplicitKey) storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
	if (detected) {
		state.tag = _tag;
		state.anchor = _anchor;
		state.kind = "mapping";
		state.result = _result;
	}
	return detected;
}
function readTagProperty(state) {
	var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch = state.input.charCodeAt(state.position);
	if (ch !== 33) return false;
	if (state.tag !== null) throwError(state, "duplication of a tag property");
	ch = state.input.charCodeAt(++state.position);
	if (ch === 60) {
		isVerbatim = true;
		ch = state.input.charCodeAt(++state.position);
	} else if (ch === 33) {
		isNamed = true;
		tagHandle = "!!";
		ch = state.input.charCodeAt(++state.position);
	} else tagHandle = "!";
	_position = state.position;
	if (isVerbatim) {
		do
			ch = state.input.charCodeAt(++state.position);
		while (ch !== 0 && ch !== 62);
		if (state.position < state.length) {
			tagName = state.input.slice(_position, state.position);
			ch = state.input.charCodeAt(++state.position);
		} else throwError(state, "unexpected end of the stream within a verbatim tag");
	} else {
		while (ch !== 0 && !is_WS_OR_EOL(ch)) {
			if (ch === 33) if (!isNamed) {
				tagHandle = state.input.slice(_position - 1, state.position + 1);
				if (!PATTERN_TAG_HANDLE.test(tagHandle)) throwError(state, "named tag handle cannot contain such characters");
				isNamed = true;
				_position = state.position + 1;
			} else throwError(state, "tag suffix cannot contain exclamation marks");
			ch = state.input.charCodeAt(++state.position);
		}
		tagName = state.input.slice(_position, state.position);
		if (PATTERN_FLOW_INDICATORS.test(tagName)) throwError(state, "tag suffix cannot contain flow indicator characters");
	}
	if (tagName && !PATTERN_TAG_URI.test(tagName)) throwError(state, "tag name cannot contain such characters: " + tagName);
	try {
		tagName = decodeURIComponent(tagName);
	} catch (err) {
		throwError(state, "tag name is malformed: " + tagName);
	}
	if (isVerbatim) state.tag = tagName;
	else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) state.tag = state.tagMap[tagHandle] + tagName;
	else if (tagHandle === "!") state.tag = "!" + tagName;
	else if (tagHandle === "!!") state.tag = "tag:yaml.org,2002:" + tagName;
	else throwError(state, "undeclared tag handle \"" + tagHandle + "\"");
	return true;
}
function readAnchorProperty(state) {
	var _position, ch = state.input.charCodeAt(state.position);
	if (ch !== 38) return false;
	if (state.anchor !== null) throwError(state, "duplication of an anchor property");
	ch = state.input.charCodeAt(++state.position);
	_position = state.position;
	while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) ch = state.input.charCodeAt(++state.position);
	if (state.position === _position) throwError(state, "name of an anchor node must contain at least one character");
	state.anchor = state.input.slice(_position, state.position);
	return true;
}
function readAlias(state) {
	var _position, alias, ch = state.input.charCodeAt(state.position);
	if (ch !== 42) return false;
	ch = state.input.charCodeAt(++state.position);
	_position = state.position;
	while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) ch = state.input.charCodeAt(++state.position);
	if (state.position === _position) throwError(state, "name of an alias node must contain at least one character");
	alias = state.input.slice(_position, state.position);
	if (!_hasOwnProperty$1.call(state.anchorMap, alias)) throwError(state, "unidentified alias \"" + alias + "\"");
	state.result = state.anchorMap[alias];
	skipSeparationSpace(state, true, -1);
	return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
	var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type, flowIndent, blockIndent;
	if (state.listener !== null) state.listener("open", state);
	state.tag = null;
	state.anchor = null;
	state.kind = null;
	state.result = null;
	allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
	if (allowToSeek) {
		if (skipSeparationSpace(state, true, -1)) {
			atNewLine = true;
			if (state.lineIndent > parentIndent) indentStatus = 1;
			else if (state.lineIndent === parentIndent) indentStatus = 0;
			else if (state.lineIndent < parentIndent) indentStatus = -1;
		}
	}
	if (indentStatus === 1) while (readTagProperty(state) || readAnchorProperty(state)) if (skipSeparationSpace(state, true, -1)) {
		atNewLine = true;
		allowBlockCollections = allowBlockStyles;
		if (state.lineIndent > parentIndent) indentStatus = 1;
		else if (state.lineIndent === parentIndent) indentStatus = 0;
		else if (state.lineIndent < parentIndent) indentStatus = -1;
	} else allowBlockCollections = false;
	if (allowBlockCollections) allowBlockCollections = atNewLine || allowCompact;
	if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
		if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) flowIndent = parentIndent;
		else flowIndent = parentIndent + 1;
		blockIndent = state.position - state.lineStart;
		if (indentStatus === 1) if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) hasContent = true;
		else {
			if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) hasContent = true;
			else if (readAlias(state)) {
				hasContent = true;
				if (state.tag !== null || state.anchor !== null) throwError(state, "alias node should not have any properties");
			} else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
				hasContent = true;
				if (state.tag === null) state.tag = "?";
			}
			if (state.anchor !== null) state.anchorMap[state.anchor] = state.result;
		}
		else if (indentStatus === 0) hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
	}
	if (state.tag === null) {
		if (state.anchor !== null) state.anchorMap[state.anchor] = state.result;
	} else if (state.tag === "?") {
		if (state.result !== null && state.kind !== "scalar") throwError(state, "unacceptable node kind for !<?> tag; it should be \"scalar\", not \"" + state.kind + "\"");
		for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
			type = state.implicitTypes[typeIndex];
			if (type.resolve(state.result)) {
				state.result = type.construct(state.result);
				state.tag = type.tag;
				if (state.anchor !== null) state.anchorMap[state.anchor] = state.result;
				break;
			}
		}
	} else if (state.tag !== "!") {
		if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) type = state.typeMap[state.kind || "fallback"][state.tag];
		else {
			type = null;
			typeList = state.typeMap.multi[state.kind || "fallback"];
			for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
				type = typeList[typeIndex];
				break;
			}
		}
		if (!type) throwError(state, "unknown tag !<" + state.tag + ">");
		if (state.result !== null && type.kind !== state.kind) throwError(state, "unacceptable node kind for !<" + state.tag + "> tag; it should be \"" + type.kind + "\", not \"" + state.kind + "\"");
		if (!type.resolve(state.result, state.tag)) throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
		else {
			state.result = type.construct(state.result, state.tag);
			if (state.anchor !== null) state.anchorMap[state.anchor] = state.result;
		}
	}
	if (state.listener !== null) state.listener("close", state);
	return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
	var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
	state.version = null;
	state.checkLineBreaks = state.legacy;
	state.tagMap = Object.create(null);
	state.anchorMap = Object.create(null);
	while ((ch = state.input.charCodeAt(state.position)) !== 0) {
		skipSeparationSpace(state, true, -1);
		ch = state.input.charCodeAt(state.position);
		if (state.lineIndent > 0 || ch !== 37) break;
		hasDirectives = true;
		ch = state.input.charCodeAt(++state.position);
		_position = state.position;
		while (ch !== 0 && !is_WS_OR_EOL(ch)) ch = state.input.charCodeAt(++state.position);
		directiveName = state.input.slice(_position, state.position);
		directiveArgs = [];
		if (directiveName.length < 1) throwError(state, "directive name must not be less than one character in length");
		while (ch !== 0) {
			while (is_WHITE_SPACE(ch)) ch = state.input.charCodeAt(++state.position);
			if (ch === 35) {
				do
					ch = state.input.charCodeAt(++state.position);
				while (ch !== 0 && !is_EOL(ch));
				break;
			}
			if (is_EOL(ch)) break;
			_position = state.position;
			while (ch !== 0 && !is_WS_OR_EOL(ch)) ch = state.input.charCodeAt(++state.position);
			directiveArgs.push(state.input.slice(_position, state.position));
		}
		if (ch !== 0) readLineBreak(state);
		if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) directiveHandlers[directiveName](state, directiveName, directiveArgs);
		else throwWarning(state, "unknown document directive \"" + directiveName + "\"");
	}
	skipSeparationSpace(state, true, -1);
	if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
		state.position += 3;
		skipSeparationSpace(state, true, -1);
	} else if (hasDirectives) throwError(state, "directives end mark is expected");
	composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
	skipSeparationSpace(state, true, -1);
	if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) throwWarning(state, "non-ASCII line breaks are interpreted as content");
	state.documents.push(state.result);
	if (state.position === state.lineStart && testDocumentSeparator(state)) {
		if (state.input.charCodeAt(state.position) === 46) {
			state.position += 3;
			skipSeparationSpace(state, true, -1);
		}
		return;
	}
	if (state.position < state.length - 1) throwError(state, "end of the stream or a document separator is expected");
	else return;
}
function loadDocuments(input, options) {
	input = String(input);
	options = options || {};
	if (input.length !== 0) {
		if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) input += "\n";
		if (input.charCodeAt(0) === 65279) input = input.slice(1);
	}
	var state = new State$1(input, options);
	var nullpos = input.indexOf("\0");
	if (nullpos !== -1) {
		state.position = nullpos;
		throwError(state, "null byte is not allowed in input");
	}
	state.input += "\0";
	while (state.input.charCodeAt(state.position) === 32) {
		state.lineIndent += 1;
		state.position += 1;
	}
	while (state.position < state.length - 1) readDocument(state);
	return state.documents;
}
function loadAll$1(input, iterator, options) {
	if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
		options = iterator;
		iterator = null;
	}
	var documents = loadDocuments(input, options);
	if (typeof iterator !== "function") return documents;
	for (var index = 0, length = documents.length; index < length; index += 1) iterator(documents[index]);
}
function load$1(input, options) {
	var documents = loadDocuments(input, options);
	if (documents.length === 0) return;
	else if (documents.length === 1) return documents[0];
	throw new exception("expected a single document in the stream, but found more");
}
var loader = {
	loadAll: loadAll$1,
	load: load$1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = "\\\"";
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
	"y",
	"Y",
	"yes",
	"Yes",
	"YES",
	"on",
	"On",
	"ON",
	"n",
	"N",
	"no",
	"No",
	"NO",
	"off",
	"Off",
	"OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema, map) {
	var result, keys, index, length, tag, style, type;
	if (map === null) return {};
	result = {};
	keys = Object.keys(map);
	for (index = 0, length = keys.length; index < length; index += 1) {
		tag = keys[index];
		style = String(map[tag]);
		if (tag.slice(0, 2) === "!!") tag = "tag:yaml.org,2002:" + tag.slice(2);
		type = schema.compiledTypeMap["fallback"][tag];
		if (type && _hasOwnProperty.call(type.styleAliases, style)) style = type.styleAliases[style];
		result[tag] = style;
	}
	return result;
}
function encodeHex(character) {
	var string = character.toString(16).toUpperCase(), handle, length;
	if (character <= 255) {
		handle = "x";
		length = 2;
	} else if (character <= 65535) {
		handle = "u";
		length = 4;
	} else if (character <= 4294967295) {
		handle = "U";
		length = 8;
	} else throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
	return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1, QUOTING_TYPE_DOUBLE = 2;
function State$2(options) {
	this.schema = options["schema"] || _default;
	this.indent = Math.max(1, options["indent"] || 2);
	this.noArrayIndent = options["noArrayIndent"] || false;
	this.skipInvalid = options["skipInvalid"] || false;
	this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
	this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
	this.sortKeys = options["sortKeys"] || false;
	this.lineWidth = options["lineWidth"] || 80;
	this.noRefs = options["noRefs"] || false;
	this.noCompatMode = options["noCompatMode"] || false;
	this.condenseFlow = options["condenseFlow"] || false;
	this.quotingType = options["quotingType"] === "\"" ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
	this.forceQuotes = options["forceQuotes"] || false;
	this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
	this.implicitTypes = this.schema.compiledImplicit;
	this.explicitTypes = this.schema.compiledExplicit;
	this.tag = null;
	this.result = "";
	this.duplicates = [];
	this.usedDuplicates = null;
}
function indentString(string, spaces) {
	var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
	while (position < length) {
		next = string.indexOf("\n", position);
		if (next === -1) {
			line = string.slice(position);
			position = length;
		} else {
			line = string.slice(position, next + 1);
			position = next + 1;
		}
		if (line.length && line !== "\n") result += ind;
		result += line;
	}
	return result;
}
function generateNextLine(state, level) {
	return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str) {
	var index, length, type;
	for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
		type = state.implicitTypes[index];
		if (type.resolve(str)) return true;
	}
	return false;
}
function isWhitespace(c) {
	return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
	return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
	return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
	var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
	var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
	return (inblock ? cIsNsCharOrWhitespace : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar;
}
function isPlainSafeFirst(c) {
	return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
	return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
	var first = string.charCodeAt(pos), second;
	if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
		second = string.charCodeAt(pos + 1);
		if (second >= 56320 && second <= 57343) return (first - 55296) * 1024 + second - 56320 + 65536;
	}
	return first;
}
function needIndentIndicator(string) {
	return /^\n* /.test(string);
}
var STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
	var i;
	var char = 0;
	var prevChar = null;
	var hasLineBreak = false;
	var hasFoldableLine = false;
	var shouldTrackWidth = lineWidth !== -1;
	var previousLineBreak = -1;
	var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
	if (singleLineOnly || forceQuotes) for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
		char = codePointAt(string, i);
		if (!isPrintable(char)) return STYLE_DOUBLE;
		plain = plain && isPlainSafe(char, prevChar, inblock);
		prevChar = char;
	}
	else {
		for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
			char = codePointAt(string, i);
			if (char === CHAR_LINE_FEED) {
				hasLineBreak = true;
				if (shouldTrackWidth) {
					hasFoldableLine = hasFoldableLine || i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
					previousLineBreak = i;
				}
			} else if (!isPrintable(char)) return STYLE_DOUBLE;
			plain = plain && isPlainSafe(char, prevChar, inblock);
			prevChar = char;
		}
		hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
	}
	if (!hasLineBreak && !hasFoldableLine) {
		if (plain && !forceQuotes && !testAmbiguousType(string)) return STYLE_PLAIN;
		return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
	}
	if (indentPerLevel > 9 && needIndentIndicator(string)) return STYLE_DOUBLE;
	if (!forceQuotes) return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
	return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
	state.dump = function() {
		if (string.length === 0) return state.quotingType === QUOTING_TYPE_DOUBLE ? "\"\"" : "''";
		if (!state.noCompatMode) {
			if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) return state.quotingType === QUOTING_TYPE_DOUBLE ? "\"" + string + "\"" : "'" + string + "'";
		}
		var indent = state.indent * Math.max(1, level);
		var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
		var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
		function testAmbiguity(string) {
			return testImplicitResolving(state, string);
		}
		switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
			case STYLE_PLAIN: return string;
			case STYLE_SINGLE: return "'" + string.replace(/'/g, "''") + "'";
			case STYLE_LITERAL: return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
			case STYLE_FOLDED: return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
			case STYLE_DOUBLE: return "\"" + escapeString(string) + "\"";
			default: throw new exception("impossible error: invalid scalar style");
		}
	}();
}
function blockHeader(string, indentPerLevel) {
	var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
	var clip = string[string.length - 1] === "\n";
	return indentIndicator + (clip && (string[string.length - 2] === "\n" || string === "\n") ? "+" : clip ? "" : "-") + "\n";
}
function dropEndingNewline(string) {
	return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
	var lineRe = /(\n+)([^\n]*)/g;
	var result = function() {
		var nextLF = string.indexOf("\n");
		nextLF = nextLF !== -1 ? nextLF : string.length;
		lineRe.lastIndex = nextLF;
		return foldLine(string.slice(0, nextLF), width);
	}();
	var prevMoreIndented = string[0] === "\n" || string[0] === " ";
	var moreIndented;
	var match;
	while (match = lineRe.exec(string)) {
		var prefix = match[1], line = match[2];
		moreIndented = line[0] === " ";
		result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
		prevMoreIndented = moreIndented;
	}
	return result;
}
function foldLine(line, width) {
	if (line === "" || line[0] === " ") return line;
	var breakRe = / [^ ]/g;
	var match;
	var start = 0, end, curr = 0, next = 0;
	var result = "";
	while (match = breakRe.exec(line)) {
		next = match.index;
		if (next - start > width) {
			end = curr > start ? curr : next;
			result += "\n" + line.slice(start, end);
			start = end + 1;
		}
		curr = next;
	}
	result += "\n";
	if (line.length - start > width && curr > start) result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
	else result += line.slice(start);
	return result.slice(1);
}
function escapeString(string) {
	var result = "";
	var char = 0;
	var escapeSeq;
	for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
		char = codePointAt(string, i);
		escapeSeq = ESCAPE_SEQUENCES[char];
		if (!escapeSeq && isPrintable(char)) {
			result += string[i];
			if (char >= 65536) result += string[i + 1];
		} else result += escapeSeq || encodeHex(char);
	}
	return result;
}
function writeFlowSequence(state, level, object) {
	var _result = "", _tag = state.tag, index, length, value;
	for (index = 0, length = object.length; index < length; index += 1) {
		value = object[index];
		if (state.replacer) value = state.replacer.call(object, String(index), value);
		if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
			if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
			_result += state.dump;
		}
	}
	state.tag = _tag;
	state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
	var _result = "", _tag = state.tag, index, length, value;
	for (index = 0, length = object.length; index < length; index += 1) {
		value = object[index];
		if (state.replacer) value = state.replacer.call(object, String(index), value);
		if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
			if (!compact || _result !== "") _result += generateNextLine(state, level);
			if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) _result += "-";
			else _result += "- ";
			_result += state.dump;
		}
	}
	state.tag = _tag;
	state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
	var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
	for (index = 0, length = objectKeyList.length; index < length; index += 1) {
		pairBuffer = "";
		if (_result !== "") pairBuffer += ", ";
		if (state.condenseFlow) pairBuffer += "\"";
		objectKey = objectKeyList[index];
		objectValue = object[objectKey];
		if (state.replacer) objectValue = state.replacer.call(object, objectKey, objectValue);
		if (!writeNode(state, level, objectKey, false, false)) continue;
		if (state.dump.length > 1024) pairBuffer += "? ";
		pairBuffer += state.dump + (state.condenseFlow ? "\"" : "") + ":" + (state.condenseFlow ? "" : " ");
		if (!writeNode(state, level, objectValue, false, false)) continue;
		pairBuffer += state.dump;
		_result += pairBuffer;
	}
	state.tag = _tag;
	state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
	var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
	if (state.sortKeys === true) objectKeyList.sort();
	else if (typeof state.sortKeys === "function") objectKeyList.sort(state.sortKeys);
	else if (state.sortKeys) throw new exception("sortKeys must be a boolean or a function");
	for (index = 0, length = objectKeyList.length; index < length; index += 1) {
		pairBuffer = "";
		if (!compact || _result !== "") pairBuffer += generateNextLine(state, level);
		objectKey = objectKeyList[index];
		objectValue = object[objectKey];
		if (state.replacer) objectValue = state.replacer.call(object, objectKey, objectValue);
		if (!writeNode(state, level + 1, objectKey, true, true, true)) continue;
		explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
		if (explicitPair) if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) pairBuffer += "?";
		else pairBuffer += "? ";
		pairBuffer += state.dump;
		if (explicitPair) pairBuffer += generateNextLine(state, level);
		if (!writeNode(state, level + 1, objectValue, true, explicitPair)) continue;
		if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) pairBuffer += ":";
		else pairBuffer += ": ";
		pairBuffer += state.dump;
		_result += pairBuffer;
	}
	state.tag = _tag;
	state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
	var _result, typeList = explicit ? state.explicitTypes : state.implicitTypes, index, length, type, style;
	for (index = 0, length = typeList.length; index < length; index += 1) {
		type = typeList[index];
		if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === "object" && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
			if (explicit) if (type.multi && type.representName) state.tag = type.representName(object);
			else state.tag = type.tag;
			else state.tag = "?";
			if (type.represent) {
				style = state.styleMap[type.tag] || type.defaultStyle;
				if (_toString.call(type.represent) === "[object Function]") _result = type.represent(object, style);
				else if (_hasOwnProperty.call(type.represent, style)) _result = type.represent[style](object, style);
				else throw new exception("!<" + type.tag + "> tag resolver accepts not \"" + style + "\" style");
				state.dump = _result;
			}
			return true;
		}
	}
	return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
	state.tag = null;
	state.dump = object;
	if (!detectType(state, object, false)) detectType(state, object, true);
	var type = _toString.call(state.dump);
	var inblock = block;
	var tagStr;
	if (block) block = state.flowLevel < 0 || state.flowLevel > level;
	var objectOrArray = type === "[object Object]" || type === "[object Array]", duplicateIndex, duplicate;
	if (objectOrArray) {
		duplicateIndex = state.duplicates.indexOf(object);
		duplicate = duplicateIndex !== -1;
	}
	if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) compact = false;
	if (duplicate && state.usedDuplicates[duplicateIndex]) state.dump = "*ref_" + duplicateIndex;
	else {
		if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) state.usedDuplicates[duplicateIndex] = true;
		if (type === "[object Object]") if (block && Object.keys(state.dump).length !== 0) {
			writeBlockMapping(state, level, state.dump, compact);
			if (duplicate) state.dump = "&ref_" + duplicateIndex + state.dump;
		} else {
			writeFlowMapping(state, level, state.dump);
			if (duplicate) state.dump = "&ref_" + duplicateIndex + " " + state.dump;
		}
		else if (type === "[object Array]") if (block && state.dump.length !== 0) {
			if (state.noArrayIndent && !isblockseq && level > 0) writeBlockSequence(state, level - 1, state.dump, compact);
			else writeBlockSequence(state, level, state.dump, compact);
			if (duplicate) state.dump = "&ref_" + duplicateIndex + state.dump;
		} else {
			writeFlowSequence(state, level, state.dump);
			if (duplicate) state.dump = "&ref_" + duplicateIndex + " " + state.dump;
		}
		else if (type === "[object String]") {
			if (state.tag !== "?") writeScalar(state, state.dump, level, iskey, inblock);
		} else if (type === "[object Undefined]") return false;
		else {
			if (state.skipInvalid) return false;
			throw new exception("unacceptable kind of an object to dump " + type);
		}
		if (state.tag !== null && state.tag !== "?") {
			tagStr = encodeURI(state.tag[0] === "!" ? state.tag.slice(1) : state.tag).replace(/!/g, "%21");
			if (state.tag[0] === "!") tagStr = "!" + tagStr;
			else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") tagStr = "!!" + tagStr.slice(18);
			else tagStr = "!<" + tagStr + ">";
			state.dump = tagStr + " " + state.dump;
		}
	}
	return true;
}
function getDuplicateReferences(object, state) {
	var objects = [], duplicatesIndexes = [], index, length;
	inspectNode(object, objects, duplicatesIndexes);
	for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) state.duplicates.push(objects[duplicatesIndexes[index]]);
	state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
	var objectKeyList, index, length;
	if (object !== null && typeof object === "object") {
		index = objects.indexOf(object);
		if (index !== -1) {
			if (duplicatesIndexes.indexOf(index) === -1) duplicatesIndexes.push(index);
		} else {
			objects.push(object);
			if (Array.isArray(object)) for (index = 0, length = object.length; index < length; index += 1) inspectNode(object[index], objects, duplicatesIndexes);
			else {
				objectKeyList = Object.keys(object);
				for (index = 0, length = objectKeyList.length; index < length; index += 1) inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
			}
		}
	}
}
function dump$1(input, options) {
	options = options || {};
	var state = new State$2(options);
	if (!state.noRefs) getDuplicateReferences(input, state);
	var value = input;
	if (state.replacer) value = state.replacer.call({ "": value }, "", value);
	if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
	return "";
}
var dumper = { dump: dump$1 };
loader.load;
loader.loadAll;
dumper.dump;
//#endregion
//#region node_modules/lodash/isArray.js
var require_isArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = Array.isArray;
}));
//#endregion
//#region node_modules/lodash/_freeGlobal.js
var require__freeGlobal = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = typeof global == "object" && global && global.Object === Object && global;
}));
//#endregion
//#region node_modules/lodash/_root.js
var require__root = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var freeGlobal = require__freeGlobal();
	/** Detect free variable `self`. */
	var freeSelf = typeof self == "object" && self && self.Object === Object && self;
	module.exports = freeGlobal || freeSelf || Function("return this")();
}));
//#endregion
//#region node_modules/lodash/_Symbol.js
var require__Symbol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__root().Symbol;
}));
//#endregion
//#region node_modules/lodash/_getRawTag.js
var require__getRawTag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Symbol = require__Symbol();
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	/**
	* Used to resolve the
	* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	* of values.
	*/
	var nativeObjectToString = objectProto.toString;
	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
	/**
	* A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the raw `toStringTag`.
	*/
	function getRawTag(value) {
		var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
		try {
			value[symToStringTag] = void 0;
			var unmasked = true;
		} catch (e) {}
		var result = nativeObjectToString.call(value);
		if (unmasked) if (isOwn) value[symToStringTag] = tag;
		else delete value[symToStringTag];
		return result;
	}
	module.exports = getRawTag;
}));
//#endregion
//#region node_modules/lodash/_objectToString.js
var require__objectToString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Used to resolve the
	* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	* of values.
	*/
	var nativeObjectToString = Object.prototype.toString;
	/**
	* Converts `value` to a string using `Object.prototype.toString`.
	*
	* @private
	* @param {*} value The value to convert.
	* @returns {string} Returns the converted string.
	*/
	function objectToString(value) {
		return nativeObjectToString.call(value);
	}
	module.exports = objectToString;
}));
//#endregion
//#region node_modules/lodash/_baseGetTag.js
var require__baseGetTag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Symbol = require__Symbol(), getRawTag = require__getRawTag(), objectToString = require__objectToString();
	/** `Object#toString` result references. */
	var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
	/**
	* The base implementation of `getTag` without fallbacks for buggy environments.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the `toStringTag`.
	*/
	function baseGetTag(value) {
		if (value == null) return value === void 0 ? undefinedTag : nullTag;
		return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
	}
	module.exports = baseGetTag;
}));
//#endregion
//#region node_modules/lodash/isObjectLike.js
var require_isObjectLike = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if `value` is object-like. A value is object-like if it's not `null`
	* and has a `typeof` result of "object".
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	* @example
	*
	* _.isObjectLike({});
	* // => true
	*
	* _.isObjectLike([1, 2, 3]);
	* // => true
	*
	* _.isObjectLike(_.noop);
	* // => false
	*
	* _.isObjectLike(null);
	* // => false
	*/
	function isObjectLike(value) {
		return value != null && typeof value == "object";
	}
	module.exports = isObjectLike;
}));
//#endregion
//#region node_modules/lodash/isSymbol.js
var require_isSymbol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetTag = require__baseGetTag(), isObjectLike = require_isObjectLike();
	/** `Object#toString` result references. */
	var symbolTag = "[object Symbol]";
	/**
	* Checks if `value` is classified as a `Symbol` primitive or object.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	* @example
	*
	* _.isSymbol(Symbol.iterator);
	* // => true
	*
	* _.isSymbol('abc');
	* // => false
	*/
	function isSymbol(value) {
		return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
	}
	module.exports = isSymbol;
}));
//#endregion
//#region node_modules/lodash/_isKey.js
var require__isKey = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isArray = require_isArray(), isSymbol = require_isSymbol();
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
	/**
	* Checks if `value` is a property name and not a property path.
	*
	* @private
	* @param {*} value The value to check.
	* @param {Object} [object] The object to query keys on.
	* @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	*/
	function isKey(value, object) {
		if (isArray(value)) return false;
		var type = typeof value;
		if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) return true;
		return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
	}
	module.exports = isKey;
}));
//#endregion
//#region node_modules/lodash/isObject.js
var require_isObject = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if `value` is the
	* [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	* of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an object, else `false`.
	* @example
	*
	* _.isObject({});
	* // => true
	*
	* _.isObject([1, 2, 3]);
	* // => true
	*
	* _.isObject(_.noop);
	* // => true
	*
	* _.isObject(null);
	* // => false
	*/
	function isObject(value) {
		var type = typeof value;
		return value != null && (type == "object" || type == "function");
	}
	module.exports = isObject;
}));
//#endregion
//#region node_modules/lodash/isFunction.js
var require_isFunction = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetTag = require__baseGetTag(), isObject = require_isObject();
	/** `Object#toString` result references. */
	var asyncTag = "[object AsyncFunction]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
	/**
	* Checks if `value` is classified as a `Function` object.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a function, else `false`.
	* @example
	*
	* _.isFunction(_);
	* // => true
	*
	* _.isFunction(/abc/);
	* // => false
	*/
	function isFunction(value) {
		if (!isObject(value)) return false;
		var tag = baseGetTag(value);
		return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}
	module.exports = isFunction;
}));
//#endregion
//#region node_modules/lodash/_coreJsData.js
var require__coreJsData = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__root()["__core-js_shared__"];
}));
//#endregion
//#region node_modules/lodash/_isMasked.js
var require__isMasked = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var coreJsData = require__coreJsData();
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = function() {
		var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
		return uid ? "Symbol(src)_1." + uid : "";
	}();
	/**
	* Checks if `func` has its source masked.
	*
	* @private
	* @param {Function} func The function to check.
	* @returns {boolean} Returns `true` if `func` is masked, else `false`.
	*/
	function isMasked(func) {
		return !!maskSrcKey && maskSrcKey in func;
	}
	module.exports = isMasked;
}));
//#endregion
//#region node_modules/lodash/_toSource.js
var require__toSource = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;
	/**
	* Converts `func` to its source code.
	*
	* @private
	* @param {Function} func The function to convert.
	* @returns {string} Returns the source code.
	*/
	function toSource(func) {
		if (func != null) {
			try {
				return funcToString.call(func);
			} catch (e) {}
			try {
				return func + "";
			} catch (e) {}
		}
		return "";
	}
	module.exports = toSource;
}));
//#endregion
//#region node_modules/lodash/_baseIsNative.js
var require__baseIsNative = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isFunction = require_isFunction(), isMasked = require__isMasked(), isObject = require_isObject(), toSource = require__toSource();
	/**
	* Used to match `RegExp`
	* [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	*/
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	/** Used for built-in method references. */
	var funcProto = Function.prototype, objectProto = Object.prototype;
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	/** Used to detect if a method is native. */
	var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
	/**
	* The base implementation of `_.isNative` without bad shim checks.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a native function,
	*  else `false`.
	*/
	function baseIsNative(value) {
		if (!isObject(value) || isMasked(value)) return false;
		return (isFunction(value) ? reIsNative : reIsHostCtor).test(toSource(value));
	}
	module.exports = baseIsNative;
}));
//#endregion
//#region node_modules/lodash/_getValue.js
var require__getValue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Gets the value at `key` of `object`.
	*
	* @private
	* @param {Object} [object] The object to query.
	* @param {string} key The key of the property to get.
	* @returns {*} Returns the property value.
	*/
	function getValue(object, key) {
		return object == null ? void 0 : object[key];
	}
	module.exports = getValue;
}));
//#endregion
//#region node_modules/lodash/_getNative.js
var require__getNative = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsNative = require__baseIsNative(), getValue = require__getValue();
	/**
	* Gets the native function at `key` of `object`.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {string} key The key of the method to get.
	* @returns {*} Returns the function if it's native, else `undefined`.
	*/
	function getNative(object, key) {
		var value = getValue(object, key);
		return baseIsNative(value) ? value : void 0;
	}
	module.exports = getNative;
}));
//#endregion
//#region node_modules/lodash/_nativeCreate.js
var require__nativeCreate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(Object, "create");
}));
//#endregion
//#region node_modules/lodash/_hashClear.js
var require__hashClear = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var nativeCreate = require__nativeCreate();
	/**
	* Removes all key-value entries from the hash.
	*
	* @private
	* @name clear
	* @memberOf Hash
	*/
	function hashClear() {
		this.__data__ = nativeCreate ? nativeCreate(null) : {};
		this.size = 0;
	}
	module.exports = hashClear;
}));
//#endregion
//#region node_modules/lodash/_hashDelete.js
var require__hashDelete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Removes `key` and its value from the hash.
	*
	* @private
	* @name delete
	* @memberOf Hash
	* @param {Object} hash The hash to modify.
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function hashDelete(key) {
		var result = this.has(key) && delete this.__data__[key];
		this.size -= result ? 1 : 0;
		return result;
	}
	module.exports = hashDelete;
}));
//#endregion
//#region node_modules/lodash/_hashGet.js
var require__hashGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var nativeCreate = require__nativeCreate();
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = "__lodash_hash_undefined__";
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* Gets the hash value for `key`.
	*
	* @private
	* @name get
	* @memberOf Hash
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function hashGet(key) {
		var data = this.__data__;
		if (nativeCreate) {
			var result = data[key];
			return result === HASH_UNDEFINED ? void 0 : result;
		}
		return hasOwnProperty.call(data, key) ? data[key] : void 0;
	}
	module.exports = hashGet;
}));
//#endregion
//#region node_modules/lodash/_hashHas.js
var require__hashHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var nativeCreate = require__nativeCreate();
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* Checks if a hash value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf Hash
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function hashHas(key) {
		var data = this.__data__;
		return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
	}
	module.exports = hashHas;
}));
//#endregion
//#region node_modules/lodash/_hashSet.js
var require__hashSet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var nativeCreate = require__nativeCreate();
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = "__lodash_hash_undefined__";
	/**
	* Sets the hash `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf Hash
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the hash instance.
	*/
	function hashSet(key, value) {
		var data = this.__data__;
		this.size += this.has(key) ? 0 : 1;
		data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
		return this;
	}
	module.exports = hashSet;
}));
//#endregion
//#region node_modules/lodash/_Hash.js
var require__Hash = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var hashClear = require__hashClear(), hashDelete = require__hashDelete(), hashGet = require__hashGet(), hashHas = require__hashHas(), hashSet = require__hashSet();
	/**
	* Creates a hash object.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function Hash(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	Hash.prototype.clear = hashClear;
	Hash.prototype["delete"] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	module.exports = Hash;
}));
//#endregion
//#region node_modules/lodash/_listCacheClear.js
var require__listCacheClear = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Removes all key-value entries from the list cache.
	*
	* @private
	* @name clear
	* @memberOf ListCache
	*/
	function listCacheClear() {
		this.__data__ = [];
		this.size = 0;
	}
	module.exports = listCacheClear;
}));
//#endregion
//#region node_modules/lodash/eq.js
var require_eq$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Performs a
	* [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	* comparison between two values to determine if they are equivalent.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to compare.
	* @param {*} other The other value to compare.
	* @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	* @example
	*
	* var object = { 'a': 1 };
	* var other = { 'a': 1 };
	*
	* _.eq(object, object);
	* // => true
	*
	* _.eq(object, other);
	* // => false
	*
	* _.eq('a', 'a');
	* // => true
	*
	* _.eq('a', Object('a'));
	* // => false
	*
	* _.eq(NaN, NaN);
	* // => true
	*/
	function eq(value, other) {
		return value === other || value !== value && other !== other;
	}
	module.exports = eq;
}));
//#endregion
//#region node_modules/lodash/_assocIndexOf.js
var require__assocIndexOf = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var eq = require_eq$1();
	/**
	* Gets the index at which the `key` is found in `array` of key-value pairs.
	*
	* @private
	* @param {Array} array The array to inspect.
	* @param {*} key The key to search for.
	* @returns {number} Returns the index of the matched value, else `-1`.
	*/
	function assocIndexOf(array, key) {
		var length = array.length;
		while (length--) if (eq(array[length][0], key)) return length;
		return -1;
	}
	module.exports = assocIndexOf;
}));
//#endregion
//#region node_modules/lodash/_listCacheDelete.js
var require__listCacheDelete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assocIndexOf = require__assocIndexOf();
	/** Built-in value references. */
	var splice = Array.prototype.splice;
	/**
	* Removes `key` and its value from the list cache.
	*
	* @private
	* @name delete
	* @memberOf ListCache
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function listCacheDelete(key) {
		var data = this.__data__, index = assocIndexOf(data, key);
		if (index < 0) return false;
		if (index == data.length - 1) data.pop();
		else splice.call(data, index, 1);
		--this.size;
		return true;
	}
	module.exports = listCacheDelete;
}));
//#endregion
//#region node_modules/lodash/_listCacheGet.js
var require__listCacheGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assocIndexOf = require__assocIndexOf();
	/**
	* Gets the list cache value for `key`.
	*
	* @private
	* @name get
	* @memberOf ListCache
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function listCacheGet(key) {
		var data = this.__data__, index = assocIndexOf(data, key);
		return index < 0 ? void 0 : data[index][1];
	}
	module.exports = listCacheGet;
}));
//#endregion
//#region node_modules/lodash/_listCacheHas.js
var require__listCacheHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assocIndexOf = require__assocIndexOf();
	/**
	* Checks if a list cache value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf ListCache
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function listCacheHas(key) {
		return assocIndexOf(this.__data__, key) > -1;
	}
	module.exports = listCacheHas;
}));
//#endregion
//#region node_modules/lodash/_listCacheSet.js
var require__listCacheSet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assocIndexOf = require__assocIndexOf();
	/**
	* Sets the list cache `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf ListCache
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the list cache instance.
	*/
	function listCacheSet(key, value) {
		var data = this.__data__, index = assocIndexOf(data, key);
		if (index < 0) {
			++this.size;
			data.push([key, value]);
		} else data[index][1] = value;
		return this;
	}
	module.exports = listCacheSet;
}));
//#endregion
//#region node_modules/lodash/_ListCache.js
var require__ListCache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var listCacheClear = require__listCacheClear(), listCacheDelete = require__listCacheDelete(), listCacheGet = require__listCacheGet(), listCacheHas = require__listCacheHas(), listCacheSet = require__listCacheSet();
	/**
	* Creates an list cache object.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function ListCache(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype["delete"] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	module.exports = ListCache;
}));
//#endregion
//#region node_modules/lodash/_Map.js
var require__Map = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(require__root(), "Map");
}));
//#endregion
//#region node_modules/lodash/_mapCacheClear.js
var require__mapCacheClear = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Hash = require__Hash(), ListCache = require__ListCache(), Map = require__Map();
	/**
	* Removes all key-value entries from the map.
	*
	* @private
	* @name clear
	* @memberOf MapCache
	*/
	function mapCacheClear() {
		this.size = 0;
		this.__data__ = {
			"hash": new Hash(),
			"map": new (Map || ListCache)(),
			"string": new Hash()
		};
	}
	module.exports = mapCacheClear;
}));
//#endregion
//#region node_modules/lodash/_isKeyable.js
var require__isKeyable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if `value` is suitable for use as unique object key.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	*/
	function isKeyable(value) {
		var type = typeof value;
		return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
	}
	module.exports = isKeyable;
}));
//#endregion
//#region node_modules/lodash/_getMapData.js
var require__getMapData = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isKeyable = require__isKeyable();
	/**
	* Gets the data for `map`.
	*
	* @private
	* @param {Object} map The map to query.
	* @param {string} key The reference key.
	* @returns {*} Returns the map data.
	*/
	function getMapData(map, key) {
		var data = map.__data__;
		return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
	}
	module.exports = getMapData;
}));
//#endregion
//#region node_modules/lodash/_mapCacheDelete.js
var require__mapCacheDelete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getMapData = require__getMapData();
	/**
	* Removes `key` and its value from the map.
	*
	* @private
	* @name delete
	* @memberOf MapCache
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function mapCacheDelete(key) {
		var result = getMapData(this, key)["delete"](key);
		this.size -= result ? 1 : 0;
		return result;
	}
	module.exports = mapCacheDelete;
}));
//#endregion
//#region node_modules/lodash/_mapCacheGet.js
var require__mapCacheGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getMapData = require__getMapData();
	/**
	* Gets the map value for `key`.
	*
	* @private
	* @name get
	* @memberOf MapCache
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function mapCacheGet(key) {
		return getMapData(this, key).get(key);
	}
	module.exports = mapCacheGet;
}));
//#endregion
//#region node_modules/lodash/_mapCacheHas.js
var require__mapCacheHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getMapData = require__getMapData();
	/**
	* Checks if a map value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf MapCache
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function mapCacheHas(key) {
		return getMapData(this, key).has(key);
	}
	module.exports = mapCacheHas;
}));
//#endregion
//#region node_modules/lodash/_mapCacheSet.js
var require__mapCacheSet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getMapData = require__getMapData();
	/**
	* Sets the map `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf MapCache
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the map cache instance.
	*/
	function mapCacheSet(key, value) {
		var data = getMapData(this, key), size = data.size;
		data.set(key, value);
		this.size += data.size == size ? 0 : 1;
		return this;
	}
	module.exports = mapCacheSet;
}));
//#endregion
//#region node_modules/lodash/_MapCache.js
var require__MapCache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var mapCacheClear = require__mapCacheClear(), mapCacheDelete = require__mapCacheDelete(), mapCacheGet = require__mapCacheGet(), mapCacheHas = require__mapCacheHas(), mapCacheSet = require__mapCacheSet();
	/**
	* Creates a map cache object to store key-value pairs.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function MapCache(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype["delete"] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	module.exports = MapCache;
}));
//#endregion
//#region node_modules/lodash/memoize.js
var require_memoize = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var MapCache = require__MapCache();
	/** Error message constants. */
	var FUNC_ERROR_TEXT = "Expected a function";
	/**
	* Creates a function that memoizes the result of `func`. If `resolver` is
	* provided, it determines the cache key for storing the result based on the
	* arguments provided to the memoized function. By default, the first argument
	* provided to the memoized function is used as the map cache key. The `func`
	* is invoked with the `this` binding of the memoized function.
	*
	* **Note:** The cache is exposed as the `cache` property on the memoized
	* function. Its creation may be customized by replacing the `_.memoize.Cache`
	* constructor with one whose instances implement the
	* [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	* method interface of `clear`, `delete`, `get`, `has`, and `set`.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Function
	* @param {Function} func The function to have its output memoized.
	* @param {Function} [resolver] The function to resolve the cache key.
	* @returns {Function} Returns the new memoized function.
	* @example
	*
	* var object = { 'a': 1, 'b': 2 };
	* var other = { 'c': 3, 'd': 4 };
	*
	* var values = _.memoize(_.values);
	* values(object);
	* // => [1, 2]
	*
	* values(other);
	* // => [3, 4]
	*
	* object.a = 2;
	* values(object);
	* // => [1, 2]
	*
	* // Modify the result cache.
	* values.cache.set(object, ['a', 'b']);
	* values(object);
	* // => ['a', 'b']
	*
	* // Replace `_.memoize.Cache`.
	* _.memoize.Cache = WeakMap;
	*/
	function memoize(func, resolver) {
		if (typeof func != "function" || resolver != null && typeof resolver != "function") throw new TypeError(FUNC_ERROR_TEXT);
		var memoized = function() {
			var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
			if (cache.has(key)) return cache.get(key);
			var result = func.apply(this, args);
			memoized.cache = cache.set(key, result) || cache;
			return result;
		};
		memoized.cache = new (memoize.Cache || MapCache)();
		return memoized;
	}
	memoize.Cache = MapCache;
	module.exports = memoize;
}));
//#endregion
//#region node_modules/lodash/_memoizeCapped.js
var require__memoizeCapped = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var memoize = require_memoize();
	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;
	/**
	* A specialized version of `_.memoize` which clears the memoized function's
	* cache when it exceeds `MAX_MEMOIZE_SIZE`.
	*
	* @private
	* @param {Function} func The function to have its output memoized.
	* @returns {Function} Returns the new memoized function.
	*/
	function memoizeCapped(func) {
		var result = memoize(func, function(key) {
			if (cache.size === MAX_MEMOIZE_SIZE) cache.clear();
			return key;
		});
		var cache = result.cache;
		return result;
	}
	module.exports = memoizeCapped;
}));
//#endregion
//#region node_modules/lodash/_stringToPath.js
var require__stringToPath = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var memoizeCapped = require__memoizeCapped();
	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	module.exports = memoizeCapped(function(string) {
		var result = [];
		if (string.charCodeAt(0) === 46) result.push("");
		string.replace(rePropName, function(match, number, quote, subString) {
			result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
		});
		return result;
	});
}));
//#endregion
//#region node_modules/lodash/_arrayMap.js
var require__arrayMap = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A specialized version of `_.map` for arrays without support for iteratee
	* shorthands.
	*
	* @private
	* @param {Array} [array] The array to iterate over.
	* @param {Function} iteratee The function invoked per iteration.
	* @returns {Array} Returns the new mapped array.
	*/
	function arrayMap(array, iteratee) {
		var index = -1, length = array == null ? 0 : array.length, result = Array(length);
		while (++index < length) result[index] = iteratee(array[index], index, array);
		return result;
	}
	module.exports = arrayMap;
}));
//#endregion
//#region node_modules/lodash/_baseToString.js
var require__baseToString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Symbol = require__Symbol(), arrayMap = require__arrayMap(), isArray = require_isArray(), isSymbol = require_isSymbol();
	/** Used as references for various `Number` constants. */
	var INFINITY = Infinity;
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
	/**
	* The base implementation of `_.toString` which doesn't convert nullish
	* values to empty strings.
	*
	* @private
	* @param {*} value The value to process.
	* @returns {string} Returns the string.
	*/
	function baseToString(value) {
		if (typeof value == "string") return value;
		if (isArray(value)) return arrayMap(value, baseToString) + "";
		if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : "";
		var result = value + "";
		return result == "0" && 1 / value == -INFINITY ? "-0" : result;
	}
	module.exports = baseToString;
}));
//#endregion
//#region node_modules/lodash/toString.js
var require_toString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseToString = require__baseToString();
	/**
	* Converts `value` to a string. An empty string is returned for `null`
	* and `undefined` values. The sign of `-0` is preserved.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to convert.
	* @returns {string} Returns the converted string.
	* @example
	*
	* _.toString(null);
	* // => ''
	*
	* _.toString(-0);
	* // => '-0'
	*
	* _.toString([1, 2, 3]);
	* // => '1,2,3'
	*/
	function toString(value) {
		return value == null ? "" : baseToString(value);
	}
	module.exports = toString;
}));
//#endregion
//#region node_modules/lodash/_castPath.js
var require__castPath = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isArray = require_isArray(), isKey = require__isKey(), stringToPath = require__stringToPath(), toString = require_toString();
	/**
	* Casts `value` to a path array if it's not one.
	*
	* @private
	* @param {*} value The value to inspect.
	* @param {Object} [object] The object to query keys on.
	* @returns {Array} Returns the cast property path array.
	*/
	function castPath(value, object) {
		if (isArray(value)) return value;
		return isKey(value, object) ? [value] : stringToPath(toString(value));
	}
	module.exports = castPath;
}));
//#endregion
//#region node_modules/lodash/_toKey.js
var require__toKey = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isSymbol = require_isSymbol();
	/** Used as references for various `Number` constants. */
	var INFINITY = Infinity;
	/**
	* Converts `value` to a string key if it's not a string or symbol.
	*
	* @private
	* @param {*} value The value to inspect.
	* @returns {string|symbol} Returns the key.
	*/
	function toKey(value) {
		if (typeof value == "string" || isSymbol(value)) return value;
		var result = value + "";
		return result == "0" && 1 / value == -INFINITY ? "-0" : result;
	}
	module.exports = toKey;
}));
//#endregion
//#region node_modules/lodash/_baseGet.js
var require__baseGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var castPath = require__castPath(), toKey = require__toKey();
	/**
	* The base implementation of `_.get` without support for default values.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {Array|string} path The path of the property to get.
	* @returns {*} Returns the resolved value.
	*/
	function baseGet(object, path) {
		path = castPath(path, object);
		var index = 0, length = path.length;
		while (object != null && index < length) object = object[toKey(path[index++])];
		return index && index == length ? object : void 0;
	}
	module.exports = baseGet;
}));
//#endregion
//#region node_modules/lodash/get.js
var require_get = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGet = require__baseGet();
	/**
	* Gets the value at `path` of `object`. If the resolved value is
	* `undefined`, the `defaultValue` is returned in its place.
	*
	* @static
	* @memberOf _
	* @since 3.7.0
	* @category Object
	* @param {Object} object The object to query.
	* @param {Array|string} path The path of the property to get.
	* @param {*} [defaultValue] The value returned for `undefined` resolved values.
	* @returns {*} Returns the resolved value.
	* @example
	*
	* var object = { 'a': [{ 'b': { 'c': 3 } }] };
	*
	* _.get(object, 'a[0].b.c');
	* // => 3
	*
	* _.get(object, ['a', '0', 'b', 'c']);
	* // => 3
	*
	* _.get(object, 'a.b.c', 'default');
	* // => 'default'
	*/
	function get(object, path, defaultValue) {
		var result = object == null ? void 0 : baseGet(object, path);
		return result === void 0 ? defaultValue : result;
	}
	module.exports = get;
}));
//#endregion
//#region node_modules/lodash/_stackClear.js
var require__stackClear = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ListCache = require__ListCache();
	/**
	* Removes all key-value entries from the stack.
	*
	* @private
	* @name clear
	* @memberOf Stack
	*/
	function stackClear() {
		this.__data__ = new ListCache();
		this.size = 0;
	}
	module.exports = stackClear;
}));
//#endregion
//#region node_modules/lodash/_stackDelete.js
var require__stackDelete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Removes `key` and its value from the stack.
	*
	* @private
	* @name delete
	* @memberOf Stack
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function stackDelete(key) {
		var data = this.__data__, result = data["delete"](key);
		this.size = data.size;
		return result;
	}
	module.exports = stackDelete;
}));
//#endregion
//#region node_modules/lodash/_stackGet.js
var require__stackGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Gets the stack value for `key`.
	*
	* @private
	* @name get
	* @memberOf Stack
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function stackGet(key) {
		return this.__data__.get(key);
	}
	module.exports = stackGet;
}));
//#endregion
//#region node_modules/lodash/_stackHas.js
var require__stackHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if a stack value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf Stack
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function stackHas(key) {
		return this.__data__.has(key);
	}
	module.exports = stackHas;
}));
//#endregion
//#region node_modules/lodash/_stackSet.js
var require__stackSet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ListCache = require__ListCache(), Map = require__Map(), MapCache = require__MapCache();
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	/**
	* Sets the stack `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf Stack
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the stack cache instance.
	*/
	function stackSet(key, value) {
		var data = this.__data__;
		if (data instanceof ListCache) {
			var pairs = data.__data__;
			if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
				pairs.push([key, value]);
				this.size = ++data.size;
				return this;
			}
			data = this.__data__ = new MapCache(pairs);
		}
		data.set(key, value);
		this.size = data.size;
		return this;
	}
	module.exports = stackSet;
}));
//#endregion
//#region node_modules/lodash/_Stack.js
var require__Stack = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ListCache = require__ListCache(), stackClear = require__stackClear(), stackDelete = require__stackDelete(), stackGet = require__stackGet(), stackHas = require__stackHas(), stackSet = require__stackSet();
	/**
	* Creates a stack cache object to store key-value pairs.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function Stack(entries) {
		var data = this.__data__ = new ListCache(entries);
		this.size = data.size;
	}
	Stack.prototype.clear = stackClear;
	Stack.prototype["delete"] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;
	module.exports = Stack;
}));
//#endregion
//#region node_modules/lodash/_setCacheAdd.js
var require__setCacheAdd = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = "__lodash_hash_undefined__";
	/**
	* Adds `value` to the array cache.
	*
	* @private
	* @name add
	* @memberOf SetCache
	* @alias push
	* @param {*} value The value to cache.
	* @returns {Object} Returns the cache instance.
	*/
	function setCacheAdd(value) {
		this.__data__.set(value, HASH_UNDEFINED);
		return this;
	}
	module.exports = setCacheAdd;
}));
//#endregion
//#region node_modules/lodash/_setCacheHas.js
var require__setCacheHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if `value` is in the array cache.
	*
	* @private
	* @name has
	* @memberOf SetCache
	* @param {*} value The value to search for.
	* @returns {boolean} Returns `true` if `value` is found, else `false`.
	*/
	function setCacheHas(value) {
		return this.__data__.has(value);
	}
	module.exports = setCacheHas;
}));
//#endregion
//#region node_modules/lodash/_SetCache.js
var require__SetCache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var MapCache = require__MapCache(), setCacheAdd = require__setCacheAdd(), setCacheHas = require__setCacheHas();
	/**
	*
	* Creates an array cache object to store unique values.
	*
	* @private
	* @constructor
	* @param {Array} [values] The values to cache.
	*/
	function SetCache(values) {
		var index = -1, length = values == null ? 0 : values.length;
		this.__data__ = new MapCache();
		while (++index < length) this.add(values[index]);
	}
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;
	module.exports = SetCache;
}));
//#endregion
//#region node_modules/lodash/_arraySome.js
var require__arraySome = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A specialized version of `_.some` for arrays without support for iteratee
	* shorthands.
	*
	* @private
	* @param {Array} [array] The array to iterate over.
	* @param {Function} predicate The function invoked per iteration.
	* @returns {boolean} Returns `true` if any element passes the predicate check,
	*  else `false`.
	*/
	function arraySome(array, predicate) {
		var index = -1, length = array == null ? 0 : array.length;
		while (++index < length) if (predicate(array[index], index, array)) return true;
		return false;
	}
	module.exports = arraySome;
}));
//#endregion
//#region node_modules/lodash/_cacheHas.js
var require__cacheHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if a `cache` value for `key` exists.
	*
	* @private
	* @param {Object} cache The cache to query.
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function cacheHas(cache, key) {
		return cache.has(key);
	}
	module.exports = cacheHas;
}));
//#endregion
//#region node_modules/lodash/_equalArrays.js
var require__equalArrays = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SetCache = require__SetCache(), arraySome = require__arraySome(), cacheHas = require__cacheHas();
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
	/**
	* A specialized version of `baseIsEqualDeep` for arrays with support for
	* partial deep comparisons.
	*
	* @private
	* @param {Array} array The array to compare.
	* @param {Array} other The other array to compare.
	* @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	* @param {Function} customizer The function to customize comparisons.
	* @param {Function} equalFunc The function to determine equivalents of values.
	* @param {Object} stack Tracks traversed `array` and `other` objects.
	* @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	*/
	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
		var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
		if (arrLength != othLength && !(isPartial && othLength > arrLength)) return false;
		var arrStacked = stack.get(array);
		var othStacked = stack.get(other);
		if (arrStacked && othStacked) return arrStacked == other && othStacked == array;
		var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
		stack.set(array, other);
		stack.set(other, array);
		while (++index < arrLength) {
			var arrValue = array[index], othValue = other[index];
			if (customizer) var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
			if (compared !== void 0) {
				if (compared) continue;
				result = false;
				break;
			}
			if (seen) {
				if (!arraySome(other, function(othValue, othIndex) {
					if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) return seen.push(othIndex);
				})) {
					result = false;
					break;
				}
			} else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
				result = false;
				break;
			}
		}
		stack["delete"](array);
		stack["delete"](other);
		return result;
	}
	module.exports = equalArrays;
}));
//#endregion
//#region node_modules/lodash/_Uint8Array.js
var require__Uint8Array = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__root().Uint8Array;
}));
//#endregion
//#region node_modules/lodash/_mapToArray.js
var require__mapToArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Converts `map` to its key-value pairs.
	*
	* @private
	* @param {Object} map The map to convert.
	* @returns {Array} Returns the key-value pairs.
	*/
	function mapToArray(map) {
		var index = -1, result = Array(map.size);
		map.forEach(function(value, key) {
			result[++index] = [key, value];
		});
		return result;
	}
	module.exports = mapToArray;
}));
//#endregion
//#region node_modules/lodash/_setToArray.js
var require__setToArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Converts `set` to an array of its values.
	*
	* @private
	* @param {Object} set The set to convert.
	* @returns {Array} Returns the values.
	*/
	function setToArray(set) {
		var index = -1, result = Array(set.size);
		set.forEach(function(value) {
			result[++index] = value;
		});
		return result;
	}
	module.exports = setToArray;
}));
//#endregion
//#region node_modules/lodash/_equalByTag.js
var require__equalByTag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Symbol = require__Symbol(), Uint8Array = require__Uint8Array(), eq = require_eq$1(), equalArrays = require__equalArrays(), mapToArray = require__mapToArray(), setToArray = require__setToArray();
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
	/** `Object#toString` result references. */
	var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
	var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
	/**
	* A specialized version of `baseIsEqualDeep` for comparing objects of
	* the same `toStringTag`.
	*
	* **Note:** This function only supports comparing values with tags of
	* `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	*
	* @private
	* @param {Object} object The object to compare.
	* @param {Object} other The other object to compare.
	* @param {string} tag The `toStringTag` of the objects to compare.
	* @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	* @param {Function} customizer The function to customize comparisons.
	* @param {Function} equalFunc The function to determine equivalents of values.
	* @param {Object} stack Tracks traversed `object` and `other` objects.
	* @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	*/
	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
		switch (tag) {
			case dataViewTag:
				if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) return false;
				object = object.buffer;
				other = other.buffer;
			case arrayBufferTag:
				if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) return false;
				return true;
			case boolTag:
			case dateTag:
			case numberTag: return eq(+object, +other);
			case errorTag: return object.name == other.name && object.message == other.message;
			case regexpTag:
			case stringTag: return object == other + "";
			case mapTag: var convert = mapToArray;
			case setTag:
				var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
				convert || (convert = setToArray);
				if (object.size != other.size && !isPartial) return false;
				var stacked = stack.get(object);
				if (stacked) return stacked == other;
				bitmask |= COMPARE_UNORDERED_FLAG;
				stack.set(object, other);
				var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
				stack["delete"](object);
				return result;
			case symbolTag: if (symbolValueOf) return symbolValueOf.call(object) == symbolValueOf.call(other);
		}
		return false;
	}
	module.exports = equalByTag;
}));
//#endregion
//#region node_modules/lodash/_arrayPush.js
var require__arrayPush = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Appends the elements of `values` to `array`.
	*
	* @private
	* @param {Array} array The array to modify.
	* @param {Array} values The values to append.
	* @returns {Array} Returns `array`.
	*/
	function arrayPush(array, values) {
		var index = -1, length = values.length, offset = array.length;
		while (++index < length) array[offset + index] = values[index];
		return array;
	}
	module.exports = arrayPush;
}));
//#endregion
//#region node_modules/lodash/_baseGetAllKeys.js
var require__baseGetAllKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayPush = require__arrayPush(), isArray = require_isArray();
	/**
	* The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	* `keysFunc` and `symbolsFunc` to get the enumerable property names and
	* symbols of `object`.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {Function} keysFunc The function to get the keys of `object`.
	* @param {Function} symbolsFunc The function to get the symbols of `object`.
	* @returns {Array} Returns the array of property names and symbols.
	*/
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
		var result = keysFunc(object);
		return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}
	module.exports = baseGetAllKeys;
}));
//#endregion
//#region node_modules/lodash/_arrayFilter.js
var require__arrayFilter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A specialized version of `_.filter` for arrays without support for
	* iteratee shorthands.
	*
	* @private
	* @param {Array} [array] The array to iterate over.
	* @param {Function} predicate The function invoked per iteration.
	* @returns {Array} Returns the new filtered array.
	*/
	function arrayFilter(array, predicate) {
		var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
		while (++index < length) {
			var value = array[index];
			if (predicate(value, index, array)) result[resIndex++] = value;
		}
		return result;
	}
	module.exports = arrayFilter;
}));
//#endregion
//#region node_modules/lodash/stubArray.js
var require_stubArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This method returns a new empty array.
	*
	* @static
	* @memberOf _
	* @since 4.13.0
	* @category Util
	* @returns {Array} Returns the new empty array.
	* @example
	*
	* var arrays = _.times(2, _.stubArray);
	*
	* console.log(arrays);
	* // => [[], []]
	*
	* console.log(arrays[0] === arrays[1]);
	* // => false
	*/
	function stubArray() {
		return [];
	}
	module.exports = stubArray;
}));
//#endregion
//#region node_modules/lodash/_getSymbols.js
var require__getSymbols = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayFilter = require__arrayFilter(), stubArray = require_stubArray();
	/** Built-in value references. */
	var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
	var nativeGetSymbols = Object.getOwnPropertySymbols;
	module.exports = !nativeGetSymbols ? stubArray : function(object) {
		if (object == null) return [];
		object = Object(object);
		return arrayFilter(nativeGetSymbols(object), function(symbol) {
			return propertyIsEnumerable.call(object, symbol);
		});
	};
}));
//#endregion
//#region node_modules/lodash/_baseTimes.js
var require__baseTimes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* The base implementation of `_.times` without support for iteratee shorthands
	* or max array length checks.
	*
	* @private
	* @param {number} n The number of times to invoke `iteratee`.
	* @param {Function} iteratee The function invoked per iteration.
	* @returns {Array} Returns the array of results.
	*/
	function baseTimes(n, iteratee) {
		var index = -1, result = Array(n);
		while (++index < n) result[index] = iteratee(index);
		return result;
	}
	module.exports = baseTimes;
}));
//#endregion
//#region node_modules/lodash/_baseIsArguments.js
var require__baseIsArguments = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetTag = require__baseGetTag(), isObjectLike = require_isObjectLike();
	/** `Object#toString` result references. */
	var argsTag = "[object Arguments]";
	/**
	* The base implementation of `_.isArguments`.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an `arguments` object,
	*/
	function baseIsArguments(value) {
		return isObjectLike(value) && baseGetTag(value) == argsTag;
	}
	module.exports = baseIsArguments;
}));
//#endregion
//#region node_modules/lodash/isArguments.js
var require_isArguments = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsArguments = require__baseIsArguments(), isObjectLike = require_isObjectLike();
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	module.exports = baseIsArguments(function() {
		return arguments;
	}()) ? baseIsArguments : function(value) {
		return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
	};
}));
//#endregion
//#region node_modules/lodash/stubFalse.js
var require_stubFalse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This method returns `false`.
	*
	* @static
	* @memberOf _
	* @since 4.13.0
	* @category Util
	* @returns {boolean} Returns `false`.
	* @example
	*
	* _.times(2, _.stubFalse);
	* // => [false, false]
	*/
	function stubFalse() {
		return false;
	}
	module.exports = stubFalse;
}));
//#endregion
//#region node_modules/lodash/isBuffer.js
var require_isBuffer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var root = require__root(), stubFalse = require_stubFalse();
	/** Detect free variable `exports`. */
	var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
	/** Built-in value references. */
	var Buffer = freeModule && freeModule.exports === freeExports ? root.Buffer : void 0;
	module.exports = (Buffer ? Buffer.isBuffer : void 0) || stubFalse;
}));
//#endregion
//#region node_modules/lodash/_isIndex.js
var require__isIndex = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	/**
	* Checks if `value` is a valid array-like index.
	*
	* @private
	* @param {*} value The value to check.
	* @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	* @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	*/
	function isIndex(value, length) {
		var type = typeof value;
		length = length == null ? MAX_SAFE_INTEGER : length;
		return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
	}
	module.exports = isIndex;
}));
//#endregion
//#region node_modules/lodash/isLength.js
var require_isLength = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	/**
	* Checks if `value` is a valid array-like length.
	*
	* **Note:** This method is loosely based on
	* [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	* @example
	*
	* _.isLength(3);
	* // => true
	*
	* _.isLength(Number.MIN_VALUE);
	* // => false
	*
	* _.isLength(Infinity);
	* // => false
	*
	* _.isLength('3');
	* // => false
	*/
	function isLength(value) {
		return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	module.exports = isLength;
}));
//#endregion
//#region node_modules/lodash/_baseIsTypedArray.js
var require__baseIsTypedArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetTag = require__baseGetTag(), isLength = require_isLength(), isObjectLike = require_isObjectLike();
	/** `Object#toString` result references. */
	var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", weakMapTag = "[object WeakMap]";
	var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
	/**
	* The base implementation of `_.isTypedArray` without Node.js optimizations.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	*/
	function baseIsTypedArray(value) {
		return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}
	module.exports = baseIsTypedArray;
}));
//#endregion
//#region node_modules/lodash/_baseUnary.js
var require__baseUnary = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* The base implementation of `_.unary` without support for storing metadata.
	*
	* @private
	* @param {Function} func The function to cap arguments for.
	* @returns {Function} Returns the new capped function.
	*/
	function baseUnary(func) {
		return function(value) {
			return func(value);
		};
	}
	module.exports = baseUnary;
}));
//#endregion
//#region node_modules/lodash/_nodeUtil.js
var require__nodeUtil = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var freeGlobal = require__freeGlobal();
	/** Detect free variable `exports`. */
	var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
	/** Detect free variable `process` from Node.js. */
	var freeProcess = freeModule && freeModule.exports === freeExports && freeGlobal.process;
	module.exports = function() {
		try {
			var types = freeModule && freeModule.require && freeModule.require("util").types;
			if (types) return types;
			return freeProcess && freeProcess.binding && freeProcess.binding("util");
		} catch (e) {}
	}();
}));
//#endregion
//#region node_modules/lodash/isTypedArray.js
var require_isTypedArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsTypedArray = require__baseIsTypedArray(), baseUnary = require__baseUnary(), nodeUtil = require__nodeUtil();
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
	module.exports = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
}));
//#endregion
//#region node_modules/lodash/_arrayLikeKeys.js
var require__arrayLikeKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseTimes = require__baseTimes(), isArguments = require_isArguments(), isArray = require_isArray(), isBuffer = require_isBuffer(), isIndex = require__isIndex(), isTypedArray = require_isTypedArray();
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* Creates an array of the enumerable property names of the array-like `value`.
	*
	* @private
	* @param {*} value The value to query.
	* @param {boolean} inherited Specify returning inherited property names.
	* @returns {Array} Returns the array of property names.
	*/
	function arrayLikeKeys(value, inherited) {
		var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
		for (var key in value) if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) result.push(key);
		return result;
	}
	module.exports = arrayLikeKeys;
}));
//#endregion
//#region node_modules/lodash/_isPrototype.js
var require__isPrototype = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	/**
	* Checks if `value` is likely a prototype object.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	*/
	function isPrototype(value) {
		var Ctor = value && value.constructor;
		return value === (typeof Ctor == "function" && Ctor.prototype || objectProto);
	}
	module.exports = isPrototype;
}));
//#endregion
//#region node_modules/lodash/_overArg.js
var require__overArg = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Creates a unary function that invokes `func` with its argument transformed.
	*
	* @private
	* @param {Function} func The function to wrap.
	* @param {Function} transform The argument transform.
	* @returns {Function} Returns the new function.
	*/
	function overArg(func, transform) {
		return function(arg) {
			return func(transform(arg));
		};
	}
	module.exports = overArg;
}));
//#endregion
//#region node_modules/lodash/_nativeKeys.js
var require__nativeKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__overArg()(Object.keys, Object);
}));
//#endregion
//#region node_modules/lodash/_baseKeys.js
var require__baseKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isPrototype = require__isPrototype(), nativeKeys = require__nativeKeys();
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	*/
	function baseKeys(object) {
		if (!isPrototype(object)) return nativeKeys(object);
		var result = [];
		for (var key in Object(object)) if (hasOwnProperty.call(object, key) && key != "constructor") result.push(key);
		return result;
	}
	module.exports = baseKeys;
}));
//#endregion
//#region node_modules/lodash/isArrayLike.js
var require_isArrayLike = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isFunction = require_isFunction(), isLength = require_isLength();
	/**
	* Checks if `value` is array-like. A value is considered array-like if it's
	* not a function and has a `value.length` that's an integer greater than or
	* equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	* @example
	*
	* _.isArrayLike([1, 2, 3]);
	* // => true
	*
	* _.isArrayLike(document.body.children);
	* // => true
	*
	* _.isArrayLike('abc');
	* // => true
	*
	* _.isArrayLike(_.noop);
	* // => false
	*/
	function isArrayLike(value) {
		return value != null && isLength(value.length) && !isFunction(value);
	}
	module.exports = isArrayLike;
}));
//#endregion
//#region node_modules/lodash/keys.js
var require_keys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayLikeKeys = require__arrayLikeKeys(), baseKeys = require__baseKeys(), isArrayLike = require_isArrayLike();
	/**
	* Creates an array of the own enumerable property names of `object`.
	*
	* **Note:** Non-object values are coerced to objects. See the
	* [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	* for more details.
	*
	* @static
	* @since 0.1.0
	* @memberOf _
	* @category Object
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	* @example
	*
	* function Foo() {
	*   this.a = 1;
	*   this.b = 2;
	* }
	*
	* Foo.prototype.c = 3;
	*
	* _.keys(new Foo);
	* // => ['a', 'b'] (iteration order is not guaranteed)
	*
	* _.keys('hi');
	* // => ['0', '1']
	*/
	function keys(object) {
		return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}
	module.exports = keys;
}));
//#endregion
//#region node_modules/lodash/_getAllKeys.js
var require__getAllKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetAllKeys = require__baseGetAllKeys(), getSymbols = require__getSymbols(), keys = require_keys();
	/**
	* Creates an array of own enumerable property names and symbols of `object`.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names and symbols.
	*/
	function getAllKeys(object) {
		return baseGetAllKeys(object, keys, getSymbols);
	}
	module.exports = getAllKeys;
}));
//#endregion
//#region node_modules/lodash/_equalObjects.js
var require__equalObjects = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getAllKeys = require__getAllKeys();
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* A specialized version of `baseIsEqualDeep` for objects with support for
	* partial deep comparisons.
	*
	* @private
	* @param {Object} object The object to compare.
	* @param {Object} other The other object to compare.
	* @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	* @param {Function} customizer The function to customize comparisons.
	* @param {Function} equalFunc The function to determine equivalents of values.
	* @param {Object} stack Tracks traversed `object` and `other` objects.
	* @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	*/
	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
		var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length;
		if (objLength != getAllKeys(other).length && !isPartial) return false;
		var index = objLength;
		while (index--) {
			var key = objProps[index];
			if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) return false;
		}
		var objStacked = stack.get(object);
		var othStacked = stack.get(other);
		if (objStacked && othStacked) return objStacked == other && othStacked == object;
		var result = true;
		stack.set(object, other);
		stack.set(other, object);
		var skipCtor = isPartial;
		while (++index < objLength) {
			key = objProps[index];
			var objValue = object[key], othValue = other[key];
			if (customizer) var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
			if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
				result = false;
				break;
			}
			skipCtor || (skipCtor = key == "constructor");
		}
		if (result && !skipCtor) {
			var objCtor = object.constructor, othCtor = other.constructor;
			if (objCtor != othCtor && "constructor" in object && "constructor" in other && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) result = false;
		}
		stack["delete"](object);
		stack["delete"](other);
		return result;
	}
	module.exports = equalObjects;
}));
//#endregion
//#region node_modules/lodash/_DataView.js
var require__DataView = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(require__root(), "DataView");
}));
//#endregion
//#region node_modules/lodash/_Promise.js
var require__Promise = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(require__root(), "Promise");
}));
//#endregion
//#region node_modules/lodash/_Set.js
var require__Set = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(require__root(), "Set");
}));
//#endregion
//#region node_modules/lodash/_WeakMap.js
var require__WeakMap = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(require__root(), "WeakMap");
}));
//#endregion
//#region node_modules/lodash/_getTag.js
var require__getTag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DataView = require__DataView(), Map = require__Map(), Promise = require__Promise(), Set = require__Set(), WeakMap = require__WeakMap(), baseGetTag = require__baseGetTag(), toSource = require__toSource();
	/** `Object#toString` result references. */
	var mapTag = "[object Map]", objectTag = "[object Object]", promiseTag = "[object Promise]", setTag = "[object Set]", weakMapTag = "[object WeakMap]";
	var dataViewTag = "[object DataView]";
	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map), promiseCtorString = toSource(Promise), setCtorString = toSource(Set), weakMapCtorString = toSource(WeakMap);
	/**
	* Gets the `toStringTag` of `value`.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the `toStringTag`.
	*/
	var getTag = baseGetTag;
	if (DataView && getTag(new DataView(/* @__PURE__ */ new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) getTag = function(value) {
		var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
		if (ctorString) switch (ctorString) {
			case dataViewCtorString: return dataViewTag;
			case mapCtorString: return mapTag;
			case promiseCtorString: return promiseTag;
			case setCtorString: return setTag;
			case weakMapCtorString: return weakMapTag;
		}
		return result;
	};
	module.exports = getTag;
}));
//#endregion
//#region node_modules/lodash/_baseIsEqualDeep.js
var require__baseIsEqualDeep = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Stack = require__Stack(), equalArrays = require__equalArrays(), equalByTag = require__equalByTag(), equalObjects = require__equalObjects(), getTag = require__getTag(), isArray = require_isArray(), isBuffer = require_isBuffer(), isTypedArray = require_isTypedArray();
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;
	/** `Object#toString` result references. */
	var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* A specialized version of `baseIsEqual` for arrays and objects which performs
	* deep comparisons and tracks traversed objects enabling objects with circular
	* references to be compared.
	*
	* @private
	* @param {Object} object The object to compare.
	* @param {Object} other The other object to compare.
	* @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	* @param {Function} customizer The function to customize comparisons.
	* @param {Function} equalFunc The function to determine equivalents of values.
	* @param {Object} [stack] Tracks traversed `object` and `other` objects.
	* @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	*/
	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
		var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
		objTag = objTag == argsTag ? objectTag : objTag;
		othTag = othTag == argsTag ? objectTag : othTag;
		var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
		if (isSameTag && isBuffer(object)) {
			if (!isBuffer(other)) return false;
			objIsArr = true;
			objIsObj = false;
		}
		if (isSameTag && !objIsObj) {
			stack || (stack = new Stack());
			return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
		}
		if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
			var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
			if (objIsWrapped || othIsWrapped) {
				var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
				stack || (stack = new Stack());
				return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
			}
		}
		if (!isSameTag) return false;
		stack || (stack = new Stack());
		return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}
	module.exports = baseIsEqualDeep;
}));
//#endregion
//#region node_modules/lodash/_baseIsEqual.js
var require__baseIsEqual = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsEqualDeep = require__baseIsEqualDeep(), isObjectLike = require_isObjectLike();
	/**
	* The base implementation of `_.isEqual` which supports partial comparisons
	* and tracks traversed objects.
	*
	* @private
	* @param {*} value The value to compare.
	* @param {*} other The other value to compare.
	* @param {boolean} bitmask The bitmask flags.
	*  1 - Unordered comparison
	*  2 - Partial comparison
	* @param {Function} [customizer] The function to customize comparisons.
	* @param {Object} [stack] Tracks traversed `value` and `other` objects.
	* @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	*/
	function baseIsEqual(value, other, bitmask, customizer, stack) {
		if (value === other) return true;
		if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) return value !== value && other !== other;
		return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}
	module.exports = baseIsEqual;
}));
//#endregion
//#region node_modules/lodash/isEqual.js
var require_isEqual = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsEqual = require__baseIsEqual();
	/**
	* Performs a deep comparison between two values to determine if they are
	* equivalent.
	*
	* **Note:** This method supports comparing arrays, array buffers, booleans,
	* date objects, error objects, maps, numbers, `Object` objects, regexes,
	* sets, strings, symbols, and typed arrays. `Object` objects are compared
	* by their own, not inherited, enumerable properties. Functions and DOM
	* nodes are compared by strict equality, i.e. `===`.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to compare.
	* @param {*} other The other value to compare.
	* @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	* @example
	*
	* var object = { 'a': 1 };
	* var other = { 'a': 1 };
	*
	* _.isEqual(object, other);
	* // => true
	*
	* object === other;
	* // => false
	*/
	function isEqual(value, other) {
		return baseIsEqual(value, other);
	}
	module.exports = isEqual;
}));
//#endregion
//#region node_modules/lodash/_defineProperty.js
var require__defineProperty = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getNative = require__getNative();
	module.exports = function() {
		try {
			var func = getNative(Object, "defineProperty");
			func({}, "", {});
			return func;
		} catch (e) {}
	}();
}));
//#endregion
//#region node_modules/lodash/_baseAssignValue.js
var require__baseAssignValue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var defineProperty = require__defineProperty();
	/**
	* The base implementation of `assignValue` and `assignMergeValue` without
	* value checks.
	*
	* @private
	* @param {Object} object The object to modify.
	* @param {string} key The key of the property to assign.
	* @param {*} value The value to assign.
	*/
	function baseAssignValue(object, key, value) {
		if (key == "__proto__" && defineProperty) defineProperty(object, key, {
			"configurable": true,
			"enumerable": true,
			"value": value,
			"writable": true
		});
		else object[key] = value;
	}
	module.exports = baseAssignValue;
}));
//#endregion
//#region node_modules/lodash/_arrayAggregator.js
var require__arrayAggregator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A specialized version of `baseAggregator` for arrays.
	*
	* @private
	* @param {Array} [array] The array to iterate over.
	* @param {Function} setter The function to set `accumulator` values.
	* @param {Function} iteratee The iteratee to transform keys.
	* @param {Object} accumulator The initial aggregated object.
	* @returns {Function} Returns `accumulator`.
	*/
	function arrayAggregator(array, setter, iteratee, accumulator) {
		var index = -1, length = array == null ? 0 : array.length;
		while (++index < length) {
			var value = array[index];
			setter(accumulator, value, iteratee(value), array);
		}
		return accumulator;
	}
	module.exports = arrayAggregator;
}));
//#endregion
//#region node_modules/lodash/_createBaseFor.js
var require__createBaseFor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Creates a base function for methods like `_.forIn` and `_.forOwn`.
	*
	* @private
	* @param {boolean} [fromRight] Specify iterating from right to left.
	* @returns {Function} Returns the new base function.
	*/
	function createBaseFor(fromRight) {
		return function(object, iteratee, keysFunc) {
			var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
			while (length--) {
				var key = props[fromRight ? length : ++index];
				if (iteratee(iterable[key], key, iterable) === false) break;
			}
			return object;
		};
	}
	module.exports = createBaseFor;
}));
//#endregion
//#region node_modules/lodash/_baseFor.js
var require__baseFor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__createBaseFor()();
}));
//#endregion
//#region node_modules/lodash/_baseForOwn.js
var require__baseForOwn = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseFor = require__baseFor(), keys = require_keys();
	/**
	* The base implementation of `_.forOwn` without support for iteratee shorthands.
	*
	* @private
	* @param {Object} object The object to iterate over.
	* @param {Function} iteratee The function invoked per iteration.
	* @returns {Object} Returns `object`.
	*/
	function baseForOwn(object, iteratee) {
		return object && baseFor(object, iteratee, keys);
	}
	module.exports = baseForOwn;
}));
//#endregion
//#region node_modules/lodash/_createBaseEach.js
var require__createBaseEach = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isArrayLike = require_isArrayLike();
	/**
	* Creates a `baseEach` or `baseEachRight` function.
	*
	* @private
	* @param {Function} eachFunc The function to iterate over a collection.
	* @param {boolean} [fromRight] Specify iterating from right to left.
	* @returns {Function} Returns the new base function.
	*/
	function createBaseEach(eachFunc, fromRight) {
		return function(collection, iteratee) {
			if (collection == null) return collection;
			if (!isArrayLike(collection)) return eachFunc(collection, iteratee);
			var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
			while (fromRight ? index-- : ++index < length) if (iteratee(iterable[index], index, iterable) === false) break;
			return collection;
		};
	}
	module.exports = createBaseEach;
}));
//#endregion
//#region node_modules/lodash/_baseEach.js
var require__baseEach = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseForOwn = require__baseForOwn();
	module.exports = require__createBaseEach()(baseForOwn);
}));
//#endregion
//#region node_modules/lodash/_baseAggregator.js
var require__baseAggregator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseEach = require__baseEach();
	/**
	* Aggregates elements of `collection` on `accumulator` with keys transformed
	* by `iteratee` and values set by `setter`.
	*
	* @private
	* @param {Array|Object} collection The collection to iterate over.
	* @param {Function} setter The function to set `accumulator` values.
	* @param {Function} iteratee The iteratee to transform keys.
	* @param {Object} accumulator The initial aggregated object.
	* @returns {Function} Returns `accumulator`.
	*/
	function baseAggregator(collection, setter, iteratee, accumulator) {
		baseEach(collection, function(value, key, collection) {
			setter(accumulator, value, iteratee(value), collection);
		});
		return accumulator;
	}
	module.exports = baseAggregator;
}));
//#endregion
//#region node_modules/lodash/_baseIsMatch.js
var require__baseIsMatch = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Stack = require__Stack(), baseIsEqual = require__baseIsEqual();
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
	/**
	* The base implementation of `_.isMatch` without support for iteratee shorthands.
	*
	* @private
	* @param {Object} object The object to inspect.
	* @param {Object} source The object of property values to match.
	* @param {Array} matchData The property names, values, and compare flags to match.
	* @param {Function} [customizer] The function to customize comparisons.
	* @returns {boolean} Returns `true` if `object` is a match, else `false`.
	*/
	function baseIsMatch(object, source, matchData, customizer) {
		var index = matchData.length, length = index, noCustomizer = !customizer;
		if (object == null) return !length;
		object = Object(object);
		while (index--) {
			var data = matchData[index];
			if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) return false;
		}
		while (++index < length) {
			data = matchData[index];
			var key = data[0], objValue = object[key], srcValue = data[1];
			if (noCustomizer && data[2]) {
				if (objValue === void 0 && !(key in object)) return false;
			} else {
				var stack = new Stack();
				if (customizer) var result = customizer(objValue, srcValue, key, object, source, stack);
				if (!(result === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) return false;
			}
		}
		return true;
	}
	module.exports = baseIsMatch;
}));
//#endregion
//#region node_modules/lodash/_isStrictComparable.js
var require__isStrictComparable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isObject = require_isObject();
	/**
	* Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` if suitable for strict
	*  equality comparisons, else `false`.
	*/
	function isStrictComparable(value) {
		return value === value && !isObject(value);
	}
	module.exports = isStrictComparable;
}));
//#endregion
//#region node_modules/lodash/_getMatchData.js
var require__getMatchData = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isStrictComparable = require__isStrictComparable(), keys = require_keys();
	/**
	* Gets the property names, values, and compare flags of `object`.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Array} Returns the match data of `object`.
	*/
	function getMatchData(object) {
		var result = keys(object), length = result.length;
		while (length--) {
			var key = result[length], value = object[key];
			result[length] = [
				key,
				value,
				isStrictComparable(value)
			];
		}
		return result;
	}
	module.exports = getMatchData;
}));
//#endregion
//#region node_modules/lodash/_matchesStrictComparable.js
var require__matchesStrictComparable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A specialized version of `matchesProperty` for source values suitable
	* for strict equality comparisons, i.e. `===`.
	*
	* @private
	* @param {string} key The key of the property to get.
	* @param {*} srcValue The value to match.
	* @returns {Function} Returns the new spec function.
	*/
	function matchesStrictComparable(key, srcValue) {
		return function(object) {
			if (object == null) return false;
			return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
		};
	}
	module.exports = matchesStrictComparable;
}));
//#endregion
//#region node_modules/lodash/_baseMatches.js
var require__baseMatches = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsMatch = require__baseIsMatch(), getMatchData = require__getMatchData(), matchesStrictComparable = require__matchesStrictComparable();
	/**
	* The base implementation of `_.matches` which doesn't clone `source`.
	*
	* @private
	* @param {Object} source The object of property values to match.
	* @returns {Function} Returns the new spec function.
	*/
	function baseMatches(source) {
		var matchData = getMatchData(source);
		if (matchData.length == 1 && matchData[0][2]) return matchesStrictComparable(matchData[0][0], matchData[0][1]);
		return function(object) {
			return object === source || baseIsMatch(object, source, matchData);
		};
	}
	module.exports = baseMatches;
}));
//#endregion
//#region node_modules/lodash/_baseHasIn.js
var require__baseHasIn = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* The base implementation of `_.hasIn` without support for deep paths.
	*
	* @private
	* @param {Object} [object] The object to query.
	* @param {Array|string} key The key to check.
	* @returns {boolean} Returns `true` if `key` exists, else `false`.
	*/
	function baseHasIn(object, key) {
		return object != null && key in Object(object);
	}
	module.exports = baseHasIn;
}));
//#endregion
//#region node_modules/lodash/_hasPath.js
var require__hasPath = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var castPath = require__castPath(), isArguments = require_isArguments(), isArray = require_isArray(), isIndex = require__isIndex(), isLength = require_isLength(), toKey = require__toKey();
	/**
	* Checks if `path` exists on `object`.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {Array|string} path The path to check.
	* @param {Function} hasFunc The function to check properties.
	* @returns {boolean} Returns `true` if `path` exists, else `false`.
	*/
	function hasPath(object, path, hasFunc) {
		path = castPath(path, object);
		var index = -1, length = path.length, result = false;
		while (++index < length) {
			var key = toKey(path[index]);
			if (!(result = object != null && hasFunc(object, key))) break;
			object = object[key];
		}
		if (result || ++index != length) return result;
		length = object == null ? 0 : object.length;
		return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
	}
	module.exports = hasPath;
}));
//#endregion
//#region node_modules/lodash/hasIn.js
var require_hasIn = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseHasIn = require__baseHasIn(), hasPath = require__hasPath();
	/**
	* Checks if `path` is a direct or inherited property of `object`.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Object
	* @param {Object} object The object to query.
	* @param {Array|string} path The path to check.
	* @returns {boolean} Returns `true` if `path` exists, else `false`.
	* @example
	*
	* var object = _.create({ 'a': _.create({ 'b': 2 }) });
	*
	* _.hasIn(object, 'a');
	* // => true
	*
	* _.hasIn(object, 'a.b');
	* // => true
	*
	* _.hasIn(object, ['a', 'b']);
	* // => true
	*
	* _.hasIn(object, 'b');
	* // => false
	*/
	function hasIn(object, path) {
		return object != null && hasPath(object, path, baseHasIn);
	}
	module.exports = hasIn;
}));
//#endregion
//#region node_modules/lodash/_baseMatchesProperty.js
var require__baseMatchesProperty = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsEqual = require__baseIsEqual(), get = require_get(), hasIn = require_hasIn(), isKey = require__isKey(), isStrictComparable = require__isStrictComparable(), matchesStrictComparable = require__matchesStrictComparable(), toKey = require__toKey();
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
	/**
	* The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	*
	* @private
	* @param {string} path The path of the property to get.
	* @param {*} srcValue The value to match.
	* @returns {Function} Returns the new spec function.
	*/
	function baseMatchesProperty(path, srcValue) {
		if (isKey(path) && isStrictComparable(srcValue)) return matchesStrictComparable(toKey(path), srcValue);
		return function(object) {
			var objValue = get(object, path);
			return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
		};
	}
	module.exports = baseMatchesProperty;
}));
//#endregion
//#region node_modules/lodash/identity.js
var require_identity = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This method returns the first argument it receives.
	*
	* @static
	* @since 0.1.0
	* @memberOf _
	* @category Util
	* @param {*} value Any value.
	* @returns {*} Returns `value`.
	* @example
	*
	* var object = { 'a': 1 };
	*
	* console.log(_.identity(object) === object);
	* // => true
	*/
	function identity(value) {
		return value;
	}
	module.exports = identity;
}));
//#endregion
//#region node_modules/lodash/_baseProperty.js
var require__baseProperty = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* The base implementation of `_.property` without support for deep paths.
	*
	* @private
	* @param {string} key The key of the property to get.
	* @returns {Function} Returns the new accessor function.
	*/
	function baseProperty(key) {
		return function(object) {
			return object == null ? void 0 : object[key];
		};
	}
	module.exports = baseProperty;
}));
//#endregion
//#region node_modules/lodash/_basePropertyDeep.js
var require__basePropertyDeep = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGet = require__baseGet();
	/**
	* A specialized version of `baseProperty` which supports deep paths.
	*
	* @private
	* @param {Array|string} path The path of the property to get.
	* @returns {Function} Returns the new accessor function.
	*/
	function basePropertyDeep(path) {
		return function(object) {
			return baseGet(object, path);
		};
	}
	module.exports = basePropertyDeep;
}));
//#endregion
//#region node_modules/lodash/property.js
var require_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseProperty = require__baseProperty(), basePropertyDeep = require__basePropertyDeep(), isKey = require__isKey(), toKey = require__toKey();
	/**
	* Creates a function that returns the value at `path` of a given object.
	*
	* @static
	* @memberOf _
	* @since 2.4.0
	* @category Util
	* @param {Array|string} path The path of the property to get.
	* @returns {Function} Returns the new accessor function.
	* @example
	*
	* var objects = [
	*   { 'a': { 'b': 2 } },
	*   { 'a': { 'b': 1 } }
	* ];
	*
	* _.map(objects, _.property('a.b'));
	* // => [2, 1]
	*
	* _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	* // => [1, 2]
	*/
	function property(path) {
		return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}
	module.exports = property;
}));
//#endregion
//#region node_modules/lodash/_baseIteratee.js
var require__baseIteratee = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseMatches = require__baseMatches(), baseMatchesProperty = require__baseMatchesProperty(), identity = require_identity(), isArray = require_isArray(), property = require_property();
	/**
	* The base implementation of `_.iteratee`.
	*
	* @private
	* @param {*} [value=_.identity] The value to convert to an iteratee.
	* @returns {Function} Returns the iteratee.
	*/
	function baseIteratee(value) {
		if (typeof value == "function") return value;
		if (value == null) return identity;
		if (typeof value == "object") return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
		return property(value);
	}
	module.exports = baseIteratee;
}));
//#endregion
//#region node_modules/lodash/_createAggregator.js
var require__createAggregator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayAggregator = require__arrayAggregator(), baseAggregator = require__baseAggregator(), baseIteratee = require__baseIteratee(), isArray = require_isArray();
	/**
	* Creates a function like `_.groupBy`.
	*
	* @private
	* @param {Function} setter The function to set accumulator values.
	* @param {Function} [initializer] The accumulator object initializer.
	* @returns {Function} Returns the new aggregator function.
	*/
	function createAggregator(setter, initializer) {
		return function(collection, iteratee) {
			var func = isArray(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
			return func(collection, setter, baseIteratee(iteratee, 2), accumulator);
		};
	}
	module.exports = createAggregator;
}));
//#endregion
//#region node_modules/lodash/keyBy.js
var require_keyBy = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseAssignValue = require__baseAssignValue();
	module.exports = require__createAggregator()(function(result, value, key) {
		baseAssignValue(result, key, value);
	});
}));
//#endregion
//#region node_modules/lodash/last.js
var require_last = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Gets the last element of `array`.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Array
	* @param {Array} array The array to query.
	* @returns {*} Returns the last element of `array`.
	* @example
	*
	* _.last([1, 2, 3]);
	* // => 3
	*/
	function last(array) {
		var length = array == null ? 0 : array.length;
		return length ? array[length - 1] : void 0;
	}
	module.exports = last;
}));
//#endregion
//#region node_modules/lodash/_assignValue.js
var require__assignValue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseAssignValue = require__baseAssignValue(), eq = require_eq$1();
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* Assigns `value` to `key` of `object` if the existing value is not equivalent
	* using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	* for equality comparisons.
	*
	* @private
	* @param {Object} object The object to modify.
	* @param {string} key The key of the property to assign.
	* @param {*} value The value to assign.
	*/
	function assignValue(object, key, value) {
		var objValue = object[key];
		if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) baseAssignValue(object, key, value);
	}
	module.exports = assignValue;
}));
//#endregion
//#region node_modules/lodash/_baseSet.js
var require__baseSet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assignValue = require__assignValue(), castPath = require__castPath(), isIndex = require__isIndex(), isObject = require_isObject(), toKey = require__toKey();
	/**
	* The base implementation of `_.set`.
	*
	* @private
	* @param {Object} object The object to modify.
	* @param {Array|string} path The path of the property to set.
	* @param {*} value The value to set.
	* @param {Function} [customizer] The function to customize path creation.
	* @returns {Object} Returns `object`.
	*/
	function baseSet(object, path, value, customizer) {
		if (!isObject(object)) return object;
		path = castPath(path, object);
		var index = -1, length = path.length, lastIndex = length - 1, nested = object;
		while (nested != null && ++index < length) {
			var key = toKey(path[index]), newValue = value;
			if (key === "__proto__" || key === "constructor" || key === "prototype") return object;
			if (index != lastIndex) {
				var objValue = nested[key];
				newValue = customizer ? customizer(objValue, key, nested) : void 0;
				if (newValue === void 0) newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
			}
			assignValue(nested, key, newValue);
			nested = nested[key];
		}
		return object;
	}
	module.exports = baseSet;
}));
//#endregion
//#region node_modules/lodash/set.js
var require_set = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseSet = require__baseSet();
	/**
	* Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
	* it's created. Arrays are created for missing index properties while objects
	* are created for all other missing properties. Use `_.setWith` to customize
	* `path` creation.
	*
	* **Note:** This method mutates `object`.
	*
	* @static
	* @memberOf _
	* @since 3.7.0
	* @category Object
	* @param {Object} object The object to modify.
	* @param {Array|string} path The path of the property to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns `object`.
	* @example
	*
	* var object = { 'a': [{ 'b': { 'c': 3 } }] };
	*
	* _.set(object, 'a[0].b.c', 4);
	* console.log(object.a[0].b.c);
	* // => 4
	*
	* _.set(object, ['x', '0', 'y', 'z'], 5);
	* console.log(object.x[0].y.z);
	* // => 5
	*/
	function set(object, path, value) {
		return object == null ? object : baseSet(object, path, value);
	}
	module.exports = set;
}));
//#endregion
//#region node_modules/lodash/isString.js
var require_isString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetTag = require__baseGetTag(), isArray = require_isArray(), isObjectLike = require_isObjectLike();
	/** `Object#toString` result references. */
	var stringTag = "[object String]";
	/**
	* Checks if `value` is classified as a `String` primitive or object.
	*
	* @static
	* @since 0.1.0
	* @memberOf _
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a string, else `false`.
	* @example
	*
	* _.isString('abc');
	* // => true
	*
	* _.isString(1);
	* // => false
	*/
	function isString(value) {
		return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
	}
	module.exports = isString;
}));
//#endregion
//#region node_modules/lodash/_asciiSize.js
var require__asciiSize = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__baseProperty()("length");
}));
//#endregion
//#region node_modules/lodash/_hasUnicode.js
var require__hasUnicode = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
	var reHasUnicode = RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]");
	/**
	* Checks if `string` contains Unicode symbols.
	*
	* @private
	* @param {string} string The string to inspect.
	* @returns {boolean} Returns `true` if a symbol is found, else `false`.
	*/
	function hasUnicode(string) {
		return reHasUnicode.test(string);
	}
	module.exports = hasUnicode;
}));
//#endregion
//#region node_modules/lodash/_unicodeSize.js
var require__unicodeSize = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used to compose unicode character classes. */
	var rsAstralRange = "\\ud800-\\udfff", rsComboRange = "\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff", rsVarRange = "\\ufe0e\\ufe0f";
	/** Used to compose unicode capture groups. */
	var rsAstral = "[" + rsAstralRange + "]", rsCombo = "[" + rsComboRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsZWJ = "\\u200d";
	/** Used to compose unicode regexes. */
	var reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [
		rsNonAstral,
		rsRegional,
		rsSurrPair
	].join("|") + ")" + rsOptVar + reOptMod + ")*", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsSymbol = "(?:" + [
		rsNonAstral + rsCombo + "?",
		rsCombo,
		rsRegional,
		rsSurrPair,
		rsAstral
	].join("|") + ")";
	/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
	var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
	/**
	* Gets the size of a Unicode `string`.
	*
	* @private
	* @param {string} string The string inspect.
	* @returns {number} Returns the string size.
	*/
	function unicodeSize(string) {
		var result = reUnicode.lastIndex = 0;
		while (reUnicode.test(string)) ++result;
		return result;
	}
	module.exports = unicodeSize;
}));
//#endregion
//#region node_modules/lodash/_stringSize.js
var require__stringSize = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var asciiSize = require__asciiSize(), hasUnicode = require__hasUnicode(), unicodeSize = require__unicodeSize();
	/**
	* Gets the number of symbols in `string`.
	*
	* @private
	* @param {string} string The string to inspect.
	* @returns {number} Returns the string size.
	*/
	function stringSize(string) {
		return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
	}
	module.exports = stringSize;
}));
//#endregion
//#region node_modules/lodash/size.js
var require_size = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseKeys = require__baseKeys(), getTag = require__getTag(), isArrayLike = require_isArrayLike(), isString = require_isString(), stringSize = require__stringSize();
	/** `Object#toString` result references. */
	var mapTag = "[object Map]", setTag = "[object Set]";
	/**
	* Gets the size of `collection` by returning its length for array-like
	* values or the number of own enumerable string keyed properties for objects.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Collection
	* @param {Array|Object|string} collection The collection to inspect.
	* @returns {number} Returns the collection size.
	* @example
	*
	* _.size([1, 2, 3]);
	* // => 3
	*
	* _.size({ 'a': 1, 'b': 2 });
	* // => 2
	*
	* _.size('pebbles');
	* // => 7
	*/
	function size(collection) {
		if (collection == null) return 0;
		if (isArrayLike(collection)) return isString(collection) ? stringSize(collection) : collection.length;
		var tag = getTag(collection);
		if (tag == mapTag || tag == setTag) return collection.size;
		return baseKeys(collection).length;
	}
	module.exports = size;
}));
//#endregion
//#region node_modules/lodash/_baseFilter.js
var require__baseFilter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseEach = require__baseEach();
	/**
	* The base implementation of `_.filter` without support for iteratee shorthands.
	*
	* @private
	* @param {Array|Object} collection The collection to iterate over.
	* @param {Function} predicate The function invoked per iteration.
	* @returns {Array} Returns the new filtered array.
	*/
	function baseFilter(collection, predicate) {
		var result = [];
		baseEach(collection, function(value, index, collection) {
			if (predicate(value, index, collection)) result.push(value);
		});
		return result;
	}
	module.exports = baseFilter;
}));
//#endregion
//#region node_modules/lodash/filter.js
var require_filter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayFilter = require__arrayFilter(), baseFilter = require__baseFilter(), baseIteratee = require__baseIteratee(), isArray = require_isArray();
	/**
	* Iterates over elements of `collection`, returning an array of all elements
	* `predicate` returns truthy for. The predicate is invoked with three
	* arguments: (value, index|key, collection).
	*
	* **Note:** Unlike `_.remove`, this method returns a new array.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Collection
	* @param {Array|Object} collection The collection to iterate over.
	* @param {Function} [predicate=_.identity] The function invoked per iteration.
	* @returns {Array} Returns the new filtered array.
	* @see _.reject
	* @example
	*
	* var users = [
	*   { 'user': 'barney', 'age': 36, 'active': true },
	*   { 'user': 'fred',   'age': 40, 'active': false }
	* ];
	*
	* _.filter(users, function(o) { return !o.active; });
	* // => objects for ['fred']
	*
	* // The `_.matches` iteratee shorthand.
	* _.filter(users, { 'age': 36, 'active': true });
	* // => objects for ['barney']
	*
	* // The `_.matchesProperty` iteratee shorthand.
	* _.filter(users, ['active', false]);
	* // => objects for ['fred']
	*
	* // The `_.property` iteratee shorthand.
	* _.filter(users, 'active');
	* // => objects for ['barney']
	*
	* // Combining several predicates using `_.overEvery` or `_.overSome`.
	* _.filter(users, _.overSome([{ 'age': 36 }, ['age', 40]]));
	* // => objects for ['fred', 'barney']
	*/
	function filter(collection, predicate) {
		return (isArray(collection) ? arrayFilter : baseFilter)(collection, baseIteratee(predicate, 3));
	}
	module.exports = filter;
}));
//#endregion
//#region node_modules/lodash/groupBy.js
var require_groupBy = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseAssignValue = require__baseAssignValue(), createAggregator = require__createAggregator();
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	module.exports = createAggregator(function(result, value, key) {
		if (hasOwnProperty.call(result, key)) result[key].push(value);
		else baseAssignValue(result, key, [value]);
	});
}));
//#endregion
//#region node_modules/lodash/_baseMap.js
var require__baseMap = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseEach = require__baseEach(), isArrayLike = require_isArrayLike();
	/**
	* The base implementation of `_.map` without support for iteratee shorthands.
	*
	* @private
	* @param {Array|Object} collection The collection to iterate over.
	* @param {Function} iteratee The function invoked per iteration.
	* @returns {Array} Returns the new mapped array.
	*/
	function baseMap(collection, iteratee) {
		var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
		baseEach(collection, function(value, key, collection) {
			result[++index] = iteratee(value, key, collection);
		});
		return result;
	}
	module.exports = baseMap;
}));
//#endregion
//#region node_modules/lodash/_baseSortBy.js
var require__baseSortBy = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* The base implementation of `_.sortBy` which uses `comparer` to define the
	* sort order of `array` and replaces criteria objects with their corresponding
	* values.
	*
	* @private
	* @param {Array} array The array to sort.
	* @param {Function} comparer The function to define sort order.
	* @returns {Array} Returns `array`.
	*/
	function baseSortBy(array, comparer) {
		var length = array.length;
		array.sort(comparer);
		while (length--) array[length] = array[length].value;
		return array;
	}
	module.exports = baseSortBy;
}));
//#endregion
//#region node_modules/lodash/_compareAscending.js
var require__compareAscending = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isSymbol = require_isSymbol();
	/**
	* Compares values to sort them in ascending order.
	*
	* @private
	* @param {*} value The value to compare.
	* @param {*} other The other value to compare.
	* @returns {number} Returns the sort order indicator for `value`.
	*/
	function compareAscending(value, other) {
		if (value !== other) {
			var valIsDefined = value !== void 0, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
			var othIsDefined = other !== void 0, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
			if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) return 1;
			if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) return -1;
		}
		return 0;
	}
	module.exports = compareAscending;
}));
//#endregion
//#region node_modules/lodash/_compareMultiple.js
var require__compareMultiple = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compareAscending = require__compareAscending();
	/**
	* Used by `_.orderBy` to compare multiple properties of a value to another
	* and stable sort them.
	*
	* If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
	* specify an order of "desc" for descending or "asc" for ascending sort order
	* of corresponding values.
	*
	* @private
	* @param {Object} object The object to compare.
	* @param {Object} other The other object to compare.
	* @param {boolean[]|string[]} orders The order to sort by for each property.
	* @returns {number} Returns the sort order indicator for `object`.
	*/
	function compareMultiple(object, other, orders) {
		var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
		while (++index < length) {
			var result = compareAscending(objCriteria[index], othCriteria[index]);
			if (result) {
				if (index >= ordersLength) return result;
				return result * (orders[index] == "desc" ? -1 : 1);
			}
		}
		return object.index - other.index;
	}
	module.exports = compareMultiple;
}));
//#endregion
//#region node_modules/lodash/_baseOrderBy.js
var require__baseOrderBy = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayMap = require__arrayMap(), baseGet = require__baseGet(), baseIteratee = require__baseIteratee(), baseMap = require__baseMap(), baseSortBy = require__baseSortBy(), baseUnary = require__baseUnary(), compareMultiple = require__compareMultiple(), identity = require_identity(), isArray = require_isArray();
	/**
	* The base implementation of `_.orderBy` without param guards.
	*
	* @private
	* @param {Array|Object} collection The collection to iterate over.
	* @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
	* @param {string[]} orders The sort orders of `iteratees`.
	* @returns {Array} Returns the new sorted array.
	*/
	function baseOrderBy(collection, iteratees, orders) {
		if (iteratees.length) iteratees = arrayMap(iteratees, function(iteratee) {
			if (isArray(iteratee)) return function(value) {
				return baseGet(value, iteratee.length === 1 ? iteratee[0] : iteratee);
			};
			return iteratee;
		});
		else iteratees = [identity];
		var index = -1;
		iteratees = arrayMap(iteratees, baseUnary(baseIteratee));
		return baseSortBy(baseMap(collection, function(value, key, collection) {
			return {
				"criteria": arrayMap(iteratees, function(iteratee) {
					return iteratee(value);
				}),
				"index": ++index,
				"value": value
			};
		}), function(object, other) {
			return compareMultiple(object, other, orders);
		});
	}
	module.exports = baseOrderBy;
}));
//#endregion
//#region node_modules/lodash/orderBy.js
var require_orderBy = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseOrderBy = require__baseOrderBy(), isArray = require_isArray();
	/**
	* This method is like `_.sortBy` except that it allows specifying the sort
	* orders of the iteratees to sort by. If `orders` is unspecified, all values
	* are sorted in ascending order. Otherwise, specify an order of "desc" for
	* descending or "asc" for ascending sort order of corresponding values.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Collection
	* @param {Array|Object} collection The collection to iterate over.
	* @param {Array[]|Function[]|Object[]|string[]} [iteratees=[_.identity]]
	*  The iteratees to sort by.
	* @param {string[]} [orders] The sort orders of `iteratees`.
	* @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
	* @returns {Array} Returns the new sorted array.
	* @example
	*
	* var users = [
	*   { 'user': 'fred',   'age': 48 },
	*   { 'user': 'barney', 'age': 34 },
	*   { 'user': 'fred',   'age': 40 },
	*   { 'user': 'barney', 'age': 36 }
	* ];
	*
	* // Sort by `user` in ascending order and by `age` in descending order.
	* _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
	* // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
	*/
	function orderBy(collection, iteratees, orders, guard) {
		if (collection == null) return [];
		if (!isArray(iteratees)) iteratees = iteratees == null ? [] : [iteratees];
		orders = guard ? void 0 : orders;
		if (!isArray(orders)) orders = orders == null ? [] : [orders];
		return baseOrderBy(collection, iteratees, orders);
	}
	module.exports = orderBy;
}));
//#endregion
//#region node_modules/lodash/head.js
var require_head = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Gets the first element of `array`.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @alias first
	* @category Array
	* @param {Array} array The array to query.
	* @returns {*} Returns the first element of `array`.
	* @example
	*
	* _.head([1, 2, 3]);
	* // => 1
	*
	* _.head([]);
	* // => undefined
	*/
	function head(array) {
		return array && array.length ? array[0] : void 0;
	}
	module.exports = head;
}));
//#endregion
//#region node_modules/lodash/first.js
var require_first = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_head();
}));
//#endregion
//#region node_modules/lodash/_isFlattenable.js
var require__isFlattenable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Symbol = require__Symbol(), isArguments = require_isArguments(), isArray = require_isArray();
	/** Built-in value references. */
	var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : void 0;
	/**
	* Checks if `value` is a flattenable `arguments` object or array.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	*/
	function isFlattenable(value) {
		return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
	}
	module.exports = isFlattenable;
}));
//#endregion
//#region node_modules/lodash/_baseFlatten.js
var require__baseFlatten = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayPush = require__arrayPush(), isFlattenable = require__isFlattenable();
	/**
	* The base implementation of `_.flatten` with support for restricting flattening.
	*
	* @private
	* @param {Array} array The array to flatten.
	* @param {number} depth The maximum recursion depth.
	* @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
	* @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
	* @param {Array} [result=[]] The initial result value.
	* @returns {Array} Returns the new flattened array.
	*/
	function baseFlatten(array, depth, predicate, isStrict, result) {
		var index = -1, length = array.length;
		predicate || (predicate = isFlattenable);
		result || (result = []);
		while (++index < length) {
			var value = array[index];
			if (depth > 0 && predicate(value)) if (depth > 1) baseFlatten(value, depth - 1, predicate, isStrict, result);
			else arrayPush(result, value);
			else if (!isStrict) result[result.length] = value;
		}
		return result;
	}
	module.exports = baseFlatten;
}));
//#endregion
//#region node_modules/lodash/flatten.js
var require_flatten = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseFlatten = require__baseFlatten();
	/**
	* Flattens `array` a single level deep.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Array
	* @param {Array} array The array to flatten.
	* @returns {Array} Returns the new flattened array.
	* @example
	*
	* _.flatten([1, [2, [3, [4]], 5]]);
	* // => [1, 2, [3, [4]], 5]
	*/
	function flatten(array) {
		return (array == null ? 0 : array.length) ? baseFlatten(array, 1) : [];
	}
	module.exports = flatten;
}));
//#endregion
//#region node_modules/lodash/mapValues.js
var require_mapValues = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseAssignValue = require__baseAssignValue(), baseForOwn = require__baseForOwn(), baseIteratee = require__baseIteratee();
	/**
	* Creates an object with the same keys as `object` and values generated
	* by running each own enumerable string keyed property of `object` thru
	* `iteratee`. The iteratee is invoked with three arguments:
	* (value, key, object).
	*
	* @static
	* @memberOf _
	* @since 2.4.0
	* @category Object
	* @param {Object} object The object to iterate over.
	* @param {Function} [iteratee=_.identity] The function invoked per iteration.
	* @returns {Object} Returns the new mapped object.
	* @see _.mapKeys
	* @example
	*
	* var users = {
	*   'fred':    { 'user': 'fred',    'age': 40 },
	*   'pebbles': { 'user': 'pebbles', 'age': 1 }
	* };
	*
	* _.mapValues(users, function(o) { return o.age; });
	* // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	*
	* // The `_.property` iteratee shorthand.
	* _.mapValues(users, 'age');
	* // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	*/
	function mapValues(object, iteratee) {
		var result = {};
		iteratee = baseIteratee(iteratee, 3);
		baseForOwn(object, function(value, key, object) {
			baseAssignValue(result, key, iteratee(value, key, object));
		});
		return result;
	}
	module.exports = mapValues;
}));
//#endregion
//#region node_modules/lodash/_apply.js
var require__apply = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A faster alternative to `Function#apply`, this function invokes `func`
	* with the `this` binding of `thisArg` and the arguments of `args`.
	*
	* @private
	* @param {Function} func The function to invoke.
	* @param {*} thisArg The `this` binding of `func`.
	* @param {Array} args The arguments to invoke `func` with.
	* @returns {*} Returns the result of `func`.
	*/
	function apply(func, thisArg, args) {
		switch (args.length) {
			case 0: return func.call(thisArg);
			case 1: return func.call(thisArg, args[0]);
			case 2: return func.call(thisArg, args[0], args[1]);
			case 3: return func.call(thisArg, args[0], args[1], args[2]);
		}
		return func.apply(thisArg, args);
	}
	module.exports = apply;
}));
//#endregion
//#region node_modules/lodash/_overRest.js
var require__overRest = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var apply = require__apply();
	var nativeMax = Math.max;
	/**
	* A specialized version of `baseRest` which transforms the rest array.
	*
	* @private
	* @param {Function} func The function to apply a rest parameter to.
	* @param {number} [start=func.length-1] The start position of the rest parameter.
	* @param {Function} transform The rest array transform.
	* @returns {Function} Returns the new function.
	*/
	function overRest(func, start, transform) {
		start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
		return function() {
			var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
			while (++index < length) array[index] = args[start + index];
			index = -1;
			var otherArgs = Array(start + 1);
			while (++index < start) otherArgs[index] = args[index];
			otherArgs[start] = transform(array);
			return apply(func, this, otherArgs);
		};
	}
	module.exports = overRest;
}));
//#endregion
//#region node_modules/lodash/constant.js
var require_constant = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Creates a function that returns `value`.
	*
	* @static
	* @memberOf _
	* @since 2.4.0
	* @category Util
	* @param {*} value The value to return from the new function.
	* @returns {Function} Returns the new constant function.
	* @example
	*
	* var objects = _.times(2, _.constant({ 'a': 1 }));
	*
	* console.log(objects);
	* // => [{ 'a': 1 }, { 'a': 1 }]
	*
	* console.log(objects[0] === objects[1]);
	* // => true
	*/
	function constant(value) {
		return function() {
			return value;
		};
	}
	module.exports = constant;
}));
//#endregion
//#region node_modules/lodash/_baseSetToString.js
var require__baseSetToString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var constant = require_constant(), defineProperty = require__defineProperty(), identity = require_identity();
	module.exports = !defineProperty ? identity : function(func, string) {
		return defineProperty(func, "toString", {
			"configurable": true,
			"enumerable": false,
			"value": constant(string),
			"writable": true
		});
	};
}));
//#endregion
//#region node_modules/lodash/_shortOut.js
var require__shortOut = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT = 800, HOT_SPAN = 16;
	var nativeNow = Date.now;
	/**
	* Creates a function that'll short out and invoke `identity` instead
	* of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	* milliseconds.
	*
	* @private
	* @param {Function} func The function to restrict.
	* @returns {Function} Returns the new shortable function.
	*/
	function shortOut(func) {
		var count = 0, lastCalled = 0;
		return function() {
			var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
			lastCalled = stamp;
			if (remaining > 0) {
				if (++count >= HOT_COUNT) return arguments[0];
			} else count = 0;
			return func.apply(void 0, arguments);
		};
	}
	module.exports = shortOut;
}));
//#endregion
//#region node_modules/lodash/_setToString.js
var require__setToString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseSetToString = require__baseSetToString();
	module.exports = require__shortOut()(baseSetToString);
}));
//#endregion
//#region node_modules/lodash/_baseRest.js
var require__baseRest = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var identity = require_identity(), overRest = require__overRest(), setToString = require__setToString();
	/**
	* The base implementation of `_.rest` which doesn't validate or coerce arguments.
	*
	* @private
	* @param {Function} func The function to apply a rest parameter to.
	* @param {number} [start=func.length-1] The start position of the rest parameter.
	* @returns {Function} Returns the new function.
	*/
	function baseRest(func, start) {
		return setToString(overRest(func, start, identity), func + "");
	}
	module.exports = baseRest;
}));
//#endregion
//#region node_modules/lodash/isArrayLikeObject.js
var require_isArrayLikeObject = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isArrayLike = require_isArrayLike(), isObjectLike = require_isObjectLike();
	/**
	* This method is like `_.isArrayLike` except that it also checks if `value`
	* is an object.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an array-like object,
	*  else `false`.
	* @example
	*
	* _.isArrayLikeObject([1, 2, 3]);
	* // => true
	*
	* _.isArrayLikeObject(document.body.children);
	* // => true
	*
	* _.isArrayLikeObject('abc');
	* // => false
	*
	* _.isArrayLikeObject(_.noop);
	* // => false
	*/
	function isArrayLikeObject(value) {
		return isObjectLike(value) && isArrayLike(value);
	}
	module.exports = isArrayLikeObject;
}));
//#endregion
//#region node_modules/lodash/unzip.js
var require_unzip = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayFilter = require__arrayFilter(), arrayMap = require__arrayMap(), baseProperty = require__baseProperty(), baseTimes = require__baseTimes(), isArrayLikeObject = require_isArrayLikeObject();
	var nativeMax = Math.max;
	/**
	* This method is like `_.zip` except that it accepts an array of grouped
	* elements and creates an array regrouping the elements to their pre-zip
	* configuration.
	*
	* @static
	* @memberOf _
	* @since 1.2.0
	* @category Array
	* @param {Array} array The array of grouped elements to process.
	* @returns {Array} Returns the new array of regrouped elements.
	* @example
	*
	* var zipped = _.zip(['a', 'b'], [1, 2], [true, false]);
	* // => [['a', 1, true], ['b', 2, false]]
	*
	* _.unzip(zipped);
	* // => [['a', 'b'], [1, 2], [true, false]]
	*/
	function unzip(array) {
		if (!(array && array.length)) return [];
		var length = 0;
		array = arrayFilter(array, function(group) {
			if (isArrayLikeObject(group)) {
				length = nativeMax(group.length, length);
				return true;
			}
		});
		return baseTimes(length, function(index) {
			return arrayMap(array, baseProperty(index));
		});
	}
	module.exports = unzip;
}));
//#endregion
//#region node_modules/lodash/zip.js
var require_zip = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__baseRest()(require_unzip());
}));
//#endregion
//#region node_modules/semver/internal/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SEMVER_SPEC_VERSION = "2.0.0";
	const MAX_LENGTH = 256;
	const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
	module.exports = {
		MAX_LENGTH,
		MAX_SAFE_COMPONENT_LENGTH: 16,
		MAX_SAFE_BUILD_LENGTH: MAX_LENGTH - 6,
		MAX_SAFE_INTEGER,
		RELEASE_TYPES: [
			"major",
			"premajor",
			"minor",
			"preminor",
			"patch",
			"prepatch",
			"prerelease"
		],
		SEMVER_SPEC_VERSION,
		FLAG_INCLUDE_PRERELEASE: 1,
		FLAG_LOOSE: 2
	};
}));
//#endregion
//#region node_modules/semver/internal/debug.js
var require_debug = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
}));
//#endregion
//#region node_modules/semver/internal/re.js
var require_re = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { MAX_SAFE_COMPONENT_LENGTH, MAX_SAFE_BUILD_LENGTH, MAX_LENGTH } = require_constants();
	const debug = require_debug();
	exports = module.exports = {};
	const re = exports.re = [];
	const safeRe = exports.safeRe = [];
	const src = exports.src = [];
	const safeSrc = exports.safeSrc = [];
	const t = exports.t = {};
	let R = 0;
	const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
	const safeRegexReplacements = [
		["\\s", 1],
		["\\d", MAX_LENGTH],
		[LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
	];
	const makeSafeRegex = (value) => {
		for (const [token, max] of safeRegexReplacements) value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
		return value;
	};
	const createToken = (name, value, isGlobal) => {
		const safe = makeSafeRegex(value);
		const index = R++;
		debug(name, index, value);
		t[name] = index;
		src[index] = value;
		safeSrc[index] = safe;
		re[index] = new RegExp(value, isGlobal ? "g" : void 0);
		safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
	};
	createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
	createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
	createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
	createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
	createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
	createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
	createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
	createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
	createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
	createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
	createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
	createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
	createToken("FULL", `^${src[t.FULLPLAIN]}$`);
	createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
	createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
	createToken("GTLT", "((?:<|>)?=?)");
	createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
	createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
	createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
	createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
	createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
	createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
	createToken("COERCEPLAIN", `(^|[^\\d])(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
	createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
	createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
	createToken("COERCERTL", src[t.COERCE], true);
	createToken("COERCERTLFULL", src[t.COERCEFULL], true);
	createToken("LONETILDE", "(?:~>?)");
	createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
	exports.tildeTrimReplace = "$1~";
	createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
	createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
	createToken("LONECARET", "(?:\\^)");
	createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
	exports.caretTrimReplace = "$1^";
	createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
	createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
	createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
	createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
	createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
	exports.comparatorTrimReplace = "$1$2$3";
	createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
	createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
	createToken("STAR", "(<|>)?=?\\s*\\*");
	createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
	createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
}));
//#endregion
//#region node_modules/semver/internal/parse-options.js
var require_parse_options = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const looseOption = Object.freeze({ loose: true });
	const emptyOpts = Object.freeze({});
	const parseOptions = (options) => {
		if (!options) return emptyOpts;
		if (typeof options !== "object") return looseOption;
		return options;
	};
	module.exports = parseOptions;
}));
//#endregion
//#region node_modules/semver/internal/identifiers.js
var require_identifiers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const numeric = /^[0-9]+$/;
	const compareIdentifiers = (a, b) => {
		if (typeof a === "number" && typeof b === "number") return a === b ? 0 : a < b ? -1 : 1;
		const anum = numeric.test(a);
		const bnum = numeric.test(b);
		if (anum && bnum) {
			a = +a;
			b = +b;
		}
		return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
	};
	const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
	module.exports = {
		compareIdentifiers,
		rcompareIdentifiers
	};
}));
//#endregion
//#region node_modules/semver/classes/semver.js
var require_semver$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const debug = require_debug();
	const { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
	const { safeRe: re, t } = require_re();
	const parseOptions = require_parse_options();
	const { compareIdentifiers } = require_identifiers();
	module.exports = class SemVer {
		constructor(version, options) {
			options = parseOptions(options);
			if (version instanceof SemVer) if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) return version;
			else version = version.version;
			else if (typeof version !== "string") throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
			if (version.length > MAX_LENGTH) throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
			debug("SemVer", version, options);
			this.options = options;
			this.loose = !!options.loose;
			this.includePrerelease = !!options.includePrerelease;
			const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
			if (!m) throw new TypeError(`Invalid Version: ${version}`);
			this.raw = version;
			this.major = +m[1];
			this.minor = +m[2];
			this.patch = +m[3];
			if (this.major > MAX_SAFE_INTEGER || this.major < 0) throw new TypeError("Invalid major version");
			if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) throw new TypeError("Invalid minor version");
			if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) throw new TypeError("Invalid patch version");
			if (!m[4]) this.prerelease = [];
			else this.prerelease = m[4].split(".").map((id) => {
				if (/^[0-9]+$/.test(id)) {
					const num = +id;
					if (num >= 0 && num < MAX_SAFE_INTEGER) return num;
				}
				return id;
			});
			this.build = m[5] ? m[5].split(".") : [];
			this.format();
		}
		format() {
			this.version = `${this.major}.${this.minor}.${this.patch}`;
			if (this.prerelease.length) this.version += `-${this.prerelease.join(".")}`;
			return this.version;
		}
		toString() {
			return this.version;
		}
		compare(other) {
			debug("SemVer.compare", this.version, this.options, other);
			if (!(other instanceof SemVer)) {
				if (typeof other === "string" && other === this.version) return 0;
				other = new SemVer(other, this.options);
			}
			if (other.version === this.version) return 0;
			return this.compareMain(other) || this.comparePre(other);
		}
		compareMain(other) {
			if (!(other instanceof SemVer)) other = new SemVer(other, this.options);
			if (this.major < other.major) return -1;
			if (this.major > other.major) return 1;
			if (this.minor < other.minor) return -1;
			if (this.minor > other.minor) return 1;
			if (this.patch < other.patch) return -1;
			if (this.patch > other.patch) return 1;
			return 0;
		}
		comparePre(other) {
			if (!(other instanceof SemVer)) other = new SemVer(other, this.options);
			if (this.prerelease.length && !other.prerelease.length) return -1;
			else if (!this.prerelease.length && other.prerelease.length) return 1;
			else if (!this.prerelease.length && !other.prerelease.length) return 0;
			let i = 0;
			do {
				const a = this.prerelease[i];
				const b = other.prerelease[i];
				debug("prerelease compare", i, a, b);
				if (a === void 0 && b === void 0) return 0;
				else if (b === void 0) return 1;
				else if (a === void 0) return -1;
				else if (a === b) continue;
				else return compareIdentifiers(a, b);
			} while (++i);
		}
		compareBuild(other) {
			if (!(other instanceof SemVer)) other = new SemVer(other, this.options);
			let i = 0;
			do {
				const a = this.build[i];
				const b = other.build[i];
				debug("build compare", i, a, b);
				if (a === void 0 && b === void 0) return 0;
				else if (b === void 0) return 1;
				else if (a === void 0) return -1;
				else if (a === b) continue;
				else return compareIdentifiers(a, b);
			} while (++i);
		}
		inc(release, identifier, identifierBase) {
			if (release.startsWith("pre")) {
				if (!identifier && identifierBase === false) throw new Error("invalid increment argument: identifier is empty");
				if (identifier) {
					const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
					if (!match || match[1] !== identifier) throw new Error(`invalid identifier: ${identifier}`);
				}
			}
			switch (release) {
				case "premajor":
					this.prerelease.length = 0;
					this.patch = 0;
					this.minor = 0;
					this.major++;
					this.inc("pre", identifier, identifierBase);
					break;
				case "preminor":
					this.prerelease.length = 0;
					this.patch = 0;
					this.minor++;
					this.inc("pre", identifier, identifierBase);
					break;
				case "prepatch":
					this.prerelease.length = 0;
					this.inc("patch", identifier, identifierBase);
					this.inc("pre", identifier, identifierBase);
					break;
				case "prerelease":
					if (this.prerelease.length === 0) this.inc("patch", identifier, identifierBase);
					this.inc("pre", identifier, identifierBase);
					break;
				case "release":
					if (this.prerelease.length === 0) throw new Error(`version ${this.raw} is not a prerelease`);
					this.prerelease.length = 0;
					break;
				case "major":
					if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) this.major++;
					this.minor = 0;
					this.patch = 0;
					this.prerelease = [];
					break;
				case "minor":
					if (this.patch !== 0 || this.prerelease.length === 0) this.minor++;
					this.patch = 0;
					this.prerelease = [];
					break;
				case "patch":
					if (this.prerelease.length === 0) this.patch++;
					this.prerelease = [];
					break;
				case "pre": {
					const base = Number(identifierBase) ? 1 : 0;
					if (this.prerelease.length === 0) this.prerelease = [base];
					else {
						let i = this.prerelease.length;
						while (--i >= 0) if (typeof this.prerelease[i] === "number") {
							this.prerelease[i]++;
							i = -2;
						}
						if (i === -1) {
							if (identifier === this.prerelease.join(".") && identifierBase === false) throw new Error("invalid increment argument: identifier already exists");
							this.prerelease.push(base);
						}
					}
					if (identifier) {
						let prerelease = [identifier, base];
						if (identifierBase === false) prerelease = [identifier];
						if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
							if (isNaN(this.prerelease[1])) this.prerelease = prerelease;
						} else this.prerelease = prerelease;
					}
					break;
				}
				default: throw new Error(`invalid increment argument: ${release}`);
			}
			this.raw = this.format();
			if (this.build.length) this.raw += `+${this.build.join(".")}`;
			return this;
		}
	};
}));
//#endregion
//#region node_modules/semver/functions/parse.js
var require_parse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const parse = (version, options, throwErrors = false) => {
		if (version instanceof SemVer) return version;
		try {
			return new SemVer(version, options);
		} catch (er) {
			if (!throwErrors) return null;
			throw er;
		}
	};
	module.exports = parse;
}));
//#endregion
//#region node_modules/semver/functions/valid.js
var require_valid$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const parse = require_parse();
	const valid = (version, options) => {
		const v = parse(version, options);
		return v ? v.version : null;
	};
	module.exports = valid;
}));
//#endregion
//#region node_modules/semver/functions/clean.js
var require_clean = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const parse = require_parse();
	const clean = (version, options) => {
		const s = parse(version.trim().replace(/^[=v]+/, ""), options);
		return s ? s.version : null;
	};
	module.exports = clean;
}));
//#endregion
//#region node_modules/semver/functions/inc.js
var require_inc = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const inc = (version, release, options, identifier, identifierBase) => {
		if (typeof options === "string") {
			identifierBase = identifier;
			identifier = options;
			options = void 0;
		}
		try {
			return new SemVer(version instanceof SemVer ? version.version : version, options).inc(release, identifier, identifierBase).version;
		} catch (er) {
			return null;
		}
	};
	module.exports = inc;
}));
//#endregion
//#region node_modules/semver/functions/diff.js
var require_diff = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const parse = require_parse();
	const diff = (version1, version2) => {
		const v1 = parse(version1, null, true);
		const v2 = parse(version2, null, true);
		const comparison = v1.compare(v2);
		if (comparison === 0) return null;
		const v1Higher = comparison > 0;
		const highVersion = v1Higher ? v1 : v2;
		const lowVersion = v1Higher ? v2 : v1;
		const highHasPre = !!highVersion.prerelease.length;
		if (!!lowVersion.prerelease.length && !highHasPre) {
			if (!lowVersion.patch && !lowVersion.minor) return "major";
			if (lowVersion.compareMain(highVersion) === 0) {
				if (lowVersion.minor && !lowVersion.patch) return "minor";
				return "patch";
			}
		}
		const prefix = highHasPre ? "pre" : "";
		if (v1.major !== v2.major) return prefix + "major";
		if (v1.minor !== v2.minor) return prefix + "minor";
		if (v1.patch !== v2.patch) return prefix + "patch";
		return "prerelease";
	};
	module.exports = diff;
}));
//#endregion
//#region node_modules/semver/functions/major.js
var require_major = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const major = (a, loose) => new SemVer(a, loose).major;
	module.exports = major;
}));
//#endregion
//#region node_modules/semver/functions/minor.js
var require_minor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const minor = (a, loose) => new SemVer(a, loose).minor;
	module.exports = minor;
}));
//#endregion
//#region node_modules/semver/functions/patch.js
var require_patch = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const patch = (a, loose) => new SemVer(a, loose).patch;
	module.exports = patch;
}));
//#endregion
//#region node_modules/semver/functions/prerelease.js
var require_prerelease = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const parse = require_parse();
	const prerelease = (version, options) => {
		const parsed = parse(version, options);
		return parsed && parsed.prerelease.length ? parsed.prerelease : null;
	};
	module.exports = prerelease;
}));
//#endregion
//#region node_modules/semver/functions/compare.js
var require_compare = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
	module.exports = compare;
}));
//#endregion
//#region node_modules/semver/functions/rcompare.js
var require_rcompare = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compare = require_compare();
	const rcompare = (a, b, loose) => compare(b, a, loose);
	module.exports = rcompare;
}));
//#endregion
//#region node_modules/semver/functions/compare-loose.js
var require_compare_loose = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compare = require_compare();
	const compareLoose = (a, b) => compare(a, b, true);
	module.exports = compareLoose;
}));
//#endregion
//#region node_modules/semver/functions/compare-build.js
var require_compare_build = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const compareBuild = (a, b, loose) => {
		const versionA = new SemVer(a, loose);
		const versionB = new SemVer(b, loose);
		return versionA.compare(versionB) || versionA.compareBuild(versionB);
	};
	module.exports = compareBuild;
}));
//#endregion
//#region node_modules/semver/functions/sort.js
var require_sort = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compareBuild = require_compare_build();
	const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
	module.exports = sort;
}));
//#endregion
//#region node_modules/semver/functions/rsort.js
var require_rsort = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compareBuild = require_compare_build();
	const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
	module.exports = rsort;
}));
//#endregion
//#region node_modules/semver/functions/gt.js
var require_gt = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compare = require_compare();
	const gt = (a, b, loose) => compare(a, b, loose) > 0;
	module.exports = gt;
}));
//#endregion
//#region node_modules/semver/functions/lt.js
var require_lt = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compare = require_compare();
	const lt = (a, b, loose) => compare(a, b, loose) < 0;
	module.exports = lt;
}));
//#endregion
//#region node_modules/semver/functions/eq.js
var require_eq = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compare = require_compare();
	const eq = (a, b, loose) => compare(a, b, loose) === 0;
	module.exports = eq;
}));
//#endregion
//#region node_modules/semver/functions/neq.js
var require_neq = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compare = require_compare();
	const neq = (a, b, loose) => compare(a, b, loose) !== 0;
	module.exports = neq;
}));
//#endregion
//#region node_modules/semver/functions/gte.js
var require_gte = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compare = require_compare();
	const gte = (a, b, loose) => compare(a, b, loose) >= 0;
	module.exports = gte;
}));
//#endregion
//#region node_modules/semver/functions/lte.js
var require_lte = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compare = require_compare();
	const lte = (a, b, loose) => compare(a, b, loose) <= 0;
	module.exports = lte;
}));
//#endregion
//#region node_modules/semver/functions/cmp.js
var require_cmp = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const eq = require_eq();
	const neq = require_neq();
	const gt = require_gt();
	const gte = require_gte();
	const lt = require_lt();
	const lte = require_lte();
	const cmp = (a, op, b, loose) => {
		switch (op) {
			case "===":
				if (typeof a === "object") a = a.version;
				if (typeof b === "object") b = b.version;
				return a === b;
			case "!==":
				if (typeof a === "object") a = a.version;
				if (typeof b === "object") b = b.version;
				return a !== b;
			case "":
			case "=":
			case "==": return eq(a, b, loose);
			case "!=": return neq(a, b, loose);
			case ">": return gt(a, b, loose);
			case ">=": return gte(a, b, loose);
			case "<": return lt(a, b, loose);
			case "<=": return lte(a, b, loose);
			default: throw new TypeError(`Invalid operator: ${op}`);
		}
	};
	module.exports = cmp;
}));
//#endregion
//#region node_modules/semver/functions/coerce.js
var require_coerce = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const parse = require_parse();
	const { safeRe: re, t } = require_re();
	const coerce = (version, options) => {
		if (version instanceof SemVer) return version;
		if (typeof version === "number") version = String(version);
		if (typeof version !== "string") return null;
		options = options || {};
		let match = null;
		if (!options.rtl) match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
		else {
			const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
			let next;
			while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
				if (!match || next.index + next[0].length !== match.index + match[0].length) match = next;
				coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
			}
			coerceRtlRegex.lastIndex = -1;
		}
		if (match === null) return null;
		const major = match[2];
		return parse(`${major}.${match[3] || "0"}.${match[4] || "0"}${options.includePrerelease && match[5] ? `-${match[5]}` : ""}${options.includePrerelease && match[6] ? `+${match[6]}` : ""}`, options);
	};
	module.exports = coerce;
}));
//#endregion
//#region node_modules/semver/functions/truncate.js
var require_truncate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const parse = require_parse();
	const constants = require_constants();
	const SemVer = require_semver$1();
	const truncate = (version, truncation, options) => {
		if (!constants.RELEASE_TYPES.includes(truncation)) return null;
		const clonedVersion = cloneInputVersion(version, options);
		return clonedVersion && doTruncation(clonedVersion, truncation);
	};
	const cloneInputVersion = (version, options) => {
		return parse(version instanceof SemVer ? version.version : version, options);
	};
	const doTruncation = (version, truncation) => {
		if (isPrerelease(truncation)) return version.version;
		version.prerelease = [];
		switch (truncation) {
			case "major":
				version.minor = 0;
				version.patch = 0;
				break;
			case "minor":
				version.patch = 0;
				break;
		}
		return version.format();
	};
	const isPrerelease = (type) => {
		return type.startsWith("pre");
	};
	module.exports = truncate;
}));
//#endregion
//#region node_modules/semver/internal/lrucache.js
var require_lrucache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var LRUCache = class {
		constructor() {
			this.max = 1e3;
			this.map = /* @__PURE__ */ new Map();
		}
		get(key) {
			const value = this.map.get(key);
			if (value === void 0) return;
			else {
				this.map.delete(key);
				this.map.set(key, value);
				return value;
			}
		}
		delete(key) {
			return this.map.delete(key);
		}
		set(key, value) {
			if (!this.delete(key) && value !== void 0) {
				if (this.map.size >= this.max) {
					const firstKey = this.map.keys().next().value;
					this.delete(firstKey);
				}
				this.map.set(key, value);
			}
			return this;
		}
	};
	module.exports = LRUCache;
}));
//#endregion
//#region node_modules/semver/classes/range.js
var require_range = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SPACE_CHARACTERS = /\s+/g;
	module.exports = class Range {
		constructor(range, options) {
			options = parseOptions(options);
			if (range instanceof Range) if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) return range;
			else return new Range(range.raw, options);
			if (range instanceof Comparator) {
				this.raw = range.value;
				this.set = [[range]];
				this.formatted = void 0;
				return this;
			}
			this.options = options;
			this.loose = !!options.loose;
			this.includePrerelease = !!options.includePrerelease;
			this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
			this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
			if (!this.set.length) throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
			if (this.set.length > 1) {
				const first = this.set[0];
				this.set = this.set.filter((c) => !isNullSet(c[0]));
				if (this.set.length === 0) this.set = [first];
				else if (this.set.length > 1) {
					for (const c of this.set) if (c.length === 1 && isAny(c[0])) {
						this.set = [c];
						break;
					}
				}
			}
			this.formatted = void 0;
		}
		get range() {
			if (this.formatted === void 0) {
				this.formatted = "";
				for (let i = 0; i < this.set.length; i++) {
					if (i > 0) this.formatted += "||";
					const comps = this.set[i];
					for (let k = 0; k < comps.length; k++) {
						if (k > 0) this.formatted += " ";
						this.formatted += comps[k].toString().trim();
					}
				}
			}
			return this.formatted;
		}
		format() {
			return this.range;
		}
		toString() {
			return this.range;
		}
		parseRange(range) {
			range = range.replace(BUILDSTRIPRE, "");
			const memoKey = ((this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE)) + ":" + range;
			const cached = cache.get(memoKey);
			if (cached) return cached;
			const loose = this.options.loose;
			const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
			range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
			debug("hyphen replace", range);
			range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
			debug("comparator trim", range);
			range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
			debug("tilde trim", range);
			range = range.replace(re[t.CARETTRIM], caretTrimReplace);
			debug("caret trim", range);
			let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
			if (loose) rangeList = rangeList.filter((comp) => {
				debug("loose invalid filter", comp, this.options);
				return !!comp.match(re[t.COMPARATORLOOSE]);
			});
			debug("range list", rangeList);
			const rangeMap = /* @__PURE__ */ new Map();
			const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
			for (const comp of comparators) {
				if (isNullSet(comp)) return [comp];
				rangeMap.set(comp.value, comp);
			}
			if (rangeMap.size > 1 && rangeMap.has("")) rangeMap.delete("");
			const result = [...rangeMap.values()];
			cache.set(memoKey, result);
			return result;
		}
		intersects(range, options) {
			if (!(range instanceof Range)) throw new TypeError("a Range is required");
			return this.set.some((thisComparators) => {
				return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
					return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
						return rangeComparators.every((rangeComparator) => {
							return thisComparator.intersects(rangeComparator, options);
						});
					});
				});
			});
		}
		test(version) {
			if (!version) return false;
			if (typeof version === "string") try {
				version = new SemVer(version, this.options);
			} catch (er) {
				return false;
			}
			for (let i = 0; i < this.set.length; i++) if (testSet(this.set[i], version, this.options)) return true;
			return false;
		}
	};
	const cache = new (require_lrucache())();
	const parseOptions = require_parse_options();
	const Comparator = require_comparator();
	const debug = require_debug();
	const SemVer = require_semver$1();
	const { safeRe: re, src, t, comparatorTrimReplace, tildeTrimReplace, caretTrimReplace } = require_re();
	const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
	const BUILDSTRIPRE = new RegExp(src[t.BUILD], "g");
	const isNullSet = (c) => c.value === "<0.0.0-0";
	const isAny = (c) => c.value === "";
	const isSatisfiable = (comparators, options) => {
		let result = true;
		const remainingComparators = comparators.slice();
		let testComparator = remainingComparators.pop();
		while (result && remainingComparators.length) {
			result = remainingComparators.every((otherComparator) => {
				return testComparator.intersects(otherComparator, options);
			});
			testComparator = remainingComparators.pop();
		}
		return result;
	};
	const parseComparator = (comp, options) => {
		comp = comp.replace(re[t.BUILD], "");
		debug("comp", comp, options);
		comp = replaceCarets(comp, options);
		debug("caret", comp);
		comp = replaceTildes(comp, options);
		debug("tildes", comp);
		comp = replaceXRanges(comp, options);
		debug("xrange", comp);
		comp = replaceStars(comp, options);
		debug("stars", comp);
		return comp;
	};
	const isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
	const replaceTildes = (comp, options) => {
		return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
	};
	const replaceTilde = (comp, options) => {
		const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
		return comp.replace(r, (_, M, m, p, pr) => {
			debug("tilde", comp, _, M, m, p, pr);
			let ret;
			if (isX(M)) ret = "";
			else if (isX(m)) ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
			else if (isX(p)) ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
			else if (pr) {
				debug("replaceTilde pr", pr);
				ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
			} else ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
			debug("tilde return", ret);
			return ret;
		});
	};
	const replaceCarets = (comp, options) => {
		return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
	};
	const replaceCaret = (comp, options) => {
		debug("caret", comp, options);
		const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
		const z = options.includePrerelease ? "-0" : "";
		return comp.replace(r, (_, M, m, p, pr) => {
			debug("caret", comp, _, M, m, p, pr);
			let ret;
			if (isX(M)) ret = "";
			else if (isX(m)) ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
			else if (isX(p)) if (M === "0") ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
			else ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
			else if (pr) {
				debug("replaceCaret pr", pr);
				if (M === "0") if (m === "0") ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
				else ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
				else ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
			} else {
				debug("no pr");
				if (M === "0") if (m === "0") ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
				else ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
				else ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
			}
			debug("caret return", ret);
			return ret;
		});
	};
	const replaceXRanges = (comp, options) => {
		debug("replaceXRanges", comp, options);
		return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
	};
	const replaceXRange = (comp, options) => {
		comp = comp.trim();
		const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
		return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
			debug("xRange", comp, ret, gtlt, M, m, p, pr);
			const xM = isX(M);
			const xm = xM || isX(m);
			const xp = xm || isX(p);
			const anyX = xp;
			if (gtlt === "=" && anyX) gtlt = "";
			pr = options.includePrerelease ? "-0" : "";
			if (xM) if (gtlt === ">" || gtlt === "<") ret = "<0.0.0-0";
			else ret = "*";
			else if (gtlt && anyX) {
				if (xm) m = 0;
				p = 0;
				if (gtlt === ">") {
					gtlt = ">=";
					if (xm) {
						M = +M + 1;
						m = 0;
						p = 0;
					} else {
						m = +m + 1;
						p = 0;
					}
				} else if (gtlt === "<=") {
					gtlt = "<";
					if (xm) M = +M + 1;
					else m = +m + 1;
				}
				if (gtlt === "<") pr = "-0";
				ret = `${gtlt + M}.${m}.${p}${pr}`;
			} else if (xm) ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
			else if (xp) ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
			debug("xRange return", ret);
			return ret;
		});
	};
	const replaceStars = (comp, options) => {
		debug("replaceStars", comp, options);
		return comp.trim().replace(re[t.STAR], "");
	};
	const replaceGTE0 = (comp, options) => {
		debug("replaceGTE0", comp, options);
		return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
	};
	const hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
		if (isX(fM)) from = "";
		else if (isX(fm)) from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
		else if (isX(fp)) from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
		else if (fpr) from = `>=${from}`;
		else from = `>=${from}${incPr ? "-0" : ""}`;
		if (isX(tM)) to = "";
		else if (isX(tm)) to = `<${+tM + 1}.0.0-0`;
		else if (isX(tp)) to = `<${tM}.${+tm + 1}.0-0`;
		else if (tpr) to = `<=${tM}.${tm}.${tp}-${tpr}`;
		else if (incPr) to = `<${tM}.${tm}.${+tp + 1}-0`;
		else to = `<=${to}`;
		return `${from} ${to}`.trim();
	};
	const testSet = (set, version, options) => {
		for (let i = 0; i < set.length; i++) if (!set[i].test(version)) return false;
		if (version.prerelease.length && !options.includePrerelease) {
			for (let i = 0; i < set.length; i++) {
				debug(set[i].semver);
				if (set[i].semver === Comparator.ANY) continue;
				if (set[i].semver.prerelease.length > 0) {
					const allowed = set[i].semver;
					if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) return true;
				}
			}
			return false;
		}
		return true;
	};
}));
//#endregion
//#region node_modules/semver/classes/comparator.js
var require_comparator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const ANY = Symbol("SemVer ANY");
	module.exports = class Comparator {
		static get ANY() {
			return ANY;
		}
		constructor(comp, options) {
			options = parseOptions(options);
			if (comp instanceof Comparator) if (comp.loose === !!options.loose) return comp;
			else comp = comp.value;
			comp = comp.trim().split(/\s+/).join(" ");
			debug("comparator", comp, options);
			this.options = options;
			this.loose = !!options.loose;
			this.parse(comp);
			if (this.semver === ANY) this.value = "";
			else this.value = this.operator + this.semver.version;
			debug("comp", this);
		}
		parse(comp) {
			const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
			const m = comp.match(r);
			if (!m) throw new TypeError(`Invalid comparator: ${comp}`);
			this.operator = m[1] !== void 0 ? m[1] : "";
			if (this.operator === "=") this.operator = "";
			if (!m[2]) this.semver = ANY;
			else this.semver = new SemVer(m[2], this.options.loose);
		}
		toString() {
			return this.value;
		}
		test(version) {
			debug("Comparator.test", version, this.options.loose);
			if (this.semver === ANY || version === ANY) return true;
			if (typeof version === "string") try {
				version = new SemVer(version, this.options);
			} catch (er) {
				return false;
			}
			return cmp(version, this.operator, this.semver, this.options);
		}
		intersects(comp, options) {
			if (!(comp instanceof Comparator)) throw new TypeError("a Comparator is required");
			if (this.operator === "") {
				if (this.value === "") return true;
				return new Range(comp.value, options).test(this.value);
			} else if (comp.operator === "") {
				if (comp.value === "") return true;
				return new Range(this.value, options).test(comp.semver);
			}
			options = parseOptions(options);
			if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) return false;
			if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) return false;
			if (this.operator.startsWith(">") && comp.operator.startsWith(">")) return true;
			if (this.operator.startsWith("<") && comp.operator.startsWith("<")) return true;
			if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) return true;
			if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) return true;
			if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) return true;
			return false;
		}
	};
	const parseOptions = require_parse_options();
	const { safeRe: re, t } = require_re();
	const cmp = require_cmp();
	const debug = require_debug();
	const SemVer = require_semver$1();
	const Range = require_range();
}));
//#endregion
//#region node_modules/semver/functions/satisfies.js
var require_satisfies = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const Range = require_range();
	const satisfies = (version, range, options) => {
		try {
			range = new Range(range, options);
		} catch (er) {
			return false;
		}
		return range.test(version);
	};
	module.exports = satisfies;
}));
//#endregion
//#region node_modules/semver/ranges/to-comparators.js
var require_to_comparators = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const Range = require_range();
	const toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
	module.exports = toComparators;
}));
//#endregion
//#region node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const Range = require_range();
	const maxSatisfying = (versions, range, options) => {
		let max = null;
		let maxSV = null;
		let rangeObj = null;
		try {
			rangeObj = new Range(range, options);
		} catch (er) {
			return null;
		}
		versions.forEach((v) => {
			if (rangeObj.test(v)) {
				if (!max || maxSV.compare(v) === -1) {
					max = v;
					maxSV = new SemVer(max, options);
				}
			}
		});
		return max;
	};
	module.exports = maxSatisfying;
}));
//#endregion
//#region node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const Range = require_range();
	const minSatisfying = (versions, range, options) => {
		let min = null;
		let minSV = null;
		let rangeObj = null;
		try {
			rangeObj = new Range(range, options);
		} catch (er) {
			return null;
		}
		versions.forEach((v) => {
			if (rangeObj.test(v)) {
				if (!min || minSV.compare(v) === 1) {
					min = v;
					minSV = new SemVer(min, options);
				}
			}
		});
		return min;
	};
	module.exports = minSatisfying;
}));
//#endregion
//#region node_modules/semver/ranges/min-version.js
var require_min_version = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const Range = require_range();
	const gt = require_gt();
	const minVersion = (range, loose) => {
		range = new Range(range, loose);
		let minver = new SemVer("0.0.0");
		if (range.test(minver)) return minver;
		minver = new SemVer("0.0.0-0");
		if (range.test(minver)) return minver;
		minver = null;
		for (let i = 0; i < range.set.length; ++i) {
			const comparators = range.set[i];
			let setMin = null;
			comparators.forEach((comparator) => {
				const compver = new SemVer(comparator.semver.version);
				switch (comparator.operator) {
					case ">":
						if (compver.prerelease.length === 0) compver.patch++;
						else compver.prerelease.push(0);
						compver.raw = compver.format();
					case "":
					case ">=":
						if (!setMin || gt(compver, setMin)) setMin = compver;
						break;
					case "<":
					case "<=": break;
					/* istanbul ignore next */
					default: throw new Error(`Unexpected operation: ${comparator.operator}`);
				}
			});
			if (setMin && (!minver || gt(minver, setMin))) minver = setMin;
		}
		if (minver && range.test(minver)) return minver;
		return null;
	};
	module.exports = minVersion;
}));
//#endregion
//#region node_modules/semver/ranges/valid.js
var require_valid = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const Range = require_range();
	const validRange = (range, options) => {
		try {
			return new Range(range, options).range || "*";
		} catch (er) {
			return null;
		}
	};
	module.exports = validRange;
}));
//#endregion
//#region node_modules/semver/ranges/outside.js
var require_outside = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver$1();
	const Comparator = require_comparator();
	const { ANY } = Comparator;
	const Range = require_range();
	const satisfies = require_satisfies();
	const gt = require_gt();
	const lt = require_lt();
	const lte = require_lte();
	const gte = require_gte();
	const outside = (version, range, hilo, options) => {
		version = new SemVer(version, options);
		range = new Range(range, options);
		let gtfn, ltefn, ltfn, comp, ecomp;
		switch (hilo) {
			case ">":
				gtfn = gt;
				ltefn = lte;
				ltfn = lt;
				comp = ">";
				ecomp = ">=";
				break;
			case "<":
				gtfn = lt;
				ltefn = gte;
				ltfn = gt;
				comp = "<";
				ecomp = "<=";
				break;
			default: throw new TypeError("Must provide a hilo val of \"<\" or \">\"");
		}
		if (satisfies(version, range, options)) return false;
		for (let i = 0; i < range.set.length; ++i) {
			const comparators = range.set[i];
			let high = null;
			let low = null;
			comparators.forEach((comparator) => {
				if (comparator.semver === ANY) comparator = new Comparator(">=0.0.0");
				high = high || comparator;
				low = low || comparator;
				if (gtfn(comparator.semver, high.semver, options)) high = comparator;
				else if (ltfn(comparator.semver, low.semver, options)) low = comparator;
			});
			if (high.operator === comp || high.operator === ecomp) return false;
			if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) return false;
			else if (low.operator === ecomp && ltfn(version, low.semver)) return false;
		}
		return true;
	};
	module.exports = outside;
}));
//#endregion
//#region node_modules/semver/ranges/gtr.js
var require_gtr = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const outside = require_outside();
	const gtr = (version, range, options) => outside(version, range, ">", options);
	module.exports = gtr;
}));
//#endregion
//#region node_modules/semver/ranges/ltr.js
var require_ltr = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const outside = require_outside();
	const ltr = (version, range, options) => outside(version, range, "<", options);
	module.exports = ltr;
}));
//#endregion
//#region node_modules/semver/ranges/intersects.js
var require_intersects = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const Range = require_range();
	const intersects = (r1, r2, options) => {
		r1 = new Range(r1, options);
		r2 = new Range(r2, options);
		return r1.intersects(r2, options);
	};
	module.exports = intersects;
}));
//#endregion
//#region node_modules/semver/ranges/simplify.js
var require_simplify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const satisfies = require_satisfies();
	const compare = require_compare();
	module.exports = (versions, range, options) => {
		const set = [];
		let first = null;
		let prev = null;
		const v = versions.sort((a, b) => compare(a, b, options));
		for (const version of v) if (satisfies(version, range, options)) {
			prev = version;
			if (!first) first = version;
		} else {
			if (prev) set.push([first, prev]);
			prev = null;
			first = null;
		}
		if (first) set.push([first, null]);
		const ranges = [];
		for (const [min, max] of set) if (min === max) ranges.push(min);
		else if (!max && min === v[0]) ranges.push("*");
		else if (!max) ranges.push(`>=${min}`);
		else if (min === v[0]) ranges.push(`<=${max}`);
		else ranges.push(`${min} - ${max}`);
		const simplified = ranges.join(" || ");
		const original = typeof range.raw === "string" ? range.raw : String(range);
		return simplified.length < original.length ? simplified : range;
	};
}));
//#endregion
//#region node_modules/semver/ranges/subset.js
var require_subset = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const Range = require_range();
	const Comparator = require_comparator();
	const { ANY } = Comparator;
	const satisfies = require_satisfies();
	const compare = require_compare();
	const subset = (sub, dom, options = {}) => {
		if (sub === dom) return true;
		sub = new Range(sub, options);
		dom = new Range(dom, options);
		let sawNonNull = false;
		OUTER: for (const simpleSub of sub.set) {
			for (const simpleDom of dom.set) {
				const isSub = simpleSubset(simpleSub, simpleDom, options);
				sawNonNull = sawNonNull || isSub !== null;
				if (isSub) continue OUTER;
			}
			if (sawNonNull) return false;
		}
		return true;
	};
	const minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
	const minimumVersion = [new Comparator(">=0.0.0")];
	const simpleSubset = (sub, dom, options) => {
		if (sub === dom) return true;
		if (sub.length === 1 && sub[0].semver === ANY) if (dom.length === 1 && dom[0].semver === ANY) return true;
		else if (options.includePrerelease) sub = minimumVersionWithPreRelease;
		else sub = minimumVersion;
		if (dom.length === 1 && dom[0].semver === ANY) if (options.includePrerelease) return true;
		else dom = minimumVersion;
		const eqSet = /* @__PURE__ */ new Set();
		let gt, lt;
		for (const c of sub) if (c.operator === ">" || c.operator === ">=") gt = higherGT(gt, c, options);
		else if (c.operator === "<" || c.operator === "<=") lt = lowerLT(lt, c, options);
		else eqSet.add(c.semver);
		if (eqSet.size > 1) return null;
		let gtltComp;
		if (gt && lt) {
			gtltComp = compare(gt.semver, lt.semver, options);
			if (gtltComp > 0) return null;
			else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) return null;
		}
		for (const eq of eqSet) {
			if (gt && !satisfies(eq, String(gt), options)) return null;
			if (lt && !satisfies(eq, String(lt), options)) return null;
			for (const c of dom) if (!satisfies(eq, String(c), options)) return false;
			return true;
		}
		let higher, lower;
		let hasDomLT, hasDomGT;
		let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
		let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
		if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) needDomLTPre = false;
		for (const c of dom) {
			hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
			hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
			if (gt) {
				if (needDomGTPre) {
					if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) needDomGTPre = false;
				}
				if (c.operator === ">" || c.operator === ">=") {
					higher = higherGT(gt, c, options);
					if (higher === c && higher !== gt) return false;
				} else if (gt.operator === ">=" && !c.test(gt.semver)) return false;
			}
			if (lt) {
				if (needDomLTPre) {
					if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) needDomLTPre = false;
				}
				if (c.operator === "<" || c.operator === "<=") {
					lower = lowerLT(lt, c, options);
					if (lower === c && lower !== lt) return false;
				} else if (lt.operator === "<=" && !c.test(lt.semver)) return false;
			}
			if (!c.operator && (lt || gt) && gtltComp !== 0) return false;
		}
		if (gt && hasDomLT && !lt && gtltComp !== 0) return false;
		if (lt && hasDomGT && !gt && gtltComp !== 0) return false;
		if (needDomGTPre || needDomLTPre) return false;
		return true;
	};
	const higherGT = (a, b, options) => {
		if (!a) return b;
		const comp = compare(a.semver, b.semver, options);
		return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
	};
	const lowerLT = (a, b, options) => {
		if (!a) return b;
		const comp = compare(a.semver, b.semver, options);
		return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
	};
	module.exports = subset;
}));
//#endregion
//#region node_modules/semver/index.js
var require_semver = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const internalRe = require_re();
	const constants = require_constants();
	const SemVer = require_semver$1();
	const identifiers = require_identifiers();
	module.exports = {
		parse: require_parse(),
		valid: require_valid$1(),
		clean: require_clean(),
		inc: require_inc(),
		diff: require_diff(),
		major: require_major(),
		minor: require_minor(),
		patch: require_patch(),
		prerelease: require_prerelease(),
		compare: require_compare(),
		rcompare: require_rcompare(),
		compareLoose: require_compare_loose(),
		compareBuild: require_compare_build(),
		sort: require_sort(),
		rsort: require_rsort(),
		gt: require_gt(),
		lt: require_lt(),
		eq: require_eq(),
		neq: require_neq(),
		gte: require_gte(),
		lte: require_lte(),
		cmp: require_cmp(),
		coerce: require_coerce(),
		truncate: require_truncate(),
		Comparator: require_comparator(),
		Range: require_range(),
		satisfies: require_satisfies(),
		toComparators: require_to_comparators(),
		maxSatisfying: require_max_satisfying(),
		minSatisfying: require_min_satisfying(),
		minVersion: require_min_version(),
		validRange: require_valid(),
		outside: require_outside(),
		gtr: require_gtr(),
		ltr: require_ltr(),
		intersects: require_intersects(),
		simplifyRange: require_simplify(),
		subset: require_subset(),
		SemVer,
		re: internalRe.re,
		src: internalRe.src,
		tokens: internalRe.t,
		SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
		RELEASE_TYPES: constants.RELEASE_TYPES,
		compareIdentifiers: identifiers.compareIdentifiers,
		rcompareIdentifiers: identifiers.rcompareIdentifiers
	};
}));
require_get();
require_isEqual();
require_keyBy();
require_last();
require_set();
require_size();
require_filter();
require_groupBy();
require_orderBy();
require_first();
require_flatten();
require_mapValues();
require_zip();
require_semver();
/**
* iconv-cp932
*
* @see https://www.npmjs.com/package/iconv-cp932
*/
const CP932 = {
	"0": "\0\x07\b	\n\v\f\r\x1B !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
	"8140": "　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈〉《》「」『』【】＋－±×",
	"8180": "÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓",
	"8260": "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ",
	"8281": "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ",
	"8340": "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミ",
	"8380": "ムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ",
	"8440": "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
	"8470": "абвгдеёжзийклмн",
	"8480": "опрстуфхцчшщъыьэюя",
	"8740": "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ",
	"8780": "〝〟№㏍℡㊤㊥㊦㊧㊨㈱㈲㈹㍾㍽㍼",
	"8793": "∮∑",
	"8798": "∟⊿",
	"8940": "院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円",
	"8980": "園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改",
	"9040": "拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨",
	"9080": "逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線",
	"9140": "繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻",
	"9180": "操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只",
	"9240": "叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄",
	"9280": "逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓",
	"9340": "邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬",
	"9380": "凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入",
	"9440": "如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅",
	"9480": "楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美",
	"9540": "鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷",
	"9580": "斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋",
	"9640": "法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆",
	"9680": "摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒",
	"9740": "諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲",
	"9780": "沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯",
	"9840": "蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕",
	"9940": "僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭",
	"9980": "凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨",
	"A1": "｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ",
	"81B8": "∈∋⊆⊇⊂⊃∪∩",
	"81C8": "∧∨￢⇒⇔∀∃",
	"81DA": "∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬",
	"81F0": "Å‰♯♭♪†‡¶",
	"81FC": "◯",
	"824F": "０１２３４５６７８９",
	"829F": "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをん",
	"839F": "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
	"83BF": "αβγδεζηθικλμνξοπρστυφχψω",
	"849F": "─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂",
	"875F": "㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡",
	"877E": "㍻",
	"889F": "亜唖娃阿哀愛挨姶逢葵茜穐悪握渥旭葦芦鯵梓圧斡扱宛姐虻飴絢綾鮎或粟袷安庵按暗案闇鞍杏以伊位依偉囲夷委威尉惟意慰易椅為畏異移維緯胃萎衣謂違遺医井亥域育郁磯一壱溢逸稲茨芋鰯允印咽員因姻引飲淫胤蔭",
	"8A40": "魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫",
	"8A80": "橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄",
	"8B40": "機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救",
	"8B80": "朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈",
	"8C40": "掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨",
	"8C80": "劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向",
	"8D40": "后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降",
	"8D80": "項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷",
	"8E40": "察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止",
	"8E80": "死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周",
	"8F40": "宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳",
	"8F80": "準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾",
	"989F": "弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲",
	"9A40": "咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸",
	"9A80": "噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩",
	"9B40": "奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀",
	"9B80": "它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏",
	"9C40": "廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠",
	"9C80": "怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛",
	"9D40": "戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫",
	"9D80": "捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼",
	"9E40": "曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎",
	"9E80": "梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣",
	"9F40": "檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯",
	"9F80": "麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌",
	"E040": "漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝",
	"E080": "烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱",
	"E140": "瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿",
	"E180": "痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬",
	"E240": "磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰",
	"E280": "窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆",
	"E340": "紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷",
	"E380": "縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋",
	"E440": "隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤",
	"E480": "艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈",
	"E540": "蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬",
	"E580": "蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞",
	"E640": "襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧",
	"E680": "諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊",
	"E740": "蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜",
	"E780": "轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮",
	"E840": "錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙",
	"E880": "閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰",
	"E940": "顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃",
	"E980": "騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈",
	"EA40": "鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯",
	"EA80": "黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠堯槇遙瑤凜熙",
	"ED40": "纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏",
	"ED80": "塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱",
	"EE40": "犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙",
	"EE80": "蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑",
	"EEEF": "ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ",
	"EEFA": "￤＇＂"
};
const IBM = {
	"FA40": "ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ￢￤＇＂㈱№℡∵纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊",
	"FA80": "兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯",
	"FB40": "涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神",
	"FB80": "祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙",
	"FC40": "髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"
};
/**
* GETA MARK "〓"
*/
let UNKNOWN = "%81%AC";
let unknownSize = 2;
/**
* lazy build
*/
const lazy = (fn) => {
	let v;
	return () => v || (v = fn());
};
const cached = (fn) => {
	const cache = {};
	return (ns) => cache[ns] || (cache[ns] = fn(ns));
};
/**
* @param str {string} CP932 URI encoded string e.g. "%94%FC"
* @return {string} UTF-8 string e.g. "美"
*/
function decodeURIComponent$1(str) {
	const decodeTable = getDecodeTable();
	return unescape(str).replace(/[\x80-\x9F\xE0-\xFF][\x00-\xFF]|[\xA0-\xDF]/g, (s) => {
		return decodeTable[s] || cachedDecode("%81%AC");
	});
}
/**
* @param str {string} UTF-8 string e.g. "美"
* @return {Uint8Array} CP932 Binary e.g. [0x94, 0xFC]
*/
function encode(str) {
	const encodeBinTable = getEncodeBinTable();
	const { length } = str;
	const chrSize = Math.max(unknownSize, 2);
	const bufSize = length * chrSize;
	const buffer = new Uint8Array(bufSize);
	let unknown;
	let i = 0;
	let cur = 0;
	while (i < length) {
		let code = encodeBinTable[str[i++]];
		if (code == null) {
			if (!unknown) {
				unknown = cachedEncode(UNKNOWN);
				unknownSize = unknown.length;
				if (unknownSize > chrSize) return encode(str);
			}
			for (let j = 0; j < unknownSize; j++) buffer[cur++] = unknown[j];
		} else if (code < 256) buffer[cur++] = code;
		else {
			buffer[cur++] = code >> 8;
			buffer[cur++] = code & 255;
		}
	}
	if (cur === bufSize) return buffer;
	return buffer.slice(0, cur);
}
/**
* @private
*/
const cachedEncode = cached((c) => {
	return encode(decodeURIComponent$1(c));
});
const cachedDecode = cached(decodeURIComponent$1);
const getDecodeTable = lazy(() => {
	const table = {};
	decoderMapping((jcode, ustr) => {
		let jstr = String.fromCharCode(jcode & 255);
		if (jcode > 255) jstr = String.fromCharCode(jcode >> 8) + jstr;
		table[jstr] = ustr;
	});
	return table;
});
const decoderMapping = (fn) => {
	applyMapping(CP932, fn);
	applyMapping(IBM, fn);
};
const getEncodeBinTable = lazy(() => {
	const table = {};
	encoderMapping((jcode, ustr) => table[ustr] = jcode);
	return table;
});
const encoderMapping = (fn) => {
	applyMapping(CP932, fn);
};
const applyMapping = (mapping, fn) => {
	Object.keys(mapping).forEach((start) => {
		let jcode = parseInt(start, 16);
		mapping[start].split("").forEach((ustr) => fn(jcode++, ustr));
	});
};
(/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayMap = require__arrayMap(), baseIteratee = require__baseIteratee(), baseMap = require__baseMap(), isArray = require_isArray();
	/**
	* Creates an array of values by running each element in `collection` thru
	* `iteratee`. The iteratee is invoked with three arguments:
	* (value, index|key, collection).
	*
	* Many lodash methods are guarded to work as iteratees for methods like
	* `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	*
	* The guarded methods are:
	* `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
	* `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
	* `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
	* `template`, `trim`, `trimEnd`, `trimStart`, and `words`
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Collection
	* @param {Array|Object} collection The collection to iterate over.
	* @param {Function} [iteratee=_.identity] The function invoked per iteration.
	* @returns {Array} Returns the new mapped array.
	* @example
	*
	* function square(n) {
	*   return n * n;
	* }
	*
	* _.map([4, 8], square);
	* // => [16, 64]
	*
	* _.map({ 'a': 4, 'b': 8 }, square);
	* // => [16, 64] (iteration order is not guaranteed)
	*
	* var users = [
	*   { 'user': 'barney' },
	*   { 'user': 'fred' }
	* ];
	*
	* // The `_.property` iteratee shorthand.
	* _.map(users, 'user');
	* // => ['barney', 'fred']
	*/
	function map(collection, iteratee) {
		return (isArray(collection) ? arrayMap : baseMap)(collection, baseIteratee(iteratee, 3));
	}
	module.exports = map;
})))();
new Map(Object.entries({
	"2": {
		name: "Fountain of Dreams",
		mode: "vs"
	},
	"3": {
		name: "Pokémon Stadium",
		mode: "vs"
	},
	"4": {
		name: "Princess Peach's Castle",
		mode: "vs"
	},
	"5": {
		name: "Kongo Jungle",
		mode: "vs"
	},
	"6": {
		name: "Brinstar",
		mode: "vs"
	},
	"7": {
		name: "Corneria",
		mode: "vs"
	},
	"8": {
		name: "Yoshi's Story",
		mode: "vs"
	},
	"9": {
		name: "Onett",
		mode: "vs"
	},
	"10": {
		name: "Mute City",
		mode: "vs"
	},
	"11": {
		name: "Rainbow Cruise",
		mode: "vs"
	},
	"12": {
		name: "Jungle Japes",
		mode: "vs"
	},
	"13": {
		name: "Great Bay",
		mode: "vs"
	},
	"14": {
		name: "Hyrule Temple",
		mode: "vs"
	},
	"15": {
		name: "Brinstar Depths",
		mode: "vs"
	},
	"16": {
		name: "Yoshi's Island",
		mode: "vs"
	},
	"17": {
		name: "Green Greens",
		mode: "vs"
	},
	"18": {
		name: "Fourside",
		mode: "vs"
	},
	"19": {
		name: "Mushroom Kingdom I",
		mode: "vs"
	},
	"20": {
		name: "Mushroom Kingdom II",
		mode: "vs"
	},
	"22": {
		name: "Venom",
		mode: "vs"
	},
	"23": {
		name: "Poké Floats",
		mode: "vs"
	},
	"24": {
		name: "Big Blue",
		mode: "vs"
	},
	"25": {
		name: "Icicle Mountain",
		mode: "vs"
	},
	"26": {
		name: "Icetop",
		mode: "vs"
	},
	"27": {
		name: "Flat Zone",
		mode: "vs"
	},
	"28": {
		name: "Dream Land N64",
		mode: "vs"
	},
	"29": {
		name: "Yoshi's Island N64",
		mode: "vs"
	},
	"30": {
		name: "Kongo Jungle N64",
		mode: "vs"
	},
	"31": {
		name: "Battlefield",
		mode: "vs"
	},
	"32": {
		name: "Final Destination",
		mode: "vs"
	},
	"33": {
		name: "Target Test (Mario)",
		mode: "target-test"
	},
	"34": {
		name: "Target Test (Captain Falcon)",
		mode: "target-test"
	},
	"35": {
		name: "Target Test (Young Link)",
		mode: "target-test"
	},
	"36": {
		name: "Target Test (Donkey Kong)",
		mode: "target-test"
	},
	"37": {
		name: "Target Test (Dr. Mario)",
		mode: "target-test"
	},
	"38": {
		name: "Target Test (Falco)",
		mode: "target-test"
	},
	"39": {
		name: "Target Test (Fox)",
		mode: "target-test"
	},
	"40": {
		name: "Target Test (Ice Climbers)",
		mode: "target-test"
	},
	"41": {
		name: "Target Test (Kirby)",
		mode: "target-test"
	},
	"42": {
		name: "Target Test (Bowser)",
		mode: "target-test"
	},
	"43": {
		name: "Target Test (Link)",
		mode: "target-test"
	},
	"44": {
		name: "Target Test (Luigi)",
		mode: "target-test"
	},
	"45": {
		name: "Target Test (Marth)",
		mode: "target-test"
	},
	"46": {
		name: "Target Test (Mewtwo)",
		mode: "target-test"
	},
	"47": {
		name: "Target Test (Ness)",
		mode: "target-test"
	},
	"48": {
		name: "Target Test (Peach)",
		mode: "target-test"
	},
	"49": {
		name: "Target Test (Pichu)",
		mode: "target-test"
	},
	"50": {
		name: "Target Test (Pikachu)",
		mode: "target-test"
	},
	"51": {
		name: "Target Test (Jigglypuff)",
		mode: "target-test"
	},
	"52": {
		name: "Target Test (Samus)",
		mode: "target-test"
	},
	"53": {
		name: "Target Test (Sheik)",
		mode: "target-test"
	},
	"54": {
		name: "Target Test (Yoshi)",
		mode: "target-test"
	},
	"55": {
		name: "Target Test (Zelda)",
		mode: "target-test"
	},
	"56": {
		name: "Target Test (Mr. Game & Watch)",
		mode: "target-test"
	},
	"57": {
		name: "Target Test (Roy)",
		mode: "target-test"
	},
	"58": {
		name: "Target Test (Ganondorf)",
		mode: "target-test"
	},
	"84": {
		name: "Home-Run Contest",
		mode: "home-run-contest"
	}
}).map(([key, value]) => {
	const stageId = parseInt(key);
	return [stageId, {
		id: stageId,
		name: value.name,
		mode: value.mode
	}];
}));
var Character;
(function(Character) {
	Character[Character["CAPTAIN_FALCON"] = 0] = "CAPTAIN_FALCON";
	Character[Character["DONKEY_KONG"] = 1] = "DONKEY_KONG";
	Character[Character["FOX"] = 2] = "FOX";
	Character[Character["GAME_AND_WATCH"] = 3] = "GAME_AND_WATCH";
	Character[Character["KIRBY"] = 4] = "KIRBY";
	Character[Character["BOWSER"] = 5] = "BOWSER";
	Character[Character["LINK"] = 6] = "LINK";
	Character[Character["LUIGI"] = 7] = "LUIGI";
	Character[Character["MARIO"] = 8] = "MARIO";
	Character[Character["MARTH"] = 9] = "MARTH";
	Character[Character["MEWTWO"] = 10] = "MEWTWO";
	Character[Character["NESS"] = 11] = "NESS";
	Character[Character["PEACH"] = 12] = "PEACH";
	Character[Character["PIKACHU"] = 13] = "PIKACHU";
	Character[Character["ICE_CLIMBERS"] = 14] = "ICE_CLIMBERS";
	Character[Character["JIGGLYPUFF"] = 15] = "JIGGLYPUFF";
	Character[Character["SAMUS"] = 16] = "SAMUS";
	Character[Character["YOSHI"] = 17] = "YOSHI";
	Character[Character["ZELDA"] = 18] = "ZELDA";
	Character[Character["SHEIK"] = 19] = "SHEIK";
	Character[Character["FALCO"] = 20] = "FALCO";
	Character[Character["YOUNG_LINK"] = 21] = "YOUNG_LINK";
	Character[Character["DR_MARIO"] = 22] = "DR_MARIO";
	Character[Character["ROY"] = 23] = "ROY";
	Character[Character["PICHU"] = 24] = "PICHU";
	Character[Character["GANONDORF"] = 25] = "GANONDORF";
	Character[Character["MASTER_HAND"] = 26] = "MASTER_HAND";
	Character[Character["WIREFRAME_MALE"] = 27] = "WIREFRAME_MALE";
	Character[Character["WIREFRAME_FEMALE"] = 28] = "WIREFRAME_FEMALE";
	Character[Character["GIGA_BOWSER"] = 29] = "GIGA_BOWSER";
	Character[Character["CRAZY_HAND"] = 30] = "CRAZY_HAND";
	Character[Character["SANDBAG"] = 31] = "SANDBAG";
	Character[Character["POPO"] = 32] = "POPO";
})(Character || (Character = {}));
var Stage;
(function(Stage) {
	Stage[Stage["FOUNTAIN_OF_DREAMS"] = 2] = "FOUNTAIN_OF_DREAMS";
	Stage[Stage["POKEMON_STADIUM"] = 3] = "POKEMON_STADIUM";
	Stage[Stage["PEACHS_CASTLE"] = 4] = "PEACHS_CASTLE";
	Stage[Stage["KONGO_JUNGLE"] = 5] = "KONGO_JUNGLE";
	Stage[Stage["BRINSTAR"] = 6] = "BRINSTAR";
	Stage[Stage["CORNERIA"] = 7] = "CORNERIA";
	Stage[Stage["YOSHIS_STORY"] = 8] = "YOSHIS_STORY";
	Stage[Stage["ONETT"] = 9] = "ONETT";
	Stage[Stage["MUTE_CITY"] = 10] = "MUTE_CITY";
	Stage[Stage["RAINBOW_CRUISE"] = 11] = "RAINBOW_CRUISE";
	Stage[Stage["JUNGLE_JAPES"] = 12] = "JUNGLE_JAPES";
	Stage[Stage["GREAT_BAY"] = 13] = "GREAT_BAY";
	Stage[Stage["HYRULE_TEMPLE"] = 14] = "HYRULE_TEMPLE";
	Stage[Stage["BRINSTAR_DEPTHS"] = 15] = "BRINSTAR_DEPTHS";
	Stage[Stage["YOSHIS_ISLAND"] = 16] = "YOSHIS_ISLAND";
	Stage[Stage["GREEN_GREENS"] = 17] = "GREEN_GREENS";
	Stage[Stage["FOURSIDE"] = 18] = "FOURSIDE";
	Stage[Stage["MUSHROOM_KINGDOM"] = 19] = "MUSHROOM_KINGDOM";
	Stage[Stage["MUSHROOM_KINGDOM_2"] = 20] = "MUSHROOM_KINGDOM_2";
	Stage[Stage["VENOM"] = 22] = "VENOM";
	Stage[Stage["POKE_FLOATS"] = 23] = "POKE_FLOATS";
	Stage[Stage["BIG_BLUE"] = 24] = "BIG_BLUE";
	Stage[Stage["ICICLE_MOUNTAIN"] = 25] = "ICICLE_MOUNTAIN";
	Stage[Stage["ICETOP"] = 26] = "ICETOP";
	Stage[Stage["FLAT_ZONE"] = 27] = "FLAT_ZONE";
	Stage[Stage["DREAMLAND"] = 28] = "DREAMLAND";
	Stage[Stage["YOSHIS_ISLAND_N64"] = 29] = "YOSHIS_ISLAND_N64";
	Stage[Stage["KONGO_JUNGLE_N64"] = 30] = "KONGO_JUNGLE_N64";
	Stage[Stage["BATTLEFIELD"] = 31] = "BATTLEFIELD";
	Stage[Stage["FINAL_DESTINATION"] = 32] = "FINAL_DESTINATION";
	Stage[Stage["TARGET_TEST_MARIO"] = 33] = "TARGET_TEST_MARIO";
	Stage[Stage["TARGET_TEST_CAPTAIN_FALCON"] = 34] = "TARGET_TEST_CAPTAIN_FALCON";
	Stage[Stage["TARGET_TEST_YOUNG_LINK"] = 35] = "TARGET_TEST_YOUNG_LINK";
	Stage[Stage["TARGET_TEST_DONKEY_KONG"] = 36] = "TARGET_TEST_DONKEY_KONG";
	Stage[Stage["TARGET_TEST_DR_MARIO"] = 37] = "TARGET_TEST_DR_MARIO";
	Stage[Stage["TARGET_TEST_FALCO"] = 38] = "TARGET_TEST_FALCO";
	Stage[Stage["TARGET_TEST_FOX"] = 39] = "TARGET_TEST_FOX";
	Stage[Stage["TARGET_TEST_ICE_CLIMBERS"] = 40] = "TARGET_TEST_ICE_CLIMBERS";
	Stage[Stage["TARGET_TEST_KIRBY"] = 41] = "TARGET_TEST_KIRBY";
	Stage[Stage["TARGET_TEST_BOWSER"] = 42] = "TARGET_TEST_BOWSER";
	Stage[Stage["TARGET_TEST_LINK"] = 43] = "TARGET_TEST_LINK";
	Stage[Stage["TARGET_TEST_LUIGI"] = 44] = "TARGET_TEST_LUIGI";
	Stage[Stage["TARGET_TEST_MARTH"] = 45] = "TARGET_TEST_MARTH";
	Stage[Stage["TARGET_TEST_MEWTWO"] = 46] = "TARGET_TEST_MEWTWO";
	Stage[Stage["TARGET_TEST_NESS"] = 47] = "TARGET_TEST_NESS";
	Stage[Stage["TARGET_TEST_PEACH"] = 48] = "TARGET_TEST_PEACH";
	Stage[Stage["TARGET_TEST_PICHU"] = 49] = "TARGET_TEST_PICHU";
	Stage[Stage["TARGET_TEST_PIKACHU"] = 50] = "TARGET_TEST_PIKACHU";
	Stage[Stage["TARGET_TEST_JIGGLYPUFF"] = 51] = "TARGET_TEST_JIGGLYPUFF";
	Stage[Stage["TARGET_TEST_SAMUS"] = 52] = "TARGET_TEST_SAMUS";
	Stage[Stage["TARGET_TEST_SHEIK"] = 53] = "TARGET_TEST_SHEIK";
	Stage[Stage["TARGET_TEST_YOSHI"] = 54] = "TARGET_TEST_YOSHI";
	Stage[Stage["TARGET_TEST_ZELDA"] = 55] = "TARGET_TEST_ZELDA";
	Stage[Stage["TARGET_TEST_GAME_AND_WATCH"] = 56] = "TARGET_TEST_GAME_AND_WATCH";
	Stage[Stage["TARGET_TEST_ROY"] = 57] = "TARGET_TEST_ROY";
	Stage[Stage["TARGET_TEST_GANONDORF"] = 58] = "TARGET_TEST_GANONDORF";
	Stage[Stage["RACE_TO_THE_FINISH"] = 82] = "RACE_TO_THE_FINISH";
	Stage[Stage["GRAB_THE_TROPHIES"] = 83] = "GRAB_THE_TROPHIES";
	Stage[Stage["HOME_RUN_CONTEST"] = 84] = "HOME_RUN_CONTEST";
	Stage[Stage["ALL_STAR_LOBBY"] = 85] = "ALL_STAR_LOBBY";
	Stage[Stage["EVENT_ONE"] = 202] = "EVENT_ONE";
	Stage[Stage["EVENT_EIGHTEEN"] = 203] = "EVENT_EIGHTEEN";
	Stage[Stage["EVENT_THREE"] = 204] = "EVENT_THREE";
	Stage[Stage["EVENT_FOUR"] = 205] = "EVENT_FOUR";
	Stage[Stage["EVENT_FIVE"] = 206] = "EVENT_FIVE";
	Stage[Stage["EVENT_SIX"] = 207] = "EVENT_SIX";
	Stage[Stage["EVENT_SEVEN"] = 208] = "EVENT_SEVEN";
	Stage[Stage["EVENT_EIGHT"] = 209] = "EVENT_EIGHT";
	Stage[Stage["EVENT_NINE"] = 210] = "EVENT_NINE";
	Stage[Stage["EVENT_TEN_PART_ONE"] = 211] = "EVENT_TEN_PART_ONE";
	Stage[Stage["EVENT_ELEVEN"] = 212] = "EVENT_ELEVEN";
	Stage[Stage["EVENT_TWELVE"] = 213] = "EVENT_TWELVE";
	Stage[Stage["EVENT_THIRTEEN"] = 214] = "EVENT_THIRTEEN";
	Stage[Stage["EVENT_FOURTEEN"] = 215] = "EVENT_FOURTEEN";
	Stage[Stage["EVENT_THIRTY_SEVEN"] = 216] = "EVENT_THIRTY_SEVEN";
	Stage[Stage["EVENT_SIXTEEN"] = 217] = "EVENT_SIXTEEN";
	Stage[Stage["EVENT_SEVENTEEN"] = 218] = "EVENT_SEVENTEEN";
	Stage[Stage["EVENT_TWO"] = 219] = "EVENT_TWO";
	Stage[Stage["EVENT_NINETEEN"] = 220] = "EVENT_NINETEEN";
	Stage[Stage["EVENT_TWENTY_PART_ONE"] = 221] = "EVENT_TWENTY_PART_ONE";
	Stage[Stage["EVENT_TWENTY_ONE"] = 222] = "EVENT_TWENTY_ONE";
	Stage[Stage["EVENT_TWENTY_TWO"] = 223] = "EVENT_TWENTY_TWO";
	Stage[Stage["EVENT_TWENTY_SEVEN"] = 224] = "EVENT_TWENTY_SEVEN";
	Stage[Stage["EVENT_TWENTY_FOUR"] = 225] = "EVENT_TWENTY_FOUR";
	Stage[Stage["EVENT_TWENTY_FIVE"] = 226] = "EVENT_TWENTY_FIVE";
	Stage[Stage["EVENT_TWENTY_SIX"] = 227] = "EVENT_TWENTY_SIX";
	Stage[Stage["EVENT_TWENTY_THREE"] = 228] = "EVENT_TWENTY_THREE";
	Stage[Stage["EVENT_TWENTY_EIGHT"] = 229] = "EVENT_TWENTY_EIGHT";
	Stage[Stage["EVENT_TWENTY_NINE"] = 230] = "EVENT_TWENTY_NINE";
	Stage[Stage["EVENT_THIRTY_PART_ONE"] = 231] = "EVENT_THIRTY_PART_ONE";
	Stage[Stage["EVENT_THIRTY_ONE"] = 232] = "EVENT_THIRTY_ONE";
	Stage[Stage["EVENT_THIRTY_TWO"] = 233] = "EVENT_THIRTY_TWO";
	Stage[Stage["EVENT_THIRTY_THREE"] = 234] = "EVENT_THIRTY_THREE";
	Stage[Stage["EVENT_THIRTY_FOUR"] = 235] = "EVENT_THIRTY_FOUR";
	Stage[Stage["EVENT_FORTY_EIGHT"] = 236] = "EVENT_FORTY_EIGHT";
	Stage[Stage["EVENT_THIRTY_SIX_PART_ONE"] = 237] = "EVENT_THIRTY_SIX_PART_ONE";
	Stage[Stage["EVENT_FIFTEEN"] = 238] = "EVENT_FIFTEEN";
	Stage[Stage["EVENT_THIRTY_EIGHT"] = 239] = "EVENT_THIRTY_EIGHT";
	Stage[Stage["EVENT_THIRTY_NINE"] = 240] = "EVENT_THIRTY_NINE";
	Stage[Stage["EVENT_FORTY_PART_ONE"] = 241] = "EVENT_FORTY_PART_ONE";
	Stage[Stage["EVENT_FORTY_ONE"] = 242] = "EVENT_FORTY_ONE";
	Stage[Stage["EVENT_FORTY_TWO"] = 243] = "EVENT_FORTY_TWO";
	Stage[Stage["EVENT_FORTY_THREE"] = 244] = "EVENT_FORTY_THREE";
	Stage[Stage["EVENT_FORTY_FOUR"] = 245] = "EVENT_FORTY_FOUR";
	Stage[Stage["EVENT_FORTY_FIVE"] = 246] = "EVENT_FORTY_FIVE";
	Stage[Stage["EVENT_FORTY_SIX"] = 247] = "EVENT_FORTY_SIX";
	Stage[Stage["EVENT_FORTY_SEVEN"] = 248] = "EVENT_FORTY_SEVEN";
	Stage[Stage["EVENT_THIRTY_FIVE"] = 249] = "EVENT_THIRTY_FIVE";
	Stage[Stage["EVENT_FORTY_NINE_PART_ONE"] = 250] = "EVENT_FORTY_NINE_PART_ONE";
	Stage[Stage["EVENT_FIFTY"] = 251] = "EVENT_FIFTY";
	Stage[Stage["EVENT_FIFTY_ONE"] = 252] = "EVENT_FIFTY_ONE";
	Stage[Stage["EVENT_TEN_PART_TWO"] = 253] = "EVENT_TEN_PART_TWO";
	Stage[Stage["EVENT_TEN_PART_THREE"] = 254] = "EVENT_TEN_PART_THREE";
	Stage[Stage["EVENT_TEN_PART_FOUR"] = 255] = "EVENT_TEN_PART_FOUR";
	Stage[Stage["EVENT_TEN_PART_FIVE"] = 256] = "EVENT_TEN_PART_FIVE";
	Stage[Stage["EVENT_TWENTY_PART_TWO"] = 257] = "EVENT_TWENTY_PART_TWO";
	Stage[Stage["EVENT_TWENTY_PART_THREE"] = 258] = "EVENT_TWENTY_PART_THREE";
	Stage[Stage["EVENT_TWENTY_PART_FOUR"] = 259] = "EVENT_TWENTY_PART_FOUR";
	Stage[Stage["EVENT_TWENTY_PART_FIVE"] = 260] = "EVENT_TWENTY_PART_FIVE";
	Stage[Stage["EVENT_THIRTY_PART_TWO"] = 261] = "EVENT_THIRTY_PART_TWO";
	Stage[Stage["EVENT_THIRTY_PART_THREE"] = 262] = "EVENT_THIRTY_PART_THREE";
	Stage[Stage["EVENT_THIRTY_PART_FOUR"] = 263] = "EVENT_THIRTY_PART_FOUR";
	Stage[Stage["EVENT_FORTY_PART_TWO"] = 264] = "EVENT_FORTY_PART_TWO";
	Stage[Stage["EVENT_FORTY_PART_THREE"] = 265] = "EVENT_FORTY_PART_THREE";
	Stage[Stage["EVENT_FORTY_PART_FOUR"] = 266] = "EVENT_FORTY_PART_FOUR";
	Stage[Stage["EVENT_FORTY_PART_FIVE"] = 267] = "EVENT_FORTY_PART_FIVE";
	Stage[Stage["EVENT_FORTY_NINE_PART_TWO"] = 268] = "EVENT_FORTY_NINE_PART_TWO";
	Stage[Stage["EVENT_FORTY_NINE_PART_THREE"] = 269] = "EVENT_FORTY_NINE_PART_THREE";
	Stage[Stage["EVENT_FORTY_NINE_PART_FOUR"] = 270] = "EVENT_FORTY_NINE_PART_FOUR";
	Stage[Stage["EVENT_FORTY_NINE_PART_FIVE"] = 271] = "EVENT_FORTY_NINE_PART_FIVE";
	Stage[Stage["EVENT_FORTY_NINE_PART_SIX"] = 272] = "EVENT_FORTY_NINE_PART_SIX";
	Stage[Stage["EVENT_THIRTY_SIX_PART_TWO"] = 273] = "EVENT_THIRTY_SIX_PART_TWO";
	Stage[Stage["MULTI_MAN_MELEE"] = 285] = "MULTI_MAN_MELEE";
})(Stage || (Stage = {}));
const State = {
	DAMAGE_START: 75,
	DAMAGE_END: 91,
	CAPTURE_START: 223,
	CAPTURE_END: 232,
	GUARD_START: 178,
	GUARD_END: 182,
	GROUNDED_CONTROL_START: 14,
	GROUNDED_CONTROL_END: 24,
	SQUAT_START: 39,
	SQUAT_END: 41,
	DOWN_START: 183,
	DOWN_END: 198,
	TECH_START: 199,
	TECH_END: 204,
	DYING_START: 0,
	DYING_END: 10,
	CONTROLLED_JUMP_START: 24,
	CONTROLLED_JUMP_END: 34,
	GROUND_ATTACK_START: 44,
	GROUND_ATTACK_END: 64,
	AERIAL_ATTACK_START: 65,
	AERIAL_LANDING_START: 70,
	AERIAL_LANDING_END: 74,
	ATTACK_FTILT_START: 51,
	ATTACK_FTILT_END: 55,
	ATTACK_FSMASH_START: 58,
	ATTACK_FSMASH_END: 62,
	ROLL_FORWARD: 233,
	ROLL_BACKWARD: 234,
	SPOT_DODGE: 235,
	AIR_DODGE: 236,
	ACTION_WAIT: 14,
	ACTION_DASH: 20,
	ACTION_KNEE_BEND: 24,
	GUARD_ON: 178,
	TECH_MISS_UP: 183,
	JAB_RESET_UP: 185,
	TECH_MISS_DOWN: 191,
	JAB_RESET_DOWN: 193,
	NEUTRAL_TECH: 199,
	FORWARD_TECH: 200,
	BACKWARD_TECH: 201,
	WALL_TECH: 202,
	MISSED_WALL_TECH: 247,
	DASH: 20,
	TURN: 18,
	LANDING_FALL_SPECIAL: 43,
	JUMP_FORWARD: 25,
	JUMP_BACKWARD: 26,
	FALL: 29,
	FALL_FORWARD: 30,
	FALL_BACKWARD: 31,
	GRAB: 212,
	DASH_GRAB: 214,
	GRAB_WAIT: 216,
	PUMMEL: 217,
	CLIFF_CATCH: 252,
	THROW_UP: 221,
	THROW_FORWARD: 219,
	THROW_DOWN: 222,
	THROW_BACK: 220,
	DAMAGE_FALL: 38,
	ATTACK_JAB1: 44,
	ATTACK_JAB2: 45,
	ATTACK_JAB3: 46,
	ATTACK_JABM: 47,
	ATTACK_DASH: 50,
	ATTACK_UTILT: 56,
	ATTACK_DTILT: 57,
	ATTACK_USMASH: 63,
	ATTACK_DSMASH: 64,
	AERIAL_NAIR: 65,
	AERIAL_FAIR: 66,
	AERIAL_BAIR: 67,
	AERIAL_UAIR: 68,
	AERIAL_DAIR: 69,
	AERIAL_NAIR_LANDING: 70,
	AERIAL_FAIR_LANDING: 71,
	AERIAL_BAIR_LANDING: 72,
	AERIAL_UAIR_LANDING: 73,
	AERIAL_DAIR_LANDING: 74,
	TEETER: 245,
	GNW_JAB1: 341,
	GNW_JABM: 342,
	GNW_DTILT: 345,
	GNW_FSMASH: 346,
	GNW_NAIR: 347,
	GNW_BAIR: 348,
	GNW_UAIR: 349,
	PEACH_FSMASH1: 349,
	PEACH_FSMASH2: 350,
	PEACH_FSMASH3: 351,
	BARREL_WAIT: 293,
	COMMAND_GRAB_RANGE1_START: 266,
	COMMAND_GRAB_RANGE1_END: 304,
	COMMAND_GRAB_RANGE2_START: 327,
	COMMAND_GRAB_RANGE2_END: 338
};
State.DASH, State.TURN, State.DASH;
var ComboEvent;
(function(ComboEvent) {
	ComboEvent["COMBO_START"] = "COMBO_START";
	ComboEvent["COMBO_EXTEND"] = "COMBO_EXTEND";
	ComboEvent["COMBO_END"] = "COMBO_END";
})(ComboEvent || (ComboEvent = {}));
var Command$1;
(function(Command) {
	Command[Command["SPLIT_MESSAGE"] = 16] = "SPLIT_MESSAGE";
	Command[Command["MESSAGE_SIZES"] = 53] = "MESSAGE_SIZES";
	Command[Command["GAME_START"] = 54] = "GAME_START";
	Command[Command["PRE_FRAME_UPDATE"] = 55] = "PRE_FRAME_UPDATE";
	Command[Command["POST_FRAME_UPDATE"] = 56] = "POST_FRAME_UPDATE";
	Command[Command["GAME_END"] = 57] = "GAME_END";
	Command[Command["FRAME_START"] = 58] = "FRAME_START";
	Command[Command["ITEM_UPDATE"] = 59] = "ITEM_UPDATE";
	Command[Command["FRAME_BOOKEND"] = 60] = "FRAME_BOOKEND";
	Command[Command["GECKO_LIST"] = 61] = "GECKO_LIST";
	Command[Command["FOD_PLATFORM"] = 63] = "FOD_PLATFORM";
	Command[Command["WHISPY"] = 64] = "WHISPY";
	Command[Command["STADIUM_TRANSFORMATION"] = 65] = "STADIUM_TRANSFORMATION";
})(Command$1 || (Command$1 = {}));
var GameMode;
(function(GameMode) {
	GameMode[GameMode["VS"] = 2] = "VS";
	GameMode[GameMode["ONLINE"] = 8] = "ONLINE";
	GameMode[GameMode["TARGET_TEST"] = 15] = "TARGET_TEST";
	GameMode[GameMode["HOME_RUN_CONTEST"] = 32] = "HOME_RUN_CONTEST";
})(GameMode || (GameMode = {}));
var Language;
(function(Language) {
	Language[Language["JAPANESE"] = 0] = "JAPANESE";
	Language[Language["ENGLISH"] = 1] = "ENGLISH";
})(Language || (Language = {}));
var TimerType;
(function(TimerType) {
	TimerType[TimerType["NONE"] = 0] = "NONE";
	TimerType[TimerType["DECREASING"] = 2] = "DECREASING";
	TimerType[TimerType["INCREASING"] = 3] = "INCREASING";
})(TimerType || (TimerType = {}));
var ItemSpawnType;
(function(ItemSpawnType) {
	ItemSpawnType[ItemSpawnType["OFF"] = 255] = "OFF";
	ItemSpawnType[ItemSpawnType["VERY_LOW"] = 0] = "VERY_LOW";
	ItemSpawnType[ItemSpawnType["LOW"] = 1] = "LOW";
	ItemSpawnType[ItemSpawnType["MEDIUM"] = 2] = "MEDIUM";
	ItemSpawnType[ItemSpawnType["HIGH"] = 3] = "HIGH";
	ItemSpawnType[ItemSpawnType["VERY_HIGH"] = 4] = "VERY_HIGH";
})(ItemSpawnType || (ItemSpawnType = {}));
var EnabledItemType;
(function(EnabledItemType) {
	EnabledItemType[EnabledItemType["METAL_BOX"] = 1] = "METAL_BOX";
	EnabledItemType[EnabledItemType["CLOAKING_DEVICE"] = 2] = "CLOAKING_DEVICE";
	EnabledItemType[EnabledItemType["POKEBALL"] = 4] = "POKEBALL";
	EnabledItemType[EnabledItemType["UNKNOWN_ITEM_BIT_4"] = 8] = "UNKNOWN_ITEM_BIT_4";
	EnabledItemType[EnabledItemType["UNKNOWN_ITEM_BIT_5"] = 16] = "UNKNOWN_ITEM_BIT_5";
	EnabledItemType[EnabledItemType["UNKNOWN_ITEM_BIT_6"] = 32] = "UNKNOWN_ITEM_BIT_6";
	EnabledItemType[EnabledItemType["UNKNOWN_ITEM_BIT_7"] = 64] = "UNKNOWN_ITEM_BIT_7";
	EnabledItemType[EnabledItemType["UNKNOWN_ITEM_BIT_8"] = 128] = "UNKNOWN_ITEM_BIT_8";
	EnabledItemType[EnabledItemType["FAN"] = 256] = "FAN";
	EnabledItemType[EnabledItemType["FIRE_FLOWER"] = 512] = "FIRE_FLOWER";
	EnabledItemType[EnabledItemType["SUPER_MUSHROOM"] = 1024] = "SUPER_MUSHROOM";
	EnabledItemType[EnabledItemType["POISON_MUSHROOM"] = 2048] = "POISON_MUSHROOM";
	EnabledItemType[EnabledItemType["HAMMER"] = 4096] = "HAMMER";
	EnabledItemType[EnabledItemType["WARP_STAR"] = 8192] = "WARP_STAR";
	EnabledItemType[EnabledItemType["SCREW_ATTACK"] = 16384] = "SCREW_ATTACK";
	EnabledItemType[EnabledItemType["BUNNY_HOOD"] = 32768] = "BUNNY_HOOD";
	EnabledItemType[EnabledItemType["RAY_GUN"] = 65536] = "RAY_GUN";
	EnabledItemType[EnabledItemType["FREEZIE"] = 131072] = "FREEZIE";
	EnabledItemType[EnabledItemType["FOOD"] = 262144] = "FOOD";
	EnabledItemType[EnabledItemType["MOTION_SENSOR_BOMB"] = 524288] = "MOTION_SENSOR_BOMB";
	EnabledItemType[EnabledItemType["FLIPPER"] = 1048576] = "FLIPPER";
	EnabledItemType[EnabledItemType["SUPER_SCOPE"] = 2097152] = "SUPER_SCOPE";
	EnabledItemType[EnabledItemType["STAR_ROD"] = 4194304] = "STAR_ROD";
	EnabledItemType[EnabledItemType["LIPS_STICK"] = 8388608] = "LIPS_STICK";
	EnabledItemType[EnabledItemType["HEART_CONTAINER"] = 16777216] = "HEART_CONTAINER";
	EnabledItemType[EnabledItemType["MAXIM_TOMATO"] = 33554432] = "MAXIM_TOMATO";
	EnabledItemType[EnabledItemType["STARMAN"] = 67108864] = "STARMAN";
	EnabledItemType[EnabledItemType["HOME_RUN_BAT"] = 134217728] = "HOME_RUN_BAT";
	EnabledItemType[EnabledItemType["BEAM_SWORD"] = 268435456] = "BEAM_SWORD";
	EnabledItemType[EnabledItemType["PARASOL"] = 536870912] = "PARASOL";
	EnabledItemType[EnabledItemType["GREEN_SHELL"] = 1073741824] = "GREEN_SHELL";
	EnabledItemType[EnabledItemType["RED_SHELL"] = 2147483648] = "RED_SHELL";
	EnabledItemType[EnabledItemType["CAPSULE"] = 4294967296] = "CAPSULE";
	EnabledItemType[EnabledItemType["BOX"] = 8589934592] = "BOX";
	EnabledItemType[EnabledItemType["BARREL"] = 17179869184] = "BARREL";
	EnabledItemType[EnabledItemType["EGG"] = 34359738368] = "EGG";
	EnabledItemType[EnabledItemType["PARTY_BALL"] = 68719476736] = "PARTY_BALL";
	EnabledItemType[EnabledItemType["BARREL_CANNON"] = 137438953472] = "BARREL_CANNON";
	EnabledItemType[EnabledItemType["BOMB_OMB"] = 274877906944] = "BOMB_OMB";
	EnabledItemType[EnabledItemType["MR_SATURN"] = 549755813888] = "MR_SATURN";
})(EnabledItemType || (EnabledItemType = {}));
var GameEndMethod;
(function(GameEndMethod) {
	GameEndMethod[GameEndMethod["UNRESOLVED"] = 0] = "UNRESOLVED";
	GameEndMethod[GameEndMethod["RESOLVED"] = 3] = "RESOLVED";
	GameEndMethod[GameEndMethod["TIME"] = 1] = "TIME";
	GameEndMethod[GameEndMethod["GAME"] = 2] = "GAME";
	GameEndMethod[GameEndMethod["NO_CONTEST"] = 7] = "NO_CONTEST";
})(GameEndMethod || (GameEndMethod = {}));
var FodPlatformSide;
(function(FodPlatformSide) {
	FodPlatformSide[FodPlatformSide["RIGHT"] = 0] = "RIGHT";
	FodPlatformSide[FodPlatformSide["LEFT"] = 1] = "LEFT";
})(FodPlatformSide || (FodPlatformSide = {}));
var WhispyBlowDirection;
(function(WhispyBlowDirection) {
	WhispyBlowDirection[WhispyBlowDirection["NONE"] = 0] = "NONE";
	WhispyBlowDirection[WhispyBlowDirection["LEFT"] = 1] = "LEFT";
	WhispyBlowDirection[WhispyBlowDirection["RIGHT"] = 2] = "RIGHT";
})(WhispyBlowDirection || (WhispyBlowDirection = {}));
var StadiumTransformation;
(function(StadiumTransformation) {
	StadiumTransformation[StadiumTransformation["FIRE"] = 3] = "FIRE";
	StadiumTransformation[StadiumTransformation["GRASS"] = 4] = "GRASS";
	StadiumTransformation[StadiumTransformation["NORMAL"] = 5] = "NORMAL";
	StadiumTransformation[StadiumTransformation["ROCK"] = 6] = "ROCK";
	StadiumTransformation[StadiumTransformation["WATER"] = 9] = "WATER";
})(StadiumTransformation || (StadiumTransformation = {}));
var StadiumTransformationEvent;
(function(StadiumTransformationEvent) {
	StadiumTransformationEvent[StadiumTransformationEvent["INITIATE"] = 2] = "INITIATE";
	StadiumTransformationEvent[StadiumTransformationEvent["ON_MONITOR"] = 3] = "ON_MONITOR";
	StadiumTransformationEvent[StadiumTransformationEvent["RECEDING"] = 4] = "RECEDING";
	StadiumTransformationEvent[StadiumTransformationEvent["RISING"] = 5] = "RISING";
	StadiumTransformationEvent[StadiumTransformationEvent["FINISH"] = 6] = "FINISH";
})(StadiumTransformationEvent || (StadiumTransformationEvent = {}));
var Frames;
(function(Frames) {
	Frames[Frames["FIRST"] = -123] = "FIRST";
	Frames[Frames["FIRST_PLAYABLE"] = -39] = "FIRST_PLAYABLE";
})(Frames || (Frames = {}));
var JoystickRegion;
(function(JoystickRegion) {
	JoystickRegion[JoystickRegion["DZ"] = 0] = "DZ";
	JoystickRegion[JoystickRegion["NE"] = 1] = "NE";
	JoystickRegion[JoystickRegion["SE"] = 2] = "SE";
	JoystickRegion[JoystickRegion["SW"] = 3] = "SW";
	JoystickRegion[JoystickRegion["NW"] = 4] = "NW";
	JoystickRegion[JoystickRegion["N"] = 5] = "N";
	JoystickRegion[JoystickRegion["E"] = 6] = "E";
	JoystickRegion[JoystickRegion["S"] = 7] = "S";
	JoystickRegion[JoystickRegion["W"] = 8] = "W";
})(JoystickRegion || (JoystickRegion = {}));
var SlpParserEvent;
(function(SlpParserEvent) {
	SlpParserEvent["SETTINGS"] = "settings";
	SlpParserEvent["END"] = "end";
	SlpParserEvent["FRAME"] = "frame";
	SlpParserEvent["FINALIZED_FRAME"] = "finalized-frame";
	SlpParserEvent["ROLLBACK_FRAME"] = "rollback-frame";
})(SlpParserEvent || (SlpParserEvent = {}));
new TextDecoder("utf-8");
var SlpStreamMode;
(function(SlpStreamMode) {
	SlpStreamMode["AUTO"] = "AUTO";
	SlpStreamMode["MANUAL"] = "MANUAL";
})(SlpStreamMode || (SlpStreamMode = {}));
SlpStreamMode.AUTO;
var SlpStreamEvent;
(function(SlpStreamEvent) {
	SlpStreamEvent["RAW"] = "slp-raw";
	SlpStreamEvent["COMMAND"] = "slp-command";
})(SlpStreamEvent || (SlpStreamEvent = {}));
//#endregion
//#region node_modules/mutative/dist/mutative.esm.mjs
const Operation = {
	Remove: "remove",
	Replace: "replace",
	Add: "add"
};
const PROXY_DRAFT = Symbol.for("__MUTATIVE_PROXY_DRAFT__");
const RAW_RETURN_SYMBOL = Symbol("__MUTATIVE_RAW_RETURN_SYMBOL__");
const iteratorSymbol = Symbol.iterator;
const dataTypes = {
	mutable: "mutable",
	immutable: "immutable"
};
const internal = {};
function has(target, key) {
	return target instanceof Map ? target.has(key) : Object.prototype.hasOwnProperty.call(target, key);
}
function getDescriptor(target, key) {
	if (key in target) {
		let prototype = Reflect.getPrototypeOf(target);
		while (prototype) {
			const descriptor = Reflect.getOwnPropertyDescriptor(prototype, key);
			if (descriptor) return descriptor;
			prototype = Reflect.getPrototypeOf(prototype);
		}
	}
}
function isBaseSetInstance(obj) {
	return Object.getPrototypeOf(obj) === Set.prototype;
}
function isBaseMapInstance(obj) {
	return Object.getPrototypeOf(obj) === Map.prototype;
}
function latest(proxyDraft) {
	var _a;
	return (_a = proxyDraft.copy) !== null && _a !== void 0 ? _a : proxyDraft.original;
}
/**
* Check if the value is a draft
*/
function isDraft(target) {
	return !!getProxyDraft(target);
}
function getProxyDraft(value) {
	if (typeof value !== "object") return null;
	return value === null || value === void 0 ? void 0 : value[PROXY_DRAFT];
}
function getValue(value) {
	var _a;
	const proxyDraft = getProxyDraft(value);
	return proxyDraft ? (_a = proxyDraft.copy) !== null && _a !== void 0 ? _a : proxyDraft.original : value;
}
/**
* Check if a value is draftable
*/
function isDraftable(value, options) {
	if (!value || typeof value !== "object") return false;
	let markResult;
	return Object.getPrototypeOf(value) === Object.prototype || Array.isArray(value) || value instanceof Map || value instanceof Set || !!(options === null || options === void 0 ? void 0 : options.mark) && ((markResult = options.mark(value, dataTypes)) === dataTypes.immutable || typeof markResult === "function");
}
function getPath(target, path = []) {
	if (Object.hasOwnProperty.call(target, "key")) {
		const parentCopy = target.parent.copy;
		const proxyDraft = getProxyDraft(get(parentCopy, target.key));
		if (proxyDraft !== null && (proxyDraft === null || proxyDraft === void 0 ? void 0 : proxyDraft.original) !== target.original) return null;
		const isSet = target.parent.type === 3;
		const key = isSet ? Array.from(target.parent.setMap.keys()).indexOf(target.key) : target.key;
		if (!(isSet && parentCopy.size > key || has(parentCopy, key))) return null;
		path.push(key);
	}
	if (target.parent) return getPath(target.parent, path);
	path.reverse();
	try {
		resolvePath(target.copy, path);
	} catch (e) {
		return null;
	}
	return path;
}
function getType(target) {
	if (Array.isArray(target)) return 1;
	if (target instanceof Map) return 2;
	if (target instanceof Set) return 3;
	return 0;
}
function get(target, key) {
	return getType(target) === 2 ? target.get(key) : target[key];
}
function set(target, key, value) {
	if (getType(target) === 2) target.set(key, value);
	else target[key] = value;
}
function peek(target, key) {
	const state = getProxyDraft(target);
	return (state ? latest(state) : target)[key];
}
function isEqual(x, y) {
	if (x === y) return x !== 0 || 1 / x === 1 / y;
	else return x !== x && y !== y;
}
function revokeProxy(proxyDraft) {
	if (!proxyDraft) return;
	while (proxyDraft.finalities.revoke.length > 0) proxyDraft.finalities.revoke.pop()();
}
function escapePath(path, pathAsArray) {
	return pathAsArray ? path : [""].concat(path).map((_item) => {
		const item = `${_item}`;
		if (item.indexOf("/") === -1 && item.indexOf("~") === -1) return item;
		return item.replace(/~/g, "~0").replace(/\//g, "~1");
	}).join("/");
}
function resolvePath(base, path) {
	for (let index = 0; index < path.length - 1; index += 1) {
		const key = path[index];
		base = get(getType(base) === 3 ? Array.from(base) : base, key);
		if (typeof base !== "object") throw new Error(`Cannot resolve patch at '${path.join("/")}'.`);
	}
	return base;
}
function strictCopy(target) {
	const copy = Object.create(Object.getPrototypeOf(target));
	Reflect.ownKeys(target).forEach((key) => {
		let desc = Reflect.getOwnPropertyDescriptor(target, key);
		if (desc.enumerable && desc.configurable && desc.writable) {
			copy[key] = target[key];
			return;
		}
		if (!desc.writable) {
			desc.writable = true;
			desc.configurable = true;
		}
		if (desc.get || desc.set) desc = {
			configurable: true,
			writable: true,
			enumerable: desc.enumerable,
			value: target[key]
		};
		Reflect.defineProperty(copy, key, desc);
	});
	return copy;
}
const propIsEnum = Object.prototype.propertyIsEnumerable;
function shallowCopy(original, options) {
	let markResult;
	if (Array.isArray(original)) return Array.prototype.concat.call(original);
	else if (original instanceof Set) {
		if (!isBaseSetInstance(original)) {
			const SubClass = Object.getPrototypeOf(original).constructor;
			return new SubClass(original.values());
		}
		return Set.prototype.difference ? Set.prototype.difference.call(original, /* @__PURE__ */ new Set()) : new Set(original.values());
	} else if (original instanceof Map) {
		if (!isBaseMapInstance(original)) {
			const SubClass = Object.getPrototypeOf(original).constructor;
			return new SubClass(original);
		}
		return new Map(original);
	} else if ((options === null || options === void 0 ? void 0 : options.mark) && (markResult = options.mark(original, dataTypes), markResult !== void 0) && markResult !== dataTypes.mutable) {
		if (markResult === dataTypes.immutable) return strictCopy(original);
		else if (typeof markResult === "function") {
			if (options.enablePatches || options.enableAutoFreeze) throw new Error(`You can't use mark and patches or auto freeze together.`);
			return markResult();
		}
		throw new Error(`Unsupported mark result: ${markResult}`);
	} else if (typeof original === "object" && Object.getPrototypeOf(original) === Object.prototype) {
		const copy = {};
		Object.keys(original).forEach((key) => {
			copy[key] = original[key];
		});
		Object.getOwnPropertySymbols(original).forEach((key) => {
			if (propIsEnum.call(original, key)) copy[key] = original[key];
		});
		return copy;
	} else throw new Error(`Please check mark() to ensure that it is a stable marker draftable function.`);
}
function ensureShallowCopy(target) {
	if (target.copy) return;
	target.copy = shallowCopy(target.original, target.options);
}
function deepClone(target) {
	if (!isDraftable(target)) return getValue(target);
	if (Array.isArray(target)) return target.map(deepClone);
	if (target instanceof Map) {
		const iterable = Array.from(target.entries()).map(([k, v]) => [k, deepClone(v)]);
		if (!isBaseMapInstance(target)) {
			const SubClass = Object.getPrototypeOf(target).constructor;
			return new SubClass(iterable);
		}
		return new Map(iterable);
	}
	if (target instanceof Set) {
		const iterable = Array.from(target).map(deepClone);
		if (!isBaseSetInstance(target)) {
			const SubClass = Object.getPrototypeOf(target).constructor;
			return new SubClass(iterable);
		}
		return new Set(iterable);
	}
	const copy = Object.create(Object.getPrototypeOf(target));
	for (const key in target) copy[key] = deepClone(target[key]);
	return copy;
}
function cloneIfNeeded(target) {
	return isDraft(target) ? deepClone(target) : target;
}
function markChanged(proxyDraft) {
	var _a;
	proxyDraft.assignedMap = (_a = proxyDraft.assignedMap) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new Map();
	if (!proxyDraft.operated) {
		proxyDraft.operated = true;
		if (proxyDraft.parent) markChanged(proxyDraft.parent);
	}
}
function throwFrozenError() {
	throw new Error("Cannot modify frozen object");
}
function deepFreeze(target, subKey, updatedValues, stack, keys) {
	{
		updatedValues = updatedValues !== null && updatedValues !== void 0 ? updatedValues : /* @__PURE__ */ new WeakMap();
		stack = stack !== null && stack !== void 0 ? stack : [];
		keys = keys !== null && keys !== void 0 ? keys : [];
		const value = updatedValues.has(target) ? updatedValues.get(target) : target;
		if (stack.length > 0) {
			const index = stack.indexOf(value);
			if (value && typeof value === "object" && index !== -1) {
				if (stack[0] === value) throw new Error(`Forbids circular reference`);
				throw new Error(`Forbids circular reference: ~/${keys.slice(0, index).map((key, index) => {
					if (typeof key === "symbol") return `[${key.toString()}]`;
					const parent = stack[index];
					if (typeof key === "object" && (parent instanceof Map || parent instanceof Set)) return Array.from(parent.keys()).indexOf(key);
					return key;
				}).join("/")}`);
			}
			stack.push(value);
			keys.push(subKey);
		} else stack.push(value);
	}
	if (Object.isFrozen(target) || isDraft(target)) {
		stack.pop();
		keys.pop();
		return;
	}
	switch (getType(target)) {
		case 2:
			for (const [key, value] of target) {
				deepFreeze(key, key, updatedValues, stack, keys);
				deepFreeze(value, key, updatedValues, stack, keys);
			}
			target.set = target.clear = target.delete = throwFrozenError;
			break;
		case 3:
			for (const value of target) deepFreeze(value, value, updatedValues, stack, keys);
			target.add = target.clear = target.delete = throwFrozenError;
			break;
		case 1:
			Object.freeze(target);
			let index = 0;
			for (const value of target) {
				deepFreeze(value, index, updatedValues, stack, keys);
				index += 1;
			}
			break;
		default:
			Object.freeze(target);
			Object.keys(target).forEach((name) => {
				const value = target[name];
				deepFreeze(value, name, updatedValues, stack, keys);
			});
	}
	stack.pop();
	keys.pop();
}
function forEach(target, iter) {
	const type = getType(target);
	if (type === 0) Reflect.ownKeys(target).forEach((key) => {
		iter(key, target[key], target);
	});
	else if (type === 1) {
		let index = 0;
		for (const entry of target) {
			iter(index, entry, target);
			index += 1;
		}
	} else target.forEach((entry, index) => iter(index, entry, target));
}
function handleValue(target, handledSet, options) {
	if (isDraft(target) || !isDraftable(target, options) || handledSet.has(target) || Object.isFrozen(target)) return;
	const isSet = target instanceof Set;
	const setMap = isSet ? /* @__PURE__ */ new Map() : void 0;
	handledSet.add(target);
	forEach(target, (key, value) => {
		var _a;
		if (isDraft(value)) {
			const proxyDraft = getProxyDraft(value);
			ensureShallowCopy(proxyDraft);
			const updatedValue = ((_a = proxyDraft.assignedMap) === null || _a === void 0 ? void 0 : _a.size) || proxyDraft.operated ? proxyDraft.copy : proxyDraft.original;
			set(isSet ? setMap : target, key, updatedValue);
		} else handleValue(value, handledSet, options);
	});
	if (setMap) {
		const set = target;
		const values = Array.from(set);
		set.clear();
		values.forEach((value) => {
			set.add(setMap.has(value) ? setMap.get(value) : value);
		});
	}
}
function finalizeAssigned(proxyDraft, key) {
	const copy = proxyDraft.type === 3 ? proxyDraft.setMap : proxyDraft.copy;
	if (proxyDraft.finalities.revoke.length > 1 && proxyDraft.assignedMap.get(key) && copy) handleValue(get(copy, key), proxyDraft.finalities.handledSet, proxyDraft.options);
}
function finalizeSetValue(target) {
	if (target.type === 3 && target.copy) {
		target.copy.clear();
		target.setMap.forEach((value) => {
			target.copy.add(getValue(value));
		});
	}
}
function finalizePatches(target, generatePatches, patches, inversePatches) {
	if (target.operated && target.assignedMap && target.assignedMap.size > 0 && !target.finalized) {
		if (patches && inversePatches) {
			const basePath = getPath(target);
			if (basePath) generatePatches(target, basePath, patches, inversePatches);
		}
		target.finalized = true;
	}
}
function markFinalization(target, key, value, generatePatches) {
	const proxyDraft = getProxyDraft(value);
	if (proxyDraft) {
		if (!proxyDraft.callbacks) proxyDraft.callbacks = [];
		proxyDraft.callbacks.push((patches, inversePatches) => {
			var _a;
			const copy = target.type === 3 ? target.setMap : target.copy;
			if (isEqual(get(copy, key), value)) {
				let updatedValue = proxyDraft.original;
				if (proxyDraft.copy) updatedValue = proxyDraft.copy;
				finalizeSetValue(target);
				finalizePatches(target, generatePatches, patches, inversePatches);
				if (target.options.enableAutoFreeze) {
					target.options.updatedValues = (_a = target.options.updatedValues) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new WeakMap();
					target.options.updatedValues.set(updatedValue, proxyDraft.original);
				}
				set(copy, key, updatedValue);
			}
		});
		if (target.options.enableAutoFreeze) {
			if (proxyDraft.finalities !== target.finalities) target.options.enableAutoFreeze = false;
		}
	}
	if (isDraftable(value, target.options)) target.finalities.draft.push(() => {
		if (isEqual(get(target.type === 3 ? target.setMap : target.copy, key), value)) finalizeAssigned(target, key);
	});
}
function generateArrayPatches(proxyState, basePath, patches, inversePatches, pathAsArray) {
	let { original, assignedMap, options } = proxyState;
	let copy = proxyState.copy;
	if (copy.length < original.length) {
		[original, copy] = [copy, original];
		[patches, inversePatches] = [inversePatches, patches];
	}
	for (let index = 0; index < original.length; index += 1) if (assignedMap.get(index.toString()) && copy[index] !== original[index]) {
		const path = escapePath(basePath.concat([index]), pathAsArray);
		patches.push({
			op: Operation.Replace,
			path,
			value: cloneIfNeeded(copy[index])
		});
		inversePatches.push({
			op: Operation.Replace,
			path,
			value: cloneIfNeeded(original[index])
		});
	}
	for (let index = original.length; index < copy.length; index += 1) {
		const path = escapePath(basePath.concat([index]), pathAsArray);
		patches.push({
			op: Operation.Add,
			path,
			value: cloneIfNeeded(copy[index])
		});
	}
	if (original.length < copy.length) {
		const { arrayLengthAssignment = true } = options.enablePatches;
		if (arrayLengthAssignment) {
			const path = escapePath(basePath.concat(["length"]), pathAsArray);
			inversePatches.push({
				op: Operation.Replace,
				path,
				value: original.length
			});
		} else for (let index = copy.length; original.length < index; index -= 1) {
			const path = escapePath(basePath.concat([index - 1]), pathAsArray);
			inversePatches.push({
				op: Operation.Remove,
				path
			});
		}
	}
}
function generatePatchesFromAssigned({ original, copy, assignedMap }, basePath, patches, inversePatches, pathAsArray) {
	assignedMap.forEach((assignedValue, key) => {
		const originalValue = get(original, key);
		const value = cloneIfNeeded(get(copy, key));
		const op = !assignedValue ? Operation.Remove : has(original, key) ? Operation.Replace : Operation.Add;
		if (isEqual(originalValue, value) && op === Operation.Replace) return;
		const path = escapePath(basePath.concat(key), pathAsArray);
		patches.push(op === Operation.Remove ? {
			op,
			path
		} : {
			op,
			path,
			value
		});
		inversePatches.push(op === Operation.Add ? {
			op: Operation.Remove,
			path
		} : op === Operation.Remove ? {
			op: Operation.Add,
			path,
			value: originalValue
		} : {
			op: Operation.Replace,
			path,
			value: originalValue
		});
	});
}
function generateSetPatches({ original, copy }, basePath, patches, inversePatches, pathAsArray) {
	let index = 0;
	original.forEach((value) => {
		if (!copy.has(value)) {
			const path = escapePath(basePath.concat([index]), pathAsArray);
			patches.push({
				op: Operation.Remove,
				path,
				value
			});
			inversePatches.unshift({
				op: Operation.Add,
				path,
				value
			});
		}
		index += 1;
	});
	index = 0;
	copy.forEach((value) => {
		if (!original.has(value)) {
			const path = escapePath(basePath.concat([index]), pathAsArray);
			patches.push({
				op: Operation.Add,
				path,
				value
			});
			inversePatches.unshift({
				op: Operation.Remove,
				path,
				value
			});
		}
		index += 1;
	});
}
function generatePatches(proxyState, basePath, patches, inversePatches) {
	const { pathAsArray = true } = proxyState.options.enablePatches;
	switch (proxyState.type) {
		case 0:
		case 2: return generatePatchesFromAssigned(proxyState, basePath, patches, inversePatches, pathAsArray);
		case 1: return generateArrayPatches(proxyState, basePath, patches, inversePatches, pathAsArray);
		case 3: return generateSetPatches(proxyState, basePath, patches, inversePatches, pathAsArray);
	}
}
const checkReadable = (value, options, ignoreCheckDraftable = false) => {
	if (typeof value === "object" && value !== null && (!isDraftable(value, options) || ignoreCheckDraftable) && true) throw new Error(`Strict mode: Mutable data cannot be accessed directly, please use 'unsafe(callback)' wrap.`);
};
const mapHandler = {
	get size() {
		return latest(getProxyDraft(this)).size;
	},
	has(key) {
		return latest(getProxyDraft(this)).has(key);
	},
	set(key, value) {
		const target = getProxyDraft(this);
		const source = latest(target);
		if (!source.has(key) || !isEqual(source.get(key), value)) {
			ensureShallowCopy(target);
			markChanged(target);
			target.assignedMap.set(key, true);
			target.copy.set(key, value);
			markFinalization(target, key, value, generatePatches);
		}
		return this;
	},
	delete(key) {
		if (!this.has(key)) return false;
		const target = getProxyDraft(this);
		ensureShallowCopy(target);
		markChanged(target);
		if (target.original.has(key)) target.assignedMap.set(key, false);
		else target.assignedMap.delete(key);
		target.copy.delete(key);
		return true;
	},
	clear() {
		const target = getProxyDraft(this);
		if (!this.size) return;
		ensureShallowCopy(target);
		markChanged(target);
		target.assignedMap = /* @__PURE__ */ new Map();
		for (const [key] of target.original) target.assignedMap.set(key, false);
		target.copy.clear();
	},
	forEach(callback, thisArg) {
		latest(getProxyDraft(this)).forEach((_value, _key) => {
			callback.call(thisArg, this.get(_key), _key, this);
		});
	},
	get(key) {
		var _a, _b;
		const target = getProxyDraft(this);
		const value = latest(target).get(key);
		const mutable = ((_b = (_a = target.options).mark) === null || _b === void 0 ? void 0 : _b.call(_a, value, dataTypes)) === dataTypes.mutable;
		if (target.options.strict) checkReadable(value, target.options, mutable);
		if (mutable) return value;
		if (target.finalized || !isDraftable(value, target.options)) return value;
		if (value !== target.original.get(key)) return value;
		const draft = internal.createDraft({
			original: value,
			parentDraft: target,
			key,
			finalities: target.finalities,
			options: target.options
		});
		ensureShallowCopy(target);
		target.copy.set(key, draft);
		return draft;
	},
	keys() {
		return latest(getProxyDraft(this)).keys();
	},
	values() {
		const iterator = this.keys();
		return {
			[iteratorSymbol]: () => this.values(),
			next: () => {
				const result = iterator.next();
				if (result.done) return result;
				return {
					done: false,
					value: this.get(result.value)
				};
			}
		};
	},
	entries() {
		const iterator = this.keys();
		return {
			[iteratorSymbol]: () => this.entries(),
			next: () => {
				const result = iterator.next();
				if (result.done) return result;
				const value = this.get(result.value);
				return {
					done: false,
					value: [result.value, value]
				};
			}
		};
	},
	[iteratorSymbol]() {
		return this.entries();
	}
};
const mapHandlerKeys = Reflect.ownKeys(mapHandler);
const getNextIterator = (target, iterator, { isValuesIterator }) => () => {
	var _a, _b;
	const result = iterator.next();
	if (result.done) return result;
	const key = result.value;
	let value = target.setMap.get(key);
	const currentDraft = getProxyDraft(value);
	const mutable = ((_b = (_a = target.options).mark) === null || _b === void 0 ? void 0 : _b.call(_a, value, dataTypes)) === dataTypes.mutable;
	if (target.options.strict) checkReadable(key, target.options, mutable);
	if (!mutable && !currentDraft && isDraftable(key, target.options) && !target.finalized && target.original.has(key)) {
		const proxy = internal.createDraft({
			original: key,
			parentDraft: target,
			key,
			finalities: target.finalities,
			options: target.options
		});
		target.setMap.set(key, proxy);
		value = proxy;
	} else if (currentDraft) value = currentDraft.proxy;
	return {
		done: false,
		value: isValuesIterator ? value : [value, value]
	};
};
const setHandler = {
	get size() {
		return getProxyDraft(this).setMap.size;
	},
	has(value) {
		const target = getProxyDraft(this);
		if (target.setMap.has(value)) return true;
		ensureShallowCopy(target);
		const valueProxyDraft = getProxyDraft(value);
		if (valueProxyDraft && target.setMap.has(valueProxyDraft.original)) return true;
		return false;
	},
	add(value) {
		const target = getProxyDraft(this);
		if (!this.has(value)) {
			ensureShallowCopy(target);
			markChanged(target);
			target.assignedMap.set(value, true);
			target.setMap.set(value, value);
			markFinalization(target, value, value, generatePatches);
		}
		return this;
	},
	delete(value) {
		if (!this.has(value)) return false;
		const target = getProxyDraft(this);
		ensureShallowCopy(target);
		markChanged(target);
		const valueProxyDraft = getProxyDraft(value);
		if (valueProxyDraft && target.setMap.has(valueProxyDraft.original)) {
			target.assignedMap.set(valueProxyDraft.original, false);
			return target.setMap.delete(valueProxyDraft.original);
		}
		if (!valueProxyDraft && target.setMap.has(value)) target.assignedMap.set(value, false);
		else target.assignedMap.delete(value);
		return target.setMap.delete(value);
	},
	clear() {
		if (!this.size) return;
		const target = getProxyDraft(this);
		ensureShallowCopy(target);
		markChanged(target);
		for (const value of target.original) target.assignedMap.set(value, false);
		target.setMap.clear();
	},
	values() {
		const target = getProxyDraft(this);
		ensureShallowCopy(target);
		const iterator = target.setMap.keys();
		return {
			[Symbol.iterator]: () => this.values(),
			next: getNextIterator(target, iterator, { isValuesIterator: true })
		};
	},
	entries() {
		const target = getProxyDraft(this);
		ensureShallowCopy(target);
		const iterator = target.setMap.keys();
		return {
			[Symbol.iterator]: () => this.entries(),
			next: getNextIterator(target, iterator, { isValuesIterator: false })
		};
	},
	keys() {
		return this.values();
	},
	[iteratorSymbol]() {
		return this.values();
	},
	forEach(callback, thisArg) {
		const iterator = this.values();
		let result = iterator.next();
		while (!result.done) {
			callback.call(thisArg, result.value, result.value, this);
			result = iterator.next();
		}
	}
};
if (Set.prototype.difference) Object.assign(setHandler, {
	intersection(other) {
		return Set.prototype.intersection.call(new Set(this.values()), other);
	},
	union(other) {
		return Set.prototype.union.call(new Set(this.values()), other);
	},
	difference(other) {
		return Set.prototype.difference.call(new Set(this.values()), other);
	},
	symmetricDifference(other) {
		return Set.prototype.symmetricDifference.call(new Set(this.values()), other);
	},
	isSubsetOf(other) {
		return Set.prototype.isSubsetOf.call(new Set(this.values()), other);
	},
	isSupersetOf(other) {
		return Set.prototype.isSupersetOf.call(new Set(this.values()), other);
	},
	isDisjointFrom(other) {
		return Set.prototype.isDisjointFrom.call(new Set(this.values()), other);
	}
});
const setHandlerKeys = Reflect.ownKeys(setHandler);
const proxyHandler = {
	get(target, key, receiver) {
		var _a, _b;
		const copy = (_a = target.copy) === null || _a === void 0 ? void 0 : _a[key];
		if (copy && target.finalities.draftsCache.has(copy)) return copy;
		if (key === PROXY_DRAFT) return target;
		let markResult;
		if (target.options.mark) {
			const value = key === "size" && (target.original instanceof Map || target.original instanceof Set) ? Reflect.get(target.original, key) : Reflect.get(target.original, key, receiver);
			markResult = target.options.mark(value, dataTypes);
			if (markResult === dataTypes.mutable) {
				if (target.options.strict) checkReadable(value, target.options, true);
				return value;
			}
		}
		const source = latest(target);
		if (source instanceof Map && mapHandlerKeys.includes(key)) {
			if (key === "size") return Object.getOwnPropertyDescriptor(mapHandler, "size").get.call(target.proxy);
			return mapHandler[key].bind(target.proxy);
		}
		if (source instanceof Set && setHandlerKeys.includes(key)) {
			if (key === "size") return Object.getOwnPropertyDescriptor(setHandler, "size").get.call(target.proxy);
			return setHandler[key].bind(target.proxy);
		}
		if (!has(source, key)) {
			const desc = getDescriptor(source, key);
			return desc ? `value` in desc ? desc.value : (_b = desc.get) === null || _b === void 0 ? void 0 : _b.call(target.proxy) : void 0;
		}
		const value = source[key];
		if (target.options.strict) checkReadable(value, target.options);
		if (target.finalized || !isDraftable(value, target.options)) return value;
		if (value === peek(target.original, key)) {
			ensureShallowCopy(target);
			target.copy[key] = createDraft({
				original: target.original[key],
				parentDraft: target,
				key: target.type === 1 ? Number(key) : key,
				finalities: target.finalities,
				options: target.options
			});
			if (typeof markResult === "function") {
				const subProxyDraft = getProxyDraft(target.copy[key]);
				ensureShallowCopy(subProxyDraft);
				markChanged(subProxyDraft);
				return subProxyDraft.copy;
			}
			return target.copy[key];
		}
		if (isDraft(value)) target.finalities.draftsCache.add(value);
		return value;
	},
	set(target, key, value) {
		var _a;
		if (target.type === 3 || target.type === 2) throw new Error(`Map/Set draft does not support any property assignment.`);
		let _key;
		if (target.type === 1 && key !== "length" && !(Number.isInteger(_key = Number(key)) && _key >= 0 && (key === 0 || _key === 0 || String(_key) === String(key)))) throw new Error(`Only supports setting array indices and the 'length' property.`);
		const desc = getDescriptor(latest(target), key);
		if (desc === null || desc === void 0 ? void 0 : desc.set) {
			desc.set.call(target.proxy, value);
			return true;
		}
		const current = peek(latest(target), key);
		const currentProxyDraft = getProxyDraft(current);
		if (currentProxyDraft && isEqual(currentProxyDraft.original, value)) {
			target.copy[key] = value;
			target.assignedMap = (_a = target.assignedMap) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new Map();
			target.assignedMap.set(key, false);
			return true;
		}
		if (isEqual(value, current) && (value !== void 0 || has(target.original, key))) return true;
		ensureShallowCopy(target);
		markChanged(target);
		if (has(target.original, key) && isEqual(value, target.original[key])) target.assignedMap.delete(key);
		else target.assignedMap.set(key, true);
		target.copy[key] = value;
		markFinalization(target, key, value, generatePatches);
		return true;
	},
	has(target, key) {
		return key in latest(target);
	},
	ownKeys(target) {
		return Reflect.ownKeys(latest(target));
	},
	getOwnPropertyDescriptor(target, key) {
		const source = latest(target);
		const descriptor = Reflect.getOwnPropertyDescriptor(source, key);
		if (!descriptor) return descriptor;
		return {
			writable: true,
			configurable: target.type !== 1 || key !== "length",
			enumerable: descriptor.enumerable,
			value: source[key]
		};
	},
	getPrototypeOf(target) {
		return Reflect.getPrototypeOf(target.original);
	},
	setPrototypeOf() {
		throw new Error(`Cannot call 'setPrototypeOf()' on drafts`);
	},
	defineProperty() {
		throw new Error(`Cannot call 'defineProperty()' on drafts`);
	},
	deleteProperty(target, key) {
		var _a;
		if (target.type === 1) return proxyHandler.set.call(this, target, key, void 0, target.proxy);
		if (peek(target.original, key) !== void 0 || key in target.original) {
			ensureShallowCopy(target);
			markChanged(target);
			target.assignedMap.set(key, false);
		} else {
			target.assignedMap = (_a = target.assignedMap) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new Map();
			target.assignedMap.delete(key);
		}
		if (target.copy) delete target.copy[key];
		return true;
	}
};
function createDraft(createDraftOptions) {
	const { original, parentDraft, key, finalities, options } = createDraftOptions;
	const type = getType(original);
	const proxyDraft = {
		type,
		finalized: false,
		parent: parentDraft,
		original,
		copy: null,
		proxy: null,
		finalities,
		options,
		setMap: type === 3 ? new Map(original.entries()) : void 0
	};
	if (key || "key" in createDraftOptions) proxyDraft.key = key;
	const { proxy, revoke } = Proxy.revocable(type === 1 ? Object.assign([], proxyDraft) : proxyDraft, proxyHandler);
	finalities.revoke.push(revoke);
	proxyDraft.proxy = proxy;
	if (parentDraft) {
		const target = parentDraft;
		target.finalities.draft.push((patches, inversePatches) => {
			var _a, _b;
			const oldProxyDraft = getProxyDraft(proxy);
			let copy = target.type === 3 ? target.setMap : target.copy;
			const draft = get(copy, key);
			const proxyDraft = getProxyDraft(draft);
			if (proxyDraft) {
				let updatedValue = proxyDraft.original;
				if (proxyDraft.operated) updatedValue = getValue(draft);
				finalizeSetValue(proxyDraft);
				finalizePatches(proxyDraft, generatePatches, patches, inversePatches);
				if (target.options.enableAutoFreeze) {
					target.options.updatedValues = (_a = target.options.updatedValues) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new WeakMap();
					target.options.updatedValues.set(updatedValue, proxyDraft.original);
				}
				set(copy, key, updatedValue);
			}
			(_b = oldProxyDraft.callbacks) === null || _b === void 0 || _b.forEach((callback) => {
				callback(patches, inversePatches);
			});
		});
	} else {
		const target = getProxyDraft(proxy);
		target.finalities.draft.push((patches, inversePatches) => {
			finalizeSetValue(target);
			finalizePatches(target, generatePatches, patches, inversePatches);
		});
	}
	return proxy;
}
internal.createDraft = createDraft;
function finalizeDraft(result, returnedValue, patches, inversePatches, enableAutoFreeze) {
	var _a;
	const proxyDraft = getProxyDraft(result);
	const original = (_a = proxyDraft === null || proxyDraft === void 0 ? void 0 : proxyDraft.original) !== null && _a !== void 0 ? _a : result;
	const hasReturnedValue = !!returnedValue.length;
	if (proxyDraft === null || proxyDraft === void 0 ? void 0 : proxyDraft.operated) while (proxyDraft.finalities.draft.length > 0) proxyDraft.finalities.draft.pop()(patches, inversePatches);
	const state = hasReturnedValue ? returnedValue[0] : proxyDraft ? proxyDraft.operated ? proxyDraft.copy : proxyDraft.original : result;
	if (proxyDraft) revokeProxy(proxyDraft);
	if (enableAutoFreeze) deepFreeze(state, state, proxyDraft === null || proxyDraft === void 0 ? void 0 : proxyDraft.options.updatedValues);
	return [
		state,
		patches && hasReturnedValue ? [{
			op: Operation.Replace,
			path: [],
			value: returnedValue[0]
		}] : patches,
		inversePatches && hasReturnedValue ? [{
			op: Operation.Replace,
			path: [],
			value: original
		}] : inversePatches
	];
}
function draftify(baseState, options) {
	var _a;
	const finalities = {
		draft: [],
		revoke: [],
		handledSet: /* @__PURE__ */ new WeakSet(),
		draftsCache: /* @__PURE__ */ new WeakSet()
	};
	let patches;
	let inversePatches;
	if (options.enablePatches) {
		patches = [];
		inversePatches = [];
	}
	const draft = ((_a = options.mark) === null || _a === void 0 ? void 0 : _a.call(options, baseState, dataTypes)) === dataTypes.mutable || !isDraftable(baseState, options) ? baseState : createDraft({
		original: baseState,
		parentDraft: null,
		finalities,
		options
	});
	return [draft, (returnedValue = []) => {
		const [finalizedState, finalizedPatches, finalizedInversePatches] = finalizeDraft(draft, returnedValue, patches, inversePatches, options.enableAutoFreeze);
		return options.enablePatches ? [
			finalizedState,
			finalizedPatches,
			finalizedInversePatches
		] : finalizedState;
	}];
}
function handleReturnValue(options) {
	const { rootDraft, value, useRawReturn = false, isRoot = true } = options;
	forEach(value, (key, item, source) => {
		const proxyDraft = getProxyDraft(item);
		if (proxyDraft && rootDraft && proxyDraft.finalities === rootDraft.finalities) {
			options.isContainDraft = true;
			const currentValue = proxyDraft.original;
			if (source instanceof Set) {
				const arr = Array.from(source);
				source.clear();
				arr.forEach((_item) => source.add(key === _item ? currentValue : _item));
			} else set(source, key, currentValue);
		} else if (typeof item === "object" && item !== null) {
			options.value = item;
			options.isRoot = false;
			handleReturnValue(options);
		}
	});
	if (isRoot) {
		if (!options.isContainDraft) console.warn(`The return value does not contain any draft, please use 'rawReturn()' to wrap the return value to improve performance.`);
		if (useRawReturn) console.warn(`The return value contains drafts, please don't use 'rawReturn()' to wrap the return value.`);
	}
}
function getCurrent(target) {
	var _a;
	const proxyDraft = getProxyDraft(target);
	if (!isDraftable(target, proxyDraft === null || proxyDraft === void 0 ? void 0 : proxyDraft.options)) return target;
	const type = getType(target);
	if (proxyDraft && !proxyDraft.operated) return proxyDraft.original;
	let currentValue;
	function ensureShallowCopy() {
		currentValue = type === 2 ? !isBaseMapInstance(target) ? new (Object.getPrototypeOf(target)).constructor(target) : new Map(target) : type === 3 ? Array.from(proxyDraft.setMap.values()) : shallowCopy(target, proxyDraft === null || proxyDraft === void 0 ? void 0 : proxyDraft.options);
	}
	if (proxyDraft) {
		proxyDraft.finalized = true;
		try {
			ensureShallowCopy();
		} finally {
			proxyDraft.finalized = false;
		}
	} else currentValue = target;
	forEach(currentValue, (key, value) => {
		if (proxyDraft && isEqual(get(proxyDraft.original, key), value)) return;
		const newValue = getCurrent(value);
		if (newValue !== value) {
			if (currentValue === target) ensureShallowCopy();
			set(currentValue, key, newValue);
		}
	});
	if (type === 3) {
		const value = (_a = proxyDraft === null || proxyDraft === void 0 ? void 0 : proxyDraft.original) !== null && _a !== void 0 ? _a : currentValue;
		return !isBaseSetInstance(value) ? new (Object.getPrototypeOf(value)).constructor(currentValue) : new Set(currentValue);
	}
	return currentValue;
}
function current(target) {
	if (!isDraft(target)) throw new Error(`current() is only used for Draft, parameter: ${target}`);
	return getCurrent(target);
}
/**
* `makeCreator(options)` to make a creator function.
*
* ## Example
*
* ```ts
* import { makeCreator } from '../index';
*
* const baseState = { foo: { bar: 'str' }, arr: [] };
* const create = makeCreator({ enableAutoFreeze: true });
* const state = create(
*   baseState,
*   (draft) => {
*     draft.foo.bar = 'str2';
*   },
* );
*
* expect(state).toEqual({ foo: { bar: 'str2' }, arr: [] });
* expect(state).not.toBe(baseState);
* expect(state.foo).not.toBe(baseState.foo);
* expect(state.arr).toBe(baseState.arr);
* expect(Object.isFrozen(state)).toBeTruthy();
* ```
*/
const makeCreator = (arg) => {
	if (arg !== void 0 && Object.prototype.toString.call(arg) !== "[object Object]") throw new Error(`Invalid options: ${String(arg)}, 'options' should be an object.`);
	return function create(arg0, arg1, arg2) {
		var _a, _b, _c;
		if (typeof arg0 === "function" && typeof arg1 !== "function") return function(base, ...args) {
			return create(base, (draft) => arg0.call(this, draft, ...args), arg1);
		};
		const base = arg0;
		const mutate = arg1;
		let options = arg2;
		if (typeof arg1 !== "function") options = arg1;
		if (options !== void 0 && Object.prototype.toString.call(options) !== "[object Object]") throw new Error(`Invalid options: ${options}, 'options' should be an object.`);
		options = Object.assign(Object.assign({}, arg), options);
		const state = isDraft(base) ? current(base) : base;
		const mark = Array.isArray(options.mark) ? ((value, types) => {
			for (const mark of options.mark) {
				if (typeof mark !== "function") throw new Error(`Invalid mark: ${mark}, 'mark' should be a function.`);
				const result = mark(value, types);
				if (result) return result;
			}
		}) : options.mark;
		const enablePatches = (_a = options.enablePatches) !== null && _a !== void 0 ? _a : false;
		const strict = (_b = options.strict) !== null && _b !== void 0 ? _b : false;
		const _options = {
			enableAutoFreeze: (_c = options.enableAutoFreeze) !== null && _c !== void 0 ? _c : false,
			mark,
			strict,
			enablePatches
		};
		if (!isDraftable(state, _options) && typeof state === "object" && state !== null) throw new Error(`Invalid base state: create() only supports plain objects, arrays, Set, Map or using mark() to mark the state as immutable.`);
		const [draft, finalize] = draftify(state, _options);
		if (typeof arg1 !== "function") {
			if (!isDraftable(state, _options)) throw new Error(`Invalid base state: create() only supports plain objects, arrays, Set, Map or using mark() to mark the state as immutable.`);
			return [draft, finalize];
		}
		let result;
		try {
			result = mutate(draft);
		} catch (error) {
			revokeProxy(getProxyDraft(draft));
			throw error;
		}
		const returnValue = (value) => {
			const proxyDraft = getProxyDraft(draft);
			if (!isDraft(value)) {
				if (value !== void 0 && !isEqual(value, draft) && (proxyDraft === null || proxyDraft === void 0 ? void 0 : proxyDraft.operated)) throw new Error(`Either the value is returned as a new non-draft value, or only the draft is modified without returning any value.`);
				const rawReturnValue = value === null || value === void 0 ? void 0 : value[RAW_RETURN_SYMBOL];
				if (rawReturnValue) {
					const _value = rawReturnValue[0];
					if (_options.strict && typeof value === "object" && value !== null) handleReturnValue({
						rootDraft: proxyDraft,
						value,
						useRawReturn: true
					});
					return finalize([_value]);
				}
				if (value !== void 0) {
					if (typeof value === "object" && value !== null) handleReturnValue({
						rootDraft: proxyDraft,
						value
					});
					return finalize([value]);
				}
			}
			if (value === draft || value === void 0) return finalize([]);
			const returnedProxyDraft = getProxyDraft(value);
			if (_options === returnedProxyDraft.options) {
				if (returnedProxyDraft.operated) throw new Error(`Cannot return a modified child draft.`);
				return finalize([current(value)]);
			}
			return finalize([value]);
		};
		if (result instanceof Promise) return result.then(returnValue, (error) => {
			revokeProxy(getProxyDraft(draft));
			throw error;
		});
		return returnValue(result);
	};
};
makeCreator();
Object.prototype.constructor.toString();
//#endregion
//#region node_modules/@dz/-/dist/index.mjs
function b6Char(n) {
	return [
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"a",
		"b",
		"c",
		"d",
		"e",
		"f",
		"g",
		"h",
		"i",
		"j",
		"k",
		"l",
		"m",
		"n",
		"o",
		"p",
		"q",
		"r",
		"s",
		"t",
		"u",
		"v",
		"w",
		"x",
		"y",
		"z",
		"A",
		"B",
		"C",
		"D",
		"E",
		"F",
		"G",
		"H",
		"I",
		"J",
		"K",
		"L",
		"M",
		"N",
		"O",
		"P",
		"Q",
		"R",
		"S",
		"T",
		"U",
		"V",
		"W",
		"X",
		"Y",
		"Z",
		"-"
	][n] || "_";
}
function b8sToB6s(...b8s) {
	const res = [];
	const incoming = [...b8s];
	incoming.reverse();
	for (let i = 0; i < incoming.length; i++) {
		const b0 = Math.pow(256, 0) * (incoming[i + 0] || 0);
		const b1 = Math.pow(256, 1) * (incoming[i + 1] || 0);
		const b2 = Math.pow(256, 2) * (incoming[i + 2] || 0);
		let v = b0 + b1 + b2;
		for (let j = 0; j < 4; j++) {
			res.push(v % 64);
			v = Math.floor(v / 64);
		}
	}
	res.reverse();
	let start = 0;
	while (start < 4 && !res[start]) start++;
	return res.slice(start);
}
function strIdStr(s) {
	return b8sToB6s(...new TextEncoder().encode(s)).map((n) => b6Char(n)).join("");
}
const OF_LITERALS = /* @__PURE__ */ new Map();
OF_LITERALS.set(void 0, "U");
OF_LITERALS.set(null, "0");
OF_LITERALS.set(true, "t");
OF_LITERALS.set(false, "f");
function of(v) {
	const litVal = OF_LITERALS.get(v);
	if (litVal) return litVal;
	else if (typeof v === "number") return `N${strIdStr(`${v}`)}`;
	else return `S${strIdStr(v)}`;
}
var slp_exports = /* @__PURE__ */ __exportAll({ parseIntakeGame: () => parseIntakeGame });
function _S(t) {
	return [t];
}
const Props = (props) => {
	function CLEAN(v) {
		const typeofStr = typeof v;
		if (Array.isArray(v)) return v.map(CLEAN).filter((v) => v !== void 0);
		if (v === null || v === false) return;
		if (typeofStr === "object") return Props(v);
		return v;
	}
	const ks = Object.keys(props);
	for (const k of ks) {
		props[k] = CLEAN(props[k]);
		if (props[k] === void 0) delete props[k];
	}
	return props;
};
const nil = (v) => v === null ? void 0 : v;
const snil = (v) => v === "" ? void 0 : nil(v);
function isAny(v) {
	return v !== void 0 && v !== null;
}
function slpId(ident) {
	if (ident.type === "SeedStart") return [
		"RT",
		of(ident.seed),
		of(ident.startAt)
	].join(".");
	else if (ident.type === "SeedSession") return [
		"RS",
		of(ident.seed),
		of(ident.session),
		of(ident.game),
		of(ident.tiebreaker)
	].join(".");
	return "";
}
const PLAYER_IND_LOOKUP = {
	[0]: 0,
	[1]: 1,
	[2]: 2,
	[3]: 3
};
function playerMap(r) {
	const res = {};
	for (const [_k, _v] of Object.entries(r || {})) {
		const k = PLAYER_IND_LOOKUP[_k];
		const v = _v;
		if (k === void 0) continue;
		res[k] = v;
	}
	return res;
}
const ALL_PLAYER_INDS = [
	0,
	1,
	2,
	3
];
var SlpGame = class {
	game;
	settings;
	gameEnd;
	metadata;
	metadataPlayers;
	settingsPlayers;
	playerIndSet;
	_frames;
	_lastFrame;
	constructor(g) {
		this.game = g;
		this.settings = g.getSettings();
		this.gameEnd = g.getGameEnd();
		this.metadata = g.getMetadata();
		this.metadataPlayers = playerMap(this.metadata?.players);
		this.settingsPlayers = playerMap(this.settings?.players);
		this.playerIndSet = new Set(ALL_PLAYER_INDS.filter((ind) => Boolean(this.metadataPlayers[ind]) || Boolean(this.settingsPlayers[ind])));
	}
	get numPlayers() {
		return this.playerIndSet.size;
	}
	get gameEndMethod() {
		return this.gameEnd?.gameEndMethod;
	}
	get frames() {
		const framesRef = this._frames || [this.game.getFrames()];
		this._frames = framesRef;
		return framesRef[0];
	}
	getLastFrameImpl() {
		return this.metadata?.lastFrame || (() => Math.max(...Object.keys(this.frames).map((s) => parseInt(s, 10))))();
	}
	get lastFrame() {
		const lastFrameRef = this._lastFrame || [this.getLastFrameImpl()];
		this._lastFrame = lastFrameRef;
		return lastFrameRef[0];
	}
	get startAt() {
		const startAtStr = this.metadata?.startAt || void 0;
		return !startAtStr ? void 0 : new Date(startAtStr).valueOf();
	}
	get ident() {
		const startAt = this.startAt;
		const randomSeed = this.settings?.randomSeed;
		if (isAny(startAt) && isAny(randomSeed)) return {
			type: "SeedStart",
			startAt,
			seed: randomSeed
		};
		if (isAny(randomSeed) && this.settings?.matchInfo?.sessionId) {
			const { sessionId, tiebreakerNumber, gameNumber } = this.settings?.matchInfo;
			return {
				type: "SeedSession",
				seed: randomSeed,
				session: sessionId,
				game: gameNumber,
				tiebreaker: tiebreakerNumber
			};
		}
		console.error(this.settings);
		console.error(this.metadata);
		throw "unmade uniqueId";
	}
	get id() {
		return slpId(this.ident);
	}
};
function parseIntakeGame(b) {
	const slpGame = new SlippiGameCons(b);
	const slpGame_ = new SlpGame(slpGame);
	const stats = slpGame.getStats();
	const settings = slpGame.getSettings();
	const gameEnd = slpGame.getGameEnd();
	const metadata = slpGame.getMetadata();
	const metadataPlayers = metadata?.players || {};
	const _sPlayers = settings?.players || [];
	const settingsPlayers = {};
	for (const player of _sPlayers) settingsPlayers[player.playerIndex] = player;
	const getPlayerType = (ind) => {
		const readType = settingsPlayers[ind]?.type;
		if (readType === 0) return "PLAYER";
		if (readType === 1) return "CPU";
		return "UNKNOWN";
	};
	const getCC = (ind) => nil(settingsPlayers[ind]?.connectCode || metadataPlayers[ind]?.names?.code);
	const getDisplayName = (ind) => nil(settingsPlayers[ind]?.displayName || metadataPlayers[ind]?.names?.netplay);
	const getInGameTag = (ind) => snil(settingsPlayers[ind]?.nametag);
	const allPlayerInds = new Set([...Object.keys(metadataPlayers).map((s) => parseInt(s)), ...Object.keys(settingsPlayers).map((s) => parseInt(s))]);
	const lastFrame = metadata?.lastFrame || (() => Math.max(...Object.keys(slpGame.getFrames()).map((s) => parseInt(s, 10))))();
	const startAtStr = metadata?.startAt || void 0;
	const randomSeed = settings?.randomSeed;
	const stageId = settings?.stageId;
	const startAt = startAtStr && new Date(startAtStr).valueOf();
	const placementsByIndex = {};
	const overallStatsList = stats?.overall || [];
	const overallByIndex = {};
	for (const overallStats of overallStatsList) overallByIndex[overallStats.playerIndex] = overallStats;
	const actionStatsList = stats?.actionCounts || [];
	const actionByIndex = {};
	for (const actionStats of actionStatsList) actionByIndex[actionStats.playerIndex] = actionStats;
	for (const { playerIndex, position } of gameEnd?.placements || []) {
		if (playerIndex === void 0 || position === void 0) continue;
		placementsByIndex[playerIndex] = position;
	}
	const winners = slpGame.getWinners() || [];
	const winnerInds = new Set(winners.map((w) => w.playerIndex));
	const matchInfo = settings?.matchInfo;
	const sessionId = snil(matchInfo?.sessionId || matchInfo?.matchId);
	const inGameMode = settings?.inGameMode;
	const isTeams = settings?.isTeams;
	const numPlayers = allPlayerInds.size;
	const allParsedPlayers = [...allPlayerInds].every((ind) => Boolean(settingsPlayers[ind]));
	const conversions = stats?.conversions || [];
	const anyParsedConversions = conversions.length > 0;
	const is1v1ParsedSingles = inGameMode === 32 && !isTeams && numPlayers === 2 && allParsedPlayers && anyParsedConversions;
	const session = sessionId ? sessionId : "";
	return {
		game: {
			game_id: slpGame_.id,
			session,
			props: Props({
				slpVersion: snil(settings?.slpVersion),
				gameMode: settings?.gameMode,
				inGameMode,
				isTeams,
				numPlayers,
				allParsedPlayers,
				anyParsedConversions,
				is1v1ParsedSingles,
				stageId,
				lastFrame,
				randomSeed,
				startAt,
				console_name: snil(metadata?.consoleNick),
				platform: snil(metadata?.playedOn),
				gameEndMethod: gameEnd?.gameEndMethod,
				lrasInitiatorIndex: gameEnd?.lrasInitiatorIndex,
				sessionId,
				sessionGameNumber: settings?.matchInfo?.gameNumber,
				sessionTiebreakerNumber: settings?.matchInfo?.tiebreakerNumber,
				isRanked: (sessionId || "").startsWith("mode.ranked")
			})
		},
		ports: [...allPlayerInds].flatMap((ind) => {
			const port = settingsPlayers[ind]?.port;
			if (port === void 0) return [];
			return _S({
				port,
				props: Props({
					playerType: getPlayerType(ind),
					entrant: ind,
					cc: getCC(ind),
					displayName: getDisplayName(ind),
					inGameTag: getInGameTag(ind),
					charId: settingsPlayers[ind]?.characterId,
					colorId: settingsPlayers[ind]?.characterColor,
					isLrasInitiator: ind === gameEnd?.lrasInitiatorIndex,
					placement: placementsByIndex[ind],
					isWinner: winnerInds.has(ind),
					isLoser: winnerInds.size > 0 && !winnerInds.has(ind),
					groundTechAway: actionByIndex[ind]?.groundTechCount?.away,
					groundTechIn: actionByIndex[ind]?.groundTechCount?.in,
					groundTechNeutral: actionByIndex[ind]?.groundTechCount?.neutral,
					groundTechFail: actionByIndex[ind]?.groundTechCount?.fail,
					wallTech: actionByIndex[ind]?.wallTechCount?.success,
					wallTechFail: actionByIndex[ind]?.wallTechCount?.fail,
					jab1: actionByIndex[ind]?.attackCount?.jab1,
					jab2: actionByIndex[ind]?.attackCount?.jab2,
					jab3: actionByIndex[ind]?.attackCount?.jab3,
					jabm: actionByIndex[ind]?.attackCount?.jabm,
					dash: actionByIndex[ind]?.attackCount?.dash,
					ftilt: actionByIndex[ind]?.attackCount?.ftilt,
					dtilt: actionByIndex[ind]?.attackCount?.dtilt,
					utilt: actionByIndex[ind]?.attackCount?.utilt,
					fsmash: actionByIndex[ind]?.attackCount?.fsmash,
					dsmash: actionByIndex[ind]?.attackCount?.dsmash,
					usmash: actionByIndex[ind]?.attackCount?.usmash,
					nair: actionByIndex[ind]?.attackCount?.nair,
					fair: actionByIndex[ind]?.attackCount?.fair,
					bair: actionByIndex[ind]?.attackCount?.bair,
					uair: actionByIndex[ind]?.attackCount?.uair,
					dair: actionByIndex[ind]?.attackCount?.dair,
					roll: actionByIndex[ind]?.rollCount,
					ledgeGrab: actionByIndex[ind]?.ledgegrabCount,
					spotDodge: actionByIndex[ind]?.spotDodgeCount,
					dashDance: actionByIndex[ind]?.dashDanceCount,
					airDodge: actionByIndex[ind]?.airDodgeCount,
					wavedash: actionByIndex[ind]?.wavedashCount,
					waveland: actionByIndex[ind]?.wavelandCount,
					lCancel: actionByIndex[ind]?.lCancelCount?.success,
					lCancelFail: actionByIndex[ind]?.lCancelCount?.fail,
					edgeCancel: actionByIndex[ind]?.edgeCancelCount?.success,
					edgeCancelSlow: actionByIndex[ind]?.edgeCancelCount?.slow,
					grab: actionByIndex[ind]?.grabCount?.success,
					grabFail: actionByIndex[ind]?.grabCount?.fail,
					throwUp: actionByIndex[ind]?.throwCount?.up,
					throwBack: actionByIndex[ind]?.throwCount?.back,
					throwDown: actionByIndex[ind]?.throwCount?.down,
					throwForward: actionByIndex[ind]?.throwCount?.forward,
					inputsButtons: overallByIndex[ind]?.inputCounts?.buttons,
					inputsTriggers: overallByIndex[ind]?.inputCounts?.triggers,
					inputsCstick: overallByIndex[ind]?.inputCounts?.cstick,
					inputsJoystick: overallByIndex[ind]?.inputCounts?.joystick,
					inputsTotal: overallByIndex[ind]?.inputCounts?.total,
					totalDamage: overallByIndex[ind]?.totalDamage,
					killCount: overallByIndex[ind]?.killCount,
					ipm: overallByIndex[ind]?.inputsPerMinute?.ratio,
					dipm: overallByIndex[ind]?.digitalInputsPerMinute?.ratio,
					opk: overallByIndex[ind]?.openingsPerKill?.ratio,
					neutralRate: overallByIndex[ind]?.neutralWinRatio?.ratio,
					counterRate: overallByIndex[ind]?.counterHitRatio?.ratio,
					tradeRate: overallByIndex[ind]?.beneficialTradeRatio?.ratio
				})
			});
		}),
		marks: !is1v1ParsedSingles ? [] : conversions.flatMap((combo) => {
			const { playerIndex, startFrame, startPercent, endPercent } = combo;
			const { endFrame, didKill, openingType, moves } = combo;
			const port = settingsPlayers[playerIndex]?.port;
			if (port === void 0) return [];
			const frameDelta = endFrame === void 0 ? NaN : endFrame - startFrame;
			const validFrameDelta = !Number.isNaN(frameDelta) && frameDelta >= 0;
			const percentDelta = endPercent === void 0 ? NaN : endPercent - startPercent;
			const validPercentDelta = !Number.isNaN(percentDelta) && percentDelta >= 0;
			return _S({
				process: "intake",
				start: startFrame,
				length: validFrameDelta ? frameDelta : lastFrame - startFrame,
				props: {
					type: "slp|stats|conversion",
					openingPort: port,
					openingType,
					lastHitBy: combo.lastHitBy,
					didKill: startFrame > (endFrame || 0) ? true : didKill,
					startPercent,
					totalDamage: validPercentDelta ? percentDelta : moves.reduce((dmg, m) => dmg + m.damage, 0),
					numMoves: moves.length,
					moves: moves.map((m) => m.moveId)
				}
			});
		})
	};
}
function $$(k) {
	return (obj) => obj[k];
}
function $$_(k) {
	return (obj, v) => obj[k] = v;
}
const charRecordGetter = (recName) => () => {
	const charRecord = $$(recName)(ssbmChar) || {};
	$$_(recName)(ssbmChar, charRecord);
	return charRecord;
};
const charRecordRowGetter = (recName) => (k) => charRecordGetter(recName)()[k] || SSBM.Char.Invalid;
const charRecordRowSetter = (recName) => (k, v) => charRecordGetter(recName)()[k] = v;
const setCharById = charRecordRowSetter("__charById");
const setCharBySlippiApiName = charRecordRowSetter("__charBySlippiApiName");
const getCharById = charRecordRowGetter("__charById");
const getCharBySlippiApiName = charRecordRowGetter("__charBySlippiApiName");
function buildSsbmChar(id, name, slippiApiName, opts = {}) {
	return {
		preferCSP: false,
		meleeCSPFilename: name,
		meleeCSPDirname: opts.meleeCSPFilename || name,
		id,
		name,
		slippiApiName,
		...opts
	};
}
const ssbmChar = (...args) => {
	const char = buildSsbmChar(...args);
	setCharById(char.id, char);
	setCharBySlippiApiName(char.slippiApiName, char);
	return char;
};
const SSBM = {
	Slp: slp_exports,
	GAME_FIRST_FRAME: -123,
	Char: {
		of: (id) => getCharById(id),
		ofSlippiApiName: (name) => getCharBySlippiApiName(name),
		Falcon: ssbmChar(Character.CAPTAIN_FALCON, "Captain Falcon", "CAPTAIN_FALCON"),
		DK: ssbmChar(Character.DONKEY_KONG, "Donkey Kong", "DONKEY_KONG"),
		Fox: ssbmChar(Character.FOX, "Fox", "FOX"),
		GameAndWatch: ssbmChar(Character.GAME_AND_WATCH, "Mr. Game & Watch", "GAME_AND_WATCH", { meleeCSPFilename: "Mr. Game and Watch" }),
		Kirby: ssbmChar(Character.KIRBY, "Kirby", "KIRBY"),
		Bowser: ssbmChar(Character.BOWSER, "Bowser", "BOWSER"),
		Link: ssbmChar(Character.LINK, "Link", "LINK"),
		Luigi: ssbmChar(Character.LUIGI, "Luigi", "LUIGI"),
		Mario: ssbmChar(Character.MARIO, "Mario", "MARIO"),
		Marth: ssbmChar(Character.MARTH, "Marth", "MARTH"),
		Mewtwo: ssbmChar(Character.MEWTWO, "Mewtwo", "MEWTWO"),
		Ness: ssbmChar(Character.NESS, "Ness", "NESS"),
		Peach: ssbmChar(Character.PEACH, "Peach", "PEACH"),
		Pikachu: ssbmChar(Character.PIKACHU, "Pikachu", "PIKACHU"),
		ICs: ssbmChar(Character.ICE_CLIMBERS, "Ice Climbers", "ICE_CLIMBERS", {
			meleeCSPDirname: "Ice Climbers",
			meleeCSPFilename: "Ice_Climbers"
		}),
		Puff: ssbmChar(Character.JIGGLYPUFF, "Jigglypuff", "JIGGLYPUFF"),
		Samus: ssbmChar(Character.SAMUS, "Samus", "SAMUS"),
		Yoshi: ssbmChar(Character.YOSHI, "Yoshi", "YOSHI"),
		Zelda: ssbmChar(Character.ZELDA, "Zelda", "ZELDA", { meleeCSPDirname: "Zelda and Sheik" }),
		Sheik: ssbmChar(Character.SHEIK, "Sheik", "SHEIK", { meleeCSPDirname: "Zelda and Sheik" }),
		Falco: ssbmChar(Character.FALCO, "Falco", "FALCO"),
		YLink: ssbmChar(Character.YOUNG_LINK, "Young Link", "YOUNG_LINK"),
		Doc: ssbmChar(Character.DR_MARIO, "Dr. Mario", "DR_MARIO"),
		Roy: ssbmChar(Character.ROY, "Roy", "ROY"),
		Pichu: ssbmChar(Character.PICHU, "Pichu", "PICHU"),
		Ganon: ssbmChar(Character.GANONDORF, "Ganondorf", "GANONDORF"),
		MasterHand: ssbmChar(Character.MASTER_HAND, "Master Hand", ""),
		WireframeMale: ssbmChar(Character.WIREFRAME_MALE, "Wireframe Male", ""),
		WireframeFemale: ssbmChar(Character.WIREFRAME_FEMALE, "Wireframe Female", ""),
		GigaBowser: ssbmChar(Character.GIGA_BOWSER, "Giga Bowser", ""),
		CrazyHand: ssbmChar(Character.CRAZY_HAND, "Crazy Hand", ""),
		Sandbag: ssbmChar(Character.SANDBAG, "Sandbag", ""),
		Popo: ssbmChar(Character.POPO, "Popo", ""),
		Invalid: ssbmChar(-1, "", "")
	}
};
new class StackConfigClass {
	initialState;
	joinWriters;
	reader;
	constructor(initialState, joinWriters, reader) {
		this.initialState = initialState;
		this.joinWriters = joinWriters;
		this.reader = reader;
	}
	_r(r) {
		return new StackConfigClass(this.initialState, this.joinWriters, r);
	}
	_w(joinWriters) {
		return new StackConfigClass(this.initialState, joinWriters, this.reader);
	}
	_s(initialState) {
		return new StackConfigClass(initialState, this.joinWriters, this.reader);
	}
	exec(m) {
		return exec(m, this);
	}
	execAsync(m) {
		return execAsync(m, this);
	}
}(void 0, void 0, void 0);
function exec(m, stackCfg) {
	let res = void 0;
	execRaw(m, stackCfg, (finalRes) => res = finalRes);
	if (!res) throw "non-terminated rwse monad";
	return res;
}
async function execRaw(m, stackCfg, onDone) {
	const stack = stackCfg;
	function joinWrites(ws) {
		if (stack.joinWriters) return stack.joinWriters(...ws);
	}
	const writes = [];
	let state = stack.initialState;
	let awaited;
	const g = m;
	while (true) {
		const result = g.next({
			state,
			reader: stack.reader,
			awaited
		});
		if (result.done) return onDone({
			state,
			written: joinWrites(writes),
			isOk: true,
			res: result.value,
			err: null
		});
		else {
			const y = result.value;
			if (y.cmd === "TELL") writes.push(y.val);
			else if (y.cmd === "PUT") state = y.val;
			else if (y.cmd === "FAIL") return onDone({
				state,
				written: joinWrites(writes),
				isOk: false,
				err: y.val,
				res: null
			});
			else if (y.cmd === "AWAIT") try {
				awaited = await y.val;
			} catch (err) {
				if (!y.catcher) throw err;
				const caughtVal = y.catcher(err);
				if (!caughtVal) throw err;
				else if (!caughtVal.isOk) return onDone({
					state,
					written: joinWrites(writes),
					isOk: false,
					res: null,
					err: caughtVal.err
				});
				else awaited = caughtVal.res;
			}
		}
	}
}
function execAsync(m, stackCfg) {
	return new Promise((resolve) => execRaw(m, stackCfg, resolve));
}
//#endregion
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
async function doesFileExist(path) {
	try {
		await fs.access(path, fs.constants.F_OK);
		return true;
	} catch {
		return false;
	}
}
const isWindows = os$1.platform() === "win32";
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
		const userConfig = await fs.readFile(configPath, "utf8").then((s) => parse$1(s));
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
	const { SingleBar, Presets } = import_cli_progress.default;
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
		await fs.writeFile(fullPath, import_ini.stringify(iniJson));
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
	const { lastFrame } = SSBM.Slp.parseIntakeGame(await fs.readFile(slpFile));
	console.log({ lastFrame });
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
		const tail = new import_tail_file.default(aviFile.rawPath, {
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
