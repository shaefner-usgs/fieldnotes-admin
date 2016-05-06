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

  _this.getCoords = function (format) {
    var coords,
        lat,
        lon,
        geometry,
        str,
        z;

    geometry = _this.get('geometry') || {};

    if (geometry.hasOwnProperty('coordinates')) {
      if (format === 'string') {
        coords = geometry.coordinates;
        lat = [Math.abs(coords[1]).toFixed(2), '&deg;',
          (coords[1] < 0 ? 'S':'N')].join('');
        lon = [Math.abs(coords[0]).toFixed(2), '&deg;',
          (coords[0] < 0 ? 'W':'E')].join('');
        z = coords[2] + 'm';
        str = lat + ', ' + lon;
        if (coords[2]) {
          str += ' (' + z + ')';
        }
        return str;
      } else {
        return geometry.coordinates;
      }
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
