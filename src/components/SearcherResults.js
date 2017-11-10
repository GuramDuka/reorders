//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import { LOADING_DONE_TOPIC } from './Searcher';
import { nullLink, sscat } from '../store';
import nopic from '../assets/nopic.svg';
import amount from '../assets/amount.svg';
import price from '../assets/price.svg';
import BACKEND_URL, { transform, serializeURIParams } from '../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Piece extends Component {
  shouldComponentUpdate() {
    return false;
  }

  clickImg = e => this.setState({isImgLargeViewOpen: true});
  closeImgLargeView = e => this.setState({isImgLargeViewOpen: false});

  imgLargeView = imgUrl =>
    <Sui.Modal dimmer="blurring" open={this.state.isImgLargeViewOpen} onClose={this.closeImgLargeView}>
      <Sui.Modal.Content image>
        <Sui.Image wrapped fluid src={imgUrl} />
      </Sui.Modal.Content>
      <Sui.Modal.Actions>
        <Sui.Button icon="checkmark" labelPosition="right" content="Закрыть" onClick={this.closeImgLargeView} />
      </Sui.Modal.Actions>
    </Sui.Modal>;

  ico = row => {
    if( row ) {
      const icoUrl = row.ОсновноеИзображение && row.ОсновноеИзображение !== nullLink
        ? BACKEND_URL + '?' + serializeURIParams({r: {m: 'img', f: 'ico', u: row.ОсновноеИзображение, w: 128, h: 128, cs: 32}})
        : nopic;
      return <Sui.Image src={icoUrl} style={{display:'block',margin:'auto',maxHeight:128}} onClick={this.clickImg} />;
    }
    return null;
  };

  content = row => row ? sscat(' ', row.Наименование, row.Артикул, row.Производитель) : null;

  extraContent = row => row ?
    <Sui.Label.Group size="mini">
      <Sui.Label color="orange" style={{marginRight:1,paddingLeft:2,paddingRight:2}}>
        <strong>{row.Код}</strong>
      </Sui.Label>
      <Sui.Label image color="violet" style={{marginRight:1,paddingRight:2}}>
        <Sui.Image verticalAlign="top" src={amount} />
        <strong>{row.Остаток}</strong>
      </Sui.Label>
      <Sui.Label image color="violet" style={{marginRight:1,paddingRight:2}}>
        <Sui.Image verticalAlign="top" src={price} />
        <strong>{row.Цена + '₽'}</strong>
      </Sui.Label>
    </Sui.Label.Group> : null;

  render() {
    // if( process.env.NODE_ENV === 'development' )
    //   console.log('render SearcherResult');
    const { r0, r1 } = this.props;

    return <Sui.Grid columns="2" divided style={{margin:0,padding:0}}>
      <Sui.Grid.Row style={{margin:0,paddingTop:'0.0em',paddingBottom:'0.0em'}}>
        <Sui.Grid.Column>
          {this.ico(r0)}
        </Sui.Grid.Column>
        <Sui.Grid.Column>
          {this.ico(r1)}
        </Sui.Grid.Column>
      </Sui.Grid.Row>
      <Sui.Grid.Row style={{margin:0,paddingTop:'0.0em',paddingBottom:'0.0em'}}>
        <Sui.Grid.Column textAlign="center">
          {this.content(r0)}
        </Sui.Grid.Column>
        <Sui.Grid.Column textAlign="center">
          {this.content(r1)}
        </Sui.Grid.Column>
      </Sui.Grid.Row>
      <Sui.Grid.Row style={{margin:0,paddingTop:'0.0em',paddingBottom:'0.0em'}}>
        <Sui.Grid.Column textAlign="center">
          {this.extraContent(r0)}
        </Sui.Grid.Column>
        <Sui.Grid.Column textAlign="center">
          {this.extraContent(r1)}
        </Sui.Grid.Column>
      </Sui.Grid.Row>
    </Sui.Grid>;
  }
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class SearcherResults extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  state = {};

  initialize() {
    this.rend = [];
    this.list = [];
    this.index = 0;
    this.offs = 0;
    return this;
  }

  emitLoadingDone() {
    // idea from https://www.andrewhfarmer.com/component-communication/
    // implementation https://github.com/mroderick/PubSubJS
    PubSub.publishSync(LOADING_DONE_TOPIC, this.offs + this.list.length);
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
      piece: props.filter.length <= 4 ? 100 : 50,
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

      this.list = transform(json).rows;
      this.offs = this.index;
      this.index = this.list.length < rr.piece ? undefined : this.index + rr.piece;

      if( this.list.length !== 0 )
        obj.setState({fetchedRowCount: this.offs + this.list.length});
      
      if( this.index === undefined )
        obj.emitLoadingDone();
    })
    .catch(error => {
      if( process.env.NODE_ENV === 'development' )
        console.log(error);
      this.index = undefined;
      obj.emitLoadingDone();
    });
  }

  componentWillMount() {
    this.initialize();
  }

  componentWillReceiveProps(nextProps) {
    this.initialize();
  }

  componentDidMount() {
    this.loadMoreRows();
  }
  
  componentDidUpdate(prevProps, prevState) {
    if( this.index !== undefined )
      this.loadMoreRows();
  }

  render() {
    // if( process.env.NODE_ENV === 'development' )
    //   console.log('render SearcherResults');

    const { rend, list, offs } = this;

    for( let i = 0; i < list.length; i += 2 ) {
      const idx = offs + i;
      if( idx % 2 === 0 ) {
        const k = (idx/2).toString();
        if( rend.length !== 0 )
          rend.push(<Sui.Divider key={'d' + k} fitted />);
        rend.push(<Piece key={'p' + k} r0={list[i]} r1={list[i+1]} />);
      }
    }

    return rend;
  }
}
//------------------------------------------------------------------------------
export default connect(SearcherResults);
//------------------------------------------------------------------------------
