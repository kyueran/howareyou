import { purple } from '@ant-design/colors';
import { HomeOutlined } from '@ant-design/icons';
import { history, useAccess, useIntl } from '@umijs/max';
import { Col, Layout, Row, Typography } from 'antd';
import React from 'react';
import ProfileNavigation from '../ProfileNavigation';

const { Header } = Layout;
const { Title, Text } = Typography;

const CustomNavbar: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  let id = 'menu.LinkTree.';
  id += access.isVolunteer ? 'Volunteer' : 'Staff';
  const navbarTitle = intl.formatMessage({ id: id });

  // Handle logo click
  const handleLogoClick = () => {
    history.push('/home');
  };

  return (
    <div
      style={{
        background: purple[4],
        padding: '0 16px',
        boxShadow: '0 2px 8px rgb(150 150 150)',
      }}
    >
      <Row align="middle" justify="space-between">
        <Col xs={4}>
          <div
            onClick={handleLogoClick}
            style={{ cursor: 'pointer', color: 'white', fontSize: '20px' }}
          >
            <HomeOutlined />
          </div>
        </Col>
        <Col xs={12} sm={16} style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: 'white' }}>
            {navbarTitle}
          </Title>
        </Col>
        <Col xs={4} style={{ textAlign: 'right', fontSize: '18px' }}>
          <ProfileNavigation />
        </Col>
      </Row>
    </div>
  );
};

export default CustomNavbar;
