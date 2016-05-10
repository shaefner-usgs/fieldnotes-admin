/* global L */
'use strict';


var Moment = require('moment'),
    Util = require('util/Util');

require('leaflet.label');


var _COLORS,
    _DEFAULTS,
    _MARKER_DEFAULTS;

_COLORS = {
  pasthour: '#f00',
  pastday: '#f90',
  pastweek: '#ff0',
  pastmonth: '#ffb'
};
_MARKER_DEFAULTS = {
  weight: 1,
  opacity: 0.9,
  fillOpacity: 0.9,
  color: '#000'
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
 *       markerOptions: {Object} L.Path options
 *     }
 *
 * @return {L.FeatureGroup}
 */
var EarthquakesLayer = function (options) {
  var _initialize,
      _this,

      _markerOptions,
      _pastHour,
      _pastDay,
      _pastWeek,

      _getAge,
      _onEachFeature,
      _pointToLayer;


  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);
    _markerOptions = Util.extend({}, _MARKER_DEFAULTS, options.markerOptions);

    _pastHour = Moment.utc().subtract(1, 'hours');
    _pastDay = Moment.utc().subtract(1, 'days');
    _pastWeek = Moment.utc().subtract(1, 'weeks');

    _this = L.geoJson(options.data, {
      onEachFeature: _onEachFeature,
      pointToLayer: _pointToLayer
    });
  };


  _getAge = function (timestamp) {
    var age,
        eqtime;

    eqtime = Moment.utc(timestamp);
    if (eqtime.isSameOrAfter(_pastHour)) {
      age = 'pasthour';
    } else if (eqtime.isSameOrAfter(_pastDay)) {
      age = 'pastday';
    } else {
      age = 'pastweek';
    }

    return age;
  };

  /**
   * Leaflet GeoJSON option: called on each created feature layer. Useful for
   * attaching events and popups to features.
   *
   * @param feature {Object}
   * @param layer (L.Layer)
   */
  _onEachFeature = function (feature, layer) {
    var data,
        label,
        labelTemplate,
        popup,
        popupTemplate,
        props;

    props = feature.properties;
    data = {
      mag: props.mag,
      time: Moment.utc(props.time).format('ddd, MMM D HH:mm:ss') + ' UTC',
      place: props.place,
      url: props.url
    };

    labelTemplate = 'M{mag} - {time}';
    label = L.Util.template(labelTemplate, data);

    popupTemplate = '<div class="popup eq">' +
        '<h1>M{mag}, {place}</h1>' +
        '<time>{time}</time>' +
        '<p><a href="{url}" target="_blank">Details</a> &raquo;</p>' +
      '</div>';
    popup = L.Util.template(popupTemplate, data);

    layer.bindPopup(popup, {maxWidth: '265'}).bindLabel(label);
  };

  /**
   * Leaflet GeoJSON option: used for creating layers for GeoJSON points
   *
   * @param feature {Object}
   * @param latlng {L.LatLng}
   *
   * @return marker {L.CircleMarker}
   */
  _pointToLayer = function (feature, latlng) {
    var age,
        fillColor,
        radius;

    age = _getAge(feature.properties.time);
    fillColor = _COLORS[age];
    radius = 3 * parseInt(Math.pow(10, (0.11 * feature.properties.mag)), 10);

    _markerOptions.fillColor = fillColor;
    _markerOptions.radius = radius;

    return L.circleMarker(latlng, _markerOptions);
  };

  _initialize(options);
  options = null;
  return _this;
};


L.earthquakesLayer = EarthquakesLayer;

module.exports = EarthquakesLayer;
