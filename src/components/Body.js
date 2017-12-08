//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp from '../store';
import DictListView from './DictList/List';
import SearcherResults from './SearcherResults';
import Login from './Auth/Login';
import Profile from './Auth/Profile';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Body extends Component {
  static mapStateToProps(state, ownProps) {
    return {...state.mapIn(ownProps.path),
      body: state.getIn('body'),
      searcher: state.getIn('searcher')
    };
  }

  static connectOptions = { withRef: true };
  
  componentDidUpdate(prevProps, prevState) {
    if( this.props.view === 'reload' )
      disp(state => state.setIn('body', 'view', state.getIn('body', 'viewStack').slice(-1)[0].view));
  }

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Body');

    const { props } = this;

    switch( props.view ) {
      case 'reload' :
        return <Sui.Segment style={{padding: 0, margin: 0}} />
      case 'products' :
        return <DictListView path={['products', 'list']} />;
      case 'searcherResults' :
        return <Sui.Segment style={{padding: 0, margin: 0}}>
          <SearcherResults path={['searcher']} />
         </Sui.Segment>;
      case 'login' :
        return <Login path={['auth']} />;
      case 'profile' :
        return <Profile path={['auth']} />;
      default:;
    }

    return null;
  }
}
//------------------------------------------------------------------------------
export default connect(Body);
//------------------------------------------------------------------------------
