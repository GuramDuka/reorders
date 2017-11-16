//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp from '../store';
import BACKEND_URL, { transform, serializeURIParams } from '../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Categories extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  load = () => {
    const obj = this;
    const rr = {
      target: 'Номенклатура',
    };

    const r = {
      m : 'category',
      f : 'list',
      r : rr
    };
  
    const opts = {
      method      : 'GET',
      credentials : 'omit',
      mode        : 'cors',
      cache       : 'default'
    };

    const url = BACKEND_URL + '?' + serializeURIParams({r:r});

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

      obj.setState({list: transform(json).rows});
    })
    .catch(error => {
      if( process.env.NODE_ENV === 'development' )
        console.log(error);
    });
  };

  state = {list: []};

  componentDidMount() {
    this.load();
  }
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Categories');

    const { list } = this.state;

    return <Sui.Dropdown item text="Категории" simple>
        <Sui.Dropdown.Menu>{list.map(v =>
          <Sui.Dropdown.Item key={v.Ссылка}>
            {v.Наименование}
          </Sui.Dropdown.Item>)}
        </Sui.Dropdown.Menu>
      </Sui.Dropdown>;
  }
}
//------------------------------------------------------------------------------
export default connect(Categories);
//------------------------------------------------------------------------------
