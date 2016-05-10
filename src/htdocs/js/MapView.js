/* global L */
'use strict';


var View = require('mvc/View'),
    Xhr = require('util/Xhr');

// Leaflet plugins
require('map/MousePosition');
require('map/Restoreview');

// Factories for creating map layers
require('map/DarkLayer');
require('map/EarthquakesLayer');
require('map/GreyscaleLayer');
require('map/ObservationsLayer.js');
require('map/SatelliteLayer');
require('map/TerrainLayer');


/**
 * Factory for leaflet map instance on the 'main' page
 *
 * @param options {Object}
 */
var MapView = function (options) {

  var _this,
      _initialize,

      _earthquakes,
      _layerController,
      _map,
      _observations;


  _this = View(options);

  _initialize = function (options) {
    options = options || {};

    _this.data = options.data;
    _this.data.on('add', _this.onAdd);

    _this.initMap();
    _this.addZoomOption();
  };


  _this.addZoomOption = function () {
    var layers,
        html,
        separator;

    separator = document.createElement('div');
    separator.classList.add('leaflet-control-layers-separator');

    html = document.createElement('div');
    html.classList.add('autoZoom');
    html.innerHTML = '<label><input type="checkbox" name="autoZoom" id="autoZoom">' +
      '<span>Zoom map to new features as they are added</span></label>';

    layers = options.el.querySelector('.leaflet-control-layers');
    layers.appendChild(separator);
    layers.appendChild(html);
  };

  /**
   * Add layer(s) to map & controller if not already present
   * called each time the model changes
   */
  _this.addLayer = function () {
    Object.keys(_observations.layers).forEach(function (name) {
      var cssClass,
          html,
          layer;

      layer = _observations.layers[name];
      if (!_map.hasLayer(layer)) {
        cssClass = _observations.markers[name].replace('+', '-');
        html = '<span class="' + cssClass + '"></span>' + name;
        layer.addTo(_map);
        _layerController.addOverlay(layer, html);
      }
    });
  };

  /**
   * Get all map layers that will be displayed on map
   *
   * @return layers {Object}
   *    {
   *      baseLayers: {Object}
   *      overlays: {Object}
   *      defaults: {Array}
   *    }
   */
  _this.getMapLayers = function () {
    var dark,
        greyscale,
        layers,
        satellite,
        terrain;

    _this.loadEqsLayer();
    _earthquakes = L.earthquakesLayer();
    _observations = L.observationsLayer();

    dark = L.darkLayer();
    greyscale = L.greyscaleLayer();
    satellite = L.satelliteLayer();
    terrain = L.terrainLayer();

    layers = {};
    layers.baseLayers = {
      'Dark': dark,
      'Greyscale': greyscale,
      'Satellite': satellite,
      'Terrain': terrain
    };
    layers.overlays = {
      '<span class="earthquakes"><svg><circle cx="6" cy="12" r="5" stroke="#333333" stroke-width="1" fill="#ffffff"></circle></svg></span>M 2.5+ Earthquakes': _earthquakes
    }; // observations dynamically by _this.addLayer
    layers.defaults = [dark];

    return layers;
  };

  /**
   * Load earthquakes GeoJSON
   */
  _this.loadEqsLayer = function () {
    Xhr.ajax({
      url: 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson',
      success: function (data) {
        _earthquakes.addData(data);
      },
      error: function (status) {
        console.log(status);
      }
    });
  };

  /**
   * Create Leaflet map instance
   */
  _this.initMap = function () {
    var layers;

    layers = _this.getMapLayers();

    // Create map
    _map = L.map(_this.el, {
      center: [38, -121],
      layers: layers.defaults,
      zoom: 7
    });

    // Add controllers
    _layerController = L.control.layers(layers.baseLayers, layers.overlays, {
      collapsed: false
    }).addTo(_map);
    L.control.mousePosition().addTo(_map);
    L.control.scale().addTo(_map);

    // Remember user's map settings (selected layers, map extent)
    _map.restoreView({
      baseLayers: layers.baseLayers,
      overlays: layers.overlays
    });
  };

  /**
   * Add points - triggered when a model is added to the collection
   *
   * @param added {Collection}
   */
  _this.onAdd = function (added) {
    var checked;

    checked = document.getElementById('autoZoom').checked;

    added.forEach(function (model) {
      _observations.addMarker(model);
      if (checked) {
        _map.setView(model.getCoords(), 10);
      }
    });

    if (!checked) {
      _this.setBounds();
    }
    _this.addLayer();
  };

  /**
   *
   */
  _this.setBounds = function () {
    var mapView;

    // on initial load, set to extent of points; otherwise set to user's extent
    mapView = JSON.parse(window.localStorage.getItem('mapView')) || {};
    if (!mapView.hasOwnProperty('_global_')) { // initial load
      _map.fitBounds(_observations.getBounds(), {
        animate: false,
        paddingBottomRight: _observations.padding.bottomRight,
        paddingTopLeft: _observations.padding.topLeft
      });
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = MapView;
