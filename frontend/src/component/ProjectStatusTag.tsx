import React from 'react';
import { Tag } from 'antd';
import { ClockCircleTwoTone, RightCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';

export default function ProjectStatusTag(props: { projectStatus: number }) {
  const { projectStatus } = props;
  switch (projectStatus) {
    case 0:
      return (
        <Tag color="blue" icon={<ClockCircleTwoTone twoToneColor="blue" />}>
          待进行
        </Tag>
      );
    case 1:
      return (
        <Tag color="#faad14" icon={<RightCircleTwoTone twoToneColor="#faad14" />}>
          进行中
        </Tag>
      );
    case 2:
      return (
        <Tag color="green" icon={<CheckCircleTwoTone twoToneColor="green" />}>
          已完成
        </Tag>
      );
    default:
      return (
        <Tag color="red" icon={<CloseCircleTwoTone twoToneColor="red" />}>
          状态错误: {projectStatus}
        </Tag>
      );
  }
}
