import { Select } from 'antd';
import React from 'react';
import { getLocale, setLocale } from 'umi';

const { Option } = Select;

const LanguageSelector: React.FC = () => {
  const currentLocale = getLocale();

  const handleChange = (value: string) => {
    setLocale(value, false); // 'false' to avoid full page reload
  };

  return (
    <Select
      value={currentLocale}
      onChange={handleChange}
      style={{ width: 120 }}
    >
      <Option value="en-US">English</Option>
      <Option value="zh-CN">中文</Option>
      <Option value="ms-MY">Bahasa Melayu</Option>
      <Option value="ta-IN">தமிழ்</Option>
    </Select>
  );
};

export default LanguageSelector;
