import { CaretDownOutlined, GlobalOutlined } from '@ant-design/icons';
import { getLocale, setLocale } from '@umijs/max'; // Adjusted import
import { Dropdown, Menu } from 'antd';
import React from 'react';

const LanguageSelector: React.FC = () => {
  const currentLocale = getLocale();

  const handleMenuClick = (e: { key: string }) => {
    setLocale(e.key, false);
  };

  const languageMap = {
    'en-US': 'English',
    'zh-CN': '中文',
    'ms-MY': 'Melayu',
    'ta-IN': 'தமிழ்',
  };

  const languageMenu = (
    <Menu onClick={handleMenuClick} selectedKeys={[currentLocale]}>
      <Menu.Item key="en-US">{languageMap['en-US']}</Menu.Item>
      <Menu.Item key="zh-CN">{languageMap['zh-CN']}</Menu.Item>
      <Menu.Item key="ms-MY">{languageMap['ms-MY']}</Menu.Item>
      <Menu.Item key="ta-IN">{languageMap['ta-IN']}</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={languageMenu} placement="bottomRight">
      <span
        style={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0 8px',
        }}
      >
        <GlobalOutlined />
        <span style={{ marginLeft: 4 }}>{languageMap[currentLocale]}</span>
        <CaretDownOutlined />
      </span>
    </Dropdown>
  );
};

export default LanguageSelector;
