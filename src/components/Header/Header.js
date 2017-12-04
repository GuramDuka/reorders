//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp from '../../store';
import Searcher from '../Searcher';
import Categories from '../Categories';
import BarsMenu from './BarsMenu';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Header extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static connectOptions = { withRef: true };
  
  switchView = (e, data) => {
    const obj = this;
    disp(state => {
      const p = 'products';
      const sr = 'searcherResults';
      const content = data.content !== undefined ? data.content : data.children[0];
      
      switch( content ) {
        case 'Каталог' :
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

          obj.barsMenu.toggleIsOpen();
          break;
        case 'Код' :
        case 'Наименование' :
        case 'Цена' :
          const view = state.getIn('body', 'view');
          let path;

          if( view === p )
            path = ['products', 'list', 'view', 'order'];
          else if( view === sr )
            path = ['searcher', 'order'];

          const field = state.getIn(path, 'field');

          if( field === content ) {
            const asc = 'asc';
            const desc = 'desc';
            state = state.updateIn(path, 'direction', v => v === asc ? desc : asc, 3);
          }

          state = state.setIn(path, 'field', content, 3);

          obj.barsMenu.toggleIsOpen();
          break;
        case 'Вход / Регистрация' :
          if( state.getIn('body', 'view') !== 'login' )
            state = state.setIn('body', 'view', 'login')
              .editIn('body', 'viewStack', v => v.push({view: 'login'}));
          obj.barsMenu.toggleIsOpen();
          break;
        case 'Выход' :
          state = state.editIn([], 'auth', v => {
            delete v.pass;
            delete v.hash;
            delete v.token;
            delete v.authorized;
          });
          obj.barsMenu.toggleIsOpen();
          break;
        default:;
      }

      return state;
    });
  };

  eRef = e => e && e.getWrappedInstance ? e.getWrappedInstance() : e;

  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Header');

    const { path } = this.props;
    
    return <Sui.Menu attached="top" style={{left: 0, top: 0, height: 44, position: 'fixed', zIndex: 1000 }}>
      <Sui.Menu.Item active={false} icon="bars" onClick={e => this.barsMenu.toggleIsOpen()} />
      <BarsMenu path={[...path, 'menu']} ref={e => this.barsMenu = this.eRef(e)} onClickItem={this.switchView} />
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
