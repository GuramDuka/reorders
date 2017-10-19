//------------------------------------------------------------------------------
import { createStore } from 'redux';
//------------------------------------------------------------------------------
export function copy(src) {
    let dst = src;

    if( src === undefined || src === null ) {
    }
    else if( src.constructor === Object ) {
        dst = {};

        for( const n in src )
            dst[n] = copy(src[n]);
    }
    else if( src.constructor === Array ) {
        dst = [];

        for( const v of src )
            dst.push(copy(v));
    }
    else if( src.constructor === String )
        dst = src.valueOf();
    else if( src.constructor === Number )
        dst = src.valueOf();
    else if( src.constructor === Boolean )
        dst = src.valueOf();
    else if( src.constructor === Date )
        dst = new Date(src.valueOf());
    else
        dst = new src.constructor(src.valueOf());
        
    return dst;
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class State {
    constructor(initialState) {
        // if( initialState === undefined || initialState === null
        //     || (initialState.constructor !== Object
        //         && initialState.constructor !== Array) )
        //     throw new Error('initial state must have Object or Array type');

        this.root = initialState;
    }

    dispatch(begin) {
        if( begin ) {
            this.mutated = new Map();
            return this;
        }
        const s = this.mutated.size;
        delete this.mutated;
        return s === 0 ? this : new State(this.root);
    }

	// version() {
	// 	const a = new Uint32Array(3);
	// 	window.crypto.getRandomValues(a);
	// 	return a[0].toString() + a[1].toString() + a[2].toString();
	// }

    getNode(path, key, createNode, mutateParents, manipulator, arg0) {
        if( !Array.isArray(path) )
            throw new Error('path must be array');

        const l = path.length;
        let node = this.root;
        
        for( let i = 0; i < l; i++ ) {
            const k = path[i];
            let next = node[k];

            if( next === undefined && createNode ) {
                node[k] = next = k.constructor === String ? {} : k.constructor === Number ? [] : undefined;
                if( next === undefined )
                    throw new Error('path key must have String or Number type');
            }

            if( next === undefined )
                break;

            if( l - mutateParents <= i && this.mutated.get(next) === undefined ) {
                next = next.constructor === Object ? Object.assign({}, next)
                    : next.constructor === Array ? next.slice(0) : undefined;
                if( next === undefined )
                    throw new Error('value must have Object or Array type');
                node[k] = next;
                this.mutated.set(next, true);
            }
                
            node = next;
        }

        return manipulator.call(this, node, key, arg0);
    }

    static mSetIn(node, key, value) {
        node[key] = value;
    }

    setIn(path, key, value, mutateParents = 1) {
        this.getNode(path, key, true, mutateParents, State.mSetIn, value);
        return this;
    }

    mergeIn(path, iterable, mutateParents = 1) {
        for( const k in iterable )
            this.getNode(path, k, true, mutateParents, State.mSetIn, iterable[k]);
        return this;
    }

    static mUpdateIn(node, key, functor) {
        node[key] = functor(node[key]);
    }
    
    updateIn(path, key, functor, mutateParents = 1) {
        this.getNode(path, key, true, mutateParents, State.mUpdateIn, functor);
        return this;
    }

    static mDeleteIn(node, key) {
        delete node[key];
    }
    
    deleteIn(path, key, mutateParents = 1) {
        this.getNode(path, key, true, mutateParents, State.mDeleteIn);
        return this;
    }

    static mToggleIn(node, key) {
        if( !!node[key] )
            delete node[key];
        else
            node[key] = true;
    }
    
    toggleIn(path, key, mutateParents = 1) {
        this.getNode(path, key, true, mutateParents, State.mToggleIn);
        return this;
    }
    
    static mGetIn(node, key, defaultValue) {
        if( key === undefined )
            return node;

        const value = node[key];
        return value === undefined ? defaultValue : value;
    }

    getIn(path, key, defaultValue) {
        return this.getNode(path, key, false, 0, State.mGetIn, defaultValue);
    }

    mapIn(path, key) {
        return this.getNode(path, key, false, 0, State.mGetIn, {});
    }
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
export const nullLink = '00000000-0000-0000-0000-000000000000';
//------------------------------------------------------------------------------
function sscat() {
    let s = '';

    for( const arg of arguments ) {
        if( arg === undefined || arg === null )
            continue;
            
        s += ' ' + arg.toString().trim();
    }

    return s.trim();
}
//------------------------------------------------------------------------------
const defaultState = {
    metadataVersion : 1,
    header      : {
        collapsed           : true,
        productsTreePath    : [{ key : nullLink, name : 'Каталог' }],
        customersTreePath   : [{ key : nullLink, name : 'Контрагенты' }]
    },
    products    : {
        list   : {
            fields       : productsVisibleFields,
            keyField     : 'Ссылка',
            headerField  : r => sscat(r.ЭтоГруппа ? null : '[' + r.Код + ']', r.Наименование, r.Артикул, r.Производитель),
            titleField   : 'НаименованиеПолное',
            remainderField: 'ОстатокОбщий',
            reserveField : 'Резерв',
            priceField   : 'Цена',
            descField    : 'ДополнительноеОписаниеНоменклатуры',
            imgField     : 'ОсновноеИзображение',
            isGroupField : 'ЭтоГруппа',
            rows         : [],
            grps         : [],
            breadcrumb   : [nullLink],
            view      :  {
                type      : 'Номенклатура',
                parent    : nullLink,
                groups    : true,
                elements  : true,
                filter    : 'Таблица.ЭтоГруппа ИЛИ (Таблица.ОстатокОбщий <> 0 И Соединение.Цена > 0)',
                fields    : [ ...productsVisibleFields.slice(0).reduce((a, v) => { a.push(v.name); return a; }, []), ...[
                    'ОсновноеИзображение'                           ,
                    'НаименованиеПолное'                            ,
                    'ДополнительноеОписаниеНоменклатуры'            ,
                    'ДополнительноеОписаниеНоменклатурыВФорматеHTML'
                ]],
                joins     : [
                    {
                        name    : 'Соединение',
                        type    : 'ЛЕВОЕ',
                        table   : 'РегистрСведений.ЦеныПоставщиков.СрезПоследних',
                        on      : 'Таблица.Ссылка = Соединение.Номенклатура И Соединение.Цена > 0',
                        fields  : 'Соединение.Цена'
                    }
                ]
            }
        }
    }
};
//------------------------------------------------------------------------------
export const store = createStore(
    (state, action) => action.type.constructor === Function ? action.type(state) : state,
    new State((() => {
        let state = localStorage.getItem('reduxState');
        if( state !== null ) {
            // eslint-disable-next-line
            state = eval(state);
            if( defaultState.metadataVersion !== state.metadataVersion )
                state = defaultState;
        }
        else
            state = defaultState;
    
        return state;
    })())
);
//------------------------------------------------------------------------------
function stringify(obj) {
    const placeholder = '____PLACEHOLDER____';
    const fns = [];
    const json = JSON.stringify(obj, (key, value) => {
      if( value.constructor === Function ) {
        fns.push(value);
        value = placeholder;
      }
      return value;
    });
    return '(' + json.replace(new RegExp(`"${placeholder}"`, 'g'), () => fns.shift()) + ')';
  };
//------------------------------------------------------------------------------
store.subscribe(() =>
    localStorage.setItem('reduxState', stringify(store.getState().root)));
//------------------------------------------------------------------------------
export default function disp(functor) {
    store.dispatch({
        type : state => functor(state.dispatch(true)).dispatch()
    });
}
//------------------------------------------------------------------------------
