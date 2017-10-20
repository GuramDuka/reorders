//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { nullLink, copy } from '../../store';
import BACKEND_URL, { transform, serializeURIParams } from '../../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Props extends Component {
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
          state = Props.actionDataReady(path, data)(state)
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
    disp(Props.actionReload(this.props.path));
  }
  
  state = { isLoading: false };
  
  render() {
    const { props } = this;
    const { expanded } = props;

    if( process.env.NODE_ENV === 'development' )
      console.log('render Props: ' + props.path);
    
    return (
      <Sui.Dimmer.Dimmable as={Sui.Container} dimmed={this.state.isLoading}>
        <Sui.Dimmer active={this.state.isLoading} inverted>
          <Sui.Loader>Загрузка свойств...</Sui.Loader>
        </Sui.Dimmer>
        <p>{'Свойство1: 1111'}</p>
        <p>{'Свойство2: 2222'}</p>
        <p>{'Свойство3: 3333'}</p>
      </Sui.Dimmer.Dimmable>);
  }
}
//------------------------------------------------------------------------------
export default connect(Props);
//------------------------------------------------------------------------------
