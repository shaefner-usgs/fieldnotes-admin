'use strict';


var Collection = require('mvc/Collection'),
    Moment = require('moment'),
    Observation = require('Observation'),
    Util = require('util/Util'),
    Xhr = require('util/Xhr');

var _DEFAULTS = {
  url: 'http://bayquakealliance.org/fieldnotes/features.json.php'
};

var ObservationManager = function (options) {
  var _this,
      _initialize,

      _lastObservationTime,
      _url;

  _this = {};

  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);

    // default to one month ago
    _lastObservationTime = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    _url = options.url;

    _this.data = Collection();
    _this.interval = null;
    _this.model = options.model;

    // watch for update interval being changed on model
    _this.model.on('change:updateInterval', _this.onChangeUpdateInterval);
  };

  _this.loadData = function () {
    var after;

    after = _lastObservationTime;
    if (after !== null) {
      after = parseInt(after / 1000, 10);
    }

    Xhr.ajax({
      data: {
        after: after,
        content: 'all'
      },
      url: _url,
      success: _this.onSuccess,
      error: _this.onError
    });
  };

  // update interval was changed on model
  _this.onChangeUpdateInterval = function () {
    var updateInterval;

    // clean up first so it doesn't interfere
    if (_this.interval) {
      window.clearInterval(_this.interval);
      _this.interval = null;
    }
    // check current model setting
    updateInterval = _this.model.get('updateInterval');
    // apply current model setting
    if (updateInterval) {
      _this.interval = window.setInterval(_this.loadData, updateInterval);
    }
  };

  _this.onError = function (err) {
    console.log(err);
  };

  _this.onSuccess = function (featureCollection) {
    var features,
        lastObservationTime,
        observations;

    features = featureCollection.features || [];
    lastObservationTime = null;

    observations = features.map(function (feature) {
      var observation,
          time;

      // TODO: add ISO8601 time prop to feed
      observation = Observation(feature);

      // synced is only set when an "old" record that was recorded offline is added
      // it will be set to the datetime when the feature was synced
      if (observation.getProperty('synced')) {
        time = Moment(observation.getProperty('synced')).valueOf();
      } else {
        time = Moment(observation.getProperty('recorded')).valueOf();
      }

      if (!lastObservationTime || time > lastObservationTime) {
        lastObservationTime = time;
      }

      return observation;
    });

    if (observations.length === 0) { // no new features to add
      return;
    }
    _this.data.addAll(observations);
    // add 1 sec b/c mysql query is inclusive and will always grab the latest record otherwise
    _lastObservationTime = lastObservationTime + 1000;
  };

  _initialize(options);
  options = null;
  return _this;
};

module.exports = ObservationManager;
