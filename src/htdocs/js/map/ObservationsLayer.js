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

      _bounds,
      _markerOptions,

      _addPopup,
      _getCustomProps;


  _this = {};

  _initialize = function () {
    options = Util.extend({}, _DEFAULTS, options);
    _markerOptions = Util.extend({}, _MARKER_DEFAULTS, options.markerOptions);
    _bounds = new L.LatLngBounds();

    _this.layers = {};
    _this.markers = {
      'Building': 'star+0000ff',
      'Deployment': 'star+00ff00',
      'Checkin': 'embassy+999999',
      'Fault Rupture': 'star+00ffff',
      'General': 'star+cc00ff',
      'Landslide': 'star+ff0000',
      'Lifelines': 'star+ff00ff',
      'Liquefaction': 'star+ff9900',
      'Tsunami': 'star+ffff00'
    };
    _this.padding = {
      bottomRight: [235, 60],
      topLeft: [50, 20]
    };
  };


  /**
   * Add Leaflet popup (and label) to marker
   *
   * @param marker {L.Marker}
   * @param model {Object}
   */
  _addPopup = function (marker, model) {
    var coords,
        img,
        label,
        labelTemplate,
        popup,
        popupTemplate,
        props,
        table,
        title;

    coords = model.getCoords('string');
    props = model.toJSON().properties;
    table = _getCustomProps(props);
    img = '';

    if (props.attachment) {
      img = '<img src="{attachment}" alt="site photo" />';
    }

    title = 'accuracy: &plusmn; {accuracy}m';
    if (props.zaccuracy) {
      title += ' (z: {zaccuracy}m)';
    }

    labelTemplate = '{site} - {timestamp}';
    label = L.Util.template(labelTemplate, props);

    popupTemplate = '<div class="popup">' +
      '<h2>{site} ({form})</h2>' +
      '<time>{timestamp} {timezone}</time>' +
      '<h3 title="' + title + '">{description} ' + coords + '</h3>' +
      '<p class="notes">{notes}</p>' +
      img + table +
      '<p class="operator"><a href="mailto:{operator}">{operator}</a></p>' +
      '</div>';

    popup = L.Util.template(popupTemplate, props);

    marker.bindPopup(popup, {
      autoPanPaddingBottomRight: _this.padding.bottomRight,
      autoPanPaddingTopLeft: _this.padding.topLeft
    }).bindLabel(label, {
      pane: 'popupPane'
    });
  };

  /**
   * Get 'custom' props that apply only to specific observation type
   *
   * @param props {Object}
   * @return table {HTML String}
   */
  _getCustomProps = function (props) {
    var skipProps,
        table;

    // skip 'common' props that apply to all types
    skipProps = ['form', 'timestamp', 'timezone', 'recorded', 'synced',
      'operator', 'site', 'attachment', 'notes', 'description', 'accuracy',
      'zaccuracy', 'igid'];

    table = '<table>';
    Object.keys(props).forEach(function (key) {
      if (skipProps.indexOf(key) === -1) { // Add prop (not in skipProps)
        table += '<tr><th>' + key + '</th><td>' + props[key] + '</td></tr>';
      }
    });
    table += '</table>';

    return table;
  };

  /**
   * Add marker to layerGroup (classified by which form user submitted)
   *
   * @param model {Object}
   */
  _this.addMarker = function (model) {
    var coords,
        form,
        json,
        latlng,
        marker;

    coords = model.getCoords();
    json = model.toJSON();
    form = json.properties.form;

    // Create layerGroup for each type
    if (!_this.layers.hasOwnProperty(form)) {
      _this.layers[form] = L.layerGroup();
    }

    // Add marker to layerGroup
    _markerOptions.icon = Icon.getIcon(_this.markers[form]);
    latlng = [coords[1], coords[0]];
    marker = L.marker(latlng, _markerOptions);
    _this.layers[form].addLayer(marker);

    _bounds.extend(latlng);

    _addPopup(marker, model);
  };

  /**
   * Get map bounds that fit all points within extent
   */
  _this.getBounds = function () {
    return _bounds;
  };


  _initialize(options);
  options = null;
  return _this;
};


L.observationsLayer = ObservationsLayer;

module.exports = ObservationsLayer;
