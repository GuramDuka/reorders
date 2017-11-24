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

  static connectOptions = { withRef: true };
  
  switchGroup = e => {
    const opt = {
      name: e.currentTarget.attributes.name.value,
      link: e.currentTarget.attributes.link.value
    };
    const obj = this;
    const { listPath } = obj.props;
    disp(state => state = state.setIn([...listPath, 'view'], 'parent', opt.link, 2)
      .updateIn(listPath, 'breadcrumb', a => {
        const i = a.findIndex(v => v.link === opt.link);
        if( i < 0 )
          a.push(opt);
        else
          a = a.slice(0, i + 1);
        return a;
      }, 0)
    );
  };

  clickBackward = e => {
    const obj = this;
    const { listPath } = obj.props;
    disp(state => {
      const link = state.getIn(listPath, 'breadcrumb').slice(-2).shift().link;
      return state.setIn([...listPath, 'view'], 'parent', link, 2)
        .updateIn(listPath, 'breadcrumb', v => { v.pop(); return v; }, 0);
    });
  };
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Groups');

    const { props } = this;
    const { parent, expanded, toggleGroups, data } = props;
    const list = expanded ? data.map(grp =>
      <Sui.Button style={{marginBottom:1}} compact
        size="tiny" basic color="blue"
        key={grp.Ссылка}
        link={grp.Ссылка}
        name={grp.Наименование}
        content={grp.Наименование}
        onClick={this.switchGroup} />) : null;

    const switcher = data.length === 0 ? null : expanded ? 
      <Sui.Button compact primary size="tiny" onClick={toggleGroups} icon="compress" />
      :
      <Sui.Button compact primary size="tiny"
        content={'Группы ' + data.length}
        onClick={toggleGroups}
        icon="expand" />;
    
    const breadcrumb = <Sui.Breadcrumb style={{padding: 0, margin: 0}}>{parent === nullLink ? null :
        <Sui.Button compact size="tiny" primary icon="backward" onClick={this.clickBackward} style={{marginBottom:1}} />}
        {props.breadcrumb.map((v, i, a) => [
        <Sui.Breadcrumb.Section key={i*a.length+1} style={{padding: 0, margin: 0}}>
          <Sui.Button compact basic size="tiny" primary={i + 1 !== a.length} icon
            onClick={i + 1 !== a.length ? this.switchGroup : null}
            link={v.link}
            name={v.name}>
            {i === 0 ? <Sui.Icon name="home" /> : v.name}
          </Sui.Button>
        </Sui.Breadcrumb.Section>, i + 1 === a.length ? null :
        <Sui.Breadcrumb.Divider key={i*a.length+2} icon="right chevron" />])}
        {switcher}
        {list}
      </Sui.Breadcrumb>;

    return ( 
      <Sui.Segment style={{padding: 0, margin: 0}}>
        {breadcrumb}
      </Sui.Segment>);
  }
}
//------------------------------------------------------------------------------
export default connect(Groups);
//------------------------------------------------------------------------------
