import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
//import 'bootstrap/dist/css/bootstrap.css';
//import 'font-awesome/css/font-awesome.css';
import 'semantic-ui-css/semantic.css';
import './css/index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { store } from './store';

ReactDOM.render(
    (<Provider store={store}>
        <App path={[]} />
    </Provider>),
    document.getElementById('root'));

registerServiceWorker();
