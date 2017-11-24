//------------------------------------------------------------------------------
import { Component } from 'react';
import connect from 'react-redux-connect';
//import PropTypes from 'prop-types';
//import Immutable from 'seamless-immutable';
//import store from '../store';
//import * as Util from '../util';
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

  static connectOptions = { withRef: true };
  
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
