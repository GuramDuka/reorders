//------------------------------------------------------------------------------
import React, { Component } from 'react';
import connect from 'react-redux-connect';
import * as Sui from 'semantic-ui-react';
import * as Hashes from 'jshashes';
import disp from '../../store';
import { sfetch } from '../../backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Login extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static connectOptions = { withRef: true };

  terms = `
Настоящие УСЛОВИЯ ИСПОЛЬЗОВАНИЯ Сайта являются официальным документом Клиника доктора Блюма (ИНН 7728741960, адрес: г. Москва, Ленинский проспект 131, далее – Администратор) и определяют порядок использования посетителями сайта http://www.blumclinic.ru (далее - Сайт) Сайта (виджет онлайн-консультант, интегрированный в Сайт) и обработки информации, получаемой от посетителей Сайта.
Начиная использование Сайта, посетитель Сайта выражает свое полное и безоговорочное согласие с настоящими УСЛОВИЯМИ ИСПОЛЬЗОВАНИЯ САЙТА, которые определяются Администратором как публичная оферта в соответствии со статьей 437 ГК РФ.
Посетитель Сайта обязан ознакомиться с настоящими УСЛОВИЯМИ ИСПОЛЬЗОВАНИЯ САЙТА до начала использования Сайта.
Настоящие УСЛОВИЯ ИСПОЛЬЗОВАНИЯ Сайта могут быть изменены Администратором в одностороннем порядке в любой момент без уведомления пользователя Сайта.
Сайт и порядок его использования. Сайт представляет собой комплексный объект авторских и смежных прав, все исключительные права на который принадлежат правообладателю – Клиника доктора Блюма (ОИНН 7728741960, адрес: г. Москва, Ленинский проспект 131). Использование Сайта осуществляется пользователями Сайта на безвозмездной основе на условиях простой неисключительной лицензии. Пользователю предоставляется право на воспроизведение Сайта на Сайте Администратора и его последующее использование исключительно в соответствии с его функциональным назначением – для целей коммуникации с Администратором Сайта.
Согласие на обработку персональных данных. В случае если при использовании Сайта пользователем будет сообщена какая-либо информация, относящаяся к прямо или косвенно определенному или определяемому физическому лицу (далее – персональные данные), ее последующая обработка будет осуществляться в соответствии с законодательством Российской Федерации. В отношении всех сообщаемых персональных данных пользователь дает Администратору согласие на их обработку. Администратор обрабатывает персональные данные пользователя исключительно в целях предоставления пользователю функционала Сайта и Сайта, размещенного на нем контента, маркетинговой, рекламной, иной информации, в целях получения пользователем персонализированной (таргетированной) рекламы, исследования и анализа данных пользователя, а также в целях продвижения пользователю своих товаров и услуг. Администратор принимает все необходимые меры для защиты персональных данных пользователя Сайта, а также предоставляет к таким данным доступ только тем работникам, подрядчикам и агентам Администратора, которым эта информация необходима для обеспечения целей обработки персональных данных Администратором Сайта. Раскрытие предоставленных пользователем персональных данных может быть произведено лишь в соответствии с законодательством Российской Федерации. В отношении всех сообщенных Администратору пользователем своих персональных данных Администратор вправе осуществлять сбор, систематизацию, накопление, хранение, уточнение (обновление, изменение), использование, распространение (в том числе передача любым третьим лицам, включая передачу персональных данных третьим лицам на хранение или в случае поручения обработки персональных данных третьим лицам), обезличивание, блокирование, уничтожение, трансграничная передача, обработка с применением основных способов такой обработки (хранение, запись на электронных носителях и их хранение, составление перечней, маркировка) и иные действия в соответствии со статьей 3 Федерального закона от 27.06.2006 № 152-ФЗ «О персональных данных». Пользователь понимает и соглашается с тем, что предоставление Администратору какой-либо информации о себе, не являющейся контактной и не относящейся к целям, обозначенным Администратором Сайта (не относящейся к деятельности Администратора, к продвигаемым им товарам и/или услугам, к условиям сотрудничества Администратора и пользователя Сайта), а ровно предоставление информации, относящейся к государственной, банковской и/или коммерческой тайне, информации о расовой и/или национальной принадлежности, политических взглядах, религиозных или философских убеждениях, состоянии здоровья, интимной жизни пользователя Сайта или иного третьего лица запрещено.
Обязанности пользователя Сайта. Пользователь обязан при посещении Сайта и при использовании Сайта соблюдать положения настоящих УСЛОВИЙ ИСПОЛЬЗОВАНИЯ Сайта и законодательства Российской Федерации, в том числе:
  • В случае принятия пользователем решения о предоставлении Администратору какой-либо информации (каких-либо данных), предоставлять исключительно достоверную и актуальную информацию. Пользователь Сайта не вправе вводить Администратора в заблуждение в отношении своей личности, сообщать ложную или недостоверную информацию о себе;
  • Не сообщать Администратору любым образом, как с использованием Сайта, так и в ином порядке, какую-либо информацию, полностью или в части относящуюся к государственной, коммерческой и/или банковской тайне, фактам и информации о своей личной жизни или личной жизни третьих лиц, а также не сообщать иную информацию, предоставление которой запрещено настоящими УСЛОВИЯМИ ИСПОЛЬЗОВАНИЯ Сайта;
  • Не сообщать, не передавать и не предоставлять Администратору какую-либо информацию (в том числе данные, объекты, контент и тд.) и ссылки на такую информацию если это может нарушать или привести к нарушению законодательства Российской Федерации, нарушить права и интересы третьих лиц. В случае наличия у пользователя сомнений относительного правомерности сообщения какой-либо информации Администратору посредством Сайта и Сайта, пользователь обязан воздержаться от совершения данного действия;
  • Использовать полученную от Администратора информацию (в том числе информацию, переданную Администратором через Сайт и/или Сайт) исключительно для личных целей, не передавать такую информацию третьим лицам без прямого на то согласия Администратора.
Ограничение ответственности Администратора. Сайт и Сайт, как и любое программное обеспечение, не свободно от ошибок. Сайт, Сайт, весь функционал, включая скрипты, приложения, контент и иную информацию, размещенную на сайте, поставляются на условиях «КАК ЕСТЬ», со всеми недостатками, проявившимися сразу или не сразу. Администратор не гарантирует и не обещает каких-либо результатов от использования Сайта или Сайта. Принимая настоящие УСЛОВИЯ ИСПОЛЬЗОВАНИЯ Сайта пользователь Сайта соглашается с тем, что Администратор не несет никакой ответственности за функционирование и работоспособность Сайта. Администратор не несет ответственности за временные сбои и перерывы в работе Сайта или Сайта и вызванные такими сбоями потери информации. Администратор также не несет никакой ответственности за ущерб, причиненный пользователям Сайта, явившийся результатом использования Сайт или Сайта. Администратор вправе использовать и распоряжаться информацией пользователя для составления статистической отчетности, использовать ее в рекламных и маркетинговых целях, а также вправе направлять пользователю информацию о своей деятельности и любым способом ее рекламировать. Правообладатель Сайта (Клиника Доктора Блюма) не несет никакой ответственности за функционирование Сайта, за какие-либо последствия его использования пользователями Сайта и/или последствия сообщения или получения какой-либо информации с использованием (с помощью) Сайта.
`;

  state = {
    isVisibleTerms: true,
    isDisabledLogin: true,
    isDisabledRegistration: true
  };

  handleFieldValue = (e, data) => {
    this[data.name] = data.value;
    this.checkFields(data.name);
  };

  checkFields = field => {
    const { state, user, email, pass, pass2 } = this;
    const { isRegistration } = state;
    let errorMsg;

    this.checkRequiredFieldsFilled();

    if (!user || user.length === 0)
      errorMsg = 'Не указан(о) E-mail или имя пользователя';
    // check non printable symbols, allow only Basic Latin and Cyrillic, exclude space
    // http://kourge.net/projects/regexp-unicode-block
    else if (user.replace(/[\u0021-\u007e,\u00a0-\u00ff,\u0400-\u04FF,\u0500-\u052F]*/g, '').length !== 0
        || user.indexOf('.') >= 0 )
      errorMsg = 'Недопустимые символы в имени пользователя';
    else if (isRegistration && (!email || email.indexOf('@') < 0) )
      errorMsg = 'Не указан E-mail';
    else if (!pass || pass.length === 0)
      errorMsg = 'Не указан пароль';
    else if (isRegistration && pass !== pass2)
      errorMsg = 'Пароли не совпадают';

    if (errorMsg)
      this.setState({ successMsg: undefined, errorMsg: errorMsg });
    else if (state.errorMsg)
      this.setState({ errorMsg: undefined });

    const obj = this;

    if( isRegistration )
      sfetch({ r: { m: 'auth', f: 'check', r: { user: user } } }, json =>
        json.exists && user && user.toUpperCase() === json.user.toUpperCase()
        && obj.setState({
          successMsg: undefined,
          errorMsg: 'Пользователь с таким E-mail или именем уже существует'
        }));
  };

  isRequiredFieldsFilled = e => {
    const { state, user, email, pass, pass2 } = this;
    const { isRegistration } = state;
    return user && user.length !== 0
      && pass && pass.length !== 0
      && (!isRegistration || (email && email.indexOf('@') >= 0))
      && (!isRegistration || pass === pass2);
  };

  checkRequiredFieldsFilled = e => {
    const isRequiredFieldsFilled = this.isRequiredFieldsFilled();
  
    if (this.state.isRequiredFieldsFilled !== isRequiredFieldsFilled)
      this.setState({ isRequiredFieldsFilled: isRequiredFieldsFilled });
  };
    
  handleAcceptTerms = (e, data) => {
    const v = !data.checked;
    this.setState({
      isVisibleTerms: v,
      isDisabledLogin: v,
      isDisabledRegistration: v
    });
  };

  handleSubmit = (e, data) => {
    const { props, state, user, email, pass } = this;
    const { isRegistration } = state;

    const sha256 = new Hashes.SHA256();
    const rr = {
      user: user.trim(),
      //pass: this.pass,
      hash: sha256.hex(pass).toUpperCase()
    };

    if( isRegistration && email )
      rr.email = email.trim();

    const r = { m: 'auth', f: isRegistration ? 'registration' : 'login', r: rr };

    const success = (state, json) => {
      const { path } = props;
      state = state.mergeIn(path.slice(0, -1), path[path.length - 1],
        { ...rr, ...json, pass: pass });

      state = state.editIn('body', 'viewStack', v => v.pop());
      const stack = state.getIn('body', 'viewStack');
      state = state.setIn('body', 'view', stack[stack.length - 1].view);

      return state;
    };

    const fail = error => this.setState({
      successMsg: undefined,
      errorMsg: 'Ошибка ' + (isRegistration ? 'регистрации' : 'авторизации')
    });

    sfetch({ r: r }, json => {
      if ((isRegistration && json.registered) || json.authorized)
        disp(state => success(state, json));
      else
        fail();
    }, fail);
  };

  componentDidMount() {
    const { props } = this;
    this.user = props.user;
    this.email = props.email;
    this.pass = props.pass;
    this.checkRequiredFieldsFilled();
  }

  render() {
    const { props, state } = this;

    return <Sui.Segment.Group style={{ margin: 4 }}>
      <Sui.Segment>
        <Sui.Header as="h4" color="teal" textAlign="center">
          {state.isRegistration ? 'Заполните данные регистрации' : 'Войдите под своей учётной записью'}
        </Sui.Header>
      </Sui.Segment>
      <Sui.Segment>
        <Sui.Form size="large" onSubmit={this.handleSubmit} success={!!state.successMsg} error={!!state.errorMsg}>
          <Sui.Form.Field>
            <Sui.Input autoComplete="off" required fluid
              icon="user" iconPosition="left" name="user"
              onChange={this.handleFieldValue} defaultValue={props.user} labelPosition="left"
              placeholder="E-mail или имя пользователя" />
          </Sui.Form.Field>{state.isRegistration ?
          <Sui.Form.Field>
            <Sui.Input autoComplete="off" required fluid type="email"
              icon="envelope" iconPosition="left" name="email"
              onChange={this.handleFieldValue} defaultValue={props.email}
              placeholder="E-mail, если имя пользователя" />
          </Sui.Form.Field> : null}
          <Sui.Form.Field>
            <Sui.Input autoComplete="off" required fluid type="password"
              icon="lock" iconPosition="left" name="pass"
              onChange={this.handleFieldValue} defaultValue={props.pass} placeholder="Пароль" />
          </Sui.Form.Field>{state.isRegistration ?
          <Sui.Form.Field>
            <Sui.Input autoComplete="off" required fluid type="password"
              icon="lock" iconPosition="left" name="pass2"
              onChange={this.handleFieldValue} defaultValue="" placeholder="Пароль ещё раз" />
          </Sui.Form.Field> : null}
          <Sui.Form.Checkbox required inline onChange={this.handleAcceptTerms}
            label="Я согласен с условиями использования и политикой конфиденциальности" />
          <Sui.Message visible={state.isVisibleTerms} warning>
            <Sui.Message.Header as="h3" style={{ textAlign: 'center' }}>
              Условия использования и политика конфиденциальности
            </Sui.Message.Header>
            <Sui.Message.Content style={{ marginTop: 4, textAlign: 'justify', fontSize: '80%', lineHeight: '1.25em' }}>
              {this.terms}
            </Sui.Message.Content>
          </Sui.Message>
          <Sui.Form.Button type="submit" color="teal" fluid size="medium" disabled={!state.isRequiredFieldsFilled}>
            {state.isRegistration ? 'Регистрация' : 'Вход'}
          </Sui.Form.Button>{state.successMsg ?
            <Sui.Message success header="Успех" content={state.successMsg} /> : null}{state.errorMsg ?
              <Sui.Message error header="Ошибка" content={state.errorMsg} /> : null}
        </Sui.Form>
      </Sui.Segment>{state.isRegistration ? null :
        <Sui.Segment>
          <Sui.Message>
            Новый пользователь?&nbsp;
          <Sui.Button color="teal" size="medium" disabled={state.isDisabledRegistration}
            onClick={e => this.setState({ isRegistration: true })} content="Регистрация" />
          </Sui.Message>
        </Sui.Segment>}
    </Sui.Segment.Group>;
  }
}
//------------------------------------------------------------------------------
export default connect(Login);
//------------------------------------------------------------------------------
