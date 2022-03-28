import React from 'react';
import { Route, Routes } from 'react-router';

import CustomLayout from './CustomLayout';
import HomePage from '../pages/home/HomePage';
import UserPage from '../pages/user/UserPage';
import ProjectPage from '../pages/project/ProjectPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function Dispatcher() {
  return (
    <CustomLayout>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/project" element={<ProjectPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </CustomLayout>
  );
}
