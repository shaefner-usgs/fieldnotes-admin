'use strict';


var Model = require('mvc/Model'),
    Util = require('util/Util');


var _DEFAULTS = {};


var Observation = function (options) {
  var _this,
      _initialize;


  _this = Model();


  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);
    _this.set(options);
  };

  _this.getCoords = function () {
    var geometry;

    geometry = _this.get('geometry') || {};
    if (geometry.hasOwnProperty('coordinates')) {
      return geometry.coordinates;
    }

    return null;
  };

  _this.getProperty = function (name) {
    var props;

    props = _this.get('properties') || {};
    if (props.hasOwnProperty(name)) {
      return props[name];
    }

    return null;
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = Observation;
