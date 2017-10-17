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
    const { expanded, toggleCard, data, headerField, imgField, titleField } = props;

    if( process.env.NODE_ENV === 'development' )
      console.log('render Card: ' + props.path[props.path.length - 1]);
    
    const icoKey = data[imgField];
    const icoUrl = BACKEND_URL + '?'
      + serializeURIParams({r: {m: 'img', f: 'ico', u: icoKey, w: 32, h: 32}});
    const imgUrl = BACKEND_URL + '?'
      + serializeURIParams({r: {m: 'img', u: icoKey}});
    const img = icoKey === nullLink ? null :
      <Sui.Image floated="left" size="tiny" src={imgUrl} />;

    return (
      <Sui.Card fluid style={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}>
        <Sui.Card.Content style={{padding: '.25em'}}>
          {img}
          <Sui.Card.Header style={{fontSize: '87%'}}>
            {data[headerField]}{expanded ? null :
            <Sui.Label size="small" color="teal" image>
              <Sui.Image size="mini" src={icoUrl} style={{padding:2}} />
              {data.ОстатокОбщий}
              <Sui.Label.Detail>24.99₽</Sui.Label.Detail>
            </Sui.Label>}
            <Sui.Button floated="right" compact size="mini" circular primary
              onClick={toggleCard}
              icon={expanded ? 'compress' : 'expand'}
            />
          </Sui.Card.Header>
          {expanded && data.ОстатокОбщий ?
          <Sui.Card.Meta>
            {'Остаток: ' + data.ОстатокОбщий}
            {'Цена: 24.99₽'}
          </Sui.Card.Meta> : null}{expanded && data[titleField] !== data[headerField] ?
          <Sui.Card.Description>
            {data[titleField]}
          </Sui.Card.Description> : null}
        </Sui.Card.Content>{expanded ?
        <Sui.Card.Content extra>
        </Sui.Card.Content> : null}
      </Sui.Card>);
  }
}
//------------------------------------------------------------------------------
export default connect(Card);
//------------------------------------------------------------------------------
