//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { nullLink } from '../../store';
import BACKEND_URL, { serializeURIParams } from '../../backend';
import Props from './Props';
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
      toggleCard : e => disp(state => state.toggleIn(path, 'expanded')),
      clickPropsTitle : e => {
        // cast to integer, fast (and short) way is the double-bitwise not (i.e. using two tilde characters)
        const propsTitleIndex = ~~e.currentTarget.attributes.idx.value;
        disp(state => {
          if( propsTitleIndex === 1 )
            state = state.setIn([...path, 'properties'], 'expanded', true);
          return state.setIn(path, 'propsActiveTitleIndex', propsTitleIndex);
        });
      },
      clickImg : () => this.setState({isImgLargeViewOpen: true})
    };
  }

  state = { isImgLargeViewOpen: false };
  
  clickImg = () => this.setState({ isImgLargeViewOpen: true });
  closeImgLargeView = () => this.setState({isImgLargeViewOpen: false});

  render() {
    const { props } = this;
    const { expanded, toggleCard, data, getHeaderField, headerField,
      imgField, titleField, remainderField, reserveField, priceField, descField,
      propsActiveTitleIndex, clickPropsTitle } = props;

    if( process.env.NODE_ENV === 'development' )
      console.log('render Card: ' + props.path[props.path.length - 1]);
    
    const icoKey = data[imgField] || nullLink;
    
    const icoUrl = BACKEND_URL + '?'
      + serializeURIParams({r: {m: 'img', f: 'ico', u: icoKey, w: 28, h: 28}});
    const ico = icoKey === nullLink ? null :
      <Sui.Image size="mini" src={icoUrl} style={{padding:2}} />;

    const imgUrl = BACKEND_URL + '?'
      + serializeURIParams({r: {m: 'img', u: icoKey}});
    const img = icoKey === nullLink ? null :
      <Sui.Image floated="left" size="tiny" src={imgUrl} onClick={this.clickImg}/>;

    const desc = data[descField]
      //.replace(/\\r\\n/g, '<br />')
      //.replace(/\\r/g, '<br />')
      //.replace(/\\n/g, '<br />')
      //.replace(/\\t/g, '&nbsp;')
      //.replace(//g, '&bull;') // https://unicode-table.com/en/F020/
      .replace(//g, '•')
      .trim()
    ;

    const meta =
      <Sui.Accordion>{propsActiveTitleIndex === 0 || propsActiveTitleIndex === undefined ? null :
        <Sui.Accordion.Title active={propsActiveTitleIndex === 0 || propsActiveTitleIndex === undefined}
          index={0} idx={0} onClick={clickPropsTitle}>
          <Sui.Icon name="dropdown" color="blue" />
            Основные
        </Sui.Accordion.Title>}
        <Sui.Accordion.Content active={propsActiveTitleIndex === 0 || propsActiveTitleIndex === undefined}>
          <span>{'Код: ' + data.Код}</span>
          {data.Артикул ? <span>{'Артикул: ' + data.Артикул}</span> : null}
          {data.Производитель ? <span>{'Производитель: ' + data.Производитель}</span> : null}
          {data[remainderField] ? <span>{'Остаток: ' + data[remainderField]}</span> : null}
          {data[priceField] ? <span>{'Цена: ' + data[priceField]}</span> : null}
        </Sui.Accordion.Content>{propsActiveTitleIndex === 1 ? null :
        <Sui.Accordion.Title active={propsActiveTitleIndex === 1}
          index={1} idx={1} onClick={clickPropsTitle}>
          <Sui.Icon name='dropdown' color="blue" />
            Свойства
        </Sui.Accordion.Title>}
        <Sui.Accordion.Content active={propsActiveTitleIndex === 1}>
          <Props path={[...props.path, 'properties']} />
        </Sui.Accordion.Content>{propsActiveTitleIndex === 2 && desc.length !== 0 ? null :
        <Sui.Accordion.Title active={propsActiveTitleIndex === 2}
          index={2} idx={2} onClick={clickPropsTitle}>
          <Sui.Icon name='dropdown' color="blue" />
            Описание
        </Sui.Accordion.Title>}{desc.length !== 0 ?
        <Sui.Accordion.Content active={propsActiveTitleIndex === 2}>
          <Sui.Container fluid textAlign='justified'>{desc}</Sui.Container>
        </Sui.Accordion.Content> : null}
      </Sui.Accordion>;
        
    return (
      <Sui.Card fluid style={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}>
        <Sui.Card.Content style={{padding: '.25em'}}>
          {expanded ? img : null}
          <Sui.Card.Header style={{fontSize: '87%'}}>
          {expanded ?  null :
            <Sui.Button compact size="tiny" circular primary
              onClick={toggleCard}
              icon="expand" />}
            {expanded ? data[titleField].trim().length === 0 ? data[headerField] : data[titleField] : getHeaderField(data)}{expanded ? null :
            <Sui.Label size="small" color="teal" image>
              {ico}
              {data[remainderField]}{data[reserveField] ? ' (' + data[reserveField] + ')' : ''}
              <Sui.Label.Detail>{data[priceField]}₽</Sui.Label.Detail>
            </Sui.Label>}
          </Sui.Card.Header>{expanded ?
          <Sui.Card.Meta>
            {meta}
          </Sui.Card.Meta> : null}
        </Sui.Card.Content>{expanded ?
        <Sui.Card.Content extra>
          <Sui.Button compact basic size="small" color="primary" content="В корзину" icon="shop" labelPosition="left" />
          <Sui.Button floated="right" compact size="tiny" circular primary onClick={toggleCard} icon="compress" />
        </Sui.Card.Content> : null}{expanded ?
        <Sui.Modal dimmer="blurring" open={this.state.isImgLargeViewOpen} onClose={this.close}>
          <Sui.Modal.Content image>
            <Sui.Image wrapped fluid src={imgUrl} />
          </Sui.Modal.Content>
          <Sui.Modal.Actions>
            <Sui.Button positive icon='checkmark' labelPosition='right' content="Закрыть" onClick={this.closeImgLargeView} />
          </Sui.Modal.Actions>
        </Sui.Modal> : null}
      </Sui.Card>);
  }
}
//------------------------------------------------------------------------------
export default connect(Card);
//------------------------------------------------------------------------------
