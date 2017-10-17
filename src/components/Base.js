//------------------------------------------------------------------------------
import { Component } from 'react';
import connect from 'react-redux-connect';
//import PropTypes from 'prop-types';
//import Immutable from 'seamless-immutable';
//import store from '../store';
//import * as Util from '../util';
//------------------------------------------------------------------------------
function encode(val) {
  return encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    //.replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');
}
//------------------------------------------------------------------------------
function parseValue(k, v) {
  if( v.constructor === Date )
    v = v.toISOString();
  else if( v.constructor === Object )
    v = JSON.stringify(v);
  return encode(k) + '=' + encode(v);
}
//------------------------------------------------------------------------------
export function serializeURIParams(params) {
  let parts = [];
  
  for( let key in params ) {
    let val = params[key];

    if( val === null || typeof val === 'undefined' )
      continue;

    if( val.constructor === Array )
      key += '[]';

    if( val.constructor !== Array )
      val = [val];

    for( let v of val )
      parts.push(parseValue(key, v));
  }

  return parts;
}
//------------------------------------------------------------------------------
export function toggleBoolean(state, path, vname) {
  const vpath = [...path, vname];
  return state.getIn(vpath, false) ?
    state.updateIn(path, v => v.without(vname)) : state.setIn(vpath, true);
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Base extends Component {
  // componentWillMount() {
  //   const props = this.props;
  //   // console.log('componentWillMount: ' + this.__proto__.constructor.name
  //   //   + ', this.props.isDefaultState: ' + props.isDefaultState);
  //   if( props.isDefaultState )
  //     store.dispatch(this.constructor.actionStoreState(props));
  // }

  // shouldComponentUpdate(nextProps, nextState) {
  //   // console.log('shouldComponentUpdate: ' + this.__proto__.constructor.name
  //   //   + ', this.props.isDefaultState: ' + this.props.isDefaultState
  //   //   + ', nextProps.isDefaultState: ' + nextProps.isDefaultState);
  //   return !(this.props.isDefaultState && nextProps.isDefaultState === undefined);
  // }

  static mapStateToProps(state, ownProps) {
    return state.getIn(ownProps.path);
    // const proto = this;
    // const curState = state.getIn(ownProps.path);
    // let props = Util.mergeObjectsProps(curState, ownProps, proto.storedProps);
    // return props;
  }

  // static actionStoreState(props) {
  //   const proto = this;
  //   return newAction(state =>
  //     state.setIn(props.path, state.getIn(props.path, Immutable({}))
  //       .merge(Util.mergeObjectsProps(props, proto.storedProps))));
  // }

  static inheritCommonStaticMethods(successor) {
    for( let n of [ 'mapStateToProps'/*, 'actionStoreState'*/ ] ) {
      const m = Base[n];
      successor.prototype.constructor[n] = (...args) => m.apply(successor, args);
    }
  }

  static connect(successor) {
    Base.inheritCommonStaticMethods(successor);
    return connect(successor);
  }
}
//------------------------------------------------------------------------------
export default Base;
//------------------------------------------------------------------------------
