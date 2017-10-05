import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import connect from 'react-redux-connect';
import './css/App.css';

//import react_logo from './assets/logo.svg';

import View from './components/DictList/View';
import Header from './components/Header';

class App extends Component {
  render() {
    console.log('render App');
    const { props } = this;

    const cols = [
      { name  : 'lineNo',       title : '#'       },
      { name  : 'Код'                             },
      { name  : 'Наименование'                    },
      { name  : 'Артикул'                         },
      { name  : 'Производитель'                   },
      { name  : 'ОстатокОбщий', title : 'Остаток' }
    ];

    const view =  {
      type      : "Номенклатура",
      parent    : '00000000-0000-0000-0000-000000000000',
      groups    : true,
      elements  : false,
      filter    : 'Таблица.ЭтоГруппа ИЛИ Таблица.ОстатокОбщий <> 0',
      cols      : [ ...cols.slice(1).reduce((a, v) => { a.push(v.name); return a; }, []), ...[
        'НаименованиеПолное'                            ,
        'ДополнительноеОписаниеНоменклатуры'            ,
        'ДополнительноеОписаниеНоменклатурыВФорматеHTML',
      ]]
    };
  
    return (
      <div>
        <Header path={[ ...props.path, 'header' ]} />
        <View   path={[ ...props.path, 'list'   ]} view={view} cols={cols} />
      </div>);
  }
}

// App.contextTypes = {
//   store: PropTypes.object.isRequired
// };

export default connect(App);
