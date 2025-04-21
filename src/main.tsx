import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import Login from './routes/Login.tsx'
import Dashboard from './routes/Dashboard.tsx'
import './main.css'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000'

const router = createBrowserRouter([
  {
    path : '/',
    element: <App/>,
    children: [
      {path: '', element: <Login/>},
      {path: 'dashboard/*', element: <Dashboard/>},
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
