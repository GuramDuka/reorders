//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import disp, { nullLink, sscat } from '../../store';
import BACKEND_URL, { transform, serializeURIParams } from '../../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Card extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static mapDispatchToProps(dispatch, ownProps) {
    const { path } = ownProps;
    return {
      clickPropsTitle : e => {
        // cast to integer, fast (and short) way is the double-bitwise not (i.e. using two tilde characters)
        const idx = ~~e.currentTarget.attributes.idx.value;
        disp(state => state.toggleIn([...path, 'activeTitles'], idx, 2));
      },
      clickImg : () => this.setState({isImgLargeViewOpen: true})
    };
  }

  state = { isLoading: false, isImgLargeViewOpen: false };

  toggleCard = e => {
    if( !~~e.currentTarget.attributes.expanded.value )
      disp(this.reload(), true);
    
    const { path } = this.props;
    disp(state => state.toggleIn(path, 'expanded'));
  };

  reload = (options) => {
    const obj = this;
    const { link } = obj.props;
    obj.setState({isLoading: true});
    return state => {
      const opts = {
        method      : options && options.refresh ? 'PUT' : 'GET',
        credentials : 'omit',
        mode        : 'cors',
        cache       : 'default'
      };
      
      const r = {
        m : 'pkg',
        r : [
          {
            r : { type : 'Номенклатура', link : link },
            m : 'dict',
            f : 'prop'
          },
          {
            r : { type : 'Номенклатура', link : link },
            m : 'dict',
            f : 'desc'
          }
        ]
      };
    
      if( opts.method === 'PUT' )
        opts.body = JSON.stringify(r);

      const url = BACKEND_URL + (opts.method === 'GET' ? '?' + serializeURIParams({r:r}) : '');

      fetch(url, opts).then(response => {
        const contentType = response.headers.get('content-type');

        if( contentType ) {
          if( contentType.includes('application/json') )
            return response.json();
          if( contentType.includes('text/') )
            return response.text();
        }
        // will be caught below
        throw new TypeError('Oops, we haven\'t right type of response! Status: ' + response.status + ', ' + response.statusText);
      }).then(json => {
        if( json === undefined || json === null || (json.constructor !== Object && json.constructor !== Array) )
          throw new TypeError('Oops, we haven\'t got JSON!' + (json && json.constructor === String ? ' ' + json : ''));
        json = transform(json);
        obj.setState({props: json[0], desc: json[1], isLoading: false});
      })
      .catch(error => {
        if( process.env.NODE_ENV === 'development' )
          console.log(error);
        obj.setState({isLoading: false});
      });

      return state;
    };
  };
  
  clickImg = () => this.setState({ isImgLargeViewOpen: true });
  closeImgLargeView = () => this.setState({isImgLargeViewOpen: false});

  componentWillMount() {
    if( this.props.expanded && this.state.props === undefined )
      disp(this.reload(), true);
  }
  
  render() {
    const { props, state } = this;
    const { expanded, data, clickPropsTitle } = props;
    const activeTitles = Array.isArray(props.activeTitles) ? props.activeTitles : [];
    
    if( process.env.NODE_ENV === 'development' )
      console.log('render Card: ' + props.path[props.path.length - 1] + ', isLoading: ' + state.isLoading);
    
    const icoKey = data.ОсновноеИзображение || nullLink;
    
    const icoUrl = BACKEND_URL + '?'
      + serializeURIParams({r: {m: 'img', f: 'ico', u: icoKey, w: 28, h: 28}});
    const ico = icoKey === nullLink ? null :
      <Sui.Image size="mini" src={icoUrl} style={{padding:2}} />;

    const imgUrl = BACKEND_URL + '?'
      + serializeURIParams({r: {m: 'img', u: icoKey}});
    const img = icoKey === nullLink ? null :
      <Sui.Image floated="left" size="tiny" src={imgUrl} onClick={this.clickImg}/>;

    const prop = expanded && state.props ? state.props.rows.map((row, i) => i !== 0
       ? [<i key="0">, </i>, <strong key="1">{row.СвойствоПредставление}: </strong>, <i key="2">{row.ЗначениеПредставление}</i>]
       : [<strong key="0">{row.СвойствоПредставление}: </strong>, <i key="1">{row.ЗначениеПредставление}</i>]) : null;
  
    const desc = expanded && state.desc
      ? state.desc.ДополнительноеОписаниеНоменклатуры
        //.replace(/\\r\\n/g, '<br />')
        //.replace(/\\r/g, '<br />')
        //.replace(/\\n/g, '<br />')
        //.replace(/\\t/g, '&nbsp;')
        //.replace(//g, '&bull;') // https://unicode-table.com/en/F020/
        .replace(//g, '•')
        .trim()
      : '';

    const meta = expanded ?
      <Sui.Accordion exclusive={false}>
        <Sui.Accordion.Content active={true}>
          {[<strong key="0">Код: </strong>, <i key="1">{data.Код}</i>]}
          {data.Артикул       ? [<i key="2">, </i>, <strong key="6">Артикул: </strong>, <i key="10">{data.Артикул}</i>] : null}
          {data.Производитель ? [<i key="3">, </i>, <strong key="7">Производитель:</strong>, <i key="11">{data.Производитель}</i>] : null}
          {data.ОстатокОбщий  ? [<i key="4">, </i>, <strong key="8">Остаток:</strong>, <i key="12">{data.ОстатокОбщий}</i>] : null}
          {data.Цена          ? [<i key="5">, </i>, <strong key="9">Цена:</strong>, <i key="13">{data.Цена + '₽'}</i>] : null}
        </Sui.Accordion.Content>{prop ?
        <Sui.Accordion.Title active={!!activeTitles[1]}
          index={1} idx={1} onClick={clickPropsTitle}>
          <Sui.Label size="small" color="blue">
            <Sui.Icon name="dropdown" size="large" color="black" />
            Свойства
            <Sui.Label.Detail>{state.props && state.props.rows ? state.props.rows.length : ''}</Sui.Label.Detail>
          </Sui.Label>
        </Sui.Accordion.Title> : null}{prop ?
        <Sui.Accordion.Content active={!!activeTitles[1]}>
          {prop}
        </Sui.Accordion.Content> : null}{desc.length === 0 ? null :
        <Sui.Accordion.Title active={!!activeTitles[2]} index={2} idx={2} onClick={clickPropsTitle}>
          <Sui.Label size="small" color="blue">
            <Sui.Icon name="dropdown" size="large" color="black" />
            Описание
            <Sui.Label.Detail>{desc.length}</Sui.Label.Detail>
          </Sui.Label>
        </Sui.Accordion.Title>}
        <Sui.Accordion.Content active={!!activeTitles[2]}>
          <Sui.Container fluid textAlign='justified'>{desc}</Sui.Container>
        </Sui.Accordion.Content>
      </Sui.Accordion> : null;
        
    const hdr = expanded
      ? (state.desc && state.desc.НаименованиеПолное ? state.desc.НаименованиеПолное : data.Наименование)
      : sscat(' ', '[' + data.Код + ']', data.Наименование, data.Артикул, data.Производитель);
    
    const expandedString = (~~!!expanded).toString();

    return (
      <Sui.Card fluid style={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}>
        <Sui.Card.Content style={{padding: '.25em'}}>
          {expanded ? img : null}
          <Sui.Card.Header style={{fontSize: '87%'}} expanded={expandedString} onClick={this.toggleCard}>
            {hdr}{expanded ? null :
            <Sui.Label size="small" color="teal" image>
              {ico}
              {data.ОстатокОбщий}{data.Резерв ? ' (' + data.Резерв + ')' : ''}
              <Sui.Label.Detail>{data.Цена}₽</Sui.Label.Detail>
            </Sui.Label>}
          </Sui.Card.Header>{expanded ?
          <Sui.Card.Meta>
            {meta}
          </Sui.Card.Meta> : null}
        </Sui.Card.Content>{expanded ?
        <Sui.Card.Content extra style={{padding: '.25em'}}>{state.isLoading ? <Sui.Loader active inline size="small" /> :
          <Sui.Button compact size="tiny" circular primary expanded={expandedString} onClick={this.toggleCard} icon="compress" />}
          <Sui.Button compact basic size="small" color="blue" content="В корзину" icon="shop" labelPosition="left" />
        </Sui.Card.Content> : null}{expanded ?
        <Sui.Modal dimmer="blurring" open={this.state.isImgLargeViewOpen} onClose={this.close}>
          <Sui.Modal.Content image>
            <Sui.Image wrapped fluid src={imgUrl} />
          </Sui.Modal.Content>
          <Sui.Modal.Actions>
            <Sui.Button icon='checkmark' labelPosition='right' content="Закрыть" onClick={this.closeImgLargeView} />
          </Sui.Modal.Actions>
        </Sui.Modal> : null}
      </Sui.Card>);
  }
}
//------------------------------------------------------------------------------
export default connect(Card);
//------------------------------------------------------------------------------
