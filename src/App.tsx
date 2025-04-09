import {Outlet} from 'react-router'
function App() {
  return (
    <div className="w-[100vw] h-[100vh] bg-[#eee]">
      <Outlet />
    </div>
  )
}

export default App
