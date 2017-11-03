//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
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
class Searcher extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  state = { value: '' };

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
    }, 500);
  };
  
  initValue = state => {
    this.setState({value: state.getIn(['searcher'], 'filter', '')});
    return state;
  };

  componentDidMount() {
    disp(this.initValue, true);
  }
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Searcher');

    const { state } = this;
    return <Sui.Input
      style={{marginRight:'1em'}}
      transparent
      icon={<Icon ref={icon => this.icon = icon} />}
      placeholder="Поиск..."
      value={state.value}
      onChange={this.handleSearchChange} />;
  }
}
//------------------------------------------------------------------------------
export default connect(Searcher);
//------------------------------------------------------------------------------
