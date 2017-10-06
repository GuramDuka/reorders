//------------------------------------------------------------------------------
import React from 'react';
import PropTypes from 'prop-types';
import * as Mui from 'material-ui';
import Card, {
  CardMedia
} from 'material-ui/Card';
import MenuIcon from 'material-ui-icons/Menu';
//import RefreshIndicator from 'material-ui/RefreshIndicator';
import brand_logo from '../assets/logo.jpg';
import Base from './Base';
import DictListToolbar from './DictList/Toolbar';
//------------------------------------------------------------------------------
const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
    width: '100%',
  },
  flex: {
    flex: 4,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  container: {
    position: 'relative',
  },
  refresh: {
    display: 'inline-block',
    position: 'relative',
  },
  card: {
    width: 120,
  },
  media: {
    width: 'auto',
    height: 48,
  },
});
//------------------------------------------------------------------------------
class Header extends Base {
  render() {
    console.log('render Header');
    /*              <RefreshIndicator
                size={40}
                left={10}
                top={0}
                status="loading"
                style={styles.refresh}
              />
*/
    const classes = this.props.classes;
    return (
      <div style={{ paddingTop: 64 }}>
        <Mui.AppBar title="Шинторг" position="fixed" style={{ height: 64 }}>
          <Mui.Toolbar>
            <Mui.IconButton color="inherit" aria-label="Menu">
              <MenuIcon />
            </Mui.IconButton>
            <Card className={classes.card}>
              <CardMedia
                className={classes.media}
                image={brand_logo}
              />
            </Card>
            <Mui.Typography type="title" color="inherit">
                Шинторг
            </Mui.Typography>
            <DictListToolbar type="Номенклатура" path={['products', 'toolbar']} tablePath={['products', 'table']} />
            <Mui.Button color="contrast">Login</Mui.Button>
          </Mui.Toolbar>
        </Mui.AppBar>
      </div>
    );    
  }
}
//------------------------------------------------------------------------------
// Header.contextTypes = {
//   store: PropTypes.object.isRequired
// };
//------------------------------------------------------------------------------
Header.propTypes = {
  classes: PropTypes.object.isRequired
};
//------------------------------------------------------------------------------
export default Base.connect(Mui.withStyles(styles)(Header));
//------------------------------------------------------------------------------
