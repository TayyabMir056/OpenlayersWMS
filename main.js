import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';
import Overlay from 'ol/Overlay';
import {toLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';


var wmsSource = new TileWMS({
  url: 'http://mapdata.peie.om/geoserver/gwc/service/wms',
  params: {'LAYERS': 'PEIE:vacancy12370', 'TILED': true, 'VERSION':'1.1.1','WIDTH':'256'},
  serverType: 'geoserver',
  // Countries have transparency, so do not fade tiles:
  transition: 0
});

var layers = [
  new TileLayer({
    source: new OSM(),
  }),
  new TileLayer({
    source: wmsSource
  }) ];

  var view = new View({
    center: [6273583.067918, 2644092.993290],
    zoom: 15
  })
  
  var container = document.getElementById('popup');
  var content = document.getElementById('popup-content');
  var closer = document.getElementById('popup-closer');
  
  
  var overlay = new Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
  });
  
  var map = new Map({
    layers: layers,
    target: 'map',
    view: view,
    pixelRatio: 1,
    overlays: [overlay],
  });


/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

map.on('singleclick', function (evt) {
  document.getElementById('info').innerHTML = '';
  var viewResolution = /** @type {number} */ (view.getResolution());
  var url = wmsSource.getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    'EPSG:3857',
    {'INFO_FORMAT': 'text/html'}
  );
  if (url) {
    fetch(url)
      .then(function (response) { return response.text(); })
      .then(function (html) {
        document.getElementById('info').innerHTML = html;
      });
  }
});