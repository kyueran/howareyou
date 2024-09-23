import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useAccess, useIntl, useNavigate } from '@umijs/max';
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Row,
  Space,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Text, Title } = Typography;

const DisplayVisitsPage: React.FC = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  const [seniors, setSeniors] = useState<any[]>([]); // Store seniors as an array
  const [options, setOptions] = useState<any[]>([]); // For AutoComplete options
  const [showAllVisits, setShowAllVisits] = useState(false); // Toggle for staff to see all visits or my visits only
  const [searchElderlyId, setSearchElderlyId] = useState<number | null>(null); // Elderly ID to filter by
  const [searchValue, setSearchValue] = useState<string>(''); // Current value of the AutoComplete input
  const access = useAccess(); // To get access control info
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const intl = useIntl();

  // Determine the visitor's role and ID
  const visitorId = access.isStaff ? 2 : 1;
  const visitorInfo = access.isStaff
    ? { name: 'Ms Josephine Lam', role: 'staff' }
    : { name: 'Mr Wong Ah Fook', role: 'volunteer' };

  // Fetch seniors data once and store in state
  const fetchSeniors = async () => {
    try {
      const response = await fetch('/api/fetchSeniors');

      if (!response.ok) {
        throw new Error(`Failed to fetch seniors: ${response.statusText}`);
      }

      const seniorsData = await response.json();

      if (Array.isArray(seniorsData)) {
        setSeniors(seniorsData); // Store the seniors array
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error fetching seniors:', error);
      message.error('There was an error fetching the seniors.');
    }
  };

  // Fetch visits from the API
  const fetchVisits = async () => {
    try {
      const response = await fetch('/api/fetchVisits');
      const result = await response.json();
      if (result.success) {
        console.log(result.data);
        setVisits(result.data);
        // The applyFilters function will handle the filtering
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

  // Polling visits every 5 seconds
  useEffect(() => {
    fetchSeniors(); // Fetch seniors data once
    fetchVisits(); // Initial fetch
    const interval = setInterval(() => {
      fetchVisits();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Clear the interval when the component is unmounted
  }, []);

  // Apply filters whenever visits, showAllVisits, or searchElderlyId change
  useEffect(() => {
    applyFilters(visits);
  }, [visits, showAllVisits, searchElderlyId]);

  // Function to apply the current active filter to the visits
  const applyFilters = (visitsData: any[]) => {
    let filtered = visitsData;

    // Volunteers can only see their own visits
    if (visitorInfo.role === 'volunteer') {
      filtered = filtered.filter(
        (visit) => Number(visit.visitor_id) === visitorId,
      );
    } else if (visitorInfo.role === 'staff') {
      // Staff can toggle between all visits and their own visits
      if (!showAllVisits) {
        filtered = filtered.filter(
          (visit) => Number(visit.visitor_id) === visitorId,
        );
      }
    }

    // If a search is active, filter by elderly_id
    if (searchElderlyId !== null) {
      filtered = filtered.filter(
        (visit) => Number(visit.elderly_id) === searchElderlyId,
      );
    }

    // Sort by submission_time in descending order (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.submission_time).getTime() -
        new Date(a.submission_time).getTime(),
    );

    setFilteredVisits(filtered);
  };

  // Handle filtering visits based on search query
  const handleSearch = (value: string) => {
    setSearchValue(value); // Update the input value
    const searchQuery = value.toLowerCase();

    // Filter options for AutoComplete dropdown
    const filteredOptions = seniors
      .filter(
        (senior) =>
          senior.name.toLowerCase().includes(searchQuery) ||
          senior.elderly_code.toLowerCase().includes(searchQuery),
      )
      .map((senior) => {
        const displayText = `[${
          senior.elderly_code
        }] - ${senior.name.toUpperCase()}`;
        return {
          value: displayText, // This will be displayed in the input when selected
          label: displayText, // This will be displayed in the dropdown
          seniorId: senior.id, // Include the senior's id for reference
        };
      });

    setOptions(filteredOptions); // Update the dropdown options
  };

  // Handle selection of a specific elderly name or code from AutoComplete
  const handleSelect = (value: string, option: any) => {
    setSearchValue(value); // Set the input to display the selected value
    const seniorId = option.seniorId;
    if (seniorId !== undefined) {
      setSearchElderlyId(seniorId); // Set the elderly_id to filter by
    } else {
      message.warning('No matching senior found.');
    }
  };

  // Clear search filter when input is cleared
  const handleClearSearch = () => {
    setSearchValue(''); // Clear the input value
    setSearchElderlyId(null);
  };

  // Toggle between all visits and my visits (staff only)
  const toggleShowAllVisits = () => {
    setShowAllVisits(!showAllVisits); // Toggle the state
  };

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

  const formatTimeDifference = (submissionTime) => {
    const now = new Date();
    const submissionDate = new Date(submissionTime);
    const diffInSeconds = Math.floor((now - submissionDate) / 1000); // Difference in seconds

    if (diffInSeconds < 60) {
      // If less than 60 seconds, show seconds
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 60 * 60) {
      // If less than 60 minutes (1 hour), show minutes
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 24 * 60 * 60) {
      // If less than 24 hours, show hours
      const hours = Math.floor(diffInSeconds / (60 * 60));
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      // If more than 24 hours, show days
      const days = Math.floor(diffInSeconds / (60 * 60 * 24));
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Row justify="center" style={{ marginTop: '24px' }}>
      <Col xs={22} sm={20} md={16} lg={12}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Title level={3} style={{ marginBottom: '0px' }}>
            {intl.formatMessage({ id: 'menu.DisplayVisits' })}
          </Title>
          {/* Button to toggle between "My Visits" and "All Visits" for staff */}
          {visitorInfo.role === 'staff' && (
            <Button type="primary" onClick={toggleShowAllVisits}>
              {intl.formatMessage(
                { id: 'showXVisits' },
                { whose: showAllVisits ? 'My' : 'All' },
              )}
            </Button>
          )}

          {/* AutoComplete search for elderly (staff only) */}
          {visitorInfo.role === 'staff' && (
            <AutoComplete
              options={options} // AutoComplete options
              onSearch={handleSearch} // Search input handler
              onSelect={handleSelect} // Selection handler
              onChange={(value) => {
                if (!value) {
                  handleClearSearch();
                } else {
                  setSearchValue(value);
                }
              }}
              value={searchValue} // Display the selected value in the input
              allowClear
              placeholder={intl.formatMessage({ id: 'searchPlaceholder' })}
              style={{ width: '100%', marginBottom: '20px' }}
            />
          )}
          {filteredVisits.length === 0 && !loading ? (
            <Text>{intl.formatMessage({ id: 'noVisits' })}</Text>
          ) : (
            filteredVisits.map((visit) => {
              const visitorInfo = getVisitorInfo(visit.visitor_id);
              return (
                <Card
                  key={visit.id}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                  }} // Adding slight border and border-radius for styling
                  bodyStyle={{ paddingBottom: 12, paddingTop: 12 }}
                  onClick={() => navigate(`/visit/${visit.id}`)} // Navigate to VisitDetailPage on click
                >
                  <Row gutter={16} align="middle">
                    <Col xs={24} sm={24} md={24} lg={24}>
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '180px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingTop: '40px',
                          paddingBottom: '30px',
                          paddingLeft: '10px',
                          overflow: 'visible', // Ensure borders are not cut off
                        }}
                      >
                        {visit.photo_urls && visit.photo_urls.length > 0 ? (
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: '100%',
                            }}
                          >
                            {/* First visit photo */}
                            <img
                              src={visit.photo_urls[0]}
                              alt={intl.formatMessage({
                                id: 'imageThumbnailAlt',
                              })}
                              style={{
                                width: '100%', // Ensure the image fits fully in the space
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                borderRadius: '8px', // Rounded corners for the image
                                zIndex: 3, // Ensure image is above the borders
                                position: 'relative', // Required to position it above the borders
                              }}
                            />
                            {/* Grey borders outside the image */}
                            {visit.photo_urls.length > 1 && (
                              <>
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '-3px',
                                    left: '-3px',
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 1, // Behind the image
                                    borderRadius: '8px', // Same radius as image
                                    border: '2px solid rgba(0, 0, 0, 0.1)', // Light grey border
                                  }}
                                />
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    left: '-6px',
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 0, // Further behind the image
                                    borderRadius: '8px',
                                    border: '2px solid rgba(0, 0, 0, 0.1)', // Another light grey border
                                  }}
                                />
                              </>
                            )}
                            <div
                              style={{
                                textAlign: 'center',
                                marginTop: '5px',
                                fontSize: '12px',
                                color: '#888',
                              }}
                            >
                              {intl.formatMessage(
                                { id: 'numberOfPhotos' },
                                { count: visit.photo_urls.length },
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{ textAlign: 'center', paddingTop: '50%' }}
                          >
                            {intl.formatMessage({ id: 'noImages' })}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col xs={16} sm={18} md={18} lg={19}>
                      <div>
                        {/* Visitor Name and Role */}
                        <Text strong style={{ fontSize: '16px' }}>
                          👤 {visitorInfo.name} (
                          {visitorInfo.role === 'staff'
                            ? 'AAC Staff'
                            : 'Volunteer'}
                          )
                        </Text>
                        <br />

                        {/* Location */}
                        <Text>
                          📍{' '}
                          {visit.mode_of_interaction ||
                            intl.formatMessage({ id: 'NA' })}
                        </Text>
                        <br />

                        {/* Date and Time */}
                        {visit.status === 'Good' && (
                          <Text
                            strong
                            style={{ color: 'green', fontSize: '16px' }}
                          >
                            <CheckCircleOutlined
                              style={{ color: 'green', marginRight: '8px' }}
                            />
                            {intl.formatMessage({ id: 'good' })}
                          </Text>
                        )}
                        {visit.status === 'Not Good' && (
                          <Text
                            strong
                            style={{ color: 'red', fontSize: '16px' }}
                          >
                            <ExclamationCircleOutlined
                              style={{ color: 'red', marginRight: '8px' }}
                            />
                            {intl.formatMessage({ id: 'notGood' })}
                          </Text>
                        )}
                        {visit.status === 'Not Around' && (
                          <Text
                            strong
                            style={{ color: 'orange', fontSize: '16px' }}
                          >
                            <QuestionCircleOutlined
                              style={{ color: 'orange', marginRight: '8px' }}
                            />
                            {intl.formatMessage({ id: 'notAround' })}
                          </Text>
                        )}
                        <br />

                        {/* Elderly Comments */}
                        <Text>🔔 {visit.key_concerns || '-'}</Text>
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
