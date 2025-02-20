import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>   
    <App />
  </StrictMode>,
)
const originMeta = document.createElement('meta');
originMeta.httpEquiv = 'origin-trial';
originMeta.content = import.meta.env.VITE_DETECT_LANGUAGE_TOKEN;
document.head.append(originMeta);
