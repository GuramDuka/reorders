import React from 'react';
//import PropTypes from 'prop-types';
import Base from '../Base';
import Table from './Table';
import Toolbar from './Toolbar';

class View extends Base {
  static storedProps = {
  };
  
  render() {
    console.log('render View, isDefaultState: ' + this.props.isDefaultState);
    const { props } = this;
    const toolbarPath = [ ...props.path, 'toolbar' ];
    const tablePath   = [ ...props.path, 'table'   ];
    return (
      <div>
        <Toolbar path={toolbarPath} tablePath={tablePath} />
        <Table   path={tablePath} view={props.view} cols={props.cols} />
      </div>);
  }
}

// DictListView.contextTypes = {
//   store: PropTypes.object.isRequired
// };

export default Base.connect(View);
