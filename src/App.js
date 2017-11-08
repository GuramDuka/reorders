//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
//import semanticLogo from './assets/semantic-logo.png'
import './css/App.css';
import Header from './components/Header';
import Body from './components/Body';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class App extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

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

    return [
      <Header key={0} path={['header']} />,

      <Sui.Segment key={1} vertical style={{marginTop: '2.2em'}}>
        <Body path={['body']} />
      </Sui.Segment>/*,
        
      <Sui.Segment key={2} vertical>
        <Sui.Container textAlign="center">
          <Sui.Divider inverted section />
          <Sui.Image centered size="mini" src={semanticLogo} style={{marginBottom: '1em'}} />
          <Sui.List divided link>
            <Sui.List.Item as='a' href='#'>Contact Us</Sui.List.Item>
            <Sui.List.Item as='a' href='#'>Terms and Conditions</Sui.List.Item>
            <Sui.List.Item as='a' href='#'>Privacy Policy</Sui.List.Item>
          </Sui.List>
        </Sui.Container>
      </Sui.Segment>,

      <Sui.Segment key={3} attached='bottom'>
        Bottom segment
      </Sui.Segment>*/];
  }
}
//------------------------------------------------------------------------------
export default connect(App);
//------------------------------------------------------------------------------
