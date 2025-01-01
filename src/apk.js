"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
var Zip = require('./zip');
var _require = require('./utils'),
  mapInfoResource = _require.mapInfoResource,
  findApkIconPath = _require.findApkIconPath,
  getBase64FromBuffer = _require.getBase64FromBuffer;
var ManifestName = /^androidmanifest\.xml$/;
var ResourceName = /^resources\.arsc$/;
var ManifestXmlParser = require('./xml-parser/manifest');
var ResourceFinder = require('./resource-finder');
var ApkParser = /*#__PURE__*/function (_Zip) {
  /**
   * parser for parsing .apk file
   * @param {String | File | Blob} file // file's path in Node, instance of File or Blob in Browser
   */
  function ApkParser(file) {
    var _this;
    _classCallCheck(this, ApkParser);
    _this = _callSuper(this, ApkParser, [file]);
    if (!(_this instanceof ApkParser)) {
      return _possibleConstructorReturn(_this, new ApkParser(file));
    }
    return _this;
  }
  _inherits(ApkParser, _Zip);
  return _createClass(ApkParser, [{
    key: "parse",
    value: function parse() {
      var _this2 = this;
      return new Promise(function (resolve, reject) {
        _this2.getEntries([ManifestName, ResourceName]).then(function (buffers) {
          if (!buffers[ManifestName]) {
            throw new Error('AndroidManifest.xml can\'t be found.');
          }
          var apkInfo = _this2._parseManifest(buffers[ManifestName]);
          var resourceMap;
          if (!buffers[ResourceName]) {
            resolve(apkInfo);
          } else {
            // parse resourceMap
            resourceMap = _this2._parseResourceMap(buffers[ResourceName]);
            // update apkInfo with resourceMap
            apkInfo = mapInfoResource(apkInfo, resourceMap);

            // find icon path and parse icon
            var iconPath = findApkIconPath(apkInfo);
            if (iconPath) {
              _this2.getEntry(iconPath).then(function (iconBuffer) {
                apkInfo.icon = iconBuffer ? getBase64FromBuffer(iconBuffer) : null;
                resolve(apkInfo);
              })["catch"](function (e) {
                apkInfo.icon = null;
                resolve(apkInfo);
                console.warn('[Warning] failed to parse icon: ', e);
              });
            } else {
              apkInfo.icon = null;
              resolve(apkInfo);
            }
          }
        })["catch"](function (e) {
          reject(e);
        });
      });
    }
    /**
     * Parse manifest
     * @param {Buffer} buffer // manifest file's buffer
     */
  }, {
    key: "_parseManifest",
    value: function _parseManifest(buffer) {
      try {
        var parser = new ManifestXmlParser(buffer, {
          ignore: ['application.activity', 'application.service', 'application.receiver', 'application.provider', 'permission-group']
        });
        return parser.parse();
      } catch (e) {
        throw new Error('Parse AndroidManifest.xml error: ', e);
      }
    }
    /**
     * Parse resourceMap
     * @param {Buffer} buffer // resourceMap file's buffer
     */
  }, {
    key: "_parseResourceMap",
    value: function _parseResourceMap(buffer) {
      try {
        return new ResourceFinder().processResourceTable(buffer);
      } catch (e) {
        throw new Error('Parser resources.arsc error: ' + e);
      }
    }
  }]);
}(Zip);
module.exports = ApkParser;