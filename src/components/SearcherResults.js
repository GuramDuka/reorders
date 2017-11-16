//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import { LOADING_START_TOPIC, LOADING_DONE_TOPIC } from './Searcher';
import disp, { nullLink, sscat } from '../store';
import { scrollXY } from '../util';
import nopic from '../assets/nopic.svg';
import amount from '../assets/amount.svg';
import price from '../assets/price.svg';
import BACKEND_URL, { transform, serializeURIParams } from '../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Piece extends Component {
  ico = row => {
    if( row ) {
      const icoUrl = row.ОсновноеИзображение && row.ОсновноеИзображение !== nullLink
        ? BACKEND_URL + '?' + serializeURIParams({r: {m: 'img', f: 'ico', u: row.ОсновноеИзображение, w: 128, h: 128, cs: 32}})
        : nopic;
      return <Sui.Image src={icoUrl} style={{display:'block',margin:'auto',maxHeight:128}} />;
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

  handleClick = (link, data) => disp(state => {
    const stack = state.getIn('body', 'viewStack');
    const curView = stack[stack.length - 1].view;
    const preView = stack.length >= 2 ? stack[stack.length - 2].view : undefined;
    
    if( curView === 'searcherResults' )
      if( preView === 'products' ) {
        const cardPath = ['searcher', 'cards', link];
        state = state.editIn('body', 'viewStack', v => v.push({
          view: 'card',
          link: link
        })).setIn('body', 'view', 'card')
        .setIn('searcher', 'scroll', scrollXY())
        .setIn(cardPath, 'data', data)
        .setIn(cardPath, 'expanded', true);
      }
    return state;
  });

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }
  
  render() {
    //  if( process.env.NODE_ENV === 'development' )
    //    console.log('render SearcherResult');

    const { r0, r1 } = this.props;

    return <Sui.Grid columns="2" divided style={{margin:0,padding:0}}>
      <Sui.Grid.Row style={{margin:0,paddingTop:'0.0em',paddingBottom:'0.0em'}}>
        <Sui.Grid.Column onClick={e => this.handleClick(r0.Ссылка, r0)}>
          {this.ico(r0)}
        </Sui.Grid.Column>
        <Sui.Grid.Column onClick={e => this.handleClick(r1.Ссылка, r1)}>
          {this.ico(r1)}
        </Sui.Grid.Column>
      </Sui.Grid.Row>
      <Sui.Grid.Row style={{margin:0,paddingTop:'0.0em',paddingBottom:'0.0em'}}>
        <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(r0.Ссылка, r0)}>
          {this.content(r0)}
        </Sui.Grid.Column>
        <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(r1.Ссылка, r1)}>
          {this.content(r1)}
        </Sui.Grid.Column>
      </Sui.Grid.Row>
      <Sui.Grid.Row style={{margin:0,paddingTop:'0.0em',paddingBottom:'0.0em'}}>
        <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(r0.Ссылка, r0)}>
          {this.extraContent(r0)}
        </Sui.Grid.Column>
        <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(r1.Ссылка, r1)}>
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

  emitStartDone() {
    PubSub.publishSync(LOADING_START_TOPIC, 0);
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

    if( this.index === 0 )
      this.emitStartDone();

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
  };

  restoreScrollPosition = () => {
    const { scroll } = this.props;
    window.scroll(scroll ? scroll.x : 0, scroll ? scroll.y : 0);
  };

  componentWillMount() {
    this.initialize();
  }

  componentWillReceiveProps(nextProps) {
    this.initialize();
  }

  componentDidMount() {
    this.loadMoreRows();
    this.restoreScrollPosition();
  }
  
  componentDidUpdate(prevProps, prevState) {
    if( this.index !== undefined )
      this.loadMoreRows();
    this.restoreScrollPosition();
  }

  render() {
    // if( process.env.NODE_ENV === 'development' )
    //   console.log('render SearcherResults');

    const { rend, list, offs } = this;

    for( let i = 0; i < list.length; i += 2 ) {
      const idx = offs + i;
      if( idx % 2 === 0 ) {
        const k = (idx / 2).toString();
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
