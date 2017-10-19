//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { copy } from '../../store';
import BACKEND_URL from '../../backend';
import { serializeURIParams } from '../Base';
import Groups from './Groups';
import Card from './Card';
//------------------------------------------------------------------------------
function transform(data, view) {
  const { cols, dict, text, boolean } = data;
  for( const k of [ 'rows', 'grps' ] ) {
    const recs = data[k];
    const rmap = {};

    for( let i = recs.length - 1; i >= 0; i-- ) {
      const row = recs[i];
      const now = { /*lineNo : i + 1*/ };

      for( let j = cols.length - 1; j >= 0; j-- ) {
        const v = row[j];

        if( v !== null ) {
          const n = cols[j];
          now[n] = text[n] ? dict[v] : (boolean[n] ? v !== 0 : v);
        }
      }

      recs[i] = now;
      rmap[now[view.keyField]] = now;
      data[k + 'Map'] = rmap;
    }
  }

  return data;
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class List extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static actionDataReady(path, data) {
    return state => state.mergeIn(path, data);
  };

  static actionReload(path, options) {
    return state => {
      let view = state.getIn(path, 'view');
      
      if( options && options.transformView && options.transformView.constructor === Function ) {
        view = copy(view);
        options.transformView(view);
      }

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

        json = transform(json, view);

        const data = {
          view       : view,
          numr       : json.numeric,
          rows       : json.rows,
          grps       : json.grps
        };

        disp(state => {
          state = List.actionDataReady(path, data)(state)
            .deleteIn(path, 'isLoading');

          if( options ) {
            if( options.onDataReady && options.onDataReady.constructor === Function )
              state = options.onDataReady(state);
            if( options.onDone && options.onDone.constructor === Function )
              state = options.onDone(state);
          }

          return state;
        });
      })
      .catch(error => {
        if( process.env.NODE_ENV === 'development' )
          console.log(error);

        disp(state => {
          state = state.deleteIn(path, 'isLoading');
          if( options ) {
            if( options.onError && options.onError.constructor === Function )
              state = options.onError(state);
            if( options.onDone && options.onDone.constructor === Function )
              state = options.onDone(state);
          }
          return state;
        });
      });

      return state.setIn(path, 'isLoading', true);
    };
  }
  
  componentWillMount() {
    disp(List.actionReload(this.props.path));
  }

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render List');

    const { props } = this;
    const { path, view, rows, grps, isLoading,
      keyField, headerField, imgField,
      titleField, remainderField, reserveField, priceField, descField } = props;

    return (
    <Sui.Segment vertical style={{padding: 0}}>
      <Groups
        path={[...path, 'groups', view.parent]}
        listPath={path}
        parent={view.parent}
        keyField={keyField}
        headerField={headerField}
        data={grps} />
      <Sui.Segment loading={isLoading} style={{padding: 0, margin: 0}}>
        {rows.map((row) =>
          <Card
            key={row[keyField]}
            path={[...path, 'cards', row[keyField]]}
            data={row}
            keyField={keyField}
            headerField={headerField}
            titleField={titleField}
            remainderField={remainderField}
            priceField={priceField}
            reserveField={reserveField}
            descField={descField}
            imgField={imgField} />)}
        </Sui.Segment>
      </Sui.Segment>);
  }
}
//------------------------------------------------------------------------------
export default connect(List);
//------------------------------------------------------------------------------
