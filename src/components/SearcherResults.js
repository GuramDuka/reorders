//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import { LOADING_START_TOPIC, LOADING_DONE_TOPIC } from './Searcher';
import { nullLink, sscat } from '../store';
import Card from './DictList/Card';
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

  handleClick = i => this.setState({expanded: 'r' + i});

  grid = (r0, r1) => <Sui.Grid columns="2" divided style={{margin:0,padding:0}}>
    <Sui.Grid.Row style={{margin:0,paddingTop:'0.0em',paddingBottom:'0.0em'}}>
      <Sui.Grid.Column onClick={e => this.handleClick(0)}>
        {this.ico(r0)}
      </Sui.Grid.Column>
      <Sui.Grid.Column onClick={e => this.handleClick(1)}>
        {this.ico(r1)}
      </Sui.Grid.Column>
    </Sui.Grid.Row>
    <Sui.Grid.Row style={{margin:0,paddingTop:'0.0em',paddingBottom:'0.0em'}}>
      <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(0)}>
        {this.content(r0)}
      </Sui.Grid.Column>
      <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(1)}>
        {this.content(r1)}
      </Sui.Grid.Column>
    </Sui.Grid.Row>
    <Sui.Grid.Row style={{margin:0,paddingTop:'0.0em',paddingBottom:'0.0em'}}>
      <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(0)}>
        {this.extraContent(r0)}
      </Sui.Grid.Column>
      <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(1)}>
        {this.extraContent(r1)}
      </Sui.Grid.Column>
    </Sui.Grid.Row>
  </Sui.Grid>;

  closeCardHandler = e => this.setState({expanded: undefined});

  card = r => <Card
    expanded
    key={r.Ссылка}
    link={r.Ссылка}
    path={['products', 'list', 'cards', r.Ссылка]}
    data={r}
    closeCardHandler={this.closeCardHandler} />;

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.expanded !== nextState.expanded;
  }
  
  state = {};

  render() {
    //  if( process.env.NODE_ENV === 'development' )
    //    console.log('render SearcherResult');

    const { props, state } = this;

    if( state.expanded !== undefined )
      return this.card(props[state.expanded]);

    return this.grid(props.r0, props.r1);
  }
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class BottomSegment extends Component {
  id = (() => {
   	const a = new Uint32Array(3);
   	window.crypto.getRandomValues(a);
   	return a[0].toString() + a[1].toString() + a[2].toString();
  })();

  // isScrolledIntoView(elem) {
  //   var docViewTop = $(window).scrollTop();
  //   var docViewBottom = docViewTop + $(window).height();
  //   var elemTop = $(elem).offset().top;
  //   return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
  //   return (docViewBottom >= elemTop && docViewTop <= elemBottom);
  // }

  isScrolledIntoView = elem => {
    const r = elem.getBoundingClientRect();
    // Only completely visible elements return true:
    // return r.top >= 0 && r.bottom <= window.innerHeight;
    // Partially visible elements return true:
    return r.top < window.innerHeight && r.bottom >= 0;
  };

  removeListeners = () => {
    window.removeEventListener('scroll', this.isAppear);
    window.removeEventListener('touchmove', this.isAppear);
  };

  isAppear = e => {
    if( this.isScrolledIntoView(document.getElementById(this.id)) ) {
      this.removeListeners();
      this.props.appear();
    }
  };

  componentDidMount() {
    window.addEventListener('scroll', this.isAppear);
    window.addEventListener('touchmove', this.isAppear);
  }
  
  componentWillUnmount() {
    this.removeListeners();
  }

  state = { isLoading: false };

  render() {
    // if( process.env.NODE_ENV === 'development' )
    //   console.log('render BottomSegment');

    return <Sui.Segment vertical basic id={this.id}>
        <Sui.Loader active={this.state.isLoading} />
      </Sui.Segment>;
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

  emitLoading() {
    PubSub.publishSync(LOADING_START_TOPIC, this.offs + this.list.length);
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
    if( obj.index === undefined )
      return;

    if( obj.bottomSegment )
      this.bottomSegment.setState({isLoading: true});

    if( obj.index === 0 )
      obj.piece = props.category || !props.filter || props.filter.length <= 4 ? 20 : 10;

    if( obj.index === 0 )
      obj.emitLoading();
    
    // Load the rows
    const rr = {
      type: 'Номенклатура',
      piece: obj.piece,
      index: obj.index
    };

    if( props.filter )
      rr.filter = props.filter;
    
    if( props.parent !== nullLink )
      rr.parent = props.parent;

    if( props.category !== undefined )
      rr.category = props.category;
      
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

      obj.list = transform(json).rows;
      obj.offs = obj.index;
      obj.index = obj.list.length < rr.piece ? undefined : obj.index + rr.piece;

      obj.setState({offset: obj.offs});
      
      if( obj.offs === 0 || obj.index === undefined )
        obj.emitLoadingDone();
    })
    .catch(error => {
      if( process.env.NODE_ENV === 'development' )
        console.log(error);
      obj.list = [];
      obj.offs = obj.index;
      obj.index = undefined;
      obj.setState({offset: obj.offs});
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
    //this.restoreScrollPosition();
  }
  
  componentDidUpdate(prevProps, prevState) {
    if( this.index === 0 )
      this.loadMoreRows();
    //this.restoreScrollPosition();
  }

  render() {
    // if( process.env.NODE_ENV === 'development' )
    //   console.log('render SearcherResults');

    const { rend, list, offs } = this;

    while( rend.length > 0 ) {
      const type = rend[rend.length - 1].props.type;
      if( !type || type.search(/BottomSegment|Divider/g) < 0 ) 
        break;
      rend.pop();
    }

    delete this.bottomSegment;
    
    for( let l = rend.length, i = 0; i < list.length; i += 2 ) {
      const idx = offs + i;
      if( idx % 2 === 0 ) {
        if( l !== 0 )
          rend[l++] = <Sui.Divider key={idx} fitted />;
        rend[l++] = <Piece key={idx+1} r0={list[i]} r1={list[i+1]} />;
      }
    }

    if( list.length === this.piece ) {
      rend[rend.length] = <Sui.Divider type="Divider" key={rend.length} fitted />;
      rend[rend.length] = <BottomSegment type="BottomSegment"
        key={rend.length}
        appear={this.loadMoreRows}
        ref={e => this.bottomSegment = e} />;
    }

    return rend;
  }
}
//------------------------------------------------------------------------------
export default connect(SearcherResults);
//------------------------------------------------------------------------------
