//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp from '../store';
import Searcher from './Searcher';
import Categories from './Categories';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Header extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path } = ownProps;
    return {
      toggleNavbar  : e => {
        const collapsedName = 'collapsed';
        const collapsedPath = [ ...path, collapsedName ];
        disp(state => state.getIn(collapsedPath)
          ? state.updateIn(path, v => v.without(collapsedName))
          : state.setIn(collapsedPath, true));
      },
      changeProductsGroup: e => {
        const level = ~~e.target.attributes.level.value;
        disp(state => {
          return state.updateIn([...path, 'productsTreePath']).without((v, k) => k > level);
        })
      },
      changeCustomersGroup: e => {
        disp(state => {
          state.getIn([...path, 'customersTreePath'])
          return state;
        })
      }
    };
  }

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Header');

    const { path } = this.props;
    
    return <Sui.Menu attached="top" style={{left: 0, top: 0, height: 44, position: 'fixed', zIndex: 1000 }}>
      <Sui.Dropdown item icon="bars" simple compact>
        <Sui.Dropdown.Menu>
          <Sui.Dropdown.Item>
            <i className="dropdown icon" />
            <span className="text">Сортировка</span>
            <Sui.Dropdown.Menu>
              <Sui.Dropdown.Item>Код<Sui.Icon name="sort descending" /></Sui.Dropdown.Item>
              <Sui.Dropdown.Item>Наименование<Sui.Icon name="sort ascending" /></Sui.Dropdown.Item>
              <Sui.Dropdown.Item>Цена<Sui.Icon name="sort descending" /></Sui.Dropdown.Item>
            </Sui.Dropdown.Menu>
          </Sui.Dropdown.Item>
          <Sui.Dropdown.Divider />
          <Sui.Dropdown.Item text="Каталог" />
          <Sui.Dropdown.Item text="Корзина" />
          <Sui.Dropdown.Item text="Заказы" />
        </Sui.Dropdown.Menu>
      </Sui.Dropdown>

      <Categories path={[...path, 'categories']} />

      <Sui.Menu.Menu>
        <Searcher path={[...path, 'searcher']} />
      </Sui.Menu.Menu>
    </Sui.Menu>;
  }
}
//------------------------------------------------------------------------------
export default connect(Header);
//------------------------------------------------------------------------------
