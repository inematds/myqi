import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './store/session';
import Home from './pages/Home';
import Test from './pages/Test';
import Result from './pages/Result';
import { useEffect } from 'react';

export default function App() {
  const profile = useSession((s) => s.profile);
  useEffect(() => {
    const cls = profile ? `theme-${profile}` : 'theme-adult';
    document.body.className = cls;
  }, [profile]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test" element={<Test />} />
      <Route path="/result" element={<Result />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
