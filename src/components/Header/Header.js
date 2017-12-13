//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import { sfetch } from '../../backend';
import disp from '../../store';
import Searcher from '../Searcher';
import Categories from '../Categories';
import BarsMenu from './BarsMenu';
import styles from './Header.css';
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
      
      switch( data.view ) {
        case 'catalog' :
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
        case 'code' :
        case 'name' :
        case 'price' :
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
        case 'login' :
          if( state.getIn('body', 'view') !== 'login' )
            state = state.setIn('body', 'view', 'login')
              .editIn('body', 'viewStack', v => v.push({view: 'login'}));
          obj.barsMenu.toggleIsOpen();
          break;
        case 'logout' :
          sfetch({r: { m: 'auth', f: 'logout', r: {}}}, json => disp(state => state.editIn([], 'auth', v => {
            delete v.pass;
            delete v.employee;
            delete v.hash;
            delete v.token;
            delete v.timestamp;
            delete v.authorized;
          }).setIn('body', 'view', 'reload')));

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
    
    return <Sui.Menu attached="top" className={styles.header}>
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
