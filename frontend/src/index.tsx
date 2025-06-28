import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';

// Suppress ResizeObserver loop error in development
const realConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    return;
  }
  realConsoleError(...args);
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
