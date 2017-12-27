//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { nullLink, sscat, copy } from '../../store';
import { transform, sfetch, icoUrl, imgUrl } from '../../backend';
import { strftime } from '../../strftime';
import nopic from '../../assets/nopic.svg';
import styles from './Card.css';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Card extends Component {
  static mapStateToProps(state, ownProps) {
    const cartRows = ownProps.expanded ? state.getIn('cart', 'rows') : undefined;
    const i = cartRows ? cartRows.findIndex(v => v.Ссылка === ownProps.link) : -1;
    return {
      ...state.mapIn(ownProps.path),
      authorized: state.getIn('auth', 'authorized', false),
      employee: state.getIn('auth', 'employee'),
      cartDataIndex: i,
      cartData: cartRows ? cartRows[i] : undefined
    };
  }

  static connectOptions = { withRef: true };

  state = {
    isLoading: false,
    isImgLargeViewOpen: false,
    isCartDialogOpen: false
  };

  clickTitle = (e, data) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();    
    disp(state => state.toggleIn([...this.props.path, 'activeTitles'], data.idx, 2));
  };

  toggleCard = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();    
    disp(state => state.toggleIn(this.props.path, 'expanded'));
  };

  reload = e => {
    const { link } = this.props;
    return state => {
      const opts = {
        a: true,
        e: true,
        r: {
          m: 'pkg',
          r: [
            { m: 'dict', f: 'prop', r: { type: 'Номенклатура', link: link } },
            { m: 'dict', f: 'desc', r: { type: 'Номенклатура', link: link } }
          ]
        },
        rmod: r => r.a && r.e && r.r.push(
          { m: 'dict', f: 'rems', r: { type: 'Номенклатура', link: link } },
          { m: 'dict', f: 'bprs', r: { type: 'Номенклатура', link: link } },
          { m: 'dict', f: 'sprs', r: { type: 'Номенклатура', link: link } },
          { m: 'dict', f: 'lprs', r: { type: 'Номенклатура', link: link } })
      };

      sfetch(opts,
        json => {
          json = transform(json);
          this.setState({
            props: json[0],
            desc: json[1],
            rems: json[2],
            bprs: json[3],
            sprs: json[4],
            lprs: json[5],
            isLoading: false});
        },
        error => this.setState({ isLoading: false }),
        opts => this.setState({ isLoading: true }));

      return state;
    };
  };

  openCartDialog = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();    
    this.setState({isCartDialogOpen: true});
  };
  
  clickImg = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();    
    this.setState({ isImgLargeViewOpen: true });
  };

  closeImgLargeView = e => this.setState({ isImgLargeViewOpen: false });
  closeCard = e => this.props.closeCardHandler(e);

  componentDidMount() {
    if( this.props.expanded )
      disp(this.reload());
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.expanded && this.props.expanded !== prevProps.expanded)
      disp(this.reload());
  }

  dateFormatter = date => strftime('%d.%m.%Y %H:%M:%S', date);

  ico = link => {
    const { props } = this;
    const { expanded } = props;
    let w = expanded ? styles.icoExWidth : styles.icoWidth;
    w = ~~w.substring(0, w.length - 2);
    return <img className={expanded ? styles.icoEx : styles.ico} alt="BAD"
      src={link === nullLink ? nopic : icoUrl(link, w, undefined, expanded ? 32 : 16)}
      onClick={expanded ? this.clickImg : null} />;
  };

  closeCartDialogOpen = e => this.setState({isCartDialogOpen: false});

  putCartToServer = state => {
    if( state.getIn('cart', 'dirty', false) ) {
      const cart = copy(state.getIn([], 'cart', {}));
      delete cart.dirty;
      const opts = {
        method: 'PUT', r: { m: 'cart', f: 'put', r: cart }, a: true
      };

      sfetch(opts,
        json => disp(state => state.deleteIn('cart', 'dirty', true)),
        error => setTimeout(e => disp(this.putCartToServer), 3000)
      );
    }

    return state;
  };

  putItemToCart = e => disp(state => {
    const { data, cartDataIndex } = this.props;
    const cart = state.getIn([], 'cart', {});
    const rows = cart.rows ? cart.rows : [];
    const indx = cartDataIndex >= 0 ? cartDataIndex : 0;
    const row = indx >= 0 ? {...rows[indx]} : {...data};
    const { price, quantity } = this;

    row.price = price;
    row.quantity = quantity;

    state = state.setIn(['cart', 'rows'], indx, row)
      .setIn('cart', 'dirty', true);

    state = this.putCartToServer(state);

    this.setState({isCartDialogOpen: false});
    return state;
  });

  render() {
    const { props, state } = this;

    if( state.isLoading )
      return <Sui.Segment textAlign="center" className={styles.mp0}>
        <Sui.Loader active inline size="huge" />
      </Sui.Segment>;

    const { expanded, data, cartData } = props;
    const activeTitles = Array.isArray(props.activeTitles) ? props.activeTitles : [];

    // if( process.env.NODE_ENV === 'development' )
    //   console.log('render Card: ' + props.path[props.path.length - 1] + ', isLoading: ' + state.isLoading);

    const imgLink = data.ОсновноеИзображение || nullLink;
    const ico = this.ico(imgLink);

    const fprp = rows => {
      const a = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        if (row.Индекс !== 0)
          continue;

        let s = row.ЗначениеПредставление;

        rows.forEach(r => {
          if (r.Свойство === row.Свойство && r.Индекс !== 0)
            s += ', ' + r.ЗначениеПредставление;
        });

        s += i + 1 < rows.length ? '; ' : '';

        a.push(<span key={i}><strong>{row.СвойствоПредставление}</strong>:&nbsp;{s}</span>);
      }
      return a;
    };

    const prop = expanded && state.props && state.props.rows.length !== 0 ? fprp(state.props.rows) : null;

    const frems = rows => rows.map((row, i, a) => <span key={i}>
        <strong>{row.Склад}:&nbsp;</strong>
        {row.Остаток + (i + 1 !== a.length ? ', ' : '')}
      </span>);
    const rems = expanded && state.rems && state.rems.rows.length !== 0 ? frems(state.rems.rows) : null;

    const fbprs = rows =>
      <Sui.Grid divided celled="internally" columns="equal">
        <Sui.Grid.Row>
          <Sui.Grid.Column textAlign="center">
            <strong className={styles.colorBlack}>Дата</strong>
          </Sui.Grid.Column>
          <Sui.Grid.Column textAlign="center">
            <strong className={styles.colorBlack}>Документ</strong>
          </Sui.Grid.Column>
          <Sui.Grid.Column textAlign="center">
            <strong className={styles.colorBlack}>Цена</strong>
          </Sui.Grid.Column>
        </Sui.Grid.Row>{rows.map((row, i) =>
        <Sui.Grid.Row key={i}>
          <Sui.Grid.Column textAlign="right">
            <i className={styles.colorBlack}>{this.dateFormatter(row.Период)}</i>
          </Sui.Grid.Column>
          <Sui.Grid.Column>
            <i className={styles.colorBlack}>{row.РегистраторПредставление}</i>
          </Sui.Grid.Column>
          <Sui.Grid.Column textAlign="right">
            <i className={styles.colorBlack}>{row.Цена}</i>
          </Sui.Grid.Column>
        </Sui.Grid.Row>)}
      </Sui.Grid>;
    const bprs = expanded && state.bprs && state.bprs.rows.length !== 0 ? fbprs(state.bprs.rows) : null;

    const fsprs = rows =>
    <Sui.Grid divided celled="internally" columns="equal">
      <Sui.Grid.Row>
        <Sui.Grid.Column textAlign="center">
          <strong className={styles.colorBlack}>Поставщик</strong>
        </Sui.Grid.Column>
        <Sui.Grid.Column textAlign="center">
          <strong className={styles.colorBlack}>Цена</strong>
        </Sui.Grid.Column>
        <Sui.Grid.Column textAlign="center">
          <strong className={styles.colorBlack}>Дата</strong>
        </Sui.Grid.Column>
      </Sui.Grid.Row>{rows.map((row, i, a) => {
        if( a.findIndex(v => v.Поставщик === row.Поставщик && v.Цена === row.Цена ) < i )
          return null;
        return <Sui.Grid.Row key={i}>
          <Sui.Grid.Column>
            <i className={styles.colorBlack}>{row.ПоставщикПредставление}</i>
          </Sui.Grid.Column>
          <Sui.Grid.Column textAlign="right">
            <i className={styles.colorBlack}>{row.Цена}</i>
          </Sui.Grid.Column>
          <Sui.Grid.Column textAlign="right">
            <i className={styles.colorBlack}>{this.dateFormatter(row.Период)}</i>
          </Sui.Grid.Column>
        </Sui.Grid.Row>;
      })}
    </Sui.Grid>;
    const sprs = expanded && state.sprs && state.sprs.rows.length !== 0 ? fsprs(state.sprs.rows) : null;
  
    const flprs = rows =>
    <Sui.Grid divided celled="internally" columns="equal">
      <Sui.Grid.Row>
        <Sui.Grid.Column textAlign="center">
          <strong className={styles.colorBlack}>Дата</strong>
        </Sui.Grid.Column>
        <Sui.Grid.Column textAlign="center">
          <strong className={styles.colorBlack}>Склад</strong>
        </Sui.Grid.Column>
        <Sui.Grid.Column textAlign="center">
          <strong className={styles.colorBlack}>Цена</strong>
        </Sui.Grid.Column>
      </Sui.Grid.Row>{rows.map((row, i) =>
      <Sui.Grid.Row key={i}>
        <Sui.Grid.Column textAlign="right">
          <i className={styles.colorBlack}>{this.dateFormatter(row.Период)}</i>
        </Sui.Grid.Column>
        <Sui.Grid.Column>
          <i className={styles.colorBlack}>{row.СкладПредставление}</i>
        </Sui.Grid.Column>
        <Sui.Grid.Column textAlign="right">
          <i className={styles.colorBlack}>{row.Цена}</i>
        </Sui.Grid.Column>
      </Sui.Grid.Row>)}
    </Sui.Grid>;
    const lprs = expanded && state.lprs && state.lprs.rows.length !== 0 ? flprs(state.lprs.rows) : null;
    
    const desc = expanded && state.desc && state.desc.ДополнительноеОписаниеНоменклатуры.trim().length !== 0
      ? state.desc.ДополнительноеОписаниеНоменклатуры
        //.replace(/\\r\\n/g, '<br />')
        //.replace(/\\r/g, '<br />')
        //.replace(/\\n/g, '<br />')
        //.replace(/\\t/g, '&nbsp;')
        //.replace(//g, '&bull;') // https://unicode-table.com/en/F020/
        .replace(//g, '•')
        .trim()
      : null;

    const meta = !expanded ? null : [
      <p key={1}>
        <span><strong className={styles.colorBlack}>Код: </strong>{data.Код}</span>
        {data.Артикул ? <span><strong className={styles.colorBlack}>, Артикул: </strong>{data.Артикул}</span> : null}
        {data.Производитель ? <span><strong className={styles.colorBlack}>, Производитель: </strong>{data.Производитель}</span> : null}
        {data.Остаток ? <span><strong className={styles.colorBlack}>, Остаток: </strong>{data.Остаток}</span> : null}
        {data.Резерв ? <span><strong className={styles.colorBlack}>, Резерв: </strong>{data.Резерв}</span> : null}
        {data.Цена ? <span><strong className={styles.colorBlack}>, Цена: </strong>{data.Цена + '₽'}</span> : null}
      </p>,
      !prop || activeTitles[1] ? null :
        <Sui.Label key={14} idx={1} basic size="large" onClick={this.clickTitle} className={styles.msgBtn}>
          <Sui.Icon name="tasks" className={styles.mr0} />
          <Sui.Label.Detail>{state.props.rows.length}</Sui.Label.Detail>
        </Sui.Label>,
      !rems || activeTitles[2] ? null :
        <Sui.Label key={15} idx={2} basic size="large" onClick={this.clickTitle} className={styles.msgBtn}>
          <Sui.Icon name="database" className={styles.mr0} />
          <Sui.Label.Detail>{state.rems.rows.length}</Sui.Label.Detail>
        </Sui.Label>,
      !desc || activeTitles[3] ? null :
        <Sui.Label key={16} idx={3} basic size="large" onClick={this.clickTitle} className={styles.msgBtn}>
          <Sui.Icon name="hashtag" className={styles.mr0} />
          <Sui.Label.Detail>{desc.length}</Sui.Label.Detail>
        </Sui.Label>,
      !bprs || activeTitles[4] ? null :
        <Sui.Label key={17} idx={4} basic size="large" onClick={this.clickTitle} className={styles.msgBtn}>
          <Sui.Icon name="cube" className={styles.mr0} />
          <Sui.Label.Detail>{state.bprs.rows.length}</Sui.Label.Detail>
        </Sui.Label>,
      !sprs || activeTitles[5] ? null :
        <Sui.Label key={18} idx={5} basic size="large" onClick={this.clickTitle} className={styles.msgBtn}>
          <Sui.Icon name="diamond" className={styles.mr0} />
          <Sui.Label.Detail>{state.sprs.rows.length}</Sui.Label.Detail>
        </Sui.Label>,
      !lprs || activeTitles[6] ? null :
        <Sui.Label key={19} idx={6} basic size="large" onClick={this.clickTitle} className={styles.msgBtn}>
          <Sui.Icon name="money" className={styles.mr0} />
          <Sui.Label.Detail>{state.lprs.rows.length}</Sui.Label.Detail>
        </Sui.Label>,
      !prop || !activeTitles[1] ? null :
        <Sui.Message key={14} positive idx={1} header="Свойства" content={prop}
          onDismiss={this.clickTitle} className={[styles.clearBoth, styles.msg1].join(' ')} />,
      !rems || !activeTitles[2] ? null :
        <Sui.Message key={15} positive idx={2} header="Остатки" content={rems}
          onDismiss={this.clickTitle} className={[styles.clearBoth, styles.msg1].join(' ')} />,
      !desc || !activeTitles[3] ? null :
        <Sui.Message key={16} positive idx={3} header="Описание" content={desc}
          onDismiss={this.clickTitle} className={[styles.clearBoth, styles.m1].join(' ')} />,
      !bprs || !activeTitles[4] ? null :
        <Sui.Message key={17} positive idx={4} header="Базовые цены" content={bprs}
          onDismiss={this.clickTitle} className={[styles.clearBoth, styles.msg1].join(' ')} />,
      !sprs || !activeTitles[5] ? null :
        <Sui.Message key={18} positive idx={5} header="Цены поставщиков" content={sprs}
          onDismiss={this.clickTitle} className={[styles.clearBoth, styles.msg1].join(' ')} />,
      !lprs || !activeTitles[6] ? null :
        <Sui.Message key={19} positive idx={6} header="Цены продажи" content={lprs}
          onDismiss={this.clickTitle} className={[styles.clearBoth, styles.msg1].join(' ')} />,
    ];

    const hdr = expanded
      ? state.desc && state.desc.НаименованиеПолное
        ? state.desc.НаименованиеПолное.replace(/(,(?=\S)|:)/g, ', ')
        : data.Наименование.replace(/(,(?=\S)|:)/g, ', ')        
      : <span>{sscat(' ', '[' + data.Код + ']',
        data.Наименование.replace(/(,(?=\S)|:)/g, ', '),
        data.Артикул.replace(/(,(?=\S)|:)/g, ', '),
        data.Производитель.replace(/(,(?=\S)|:)/g, ', '))}
        <strong>{
        ', ' + data.Остаток + (data.Резерв ? ' (' + data.Резерв + ')' : '') + '⧉'
        + ', ' + data.Цена + '₽'}
        </strong>
      </span>;

    const toCartButton =
      <Sui.Button as="div" labelPosition="right" onClick={this.openCartDialog}>
        <Sui.Button compact basic color="blue">
          <Sui.Icon name="shop" />
        </Sui.Button>
        <Sui.Label as="a" basic color="blue" pointing="left">
          {cartData ? 'В корзине ' + cartData.quantity : 'В корзину'}
        </Sui.Label>
      </Sui.Button>;

    const closeButton = props.closeCardHandler ?
      <Sui.Button as="div" labelPosition="right" onClick={this.closeCard}>
        <Sui.Button compact basic color="blue">
          <Sui.Icon name="close" />
        </Sui.Button>
        <Sui.Label as="a" basic color="blue" pointing="left">Закрыть</Sui.Label>
      </Sui.Button>
      : null;//<Sui.Button compact size="tiny" circular primary onClick={this.toggleCard} icon="compress" />;

    if( expanded )
      return <Sui.Segment.Group id={props.id} className={styles.mp0} onClick={closeButton ? null : this.toggleCard}>
      <Sui.Segment className={styles.cardEx}>
        {ico}
        {hdr}
        {meta}
      </Sui.Segment>
      <Sui.Segment className={[styles.mp0, styles.clearBoth].join(' ')}>
        {closeButton}
        {toCartButton}
      </Sui.Segment>
      <Sui.Modal open={state.isImgLargeViewOpen} onClose={this.closeImgLargeView}>
        <Sui.Modal.Content image>
          <Sui.Image wrapped fluid alt="BROKEN" src={imgLink === nullLink ? nopic : imgUrl(imgLink)} />
        </Sui.Modal.Content>
        <Sui.Modal.Actions>
          <Sui.Button icon="checkmark" labelPosition="right" content="Закрыть" onClick={this.closeImgLargeView} />
        </Sui.Modal.Actions>
      </Sui.Modal>
      <Sui.Modal open={state.isCartDialogOpen} onClose={this.closeCartDialogOpen}>
        <Sui.Modal.Header className={styles.cartDlgHdr}>В корзину</Sui.Modal.Header>
        <Sui.Modal.Content>{props.employee ?
          <Sui.Input type="numeric" labelPosition="right" className={styles.cartDlgInput}
            defaultValue={data.Цена}>
            <Sui.Label basic className={styles.cartDlgInputL1}>
              Базовая цена
            </Sui.Label>
            <input className={styles.cartDlgInnerInput} />
            <Sui.Label basic className={styles.cartDlgInputL2}>₽</Sui.Label>
          </Sui.Input> : null}{props.employee ?
          <Sui.Input type="numeric" labelPosition="right" className={styles.cartDlgInput}
            defaultValue={0}>
            <Sui.Label basic className={styles.cartDlgInputL1}>
              Процент наценки
            </Sui.Label>
            <input className={styles.cartDlgInnerInput} />
            <Sui.Label basic className={styles.cartDlgInputL2}>%</Sui.Label>
          </Sui.Input> : null}
          <Sui.Input type="numeric" labelPosition="right" className={styles.cartDlgInput}
            defaultValue={cartData ? cartData.price : data.Цена}
            placeholder={cartData ? cartData.price : data.Цена}
            onChange={(e, data) => this.price = data.value}
            disabled={!props.employee}>
            <Sui.Label basic className={styles.cartDlgInputL1}>
              Цена
            </Sui.Label>
            <input className={styles.cartDlgInnerInput} />
            <Sui.Label basic className={styles.cartDlgInputL2}>₽</Sui.Label>
          </Sui.Input>
          <Sui.Input type="numeric" labelPosition="right" className={styles.cartDlgInput}
            defaultValue={cartData ? cartData.quantity : 1}
            placeholder={cartData ? cartData.quantity : 1}
            onChange={(e, data) => this.quantity = data.value}>
            <Sui.Label basic className={styles.cartDlgInputL1}>
              Количество
            </Sui.Label>
            <input className={styles.cartDlgInnerInput} />
            <Sui.Label basic className={styles.cartDlgInputL2}>⧉</Sui.Label>
          </Sui.Input>
        </Sui.Modal.Content>
        <Sui.Modal.Actions>
          <Sui.Button.Group>
            <Sui.Button compact basic primary icon="shop" labelPosition="left" content="Положить" onClick={this.putItemToCart} />
            <Sui.Button compact basic primary icon="close" labelPosition="left" content="Закрыть" onClick={this.closeCartDialogOpen} />
          </Sui.Button.Group>
        </Sui.Modal.Actions>
      </Sui.Modal>
    </Sui.Segment.Group>;

    return <Sui.Segment className={styles.card} onClick={this.toggleCard}>
      {ico}
      {hdr}
      </Sui.Segment>;
  }
}
//------------------------------------------------------------------------------
export default connect(Card);
//------------------------------------------------------------------------------
