import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Home from './Home';
import Dashboard from './Dashboard';
import PublicMessage from './PublicMessage';

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
