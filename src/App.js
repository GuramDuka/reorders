//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import semanticLogo from './assets/semantic-logo.png'
import './css/App.css';
import Header from './components/Header';
import DictListView from './components/DictList/List';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class App extends Component {
  // constructor(props, context) {
  //   super(props, context);
  //   this.state = {};
  //   this.handleResize = this.handleResize.bind(this);
  // }

  // handleResize(e) {
  //   const navbar = document.getElementById('header/navbar');
  //   // const body = document.getElementById('body');
  //   // body.style.width = window.innerWidth + 'px';
  //   // body.style.height = window.innerHeight + 'px';
  //   // const root = document.getElementById('root');
  //   // root.style.width = window.innerWidth + 'px';
  //   // root.style.height = window.innerHeight + 'px';
  //   //this.refs.app.style.paddingTop = navbar.offsetHeight + 1 + 'px';
  //   //this.setState({ headerNavbarHeight: navbar.offsetHeight });
  // }

  // componentDidMount() {
  //   window.addEventListener('resize', this.handleResize);
  //   this.handleResize();
  // }

  // componentWillUnmount() {
  //   window.removeEventListener('resize', this.handleResize);
  // }
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render App');
    return (
      <div>
        <Header path={['header']} />

        <Sui.Segment vertical style={{marginTop: '2.2em'}}>
          <DictListView path={['products', 'list']} />
        </Sui.Segment>
          
        <Sui.Segment vertical>
          <Sui.Container textAlign='center'>
            <Sui.Divider inverted section />
            <Sui.Image centered size='mini' src={semanticLogo} style={{marginBottom: '1em'}} />
            <Sui.List divided link>
              <Sui.List.Item as='a' href='#'>Contact Us</Sui.List.Item>
              <Sui.List.Item as='a' href='#'>Terms and Conditions</Sui.List.Item>
              <Sui.List.Item as='a' href='#'>Privacy Policy</Sui.List.Item>
            </Sui.List>
          </Sui.Container>
        </Sui.Segment>

        <Sui.Segment attached='bottom'>
          Bottom segment
        </Sui.Segment>
      </div>);
  }
}
//------------------------------------------------------------------------------
export default connect(App);
//------------------------------------------------------------------------------
