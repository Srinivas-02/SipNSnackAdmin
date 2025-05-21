import {Outlet} from 'react-router'
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: '#22c55e',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      <div className="w-[100vw] h-[100vh] bg-[#eee]">
        <Outlet />
      </div>
    </>
  )
}

export default App
