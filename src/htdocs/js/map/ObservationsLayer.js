/* global L */
'use strict';


var Util = require('util/Util');

require('leaflet.label');


var _DEFAULTS,
    _MARKER_DEFAULTS;

_MARKER_DEFAULTS = {
};
_DEFAULTS = {
  data: null,
  markerOptions: _MARKER_DEFAULTS
};


/**
 * Factory for Earthquakes overlay
 *
 * @param options {Object}
 *     {
 *       data: {String} Geojson data
 *       markerOptions: {Object} L.Marker options
 *     }
 *
 * @return {L.FeatureGroup}
 */
var ObservationsLayer = function (options) {
  var _initialize,
      _this,

      _icons,
      _markerOptions;


  _this = {};

  _initialize = function () {
    options = Util.extend({}, _DEFAULTS, options);
    _markerOptions = Util.extend({}, _MARKER_DEFAULTS, options.markerOptions);

    _this.layers = {};
    _icons = {};

  };


  _this.addMarker = function (json) {
    var lat,
        lon,
        form,
        marker;

    lat = json.geometry.coordinates[1];
    lon = json.geometry.coordinates[0];
    form = json.properties.form;

    if (!_this.layers.hasOwnProperty(form)) {
      _this.layers[form] = L.layerGroup();
    }

    marker = L.marker([lat, lon]);
    _this.layers[form].addLayer(marker);
  };


  _initialize(options);
  options = null;
  return _this;
};


L.observationsLayer = ObservationsLayer;

module.exports = ObservationsLayer;
