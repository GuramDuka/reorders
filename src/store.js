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
const productsVisibleFields = [
    //{ name  : 'lineNo',       title : '#'       },
    { name  : 'Код'                             },
    { name  : 'Наименование'                    },
    { name  : 'Артикул'                         },
    { name  : 'Производитель'                   },
    { name  : 'ОстатокОбщий', title : 'Остаток' }
];
//------------------------------------------------------------------------------
const defaultState = new Immutable({
    header      : {
        collapsed           : true,
        productsTreePath    : [{ key : '00000000-0000-0000-0000-000000000000', name : 'Каталог' }],
        customersTreePath   : [{ key : '00000000-0000-0000-0000-000000000000', name : 'Контрагенты' }]
    },
    products    : {
        list   : {
            fields       : productsVisibleFields,
            keyField     : 'Ссылка',
            headerField  : 'Наименование',
            titleField   : 'НаименованиеПолное',
            imgField     : 'ОсновноеИзображение',
            isGroupField : 'ЭтоГруппа',
            rows         : [],
            grps         : [],
            view      :  {
                type      : "Номенклатура",
                parent    : '00000000-0000-0000-0000-000000000000',
                groups    : true,
                elements  : true,
                filter    : 'Таблица.ЭтоГруппа ИЛИ Таблица.ОстатокОбщий <> 0',
                fields    : [ ...productsVisibleFields.slice(0).reduce((a, v) => { a.push(v.name); return a; }, []), ...[
                    'ОсновноеИзображение'                           ,
                    'НаименованиеПолное'                            ,
                    'ДополнительноеОписаниеНоменклатуры'            ,
                    'ДополнительноеОписаниеНоменклатурыВФорматеHTML'
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
