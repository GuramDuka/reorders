//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { nullLink } from '../store';
import BACKEND_URL, { transform, serializeURIParams } from '../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Categories extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path } = ownProps;
    return {
      handleCategoryClick : (e, data) => {
        const category = data.value;
        disp(state => {
          const sr = 'searcherResults';
          let stack, curView;
      
          for(;;) {
            stack = state.getIn('body', 'viewStack');
            curView = stack[stack.length - 1].view;
            if( curView === 'products' )
              break;
            state = state.editIn('body', 'viewStack', v => v.pop());
          }
          
          state = state.editIn('body', 'viewStack', v => v.push({view: sr}));
          state = state.setIn('searcher', 'parent', state.getIn(['products', 'list', 'view'], 'parent', nullLink));
          state = state.setIn('body', 'view', sr)
            .setIn('searcher', 'category', category)
            .deleteIn('searcher', 'scroll')
            .setIn(path, 'category', category);
      
          return state;
        });
      }
    };
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

      obj.setState({options: transform(json).rows.map(
        (r, i) => ({ key: i, text: r.Наименование, value: r.Ссылка }))});
    })
    .catch(error => {
      if( process.env.NODE_ENV === 'development' )
        console.log(error);
    });
  };

  componentDidMount() {
    this.load();
  }
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Categories');

    const { props } = this;

    return <Sui.Dropdown item style={{border:0, maxWidth:110}} compact
      onChange={props.handleCategoryClick}
      options={this.state && this.state.options ? this.state.options : []}
      placeholder="Категория"
      value={props.category} />;
  }
}
//------------------------------------------------------------------------------
export default connect(Categories);
//------------------------------------------------------------------------------
