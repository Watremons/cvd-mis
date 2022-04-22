import React from 'react';
import { Route, Routes } from 'react-router-dom';
import RoleAuth from '../../component/auth/RoleAuth';
import NotFoundPage from '../error/NotFoundPage';
import UserManage from './UserManage';
import UserSetting from './UserSetting';

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="user-setting" element={<UserSetting />} />
      <Route
        path="user-manage"
        element={
          <RoleAuth>
            <UserManage />
          </RoleAuth>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
