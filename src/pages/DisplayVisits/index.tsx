import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useAccess, useIntl } from '@umijs/max';
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
import VisitModal from '../../components/VisitModal';
import { VisitInfo } from '../ElderlyResidents';

const { Text, Title } = Typography;

const DisplayVisitsPage: React.FC = () => {
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  const [seniors, setSeniors] = useState<any[]>([]); // Store seniors as an array
  const [options, setOptions] = useState<any[]>([]); // For AutoComplete options
  const [showAllVisits, setShowAllVisits] = useState(false); // Toggle for staff to see all visits or my visits only
  const [searchElderlyId, setSearchElderlyId] = useState<number | null>(null); // Elderly ID to filter by
  const [searchValue, setSearchValue] = useState<string>(''); // Current value of the AutoComplete input
  const [visitorInfos, setVisitorInfos] = useState<{ [key: number]: any }>({});  const [loading, setLoading] = useState(true);
  const intl = useIntl();
  const [visits, setVisits] = useState<VisitInfo[]>([]);
  const [isVisitModalVisible, setIsVisitModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitInfo | null>(null);

  // Determine the visitor's role and ID

  const user = localStorage.getItem('user');
  let visitorInfo = { id: 0, name: "Josephine Lam", role: 'staff', display_role: 'Test Staff'}
  if (user) {
    const parsedUser = JSON.parse(user);
    const display_role = parsedUser.role === 'staff' ? parsedUser.volunteer_service_role_and_organisation : 'Volunteer';
    visitorInfo = { id: parsedUser.id, name: parsedUser.full_name, role: parsedUser.role, display_role: display_role };
  }

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

  const fetchVisitorInfo = async (visitorId: number, visitId: number) => {
    try {
      const response = await fetch(`/api/vas/${visitorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch visitor info');
      }
      const data = await response.json();
      const visitorInfo = {
        id: data.id,
        name: data.full_name,
        role: data.role,
        display_role: data.role === 'staff' ? data.volunteer_service_role_and_organisation : 'Volunteer',
      };
      setVisitorInfos((prev) => ({ ...prev, [visitId]: visitorInfo }));
    } catch (error) {
      console.error('Error fetching visitor info:', error);
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

  useEffect(() => {
    visits.forEach((visit) => {
      if (!visitorInfos[visit.id]) {
        fetchVisitorInfo(visit.visitor_id, visit.id);
      }
    });
  }, [visits]);

  // Apply filters whenever visits, showAllVisits, or searchElderlyId change
  useEffect(() => {
    applyFilters(visits);
  }, [visits, showAllVisits, searchElderlyId]);

  // Function to apply the current active filter to the visits
  const applyFilters = (visitsData: any[]) => {
    let filtered = visitsData;

    // Volunteers can only see their own visits
    if (visitorInfo.role === 'volunteer') {
      filtered = filtered.filter((visit) => Number(visit.visitor_id) === visitorInfo.id);
    } else if (visitorInfo.role === 'staff') {
      // Staff can toggle between all visits and their own visits
      if (!showAllVisits) {
        filtered = filtered.filter((visit) => Number(visit.visitor_id) === visitorInfo.id);
      }
    }

    // If a search is active, filter by elderly_id
    if (searchElderlyId !== null) {
      filtered = filtered.filter((visit) => Number(visit.elderly_id) === searchElderlyId);
    }

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

  const formatTimeDifference = (submissionTime) => {
    const now = new Date();
    const submissionDate = new Date(submissionTime);
    const diffInSeconds = Math.floor((now.getTime() - submissionDate.getTime()) / 1000); // Difference in seconds

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
    <>
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
                const visitorInfo = visitorInfos[visit.id];
                if (!visitorInfo) {
                  return null; // Wait until visitorInfo is loaded
                }
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
                  loading={loading}
                  onClick={() => {
                    setSelectedVisit(visit);
                    setIsVisitModalVisible(true);
                  }} // Navigate to VisitDetailPage on click
                >
                  <Row gutter={16} align="middle">
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
                        
                        <Text>
                        🕒 {new Date(visit.submission_time).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}, {new Date(visit.submission_time).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true })} 
                        {' '} <Text type="secondary" strong>({formatTimeDifference(visit.submission_time)})</Text>
                        </Text>
                        <br />

                        {visit.status === 'Good' && (
                        <Text strong style={{ color: 'green', fontSize: '16px' }}>
                            <CheckCircleOutlined style={{ color: 'green', marginRight: '8px' }} />
                            Good
                        </Text>
                        )}
                        {visit.status === 'Not Good' && (
                        <Text strong style={{ color: 'red', fontSize: '16px' }}>
                            <ExclamationCircleOutlined style={{ color: 'red', marginRight: '8px' }} />
                            Not Good
                        </Text>
                        )}
                        {visit.status === 'Not Around' && (
                        <Text strong style={{ color: 'orange', fontSize: '16px' }}>
                            <QuestionCircleOutlined style={{ color: 'orange', marginRight: '8px' }} />
                            Not Around
                        </Text>
                        )}
                        <br />

                        {/* Elderly Comments */}
                        <Text>
                        🔔 {visit.key_concerns || '-'}
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
 {selectedVisit && (
      <VisitModal
        visit={selectedVisit}
        isVisible={isVisitModalVisible}
        onClose={() => {
          setSelectedVisit(null)
          setIsVisitModalVisible(false)
        }}
      />
    )}
    </>
  )
}

export default DisplayVisitsPage;
