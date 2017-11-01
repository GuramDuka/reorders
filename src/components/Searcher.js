//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp from '../store';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Searcher extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  state = { isLoading: false, value: '', results: [] };
  
  /*handleResultSelect = (e, { result }) => this.setState({ value: result.title })
  
  handleSearchChange = (e, { value }) => {
      this.setState({ isLoading: true, value })
  
      setTimeout(() => {
        //if (this.state.value.length < 1) return this.resetComponent()
  
        this.setState({
          isLoading: false
        });
      }, 500)
    }
    
  render() {
    const { props, state } = this;
    return <Sui.Search
      minCharacters={2}
      loading={state.isLoading}
      onResultSelect={this.handleResultSelect}
      onSearchChange={this.handleSearchChange}
      value={state.value} />;
  }*/

  handleSearchChange = (e, data) => {
    const value = data.value.trim();
    const obj = this;
    obj.setState({ isLoading: true });
    setTimeout(e => {
      disp(state => {
        return state;
      });
    }, 500);
  };
  
  //componentWillMount() {
  //}
  
  render() {
    const { props, state } = this;
    return (
      <Sui.Input
        style={{marginRight:'1em'}}
        transparent
        loading={state.isLoading}
        icon="search"
        placeholder="Поиск..."
        onChange={this.handleSearchChange} />
    );
  }
}
//------------------------------------------------------------------------------
export default connect(Searcher);
//------------------------------------------------------------------------------
