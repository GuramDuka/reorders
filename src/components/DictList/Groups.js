//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { nullLink } from '../../store';
import List from './List';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Groups extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path, listPath } = ownProps;
    return {
      toggleGroups : e => disp(state => state.toggleIn(path, 'expanded')),
      switchGroup  : (e, obj) => {
        const link = e.currentTarget.attributes.link.value;
        disp(state => {
          //state = state.setIn(path, 'isLoading', true);
          obj.setState({ isLoading: true });
          return List.actionReload(listPath, {
            transformView : view => view.parent = link,
            onDone        : state => {
              //state.deleteIn(path, 'isLoading')
              obj.setState({ isLoading: false });
              return state.updateIn(listPath, 'breadcrumb', v => { v.push(link); return v; }, 0);
            }
          })(state);
        });
      },
      clickBackward  : (e, obj) => {
        disp(state => {
          obj.setState({ isLoading: true });
          //state = state.setIn(path, 'isLoading', true);
          const link = state.getIn(listPath, 'breadcrumb').slice(-2).shift();
          return List.actionReload(listPath, {
            transformView : view => view.parent = link,
            onDone        : state => {
              obj.setState({ isLoading: false });
              //state.deleteIn(path, 'isLoading')
              return state.updateIn(listPath, 'breadcrumb', v => { v.pop(); return v; }, 0)
            }
          })(state);
        });
      }
    };
  }

  state = { isLoading: false };
  
  switchGroup = e => this.props.switchGroup(e, this);
  clickBackward = e => this.props.clickBackward(e, this);
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Groups');

    const { props } = this;
    const { parent, expanded, toggleGroups,
      keyField, getHeaderField, data } = props;
    const list = expanded ? data.map(grp =>
      <Sui.Button style={{marginBottom:1}}
        size="tiny" basic
        key={grp[keyField]}
        link={grp[keyField]}
        onClick={this.switchGroup}>
        {getHeaderField(grp)}
      </Sui.Button>) : null;

    const backward = parent === nullLink ? null :
      <Sui.Button primary icon="backward" onClick={this.clickBackward} />

    const switcher = data.length === 0 ? null : expanded ? 
      <Sui.Button primary onClick={toggleGroups} icon="compress" />
      :
      <Sui.Button primary
        content="Группы"
        label={{content: data.length}}
        onClick={toggleGroups}
        icon="expand" />;
    
    return ( 
      <Sui.Segment loading={this.state.isLoading} style={{padding: 0, margin: 0}}>
        {backward}
        {switcher}
        {list}
      </Sui.Segment>);
  }
}
//------------------------------------------------------------------------------
export default connect(Groups);
//------------------------------------------------------------------------------
