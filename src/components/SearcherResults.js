//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp from '../store';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class SearcherResults extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  state = { isLoading: false };
  
  render() {
    const { props, state } = this;
    return null;
  }
}
//------------------------------------------------------------------------------
export default connect(SearcherResults);
//------------------------------------------------------------------------------
