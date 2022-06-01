import * as React from 'react';
import {Navigate} from 'react-router';
import {observer} from 'mobx-react';
import {StoreContext} from '../../stores';
import {ReactComponent as CancelLogo} from './cancel.svg';
import {ReactComponent as CloseLogo} from './close.svg';
import './styles.css';

class Players extends React.Component {
  static contextType = StoreContext;

  constructor(props) {
    super(props);

    this.state = {
      isVisibleModal: false,
      login: null
    };
  }

  async componentDidMount() {
    if(!this.context.UsersStore.hasAccess) {
      return;
    }

    if(!this.context.UsersStore.users?.length) {
      await this.context.UsersStore.fetch();
    }
  }

  closeModal = () => this.setState({isVisibleModal: false, login: null});

  render() {
    return (
      <>
        {!this.context.UsersStore.hasAccess && <Navigate to="/" replace/>}
        <main className="box app__content app__content_centered players">
          <div className="box__header">
            <h1 className="text text_title players__title">Список игроков</h1>
            <button
              className="button button_primary players__add-new"
              onClick={() => this.setState({isVisibleModal: true})}
            >
              Добавить игрока
            </button>
          </div>
          <table className="players__table table">
            <thead>
            <tr className="table__row">
              <th className="text text_bold table__cell">Логин</th>
              <th className="text text_bold table__cell">Статус</th>
              <th className="text text_bold table__cell">Создан</th>
              <th className="text text_bold table__cell">Изменен</th>
              <th className="text text_bold table__cell"/>
            </tr>
            </thead>
            <tbody>
            {
              this.context.UsersStore.users
                ?.map(
                  ({id, login, status, createdAt, updatedAt}) => (
                    <tr key={id} className="table__cell">
                      <th className="text table__cell players__login">{login}</th>
                      <th className="text table__cell">
                        <div className={
                          [
                            'players__status',
                            `players__status_${status}`
                          ].join(' ')
                        }
                        >
                          {status === 'active' ? 'Активен' : 'Заблокирован'}
                        </div>
                      </th>
                      <th className="text table__cell">{new Date(createdAt).toDateString().slice(4)}</th>
                      <th className="text table__cell">{new Date(updatedAt).toDateString().slice(4)}</th>
                      <th className="text table__cell players__button">
                        <button
                          className={
                            [
                              'button',
                              'button_secondary',
                              `players__${status === 'active' ? 'block' : 'unblock'}`
                            ].join(' ')
                          }
                          onClick={
                            () =>
                              status === 'active' ?
                                this.context.UsersStore.block(id) :
                                this.context.UsersStore.unblock(id)
                          }
                        >
                          {status === 'active' && <CancelLogo width={21} height={20}/>}
                          {status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                        </button>
                      </th>
                    </tr>
                  )
                )
            }
            </tbody>
          </table>
        </main>
        {
          this.state.isVisibleModal &&
          <div className="modal">
            <div className="modal__window">
              <div className="modal__header">
                <button
                  className="modal__close"
                  onClick={this.closeModal}
                >
                  <CloseLogo/>
                </button>
              </div>
              <h1 className="text text_title modal__title">Добавьте игрока</h1>
              <form className="modal__content form players-create">
                <div className="input form__field">
                  <label className="text text_bold input__label">Логин</label>
                  <input
                    type="text"
                    className="text input__textbox players-create__login"
                    placeholder="Логин"
                    onChange={(e) => this.setState({login: e.target.value})}
                  />
                </div>
                <input
                  type="submit"
                  className="button button_primary form__submit modal__submit"
                  value="Добавить"
                  onClick={
                    async(e) => {
                      e.preventDefault();
                      await this.context.UsersStore.add(this.state.login);
                      this.closeModal();
                    }
                  }
                />
              </form>
            </div>
          </div>
        }
      </>
    );
  }
}

export default observer(Players)