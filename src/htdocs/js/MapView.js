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
        console.log(_observations);
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
    layers.overlays = {}; // added dynamically by _this.addLayer
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
    added.forEach(function (model) {
      _observations.addMarker(model);
    });

    _this.addLayer();
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = MapView;
