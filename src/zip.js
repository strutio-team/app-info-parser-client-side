"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Unzip = require('isomorphic-unzip');
var _require = require('./utils'),
  isBrowser = _require.isBrowser,
  decodeNullUnicode = _require.decodeNullUnicode;
var Zip = /*#__PURE__*/function () {
  function Zip(file) {
    _classCallCheck(this, Zip);
    if (isBrowser()) {
      if (!(file instanceof window.Blob || typeof file.size !== 'undefined')) {
        throw new Error('Param error: [file] must be an instance of Blob or File in browser.');
      }
      this.file = file;
    } else {
      if (typeof file !== 'string') {
        throw new Error('Param error: [file] must be file path in Node.');
      }
      this.file = require('path').resolve(file);
    }
    this.unzip = new Unzip(this.file);
  }

  /**
   * get entries by regexps, the return format is: { <filename>: <Buffer|Blob> }
   * @param {Array} regexps // regexps for matching files
   * @param {String} type // return type, can be buffer or blob, default buffer
   */
  return _createClass(Zip, [{
    key: "getEntries",
    value: function getEntries(regexps) {
      var _this = this;
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'buffer';
      regexps = regexps.map(function (regex) {
        return decodeNullUnicode(regex);
      });
      return new Promise(function (resolve, reject) {
        _this.unzip.getBuffer(regexps, {
          type: type
        }, function (err, buffers) {
          err ? reject(err) : resolve(buffers);
        });
      });
    }
    /**
     * get entry by regex, return an instance of Buffer or Blob
     * @param {Regex} regex // regex for matching file
     * @param {String} type // return type, can be buffer or blob, default buffer
     */
  }, {
    key: "getEntry",
    value: function getEntry(regex) {
      var _this2 = this;
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'buffer';
      regex = decodeNullUnicode(regex);
      return new Promise(function (resolve, reject) {
        _this2.unzip.getBuffer([regex], {
          type: type
        }, function (err, buffers) {
          err ? reject(err) : resolve(buffers[regex]);
        });
      });
    }
  }]);
}();
module.exports = Zip;