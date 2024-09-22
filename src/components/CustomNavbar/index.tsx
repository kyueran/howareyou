import { AntDesignOutlined } from '@ant-design/icons';
import { history, useAccess, useAppData, useIntl } from '@umijs/max';
import { Col, Layout, Row, Typography } from 'antd';
import React from 'react';
import LanguageSelector from '../LanguageSelector';

const { Header } = Layout;
const { Title } = Typography;

const CustomNavbar: React.FC = () => {
  const intl = useIntl();
  const appData = useAppData();

  // Handle logo click
  const handleLogoClick = () => {
    history.push('/');
  };

  const pathToRegex = (path: string) => {
    const regex = path.replace(/:[^\s/]+/g, '([^/]+)'); // Replace ":id" with "([^/]+)"
    return new RegExp(`^${regex}$`); // Ensure it matches the full path
  };

  // Function to find the current route name (handles both static and dynamic routes)
  const getRouteName = () => {
    const currentPath = appData.history.location.pathname;
    const routesArray = Object.values(appData.routes); // Convert routes object to array

    // Loop through the routes and match both static and dynamic routes
    for (const route of routesArray) {
      // Check for exact match for static routes
      if (route.path === currentPath) {
        return route.name;
      }

      // Check for dynamic route match using regex
      if (route.path.includes(':')) {
        const regex = pathToRegex(route.path);
        if (regex.test(currentPath)) {
          return route.name;
        }
      }
    }

    // If no match is found
    return 'Route not found';
  };

  const getPageTitle = () => {
    const routeName = getRouteName();
    let id = routeName;
    if (routeName == 'menu.LinkTree') {
      const access = useAccess();
      id = access.isVolunteer ? routeName + '.Volunteer' : routeName + '.Staff';
    }
    return intl.formatMessage({ id: id });
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
            <AntDesignOutlined />
          </div>
        </Col>
        <Col xs={12} sm={16} style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            {getPageTitle()}
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
