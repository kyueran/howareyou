import {
  BellOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Carousel, Col, Image, Modal, Row, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { VisitInfo } from '../../pages/Home';

const { Text, Title } = Typography;

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
  return (
    <Modal
      title="Visit Details"
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
            {/* Visitor Relationship */}
            <Space align="center">
              <UserOutlined />
              <Text strong>{visit.relationship || 'None'}</Text>
            </Space>

            {/* Mode of Interaction */}
            <Space align="center">
              <EnvironmentOutlined />
              <Text>{visit.mode_of_interaction || 'None'}</Text>
            </Space>

            {/* Submission Time */}
            <Space align="center">
              <ClockCircleOutlined />
              <Text>
                {visit.submission_time
                  ? dayjs(visit.submission_time).format('D MMM YYYY, h:mmA')
                  : 'None'}{' '}
                (
                <Text strong>
                  {visit.submission_time
                    ? `${dayjs().diff(
                        dayjs(visit.submission_time).startOf('day'),
                        'day',
                      )} days ago`
                    : 'None'}
                </Text>
                )
              </Text>
            </Space>

            {/* Visit Status */}
            <Space align="center">
              <ExclamationCircleOutlined />
              <Text strong style={{ color: visit.status ? 'green' : 'gray' }}>
                {visit.status || 'None'}
              </Text>
            </Space>

            {/* Comments */}
            <Space align="center">
              <BellOutlined />
              <Text>{visit.key_concerns || 'None'}</Text>
            </Space>

            {/* Duration of Visit */}
            <Space align="center">
              <ClockCircleOutlined />
              <Text>
                Duration:{' '}
                {visit.duration_of_contact
                  ? `${visit.duration_of_contact} minutes`
                  : 'None'}
              </Text>
            </Space>

            {/* Key Concerns */}
            <Space align="center">
              <InfoCircleOutlined />
              <Text strong>{visit.comments || 'None'}</Text>
            </Space>
          </Space>
        </Col>
      </Row>

      {/* Photos Section with Carousel */}
      {visit.photo_urls && visit.photo_urls.length > 0 ? (
        <div style={{ marginTop: '24px' }}>
          <Title level={5}>Photos</Title>
          <Carousel autoplay>
            {visit.photo_urls.map((url, index) => (
              <div key={index}>
                <Image src={url} alt={`Photo ${index + 1}`} />
              </div>
            ))}
          </Carousel>
        </div>
      ) : (
        <div style={{ marginTop: '24px' }}>
          <Title level={4}>Photos</Title>
          <Text>None</Text>
        </div>
      )}
    </Modal>
  );
};

export default VisitModal;
