// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';
import Mousetrap from 'mousetrap';

import { Changeset as ChangesetDumb } from '../components/changeset';
import { CMap } from '../views/map';
import { NavbarChangeset } from '../views/navbar_changeset';

import { dispatchEvent } from '../utils/dispatch_event';

import { applyFilters } from '../store/filters_actions';
import { FILTER_BY_USER } from '../config/bindings';
import type { RootStateType } from '../store';

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
    // map configuration state (set in the changeset info panel and used in the CMap view)
    showElements: ['node', 'way', 'relation'],
    showActions: ['create', 'modify', 'delete'],
    basemapStyle: 'bing'
  };

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
      <ChangesetDumb
        changesetId={changesetId}
        currentChangeset={currentChangeset}
        token={token}
        showElements={this.state.showElements}
        showActions={this.state.showActions}
        setShowElements={showElements => this.setState({ showElements })}
        setShowActions={showActions => this.setState({ showActions })}
      />
    );
  };

  render() {
    return (
      <div className="flex-parent flex-parent--column h-full">
        <NavbarChangeset />
        <div className="flex-child flex-child--grow relative">
          <CMap
            className="z0 fixed bottom right"
            showElements={this.state.showElements}
            showActions={this.state.showActions}
          />
          <div className="absolute" style={{ top: 0, left: 0 }}>
            <div className="absolute flex-parent flex-parent--column clip">
              {this.showChangeset()}
            </div>
          </div>
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
