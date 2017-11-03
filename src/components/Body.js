//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import DictListView from './DictList/List';
import SearcherResults from './SearcherResults';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Body extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Body');

    const { props } = this;
    return [ props.view !== 'products' ? null :
      <DictListView key={0} path={['products', 'list']} />, props.view !== 'searcherResults' ? null :
      <SearcherResults key={1} path={['searcher']} parentPath={['products', 'list', 'view']} />];
  }
}
//------------------------------------------------------------------------------
export default connect(Body);
//------------------------------------------------------------------------------
