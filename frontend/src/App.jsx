import Home from './pages/Home.jsx';
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function App() {

  return (
    <>
      <Navbar/>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <Home />
        </div>
      </div>
    </>
  )
}

export default App
