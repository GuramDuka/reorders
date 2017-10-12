//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import store from '../../store';
import BACKEND_URL from '../../backend';
import { serializeURIParams, toggleBoolean, newAction } from '../Base';
import Card from './Card';
//------------------------------------------------------------------------------
function transform(data) {
  const { cols, dict, text, boolean } = data;
  for( const rows of [ data.rows, data.grps ] ) {
    for( let i = rows.length - 1; i >= 0; i-- ) {
      const row = rows[i];
      const now = { /*lineNo : i + 1*/ };

      for( let j = cols.length - 1; j >= 0; j-- ) {
        const v = row[j];

        if( v !== null ) {
          const n = cols[j];
          now[n] = text[n] ? dict[v] : (boolean[n] ? v !== 0 : v);
        }
      }

      rows[i] = now;
    }
  }

  return data;
}
//------------------------------------------------------------------------------
class List extends Component {
  static mapStateToProps(state, ownProps) {
    return state.getIn(ownProps.path);
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path } = ownProps;
    return {
      toggleGroups : e => store.dispatch(newAction(state => toggleBoolean(state, path, 'expandedGroups')))
    };      
  }

  static actionDataReady(path, data) {
    return newAction(state => state.setIn(path, state.getIn(path).merge(data)));
  };

  static actionReload(path, options) {
    return newAction(state => {
      const view = state.getIn([ ...path, 'view' ]).asMutable();
      
      if( options && options.transformView && options.transformView.constructor === Function )
        options.transformView(view);

      const opts = {
        method      : options && options.refresh ? 'PUT' : 'GET',
        credentials : 'omit',
        mode        : 'cors',
        cache       : 'default'
      };
      
      const onFetchError = error => {
        if( options ) {
          if( options.onDataError && options.onDataError.constructor === Function )
            options.onDataError(error);
          if( options.onDone && options.onDone.constructor === Function )
            options.onDone(error);
        }
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

        json = transform(json);

        const data = {
          view       : view,
          numr       : json.numeric,
          rows       : json.rows,
          grps       : json.grps
        };

        store.dispatch(List.actionDataReady(path, data));

        if( options ) {
          if( options.onDataReady && options.onDataReady.constructor === Function )
            options.onDataReady(data);
          if( options.onDone && options.onDone.constructor === Function )
            options.onDone(data);
        }
      })
      .catch(error => {
        console.log(error);
        store.dispatch(List.actionDataReady(path));
        onFetchError(error);
      });

      return state;
    });
  }
  
  componentWillMount() {
    store.dispatch(List.actionReload(this.props.path));
  }

  render() {
    console.log('render List');
    const { props } = this;
    const { expandedGroups, toggleGroups, keyField, headerField, imgField, titleField } = props;

    const grps = expandedGroups ? props.grps.map(grp =>
      <Sui.Button basic>
        {grp[headerField]}
      </Sui.Button>) : null;

    return (
    <Sui.Segment vertical style={{padding: 0}}>
      <Sui.Segment style={{padding: 0, margin: 0}}>
        <Sui.Button compact primary size="mini">
          <Sui.Icon name='backward' />
        </Sui.Button>
        <Sui.Button compact size="mini" circular
          onClick={toggleGroups}
          icon={expandedGroups ? 'compress' : 'expand'} />
        {grps}
      </Sui.Segment>
      <Sui.Segment style={{padding: 0, margin: 0}}>
        {props.rows.map((row) =>
          <Card
            key={row[keyField]}
            path={['products', 'cards', row[keyField]]}
            data={row}
            keyField={keyField}
            headerField={headerField}
            titleField={titleField}
            imgField={imgField} />)}
        </Sui.Segment>
      </Sui.Segment>);
  }
}
//------------------------------------------------------------------------------
export default connect(List);
//------------------------------------------------------------------------------
