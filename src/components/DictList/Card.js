//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { nullLink } from '../../store';
import BACKEND_URL from '../../backend';
import { serializeURIParams } from '../Base';
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
      toggleCard : e => disp(state => state.toggleIn(path, 'expanded'))
    };      
  }

  render() {
    const { props } = this;
    const { expanded, toggleCard, data, getHeaderField, headerField,
      imgField, titleField, remainderField, reserveField, priceField, descField } = props;

    if( process.env.NODE_ENV === 'development' )
      console.log('render Card: ' + props.path[props.path.length - 1]);
    
    const icoKey = data[imgField];
    
    const icoUrl = BACKEND_URL + '?'
      + serializeURIParams({r: {m: 'img', f: 'ico', u: icoKey, w: 28, h: 28}});
    const ico = icoKey === nullLink ? null :
      <Sui.Image size="mini" src={icoUrl} style={{padding:2}} />;

    const imgUrl = BACKEND_URL + '?'
      + serializeURIParams({r: {m: 'img', u: icoKey}});
    const img = icoKey === nullLink ? null :
      <Sui.Image floated="left" size="tiny" src={imgUrl} />;

    const desc = data[descField]
      //.replace(/\\r\\n/g, '<br />')
      //.replace(/\\r/g, '<br />')
      //.replace(/\\n/g, '<br />')
      //.replace(/\\t/g, '&nbsp;')
      //.replace(//g, '&bull;') // https://unicode-table.com/en/F020/
      .replace(//g, '•')
    ;

    return (
      <Sui.Card fluid style={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}>
        <Sui.Card.Content style={{padding: '.25em'}}>
          {expanded ? img : null}
          <Sui.Card.Header style={{fontSize: '87%'}}>
            {expanded ? data[titleField].trim().length === 0 ? data[headerField] : data[titleField] : getHeaderField(data)}{expanded ? null :
            <Sui.Label size="small" color="teal" image>
              {ico}
              {data[remainderField]}{data[reserveField] ? ' (' + data[reserveField] + ')' : ''}
              <Sui.Label.Detail>{data[priceField]}₽</Sui.Label.Detail>
            </Sui.Label>}
            <Sui.Button floated="right" compact size="mini" circular primary
              onClick={toggleCard}
              icon={expanded ? 'compress' : 'expand'}
            />
          </Sui.Card.Header>
          <Sui.Card.Meta>
            {'Код: ' + data.Код}
          </Sui.Card.Meta>{expanded && data.Артикул ?
          <Sui.Card.Meta>
            {'Артикул: ' + data.Артикул}
          </Sui.Card.Meta> : null}{expanded && data.Производитель ?
          <Sui.Card.Meta>
            {'Производитель: ' + data.Производитель}
          </Sui.Card.Meta> : null}{expanded && data[remainderField] ?
          <Sui.Card.Meta>
            {'Остаток: ' + data[remainderField]}
          </Sui.Card.Meta> : null}{expanded && data[priceField] ?
          <Sui.Card.Meta>
            {'Цена: ' + data[priceField] + '₽'}
          </Sui.Card.Meta> : null}{expanded ?
            <Sui.Container fluid textAlign='justified'>
              {desc}
            </Sui.Container>
           : null}
        </Sui.Card.Content>{expanded ?
        <Sui.Card.Content extra>
        </Sui.Card.Content> : null}
      </Sui.Card>);
  }
}
//------------------------------------------------------------------------------
export default connect(Card);
//------------------------------------------------------------------------------
