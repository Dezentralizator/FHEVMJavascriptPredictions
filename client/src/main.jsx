import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { TransactionsProvider } from "./context/TransactionContext";
import "./index.css";


const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript


root.render(
  <TransactionsProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode> 
  </TransactionsProvider>,
);
