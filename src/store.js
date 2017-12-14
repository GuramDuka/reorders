//------------------------------------------------------------------------------
import { createStore } from 'redux';
//------------------------------------------------------------------------------
export function copy(src) {
  let dst = src;

  if (src === undefined || src === null) {
  }
  else if (src.constructor === Object) {
    dst = {};

    for (const n in src)
      dst[n] = copy(src[n]);
  }
  else if (src.constructor === Array)
    dst = Array.from(src);
  else if (src.constructor === String)
    dst = src.valueOf();
  else if (src.constructor === Number)
    dst = src.valueOf();
  else if (src.constructor === Boolean)
    dst = src.valueOf();
  else if (src.constructor === Date)
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
    if (begin) {
      if (this.mutated !== undefined)
        throw new Error('already dispatched');
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

  mutateNode(node) {
    if (this.mutated.get(node) === undefined) {
      node = node.constructor === Object ? Object.assign({}, node)
        : node.constructor === Array ? Array.from(node) : undefined;
      if (process.env.NODE_ENV === 'development')
        if (node === undefined)
          throw new Error('value must have Object or Array type');
      this.mutated.set(node, true);
    }
    return node;
  }

  getNode(path, key, createNode, mutateParents, manipulator, arg0) {
    if (!Array.isArray(path)) {
      const p = path.toString();
      const s = p.split('.');
      path = s.length === 0 ? [p] : s;
    }

    const l = path.length;
    let node = this.root;

    if (l === 0) {
      if (mutateParents !== 0)
        this.root = node = this.mutateNode(node);
    }
    else for (let i = 0; i < l; i++) {
      const k = path[i];
      let next = node[k];

      if (next === undefined && createNode) {
        node[k] = next = (i + 1 < l && k.constructor === String) || (i + 1 === l && key.constructor === String) ? {}
          : ((i + 1 < l && k.constructor === Number) || (i + 1 === l && key.constructor === Number) ? [] : undefined);
        if (process.env.NODE_ENV === 'development')
          if (next === undefined)
            throw new Error('path key must have String or Number type');
        this.mutated.set(next, true);
      }

      if (next === undefined)
        break;

      if (l - mutateParents <= i && this.mutated.get(next) === undefined)
        node[k] = next = this.mutateNode(next);

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

  static mMergeIn(node, key, value) {
    let v = node[key];
    
    if( v === undefined )
      node[key] = v = {};

    for (const k in value)
      v[k] = value[k];
  }
  
  mergeIn(path, key, iterable, mutateParents = 1) {
    this.getNode(path, key, true, mutateParents, State.mMergeIn, iterable);
    return this;
  }

  static mUpdateIn(node, key, functor) {
    node[key] = functor(node[key]);
  }

  updateIn(path, key, functor, mutateParents = 1) {
    this.getNode(path, key, true, mutateParents, State.mUpdateIn, functor);
    return this;
  }

  static mEditIn(node, key, functor) {
    let v = node[key];
    
    if( v === undefined )
      node[key] = v = {};

    functor(v, key, node);
  }

  editIn(path, key, functor, mutateParents = 1) {
    this.getNode(path, key, true, mutateParents, State.mEditIn, functor);
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
    if (!!node[key])
      delete node[key];
    else
      node[key] = true;
  }

  toggleIn(path, key, mutateParents = 1) {
    this.getNode(path, key, true, mutateParents, State.mToggleIn);
    return this;
  }

  static mGetIn(node, key, defaultValue) {
    if (key === undefined)
      return node;

    const value = node[key];
    return value === undefined ? defaultValue : value;
  }

  getIn(path, key, defaultValue) {
    return this.getNode(path, key, false, 0, State.mGetIn, defaultValue);
  }

  mapIn(path, key, defaultValue = {}) {
    return this.getNode(path, key, false, 0, State.mGetIn, defaultValue);
  }
}
//------------------------------------------------------------------------------
export const nullLink = '00000000-0000-0000-0000-000000000000';
//------------------------------------------------------------------------------
export function sscat(delimiter, ...args) {
  let s = '';

  for (const arg of args) {
    if (arg === undefined || arg === null)
      continue;

    const a = arg.toString().trim();
    if (a.length !== 0)
      s += delimiter + a;
  }

  return s.substr(delimiter.length).trim();
}
//------------------------------------------------------------------------------
const defaultState = {
  metadataVersion: 7,
  header: {
    collapsed: true
  },
  body: {
    viewStack: [{ view: 'products' }],
    view: 'products',
  },
  searcher: {
    order: {
      field: 'Наименование',
      direction: 'asc'
    }
  },
  products: {
    list: {
      breadcrumb: [{ name: '', link: nullLink }],
      view: {
        type: 'Номенклатура',
        order: {
          field: 'Наименование',
          direction: 'asc'
        },
        parent: nullLink,
        groups: true,
        elements: true,
        /*filter: 'Таблица.ЭтоГруппа ИЛИ Таблица.ОстатокОбщий <> 0',
        joinsFilter: 'Таблица.ЭтоГруппа ИЛИ Соединение.Цена > 0',
        fields: [
            'Код',
            'Наименование',
            'Артикул',
            'Производитель',
            'ОстатокОбщий',
            'ОсновноеИзображение'
        ],
        joins: [
            {
                name: 'Соединение',
                type: 'ЛЕВОЕ',
                table: 'РегистрСведений.ЦеныПоставщиков.СрезПоследних(, Номенклатура В (ВЫБРАТЬ ВТ.Ссылка ИЗ ВТ ГДЕ ВТ.ЭтоГруппа = ЛОЖЬ))',
                on: 'Таблица.Ссылка = Соединение.Номенклатура И Соединение.Цена > 0',
                fields: 'Соединение.Цена'
            },
            {
                name: 'Потомки',
                type: 'ЛЕВОЕ',
                table: `(
                    ВЫБРАТЬ
                        Т.Ссылка,
                        КОЛИЧЕСТВО(Н.Ссылка) КАК КП
                    ИЗ
                        ВТ КАК Т
                        СОЕДИНЕНИЕ Справочник.Номенклатура КАК Н
                        ПО Т.Ссылка = Н.Родитель
                    ГДЕ
                        Т.ЭтоГруппа = ИСТИНА
                    СГРУППИРОВАТЬ ПО
                        Т.Ссылка)`,
                on: 'Таблица.Ссылка = Потомки.Ссылка',
                fields: 'Потомки.КП'
            }
        ]*/
      }
    }
  }
};
//------------------------------------------------------------------------------
export const store = createStore(
  (state, action) => action.type.constructor === Function ? action.type(state) : state,
  new State((() => {
    let state = localStorage.getItem('reduxState');
    if (state !== null) {
      // eslint-disable-next-line
      state = eval(state);
      if (defaultState.metadataVersion !== state.metadataVersion)
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
    if (value !== undefined && value !== null && value.constructor === Function) {
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
export default function disp(functor, async) {
  if (async)
    functor(store.getState().dispatch(true)).dispatch();
  else
    store.dispatch({
      type: state => functor(state.dispatch(true)).dispatch()
    });
}
//------------------------------------------------------------------------------
