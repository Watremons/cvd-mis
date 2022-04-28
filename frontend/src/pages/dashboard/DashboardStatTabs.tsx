import React, { useEffect, useState } from 'react';
import { Col, Card, Skeleton, message, Tabs } from 'antd';

import { fetchUserStat } from '../../utils/api/api';
import { Column } from '@ant-design/plots';

const { TabPane } = Tabs;
interface IDashboardStatTabsProps {
  loading: boolean;
}

interface UserStatData {
  date: string;
  userCount: number;
}

export default function DashboardStatTabs(props: IDashboardStatTabsProps) {
  const { loading } = props;
  const [userStatData, setUserStatData] = useState<UserStatData[]>([]);

  useEffect(() => {
    fetchUserStat()
      .then(({ data: res }) => {
        if (res.status === 200) {
          setUserStatData(res.data);
        } else {
          throw Error(`Get User Stat Data Error: ${res.message}`);
        }
      })
      .catch(error => {
        message.error('获取用户注册统计信息失败，请检查console');
        console.error(error);
      });
  }, []);

  return (
    <Col span={24}>
      <Skeleton active loading={loading}>
        <Card>
          <Tabs defaultActiveKey="user-register-stat" tabBarStyle={{ marginBottom: 32 }}>
            <TabPane tab="用户注册" key="user-register-stat">
              <Column
                data={userStatData}
                xField="date"
                yField="userCount"
                legend={{
                  position: 'bottom'
                }}
                tooltip={{
                  // showTitle: false,
                  fields: ['date', 'userCount']
                  // formatter: (datum: Datum) => ({ name: `坐标: (${datum.x},${datum.y})`, value: `${datum.value}次` })
                }}
                meta={{
                  date: {
                    alias: '时间段'
                  },
                  userCount: {
                    alias: '新增注册用户数'
                  }
                }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </Skeleton>
    </Col>
  );
}

{
  /* <Tabs defaultActiveKey="1" onChange={callback}>
<TabPane tab="Tab 1" key="1">
  Content of Tab Pane 1
</TabPane>
</Tabs> */
}
