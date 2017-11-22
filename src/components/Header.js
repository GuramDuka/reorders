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
class BarsMenu extends Component {
  state = { isOpen: false };

  toggle = e => this.setState({isOpen: !this.state.isOpen});

  render() {
    const { state } = this;
    return <Sui.Menu vertical compact
      style={{left: 0, top: 44, position: 'fixed', zIndex: 1000, display: state.isOpen ? 'block' : 'none'}}>
      <Sui.Dropdown item text="Сортировка">
        <Sui.Dropdown.Menu>
          <Sui.Dropdown.Item onClick={this.props.onClickItem}>
            Код<Sui.Icon name="sort descending" />
          </Sui.Dropdown.Item>
          <Sui.Dropdown.Item onClick={this.props.onClickItem}>
            Наименование<Sui.Icon name="sort ascending" />
          </Sui.Dropdown.Item>
          <Sui.Dropdown.Item onClick={this.props.onClickItem}>
            Цена<Sui.Icon name="sort descending" />
          </Sui.Dropdown.Item>
        </Sui.Dropdown.Menu>
      </Sui.Dropdown>
  
      <Sui.Menu.Item content="Каталог" onClick={this.props.onClickItem} />
      <Sui.Menu.Item content="Корзина" />
      <Sui.Menu.Item content="Заказы" />
    </Sui.Menu>;
  }
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Header extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  switchView = (e, data) => {
    const obj = this;
    disp(state => {
      const p = 'products';
  
      if( data.content === 'Каталог' ) {
        for(;;) {
          const stack = state.getIn('body', 'viewStack');
          const view = stack[stack.length - 1].view;
          if( view === p || stack.length <= 1 || stack.findIndex(v => v.view === p) < 0 )
            break;
          state = state.editIn('body', 'viewStack', v => v.pop());
        }
    
        state = state.setIn('body', 'view', p)
          .deleteIn(['header', 'categories'], 'category')
          .deleteIn('searcher', 'category');
          
        obj.barsMenu.toggle();

        return state;
      }

    });
  };

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Header');

    const { path } = this.props;
    
    return <Sui.Menu attached="top" style={{left: 0, top: 0, height: 44, position: 'fixed', zIndex: 1000 }}>
      <Sui.Menu.Item active={false} icon="bars" onClick={e => this.barsMenu.toggle()} />
      <BarsMenu ref={e => this.barsMenu = e} onClickItem={this.switchView} />
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
