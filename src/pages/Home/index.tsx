import { CopyOutlined, EnvironmentOutlined, RightOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';
import { Avatar, Button, Card, Col, List, message, Row, Skeleton, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;

dayjs.extend(advancedFormat);

const dateformat = 'D MMM YYYY, hA';

export type ElderlyInfo = {
  id: number;
  elderlyCode: string;
  aacCode: string;
  name: string;
  contactDetails: string;
  nok: NokInfo[];
  block: string;
  floor: string;
  unitNumber: string;
  address: string;
  postalCode: string;
  notes: string;
  keyAttachments: string[];
  noOfDaysLivingAlone: number;
  adlDifficulty: string[];
  fallRisk: string;
  fallHistory: FallHistory[];
  socialInteraction: string;
  photoUrl: string;
  languages: Language[];
  recentVisits?: VisitInfo[];
};

export type VisitInfo = {
  elderly_id: number;
  visitor_id: number;
  relationship: string;
  mode_of_interaction: string;
  duration_of_contact: number;
  status: string;
  comments: string;
  photo_urls: string[];
  submission_time: string;
};

export type Language = 'Mandarin' | 'Malay' | 'Tamil' | 'Hokkien' | 'Teochew' | 'Cantonese';

export type NokInfo = {
  name: string;
  relationship: string;
  contactDetails: string;
};

export type FallHistory = {
  date: string;
  details: string;
};

const ResidentListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ElderlyInfo[]>([]);
  const [visits, setVisits] = useState<VisitInfo[]>([]);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lon: number } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch seniors and visits concurrently
        const [seniorsResponse, visitsResponse] = await Promise.all([
          fetch('/api/fetchSeniors'),
          fetch('/api/fetchVisits'),
        ]);

        const seniors: ElderlyInfo[] = (await seniorsResponse.json()).map((row: any) => ({
          id: row.id,
          elderlyCode: row.elderly_code,
          aacCode: row.aac_code,
          name: row.name,
          contactDetails: row.contact_details,
          nok: [
            {
              name: row.nok_name,
              relationship: row.relationship_with_nok,
              contactDetails: row.nok_contact_details,
            },
          ],
          block: row.block,
          floor: row.floor,
          unitNumber: row.unit_number,
          address: row.address, // General address (e.g., street name)
          postalCode: row.postal_code,
          notes: row.notes,
          keyAttachments: JSON.parse(row.key_attachments || '[]'), // Parsing the key_attachments if it's stored as a serialized string
          noOfDaysLivingAlone: row.no_of_days_living_alone,
          adlDifficulty: row.adl_difficulty || [], // Parsing the adl_difficulty JSONB field
          fallRisk: row.fall_risk,
          fallHistory: row.fall_history || [], // Parsing the fall_history JSONB field
          socialInteraction: row.social_interaction,
          photoUrl: row.photo_url,
          languages: [row.languages as Language], // Assuming languages is a single enum value
          visits: [], // Handle visits if applicable
        }));
        const visitsResult = await visitsResponse.json();

        if (visitsResult.success) {
          setVisits(visitsResult.data);
        } else {
          message.error(visitsResult.message || 'Failed to fetch visits.');
        }
        // Combine seniors with their most recent visits
        const seniorsWithVisits = seniors.map((senior: ElderlyInfo) => {
          const recentVisits = visits.filter((visit: VisitInfo) => visit.elderly_id === senior.id);
          return {
            ...senior,
            recentVisits,
          };
        });

        setData(seniorsWithVisits);
      } catch (error) {
        message.error('An error occurred when fetching resident data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Get current user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      });
    } else {
      message.warning('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleCardClick = (id: number) => {
    navigate(`/elderly/${id}`); // Navigate to the detailed page with the id
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Postal code copied!');
    });
  };

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distanceFromUser = (lat: number, lon: number) => {
    if (!currentPosition) return null;
    return calculateDistance(currentPosition.lat, currentPosition.lon, lat, lon);
  };

  // Function to get dynamic background color based on days since last visit
  const getBackgroundColor = (daysSinceLastVisit: number) => {
    const maxDays = 7; // You can adjust this based on your requirement
    const intensity = Math.min(daysSinceLastVisit / maxDays, 1); // Normalize between 0 and 1
    const red = Math.floor(255 * intensity);
    const green = Math.floor(255 * (1 - intensity));
    return `rgba(${red}, ${green}, 100, 0.2)`; // RGBA format for transparency
  };

  return (
    <PageContainer>
      {loading ? (
        <Skeleton active title paragraph={{ rows: 4 }} />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={data}
          renderItem={(elderly) => {
            const mostRecentVisit = elderly.recentVisits && elderly.recentVisits.length > 0
              ? dayjs(elderly.recentVisits[0].submission_time)
              : null;
            const daysSinceLastVisit = mostRecentVisit ? dayjs().diff(mostRecentVisit, 'days') : null;
            const backgroundColor = daysSinceLastVisit !== null ? getBackgroundColor(daysSinceLastVisit) : 'white';

            return (
              <List.Item>
                <Card
                  bordered={false}
                  style={{
                    marginBottom: 2, // Reduced margin between cards for a more compact layout
                    cursor: 'pointer',
                    backgroundColor: backgroundColor, // Dynamic background color based on last visit
                  }}
                  onClick={() => handleCardClick(elderly.id)} // Make card clickable
                >
                  <Row gutter={16}>
                    <Col xs={6} sm={4}>
                      <Avatar
                        size={64} // Reduced size to make more compact
                        src={elderly.photoUrl || 'https://via.placeholder.com/64'}
                        shape="square"
                        alt={elderly.name}
                      />
                    </Col>
                    <Col xs={18} sm={20}>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: '100%' }}
                      >
                        <Title level={5} style={{ margin: 0 }}>
                          {elderly.name} ({elderly.elderlyCode})
                        </Title>

                        {/* Display Address in sections for better wrapping */}
                        <Text type="secondary">
                          {elderly.block} {elderly.floor}-{elderly.unitNumber}
                        </Text>
                        <Text type="secondary">
                          {elderly.address}, {elderly.postalCode}
                          <Button
                            type="default"
                            size="small"
                            style={{ marginLeft: 8, borderRadius: 4 }} // Make it look more like a button
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(elderly.postalCode)}
                          >
                            Copy
                          </Button>
                        </Text>

                        {/* Display Distance */}
                        <Text>
                          <EnvironmentOutlined />{' '}
                          {distanceFromUser(1.3521, 103.8198)
                            ? `${(distanceFromUser(1.3521, 103.8198) / 1000).toFixed(1)} km`
                            : 'Fetching distance...'}
                        </Text>

                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {elderly.noOfDaysLivingAlone} days living alone
                        </Text>

                        {/* Most Recent Visit Information */}
                        {mostRecentVisit && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Last visit: {mostRecentVisit.format(dateformat)}
                            <br />
                            Mode: {elderly.recentVisits[0].mode_of_interaction}, Duration: {elderly.recentVisits[0].duration_of_contact} minutes
                            <br />
                            Status: {elderly.recentVisits[0].status}
                            <br />
                            Comments: {elderly.recentVisits[0].comments}
                          </Text>
                        )}

                        {/* Add view profile indicator */}
                        <Text type="secondary" style={{ fontSize: '12px', color: '#1890ff' }}>
                          View Profile <RightOutlined />
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </PageContainer>
  );
};

export default ResidentListPage;
