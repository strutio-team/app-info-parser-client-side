"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var parsePlist = require('plist').parse;
var parseBplist = require('bplist-parser').parseBuffer;
var cgbiToPng = require('cgbi-to-png');
var Zip = require('./zip');
var _require = require('./utils'),
  findIpaIconPath = _require.findIpaIconPath,
  getBase64FromBuffer = _require.getBase64FromBuffer,
  isBrowser = _require.isBrowser;
var PlistName = new RegExp('payload/[^/]+?.app/info.plist$', 'i');
var ProvisionName = /payload\/.+?\.app\/embedded.mobileprovision/;
var IpaParser = /*#__PURE__*/function (_Zip) {
  /**
   * parser for parsing .ipa file
   * @param {String | File | Blob} file // file's path in Node, instance of File or Blob in Browser
   */
  function IpaParser(file) {
    var _this;
    _classCallCheck(this, IpaParser);
    _this = _callSuper(this, IpaParser, [file]);
    if (!(_this instanceof IpaParser)) {
      return _possibleConstructorReturn(_this, new IpaParser(file));
    }
    return _this;
  }
  _inherits(IpaParser, _Zip);
  return _createClass(IpaParser, [{
    key: "parse",
    value: function parse() {
      var _this2 = this;
      return new Promise(function (resolve, reject) {
        _this2.getEntries([PlistName, ProvisionName]).then(function (buffers) {
          if (!buffers[PlistName]) {
            throw new Error('Info.plist can\'t be found.');
          }
          var plistInfo = _this2._parsePlist(buffers[PlistName]);
          // parse mobile provision
          var provisionInfo = _this2._parseProvision(buffers[ProvisionName]);
          plistInfo.mobileProvision = provisionInfo;

          // find icon path and parse icon
          var iconRegex = new RegExp(findIpaIconPath(plistInfo).toLowerCase());
          _this2.getEntry(iconRegex).then(function (iconBuffer) {
            try {
              // In general, the ipa file's icon has been specially processed, should be converted
              plistInfo.icon = iconBuffer ? getBase64FromBuffer(cgbiToPng.revert(iconBuffer)) : null;
            } catch (err) {
              if (isBrowser()) {
                // Normal conversion in other cases
                plistInfo.icon = iconBuffer ? getBase64FromBuffer(window.btoa(String.fromCharCode.apply(String, _toConsumableArray(iconBuffer)))) : null;
              } else {
                plistInfo.icon = null;
                console.warn('[Warning] failed to parse icon: ', err);
              }
            }
            resolve(plistInfo);
          })["catch"](function (e) {
            reject(e);
          });
        })["catch"](function (e) {
          reject(e);
        });
      });
    }
    /**
     * Parse plist
     * @param {Buffer} buffer // plist file's buffer
     */
  }, {
    key: "_parsePlist",
    value: function _parsePlist(buffer) {
      var result;
      var bufferType = buffer[0];
      if (bufferType === 60 || bufferType === '<' || bufferType === 239) {
        result = parsePlist(buffer.toString());
      } else if (bufferType === 98) {
        result = parseBplist(buffer)[0];
      } else {
        throw new Error('Unknown plist buffer type.');
      }
      return result;
    }
    /**
     * parse provision
     * @param {Buffer} buffer // provision file's buffer
     */
  }, {
    key: "_parseProvision",
    value: function _parseProvision(buffer) {
      var info = {};
      if (buffer) {
        var content = buffer.toString('utf-8');
        var firstIndex = content.indexOf('<?xml');
        var endIndex = content.indexOf('</plist>');
        content = content.slice(firstIndex, endIndex + 8);
        if (content) {
          info = parsePlist(content);
        }
      }
      return info;
    }
  }]);
}(Zip);
module.exports = IpaParser;