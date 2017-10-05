import React, { Component } from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux-connect';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Card, {
  CardMedia
} from 'material-ui/Card';
import MenuIcon from 'material-ui-icons/Menu';
//import RefreshIndicator from 'material-ui/RefreshIndicator';
import brand_logo from '../assets/logo.jpg';

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
    width: '100%',
  },
  flex: {
    flex: 1,
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
    maxWidth: 345,
  },
  media: {
    width: 'auto',
    height: 48,
  },
});

class Header extends Component {
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
        <AppBar title="Шинторг" position="fixed" style={{ height: 64 }}>
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Card className={classes.card}>
              <CardMedia
                className={classes.media}
                image={brand_logo}
              />
            </Card>
            <Typography type="title" color="inherit" className={classes.flex}>
                Шинторг
            </Typography>
            <Button color="contrast">Login</Button>
          </Toolbar>
        </AppBar>
      </div>
    );    
  }
}

// Header.contextTypes = {
//   store: PropTypes.object.isRequired
// };

Header.propTypes = {
  classes: PropTypes.object.isRequired
};

export default connect(withStyles(styles)(Header));
