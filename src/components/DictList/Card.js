//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import store from '../../store';
import BACKEND_URL from '../../backend';
import { serializeURIParams, toggleBoolean, newAction } from '../Base';
//------------------------------------------------------------------------------
class Card extends Component {
  static mapStateToProps(state, ownProps) {
    return state.getIn(ownProps.path, {});
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path } = ownProps;
    return {
      toggleCard : e => store.dispatch(newAction(state => toggleBoolean(state, path, 'expanded')))
    };      
  }

  render() {
    const { props } = this;
    const { expanded, toggleCard, data, headerField, imgField, titleField } = props;
    console.log('render Card: ' + props.path[props.path.length - 1]);
    
    const icoKey = data[imgField];
    const icoUrl = BACKEND_URL + '?'
      + serializeURIParams({r: {m: 'img', f: 'ico', u: icoKey, w: 32, h: 32}});
    // const imgUrl = id => BACKEND_URL + '?'
    //   + serializeURIParams({r: {m: 'img', u: id}});
    const ico = icoKey === '00000000-0000-0000-0000-000000000000' ? null :
      <Sui.Image floated='right' size='mini' src={icoUrl} />;

    return (
      <Sui.Card fluid style={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}>
        <Sui.Card.Content style={{padding: '.25em'}}>
          {ico}
          <Sui.Card.Header style={{fontSize: '87%'}}>
            <Sui.Button compact size="mini" circular
              onClick={toggleCard}
              icon={expanded ? 'compress' : 'expand'}
            />
            {data[headerField]}
            {data.ОстатокОбщий ? <Sui.Label size="mini" color='teal' circular>{data.ОстатокОбщий}</Sui.Label> : null}
            <Sui.Label color="olive" size="mini" tag>24.99₽</Sui.Label>
          </Sui.Card.Header>{expanded && data.ОстатокОбщий ?
          <Sui.Card.Meta>
            {'Остаток: ' + data.ОстатокОбщий}
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
