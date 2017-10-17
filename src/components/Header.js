//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp from '../store';
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
        const level = +e.target.attributes.level.value;
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
    return (
      <Sui.Menu fixed='top'>
      <Sui.Dropdown item icon='wrench' simple>
        <Sui.Dropdown.Menu>
          <Sui.Dropdown.Item>
            <Sui.Icon name='dropdown' />
            <span className='text'>New</span>
            <Sui.Dropdown.Menu>
              <Sui.Dropdown.Item>Document</Sui.Dropdown.Item>
              <Sui.Dropdown.Item>Image</Sui.Dropdown.Item>
            </Sui.Dropdown.Menu>
          </Sui.Dropdown.Item>
          <Sui.Dropdown.Item>Open</Sui.Dropdown.Item>
          <Sui.Dropdown.Item>Save...</Sui.Dropdown.Item>
          <Sui.Dropdown.Item>Edit Permissions</Sui.Dropdown.Item>
          <Sui.Dropdown.Divider />
          <Sui.Dropdown.Header>Export</Sui.Dropdown.Header>
          <Sui.Dropdown.Item>Share</Sui.Dropdown.Item>
        </Sui.Dropdown.Menu>
      </Sui.Dropdown>

      <Sui.Dropdown item text='Каталог'>
        <Sui.Dropdown.Menu> 
          <Sui.Dropdown.Item>Шины</Sui.Dropdown.Item>
          <Sui.Dropdown.Item>Диски</Sui.Dropdown.Item>
          <Sui.Dropdown.Item>АКБ</Sui.Dropdown.Item>
          <Sui.Dropdown.Divider />
          <Sui.Dropdown.Item>Масла</Sui.Dropdown.Item>
          <Sui.Dropdown.Item>Масла2</Sui.Dropdown.Item>
        </Sui.Dropdown.Menu>
      </Sui.Dropdown>

      <Sui.Menu.Menu position='right'>
        <div className='ui right aligned category search item'>
          <div className='ui transparent icon input'>
            <input className='prompt' type='text' placeholder='Search...' />
            <i className='search link icon' />
          </div>
          <div className='results'></div>
        </div>
      </Sui.Menu.Menu>
    </Sui.Menu>
    
      /*<Bui.Navbar id={[...props.path, 'navbar'].join('/')} className="fixed-top p-1 bg-white"
        color="faded" light
        style={{justifyContent: 'start'}}>
        <Bui.NavbarToggler onClick={props.toggleNavbar} />
        <Bui.NavbarBrand href="#" className="ml-1">Шинторг</Bui.NavbarBrand>
        <Bui.Input type="text" placeholder="Поиск..." style={{maxWidth:'45%'}} />
        <Bui.Collapse isOpen={!props.collapsed} navbar>
          <Bui.Nav navbar>
            <Bui.NavItem>
              <Bui.Breadcrumb>{props.productsTreePath.map((v, k, a) =>
                <Bui.BreadcrumbItem
                  active={k + 1 !== a.length}
                  tag={k + 1 === a.length ? 'span' : 'a'}
                  href="#" level={k} onClick={props.changeProductsGroup}
                  key={v.key}>
                  {v.name}
                </Bui.BreadcrumbItem>)}
              </Bui.Breadcrumb>
            </Bui.NavItem>
            <Bui.NavItem>
              <Bui.Breadcrumb>{props.customersTreePath.map((v, k, a) =>
                <Bui.BreadcrumbItem
                  active={k + 1 !== a.length}
                  tag={k + 1 === a.length ? 'span' : 'a'}
                  href="#" level={k} onClick={props.changeCustomersGroup}
                  key={v.key}>
                  {v.name}
                </Bui.BreadcrumbItem>)}
              </Bui.Breadcrumb>
            </Bui.NavItem>
          </Bui.Nav>
        </Bui.Collapse>
        </Bui.Navbar>*/);
  }
}
//------------------------------------------------------------------------------
export default connect(Header);
//------------------------------------------------------------------------------
