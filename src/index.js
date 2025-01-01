"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var ApkParser = require('./apk');
var IpaParser = require('./ipa');
var supportFileTypes = ['ipa', 'apk'];
var AppInfoParser = /*#__PURE__*/function () {
  /**
   * parser for parsing .ipa or .apk file
   * @param {String | File | Blob} file // file's path in Node, instance of File or Blob in Browser
   */
  function AppInfoParser(file) {
    _classCallCheck(this, AppInfoParser);
    if (!file) {
      throw new Error('Param miss: file(file\'s path in Node, instance of File or Blob in browser).');
    }
    var splits = (file.name || file).split('.');
    var fileType = splits[splits.length - 1].toLowerCase();
    if (!supportFileTypes.includes(fileType)) {
      throw new Error('Unsupported file type, only support .ipa or .apk file.');
    }
    this.file = file;
    switch (fileType) {
      case 'ipa':
        this.parser = new IpaParser(this.file);
        break;
      case 'apk':
        this.parser = new ApkParser(this.file);
        break;
    }
  }
  return _createClass(AppInfoParser, [{
    key: "parse",
    value: function parse() {
      return this.parser.parse();
    }
  }]);
}();
module.exports = AppInfoParser;