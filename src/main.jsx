import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import './index.css';

// Render the application with Redux Provider and Router
ReactDOM.createRoot(document.getElementById('root')).render(
  // Do not use StrictMode as it causes double renders which can affect authentication flow
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);