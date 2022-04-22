import React, { useState } from 'react';

import { Button, Empty } from 'antd';
import { DotChartOutlined } from '@ant-design/icons';
import HeatmapModal from '../../component/HeatmapModal';

interface IProjectHeatmapProps {
  projectResultPointList?: Entity.Point[];
  projectThumbUrl?: string;
}

export default function ProjectHeatmap(props: IProjectHeatmapProps) {
  const { projectResultPointList, projectThumbUrl } = props;
  const [heatmapModalVisible, setHeatmapModalVisible] = useState<boolean>(false);

  return (
    <>
      <Button type="primary" onClick={() => setHeatmapModalVisible(true)} icon={<DotChartOutlined />}>
        展示热力图
      </Button>
      {projectResultPointList && projectThumbUrl ? (
        <HeatmapModal
          visible={heatmapModalVisible}
          onClose={() => setHeatmapModalVisible(false)}
          heatmapData={projectResultPointList}
          heatmapBackground={projectThumbUrl}
        />
      ) : (
        <Empty />
      )}
    </>
  );
}
