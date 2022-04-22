import { Select } from 'antd';
import React, { ReactNode } from 'react';

interface IProjectSelectProps {
  maxTagCount: number;
  placeholder: string;
  selectedOptionList: number[];
  setSelectedOptionList: (newList: number[]) => void;
  options: { label: ReactNode; value: string | number }[];
}

export default function ProjectSelect(props: IProjectSelectProps) {
  const { maxTagCount, placeholder, selectedOptionList, setSelectedOptionList, options } = props;
  return (
    <Select
      showArrow
      allowClear
      placeholder={placeholder}
      value={selectedOptionList}
      style={{ width: 130 }}
      onChange={(value: number[]) => setSelectedOptionList(value)}
      maxTagCount={maxTagCount}
      options={options}
    />
  );
}
