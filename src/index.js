import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './components';
import {Store, StoreContext} from './stores';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <StoreContext.Provider value={new Store()}>
    <React.StrictMode>
      <App/>
    </React.StrictMode>
  </StoreContext.Provider>
);
