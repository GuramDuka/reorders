//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class BarsMenu extends Component {
  static mapStateToProps(state, ownProps) {
    const p = 'products';
    const sr = 'searcherResults';
    const view = state.getIn('body', 'view');
    let path;

    if (view === p)
      path = ['products', 'list', 'view'];
    else if (view === sr)
      path = 'searcher';

    return {
      ...state.mapIn(ownProps.path),
      authorized: state.getIn('auth', 'authorized', false),
      view: view,
      order: path ? state.getIn(path, 'order') : undefined,
      type: view === sr ? state.getIn('searcher', 'type') : view
    };
  }

  static connectOptions = { withRef: true };

  state = { isOpen: false };

  toggleIsOpen = e => this.setState({ isOpen: !this.state.isOpen });

  sortIcons = {
    'asc': 'sort ascending',
    'desc': 'sort descending'
  };

  orderByItem = n => {
    const { props } = this;
    const { order, onClickItem } = props;
    const { field, direction } = order;

    return <Sui.Dropdown.Item active={field === n} onClick={onClickItem}>
      {n}{field === n ? <Sui.Icon name={this.sortIcons[direction]} /> : null}
    </Sui.Dropdown.Item>
  };

  render() {
    const { props, state, orderByItem } = this;
    const { view, order, onClickItem } = props;

    return <Sui.Menu vertical compact
      style={{ left: 0, top: 44, position: 'fixed', zIndex: 1000, display: state.isOpen ? 'block' : 'none' }}>{order ?
      <Sui.Dropdown item text="Сортировка">
        <Sui.Dropdown.Menu>
          {orderByItem('Код')}
          {orderByItem('Наименование')}
          {orderByItem('Цена')}
        </Sui.Dropdown.Menu>
      </Sui.Dropdown> : null}{view === 'products' ? null :
      <Sui.Menu.Item content="Каталог" onClick={onClickItem} />}
      <Sui.Menu.Item content="Корзина" onClick={onClickItem} />
      <Sui.Menu.Item content="Заказы" onClick={onClickItem} />{view === 'login' || props.authorized ? null :
      <Sui.Menu.Item content="Вход / Регистрация" onClick={onClickItem} />}{props.authorized ?
      <Sui.Menu.Item content="Выход" onClick={onClickItem} /> : null}
    </Sui.Menu>;
  }
}
//------------------------------------------------------------------------------
export default connect(BarsMenu);
//------------------------------------------------------------------------------
