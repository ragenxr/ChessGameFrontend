import * as React from 'react';
import {observer} from 'mobx-react';
import {NavLink} from 'react-router-dom';
import {StoreContext} from '../../stores';
import LogoIcon from './logo.svg';
import ExitIcon from './exit.svg';
import cn from './styles.module.scss';

class Navbar extends React.Component {
  static contextType = StoreContext

  render() {
    return (
      <nav className={cn['nav']}>
        <LogoIcon className={cn['nav__icon']}/>
        <div className={cn['nav__links']}>
          {
            this.props.routes
              .filter(({title}) => title)
              .map(
                ({path, getParam, title}) =>
                  <NavLink
                    key={path}
                    to={getParam ? path.replace(':id', getParam() || '') : path}
                    className={
                      ({isActive}) =>
                        [
                          cn['nav__link'],
                          ...isActive ? [cn['nav__link_active']] : []
                        ].join(' ')
                    }
                  >
                    {title}
                  </NavLink>
              )
          }
        </div>
        <a className={cn['nav__exit']} onClick={() => this.context.AuthStore.logout()}>
          <ExitIcon width={18} height={18}/>
        </a>
      </nav>
    );
  }
}

export default observer(Navbar);
