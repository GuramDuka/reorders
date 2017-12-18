//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import { LOADING_START_TOPIC, LOADING_DONE_TOPIC } from '../Searcher';
import { transform, sfetch } from '../../backend';
import Groups from './Groups';
import Card from './Card';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class List extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static connectOptions = { withRef: true };
  
  state = {
    numr       : {},
    rows       : [],
    grps       : []
  };
  
  reload = view => {
    const obj = this;
    const r = {
      r : view,
      m : 'dict',
      f : 'list'
    };
  
    sfetch({r:r}, json => {
      json = transform(json);

      const coll = new Intl.Collator();
      const data = {
        numr       : json.numeric,
        rows       : json.rows,
        grps       : json.grps.sort((a, b) => coll.compare(a.Наименование, b.Наименование))
      };

      obj.setState(data);
      PubSub.publish(LOADING_DONE_TOPIC, 0);
      obj.restoreScrollPosition();
    }, error => PubSub.publish(LOADING_DONE_TOPIC, 0));

    PubSub.publishSync(LOADING_START_TOPIC, 0);
    
    return this;
  };
  
  restoreScrollPosition = () => {
    const { scroll } = this.props;
    window.scroll(scroll ? scroll.x : 0, scroll ? scroll.y : 0);
  };
  
  componentDidMount() {
    this.reload(this.props.view);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if( this.props.view !== nextProps.view )
      this.reload(nextProps.view);
    return this.state.rows !== nextState.rows || this.state.grps !== nextState.grps;
  }
    
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render List');

    const { props, state } = this;
    const { path, view } = props;

    return [
      <Groups key={0}
        path={[...path, 'groups', view.parent]}
        listPath={path}
        parent={view.parent}
        breadcrumb={props.breadcrumb}
        data={state.grps} />,
      <Sui.Segment.Group key={1} style={{padding: 0, margin: 0}}>
        {state.rows.map((row) =>
          <Card
            key={row.Ссылка}
            link={row.Ссылка}
            path={[...path, 'cards', row.Ссылка]}
            data={row} />)}
        </Sui.Segment.Group>];
  }
}
//------------------------------------------------------------------------------
export default connect(List);
//------------------------------------------------------------------------------
