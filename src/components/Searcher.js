//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import disp, { nullLink } from '../store';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Icon extends Component {
  state = { isLoading: false };

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Searcher.Icon');

    return <Sui.Icon
      loading={this.state.isLoading}
      name={this.state.isLoading ? 'spinner' : 'search'} />;
  }
};
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export const LOADING_DONE_TOPIC = 'LOADING_DONE';
//------------------------------------------------------------------------------
class Searcher extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  handleSearchChange = (e, data) => {
    const value = data.value.trim();
    
    if( value.length === 0 )
      return;

    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(e => {
      this.icon.setState({isLoading: true});
      disp(state => state
        .setIn(['body'], 'view', 'searcherResults')
        .mergeIn(['searcher'], {
          parent: state.getIn(['products', 'list', 'view'], 'parent', nullLink),
          filter: value}))
    }, 1500);
  };
  
  initValue = state => {
    this.value = state.getIn(['searcher'], 'filter', '');
    return state;
  };

  componentWillMount() {
    disp(this.initValue, true);
  }

  componentDidMount() {
    PubSub.subscribe(LOADING_DONE_TOPIC, (msg, data) => this.icon.setState({isLoading: false}));
  }
  
  componentWillUnmount() {
    PubSub.unsubscribe(LOADING_DONE_TOPIC);
  }
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Searcher');

    return <Sui.Input
      style={{marginRight:'1em'}}
      transparent
      icon={<Icon ref={e => this.icon = e} />}
      placeholder="Поиск..."
      defaultValue={this.value}
      onChange={this.handleSearchChange} />;
  }
}
//------------------------------------------------------------------------------
export default connect(Searcher);
//------------------------------------------------------------------------------
