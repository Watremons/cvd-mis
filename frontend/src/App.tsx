import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

import Dispatcher from './component/layout/Dispatcher';
import LoginPage from './pages/login/LoginPage';
import RootPage from './pages/RootPage';
import LoginAuth from './component/auth/LoginAuth';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="*"
          element={
            <LoginAuth>
              <Dispatcher />
            </LoginAuth>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
