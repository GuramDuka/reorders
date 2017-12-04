//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp from '../store';
import { transform, sfetch } from '../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Categories extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path } = ownProps;
    return {
      handleCategoryClick : (e, data) => {
        const category = data.value;
        disp(state => {
          const sr = 'searcherResults';
          let stack, curView;
      
          for(;;) {
            stack = state.getIn('body', 'viewStack');
            curView = stack[stack.length - 1].view;
            if( curView === 'products' )
              break;
            state = state.editIn('body', 'viewStack', v => v.pop());
          }
          
          state = state.editIn('body', 'viewStack', v => v.push({view: sr}))
            .setIn('body', 'view', sr)
            .setIn('searcher', 'category', category)
            .deleteIn('searcher', 'parent')
            .deleteIn('searcher', 'scroll')
            .setIn(path, 'category', category);
      
          return state;
        });
      }
    };
  }
  
  static connectOptions = { withRef: true };
  
  load = () => {
    const obj = this;
    const r = {
      m : 'category',
      f : 'list',
      r : {
        target: 'Номенклатура',
      }
    };
  
    sfetch({r: r}, json => {
      obj.setState({options: transform(json).rows.map(
        (r, i) => ({ key: i, text: r.Наименование, value: r.Ссылка }))});
    });
  };

  componentDidMount() {
    this.load();
  }
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Categories');

    const { props, state } = this;

    return <Sui.Dropdown item style={{border:0, maxWidth:110}} compact
      onChange={props.handleCategoryClick}
      options={state && state.options ? state.options : []}
      placeholder="Категория"
      value={props.category} />;
  }
}
//------------------------------------------------------------------------------
export default connect(Categories);
//------------------------------------------------------------------------------
