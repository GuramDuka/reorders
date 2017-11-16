//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import disp, { nullLink } from '../store';
import { scrollXY } from '../util';
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
export const LOADING_START_TOPIC = 'LOADING.START';
export const LOADING_DONE_TOPIC = 'LOADING.DONE';
//------------------------------------------------------------------------------
class Searcher extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  searchChanged = value => disp(state => {
    const sr = 'searcherResults';
    let stack, curView, nsr = false;

    for(;;) {
      stack = state.getIn('body', 'viewStack');
      curView = stack[stack.length - 1].view;
      if( curView === sr || stack.length <= 1 || stack.findIndex(v => v.view === sr) < 0 )
        break;
      state = state.editIn('body', 'viewStack', v => v.pop());
    }
    
    if( curView !== sr && value.length !== 0 ) {
      state = state.editIn('body', 'viewStack', v => v.push({view: sr}));
      stack = state.getIn('body', 'viewStack');
      curView = stack[stack.length - 1].view;
      nsr = true;
    }

    if( curView === sr && value.length === 0 ) {
      state = state.editIn('body', 'viewStack', v => v.pop());
      stack = state.getIn('body', 'viewStack');
      const st = stack[stack.length - 1];
      state = state.setIn('body', 'view', curView = st.view)
        .deleteIn([], 'searcher');
    }

    const preView = stack.length >= 2 ? stack[stack.length - 2].view : undefined;

    if( curView === sr ) {
      if( preView === 'products' ) {
        state = state.setIn('searcher', 'parent', state.getIn(['products', 'list', 'view'], 'parent', nullLink))
        if( nsr )
          state = state.setIn(['products', 'list'], 'scroll', scrollXY());
      }
      state = state.setIn('body', 'view', sr)
        .setIn('searcher', 'filter', value)
        .deleteIn('searcher', 'scroll');
    }
    return state;
  });

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
    PubSub.subscribe(LOADING_START_TOPIC, (msg, data) => this.icon.setState({isLoading: true, loadedRows: data}));
    PubSub.subscribe(LOADING_DONE_TOPIC, (msg, data) => this.icon.setState({isLoading: false, loadedRows: data}));
  }
  
  componentWillUnmount() {
    PubSub.unsubscribe(LOADING_START_TOPIC);
    PubSub.unsubscribe(LOADING_DONE_TOPIC);
  }
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Searcher');

    return <Sui.Input
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
