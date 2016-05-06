/* global L */
'use strict';


var Icon = require('map/Icon'),
    Util = require('util/Util');

require('leaflet.label');


var _DEFAULTS,
    _MARKER_DEFAULTS;

_MARKER_DEFAULTS = {
  alt: 'marker icon'
};
_DEFAULTS = {
  data: null,
  markerOptions: _MARKER_DEFAULTS
};


/**
 * Factory for Earthquakes overlay
 *
 * @param options {L.Marker options}
 *
 * @return {L.FeatureGroup}
 */
var ObservationsLayer = function (options) {
  var _initialize,
      _this,

      _markerOptions,

      _addPopup;


  _this = {};

  _initialize = function () {
    options = Util.extend({}, _DEFAULTS, options);
    _markerOptions = Util.extend({}, _MARKER_DEFAULTS, options.markerOptions);

    _this.layers = {};
    _this.markers = {
      'Building': 'star+0000ff',
      'Deployment': 'star+00ff00',
      'Fault Rupture': 'star+00ffff',
      'General': 'star+9900ff',
      'Landslide': 'star+ff0000',
      'Lifelines': 'star+ff00ff',
      'Liquefaction': 'star+ff9900',
      'Tsunami': 'star+ffff00'
    };
  };


  _addPopup = function (marker, json) {
    var popup,
        popupTemplate;

    popupTemplate = '<div class="popup">' +
      '<h2>{form}</h2>' +
      '</div>';

    popup = L.Util.template(popupTemplate, json.properties);

    marker.bindPopup(popup);
  };

  _this.addMarker = function (json) {
    var lat,
        lon,
        form,
        marker;

    lat = json.geometry.coordinates[1];
    lon = json.geometry.coordinates[0];
    form = json.properties.form;

    // Create layerGroup for each type
    if (!_this.layers.hasOwnProperty(form)) {
      _this.layers[form] = L.layerGroup();
    }

    // Add marker to layerGroup
    _markerOptions.icon = Icon.getIcon(_this.markers[form]);
    marker = L.marker([lat, lon], _markerOptions);
    _this.layers[form].addLayer(marker);

    _addPopup(marker, json);
  };


  _initialize(options);
  options = null;
  return _this;
};


L.observationsLayer = ObservationsLayer;

module.exports = ObservationsLayer;
