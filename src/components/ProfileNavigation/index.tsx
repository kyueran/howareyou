import { DownOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import React from 'react';
import { history } from 'umi'; // Assuming you're using umi's history

const ProfileNavigation: React.FC = () => {
  // Accessing the logout function from the global layout (assuming it's exposed)
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    history.push('/login');
  };

  // Handle clicks for profile and logout
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === '0') {
      // Redirect to /my-profile
      history.push('/my-profile');
    } else if (key === '1') {
      // Perform logout
      handleLogout();
    }
  };

  // Define menu items
  const items: MenuProps['items'] = [
    {
      label: 'View My Profile',
      key: '0', // Key for profile redirect
    },
    {
      label: 'Logout',
      key: '1', // Key for logout
    },
  ];

  return (
    <Dropdown
      menu={{ items, onClick: handleMenuClick }} // Wire up handleMenuClick here
      trigger={['click']}
    >
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          <UserOutlined />
          Profile
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};

export default ProfileNavigation;
