// @flow
import React from 'react';
import { connect } from 'react-redux';

// import { importChangesetMap } from '../../utils/cmap';
import { updateStyle } from '../../store/map_controls_actions';
import { Dropdown } from '../dropdown';

class MapOptions extends React.PureComponent {
  state = {
    actions: true,
    type: true,
    mapStyle: true,
    user: true
  };
  layerOptions = [
    { label: 'Bing', value: 'bing', function: () => this.toggleBing() },
    { label: 'OpenStreetMap Carto', value: 'carto', function: () => this.toggleOsm() }
  ];
  getLayerDropdownDisplay = id => {
    const filteredLayer = this.layerOptions.filter(l => l.value === id);
    if (filteredLayer.length) return filteredLayer[0].label;
    return 'Select a style';
  };
  onLayerChange = layer => {
    if (layer && layer.length) {
      layer[0].function();
      this.props.updateStyle(layer[0].value);
    }
  };
  onChange = () => {
    // importChangesetMap('getMapInstance').then(
    //   r => r && r() && r().filterLayers()
    // );
  };
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
    // importChangesetMap('getMapInstance').then(
    //   r => r && r() && r().renderMap(bingStyle)
    // );
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
    // importChangesetMap('getMapInstance').then(
    //   r => r && r() && r().renderMap(osmStyle)
    // );
  };
  render() {
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
                  value="added"
                  defaultChecked="true"
                  id="cmap-layer-selector-added"
                  onChange={this.onChange}
                />
                Added
              </label>
            </li>
            <li className="px6">
              <label>
                <input
                  type="checkbox"
                  value="modified"
                  defaultChecked="true"
                  onChange={this.onChange}
                  id="cmap-layer-selector-modified"
                />
                Modified
              </label>
            </li>
            <li className="px6">
              <label>
                <input
                  type="checkbox"
                  value="deleted"
                  defaultChecked="true"
                  onChange={this.onChange}
                  id="cmap-layer-selector-deleted"
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
                  value="nodes"
                  defaultChecked="true"
                  id="cmap-type-selector-nodes"
                  onChange={this.onChange}
                />
                Nodes
              </label>
            </li>
            <li className="px6">
              <label>
                <input
                  type="checkbox"
                  value="ways"
                  defaultChecked="true"
                  id="cmap-type-selector-ways"
                  onChange={this.onChange}
                />
                Ways
              </label>
            </li>
            <li className="px6">
              <label>
                <input
                  type="checkbox"
                  value="relations"
                  defaultChecked="true"
                  id="cmap-type-selector-relations"
                  onChange={this.onChange}
                />
                Relations
              </label>
            </li>
          </ul>
        </section>
        <section className="cmap-map-style-section cmap-pb3">
          <h6 className="cmap-heading pointer txt-bold">Map style</h6>
          <Dropdown
            eventTypes={['click', 'touchend']}
            value={this.props.style}
            onAdd={() => {}}
            onRemove={() => {}}
            options={this.layerOptions}
            onChange={this.onLayerChange}
            display={this.getLayerDropdownDisplay(this.props.style)}
            position="left"
          />
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
