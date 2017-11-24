//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { sscat } from '../../store';
import BACKEND_URL, { transform, serializeURIParams } from '../../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Props extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static connectOptions = { withRef: true };
  
  state = {
    numr       : {},
    rows       : [],
    grps       : []
  };
  
  reload = (options) => {
    const obj = this;
    const { link } = obj.props;
    obj.setState({ isLoading: true });
    
    return state => {
      const opts = {
        method      : options && options.refresh ? 'PUT' : 'GET',
        credentials : 'omit',
        mode        : 'cors',
        cache       : 'default'
      };
      
      const r = {
        r : { type : 'Номенклатура', link : link },
        m : 'props',
        f : 'get'
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
          numr       : json.numeric,
          rows       : json.rows
        };

        obj.setState({...data, isLoading: false});
      })
      .catch(error => {
        if( process.env.NODE_ENV === 'development' )
          console.log(error);
        obj.setState({ isLoading: false });
      });

      return state;
    };
  };
  
  componentWillMount() {
    disp(this.reload(), true);
  }
  
  render() {
    const { props, state } = this;

    if( process.env.NODE_ENV === 'development' )
      console.log('render Props: ' + props.link);
    
    const data = [];
    if( state.rows )
      state.rows.map(row => data.push(row.СвойствоПредставление + ': ' + row.ЗначениеПредставление));

    return (
      <Sui.Dimmer.Dimmable as={Sui.Container} dimmed={state.isLoading}>
        <Sui.Dimmer active={state.isLoading} inverted>
          <Sui.Loader>Загрузка свойств...</Sui.Loader>
        </Sui.Dimmer>
        {state.rows ? <span>{sscat(', ', ...data)}</span> : null}
      </Sui.Dimmer.Dimmable>);
  }
}
//------------------------------------------------------------------------------
export default connect(Props);
//------------------------------------------------------------------------------
