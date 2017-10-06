//------------------------------------------------------------------------------
import React from 'react';
//import axios from 'axios';
import * as Mui from 'material-ui';
import store from '../../store';
import BACKEND_URL from '../../backend';
import Base, {
  serializeURIParams,
  newAction
} from '../Base';
//------------------------------------------------------------------------------
function transformRows(data) {
  if( data.transform ) {
    const { cols, dict, text } = data;
    let { rows } = data;
    
    for( let i = rows.length - 1; i >= 0; i-- ) {
      const row = rows[i];
      let now = { lineNo : i + 1 };

      for( let j in cols ) {
        const v = row[j];

        if( v !== null ) {
          const n = cols[j];
          now[n] = text[n] ? dict[v] : v;
        }
      }

      rows[i] = now;
    }

    // delete data.transform;
    // delete data.cols;
    // delete data.dict;
    // delete data.t;
    return rows;
  }

  return data.rows;
}
//------------------------------------------------------------------------------
class Table extends Base {
  static storedProps = {
    view        : {},
    cols        : [],
    rows        : [],
    numr        : {}
  };

  static actionDataReady(path, data) {
    return newAction(state => {
      if( data && data.constructor === Object )
        for( let n in data )
          state = state.setIn([ ...path, n ], data[n]);
      return state;//.update(path, v => v.without('isLoading'));
    });
  };
  
  /*static actionReload_(path, options) {
    return newAction(state => {
      let view = state.getIn([ ...path, 'view' ]).asMutable();
      let opts = { paramsSerializer : serializeURIParams };
      
      // if( options.refresh )
      //   opts.headers = {
      //     'Cache-Control' : 'no-store, no-cache, must-revalidate'
      //   };

      if( options && options.transformView && options.transformView.constructor === Function )
        options.transformView(view);

      let data = {
        r : view,
        m : 'dict',
        f : 'list'
      };

      if( options && options.refresh )
        opts.data = data;
      else
        opts.params = { r : data };

      opts.url = BACKEND_URL;
      opts.method = options && options.refresh ? 'put' : 'get';
      
      axios(opts)
        .then(response => {
          const data = {
            view : view,
            numr : response.data.numeric,
            rows : transform(response.data)
          };
          store.dispatch(Table.actionDataReady(path, data));
          if( options ) {
            if( options.onDataReady && options.onDataReady.constructor === Function )
              options.onDataReady(data);
            if( options.onDone && options.onDone.constructor === Function )
              options.onDone(data);
          }
        })
        .catch(error => {
          console.log(error);
          //throw new Error('Bad response from server');
          store.dispatch(Table.actionDataReady(path));
          if( options ) {
            if( options.onDataError && options.onDataError.constructor === Function )
              options.onDataError(error);
            if( options.onDone && options.onDone.constructor === Function )
              options.onDone(error);
          }
      });

      return state;
    });
  }*/

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

        const data = {
          view : view,
          numr : json.numeric,
          rows : transformRows(json)
        };

        store.dispatch(Table.actionDataReady(path, data));

        if( options ) {
          if( options.onDataReady && options.onDataReady.constructor === Function )
            options.onDataReady(data);
          if( options.onDone && options.onDone.constructor === Function )
            options.onDone(data);
        }
      })
      .catch(error => {
        console.log(error);
        store.dispatch(Table.actionDataReady(path));
        onFetchError(error);
      });

      return state;
    });
  }
  
  componentWillMount() {
    store.dispatch(Table.actionReload(this.props.path));
  }

  render() {
    console.log('render Table, isDefaultState: ' + this.props.isDefaultState);
    const props = this.props;
    return (
      <Mui.Table>
        <Mui.TableHead>
          <Mui.TableRow>{props.cols.map(col =>
            <Mui.TableCell key={col.name}>
              {col.title || col.name}
            </Mui.TableCell>)}
          </Mui.TableRow>
        </Mui.TableHead>
        <Mui.TableBody>{props.rows.map((row, j) => (
            <Mui.TableRow key={row.lineNo}>{props.cols.map((col, i) =>
              <Mui.TableCell key={col.name + i}
                numeric={props.numr[col.name] !== undefined || i === 0}>
                {row[col.name]}
              </Mui.TableCell>)}
            </Mui.TableRow>))}
        </Mui.TableBody>
      </Mui.Table>);
  }
}
//------------------------------------------------------------------------------
export default Base.connect(Table);
//------------------------------------------------------------------------------
