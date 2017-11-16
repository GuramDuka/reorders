//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import DictListView from './DictList/List';
import DictCard from './DictList/Card';
import SearcherResults from './SearcherResults';
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

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Body');

    const { props } = this;

    switch( props.view ) {
      case 'products' :
        return <DictListView path={['products', 'list']} />;
      case 'searcherResults' :
        return <Sui.Segment style={{padding: 0, margin: 0}}>
         <SearcherResults path={['searcher']} />
         </Sui.Segment>;
      case 'card' :
        const stack = props.body.viewStack;
        const { link } = stack[stack.length - 1];
        return <DictCard link={link} stacked={true}
          path={['searcher', 'cards', link]}
          data={props.searcher.cards[link].data} />;
      default:;
    }

    return null;
  }
}
//------------------------------------------------------------------------------
export default connect(Body);
//------------------------------------------------------------------------------
