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
class Profile extends Component {
  static mapStateToProps(state, ownProps) {
    return state.mapIn(ownProps.path);
  }

  static connectOptions = { withRef: true };

  state = {};

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
          {'Учётной запись: ' + props.user}
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
          <Sui.Form.Button type="submit" color="teal" fluid size="medium" disabled={!state.isRequiredFieldsFilled}>
            Сохранить
          </Sui.Form.Button>{state.successMsg ?
            <Sui.Message success header="Успех" content={state.successMsg} /> : null}{state.errorMsg ?
              <Sui.Message error header="Ошибка" content={state.errorMsg} /> : null}
        </Sui.Form>
      </Sui.Segment>
    </Sui.Segment.Group>;
  }
}
//------------------------------------------------------------------------------
export default connect(Profile);
//------------------------------------------------------------------------------
