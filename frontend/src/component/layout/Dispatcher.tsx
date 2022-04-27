import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';

import CustomLayout from './CustomLayout';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import UserRoutes from '../../pages/user/UserRoutes';
import ProjectRoutes from '../../pages/project/ProjectRoutes';
import NotFoundPage from '../../pages/error/NotFoundPage';
import { useAppDispatch } from '../../redux/hook';
import { fetchNowUser } from '../../utils/api/api';
import { changeUser } from '../../redux/reducers/user';
import { defaultUser } from '../../pages/user/constant';
import { message } from 'antd';

export default function Dispatcher() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    fetchNowUser()
      .then(({ data }) => {
        if (data.status === 200) {
          console.log('用户验证通过，当前用户为：', data.data);
          dispatch(changeUser({ ...data.data }));
        } else {
          dispatch(changeUser({ ...defaultUser, uid: -1 }));
          throw Error(`Get Now User Info Error: ${data.message}`);
        }
      })
      .catch(error => {
        message.error(`获取登录用户信息失败:${error}`);
        console.error(error);
      });
  }, []);

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
