import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Card,
  Carousel,
  Col,
  Divider,
  Image,
  Modal,
  Row,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useState } from 'react';
import { VisitInfo } from '../../pages/ElderlyResidents';

const { Text, Title } = Typography;

interface ElderlyInfo {
  photo_url: string;
  name: string;
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
  const [visitorLoading, setVisitorLoading] = useState(false)
  const [elderlyLoading, setElderlyLoading] = useState(false)
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
      setVisitorLoading(true)
      try {
        const response = await fetch(`/api/vas/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setVisitorName(data.full_name);
        setVisitorRoleAndOrg(
          data.volunteer_service_role_and_organisation || '',
        );
      } catch (error) {
        console.error(error);
      } finally {
        setVisitorLoading(false)
      }
    };

    if (visit.visitor_id) {
      fetchVisitorInfo(visit.visitor_id);
    }
  }, [visit.visitor_id]);

  // Fetch elderly info using visit.elderly_id
  useEffect(() => {
    const fetchElderlyInfo = async (id: string) => {
      setElderlyLoading(true)
      try {
        const response = await fetch(`/api/senior/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch elderly data');
        }
        let data = await response.json();
        data = data[0];
        setElderly(data);
      } catch (error) {
        console.error(error);
      } finally {
        setElderlyLoading(false)
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
            borderBottom: '1px solid #e8e8e8', // Bottom border to separate from the form
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
            <Title level={5} style={{ marginTop: '20px', marginBottom: '0px' }}>
              Posted by:
            </Title>
            <Card bodyStyle={{ padding: 8 }}>
              <Space.Compact direction='vertical'>
              {/* Conditionally display Visitor Name and Role for staff only */}
              {userRole === 'staff' && (
                <Space align="center">
                  <UserOutlined />
                  <Text>
                    {visitorName}{' '}
                    <Text strong style={{ color: 'purple' }}>
                      {visitorRoleAndOrg}
                    </Text>
                  </Text>
                </Space>
              )}

              <Space align="center">
                <EnvironmentOutlined />
                <Text>{visit.mode_of_interaction ?? 'Unknown'}</Text>
              </Space>

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
            </Space.Compact>
            </Card>

            <Title level={5} style={{ marginTop: '20px', marginBottom: 8 }}>
              Elderly visited:
            </Title>

            <Card bodyStyle={{ padding: 8 }}>
              {elderlyLoading ?
              <Skeleton avatar />
              :
              <Space direction="horizontal">
                <Image
                  width={96}
                  height={96}
                  src={elderly?.photo_url}
                  alt={`Photo ${elderly?.name}`}
                />
                <Space.Compact direction="vertical">
                  <Space align="center">
                    <UserOutlined />
                    <Text>{elderly?.name}</Text>
                  </Space>

                  <Space align="center">
                    <EnvironmentOutlined />
                    <Text>
                      {elderly?.block} {elderly?.floor}-{elderly?.unit_number},{' '}
                      {elderly?.address}
                    </Text>
                  </Space>

                  <Space align="center">
                    <Text strong>Elderly Code: </Text>
                    <Text>{elderly?.elderly_code}</Text>
                  </Space>

                  <Space align="center">
                    <Text strong>AAC Code: </Text>
                    <Text>{elderly?.aac_code}</Text>
                  </Space>
                </Space.Compact>
              </Space>
      }
            </Card>

            {/* Resident Status Heading */}
            <Title level={5} style={{ marginTop: '20px', marginBottom: '0px' }}>
              How is the resident doing?
            </Title>

            {/* Visit Status */}
            <Card bodyStyle={{ padding: 8 }}>
              <Space align="center">
                {visit.status === 'Not Good' && (
                  <>
                    <ExclamationCircleOutlined
                      style={{ color: 'red', fontSize: '14px' }}
                    />
                    <Text strong style={{ color: 'red', fontSize: '14px' }}>
                      Not Good
                    </Text>
                  </>
                )}
                {visit.status === 'Good' && (
                  <>
                    <ExclamationCircleOutlined
                      style={{ color: 'green', fontSize: '14px' }}
                    />
                    <Text strong style={{ color: 'green', fontSize: '14px' }}>
                      Good
                    </Text>
                  </>
                )}
                {visit.status === 'Not Around' && (
                  <>
                    <ExclamationCircleOutlined
                      style={{ color: 'orange', fontSize: '14px' }}
                    />
                    <Text strong style={{ color: 'orange', fontSize: '14px' }}>
                      Not Around
                    </Text>
                  </>
                )}
              </Space>
            </Card>

            {/* Comments Section */}
            <Title level={5} style={{ marginTop: '20px', marginBottom: '0px' }}>
              Comments
            </Title>
            <Card bodyStyle={{ padding: 8 }}>
              <Text>{visit.comments || 'No comments available.'}</Text>
            </Card>

            {/* Photos Section with Carousel */}
            <Title level={5} style={{ marginTop: '20px', marginBottom: '0px' }}>
              Photos
            </Title>
            <Card bodyStyle={{ padding: 8 }}>
              {visit.photo_urls && visit.photo_urls.length > 0 ? (
                <Carousel autoplay>
                  {visit.photo_urls.map((url, index) => (
                    <div key={index}>
                      <Image src={url} alt={`Photo ${index + 1}`} />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <Text>No photos taken.</Text>
              )}
            </Card>

            {/* Conditionally display Duration of Visit for staff only */}
            {userRole === 'staff' && (
              <>
                <Title
                  level={5}
                  style={{ marginTop: '20px', marginBottom: '0px' }}
                >
                  Duration of visit
                </Title>
                <Card bodyStyle={{ padding: 8 }}>
                  <Text>
                    {visit.duration_of_contact
                      ? `${visit.duration_of_contact} mins`
                      : 'Unknown'}
                  </Text>
                </Card>
              </>
            )}

            {/* Conditionally display Key Concerns for staff only */}
            {userRole === 'staff' && (
              <>
                <Title
                  level={5}
                  style={{ marginTop: '20px', marginBottom: '0px' }}
                >
                  Key Concerns
                </Title>
                <Card bodyStyle={{ padding: 8 }}>
                  <Text>{visit.key_concerns || 'No key concerns.'}</Text>
                </Card>
              </>
            )}

            {userRole === 'volunteer' && (
              <>
                <Title
                  level={5}
                  style={{ marginTop: '20px', marginBottom: '0px' }}
                >
                  Relationship with Resident
                </Title>
                <Card bodyStyle={{ padding: 8 }}>
                  <Text>{visit.relationship || 'Not specified.'}</Text>
                </Card>
              </>
            )}
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};

export default VisitModal;
