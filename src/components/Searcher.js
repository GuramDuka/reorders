//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import disp, { nullLink, copy } from '../store';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Icon extends Component {
  componentWillMount() {
    this.setState({...this.props});
  }

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Searcher.Icon');

    const { state } = this;

    return <Sui.Icon
      loading={state.isLoading}
      name={state.isLoading ? 'spinner' : 'search'}>
        <font style={{fontSize:'50%'}}>
          {~~state.loadedRows === 0 ? '' : state.loadedRows}
        </font>
      </Sui.Icon>;
  }
};
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export const LOADING_DONE_TOPIC = 'LOADING.DONE';
//------------------------------------------------------------------------------
class Searcher extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  searchChanged = value => {
    const obj = this;
    obj.icon.setState({isLoading: true, loadedRows: 0});
    disp(state => {
      let stack = state.getIn('body', 'viewStack');
      let curView = stack[stack.length - 1].view;
      const sr = 'searcherResults';
      
      if( curView !== sr && value.length !== 0 ) {
        state = state.editIn('body', 'viewStack', v => v.push({
          searcher: copy(state.getIn('searcher')),
          view: sr
        })).setIn('body', 'view', sr);
        stack = state.getIn('body', 'viewStack');
        curView = stack[stack.length - 1].view;
      }

      if( curView === sr && value.length === 0 ) {
        state = state.editIn('body', 'viewStack', v => v.pop());
        stack = state.getIn('body', 'viewStack');
        curView = stack[stack.length - 1].view;
        state = state.setIn('body', 'view', curView)
          .deleteIn([], 'searcher');
        obj.icon.setState({isLoading: false, loadedRows: 0});
      }

      const preView = stack.length >= 2 ? stack[stack.length - 2].view : undefined;

      if( curView === sr ) {
        if( preView === 'products' )
          state = state.setIn('searcher', 'parent', state.getIn(['products', 'list', 'view'], 'parent', nullLink));
        state = state.setIn('searcher', 'filter', value);
      }
      return state;
    });
  };

  handleSearchChange = (e, data) => {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(e => this.searchChanged(data.value), 1500);
  };
  
  initValue = state => {
    this.value = state.getIn(['searcher'], 'filter', '');
    return state;
  };

  componentWillMount() {
    disp(this.initValue, true);
  }

  componentDidMount() {
    PubSub.subscribe(LOADING_DONE_TOPIC, (msg, data) => this.icon.setState({isLoading: false, loadedRows: data}));
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
      icon={<Icon isLoading={this.value.length !== 0} ref={e => this.icon = e} />}
      placeholder="Поиск..."
      defaultValue={this.value}
      onChange={this.handleSearchChange} />;
  }
}
//------------------------------------------------------------------------------
export default connect(Searcher);
//------------------------------------------------------------------------------
