import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

const CustomFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const defaultMessage = 'HNU毕业设计';
  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/Watremons/cvd-mis',
          blankTarget: true
        }
      ]}
    />
  );
};

export default CustomFooter;
