'use strict';


var MapView = require('MapView'),
    ObservationManager = require('ObservationManager'),
    Util = require('util/Util'),
    View = require('mvc/View');


var _DEFAULTS = {};

var Application = function (options) {
  var _this,
      _initialize,

      _manager,
      _map;

  _this = View(options);

  _initialize = function (options) {
    var el;

    options = Util.extend({}, _DEFAULTS, options);
    el = _this.el;
    el.innerHTML = '<div class="map"></div>';

    _manager = ObservationManager({
      model: _this.model // share model with ObservationManager
    });
    _map = MapView({
      data: _manager.data,
      el: el.querySelector('.map'),
      model: _this.model // make MapView share the same model as Application
    });

    _manager.loadData();
    _this.model.set({
      updateInterval: 30000 // 30 secs
    });
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = Application;
