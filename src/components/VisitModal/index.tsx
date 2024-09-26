import {
  BellOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Carousel, Col, Image, Modal, Row, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useState } from 'react';
import { VisitInfo } from '../../pages/Home';

const { Text, Title } = Typography;

interface ElderlyInfo {
  block: string;
  floor: string;
  unit_number: string;
  address: string;
}

interface VisitModalProps {
  visit: VisitInfo;
  isVisible: boolean;
  onClose: () => void;
}

const VisitModal: React.FC<VisitModalProps> = ({
  visit,
  isVisible,
  onClose,
}) => {
  const [visitorName, setVisitorName] = useState<string>('Unknown Visitor');
  const [visitorRoleAndOrg, setVisitorRoleAndOrg] = useState<string>(''); // State for role and organization
  const [userRole, setUserRole] = useState<string>(''); // State for user role
  const [elderly, setElderly] = useState<ElderlyInfo | null>(null); // State for elderly info

  useEffect(() => {
    // Retrieve userRole from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserRole(parsedUser.role || ''); // Save user role (either 'staff' or 'volunteer')
    }
  }, []);

  useEffect(() => {
    const fetchVisitorInfo = async (id: string) => {
      try {
        const response = await fetch(`/api/vas/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setVisitorName(data.full_name);
        setVisitorRoleAndOrg(data.volunteer_service_role_and_organisation || '');
      } catch (error) {
        console.error(error);
      }
    };

    if (visit.visitor_id) {
      fetchVisitorInfo(visit.visitor_id);
    }
  }, [visit.visitor_id]);

  // Fetch elderly info using visit.elderly_id
  useEffect(() => {
    const fetchElderlyInfo = async (id: string) => {
      try {
        const response = await fetch(`/api/senior/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch elderly data');
        }
        let data = await response.json();
        data = data[0];
        setElderly({
          block: data.block,
          floor: data.floor,
          unit_number: data.unit_number,
          address: data.address,
        });
      } catch (error) {
        console.error(error);
      }
    };

    if (visit.elderly_id) {
      fetchElderlyInfo(visit.elderly_id);
    }
  }, [visit.elderly_id]);
  
  dayjs.extend(relativeTime);

  return (
    <Modal
      title={
        <div
          style={{
            fontSize: '24px', // Larger font size
            fontWeight: 'bold', // Bold text
            padding: '6px', // Padding around the title
            backgroundColor: '#f0f0f0', // Background color to distinguish
            borderBottom: '2px solid #e8e8e8', // Bottom border to separate from the form
            textAlign: 'center', // Center align the title
          }}
        >
          Visit Details
        </div>
      }
      visible={isVisible}
      onCancel={onClose}
      footer={null}
      width="100%" // Make the modal full width
      style={{ top: 0, height: '100%', padding: 0 }} // Position it at the top and make it full height
      centered={false} // Disable centering since it's fullscreen
    >
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col>
          <Space direction="vertical" size={0}>
            {/* Conditionally display Visitor Name and Role for staff only */}
            {userRole === 'staff' && (
              <Space align="center">
                <UserOutlined />
                <Text>
                  {visitorName}{' '}
                  <Text strong style={{ color: 'purple' }}>{visitorRoleAndOrg}</Text>
                </Text>
              </Space>
            )}

            {/* Mode of Interaction / Location - Now showing elderly's address */}
            <Space align="center">
              <EnvironmentOutlined />
                <Text>
                  {elderly?.block} {elderly?.floor}-{elderly?.unit_number}, {elderly?.address}
                </Text>
            </Space>

            {/* Submission Time */}
            <Space align="center">
              <ClockCircleOutlined />
              <Text>
                {visit.submission_time
                  ? dayjs(visit.submission_time).format('D MMM YYYY, h:mmA')
                  : 'Unknown Time'}{' '}
                (
                <Text strong>
                  {visit.submission_time
                    ? `${dayjs().to(dayjs(visit.submission_time))}`
                    : 'None'}
                </Text>
                )
              </Text>
            </Space>

            {/* Resident Status Heading */}
            <Title level={5} style={{ marginTop: '20px', marginBottom: '0px' }}>
              How is the resident doing?
            </Title>

            {/* Visit Status */}
            <Space align="center">
              {visit.status === 'Not Good' && (
                <>
                  <ExclamationCircleOutlined style={{ color: 'red', fontSize: '14px' }} />
                  <Text strong style={{ color: 'red', fontSize: '14px' }}>
                    Not Good
                  </Text>
                </>
              )}
              {visit.status === 'Good' && (
                <>
                  <ExclamationCircleOutlined style={{ color: 'green', fontSize: '14px' }} />
                  <Text strong style={{ color: 'green', fontSize: '14px' }}>
                    Good
                  </Text>
                </>
              )}
              {visit.status === 'Not Around' && (
                <>
                  <ExclamationCircleOutlined style={{ color: 'orange', fontSize: '14px' }} />
                  <Text strong style={{ color: 'orange', fontSize: '14px' }}>
                    Not Around
                  </Text>
                </>
              )}
            </Space>

            {/* Comments Section */}
            <Title level={5} style={{ marginTop: '20px', marginBottom: '0px' }}>
              Comments
            </Title>
            <Text>{visit.comments || 'No comments available.'}</Text>

            {/* Photos Section with Carousel */}
            <Title level={5} style={{ marginTop: '20px', marginBottom: '0px' }}>
              Photos
            </Title>
            {visit.photo_urls && visit.photo_urls.length > 0 ? (
              <Carousel autoplay>
                {visit.photo_urls.map((url, index) => (
                  <div key={index}>
                    <Image src={url} alt={`Photo ${index + 1}`} />
                  </div>
                ))}
              </Carousel>
            ) : (
              <Text>No photos available.</Text>
            )}

            {/* Conditionally display Duration of Visit for staff only */}
            {userRole === 'staff' && (
              <>
                <Title level={5} style={{ marginTop: '20px', marginBottom: '0px' }}>
                  Duration of visit
                </Title>
                <Text>{visit.duration_of_contact ? `${visit.duration_of_contact} mins` : 'Unknown'}</Text>
              </>
            )}

            {/* Conditionally display Key Concerns for staff only */}
            {userRole === 'staff' && (
              <>
                <Title level={5} style={{ marginTop: '20px', marginBottom: '0px' }}>
                  Key Concerns
                </Title>
                <Text>{visit.key_concerns || 'No key concerns.'}</Text>
              </>
            )}

            {userRole === 'volunteer' && (
              <>
                <Title level={5} style={{ marginTop: '20px', marginBottom: '0px' }}>
                  Relationship with Resident
                </Title>
                <Text>{visit.relationship || 'Not specified.'}</Text>
              </>
            )}
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};

export default VisitModal;
