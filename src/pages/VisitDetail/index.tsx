import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate replaces useHistory
import { Typography, Button, Image, Space, message, Descriptions, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface VisitDetailParams {
  id: string;
}

const VisitDetailPage: React.FC = () => {
  const { id } = useParams<VisitDetailParams>();
  const navigate = useNavigate(); // Replaces useHistory
  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch visit data by ID
  const fetchSeniorById = async (elderlyId: string) => {
    try {
      const response = await fetch(`/api/senior/${elderlyId}`);
      const result = await response.json();
      return result[0].name || 'Unknown';  // Assuming API returns { name: 'John Doe' }
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
        const seniorName = await fetchSeniorById(result.elderly_id); // Fetch senior's name
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
    <div style={{ padding: '24px' }}>
      <Button type="link" onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
        <ArrowLeftOutlined /> Back
      </Button>
      {loading ? (
        <Spin size="large" />
      ) : visit ? (
        <>
          <Title level={3}>Visit Details</Title>
          <Descriptions bordered column={1} style={{ marginBottom: '24px' }}>
            <Descriptions.Item label="Elderly Name">{visit.elderly_name}</Descriptions.Item>
            <Descriptions.Item label="Relationship">
              {visit.relationship || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Mode of Interaction">
              {visit.mode_of_interaction || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Duration of Contact">
              {visit.duration_of_contact ? `${visit.duration_of_contact} minutes` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">{visit.status || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Comments">{visit.comments || 'No comments.'}</Descriptions.Item>
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
            <Image.PreviewGroup>
              <Space size="middle" wrap>
                {visit.photo_urls.map((url: string, index: number) => (
                  <Image
                    key={index}
                    src={url}
                    alt={`Visit Photo ${index + 1}`}
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          ) : (
            <Typography.Text>No Images</Typography.Text>
          )}
        </>
      ) : (
        <Typography.Text>No visit details available.</Typography.Text>
      )}
    </div>
  );
};

export default VisitDetailPage;
