import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

import Dispatcher from './component/Dispatcher';
import LoginPage from './pages/login/LoginPage';
import RootPage from './pages/RootPage';
import Authentication from './component/Authentication';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <Authentication>
              <Dispatcher />
            </Authentication>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
