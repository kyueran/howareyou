import { LeftOutlined } from '@ant-design/icons';
import { Access, history, useAccess, useIntl } from '@umijs/max';
import { Button, Col, Descriptions, Row, Space } from 'antd';
import React from 'react';

const MyProfile: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <Access accessible={access.isVolunteer || access.isStaff}>
      <Row justify="center" style={{ marginTop: '24px' }}>
        <Col xs={22} sm={20} md={16} lg={12}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <Button
              style={{ marginBottom: '8px' }}
              type="text"
              icon={<LeftOutlined />}
              onClick={() => history.go(-1)}
            >
              {intl.formatMessage({ id: 'backBtn' })}
            </Button>
            <Descriptions
              title={intl.formatMessage({ id: 'menu.MyProfile' })}
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              <Descriptions.Item label={intl.formatMessage({ id: 'fullName' })}>
                {user.full_name}
              </Descriptions.Item>

              <Descriptions.Item
                label={intl.formatMessage({ id: 'postalCode' })}
              >
                {user.postal_code}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage(
                  { id: 'volOrStaffCode' },
                  { role: role },
                )}
              >
                {user.volunteer_or_staff_code}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({ id: 'homeAddress' })}
                span={3}
              >
                {user.home_address}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({ id: 'roleAndOrg' })}
                span={3}
              >
                {user.volunteer_service_role_and_organisation}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </Col>
      </Row>
    </Access>
  );
};

export default MyProfile;
