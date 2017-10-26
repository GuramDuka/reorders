//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { nullLink } from '../../store';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Groups extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path } = ownProps;
    return {
      toggleGroups : e => disp(state => state.toggleIn(path, 'expanded'))
    };
  }

  state = { isLoading: false };
  
  switchGroup = e => {
    const link = e.currentTarget.attributes.link.value;
    const obj = this;
    const { listPath, listReloader } = obj.props;
    obj.setState({ isLoading: true });
    disp(state => {
      return listReloader({
        transformView : view => view.parent = link,
        onDone        : state => {
          if( state === undefined )
            obj.setState({ isLoading: false });
          else
            state = state.updateIn(listPath, 'breadcrumb', v => { v.push(link); return v; }, 0);
          return state;
        },
        onError       : state => {
          if( state === undefined )
            obj.setState({ isLoading: false });
          return state;
        }
      })(state);
    });
  };

  clickBackward = e => {
    const obj = this;
    const { listPath, listReloader } = obj.props;
    obj.setState({ isLoading: true });
    disp(state => {
      const link = state.getIn(listPath, 'breadcrumb').slice(-2).shift();
      return listReloader({
        transformView : view => view.parent = link,
        onDone        : state => {
          if( state === undefined )
            obj.setState({ isLoading: false });
          else
            state = state.updateIn(listPath, 'breadcrumb', v => { v.pop(); return v; }, 0);
          return state;
        },
        onError       : state => {
          if( state === undefined )
            obj.setState({ isLoading: false });
          return state;
        }
      })(state);
    });
  };
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Groups');

    const { props } = this;
    const { parent, expanded, toggleGroups, data } = props;
    const list = expanded ? data.map(grp =>
      <Sui.Button style={{marginBottom:1}}
        size="tiny" basic
        key={grp.Ссылка}
        link={grp.Ссылка}
        onClick={this.switchGroup}>
        {grp.Наименование}
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
