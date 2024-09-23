import { CloseOutlined, CopyOutlined, RightOutlined } from '@ant-design/icons';
import { PageContainer, ProSkeleton } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Image,
  Input,
  List,
  Row,
  Space,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import React, { useCallback, useEffect, useState } from 'react';
import { history } from 'umi';

const { Title, Text } = Typography;

dayjs.extend(advancedFormat);

export type ElderlyInfo = {
  id: number;
  elderlyCode: string;
  centreCode: string;
  name: string;
  contactDetails: string;
  callResponse: 'High' | 'Medium' | 'Low';
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
  fallRisk: 'High' | 'Mild' | 'Low' | 'Zero';
  fallHistory: LineItem[];
  keyConcerns: LineItem[];
  socialInteraction: string;
  photoUrl: string;
  languages: Language[];
  recentVisits?: VisitInfo[];
};

export type VisitInfo = {
  id: number;
  elderly_id: number;
  visitor_id: number;
  relationship: string;
  mode_of_interaction: string;
  duration_of_contact: number;
  status: string;
  comments: string;
  photo_urls: string[];
  submission_time: string;
  key_concerns: string;
};

export type Language =
  | 'Mandarin'
  | 'Malay'
  | 'Tamil'
  | 'Hokkien'
  | 'Teochew'
  | 'Cantonese';

export type NokInfo = {
  name: string;
  relationship: string;
  contactDetails: string;
};

export type LineItem = {
  date: string;
  details: string;
};

const ResidentListPage: React.FC = () => {
  const [data, setData] = useState<ElderlyInfo[]>([]);
  const [filteredData, setFilteredData] = useState<ElderlyInfo[]>([]);
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [seniorsResponse, visitsResponse] = await Promise.all([
          fetch('/api/fetchSeniors'),
          fetch('/api/fetchVisits'),
        ]);

        const seniors: ElderlyInfo[] = (await seniorsResponse.json()).map(
          (row: any) => ({
            id: row.id,
            elderlyCode: row.elderly_code,
            centreCode: row.aac_code,
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
            address: row.address,
            postalCode: row.postal_code,
            notes: row.notes,
            keyAttachments: JSON.parse(row.key_attachments || '[]'),
            noOfDaysLivingAlone: row.no_of_days_living_alone,
            adlDifficulty: row.adl_difficulty || [],
            fallRisk: row.fall_risk,
            fallHistory: row.fall_history || [],
            socialInteraction: row.social_interaction,
            photoUrl: row.photo_url,
            languages: [row.languages as Language],
            visits: [],
          }),
        );

        const visitsResult = await visitsResponse.json();
        const visits: VisitInfo[] = visitsResult.success
          ? visitsResult.data
          : [];

        // Combine seniors with their most recent visits
        const seniorsWithVisits = seniors.map((senior: ElderlyInfo) => {
          const recentVisits = visits.filter(
            (visit: VisitInfo) => visit.elderly_id === senior.id,
          );
          return {
            ...senior,
            recentVisits,
          };
        });

        const sortedData = sortData(seniorsWithVisits);
        setData(sortedData);
        setFilteredData(sortedData); // Initialize filtered data with sorted data
      } catch (error) {
        console.error('Error fetching resident data', error);
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
    }
  }, []);

  // Function to calculate the number of days since last visit
  const calculateDaysSinceLastVisit = (recentVisits: VisitInfo[]) => {
    if (recentVisits.length === 0) return Infinity;
    const lastVisitDate = dayjs(recentVisits[0].submission_time);
    return dayjs().diff(lastVisitDate, 'days');
  };

  // Function to calculate the distance between two coordinates using the Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Returns distance in meters
  };

  // Function to sort the data based on the most recent visit and distance
  const sortData = useCallback(
    (residents: ElderlyInfo[]) => {
      return residents
        .slice() // Create a copy of the array
        .sort((a, b) => {
          // Sort by days since last visit first
          const daysA = calculateDaysSinceLastVisit(a.recentVisits || []);
          const daysB = calculateDaysSinceLastVisit(b.recentVisits || []);

          if (daysA !== daysB) {
            return daysB - daysA; // Sort by descending days since last visit
          }

          // Then sort by distance if the location is available
          if (currentPosition) {
            const distanceA = calculateDistance(
              1.3521,
              103.8198,
              currentPosition.lat,
              currentPosition.lon,
            );
            const distanceB = calculateDistance(
              1.3521,
              103.8198,
              currentPosition.lat,
              currentPosition.lon,
            );
            return distanceA - distanceB; // Sort by ascending distance
          }

          return 0; // If no distance information, keep the original order
        });
    },
    [currentPosition],
  );

  // Handle search filtering
  const handleSearch = useCallback(
    (searchText: string) => {
      setSearchValue(searchText);

      const filtered = data.filter(
        (elderly) =>
          elderly.name.toLowerCase().includes(searchText.toLowerCase()) ||
          elderly.block.toLowerCase().includes(searchText.toLowerCase()) ||
          elderly.unitNumber.includes(searchText) ||
          elderly.address.toLowerCase().includes(searchText.toLowerCase()) ||
          elderly.elderlyCode
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          elderly.postalCode.includes(searchText) ||
          elderly.centreCode.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredData(filtered);
    },
    [data],
  );

  const handleClear = useCallback(() => {
    setSearchValue(''); // Clear the search value
    setFilteredData(data); // Reset filtered data to the full list
  }, [data]);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // Prevent triggering the card onClick event
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('Address copied to clipboard!'); // Show success message
      })
      .catch((err) => {
        message.error('Failed to copy address');
      });
  };

  return (
    <div style={{ margin: '0 8px' }}>
      <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>Elderly Residents</Title>
      <Text>
        You are viewing residents in the <Text type="danger">Queenstown</Text>{' '}
        area!
      </Text>
      <Input
        style={{ width: '100%', margin: '8px 0' }}
        size="large"
        placeholder="Find elderly using their address, code..."
        suffix={
          searchValue.length > 0 ? (
            <CloseOutlined
              style={{
                fontSize: '20px',
                color: 'rgba(0, 0, 0, 0.45)',
                cursor: 'pointer',
              }}
              onClick={handleClear}
            />
          ) : (
            <span />
          )
        }
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {loading ? (
        <ProSkeleton type='list' />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={filteredData}
          renderItem={(elderly) => {
            const mostRecentVisit =
              elderly.recentVisits && elderly.recentVisits.length > 0
                ? dayjs(elderly.recentVisits[0].submission_time)
                : null;
            const daysSinceLastVisit = mostRecentVisit
              ? dayjs().diff(mostRecentVisit.startOf('day'), 'days')
              : 'No visits';
            let displayVisitInfo = 'No visits';
            if (mostRecentVisit) {
              if (daysSinceLastVisit === 0) {
                // Same day: display the time in HH:mm format
                displayVisitInfo = `visited today ${mostRecentVisit.format(
                  'H:mmA',
                )}`;
              } else if (daysSinceLastVisit === 1) {
                // Yesterday
                displayVisitInfo = `visited yesterday ${mostRecentVisit.format(
                  'H:mmA',
                )}`;
              } else {
                // More than one day ago
                displayVisitInfo = `visited ${daysSinceLastVisit} days ago}`;
              }
            }
            const distance = currentPosition
              ? `${(
                  calculateDistance(
                    1.3521,
                    103.8198,
                    currentPosition.lat,
                    currentPosition.lon,
                  ) / 1000
                ).toFixed(1)} km away`
              : 'loading...';
            return (
              <List.Item style={{ padding: 0, paddingBottom: 8 }}>
                <Card
                  style={{
                    cursor: 'pointer',
                    transition:
                      'transform 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Initial light shadow
                    overflow: 'hidden',
                  }}
                  bodyStyle={{ padding: '8px 16px' }}
                  onClick={() => history.push(`/elderly/${elderly.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)'; // Slightly enlarge the card
                    e.currentTarget.style.boxShadow =
                      '0 6px 16px rgba(0, 0, 0, 0.15)'; // Darker shadow
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'; // Reset scale
                    e.currentTarget.style.boxShadow =
                      '0 2px 8px rgba(0, 0, 0, 0.1)'; // Reset shadow
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)'; // Enlarge slightly on touch
                    e.currentTarget.style.boxShadow =
                      '0 6px 16px rgba(0, 0, 0, 0.15)'; // Darker shadow
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'; // Reset scale
                    e.currentTarget.style.boxShadow =
                      '0 2px 8px rgba(0, 0, 0, 0.1)'; // Reset shadow
                  }}
                >
                  <Row gutter={0} justify="space-between">
                    <Col xs={8} sm={6} style={{ alignContent: 'center' }}>
                      <Image
                        preview={false}
                        src={
                          elderly.photoUrl ||
                          'https://via.placeholder.com/48x48'
                        } // Reduce size for compact layout
                        width={96}
                        height={96}
                        style={{ cursor: 'pointer' }}
                      />
                    </Col>
                    <Col xs={16} sm={18}>
                      <Space
                        direction="vertical"
                        size={0}
                        style={{ width: '100%' }}
                      >
                        <Space
                          direction="horizontal"
                          style={{
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          <Title level={5} style={{ margin: 0 }}>
                            {elderly.name} ({elderly.elderlyCode})
                          </Title>

                          {/* Right-aligned RightOutlined icon */}
                          <div style={{ marginLeft: 'auto' }}>
                            <RightOutlined style={{ fontSize: '14px' }} />
                          </div>
                        </Space>

                        {/* Block, Floor, Unit, Address */}
                        <Text type="secondary">
                          {elderly.block} {elderly.floor}-{elderly.unitNumber},{' '}
                          {elderly.address}
                        </Text>

                        <Space
                          direction="horizontal"
                          style={{
                            justifyContent: 'flex-start',
                            width: '100%',
                          }}
                        >
                          <Text type="secondary">
                            Singapore {elderly.postalCode}
                          </Text>

                          {/* Secondary-colored Copy button */}
                          <Button
                            type="default"
                            size="small"
                            style={{ marginLeft: 0, borderRadius: 4 }}
                            icon={
                              <CopyOutlined
                                style={{ color: 'rgba(0, 0, 0, 0.45)' }}
                              />
                            }
                            onClick={(e) => {
                              handleCopy(
                                e,
                                `${elderly.address}, ${elderly.postalCode}`,
                              );
                            }}
                          >
                            <Text type="secondary">Copy</Text>
                          </Button>
                        </Space>

                        <Space
                          direction="horizontal"
                          style={{
                            width: '100%',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {displayVisitInfo}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            📍 {distance}
                          </Text>
                        </Space>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
};

export default ResidentListPage;
