import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Space, Typography, message } from 'antd';
import { useAccess } from '@umijs/max';

const { Text, Title } = Typography;

const DisplayVisitsPage: React.FC = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const access = useAccess(); // To get access control info

  // Fetch visits from the API
  const fetchVisits = async () => {
    try {
      const response = await fetch('/api/fetchVisits');
      const result = await response.json();
      if (result.success) {
        setVisits(result.data);
      } else {
        message.error(result.message || 'Failed to fetch visits.');
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
      message.error('There was an error fetching the visits.');
    } finally {
      setLoading(false);
    }
  };

  // Use this function to get visitor's name and role based on access and visitor_id
  const getVisitorInfo = (visitorId: number) => {
    if (visitorId === 1) {
      return { name: 'Volunteer-1', role: 'volunteer'};
    } else if (visitorId === 2) {
      return { name: 'Staff-1', role: 'staff' };
    } else {
      return { name: 'Unknown', role: 'unknown' };
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <Row justify="center" style={{ marginTop: '24px' }}>
      <Col xs={22} sm={20} md={16} lg={12}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Title level={3} style={{ marginBottom: '0px' }}>
            Visit Logs
          </Title>
          {visits.length === 0 && !loading ? (
            <Text>No visits found.</Text>
          ) : (
            visits.map((visit) => {
              const visitorInfo = getVisitorInfo(visit.visitor_id);
              return (
                <Card key={visit.id} style={{ width: '100%' }} loading={loading}>
                  <Row gutter={16} align="middle">
                    <Col xs={8} sm={6} md={6} lg={5}>
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          paddingBottom: '100%', // 1:1 aspect ratio
                          overflow: 'hidden',
                          borderRadius: '8px',
                          backgroundColor: '#f0f0f0',
                        }}
                      >
                        {visit.photo_base64 ? (
                          <img
                            src={visit.photo_base64}
                            alt="Visit"
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              transform: 'translate(-50%, -50%)',
                            }}
                          />
                        ) : (
                          <div style={{ textAlign: 'center', paddingTop: '50%' }}>
                            No Image
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col xs={16} sm={18} md={18} lg={19}>
                      <div>
                        <Text strong style={{ fontSize: '16px' }}>
                          {visit.comments || 'No comments.'}
                        </Text>
                        <br />
                        <Text type="secondary">
                          <span role="img" aria-label="visitor">
                            👤
                          </span>{' '}
                          {visitorInfo.name}, {visitorInfo.role}
                        </Text>
                        <br />
                        <Text type="secondary">
                          <span role="img" aria-label="date">
                            📅
                          </span>{' '}
                          {formatDateTime(visit.visit_time)} (
                          {Math.floor((Date.now() - new Date(visit.visit_time).getTime()) / (1000 * 60 * 60 * 24))}{' '}
                          days ago)
                        </Text>
                        <br />
                        <Text type="secondary">
                          <span role="img" aria-label="location">
                            📍
                          </span>{' '}
                          {visit.location || 'Location not available'}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              );
            })
          )}
        </Space>
      </Col>
    </Row>
  );
};

export default DisplayVisitsPage;
