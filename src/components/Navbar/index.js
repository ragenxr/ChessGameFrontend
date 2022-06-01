import * as React from 'react';
import {observer} from 'mobx-react';
import {NavLink} from 'react-router-dom';
import {StoreContext} from '../../stores';
import {ReactComponent as LogoIcon} from './logo.svg';
import {ReactComponent as ExitIcon} from './exit.svg';
import './styles.css';

class Navbar extends React.Component {
  static contextType = StoreContext

  render() {
    return (
      <nav className="nav">
        <div className="nav__icon"><LogoIcon/></div>
        <div className="nav__links">
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
                          'nav__link',
                          ...isActive ? ['nav__link_active'] : []
                        ].join(' ')
                    }
                  >
                    {title}
                  </NavLink>
              )
          }
        </div>
        <a className="nav__exit"><ExitIcon width={18} height={18}/></a>
      </nav>
    );
  }
}

export default observer(Navbar);
