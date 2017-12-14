//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { nullLink, sscat } from '../../store';
import { transform, sfetch, icoUrl, imgUrl } from '../../backend';
import { strftime } from '../../strftime';
import styles from './Card.css';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Card extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static connectOptions = { withRef: true };

  state = { isLoading: false, isImgLargeViewOpen: false };

  clickTitle = idx => disp(state => state.toggleIn([...this.props.path, 'activeTitles'], idx, 2));

  toggleCard = e => {
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

  addToCart = e => disp(state => {
    
  });
  
  clickImg = e => this.setState({ isImgLargeViewOpen: true });
  closeImgLargeView = e => this.setState({ isImgLargeViewOpen: false });
  closeCard = e => this.props.closeCardHandler && this.props.closeCardHandler(e);

  componentDidMount() {
    if( this.props.expanded )
      disp(this.reload());
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.expanded && this.props.expanded !== prevProps.expanded)
      disp(this.reload());
  }

  dateFormatter = date => strftime('%d.%m.%Y %H:%M:%S', date);

  render() {
    const { props, state } = this;
    const { expanded, data } = props;
    const activeTitles = Array.isArray(props.activeTitles) ? props.activeTitles : [];

    // if( process.env.NODE_ENV === 'development' )
    //   console.log('render Card: ' + props.path[props.path.length - 1] + ', isLoading: ' + state.isLoading);

    const icoKey = data.ОсновноеИзображение || nullLink;
    const ico = icoKey === nullLink ? null :
      <Sui.Image size="mini" src={icoUrl(icoKey, 28, 28)} style={{ padding: 2 }} />;

    const img = icoKey === nullLink ? null :
      <Sui.Image floated="left" size="tiny" src={imgUrl(icoKey)} onClick={this.clickImg} />;

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

        a.push(
          <strong key={a.length} className={styles.colorBlack}>{row.СвойствоПредставление}: </strong>,
          <i key={a.length + 1} className={styles.colorBlack}>{s + (i + 1 < rows.length ? ';' : '')}</i>
        );
      }
      return a;
    };

    const prop = expanded && state.props && state.props.rows.length !== 0 ? fprp(state.props.rows) : null;

    const frems = rows => rows.map((row, i, a) => [
      <strong key={i * 2} className={styles.colorBlack}>{row.Склад}: </strong>,
      <i key={i * 2 + 1} className={styles.colorBlack}>{row.Остаток + (i + 1 !== a.length ? ',' : '')}</i>
    ]);
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
        </Sui.Grid.Row>{rows.map(row =>
        <Sui.Grid.Row>
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
        return <Sui.Grid.Row>
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
      </Sui.Grid.Row>{rows.map(row =>
      <Sui.Grid.Row>
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
    
    const desc = expanded && state.desc
      ? state.desc.ДополнительноеОписаниеНоменклатуры
        //.replace(/\\r\\n/g, '<br />')
        //.replace(/\\r/g, '<br />')
        //.replace(/\\n/g, '<br />')
        //.replace(/\\t/g, '&nbsp;')
        //.replace(//g, '&bull;') // https://unicode-table.com/en/F020/
        .replace(//g, '•')
        .trim()
      : '';

    const meta = expanded ?
      <Sui.Accordion exclusive={false}>
        <Sui.Accordion.Content active={true}>
          {[<strong key="0" className={styles.colorBlack}>Код: </strong>, <i key="1" className={styles.colorBlack}>{data.Код}</i>]}
          {data.Артикул ? [<strong key="6" className={styles.colorBlack}>, Артикул: </strong>, <i key="10" className={styles.colorBlack}>{data.Артикул}</i>] : null}
          {data.Производитель ? [<strong key="7" className={styles.colorBlack}>, Производитель:</strong>, <i key="11" className={styles.colorBlack}>{data.Производитель}</i>] : null}
          {data.Остаток ? [<strong key="8" className={styles.colorBlack}>, Остаток:</strong>, <i key="12" className={styles.colorBlack}>{data.Остаток}</i>] : null}
          {data.Цена ? [<strong key="9" className={styles.colorBlack}>, Цена:</strong>, <i key="13" className={styles.colorBlack}>{data.Цена + '₽'}</i>] : null}
        </Sui.Accordion.Content>{prop ?
          <Sui.Accordion.Title active={!!activeTitles[1]}
            index={1} idx={1} onClick={e => this.clickTitle(1)}>
            <Sui.Label size="small" color="blue">
              <Sui.Icon name="dropdown" size="large" />
              Свойства
            <Sui.Label.Detail>{state.props.rows.length}</Sui.Label.Detail>
            </Sui.Label>
          </Sui.Accordion.Title> : null}{prop ?
            <Sui.Accordion.Content active={!!activeTitles[1]}>
              {prop}
            </Sui.Accordion.Content> : null}{rems ?
              <Sui.Accordion.Title active={!!activeTitles[2]}
                index={2} idx={2} onClick={e => this.clickTitle(2)}>
                <Sui.Label size="small" color="blue">
                  <Sui.Icon name="dropdown" size="large" />
                  Остатки
            <Sui.Label.Detail>{state.rems.rows.length}</Sui.Label.Detail>
            </Sui.Label>
              </Sui.Accordion.Title> : null}{rems ?
              <Sui.Accordion.Content active={!!activeTitles[2]}>
                {rems}
              </Sui.Accordion.Content> : null}{desc.length === 0 ? null :
              <Sui.Accordion.Title active={!!activeTitles[3]} index={3} idx={3} onClick={e => this.clickTitle(3)}>
                <Sui.Label size="small" color="blue">
                  <Sui.Icon name="dropdown" size="large" />
                  Описание
                  <Sui.Label.Detail>{desc.length}</Sui.Label.Detail>
                </Sui.Label>
              </Sui.Accordion.Title>}
        <Sui.Accordion.Content active={!!activeTitles[3]}>
          <Sui.Container fluid textAlign="justified" className={styles.colorBlack}>{desc}</Sui.Container>
        </Sui.Accordion.Content>{bprs ?
        <Sui.Accordion.Title active={!!activeTitles[4]}
          index={4} idx={4} onClick={e => this.clickTitle(4)}>
          <Sui.Label size="small" color="blue">
            <Sui.Icon name="dropdown" size="large" />
            Базовые цены
            <Sui.Label.Detail>{state.bprs.rows.length}</Sui.Label.Detail>
          </Sui.Label>
        </Sui.Accordion.Title> : null}{bprs ?
        <Sui.Accordion.Content active={!!activeTitles[4]}>
          {bprs}
        </Sui.Accordion.Content> : null}{sprs ?
        <Sui.Accordion.Title active={!!activeTitles[5]}
          index={5} idx={5} onClick={e => this.clickTitle(5)}>
          <Sui.Label size="small" color="blue">
            <Sui.Icon name="dropdown" size="large" />
            Цены поставщиков
            <Sui.Label.Detail>{state.sprs.rows.length}</Sui.Label.Detail>
          </Sui.Label>
        </Sui.Accordion.Title> : null}{sprs ?
        <Sui.Accordion.Content active={!!activeTitles[5]}>
          {sprs}
        </Sui.Accordion.Content> : null}{lprs ?
        <Sui.Accordion.Title active={!!activeTitles[6]}
          index={6} idx={6} onClick={e => this.clickTitle(6)}>
          <Sui.Label size="small" color="blue">
            <Sui.Icon name="dropdown" size="large" />
            Цены продажи
            <Sui.Label.Detail>{state.lprs.rows.length}</Sui.Label.Detail>
          </Sui.Label>
        </Sui.Accordion.Title> : null}{lprs ?
        <Sui.Accordion.Content active={!!activeTitles[6]}>
          {lprs}
        </Sui.Accordion.Content> : null}
      </Sui.Accordion> : null;

    const hdr = expanded
      ? (state.desc && state.desc.НаименованиеПолное ? state.desc.НаименованиеПолное : data.Наименование)
      : sscat(' ', '[' + data.Код + ']', data.Наименование, data.Артикул, data.Производитель);

    const expandedString = (~~!!expanded).toString();

    return <Sui.Card id={props.id} fluid style={{ marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0 }}>
      <Sui.Card.Content style={{ padding: '.25em' }}>
        {expanded ? img : null}
        <Sui.Card.Header style={{ fontSize: '87%' }} expanded={expandedString} onClick={this.toggleCard}>
          {hdr}{expanded ? null :
            <Sui.Label size="small" color="teal" image>
              {ico}
              {data.ОстатокОбщий}{data.Резерв ? ' (' + data.Резерв + ')' : ''}
              <Sui.Label.Detail>{data.Цена}₽</Sui.Label.Detail>
            </Sui.Label>}
        </Sui.Card.Header>{expanded ?
          <Sui.Card.Meta>
            {meta}
          </Sui.Card.Meta> : null}
      </Sui.Card.Content>{expanded ?
        <Sui.Card.Content extra style={{ padding: '.25em' }}>{state.isLoading ? <Sui.Loader active inline size="small" /> :
          props.closeCardHandler
            ? <Sui.Button compact basic size="small" color="blue" onClick={this.closeCard} icon="close" content="Закрыть" labelPosition="left" />
            : <Sui.Button compact size="tiny" circular primary expanded={expandedString} onClick={this.toggleCard} icon="compress" />
        }{state.isLoading ? null :
          <Sui.Button compact basic
            size="small"
            color="blue"
            content="В корзину"
            icon="shop"
            labelPosition="left"
            onClick={this.addToCart} />}
        </Sui.Card.Content> : null}{expanded ?
          <Sui.Modal open={this.state.isImgLargeViewOpen} onClose={this.closeImgLargeView}>
            <Sui.Modal.Content image>
              <Sui.Image wrapped fluid src={imgUrl(icoKey)} />
            </Sui.Modal.Content>
            <Sui.Modal.Actions>
              <Sui.Button icon="checkmark" labelPosition="right" content="Закрыть" onClick={this.closeImgLargeView} />
            </Sui.Modal.Actions>
          </Sui.Modal> : null}
    </Sui.Card>;
  }
}
//------------------------------------------------------------------------------
export default connect(Card);
//------------------------------------------------------------------------------
