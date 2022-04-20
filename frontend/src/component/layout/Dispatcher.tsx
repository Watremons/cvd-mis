import React from 'react';
import { Route, Routes } from 'react-router';

import CustomLayout from './CustomLayout';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import UserRoutes from '../../pages/user/UserRoutes';
import ProjectRoutes from '../../pages/project/ProjectRoutes';
import NotFoundPage from '../../pages/NotFoundPage';

export default function Dispatcher() {
  return (
    <CustomLayout>
      <Routes>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="user/*" element={<UserRoutes />} />
        <Route path="project/*" element={<ProjectRoutes />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </CustomLayout>
  );
}
