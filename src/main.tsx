import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from './App.tsx'
import Login from './routes/Login.tsx'
import Dashboard from './routes/Dashboard.tsx'
import './main.css'
import useAccountStore from './store/account.ts'

// Remove global axios baseURL configuration as it's now in api.ts
// Initialize routes with auth protection

const AppWithAuth = () => {
  // Get authentication state and initialization function
  const { isAuthenticated, initializeFromStorage } = useAccountStore();
  
  // Initialize auth state from localStorage on app load
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);
  
  const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        { 
          path: '', 
          element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login /> 
        },
        { 
          path: 'dashboard/*', 
          element: isAuthenticated ? <Dashboard /> : <Navigate to="/" replace /> 
        },
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithAuth />
  </StrictMode>,
);
