// @flow
import React from 'react';
import { connect } from 'react-redux';

import { updateStyle } from '../../store/map_controls_actions';

// helper functions for adding/removing elements from an array when a
// checkbox is toggled
const add = (arr, elem) => {
  let set = new Set(arr);
  set.add(elem);
  return [...set];
};

const remove = (arr, elem) => {
  let set = new Set(arr);
  set.delete(elem);
  return [...set];
};

const toggle = (arr, elem) => {
  return arr.indexOf(elem) === -1 ? add(arr, elem) : remove(arr, elem);
};

class MapOptions extends React.PureComponent {
  layerOptions = [
    { label: 'Bing', value: 'bing' },
    { label: 'OpenStreetMap Carto', value: 'carto' }
  ];

  toggleBing = () => {
    const bingStyle = {
      version: 8,
      sources: {
        'bing-tiles': {
          type: 'raster',
          tiles: [
            'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z',
            'https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z',
            'https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z',
            'https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z'
          ],
          attribution:
            '© <a href="https://blog.openstreetmap.org/2010/11/30/microsoft-imagery-details">Microsoft Corporation</a>'
        }
      },
      layers: [
        {
          id: 'bing',
          type: 'raster',
          source: 'bing-tiles',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    };
  };

  toggleOsm = () => {
    const osmStyle = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    };
  };

  render() {
    const {
      showElements,
      showActions,
      setShowElements,
      setShowActions
    } = this.props;

    return (
      <div className="px12 py6">
        <h2 className="txt-m txt-uppercase txt-bold mr6 mb3">Map Controls</h2>
        <section className="cmap-filter-action-section cmap-pt3">
          <h6 className="cmap-heading pointer txt-bold">Filter by actions</h6>

          <ul className="flex-parent">
            <li className="px6">
              <label>
                <input
                  type="checkbox"
                  checked={showActions.includes('create')}
                  onChange={() => setShowActions(toggle(showActions, 'create'))}
                />
                Added
              </label>
            </li>
            <li className="px6">
              <label>
                <input
                  type="checkbox"
                  checked={showActions.includes('modify')}
                  onChange={() => setShowActions(toggle(showActions, 'modify'))}
                />
                Modified
              </label>
            </li>
            <li className="px6">
              <label>
                <input
                  type="checkbox"
                  checked={showActions.includes('delete')}
                  onChange={() => setShowActions(toggle(showActions, 'delete'))}
                />
                Deleted
              </label>
            </li>
          </ul>
        </section>
        <section className="cmap-filter-type-section">
          <h6 className="txt-bold">Filter by type</h6>
          <ul className="flex-parent">
            <li className="px6">
              <label>
                <input
                  type="checkbox"
                  checked={showElements.includes('node')}
                  onChange={() => setShowElements(toggle(showElements, 'node'))}
                />
                Nodes
              </label>
            </li>
            <li className="px6">
              <label>
                <input
                  type="checkbox"
                  checked={showElements.includes('way')}
                  onChange={() => setShowElements(toggle(showElements, 'way'))}
                />
                Ways
              </label>
            </li>
            <li className="px6">
              <label>
                <input
                  type="checkbox"
                  checked={showElements.includes('relation')}
                  onChange={() =>
                    setShowElements(toggle(showElements, 'relation'))
                  }
                />
                Relations
              </label>
            </li>
          </ul>
        </section>
        <section className="cmap-map-style-section cmap-pb3">
          <h6 className="cmap-heading pointer txt-bold">Map style</h6>
          <select>
            {this.layerOptions.map(opt => (
              <option value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </section>
      </div>
    );
  }
}

MapOptions = connect(
  (state: RootStateType, props) => ({ style: state.mapControls.get('style') }),
  { updateStyle }
)(MapOptions);

export { MapOptions };
