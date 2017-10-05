import Immutable from 'seamless-immutable';
import {
    // combineReducers,
    createStore
    //, applyMiddleware
} from 'redux';
//import thunk from 'redux-thunk';

//let initialState = window.__INITIAL_STATE__;
// Transform into Immutable.js collections,
// but leave top level keys untouched for Redux
//Object.keys(initialState).forEach(key => {
//    initialState[key] = fromJS(initialState[key]);
//});

function reducer(state, action) {
    if( action.type.constructor === Function )
        return action.type(state);

    return state;
    // switch( action.type ) {
    //     case 'GET_APP_STATE':
    //         return new Immutable.Map(action.data); // fetched saved on server state
    //     case 'toggleListViewElementsVisibility':
    //         return state.updateIn([ action.id, 'view', 'Элементы' ], v => !v);
    //     default:
    //         return state;
    // }
    // throw new Error('Unsupported action type');
}

const store = createStore(reducer
    , new Immutable({})
    //, applyMiddleware(thunk.withExtraArgument({}))
);//combineReducers(reducers));
export default store;
