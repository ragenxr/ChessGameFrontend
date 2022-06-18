import * as React from 'react';
import {Navigate} from 'react-router';
import {observer} from 'mobx-react';
import {StoreContext} from '../../stores';
import dogeImg from './doge.png'
import cn from './styles.module.scss';

@observer
class Login extends React.Component {
  static contextType = StoreContext;

  constructor(props) {
    super(props);

    this.state = {
      login: '',
      password: '',
      errors: {
        login: null,
        password: null
      }
    };
  }

  login = async(e) => {
    e.preventDefault();

    this.state.errors.login = !this.state.login.trim() ? 'Введите логин' : null;
    this.state.errors.password = !this.state.password.trim() ? 'Введите пароль' : null;

    if(this.state.errors.login || this.state.errors.password) {
      return;
    }

    await this.context.AuthStore.getToken(this.state.login, this.state.password);
  }

  render() {
    return (
      !this.context.AuthStore.isLoggedIn ?
        <main className={cn['login']}>
          <img className={cn['login__doge']} src={dogeImg} alt="Дог"/>
          <h1 className="text text_title">Войдите в игру</h1>
          <form className={cn['login__form']}>
            <div className="input form__field">
              <input
                type="text"
                className={
                  [
                    'text',
                    'input__textbox',
                    ...this.state.errors.login ? ['input__textbox_errored'] : []
                  ].join(' ')
                }
                placeholder="Логин"
                value={this.state.login}
                onChange={(e) => this.setState({login: e.target.value})}
              />
              {this.state.errors.login && <small className="input__error-message">{this.state.errors.login}</small>}
            </div>
            <div className="input form__field">
              <input
                type="password"
                className={
                  [
                    'text',
                    'input__textbox',
                    ...this.state.errors.password ? ['input__textbox_errored'] : []
                  ].join(' ')
                }
                placeholder="Пароль"
                value={this.state.password}
                onChange={(e) => this.setState({password: e.target.value})}
              />
              {this.state.errors.password &&
                <small className="input__error-message">{this.state.errors.password}</small>}
            </div>
            <input
              type="submit"
              className="button button_primary form__submit"
              value="Войти"
              onClick={this.login}
            />
          </form>
        </main> :
        <Navigate to={this.props.location?.from?.pathname || '/'} replace/>
    );
  }
}

export default Login;
