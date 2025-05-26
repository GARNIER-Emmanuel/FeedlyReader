// main.jsx ou index.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './components/Style/index.css';// ← c’est ici que tu importes Tailwind CSS
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'animate.css';

// 👇 Supprimer ReactDOM.render et garder uniquement createRoot :
const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
