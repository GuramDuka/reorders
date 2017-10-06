//------------------------------------------------------------------------------
import Immutable from 'seamless-immutable';
import {
    // combineReducers,
    createStore
    //, applyMiddleware
} from 'redux';
//import thunk from 'redux-thunk';
//------------------------------------------------------------------------------
//let initialState = window.__INITIAL_STATE__;
// Transform into Immutable.js collections,
// but leave top level keys untouched for Redux
//Object.keys(initialState).forEach(key => {
//    initialState[key] = fromJS(initialState[key]);
//});
//------------------------------------------------------------------------------
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
//------------------------------------------------------------------------------
const productsColumns = [
    { name  : 'lineNo',       title : '#'       },
    { name  : 'Код'                             },
    { name  : 'Наименование'                    },
    { name  : 'Артикул'                         },
    { name  : 'Производитель'                   },
    { name  : 'ОстатокОбщий', title : 'Остаток' }
];
//------------------------------------------------------------------------------
const defaultState = new Immutable({
    products    : {
        table   : {
            cols    : productsColumns,
            view    :  {
                type      : "Номенклатура",
                parent    : '00000000-0000-0000-0000-000000000000',
                groups    : true,
                elements  : false,
                filter    : 'Таблица.ЭтоГруппа ИЛИ Таблица.ОстатокОбщий <> 0',
                cols      : [ ...productsColumns.slice(1).reduce((a, v) => { a.push(v.name); return a; }, []), ...[
                    'НаименованиеПолное'                            ,
                    'ДополнительноеОписаниеНоменклатуры'            ,
                    'ДополнительноеОписаниеНоменклатурыВФорматеHTML',
                ]]
            }
        }
    }
});
//------------------------------------------------------------------------------
const store = createStore(reducer
    , defaultState
    //, applyMiddleware(thunk.withExtraArgument({}))
);//combineReducers(reducers));
//------------------------------------------------------------------------------
export default store;
//------------------------------------------------------------------------------
