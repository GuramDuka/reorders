//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import { LOADING_START_TOPIC, LOADING_DONE_TOPIC } from '../Searcher';
import BACKEND_URL, { transform, serializeURIParams } from '../../backend';
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
  
  reload = (view, options) => {
    const obj = this;
    const opts = {
      method      : options && options.refresh ? 'PUT' : 'GET',
      credentials : 'omit',
      mode        : 'cors',
      cache       : 'default'
    };
    
    const r = {
      r : view,
      m : 'dict',
      f : 'list'
    };
  
    if( opts.method === 'PUT' )
      opts.body = JSON.stringify(r);

    const url = BACKEND_URL + (opts.method === 'GET' ? '?' + serializeURIParams({r:r}) : '');

    fetch(url, opts).then(response => {
      const contentType = response.headers.get('content-type');

      if( contentType ) {
        if( contentType.includes('application/json') )
          return response.json();
        if( contentType.includes('text/') )
          return response.text();
      }
      // will be caught below
      throw new TypeError('Oops, we haven\'t right type of response! Status: ' + response.status + ', ' + response.statusText);
    }).then(json => {
      if( json === undefined || json === null || (json.constructor !== Object && json.constructor !== Array) )
        throw new TypeError('Oops, we haven\'t got JSON!' + (json && json.constructor === String ? ' ' + json : ''));

      json = transform(json, 'Ссылка');

      const coll = new Intl.Collator();
      const data = {
        numr       : json.numeric,
        rows       : json.rows,
        grps       : json.grps.sort((a, b) => coll.compare(a.Наименование, b.Наименование))
      };

      obj.setState(data);
      PubSub.publish(LOADING_DONE_TOPIC, 0);
      obj.restoreScrollPosition();
    })
    .catch(error => {
      if( process.env.NODE_ENV === 'development' )
        console.log(error);

      PubSub.publish(LOADING_DONE_TOPIC, 0);
    });

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
      <Sui.Segment key={1}
        style={{padding: 0, margin: 0}}>
        {state.rows.map((row) =>
          <Card
            key={row.Ссылка}
            link={row.Ссылка}
            path={[...path, 'cards', row.Ссылка]}
            data={row} />)}
        </Sui.Segment>];
  }
}
//------------------------------------------------------------------------------
export default connect(List);
//------------------------------------------------------------------------------
