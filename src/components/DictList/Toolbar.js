import React from 'react';
import * as Mui from 'material-ui';
import {
  Autorenew,
  Refresh,
  ViewList
} from 'material-ui-icons';
import store from '../../store';
import Table from './Table';
import Base, { newAction } from '../Base';

class Toolbar extends Base {
  static storedProps = {
    isLoading   : false,
  };
  
  // static actionToggleIsLoading(path) {
  //   newAction(state => state.getIn([ ...path, 'isLoading' ])
  //     ? state.updateIn(path, v => v.without('isLoading'))
  //     : state.setIn([ ...path, 'isLoading' ], true));
  // };

  static actionSetIsLoading(path, isLoading) {
    return newAction(state => isLoading
      ? state.setIn([ ...path, 'isLoading' ], true)
      : state.updateIn(path, v => v.without('isLoading')));
  };

  static switchIsLoading(path, isLoading) {
    store.dispatch(Toolbar.actionSetIsLoading(path, isLoading));
  }

  static onClickReload(path, tablePath, options) {
    Toolbar.switchIsLoading(path, true);
    store.dispatch(Table.actionReload(tablePath, { ...options,
      onDone : () => Toolbar.switchIsLoading(path, false)
    }));
  }

  static onClickToggleElementsVisibility(path, tablePath) {
    store.dispatch(Table.actionReload(tablePath, { transformView : (view) =>
      view.elements = !view.elements}));
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path, tablePath } = ownProps;
    return {
      onClickReload  : event => {
        Toolbar.onClickReload(path, tablePath);
      },
      onClickRefresh : event => {
        Toolbar.onClickReload(path, tablePath, { refresh : true });
      },
      onClickToggleElementsVisibility  : event => {
        Toolbar.onClickToggleElementsVisibility(path, tablePath);
      }
    };
  }
  
  render() {
    console.log('render Toolbar, isDefaultState: '
       + this.props.isDefaultState + ', isLoading: ' + this.props.isLoading);
    const props = this.props;
    return (
      <Mui.Toolbar>
        <Mui.Typography type="title" color="inherit">
            {'Справочник '}
        </Mui.Typography>{props.isLoading && <Mui.CircularProgress size={20} />}{props.isLoading ||
        <Mui.IconButton aria-label="Reload" color="inherit" onClick={props.onClickReload}>
          <Autorenew />
        </Mui.IconButton>}{props.isLoading ||
        <Mui.IconButton aria-label="Refresh" color="inherit" onClick={props.onClickRefresh}>
          <Refresh />
        </Mui.IconButton>}{props.isLoading ? '' : (
        <Mui.IconButton aria-label="Elements" color="inherit" onClick={props.onClickToggleElementsVisibility}>
          <ViewList />
        </Mui.IconButton>)}
      </Mui.Toolbar>);
  }
}

export default Base.connect(Toolbar);
