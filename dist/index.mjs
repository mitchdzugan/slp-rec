#!/usr/bin/env node
import process$1 from "process";
import "util";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import envPaths from "env-paths";
import * as yaml from "js-yaml";
//#region output/Control.Apply/foreign.js
const arrayApply = function(fs) {
	return function(xs) {
		var l = fs.length;
		var k = xs.length;
		var result = new Array(l * k);
		var n = 0;
		for (var i = 0; i < l; i++) {
			var f = fs[i];
			for (var j = 0; j < k; j++) result[n++] = f(xs[j]);
		}
		return result;
	};
};
//#endregion
//#region output/Control.Semigroupoid/index.js
var semigroupoidFn = { compose: function(f) {
	return function(g) {
		return function(x) {
			return f(g(x));
		};
	};
} };
var compose = function(dict) {
	return dict.compose;
};
//#endregion
//#region output/Control.Category/index.js
var identity$15 = function(dict) {
	return dict.identity;
};
var categoryFn = {
	identity: function(x) {
		return x;
	},
	Semigroupoid0: function() {
		return semigroupoidFn;
	}
};
//#endregion
//#region output/Data.Function/index.js
var on$4 = function(f) {
	return function(g) {
		return function(x) {
			return function(y) {
				return f(g(x))(g(y));
			};
		};
	};
};
var flip = function(f) {
	return function(b) {
		return function(a) {
			return f(a)(b);
		};
	};
};
var $$const = function(a) {
	return function(v) {
		return a;
	};
};
var applyFlipped = function(x) {
	return function(f) {
		return f(x);
	};
};
//#endregion
//#region output/Data.Functor/foreign.js
const arrayMap = function(f) {
	return function(arr) {
		var l = arr.length;
		var result = new Array(l);
		for (var i = 0; i < l; i++) result[i] = f(arr[i]);
		return result;
	};
};
//#endregion
//#region output/Type.Proxy/index.js
var $$Proxy = /* #__PURE__ */ (function() {
	function $$Proxy() {}
	$$Proxy.value = new $$Proxy();
	return $$Proxy;
})();
//#endregion
//#region output/Data.Functor/index.js
var map$20 = function(dict) {
	return dict.map;
};
var mapFlipped$4 = function(dictFunctor) {
	var map1 = map$20(dictFunctor);
	return function(fa) {
		return function(f) {
			return map1(f)(fa);
		};
	};
};
var $$void$3 = function(dictFunctor) {
	return map$20(dictFunctor)($$const(void 0));
};
var voidRight$2 = function(dictFunctor) {
	var map1 = map$20(dictFunctor);
	return function(x) {
		return map1($$const(x));
	};
};
var functorFn = { map: /* #__PURE__ */ compose(semigroupoidFn) };
var functorArray = { map: arrayMap };
//#endregion
//#region output/Control.Apply/index.js
var identity$14 = /* #__PURE__ */ identity$15(categoryFn);
var applyArray = {
	apply: arrayApply,
	Functor0: function() {
		return functorArray;
	}
};
var apply$8 = function(dict) {
	return dict.apply;
};
var applyFirst = function(dictApply) {
	var apply1 = apply$8(dictApply);
	var map = map$20(dictApply.Functor0());
	return function(a) {
		return function(b) {
			return apply1(map($$const)(a))(b);
		};
	};
};
var applySecond = function(dictApply) {
	var apply1 = apply$8(dictApply);
	var map = map$20(dictApply.Functor0());
	return function(a) {
		return function(b) {
			return apply1(map($$const(identity$14))(a))(b);
		};
	};
};
var lift2$2 = function(dictApply) {
	var apply1 = apply$8(dictApply);
	var map = map$20(dictApply.Functor0());
	return function(f) {
		return function(a) {
			return function(b) {
				return apply1(map(f)(a))(b);
			};
		};
	};
};
//#endregion
//#region output/Control.Applicative/index.js
var pure$18 = function(dict) {
	return dict.pure;
};
var when$2 = function(dictApplicative) {
	var pure1 = pure$18(dictApplicative);
	return function(v) {
		return function(v1) {
			if (v) return v1;
			if (!v) return pure1(void 0);
			throw new Error("Failed pattern match at Control.Applicative (line 63, column 1 - line 63, column 63): " + [v.constructor.name, v1.constructor.name]);
		};
	};
};
var liftA1 = function(dictApplicative) {
	var apply = apply$8(dictApplicative.Apply0());
	var pure1 = pure$18(dictApplicative);
	return function(f) {
		return function(a) {
			return apply(pure1(f))(a);
		};
	};
};
var applicativeArray = {
	pure: function(x) {
		return [x];
	},
	Apply0: function() {
		return applyArray;
	}
};
//#endregion
//#region output/Control.Bind/foreign.js
const arrayBind = typeof Array.prototype.flatMap === "function" ? function(arr) {
	return function(f) {
		return arr.flatMap(f);
	};
} : function(arr) {
	return function(f) {
		var result = [];
		var l = arr.length;
		for (var i = 0; i < l; i++) {
			var xs = f(arr[i]);
			var k = xs.length;
			for (var j = 0; j < k; j++) result.push(xs[j]);
		}
		return result;
	};
};
//#endregion
//#region output/Control.Bind/index.js
var discard$7 = function(dict) {
	return dict.discard;
};
var bindArray = {
	bind: arrayBind,
	Apply0: function() {
		return applyArray;
	}
};
var bind$15 = function(dict) {
	return dict.bind;
};
var bindFlipped$2 = function(dictBind) {
	return flip(bind$15(dictBind));
};
var composeKleisliFlipped$1 = function(dictBind) {
	var bindFlipped1 = bindFlipped$2(dictBind);
	return function(f) {
		return function(g) {
			return function(a) {
				return bindFlipped1(f)(g(a));
			};
		};
	};
};
var composeKleisli$1 = function(dictBind) {
	var bind1 = bind$15(dictBind);
	return function(f) {
		return function(g) {
			return function(a) {
				return bind1(f(a))(g);
			};
		};
	};
};
var discardUnit = { discard: function(dictBind) {
	return bind$15(dictBind);
} };
//#endregion
//#region output/Data.Argonaut.Core/foreign.js
function id$1(x) {
	return x;
}
function stringify(j) {
	return JSON.stringify(j);
}
function _caseJson(isNull, isBool, isNum, isStr, isArr, isObj, j) {
	if (j == null) return isNull();
	else if (typeof j === "boolean") return isBool(j);
	else if (typeof j === "number") return isNum(j);
	else if (typeof j === "string") return isStr(j);
	else if (Object.prototype.toString.call(j) === "[object Array]") return isArr(j);
	else return isObj(j);
}
//#endregion
//#region output/Data.Eq/foreign.js
var refEq = function(r1) {
	return function(r2) {
		return r1 === r2;
	};
};
const eqBooleanImpl = refEq;
const eqIntImpl = refEq;
const eqCharImpl = refEq;
const eqStringImpl = refEq;
//#endregion
//#region output/Data.Symbol/index.js
var reflectSymbol = function(dict) {
	return dict.reflectSymbol;
};
//#endregion
//#region output/Record.Unsafe/foreign.js
const unsafeHas = function(label) {
	return function(rec) {
		return {}.hasOwnProperty.call(rec, label);
	};
};
const unsafeGet = function(label) {
	return function(rec) {
		return rec[label];
	};
};
const unsafeSet = function(label) {
	return function(value) {
		return function(rec) {
			var copy = {};
			for (var key in rec) if ({}.hasOwnProperty.call(rec, key)) copy[key] = rec[key];
			copy[label] = value;
			return copy;
		};
	};
};
var eqString = { eq: eqStringImpl };
var eqInt = { eq: eqIntImpl };
var eqChar = { eq: eqCharImpl };
var eqBoolean = { eq: eqBooleanImpl };
var eq$1 = function(dict) {
	return dict.eq;
};
var eq2$2 = /* #__PURE__ */ eq$1(eqBoolean);
var notEq$1 = function(dictEq) {
	var eq3 = eq$1(dictEq);
	return function(x) {
		return function(y) {
			return eq2$2(eq3(x)(y))(false);
		};
	};
};
//#endregion
//#region output/Data.Semigroup/foreign.js
const concatString = function(s1) {
	return function(s2) {
		return s1 + s2;
	};
};
const concatArray = function(xs) {
	return function(ys) {
		if (xs.length === 0) return ys;
		if (ys.length === 0) return xs;
		return xs.concat(ys);
	};
};
var semigroupString = { append: concatString };
var semigroupRecordNil = { appendRecord: function(v) {
	return function(v1) {
		return function(v2) {
			return {};
		};
	};
} };
var semigroupArray = { append: concatArray };
var appendRecord = function(dict) {
	return dict.appendRecord;
};
var semigroupRecord$1 = function() {
	return function(dictSemigroupRecord) {
		return { append: appendRecord(dictSemigroupRecord)($$Proxy.value) };
	};
};
var append$7 = function(dict) {
	return dict.append;
};
var semigroupFn = function(dictSemigroup) {
	var append1 = append$7(dictSemigroup);
	return { append: function(f) {
		return function(g) {
			return function(x) {
				return append1(f(x))(g(x));
			};
		};
	} };
};
var semigroupRecordCons = function(dictIsSymbol) {
	var reflectSymbol$29 = reflectSymbol(dictIsSymbol);
	return function() {
		return function(dictSemigroupRecord) {
			var appendRecord1 = appendRecord(dictSemigroupRecord);
			return function(dictSemigroup) {
				var append1 = append$7(dictSemigroup);
				return { appendRecord: function(v) {
					return function(ra) {
						return function(rb) {
							var tail = appendRecord1($$Proxy.value)(ra)(rb);
							var key = reflectSymbol$29($$Proxy.value);
							var insert = unsafeSet(key);
							var get = unsafeGet(key);
							return insert(append1(get(ra))(get(rb)))(tail);
						};
					};
				} };
			};
		};
	};
};
var alt$6 = function(dict) {
	return dict.alt;
};
//#endregion
//#region output/Data.Bounded/foreign.js
const topInt = 2147483647;
const bottomInt = -2147483648;
Number.POSITIVE_INFINITY;
Number.NEGATIVE_INFINITY;
//#endregion
//#region output/Data.Ord/foreign.js
var unsafeCompareImpl = function(lt) {
	return function(eq) {
		return function(gt) {
			return function(x) {
				return function(y) {
					return x < y ? lt : x === y ? eq : gt;
				};
			};
		};
	};
};
const ordIntImpl = unsafeCompareImpl;
const ordStringImpl = unsafeCompareImpl;
const ordCharImpl = unsafeCompareImpl;
//#endregion
//#region output/Data.Ordering/index.js
var LT = /* #__PURE__ */ (function() {
	function LT() {}
	LT.value = new LT();
	return LT;
})();
var GT = /* #__PURE__ */ (function() {
	function GT() {}
	GT.value = new GT();
	return GT;
})();
var EQ = /* #__PURE__ */ (function() {
	function EQ() {}
	EQ.value = new EQ();
	return EQ;
})();
var ordString = /* #__PURE__ */ (function() {
	return {
		compare: ordStringImpl(LT.value)(EQ.value)(GT.value),
		Eq0: function() {
			return eqString;
		}
	};
})();
var ordInt = /* #__PURE__ */ (function() {
	return {
		compare: ordIntImpl(LT.value)(EQ.value)(GT.value),
		Eq0: function() {
			return eqInt;
		}
	};
})();
var ordChar = /* #__PURE__ */ (function() {
	return {
		compare: ordCharImpl(LT.value)(EQ.value)(GT.value),
		Eq0: function() {
			return eqChar;
		}
	};
})();
var compare$2 = function(dict) {
	return dict.compare;
};
var greaterThan$1 = function(dictOrd) {
	var compare3 = compare$2(dictOrd);
	return function(a1) {
		return function(a2) {
			if (compare3(a1)(a2) instanceof GT) return true;
			return false;
		};
	};
};
var max$1 = function(dictOrd) {
	var compare3 = compare$2(dictOrd);
	return function(x) {
		return function(y) {
			var v = compare3(x)(y);
			if (v instanceof LT) return y;
			if (v instanceof EQ) return x;
			if (v instanceof GT) return x;
			throw new Error("Failed pattern match at Data.Ord (line 181, column 3 - line 184, column 12): " + [v.constructor.name]);
		};
	};
};
var min$2 = function(dictOrd) {
	var compare3 = compare$2(dictOrd);
	return function(x) {
		return function(y) {
			var v = compare3(x)(y);
			if (v instanceof LT) return x;
			if (v instanceof EQ) return x;
			if (v instanceof GT) return y;
			throw new Error("Failed pattern match at Data.Ord (line 172, column 3 - line 175, column 12): " + [v.constructor.name]);
		};
	};
};
//#endregion
//#region output/Data.Bounded/index.js
var top$1 = function(dict) {
	return dict.top;
};
var boundedInt = {
	top: topInt,
	bottom: bottomInt,
	Ord0: function() {
		return ordInt;
	}
};
var boundedChar = {
	top: "￿",
	bottom: "\0",
	Ord0: function() {
		return ordChar;
	}
};
var bottom$1 = function(dict) {
	return dict.bottom;
};
//#endregion
//#region output/Data.Show/foreign.js
const showIntImpl = function(n) {
	return n.toString();
};
const showStringImpl = function(s) {
	var l = s.length;
	return "\"" + s.replace(/[\0-\x1F\x7F"\\]/g, function(c, i) {
		switch (c) {
			case "\"":
			case "\\": return "\\" + c;
			case "\x07": return "\\a";
			case "\b": return "\\b";
			case "\f": return "\\f";
			case "\n": return "\\n";
			case "\r": return "\\r";
			case "	": return "\\t";
			case "\v": return "\\v";
		}
		var k = i + 1;
		var empty = k < l && s[k] >= "0" && s[k] <= "9" ? "\\&" : "";
		return "\\" + c.charCodeAt(0).toString(10) + empty;
	}) + "\"";
};
var showString = { show: showStringImpl };
var showInt = { show: showIntImpl };
var show$2 = function(dict) {
	return dict.show;
};
//#endregion
//#region output/Data.Maybe/index.js
var identity$13 = /* #__PURE__ */ identity$15(categoryFn);
var Nothing = /* #__PURE__ */ (function() {
	function Nothing() {}
	Nothing.value = new Nothing();
	return Nothing;
})();
var Just = /* #__PURE__ */ (function() {
	function Just(value0) {
		this.value0 = value0;
	}
	Just.create = function(value0) {
		return new Just(value0);
	};
	return Just;
})();
var semigroupMaybe = function(dictSemigroup) {
	var append1 = append$7(dictSemigroup);
	return { append: function(v) {
		return function(v1) {
			if (v instanceof Nothing) return v1;
			if (v1 instanceof Nothing) return v;
			if (v instanceof Just && v1 instanceof Just) return new Just(append1(v.value0)(v1.value0));
			throw new Error("Failed pattern match at Data.Maybe (line 182, column 1 - line 185, column 43): " + [v.constructor.name, v1.constructor.name]);
		};
	} };
};
var optional$1 = function(dictAlt) {
	var alt = alt$6(dictAlt);
	var map1 = map$20(dictAlt.Functor0());
	return function(dictApplicative) {
		var pure = pure$18(dictApplicative);
		return function(a) {
			return alt(map1(Just.create)(a))(pure(Nothing.value));
		};
	};
};
var monoidMaybe = function(dictSemigroup) {
	var semigroupMaybe1 = semigroupMaybe(dictSemigroup);
	return {
		mempty: Nothing.value,
		Semigroup0: function() {
			return semigroupMaybe1;
		}
	};
};
var maybe = function(v) {
	return function(v1) {
		return function(v2) {
			if (v2 instanceof Nothing) return v;
			if (v2 instanceof Just) return v1(v2.value0);
			throw new Error("Failed pattern match at Data.Maybe (line 237, column 1 - line 237, column 51): " + [
				v.constructor.name,
				v1.constructor.name,
				v2.constructor.name
			]);
		};
	};
};
var isNothing = /* #__PURE__ */ maybe(true)(/* #__PURE__ */ $$const(false));
var isJust = /* #__PURE__ */ maybe(false)(/* #__PURE__ */ $$const(true));
var functorMaybe = { map: function(v) {
	return function(v1) {
		if (v1 instanceof Just) return new Just(v(v1.value0));
		return Nothing.value;
	};
} };
var map$19 = /* #__PURE__ */ map$20(functorMaybe);
var fromMaybe = function(a) {
	return maybe(a)(identity$13);
};
var fromJust$3 = function() {
	return function(v) {
		if (v instanceof Just) return v.value0;
		throw new Error("Failed pattern match at Data.Maybe (line 288, column 1 - line 288, column 46): " + [v.constructor.name]);
	};
};
var eqMaybe = function(dictEq) {
	var eq = eq$1(dictEq);
	return { eq: function(x) {
		return function(y) {
			if (x instanceof Nothing && y instanceof Nothing) return true;
			if (x instanceof Just && y instanceof Just) return eq(x.value0)(y.value0);
			return false;
		};
	} };
};
var applyMaybe = {
	apply: function(v) {
		return function(v1) {
			if (v instanceof Just) return map$19(v.value0)(v1);
			if (v instanceof Nothing) return Nothing.value;
			throw new Error("Failed pattern match at Data.Maybe (line 67, column 1 - line 69, column 30): " + [v.constructor.name, v1.constructor.name]);
		};
	},
	Functor0: function() {
		return functorMaybe;
	}
};
var bindMaybe = {
	bind: function(v) {
		return function(v1) {
			if (v instanceof Just) return v1(v.value0);
			if (v instanceof Nothing) return Nothing.value;
			throw new Error("Failed pattern match at Data.Maybe (line 125, column 1 - line 127, column 28): " + [v.constructor.name, v1.constructor.name]);
		};
	},
	Apply0: function() {
		return applyMaybe;
	}
};
var applicativeMaybe = /* #__PURE__ */ (function() {
	return {
		pure: Just.create,
		Apply0: function() {
			return applyMaybe;
		}
	};
})();
var altMaybe = {
	alt: function(v) {
		return function(v1) {
			if (v instanceof Nothing) return v1;
			return v;
		};
	},
	Functor0: function() {
		return functorMaybe;
	}
};
var plusMaybe = /* #__PURE__ */ (function() {
	return {
		empty: Nothing.value,
		Alt0: function() {
			return altMaybe;
		}
	};
})();
var alternativeMaybe = {
	Applicative0: function() {
		return applicativeMaybe;
	},
	Plus1: function() {
		return plusMaybe;
	}
};
//#endregion
//#region output/Foreign.Object/foreign.js
function _copyST(m) {
	return function() {
		var r = {};
		for (var k in m) if (hasOwnProperty.call(m, k)) r[k] = m[k];
		return r;
	};
}
const empty$5 = {};
function runST(f) {
	return f();
}
function _lookup(no, yes, k, m) {
	return k in m ? yes(m[k]) : no;
}
//#endregion
//#region output/Control.Monad.ST.Internal/foreign.js
const map_ = function(f) {
	return function(a) {
		return function() {
			return f(a());
		};
	};
};
const pure_ = function(a) {
	return function() {
		return a;
	};
};
const bind_ = function(a) {
	return function(f) {
		return function() {
			return f(a())();
		};
	};
};
function newSTRef(val) {
	return function() {
		return { value: val };
	};
}
const read = function(ref) {
	return function() {
		return ref.value;
	};
};
const modifyImpl = function(f) {
	return function(ref) {
		return function() {
			var t = f(ref.value);
			ref.value = t.state;
			return t.value;
		};
	};
};
const write = function(a) {
	return function(ref) {
		return function() {
			return ref.value = a;
		};
	};
};
var liftM1 = function(dictMonad) {
	var bind = bind$15(dictMonad.Bind1());
	var pure = pure$18(dictMonad.Applicative0());
	return function(f) {
		return function(a) {
			return bind(a)(function(a$prime) {
				return pure(f(a$prime));
			});
		};
	};
};
var ap = function(dictMonad) {
	var bind = bind$15(dictMonad.Bind1());
	var pure = pure$18(dictMonad.Applicative0());
	return function(f) {
		return function(a) {
			return bind(f)(function(f$prime) {
				return bind(a)(function(a$prime) {
					return pure(f$prime(a$prime));
				});
			});
		};
	};
};
//#endregion
//#region output/Data.Either/index.js
var Left = /* #__PURE__ */ (function() {
	function Left(value0) {
		this.value0 = value0;
	}
	Left.create = function(value0) {
		return new Left(value0);
	};
	return Left;
})();
var Right = /* #__PURE__ */ (function() {
	function Right(value0) {
		this.value0 = value0;
	}
	Right.create = function(value0) {
		return new Right(value0);
	};
	return Right;
})();
var note = function(a) {
	return maybe(new Left(a))(Right.create);
};
var functorEither = { map: function(f) {
	return function(m) {
		if (m instanceof Left) return new Left(m.value0);
		if (m instanceof Right) return new Right(f(m.value0));
		throw new Error("Failed pattern match at Data.Either (line 0, column 0 - line 0, column 0): " + [m.constructor.name]);
	};
} };
var map$18 = /* #__PURE__ */ map$20(functorEither);
var either = function(v) {
	return function(v1) {
		return function(v2) {
			if (v2 instanceof Left) return v(v2.value0);
			if (v2 instanceof Right) return v1(v2.value0);
			throw new Error("Failed pattern match at Data.Either (line 208, column 1 - line 208, column 64): " + [
				v.constructor.name,
				v1.constructor.name,
				v2.constructor.name
			]);
		};
	};
};
var hush = /* #__PURE__ */ (function() {
	return either($$const(Nothing.value))(Just.create);
})();
var applyEither = {
	apply: function(v) {
		return function(v1) {
			if (v instanceof Left) return new Left(v.value0);
			if (v instanceof Right) return map$18(v.value0)(v1);
			throw new Error("Failed pattern match at Data.Either (line 70, column 1 - line 72, column 30): " + [v.constructor.name, v1.constructor.name]);
		};
	},
	Functor0: function() {
		return functorEither;
	}
};
var bindEither = {
	bind: /* #__PURE__ */ either(function(e) {
		return function(v) {
			return new Left(e);
		};
	})(function(a) {
		return function(f) {
			return f(a);
		};
	}),
	Apply0: function() {
		return applyEither;
	}
};
var applicativeEither = /* #__PURE__ */ (function() {
	return {
		pure: Right.create,
		Apply0: function() {
			return applyEither;
		}
	};
})();
//#endregion
//#region output/Data.Identity/index.js
var Identity = function(x) {
	return x;
};
var functorIdentity = { map: function(f) {
	return function(m) {
		return f(m);
	};
} };
var applyIdentity = {
	apply: function(v) {
		return function(v1) {
			return v(v1);
		};
	},
	Functor0: function() {
		return functorIdentity;
	}
};
var bindIdentity = {
	bind: function(v) {
		return function(f) {
			return f(v);
		};
	},
	Apply0: function() {
		return applyIdentity;
	}
};
var applicativeIdentity = {
	pure: Identity,
	Apply0: function() {
		return applyIdentity;
	}
};
var monadIdentity = {
	Applicative0: function() {
		return applicativeIdentity;
	},
	Bind1: function() {
		return bindIdentity;
	}
};
//#endregion
//#region output/Data.Monoid/index.js
var semigroupRecord = /* #__PURE__ */ semigroupRecord$1();
var monoidString = {
	mempty: "",
	Semigroup0: function() {
		return semigroupString;
	}
};
var monoidRecordNil = {
	memptyRecord: function(v) {
		return {};
	},
	SemigroupRecord0: function() {
		return semigroupRecordNil;
	}
};
var monoidArray = {
	mempty: [],
	Semigroup0: function() {
		return semigroupArray;
	}
};
var memptyRecord = function(dict) {
	return dict.memptyRecord;
};
var monoidRecord = function() {
	return function(dictMonoidRecord) {
		var semigroupRecord1 = semigroupRecord(dictMonoidRecord.SemigroupRecord0());
		return {
			mempty: memptyRecord(dictMonoidRecord)($$Proxy.value),
			Semigroup0: function() {
				return semigroupRecord1;
			}
		};
	};
};
var mempty$6 = function(dict) {
	return dict.mempty;
};
var monoidFn = function(dictMonoid) {
	var mempty1 = mempty$6(dictMonoid);
	var semigroupFn$1 = semigroupFn(dictMonoid.Semigroup0());
	return {
		mempty: function(v) {
			return mempty1;
		},
		Semigroup0: function() {
			return semigroupFn$1;
		}
	};
};
var monoidRecordCons = function(dictIsSymbol) {
	var reflectSymbol$21 = reflectSymbol(dictIsSymbol);
	var semigroupRecordCons$1 = semigroupRecordCons(dictIsSymbol)();
	return function(dictMonoid) {
		var mempty1 = mempty$6(dictMonoid);
		var Semigroup0 = dictMonoid.Semigroup0();
		return function() {
			return function(dictMonoidRecord) {
				var memptyRecord1 = memptyRecord(dictMonoidRecord);
				var semigroupRecordCons1 = semigroupRecordCons$1(dictMonoidRecord.SemigroupRecord0())(Semigroup0);
				return {
					memptyRecord: function(v) {
						var tail = memptyRecord1($$Proxy.value);
						var key = reflectSymbol$21($$Proxy.value);
						return unsafeSet(key)(mempty1)(tail);
					},
					SemigroupRecord0: function() {
						return semigroupRecordCons1;
					}
				};
			};
		};
	};
};
//#endregion
//#region output/Effect/foreign.js
const pureE = function(a) {
	return function() {
		return a;
	};
};
const bindE = function(a) {
	return function(f) {
		return function() {
			return f(a())();
		};
	};
};
//#endregion
//#region output/Effect/index.js
var $runtime_lazy$6 = function(name, moduleName, init) {
	var state = 0;
	var val;
	return function(lineNumber) {
		if (state === 2) return val;
		if (state === 1) throw new ReferenceError(name + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
		state = 1;
		val = init();
		state = 2;
		return val;
	};
};
var monadEffect = {
	Applicative0: function() {
		return applicativeEffect;
	},
	Bind1: function() {
		return bindEffect;
	}
};
var bindEffect = {
	bind: bindE,
	Apply0: function() {
		return $lazy_applyEffect(0);
	}
};
var applicativeEffect = {
	pure: pureE,
	Apply0: function() {
		return $lazy_applyEffect(0);
	}
};
var $lazy_functorEffect = /* #__PURE__ */ $runtime_lazy$6("functorEffect", "Effect", function() {
	return { map: liftA1(applicativeEffect) };
});
var $lazy_applyEffect = /* #__PURE__ */ $runtime_lazy$6("applyEffect", "Effect", function() {
	return {
		apply: ap(monadEffect),
		Functor0: function() {
			return $lazy_functorEffect(0);
		}
	};
});
var functorEffect = /* #__PURE__ */ $lazy_functorEffect(20);
var applyEffect = /* #__PURE__ */ $lazy_applyEffect(23);
//#endregion
//#region output/Control.Monad.Rec.Class/index.js
var Loop = /* #__PURE__ */ (function() {
	function Loop(value0) {
		this.value0 = value0;
	}
	Loop.create = function(value0) {
		return new Loop(value0);
	};
	return Loop;
})();
var Done = /* #__PURE__ */ (function() {
	function Done(value0) {
		this.value0 = value0;
	}
	Done.create = function(value0) {
		return new Done(value0);
	};
	return Done;
})();
var tailRecM$1 = function(dict) {
	return dict.tailRecM;
};
var bifunctorStep = { bimap: function(v) {
	return function(v1) {
		return function(v2) {
			if (v2 instanceof Loop) return new Loop(v(v2.value0));
			if (v2 instanceof Done) return new Done(v1(v2.value0));
			throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 33, column 1 - line 35, column 34): " + [
				v.constructor.name,
				v1.constructor.name,
				v2.constructor.name
			]);
		};
	};
} };
//#endregion
//#region output/Control.Monad.ST.Internal/index.js
var $runtime_lazy$5 = function(name, moduleName, init) {
	var state = 0;
	var val;
	return function(lineNumber) {
		if (state === 2) return val;
		if (state === 1) throw new ReferenceError(name + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
		state = 1;
		val = init();
		state = 2;
		return val;
	};
};
var modify$prime = modifyImpl;
var modify$1 = function(f) {
	return modify$prime(function(s) {
		var s$prime = f(s);
		return {
			state: s$prime,
			value: s$prime
		};
	});
};
var functorST = { map: map_ };
var monadST = {
	Applicative0: function() {
		return applicativeST;
	},
	Bind1: function() {
		return bindST;
	}
};
var bindST = {
	bind: bind_,
	Apply0: function() {
		return $lazy_applyST(0);
	}
};
var applicativeST = {
	pure: pure_,
	Apply0: function() {
		return $lazy_applyST(0);
	}
};
var $lazy_applyST = /* #__PURE__ */ $runtime_lazy$5("applyST", "Control.Monad.ST.Internal", function() {
	return {
		apply: ap(monadST),
		Functor0: function() {
			return functorST;
		}
	};
});
//#endregion
//#region output/Data.Array/foreign.js
var replicateFill = function(count, value) {
	if (count < 1) return [];
	return new Array(count).fill(value);
};
var replicatePolyfill = function(count, value) {
	var result = [];
	var n = 0;
	for (var i = 0; i < count; i++) result[n++] = value;
	return result;
};
const replicateImpl = typeof Array.prototype.fill === "function" ? replicateFill : replicatePolyfill;
const fromFoldableImpl = (function() {
	function Cons(head, tail) {
		this.head = head;
		this.tail = tail;
	}
	var emptyList = {};
	function curryCons(head) {
		return function(tail) {
			return new Cons(head, tail);
		};
	}
	function listToArray(list) {
		var result = [];
		var count = 0;
		var xs = list;
		while (xs !== emptyList) {
			result[count++] = xs.head;
			xs = xs.tail;
		}
		return result;
	}
	return function(foldr, xs) {
		return listToArray(foldr(curryCons)(emptyList)(xs));
	};
})();
const length$2 = function(xs) {
	return xs.length;
};
const unconsImpl = function(empty, next, xs) {
	return xs.length === 0 ? empty({}) : next(xs[0])(xs.slice(1));
};
const indexImpl = function(just, nothing, xs, i) {
	return i < 0 || i >= xs.length ? nothing : just(xs[i]);
};
const reverse$1 = function(l) {
	return l.slice().reverse();
};
const filterImpl = function(f, xs) {
	return xs.filter(f);
};
const sortByImpl = (function() {
	function mergeFromTo(compare, fromOrdering, xs1, xs2, from, to) {
		var mid;
		var i;
		var j;
		var k;
		var x;
		var y;
		var c;
		mid = from + (to - from >> 1);
		if (mid - from > 1) mergeFromTo(compare, fromOrdering, xs2, xs1, from, mid);
		if (to - mid > 1) mergeFromTo(compare, fromOrdering, xs2, xs1, mid, to);
		i = from;
		j = mid;
		k = from;
		while (i < mid && j < to) {
			x = xs2[i];
			y = xs2[j];
			c = fromOrdering(compare(x)(y));
			if (c > 0) {
				xs1[k++] = y;
				++j;
			} else {
				xs1[k++] = x;
				++i;
			}
		}
		while (i < mid) xs1[k++] = xs2[i++];
		while (j < to) xs1[k++] = xs2[j++];
	}
	return function(compare, fromOrdering, xs) {
		var out;
		if (xs.length < 2) return xs;
		out = xs.slice(0);
		mergeFromTo(compare, fromOrdering, out, xs.slice(0), 0, xs.length);
		return out;
	};
})();
const sliceImpl = function(s, e, l) {
	return l.slice(s, e);
};
const unsafeIndexImpl = function(xs, n) {
	return xs[n];
};
//#endregion
//#region output/Data.Array.ST/foreign.js
function newSTArray() {
	return [];
}
function unsafeFreezeThawImpl(xs) {
	return xs;
}
const unsafeFreezeImpl = unsafeFreezeThawImpl;
const pushImpl = function(a, xs) {
	return xs.push(a);
};
//#endregion
//#region output/Control.Monad.ST.Uncurried/foreign.js
const runSTFn1 = function runSTFn1(fn) {
	return function(a) {
		return function() {
			return fn(a);
		};
	};
};
const runSTFn2 = function runSTFn2(fn) {
	return function(a) {
		return function(b) {
			return function() {
				return fn(a, b);
			};
		};
	};
};
//#endregion
//#region output/Data.Array.ST/index.js
var unsafeFreeze = /* #__PURE__ */ runSTFn1(unsafeFreezeImpl);
var push = /* #__PURE__ */ runSTFn2(pushImpl);
//#endregion
//#region output/Data.HeytingAlgebra/foreign.js
const boolConj = function(b1) {
	return function(b2) {
		return b1 && b2;
	};
};
const boolDisj = function(b1) {
	return function(b2) {
		return b1 || b2;
	};
};
const boolNot = function(b) {
	return !b;
};
//#endregion
//#region output/Data.HeytingAlgebra/index.js
var not$1 = function(dict) {
	return dict.not;
};
var ff = function(dict) {
	return dict.ff;
};
var disj = function(dict) {
	return dict.disj;
};
var heytingAlgebraBoolean = {
	ff: false,
	tt: true,
	implies: function(a) {
		return function(b) {
			return disj(heytingAlgebraBoolean)(not$1(heytingAlgebraBoolean)(a))(b);
		};
	},
	conj: boolConj,
	disj: boolDisj,
	not: boolNot
};
//#endregion
//#region output/Data.Array.ST.Iterator/index.js
var map$17 = /* #__PURE__ */ map$20(functorST);
var not = /* #__PURE__ */ not$1(heytingAlgebraBoolean);
var $$void$2 = /* #__PURE__ */ $$void$3(functorST);
var Iterator = /* #__PURE__ */ (function() {
	function Iterator(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Iterator.create = function(value0) {
		return function(value1) {
			return new Iterator(value0, value1);
		};
	};
	return Iterator;
})();
var peek = function(v) {
	return function __do() {
		var i = read(v.value1)();
		return v.value0(i);
	};
};
var next = function(v) {
	return function __do() {
		var i = read(v.value1)();
		modify$1(function(v1) {
			return v1 + 1 | 0;
		})(v.value1)();
		return v.value0(i);
	};
};
var pushWhile = function(p) {
	return function(iter) {
		return function(array) {
			return function __do() {
				var $$break = newSTRef(false)();
				while (map$17(not)(read($$break))()) (function __do() {
					var mx = peek(iter)();
					if (mx instanceof Just && p(mx.value0)) {
						push(mx.value0)(array)();
						return $$void$2(next(iter))();
					}
					return $$void$2(write(true)($$break))();
				})();
				return {};
			};
		};
	};
};
var iterator = function(f) {
	return map$17(Iterator.create(f))(newSTRef(0));
};
var iterate = function(iter) {
	return function(f) {
		return function __do() {
			var $$break = newSTRef(false)();
			while (map$17(not)(read($$break))()) (function __do() {
				var mx = next(iter)();
				if (mx instanceof Just) return f(mx.value0)();
				if (mx instanceof Nothing) return $$void$2(write(true)($$break))();
				throw new Error("Failed pattern match at Data.Array.ST.Iterator (line 42, column 5 - line 44, column 47): " + [mx.constructor.name]);
			})();
			return {};
		};
	};
};
//#endregion
//#region output/Data.Foldable/foreign.js
const foldrArray = function(f) {
	return function(init) {
		return function(xs) {
			var acc = init;
			for (var i = xs.length - 1; i >= 0; i--) acc = f(xs[i])(acc);
			return acc;
		};
	};
};
const foldlArray = function(f) {
	return function(init) {
		return function(xs) {
			var acc = init;
			var len = xs.length;
			for (var i = 0; i < len; i++) acc = f(acc)(xs[i]);
			return acc;
		};
	};
};
//#endregion
//#region output/Control.Plus/index.js
var empty$4 = function(dict) {
	return dict.empty;
};
//#endregion
//#region output/Data.Tuple/index.js
var Tuple = /* #__PURE__ */ (function() {
	function Tuple(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Tuple.create = function(value0) {
		return function(value1) {
			return new Tuple(value0, value1);
		};
	};
	return Tuple;
})();
var uncurry = function(f) {
	return function(v) {
		return f(v.value0)(v.value1);
	};
};
var snd = function(v) {
	return v.value1;
};
var semigroupTuple = function(dictSemigroup) {
	var append1 = append$7(dictSemigroup);
	return function(dictSemigroup1) {
		var append2 = append$7(dictSemigroup1);
		return { append: function(v) {
			return function(v1) {
				return new Tuple(append1(v.value0)(v1.value0), append2(v.value1)(v1.value1));
			};
		} };
	};
};
var monoidTuple = function(dictMonoid) {
	var mempty = mempty$6(dictMonoid);
	var semigroupTuple1 = semigroupTuple(dictMonoid.Semigroup0());
	return function(dictMonoid1) {
		var semigroupTuple2 = semigroupTuple1(dictMonoid1.Semigroup0());
		return {
			mempty: new Tuple(mempty, mempty$6(dictMonoid1)),
			Semigroup0: function() {
				return semigroupTuple2;
			}
		};
	};
};
var fst = function(v) {
	return v.value0;
};
var curry = function(f) {
	return function(a) {
		return function(b) {
			return f(new Tuple(a, b));
		};
	};
};
//#endregion
//#region output/Data.Bifunctor/index.js
var identity$12 = /* #__PURE__ */ identity$15(categoryFn);
var bimap$1 = function(dict) {
	return dict.bimap;
};
var lmap$2 = function(dictBifunctor) {
	var bimap1 = bimap$1(dictBifunctor);
	return function(f) {
		return bimap1(f)(identity$12);
	};
};
var bifunctorEither = { bimap: function(v) {
	return function(v1) {
		return function(v2) {
			if (v2 instanceof Left) return new Left(v(v2.value0));
			if (v2 instanceof Right) return new Right(v1(v2.value0));
			throw new Error("Failed pattern match at Data.Bifunctor (line 38, column 1 - line 40, column 36): " + [
				v.constructor.name,
				v1.constructor.name,
				v2.constructor.name
			]);
		};
	};
} };
//#endregion
//#region output/Data.Maybe.First/index.js
var First = function(x) {
	return x;
};
var semigroupFirst = { append: function(v) {
	return function(v1) {
		if (v instanceof Just) return v;
		return v1;
	};
} };
var monoidFirst = /* #__PURE__ */ (function() {
	return {
		mempty: Nothing.value,
		Semigroup0: function() {
			return semigroupFirst;
		}
	};
})();
//#endregion
//#region output/Data.Monoid.Disj/index.js
var Disj = function(x) {
	return x;
};
var semigroupDisj = function(dictHeytingAlgebra) {
	var disj$5 = disj(dictHeytingAlgebra);
	return { append: function(v) {
		return function(v1) {
			return disj$5(v)(v1);
		};
	} };
};
var monoidDisj = function(dictHeytingAlgebra) {
	var semigroupDisj1 = semigroupDisj(dictHeytingAlgebra);
	return {
		mempty: ff(dictHeytingAlgebra),
		Semigroup0: function() {
			return semigroupDisj1;
		}
	};
};
//#endregion
//#region output/Data.Monoid.Dual/index.js
var Dual = function(x) {
	return x;
};
var semigroupDual = function(dictSemigroup) {
	var append1 = append$7(dictSemigroup);
	return { append: function(v) {
		return function(v1) {
			return append1(v1)(v);
		};
	} };
};
var monoidDual$1 = function(dictMonoid) {
	var semigroupDual1 = semigroupDual(dictMonoid.Semigroup0());
	return {
		mempty: mempty$6(dictMonoid),
		Semigroup0: function() {
			return semigroupDual1;
		}
	};
};
//#endregion
//#region output/Data.Monoid.Endo/index.js
var Endo = function(x) {
	return x;
};
var semigroupEndo = function(dictSemigroupoid) {
	var compose$2 = compose(dictSemigroupoid);
	return { append: function(v) {
		return function(v1) {
			return compose$2(v)(v1);
		};
	} };
};
var monoidEndo$1 = function(dictCategory) {
	var semigroupEndo1 = semigroupEndo(dictCategory.Semigroupoid0());
	return {
		mempty: identity$15(dictCategory),
		Semigroup0: function() {
			return semigroupEndo1;
		}
	};
};
//#endregion
//#region output/Unsafe.Coerce/foreign.js
const unsafeCoerce = function(x) {
	return x;
};
//#endregion
//#region output/Safe.Coerce/index.js
var coerce$3 = function() {
	return unsafeCoerce;
};
//#endregion
//#region output/Data.Newtype/index.js
var coerce$2 = /* #__PURE__ */ coerce$3();
var wrap = function() {
	return coerce$2;
};
var wrap1 = /* #__PURE__ */ wrap();
var unwrap$7 = function() {
	return coerce$2;
};
var unwrap1 = /* #__PURE__ */ unwrap$7();
var under = function() {
	return function() {
		return function(v) {
			return coerce$2;
		};
	};
};
var un$8 = function() {
	return function(v) {
		return unwrap1;
	};
};
var over$5 = function() {
	return function() {
		return function(v) {
			return coerce$2;
		};
	};
};
var alaF$1 = function() {
	return function() {
		return function() {
			return function() {
				return function(v) {
					return coerce$2;
				};
			};
		};
	};
};
var ala$1 = function() {
	return function() {
		return function() {
			return function(v) {
				return function(f) {
					return coerce$2(f(wrap1));
				};
			};
		};
	};
};
//#endregion
//#region output/Data.Foldable/index.js
var identity$11 = /* #__PURE__ */ identity$15(categoryFn);
var unwrap$6 = /* #__PURE__ */ unwrap$7();
var monoidDual = /* #__PURE__ */ monoidDual$1(/* @__PURE__ */ monoidEndo$1(categoryFn));
var alaF = /* #__PURE__ */ alaF$1()()()();
var foldr$5 = function(dict) {
	return dict.foldr;
};
var oneOf$1 = function(dictFoldable) {
	var foldr2 = foldr$5(dictFoldable);
	return function(dictPlus) {
		return foldr2(alt$6(dictPlus.Alt0()))(empty$4(dictPlus));
	};
};
var traverse_ = function(dictApplicative) {
	var applySecond$10 = applySecond(dictApplicative.Apply0());
	var pure = pure$18(dictApplicative);
	return function(dictFoldable) {
		var foldr2 = foldr$5(dictFoldable);
		return function(f) {
			return foldr2(function($454) {
				return applySecond$10(f($454));
			})(pure(void 0));
		};
	};
};
var foldl = function(dict) {
	return dict.foldl;
};
var intercalate = function(dictFoldable) {
	var foldl2 = foldl(dictFoldable);
	return function(dictMonoid) {
		var append = append$7(dictMonoid.Semigroup0());
		var mempty = mempty$6(dictMonoid);
		return function(sep) {
			return function(xs) {
				var go = function(v) {
					return function(v1) {
						if (v.init) return {
							init: false,
							acc: v1
						};
						return {
							init: false,
							acc: append(v.acc)(append(sep)(v1))
						};
					};
				};
				return foldl2(go)({
					init: true,
					acc: mempty
				})(xs).acc;
			};
		};
	};
};
var foldMapDefaultR = function(dictFoldable) {
	var foldr2 = foldr$5(dictFoldable);
	return function(dictMonoid) {
		var append = append$7(dictMonoid.Semigroup0());
		var mempty = mempty$6(dictMonoid);
		return function(f) {
			return foldr2(function(x) {
				return function(acc) {
					return append(f(x))(acc);
				};
			})(mempty);
		};
	};
};
var foldableArray = {
	foldr: foldrArray,
	foldl: foldlArray,
	foldMap: function(dictMonoid) {
		return foldMapDefaultR(foldableArray)(dictMonoid);
	}
};
var foldMap = function(dict) {
	return dict.foldMap;
};
var foldlDefault = function(dictFoldable) {
	var foldMap2 = foldMap(dictFoldable)(monoidDual);
	return function(c) {
		return function(u) {
			return function(xs) {
				return unwrap$6(unwrap$6(foldMap2((function() {
					var $457 = flip(c);
					return function($458) {
						return Dual(Endo($457($458)));
					};
				})())(xs)))(u);
			};
		};
	};
};
var foldM = function(dictFoldable) {
	var foldl2 = foldl(dictFoldable);
	return function(dictMonad) {
		var bind = bind$15(dictMonad.Bind1());
		var pure = pure$18(dictMonad.Applicative0());
		return function(f) {
			return function(b0) {
				return foldl2(function(b) {
					return function(a) {
						return bind(b)(flip(f)(a));
					};
				})(pure(b0));
			};
		};
	};
};
var fold$6 = function(dictFoldable) {
	var foldMap2 = foldMap(dictFoldable);
	return function(dictMonoid) {
		return foldMap2(dictMonoid)(identity$11);
	};
};
var any$1 = function(dictFoldable) {
	var foldMap2 = foldMap(dictFoldable);
	return function(dictHeytingAlgebra) {
		return alaF(Disj)(foldMap2(monoidDisj(dictHeytingAlgebra)));
	};
};
var elem$1 = function(dictFoldable) {
	var any1 = any$1(dictFoldable)(heytingAlgebraBoolean);
	return function(dictEq) {
		var $462 = eq$1(dictEq);
		return function($463) {
			return any1($462($463));
		};
	};
};
//#endregion
//#region output/Data.Function.Uncurried/foreign.js
const runFn2 = function(fn) {
	return function(a) {
		return function(b) {
			return fn(a, b);
		};
	};
};
const runFn3 = function(fn) {
	return function(a) {
		return function(b) {
			return function(c) {
				return fn(a, b, c);
			};
		};
	};
};
const runFn4 = function(fn) {
	return function(a) {
		return function(b) {
			return function(c) {
				return function(d) {
					return fn(a, b, c, d);
				};
			};
		};
	};
};
//#endregion
//#region output/Data.FunctorWithIndex/foreign.js
const mapWithIndexArray = function(f) {
	return function(xs) {
		var l = xs.length;
		var result = Array(l);
		for (var i = 0; i < l; i++) result[i] = f(i)(xs[i]);
		return result;
	};
};
//#endregion
//#region output/Data.FunctorWithIndex/index.js
var mapWithIndex$2 = function(dict) {
	return dict.mapWithIndex;
};
var functorWithIndexArray = {
	mapWithIndex: mapWithIndexArray,
	Functor0: function() {
		return functorArray;
	}
};
//#endregion
//#region output/Data.Traversable/foreign.js
const traverseArrayImpl = (function() {
	function array1(a) {
		return [a];
	}
	function array2(a) {
		return function(b) {
			return [a, b];
		};
	}
	function array3(a) {
		return function(b) {
			return function(c) {
				return [
					a,
					b,
					c
				];
			};
		};
	}
	function concat2(xs) {
		return function(ys) {
			return xs.concat(ys);
		};
	}
	return function(apply) {
		return function(map) {
			return function(pure) {
				return function(f) {
					return function(array) {
						function go(bot, top) {
							switch (top - bot) {
								case 0: return pure([]);
								case 1: return map(array1)(f(array[bot]));
								case 2: return apply(map(array2)(f(array[bot])))(f(array[bot + 1]));
								case 3: return apply(apply(map(array3)(f(array[bot])))(f(array[bot + 1])))(f(array[bot + 2]));
								default:
									var pivot = bot + Math.floor((top - bot) / 4) * 2;
									return apply(map(concat2)(go(bot, pivot)))(go(pivot, top));
							}
						}
						return go(0, array.length);
					};
				};
			};
		};
	};
})();
//#endregion
//#region output/Data.Traversable/index.js
var identity$10 = /* #__PURE__ */ identity$15(categoryFn);
var traverse = function(dict) {
	return dict.traverse;
};
var sequenceDefault = function(dictTraversable) {
	var traverse2 = traverse(dictTraversable);
	return function(dictApplicative) {
		return traverse2(dictApplicative)(identity$10);
	};
};
var traversableArray = {
	traverse: function(dictApplicative) {
		var Apply0 = dictApplicative.Apply0();
		return traverseArrayImpl(apply$8(Apply0))(map$20(Apply0.Functor0()))(pure$18(dictApplicative));
	},
	sequence: function(dictApplicative) {
		return sequenceDefault(traversableArray)(dictApplicative);
	},
	Functor0: function() {
		return functorArray;
	},
	Foldable1: function() {
		return foldableArray;
	}
};
var sequence$1 = function(dict) {
	return dict.sequence;
};
//#endregion
//#region output/Data.Unfoldable/foreign.js
const unfoldrArrayImpl = function(isNothing) {
	return function(fromJust) {
		return function(fst) {
			return function(snd) {
				return function(f) {
					return function(b) {
						var result = [];
						var value = b;
						while (true) {
							var maybe = f(value);
							if (isNothing(maybe)) return result;
							var tuple = fromJust(maybe);
							result.push(fst(tuple));
							value = snd(tuple);
						}
					};
				};
			};
		};
	};
};
//#endregion
//#region output/Data.Unfoldable1/foreign.js
const unfoldr1ArrayImpl = function(isNothing) {
	return function(fromJust) {
		return function(fst) {
			return function(snd) {
				return function(f) {
					return function(b) {
						var result = [];
						var value = b;
						while (true) {
							var tuple = f(value);
							result.push(fst(tuple));
							var maybe = snd(tuple);
							if (isNothing(maybe)) return result;
							value = fromJust(maybe);
						}
					};
				};
			};
		};
	};
};
//#endregion
//#region output/Data.Ord.Min/index.js
var Min = function(x) {
	return x;
};
var semigroupMin = function(dictOrd) {
	var min = min$2(dictOrd);
	return { append: function(v) {
		return function(v1) {
			return min(v)(v1);
		};
	} };
};
//#endregion
//#region output/Data.Semigroup.Foldable/index.js
var ala = /* #__PURE__ */ ala$1()()();
var foldl1 = function(dict) {
	return dict.foldl1;
};
var foldMap1DefaultL = function(dictFoldable1) {
	var foldl11 = foldl1(dictFoldable1);
	return function(dictFunctor) {
		var map = map$20(dictFunctor);
		return function(dictSemigroup) {
			var append = append$7(dictSemigroup);
			return function(f) {
				var $162 = foldl11(append);
				var $163 = map(f);
				return function($164) {
					return $162($163($164));
				};
			};
		};
	};
};
var foldMap1 = function(dict) {
	return dict.foldMap1;
};
var minimum$1 = function(dictOrd) {
	var semigroupMin$1 = semigroupMin(dictOrd);
	return function(dictFoldable1) {
		return ala(Min)(foldMap1(dictFoldable1)(semigroupMin$1));
	};
};
//#endregion
//#region output/Data.Unfoldable1/index.js
var fromJust$2 = /* #__PURE__ */ fromJust$3();
var unfoldable1Array = { unfoldr1: /* #__PURE__ */ unfoldr1ArrayImpl(isNothing)(fromJust$2)(fst)(snd) };
//#endregion
//#region output/Data.Unfoldable/index.js
var fromJust$1 = /* #__PURE__ */ fromJust$3();
var unfoldr$1 = function(dict) {
	return dict.unfoldr;
};
var unfoldableArray = {
	unfoldr: /* #__PURE__ */ unfoldrArrayImpl(isNothing)(fromJust$1)(fst)(snd),
	Unfoldable10: function() {
		return unfoldable1Array;
	}
};
//#endregion
//#region output/Data.Array/index.js
var $$void$1 = /* #__PURE__ */ $$void$3(functorST);
var apply$7 = /* #__PURE__ */ apply$8(applyMaybe);
var map$16 = /* #__PURE__ */ map$20(functorMaybe);
var fold1$1 = /* #__PURE__ */ fold$6(foldableArray);
var append$6 = /* #__PURE__ */ append$7(semigroupArray);
var unsafeIndex$1 = function() {
	return runFn2(unsafeIndexImpl);
};
var uncons$4 = /* #__PURE__ */ (function() {
	return runFn3(unconsImpl)($$const(Nothing.value))(function(x) {
		return function(xs) {
			return new Just({
				head: x,
				tail: xs
			});
		};
	});
})();
var sortBy = function(comp) {
	return runFn3(sortByImpl)(comp)(function(v) {
		if (v instanceof GT) return 1;
		if (v instanceof EQ) return 0;
		if (v instanceof LT) return -1;
		throw new Error("Failed pattern match at Data.Array (line 897, column 38 - line 900, column 11): " + [v.constructor.name]);
	});
};
var sort$1 = function(dictOrd) {
	var compare = compare$2(dictOrd);
	return function(xs) {
		return sortBy(compare)(xs);
	};
};
var slice = /* #__PURE__ */ runFn3(sliceImpl);
var singleton$5 = function(a) {
	return [a];
};
var replicate = /* #__PURE__ */ runFn2(replicateImpl);
var $$null$2 = function(xs) {
	return length$2(xs) === 0;
};
var mapWithIndex$1 = /* #__PURE__ */ mapWithIndex$2(functorWithIndexArray);
var init = function(xs) {
	if ($$null$2(xs)) return Nothing.value;
	return new Just(slice(0)(length$2(xs) - 1 | 0)(xs));
};
var index = /* #__PURE__ */ (function() {
	return runFn4(indexImpl)(Just.create)(Nothing.value);
})();
var last = function(xs) {
	return index(xs)(length$2(xs) - 1 | 0);
};
var unsnoc = function(xs) {
	return apply$7(map$16(function(v) {
		return function(v1) {
			return {
				init: v,
				last: v1
			};
		};
	})(init(xs)))(last(xs));
};
var head = function(xs) {
	return index(xs)(0);
};
var groupBy = function(op) {
	return function(xs) {
		return (function __do() {
			var result = newSTArray();
			var iter = iterator(function(v) {
				return index(xs)(v);
			})();
			iterate(iter)(function(x) {
				return $$void$1(function __do() {
					var sub1 = newSTArray();
					push(x)(sub1)();
					pushWhile(op(x))(iter)(sub1)();
					return push(unsafeFreeze(sub1)())(result)();
				});
			})();
			return unsafeFreeze(result)();
		})();
	};
};
var fromFoldable$5 = function(dictFoldable) {
	return runFn2(fromFoldableImpl)(foldr$5(dictFoldable));
};
var foldr$4 = /* #__PURE__ */ foldr$5(foldableArray);
var fold$5 = function(dictMonoid) {
	return fold1$1(dictMonoid);
};
var filter = /* #__PURE__ */ runFn2(filterImpl);
var drop$1 = function(n) {
	return function(xs) {
		if (n < 1) return xs;
		return slice(n)(length$2(xs))(xs);
	};
};
var cons = function(x) {
	return function(xs) {
		return append$6([x])(xs);
	};
};
var concatMap = /* #__PURE__ */ flip(/* #__PURE__ */ bind$15(bindArray));
var mapMaybe = function(f) {
	return concatMap((function() {
		var $189 = maybe([])(singleton$5);
		return function($190) {
			return $189(f($190));
		};
	})());
};
var catMaybes = /* #__PURE__ */ mapMaybe(/* #__PURE__ */ identity$15(categoryFn));
//#endregion
//#region output/Data.FoldableWithIndex/index.js
var foldr8 = /* #__PURE__ */ foldr$5(foldableArray);
var mapWithIndex = /* #__PURE__ */ mapWithIndex$2(functorWithIndexArray);
var foldl8 = /* #__PURE__ */ foldl(foldableArray);
var foldrWithIndex = function(dict) {
	return dict.foldrWithIndex;
};
var foldMapWithIndexDefaultR = function(dictFoldableWithIndex) {
	var foldrWithIndex1 = foldrWithIndex(dictFoldableWithIndex);
	return function(dictMonoid) {
		var append = append$7(dictMonoid.Semigroup0());
		var mempty = mempty$6(dictMonoid);
		return function(f) {
			return foldrWithIndex1(function(i) {
				return function(x) {
					return function(acc) {
						return append(f(i)(x))(acc);
					};
				};
			})(mempty);
		};
	};
};
var foldableWithIndexArray = {
	foldrWithIndex: function(f) {
		return function(z) {
			var $291 = foldr8(function(v) {
				return function(y) {
					return f(v.value0)(v.value1)(y);
				};
			})(z);
			var $292 = mapWithIndex(Tuple.create);
			return function($293) {
				return $291($292($293));
			};
		};
	},
	foldlWithIndex: function(f) {
		return function(z) {
			var $294 = foldl8(function(y) {
				return function(v) {
					return f(v.value0)(y)(v.value1);
				};
			})(z);
			var $295 = mapWithIndex(Tuple.create);
			return function($296) {
				return $294($295($296));
			};
		};
	},
	foldMapWithIndex: function(dictMonoid) {
		return foldMapWithIndexDefaultR(foldableWithIndexArray)(dictMonoid);
	},
	Foldable0: function() {
		return foldableArray;
	}
};
//#endregion
//#region output/Data.TraversableWithIndex/index.js
var traverseWithIndexDefault = function(dictTraversableWithIndex) {
	var sequence = sequence$1(dictTraversableWithIndex.Traversable2());
	var mapWithIndex = mapWithIndex$2(dictTraversableWithIndex.FunctorWithIndex0());
	return function(dictApplicative) {
		var sequence1 = sequence(dictApplicative);
		return function(f) {
			var $174 = mapWithIndex(f);
			return function($175) {
				return sequence1($174($175));
			};
		};
	};
};
var traverseWithIndex$1 = function(dict) {
	return dict.traverseWithIndex;
};
var traversableWithIndexArray = {
	traverseWithIndex: function(dictApplicative) {
		return traverseWithIndexDefault(traversableWithIndexArray)(dictApplicative);
	},
	FunctorWithIndex0: function() {
		return functorWithIndexArray;
	},
	FoldableWithIndex1: function() {
		return foldableWithIndexArray;
	},
	Traversable2: function() {
		return traversableArray;
	}
};
//#endregion
//#region output/Foreign.Object.ST/foreign.js
function poke(k) {
	return function(v) {
		return function(m) {
			return function() {
				m[k] = v;
				return m;
			};
		};
	};
}
//#endregion
//#region output/Foreign.Object/index.js
var thawST = _copyST;
var mutate = function(f) {
	return function(m) {
		return runST(function __do() {
			var s = thawST(m)();
			f(s)();
			return s;
		});
	};
};
var lookup = /* #__PURE__ */ (function() {
	return runFn4(_lookup)(Nothing.value)(Just.create);
})();
var insert$2 = function(k) {
	return function(v) {
		return mutate(poke(k)(v));
	};
};
//#endregion
//#region output/Data.Argonaut.Core/index.js
var verbJsonType = function(def) {
	return function(f) {
		return function(g) {
			return g(def)(f);
		};
	};
};
var toJsonType = /* #__PURE__ */ (function() {
	return verbJsonType(Nothing.value)(Just.create);
})();
var isJsonType = /* #__PURE__ */ verbJsonType(false)(/* #__PURE__ */ $$const(true));
var caseJsonString = function(d) {
	return function(f) {
		return function(j) {
			return _caseJson($$const(d), $$const(d), $$const(d), f, $$const(d), $$const(d), j);
		};
	};
};
var caseJsonObject = function(d) {
	return function(f) {
		return function(j) {
			return _caseJson($$const(d), $$const(d), $$const(d), $$const(d), $$const(d), f, j);
		};
	};
};
var toObject = /* #__PURE__ */ toJsonType(caseJsonObject);
var caseJsonNull = function(d) {
	return function(f) {
		return function(j) {
			return _caseJson(f, $$const(d), $$const(d), $$const(d), $$const(d), $$const(d), j);
		};
	};
};
var isNull = /* #__PURE__ */ isJsonType(caseJsonNull);
var caseJsonArray = function(d) {
	return function(f) {
		return function(j) {
			return _caseJson($$const(d), $$const(d), $$const(d), $$const(d), f, $$const(d), j);
		};
	};
};
var toArray$1 = /* #__PURE__ */ toJsonType(caseJsonArray);
//#endregion
//#region output/Data.Argonaut.Decode.Error/index.js
var show$1 = /* #__PURE__ */ show$2(showString);
var show1$2 = /* #__PURE__ */ show$2(showInt);
var TypeMismatch$1 = /* #__PURE__ */ (function() {
	function TypeMismatch(value0) {
		this.value0 = value0;
	}
	TypeMismatch.create = function(value0) {
		return new TypeMismatch(value0);
	};
	return TypeMismatch;
})();
var UnexpectedValue = /* #__PURE__ */ (function() {
	function UnexpectedValue(value0) {
		this.value0 = value0;
	}
	UnexpectedValue.create = function(value0) {
		return new UnexpectedValue(value0);
	};
	return UnexpectedValue;
})();
var AtIndex = /* #__PURE__ */ (function() {
	function AtIndex(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	AtIndex.create = function(value0) {
		return function(value1) {
			return new AtIndex(value0, value1);
		};
	};
	return AtIndex;
})();
var AtKey = /* #__PURE__ */ (function() {
	function AtKey(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	AtKey.create = function(value0) {
		return function(value1) {
			return new AtKey(value0, value1);
		};
	};
	return AtKey;
})();
var Named = /* #__PURE__ */ (function() {
	function Named(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Named.create = function(value0) {
		return function(value1) {
			return new Named(value0, value1);
		};
	};
	return Named;
})();
var MissingValue = /* #__PURE__ */ (function() {
	function MissingValue() {}
	MissingValue.value = new MissingValue();
	return MissingValue;
})();
var showJsonDecodeError$1 = { show: function(v) {
	if (v instanceof TypeMismatch$1) return "(TypeMismatch " + (show$1(v.value0) + ")");
	if (v instanceof UnexpectedValue) return "(UnexpectedValue " + (stringify(v.value0) + ")");
	if (v instanceof AtIndex) return "(AtIndex " + (show1$2(v.value0) + (" " + (show$2(showJsonDecodeError$1)(v.value1) + ")")));
	if (v instanceof AtKey) return "(AtKey " + (show$1(v.value0) + (" " + (show$2(showJsonDecodeError$1)(v.value1) + ")")));
	if (v instanceof Named) return "(Named " + (show$1(v.value0) + (" " + (show$2(showJsonDecodeError$1)(v.value1) + ")")));
	if (v instanceof MissingValue) return "MissingValue";
	throw new Error("Failed pattern match at Data.Argonaut.Decode.Error (line 24, column 10 - line 30, column 35): " + [v.constructor.name]);
} };
//#endregion
//#region output/Data.Array.NonEmpty.Internal/foreign.js
const foldr1Impl = function(f, xs) {
	var acc = xs[xs.length - 1];
	for (var i = xs.length - 2; i >= 0; i--) acc = f(xs[i])(acc);
	return acc;
};
const foldl1Impl = function(f, xs) {
	var acc = xs[0];
	var len = xs.length;
	for (var i = 1; i < len; i++) acc = f(acc)(xs[i]);
	return acc;
};
//#endregion
//#region output/Data.Array.NonEmpty.Internal/index.js
var NonEmptyArray = function(x) {
	return x;
};
var functorNonEmptyArray = functorArray;
var foldableNonEmptyArray = foldableArray;
var foldable1NonEmptyArray = {
	foldMap1: function(dictSemigroup) {
		return foldMap1DefaultL(foldable1NonEmptyArray)(functorNonEmptyArray)(dictSemigroup);
	},
	foldr1: /* #__PURE__ */ runFn2(foldr1Impl),
	foldl1: /* #__PURE__ */ runFn2(foldl1Impl),
	Foldable0: function() {
		return foldableNonEmptyArray;
	}
};
//#endregion
//#region output/Data.NonEmpty/index.js
var NonEmpty = /* #__PURE__ */ (function() {
	function NonEmpty(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	NonEmpty.create = function(value0) {
		return function(value1) {
			return new NonEmpty(value0, value1);
		};
	};
	return NonEmpty;
})();
var singleton$4 = function(dictPlus) {
	var empty = empty$4(dictPlus);
	return function(a) {
		return new NonEmpty(a, empty);
	};
};
var foldableNonEmpty = function(dictFoldable) {
	var foldMap$11 = foldMap(dictFoldable);
	var foldl$14 = foldl(dictFoldable);
	var foldr = foldr$5(dictFoldable);
	return {
		foldMap: function(dictMonoid) {
			var append1 = append$7(dictMonoid.Semigroup0());
			var foldMap1 = foldMap$11(dictMonoid);
			return function(f) {
				return function(v) {
					return append1(f(v.value0))(foldMap1(f)(v.value1));
				};
			};
		},
		foldl: function(f) {
			return function(b) {
				return function(v) {
					return foldl$14(f)(f(b)(v.value0))(v.value1);
				};
			};
		},
		foldr: function(f) {
			return function(b) {
				return function(v) {
					return f(v.value0)(foldr(f)(b)(v.value1));
				};
			};
		}
	};
};
var foldable1NonEmpty = function(dictFoldable) {
	var foldl$15 = foldl(dictFoldable);
	var foldr = foldr$5(dictFoldable);
	var foldableNonEmpty1 = foldableNonEmpty(dictFoldable);
	return {
		foldMap1: function(dictSemigroup) {
			var append1 = append$7(dictSemigroup);
			return function(f) {
				return function(v) {
					return foldl$15(function(s) {
						return function(a1) {
							return append1(s)(f(a1));
						};
					})(f(v.value0))(v.value1);
				};
			};
		},
		foldr1: function(f) {
			return function(v) {
				return maybe(v.value0)(f(v.value0))(foldr(function(a1) {
					var $250 = maybe(a1)(f(a1));
					return function($251) {
						return Just.create($250($251));
					};
				})(Nothing.value)(v.value1));
			};
		},
		foldl1: function(f) {
			return function(v) {
				return foldl$15(f)(v.value0)(v.value1);
			};
		},
		Foldable0: function() {
			return foldableNonEmpty1;
		}
	};
};
//#endregion
//#region output/Data.Array.NonEmpty/index.js
var fromJust = /* #__PURE__ */ fromJust$3();
var unsafeFromArray = NonEmptyArray;
var toArray = function(v) {
	return v;
};
var fromArray = function(xs) {
	if (length$2(xs) > 0) return new Just(unsafeFromArray(xs));
	return Nothing.value;
};
var adaptMaybe = function(f) {
	return function($126) {
		return fromJust(f(toArray($126)));
	};
};
var uncons$3 = /* #__PURE__ */ adaptMaybe(uncons$4);
//#endregion
//#region output/Data.Int/foreign.js
const fromNumberImpl = function(just) {
	return function(nothing) {
		return function(n) {
			return (n | 0) === n ? just(n) : nothing;
		};
	};
};
const toNumber = function(n) {
	return n;
};
const fromStringAsImpl = function(just) {
	return function(nothing) {
		return function(radix) {
			var digits;
			if (radix < 11) digits = "[0-" + (radix - 1).toString() + "]";
			else if (radix === 11) digits = "[0-9a]";
			else digits = "[0-9a-" + String.fromCharCode(86 + radix) + "]";
			var pattern = new RegExp("^[\\+\\-]?" + digits + "+$", "i");
			return function(s) {
				if (pattern.test(s)) {
					var i = parseInt(s, radix);
					return (i | 0) === i ? just(i) : nothing;
				} else return nothing;
			};
		};
	};
};
//#endregion
//#region output/Data.Number/foreign.js
const isFiniteImpl = isFinite;
const round$1 = Math.round;
//#endregion
//#region output/Data.Int/index.js
var top = /* #__PURE__ */ top$1(boundedInt);
var bottom = /* #__PURE__ */ bottom$1(boundedInt);
var fromString$1 = /* #__PURE__ */ (/* @__PURE__ */ (function() {
	return fromStringAsImpl(Just.create)(Nothing.value);
})())(10);
var fromNumber = /* #__PURE__ */ (function() {
	return fromNumberImpl(Just.create)(Nothing.value);
})();
var unsafeClamp = function(x) {
	if (!isFiniteImpl(x)) return 0;
	if (x >= toNumber(top)) return top;
	if (x <= toNumber(bottom)) return bottom;
	return fromMaybe(0)(fromNumber(x));
};
var round = function($37) {
	return unsafeClamp(round$1($37));
};
//#endregion
//#region output/Data.List.Types/index.js
var Nil$1 = /* #__PURE__ */ (function() {
	function Nil() {}
	Nil.value = new Nil();
	return Nil;
})();
var Cons$1 = /* #__PURE__ */ (function() {
	function Cons(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Cons.create = function(value0) {
		return function(value1) {
			return new Cons(value0, value1);
		};
	};
	return Cons;
})();
var NonEmptyList = function(x) {
	return x;
};
var toList = function(v) {
	return new Cons$1(v.value0, v.value1);
};
var listMap = function(f) {
	var chunkedRevMap = function($copy_v) {
		return function($copy_v1) {
			var $tco_var_v = $copy_v;
			var $tco_done = false;
			var $tco_result;
			function $tco_loop(v, v1) {
				if (v1 instanceof Cons$1 && v1.value1 instanceof Cons$1 && v1.value1.value1 instanceof Cons$1) {
					$tco_var_v = new Cons$1(v1, v);
					$copy_v1 = v1.value1.value1.value1;
					return;
				}
				var unrolledMap = function(v2) {
					if (v2 instanceof Cons$1 && v2.value1 instanceof Cons$1 && v2.value1.value1 instanceof Nil$1) return new Cons$1(f(v2.value0), new Cons$1(f(v2.value1.value0), Nil$1.value));
					if (v2 instanceof Cons$1 && v2.value1 instanceof Nil$1) return new Cons$1(f(v2.value0), Nil$1.value);
					return Nil$1.value;
				};
				var reverseUnrolledMap = function($copy_v2) {
					return function($copy_v3) {
						var $tco_var_v2 = $copy_v2;
						var $tco_done1 = false;
						var $tco_result;
						function $tco_loop(v2, v3) {
							if (v2 instanceof Cons$1 && v2.value0 instanceof Cons$1 && v2.value0.value1 instanceof Cons$1 && v2.value0.value1.value1 instanceof Cons$1) {
								$tco_var_v2 = v2.value1;
								$copy_v3 = new Cons$1(f(v2.value0.value0), new Cons$1(f(v2.value0.value1.value0), new Cons$1(f(v2.value0.value1.value1.value0), v3)));
								return;
							}
							$tco_done1 = true;
							return v3;
						}
						while (!$tco_done1) $tco_result = $tco_loop($tco_var_v2, $copy_v3);
						return $tco_result;
					};
				};
				$tco_done = true;
				return reverseUnrolledMap(v)(unrolledMap(v1));
			}
			while (!$tco_done) $tco_result = $tco_loop($tco_var_v, $copy_v1);
			return $tco_result;
		};
	};
	return chunkedRevMap(Nil$1.value);
};
var functorList = { map: listMap };
var foldableList = {
	foldr: function(f) {
		return function(b) {
			var rev = (function() {
				var go = function($copy_v) {
					return function($copy_v1) {
						var $tco_var_v = $copy_v;
						var $tco_done = false;
						var $tco_result;
						function $tco_loop(v, v1) {
							if (v1 instanceof Nil$1) {
								$tco_done = true;
								return v;
							}
							if (v1 instanceof Cons$1) {
								$tco_var_v = new Cons$1(v1.value0, v);
								$copy_v1 = v1.value1;
								return;
							}
							throw new Error("Failed pattern match at Data.List.Types (line 107, column 7 - line 107, column 23): " + [v.constructor.name, v1.constructor.name]);
						}
						while (!$tco_done) $tco_result = $tco_loop($tco_var_v, $copy_v1);
						return $tco_result;
					};
				};
				return go(Nil$1.value);
			})();
			var $284 = foldl(foldableList)(flip(f))(b);
			return function($285) {
				return $284(rev($285));
			};
		};
	},
	foldl: function(f) {
		var go = function($copy_b) {
			return function($copy_v) {
				var $tco_var_b = $copy_b;
				var $tco_done1 = false;
				var $tco_result;
				function $tco_loop(b, v) {
					if (v instanceof Nil$1) {
						$tco_done1 = true;
						return b;
					}
					if (v instanceof Cons$1) {
						$tco_var_b = f(b)(v.value0);
						$copy_v = v.value1;
						return;
					}
					throw new Error("Failed pattern match at Data.List.Types (line 111, column 12 - line 113, column 30): " + [v.constructor.name]);
				}
				while (!$tco_done1) $tco_result = $tco_loop($tco_var_b, $copy_v);
				return $tco_result;
			};
		};
		return go;
	},
	foldMap: function(dictMonoid) {
		var append2 = append$7(dictMonoid.Semigroup0());
		var mempty = mempty$6(dictMonoid);
		return function(f) {
			return foldl(foldableList)(function(acc) {
				var $286 = append2(acc);
				return function($287) {
					return $286(f($287));
				};
			})(mempty);
		};
	}
};
var foldr$3 = /* #__PURE__ */ foldr$5(foldableList);
var append1$6 = /* #__PURE__ */ append$7({ append: function(xs) {
	return function(ys) {
		return foldr$3(Cons$1.create)(ys)(xs);
	};
} });
var semigroupNonEmptyList = { append: function(v) {
	return function(as$prime) {
		return new NonEmpty(v.value0, append1$6(v.value1)(toList(as$prime)));
	};
} };
var altList = {
	alt: append1$6,
	Functor0: function() {
		return functorList;
	}
};
var plusList = /* #__PURE__ */ (function() {
	return {
		empty: Nil$1.value,
		Alt0: function() {
			return altList;
		}
	};
})();
//#endregion
//#region output/Data.List/index.js
var span = function(v) {
	return function(v1) {
		if (v1 instanceof Cons$1 && v(v1.value0)) {
			var v2 = span(v)(v1.value1);
			return {
				init: new Cons$1(v1.value0, v2.init),
				rest: v2.rest
			};
		}
		return {
			init: Nil$1.value,
			rest: v1
		};
	};
};
var reverse = /* #__PURE__ */ (function() {
	var go = function($copy_v) {
		return function($copy_v1) {
			var $tco_var_v = $copy_v;
			var $tco_done = false;
			var $tco_result;
			function $tco_loop(v, v1) {
				if (v1 instanceof Nil$1) {
					$tco_done = true;
					return v;
				}
				if (v1 instanceof Cons$1) {
					$tco_var_v = new Cons$1(v1.value0, v);
					$copy_v1 = v1.value1;
					return;
				}
				throw new Error("Failed pattern match at Data.List (line 368, column 3 - line 368, column 19): " + [v.constructor.name, v1.constructor.name]);
			}
			while (!$tco_done) $tco_result = $tco_loop($tco_var_v, $copy_v1);
			return $tco_result;
		};
	};
	return go(Nil$1.value);
})();
var $$null$1 = function(v) {
	if (v instanceof Nil$1) return true;
	return false;
};
var fromFoldable$4 = function(dictFoldable) {
	return foldr$5(dictFoldable)(Cons$1.create)(Nil$1.value);
};
//#endregion
//#region output/Partial.Unsafe/foreign.js
const _unsafePartial = function(f) {
	return f();
};
//#endregion
//#region output/Partial/foreign.js
const _crashWith = function(msg) {
	throw new Error(msg);
};
//#endregion
//#region output/Partial/index.js
var crashWith$1 = function() {
	return _crashWith;
};
//#endregion
//#region output/Partial.Unsafe/index.js
var crashWith = /* #__PURE__ */ crashWith$1();
var unsafePartial = _unsafePartial;
var unsafeCrashWith = function(msg) {
	return unsafePartial(function() {
		return crashWith(msg);
	});
};
//#endregion
//#region output/Data.List.NonEmpty/index.js
var singleton$3 = /* #__PURE__ */ (function() {
	var $200 = singleton$4(plusList);
	return function($201) {
		return NonEmptyList($200($201));
	};
})();
//#endregion
//#region output/Data.Map.Internal/index.js
var Leaf$1 = /* #__PURE__ */ (function() {
	function Leaf() {}
	Leaf.value = new Leaf();
	return Leaf;
})();
var Node = /* #__PURE__ */ (function() {
	function Node(value0, value1, value2, value3, value4, value5) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
		this.value3 = value3;
		this.value4 = value4;
		this.value5 = value5;
	}
	Node.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return function(value3) {
					return function(value4) {
						return function(value5) {
							return new Node(value0, value1, value2, value3, value4, value5);
						};
					};
				};
			};
		};
	};
	return Node;
})();
var unsafeNode = function(k, v, l, r) {
	if (l instanceof Leaf$1) {
		if (r instanceof Leaf$1) return new Node(1, 1, k, v, l, r);
		if (r instanceof Node) return new Node(1 + r.value0 | 0, 1 + r.value1 | 0, k, v, l, r);
		throw new Error("Failed pattern match at Data.Map.Internal (line 702, column 5 - line 706, column 39): " + [r.constructor.name]);
	}
	if (l instanceof Node) {
		if (r instanceof Leaf$1) return new Node(1 + l.value0 | 0, 1 + l.value1 | 0, k, v, l, r);
		if (r instanceof Node) return new Node(1 + (function() {
			if (l.value0 > r.value0) return l.value0;
			return r.value0;
		})() | 0, (1 + l.value1 | 0) + r.value1 | 0, k, v, l, r);
		throw new Error("Failed pattern match at Data.Map.Internal (line 708, column 5 - line 712, column 68): " + [r.constructor.name]);
	}
	throw new Error("Failed pattern match at Data.Map.Internal (line 700, column 32 - line 712, column 68): " + [l.constructor.name]);
};
var singleton$2 = function(k) {
	return function(v) {
		return new Node(1, 1, k, v, Leaf$1.value, Leaf$1.value);
	};
};
var unsafeBalancedNode = /* #__PURE__ */ (function() {
	var height = function(v) {
		if (v instanceof Leaf$1) return 0;
		if (v instanceof Node) return v.value0;
		throw new Error("Failed pattern match at Data.Map.Internal (line 757, column 12 - line 759, column 26): " + [v.constructor.name]);
	};
	var rotateLeft = function(k, v, l, rk, rv, rl, rr) {
		if (rl instanceof Node && rl.value0 > height(rr)) return unsafeNode(rl.value2, rl.value3, unsafeNode(k, v, l, rl.value4), unsafeNode(rk, rv, rl.value5, rr));
		return unsafeNode(rk, rv, unsafeNode(k, v, l, rl), rr);
	};
	var rotateRight = function(k, v, lk, lv, ll, lr, r) {
		if (lr instanceof Node && height(ll) <= lr.value0) return unsafeNode(lr.value2, lr.value3, unsafeNode(lk, lv, ll, lr.value4), unsafeNode(k, v, lr.value5, r));
		return unsafeNode(lk, lv, ll, unsafeNode(k, v, lr, r));
	};
	return function(k, v, l, r) {
		if (l instanceof Leaf$1) {
			if (r instanceof Leaf$1) return singleton$2(k)(v);
			if (r instanceof Node && r.value0 > 1) return rotateLeft(k, v, l, r.value2, r.value3, r.value4, r.value5);
			return unsafeNode(k, v, l, r);
		}
		if (l instanceof Node) {
			if (r instanceof Node) {
				if (r.value0 > (l.value0 + 1 | 0)) return rotateLeft(k, v, l, r.value2, r.value3, r.value4, r.value5);
				if (l.value0 > (r.value0 + 1 | 0)) return rotateRight(k, v, l.value2, l.value3, l.value4, l.value5, r);
			}
			if (r instanceof Leaf$1 && l.value0 > 1) return rotateRight(k, v, l.value2, l.value3, l.value4, l.value5, r);
			return unsafeNode(k, v, l, r);
		}
		throw new Error("Failed pattern match at Data.Map.Internal (line 717, column 40 - line 738, column 34): " + [l.constructor.name]);
	};
})();
var insert$1 = function(dictOrd) {
	var compare = compare$2(dictOrd);
	return function(k) {
		return function(v) {
			var go = function(v1) {
				if (v1 instanceof Leaf$1) return singleton$2(k)(v);
				if (v1 instanceof Node) {
					var v2 = compare(k)(v1.value2);
					if (v2 instanceof LT) return unsafeBalancedNode(v1.value2, v1.value3, go(v1.value4), v1.value5);
					if (v2 instanceof GT) return unsafeBalancedNode(v1.value2, v1.value3, v1.value4, go(v1.value5));
					if (v2 instanceof EQ) return new Node(v1.value0, v1.value1, k, v, v1.value4, v1.value5);
					throw new Error("Failed pattern match at Data.Map.Internal (line 471, column 7 - line 474, column 35): " + [v2.constructor.name]);
				}
				throw new Error("Failed pattern match at Data.Map.Internal (line 468, column 8 - line 474, column 35): " + [v1.constructor.name]);
			};
			return go;
		};
	};
};
var empty$3 = /* #__PURE__ */ (function() {
	return Leaf$1.value;
})();
var fromFoldable$3 = function(dictOrd) {
	var insert1 = insert$1(dictOrd);
	return function(dictFoldable) {
		return foldl(dictFoldable)(function(m) {
			return function(v) {
				return insert1(v.value0)(v.value1)(m);
			};
		})(empty$3);
	};
};
//#endregion
//#region output/Data.String.CodePoints/foreign.js
var hasArrayFrom = typeof Array.from === "function";
typeof Symbol !== "undefined" && Symbol != null && typeof Symbol.iterator !== "undefined" && String.prototype[Symbol.iterator];
String.prototype.fromCodePoint;
var hasCodePointAt = typeof String.prototype.codePointAt === "function";
const _unsafeCodePointAt0 = function(fallback) {
	return hasCodePointAt ? function(str) {
		return str.codePointAt(0);
	} : fallback;
};
const _toCodePointArray = function(fallback) {
	return function(unsafeCodePointAt0) {
		if (hasArrayFrom) return function(str) {
			return Array.from(str, unsafeCodePointAt0);
		};
		return fallback;
	};
};
//#endregion
//#region output/Data.Enum/foreign.js
function toCharCode(c) {
	return c.charCodeAt(0);
}
function fromCharCode$1(c) {
	return String.fromCharCode(c);
}
//#endregion
//#region output/Control.Alternative/index.js
var guard$2 = function(dictAlternative) {
	var pure = pure$18(dictAlternative.Applicative0());
	var empty = empty$4(dictAlternative.Plus1());
	return function(v) {
		if (v) return pure(void 0);
		if (!v) return empty;
		throw new Error("Failed pattern match at Control.Alternative (line 48, column 1 - line 48, column 54): " + [v.constructor.name]);
	};
};
//#endregion
//#region output/Data.Enum/index.js
var bottom1 = /* #__PURE__ */ bottom$1(boundedChar);
var top1 = /* #__PURE__ */ top$1(boundedChar);
var fromEnum$1 = function(dict) {
	return dict.fromEnum;
};
var defaultSucc = function(toEnum$prime) {
	return function(fromEnum$prime) {
		return function(a) {
			return toEnum$prime(fromEnum$prime(a) + 1 | 0);
		};
	};
};
var defaultPred = function(toEnum$prime) {
	return function(fromEnum$prime) {
		return function(a) {
			return toEnum$prime(fromEnum$prime(a) - 1 | 0);
		};
	};
};
var charToEnum = function(v) {
	if (v >= toCharCode(bottom1) && v <= toCharCode(top1)) return new Just(fromCharCode$1(v));
	return Nothing.value;
};
var enumChar = {
	succ: /* #__PURE__ */ defaultSucc(charToEnum)(toCharCode),
	pred: /* #__PURE__ */ defaultPred(charToEnum)(toCharCode),
	Ord0: function() {
		return ordChar;
	}
};
var boundedEnumChar = /* #__PURE__ */ (function() {
	return {
		cardinality: toCharCode(top1) - toCharCode(bottom1) | 0,
		toEnum: charToEnum,
		fromEnum: toCharCode,
		Bounded0: function() {
			return boundedChar;
		},
		Enum1: function() {
			return enumChar;
		}
	};
})();
//#endregion
//#region output/Data.String.CodeUnits/foreign.js
const fromCharArray = function(a) {
	return a.join("");
};
const toCharArray = function(s) {
	return s.split("");
};
const length$1 = function(s) {
	return s.length;
};
const _indexOf = function(just) {
	return function(nothing) {
		return function(x) {
			return function(s) {
				var i = s.indexOf(x);
				return i === -1 ? nothing : just(i);
			};
		};
	};
};
const take = function(n) {
	return function(s) {
		return s.substr(0, n);
	};
};
const drop = function(n) {
	return function(s) {
		return s.substring(n);
	};
};
//#endregion
//#region output/Data.String.Unsafe/foreign.js
const charAt = function(i) {
	return function(s) {
		if (i >= 0 && i < s.length) return s.charAt(i);
		throw new Error("Data.String.Unsafe.charAt: Invalid index.");
	};
};
//#endregion
//#region output/Data.String.CodeUnits/index.js
var indexOf$1 = /* #__PURE__ */ (function() {
	return _indexOf(Just.create)(Nothing.value);
})();
//#endregion
//#region output/Data.String.Common/foreign.js
const split$1 = function(sep) {
	return function(s) {
		return s.split(sep);
	};
};
//#endregion
//#region output/Data.String.CodePoints/index.js
var fromEnum = /* #__PURE__ */ fromEnum$1(boundedEnumChar);
var map$15 = /* #__PURE__ */ map$20(functorMaybe);
var unfoldr = /* #__PURE__ */ unfoldr$1(unfoldableArray);
var unsurrogate = function(lead) {
	return function(trail) {
		return (((lead - 55296 | 0) * 1024 | 0) + (trail - 56320 | 0) | 0) + 65536 | 0;
	};
};
var isTrail = function(cu) {
	return 56320 <= cu && cu <= 57343;
};
var isLead = function(cu) {
	return 55296 <= cu && cu <= 56319;
};
var uncons$2 = function(s) {
	var v = length$1(s);
	if (v === 0) return Nothing.value;
	if (v === 1) return new Just({
		head: fromEnum(charAt(0)(s)),
		tail: ""
	});
	var cu1 = fromEnum(charAt(1)(s));
	var cu0 = fromEnum(charAt(0)(s));
	if (isLead(cu0) && isTrail(cu1)) return new Just({
		head: unsurrogate(cu0)(cu1),
		tail: drop(2)(s)
	});
	return new Just({
		head: cu0,
		tail: drop(1)(s)
	});
};
var unconsButWithTuple = function(s) {
	return map$15(function(v) {
		return new Tuple(v.head, v.tail);
	})(uncons$2(s));
};
var toCodePointArrayFallback = function(s) {
	return unfoldr(unconsButWithTuple)(s);
};
var unsafeCodePointAt0Fallback = function(s) {
	var cu0 = fromEnum(charAt(0)(s));
	if (isLead(cu0) && length$1(s) > 1) {
		var cu1 = fromEnum(charAt(1)(s));
		if (isTrail(cu1)) return unsurrogate(cu0)(cu1);
		return cu0;
	}
	return cu0;
};
var unsafeCodePointAt0 = /* #__PURE__ */ _unsafeCodePointAt0(unsafeCodePointAt0Fallback);
var toCodePointArray = /* #__PURE__ */ _toCodePointArray(toCodePointArrayFallback)(unsafeCodePointAt0);
var length = function($74) {
	return length$2(toCodePointArray($74));
};
var indexOf = function(p) {
	return function(s) {
		return map$15(function(i) {
			return length(take(i)(s));
		})(indexOf$1(p)(s));
	};
};
//#endregion
//#region output/Data.Argonaut.Decode.Decoders/index.js
var pure$17 = /* #__PURE__ */ pure$18(applicativeEither);
var map$14 = /* #__PURE__ */ map$20(functorEither);
var lmap$1 = /* #__PURE__ */ lmap$2(bifunctorEither);
var composeKleisliFlipped = /* #__PURE__ */ composeKleisliFlipped$1(bindEither);
var traverseWithIndex = /* #__PURE__ */ traverseWithIndex$1(traversableWithIndexArray)(applicativeEither);
var decodeString = /* #__PURE__ */ (function() {
	return caseJsonString(new Left(new TypeMismatch$1("String")))(Right.create);
})();
var decodeMaybe = function(decoder) {
	return function(json) {
		if (isNull(json)) return pure$17(Nothing.value);
		return map$14(Just.create)(decoder(json));
	};
};
var decodeJArray = /* #__PURE__ */ (function() {
	var $52 = note(new TypeMismatch$1("Array"));
	return function($53) {
		return $52(toArray$1($53));
	};
})();
var decodeArray$1 = function(decoder) {
	return composeKleisliFlipped((function() {
		var $89 = lmap$1(Named.create("Array"));
		var $90 = traverseWithIndex(function(i) {
			var $92 = lmap$1(AtIndex.create(i));
			return function($93) {
				return $92(decoder($93));
			};
		});
		return function($91) {
			return $89($90($91));
		};
	})())(decodeJArray);
};
//#endregion
//#region output/Record/index.js
var set = function(dictIsSymbol) {
	var reflectSymbol$15 = reflectSymbol(dictIsSymbol);
	return function() {
		return function() {
			return function(l) {
				return function(b) {
					return function(r) {
						return unsafeSet(reflectSymbol$15(l))(b)(r);
					};
				};
			};
		};
	};
};
var insert = function(dictIsSymbol) {
	var reflectSymbol$16 = reflectSymbol(dictIsSymbol);
	return function() {
		return function() {
			return function(l) {
				return function(a) {
					return function(r) {
						return unsafeSet(reflectSymbol$16(l))(a)(r);
					};
				};
			};
		};
	};
};
var get$1 = function(dictIsSymbol) {
	var reflectSymbol$17 = reflectSymbol(dictIsSymbol);
	return function() {
		return function(l) {
			return function(r) {
				return unsafeGet(reflectSymbol$17(l))(r);
			};
		};
	};
};
//#endregion
//#region output/Data.Argonaut.Decode.Class/index.js
var bind$14 = /* #__PURE__ */ bind$15(bindEither);
var lmap = /* #__PURE__ */ lmap$2(bifunctorEither);
var map$13 = /* #__PURE__ */ map$20(functorMaybe);
var gDecodeJsonNil = { gDecodeJson: function(v) {
	return function(v1) {
		return new Right({});
	};
} };
var gDecodeJson = function(dict) {
	return dict.gDecodeJson;
};
var decodeRecord = function(dictGDecodeJson) {
	var gDecodeJson1 = gDecodeJson(dictGDecodeJson);
	return function() {
		return { decodeJson: function(json) {
			var v = toObject(json);
			if (v instanceof Just) return gDecodeJson1(v.value0)($$Proxy.value);
			if (v instanceof Nothing) return new Left(new TypeMismatch$1("Object"));
			throw new Error("Failed pattern match at Data.Argonaut.Decode.Class (line 103, column 5 - line 105, column 46): " + [v.constructor.name]);
		} };
	};
};
var decodeJsonString = { decodeJson: decodeString };
var decodeJsonField = function(dict) {
	return dict.decodeJsonField;
};
var gDecodeJsonCons$1 = function(dictDecodeJsonField) {
	var decodeJsonField1 = decodeJsonField(dictDecodeJsonField);
	return function(dictGDecodeJson) {
		var gDecodeJson1 = gDecodeJson(dictGDecodeJson);
		return function(dictIsSymbol) {
			var reflectSymbol$14 = reflectSymbol(dictIsSymbol);
			var insert$4 = insert(dictIsSymbol)()();
			return function() {
				return function() {
					return { gDecodeJson: function(object) {
						return function(v) {
							var fieldName = reflectSymbol$14($$Proxy.value);
							var v1 = decodeJsonField1(lookup(fieldName)(object));
							if (v1 instanceof Just) return bind$14(lmap(AtKey.create(fieldName))(v1.value0))(function(val) {
								return bind$14(gDecodeJson1(object)($$Proxy.value))(function(rest) {
									return new Right(insert$4($$Proxy.value)(val)(rest));
								});
							});
							if (v1 instanceof Nothing) return new Left(new AtKey(fieldName, MissingValue.value));
							throw new Error("Failed pattern match at Data.Argonaut.Decode.Class (line 127, column 5 - line 134, column 44): " + [v1.constructor.name]);
						};
					} };
				};
			};
		};
	};
};
var decodeJson$1 = function(dict) {
	return dict.decodeJson;
};
var decodeJsonMaybe = function(dictDecodeJson) {
	return { decodeJson: decodeMaybe(decodeJson$1(dictDecodeJson)) };
};
var decodeFieldMaybe = function(dictDecodeJson) {
	var decodeJson1 = decodeJson$1(decodeJsonMaybe(dictDecodeJson));
	return { decodeJsonField: function(v) {
		if (v instanceof Nothing) return new Just(new Right(Nothing.value));
		if (v instanceof Just) return new Just(decodeJson1(v.value0));
		throw new Error("Failed pattern match at Data.Argonaut.Decode.Class (line 139, column 1 - line 143, column 49): " + [v.constructor.name]);
	} };
};
var decodeFieldId = function(dictDecodeJson) {
	var decodeJson1 = decodeJson$1(dictDecodeJson);
	return { decodeJsonField: function(j) {
		return map$13(decodeJson1)(j);
	} };
};
var decodeArray = function(dictDecodeJson) {
	return { decodeJson: decodeArray$1(decodeJson$1(dictDecodeJson)) };
};
var encodeString = id$1;
var encodeMaybe = function(encoder) {
	return function(v) {
		if (v instanceof Nothing) return null;
		if (v instanceof Just) return encoder(v.value0);
		throw new Error("Failed pattern match at Data.Argonaut.Encode.Encoders (line 31, column 23 - line 33, column 22): " + [v.constructor.name]);
	};
};
//#endregion
//#region output/Data.Argonaut.Encode.Class/index.js
var gEncodeJsonNil = { gEncodeJson: function(v) {
	return function(v1) {
		return empty$5;
	};
} };
var gEncodeJson = function(dict) {
	return dict.gEncodeJson;
};
var encodeRecord = function(dictGEncodeJson) {
	var gEncodeJson1 = gEncodeJson(dictGEncodeJson);
	return function() {
		return { encodeJson: function(rec) {
			return id$1(gEncodeJson1(rec)($$Proxy.value));
		} };
	};
};
var encodeJsonJString = { encodeJson: encodeString };
var encodeJson$2 = function(dict) {
	return dict.encodeJson;
};
var encodeJsonMaybe = function(dictEncodeJson) {
	return { encodeJson: encodeMaybe(encodeJson$2(dictEncodeJson)) };
};
var gEncodeJsonCons = function(dictEncodeJson) {
	var encodeJson1 = encodeJson$2(dictEncodeJson);
	return function(dictGEncodeJson) {
		var gEncodeJson1 = gEncodeJson(dictGEncodeJson);
		return function(dictIsSymbol) {
			var reflectSymbol$13 = reflectSymbol(dictIsSymbol);
			var get = get$1(dictIsSymbol)();
			return function() {
				return { gEncodeJson: function(row) {
					return function(v) {
						return insert$2(reflectSymbol$13($$Proxy.value))(encodeJson1(get($$Proxy.value)(row)))(gEncodeJson1(row)($$Proxy.value));
					};
				} };
			};
		};
	};
};
//#endregion
//#region output/Data.Lens.Internal.Forget/index.js
var Forget = function(x) {
	return x;
};
var profunctorForget = { dimap: function(f) {
	return function(v) {
		return function(v1) {
			return function($36) {
				return v1(f($36));
			};
		};
	};
} };
var strongForget = {
	first: function(v) {
		return function($37) {
			return v(fst($37));
		};
	},
	second: function(v) {
		return function($38) {
			return v(snd($38));
		};
	},
	Profunctor0: function() {
		return profunctorForget;
	}
};
var choiceForget = function(dictMonoid) {
	var mempty = mempty$6(monoidFn(dictMonoid));
	return {
		left: function(v) {
			return either(v)(mempty);
		},
		right: function(v) {
			return either(mempty)(v);
		},
		Profunctor0: function() {
			return profunctorForget;
		}
	};
};
//#endregion
//#region output/Data.Profunctor/index.js
var identity$9 = /* #__PURE__ */ identity$15(categoryFn);
var dimap = function(dict) {
	return dict.dimap;
};
var rmap = function(dictProfunctor) {
	var dimap1 = dimap(dictProfunctor);
	return function(b2c) {
		return dimap1(identity$9)(b2c);
	};
};
//#endregion
//#region output/Data.Profunctor.Choice/index.js
var right = function(dict) {
	return dict.right;
};
var first = function(dict) {
	return dict.first;
};
//#endregion
//#region output/Data.Lens.Iso/index.js
var coerce$1 = /* #__PURE__ */ coerce$3();
var iso = function(f) {
	return function(g) {
		return function(dictProfunctor) {
			var dimap$11 = dimap(dictProfunctor);
			return function(pab) {
				return dimap$11(f)(g)(pab);
			};
		};
	};
};
var coerced$1 = function() {
	return function() {
		return function(dictProfunctor) {
			return iso(coerce$1)(coerce$1)(dictProfunctor);
		};
	};
};
//#endregion
//#region output/Data.Lens.Lens/index.js
var lens$prime = function(to) {
	return function(dictStrong) {
		var dimap$9 = dimap(dictStrong.Profunctor0());
		var first$3 = first(dictStrong);
		return function(pab) {
			return dimap$9(to)(function(v) {
				return v.value1(v.value0);
			})(first$3(pab));
		};
	};
};
var lens = function(get) {
	return function(set) {
		return function(dictStrong) {
			return lens$prime(function(s) {
				return new Tuple(get(s), function(b) {
					return set(s)(b);
				});
			})(dictStrong);
		};
	};
};
//#endregion
//#region output/Data.Lens.Prism/index.js
var identity$8 = /* #__PURE__ */ identity$15(categoryFn);
var prism = function(to) {
	return function(fro) {
		return function(dictChoice) {
			var Profunctor0 = dictChoice.Profunctor0();
			var dimap$7 = dimap(Profunctor0);
			var right$3 = right(dictChoice);
			var rmap$1 = rmap(Profunctor0);
			return function(pab) {
				return dimap$7(fro)(either(identity$8)(identity$8))(right$3(rmap$1(to)(pab)));
			};
		};
	};
};
//#endregion
//#region output/Data.Lens.Iso.Newtype/index.js
var coerced = /* #__PURE__ */ coerced$1()();
var _Newtype$1 = function() {
	return function() {
		return function(dictProfunctor) {
			return coerced(dictProfunctor);
		};
	};
};
//#endregion
//#region output/Data.Lens.Prism.Maybe/index.js
var _Just = function(dictChoice) {
	return prism(Just.create)(maybe(new Left(Nothing.value))(Right.create))(dictChoice);
};
//#endregion
//#region output/Data.Lens.Record/index.js
var prop = function(dictIsSymbol) {
	var get = get$1(dictIsSymbol)();
	var set$1 = set(dictIsSymbol)()();
	return function() {
		return function() {
			return function(l) {
				return function(dictStrong) {
					return lens(get(l))(flip(set$1(l)))(dictStrong);
				};
			};
		};
	};
};
//#endregion
//#region output/Control.Monad.State.Class/index.js
var state = function(dict) {
	return dict.state;
};
var put = function(dictMonadState) {
	var state1 = state(dictMonadState);
	return function(s) {
		return state1(function(v) {
			return new Tuple(void 0, s);
		});
	};
};
var modify_$1 = function(dictMonadState) {
	var state1 = state(dictMonadState);
	return function(f) {
		return state1(function(s) {
			return new Tuple(void 0, f(s));
		});
	};
};
var get = function(dictMonadState) {
	return state(dictMonadState)(function(s) {
		return new Tuple(s, s);
	});
};
function error(msg) {
	return new Error(msg);
}
//#endregion
//#region output/Control.Monad.Error.Class/index.js
var throwError$1 = function(dict) {
	return dict.throwError;
};
var catchError = function(dict) {
	return dict.catchError;
};
var $$try$1 = function(dictMonadError) {
	var catchError1 = catchError(dictMonadError);
	var Monad0 = dictMonadError.MonadThrow0().Monad0();
	var map = map$20(Monad0.Bind1().Apply0().Functor0());
	var pure = pure$18(Monad0.Applicative0());
	return function(a) {
		return catchError1(map(Right.create)(a))(function($52) {
			return pure(Left.create($52));
		});
	};
};
var ask = function(dict) {
	return dict.ask;
};
//#endregion
//#region output/Control.Monad.Trans.Class/index.js
var lift$7 = function(dict) {
	return dict.lift;
};
var liftEffect$2 = function(dict) {
	return dict.liftEffect;
};
//#endregion
//#region output/Control.Monad.State.Trans/index.js
var StateT = function(x) {
	return x;
};
var runStateT = function(v) {
	return v;
};
var monadTransStateT = { lift: function(dictMonad) {
	var bind = bind$15(dictMonad.Bind1());
	var pure = pure$18(dictMonad.Applicative0());
	return function(m) {
		return function(s) {
			return bind(m)(function(x) {
				return pure(new Tuple(x, s));
			});
		};
	};
} };
var functorStateT = function(dictFunctor) {
	var map = map$20(dictFunctor);
	return { map: function(f) {
		return function(v) {
			return function(s) {
				return map(function(v1) {
					return new Tuple(f(v1.value0), v1.value1);
				})(v(s));
			};
		};
	} };
};
var evalStateT = function(dictFunctor) {
	var map = map$20(dictFunctor);
	return function(v) {
		return function(s) {
			return map(fst)(v(s));
		};
	};
};
var monadStateT$1 = function(dictMonad) {
	return {
		Applicative0: function() {
			return applicativeStateT(dictMonad);
		},
		Bind1: function() {
			return bindStateT(dictMonad);
		}
	};
};
var bindStateT = function(dictMonad) {
	var bind = bind$15(dictMonad.Bind1());
	return {
		bind: function(v) {
			return function(f) {
				return function(s) {
					return bind(v(s))(function(v1) {
						return f(v1.value0)(v1.value1);
					});
				};
			};
		},
		Apply0: function() {
			return applyStateT(dictMonad);
		}
	};
};
var applyStateT = function(dictMonad) {
	var functorStateT1 = functorStateT(dictMonad.Bind1().Apply0().Functor0());
	return {
		apply: ap(monadStateT$1(dictMonad)),
		Functor0: function() {
			return functorStateT1;
		}
	};
};
var applicativeStateT = function(dictMonad) {
	var pure = pure$18(dictMonad.Applicative0());
	return {
		pure: function(a) {
			return function(s) {
				return pure(new Tuple(a, s));
			};
		},
		Apply0: function() {
			return applyStateT(dictMonad);
		}
	};
};
var monadStateStateT = function(dictMonad) {
	var pure = pure$18(dictMonad.Applicative0());
	var monadStateT1 = monadStateT$1(dictMonad);
	return {
		state: function(f) {
			return function($206) {
				return pure(f($206));
			};
		},
		Monad0: function() {
			return monadStateT1;
		}
	};
};
//#endregion
//#region output/Data.Lens.Barlow.Construction/index.js
var _Newtype = /* #__PURE__ */ _Newtype$1()();
var constructBarlowTConsRecor = function(dictIsSymbol) {
	var prop$2 = prop(dictIsSymbol)()();
	return function() {
		return function() {
			return function(dictStrong) {
				return { constructBarlow: function(v) {
					return prop$2($$Proxy.value)(dictStrong);
				} };
			};
		};
	};
};
var constructBarlowTConsQuest = function(dictChoice) {
	var _Just$2 = _Just(dictChoice);
	return { constructBarlow: function(v) {
		return _Just$2;
	} };
};
var constructBarlow = function(dict) {
	return dict.constructBarlow;
};
var constructBarlowTConsExcla = function(dictConstructBarlow) {
	var constructBarlow2 = constructBarlow(dictConstructBarlow);
	return function() {
		return function(dictProfunctor) {
			var _Newtype1 = _Newtype(dictProfunctor);
			return { constructBarlow: function(v) {
				var $225 = constructBarlow2($$Proxy.value);
				return function($226) {
					return _Newtype1($225($226));
				};
			} };
		};
	};
};
var constructBarlowTConsRecor1 = function(dictIsSymbol) {
	var prop$1 = prop(dictIsSymbol)()();
	return function(dictConstructBarlow) {
		var constructBarlow2 = constructBarlow(dictConstructBarlow);
		return function() {
			return function() {
				return function(dictStrong) {
					return { constructBarlow: function(v) {
						var $233 = prop$1($$Proxy.value)(dictStrong);
						var $234 = constructBarlow2($$Proxy.value);
						return function($235) {
							return $233($234($235));
						};
					} };
				};
			};
		};
	};
};
//#endregion
//#region output/ExitCodes/index.js
var Success$1 = /* #__PURE__ */ (function() {
	function Success() {}
	Success.value = new Success();
	return Success;
})();
var $$Error = /* #__PURE__ */ (function() {
	function $$Error() {}
	$$Error.value = new $$Error();
	return $$Error;
})();
const regexImpl = function(left) {
	return function(right) {
		return function(s1) {
			return function(s2) {
				try {
					return right(new RegExp(s1, s2));
				} catch (e) {
					return left(e.message);
				}
			};
		};
	};
};
const split = function(r) {
	return function(s) {
		return s.split(r);
	};
};
//#endregion
//#region output/Data.String.Regex.Flags/index.js
var noFlags = {
	global: false,
	ignoreCase: false,
	multiline: false,
	dotAll: false,
	sticky: false,
	unicode: false
};
var renderFlags = function(v) {
	return (function() {
		if (v.global) return "g";
		return "";
	})() + ((function() {
		if (v.ignoreCase) return "i";
		return "";
	})() + ((function() {
		if (v.multiline) return "m";
		return "";
	})() + ((function() {
		if (v.dotAll) return "s";
		return "";
	})() + ((function() {
		if (v.sticky) return "y";
		return "";
	})() + (function() {
		if (v.unicode) return "u";
		return "";
	})()))));
};
var regex = function(s) {
	return function(f) {
		return regexImpl(Left.create)(Right.create)(s)(renderFlags(f));
	};
};
//#endregion
//#region output/Options.Applicative.Internal.Utils/index.js
var eq = /* #__PURE__ */ eq$1(/* #__PURE__ */ eqMaybe(eqInt));
var whitespaceRegex = /* #__PURE__ */ (function() {
	var v = regex("\\s+")(noFlags);
	if (v instanceof Left) return unsafeCrashWith("whitespaceRegex: `\\s+` seems to be invlaid, err: " + v.value0);
	if (v instanceof Right) return v.value0;
	throw new Error("Failed pattern match at Options.Applicative.Internal.Utils (line 39, column 19 - line 41, column 15): " + [v.constructor.name]);
})();
var words = function(v) {
	if (v === "") return [];
	return split(whitespaceRegex)(v);
};
var unWords$1 = function(dictFoldable) {
	return intercalate(dictFoldable)(monoidString)(" ");
};
var unLines$1 = function(dictFoldable) {
	return intercalate(dictFoldable)(monoidString)("\n");
};
var startsWith = function(p) {
	return function(s) {
		return eq(indexOf(p)(s))(new Just(0));
	};
};
var lines = function(v) {
	if (v === "") return [];
	return split$1("\n")(v);
};
var apApplyFlipped$1 = function(dictApply) {
	return lift2$2(dictApply)(applyFlipped);
};
//#endregion
//#region output/Control.Monad.Except.Trans/index.js
var map$12 = /* #__PURE__ */ map$20(functorEither);
var ExceptT = function(x) {
	return x;
};
var withExceptT = function(dictFunctor) {
	var map1 = map$20(dictFunctor);
	return function(f) {
		return function(v) {
			var mapLeft = function(v1) {
				return function(v2) {
					if (v2 instanceof Right) return new Right(v2.value0);
					if (v2 instanceof Left) return new Left(v1(v2.value0));
					throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 43, column 3 - line 43, column 32): " + [v1.constructor.name, v2.constructor.name]);
				};
			};
			return map1(mapLeft(f))(v);
		};
	};
};
var runExceptT = function(v) {
	return v;
};
var monadTransExceptT = { lift: function(dictMonad) {
	var bind = bind$15(dictMonad.Bind1());
	var pure = pure$18(dictMonad.Applicative0());
	return function(m) {
		return bind(m)(function(a) {
			return pure(new Right(a));
		});
	};
} };
var mapExceptT = function(f) {
	return function(v) {
		return f(v);
	};
};
var functorExceptT = function(dictFunctor) {
	var map1 = map$20(dictFunctor);
	return { map: function(f) {
		return mapExceptT(map1(map$12(f)));
	} };
};
var monadExceptT$1 = function(dictMonad) {
	return {
		Applicative0: function() {
			return applicativeExceptT(dictMonad);
		},
		Bind1: function() {
			return bindExceptT(dictMonad);
		}
	};
};
var bindExceptT = function(dictMonad) {
	var bind = bind$15(dictMonad.Bind1());
	var pure = pure$18(dictMonad.Applicative0());
	return {
		bind: function(v) {
			return function(k) {
				return bind(v)(either(function($193) {
					return pure(Left.create($193));
				})(function(a) {
					return k(a);
				}));
			};
		},
		Apply0: function() {
			return applyExceptT(dictMonad);
		}
	};
};
var applyExceptT = function(dictMonad) {
	var functorExceptT1 = functorExceptT(dictMonad.Bind1().Apply0().Functor0());
	return {
		apply: ap(monadExceptT$1(dictMonad)),
		Functor0: function() {
			return functorExceptT1;
		}
	};
};
var applicativeExceptT = function(dictMonad) {
	return {
		pure: (function() {
			var $194 = pure$18(dictMonad.Applicative0());
			return function($195) {
				return ExceptT($194(Right.create($195)));
			};
		})(),
		Apply0: function() {
			return applyExceptT(dictMonad);
		}
	};
};
var monadThrowExceptT = function(dictMonad) {
	var monadExceptT1 = monadExceptT$1(dictMonad);
	return {
		throwError: (function() {
			var $204 = pure$18(dictMonad.Applicative0());
			return function($205) {
				return ExceptT($204(Left.create($205)));
			};
		})(),
		Monad0: function() {
			return monadExceptT1;
		}
	};
};
var altExceptT$1 = function(dictSemigroup) {
	var append = append$7(dictSemigroup);
	return function(dictMonad) {
		var Bind1 = dictMonad.Bind1();
		var bind = bind$15(Bind1);
		var pure = pure$18(dictMonad.Applicative0());
		var functorExceptT1 = functorExceptT(Bind1.Apply0().Functor0());
		return {
			alt: function(v) {
				return function(v1) {
					return bind(v)(function(rm) {
						if (rm instanceof Right) return pure(new Right(rm.value0));
						if (rm instanceof Left) return bind(v1)(function(rn) {
							if (rn instanceof Right) return pure(new Right(rn.value0));
							if (rn instanceof Left) return pure(new Left(append(rm.value0)(rn.value0)));
							throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 87, column 9 - line 89, column 49): " + [rn.constructor.name]);
						});
						throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 83, column 5 - line 89, column 49): " + [rm.constructor.name]);
					});
				};
			},
			Functor0: function() {
				return functorExceptT1;
			}
		};
	};
};
//#endregion
//#region output/Data.CatQueue/index.js
var CatQueue = /* #__PURE__ */ (function() {
	function CatQueue(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	CatQueue.create = function(value0) {
		return function(value1) {
			return new CatQueue(value0, value1);
		};
	};
	return CatQueue;
})();
var uncons$1 = function($copy_v) {
	var $tco_done = false;
	var $tco_result;
	function $tco_loop(v) {
		if (v.value0 instanceof Nil$1 && v.value1 instanceof Nil$1) {
			$tco_done = true;
			return Nothing.value;
		}
		if (v.value0 instanceof Nil$1) {
			$copy_v = new CatQueue(reverse(v.value1), Nil$1.value);
			return;
		}
		if (v.value0 instanceof Cons$1) {
			$tco_done = true;
			return new Just(new Tuple(v.value0.value0, new CatQueue(v.value0.value1, v.value1)));
		}
		throw new Error("Failed pattern match at Data.CatQueue (line 82, column 1 - line 82, column 63): " + [v.constructor.name]);
	}
	while (!$tco_done) $tco_result = $tco_loop($copy_v);
	return $tco_result;
};
var snoc$1 = function(v) {
	return function(a) {
		return new CatQueue(v.value0, new Cons$1(a, v.value1));
	};
};
var $$null = function(v) {
	if (v.value0 instanceof Nil$1 && v.value1 instanceof Nil$1) return true;
	return false;
};
var empty$2 = /* #__PURE__ */ (function() {
	return new CatQueue(Nil$1.value, Nil$1.value);
})();
//#endregion
//#region output/Data.CatList/index.js
var CatNil = /* #__PURE__ */ (function() {
	function CatNil() {}
	CatNil.value = new CatNil();
	return CatNil;
})();
var CatCons = /* #__PURE__ */ (function() {
	function CatCons(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	CatCons.create = function(value0) {
		return function(value1) {
			return new CatCons(value0, value1);
		};
	};
	return CatCons;
})();
var link = function(v) {
	return function(v1) {
		if (v instanceof CatNil) return v1;
		if (v1 instanceof CatNil) return v;
		if (v instanceof CatCons) return new CatCons(v.value0, snoc$1(v.value1)(v1));
		throw new Error("Failed pattern match at Data.CatList (line 108, column 1 - line 108, column 54): " + [v.constructor.name, v1.constructor.name]);
	};
};
var foldr$2 = function(k) {
	return function(b) {
		return function(q) {
			var foldl = function($copy_v) {
				return function($copy_v1) {
					return function($copy_v2) {
						var $tco_var_v = $copy_v;
						var $tco_var_v1 = $copy_v1;
						var $tco_done = false;
						var $tco_result;
						function $tco_loop(v, v1, v2) {
							if (v2 instanceof Nil$1) {
								$tco_done = true;
								return v1;
							}
							if (v2 instanceof Cons$1) {
								$tco_var_v = v;
								$tco_var_v1 = v(v1)(v2.value0);
								$copy_v2 = v2.value1;
								return;
							}
							throw new Error("Failed pattern match at Data.CatList (line 124, column 3 - line 124, column 59): " + [
								v.constructor.name,
								v1.constructor.name,
								v2.constructor.name
							]);
						}
						while (!$tco_done) $tco_result = $tco_loop($tco_var_v, $tco_var_v1, $copy_v2);
						return $tco_result;
					};
				};
			};
			var go = function($copy_xs) {
				return function($copy_ys) {
					var $tco_var_xs = $copy_xs;
					var $tco_done1 = false;
					var $tco_result;
					function $tco_loop(xs, ys) {
						var v = uncons$1(xs);
						if (v instanceof Nothing) {
							$tco_done1 = true;
							return foldl(function(x) {
								return function(i) {
									return i(x);
								};
							})(b)(ys);
						}
						if (v instanceof Just) {
							$tco_var_xs = v.value0.value1;
							$copy_ys = new Cons$1(k(v.value0.value0), ys);
							return;
						}
						throw new Error("Failed pattern match at Data.CatList (line 120, column 14 - line 122, column 67): " + [v.constructor.name]);
					}
					while (!$tco_done1) $tco_result = $tco_loop($tco_var_xs, $copy_ys);
					return $tco_result;
				};
			};
			return go(q)(Nil$1.value);
		};
	};
};
var uncons = function(v) {
	if (v instanceof CatNil) return Nothing.value;
	if (v instanceof CatCons) return new Just(new Tuple(v.value0, (function() {
		if ($$null(v.value1)) return CatNil.value;
		return foldr$2(link)(CatNil.value)(v.value1);
	})()));
	throw new Error("Failed pattern match at Data.CatList (line 99, column 1 - line 99, column 61): " + [v.constructor.name]);
};
var empty$1 = /* #__PURE__ */ (function() {
	return CatNil.value;
})();
var append$5 = link;
var semigroupCatList = { append: append$5 };
var snoc = function(cat) {
	return function(a) {
		return append$5(cat)(new CatCons(a, empty$2));
	};
};
//#endregion
//#region output/Control.Monad.Free/index.js
var $runtime_lazy$4 = function(name, moduleName, init) {
	var state = 0;
	var val;
	return function(lineNumber) {
		if (state === 2) return val;
		if (state === 1) throw new ReferenceError(name + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
		state = 1;
		val = init();
		state = 2;
		return val;
	};
};
var append$4 = /* #__PURE__ */ append$7(semigroupCatList);
var Free = /* #__PURE__ */ (function() {
	function Free(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Free.create = function(value0) {
		return function(value1) {
			return new Free(value0, value1);
		};
	};
	return Free;
})();
var Return = /* #__PURE__ */ (function() {
	function Return(value0) {
		this.value0 = value0;
	}
	Return.create = function(value0) {
		return new Return(value0);
	};
	return Return;
})();
var Bind = /* #__PURE__ */ (function() {
	function Bind(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Bind.create = function(value0) {
		return function(value1) {
			return new Bind(value0, value1);
		};
	};
	return Bind;
})();
var toView = function($copy_v) {
	var $tco_done = false;
	var $tco_result;
	function $tco_loop(v) {
		var runExpF = function(v2) {
			return v2;
		};
		var concatF = function(v2) {
			return function(r) {
				return new Free(v2.value0, append$4(v2.value1)(r));
			};
		};
		if (v.value0 instanceof Return) {
			var v2 = uncons(v.value1);
			if (v2 instanceof Nothing) {
				$tco_done = true;
				return new Return(v.value0.value0);
			}
			if (v2 instanceof Just) {
				$copy_v = concatF(runExpF(v2.value0.value0)(v.value0.value0))(v2.value0.value1);
				return;
			}
			throw new Error("Failed pattern match at Control.Monad.Free (line 227, column 7 - line 231, column 64): " + [v2.constructor.name]);
		}
		if (v.value0 instanceof Bind) {
			$tco_done = true;
			return new Bind(v.value0.value0, function(a) {
				return concatF(v.value0.value1(a))(v.value1);
			});
		}
		throw new Error("Failed pattern match at Control.Monad.Free (line 225, column 3 - line 233, column 56): " + [v.value0.constructor.name]);
	}
	while (!$tco_done) $tco_result = $tco_loop($copy_v);
	return $tco_result;
};
var resume$prime = function(k) {
	return function(j) {
		return function(f) {
			var v = toView(f);
			if (v instanceof Return) return j(v.value0);
			if (v instanceof Bind) return k(v.value0)(v.value1);
			throw new Error("Failed pattern match at Control.Monad.Free (line 213, column 17 - line 215, column 20): " + [v.constructor.name]);
		};
	};
};
var fromView = function(f) {
	return new Free(f, empty$1);
};
var freeMonad = {
	Applicative0: function() {
		return freeApplicative;
	},
	Bind1: function() {
		return freeBind;
	}
};
var freeFunctor = { map: function(k) {
	return function(f) {
		return bindFlipped$2(freeBind)((function() {
			var $189 = pure$18(freeApplicative);
			return function($190) {
				return $189(k($190));
			};
		})())(f);
	};
} };
var freeBind = {
	bind: function(v) {
		return function(k) {
			return new Free(v.value0, snoc(v.value1)(k));
		};
	},
	Apply0: function() {
		return $lazy_freeApply(0);
	}
};
var freeApplicative = {
	pure: function($191) {
		return fromView(Return.create($191));
	},
	Apply0: function() {
		return $lazy_freeApply(0);
	}
};
var $lazy_freeApply = /* #__PURE__ */ $runtime_lazy$4("freeApply", "Control.Monad.Free", function() {
	return {
		apply: ap(freeMonad),
		Functor0: function() {
			return freeFunctor;
		}
	};
});
var bind$13 = /* #__PURE__ */ bind$15(freeBind);
var pure$16 = /* #__PURE__ */ pure$18(freeApplicative);
var freeMonadRec = {
	tailRecM: function(k) {
		return function(a) {
			return bind$13(k(a))(function(v) {
				if (v instanceof Loop) return tailRecM$1(freeMonadRec)(k)(v.value0);
				if (v instanceof Done) return pure$16(v.value0);
				throw new Error("Failed pattern match at Control.Monad.Free (line 86, column 26 - line 88, column 21): " + [v.constructor.name]);
			});
		};
	},
	Monad0: function() {
		return freeMonad;
	}
};
var liftF = function(f) {
	return fromView(new Bind(f, function($192) {
		return pure$16($192);
	}));
};
//#endregion
//#region output/Control.Monad.Reader.Trans/index.js
var ReaderT = function(x) {
	return x;
};
var runReaderT = function(v) {
	return v;
};
var monadTransReaderT = { lift: function(dictMonad) {
	return function($153) {
		return ReaderT($$const($153));
	};
} };
var mapReaderT = function(f) {
	return function(v) {
		return function($154) {
			return f(v($154));
		};
	};
};
var functorReaderT = function(dictFunctor) {
	return { map: (function() {
		var $155 = map$20(dictFunctor);
		return function($156) {
			return mapReaderT($155($156));
		};
	})() };
};
var applyReaderT = function(dictApply) {
	var apply = apply$8(dictApply);
	var functorReaderT1 = functorReaderT(dictApply.Functor0());
	return {
		apply: function(v) {
			return function(v1) {
				return function(r) {
					return apply(v(r))(v1(r));
				};
			};
		},
		Functor0: function() {
			return functorReaderT1;
		}
	};
};
var bindReaderT = function(dictBind) {
	var bind = bind$15(dictBind);
	var applyReaderT1 = applyReaderT(dictBind.Apply0());
	return {
		bind: function(v) {
			return function(k) {
				return function(r) {
					return bind(v(r))(function(a) {
						return k(a)(r);
					});
				};
			};
		},
		Apply0: function() {
			return applyReaderT1;
		}
	};
};
var applicativeReaderT = function(dictApplicative) {
	var applyReaderT1 = applyReaderT(dictApplicative.Apply0());
	return {
		pure: (function() {
			var $160 = pure$18(dictApplicative);
			return function($161) {
				return ReaderT($$const($160($161)));
			};
		})(),
		Apply0: function() {
			return applyReaderT1;
		}
	};
};
var monadReaderT$1 = function(dictMonad) {
	var applicativeReaderT1 = applicativeReaderT(dictMonad.Applicative0());
	var bindReaderT1 = bindReaderT(dictMonad.Bind1());
	return {
		Applicative0: function() {
			return applicativeReaderT1;
		},
		Bind1: function() {
			return bindReaderT1;
		}
	};
};
var monadAskReaderT = function(dictMonad) {
	var monadReaderT1 = monadReaderT$1(dictMonad);
	return {
		ask: pure$18(dictMonad.Applicative0()),
		Monad0: function() {
			return monadReaderT1;
		}
	};
};
//#endregion
//#region output/Data.Exists/index.js
var runExists = unsafeCoerce;
var mkExists = unsafeCoerce;
//#endregion
//#region output/Data.Lazy/foreign.js
const defer = function(thunk) {
	var v = null;
	return function() {
		if (thunk === void 0) return v;
		v = thunk();
		thunk = void 0;
		return v;
	};
};
const force = function(l) {
	return l();
};
//#endregion
//#region output/Data.Lazy/index.js
var functorLazy = { map: function(f) {
	return function(l) {
		return defer(function(v) {
			return f(force(l));
		});
	};
} };
var applyLazy = {
	apply: function(f) {
		return function(x) {
			return defer(function(v) {
				return force(f)(force(x));
			});
		};
	},
	Functor0: function() {
		return functorLazy;
	}
};
var bindLazy = {
	bind: function(l) {
		return function(f) {
			return defer(function(v) {
				return force(f(force(l)));
			});
		};
	},
	Apply0: function() {
		return applyLazy;
	}
};
//#endregion
//#region output/Text.PrettyPrint.Leijen/index.js
var max = /* #__PURE__ */ max$1(ordInt);
var min$1 = /* #__PURE__ */ min$2(ordInt);
var foldr$1 = /* #__PURE__ */ foldr$5(foldableArray);
var SFail = /* #__PURE__ */ (function() {
	function SFail() {}
	SFail.value = new SFail();
	return SFail;
})();
var SEmpty = /* #__PURE__ */ (function() {
	function SEmpty() {}
	SEmpty.value = new SEmpty();
	return SEmpty;
})();
var SChar = /* #__PURE__ */ (function() {
	function SChar(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	SChar.create = function(value0) {
		return function(value1) {
			return new SChar(value0, value1);
		};
	};
	return SChar;
})();
var SText = /* #__PURE__ */ (function() {
	function SText(value0, value1, value2) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
	}
	SText.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return new SText(value0, value1, value2);
			};
		};
	};
	return SText;
})();
var SLine = /* #__PURE__ */ (function() {
	function SLine(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	SLine.create = function(value0) {
		return function(value1) {
			return new SLine(value0, value1);
		};
	};
	return SLine;
})();
var SFail$prime = /* #__PURE__ */ (function() {
	function SFail$prime() {}
	SFail$prime.value = new SFail$prime();
	return SFail$prime;
})();
var SEmpty$prime = /* #__PURE__ */ (function() {
	function SEmpty$prime() {}
	SEmpty$prime.value = new SEmpty$prime();
	return SEmpty$prime;
})();
var SChar$prime = /* #__PURE__ */ (function() {
	function SChar$prime(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	SChar$prime.create = function(value0) {
		return function(value1) {
			return new SChar$prime(value0, value1);
		};
	};
	return SChar$prime;
})();
var SText$prime = /* #__PURE__ */ (function() {
	function SText$prime(value0, value1, value2) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
	}
	SText$prime.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return new SText$prime(value0, value1, value2);
			};
		};
	};
	return SText$prime;
})();
var SLine$prime = /* #__PURE__ */ (function() {
	function SLine$prime(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	SLine$prime.create = function(value0) {
		return function(value1) {
			return new SLine$prime(value0, value1);
		};
	};
	return SLine$prime;
})();
var Fail = /* #__PURE__ */ (function() {
	function Fail() {}
	Fail.value = new Fail();
	return Fail;
})();
var Empty = /* #__PURE__ */ (function() {
	function Empty() {}
	Empty.value = new Empty();
	return Empty;
})();
var Char = /* #__PURE__ */ (function() {
	function Char(value0) {
		this.value0 = value0;
	}
	Char.create = function(value0) {
		return new Char(value0);
	};
	return Char;
})();
var Text = /* #__PURE__ */ (function() {
	function Text(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Text.create = function(value0) {
		return function(value1) {
			return new Text(value0, value1);
		};
	};
	return Text;
})();
var Line = /* #__PURE__ */ (function() {
	function Line() {}
	Line.value = new Line();
	return Line;
})();
var FlatAlt = /* #__PURE__ */ (function() {
	function FlatAlt(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	FlatAlt.create = function(value0) {
		return function(value1) {
			return new FlatAlt(value0, value1);
		};
	};
	return FlatAlt;
})();
var Cat = /* #__PURE__ */ (function() {
	function Cat(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Cat.create = function(value0) {
		return function(value1) {
			return new Cat(value0, value1);
		};
	};
	return Cat;
})();
var Nest = /* #__PURE__ */ (function() {
	function Nest(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Nest.create = function(value0) {
		return function(value1) {
			return new Nest(value0, value1);
		};
	};
	return Nest;
})();
var Union = /* #__PURE__ */ (function() {
	function Union(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Union.create = function(value0) {
		return function(value1) {
			return new Union(value0, value1);
		};
	};
	return Union;
})();
var Column = /* #__PURE__ */ (function() {
	function Column(value0) {
		this.value0 = value0;
	}
	Column.create = function(value0) {
		return new Column(value0);
	};
	return Column;
})();
var Columns = /* #__PURE__ */ (function() {
	function Columns(value0) {
		this.value0 = value0;
	}
	Columns.create = function(value0) {
		return new Columns(value0);
	};
	return Columns;
})();
var Nesting = /* #__PURE__ */ (function() {
	function Nesting(value0) {
		this.value0 = value0;
	}
	Nesting.create = function(value0) {
		return new Nesting(value0);
	};
	return Nesting;
})();
var Nil = /* #__PURE__ */ (function() {
	function Nil() {}
	Nil.value = new Nil();
	return Nil;
})();
var Cons = /* #__PURE__ */ (function() {
	function Cons(value0, value1, value2) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
	}
	Cons.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return new Cons(value0, value1, value2);
			};
		};
	};
	return Cons;
})();
var text = function(v) {
	if (v === "") return Empty.value;
	return new Text(length(v), v);
};
var spaces = function(n) {
	if (n <= 0) return "";
	return fromCharArray(replicate(n)(" "));
};
var space = /* #__PURE__ */ (function() {
	return new Char(" ");
})();
var rparen = /* #__PURE__ */ (function() {
	return new Char(")");
})();
var rbracket = /* #__PURE__ */ (function() {
	return new Char("]");
})();
var nesting = function(f) {
	return new Nesting(f);
};
var nest = function(i) {
	return function(x) {
		return new Nest(i, x);
	};
};
var lparen = /* #__PURE__ */ (function() {
	return new Char("(");
})();
var line = /* #__PURE__ */ (function() {
	return new FlatAlt(Line.value, space);
})();
var lbracket = /* #__PURE__ */ (function() {
	return new Char("[");
})();
var indentation = function(n) {
	return spaces(n);
};
var forceSimpleDoc = function(v) {
	if (v instanceof SFail$prime) return SFail.value;
	if (v instanceof SEmpty$prime) return SEmpty.value;
	if (v instanceof SChar$prime) return new SChar(v.value0, forceSimpleDoc(force(v.value1)));
	if (v instanceof SText$prime) return new SText(v.value0, v.value1, forceSimpleDoc(force(v.value2)));
	if (v instanceof SLine$prime) return new SLine(v.value0, forceSimpleDoc(force(v.value1)));
	throw new Error("Failed pattern match at Text.PrettyPrint.Leijen (line 600, column 18 - line 605, column 51): " + [v.constructor.name]);
};
var renderFits = function(fits) {
	return function(rfrac) {
		return function(w) {
			return function(headNode) {
				var r = max(0)(min$1(w)(round(toNumber(w) * rfrac)));
				var nicest$prime = function(n) {
					return function(k) {
						return function(i) {
							return function(ds) {
								return function(x) {
									return function(y) {
										var x$prime = best(n)(k)(new Cons(i, x, ds));
										var width$prime = min$1(w - k | 0)((r - k | 0) + n | 0);
										if (fits(w)(min$1(n)(k))(width$prime)(x$prime)) return x$prime;
										return best(n)(k)(new Cons(i, y, ds));
									};
								};
							};
						};
					};
				};
				var best = function(v) {
					return function(v1) {
						return function(v2) {
							if (v2 instanceof Nil) return SEmpty$prime.value;
							if (v2 instanceof Cons) {
								if (v2.value1 instanceof Fail) return SFail$prime.value;
								if (v2.value1 instanceof Empty) return best(v)(v1)(v2.value2);
								if (v2.value1 instanceof Char) {
									var k$prime = v1 + 1 | 0;
									return new SChar$prime(v2.value1.value0, defer(function(v3) {
										return best(v)(k$prime)(v2.value2);
									}));
								}
								if (v2.value1 instanceof Text) {
									var k$prime = v1 + v2.value1.value0 | 0;
									return new SText$prime(v2.value1.value0, v2.value1.value1, defer(function(v3) {
										return best(v)(k$prime)(v2.value2);
									}));
								}
								if (v2.value1 instanceof Line) return new SLine$prime(v2.value0, defer(function(v3) {
									return best(v2.value0)(v2.value0)(v2.value2);
								}));
								if (v2.value1 instanceof FlatAlt) return best(v)(v1)(new Cons(v2.value0, v2.value1.value0, v2.value2));
								if (v2.value1 instanceof Cat) return best(v)(v1)(new Cons(v2.value0, v2.value1.value0, new Cons(v2.value0, v2.value1.value1, v2.value2)));
								if (v2.value1 instanceof Nest) {
									var i$prime = v2.value0 + v2.value1.value0 | 0;
									return best(v)(v1)(new Cons(i$prime, v2.value1.value1, v2.value2));
								}
								if (v2.value1 instanceof Union) return nicest$prime(v)(v1)(v2.value0)(v2.value2)(v2.value1.value0)(v2.value1.value1);
								if (v2.value1 instanceof Column) return best(v)(v1)(new Cons(v2.value0, v2.value1.value0(v1), v2.value2));
								if (v2.value1 instanceof Columns) return best(v)(v1)(new Cons(v2.value0, v2.value1.value0(new Just(w)), v2.value2));
								if (v2.value1 instanceof Nesting) return best(v)(v1)(new Cons(v2.value0, v2.value1.value0(v2.value0), v2.value2));
								throw new Error("Failed pattern match at Text.PrettyPrint.Leijen (line 788, column 11 - line 802, column 56): " + [v2.value1.constructor.name]);
							}
							throw new Error("Failed pattern match at Text.PrettyPrint.Leijen (line 785, column 7 - line 785, column 50): " + [
								v.constructor.name,
								v1.constructor.name,
								v2.constructor.name
							]);
						};
					};
				};
				return forceSimpleDoc(best(0)(0)(new Cons(0, headNode, Nil.value)));
			};
		};
	};
};
var foldr1 = function(dictMonoid) {
	var mempty = mempty$6(dictMonoid);
	return function(f) {
		return function($297) {
			return (function(v) {
				if (v instanceof Nothing) return mempty;
				if (v instanceof Just) return foldr$1(f)(v.value0.last)(v.value0.init);
				throw new Error("Failed pattern match at Text.PrettyPrint.Leijen (line 122, column 29 - line 124, column 43): " + [v.constructor.name]);
			})(unsnoc($297));
		};
	};
};
var flatten = function(v) {
	if (v instanceof FlatAlt) return v.value1;
	if (v instanceof Cat) return new Cat(flatten(v.value0), flatten(v.value1));
	if (v instanceof Nest) return new Nest(v.value0, flatten(v.value1));
	if (v instanceof Line) return Fail.value;
	if (v instanceof Union) return flatten(v.value0);
	if (v instanceof Column) return new Column(function($298) {
		return flatten(v.value0($298));
	});
	if (v instanceof Columns) return new Columns(function($299) {
		return flatten(v.value0($299));
	});
	if (v instanceof Nesting) return new Nesting(function($300) {
		return flatten(v.value0($300));
	});
	return v;
};
var group = function(x) {
	return new Union(flatten(x), x);
};
var softline = /* #__PURE__ */ group(line);
var fits1 = function($copy_v) {
	return function($copy_v1) {
		return function($copy_v2) {
			return function($copy_v3) {
				var $tco_var_v = $copy_v;
				var $tco_var_v1 = $copy_v1;
				var $tco_var_v2 = $copy_v2;
				var $tco_done = false;
				var $tco_result;
				function $tco_loop(v, v1, v2, v3) {
					if (v2 < 0) {
						$tco_done = true;
						return false;
					}
					if (v3 instanceof SFail$prime) {
						$tco_done = true;
						return false;
					}
					if (v3 instanceof SEmpty$prime) {
						$tco_done = true;
						return true;
					}
					if (v3 instanceof SChar$prime) {
						$tco_var_v = v;
						$tco_var_v1 = v1;
						$tco_var_v2 = v2 - 1 | 0;
						$copy_v3 = force(v3.value1);
						return;
					}
					if (v3 instanceof SText$prime) {
						$tco_var_v = v;
						$tco_var_v1 = v1;
						$tco_var_v2 = v2 - v3.value0 | 0;
						$copy_v3 = force(v3.value2);
						return;
					}
					if (v3 instanceof SLine$prime) {
						$tco_done = true;
						return true;
					}
					throw new Error("Failed pattern match at Text.PrettyPrint.Leijen (line 819, column 1 - line 819, column 55): " + [
						v.constructor.name,
						v1.constructor.name,
						v2.constructor.name,
						v3.constructor.name
					]);
				}
				while (!$tco_done) $tco_result = $tco_loop($tco_var_v, $tco_var_v1, $tco_var_v2, $copy_v3);
				return $tco_result;
			};
		};
	};
};
var renderPretty = /* #__PURE__ */ renderFits(fits1);
var empty = /* #__PURE__ */ (function() {
	return Empty.value;
})();
var linebreak = /* #__PURE__ */ (function() {
	return new FlatAlt(Line.value, empty);
})();
var displayS = function(v) {
	if (v instanceof SFail) return unsafeCrashWith("@SFail@ can not appear uncaught in a rendered @SimpleDoc@");
	if (v instanceof SEmpty) return "";
	if (v instanceof SChar) return fromCharArray([v.value0]) + displayS(v.value1);
	if (v instanceof SText) return v.value1 + displayS(v.value2);
	if (v instanceof SLine) return "\n" + (indentation(v.value0) + displayS(v.value1));
	throw new Error("Failed pattern match at Text.PrettyPrint.Leijen (line 893, column 1 - line 893, column 32): " + [v.constructor.name]);
};
var column = function(f) {
	return new Column(f);
};
var $$char = function(v) {
	if (v === "\n") return line;
	return new Char(v);
};
var beside = function(x) {
	return function(y) {
		return new Cat(x, y);
	};
};
var docSemigroup = { append: beside };
var append1$5 = /* #__PURE__ */ append$7(docSemigroup);
var docMonoid = {
	mempty: empty,
	Semigroup0: function() {
		return docSemigroup;
	}
};
var foldr11 = /* #__PURE__ */ foldr1(docMonoid);
var string = /* #__PURE__ */ (function() {
	var $303 = intercalate(foldableArray)(docMonoid)(line);
	var $304 = map$20(functorArray)(text);
	var $305 = split$1("\n");
	return function($306) {
		return $303($304($305($306)));
	};
})();
var enclose = function(l) {
	return function(r) {
		return function(x) {
			return append1$5(l)(append1$5(x)(r));
		};
	};
};
var brackets = /* #__PURE__ */ enclose(lbracket)(rbracket);
var parens = /* #__PURE__ */ enclose(lparen)(rparen);
var width = function(d) {
	return function(f) {
		return column(function(k1) {
			return append1$5(d)(column(function(k2) {
				return f(k2 - k1 | 0);
			}));
		});
	};
};
var fillBreak = function(f) {
	return function(x) {
		return width(x)(function(w) {
			if (w > f) return nest(f)(linebreak);
			return text(spaces(f - w | 0));
		});
	};
};
var appendWithSpace = function(x) {
	return function(y) {
		return append1$5(x)(append1$5(space)(y));
	};
};
var hsep = /* #__PURE__ */ foldr11(appendWithSpace);
var appendWithSoftline = function(x) {
	return function(y) {
		return append1$5(x)(append1$5(softline)(y));
	};
};
var appendWithLinebreak = function(x) {
	return function(y) {
		return append1$5(x)(append1$5(linebreak)(y));
	};
};
var vcat = /* #__PURE__ */ foldr11(appendWithLinebreak);
var appendWithLine = function(x) {
	return function(y) {
		return append1$5(x)(append1$5(line)(y));
	};
};
var align = function(d) {
	return column(function(k) {
		return nesting(function(i) {
			return nest(k - i | 0)(d);
		});
	});
};
var hang = function(i) {
	return function(d) {
		return align(nest(i)(d));
	};
};
var indent = function(i) {
	return function(d) {
		return hang(i)(append1$5(text(spaces(i)))(d));
	};
};
//#endregion
//#region output/Options.Applicative.Help.Chunk/index.js
var un$7 = /* #__PURE__ */ un$8();
var foldr = /* #__PURE__ */ foldr$5(foldableArray);
var mempty$5 = /* #__PURE__ */ mempty$6(docMonoid);
var fold$4 = /* #__PURE__ */ fold$6(foldableArray);
var mapFlipped$3 = /* #__PURE__ */ mapFlipped$4(functorArray);
var Chunk = function(x) {
	return x;
};
var chunked = function(v) {
	return function(v1) {
		return function(v2) {
			if (v1 instanceof Nothing) return v2;
			if (v2 instanceof Nothing) return v1;
			if (v1 instanceof Just && v2 instanceof Just) return new Just(v(v1.value0)(v2.value0));
			throw new Error("Failed pattern match at Options.Applicative.Help.Chunk (line 57, column 1 - line 58, column 41): " + [
				v.constructor.name,
				v1.constructor.name,
				v2.constructor.name
			]);
		};
	};
};
var chunkSemigroup = function(dictSemigroup) {
	return { append: chunked(append$7(dictSemigroup)) };
};
var extractChunk$2 = function(dictMonoid) {
	var $56 = fromMaybe(mempty$6(dictMonoid));
	var $57 = un$7(Chunk);
	return function($58) {
		return $56($57($58));
	};
};
var isEmpty = /* #__PURE__ */ (function() {
	var $59 = un$7(Chunk);
	return function($60) {
		return isNothing($59($60));
	};
})();
var chunkMonoid$2 = function(dictSemigroup) {
	var chunkSemigroup1 = chunkSemigroup(dictSemigroup);
	return {
		mempty: Nothing.value,
		Semigroup0: function() {
			return chunkSemigroup1;
		}
	};
};
var mempty1$3 = /* #__PURE__ */ mempty$6(/* #__PURE__ */ chunkMonoid$2(docSemigroup));
var vcatChunks = /* #__PURE__ */ foldr(/* #__PURE__ */ chunked(appendWithLine))(mempty1$3);
var vsepChunks = /* #__PURE__ */ foldr(/* #__PURE__ */ chunked(function(x) {
	return function(y) {
		return appendWithLine(x)(appendWithLine(mempty$5)(y));
	};
}))(mempty1$3);
var chunkFunctor = functorMaybe;
var chunkBesideOrBelow = /* #__PURE__ */ chunked(appendWithSoftline);
var chunkBeside = /* #__PURE__ */ chunked(appendWithSpace);
var chunkApply = applyMaybe;
var chunkApplicative = applicativeMaybe;
var pure$15 = /* #__PURE__ */ pure$18(chunkApplicative);
var listToChunk$1 = function(dictMonoid) {
	var mempty2 = mempty$6(chunkMonoid$2(dictMonoid.Semigroup0()));
	var fold1 = fold$4(dictMonoid);
	return function(v) {
		if (v.length === 0) return mempty2;
		return pure$15(fold1(v));
	};
};
var stringChunk = function(v) {
	if (v === "") return mempty1$3;
	return pure$15(text(v));
};
var paragraph = /* #__PURE__ */ (function() {
	var $61 = foldr((function() {
		var $63 = chunked(appendWithSoftline);
		return function($64) {
			return $63(stringChunk($64));
		};
	})())(mempty1$3);
	return function($62) {
		return $61(words($62));
	};
})();
var tabulate$prime = function(v) {
	return function(v1) {
		if (v1.length === 0) return mempty1$3;
		return pure$15(vcat(mapFlipped$3(v1)(function(v2) {
			return indent(2)(appendWithSpace(fillBreak(v)(v2.value0))(v2.value1));
		})));
	};
};
var tabulate$1 = /* #__PURE__ */ tabulate$prime(24);
//#endregion
//#region output/Options.Applicative.Help.Types/index.js
var helpBodyIsSymbol = { reflectSymbol: function() {
	return "helpBody";
} };
var helpErrorIsSymbol = { reflectSymbol: function() {
	return "helpError";
} };
var helpFooterIsSymbol = { reflectSymbol: function() {
	return "helpFooter";
} };
var helpHeaderIsSymbol = { reflectSymbol: function() {
	return "helpHeader";
} };
var helpSuggestionsIsSymbol = { reflectSymbol: function() {
	return "helpSuggestions";
} };
var helpUsageIsSymbol = { reflectSymbol: function() {
	return "helpUsage";
} };
var chunkMonoid$1 = /* #__PURE__ */ chunkMonoid$2(docSemigroup);
var extractChunk$1 = /* #__PURE__ */ extractChunk$2(docMonoid);
var ParserHelp = function(x) {
	return x;
};
var parserHelpMonoid = /* #__PURE__ */ monoidRecord()(/* #__PURE__ */ monoidRecordCons(helpBodyIsSymbol)(chunkMonoid$1)()(/* #__PURE__ */ monoidRecordCons(helpErrorIsSymbol)(chunkMonoid$1)()(/* #__PURE__ */ monoidRecordCons(helpFooterIsSymbol)(chunkMonoid$1)()(/* #__PURE__ */ monoidRecordCons(helpHeaderIsSymbol)(chunkMonoid$1)()(/* #__PURE__ */ monoidRecordCons(helpSuggestionsIsSymbol)(chunkMonoid$1)()(/* #__PURE__ */ monoidRecordCons(helpUsageIsSymbol)(chunkMonoid$1)()(monoidRecordNil)))))));
var helpText = function(v) {
	return extractChunk$1(vsepChunks([
		v.helpError,
		v.helpSuggestions,
		v.helpHeader,
		v.helpUsage,
		v.helpBody,
		v.helpFooter
	]));
};
var renderHelp = function(cols) {
	var $65 = renderPretty(1)(cols);
	return function($66) {
		return displayS($65(helpText($66)));
	};
};
//#endregion
//#region output/Options.Applicative.Types/index.js
var monadExceptT = /* #__PURE__ */ monadExceptT$1(monadIdentity);
var map$11 = /* #__PURE__ */ map$20(/* #__PURE__ */ functorReaderT(/* #__PURE__ */ functorExceptT(functorIdentity)));
var apply$6 = /* #__PURE__ */ apply$8(/* #__PURE__ */ applyReaderT(/* #__PURE__ */ applyExceptT(monadIdentity)));
var bind$12 = /* #__PURE__ */ bind$15(/* #__PURE__ */ bindReaderT(/* #__PURE__ */ bindExceptT(monadIdentity)));
var un$6 = /* #__PURE__ */ un$8();
var map1$5 = /* #__PURE__ */ map$20(functorMaybe);
var compare$1 = /* #__PURE__ */ compare$2(ordChar);
var compare1 = /* #__PURE__ */ compare$2(ordString);
var apply1$2 = /* #__PURE__ */ apply$8(applyEffect);
var map2$3 = /* #__PURE__ */ map$20(functorEffect);
var append1$4 = /* #__PURE__ */ append$7(semigroupArray);
var pure$14 = /* #__PURE__ */ pure$18(applicativeEffect);
var over$4 = /* #__PURE__ */ over$5()();
var map3$2 = /* #__PURE__ */ map$20(freeFunctor);
var bimap = /* #__PURE__ */ bimap$1(bifunctorStep);
var ParserFailure = function(x) {
	return x;
};
var Internal = /* #__PURE__ */ (function() {
	function Internal() {}
	Internal.value = new Internal();
	return Internal;
})();
var Hidden = /* #__PURE__ */ (function() {
	function Hidden() {}
	Hidden.value = new Hidden();
	return Hidden;
})();
var Visible = /* #__PURE__ */ (function() {
	function Visible() {}
	Visible.value = new Visible();
	return Visible;
})();
var Leaf = /* #__PURE__ */ (function() {
	function Leaf(value0) {
		this.value0 = value0;
	}
	Leaf.create = function(value0) {
		return new Leaf(value0);
	};
	return Leaf;
})();
var MultNode = /* #__PURE__ */ (function() {
	function MultNode(value0) {
		this.value0 = value0;
	}
	MultNode.create = function(value0) {
		return new MultNode(value0);
	};
	return MultNode;
})();
var AltNode = /* #__PURE__ */ (function() {
	function AltNode(value0) {
		this.value0 = value0;
	}
	AltNode.create = function(value0) {
		return new AltNode(value0);
	};
	return AltNode;
})();
var OptProperties = function(x) {
	return x;
};
var OptShort = /* #__PURE__ */ (function() {
	function OptShort(value0) {
		this.value0 = value0;
	}
	OptShort.create = function(value0) {
		return new OptShort(value0);
	};
	return OptShort;
})();
var OptLong = /* #__PURE__ */ (function() {
	function OptLong(value0) {
		this.value0 = value0;
	}
	OptLong.create = function(value0) {
		return new OptLong(value0);
	};
	return OptLong;
})();
var OptHelpInfo = function(x) {
	return x;
};
var CmdStart = /* #__PURE__ */ (function() {
	function CmdStart() {}
	CmdStart.value = new CmdStart();
	return CmdStart;
})();
var CmdCont = /* #__PURE__ */ (function() {
	function CmdCont() {}
	CmdCont.value = new CmdCont();
	return CmdCont;
})();
var Success = /* #__PURE__ */ (function() {
	function Success(value0) {
		this.value0 = value0;
	}
	Success.create = function(value0) {
		return new Success(value0);
	};
	return Success;
})();
var Failure = /* #__PURE__ */ (function() {
	function Failure(value0) {
		this.value0 = value0;
	}
	Failure.create = function(value0) {
		return new Failure(value0);
	};
	return Failure;
})();
var CompletionInvoked = /* #__PURE__ */ (function() {
	function CompletionInvoked(value0) {
		this.value0 = value0;
	}
	CompletionInvoked.create = function(value0) {
		return new CompletionInvoked(value0);
	};
	return CompletionInvoked;
})();
var Completer = function(x) {
	return x;
};
var Backtrack = /* #__PURE__ */ (function() {
	function Backtrack() {}
	Backtrack.value = new Backtrack();
	return Backtrack;
})();
var NoBacktrack = /* #__PURE__ */ (function() {
	function NoBacktrack() {}
	NoBacktrack.value = new NoBacktrack();
	return NoBacktrack;
})();
var SubparserInline = /* #__PURE__ */ (function() {
	function SubparserInline() {}
	SubparserInline.value = new SubparserInline();
	return SubparserInline;
})();
var ParserPrefs = function(x) {
	return x;
};
var Intersperse = /* #__PURE__ */ (function() {
	function Intersperse() {}
	Intersperse.value = new Intersperse();
	return Intersperse;
})();
var NoIntersperse = /* #__PURE__ */ (function() {
	function NoIntersperse() {}
	NoIntersperse.value = new NoIntersperse();
	return NoIntersperse;
})();
var AllPositionals = /* #__PURE__ */ (function() {
	function AllPositionals() {}
	AllPositionals.value = new AllPositionals();
	return AllPositionals;
})();
var ForwardOptions = /* #__PURE__ */ (function() {
	function ForwardOptions() {}
	ForwardOptions.value = new ForwardOptions();
	return ForwardOptions;
})();
var ParserInfo = function(x) {
	return x;
};
var NilP = /* #__PURE__ */ (function() {
	function NilP(value0) {
		this.value0 = value0;
	}
	NilP.create = function(value0) {
		return new NilP(value0);
	};
	return NilP;
})();
var OptP = /* #__PURE__ */ (function() {
	function OptP(value0) {
		this.value0 = value0;
	}
	OptP.create = function(value0) {
		return new OptP(value0);
	};
	return OptP;
})();
var MultP = /* #__PURE__ */ (function() {
	function MultP(value0) {
		this.value0 = value0;
	}
	MultP.create = function(value0) {
		return new MultP(value0);
	};
	return MultP;
})();
var AltP = /* #__PURE__ */ (function() {
	function AltP(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	AltP.create = function(value0) {
		return function(value1) {
			return new AltP(value0, value1);
		};
	};
	return AltP;
})();
var BindP = /* #__PURE__ */ (function() {
	function BindP(value0) {
		this.value0 = value0;
	}
	BindP.create = function(value0) {
		return new BindP(value0);
	};
	return BindP;
})();
var Option = function(x) {
	return x;
};
var OptReader = /* #__PURE__ */ (function() {
	function OptReader(value0, value1, value2) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
	}
	OptReader.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return new OptReader(value0, value1, value2);
			};
		};
	};
	return OptReader;
})();
var FlagReader = /* #__PURE__ */ (function() {
	function FlagReader(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	FlagReader.create = function(value0) {
		return function(value1) {
			return new FlagReader(value0, value1);
		};
	};
	return FlagReader;
})();
var ArgReader = /* #__PURE__ */ (function() {
	function ArgReader(value0) {
		this.value0 = value0;
	}
	ArgReader.create = function(value0) {
		return new ArgReader(value0);
	};
	return ArgReader;
})();
var CmdReader = /* #__PURE__ */ (function() {
	function CmdReader(value0, value1, value2) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
	}
	CmdReader.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return new CmdReader(value0, value1, value2);
			};
		};
	};
	return CmdReader;
})();
var CReader = function(x) {
	return x;
};
var ReadM = function(x) {
	return x;
};
var ErrorMsg = /* #__PURE__ */ (function() {
	function ErrorMsg(value0) {
		this.value0 = value0;
	}
	ErrorMsg.create = function(value0) {
		return new ErrorMsg(value0);
	};
	return ErrorMsg;
})();
var InfoMsg = /* #__PURE__ */ (function() {
	function InfoMsg(value0) {
		this.value0 = value0;
	}
	InfoMsg.create = function(value0) {
		return new InfoMsg(value0);
	};
	return InfoMsg;
})();
var ShowHelpText = /* #__PURE__ */ (function() {
	function ShowHelpText() {}
	ShowHelpText.value = new ShowHelpText();
	return ShowHelpText;
})();
var MissingError = /* #__PURE__ */ (function() {
	function MissingError(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	MissingError.create = function(value0) {
		return function(value1) {
			return new MissingError(value0, value1);
		};
	};
	return MissingError;
})();
var ExpectsArgError = /* #__PURE__ */ (function() {
	function ExpectsArgError(value0) {
		this.value0 = value0;
	}
	ExpectsArgError.create = function(value0) {
		return new ExpectsArgError(value0);
	};
	return ExpectsArgError;
})();
var UnexpectedError = /* #__PURE__ */ (function() {
	function UnexpectedError(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	UnexpectedError.create = function(value0) {
		return function(value1) {
			return new UnexpectedError(value0, value1);
		};
	};
	return UnexpectedError;
})();
var SomeParser = /* #__PURE__ */ (function() {
	function SomeParser(value0) {
		this.value0 = value0;
	}
	SomeParser.create = function(value0) {
		return new SomeParser(value0);
	};
	return SomeParser;
})();
var MultPE = /* #__PURE__ */ (function() {
	function MultPE(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	MultPE.create = function(value0) {
		return function(value1) {
			return new MultPE(value0, value1);
		};
	};
	return MultPE;
})();
var Context = /* #__PURE__ */ (function() {
	function Context(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Context.create = function(value0) {
		return function(value1) {
			return new Context(value0, value1);
		};
	};
	return Context;
})();
var ParserM = function(x) {
	return x;
};
var readerAsk = /* #__PURE__ */ ask(/* #__PURE__ */ monadAskReaderT(monadExceptT));
var readerAbort = /* #__PURE__ */ (function() {
	var $478 = lift$7(monadTransReaderT)(monadExceptT);
	var $479 = throwError$1(monadThrowExceptT(monadIdentity));
	return function($480) {
		return ReadM($478($479($480)));
	};
})();
var readerError = function($481) {
	return readerAbort(ErrorMsg.create($481));
};
var readMFunctor = { map: function(f) {
	return function(v) {
		return map$11(f)(v);
	};
} };
var map4 = /* #__PURE__ */ map$20(readMFunctor);
var readMApply = {
	apply: function(v) {
		return function(v1) {
			return apply$6(v)(v1);
		};
	},
	Functor0: function() {
		return readMFunctor;
	}
};
var readMBind = {
	bind: function(v) {
		return function(f) {
			return bind$12(v)((function() {
				var $482 = un$6(ReadM);
				return function($483) {
					return $482(f($483));
				};
			})());
		};
	},
	Apply0: function() {
		return readMApply;
	}
};
var readMApplicative = {
	pure: /* #__PURE__ */ (function() {
		var $484 = pure$18(applicativeReaderT(applicativeExceptT(monadIdentity)));
		return function($485) {
			return ReadM($484($485));
		};
	})(),
	Apply0: function() {
		return readMApply;
	}
};
var tailRecM = /* #__PURE__ */ tailRecM$1(freeMonadRec);
var bind1$4 = /* #__PURE__ */ bind$15(freeBind);
var pure1$5 = /* #__PURE__ */ pure$18(freeApplicative);
var parseErrorSemigroup = { append: function(v) {
	return function(m) {
		return m;
	};
} };
var optVisibilityEq = { eq: function(x) {
	return function(y) {
		if (x instanceof Internal && y instanceof Internal) return true;
		if (x instanceof Hidden && y instanceof Hidden) return true;
		if (x instanceof Visible && y instanceof Visible) return true;
		return false;
	};
} };
var optVisibilityOrd = {
	compare: function(x) {
		return function(y) {
			if (x instanceof Internal && y instanceof Internal) return EQ.value;
			if (x instanceof Internal) return LT.value;
			if (y instanceof Internal) return GT.value;
			if (x instanceof Hidden && y instanceof Hidden) return EQ.value;
			if (x instanceof Hidden) return LT.value;
			if (y instanceof Hidden) return GT.value;
			if (x instanceof Visible && y instanceof Visible) return EQ.value;
			throw new Error("Failed pattern match at Options.Applicative.Types (line 0, column 0 - line 0, column 0): " + [x.constructor.name, y.constructor.name]);
		};
	},
	Eq0: function() {
		return optVisibilityEq;
	}
};
var optShowDefault = /* #__PURE__ */ (function() {
	var $486 = un$6(OptProperties);
	var $487 = un$6(Option);
	return function($488) {
		return (function(v) {
			return v.propShowDefault;
		})($486((function(v) {
			return v.optProps;
		})($487($488))));
	};
})();
var optVisibility = /* #__PURE__ */ (function() {
	var $489 = un$6(OptProperties);
	var $490 = un$6(Option);
	return function($491) {
		return (function(v) {
			return v.propVisibility;
		})($489((function(v) {
			return v.optProps;
		})($490($491))));
	};
})();
var optNameEq = { eq: function(x) {
	return function(y) {
		if (x instanceof OptShort && y instanceof OptShort) return x.value0 === y.value0;
		if (x instanceof OptLong && y instanceof OptLong) return x.value0 === y.value0;
		return false;
	};
} };
var optNameOrd = {
	compare: function(x) {
		return function(y) {
			if (x instanceof OptShort && y instanceof OptShort) return compare$1(x.value0)(y.value0);
			if (x instanceof OptShort) return LT.value;
			if (y instanceof OptShort) return GT.value;
			if (x instanceof OptLong && y instanceof OptLong) return compare1(x.value0)(y.value0);
			throw new Error("Failed pattern match at Options.Applicative.Types (line 0, column 0 - line 0, column 0): " + [x.constructor.name, y.constructor.name]);
		};
	},
	Eq0: function() {
		return optNameEq;
	}
};
var optMetaVar = /* #__PURE__ */ (function() {
	var $492 = un$6(OptProperties);
	var $493 = un$6(Option);
	return function($494) {
		return (function(v) {
			return v.propMetaVar;
		})($492((function(v) {
			return v.optProps;
		})($493($494))));
	};
})();
var optHelp = /* #__PURE__ */ (function() {
	var $495 = un$6(OptProperties);
	var $496 = un$6(Option);
	return function($497) {
		return (function(v) {
			return v.propHelp;
		})($495((function(v) {
			return v.optProps;
		})($496($497))));
	};
})();
var optDescMod = /* #__PURE__ */ (function() {
	var $498 = un$6(OptProperties);
	var $499 = un$6(Option);
	return function($500) {
		return (function(v) {
			return v.propDescMod;
		})($498((function(v) {
			return v.optProps;
		})($499($500))));
	};
})();
var oneM = function($501) {
	return ParserM(liftF($501));
};
var fromM = function(v) {
	return new BindP(v);
};
var completerSemigroup = { append: function(v) {
	return function(v1) {
		return function(s) {
			return apply1$2(map2$3(append1$4)(v(s)))(v1(s));
		};
	};
} };
var completerMonoid = {
	mempty: function(v) {
		return pure$14([]);
	},
	Semigroup0: function() {
		return completerSemigroup;
	}
};
var map8 = /* #__PURE__ */ map$20({ map: function(f) {
	return over$4(CReader)(function(r) {
		return {
			crCompleter: r.crCompleter,
			crReader: map4(f)(r.crReader)
		};
	});
} });
var parserInfoFunctor = { map: function(f) {
	return over$4(ParserInfo)(function(i) {
		return {
			infoFailureCode: i.infoFailureCode,
			infoFooter: i.infoFooter,
			infoFullDesc: i.infoFullDesc,
			infoHeader: i.infoHeader,
			infoPolicy: i.infoPolicy,
			infoProgDesc: i.infoProgDesc,
			infoParser: map$20(parserFunctor)(f)(i.infoParser)
		};
	});
} };
var parserFunctor = { map: function(v) {
	return function(v1) {
		if (v1 instanceof NilP) return new NilP(v(v1.value0));
		if (v1 instanceof OptP) return new OptP(map$20(optionFunctor)(v)(v1.value0));
		if (v1 instanceof MultP) return runExists(function(v2) {
			return new MultP(mkExists(new MultPE(map$20(parserFunctor)(function(v3) {
				return function($502) {
					return v(v3($502));
				};
			})(v2.value0), v2.value1)));
		})(v1.value0);
		if (v1 instanceof AltP) return new AltP(map$20(parserFunctor)(v)(v1.value0), map$20(parserFunctor)(v)(v1.value1));
		if (v1 instanceof BindP) return new BindP(map3$2(v)(v1.value0));
		throw new Error("Failed pattern match at Options.Applicative.Types (line 317, column 1 - line 322, column 36): " + [v.constructor.name, v1.constructor.name]);
	};
} };
var optionFunctor = { map: function(f) {
	return over$4(Option)(function(o) {
		return {
			optProps: o.optProps,
			optMain: map$20(optReaderFunctor)(f)(o.optMain)
		};
	});
} };
var optReaderFunctor = { map: function(v) {
	return function(v1) {
		if (v1 instanceof OptReader) return new OptReader(v1.value0, map8(v)(v1.value1), v1.value2);
		if (v1 instanceof FlagReader) return new FlagReader(v1.value0, v(v1.value1));
		if (v1 instanceof ArgReader) return new ArgReader(map8(v)(v1.value0));
		if (v1 instanceof CmdReader) return new CmdReader(v1.value0, v1.value1, (function() {
			var $503 = map1$5(map$20(parserInfoFunctor)(v));
			return function($504) {
				return $503(v1.value2($504));
			};
		})());
		throw new Error("Failed pattern match at Options.Applicative.Types (line 264, column 1 - line 268, column 68): " + [v.constructor.name, v1.constructor.name]);
	};
} };
var map9 = /* #__PURE__ */ map$20(parserFunctor);
var parserAlt = /* #__PURE__ */ (function() {
	return {
		alt: AltP.create,
		Functor0: function() {
			return parserFunctor;
		}
	};
})();
var alt1$2 = /* #__PURE__ */ alt$6(parserAlt);
var parserApply = {
	apply: function(a) {
		return function(b) {
			return new MultP(mkExists(new MultPE(a, b)));
		};
	},
	Functor0: function() {
		return parserFunctor;
	}
};
var parserApplicative = /* #__PURE__ */ (function() {
	return {
		pure: NilP.create,
		Apply0: function() {
			return parserApply;
		}
	};
})();
var pure2$3 = /* #__PURE__ */ pure$18(parserApplicative);
var manyM = function(p) {
	var go = function(acc) {
		return bind1$4(oneM(alt1$2(map9(Loop.create)(p))(pure2$3(new Done(void 0)))))(function(aa) {
			return pure1$5(bimap(function(v) {
				return new Cons$1(v, acc);
			})(function(v) {
				return reverse(acc);
			})(aa));
		});
	};
	return tailRecM(go)(Nil$1.value);
};
var many = function($505) {
	return fromM(manyM($505));
};
var argPolicyEq = { eq: function(x) {
	return function(y) {
		if (x instanceof Intersperse && y instanceof Intersperse) return true;
		if (x instanceof NoIntersperse && y instanceof NoIntersperse) return true;
		if (x instanceof AllPositionals && y instanceof AllPositionals) return true;
		if (x instanceof ForwardOptions && y instanceof ForwardOptions) return true;
		return false;
	};
} };
//#endregion
//#region output/Control.Monad.Except/index.js
var unwrap$5 = /* #__PURE__ */ unwrap$7();
var withExcept = /* #__PURE__ */ withExceptT(functorIdentity);
var runExcept$1 = function($3) {
	return unwrap$5(runExceptT($3));
};
//#endregion
//#region output/Control.Monad.Reader/index.js
var unwrap$4 = /* #__PURE__ */ unwrap$7();
var runReader = function(v) {
	return function($4) {
		return unwrap$4(v($4));
	};
};
//#endregion
//#region output/Options.Applicative.Internal/index.js
var $runtime_lazy$3 = function(name, moduleName, init) {
	var state = 0;
	var val;
	return function(lineNumber) {
		if (state === 2) return val;
		if (state === 1) throw new ReferenceError(name + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
		state = 1;
		val = init();
		state = 2;
		return val;
	};
};
var un$5 = /* #__PURE__ */ un$8();
var map$10 = /* #__PURE__ */ map$20(/* #__PURE__ */ functorExceptT(/* #__PURE__ */ functorStateT(/* #__PURE__ */ functorReaderT(functorIdentity))));
var monadReaderT = /* #__PURE__ */ monadReaderT$1(monadIdentity);
var monadStateT = /* #__PURE__ */ monadStateT$1(monadReaderT);
var apply$5 = /* #__PURE__ */ apply$8(/* #__PURE__ */ applyExceptT(monadStateT));
var bind$11 = /* #__PURE__ */ bind$15(/* #__PURE__ */ bindExceptT(monadStateT));
var pure$13 = /* #__PURE__ */ pure$18(/* #__PURE__ */ applicativeExceptT(monadStateT));
var altExceptT = /* #__PURE__ */ altExceptT$1(parseErrorSemigroup);
var alt$5 = /* #__PURE__ */ alt$6(/* #__PURE__ */ altExceptT(monadStateT));
var lift$6 = /* #__PURE__ */ lift$7(monadTransExceptT);
var lift1$2 = /* #__PURE__ */ lift$6(monadStateT);
var modify_ = /* #__PURE__ */ modify_$1(/* #__PURE__ */ monadStateStateT(monadReaderT));
var lift2$1 = /* #__PURE__ */ lift$7(monadTransStateT);
var throwError = /* #__PURE__ */ throwError$1(/* #__PURE__ */ monadThrowExceptT(monadStateT));
var map1$4 = /* #__PURE__ */ map$20(functorArray);
var pure1$4 = /* #__PURE__ */ pure$18(applicativeArray);
var discard$6 = /* #__PURE__ */ discard$7(discardUnit);
var identity$7 = /* #__PURE__ */ identity$15(categoryFn);
var TNil = /* #__PURE__ */ (function() {
	function TNil() {}
	TNil.value = new TNil();
	return TNil;
})();
var TCons = /* #__PURE__ */ (function() {
	function TCons(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	TCons.create = function(value0) {
		return function(value1) {
			return new TCons(value0, value1);
		};
	};
	return TCons;
})();
var P = function(x) {
	return x;
};
var ListT = function(x) {
	return x;
};
var NondetT = function(x) {
	return x;
};
var ComplParser = /* #__PURE__ */ (function() {
	function ComplParser(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	ComplParser.create = function(value0) {
		return function(value1) {
			return new ComplParser(value0, value1);
		};
	};
	return ComplParser;
})();
var ComplOption = /* #__PURE__ */ (function() {
	function ComplOption(value0) {
		this.value0 = value0;
	}
	ComplOption.create = function(value0) {
		return new ComplOption(value0);
	};
	return ComplOption;
})();
var ComplResult = /* #__PURE__ */ (function() {
	function ComplResult(value0) {
		this.value0 = value0;
	}
	ComplResult.create = function(value0) {
		return new ComplResult(value0);
	};
	return ComplResult;
})();
var Completion = function(x) {
	return x;
};
var withReadM = function(f) {
	var f$prime = function(v) {
		if (v instanceof ErrorMsg) return new ErrorMsg(f(v.value0));
		return v;
	};
	var $298 = mapReaderT(withExcept(f$prime));
	var $299 = un$5(ReadM);
	return function($300) {
		return ReadM($298($299($300)));
	};
};
var stepListT = function(v) {
	return v;
};
var runP = function(v) {
	return runReader(flip(runStateT)([])(runExceptT(v)));
};
var runNondetT = function(v) {
	return v;
};
var runListT = function(dictMonad) {
	var bind2 = bind$15(dictMonad.Bind1());
	var pure4 = pure$18(dictMonad.Applicative0());
	var liftM1$2 = liftM1(dictMonad);
	return function(xs) {
		return bind2(stepListT(xs))(function(s) {
			if (s instanceof TNil) return pure4(Nil$1.value);
			if (s instanceof TCons) return liftM1$2(Cons$1.create(s.value0))(runListT(dictMonad)(s.value1));
			throw new Error("Failed pattern match at Options.Applicative.Internal (line 200, column 3 - line 202, column 53): " + [s.constructor.name]);
		});
	};
};
var runCompletion = function(v) {
	return function(prefs) {
		var v1 = runReaderT(runExceptT(v))(prefs);
		if (v1 instanceof ComplResult) return Nothing.value;
		if (v1 instanceof ComplParser) return new Just(new Left(new Tuple(v1.value0, v1.value1)));
		if (v1 instanceof ComplOption) return new Just(new Right(v1.value0));
		throw new Error("Failed pattern match at Options.Applicative.Internal (line 170, column 38 - line 173, column 42): " + [v1.constructor.name]);
	};
};
var pFunctor = { map: function(f) {
	return function(v) {
		return map$10(f)(v);
	};
} };
var pApply = {
	apply: function(v) {
		return function(v1) {
			return apply$5(v)(v1);
		};
	},
	Functor0: function() {
		return pFunctor;
	}
};
var pBind = {
	bind: function(v) {
		return function(k) {
			return bind$11(v)(function(a) {
				return k(a);
			});
		};
	},
	Apply0: function() {
		return pApply;
	}
};
var pApplicative = {
	pure: function(a) {
		return pure$13(a);
	},
	Apply0: function() {
		return pApply;
	}
};
var pMonad = {
	Applicative0: function() {
		return pApplicative;
	},
	Bind1: function() {
		return pBind;
	}
};
var pAlt = {
	alt: function(v) {
		return function(v1) {
			return alt$5(v)(v1);
		};
	},
	Functor0: function() {
		return pFunctor;
	}
};
var missingArgP = function(dict) {
	return dict.missingArgP;
};
var getPrefs = function(dict) {
	return dict.getPrefs;
};
var exitP = function(dict) {
	return dict.exitP;
};
var exitContext = function(dict) {
	return dict.exitContext;
};
var errorP = function(dict) {
	return dict.errorP;
};
var hoistEither = function(dictMonadP) {
	return either(errorP(dictMonadP))(pure$18(dictMonadP.Monad0().Applicative0()));
};
var runReadM = function(dictMonadP) {
	var hoistEither1 = hoistEither(dictMonadP);
	return function(v) {
		return function(s) {
			return hoistEither1(runExcept$1(runReaderT(v)(s)));
		};
	};
};
var hoistMaybe = function(dictMonadP) {
	var errorP1 = errorP(dictMonadP);
	var pure4 = pure$18(dictMonadP.Monad0().Applicative0());
	return function(err) {
		return maybe(errorP1(err))(pure4);
	};
};
var pMonadP = {
	enterContext: function(name) {
		return function(pinfo) {
			return lift1$2(modify_(cons(new Context(name, mkExists(pinfo)))));
		};
	},
	exitContext: /* #__PURE__ */ lift1$2(/* #__PURE__ */ modify_(/* #__PURE__ */ drop$1(1))),
	getPrefs: /* #__PURE__ */ P(/* #__PURE__ */ lift1$2(/* #__PURE__ */ lift2$1(monadReaderT)(/* #__PURE__ */ ask(/* #__PURE__ */ monadAskReaderT(monadIdentity))))),
	missingArgP: function(e) {
		return function(v) {
			return errorP(pMonadP)(e);
		};
	},
	exitP: function(i) {
		return function(v) {
			return function(p) {
				var $301 = maybe(throwError(MissingError.create(i)(SomeParser.create(mkExists(p)))))(pure$13);
				return function($302) {
					return P($301($302));
				};
			};
		};
	},
	errorP: function($303) {
		return P(throwError($303));
	},
	Monad0: function() {
		return pMonad;
	},
	Alt1: function() {
		return pAlt;
	}
};
var enterContext = function(dict) {
	return dict.enterContext;
};
var contextNames = function(ns) {
	var go = function(v) {
		return v.value0;
	};
	return reverse$1(map1$4(go)(ns));
};
var complResultMonad = {
	Applicative0: function() {
		return complResultApplicative;
	},
	Bind1: function() {
		return complResultBind;
	}
};
var complResultBind = {
	bind: function(m) {
		return function(f) {
			if (m instanceof ComplResult) return f(m.value0);
			if (m instanceof ComplParser) return new ComplParser(m.value0, m.value1);
			if (m instanceof ComplOption) return new ComplOption(m.value0);
			throw new Error("Failed pattern match at Options.Applicative.Internal (line 134, column 14 - line 137, column 35): " + [m.constructor.name]);
		};
	},
	Apply0: function() {
		return $lazy_complResultApply(0);
	}
};
var complResultApplicative = /* #__PURE__ */ (function() {
	return {
		pure: ComplResult.create,
		Apply0: function() {
			return $lazy_complResultApply(0);
		}
	};
})();
var $lazy_complResultFunctor = /* #__PURE__ */ $runtime_lazy$3("complResultFunctor", "Options.Applicative.Internal", function() {
	return { map: liftM1(complResultMonad) };
});
var $lazy_complResultApply = /* #__PURE__ */ $runtime_lazy$3("complResultApply", "Options.Applicative.Internal", function() {
	return {
		apply: ap(complResultMonad),
		Functor0: function() {
			return $lazy_complResultFunctor(0);
		}
	};
});
var map2$2 = /* #__PURE__ */ map$20(/* #__PURE__ */ functorExceptT(/* #__PURE__ */ functorReaderT(/* @__PURE__ */ $lazy_complResultFunctor(124))));
var monadReaderT1 = /* #__PURE__ */ monadReaderT$1(complResultMonad);
var alt1$1 = /* #__PURE__ */ alt$6(/* #__PURE__ */ altExceptT(monadReaderT1));
var apply1$1 = /* #__PURE__ */ apply$8(/* #__PURE__ */ applyExceptT(monadReaderT1));
var pure2$2 = /* #__PURE__ */ pure$18(/* #__PURE__ */ applicativeExceptT(monadReaderT1));
var bind1$3 = /* #__PURE__ */ bind$15(/* #__PURE__ */ bindExceptT(monadReaderT1));
var lift3 = /* #__PURE__ */ lift$6(monadReaderT1);
var lift4 = /* #__PURE__ */ lift$7(monadTransReaderT)(complResultMonad);
var completionFunctor = { map: function(f) {
	return function(v) {
		return map2$2(f)(v);
	};
} };
var completionAlt = {
	alt: function(v) {
		return function(v1) {
			return alt1$1(v)(v1);
		};
	},
	Functor0: function() {
		return completionFunctor;
	}
};
var completionApply = {
	apply: function(v) {
		return function(v1) {
			return apply1$1(v)(v1);
		};
	},
	Functor0: function() {
		return completionFunctor;
	}
};
var completionApplicative = {
	pure: function(a) {
		return pure2$2(a);
	},
	Apply0: function() {
		return completionApply;
	}
};
var pure3 = /* #__PURE__ */ pure$18(completionApplicative);
var completionBind = {
	bind: function(v) {
		return function(k) {
			return bind1$3(v)(function(a) {
				return k(a);
			});
		};
	},
	Apply0: function() {
		return completionApply;
	}
};
var completionMonad = {
	Applicative0: function() {
		return completionApplicative;
	},
	Bind1: function() {
		return completionBind;
	}
};
var completionMonadP = {
	enterContext: function(v) {
		return function(v1) {
			return pure3(void 0);
		};
	},
	exitContext: /* #__PURE__ */ pure3(void 0),
	getPrefs: /* #__PURE__ */ lift3(/* #__PURE__ */ ask(/* #__PURE__ */ monadAskReaderT(complResultMonad))),
	missingArgP: function(v) {
		return function($304) {
			return Completion(lift3(lift4(ComplOption.create($304))));
		};
	},
	exitP: function(v) {
		return function(a) {
			return function(p) {
				return function(v1) {
					return Completion(lift3(lift4(new ComplParser(new SomeParser(mkExists(p)), a))));
				};
			};
		};
	},
	errorP: /* #__PURE__ */ (function() {
		var $305 = throwError$1(monadThrowExceptT(monadReaderT1));
		return function($306) {
			return Completion($305($306));
		};
	})(),
	Monad0: function() {
		return completionMonad;
	},
	Alt1: function() {
		return completionAlt;
	}
};
var bimapTStep = function(v) {
	return function(v1) {
		return function(v2) {
			if (v2 instanceof TNil) return TNil.value;
			if (v2 instanceof TCons) return new TCons(v(v2.value0), v1(v2.value1));
			throw new Error("Failed pattern match at Options.Applicative.Internal (line 186, column 1 - line 186, column 77): " + [
				v.constructor.name,
				v1.constructor.name,
				v2.constructor.name
			]);
		};
	};
};
var listTFunctor = function(dictMonad) {
	var liftM1$3 = liftM1(dictMonad);
	return { map: function(f) {
		return function(v) {
			return liftM1$3(bimapTStep(f)(map$20(listTFunctor(dictMonad))(f)))(stepListT(v));
		};
	} };
};
var listTAlt = function(dictMonad) {
	var bind2 = bind$15(dictMonad.Bind1());
	var pure4 = pure$18(dictMonad.Applicative0());
	var listTFunctor1 = listTFunctor(dictMonad);
	return {
		alt: function(xs) {
			return function(ys) {
				return bind2(stepListT(xs))(function(s) {
					if (s instanceof TNil) return stepListT(ys);
					if (s instanceof TCons) return pure4(new TCons(s.value0, alt$6(listTAlt(dictMonad))(s.value1)(ys)));
					throw new Error("Failed pattern match at Options.Applicative.Internal (line 227, column 5 - line 229, column 49): " + [s.constructor.name]);
				});
			};
		},
		Functor0: function() {
			return listTFunctor1;
		}
	};
};
var listTPlus = function(dictMonad) {
	var listTAlt1 = listTAlt(dictMonad);
	return {
		empty: pure$18(dictMonad.Applicative0())(TNil.value),
		Alt0: function() {
			return listTAlt1;
		}
	};
};
var hoistList = function(dictMonad) {
	var pure4 = pure$18(dictMonad.Applicative0());
	return foldr$4(function(x) {
		return function(xt) {
			return pure4(new TCons(x, xt));
		};
	})(empty$4(listTPlus(dictMonad)));
};
var lift5 = /* #__PURE__ */ lift$7({ lift: function(dictMonad) {
	var empty = empty$4(listTPlus(dictMonad));
	var $307 = liftM1(dictMonad)(function(v) {
		return new TCons(v, empty);
	});
	return function($308) {
		return ListT($307($308));
	};
} });
var cut = function(dictMonad) {
	return lift5(monadStateT$1(dictMonad))(put(monadStateStateT(dictMonad))(true));
};
var nondetTMonadTrans = { lift: function(dictMonad) {
	var $309 = lift5(monadStateT$1(dictMonad));
	var $310 = lift2$1(dictMonad);
	return function($311) {
		return NondetT($309($310($311)));
	};
} };
var listTMonad = function(dictMonad) {
	return {
		Applicative0: function() {
			return listTApplicative(dictMonad);
		},
		Bind1: function() {
			return listTBind(dictMonad);
		}
	};
};
var listTBind = function(dictMonad) {
	var bind2 = bind$15(dictMonad.Bind1());
	var pure4 = pure$18(dictMonad.Applicative0());
	var alt2 = alt$6(listTAlt(dictMonad));
	return {
		bind: function(xs) {
			return function(f) {
				return bind2(stepListT(xs))(function(s) {
					if (s instanceof TNil) return pure4(TNil.value);
					if (s instanceof TCons) return stepListT(alt2(f(s.value0))(bind$15(listTBind(dictMonad))(s.value1)(f)));
					throw new Error("Failed pattern match at Options.Applicative.Internal (line 218, column 5 - line 220, column 53): " + [s.constructor.name]);
				});
			};
		},
		Apply0: function() {
			return listTApply(dictMonad);
		}
	};
};
var listTApply = function(dictMonad) {
	var listTFunctor1 = listTFunctor(dictMonad);
	return {
		apply: ap(listTMonad(dictMonad)),
		Functor0: function() {
			return listTFunctor1;
		}
	};
};
var listTApplicative = function(dictMonad) {
	return {
		pure: (function() {
			var $312 = hoistList(dictMonad);
			return function($313) {
				return $312(pure1$4($313));
			};
		})(),
		Apply0: function() {
			return listTApply(dictMonad);
		}
	};
};
var listTAlternative = function(dictMonad) {
	var listTApplicative1 = listTApplicative(dictMonad);
	var listTPlus1 = listTPlus(dictMonad);
	return {
		Applicative0: function() {
			return listTApplicative1;
		},
		Plus1: function() {
			return listTPlus1;
		}
	};
};
var nondetTAltOp = function(dictMonad) {
	var monadStateT1 = monadStateT$1(dictMonad);
	var alt2 = alt$6(listTAlt(monadStateT1));
	var listTBind1 = listTBind(monadStateT1);
	var bind2 = bind$15(listTBind1);
	var lift6 = lift5(monadStateT1);
	var get$4 = get(monadStateStateT(dictMonad));
	var discard1 = discard$6(listTBind1);
	var guard = guard$2(listTAlternative(monadStateT1));
	return function(m1) {
		return function(m2) {
			return NondetT(alt2(runNondetT(m1))(bind2(lift6(get$4))(function(s) {
				return discard1(guard(!s))(function() {
					return runNondetT(m2);
				});
			})));
		};
	};
};
var nondetTFunctor = function(dictMonad) {
	var map3 = map$20(listTFunctor(monadStateT$1(dictMonad)));
	return { map: function(f) {
		var $314 = map3(f);
		return function($315) {
			return NondetT($314(runNondetT($315)));
		};
	} };
};
var nondetTAlt = function(dictMonad) {
	var alt2 = alt$6(listTAlt(monadStateT$1(dictMonad)));
	var nondetTFunctor1 = nondetTFunctor(dictMonad);
	return {
		alt: function(v) {
			return function(v1) {
				return alt2(v)(v1);
			};
		},
		Functor0: function() {
			return nondetTFunctor1;
		}
	};
};
var nondetTPlus = function(dictMonad) {
	var nondetTAlt1 = nondetTAlt(dictMonad);
	return {
		empty: empty$4(listTPlus(monadStateT$1(dictMonad))),
		Alt0: function() {
			return nondetTAlt1;
		}
	};
};
var nondetTApply = function(dictMonad) {
	var apply2 = apply$8(listTApply(monadStateT$1(dictMonad)));
	var nondetTFunctor1 = nondetTFunctor(dictMonad);
	return {
		apply: function(v) {
			return function(v1) {
				return apply2(v)(v1);
			};
		},
		Functor0: function() {
			return nondetTFunctor1;
		}
	};
};
var nondetTApplicative = function(dictMonad) {
	var nondetTApply1 = nondetTApply(dictMonad);
	return {
		pure: (function() {
			var $316 = pure$18(listTApplicative(monadStateT$1(dictMonad)));
			return function($317) {
				return NondetT($316($317));
			};
		})(),
		Apply0: function() {
			return nondetTApply1;
		}
	};
};
var nondetTBind = function(dictMonad) {
	var bind2 = bind$15(listTBind(monadStateT$1(dictMonad)));
	var nondetTApply1 = nondetTApply(dictMonad);
	return {
		bind: function(v) {
			return function(f) {
				return bind2(v)(function($318) {
					return runNondetT(f($318));
				});
			};
		},
		Apply0: function() {
			return nondetTApply1;
		}
	};
};
var takeListT = function(dictMonad) {
	var empty = empty$4(listTPlus(dictMonad));
	var liftM1$1 = liftM1(dictMonad);
	return function(v) {
		if (v === 0) return $$const(empty);
		var $319 = liftM1$1(bimapTStep(identity$7)(takeListT(dictMonad)(v - 1 | 0)));
		return function($320) {
			return ListT($319(stepListT($320)));
		};
	};
};
var disamb = function(dictMonad) {
	var Bind1 = dictMonad.Bind1();
	var bind2 = bind$15(Bind1);
	var evalStateT$1 = evalStateT(Bind1.Apply0().Functor0());
	var monadStateT1 = monadStateT$1(dictMonad);
	var runListT1 = runListT(monadStateT1);
	var takeListT1 = takeListT(monadStateT1);
	var pure4 = pure$18(dictMonad.Applicative0());
	return function(allow_amb) {
		return function(xs) {
			return bind2((function(v) {
				return evalStateT$1(v)(false);
			})(runListT1(takeListT1((function() {
				if (allow_amb) return 1;
				return 2;
			})())(runNondetT(xs)))))(function(xs$prime) {
				return pure4((function() {
					if (xs$prime instanceof Cons$1 && xs$prime.value1 instanceof Nil$1) return new Just(xs$prime.value0);
					return Nothing.value;
				})());
			});
		};
	};
};
//#endregion
//#region output/Options.Applicative.Common/index.js
var bind$10 = /* #__PURE__ */ bind$15(bindArray);
var fromFoldable$2 = /* #__PURE__ */ fromFoldable$5(foldableList);
var map$9 = /* #__PURE__ */ map$20(functorMaybe);
var voidRight$1 = /* #__PURE__ */ voidRight$2(functorMaybe);
var guard$1 = /* #__PURE__ */ guard$2(alternativeMaybe);
var any = /* #__PURE__ */ any$1(foldableArray)(heytingAlgebraBoolean);
var elem = /* #__PURE__ */ elem$1(foldableArray)(optNameEq);
var discard$5 = /* #__PURE__ */ discard$7(discardUnit);
var discard1 = /* #__PURE__ */ discard$5(bindMaybe);
var un$4 = /* #__PURE__ */ un$8();
var lift$5 = /* #__PURE__ */ lift$7(monadTransStateT);
var apply$4 = /* #__PURE__ */ apply$8(applyMaybe);
var alt$4 = /* #__PURE__ */ alt$6(altMaybe);
var bind1$2 = /* #__PURE__ */ bind$15(bindMaybe);
var apply1 = /* #__PURE__ */ apply$8(parserApply);
var oneOf = /* #__PURE__ */ oneOf$1(foldableArray);
var bind2$1 = /* #__PURE__ */ bind$15(freeBind);
var greaterThan = /* #__PURE__ */ greaterThan$1(optVisibilityOrd);
var lift1$1 = /* #__PURE__ */ lift$7(nondetTMonadTrans);
var pure$12 = /* #__PURE__ */ pure$18(parserApplicative);
var pure1$3 = /* #__PURE__ */ pure$18(applicativeMaybe);
var notEq1 = /* #__PURE__ */ notEq$1(argPolicyEq);
var OptWord = /* #__PURE__ */ (function() {
	function OptWord(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	OptWord.create = function(value0) {
		return function(value1) {
			return new OptWord(value0, value1);
		};
	};
	return OptWord;
})();
var unexpectedError = function(arg) {
	return function(p) {
		return new UnexpectedError(arg, new SomeParser(mkExists(p)));
	};
};
var simplify = function(v) {
	if (v instanceof Leaf) return new Leaf(v.value0);
	if (v instanceof MultNode) {
		var remove_mult = function(v1) {
			if (v1 instanceof MultNode) return v1.value0;
			return [v1];
		};
		var v1 = bind$10(v.value0)(function($340) {
			return remove_mult(simplify($340));
		});
		if (v1.length === 1) return v1[0];
		return new MultNode(v1);
	}
	if (v instanceof AltNode) {
		var remove_alt = function(v1) {
			if (v1 instanceof AltNode) return v1.value0;
			if (v1 instanceof MultNode && v1.value0.length === 0) return [];
			return [v1];
		};
		var v1 = bind$10(v.value0)(function($341) {
			return remove_alt(simplify($341));
		});
		if (v1.length === 0) return new MultNode([]);
		if (v1.length === 1) return v1[0];
		return new AltNode(v1);
	}
	throw new Error("Failed pattern match at Options.Applicative.Common (line 280, column 1 - line 280, column 45): " + [v.constructor.name]);
};
var showOption = function(v) {
	if (v instanceof OptLong) return "--" + v.value0;
	if (v instanceof OptShort) return fromCharArray(["-", v.value0]);
	throw new Error("Failed pattern match at Options.Applicative.Common (line 43, column 1 - line 43, column 32): " + [v.constructor.name]);
};
var parseWord = /* #__PURE__ */ (function() {
	var go = function(v) {
		if (v instanceof Cons$1 && v.value0 === "-" && v.value1 instanceof Cons$1 && v.value1.value0 === "-") return new Just((function() {
			var v1 = (function() {
				var v2 = span(function(v3) {
					return v3 !== "=";
				})(v.value1.value1);
				if (v2.rest instanceof Nil$1) return new Tuple(v.value1.value1, Nothing.value);
				if (v2.rest instanceof Cons$1) return new Tuple(v2.init, new Just(v2.rest.value1));
				throw new Error("Failed pattern match at Options.Applicative.Common (line 107, column 23 - line 109, column 70): " + [v2.constructor.name]);
			})();
			return new OptWord(new OptLong(fromCharArray(fromFoldable$2(v1.value0))), map$9(function($342) {
				return fromCharArray(fromFoldable$2($342));
			})(v1.value1));
		})());
		if (v instanceof Cons$1 && v.value0 === "-") {
			if (v.value1 instanceof Nil$1) return Nothing.value;
			if (v.value1 instanceof Cons$1) return new Just((function() {
				var arg = voidRight$1(v.value1.value1)(guard$1(!$$null$1(v.value1.value1)));
				return new OptWord(new OptShort(v.value1.value0), map$9(function($343) {
					return fromCharArray(fromFoldable$2($343));
				})(arg));
			})());
			throw new Error("Failed pattern match at Options.Applicative.Common (line 111, column 25 - line 115, column 79): " + [v.value1.constructor.name]);
		}
		return Nothing.value;
	};
	var $344 = fromFoldable$4(foldableArray);
	return function($345) {
		return go($344(toCharArray($345)));
	};
})();
var optionNames = function(v) {
	if (v instanceof OptReader) return v.value0;
	if (v instanceof FlagReader) return v.value0;
	return [];
};
var liftOpt = /* #__PURE__ */ (function() {
	return OptP.create;
})();
var isOptionPrefix = function(v) {
	return function(v1) {
		if (v instanceof OptShort && v1 instanceof OptShort) return v.value0 === v1.value0;
		if (v instanceof OptLong && v1 instanceof OptLong) return startsWith(v.value0)(v1.value0);
		return false;
	};
};
var optMatches = function(dictMonadP) {
	var Monad0 = dictMonadP.Monad0();
	var bindStateT$1 = bindStateT(Monad0);
	var bind3 = bind$15(bindStateT$1);
	var monadStateStateT$2 = monadStateStateT(Monad0);
	var get$2 = get(monadStateStateT$2);
	var missingArgP$1 = missingArgP(dictMonadP);
	var lift2 = lift$5(Monad0);
	var pure2 = pure$18(applicativeStateT(Monad0));
	var discard2 = discard$5(bindStateT$1);
	var put$2 = put(monadStateStateT$2);
	var runReadM$2 = runReadM(dictMonadP);
	return function(disambiguate) {
		return function(opt) {
			return function(v) {
				var is_short = function(v1) {
					if (v1 instanceof OptShort) return true;
					if (v1 instanceof OptLong) return false;
					throw new Error("Failed pattern match at Options.Applicative.Common (line 90, column 5 - line 90, column 33): " + [v1.constructor.name]);
				};
				var has_name = function(a) {
					if (disambiguate) return any(isOptionPrefix(a));
					return elem(a);
				};
				var errorFor = function(name) {
					return function(msg) {
						return "option " + (showOption(name) + (": " + msg));
					};
				};
				if (opt instanceof OptReader) return discard1(guard$1(has_name(v.value0)(opt.value0)))(function() {
					return new Just(bind3(get$2)(function(args) {
						var missing_arg = missingArgP$1(opt.value2(showOption(v.value0)))(un$4(CReader)(opt.value1).crCompleter);
						return bind3((function() {
							var v1 = maybe(args)(function(v2) {
								return new Cons$1(v2, args);
							})(v.value1);
							if (v1 instanceof Nil$1) return lift2(missing_arg);
							if (v1 instanceof Cons$1) return pure2(new Tuple(v1.value0, v1.value1));
							throw new Error("Failed pattern match at Options.Applicative.Common (line 68, column 27 - line 70, column 56): " + [v1.constructor.name]);
						})())(function(v1) {
							return discard2(put$2(v1.value1))(function() {
								return lift2(runReadM$2(withReadM(errorFor(v.value0))(un$4(CReader)(opt.value1).crReader))(v1.value0));
							});
						});
					}));
				});
				if (opt instanceof FlagReader) return discard1(guard$1(has_name(v.value0)(opt.value0)))(function() {
					return discard1(guard$1(is_short(v.value0) || isNothing(v.value1)))(function() {
						return new Just(bind3(get$2)(function(args) {
							var val$prime = map$9(function($346) {
								return (function(s) {
									return cons("-")(s);
								})(toCharArray($346));
							})(v.value1);
							return discard2(put$2(maybe(args)((function() {
								var $347 = flip(Cons$1.create)(args);
								return function($348) {
									return $347(fromCharArray($348));
								};
							})())(val$prime)))(function() {
								return pure2(opt.value1);
							});
						}));
					});
				});
				return Nothing.value;
			};
		};
	};
};
var isArg = function(v) {
	if (v instanceof ArgReader) return true;
	return false;
};
var evalParser = function(v) {
	if (v instanceof NilP) return new Just(v.value0);
	if (v instanceof OptP) return Nothing.value;
	if (v instanceof MultP) return runExists(function(v1) {
		return apply$4(evalParser(v1.value0))(evalParser(v1.value1));
	})(v.value0);
	if (v instanceof AltP) return alt$4(evalParser(v.value0))(evalParser(v.value1));
	if (v instanceof BindP) return resume$prime(function(p) {
		return function(k) {
			return bind1$2(evalParser(p))(function($349) {
				return evalParser(BindP.create(k($349)));
			});
		};
	})(Just.create)(v.value0);
	throw new Error("Failed pattern match at Options.Applicative.Common (line 220, column 1 - line 220, column 44): " + [v.constructor.name]);
};
var searchParser = function(dictMonad) {
	var nondetTPlus$1 = nondetTPlus(dictMonad);
	var empty = empty$4(nondetTPlus$1);
	var mapFlipped = mapFlipped$4(nondetTFunctor(dictMonad));
	var nondetTAltOp$1 = nondetTAltOp(dictMonad);
	var oneOf1 = oneOf(nondetTPlus$1);
	return function(v) {
		return function(v1) {
			if (v1 instanceof NilP) return empty;
			if (v1 instanceof OptP) return v(v1.value0);
			if (v1 instanceof MultP) return runExists(function(v2) {
				var b = mapFlipped(searchParser(dictMonad)(v)(v2.value1))(function(p2$prime) {
					return apply1(v2.value0)(p2$prime);
				});
				return nondetTAltOp$1(mapFlipped(searchParser(dictMonad)(v)(v2.value0))(function(p1$prime) {
					return apply1(p1$prime)(v2.value1);
				}))(b);
			})(v1.value0);
			if (v1 instanceof AltP) return oneOf1([searchParser(dictMonad)(v)(v1.value0), searchParser(dictMonad)(v)(v1.value1)]);
			if (v1 instanceof BindP) return resume$prime(function(p) {
				return function(k) {
					return oneOf1([mapFlipped(searchParser(dictMonad)(v)(p))(function(p$prime) {
						return new BindP(bind2$1(liftF(p$prime))(k));
					}), (function() {
						var v2 = evalParser(p);
						if (v2 instanceof Nothing) return empty;
						if (v2 instanceof Just) return searchParser(dictMonad)(v)(new BindP(k(v2.value0)));
						throw new Error("Failed pattern match at Options.Applicative.Common (line 135, column 7 - line 137, column 49): " + [v2.constructor.name]);
					})()]);
				};
			})($$const(empty))(v1.value0);
			throw new Error("Failed pattern match at Options.Applicative.Common (line 118, column 1 - line 120, column 49): " + [v.constructor.name, v1.constructor.name]);
		};
	};
};
var searchOpt = function(dictMonadP) {
	var monadStateT = monadStateT$1(dictMonadP.Monad0());
	var searchParser1 = searchParser(monadStateT);
	var optMatches1 = optMatches(dictMonadP);
	var lift2 = lift1$1(monadStateT);
	var map1 = map$20(functorStateT(dictMonadP.Alt1().Functor0()));
	var empty = empty$4(nondetTPlus(monadStateT));
	return function(pprefs) {
		return function(w) {
			return searchParser1(function(opt) {
				var v = optMatches1(un$4(ParserPrefs)(pprefs).prefDisambiguate && greaterThan(optVisibility(opt))(Internal.value))(un$4(Option)(opt).optMain)(w);
				if (v instanceof Just) return lift2(map1(pure$12)(v.value0));
				if (v instanceof Nothing) return empty;
				throw new Error("Failed pattern match at Options.Applicative.Common (line 144, column 3 - line 146, column 21): " + [v.constructor.name]);
			});
		};
	};
};
var stepParser = function(dictMonadP) {
	var alt1 = alt$6(nondetTAlt(monadStateT$1(dictMonadP.Monad0())));
	var searchOpt1 = searchOpt(dictMonadP);
	return function(v) {
		return function(v1) {
			return function(v2) {
				return function(v3) {
					if (v1 instanceof AllPositionals) return searchArg(dictMonadP)(v)(v2)(v3);
					if (v1 instanceof ForwardOptions) {
						var v4 = parseWord(v2);
						if (v4 instanceof Just) return alt1(searchOpt1(v)(v4.value0)(v3))(searchArg(dictMonadP)(v)(v2)(v3));
						if (v4 instanceof Nothing) return searchArg(dictMonadP)(v)(v2)(v3);
						throw new Error("Failed pattern match at Options.Applicative.Common (line 174, column 42 - line 176, column 36): " + [v4.constructor.name]);
					}
					var v4 = parseWord(v2);
					if (v4 instanceof Just) return searchOpt1(v)(v4.value0)(v3);
					if (v4 instanceof Nothing) return searchArg(dictMonadP)(v)(v2)(v3);
					throw new Error("Failed pattern match at Options.Applicative.Common (line 177, column 29 - line 179, column 36): " + [v4.constructor.name]);
				};
			};
		};
	};
};
var searchArg = function(dictMonadP) {
	var Monad0 = dictMonadP.Monad0();
	var monadStateT = monadStateT$1(Monad0);
	var searchParser1 = searchParser(monadStateT);
	var discard2 = discard$5(nondetTBind(monadStateT));
	var when = when$2(nondetTApplicative(monadStateT));
	var cut$1 = cut(monadStateT);
	var lift2 = lift1$1(monadStateT);
	var bindStateT$2 = bindStateT(Monad0);
	var bind3 = bind$15(bindStateT$2);
	var applyFirst$2 = applyFirst(applyStateT(Monad0));
	var monadStateStateT$1 = monadStateStateT(Monad0);
	var get$3 = get(monadStateStateT$1);
	var put$1 = put(monadStateStateT$1);
	var map1 = map$20(functorStateT(dictMonadP.Alt1().Functor0()));
	var lift3 = lift$5(Monad0);
	var Apply0 = Monad0.Bind1().Apply0();
	var applyFirst1 = applyFirst(Apply0);
	var applySecond$6 = applySecond(Apply0);
	var enterContext$1 = enterContext(dictMonadP);
	var exitContext$1 = exitContext(dictMonadP);
	var map2 = map$20(nondetTFunctor(monadStateT));
	var discard3 = discard$5(bindStateT$2);
	var pure2 = pure$18(applicativeStateT(Monad0));
	var empty = empty$4(nondetTPlus(monadStateT));
	var runReadM$1 = runReadM(dictMonadP);
	return function(prefs) {
		return function(arg) {
			return searchParser1(function(opt) {
				return discard2(when(isArg(un$4(Option)(opt).optMain))(cut$1))(function() {
					var v = un$4(Option)(opt).optMain;
					if (v instanceof CmdReader) {
						var v1 = new Tuple(v.value2(arg), un$4(ParserPrefs)(prefs).prefBacktrack);
						if (v1.value0 instanceof Just && v1.value1 instanceof NoBacktrack) return lift2(bind3(applyFirst$2(get$3)(put$1(Nil$1.value)))(function(args) {
							return map1(pure$12)(lift3(applyFirst1(applySecond$6(enterContext$1(arg)(v1.value0.value0))(runParserInfo$2(dictMonadP)(v1.value0.value0)(args)))(exitContext$1)));
						}));
						if (v1.value0 instanceof Just && v1.value1 instanceof Backtrack) return map2(pure$12)(lift2(StateT(function(args) {
							return applyFirst1(applySecond$6(enterContext$1(arg)(v1.value0.value0))(runParser(dictMonadP)(un$4(ParserInfo)(v1.value0.value0).infoPolicy)(CmdStart.value)(un$4(ParserInfo)(v1.value0.value0).infoParser)(args)))(exitContext$1);
						})));
						if (v1.value0 instanceof Just && v1.value1 instanceof SubparserInline) return lift2(discard3(lift3(enterContext$1(arg)(v1.value0.value0)))(function() {
							return pure2(un$4(ParserInfo)(v1.value0.value0).infoParser);
						}));
						if (v1.value0 instanceof Nothing) return empty;
						throw new Error("Failed pattern match at Options.Applicative.Common (line 154, column 7 - line 166, column 38): " + [v1.constructor.name]);
					}
					if (v instanceof ArgReader) return map2(pure$12)(lift2(lift3(runReadM$1(un$4(CReader)(v.value0).crReader)(arg))));
					return empty;
				});
			});
		};
	};
};
var runParserInfo$2 = function(dictMonadP) {
	return function(i) {
		return runParserFully(dictMonadP)(un$4(ParserInfo)(i).infoPolicy)(un$4(ParserInfo)(i).infoParser);
	};
};
var runParserFully = function(dictMonadP) {
	var Monad0 = dictMonadP.Monad0();
	var bind3 = bind$15(Monad0.Bind1());
	var pure2 = pure$18(Monad0.Applicative0());
	var errorP$1 = errorP(dictMonadP);
	return function(policy) {
		return function(p) {
			return function(args) {
				return bind3(runParser(dictMonadP)(policy)(CmdStart.value)(p)(args))(function(v) {
					if (v.value1 instanceof Nil$1) return pure2(v.value0);
					if (v.value1 instanceof Cons$1) return errorP$1(unexpectedError(v.value1.value0)(pure$12(void 0)));
					throw new Error("Failed pattern match at Options.Applicative.Common (line 214, column 3 - line 216, column 66): " + [v.value1.constructor.name]);
				});
			};
		};
	};
};
var runParser = function(dictMonadP) {
	var Monad0 = dictMonadP.Monad0();
	var disamb$1 = disamb(monadStateT$1(Monad0));
	var exitP$1 = exitP(dictMonadP);
	var bind3 = bind$15(Monad0.Bind1());
	var getPrefs$1 = getPrefs(dictMonadP);
	var hoistMaybe$1 = hoistMaybe(dictMonadP);
	return function(policy) {
		return function(isCmdStart) {
			return function(p) {
				return function(args) {
					var result = apply$4(map$9(Tuple.create)(evalParser(p)))(pure1$3(args));
					var newPolicy = function(a) {
						if (policy instanceof NoIntersperse) {
							if (isJust(parseWord(a))) return NoIntersperse.value;
							return AllPositionals.value;
						}
						return policy;
					};
					var do_step = function(prefs) {
						return function(arg) {
							return function(argt) {
								return (function(v) {
									return runStateT(v)(argt);
								})(disamb$1(!un$4(ParserPrefs)(prefs).prefDisambiguate)(stepParser(dictMonadP)(prefs)(policy)(arg)(p)));
							};
						};
					};
					if (args instanceof Nil$1) return exitP$1(isCmdStart)(policy)(p)(result);
					if (args instanceof Cons$1 && args.value0 === "--" && notEq1(policy)(AllPositionals.value)) return runParser(dictMonadP)(AllPositionals.value)(CmdCont.value)(p)(args.value1);
					if (args instanceof Cons$1) return bind3(getPrefs$1)(function(prefs) {
						return bind3(do_step(prefs)(args.value0)(args.value1))(function(v) {
							if (v.value0 instanceof Nothing) return hoistMaybe$1(unexpectedError(args.value0)(p))(result);
							if (v.value0 instanceof Just) return runParser(dictMonadP)(newPolicy(args.value0))(CmdCont.value)(v.value0.value0)(v.value1);
							throw new Error("Failed pattern match at Options.Applicative.Common (line 192, column 5 - line 194, column 60): " + [v.value0.constructor.name]);
						});
					});
					throw new Error("Failed pattern match at Options.Applicative.Common (line 186, column 38 - line 194, column 60): " + [args.constructor.name]);
				};
			};
		};
	};
};
var treeMapParser = function(g) {
	var has_default = function(p) {
		return isJust(evalParser(p));
	};
	var hasArg = function(v) {
		if (v instanceof NilP) return false;
		if (v instanceof OptP) return isArg(un$4(Option)(v.value0).optMain);
		if (v instanceof MultP) return runExists(function(v1) {
			return hasArg(v1.value0) || hasArg(v1.value1);
		})(v.value0);
		if (v instanceof AltP) return hasArg(v.value0) || hasArg(v.value1);
		if (v instanceof BindP) return resume$prime(function(p) {
			return function(v1) {
				return hasArg(p);
			};
		})($$const(false))(v.value0);
		throw new Error("Failed pattern match at Options.Applicative.Common (line 272, column 5 - line 272, column 44): " + [v.constructor.name]);
	};
	var go = function(v) {
		return function(v1) {
			return function(v2) {
				return function(v3) {
					return function(v4) {
						if (v4 instanceof NilP) return new MultNode([]);
						if (v4 instanceof OptP) {
							if (greaterThan(optVisibility(v4.value0))(Internal.value)) return new Leaf(v3({
								hinfoMulti: v,
								hinfoDefault: v1,
								hinfoUnreachableArgs: v2
							})(v4.value0));
							return new MultNode([]);
						}
						if (v4 instanceof MultP) return runExists(function(v5) {
							var r$prime = v2 || hasArg(v5.value0);
							return new MultNode([go(v)(v1)(v2)(v3)(v5.value0), go(v)(v1)(r$prime)(v3)(v5.value1)]);
						})(v4.value0);
						if (v4 instanceof AltP) {
							var d$prime = v1 || has_default(v4.value0) || has_default(v4.value1);
							return new AltNode([go(v)(d$prime)(v2)(v3)(v4.value0), go(v)(d$prime)(v2)(v3)(v4.value1)]);
						}
						if (v4 instanceof BindP) return resume$prime(function(p) {
							return function(k) {
								var go$prime = go(true)(v1)(v2)(v3)(p);
								var v5 = evalParser(p);
								if (v5 instanceof Nothing) return go$prime;
								if (v5 instanceof Just) return new MultNode([go$prime, go(true)(v1)(v2)(v3)(new BindP(k(v5.value0)))]);
								throw new Error("Failed pattern match at Options.Applicative.Common (line 267, column 12 - line 269, column 68): " + [v5.constructor.name]);
							};
						})($$const(new MultNode([])))(v4.value0);
						throw new Error("Failed pattern match at Options.Applicative.Common (line 248, column 5 - line 251, column 21): " + [
							v.constructor.name,
							v1.constructor.name,
							v2.constructor.name,
							v3.constructor.name,
							v4.constructor.name
						]);
					};
				};
			};
		};
	};
	var $350 = go(false)(false)(false)(g);
	return function($351) {
		return simplify($350($351));
	};
};
var mapParser = function(f) {
	var flatten = function(v) {
		if (v instanceof Leaf) return [v.value0];
		if (v instanceof MultNode) return bind$10(v.value0)(flatten);
		if (v instanceof AltNode) return bind$10(v.value0)(flatten);
		throw new Error("Failed pattern match at Options.Applicative.Common (line 235, column 5 - line 235, column 27): " + [v.constructor.name]);
	};
	var $352 = treeMapParser(f);
	return function($353) {
		return flatten($352($353));
	};
};
//#endregion
//#region output/Options.Applicative.Builder.Internal/index.js
var over$3 = /* #__PURE__ */ over$5()();
var append$3 = /* #__PURE__ */ append$7(semigroupArray);
var alt$3 = /* #__PURE__ */ alt$6(altMaybe);
var identity$6 = /* #__PURE__ */ identity$15(categoryFn);
var apply$3 = /* #__PURE__ */ apply$8(applyMaybe);
var alt1 = /* #__PURE__ */ alt$6(parserAlt);
var pure$11 = /* #__PURE__ */ pure$18(parserApplicative);
var OptionFields = function(x) {
	return x;
};
var FlagFields = function(x) {
	return x;
};
var DefaultProp = /* #__PURE__ */ (function() {
	function DefaultProp(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	DefaultProp.create = function(value0) {
		return function(value1) {
			return new DefaultProp(value0, value1);
		};
	};
	return DefaultProp;
})();
var Mod = /* #__PURE__ */ (function() {
	function Mod(value0, value1, value2) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
	}
	Mod.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return new Mod(value0, value1, value2);
			};
		};
	};
	return Mod;
})();
var optionFieldsHasValue = { hasValueDummy: function(v) {} };
var optionFieldsHasMetavar = { hasMetavarDummy: function(v) {} };
var optionFieldsHasName = { name: function(n) {
	return over$3(OptionFields)(function(fields) {
		return {
			optCompleter: fields.optCompleter,
			optNoArgError: fields.optNoArgError,
			optNames: append$3([n])(fields.optNames)
		};
	});
} };
var name = function(dict) {
	return dict.name;
};
var flagFieldsHasName = { name: function(n) {
	return over$3(FlagFields)(function(fields) {
		return {
			flagActive: fields.flagActive,
			flagNames: append$3([n])(fields.flagNames)
		};
	});
} };
var defaultPropSemigroup = { append: function(v) {
	return function(v1) {
		return new DefaultProp(alt$3(v.value0)(v1.value0), alt$3(v.value1)(v1.value1));
	};
} };
var append1$3 = /* #__PURE__ */ append$7(defaultPropSemigroup);
var modSemigroup = { append: function(v) {
	return function(v1) {
		return new Mod(function($69) {
			return v1.value0(v.value0($69));
		}, append1$3(v1.value1)(v.value1), function($70) {
			return v1.value2(v.value2($70));
		});
	};
} };
var mempty$4 = /* #__PURE__ */ mempty$6(/* @__PURE__ */ (function() {
	return {
		mempty: new DefaultProp(Nothing.value, Nothing.value),
		Semigroup0: function() {
			return defaultPropSemigroup;
		}
	};
})());
var fieldMod = function(f) {
	return new Mod(f, mempty$4, identity$6);
};
var modMonoid = /* #__PURE__ */ (function() {
	return {
		mempty: new Mod(identity$6, mempty$4, identity$6),
		Semigroup0: function() {
			return modSemigroup;
		}
	};
})();
var optionMod = /* #__PURE__ */ (function() {
	return Mod.create(identity$6)(mempty$4);
})();
var internal = /* #__PURE__ */ optionMod(/* #__PURE__ */ over$3(OptProperties)(function(p) {
	return {
		propDescMod: p.propDescMod,
		propHelp: p.propHelp,
		propMetaVar: p.propMetaVar,
		propShowDefault: p.propShowDefault,
		propVisibility: Internal.value
	};
}));
var baseProps = /* #__PURE__ */ (function() {
	return {
		propMetaVar: "",
		propVisibility: Visible.value,
		propHelp: mempty$6(chunkMonoid$2(docSemigroup)),
		propShowDefault: Nothing.value,
		propDescMod: Nothing.value
	};
})();
var mkProps = function(v) {
	return function(g) {
		return over$3(OptProperties)(function(r) {
			return {
				propDescMod: r.propDescMod,
				propHelp: r.propHelp,
				propMetaVar: r.propMetaVar,
				propVisibility: r.propVisibility,
				propShowDefault: apply$3(v.value1)(v.value0)
			};
		})(g(baseProps));
	};
};
var mkOption = function(d) {
	return function(g) {
		return function(rdr) {
			return {
				optMain: rdr,
				optProps: mkProps(d)(g)
			};
		};
	};
};
var mkParser = function(v) {
	return function(g) {
		return function(rdr) {
			var o = liftOpt(mkOption(v)(g)(rdr));
			return maybe(o)(function(a) {
				return alt1(o)(pure$11(a));
			})(v.value0);
		};
	};
};
var argumentFieldsHasMetavar = { hasMetavarDummy: function(v) {} };
//#endregion
//#region output/Options.Applicative.Builder/index.js
var identity$5 = /* #__PURE__ */ identity$15(categoryFn);
var over$2 = /* #__PURE__ */ over$5()();
var un$3 = /* #__PURE__ */ un$8();
var append$2 = /* #__PURE__ */ append$7(modSemigroup);
var mempty$3 = /* #__PURE__ */ mempty$6(completerMonoid);
var bind$9 = /* #__PURE__ */ bind$15(readMBind);
var pure$10 = /* #__PURE__ */ pure$18(readMApplicative);
var mempty1$2 = /* #__PURE__ */ mempty$6(/* #__PURE__ */ chunkMonoid$2(docSemigroup));
var min = /* #__PURE__ */ min$2(optVisibilityOrd);
var show = /* #__PURE__ */ show$2(showString);
var mempty2$1 = /* #__PURE__ */ mempty$6(/* #__PURE__ */ monoidRecord()(/* #__PURE__ */ monoidRecordCons({ reflectSymbol: function() {
	return "argCompleter";
} })(completerMonoid)()(monoidRecordNil)));
var fold$3 = /* #__PURE__ */ fold$6(foldableArray)(modMonoid);
var PrefsMod = function(x) {
	return x;
};
var InfoMod = function(x) {
	return x;
};
var value$1 = function(dictHasValue) {
	return function(x) {
		return new Mod(identity$5, new DefaultProp(new Just(x), Nothing.value), identity$5);
	};
};
var value1 = /* #__PURE__ */ value$1(optionFieldsHasValue);
var str = readerAsk;
var $$short$1 = function(dictHasName) {
	var $121 = name(dictHasName);
	return function($122) {
		return fieldMod($121(OptShort.create($122)));
	};
};
var progDesc = function(s) {
	return over$2(ParserInfo)(function(i) {
		return {
			infoFailureCode: i.infoFailureCode,
			infoFooter: i.infoFooter,
			infoFullDesc: i.infoFullDesc,
			infoHeader: i.infoHeader,
			infoParser: i.infoParser,
			infoPolicy: i.infoPolicy,
			infoProgDesc: paragraph(s)
		};
	});
};
var noArgError = function(e) {
	return fieldMod(over$2(OptionFields)(function(p) {
		return {
			optCompleter: p.optCompleter,
			optNames: p.optNames,
			optNoArgError: $$const(e)
		};
	}));
};
var prefs = function(m) {
	var base = {
		prefMultiSuffix: "",
		prefDisambiguate: false,
		prefShowHelpOnError: false,
		prefShowHelpOnEmpty: false,
		prefBacktrack: Backtrack.value,
		prefColumns: 80
	};
	return un$3(PrefsMod)(m)(base);
};
var prefsModSemigroup = { append: function(m1) {
	return function(m2) {
		var $123 = un$3(PrefsMod)(m2);
		var $124 = un$3(PrefsMod)(m1);
		return function($125) {
			return $123($124($125));
		};
	};
} };
var prefsModMonoid = {
	mempty: identity$5,
	Semigroup0: function() {
		return prefsModSemigroup;
	}
};
var metavar$1 = function(dictHasMetavar) {
	return function($$var) {
		return optionMod(over$2(OptProperties)(function(p) {
			return {
				propDescMod: p.propDescMod,
				propHelp: p.propHelp,
				propShowDefault: p.propShowDefault,
				propVisibility: p.propVisibility,
				propMetaVar: $$var
			};
		}));
	};
};
var metavar1$1 = /* #__PURE__ */ metavar$1(optionFieldsHasMetavar);
var option = function(r) {
	return function(m) {
		var v = append$2(metavar1$1("ARG"))(m);
		var v1 = v.value0({
			optNames: [],
			optCompleter: mempty$3,
			optNoArgError: ExpectsArgError.create
		});
		var crdr = {
			crCompleter: v1.optCompleter,
			crReader: r
		};
		var rdr = new OptReader(v1.optNames, crdr, v1.optNoArgError);
		return mkParser(v.value1)(v.value2)(rdr);
	};
};
var strOption = /* #__PURE__ */ option(str);
var $$long$2 = function(dictHasName) {
	var $126 = name(dictHasName);
	return function($127) {
		return fieldMod($126(OptLong.create($127)));
	};
};
var infoModSemigroup = { append: function(m1) {
	return function(m2) {
		var $128 = un$3(InfoMod)(m2);
		var $129 = un$3(InfoMod)(m1);
		return function($130) {
			return $128($129($130));
		};
	};
} };
var info = function(parser) {
	return function(m) {
		var base = {
			infoParser: parser,
			infoFullDesc: true,
			infoProgDesc: mempty1$2,
			infoHeader: mempty1$2,
			infoFooter: mempty1$2,
			infoFailureCode: $$Error.value,
			infoPolicy: Intersperse.value
		};
		return un$3(InfoMod)(m)(base);
	};
};
var idm = function(dictMonoid) {
	return mempty$6(dictMonoid);
};
var hidden = /* #__PURE__ */ optionMod(/* #__PURE__ */ over$2(OptProperties)(function(p) {
	return {
		propDescMod: p.propDescMod,
		propHelp: p.propHelp,
		propMetaVar: p.propMetaVar,
		propShowDefault: p.propShowDefault,
		propVisibility: min(Hidden.value)(p.propVisibility)
	};
}));
var help = function(s) {
	return optionMod(over$2(OptProperties)(function(p) {
		return {
			propDescMod: p.propDescMod,
			propMetaVar: p.propMetaVar,
			propShowDefault: p.propShowDefault,
			propVisibility: p.propVisibility,
			propHelp: paragraph(s)
		};
	}));
};
var header = function(s) {
	return over$2(ParserInfo)(function(i) {
		return {
			infoFailureCode: i.infoFailureCode,
			infoFooter: i.infoFooter,
			infoFullDesc: i.infoFullDesc,
			infoParser: i.infoParser,
			infoPolicy: i.infoPolicy,
			infoProgDesc: i.infoProgDesc,
			infoHeader: paragraph(s)
		};
	});
};
var fullDesc$1 = /* #__PURE__ */ over$2(ParserInfo)(function(i) {
	return {
		infoFailureCode: i.infoFailureCode,
		infoFooter: i.infoFooter,
		infoHeader: i.infoHeader,
		infoParser: i.infoParser,
		infoPolicy: i.infoPolicy,
		infoProgDesc: i.infoProgDesc,
		infoFullDesc: true
	};
});
var flag$prime = function(actv) {
	return function(v) {
		var rdr = (function() {
			var v1 = v.value0({
				flagNames: [],
				flagActive: actv
			});
			return new FlagReader(v1.flagNames, v1.flagActive);
		})();
		return mkParser(v.value1)(v.value2)(rdr);
	};
};
var eitherReader = function(f) {
	return bind$9(readerAsk)((function() {
		var $131 = either(readerError)(pure$10);
		return function($132) {
			return $131(f($132));
		};
	})());
};
var $$int = /* #__PURE__ */ eitherReader(function(s) {
	var v = fromString$1(s);
	if (v instanceof Nothing) return new Left("Can't parse as Int: `" + (show(s) + "`"));
	if (v instanceof Just) return new Right(v.value0);
	throw new Error("Failed pattern match at Options.Applicative.Builder (line 124, column 28 - line 126, column 20): " + [v.constructor.name]);
});
var defaultPrefs = /* #__PURE__ */ prefs(/* #__PURE__ */ idm(prefsModMonoid));
var argument = function(p) {
	return function(v) {
		var rdr = {
			crCompleter: v.value0(mempty2$1).argCompleter,
			crReader: p
		};
		return mkParser(v.value1)(v.value2)(new ArgReader(rdr));
	};
};
var strArgument = /* #__PURE__ */ argument(str);
var abortOption = function(err) {
	return function(m) {
		return option(readerAbort(err))((function(v) {
			return append$2(v)(m);
		})(fold$3([
			noArgError(err),
			value1(identity$5),
			metavar1$1("")
		])));
	};
};
process$1.abort;
process$1.channel && process$1.channel.ref;
process$1.channel && process$1.channel.unref;
process$1.debugPort;
process$1.disconnect;
process$1.pid;
process$1.platform;
process$1.ppid;
process$1.stdin;
process$1.stdout;
process$1.stderr;
process$1.stdinIsTTY;
process$1.stdoutIsTTY;
process$1.stderrIsTTY;
process$1.version;
//#endregion
//#region output/Options.Applicative.BashCompletion/index.js
var pure$9 = /* #__PURE__ */ pure$18(applicativeEffect);
var un$2 = /* #__PURE__ */ un$8();
var map$8 = /* #__PURE__ */ map$20(functorMaybe);
var map1$3 = /* #__PURE__ */ map$20(functorArray);
var runParserInfo$1 = /* #__PURE__ */ runParserInfo$2(completionMonadP);
var fromFoldable$1 = /* #__PURE__ */ fromFoldable$4(foldableArray);
var identity$4 = /* #__PURE__ */ identity$15(categoryFn);
var bind$8 = /* #__PURE__ */ bind$15(bindMaybe);
var notEq = /* #__PURE__ */ notEq$1(argPolicyEq);
var map2$1 = /* #__PURE__ */ map$20(functorEffect);
var fold$2 = /* #__PURE__ */ fold$6(foldableArray)(monoidArray);
var sequence = /* #__PURE__ */ sequence$1(traversableArray)(applicativeEffect);
var unLines = /* #__PURE__ */ unLines$1(foldableArray);
var alt$2 = /* #__PURE__ */ alt$6(parserAlt);
var map3$1 = /* #__PURE__ */ map$20(parserFunctor);
var apply$2 = /* #__PURE__ */ apply$8(parserApply);
var append1$2 = /* #__PURE__ */ append$7(modSemigroup);
var $$long$1 = /* #__PURE__ */ $$long$2(flagFieldsHasName);
var long1 = /* #__PURE__ */ $$long$2(optionFieldsHasName);
var value = /* #__PURE__ */ value$1(optionFieldsHasValue);
var pure1$2 = /* #__PURE__ */ pure$18(parserApplicative);
var fromFoldable1 = /* #__PURE__ */ fromFoldable$5(foldableList);
var Standard = /* #__PURE__ */ (function() {
	function Standard() {}
	Standard.value = new Standard();
	return Standard;
})();
var Enriched = /* #__PURE__ */ (function() {
	function Enriched(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	Enriched.create = function(value0) {
		return function(value1) {
			return new Enriched(value0, value1);
		};
	};
	return Enriched;
})();
var zshCompletionScript = function(prog) {
	return function(progn) {
		return pure$9([
			"#compdef " + progn,
			"",
			"local request",
			"local completions",
			"local word",
			"local index=$((CURRENT - 1))",
			"",
			"request=(--bash-completion-enriched --bash-completion-index $index)",
			"for arg in ${words[@]}; do",
			"  request=(${request[@]} --bash-completion-word $arg)",
			"done",
			"",
			"IFS=$'\\n' completions=($( " + (prog + " \"${request[@]}\" ))"),
			"",
			"for word in $completions; do",
			"  local -a parts",
			"",
			"  # Split the line at a tab if there is one.",
			"  IFS=$'\\t' parts=($( echo $word ))",
			"",
			"  if [[ -n $parts[2] ]]; then",
			"     if [[ $word[1] == \"-\" ]]; then",
			"       local desc=(\"$parts[1] ($parts[2])\")",
			"       compadd -d desc -- $parts[1]",
			"     else",
			"       local desc=($(print -f  \"%-019s -- %s\" $parts[1] $parts[2]))",
			"       compadd -l -d desc -- $parts[1]",
			"     fi",
			"  else",
			"    compadd -f -- $word",
			"  fi",
			"done"
		]);
	};
};
var fishCompletionScript = function(prog) {
	return function(progn) {
		return pure$9([
			" function _" + progn,
			"    set -l cl (commandline --tokenize --current-process)",
			"    # Hack around fish issue #3934",
			"    set -l cn (commandline --tokenize --cut-at-cursor --current-process)",
			"    set -l cn (count $cn)",
			"    set -l tmpline --bash-completion-enriched --bash-completion-index $cn",
			"    for arg in $cl",
			"      set tmpline $tmpline --bash-completion-word $arg",
			"    end",
			"    for opt in (" + (prog + " $tmpline)"),
			"      if test -d $opt",
			"        echo -E \"$opt/\"",
			"      else",
			"        echo -E \"$opt\"",
			"      end",
			"    end",
			"end",
			"",
			"complete --no-files --command " + (progn + (" --arguments '(_" + (progn + ")'")))
		]);
	};
};
var bashCompletionScript = function(prog) {
	return function(progn) {
		return pure$9([
			"_" + (progn + "()"),
			"{",
			"    local CMDLINE",
			"    local IFS=$'\\n'",
			"    CMDLINE=(--bash-completion-index $COMP_CWORD)",
			"",
			"    for arg in ${COMP_WORDS[@]}; do",
			"        CMDLINE=(${CMDLINE[@]} --bash-completion-word $arg)",
			"    done",
			"",
			"    COMPREPLY=( $(" + (prog + " \"${CMDLINE[@]}\") )"),
			"}",
			"",
			"complete -o filenames -F _" + (progn + (" " + progn))
		]);
	};
};
var arraySplitAt = function(idx) {
	return function(arr) {
		if (idx === 0) return {
			init: [],
			rest: arr
		};
		return {
			init: slice(0)(idx)(arr),
			rest: slice(idx)(length$2(arr))(arr)
		};
	};
};
var bashCompletionQuery = function(pinfo) {
	return function(pprefs) {
		return function(richness) {
			return function(ws) {
				return function(i) {
					return function(v) {
						var v1 = arraySplitAt(i)(ws);
						var run_completer = function(c) {
							return un$2(Completer)(c)(fromMaybe("")(head(v1.rest)));
						};
						var render_line = function(len) {
							return function(doc) {
								var v2 = map$8(uncons$3)(fromArray(lines(displayS(renderPretty(1)(len)(doc)))));
								if (v2 instanceof Nothing) return "";
								if (v2 instanceof Just && v2.value0.tail.length === 0) return v2.value0.head;
								if (v2 instanceof Just) return v2.value0.head + "...";
								throw new Error("Failed pattern match at Options.Applicative.BashCompletion (line 162, column 27 - line 165, column 43): " + [v2.constructor.name]);
							};
						};
						var filter_names = filter((function() {
							var v2 = head(v1.rest);
							if (v2 instanceof Just) return startsWith(v2.value0);
							if (v2 instanceof Nothing) return $$const(true);
							throw new Error("Failed pattern match at Options.Applicative.BashCompletion (line 175, column 7 - line 177, column 30): " + [v2.constructor.name]);
						})());
						var show_names = (function() {
							var $129 = map1$3(showOption);
							return function($130) {
								return filter_names($129($130));
							};
						})();
						var compl = runParserInfo$1(pinfo)(fromFoldable$1(drop$1(1)(v1.init)));
						var add_opt_help = function(dictFunctor) {
							var map4 = map$20(dictFunctor);
							return function(opt) {
								if (richness instanceof Standard) return identity$4;
								if (richness instanceof Enriched) return map4(function(o) {
									var h = un$2(Chunk)(optHelp(opt));
									return maybe(o)(function(h$prime) {
										return o + ("	" + render_line(richness.value0)(h$prime));
									})(h);
								});
								throw new Error("Failed pattern match at Options.Applicative.BashCompletion (line 138, column 24 - line 143, column 79): " + [richness.constructor.name]);
							};
						};
						var add_opt_help1 = add_opt_help(functorArray);
						var add_cmd_help = function(dictFunctor) {
							var map4 = map$20(dictFunctor);
							return function(p) {
								if (richness instanceof Standard) return identity$4;
								if (richness instanceof Enriched) return map4(function(cmd) {
									var h = bind$8(p(cmd))((function() {
										var $131 = un$2(Chunk);
										var $132 = un$2(ParserInfo);
										return function($133) {
											return $131((function(v2) {
												return v2.infoProgDesc;
											})($132($133)));
										};
									})());
									return maybe(cmd)(function(h$prime) {
										return cmd + ("	" + render_line(richness.value1)(h$prime));
									})(h);
								});
								throw new Error("Failed pattern match at Options.Applicative.BashCompletion (line 148, column 22 - line 153, column 85): " + [richness.constructor.name]);
							};
						};
						var add_cmd_help1 = add_cmd_help(functorArray);
						var opt_completions = function(argPolicy) {
							return function(hinfo) {
								return function(opt) {
									var v2 = un$2(Option)(opt).optMain;
									if (v2 instanceof OptReader) {
										if (notEq(argPolicy)(AllPositionals.value)) return pure$9(add_opt_help1(opt)(show_names(v2.value0)));
										return pure$9([]);
									}
									if (v2 instanceof FlagReader) {
										if (notEq(argPolicy)(AllPositionals.value)) return pure$9(add_opt_help1(opt)(show_names(v2.value0)));
										return pure$9([]);
									}
									if (v2 instanceof ArgReader) {
										if (un$2(OptHelpInfo)(hinfo).hinfoUnreachableArgs) return pure$9([]);
										return run_completer(un$2(CReader)(v2.value0).crCompleter);
									}
									if (v2 instanceof CmdReader) {
										if (un$2(OptHelpInfo)(hinfo).hinfoUnreachableArgs) return pure$9([]);
										return pure$9(add_cmd_help1(v2.value2)(filter_names(v2.value1)));
									}
									throw new Error("Failed pattern match at Options.Applicative.BashCompletion (line 113, column 43 - line 133, column 53): " + [v2.constructor.name]);
								};
							};
						};
						var list_options = function(a) {
							var $134 = map2$1(fold$2);
							var $135 = mapParser(opt_completions(a));
							return function($136) {
								return $134(sequence($135($136)));
							};
						};
						var v2 = runCompletion(compl)(pprefs);
						if (v2 instanceof Just && v2.value0 instanceof Left) return runExists(function(p) {
							return list_options(v2.value0.value0.value1)(p);
						})(v2.value0.value0.value0.value0);
						if (v2 instanceof Just && v2.value0 instanceof Right) return run_completer(v2.value0.value0);
						if (v2 instanceof Nothing) return pure$9([]);
						throw new Error("Failed pattern match at Options.Applicative.BashCompletion (line 83, column 52 - line 89, column 15): " + [v2.constructor.name]);
					};
				};
			};
		};
	};
};
var bashCompletionParser = function(pinfo) {
	return function(pprefs) {
		var failure = function(opts) {
			return { execCompletion: function(progn) {
				return map2$1(unLines)(opts(progn));
			} };
		};
		return alt$2(map3$1(failure)(apply$2(apply$2(map3$1(bashCompletionQuery(pinfo)(pprefs))(alt$2(apply$2(apply$2(flag$prime(Enriched.create)(append1$2($$long$1("bash-completion-enriched"))(internal)))(option($$int)(append1$2(append1$2(long1("bash-completion-option-desc-length"))(internal))(value(40)))))(option($$int)(append1$2(append1$2(long1("bash-completion-command-desc-length"))(internal))(value(40)))))(pure1$2(Standard.value))))(map3$1(fromFoldable1)(many(strOption(append1$2(long1("bash-completion-word"))(internal))))))(option($$int)(append1$2(long1("bash-completion-index"))(internal)))))(alt$2(map3$1(failure)(map3$1(bashCompletionScript)(strOption(append1$2(long1("bash-completion-script"))(internal)))))(alt$2(map3$1(failure)(map3$1(fishCompletionScript)(strOption(append1$2(long1("fish-completion-script"))(internal)))))(map3$1(failure)(map3$1(zshCompletionScript)(strOption(append1$2(long1("zsh-completion-script"))(internal)))))));
	};
};
//#endregion
//#region output/Options.Applicative.Help.Core/index.js
var over$1 = /* #__PURE__ */ over$5()();
var mempty$2 = /* #__PURE__ */ mempty$6(parserHelpMonoid);
var fold$1 = /* #__PURE__ */ fold$5(monoidArray);
var un$1 = /* #__PURE__ */ un$8();
var chunkMonoid = /* #__PURE__ */ chunkMonoid$2(docSemigroup);
var mempty1$1 = /* #__PURE__ */ mempty$6(chunkMonoid);
var eq1 = /* #__PURE__ */ eq$1(optVisibilityEq);
var map$7 = /* #__PURE__ */ map$20(functorArray);
var sort = /* #__PURE__ */ sort$1(optNameOrd);
var append$1 = /* #__PURE__ */ append$7(/* #__PURE__ */ chunkSemigroup(docSemigroup));
var map1$2 = /* #__PURE__ */ map$20(chunkFunctor);
var listToChunk = /* #__PURE__ */ listToChunk$1(docMonoid);
var identity$3 = /* #__PURE__ */ identity$15(categoryFn);
var map2 = /* #__PURE__ */ map$20(functorMaybe);
var discard$4 = /* #__PURE__ */ discard$7(discardUnit)(bindMaybe);
var guard = /* #__PURE__ */ guard$2(alternativeMaybe);
var pure$8 = /* #__PURE__ */ pure$18(applicativeMaybe);
var extractChunk = /* #__PURE__ */ extractChunk$2(docMonoid);
var bind$7 = /* #__PURE__ */ bind$15(bindArray);
var pure1$1 = /* #__PURE__ */ pure$18(applicativeArray);
var mempty2 = /* #__PURE__ */ mempty$6(/* #__PURE__ */ monoidTuple(/* #__PURE__ */ monoidMaybe(semigroupString))(chunkMonoid));
var append1$1 = /* #__PURE__ */ append$7(semigroupArray);
var eq2$1 = /* #__PURE__ */ eq$1(/* #__PURE__ */ eqMaybe(eqString));
var OptDescStyle = function(x) {
	return x;
};
var usageHelp = function(chunk) {
	return over$1(ParserHelp)(function(v) {
		return {
			helpBody: v.helpBody,
			helpError: v.helpError,
			helpFooter: v.helpFooter,
			helpHeader: v.helpHeader,
			helpSuggestions: v.helpSuggestions,
			helpUsage: chunk
		};
	})(mempty$2);
};
var suggestionsHelp = function(chunk) {
	return over$1(ParserHelp)(function(v) {
		return {
			helpBody: v.helpBody,
			helpError: v.helpError,
			helpFooter: v.helpFooter,
			helpHeader: v.helpHeader,
			helpUsage: v.helpUsage,
			helpSuggestions: chunk
		};
	})(mempty$2);
};
var intersperse = function(sep) {
	var $64 = mapWithIndex$1(function(idx) {
		return function(e) {
			if (idx === 0) return [e];
			return [sep, e];
		};
	});
	return function($65) {
		return fold$1($64($65));
	};
};
var optDesc = function(pprefs) {
	return function(style) {
		return function(info) {
			return function(opt) {
				var suffix = (function() {
					if (un$1(OptHelpInfo)(info).hinfoMulti) return stringChunk(un$1(ParserPrefs)(pprefs).prefMultiSuffix);
					return mempty1$1;
				})();
				var show_opt = (function() {
					if (un$1(OptHelpInfo)(info).hinfoDefault && !un$1(OptDescStyle)(style).descOptional) return false;
					if (eq1(optVisibility(opt))(Hidden.value)) return un$1(OptDescStyle)(style).descHidden;
					return eq1(optVisibility(opt))(Visible.value);
				})();
				var ns = optionNames(un$1(Option)(opt).optMain);
				var mv = stringChunk(optMetaVar(opt));
				var descs = map$7(function($66) {
					return string(showOption($66));
				})(sort(ns));
				var render = function(chunk) {
					if (!show_opt) return mempty1$1;
					if (isEmpty(chunk) || !un$1(OptDescStyle)(style).descSurround) return append$1(chunk)(suffix);
					if (un$1(OptHelpInfo)(info).hinfoDefault) return append$1(map1$2(brackets)(chunk))(suffix);
					if ($$null$2(drop$1(1)(descs))) return append$1(chunk)(suffix);
					return append$1(map1$2(parens)(chunk))(suffix);
				};
				var desc$prime = chunkBeside(listToChunk(intersperse(un$1(OptDescStyle)(style).descSep)(descs)))(mv);
				return maybe(identity$3)(map1$2)(optDescMod(opt))(render(desc$prime));
			};
		};
	};
};
var headerHelp = function(chunk) {
	return over$1(ParserHelp)(function(v) {
		return {
			helpBody: v.helpBody,
			helpError: v.helpError,
			helpFooter: v.helpFooter,
			helpSuggestions: v.helpSuggestions,
			helpUsage: v.helpUsage,
			helpHeader: chunk
		};
	})(mempty$2);
};
var fullDesc = function(pprefs) {
	var style = {
		descSep: string(","),
		descHidden: true,
		descOptional: true,
		descSurround: false
	};
	var doc = function(info) {
		return function(opt) {
			var show_def = function(s) {
				return parens(appendWithSpace(string("default:"))(string(s)));
			};
			var n = optDesc(pprefs)(style)(info)(opt);
			var hdef = map2(show_def)(optShowDefault(opt));
			var h = optHelp(opt);
			return discard$4(guard(!isEmpty(n)))(function() {
				return discard$4(guard(!isEmpty(h)))(function() {
					return pure$8(new Tuple(extractChunk(n), align(extractChunk(chunkBeside(h)(hdef)))));
				});
			});
		};
	};
	var $67 = mapParser(doc);
	return function($68) {
		return tabulate$1(catMaybes($67($68)));
	};
};
var footerHelp = function(chunk) {
	return over$1(ParserHelp)(function(v) {
		return {
			helpBody: v.helpBody,
			helpError: v.helpError,
			helpHeader: v.helpHeader,
			helpSuggestions: v.helpSuggestions,
			helpUsage: v.helpUsage,
			helpFooter: chunk
		};
	})(mempty$2);
};
var fold_tree = function(v) {
	if (v instanceof Leaf) return v.value0;
	if (v instanceof MultNode) return foldr$4(function($69) {
		return chunkBesideOrBelow(fold_tree($69));
	})(mempty1$1)(v.value0);
	if (v instanceof AltNode) {
		var alt_node = function(v1) {
			if (v1.length === 1) return v1[0];
			return map1$2(parens)(foldr$4(chunked(function(x) {
				return function(y) {
					return appendWithSoftline(x)(appendWithSoftline($$char("|"))(y));
				};
			}))(mempty1$1)(v1));
		};
		return alt_node(filter(function($70) {
			return !isEmpty($70);
		})(map$7(fold_tree)(v.value0)));
	}
	throw new Error("Failed pattern match at Options.Applicative.Help.Core (line 116, column 1 - line 116, column 46): " + [v.constructor.name]);
};
var errorHelp = function(chunk) {
	return over$1(ParserHelp)(function(v) {
		return {
			helpBody: v.helpBody,
			helpFooter: v.helpFooter,
			helpHeader: v.helpHeader,
			helpSuggestions: v.helpSuggestions,
			helpUsage: v.helpUsage,
			helpError: chunk
		};
	})(mempty$2);
};
var cmdDesc = /* #__PURE__ */ (function() {
	var desc = function(v) {
		return function(opt) {
			var v1 = un$1(Option)(opt).optMain;
			if (v1 instanceof CmdReader) return new Tuple(v1.value0, tabulate$1(bind$7(reverse$1(v1.value1))(function(cmd) {
				return bind$7(maybe([])(pure1$1)(map2((function() {
					var $71 = un$1(ParserInfo);
					return function($72) {
						return (function(v2) {
							return v2.infoProgDesc;
						})($71($72));
					};
				})())(v1.value2(cmd))))(function(d) {
					return pure1$1(new Tuple(string(cmd), align(extractChunk(d))));
				});
			})));
			return mempty2;
		};
	};
	return mapParser(desc);
})();
var briefDesc$prime = function(showOptional) {
	return function(pprefs) {
		var style = {
			descSep: string("|"),
			descHidden: false,
			descOptional: showOptional,
			descSurround: true
		};
		var $73 = treeMapParser(optDesc(pprefs)(style));
		return function($74) {
			return fold_tree($73($74));
		};
	};
};
var missingDesc = /* #__PURE__ */ briefDesc$prime(false);
var briefDesc = /* #__PURE__ */ briefDesc$prime(true);
var parserUsage = function(pprefs) {
	return function(p) {
		return function(progn) {
			return hsep([
				string("Usage:"),
				string(progn),
				align(extractChunk(briefDesc(pprefs)(p)))
			]);
		};
	};
};
var bodyHelp = function(chunk) {
	return over$1(ParserHelp)(function(v) {
		return {
			helpError: v.helpError,
			helpFooter: v.helpFooter,
			helpHeader: v.helpHeader,
			helpSuggestions: v.helpSuggestions,
			helpUsage: v.helpUsage,
			helpBody: chunk
		};
	})(mempty$2);
};
var parserHelp = function(pprefs) {
	return function(p) {
		var with_title = function(title) {
			return map1$2(function(v) {
				return appendWithLine(string(title))(v);
			});
		};
		var group_title = function(arr) {
			var v = uncons$3(arr);
			return with_title(fromMaybe("Available commands:")(fst(v.head)))(vcatChunks(append1$1([snd(v.head)])(map$7(snd)(v.tail))));
		};
		var cs = groupBy(on$4(eq2$1)(fst))(cmdDesc(p));
		return bodyHelp(vsepChunks(append1$1([with_title("Available options:")(fullDesc(pprefs)(p))])(map$7(group_title)(cs))));
	};
};
//#endregion
//#region output/Data.Function.Memoize/index.js
var bind$6 = /* #__PURE__ */ bind$15(bindLazy);
var NatTrie = /* #__PURE__ */ (function() {
	function NatTrie(value0, value1, value2) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
	}
	NatTrie.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return new NatTrie(value0, value1, value2);
			};
		};
	};
	return NatTrie;
})();
var tabulateNat = { tabulate: /* #__PURE__ */ (function() {
	var tabulateImpl = function(f) {
		var walk = function(v) {
			return function(v1) {
				if (v instanceof Nil$1) return v1.value0;
				if (v instanceof Cons$1 && !v.value0) return bind$6(v1.value1)(walk(v.value1));
				if (v instanceof Cons$1 && v.value0) return bind$6(v1.value2)(walk(v.value1));
				throw new Error("Failed pattern match at Data.Function.Memoize (line 172, column 7 - line 172, column 60): " + [v.constructor.name, v1.constructor.name]);
			};
		};
		var build = function(n) {
			return new NatTrie(defer(function(v) {
				return f(n);
			}), defer(function(v) {
				return build(n * 2 | 0);
			}), defer(function(v) {
				return build((n * 2 | 0) + 1 | 0);
			}));
		};
		var trie = build(0);
		var bits = (function() {
			var bits$prime = function($copy_v) {
				return function($copy_v1) {
					var $tco_var_v = $copy_v;
					var $tco_done = false;
					var $tco_result;
					function $tco_loop(v, v1) {
						if (v1 === 0) {
							$tco_done = true;
							return v;
						}
						$tco_var_v = new Cons$1((v1 & 1) !== 0, v);
						$copy_v1 = v1 >>> 1;
					}
					while (!$tco_done) $tco_result = $tco_loop($tco_var_v, $copy_v1);
					return $tco_result;
				};
			};
			return bits$prime(Nil$1.value);
		})();
		var go = function(n) {
			return walk(bits(n))(trie);
		};
		return go;
	};
	return tabulateImpl;
})() };
var tabulate = function(dict) {
	return dict.tabulate;
};
var tabulateTuple = function(dictTabulate) {
	var tabulate3 = tabulate(dictTabulate);
	return function(dictTabulate1) {
		var tabulate4 = tabulate(dictTabulate1);
		return { tabulate: function(f) {
			var f$prime = tabulate3(function(a) {
				return tabulate4(function(b) {
					return f(new Tuple(a, b));
				});
			});
			return function(v) {
				return bind$6(f$prime(v.value0))(function(g) {
					return g(v.value1);
				});
			};
		} };
	};
};
var memoize = function(dictTabulate) {
	var tabulate3 = tabulate(dictTabulate);
	return function(f) {
		var f1 = tabulate3(f);
		return function($141) {
			return force(f1($141));
		};
	};
};
var memoize2$1 = function(dictTabulate) {
	var tabulateTuple1 = tabulateTuple(dictTabulate);
	return function(dictTabulate1) {
		var memoize1 = memoize(tabulateTuple1(dictTabulate1));
		return function(f) {
			return curry(memoize1(uncurry(f)));
		};
	};
};
//#endregion
//#region output/Options.Applicative.Help.Levenshtein/index.js
var $runtime_lazy$2 = function(name, moduleName, init) {
	var state = 0;
	var val;
	return function(lineNumber) {
		if (state === 2) return val;
		if (state === 1) throw new ReferenceError(name + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
		state = 1;
		val = init();
		state = 2;
		return val;
	};
};
var memoize2 = /* #__PURE__ */ memoize2$1(tabulateNat)(tabulateNat);
var minimum = /* #__PURE__ */ minimum$1(ordInt)(/* #__PURE__ */ foldable1NonEmpty(foldableArray));
var unsafeIndex = /* #__PURE__ */ unsafeIndex$1();
var editDistance$1 = function(dictEq) {
	var eq = eq$1(dictEq);
	return function(xs) {
		return function(ys) {
			var dist = function(v) {
				return function(v1) {
					if (v === 0) return v1;
					if (v1 === 0) return v;
					return minimum(new NonEmpty($lazy_dist$prime(37)(v - 1 | 0)(v1) + 1 | 0, [$lazy_dist$prime(38)(v)(v1 - 1 | 0) + 1 | 0, (function() {
						if (eq(unsafeIndex(xs)(v - 1 | 0))(unsafeIndex(ys)(v1 - 1 | 0))) return $lazy_dist$prime(40)(v - 1 | 0)(v1 - 1 | 0);
						return 1 + $lazy_dist$prime(41)(v - 1 | 0)(v1 - 1 | 0) | 0;
					})()]));
				};
			};
			var $lazy_dist$prime = $runtime_lazy$2("dist'", "Options.Applicative.Help.Levenshtein", function() {
				return memoize2(function(a) {
					return function(b) {
						return dist(a)(b);
					};
				});
			});
			return $lazy_dist$prime(31)(length$2(xs))(length$2(ys));
		};
	};
};
//#endregion
//#region output/Options.Applicative.Extra/index.js
var un = /* #__PURE__ */ un$8();
var mempty$1 = /* #__PURE__ */ mempty$6(parserHelpMonoid);
var pure$7 = /* #__PURE__ */ pure$18(chunkApplicative);
var unWords = /* #__PURE__ */ unWords$1(foldableArray);
var append = /* #__PURE__ */ append$7(semigroupArray);
var map$6 = /* #__PURE__ */ map$20(chunkFunctor);
var map1$1 = /* #__PURE__ */ map$20(functorArray);
var fold = /* #__PURE__ */ fold$5(monoidArray);
var editDistance = /* #__PURE__ */ editDistance$1(eqChar);
var apply$1 = /* #__PURE__ */ apply$8(chunkApply);
var mempty1 = /* #__PURE__ */ mempty$6(/* #__PURE__ */ chunkMonoid$2(docSemigroup));
var fold1 = /* #__PURE__ */ fold$5(parserHelpMonoid);
var over = /* #__PURE__ */ over$5()();
var alt$1 = /* #__PURE__ */ alt$6(parserAlt);
var map3 = /* #__PURE__ */ map$20(parserFunctor);
var runParserInfo = /* #__PURE__ */ runParserInfo$2(pMonadP);
var fromFoldable = /* #__PURE__ */ fromFoldable$4(foldableArray);
var renderFailure = function(failure) {
	return function(progn) {
		var v = un(ParserFailure)(failure)(progn);
		return new Tuple(renderHelp(v.value1.value1.value0)(v.value0), v.value1.value0);
	};
};
var parserFailure = function(pprefs) {
	return function(pinfo) {
		return function(msg) {
			return function(ctx) {
				var with_context = function(arr) {
					return function(i) {
						return function(f) {
							var v = head(arr);
							if (v instanceof Nothing) return f([])(i);
							if (v instanceof Just) return runExists(function(i$prime) {
								return f(contextNames(arr))(i$prime);
							})(v.value0.value1);
							throw new Error("Failed pattern match at Options.Applicative.Extra (line 183, column 28 - line 185, column 73): " + [v.constructor.name]);
						};
					};
				};
				var usage_help = function(progn) {
					return function(names) {
						return function(v) {
							if (msg instanceof InfoMsg) return mempty$1;
							return usageHelp(vcatChunks([pure$7(parserUsage(pprefs)(v.infoParser)(unWords(append([progn])(names)))), map$6(indent(2))(v.infoProgDesc)]));
						};
					};
				};
				var suggestion_help = suggestionsHelp((function() {
					if (msg instanceof UnexpectedError) {
						var opt_completions = function(v) {
							return function(v1) {
								if (v1.optMain instanceof OptReader) return map1$1(showOption)(v1.optMain.value0);
								if (v1.optMain instanceof FlagReader) return map1$1(showOption)(v1.optMain.value0);
								if (v1.optMain instanceof ArgReader) return [];
								if (v1.optMain instanceof CmdReader) {
									if (v.hinfoUnreachableArgs) return [];
									return v1.optMain.value1;
								}
								throw new Error("Failed pattern match at Options.Applicative.Extra (line 273, column 64 - line 280, column 37): " + [v1.optMain.constructor.name]);
							};
						};
						var possibles = fold(runExists(function(zz) {
							return mapParser(opt_completions)(zz);
						})(msg.value1.value0));
						var isClose = function(a) {
							return on$4(editDistance)(toCharArray)(a)(msg.value0) < 3;
						};
						var good = filter(isClose)(possibles);
						var prose = (function() {
							if (length$2(good) < 2) return stringChunk("Did you mean this?");
							return stringChunk("Did you mean one of these?");
						})();
						return apply$1(map$6(appendWithLine)(prose))(map$6(indent(4))(vcatChunks(map1$1(stringChunk)(good))));
					}
					return mempty1;
				})());
				var show_full_help = (function() {
					if (msg instanceof ShowHelpText) return true;
					if (msg instanceof MissingError && msg.value0 instanceof CmdStart && un(ParserPrefs)(pprefs).prefShowHelpOnEmpty) return true;
					return un(ParserPrefs)(pprefs).prefShowHelpOnError;
				})();
				var exit_code = (function() {
					if (msg instanceof ErrorMsg) return un(ParserInfo)(pinfo).infoFailureCode;
					if (msg instanceof MissingError) return un(ParserInfo)(pinfo).infoFailureCode;
					if (msg instanceof ExpectsArgError) return un(ParserInfo)(pinfo).infoFailureCode;
					if (msg instanceof UnexpectedError) return un(ParserInfo)(pinfo).infoFailureCode;
					if (msg instanceof ShowHelpText) return Success$1.value;
					if (msg instanceof InfoMsg) return Success$1.value;
					throw new Error("Failed pattern match at Options.Applicative.Extra (line 171, column 17 - line 177, column 44): " + [msg.constructor.name]);
				})();
				var error_help = errorHelp((function() {
					if (msg instanceof ShowHelpText) return mempty1;
					if (msg instanceof ErrorMsg) return stringChunk(msg.value0);
					if (msg instanceof InfoMsg) return stringChunk(msg.value0);
					if (msg instanceof MissingError && msg.value0 instanceof CmdStart && un(ParserPrefs)(pprefs).prefShowHelpOnEmpty) return mempty1;
					if (msg instanceof MissingError) return runExists(function(x) {
						return chunkBeside(stringChunk("Missing:"))(missingDesc(pprefs)(x));
					})(msg.value1.value0);
					if (msg instanceof ExpectsArgError) return stringChunk("The option `" + (msg.value0 + "` expects an argument."));
					if (msg instanceof UnexpectedError) return stringChunk((function() {
						if (startsWith("-")(msg.value0)) return "Invalid option `" + (msg.value0 + "'");
						return "Invalid argument `" + (msg.value0 + "'");
					})());
					throw new Error("Failed pattern match at Options.Applicative.Extra (line 196, column 30 - line 225, column 30): " + [msg.constructor.name]);
				})());
				var base_help = function(v) {
					var h = headerHelp(v.infoHeader);
					var f = footerHelp(v.infoFooter);
					if (show_full_help) return fold1([
						h,
						f,
						parserHelp(pprefs)(v.infoParser)
					]);
					return mempty$1;
				};
				return function(progn) {
					return new Tuple(with_context(ctx)(pinfo)(function(names) {
						return function(pinfo$prime) {
							return fold1([
								base_help(pinfo$prime),
								usage_help(progn)(names)(pinfo$prime),
								suggestion_help,
								error_help
							]);
						};
					}), new Tuple(exit_code, new Tuple(un(ParserPrefs)(pprefs).prefColumns, void 0)));
				};
			};
		};
	};
};
var helper = /* #__PURE__ */ (function() {
	return abortOption(ShowHelpText.value)(fold$5(modMonoid)([
		$$long$2(optionFieldsHasName)("help"),
		$$short$1(optionFieldsHasName)("h"),
		help("Show this help text"),
		hidden
	]));
})();
var execParserPure = function(pprefs) {
	return function(pinfo) {
		return function(args) {
			var v = runP(runParserInfo(over(ParserInfo)(function(i) {
				return {
					infoFailureCode: i.infoFailureCode,
					infoFooter: i.infoFooter,
					infoFullDesc: i.infoFullDesc,
					infoHeader: i.infoHeader,
					infoPolicy: i.infoPolicy,
					infoProgDesc: i.infoProgDesc,
					infoParser: alt$1(map3(Left.create)(bashCompletionParser(pinfo)(pprefs)))(map3(Right.create)(i.infoParser))
				};
			})(pinfo))(fromFoldable(args)))(pprefs);
			if (v.value0 instanceof Right && v.value0.value0 instanceof Right) return new Success(v.value0.value0.value0);
			if (v.value0 instanceof Right && v.value0.value0 instanceof Left) return new CompletionInvoked(v.value0.value0.value0);
			if (v.value0 instanceof Left) return new Failure(parserFailure(pprefs)(pinfo)(v.value0.value0)(v.value1));
			throw new Error("Failed pattern match at Options.Applicative.Extra (line 144, column 3 - line 147, column 73): " + [v.constructor.name]);
		};
	};
};
//#endregion
//#region output/Data.Functor.Variant/index.js
var onMatch = function() {
	return function() {
		return function() {
			return function(r) {
				return function(k) {
					return function(v) {
						if (unsafeHas(v.type)(r)) return unsafeGet(v.type)(r)(v.value);
						return k(v);
					};
				};
			};
		};
	};
};
var onMatch1 = /* #__PURE__ */ onMatch()()();
var on$3 = function() {
	return function(dictIsSymbol) {
		var reflectSymbol$9 = reflectSymbol(dictIsSymbol);
		return function(p) {
			return function(f) {
				return function(g) {
					return function(r) {
						if (r.type === reflectSymbol$9(p)) return f(r.value);
						return g(r);
					};
				};
			};
		};
	};
};
var inj$1 = function() {
	return function(dictIsSymbol) {
		var reflectSymbol$10 = reflectSymbol(dictIsSymbol);
		return function(dictFunctor) {
			var map1 = map$20(dictFunctor);
			return function(p) {
				return function(value) {
					return {
						type: reflectSymbol$10(p),
						value,
						map: map1
					};
				};
			};
		};
	};
};
var functorVariantF = { map: function(f) {
	return function(a) {
		return {
			type: a.type,
			value: a.map(f)(a.value),
			map: a.map
		};
	};
} };
var case_ = function(r) {
	return unsafeCrashWith("Data.Functor.Variant: pattern match failure [" + (r.type + "]"));
};
var match$1 = function() {
	return function() {
		return function() {
			return function(r) {
				return onMatch1(r)(case_);
			};
		};
	};
};
//#endregion
//#region output/Effect.Aff/foreign.js
var Aff = function() {
	var EMPTY = {};
	var PURE = "Pure";
	var THROW = "Throw";
	var CATCH = "Catch";
	var SYNC = "Sync";
	var ASYNC = "Async";
	var BIND = "Bind";
	var BRACKET = "Bracket";
	var FORK = "Fork";
	var SEQ = "Sequential";
	var MAP = "Map";
	var APPLY = "Apply";
	var ALT = "Alt";
	var CONS = "Cons";
	var RESUME = "Resume";
	var RELEASE = "Release";
	var FINALIZER = "Finalizer";
	var FINALIZED = "Finalized";
	var FORKED = "Forked";
	function Aff(tag, _1, _2, _3) {
		this.tag = tag;
		this._1 = _1;
		this._2 = _2;
		this._3 = _3;
	}
	function AffCtr(tag) {
		var fn = function(_1, _2, _3) {
			return new Aff(tag, _1, _2, _3);
		};
		fn.tag = tag;
		return fn;
	}
	function nonCanceler(error) {
		return new Aff(PURE, void 0);
	}
	function runEff(eff) {
		try {
			eff();
		} catch (error) {
			setTimeout(function() {
				throw error;
			}, 0);
		}
	}
	function runSync(left, right, eff) {
		try {
			return right(eff());
		} catch (error) {
			return left(error);
		}
	}
	function runAsync(left, eff, k) {
		try {
			return eff(k)();
		} catch (error) {
			k(left(error))();
			return nonCanceler;
		}
	}
	var Scheduler = function() {
		var limit = 1024;
		var size = 0;
		var ix = 0;
		var queue = new Array(limit);
		var draining = false;
		function drain() {
			var thunk;
			draining = true;
			while (size !== 0) {
				size--;
				thunk = queue[ix];
				queue[ix] = void 0;
				ix = (ix + 1) % limit;
				thunk();
			}
			draining = false;
		}
		return {
			isDraining: function() {
				return draining;
			},
			enqueue: function(cb) {
				var tmp;
				if (size === limit) {
					tmp = draining;
					drain();
					draining = tmp;
				}
				queue[(ix + size) % limit] = cb;
				size++;
				if (!draining) drain();
			}
		};
	}();
	function Supervisor(util) {
		var fibers = {};
		var fiberId = 0;
		var count = 0;
		return {
			register: function(fiber) {
				var fid = fiberId++;
				fiber.onComplete({
					rethrow: true,
					handler: function(result) {
						return function() {
							count--;
							delete fibers[fid];
						};
					}
				})();
				fibers[fid] = fiber;
				count++;
			},
			isEmpty: function() {
				return count === 0;
			},
			killAll: function(killError, cb) {
				return function() {
					if (count === 0) return cb();
					var killCount = 0;
					var kills = {};
					function kill(fid) {
						kills[fid] = fibers[fid].kill(killError, function(result) {
							return function() {
								delete kills[fid];
								killCount--;
								if (util.isLeft(result) && util.fromLeft(result)) setTimeout(function() {
									throw util.fromLeft(result);
								}, 0);
								if (killCount === 0) cb();
							};
						})();
					}
					for (var k in fibers) if (fibers.hasOwnProperty(k)) {
						killCount++;
						kill(k);
					}
					fibers = {};
					fiberId = 0;
					count = 0;
					return function(error) {
						return new Aff(SYNC, function() {
							for (var k in kills) if (kills.hasOwnProperty(k)) kills[k]();
						});
					};
				};
			}
		};
	}
	var SUSPENDED = 0;
	var CONTINUE = 1;
	var STEP_BIND = 2;
	var STEP_RESULT = 3;
	var PENDING = 4;
	var RETURN = 5;
	var COMPLETED = 6;
	function Fiber(util, supervisor, aff) {
		var runTick = 0;
		var status = SUSPENDED;
		var step = aff;
		var fail = null;
		var interrupt = null;
		var bhead = null;
		var btail = null;
		var attempts = null;
		var bracketCount = 0;
		var joinId = 0;
		var joins = null;
		var rethrow = true;
		function run(localRunTick) {
			var tmp, result, attempt;
			while (true) {
				tmp = null;
				result = null;
				attempt = null;
				switch (status) {
					case STEP_BIND:
						status = CONTINUE;
						try {
							step = bhead(step);
							if (btail === null) bhead = null;
							else {
								bhead = btail._1;
								btail = btail._2;
							}
						} catch (e) {
							status = RETURN;
							fail = util.left(e);
							step = null;
						}
						break;
					case STEP_RESULT:
						if (util.isLeft(step)) {
							status = RETURN;
							fail = step;
							step = null;
						} else if (bhead === null) status = RETURN;
						else {
							status = STEP_BIND;
							step = util.fromRight(step);
						}
						break;
					case CONTINUE:
						switch (step.tag) {
							case BIND:
								if (bhead) btail = new Aff(CONS, bhead, btail);
								bhead = step._2;
								status = CONTINUE;
								step = step._1;
								break;
							case PURE:
								if (bhead === null) {
									status = RETURN;
									step = util.right(step._1);
								} else {
									status = STEP_BIND;
									step = step._1;
								}
								break;
							case SYNC:
								status = STEP_RESULT;
								step = runSync(util.left, util.right, step._1);
								break;
							case ASYNC:
								status = PENDING;
								step = runAsync(util.left, step._1, function(result) {
									return function() {
										if (runTick !== localRunTick) return;
										runTick++;
										Scheduler.enqueue(function() {
											if (runTick !== localRunTick + 1) return;
											status = STEP_RESULT;
											step = result;
											run(runTick);
										});
									};
								});
								return;
							case THROW:
								status = RETURN;
								fail = util.left(step._1);
								step = null;
								break;
							case CATCH:
								if (bhead === null) attempts = new Aff(CONS, step, attempts, interrupt);
								else attempts = new Aff(CONS, step, new Aff(CONS, new Aff(RESUME, bhead, btail), attempts, interrupt), interrupt);
								bhead = null;
								btail = null;
								status = CONTINUE;
								step = step._1;
								break;
							case BRACKET:
								bracketCount++;
								if (bhead === null) attempts = new Aff(CONS, step, attempts, interrupt);
								else attempts = new Aff(CONS, step, new Aff(CONS, new Aff(RESUME, bhead, btail), attempts, interrupt), interrupt);
								bhead = null;
								btail = null;
								status = CONTINUE;
								step = step._1;
								break;
							case FORK:
								status = STEP_RESULT;
								tmp = Fiber(util, supervisor, step._2);
								if (supervisor) supervisor.register(tmp);
								if (step._1) tmp.run();
								step = util.right(tmp);
								break;
							case SEQ:
								status = CONTINUE;
								step = sequential(util, supervisor, step._1);
								break;
						}
						break;
					case RETURN:
						bhead = null;
						btail = null;
						if (attempts === null) {
							status = COMPLETED;
							step = interrupt || fail || step;
						} else {
							tmp = attempts._3;
							attempt = attempts._1;
							attempts = attempts._2;
							switch (attempt.tag) {
								case CATCH:
									if (interrupt && interrupt !== tmp && bracketCount === 0) status = RETURN;
									else if (fail) {
										status = CONTINUE;
										step = attempt._2(util.fromLeft(fail));
										fail = null;
									}
									break;
								case RESUME:
									if (interrupt && interrupt !== tmp && bracketCount === 0 || fail) status = RETURN;
									else {
										bhead = attempt._1;
										btail = attempt._2;
										status = STEP_BIND;
										step = util.fromRight(step);
									}
									break;
								case BRACKET:
									bracketCount--;
									if (fail === null) {
										result = util.fromRight(step);
										attempts = new Aff(CONS, new Aff(RELEASE, attempt._2, result), attempts, tmp);
										if (interrupt === tmp || bracketCount > 0) {
											status = CONTINUE;
											step = attempt._3(result);
										}
									}
									break;
								case RELEASE:
									attempts = new Aff(CONS, new Aff(FINALIZED, step, fail), attempts, interrupt);
									status = CONTINUE;
									if (interrupt && interrupt !== tmp && bracketCount === 0) step = attempt._1.killed(util.fromLeft(interrupt))(attempt._2);
									else if (fail) step = attempt._1.failed(util.fromLeft(fail))(attempt._2);
									else step = attempt._1.completed(util.fromRight(step))(attempt._2);
									fail = null;
									bracketCount++;
									break;
								case FINALIZER:
									bracketCount++;
									attempts = new Aff(CONS, new Aff(FINALIZED, step, fail), attempts, interrupt);
									status = CONTINUE;
									step = attempt._1;
									break;
								case FINALIZED:
									bracketCount--;
									status = RETURN;
									step = attempt._1;
									fail = attempt._2;
									break;
							}
						}
						break;
					case COMPLETED:
						for (var k in joins) if (joins.hasOwnProperty(k)) {
							rethrow = rethrow && joins[k].rethrow;
							runEff(joins[k].handler(step));
						}
						joins = null;
						if (interrupt && fail) setTimeout(function() {
							throw util.fromLeft(fail);
						}, 0);
						else if (util.isLeft(step) && rethrow) setTimeout(function() {
							if (rethrow) throw util.fromLeft(step);
						}, 0);
						return;
					case SUSPENDED:
						status = CONTINUE;
						break;
					case PENDING: return;
				}
			}
		}
		function onComplete(join) {
			return function() {
				if (status === COMPLETED) {
					rethrow = rethrow && join.rethrow;
					join.handler(step)();
					return function() {};
				}
				var jid = joinId++;
				joins = joins || {};
				joins[jid] = join;
				return function() {
					if (joins !== null) delete joins[jid];
				};
			};
		}
		function kill(error, cb) {
			return function() {
				if (status === COMPLETED) {
					cb(util.right(void 0))();
					return function() {};
				}
				var canceler = onComplete({
					rethrow: false,
					handler: function() {
						return cb(util.right(void 0));
					}
				})();
				switch (status) {
					case SUSPENDED:
						interrupt = util.left(error);
						status = COMPLETED;
						step = interrupt;
						run(runTick);
						break;
					case PENDING:
						if (interrupt === null) interrupt = util.left(error);
						if (bracketCount === 0) {
							if (status === PENDING) attempts = new Aff(CONS, new Aff(FINALIZER, step(error)), attempts, interrupt);
							status = RETURN;
							step = null;
							fail = null;
							run(++runTick);
						}
						break;
					default:
						if (interrupt === null) interrupt = util.left(error);
						if (bracketCount === 0) {
							status = RETURN;
							step = null;
							fail = null;
						}
				}
				return canceler;
			};
		}
		function join(cb) {
			return function() {
				var canceler = onComplete({
					rethrow: false,
					handler: cb
				})();
				if (status === SUSPENDED) run(runTick);
				return canceler;
			};
		}
		return {
			kill,
			join,
			onComplete,
			isSuspended: function() {
				return status === SUSPENDED;
			},
			run: function() {
				if (status === SUSPENDED) if (!Scheduler.isDraining()) Scheduler.enqueue(function() {
					run(runTick);
				});
				else run(runTick);
			}
		};
	}
	function runPar(util, supervisor, par, cb) {
		var fiberId = 0;
		var fibers = {};
		var killId = 0;
		var kills = {};
		var early = /* @__PURE__ */ new Error("[ParAff] Early exit");
		var interrupt = null;
		var root = EMPTY;
		function kill(error, par, cb) {
			var step = par;
			var head = null;
			var tail = null;
			var count = 0;
			var kills = {};
			var tmp, kid;
			loop: while (true) {
				tmp = null;
				switch (step.tag) {
					case FORKED:
						if (step._3 === EMPTY) {
							tmp = fibers[step._1];
							kills[count++] = tmp.kill(error, function(result) {
								return function() {
									count--;
									if (count === 0) cb(result)();
								};
							});
						}
						if (head === null) break loop;
						step = head._2;
						if (tail === null) head = null;
						else {
							head = tail._1;
							tail = tail._2;
						}
						break;
					case MAP:
						step = step._2;
						break;
					case APPLY:
					case ALT:
						if (head) tail = new Aff(CONS, head, tail);
						head = step;
						step = step._1;
						break;
				}
			}
			if (count === 0) cb(util.right(void 0))();
			else {
				kid = 0;
				tmp = count;
				for (; kid < tmp; kid++) kills[kid] = kills[kid]();
			}
			return kills;
		}
		function join(result, head, tail) {
			var fail, step, lhs, rhs, tmp, kid;
			if (util.isLeft(result)) {
				fail = result;
				step = null;
			} else {
				step = result;
				fail = null;
			}
			loop: while (true) {
				lhs = null;
				rhs = null;
				tmp = null;
				kid = null;
				if (interrupt !== null) return;
				if (head === null) {
					cb(fail || step)();
					return;
				}
				if (head._3 !== EMPTY) return;
				switch (head.tag) {
					case MAP:
						if (fail === null) {
							head._3 = util.right(head._1(util.fromRight(step)));
							step = head._3;
						} else head._3 = fail;
						break;
					case APPLY:
						lhs = head._1._3;
						rhs = head._2._3;
						if (fail) {
							head._3 = fail;
							tmp = true;
							kid = killId++;
							kills[kid] = kill(early, fail === lhs ? head._2 : head._1, function() {
								return function() {
									delete kills[kid];
									if (tmp) tmp = false;
									else if (tail === null) join(fail, null, null);
									else join(fail, tail._1, tail._2);
								};
							});
							if (tmp) {
								tmp = false;
								return;
							}
						} else if (lhs === EMPTY || rhs === EMPTY) return;
						else {
							step = util.right(util.fromRight(lhs)(util.fromRight(rhs)));
							head._3 = step;
						}
						break;
					case ALT:
						lhs = head._1._3;
						rhs = head._2._3;
						if (lhs === EMPTY && util.isLeft(rhs) || rhs === EMPTY && util.isLeft(lhs)) return;
						if (lhs !== EMPTY && util.isLeft(lhs) && rhs !== EMPTY && util.isLeft(rhs)) {
							fail = step === lhs ? rhs : lhs;
							step = null;
							head._3 = fail;
						} else {
							head._3 = step;
							tmp = true;
							kid = killId++;
							kills[kid] = kill(early, step === lhs ? head._2 : head._1, function() {
								return function() {
									delete kills[kid];
									if (tmp) tmp = false;
									else if (tail === null) join(step, null, null);
									else join(step, tail._1, tail._2);
								};
							});
							if (tmp) {
								tmp = false;
								return;
							}
						}
						break;
				}
				if (tail === null) head = null;
				else {
					head = tail._1;
					tail = tail._2;
				}
			}
		}
		function resolve(fiber) {
			return function(result) {
				return function() {
					delete fibers[fiber._1];
					fiber._3 = result;
					join(result, fiber._2._1, fiber._2._2);
				};
			};
		}
		function run() {
			var status = CONTINUE;
			var step = par;
			var head = null;
			var tail = null;
			var tmp, fid;
			loop: while (true) {
				tmp = null;
				fid = null;
				switch (status) {
					case CONTINUE:
						switch (step.tag) {
							case MAP:
								if (head) tail = new Aff(CONS, head, tail);
								head = new Aff(MAP, step._1, EMPTY, EMPTY);
								step = step._2;
								break;
							case APPLY:
								if (head) tail = new Aff(CONS, head, tail);
								head = new Aff(APPLY, EMPTY, step._2, EMPTY);
								step = step._1;
								break;
							case ALT:
								if (head) tail = new Aff(CONS, head, tail);
								head = new Aff(ALT, EMPTY, step._2, EMPTY);
								step = step._1;
								break;
							default:
								fid = fiberId++;
								status = RETURN;
								tmp = step;
								step = new Aff(FORKED, fid, new Aff(CONS, head, tail), EMPTY);
								tmp = Fiber(util, supervisor, tmp);
								tmp.onComplete({
									rethrow: false,
									handler: resolve(step)
								})();
								fibers[fid] = tmp;
								if (supervisor) supervisor.register(tmp);
						}
						break;
					case RETURN:
						if (head === null) break loop;
						if (head._1 === EMPTY) {
							head._1 = step;
							status = CONTINUE;
							step = head._2;
							head._2 = EMPTY;
						} else {
							head._2 = step;
							step = head;
							if (tail === null) head = null;
							else {
								head = tail._1;
								tail = tail._2;
							}
						}
				}
			}
			root = step;
			for (fid = 0; fid < fiberId; fid++) fibers[fid].run();
		}
		function cancel(error, cb) {
			interrupt = util.left(error);
			var innerKills;
			for (var kid in kills) if (kills.hasOwnProperty(kid)) {
				innerKills = kills[kid];
				for (kid in innerKills) if (innerKills.hasOwnProperty(kid)) innerKills[kid]();
			}
			kills = null;
			var newKills = kill(error, root, cb);
			return function(killError) {
				return new Aff(ASYNC, function(killCb) {
					return function() {
						for (var kid in newKills) if (newKills.hasOwnProperty(kid)) newKills[kid]();
						return nonCanceler;
					};
				});
			};
		}
		run();
		return function(killError) {
			return new Aff(ASYNC, function(killCb) {
				return function() {
					return cancel(killError, killCb);
				};
			});
		};
	}
	function sequential(util, supervisor, par) {
		return new Aff(ASYNC, function(cb) {
			return function() {
				return runPar(util, supervisor, par, cb);
			};
		});
	}
	Aff.EMPTY = EMPTY;
	Aff.Pure = AffCtr(PURE);
	Aff.Throw = AffCtr(THROW);
	Aff.Catch = AffCtr(CATCH);
	Aff.Sync = AffCtr(SYNC);
	Aff.Async = AffCtr(ASYNC);
	Aff.Bind = AffCtr(BIND);
	Aff.Bracket = AffCtr(BRACKET);
	Aff.Fork = AffCtr(FORK);
	Aff.Seq = AffCtr(SEQ);
	Aff.ParMap = AffCtr(MAP);
	Aff.ParApply = AffCtr(APPLY);
	Aff.ParAlt = AffCtr(ALT);
	Aff.Fiber = Fiber;
	Aff.Supervisor = Supervisor;
	Aff.Scheduler = Scheduler;
	Aff.nonCanceler = nonCanceler;
	return Aff;
}();
const _pure = Aff.Pure;
const _throwError = Aff.Throw;
function _catchError(aff) {
	return function(k) {
		return Aff.Catch(aff, k);
	};
}
function _map(f) {
	return function(aff) {
		if (aff.tag === Aff.Pure.tag) return Aff.Pure(f(aff._1));
		else return Aff.Bind(aff, function(value) {
			return Aff.Pure(f(value));
		});
	};
}
function _bind(aff) {
	return function(k) {
		return Aff.Bind(aff, k);
	};
}
const _liftEffect = Aff.Sync;
function _parAffMap(f) {
	return function(aff) {
		return Aff.ParMap(f, aff);
	};
}
function _parAffApply(aff1) {
	return function(aff2) {
		return Aff.ParApply(aff1, aff2);
	};
}
const makeAff = Aff.Async;
function _makeFiber(util, aff) {
	return function() {
		return Aff.Fiber(util, null, aff);
	};
}
const _sequential = Aff.Seq;
//#endregion
//#region output/Control.Parallel.Class/index.js
var sequential = function(dict) {
	return dict.sequential;
};
var parallel$1 = function(dict) {
	return dict.parallel;
};
//#endregion
//#region output/Control.Parallel/index.js
var identity$2 = /* #__PURE__ */ identity$15(categoryFn);
var parTraverse_ = function(dictParallel) {
	var sequential$1 = sequential(dictParallel);
	var parallel = parallel$1(dictParallel);
	return function(dictApplicative) {
		var traverse_$1 = traverse_(dictApplicative);
		return function(dictFoldable) {
			var traverse_1 = traverse_$1(dictFoldable);
			return function(f) {
				var $51 = traverse_1(function($53) {
					return parallel(f($53));
				});
				return function($52) {
					return sequential$1($51($52));
				};
			};
		};
	};
};
var parSequence_$1 = function(dictParallel) {
	var parTraverse_1 = parTraverse_(dictParallel);
	return function(dictApplicative) {
		var parTraverse_2 = parTraverse_1(dictApplicative);
		return function(dictFoldable) {
			return parTraverse_2(dictFoldable)(identity$2);
		};
	};
};
//#endregion
//#region output/Effect.Unsafe/foreign.js
const unsafePerformEffect = function(f) {
	return f();
};
//#endregion
//#region output/Effect.Aff/index.js
var $runtime_lazy$1 = function(name, moduleName, init) {
	var state = 0;
	var val;
	return function(lineNumber) {
		if (state === 2) return val;
		if (state === 1) throw new ReferenceError(name + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
		state = 1;
		val = init();
		state = 2;
		return val;
	};
};
var $$void = /* #__PURE__ */ $$void$3(functorEffect);
var functorParAff = { map: _parAffMap };
var functorAff = { map: _map };
var ffiUtil = /* #__PURE__ */ (function() {
	var unsafeFromRight = function(v) {
		if (v instanceof Right) return v.value0;
		if (v instanceof Left) return unsafeCrashWith("unsafeFromRight: Left");
		throw new Error("Failed pattern match at Effect.Aff (line 412, column 21 - line 414, column 54): " + [v.constructor.name]);
	};
	var unsafeFromLeft = function(v) {
		if (v instanceof Left) return v.value0;
		if (v instanceof Right) return unsafeCrashWith("unsafeFromLeft: Right");
		throw new Error("Failed pattern match at Effect.Aff (line 407, column 20 - line 409, column 55): " + [v.constructor.name]);
	};
	var isLeft = function(v) {
		if (v instanceof Left) return true;
		if (v instanceof Right) return false;
		throw new Error("Failed pattern match at Effect.Aff (line 402, column 12 - line 404, column 21): " + [v.constructor.name]);
	};
	return {
		isLeft,
		fromLeft: unsafeFromLeft,
		fromRight: unsafeFromRight,
		left: Left.create,
		right: Right.create
	};
})();
var makeFiber = function(aff) {
	return _makeFiber(ffiUtil, aff);
};
var launchAff = function(aff) {
	return function __do() {
		var fiber = makeFiber(aff)();
		fiber.run();
		return fiber;
	};
};
var applyParAff = {
	apply: _parAffApply,
	Functor0: function() {
		return functorParAff;
	}
};
var monadAff = {
	Applicative0: function() {
		return applicativeAff;
	},
	Bind1: function() {
		return bindAff;
	}
};
var bindAff = {
	bind: _bind,
	Apply0: function() {
		return $lazy_applyAff(0);
	}
};
var applicativeAff = {
	pure: _pure,
	Apply0: function() {
		return $lazy_applyAff(0);
	}
};
var $lazy_applyAff = /* #__PURE__ */ $runtime_lazy$1("applyAff", "Effect.Aff", function() {
	return {
		apply: ap(monadAff),
		Functor0: function() {
			return functorAff;
		}
	};
});
var applyAff = /* #__PURE__ */ $lazy_applyAff(73);
var pure2$1 = /* #__PURE__ */ pure$18(applicativeAff);
var bindFlipped = /* #__PURE__ */ bindFlipped$2(bindAff);
var parallelAff = {
	parallel: unsafeCoerce,
	sequential: _sequential,
	Apply0: function() {
		return applyAff;
	},
	Apply1: function() {
		return applyParAff;
	}
};
var parallel = /* #__PURE__ */ parallel$1(parallelAff);
var parSequence_ = /* #__PURE__ */ parSequence_$1(parallelAff)({
	pure: function($76) {
		return parallel(pure2$1($76));
	},
	Apply0: function() {
		return applyParAff;
	}
})(foldableArray);
var semigroupCanceler = { append: function(v) {
	return function(v1) {
		return function(err) {
			return parSequence_([v(err), v1(err)]);
		};
	};
} };
var monadEffectAff = {
	liftEffect: _liftEffect,
	Monad0: function() {
		return monadAff;
	}
};
var liftEffect$1 = /* #__PURE__ */ liftEffect$2(monadEffectAff);
var monadThrowAff = {
	throwError: _throwError,
	Monad0: function() {
		return monadAff;
	}
};
var $$try = /* #__PURE__ */ $$try$1({
	catchError: _catchError,
	MonadThrow0: function() {
		return monadThrowAff;
	}
});
var attempt = $$try;
var runAff = function(k) {
	return function(aff) {
		return launchAff(bindFlipped(function($83) {
			return liftEffect$1(k($83));
		})($$try(aff)));
	};
};
var runAff_ = function(k) {
	return function(aff) {
		return $$void(runAff(k)(aff));
	};
};
var monoidCanceler = {
	mempty: /* @__PURE__ */ $$const(/* #__PURE__ */ pure2$1(void 0)),
	Semigroup0: function() {
		return semigroupCanceler;
	}
};
//#endregion
//#region output/Run/index.js
var $runtime_lazy = function(name, moduleName, init) {
	var state = 0;
	var val;
	return function(lineNumber) {
		if (state === 2) return val;
		if (state === 1) throw new ReferenceError(name + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
		state = 1;
		val = init();
		state = 2;
		return val;
	};
};
var map$5 = /* #__PURE__ */ map$20(functorVariantF);
var unwrap$3 = /* #__PURE__ */ unwrap$7();
var inj = /* #__PURE__ */ inj$1();
var Run = function(x) {
	return x;
};
var send = function($92) {
	return Run(liftF($92));
};
var resume = function(k1) {
	return function(k2) {
		var $93 = resume$prime(function(x) {
			return function(f) {
				return k1(map$5(function($95) {
					return Run(f($95));
				})(x));
			};
		})(k2);
		return function($94) {
			return $93(unwrap$3($94));
		};
	};
};
var peel = /* #__PURE__ */ (function() {
	return resume(Left.create)(Right.create);
})();
var run$2 = function(dictMonad) {
	var bindFlipped = bindFlipped$2(dictMonad.Bind1());
	var pure1 = pure$18(dictMonad.Applicative0());
	return function(k) {
		var $lazy_loop = $runtime_lazy("loop", "Run", function() {
			return resume(function(a) {
				return bindFlipped($lazy_loop(197))(k(a));
			})(pure1);
		});
		return $lazy_loop(196);
	};
};
var monadRun = freeMonad;
var lift$4 = function() {
	return function(dictIsSymbol) {
		var inj1 = inj(dictIsSymbol);
		return function(dictFunctor) {
			var inj2 = inj1(dictFunctor);
			return function(p) {
				var $99 = inj2(p);
				return function($100) {
					return Run(liftF($99($100)));
				};
			};
		};
	};
};
var functorRun = freeFunctor;
var expand$1 = function() {
	return unsafeCoerce;
};
var bindRun = freeBind;
var applicativeRun = freeApplicative;
//#endregion
//#region output/Z.SSBM.Slp.Port/index.js
var compare = /* #__PURE__ */ compare$2(ordInt);
var P1 = /* #__PURE__ */ (function() {
	function P1() {}
	P1.value = new P1();
	return P1;
})();
var P2 = /* #__PURE__ */ (function() {
	function P2() {}
	P2.value = new P2();
	return P2;
})();
var P3 = /* #__PURE__ */ (function() {
	function P3() {}
	P3.value = new P3();
	return P3;
})();
var P4 = /* #__PURE__ */ (function() {
	function P4() {}
	P4.value = new P4();
	return P4;
})();
var NonOEM = /* #__PURE__ */ (function() {
	function NonOEM(value0) {
		this.value0 = value0;
	}
	NonOEM.create = function(value0) {
		return new NonOEM(value0);
	};
	return NonOEM;
})();
var ofInt = function(v) {
	if (v === 1) return P1.value;
	if (v === 2) return P2.value;
	if (v === 3) return P3.value;
	if (v === 4) return P4.value;
	return new NonOEM(v);
};
var eqT = { eq: function(x) {
	return function(y) {
		if (x instanceof P1 && y instanceof P1) return true;
		if (x instanceof P2 && y instanceof P2) return true;
		if (x instanceof P3 && y instanceof P3) return true;
		if (x instanceof P4 && y instanceof P4) return true;
		if (x instanceof NonOEM && y instanceof NonOEM) return x.value0 === y.value0;
		return false;
	};
} };
var ordT = {
	compare: function(x) {
		return function(y) {
			if (x instanceof P1 && y instanceof P1) return EQ.value;
			if (x instanceof P1) return LT.value;
			if (y instanceof P1) return GT.value;
			if (x instanceof P2 && y instanceof P2) return EQ.value;
			if (x instanceof P2) return LT.value;
			if (y instanceof P2) return GT.value;
			if (x instanceof P3 && y instanceof P3) return EQ.value;
			if (x instanceof P3) return LT.value;
			if (y instanceof P3) return GT.value;
			if (x instanceof P4 && y instanceof P4) return EQ.value;
			if (x instanceof P4) return LT.value;
			if (y instanceof P4) return GT.value;
			if (x instanceof NonOEM && y instanceof NonOEM) return compare(x.value0)(y.value0);
			throw new Error("Failed pattern match at Z.SSBM.Slp.Port (line 0, column 0 - line 0, column 0): " + [x.constructor.name, y.constructor.name]);
		};
	},
	Eq0: function() {
		return eqT;
	}
};
//#endregion
//#region output/Z.Z.Core/foreign.js
const js_JsAny = (a) => a;
const js_removeNils = (o) => {
	const res = {};
	for (const k in o) {
		const v = o[k];
		if (v === null || v === void 0) continue;
		res[k] = v;
	}
	return res;
};
//#endregion
//#region output/Z.Z.Core/index.js
var JsError = function(x) {
	return x;
};
var rtErrName = function(dict) {
	return dict.rtErrName;
};
var rtErrMessage = function(dict) {
	return dict.rtErrMessage;
};
var reduceM$1 = function(dictFoldable) {
	var foldM$1 = foldM(dictFoldable);
	return function(dictMonad) {
		return foldM$1(dictMonad);
	};
};
var mapL = function(f) {
	return either(function(x) {
		return new Left(f(x));
	})(Right.create);
};
var mapFromFoldable$1 = function(dictFoldable) {
	return function(dictOrd) {
		return fromFoldable$3(dictOrd)(dictFoldable);
	};
};
var jsonRmNils = js_removeNils;
var jsAny = js_JsAny;
var invert = function(v) {
	if (v instanceof Left) return new Right(v.value0);
	if (v instanceof Right) return new Left(v.value0);
	throw new Error("Failed pattern match at Z.Z.Core (line 228, column 1 - line 228, column 55): " + [v.constructor.name]);
};
var intFromString = fromString$1;
var forM_$1 = function(dictTraversable) {
	var Foldable1 = dictTraversable.Foldable1();
	return function(dictApplicative) {
		return flip(traverse_(dictApplicative)(Foldable1));
	};
};
var fDiscard$1 = function(dictFunctor) {
	return map$20(dictFunctor)($$const(void 0));
};
var arrSize = length$2;
var arrFromFoldable$1 = function(dictFoldable) {
	return fromFoldable$5(dictFoldable);
};
var arrDrop = function(n) {
	return function(a) {
		return slice(n)(arrSize(a))(a);
	};
};
//#endregion
//#region output/Data.Argonaut.Parser/foreign.js
function _jsonParser(fail, succ, s) {
	try {
		return succ(JSON.parse(s));
	} catch (e) {
		return fail(e.message);
	}
}
//#endregion
//#region output/Data.Argonaut.Parser/index.js
var jsonParser = function(j) {
	return _jsonParser(Left.create, Right.create, j);
};
//#endregion
//#region output/Data.Argonaut.Decode.Parser/index.js
var parseJson = /* #__PURE__ */ (function() {
	var $3 = lmap$2(bifunctorEither)(function(v) {
		return new TypeMismatch$1("JSON");
	});
	return function($4) {
		return $3(jsonParser($4));
	};
})();
//#endregion
//#region output/Data.Argonaut.Decode/index.js
var composeKleisli = /* #__PURE__ */ composeKleisli$1(bindEither);
var fromJsonString = function(dictDecodeJson) {
	return composeKleisli(parseJson)(decodeJson$1(dictDecodeJson));
};
//#endregion
//#region output/Z.Z.Util/index.js
var show1$1 = /* #__PURE__ */ show$2(showJsonDecodeError$1);
var JsonDecodeError = function(x) {
	return x;
};
var showJsonDecodeError = { show: function(v) {
	return show1$1(v);
} };
var nth = index;
var id = function(a) {
	return a;
};
var decodeJson = function(dictDecodeJson) {
	var $230 = mapL(JsonDecodeError);
	var $231 = decodeJson$1(dictDecodeJson);
	return function($232) {
		return $230($231($232));
	};
};
var decodeFailTypeMismatch = function($233) {
	return Left.create(TypeMismatch$1.create($233));
};
var decode = function(dictDecodeJson) {
	var $236 = mapL(JsonDecodeError);
	var $237 = fromJsonString(dictDecodeJson);
	return function($238) {
		return $236($237($238));
	};
};
var baseDecodeJson$1 = function(dictDecodeJson) {
	return decodeJson$1(dictDecodeJson);
};
//#endregion
//#region output/Z.Sys.Module/index.js
var ReadError = /* #__PURE__ */ (function() {
	function ReadError(value0) {
		this.value0 = value0;
	}
	ReadError.create = function(value0) {
		return new ReadError(value0);
	};
	return ReadError;
})();
var DecodeError = /* #__PURE__ */ (function() {
	function DecodeError(value0) {
		this.value0 = value0;
	}
	DecodeError.create = function(value0) {
		return new DecodeError(value0);
	};
	return DecodeError;
})();
//#endregion
//#region output/Z.Sys.Node.Impl/foreign.js
const js_readTextFile = (p) => () => fs.readFile(p, "utf-8");
const js_exit = (code) => () => process.exit(code);
const js_errorLog = (a) => () => console.error(a);
const js_pathDirname = (p) => path.dirname(p);
const js_pathJoin = (p1) => (p2) => path.join(p1, p2);
const js_pathJoinAbs = (p1) => (p2) => p2.startsWith("/") ? p2 : path.join(p1, p2);
const js_wd = () => process.cwd();
const js_argv = () => process.argv;
const js_envPaths = (app) => (opts) => () => envPaths(app, opts);
const js_envCfg = (envPaths) => envPaths.config;
const js_envTmp = (envPaths) => envPaths.temp;
const js_platform = () => os.platform();
const js_loadYaml = (s) => (left) => (right) => {
	try {
		return right(yaml.load(s));
	} catch (e) {
		return left(e);
	}
};
//#endregion
//#region output/Z.Z.X/foreign.js
const basePath = await (async () => {
	try {
		const { fileURLToPath } = await import("node:url");
		const path = await import("node:path");
		const fullPath = fileURLToPath(import.meta.url);
		return path.dirname(path.dirname(path.dirname(fullPath)));
	} catch (_e) {
		return;
	}
})();
function replaceBasePath(s) {
	if (!basePath) return s;
	return s.replaceAll(basePath, ".");
}
function js_getStack() {
	const traceTarget = {};
	Error.captureStackTrace(traceTarget, js_getStack);
	return replaceBasePath(traceTarget.stack.split("\n").slice(1).map((s) => s.trim())[2].replaceAll("<anonymous> ", "").trim());
}
const colors = {
	reset: "\x1B[0m",
	red: "\x1B[31m",
	green: "\x1B[32m",
	yellow: "\x1B[33m",
	blue: "\x1B[34m",
	magenta: "\x1B[35m",
	cyan: "\x1B[36m",
	white: "\x1B[37m",
	gray: "\x1B[90m",
	Bred: "\x1B[91m",
	Bgreen: "\x1B[92m",
	Byellow: "\x1B[93m",
	Bblue: "\x1B[94m",
	Bmagenta: "\x1B[95m",
	Bcyan: "\x1B[96m",
	Bwhite: "\x1B[97m"
};
const cl = "﹃";
const cr = "﹄";
const js_consoleDirectFn = (prop) => (arg) => () => {
	const fn = {
		log: console.log,
		error: console.error
	}[prop];
	fn(arg);
};
const js_consoleFn = (prop) => (src) => (args) => {
	const stackStr = src ? ` ${colors.gray}${src.substring(3)}` : "";
	const fn = {
		log: console.warn,
		warn: console.warn,
		error: console.error
	}[prop];
	const propColor = {
		log: colors.cyan,
		warn: colors.Byellow,
		error: colors.red
	}[prop];
	const propLabel = {
		log: "logInfo",
		warn: "logWarning",
		error: "logError"
	}[prop];
	const nowMS = Date.now();
	const divTime = (curr, d) => [curr % d, Math.floor(curr / d)];
	const [ms, nowS] = divTime(nowMS, 1e3);
	const [s, nowM] = divTime(nowS, 60);
	const [m, nowH] = divTime(nowM, 60);
	const h = (nowH + 19) % 24;
	const mPad = m < 10 ? `0${m}` : `${m}`;
	const sPad = s < 10 ? `0${s}` : `${s}`;
	const msPad = s < 10 ? `00${ms}` : ms < 100 ? `0${ms}` : `${ms}`;
	const l1Parts = [
		colors.magenta,
		"χ::",
		propColor,
		propLabel,
		stackStr,
		colors.blue,
		` ${h}:${mPad}:${sPad}.${msPad} `,
		colors.magenta,
		cl,
		colors.reset
	];
	return () => {
		fn(l1Parts.join(""));
		console.group();
		fn(...args);
		console.groupEnd();
		fn(`${colors.magenta}${cr}`, colors.reset);
	};
};
//#endregion
//#region output/Control.Promise/foreign.js
function thenImpl(promise) {
	return function(errCB) {
		return function(succCB) {
			return function() {
				promise.then(succCB, errCB);
			};
		};
	};
}
//#endregion
//#region output/Foreign/foreign.js
function tagOf(value) {
	return Object.prototype.toString.call(value).slice(8, -1);
}
Array.isArray;
//#endregion
//#region output/Foreign/index.js
var TypeMismatch = /* #__PURE__ */ (function() {
	function TypeMismatch(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	TypeMismatch.create = function(value0) {
		return function(value1) {
			return new TypeMismatch(value0, value1);
		};
	};
	return TypeMismatch;
})();
var unsafeFromForeign = unsafeCoerce;
var fail = function(dictMonad) {
	var $153 = throwError$1(monadThrowExceptT(dictMonad));
	return function($154) {
		return $153(singleton$3($154));
	};
};
var unsafeReadTagged$1 = function(dictMonad) {
	var pure1 = pure$18(applicativeExceptT(dictMonad));
	var fail1 = fail(dictMonad);
	return function(tag) {
		return function(value) {
			if (tagOf(value) === tag) return pure1(unsafeFromForeign(value));
			return fail1(new TypeMismatch(tag, tagOf(value)));
		};
	};
};
var readString$1 = function(dictMonad) {
	return unsafeReadTagged$1(dictMonad)("String");
};
//#endregion
//#region output/Control.Promise/index.js
var voidRight = /* #__PURE__ */ voidRight$2(functorEffect);
var mempty = /* #__PURE__ */ mempty$6(monoidCanceler);
var identity$1 = /* #__PURE__ */ identity$15(categoryFn);
var alt = /* #__PURE__ */ alt$6(/* #__PURE__ */ altExceptT$1(semigroupNonEmptyList)(monadIdentity));
var unsafeReadTagged = /* #__PURE__ */ unsafeReadTagged$1(monadIdentity);
var map$4 = /* #__PURE__ */ map$20(/* #__PURE__ */ functorExceptT(functorIdentity));
var readString = /* #__PURE__ */ readString$1(monadIdentity);
var toAff$prime = function(customCoerce) {
	return function(p) {
		return makeAff(function(cb) {
			return voidRight(mempty)(thenImpl(p)(function($14) {
				return cb(Left.create(customCoerce($14)))();
			})(function($15) {
				return cb(Right.create($15))();
			}));
		});
	};
};
var coerce = function(fn) {
	return either(function(v) {
		return error("Promise failed, couldn't extract JS Error or String");
	})(identity$1)(runExcept$1(alt(unsafeReadTagged("Error")(fn))(map$4(error)(readString(fn)))));
};
var toAff = /* #__PURE__ */ toAff$prime(coerce);
//#endregion
//#region output/Data.Lens.Barlow/index.js
var barlow1 = function() {
	return function(dictConstructBarlow) {
		var constructBarlow$1 = constructBarlow(dictConstructBarlow);
		return { barlowImpl: function(v) {
			return constructBarlow$1($$Proxy.value);
		} };
	};
};
var barlow2 = /* #__PURE__ */ barlow1();
var barlowImpl = function(dict) {
	return dict.barlowImpl;
};
var barlow$1 = function() {
	return function(dictConstructBarlow) {
		var barlowImpl1 = barlowImpl(barlow2(dictConstructBarlow));
		return function(dictIsSymbol) {
			return barlowImpl1($$Proxy.value);
		};
	};
};
//#endregion
//#region output/Data.Lens.Fold/index.js
var unwrap$2 = /* #__PURE__ */ unwrap$7();
var foldMapOf = /* #__PURE__ */ under()()(Forget);
var preview = function(p) {
	var $135 = foldMapOf(p)(function($137) {
		return First(Just.create($137));
	});
	return function($136) {
		return unwrap$2($135($136));
	};
};
//#endregion
//#region output/Data.Lens.Getter/index.js
var unwrap$1 = /* #__PURE__ */ unwrap$7();
var identity = /* #__PURE__ */ identity$15(categoryFn);
var view = function(l) {
	return unwrap$1(l(identity));
};
//#endregion
//#region output/Run.Except/index.js
var on$2 = /* #__PURE__ */ on$3();
var pure$6 = /* #__PURE__ */ pure$18(applicativeRun);
var bind$5 = /* #__PURE__ */ bind$15(bindRun);
var lift$3 = /* #__PURE__ */ lift$4();
var exceptIsSymbol = { reflectSymbol: function() {
	return "except";
} };
var Except = function(x) {
	return x;
};
var runExceptAt = function(dictIsSymbol) {
	var on1 = on$2(dictIsSymbol);
	return function() {
		return function(sym) {
			var handle = on1(sym)(Left.create)(Right.create);
			var loop = function(r) {
				var v = peel(r);
				if (v instanceof Left) {
					var v1 = handle(v.value0);
					if (v1 instanceof Left) return pure$6(new Left(v1.value0));
					if (v1 instanceof Right) return bind$5(send(v1.value0))(loop);
					throw new Error("Failed pattern match at Run.Except (line 163, column 15 - line 167, column 29): " + [v1.constructor.name]);
				}
				if (v instanceof Right) return pure$6(new Right(v.value0));
				throw new Error("Failed pattern match at Run.Except (line 162, column 12 - line 169, column 21): " + [v.constructor.name]);
			};
			return loop;
		};
	};
};
var functorExcept = { map: function(f) {
	return function(m) {
		return m;
	};
} };
var liftExceptAt = function(dictIsSymbol) {
	var lift1 = lift$3(dictIsSymbol)(functorExcept);
	return function() {
		return lift1;
	};
};
var throwAt = function(dictIsSymbol) {
	var liftExceptAt1 = liftExceptAt(dictIsSymbol)();
	return function() {
		return function(sym) {
			var $74 = liftExceptAt1(sym);
			return function($75) {
				return $74(Except($75));
			};
		};
	};
};
var _except = /* #__PURE__ */ (function() {
	return $$Proxy.value;
})();
var runExcept = /* #__PURE__ */ runExceptAt(exceptIsSymbol)()(_except);
var $$throw = /* #__PURE__ */ throwAt(exceptIsSymbol)()(_except);
//#endregion
//#region output/Run.State/index.js
var on$1 = /* #__PURE__ */ on$3();
var bind$4 = /* #__PURE__ */ bind$15(bindRun);
var pure$5 = /* #__PURE__ */ pure$18(applicativeRun);
var map$3 = /* #__PURE__ */ map$20(functorFn);
var lift$2 = /* #__PURE__ */ lift$4();
var stateIsSymbol = { reflectSymbol: function() {
	return "state";
} };
var State = /* #__PURE__ */ (function() {
	function State(value0, value1) {
		this.value0 = value0;
		this.value1 = value1;
	}
	State.create = function(value0) {
		return function(value1) {
			return new State(value0, value1);
		};
	};
	return State;
})();
var runStateAt = function(dictIsSymbol) {
	var on1 = on$1(dictIsSymbol);
	return function() {
		return function(sym) {
			var handle = on1(sym)(Left.create)(Right.create);
			var loop = function($copy_s) {
				return function($copy_r) {
					var $tco_var_s = $copy_s;
					var $tco_done = false;
					var $tco_result;
					function $tco_loop(s, r) {
						var v = peel(r);
						if (v instanceof Left) {
							var v1 = handle(v.value0);
							if (v1 instanceof Left) {
								var s$prime = v1.value0.value0(s);
								$tco_var_s = s$prime;
								$copy_r = v1.value0.value1(s$prime);
								return;
							}
							if (v1 instanceof Right) {
								$tco_done = true;
								return bind$4(send(v1.value0))(runStateAt(dictIsSymbol)()(sym)(s));
							}
							throw new Error("Failed pattern match at Run.State (line 117, column 15 - line 124, column 41): " + [v1.constructor.name]);
						}
						if (v instanceof Right) {
							$tco_done = true;
							return pure$5(new Tuple(s, v.value0));
						}
						throw new Error("Failed pattern match at Run.State (line 116, column 14 - line 126, column 23): " + [v.constructor.name]);
					}
					while (!$tco_done) $tco_result = $tco_loop($tco_var_s, $copy_r);
					return $tco_result;
				};
			};
			return loop;
		};
	};
};
var functorState = { map: function(f) {
	return function(m) {
		return new State(m.value0, map$3(f)(m.value1));
	};
} };
var liftStateAt = function(dictIsSymbol) {
	var lift1 = lift$2(dictIsSymbol)(functorState);
	return function() {
		return lift1;
	};
};
var modifyAt = function(dictIsSymbol) {
	var liftStateAt1 = liftStateAt(dictIsSymbol)();
	return function() {
		return function(sym) {
			return function(f) {
				return liftStateAt1(sym)(new State(f, $$const(void 0)));
			};
		};
	};
};
var _state = /* #__PURE__ */ (function() {
	return $$Proxy.value;
})();
var modify = /* #__PURE__ */ modifyAt(stateIsSymbol)()(_state);
var runState = /* #__PURE__ */ runStateAt(stateIsSymbol)()(_state);
//#endregion
//#region output/Run.Writer/index.js
var on = /* #__PURE__ */ on$3();
var bind$3 = /* #__PURE__ */ bind$15(bindRun);
var pure$4 = /* #__PURE__ */ pure$18(applicativeRun);
var writerIsSymbol = { reflectSymbol: function() {
	return "writer";
} };
var foldWriterAt = function(dictIsSymbol) {
	var on1 = on(dictIsSymbol);
	return function() {
		return function(sym) {
			var handle = on1(sym)(Left.create)(Right.create);
			var loop = function($copy_k) {
				return function($copy_w) {
					return function($copy_r) {
						var $tco_var_k = $copy_k;
						var $tco_var_w = $copy_w;
						var $tco_done = false;
						var $tco_result;
						function $tco_loop(k, w, r) {
							var v = peel(r);
							if (v instanceof Left) {
								var v1 = handle(v.value0);
								if (v1 instanceof Left) {
									$tco_var_k = k;
									$tco_var_w = k(w)(v1.value0.value0);
									$copy_r = v1.value0.value1;
									return;
								}
								if (v1 instanceof Right) {
									$tco_done = true;
									return bind$3(send(v1.value0))(foldWriterAt(dictIsSymbol)()(sym)(k)(w));
								}
								throw new Error("Failed pattern match at Run.Writer (line 101, column 15 - line 105, column 45): " + [v1.constructor.name]);
							}
							if (v instanceof Right) {
								$tco_done = true;
								return pure$4(new Tuple(w, v.value0));
							}
							throw new Error("Failed pattern match at Run.Writer (line 100, column 16 - line 107, column 23): " + [v.constructor.name]);
						}
						while (!$tco_done) $tco_result = $tco_loop($tco_var_k, $tco_var_w, $copy_r);
						return $tco_result;
					};
				};
			};
			return loop;
		};
	};
};
var runWriterAt = function(dictIsSymbol) {
	var foldWriterAt1 = foldWriterAt(dictIsSymbol)();
	return function(dictMonoid) {
		var append = append$7(dictMonoid.Semigroup0());
		var mempty = mempty$6(dictMonoid);
		return function() {
			return function(sym) {
				return foldWriterAt1(sym)(append)(mempty);
			};
		};
	};
};
var runWriterAt1 = /* #__PURE__ */ runWriterAt(writerIsSymbol);
var _writer = /* #__PURE__ */ (function() {
	return $$Proxy.value;
})();
var runWriter = function(dictMonoid) {
	return runWriterAt1(dictMonoid)()(_writer);
};
var defaultArray = { "default": [] };
var $$default = function(dict) {
	return dict["default"];
};
var auto = function(dictDefaultable) {
	var default1 = $$default(dictDefaultable);
	return function(f) {
		return f(default1);
	};
};
var orDefault = function(dictDefaultable) {
	var $17 = auto(dictDefaultable);
	var $18 = flip(fromMaybe);
	return function($19) {
		return $17($18($19));
	};
};
//#endregion
//#region output/Z.Z.X/index.js
var mapFlipped$2 = /* #__PURE__ */ mapFlipped$4(functorRun);
var pure$3 = /* #__PURE__ */ pure$18(applicativeRun);
var bind$2 = /* #__PURE__ */ bind$15(bindRun);
var discard$3 = /* #__PURE__ */ discard$7(discardUnit)(bindRun);
var reduceM = /* #__PURE__ */ reduceM$1(foldableArray)(monadRun);
var map$2 = /* #__PURE__ */ map$20(functorAff);
var bind1$1 = /* #__PURE__ */ bind$15(bindAff);
var liftEffect = /* #__PURE__ */ liftEffect$2(monadEffectAff);
var xBaseIsSymbol = { reflectSymbol: function() {
	return "xBase";
} };
var run$1 = /* #__PURE__ */ run$2(monadAff);
var match = /* #__PURE__ */ match$1()()();
var fDiscard = /* #__PURE__ */ fDiscard$1(functorRun);
var lift$1 = /* #__PURE__ */ lift$4();
var LogCmd = /* #__PURE__ */ (function() {
	function LogCmd(value0, value1, value2, value3) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
		this.value3 = value3;
	}
	LogCmd.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return function(value3) {
					return new LogCmd(value0, value1, value2, value3);
				};
			};
		};
	};
	return LogCmd;
})();
var LogDirectCmd = /* #__PURE__ */ (function() {
	function LogDirectCmd(value0, value1, value2) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
	}
	LogDirectCmd.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return new LogDirectCmd(value0, value1, value2);
			};
		};
	};
	return LogDirectCmd;
})();
var AffCmd = /* #__PURE__ */ (function() {
	function AffCmd(value0) {
		this.value0 = value0;
	}
	AffCmd.create = function(value0) {
		return new AffCmd(value0);
	};
	return AffCmd;
})();
var xTry = runExcept;
var xRunS = function(i) {
	return function(m) {
		return mapFlipped$2(runState(i)(m))(fst);
	};
};
var xOk = function(v) {
	if (v instanceof Left) return $$throw(v.value0);
	if (v instanceof Right) return pure$3(v.value0);
	throw new Error("Failed pattern match at Z.Z.X (line 446, column 1 - line 446, column 55): " + [v.constructor.name]);
};
var xModify = function(f) {
	return modify(f);
};
var xListen$1 = function(dictMonoid) {
	return runWriter(dictMonoid);
};
var xInvert = function(r) {
	return bind$2(mapFlipped$2(xTry(r))(invert))(xOk);
};
var xTryUntil = function(try1) {
	return function(tryRest) {
		return xInvert(bind$2(xInvert(try1))(function(e1) {
			return reduceM(function(e) {
				return function(tryN) {
					return xInvert(tryN(e));
				};
			})(e1)(tryRest);
		}));
	};
};
var xFail = function(e) {
	return $$throw(e);
};
var xBindE = function(h) {
	return function(m) {
		var onDone = function(v) {
			if (v instanceof Left) return h(v.value0);
			if (v instanceof Right) return pure$3(v.value0);
			throw new Error("Failed pattern match at Z.Z.X (line 425, column 3 - line 425, column 30): " + [v.constructor.name]);
		};
		return bind$2(runExcept(m))(onDone);
	};
};
var xMapE = function(f) {
	return function(m) {
		return xBindE(function($169) {
			return xFail(f($169));
		})(m);
	};
};
var promiseToAff = toAff;
var handleXBase = function(v) {
	if (v instanceof LogCmd) return discard$3(pure$3(unsafePerformEffect(js_consoleFn(v.value0)(v.value1)([v.value2]))))(function() {
		return pure$3(v.value3);
	});
	if (v instanceof LogDirectCmd) return discard$3(pure$3(unsafePerformEffect(js_consoleDirectFn(v.value0)(v.value1))))(function() {
		return pure$3(v.value2);
	});
	throw new Error("Failed pattern match at Z.Z.X (line 586, column 15 - line 592, column 11): " + [v.constructor.name]);
};
var lift1 = /* #__PURE__ */ lift$1(xBaseIsSymbol)({ map: function(f) {
	return function(m) {
		if (m instanceof LogCmd) return new LogCmd(m.value0, m.value1, m.value2, f(m.value3));
		if (m instanceof LogDirectCmd) return new LogDirectCmd(m.value0, m.value1, f(m.value2));
		throw new Error("Failed pattern match at Z.Z.X (line 0, column 0 - line 0, column 0): " + [m.constructor.name]);
	};
} });
var lift2 = /* #__PURE__ */ lift$1({ reflectSymbol: function() {
	return "aff";
} })({ map: function(f) {
	return function(m) {
		return new AffCmd(map$2(f)(m.value0));
	};
} });
var effectPromiseToAff = function(e) {
	return bind1$1(liftEffect(e))(promiseToAff);
};
var _eff = /* #__PURE__ */ (function() {
	return $$Proxy.value;
})();
var runXBase = /* #__PURE__ */ run$2(monadRun)(/* #__PURE__ */ on$3()(xBaseIsSymbol)(_eff)(handleXBase)(send));
var xEvalAff = function(x) {
	return run$1(match({ aff: function(v) {
		return v.value0;
	} }))(runXBase(x));
};
var xExecAff = function($173) {
	return xEvalAff(xTry($173));
};
var xLogCmd = function(k) {
	return function(v) {
		var src = unsafePerformEffect(js_getStack);
		return fDiscard(lift1(_eff)(new LogCmd(k, src, jsAny(v), void 0)));
	};
};
var xInfo = /* #__PURE__ */ xLogCmd("log");
var xLogWarning = /* #__PURE__ */ xLogCmd("warn");
var xOutErr = function(v) {
	return fDiscard(lift1(_eff)(new LogDirectCmd("error", jsAny(v), void 0)));
};
var _aff = /* #__PURE__ */ (function() {
	return $$Proxy.value;
})();
var aff = function(f) {
	return lift2(_aff)(new AffCmd(f));
};
var xAff = function(a) {
	return bind$2(aff(attempt(a)))(function(res) {
		return xMapE(JsError)(xOk(res));
	});
};
var xEffectPromise = function($174) {
	return xAff(effectPromiseToAff($174));
};
//#endregion
//#region output/Z.Sys.Node.Impl/index.js
var pure$2 = /* #__PURE__ */ pure$18(applicativeRun);
var encodeJson$1 = /* #__PURE__ */ encodeJson$2(/* #__PURE__ */ encodeRecord(/* #__PURE__ */ gEncodeJsonCons(/* #__PURE__ */ encodeJsonMaybe(encodeJsonJString))(gEncodeJsonNil)({ reflectSymbol: function() {
	return "suffix";
} })())());
var map$1 = /* #__PURE__ */ map$20(functorFn);
var discard$2 = /* #__PURE__ */ discard$7(discardUnit);
var pure1 = /* #__PURE__ */ pure$18(applicativeEffect);
var discard2 = /* #__PURE__ */ discard$2(bindRun);
var bind$1 = /* #__PURE__ */ bind$15(bindRun);
var xNodeIsSymbol = { reflectSymbol: function() {
	return "xNode";
} };
var xListen = /* #__PURE__ */ xListen$1(monoidArray);
var expand = /* #__PURE__ */ expand$1();
var when$1 = /* #__PURE__ */ when$2(applicativeRun);
var Win32 = /* #__PURE__ */ (function() {
	function Win32() {}
	Win32.value = new Win32();
	return Win32;
})();
var Darwin = /* #__PURE__ */ (function() {
	function Darwin() {}
	Darwin.value = new Darwin();
	return Darwin;
})();
var Linux = /* #__PURE__ */ (function() {
	function Linux() {}
	Linux.value = new Linux();
	return Linux;
})();
var Android = /* #__PURE__ */ (function() {
	function Android() {}
	Android.value = new Android();
	return Android;
})();
var FreeBSD = /* #__PURE__ */ (function() {
	function FreeBSD() {}
	FreeBSD.value = new FreeBSD();
	return FreeBSD;
})();
var OpenBSD = /* #__PURE__ */ (function() {
	function OpenBSD() {}
	OpenBSD.value = new OpenBSD();
	return OpenBSD;
})();
var Unknown = /* #__PURE__ */ (function() {
	function Unknown() {}
	Unknown.value = new Unknown();
	return Unknown;
})();
var Path = function(x) {
	return x;
};
var WdCmd = /* #__PURE__ */ (function() {
	function WdCmd(value0) {
		this.value0 = value0;
	}
	WdCmd.create = function(value0) {
		return new WdCmd(value0);
	};
	return WdCmd;
})();
var FullArgvCmd = /* #__PURE__ */ (function() {
	function FullArgvCmd(value0) {
		this.value0 = value0;
	}
	FullArgvCmd.create = function(value0) {
		return new FullArgvCmd(value0);
	};
	return FullArgvCmd;
})();
var PlatformCmd = /* #__PURE__ */ (function() {
	function PlatformCmd(value0) {
		this.value0 = value0;
	}
	PlatformCmd.create = function(value0) {
		return new PlatformCmd(value0);
	};
	return PlatformCmd;
})();
var EnvPathsCmd = /* #__PURE__ */ (function() {
	function EnvPathsCmd(value0, value1, value2) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
	}
	EnvPathsCmd.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return new EnvPathsCmd(value0, value1, value2);
			};
		};
	};
	return EnvPathsCmd;
})();
var toPlatform = function(v) {
	if (v === "win32") return Win32.value;
	if (v === "darwin") return Darwin.value;
	if (v === "linux") return Linux.value;
	if (v === "android") return Android.value;
	if (v === "freebsd") return FreeBSD.value;
	if (v === "openbsd") return OpenBSD.value;
	return Unknown.value;
};
var showPath = { show: function(v) {
	return v;
} };
var pathlikeString = { pathStr: function(s) {
	return s;
} };
var pathlikePath = { pathStr: function(v) {
	return v;
} };
var pathStr = function(dict) {
	return dict.pathStr;
};
var readTextFile = function(dictPathlike) {
	var $136 = pathStr(dictPathlike);
	return function($137) {
		return xEffectPromise(js_readTextFile($136($137)));
	};
};
var readTextFile1 = /* #__PURE__ */ readTextFile(pathlikeString);
var pathJoinAbs$1 = function(dictPathlike) {
	var pathStr1 = pathStr(dictPathlike);
	return function(dictPathlike1) {
		var pathStr2 = pathStr(dictPathlike1);
		return function(p1) {
			return function(p2) {
				return js_pathJoinAbs(pathStr1(p1))(pathStr2(p2));
			};
		};
	};
};
var pathJoin$1 = function(dictPathlike) {
	var pathStr1 = pathStr(dictPathlike);
	return function(dictPathlike1) {
		var pathStr2 = pathStr(dictPathlike1);
		return function(p1) {
			return function(p2) {
				return js_pathJoin(pathStr1(p1))(pathStr2(p2));
			};
		};
	};
};
var handleXNode = function(v) {
	if (v instanceof WdCmd) return pure$2(v.value0(unsafePerformEffect(js_wd)));
	if (v instanceof FullArgvCmd) return pure$2(v.value0(unsafePerformEffect(js_argv)));
	if (v instanceof PlatformCmd) return pure$2(v.value0(unsafePerformEffect(js_platform)));
	if (v instanceof EnvPathsCmd) return pure$2(v.value2(unsafePerformEffect(js_envPaths(v.value0)(jsonRmNils(encodeJson$1({ suffix: v.value1 }))))));
	throw new Error("Failed pattern match at Z.Sys.Node.Impl (line 282, column 15 - line 287, column 65): " + [v.constructor.name]);
};
var lift = /* #__PURE__ */ lift$4()(xNodeIsSymbol)({ map: function(f) {
	return function(m) {
		if (m instanceof WdCmd) return new WdCmd(map$1(f)(m.value0));
		if (m instanceof FullArgvCmd) return new FullArgvCmd(map$1(f)(m.value0));
		if (m instanceof PlatformCmd) return new PlatformCmd(map$1(f)(m.value0));
		if (m instanceof EnvPathsCmd) return new EnvPathsCmd(m.value0, m.value1, map$1(f)(m.value2));
		throw new Error("Failed pattern match at Z.Sys.Node.Impl (line 0, column 0 - line 0, column 0): " + [m.constructor.name]);
	};
} });
var execAndExit = function(dictRtError) {
	var rtErrName$1 = rtErrName(dictRtError);
	var rtErrMessage$1 = rtErrMessage(dictRtError);
	return function(a) {
		var onDone = function(v) {
			if (v instanceof Left) return function __do() {
				js_errorLog("process failed with UNHANDLED UNKNOWN error ⌄")();
				js_errorLog(v.value0)();
				return js_exit(125)();
			};
			if (v instanceof Right && v.value0 instanceof Left) return function __do() {
				js_errorLog("process failed with known error [| " + (rtErrName$1(v.value0.value0) + " |] ⌄"))();
				js_errorLog(rtErrMessage$1(v.value0.value0))();
				return js_exit(1)();
			};
			return pure1(void 0);
		};
		return runAff_(onDone)(a);
	};
};
var eqPlatform = { eq: function(x) {
	return function(y) {
		if (x instanceof Win32 && y instanceof Win32) return true;
		if (x instanceof Darwin && y instanceof Darwin) return true;
		if (x instanceof Linux && y instanceof Linux) return true;
		if (x instanceof Android && y instanceof Android) return true;
		if (x instanceof FreeBSD && y instanceof FreeBSD) return true;
		if (x instanceof OpenBSD && y instanceof OpenBSD) return true;
		if (x instanceof Unknown && y instanceof Unknown) return true;
		return false;
	};
} };
var envTmp = function($144) {
	return Path(js_envTmp($144));
};
var envCfg = function($146) {
	return Path(js_envCfg($146));
};
var dirname$1 = function(dictPathlike) {
	var pathStr1 = pathStr(dictPathlike);
	return function(p) {
		return js_pathDirname(pathStr1(p));
	};
};
var decodeYamlString = function(dictDecodeJson) {
	var decodeJson$2 = decodeJson(dictDecodeJson);
	return function(contents) {
		return bind$1(xOk(mapL(ReadError.create)(js_loadYaml(contents)(Left.create)(Right.create))))(function(json) {
			return xOk(mapL(DecodeError.create)(decodeJson$2(json)));
		});
	};
};
var decodeTextFile$1 = function(dictPathlike) {
	var readTextFile2 = readTextFile(dictPathlike);
	return function(dictDecodeJson) {
		var decode$2 = decode(dictDecodeJson);
		return function(p) {
			return bind$1(xMapE(ReadError.create)(readTextFile2(p)))(function(contents) {
				return xOk(mapL(DecodeError.create)(decode$2(contents)));
			});
		};
	};
};
var decodeAnyYamlExt$1 = function(dictPathlike) {
	var pathStr1 = pathStr(dictPathlike);
	var readTextFile2 = readTextFile(dictPathlike);
	return function(dictDecodeJson) {
		var decodeYamlString1 = decodeYamlString(dictDecodeJson);
		return function(p) {
			return bind$1(xTryUntil(xMapE(ReadError.create)(readTextFile1(pathStr1(p) + ".yaml")))([$$const(xMapE(ReadError.create)(readTextFile1(pathStr1(p) + ".json"))), $$const(xMapE(ReadError.create)(readTextFile2(p)))]))(function(contents) {
				return decodeYamlString1(contents);
			});
		};
	};
};
var _xNode = /* #__PURE__ */ (function() {
	return $$Proxy.value;
})();
var argv = /* #__PURE__ */ (function() {
	return lift(_xNode)(new FullArgvCmd(arrDrop(2)));
})();
var envPaths$1 = function(appName) {
	return function(suffix) {
		return lift(_xNode)(new EnvPathsCmd(appName, suffix, id));
	};
};
var platform = /* #__PURE__ */ (function() {
	return lift(_xNode)(new PlatformCmd(toPlatform));
})();
var runXNode = /* #__PURE__ */ run$2(monadRun)(/* #__PURE__ */ on$3()(xNodeIsSymbol)(_xNode)(handleXNode)(send));
var xExecAndExit = function(dictRtError) {
	var execAndExit1 = execAndExit(dictRtError);
	return function(m) {
		return execAndExit1(xExecAff(bind$1(xListen(expand(runXNode(m))))(function(v) {
			return discard2(when$1(arrSize(v.value0) > 0)(discard2(xLogWarning("collected warnings ⌄"))(function() {
				return xLogWarning(v.value0);
			})))(function() {
				return pure$2(v.value1);
			});
		})));
	};
};
var xExecAndExitArgv = function(dictRtError) {
	var xExecAndExit1 = xExecAndExit(dictRtError);
	return function(fm) {
		return xExecAndExit1(bind$1(argv)(fm));
	};
};
var wd = /* #__PURE__ */ (function() {
	return lift(_xNode)(new WdCmd(Path));
})();
//#endregion
//#region output/Z.Sys.Node.Opt/index.js
var discard$1 = /* #__PURE__ */ discard$7(discardUnit)(bindRun);
var pure$1 = /* #__PURE__ */ pure$18(applicativeRun);
var argParse = function(opts) {
	return function(args) {
		return function(fm) {
			var handleParse = function(v) {
				if (v instanceof Success) return fm(v.value0);
				if (v instanceof Failure) return discard$1(xOutErr(renderFailure(v.value0)("slp-rec").value0))(function() {
					return pure$1(void 0);
				});
				return pure$1(void 0);
			};
			return handleParse(execParserPure(defaultPrefs)(opts)(args));
		};
	};
};
//#endregion
//#region output/Z.Z.Shorthand/index.js
var barlow = /* #__PURE__ */ barlow$1();
var mapFlipped$1 = /* #__PURE__ */ mapFlipped$4(functorMaybe);
var mfirst = function(v) {
	return function(v1) {
		if (v instanceof Nothing) return v1;
		return v;
	};
};
var jOrE = function(e) {
	return function(m) {
		return fromMaybe(new Left(e))(mapFlipped$1(m)(Right.create));
	};
};
var jOr = fromMaybe;
var gmOr$prime_$1 = function() {
	return function(dictConstructBarlow) {
		var barlow1 = barlow(dictConstructBarlow);
		return function(dictIsSymbol) {
			var barlow2 = barlow1(dictIsSymbol);
			return function(dictDefaultable) {
				var orDefault$1 = orDefault(dictDefaultable);
				return function(d) {
					return orDefault$1(preview(barlow2)(d));
				};
			};
		};
	};
};
var g_$1 = function() {
	return function(dictConstructBarlow) {
		var barlow1 = barlow(dictConstructBarlow);
		return function(dictIsSymbol) {
			return view(barlow1(dictIsSymbol));
		};
	};
};
//#endregion
//#region output/Z.Z.String/index.js
var strSplit = split$1;
//#endregion
//#region output/Z.SSBM.Slp.Rec.Node.Impl/index.js
var bind = /* #__PURE__ */ bind$15(bindEither);
var bind1 = /* #__PURE__ */ bind$15(bindMaybe);
var pure = /* #__PURE__ */ pure$18(applicativeEither);
var show1 = /* #__PURE__ */ show$2(showJsonDecodeError);
var encodeJson = /* #__PURE__ */ encodeJson$2(/* #__PURE__ */ encodeRecord(gEncodeJsonNil)());
var mapFlipped = /* #__PURE__ */ mapFlipped$4(functorEither);
var baseDecodeJson = /* #__PURE__ */ baseDecodeJson$1(decodeJsonString);
var map = /* #__PURE__ */ map$20(parserFunctor);
var apply = /* #__PURE__ */ apply$8(parserApply);
var append1 = /* #__PURE__ */ append$7(modSemigroup);
var metavar = /* #__PURE__ */ metavar$1(argumentFieldsHasMetavar);
var optional = /* #__PURE__ */ optional$1(parserAlt)(parserApplicative);
var $$long = /* #__PURE__ */ $$long$2(optionFieldsHasName);
var $$short = /* #__PURE__ */ $$short$1(optionFieldsHasName);
var metavar1 = /* #__PURE__ */ metavar$1(optionFieldsHasMetavar);
var show2 = /* #__PURE__ */ show$2(showPath);
var pathJoin = /* #__PURE__ */ pathJoin$1(pathlikePath);
var pathJoin1 = /* #__PURE__ */ pathJoin(pathlikeString);
var apApplyFlipped = /* #__PURE__ */ apApplyFlipped$1(parserApply);
var append2 = /* #__PURE__ */ append$7(infoModSemigroup);
var arrFromFoldable = /* #__PURE__ */ arrFromFoldable$1(foldableList);
var bind2 = /* #__PURE__ */ bind$15(bindRun);
var pure2 = /* #__PURE__ */ pure$18(applicativeRun);
var mapFromFoldable = /* #__PURE__ */ mapFromFoldable$1(foldableList)(ordT);
var map1 = /* #__PURE__ */ map$20(functorList);
var unwrap = /* #__PURE__ */ unwrap$7();
var discard = /* #__PURE__ */ discard$7(discardUnit)(bindRun);
var dirname = /* #__PURE__ */ dirname$1(pathlikePath);
var includesIsSymbol = { reflectSymbol: function() {
	return "includes";
} };
var gmOr$prime_ = /* #__PURE__ */ gmOr$prime_$1()(/* #__PURE__ */ constructBarlowTConsRecor1(includesIsSymbol)(/* #__PURE__ */ constructBarlowTConsQuest(/* #__PURE__ */ choiceForget(monoidFirst)))()()(strongForget))({ reflectSymbol: function() {
	return "includes?";
} })(defaultArray);
var when = /* #__PURE__ */ when$2(applicativeRun);
var forM_ = /* #__PURE__ */ forM_$1(traversableArray)(applicativeRun);
var pathJoinAbs = /* #__PURE__ */ pathJoinAbs$1(pathlikePath)(pathlikeString);
var gDecodeJsonCons = /* #__PURE__ */ gDecodeJsonCons$1(/* #__PURE__ */ decodeFieldMaybe(decodeJsonString));
var isoPathIsSymbol = { reflectSymbol: function() {
	return "isoPath";
} };
var pathJoin2 = /* #__PURE__ */ pathJoin(pathlikePath);
var pathJoin3 = /* #__PURE__ */ pathJoin$1(pathlikeString);
var pathJoin4 = /* #__PURE__ */ pathJoin3(pathlikePath);
var eq2 = /* #__PURE__ */ eq$1(eqPlatform);
var pathJoin5 = /* #__PURE__ */ pathJoin3(pathlikeString);
var mapFlipped1 = /* #__PURE__ */ mapFlipped$4(functorRun);
var settingsIsSymbol = { reflectSymbol: function() {
	return "settings";
} };
var decodeTextFile = /* #__PURE__ */ decodeTextFile$1(pathlikePath)(/* #__PURE__ */ decodeRecord(/* #__PURE__ */ gDecodeJsonCons$1(/* #__PURE__ */ decodeFieldId(/* #__PURE__ */ decodeRecord(/* #__PURE__ */ gDecodeJsonCons$1(/* #__PURE__ */ decodeFieldId(decodeJsonString))(gDecodeJsonNil)(isoPathIsSymbol)()())()))(gDecodeJsonNil)(settingsIsSymbol)()())());
var mapFlipped2 = /* #__PURE__ */ mapFlipped$4(functorMaybe);
var g_ = /* #__PURE__ */ g_$1();
var g_1 = /* #__PURE__ */ g_(/* #__PURE__ */ constructBarlowTConsRecor1(settingsIsSymbol)(/* #__PURE__ */ constructBarlowTConsRecor(isoPathIsSymbol)()()(strongForget))()()(strongForget))({ reflectSymbol: function() {
	return "settings.isoPath";
} });
var g_2 = /* #__PURE__ */ g_(/* #__PURE__ */ constructBarlowTConsExcla(/* #__PURE__ */ constructBarlowTConsRecor({ reflectSymbol: function() {
	return "configPaths";
} })()()(strongForget))()(profunctorForget))({ reflectSymbol: function() {
	return "!.configPaths";
} });
var LReset = /* #__PURE__ */ (function() {
	function LReset() {}
	LReset.value = new LReset();
	return LReset;
})();
var LCons = /* #__PURE__ */ (function() {
	function LCons(value0) {
		this.value0 = value0;
	}
	LCons.create = function(value0) {
		return new LCons(value0);
	};
	return LCons;
})();
var IniMod = /* #__PURE__ */ (function() {
	function IniMod(value0, value1, value2) {
		this.value0 = value0;
		this.value1 = value1;
		this.value2 = value2;
	}
	IniMod.create = function(value0) {
		return function(value1) {
			return function(value2) {
				return new IniMod(value0, value1, value2);
			};
		};
	};
	return IniMod;
})();
var NoIso = /* #__PURE__ */ (function() {
	function NoIso() {}
	NoIso.value = new NoIso();
	return NoIso;
})();
var ConfigNotFound = /* #__PURE__ */ (function() {
	function ConfigNotFound(value0) {
		this.value0 = value0;
	}
	ConfigNotFound.create = function(value0) {
		return new ConfigNotFound(value0);
	};
	return ConfigNotFound;
})();
var ConfigDecodeErr = /* #__PURE__ */ (function() {
	function ConfigDecodeErr(value0) {
		this.value0 = value0;
	}
	ConfigDecodeErr.create = function(value0) {
		return new ConfigDecodeErr(value0);
	};
	return ConfigDecodeErr;
})();
var CliOpts = function(x) {
	return x;
};
var portCostumeOfStr = function(s) {
	var esplit = strSplit("=")(s);
	return bind(jOrE("Expected `$port:$costume` => `[1|2|3|4]=[1|2|3|4|5|6]")(bind1(nth(esplit)(0))(intFromString)))(function(p) {
		return bind(jOrE("Expected `$port:$costume` => `[1|2|3|4]=[1|2|3|4|5|6]")(bind1(nth(esplit)(1))(intFromString)))(function(c) {
			return pure(new Tuple(ofInt(p), c));
		});
	});
};
var optJson = function(dictDecodeJson) {
	var decode$1 = decode(dictDecodeJson);
	return eitherReader(function(s) {
		return mapL(show1)(decode$1("\"" + (s + "\"")));
	});
};
var mergeListOps = function(dictFoldable) {
	var foldlDefault$1 = foldlDefault(dictFoldable);
	return function(l) {
		return function(ops) {
			var folder = function(v) {
				return function(v1) {
					if (v1 instanceof LReset) return Nil$1.value;
					if (v1 instanceof LCons) return new Cons$1(v1.value0, v);
					throw new Error("Failed pattern match at Z.SSBM.Slp.Rec.Node.Impl (line 67, column 3 - line 67, column 24): " + [v.constructor.name, v1.constructor.name]);
				};
			};
			return foldlDefault$1(folder)(l)(ops);
		};
	};
};
var mergeListOps1 = /* #__PURE__ */ mergeListOps(foldableList);
var mergeMListOps = function(dictFoldable) {
	var mergeListOps2 = mergeListOps(dictFoldable);
	return function(v) {
		return function(v1) {
			if (v1 instanceof Nothing) return v;
			if (v1 instanceof Just) return mergeListOps2(v)(v1.value0);
			throw new Error("Failed pattern match at Z.SSBM.Slp.Rec.Node.Impl (line 70, column 1 - line 71, column 72): " + [v.constructor.name, v1.constructor.name]);
		};
	};
};
var mergeMListOps1 = /* #__PURE__ */ mergeMListOps(foldableArray);
var updateEnv = function(cfg) {
	return function(st) {
		return {
			isoPath: mfirst(cfg.isoPath)(st.isoPath),
			tempPath: st.tempPath,
			texturePaths: mergeMListOps1(st.texturePaths)(cfg.texturePaths),
			iniMods: mergeMListOps1(st.iniMods)(cfg.iniMods),
			geckoCodes: mergeMListOps1(st.geckoCodes)(cfg.geckoCodes),
			geckoEnables: mergeMListOps1(st.geckoEnables)(cfg.geckoEnables),
			geckoDisables: mergeMListOps1(st.geckoDisables)(cfg.geckoDisables)
		};
	};
};
var iniModOfStr = function(s) {
	var csplit = strSplit(":")(s);
	return bind(jOrE("Expected `$ini:$prop=$val`")(nth(csplit)(0)))(function(i) {
		return bind(jOrE("Expected `$ini:$prop=$val`")(nth(csplit)(1)))(function(rest) {
			var rsplit = strSplit("=")(rest);
			return bind(jOrE("Expected `$ini:$prop=$val`")(nth(rsplit)(0)))(function(p) {
				return bind(jOrE("Expected `$ini:$prop=$val`")(nth(rsplit)(1)))(function(v) {
					return pure(new IniMod(i, p, v));
				});
			});
		});
	});
};
var errorRtError = {
	rtErrExtra: function(v) {
		return encodeJson({});
	},
	rtErrName: function(v) {
		if (v instanceof NoIso) return "melee iso not found";
		if (v instanceof ConfigNotFound) return "config file not found";
		if (v instanceof ConfigDecodeErr) return "config file invalid type";
		throw new Error("Failed pattern match at Z.SSBM.Slp.Rec.Node.Impl (line 387, column 1 - line 395, column 44): " + [v.constructor.name]);
	},
	rtErrMessage: function(v) {
		if (v instanceof NoIso) return "please supply via opt `-i %ISO_PATH%`";
		if (v instanceof ConfigNotFound) return v.value0;
		if (v instanceof ConfigDecodeErr) return show1(v.value0);
		throw new Error("Failed pattern match at Z.SSBM.Slp.Rec.Node.Impl (line 387, column 1 - line 395, column 44): " + [v.constructor.name]);
	}
};
var decodeListOp = function(dictDecodeJson) {
	var baseDecodeJson1 = baseDecodeJson$1(dictDecodeJson);
	return { decodeJson: function(x) {
		var decodeCons = mapFlipped(baseDecodeJson1(x))(LCons.create);
		var onString = function(v) {
			if (v === ":") return pure(LReset.value);
			return decodeCons;
		};
		return caseJsonString(decodeCons)(onString)(x);
	} };
};
var gDecodeJsonCons1 = /* #__PURE__ */ gDecodeJsonCons$1(/* #__PURE__ */ decodeFieldMaybe(/* #__PURE__ */ decodeArray(/* #__PURE__ */ decodeListOp(decodeJsonString))));
var optJsonListOp = function(dictDecodeJson) {
	return optJson(decodeListOp(dictDecodeJson));
};
var optJsonListOp1 = /* #__PURE__ */ optJsonListOp(decodeJsonString);
var optJsonListOp2 = /* #__PURE__ */ optJsonListOp({ decodeJson: function(x) {
	var onEor = function(v) {
		if (v instanceof Right) return pure(v.value0);
		if (v instanceof Left) return decodeFailTypeMismatch(v.value0);
		throw new Error("Failed pattern match at Z.SSBM.Slp.Rec.Node.Impl (line 240, column 5 - line 240, column 29): " + [v.constructor.name]);
	};
	return bind(mapFlipped(baseDecodeJson(x))(portCostumeOfStr))(onEor);
} });
var decodeJsonIniMod = { decodeJson: function(x) {
	var onEor = function(v) {
		if (v instanceof Right) return pure(v.value0);
		if (v instanceof Left) return decodeFailTypeMismatch(v.value0);
		throw new Error("Failed pattern match at Z.SSBM.Slp.Rec.Node.Impl (line 209, column 5 - line 209, column 29): " + [v.constructor.name]);
	};
	return bind(mapFlipped(baseDecodeJson(x))(iniModOfStr))(onEor);
} };
var optJsonListOp3 = /* #__PURE__ */ optJsonListOp(decodeJsonIniMod);
var decodeAnyYamlExt = /* #__PURE__ */ decodeAnyYamlExt$1(pathlikePath)(/* #__PURE__ */ decodeRecord(/* #__PURE__ */ gDecodeJsonCons(/* #__PURE__ */ gDecodeJsonCons1(/* #__PURE__ */ gDecodeJsonCons1(/* #__PURE__ */ gDecodeJsonCons1(/* #__PURE__ */ gDecodeJsonCons$1(/* #__PURE__ */ decodeFieldMaybe(/* #__PURE__ */ decodeArray(decodeJsonString)))(/* #__PURE__ */ gDecodeJsonCons$1(/* #__PURE__ */ decodeFieldMaybe(/* #__PURE__ */ decodeArray(/* #__PURE__ */ decodeListOp(decodeJsonIniMod))))(/* #__PURE__ */ gDecodeJsonCons(/* #__PURE__ */ gDecodeJsonCons(/* #__PURE__ */ gDecodeJsonCons(/* #__PURE__ */ gDecodeJsonCons1(gDecodeJsonNil)({ reflectSymbol: function() {
	return "texturePaths";
} })()())({ reflectSymbol: function() {
	return "tempPath";
} })()())({ reflectSymbol: function() {
	return "slippiPlaybackBin";
} })()())(isoPathIsSymbol)()())({ reflectSymbol: function() {
	return "iniMods";
} })()())(includesIsSymbol)()())({ reflectSymbol: function() {
	return "geckoEnables";
} })()())({ reflectSymbol: function() {
	return "geckoDisables";
} })()())({ reflectSymbol: function() {
	return "geckoCodes";
} })()())({ reflectSymbol: function() {
	return "ffmpegBin";
} })()())());
var cliOpts = function(wd) {
	var optsProd = function(a) {
		return function(b) {
			return function(c) {
				return function(d) {
					return function(e) {
						return function(f) {
							return function(g) {
								return function(h) {
									return function(i) {
										return function(j) {
											return function(k) {
												return function(l) {
													return function(m) {
														return function(n) {
															return function(o) {
																return {
																	recPath: a,
																	startFrame: b,
																	totalFrames: c,
																	outputPath: d,
																	isoPath: e,
																	texturePaths: f,
																	colorOverrides: g,
																	iniMods: h,
																	geckoCodes: i,
																	geckoEnables: j,
																	geckoDisables: k,
																	tempPath: l,
																	configPaths: m,
																	slippiPlaybackBin: n,
																	ffmpegBin: o
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
	return map(CliOpts)(apply(apply(apply(apply(apply(apply(apply(apply(apply(apply(apply(apply(apply(apply(map(optsProd)(strArgument(append1(metavar("SLP_FILE"))(help(".slp file to record")))))(optional(option($$int)(append1(append1($$long("start-frame"))(append1($$short("s"))(metavar1("INT"))))(help("First frame to begin recording (default: `GAME_FRAME_START`)"))))))(optional(option($$int)(append1(append1($$long("total-frames"))(append1($$short("t"))(metavar1("INT"))))(help("Total frames to record (default: `all remaining`)"))))))(optional(strOption(append1(append1($$long("output"))(append1($$short("o"))(metavar1("MP4"))))(help("Output file (default: " + (show2(pathJoin1(wd)("output.mp4")) + ")")))))))(optional(strOption(append1(append1($$long("iso"))(append1($$short("i"))(metavar1("ISO"))))(help("melee iso file (default: `slippi-launcher config`)"))))))(many(option(optJsonListOp1)(append1(append1($$long("texture-path"))(append1($$short("x"))(metavar1("DIR"))))(help("directory with texture overrides"))))))(many(option(optJsonListOp2)(append1(append1($$long("port-costume"))(append1($$short("p"))(metavar1("PORTC"))))(help("port costume overrides. PORTC => `$port=$costime` => `[1|2|3|4]=[1|2|3|4|5|6]`"))))))(many(option(optJsonListOp3)(append1(append1($$long("ini-mod"))(append1($$short("I"))(metavar1("INI_MOD"))))(help("slippi ini overrides. INI_MOD => `$ini:$prop=$val` => `[Dolphin|GFX|Logger]:$prop=$val"))))))(many(option(optJsonListOp1)(append1(append1($$long("gecko-code"))(append1($$short("g"))(metavar1("CODE"))))(help("raw string containing code to directly include while recording"))))))(many(option(optJsonListOp1)(append1(append1($$long("gecko-enable"))(append1($$short("+"))(metavar1("NAME"))))(help("name of gecko codes to force enable"))))))(many(option(optJsonListOp1)(append1(append1($$long("gecko-disable"))(append1($$short("_"))(metavar1("NAME"))))(help("name of gecko codes to force disable"))))))(optional(strOption(append1(append1($$long("temp-path"))(append1($$short("T"))(metavar1("DIR"))))(help("directory with store temporary recording files"))))))(many(strOption(append1(append1($$long("config"))(append1($$short("c"))(metavar1("FILE"))))(help("config files to source"))))))(optional(strOption(append1(append1($$long("slippi-playback"))(append1($$short("S"))(metavar1("BIN"))))(help("slippi-playback binary path"))))))(optional(strOption(append1(append1($$long("ffmpeg"))(append1($$short("F"))(metavar1("BIN"))))(help("ffmpeg binary path"))))));
};
var slpRecInfo = function(wd) {
	return info(apApplyFlipped(cliOpts(wd))(helper))(append2(fullDesc$1)(append2(progDesc("record SLP to MP4"))(header("slp-rec | @dz-ssbm | .slp recording"))));
};
var arrMergeListOpts = function(dictFoldable) {
	var mergeListOps2 = mergeListOps(dictFoldable);
	return function(a) {
		return function(b) {
			return arrFromFoldable(mergeListOps2(a)(b));
		};
	};
};
var arrMergeListOpts1 = /* #__PURE__ */ arrMergeListOpts(foldableList);
var finalizeEnv = function(st) {
	return function(v) {
		return function(defaultOutputPath) {
			return bind2(xOk(jOrE(NoIso.value)(st.isoPath)))(function(isoPath) {
				return pure2({
					isoPath,
					outputPath: jOr(defaultOutputPath)(v.outputPath),
					startFrame: v.startFrame,
					totalFrames: v.totalFrames,
					recPath: v.recPath,
					tempPath: jOr(st.tempPath)(v.tempPath),
					texturePaths: arrMergeListOpts1(st.texturePaths)(v.texturePaths),
					iniMods: arrMergeListOpts1(st.iniMods)(v.iniMods),
					geckoCodes: arrMergeListOpts1(st.geckoCodes)(v.geckoCodes),
					geckoEnables: arrMergeListOpts1(st.geckoEnables)(v.geckoEnables),
					geckoDisables: arrMergeListOpts1(st.geckoDisables)(v.geckoDisables),
					colorOverrides: mapFromFoldable(map1(unwrap)(mergeListOps1(Nil$1.value)(v.colorOverrides))),
					slippiPlaybackBin: "slippi-playback",
					ffmpegBin: "ffmpeg"
				});
			});
		};
	};
};
var addConfigs = function(allowFNF) {
	return function(wd) {
		return function(configPaths) {
			var onDecode = function(v) {
				return function(v1) {
					if (v1 instanceof Right) return discard(xModify(updateEnv(v1.value0)))(function() {
						return addConfigs(false)(dirname(v))(gmOr$prime_(v1.value0));
					});
					if (v1 instanceof Left && v1.value0 instanceof ReadError) return when(!allowFNF)(xFail(new ConfigNotFound(show2(v))));
					if (v1 instanceof Left && v1.value0 instanceof DecodeError) return xFail(new ConfigDecodeErr(v1.value0.value0));
					throw new Error("Failed pattern match at Z.SSBM.Slp.Rec.Node.Impl (line 19, column 3 - line 21, column 68): " + [v.constructor.name, v1.constructor.name]);
				};
			};
			return forM_(configPaths)(function(configPath) {
				var fullPath = pathJoinAbs(wd)(configPath);
				return bind2(xTry(decodeAnyYamlExt(fullPath)))(onDecode(fullPath));
			});
		};
	};
};
var run = function(args) {
	return bind2(wd)(function(wd) {
		return bind2(envPaths$1("slp-rec")(new Just("")))(function(envPaths) {
			return bind2(platform)(function(platform) {
				var cfgPath = envCfg(envPaths);
				var tmpPath = envTmp(envPaths);
				return bind2(mapFlipped1(xTry(decodeTextFile(pathJoin2(cfgPath)(pathJoin4("..")(pathJoin4((function() {
					if (eq2(platform)(Win32.value)) return "..";
					return ".";
				})())(pathJoin5("Slippi Launcher")("Settings")))))))(hush))(function(launcherSettings) {
					var envStateInit = {
						isoPath: mapFlipped2(launcherSettings)(g_1),
						tempPath: show2(tmpPath),
						texturePaths: Nil$1.value,
						iniMods: Nil$1.value,
						geckoCodes: Nil$1.value,
						geckoEnables: Nil$1.value,
						geckoDisables: Nil$1.value
					};
					return argParse(slpRecInfo(wd))(args)(function(opts) {
						var optConfigs = arrFromFoldable(g_2(opts));
						var noOptConfigs = arrSize(optConfigs) === 0;
						var baseConfigPath = show2(pathJoin1(cfgPath)("config"));
						var configs = (function() {
							if (noOptConfigs) return [baseConfigPath];
							return optConfigs;
						})();
						return bind2(xRunS(envStateInit)(addConfigs(noOptConfigs)(wd)(configs)))(function(envState) {
							return bind2(finalizeEnv(envState)(opts)(show2(pathJoin1(wd)("output.mp4"))))(function(env) {
								return xInfo(env);
							});
						});
					});
				});
			});
		});
	});
};
//#endregion
//#region index.js
(/* @__PURE__ */ xExecAndExitArgv(errorRtError)(run))();
//#endregion
export {};
