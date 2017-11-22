//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import { LOADING_START_TOPIC, LOADING_DONE_TOPIC } from '../Searcher';
import disp, { copy } from '../../store';
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

  state = {
    numr       : {},
    rows       : [],
    grps       : []
  };
  
  reload = (options) => {
    const obj = this;
    const { path } = this.props;
    PubSub.publishSync(LOADING_START_TOPIC, 0);
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

        json = transform(json, 'Ссылка');

        const data = {
          numr       : json.numeric,
          rows       : json.rows,
          grps       : json.grps
        };

        obj.setState(data);
        
        if( options && options.onDone && options.onDone.constructor === Function )
          options.onDone();

        disp(state => {
          state = state.setIn(path, 'view', view);

          if( options && options.onDone && options.onDone.constructor === Function )
            state = options.onDone(state);
          
          PubSub.publish(LOADING_DONE_TOPIC, 0);

          return state;
        });
      })
      .catch(error => {
        if( process.env.NODE_ENV === 'development' )
          console.log(error);

        if( options && options.onError && options.onError.constructor === Function )
          options.onError();

        disp(state => {
          if( options && options.onError && options.onError.constructor === Function )
              state = options.onError(state);
          PubSub.publish(LOADING_DONE_TOPIC, 0);
          return state;
        });
      });

      return state;
    };
  };
  
  restoreScrollPosition = () => {
    const { scroll } = this.props;
    window.scroll(scroll ? scroll.x : 0, scroll ? scroll.y : 0);
  };
  
  componentDidMount() {
    disp(this.reload(), true);
  }
  
  componentDidUpdate(prevProps, prevState) {
    this.restoreScrollPosition();
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
        listReloader={this.reload}
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
