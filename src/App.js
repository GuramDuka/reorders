//------------------------------------------------------------------------------
import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import connect from 'react-redux-connect';
import './css/App.css';
//import react_logo from './assets/logo.svg';
import Header from './components/Header';
import DictListTable from './components/DictList/Table';
//------------------------------------------------------------------------------
class App extends Component {
  render() {
    console.log('render App');
    return (
      <div>
        <Header        path={['header'  ]}          />
        <DictListTable path={['products', 'table']} />
      </div>);
  }
}
//------------------------------------------------------------------------------
// App.contextTypes = {
//   store: PropTypes.object.isRequired
// };
//------------------------------------------------------------------------------
export default connect(App);
//------------------------------------------------------------------------------
