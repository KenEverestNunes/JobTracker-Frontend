import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Jobs from './Pages/Jobs';

import Home from './Pages/Home';
import Layout from './Pages/Layout';
import Login from './Components/Login';
import { ThemeProvider } from './Context/ThemeProvider';
import { useEffect } from 'react';
import SignUp from './Components/SignUp';
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  useEffect(() => {
    document.title = 'Job Tracker'
  })
  return (
    <div>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route index element={<Home />} />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/:username/jobs" element={<Jobs />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );

}

export default App;
