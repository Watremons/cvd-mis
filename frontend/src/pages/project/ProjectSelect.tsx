import { Select } from 'antd';
import React, { ReactNode } from 'react';

interface IProjectSelectProps {
  maxTagCount: number;
  placeholder: string;
  selectedOptionList: number[];
  setSelectedOptionList: (newList: number[]) => void;
  options: { label: ReactNode; value: string | number }[];
  style?: React.CSSProperties;
  loading?: boolean;
}

export default function ProjectSelect(props: IProjectSelectProps) {
  const { maxTagCount, placeholder, selectedOptionList, setSelectedOptionList, options, style, loading } = props;
  return (
    <Select
      loading={loading ?? false}
      showArrow
      allowClear
      placeholder={placeholder}
      value={selectedOptionList}
      style={style}
      onChange={(value: number[]) => setSelectedOptionList(value)}
      maxTagCount={maxTagCount}
      options={options}
    />
  );
}
