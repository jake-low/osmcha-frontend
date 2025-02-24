import React from 'react';
import { connect } from 'react-redux';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import adiffParser from '@osmcha/osm-adiff-parser';
import { MapLibreAugmentedDiffViewer } from '@osmcha/maplibre-adiff-viewer';

import { Loading } from '../components/loading';
import { SignIn } from '../components/sign_in';
import ElementInfo from '../components/element_info';
import { fetchAndParseAugmentedDiff } from '../network/changeset';
import { updateStyle } from '../store/map_controls_actions';
import { modal } from '../store/modal_actions';
import type { RootStateType } from '../store';

let event;

export function selectFeature(id: number) {
  // FIXME used by other components, but currently doesn't work
  if (!id || !event) return;
  event.emit('selectFeature', 'node|way', id);
}

async function loadDiffViewer(onClick) {
  let changesetId = window.location.pathname.split('/').slice(-1)[0];
  let adiff = await fetchAndParseAugmentedDiff(changesetId);
  // let res = await fetch(`https://adiffs.osmcha.org/changesets/${changesetId}.adiff`);
  // if (res.status !== 200) {
  //   throw new Error(`GET /changesets/${changesetId}.adiff returned ${res.status} ${res.statusText}`);
  // }
  // let xml = await res.text();
  // let adiff = await adiffParser(xml);
  console.log(adiff);
  return new MapLibreAugmentedDiffViewer(adiff, { onClick });
}

class CMap extends React.PureComponent {
  props: {
    changesetId: number,
    className: string,
    style: string
  };

  state = {
    loading: true,
    selected: null
  };

  map = null;

  componentDidMount() {
    this.initializeMap();
  }

  componentWillUnmount() {
    event && event.emit('remove');
  }

  componentDidUpdate(prevProps: Object) {
    if (
      this.props.token !== prevProps.token ||
      this.props.changesetId !== prevProps.changesetId
    ) {
      this.setState({ selected: null });
      this.initializeMap();
    }
  }

  initializeMap() {
    let container = document.getElementById('container');

    if (this.map) {
      this.map.remove();
    }

    let map = new maplibre.Map({
      container,
      style: {
        version: 8,
        sources: {
          bing: {
            type: 'raster',
            tiles: [
              'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z',
              'https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z',
              'https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z',
              'https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z'
            ],
            tileSize: 256,
            maxzoom: 20,
            attribution:
              'Map data from <a href=https://openstreetmap.org/copyright>OpenStreetMap</a> | Imagery © Microsoft Corporation'
          }
        },
        layers: [
          {
            id: 'imagery',
            type: 'raster',
            source: 'bing'
          }
        ]
      },
      maxZoom: 22,
      hash: false,
      attributionControl: false // we're moving this to the other corner
    });

    map.addControl(new maplibre.AttributionControl(), 'bottom-left');

    map.setMaxPitch(0);
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();

    // start loading the diff viewer (and the required diff file) here, rather
    // than after the 'load' event fires, to reduce total load time
    let adiffViewerPromise = loadDiffViewer(this.handleClick)
      .catch(error => {
        this.props.modal({
          type: 'error',
          title: 'Error loading changeset map',
          description: error.message
        });
      })
      .finally(() => this.setState({ loading: false }));

    map.on('load', async () => {
      let adiffViewer = await adiffViewerPromise;
      if (adiffViewer) {
        console.log(adiffViewer.geojson);
        console.log(adiffViewer.bounds());
        adiffViewer.addTo(map);
        map.jumpTo(map.cameraForBounds(adiffViewer.bounds(), { padding: 50 }));
      }
    });

    this.map = map;
  }

  handleClick = (event, action) => {
    console.log('handleClick()', action);
    this.setState({ selected: action });
  };

  render() {
    console.log(`CMap render with changesetId = ${this.props.changesetId}`);
    if (this.props.token) {
      return (
        <React.Fragment>
          <div id="container" className="w-full h-full" />
          {this.state.selected && (
            <div
              className="absolute bg-white px12 py6 z5 round"
              style={{
                bottom: 0,
                right: 0,
                margin: '10px',
                minWidth: '400px',
                maxWidth: '550px',
                maxHeight: '60vh',
                overflowY: 'scroll'
              }}
            >
              <ElementInfo action={this.state.selected} />
            </div>
          )}
          {this.state.loading && (
            <div
              className="absolute z0"
              style={{
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                background: 'rgba(0, 0, 0, 0.5)'
              }}
            >
              <Loading height="100%" />
            </div>
          )}
        </React.Fragment>
      );
    } else {
      return <SignIn />;
    }
  }
}

CMap = connect(
  (state: RootStateType, props) => ({
    changesetId: state.changeset.get('changesetId'),
    style: state.mapControls.get('style'),
    token: state.auth.get('token')
  }),
  { updateStyle, modal }
)(CMap);

export { CMap };
