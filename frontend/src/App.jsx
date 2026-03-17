import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Temporary placeholder components
const Login = () => <div className="p-8 text-center text-2xl font-bold">Login Screen Placeholder</div>;
const Dashboard = () => <div className="p-8 text-center text-2xl font-bold text-primary">Melodify Dashboard</div>;

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background bg-zinc-950 text-white">
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App;
