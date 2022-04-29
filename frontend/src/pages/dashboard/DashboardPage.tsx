import React, { useEffect, useState } from 'react';
import IntroductionRow from './IntroductionRow';

import { Row } from 'antd';
import DashboardStatTabs from './DashboardStatTabs';
import { useAppSelector } from '../../redux/hook';
import './DashboardPage.less';

export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);

  const nowUserInfo = useAppSelector(state => state.userReducer);
  useEffect(() => {
    if (nowUserInfo.uid > 0) {
      setLoading(false);
    }
  }, [nowUserInfo]);

  return (
    <>
      <Row gutter={[16, { xs: 8, sm: 16, md: 16, lg: 24 }]}>
        <IntroductionRow userInfo={nowUserInfo} loading={loading} />
        {nowUserInfo.authority === 1 ? <DashboardStatTabs loading={loading} /> : null}
      </Row>
    </>
  );
}
