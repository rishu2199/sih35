import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import {
  AuthProvider,
  IoTProvider,
  SessionProvider,
  LabProvider,
  ScenarioProvider,
  ThemeProvider,
} from './contexts';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <LabProvider>
        <AuthProvider>
          <IoTProvider>
            <ScenarioProvider>
              <SessionProvider>
                <App />
              </SessionProvider>
            </ScenarioProvider>
          </IoTProvider>
        </AuthProvider>
      </LabProvider>
    </ThemeProvider>
  </React.StrictMode>
);
