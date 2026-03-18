import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import MomentsPage from './pages/Moments';
import GrudgesPage from './pages/Grudges';
import PersonDetailPage from './pages/PersonDetail';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="moments" element={<MomentsPage />} />
          <Route path="grudges" element={<GrudgesPage />} />
          <Route path="grudges/:id" element={<PersonDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
