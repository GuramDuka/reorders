//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import uuidv1 from 'uuid/v1';
import { LOADING_START_TOPIC, LOADING_DONE_TOPIC } from './Searcher';
import { nullLink, sscat } from '../store';
import Card from './DictList/Card';
import nopic from '../assets/nopic.svg';
import spinner from '../assets/spinner-dots.svg';
import bigBug from '../assets/big-bug.svg';
import BACKEND_URL, {
  transform, serializeURIParams, sfetch, batchLinkLoad
} from '../backend';
//------------------------------------------------------------------------------
const style = {
  float: 'right', display: 'block', padding: 4, margin: 0, height: 96,
};
//------------------------------------------------------------------------------
const styleBigBug = {...style, padding: 30 };
//------------------------------------------------------------------------------
const styleLoading = (a => {
  return {...styleBigBug, WebkitAnimation: a, animation: a};
})('spinner360 2.5s linear 0s infinite');
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Image extends Component {
  componentDidMount() {
    const { r, url } = this.props;
    batchLinkLoad(r,
      e => this.setState({src: url}),
      e => this.setState({src: bigBug}));
  }

  state = { src: spinner };

  render() {
    const { src } = this.state;
    return <Sui.Image src={src}
      style={src === spinner ? styleLoading : src === bigBug ? styleBigBug : style} />;
  }
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
const lblStyle = { paddingLeft: 2, paddingRight: 2 };
//------------------------------------------------------------------------------
class Piece extends Component {
  ico = row => {
    if (row) {
      if( row.ОсновноеИзображение && row.ОсновноеИзображение !== nullLink ) {
        const r = { r: { m: 'img', f: 'ico', u: row.ОсновноеИзображение, w: 96, h: 96, cs: 16 } };
        const url = BACKEND_URL + '?' + serializeURIParams(r);
        r.noauth = true;
        return <Image style={style} url={url} r={r} />;
      }

      return <Sui.Image src={nopic} style={style} />;
    }
    return null;
  };

  content = row => row ? sscat(' ', row.Наименование, row.Артикул, row.Производитель) : null;

  extraContent = row => row ?
    <Sui.List style={{ left: 0, top: 0, position: 'absolute', zIndex: 100, marginLeft: 1 }}>
      <Sui.List.Item style={{ padding: 0, margin: 0, marginTop: 0 }}>
        <Sui.Label size="small" image color="orange" style={lblStyle}>
          <Sui.Icon name="hashtag" style={{ marginRight: 2 }} />
          <strong>{row.Код}</strong>
        </Sui.Label>
      </Sui.List.Item>
      <Sui.List.Item style={{ padding: 0, margin: 0, marginTop: 1 }}>
        <Sui.Label size="small" image color="teal" style={lblStyle}>
          <Sui.Icon name="rub" style={{ marginRight: 2 }} />
          <strong>{row.Цена}</strong>
        </Sui.Label>
      </Sui.List.Item>
      <Sui.List.Item style={{ padding: 0, margin: 0, marginTop: 1 }}>
        <Sui.Label size="small" image color="violet" style={lblStyle}>
          <Sui.Icon name="tag" style={{ marginRight: 2 }} />
          <strong>{row.Остаток}</strong>
        </Sui.Label>
      </Sui.List.Item>
    </Sui.List> : null;

  handleClick = i => this.setState({ expanded: 'r' + i });

  grid = (r0, r1) => <Sui.Grid columns="2" divided style={{ margin: 0, padding: 0 }}>
    <Sui.Grid.Row style={{ margin: 0, paddingTop: 0, paddingBottom: 0 }}>
      <Sui.Grid.Column onClick={e => this.handleClick(0)} style={{ margin: 0, padding: 0 }}>
        {this.extraContent(r0)}
        {this.ico(r0)}
      </Sui.Grid.Column>
      <Sui.Grid.Column onClick={e => this.handleClick(1)} style={{ margin: 0, padding: 0 }}>
        {this.extraContent(r1)}
        {this.ico(r1)}
      </Sui.Grid.Column>
    </Sui.Grid.Row>
    <Sui.Grid.Row style={{ margin: 0, paddingTop: 0, paddingBottom: 0 }}>
      <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(0)} style={{ margin: 0, padding: 0 }}>
        {this.content(r0)}
      </Sui.Grid.Column>
      <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(1)} style={{ margin: 0, padding: 0 }}>
        {this.content(r1)}
      </Sui.Grid.Column>
    </Sui.Grid.Row>
  </Sui.Grid>;

  closeCardHandler = e => this.setState({ expanded: undefined });

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

    if (state.expanded !== undefined)
      return this.card(props[state.expanded]);

    return this.grid(props.r0, props.r1);
  }
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class BottomSegment extends Component {
  id = uuidv1();
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

  static connectOptions = { withRef: true };
  
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
    if (obj.index === undefined)
      return;

    if (obj.bottomSegment)
      obj.bottomSegment.setState({ isLoading: true });

    if (obj.index === 0)
      obj.piece = props.category || !props.filter || props.filter.length <= 4 ? 40 : 20;

    if (obj.index === 0)
      obj.emitLoading();

    // Load the rows
    const rr = {
      type: 'Номенклатура',
      piece: obj.piece,
      index: obj.index
    };

    if (props.order)
      rr.order = props.order;

    if (props.filter)
      rr.filter = props.filter;

    if (props.category !== undefined)
      rr.category = props.category;
    else if (props.parent !== nullLink)
      rr.parent = props.parent;

    const r = {
      m: 'dict',
      f: 'filter',
      r: rr
    };

    sfetch({r:r}, json => {
      obj.list = transform(json).rows;
      obj.offs = obj.index;
      obj.index = obj.list.length < rr.piece ? undefined : obj.index + rr.piece;

      obj.setState({ offset: obj.offs });

      if (obj.offs === 0 || obj.index === undefined)
        obj.emitLoadingDone();
    }, error => {
      obj.list = [];
      obj.offs = obj.index;
      obj.index = undefined;
      obj.setState({ offset: obj.offs });
      obj.emitLoadingDone();
    });
  };

  // isScrolledIntoView(elem) {
  //   var docViewTop = $(window).scrollTop();
  //   var docViewBottom = docViewTop + $(window).height();
  //   var elemTop = $(elem).offset().top;
  //   return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
  //   return (docViewBottom >= elemTop && docViewTop <= elemBottom);
  // }

  isScrolledIntoView = e => {
    const r = e.getBoundingClientRect();
    // Only completely visible elements return true:
    // return r.top >= 0 && r.bottom <= window.innerHeight;
    // Partially visible elements return true:
    return r.top < window.innerHeight && r.bottom >= 0;
  };

  isAppear = e => {
    const bs = this.bottomSegment;

    if (bs && bs.id !== this.bottomSegmentId
      && this.isScrolledIntoView(document.getElementById(bs.id))) {
      this.bottomSegmentId = bs.id;
      this.loadMoreRows();
    }
  };

  appearEvents = ['scroll', 'touchmove'];

  addListeners = () => {
    for (const e of this.appearEvents)
      window.addEventListener(e, this.isAppear);
  };

  removeListeners = () => {
    for (const e of this.appearEvents)
      window.removeEventListener(e, this.isAppear);
  };

  restoreScrollPosition = () => {
    const { scroll } = this.props;
    window.scroll(scroll ? scroll.x : 0, scroll ? scroll.y : 0);
  };

  componentWillMount() {
    this.addListeners();
    this.initialize();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  componentWillReceiveProps(nextProps) {
    this.initialize();
  }

  componentDidMount() {
    this.loadMoreRows();
    //this.restoreScrollPosition();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.index === 0)
      this.loadMoreRows();
    //this.restoreScrollPosition();
  }

  render() {
    // if( process.env.NODE_ENV === 'development' )
    //   console.log('render SearcherResults');

    const { rend, list, offs } = this;

    while (rend.length > 0) {
      const type = rend[rend.length - 1].props.type;
      if (!type || type.search(/BottomSegment|Divider/g) < 0)
        break;
      rend.pop();
    }

    let l = rend.length;

    for (let i = 0; i < list.length; i += 2) {
      const idx = offs + i / 2;
      if (i % 2 === 0) {
        if (l !== 0)
          rend[l++] = <Sui.Divider key={'d' + idx} fitted />;
        rend[l++] = <Piece key={idx} r0={list[i]} r1={list[i + 1]} />;
      }
    }

    if (list.length === this.piece ) {
      //rend[l++] = <Sui.Divider type="Divider" key={uuidv1()} fitted />;
      rend[l] = <BottomSegment type="BottomSegment"
        key={l} ref={e => this.bottomSegment = e} />;
      l++;
    }

    return rend;
  }
}
//------------------------------------------------------------------------------
export default connect(SearcherResults);
//------------------------------------------------------------------------------
