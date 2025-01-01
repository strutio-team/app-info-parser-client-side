"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// From https://github.com/openstf/adbkit-apkreader
var BinaryXmlParser = require('./binary');
var INTENT_MAIN = 'android.intent.action.MAIN';
var CATEGORY_LAUNCHER = 'android.intent.category.LAUNCHER';
var ManifestParser = /*#__PURE__*/function () {
  function ManifestParser(buffer) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, ManifestParser);
    this.buffer = buffer;
    this.xmlParser = new BinaryXmlParser(this.buffer, options);
  }
  return _createClass(ManifestParser, [{
    key: "collapseAttributes",
    value: function collapseAttributes(element) {
      var collapsed = Object.create(null);
      for (var _i = 0, _Array$from = Array.from(element.attributes); _i < _Array$from.length; _i++) {
        var attr = _Array$from[_i];
        collapsed[attr.name] = attr.typedValue.value;
      }
      return collapsed;
    }
  }, {
    key: "parseIntents",
    value: function parseIntents(element, target) {
      var _this = this;
      target.intentFilters = [];
      target.metaData = [];
      return element.childNodes.forEach(function (element) {
        switch (element.nodeName) {
          case 'intent-filter':
            {
              var intentFilter = _this.collapseAttributes(element);
              intentFilter.actions = [];
              intentFilter.categories = [];
              intentFilter.data = [];
              element.childNodes.forEach(function (element) {
                switch (element.nodeName) {
                  case 'action':
                    intentFilter.actions.push(_this.collapseAttributes(element));
                    break;
                  case 'category':
                    intentFilter.categories.push(_this.collapseAttributes(element));
                    break;
                  case 'data':
                    intentFilter.data.push(_this.collapseAttributes(element));
                    break;
                }
              });
              target.intentFilters.push(intentFilter);
              break;
            }
          case 'meta-data':
            target.metaData.push(_this.collapseAttributes(element));
            break;
        }
      });
    }
  }, {
    key: "parseApplication",
    value: function parseApplication(element) {
      var _this2 = this;
      var app = this.collapseAttributes(element);
      app.activities = [];
      app.activityAliases = [];
      app.launcherActivities = [];
      app.services = [];
      app.receivers = [];
      app.providers = [];
      app.usesLibraries = [];
      app.metaData = [];
      element.childNodes.forEach(function (element) {
        switch (element.nodeName) {
          case 'activity':
            {
              var activity = _this2.collapseAttributes(element);
              _this2.parseIntents(element, activity);
              app.activities.push(activity);
              if (_this2.isLauncherActivity(activity)) {
                app.launcherActivities.push(activity);
              }
              break;
            }
          case 'activity-alias':
            {
              var activityAlias = _this2.collapseAttributes(element);
              _this2.parseIntents(element, activityAlias);
              app.activityAliases.push(activityAlias);
              if (_this2.isLauncherActivity(activityAlias)) {
                app.launcherActivities.push(activityAlias);
              }
              break;
            }
          case 'service':
            {
              var service = _this2.collapseAttributes(element);
              _this2.parseIntents(element, service);
              app.services.push(service);
              break;
            }
          case 'receiver':
            {
              var receiver = _this2.collapseAttributes(element);
              _this2.parseIntents(element, receiver);
              app.receivers.push(receiver);
              break;
            }
          case 'provider':
            {
              var provider = _this2.collapseAttributes(element);
              provider.grantUriPermissions = [];
              provider.metaData = [];
              provider.pathPermissions = [];
              element.childNodes.forEach(function (element) {
                switch (element.nodeName) {
                  case 'grant-uri-permission':
                    provider.grantUriPermissions.push(_this2.collapseAttributes(element));
                    break;
                  case 'meta-data':
                    provider.metaData.push(_this2.collapseAttributes(element));
                    break;
                  case 'path-permission':
                    provider.pathPermissions.push(_this2.collapseAttributes(element));
                    break;
                }
              });
              app.providers.push(provider);
              break;
            }
          case 'uses-library':
            app.usesLibraries.push(_this2.collapseAttributes(element));
            break;
          case 'meta-data':
            app.metaData.push(_this2.collapseAttributes(element));
            break;
        }
      });
      return app;
    }
  }, {
    key: "isLauncherActivity",
    value: function isLauncherActivity(activity) {
      return activity.intentFilters.some(function (filter) {
        var hasMain = filter.actions.some(function (action) {
          return action.name === INTENT_MAIN;
        });
        if (!hasMain) {
          return false;
        }
        return filter.categories.some(function (category) {
          return category.name === CATEGORY_LAUNCHER;
        });
      });
    }
  }, {
    key: "parse",
    value: function parse() {
      var _this3 = this;
      var document = this.xmlParser.parse();
      var manifest = this.collapseAttributes(document);
      manifest.usesPermissions = [];
      manifest.usesPermissionsSDK23 = [];
      manifest.permissions = [];
      manifest.permissionTrees = [];
      manifest.permissionGroups = [];
      manifest.instrumentation = null;
      manifest.usesSdk = null;
      manifest.usesConfiguration = null;
      manifest.usesFeatures = [];
      manifest.supportsScreens = null;
      manifest.compatibleScreens = [];
      manifest.supportsGlTextures = [];
      manifest.application = Object.create(null);
      document.childNodes.forEach(function (element) {
        switch (element.nodeName) {
          case 'uses-permission':
            manifest.usesPermissions.push(_this3.collapseAttributes(element));
            break;
          case 'uses-permission-sdk-23':
            manifest.usesPermissionsSDK23.push(_this3.collapseAttributes(element));
            break;
          case 'permission':
            manifest.permissions.push(_this3.collapseAttributes(element));
            break;
          case 'permission-tree':
            manifest.permissionTrees.push(_this3.collapseAttributes(element));
            break;
          case 'permission-group':
            manifest.permissionGroups.push(_this3.collapseAttributes(element));
            break;
          case 'instrumentation':
            manifest.instrumentation = _this3.collapseAttributes(element);
            break;
          case 'uses-sdk':
            manifest.usesSdk = _this3.collapseAttributes(element);
            break;
          case 'uses-configuration':
            manifest.usesConfiguration = _this3.collapseAttributes(element);
            break;
          case 'uses-feature':
            manifest.usesFeatures.push(_this3.collapseAttributes(element));
            break;
          case 'supports-screens':
            manifest.supportsScreens = _this3.collapseAttributes(element);
            break;
          case 'compatible-screens':
            element.childNodes.forEach(function (screen) {
              return manifest.compatibleScreens.push(_this3.collapseAttributes(screen));
            });
            break;
          case 'supports-gl-texture':
            manifest.supportsGlTextures.push(_this3.collapseAttributes(element));
            break;
          case 'application':
            manifest.application = _this3.parseApplication(element);
            break;
        }
      });
      return manifest;
    }
  }]);
}();
module.exports = ManifestParser;