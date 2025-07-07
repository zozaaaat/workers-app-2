import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { SnackbarProvider } from "./context/SnackbarContext";
import './i18n'; // Import i18n configuration

// Import the required CSS for RTL support
import 'react-datepicker/dist/react-datepicker.css';
import './styles/datepicker-rtl.css';

// Initialize the app
const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <SnackbarProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SnackbarProvider>
  </StrictMode>
);

// Enable hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept();
}
