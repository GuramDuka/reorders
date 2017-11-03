//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import { nullLink, sscat } from '../store';
import BACKEND_URL, { transform, serializeURIParams } from '../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Piece extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render SearcherResult');
  
    return <Sui.Message content={this.props.content} />;
  }
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
const piece = 10;
//------------------------------------------------------------------------------
class SearcherResults extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  state = {};

  initialize() {
    this.list = [];
    this.index = 0;
    return this;
  }
  
  loadMoreRows = () => {
    const obj = this;
    const { props } = obj;

    // no more rows
    if( this.index === undefined )
      return;
  
    // Load the rows
    const rr = {
      type: 'Номенклатура',
      piece: piece,
      index: this.index,
      filter: props.filter
    };

    if( props.parent !== nullLink )
      rr.parent = props.parent;

    const r = {
      m : 'dict',
      f : 'filter',
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

      const { list } = this;
      const l = list.length;
      Array.prototype.push.apply(list, transform(json).rows);

      this.index = list.length === 0 || list.length === l ? undefined : list.length;

      if( this.index !== undefined )
        obj.setState({fetchedRowCount: list.length});
    })
    .catch(error => {
      if( process.env.NODE_ENV === 'development' )
        console.log(error);
      this.index = undefined;
    });
  }

  componentWillMount() {
    this.initialize().loadMoreRows();
  }

  componentDidUpdate(prevProps, prevState) {
    if( prevProps.filter !== this.props.filter )
      this.initialize().setState({fetchedRowCount: 0});
    this.loadMoreRows();
  }

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render SearcherResults');
  
    const content = row => sscat(' ', '[' + row.Код + ']', row.Наименование, row.Артикул, row.Производитель);

    return this.list.map((row, i) =>
      <Piece key={i} content={i.toString() + '. ' + content(row)} />);
  }
}
//------------------------------------------------------------------------------
export default connect(SearcherResults);
//------------------------------------------------------------------------------
