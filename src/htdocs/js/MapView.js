/* global L */
'use strict';


var View = require('mvc/View');

// Leaflet plugins
require('map/MousePosition');
require('map/Restoreview');

// Factories for creating map layers
require('map/DarkLayer');
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

      _layerController,
      _map,
      _observations;


  _this = View(options);

  _initialize = function (options) {
    options = options || {};

    _this.data = options.data;
    _this.data.on('add', _this.onAdd);

    _this.initMap();
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

    dark = L.darkLayer();
    greyscale = L.greyscaleLayer();
    satellite = L.satelliteLayer();
    terrain = L.terrainLayer();

    _observations = L.observationsLayer();

    layers = {};
    layers.baseLayers = {
      'Terrain': terrain,
      'Satellite': satellite,
      'Greyscale': greyscale,
      'Dark': dark
    };
    layers.overlays = {}; // added dynamically by _this.onAdd
    layers.defaults = [terrain];

    return layers;
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
      scrollWheelZoom: false,
      zoom: 7
    });

    // Add controllers
    _layerController = L.control.layers(layers.baseLayers, layers.overlays).addTo(_map);
    L.control.mousePosition().addTo(_map);
    L.control.scale().addTo(_map);

    // Remember user's map settings (selected layers, map extent)
    _map.restoreView({
      baseLayers: layers.baseLayers,
      overlays: layers.overlays
    });
  };

  _this.onAdd = function (added) {
    added.forEach(function (model) {
      _observations.addMarker(model.toJSON());
    });

    // add layer to map & controller if not already present
    Object.keys(_observations.layers).forEach(function (name) {
      var layer;

      layer = _observations.layers[name];
      if (!_map.hasLayer(layer)) {
        layer.addTo(_map);
        _layerController.addOverlay(layer, name);
      }
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = MapView;
