import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NotFoundPage from '../error/NotFoundPage';
import ProjectCreate from './ProjectCreate';
import ProjectManage from './ProjectManage';

export default function ProjectRoutes() {
  return (
    <Routes>
      <Route path="/project-create" element={<ProjectCreate />} />
      <Route path="/project-manage" element={<ProjectManage />} />
      <Route path="/*" element={<NotFoundPage />} />
    </Routes>
  );
}
