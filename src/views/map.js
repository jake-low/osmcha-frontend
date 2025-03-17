import React from 'react';
import { connect } from 'react-redux';
import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapLibreAugmentedDiffViewer } from '@osmcha/maplibre-adiff-viewer';

import { Loading } from '../components/loading';
import { SignIn } from '../components/sign_in';
import ElementInfo from '../components/element_info';
import { updateStyle } from '../store/map_controls_actions';
import { modal } from '../store/modal_actions';
import type { RootStateType } from '../store';

let event;

export function selectFeature(id: number) {
  // FIXME used by other components, but currently doesn't work
  if (!id || !event) return;
  event.emit('selectFeature', 'node|way', id);
}

class CMap extends React.PureComponent {
  props: {
    changesetId: number,
    className: string,
    style: string,
    showElements: Array<string>,
    showActions: Array<string>
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
      this.props.changesetId !== prevProps.changesetId ||
      !prevProps.changeset
    ) {
      this.setState({ selected: null, loading: true });
      this.initializeMap();
    } else {
      this.updateMap();
    }
  }

  initializeMap() {
    if (!this.props.changeset) {
      return;
    }

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
            attribution: 'Imagery © Microsoft Corporation'
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

    let { adiff } = this.props.changeset;
    // HACK: override attribution string (the string Overpass sends is wordier and doesn't have a hyperlink)
    adiff.note =
      'Map data from <a href=https://openstreetmap.org/copyright>OpenStreetMap</a>';
    const adiffViewer = new MapLibreAugmentedDiffViewer(adiff, {
      onClick: this.handleClick,
      showElements: this.props.showElements,
      showActions: this.props.showActions
    });

    map.on('load', async () => {
      this.setState({ loading: false });

      if (adiffViewer) {
        console.log(adiffViewer.geojson);
        console.log(adiffViewer.bounds());
        adiffViewer.addTo(map);
        map.jumpTo(
          map.cameraForBounds(adiffViewer.bounds(), {
            padding: 50,
            maxZoom: 18
          })
        );
      }
    });

    this.map = map;
    this.adiffViewer = adiffViewer;
  }

  updateMap() {
    if (this.state.loading || !this.map || !this.adiffViewer) return;

    this.adiffViewer.options = {
      onClick: this.handleClick,
      showElements: this.props.showElements,
      showActions: this.props.showActions
    };

    this.adiffViewer.updateStyle(this.map);
  }

  handleClick = (event, action) => {
    console.log('handleClick()', action);
    this.setState({ selected: action });
  };

  render() {
    console.log(`CMap render with changesetId = ${this.props.changesetId}`);
    console.log(this.props.style);
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
                overflowY: 'auto'
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
    changeset: state.changeset.getIn([
      'changesetMap',
      state.changeset.get('changesetId')
    ]),
    style: state.mapControls.get('style'),
    token: state.auth.get('token')
  }),
  { updateStyle, modal }
)(CMap);

export { CMap };
