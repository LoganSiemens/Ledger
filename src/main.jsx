import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { cssVars } from './styles/theme.js';
import './styles/globals.css';
import { registerSW } from 'virtual:pwa-register';

const styleEl = document.createElement('style');
styleEl.id = 'ledger-theme-vars';
styleEl.textContent = cssVars;
document.head.appendChild(styleEl);

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
