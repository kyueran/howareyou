import { LeftOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Carousel,
  Descriptions,
  Image,
  Skeleton,
  Space,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { history } from 'umi';

const { Title, Text } = Typography;

interface VisitDetailParams {
  id: string;
}

const VisitDetailPage: React.FC = () => {
  const { id } = useParams<VisitDetailParams>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSeniorById = async (elderlyId: string) => {
    try {
      const response = await fetch(`/api/senior/${elderlyId}`);
      const result = await response.json();
      return result[0].name || 'Unknown';
    } catch (error) {
      console.error('Error fetching senior details:', error);
      return 'Unknown';
    }
  };

  const fetchVisitById = async (visitId: string) => {
    try {
      const response = await fetch(`/api/visits/${visitId}`);
      const result = await response.json();
      if (result) {
        const seniorName = await fetchSeniorById(result.elderly_id);
        setVisit({ ...result, elderly_name: seniorName });
      } else {
        message.error(result.message || 'Failed to fetch visit details.');
      }
    } catch (error) {
      console.error('Error fetching visit details:', error);
      message.error('There was an error fetching the visit details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitById(id);
  }, [id]);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const getVisitorInfo = (visitorId: number) => {
    if (visitorId === 1) {
      return { name: 'Mr Wong Ah Fook', role: 'volunteer' };
    } else if (visitorId === 2) {
      return { name: 'Ms Josephine Lam', role: 'staff' };
    } else {
      return { name: 'Unknown', role: 'unknown' };
    }
  };

  return (
    <PageContainer style={{ padding: '8px' }}>
      <Space
        direction="horizontal"
        style={{ width: '100%', justifyContent: 'flex-start' }}
      >
        <Button
          style={{ marginBottom: '8px' }}
          type="text"
          icon={<LeftOutlined />}
          onClick={() => history.push(`/elderly/${visit.elderly_id}`)}
        >
          Back
        </Button>
        <Title level={3}>Visit Details</Title>
      </Space>

      {loading ? (
        <Skeleton active title paragraph={{ rows: 4 }} />
      ) : visit ? (
        <>
          <Descriptions bordered size="small" style={{ marginBottom: '24px' }}>
            <Descriptions.Item label="Elderly Name">
              {visit.elderly_name}
            </Descriptions.Item>
            <Descriptions.Item label="Relationship">
              {visit.relationship || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Mode of Interaction">
              {visit.mode_of_interaction || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Duration of Contact">
              {visit.duration_of_contact
                ? `${visit.duration_of_contact} minutes`
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {visit.status || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Comments">
              {visit.comments || 'No comments.'}
            </Descriptions.Item>
            <Descriptions.Item label="Visitor">
              {getVisitorInfo(Number(visit.visitor_id)).name} (
              {getVisitorInfo(Number(visit.visitor_id)).role})
            </Descriptions.Item>
            <Descriptions.Item label="Date of Visit">
              {formatDateTime(visit.submission_time)}
            </Descriptions.Item>
          </Descriptions>

          <Title level={4}>Photos</Title>
          {visit.photo_urls && visit.photo_urls.length > 0 ? (
            <Carousel arrows dotPosition="left" infinite={false}>
              {visit.photo_urls.map((url: string, index: number) => (
                <div key={index}>
                  <Image
                    src={url}
                    alt={`Visit Photo ${index + 1}`}
                    style={{
                      maxHeight: '300px',
                      objectFit: 'cover',
                      width: '100%',
                    }}
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <Text type="secondary">No Images</Text>
          )}
        </>
      ) : (
        <Text>No visit details available.</Text>
      )}
    </PageContainer>
  );
};

export default VisitDetailPage;
