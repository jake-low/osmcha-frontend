// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';
import Mousetrap from 'mousetrap';

import { Changeset as ChangesetOverlay } from '../components/changeset';
import { CMap } from '../views/map';
import { NavbarChangeset } from '../views/navbar_changeset';

import { dispatchEvent } from '../utils/dispatch_event';

import { applyFilters } from '../store/filters_actions';
import { FILTER_BY_USER } from '../config/bindings';
import type { RootStateType } from '../store';

/**
 * This is the main component for the changeset view.
 * It displays the changeset details and the map.
 */
class Changeset extends React.PureComponent {
  props: {
    errorChangeset: ?Object, // error of the latest that changeset failed
    location: Object,
    loading: boolean, // loading of the selected changesetId
    currentChangeset?: Map<string, *>,
    changesetId: number,
    token: string,
    applyFilters: (Map<string, *>) => mixed // base 0
  };

  state = {
    // the currently selected element on the map; either null or an 'action' object
    // from @osmcha/maplibre-adiff-viewer ({ type, old, new })
    selected: null,
    // map configuration state (set in the changeset info panel and used in the CMap view)
    showElements: ['node', 'way', 'relation'],
    showActions: ['create', 'modify', 'delete'],
    basemapStyle: 'bing'
  };

  // This ref is passed to CMap, which updates it with references to the MapLibre map
  // and AdiffViewer instance. Other components can use this ref to imperatively update
  // the map state.
  mapRef = React.createRef();

  componentDidMount() {
    Mousetrap.bind(FILTER_BY_USER.bindings, this.filterChangesetsByUser);
  }

  componentDidUpdate(prevProps: Object) {
    if (
      this.props.token !== prevProps.token ||
      this.props.changesetId !== prevProps.changesetId
    ) {
      // reset filters for element type and action type when switching
      // to a new changeset
      this.setState({
        showElements: ['node', 'way', 'relation'],
        showActions: ['create', 'modify', 'delete']
      });
    }
  }

  componentWillUnmount() {
    FILTER_BY_USER.bindings.forEach(k => Mousetrap.unbind(k));
  }

  filterChangesetsByUser = () => {
    if (this.props.currentChangeset) {
      const userName = this.props.currentChangeset.getIn([
        'properties',
        'user'
      ]);
      this.props.applyFilters(
        new Map().set(
          'users',
          fromJS([
            {
              label: userName,
              value: userName
            }
          ])
        )
      );
    }
  };

  showChangeset = () => {
    const {
      loading,
      errorChangeset,
      currentChangeset,
      changesetId,
      token
    } = this.props;

    if (loading || !currentChangeset) {
      return null;
    }

    if (errorChangeset) {
      dispatchEvent('showToast', {
        title: `changeset:${changesetId} failed to load`,
        content: 'Try reloading osmcha',
        timeOut: 5000,
        type: 'error'
      });
      console.error(errorChangeset);
      return null;
    }
    return (
      <ChangesetOverlay
        changesetId={changesetId}
        currentChangeset={currentChangeset}
        token={token}
        showElements={this.state.showElements}
        showActions={this.state.showActions}
        setShowElements={showElements => this.setState({ showElements })}
        setShowActions={showActions => this.setState({ showActions })}
        mapRef={this.mapRef}
        selected={this.state.selected}
      />
    );
  };

  render() {
    return (
      <div className="flex-parent flex-parent--column h-full">
        <NavbarChangeset />
        <div className="flex-child flex-child--grow relative">
          <CMap
            mapRef={this.mapRef}
            className="z0 fixed bottom right"
            showElements={this.state.showElements}
            showActions={this.state.showActions}
            setSelected={selected => this.setState({ selected })}
          />

          {this.showChangeset()}
        </div>
      </div>
    );
  }
}

Changeset = connect(
  (state: RootStateType, props) => ({
    changeset: state.changeset,
    location: props.location,
    changesetId: parseInt(props.match.params.id, 10),
    currentChangeset: state.changeset.getIn([
      'changesets',
      parseInt(props.match.params.id, 10)
    ]),
    errorChangeset: state.changeset.get('errorChangeset'),
    loading: state.changeset.get('loading'),
    token: state.auth.get('token')
  }),
  { applyFilters }
)(Changeset);

export { Changeset };
