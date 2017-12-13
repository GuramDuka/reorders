//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { nullLink, sscat } from '../../store';
import * as PubSub from 'pubsub-js';
import { LOADING_DONE_TOPIC } from '../Searcher';
import { transform, sfetch, icoUrl, imgUrl } from '../../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Card extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path } = ownProps;
    return {
      clickTitle : e => {
        // cast to integer, fast (and short) way is the double-bitwise not (i.e. using two tilde characters)
        const idx = ~~e.currentTarget.attributes.idx.value;
        disp(state => state.toggleIn([...path, 'activeTitles'], idx, 2));
      },
      clickImg : () => this.setState({isImgLargeViewOpen: true})
    };
  }

  static connectOptions = { withRef: true };
  
  state = { isLoading: false, isImgLargeViewOpen: false };

  toggleCard = e => {
    if( !~~e.currentTarget.attributes.expanded.value )
      disp(this.reload(), true);
    
    const { path } = this.props;
    disp(state => state.toggleIn(path, 'expanded'));
  };

  reload = e => {
    const { link } = this.props;
    this.setState({isLoading: true});
    return state => {
      const r = {
        m : 'pkg',
        r : [
          { m : 'dict', f : 'prop', r : { type : 'Номенклатура', link : link } },
          { m : 'dict', f : 'desc', r : { type : 'Номенклатура', link : link } },
          { m : 'dict', f : 'rems', r : { type : 'Номенклатура', link : link } }
        ]
      };

      sfetch({a: true, e : true, r: r}, json => {
        json = transform(json);
        this.setState({props: json[0], desc: json[1], rems: json[2], isLoading: false});
      }, error => this.setState({isLoading: false}));

      return state;
    };
  };
  
  clickImg = () => this.setState({ isImgLargeViewOpen: true });
  closeImgLargeView = () => this.setState({isImgLargeViewOpen: false});
  closeCard = e => this.props.closeCardHandler && this.props.closeCardHandler(e);

  componentWillMount() {
    if( this.props.expanded && this.state.props === undefined )
      disp(this.reload(), true);
  }
  
  componentDidMount() {
    PubSub.publishSync(LOADING_DONE_TOPIC, 0);
  }
  
  render() {
    const { props, state } = this;
    const { expanded, data, clickTitle } = props;
    const activeTitles = Array.isArray(props.activeTitles) ? props.activeTitles : [];
    
    // if( process.env.NODE_ENV === 'development' )
    //   console.log('render Card: ' + props.path[props.path.length - 1] + ', isLoading: ' + state.isLoading);
    
    const icoKey = data.ОсновноеИзображение || nullLink;
    const ico = icoKey === nullLink ? null :
      <Sui.Image size="mini" src={icoUrl(icoKey, 28, 28)} style={{padding:2}} />;

    const img = icoKey === nullLink ? null :
      <Sui.Image floated="left" size="tiny" src={imgUrl(icoKey)} onClick={this.clickImg} />;
 
    const fprp = rows => {
      const a = [];

      for( let i = 0; i < rows.length; i++ ) {
        const row = rows[i];

        if( row.Индекс !== 0 )
          continue;

        let s = row.ЗначениеПредставление;

        rows.forEach(r => {
          if( r.Свойство === row.Свойство && r.Индекс !== 0 )
            s += ', ' + r.ЗначениеПредставление;
        });

        a.push(
          <strong key={a.length} style={{color:'black'}}>{row.СвойствоПредставление}: </strong>,
          <i key={a.length + 1} style={{color:'black'}}>{s + (i + 1 < rows.length ? ';' : '')}</i>
        );
      }
      return a;
    };

    const prop = expanded && state.props && state.props.rows.length !== 0 ? fprp(state.props.rows) : null;

    const frems = rows => rows.map((row, i, a) => [
      <strong key={i*2} style={{color:'black'}}>{row.Склад}: </strong>,
      <i key={i*2 + 1} style={{color:'black'}}>{row.Остаток + (i + 1 !== a.length ? ',' : '')}</i>
    ]);

    const rems = expanded && state.rems && state.rems.rows.length !== 0 ? frems(state.rems.rows) : null;
    
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
          {[<strong key="0" style={{color:'black'}}>Код: </strong>, <i key="1" style={{color:'black'}}>{data.Код}</i>]}
          {data.Артикул       ? [<strong key="6" style={{color:'black'}}>, Артикул: </strong>, <i key="10" style={{color:'black'}}>{data.Артикул}</i>] : null}
          {data.Производитель ? [<strong key="7" style={{color:'black'}}>, Производитель:</strong>, <i key="11" style={{color:'black'}}>{data.Производитель}</i>] : null}
          {data.Остаток       ? [<strong key="8" style={{color:'black'}}>, Остаток:</strong>, <i key="12" style={{color:'black'}}>{data.Остаток}</i>] : null}
          {data.Цена          ? [<strong key="9" style={{color:'black'}}>, Цена:</strong>, <i key="13" style={{color:'black'}}>{data.Цена + '₽'}</i>] : null}
        </Sui.Accordion.Content>{prop ?
        <Sui.Accordion.Title active={!!activeTitles[1]}
          index={1} idx={1} onClick={clickTitle}>
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
          index={2} idx={2} onClick={clickTitle}>
          <Sui.Label size="small" color="blue">
            <Sui.Icon name="dropdown" size="large" />
            Остатки
            <Sui.Label.Detail>{state.rems.rows.length}</Sui.Label.Detail>
          </Sui.Label>
        </Sui.Accordion.Title> : null}{rems ?
        <Sui.Accordion.Content active={!!activeTitles[2]}>
          {rems}
        </Sui.Accordion.Content> : null}{desc.length === 0 ? null :
        <Sui.Accordion.Title active={!!activeTitles[3]} index={3} idx={3} onClick={clickTitle}>
          <Sui.Label size="small" color="blue">
            <Sui.Icon name="dropdown" size="large" />
            Описание
            <Sui.Label.Detail>{desc.length}</Sui.Label.Detail>
          </Sui.Label>
        </Sui.Accordion.Title>}
        <Sui.Accordion.Content active={!!activeTitles[3]}>
          <Sui.Container fluid textAlign="justified" style={{color:'black'}}>{desc}</Sui.Container>
        </Sui.Accordion.Content>
      </Sui.Accordion> : null;
        
    const hdr = expanded
      ? (state.desc && state.desc.НаименованиеПолное ? state.desc.НаименованиеПолное : data.Наименование)
      : sscat(' ', '[' + data.Код + ']', data.Наименование, data.Артикул, data.Производитель);
    
    const expandedString = (~~!!expanded).toString();

    return (
      <Sui.Card id={props.id} fluid style={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}>
        <Sui.Card.Content style={{padding: '.25em'}}>
          {expanded ? img : null}
          <Sui.Card.Header style={{fontSize: '87%'}} expanded={expandedString} onClick={this.toggleCard}>
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
        <Sui.Card.Content extra style={{padding: '.25em'}}>{state.isLoading ? <Sui.Loader active inline size="small" /> :
          props.closeCardHandler
            ? <Sui.Button compact basic size="small" color="blue" onClick={this.closeCard} icon="close" content="Закрыть" labelPosition="left" />
            : <Sui.Button compact size="tiny" circular primary expanded={expandedString} onClick={this.toggleCard} icon="compress" />
          }{state.isLoading ? null :
          <Sui.Button compact basic size="small" color="blue" content="В корзину" icon="shop" labelPosition="left" />}
        </Sui.Card.Content> : null}{expanded ?
        <Sui.Modal open={this.state.isImgLargeViewOpen} onClose={this.closeImgLargeView}>
          <Sui.Modal.Content image>
            <Sui.Image wrapped fluid src={imgUrl(icoKey)} />
          </Sui.Modal.Content>
          <Sui.Modal.Actions>
            <Sui.Button icon="checkmark" labelPosition="right" content="Закрыть" onClick={this.closeImgLargeView} />
          </Sui.Modal.Actions>
        </Sui.Modal> : null}
      </Sui.Card>);
  }
}
//------------------------------------------------------------------------------
export default connect(Card);
//------------------------------------------------------------------------------
