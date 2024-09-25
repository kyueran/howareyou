import { Access, history, useAccess, useIntl } from '@umijs/max';
import { Button, Col, Row, Space, Typography } from 'antd';
import React from 'react';

const LinkTree: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const { Title } = Typography;
  const name = access.isVolunteer ? 'Mr Wong Ah Fook' : 'Ms Josephine Lam';

  return (
    <Access accessible={access.isVolunteer || access.isStaff}>
      <Row justify="center" style={{ marginTop: '24px' }}>
        <Col xs={22} sm={20} md={16} lg={12}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <Title level={3}>
              {intl.formatMessage({ id: 'welcome' }, { name: name })}
            </Title>
            {(access.isStaff || access.isVolunteer) && (
              <Button
                type="primary"
                key={'/record-visit'}
                onClick={() => history.push('/record-visit')}
                block
              >
                {intl.formatMessage({ id: 'menu.RecordVisitNoId' })}
              </Button>
            )}
            {access.isStaff && (
              <Button
                type="primary"
                key={'/elderly'}
                onClick={() => history.push('/elderly')}
                block
              >
                {intl.formatMessage({ id: 'menu.ElderlyResidents' })}
              </Button>
            )}
            {(access.isStaff || access.isVolunteer) && (
              <Button
                type="primary"
                key={'/display-visits'}
                onClick={() => history.push('/display-visits')}
                block
              >
                {intl.formatMessage({ id: 'menu.DisplayVisits' })}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </Access>
  );
};

export default LinkTree;
