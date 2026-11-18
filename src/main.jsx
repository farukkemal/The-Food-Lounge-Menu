import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { MenuProvider } from './context/MenuContext.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <MenuProvider>
          <App />
        </MenuProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>
);
