import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PublicMessage from './pages/PublicMessage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/m/:linkId" element={<PublicMessage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
