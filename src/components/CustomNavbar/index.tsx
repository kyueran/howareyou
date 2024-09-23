import { HomeOutlined } from '@ant-design/icons';
import { history, useAccess, useIntl } from '@umijs/max';
import { Col, Layout, Row, Typography } from 'antd';
import React from 'react';
import LanguageSelector from '../LanguageSelector';

const { Header } = Layout;
const { Title } = Typography;

const CustomNavbar: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  let id = 'menu.LinkTree.';
  id += access.isVolunteer ? 'Volunteer' : 'Staff';
  const navbarTitle = intl.formatMessage({ id: id });

  // Handle logo click
  const handleLogoClick = () => {
    history.push('/');
  };

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 16px',
        boxShadow: '0 2px 8px #f0f1f2',
      }}
    >
      <Row align="middle" justify="space-between">
        <Col xs={4} sm={4}>
          <div onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <HomeOutlined />
          </div>
        </Col>
        <Col xs={12} sm={16} style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            {navbarTitle}
          </Title>
        </Col>
        <Col xs={8} sm={4} style={{ textAlign: 'right' }}>
          <LanguageSelector />
        </Col>
      </Row>
    </Header>
  );
};

export default CustomNavbar;
