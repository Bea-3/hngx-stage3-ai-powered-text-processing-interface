import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const originMeta = document.createElement('meta');
originMeta.httpEquiv = 'origin-trial';
originMeta.content = import.meta.env.VITE_DETECT_LANGUAGE_TOKEN;
document.head.append(originMeta);

// translator
const originMetaTranslate = document.createElement('meta');
originMetaTranslate.httpEquiv = 'origin-trial';
originMetaTranslate.content = import.meta.env.VITE_TRANSLATOR_TOKEN;
document.head.append(originMetaTranslate)

// summarizer 
const originMetaSummarize = document.createElement('meta');
originMetaSummarize.httpEquiv = 'origin-trial';
originMetaSummarize.content = import.meta.env.VITE_SUMMARIZER_TOKEN;
document.head.append(originMetaSummarize)


createRoot(document.getElementById('root')).render(
  <StrictMode>   
    <App />
  </StrictMode>,
)
