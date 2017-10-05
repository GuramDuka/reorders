import React from 'react';
//import PropTypes from 'prop-types';
import axios from 'axios';
import * as Mui from 'material-ui';
import store from '../../store';
import BACKEND_URL from '../../backend';
import Base, { serializeURIParams, transform, newAction } from '../Base';

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
  
  static actionReload(path, options) {
    return newAction(state => {
      let view = state.getIn([ ...path, 'view' ]).asMutable();
      let opts = { paramsSerializer : serializeURIParams };
      
      // if( options.refresh )
      //   opts.headers = {
      //     'Cache-Control' : 'no-store, no-cache, must-revalidate'
      //   };

      if( options && options.transformView && options.transformView.constructor === Function )
        view = options.transformView(view);

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

export default Base.connect(Table);
