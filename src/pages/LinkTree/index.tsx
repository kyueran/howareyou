import { Access, history, useAccess, useIntl } from '@umijs/max';
import { Button, Col, Row, Space, Typography } from 'antd';
import React from 'react';
import LanguageSelector from '../../components/LanguageSelector';

const LinkTree: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const { Title, Text } = Typography;
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Access accessible={access.isVolunteer || access.isStaff}>
      <Row justify="center" style={{ marginTop: '24px' }}>
        <Col xs={22} sm={20} md={16} lg={12}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ margin: '0px' }}>
                {user.full_name}
              </Title>
              <Title level={5} style={{ margin: '0px' }}>
                {user.volunteer_service_role_and_organisation}
              </Title>
            </div>
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
                {intl.formatMessage({
                  id: access.isStaff
                    ? 'menu.DisplayVisits.Staff'
                    : 'menu.DisplayVisits.Volunteer',
                })}
              </Button>
            )}
            <LanguageSelector />
          </Space>
        </Col>
      </Row>
    </Access>
  );
};

export default LinkTree;
