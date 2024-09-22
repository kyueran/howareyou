import { history, useAccess, useAppData, useIntl } from '@umijs/max';
import { Button, Col, Row, Space, Typography } from 'antd';
import React from 'react';

const LinkTree: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const appData = useAppData();
  const routesArray = Object.values(appData.routes);
  const { Title } = Typography;
  const name = access.isVolunteer ? 'Mr Wong Ah Fook' : 'Ms Josephine Lam';

  const checkAccess = (routeAccess: string | string[]) => {
    const accessRights = access.isVolunteer ? 'isVolunteer' : 'isStaff';
    if (typeof routeAccess === 'string') {
      return routeAccess === accessRights;
    } else {
      return routeAccess.includes(accessRights);
    }
  };

  return (
    <Row justify="center" style={{ marginTop: '24px' }}>
      <Col xs={22} sm={20} md={16} lg={12}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Title level={3}>
            {intl.formatMessage({ id: 'welcome' }, { name: name })}
          </Title>
          {routesArray.map((route) => {
            if (
              route.layout &&
              route.name !== 'Home' &&
              route.name !== 'menu.LinkTree' &&
              route.name !== 'menu.Login' &&
              checkAccess(route.access)
            ) {
              return (
                <Button
                  type="primary"
                  key={route.path}
                  onClick={() => history.push(route.path)}
                  block
                >
                  {intl.formatMessage({ id: route.name })}
                </Button>
              );
            }
          })}
        </Space>
      </Col>
    </Row>
  );
};

export default LinkTree;
