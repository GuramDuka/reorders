//------------------------------------------------------------------------------
import React from 'react';
import PropTypes from 'prop-types';
import * as Mui from 'material-ui';
import {
  Autorenew,
  Refresh,
  ViewList
} from 'material-ui-icons';
import disp from '../../store';
//------------------------------------------------------------------------------
const styles = theme => ({
  colorPrimary: {
    backgroundColor : theme.palette.primary[800],
    color           : theme.palette.getContrastText(theme.palette.primary[800])
  }
});
//------------------------------------------------------------------------------
class Toolbar extends Component {
  static storedProps = {
    isLoading   : false
  };
  
  // static actionToggleIsLoading(path) {
  //   newAction(state => state.getIn([ ...path, 'isLoading' ])
  //     ? state.updateIn(path, v => v.without('isLoading'))
  //     : state.setIn([ ...path, 'isLoading' ], true));
  // };

  static actionSetIsLoading(path, isLoading) {
    return state => isLoading
      ? state.setIn([ ...path, 'isLoading' ], true)
      : state.updateIn(path, v => v.without('isLoading'));
  };

  static switchIsLoading(path, isLoading) {
    disp(Toolbar.actionSetIsLoading(path, isLoading));
  }

  static onClickReload(path, tablePath, options) {
    Toolbar.switchIsLoading(path, true);
    // disp(Table.actionReload(tablePath, { ...options,
    //   onDone : () => Toolbar.switchIsLoading(path, false)
    // }));
  }

  static onClickToggleElementsVisibility(path, tablePath) {
    Toolbar.switchIsLoading(path, true);
    // disp(Table.actionReload(tablePath, {
    //   transformView : (view) => view.elements = !view.elements,
    //   onDone        : () => Toolbar.switchIsLoading(path, false)
    // }));
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path, tablePath } = ownProps;
    return {
      onClickReload  : event => {
        Toolbar.onClickReload(path, tablePath);
      },
      onClickRefresh : event => {
        Toolbar.onClickReload(path, tablePath, { refresh : true });
      },
      onClickToggleElementsVisibility  : event => {
        Toolbar.onClickToggleElementsVisibility(path, tablePath);
      }
    };
  }
  
  render() {
    if( process.env.NODE_ENV === 'development' )
      console.log('render Toolbar, isDefaultState: '
        + this.props.isDefaultState + ', isLoading: ' + this.props.isLoading);

    // CircularProgress color may be only one of ["primary","accent"]
    const props = this.props;
    const classes = props.classes;
    const progress = props.isLoading && <Mui.CircularProgress className={classes.colorPrimary} size={20} />;
    return (
      <Mui.Toolbar>
        <Mui.Typography type="title" color="inherit">
            {props.type}
        </Mui.Typography>{progress}{props.isLoading ||
        <Mui.IconButton aria-label="Reload" color="inherit" onClick={props.onClickReload}>
          <Autorenew />
        </Mui.IconButton>}{props.isLoading ||
        <Mui.IconButton aria-label="Refresh" color="inherit" onClick={props.onClickRefresh}>
          <Refresh />
        </Mui.IconButton>}{props.isLoading ? '' : (
        <Mui.IconButton aria-label="Elements" color="inherit" onClick={props.onClickToggleElementsVisibility}>
          <ViewList />
        </Mui.IconButton>)}
      </Mui.Toolbar>);
  }
}
//------------------------------------------------------------------------------
Toolbar.propTypes = {
  classes: PropTypes.object.isRequired
};
//------------------------------------------------------------------------------
export default Base.connect(Mui.withStyles(styles)(Toolbar));
//------------------------------------------------------------------------------
