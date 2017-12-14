//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as PubSub from 'pubsub-js';
import uuidv1 from 'uuid/v1';
import { transform, sfetch, icoUrl } from '../backend';
import { isVisibleInWindow } from '../util';
import { nullLink, sscat } from '../store';
import { LOADING_START_TOPIC, LOADING_DONE_TOPIC } from './Searcher';
import Card from './DictList/Card';
import nopic from '../assets/nopic.svg';
//import spinner from '../assets/spinner-dots.svg';
//import bigBug from '../assets/big-bug.svg';
//import hourglass from '../assets/hourglass.svg';
import styles from './SearcherResults.css';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
// class Image extends Component {
//   state = { url: hourglass };

//   componentDidMount() {
//     this.isMounted_ = true;
//   }

//   componentWillUnmount() {
//     delete this.isMounted_;
//   }

//   loadHandler = e => {
//     const { props } = this;

//     this.isMounted_ && sfetch({ noauth: true, batch: true, r: props.r },
//       result => this.isMounted_ && this.setState({ url: props.url }),
//       error => this.isMounted_ && this.setState({ url: bigBug }),
//       opts => this.isMounted_ && this.setState({ url: spinner }));
//   };

//   errorHandler = e => this.isMounted_ && this.setState({ url: bigBug });

//   render() {
//     // return <img alt="" src={this.props.url} className="regular"
//     //   onError={e => this.setState({url: bigBug}) } />;
//     const { state } = this;
//     const { url } = state;

//     // if ( state.url === spinner)
//     //   return [
//     //     <img key={1} alt="" src={spinner} className={styles.sploading} />,
//     //     <img key={2} alt="" src={props.url} className={styles.offscreen}
//     //       onLoad={this.loadHandler}
//     //       onError={this.errorHandler} />
//     //   ];

//     return <img alt="" src={url}
//       onLoad={url === hourglass ? this.loadHandler : null}
//       className={url === spinner
//         ? styles.sploading
//         : styles.regular} />
//   }
// }
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Piece extends Component {
  ico = row => {
    if (row) {
      if (row.ОсновноеИзображение && row.ОсновноеИзображение !== nullLink) {
        const w = ~~styles.icoWidth.substring(0, styles.icoWidth.length - 2);
        const h = ~~styles.icoHeight.substring(0, styles.icoHeight.length - 2);
        // const r = icoR(row.ОсновноеИзображение, w, h, 16);
        // return <Image url={icoUrl(row.ОсновноеИзображение, w, h, 16)} r={r} />;
        return <img alt="BROKEN"
          src={icoUrl(row.ОсновноеИзображение, w, h, 16)}
          className={styles.regular} />;
      }

      return <img alt="" src={nopic} className={styles.regular} />;
    }
    return null;
  };

  content = row => row ? sscat(' ', row.Наименование, row.Артикул, row.Производитель) : null;

  extraContent = (row, col) => row ?
    <Sui.List className={styles.lst}>
      <Sui.List.Item className={styles.itm}>
        <Sui.Label size="small" image color="orange" className={styles.lbl}>
          <Sui.Icon name="hashtag" className={styles.icn} />
          <strong>{row.Код}</strong>
        </Sui.Label>
      </Sui.List.Item>
      <Sui.List.Item className={styles.itm}>
        <Sui.Label size="small" image color="teal" className={styles.lbl}>
          <Sui.Icon name="rub" className={styles.icn} />
          <strong>{row.Цена}</strong>
        </Sui.Label>
      </Sui.List.Item>
      <Sui.List.Item className={styles.itm}>
        <Sui.Label size="small" image color="violet" className={styles.lbl}>
          <Sui.Icon name="tag" className={styles.icn} />
          <strong>{row.Остаток}</strong>
        </Sui.Label>
      </Sui.List.Item>{process.env.NODE_ENV === 'development' ?
        <Sui.List.Item className={styles.itm}>
          <Sui.Label size="small" image color="violet" className={styles.lbl}>
            <Sui.Icon name="slack" className={styles.icn} />
            <strong>{this.props.index + col}</strong>
          </Sui.Label>
        </Sui.List.Item> : null}
    </Sui.List> : null;

  handleClick = i => this.setState({ expanded: 'r' + i });

  grid = (r0, r1) =>
    <Sui.Grid columns="2" divided className={styles.grid}>
      <Sui.Grid.Row className={styles.row}>
        <Sui.Grid.Column onClick={e => this.handleClick(0)} className={styles.mp0}>
          {this.extraContent(r0, 0)}
          {this.ico(r0)}
        </Sui.Grid.Column>
        <Sui.Grid.Column onClick={e => this.handleClick(1)} className={styles.mp0}>
          {this.extraContent(r1, 1)}
          {this.ico(r1)}
        </Sui.Grid.Column>
      </Sui.Grid.Row>
      <Sui.Grid.Row className={styles.row}>
        <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(0)} className={styles.mp0}>
          {this.content(r0)}
        </Sui.Grid.Column>
        <Sui.Grid.Column textAlign="center" onClick={e => this.handleClick(1)} className={styles.mp0}>
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

    // return <div id={props.id} className={styles.line}>
    //   {this.grid(props.r0, props.r1)}
    //   <Sui.Divider fitted />
    // </div>;
  }
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
/*const AppearType = newEnum({ TOP: 1, BOTTOM: 2 });
//------------------------------------------------------------------------------
class AppearSegment extends Component {
  constructor(props) {
    super(props);
    this.isAppear = this.isAppear.bind(this);
  }

  id = uuidv1();
  appeared = false;

  isAppear(e) {
    if (this.appeared)
      return;

    const el = document.getElementById(this.id);

    if (el && isVisibleInWindow(el)) {
      this.appeared = true;
      this.removeListeners();
      this.setState({ isLoading: true });
      this.props.appearHandler();
    }
  }

  static appearEvents = ['scroll', 'touchmove'];

  addListeners = e => {
    for (const n of AppearSegment.appearEvents)
      window.addEventListener(n, this.isAppear);
  };

  removeListeners = e => {
    for (const n of AppearSegment.appearEvents)
      window.removeEventListener(n, this.isAppear);
  };

  componentWillMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  // componentDidMount() {
  //   this.isAppear();
  // }

  state = { isLoading: false };

  render() {
    // if( process.env.NODE_ENV === 'development' )
    //   console.log('render AppearSegment');
    const { props, state } = this;
    const { atype } = props;
    const attached = atype === AppearType.TOP ? 'top' : 'bottom';

    return <Sui.Segment vertical basic id={this.id} style={{ padding: 0, margin: 0 }}>{state.isLoading ?
      <Sui.Progress color="teal" attached={attached} percent={100} active={true} /> : null}
    </Sui.Segment>;
  }
}*/
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
const appearEvents = ['scroll', 'touchmove'];
//------------------------------------------------------------------------------
function addAppearListeners(w, e) {
  if (w)
    for (const n of appearEvents)
      w.addEventListener(n, e);
}
//------------------------------------------------------------------------------
function removeAppearListeners(w, e) {
  if (w)
    for (const n of appearEvents)
      w.removeEventListener(n, e);
}
//------------------------------------------------------------------------------
class SearcherResults extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static connectOptions = { withRef: true };

  constructor(props) {
    super(props);
    this.itemAppearHandler = this.itemAppearHandler.bind(this);
    this.windowResizeHandler = this.windowResizeHandler.bind(this);
  }

  piece = 40; // 40 items, 20 lines
  size = 60; // lines: must be (size % (piece / 2)) === 0
  state = { list: [], offs: 0, rndr: [] };

  emitLoading() {
    PubSub.publishSync(LOADING_START_TOPIC, this.state.list.length);
  }

  emitLoadingDone() {
    // idea from https://www.andrewhfarmer.com/component-communication/
    // implementation https://github.com/mroderick/PubSubJS
    PubSub.publishSync(LOADING_DONE_TOPIC, this.state.list.length);
  }

  loadRows = (opts, success, fail) => {
    if (!this.isMounted_ || this.fetchId)
      return;

    let { index, offs, list } = opts;

    if (index === undefined)
      index = opts;

    if (offs === undefined)
      offs = this.state.offs;

    if (list === undefined)
      list = this.state.list;

    const obj = this;
    const { props } = obj;
    const rr = {
      type: 'Номенклатура',
      piece: obj.piece,
      index: index
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

    obj.fetchId = sfetch({ r: r }, json => {
      delete obj.fetchId;
      if (!obj.isMounted_)
        return;

      const { rows } = transform(json);
      const rlength = rows.length;

      for (let i = 0; i < rlength; i++)
        list[index + i] = rows[i];

      obj.emitLoadingDone();
      success && success.constructor === Function && success({ list: list, offs: offs });
    }, error => {
      delete obj.fetchId;
      if (!obj.isMounted_)
        return;

      // if( error.message.indexOf('no more rows') >= 0 ) {}
      obj.emitLoadingDone();
      fail && fail.constructor === Function && fail(error);
    });
    obj.emitLoading();
  };

  itemAppearHandler(e) {
    if (!this.isMounted_)
      return;

    const { state, piece, size } = this;
    const { rndr } = state;
    const lastItem = rndr.length !== 0 ? rndr[rndr.length - 1] : undefined;

    if (lastItem && lastItem.props.children.props.itemIndex + 1 !== size) {
      const el = document.getElementById(lastItem.props.id);

      if (el && isVisibleInWindow(el, true)) {
        const { length } = state.list;

        if ((length % piece) === 0)
          this.loadRows(length, result => this.setState(result));
      }
    }
  };

  windowResizeHandler(e) {
    if (this.isMounted_)
      this.forceUpdate();
  }

  // restoreScrollPosition = () => {
  //   const { scroll } = this.props;
  //   window.scroll(scroll ? scroll.x : 0, scroll ? scroll.y : 0);
  // };

  componentWillMount() {
    addAppearListeners(window, this.itemAppearHandler);
    window.addEventListener('resize', this.windowResizeHandler);
  }

  componentWillUnmount() {
    delete this.isMounted_;
    removeAppearListeners(window, this.itemAppearHandler);
    window.removeEventListener('resize', this.windowResizeHandler);
  }

  componentDidMount() {
    this.isMounted_ = true;
    this.loadRows({ index: 0, offs: 0, list: [] },
      result => this.setState(result));
  }

  componentDidUpdate(prevProps, prevState) {
    // this.restoreScrollPosition();
    if (process.env.NODE_ENV === 'development')
      console.log('SearcherResults.componentDidUpdate');

    if (this.isMounted_ && this.props !== prevProps)
      this.loadRows({ index: 0, offs: 0, list: [] },
        result => this.setState({ ...result, rndr: [] }));

    if (this.props === prevProps && this.state.offs > prevState.offs)
      window.scroll(undefined, 0);
  }

  rkey = 1;

  render() {
    if (process.env.NODE_ENV === 'development')
      console.log('render SearcherResults', this.state.list.length);

    const { state, size } = this;
    const { rndr } = state;
    const { list, offs } = state;
    const roffs = offs >> 1;
    const rlength = (list.length >> 1) + (list.length & 0b1);
    const rl = Math.min(rlength, roffs + size);

    for (let j = rndr.length, i = roffs + j, k = i << 1; i < rl; i++ , j++ , k += 2)
      rndr[j] = <Sui.Segment id={uuidv1()} className={styles.segment} key={this.rkey++}>
        <Piece
          itemIndex={j}
          index={k}
          r0={list[k]}
          r1={list[k + 1]} />
      </Sui.Segment>;

    const load = offs =>
      this.loadRows({ index: offs, offs: offs },
        result => this.setState({ ...result, rndr: [] }));

    return <Sui.Segment.Group className={styles.segment}>{offs === 0 ? null :
      <Sui.Segment>
        <Sui.Button.Group>
          <Sui.Button primary onClick={e => load(0)}>
            Начало
          </Sui.Button>
          <Sui.Button.Or text="|" />
          <Sui.Button color="teal" onClick={e => load(offs - (size << 1))}>
            Назад
          </Sui.Button>
        </Sui.Button.Group>
      </Sui.Segment>}
      {rndr.slice(0, rndr.length)}{offs === 0 && rndr.length !== size ? null :
      <Sui.Segment>
        <Sui.Button.Group>{offs === 0 || rndr.length !== size ? null :
          <Sui.Button primary onClick={e => load(0)}>
            Начало
      </Sui.Button>}{offs === 0 || rndr.length !== size ? null :
            <Sui.Button.Or text="|" />}{offs === 0 || rndr.length !== size ? null :
              <Sui.Button color="teal" onClick={e => load(offs - (size << 1))}>
                Назад
      </Sui.Button>}{offs === 0 || rndr.length !== size ? null :
            <Sui.Button.Or text="|" />}{rndr.length !== size ? null :
              <Sui.Button positive onClick={e => load(offs + (size << 1))}>
                Дай
      </Sui.Button>}
        </Sui.Button.Group>
      </Sui.Segment>}
    </Sui.Segment.Group>;
  }
}
//------------------------------------------------------------------------------
export default connect(SearcherResults);
//------------------------------------------------------------------------------
