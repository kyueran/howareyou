import {
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    QuestionCircleOutlined,
    FilterOutlined,
  } from '@ant-design/icons';
  import { useIntl } from '@umijs/max';
  import {
    AutoComplete,
    Button,
    Card,
    Col,
    Row,
    Space,
    Typography,
    message,
    Radio,
    Dropdown,
    Menu,
  } from 'antd';
  import React, { useEffect, useState, useMemo } from 'react';
  import VisitModal from '../../components/VisitModal';
  import { VisitInfo } from '../ElderlyResidents';
  
  const { Text, Title } = Typography;
  
  const DisplayVisitsPage: React.FC = () => {
    const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
    const [seniors, setSeniors] = useState<any[]>([]); // Store seniors as an array
    const [vasList, setVasList] = useState<any[]>([]); // Store volunteers and staff
    const [options, setOptions] = useState<any[]>([]); // For AutoComplete options
    const [searchElderlyId, setSearchElderlyId] = useState<number | null>(null); // Elderly ID to filter by
    const [searchVasId, setSearchVasId] = useState<number | null>(null); // Volunteer/Staff ID to filter by
    const [searchValue, setSearchValue] = useState<string>(''); // Current value of the AutoComplete input
    const [loading, setLoading] = useState(true);
    const intl = useIntl();
    const [visits, setVisits] = useState<VisitInfo[]>([]);
    const [isVisitModalVisible, setIsVisitModalVisible] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<VisitInfo | null>(null);
  
    // New state variables for filters
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'pastWeek'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'good', 'notGood', 'notAround'
    const [showStatusFilters, setShowStatusFilters] = useState(false);
  
    // Determine the visitor's role and ID
    const user = localStorage.getItem('user');
    let visitorInfo = { id: 0, name: 'Josephine Lam', role: 'staff', display_role: 'Test Staff' };
    if (user) {
      const parsedUser = JSON.parse(user);
      const display_role =
        parsedUser.role === 'staff' ? parsedUser.volunteer_service_role_and_organisation : 'Volunteer';
      visitorInfo = { id: parsedUser.id, name: parsedUser.full_name, role: parsedUser.role, display_role };
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
  
    // Fetch volunteers and staff data once and store in state
    const fetchVasList = async () => {
      try {
        const response = await fetch('/api/fetchVAS');
  
        if (!response.ok) {
          throw new Error(`Failed to fetch volunteers and staff: ${response.statusText}`);
        }
  
        const vasData = await response.json();
  
        if (Array.isArray(vasData)) {
          setVasList(vasData); // Store the vas array
        } else {
          throw new Error('Unexpected API response format');
        }
      } catch (error) {
        console.error('Error fetching vas list:', error);
        message.error('There was an error fetching the volunteers and staff.');
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
      fetchVasList(); // Fetch vas data
      fetchVisits(); // Initial fetch
      const interval = setInterval(() => {
        fetchVisits();
      }, 5000); // Poll every 5 seconds
  
      return () => clearInterval(interval); // Clear the interval when the component is unmounted
    }, []);
  
    // Create a mapping of vas id to vas data for quick access
    const vasMap = useMemo(() => {
      const map = {};
      vasList.forEach((vas) => {
        map[vas.id] = vas;
      });
      return map;
    }, [vasList]);
  
    // Apply filters whenever visits or filter states change
    useEffect(() => {
      applyFilters(visits);
    }, [visits, searchElderlyId, searchVasId, dateFilter, statusFilter]);
  
    // Function to apply the current active filters to the visits
    const applyFilters = (visitsData: any[]) => {
      let filtered = visitsData;
  
      // Volunteers can only see their own visits
      if (visitorInfo.role === 'volunteer') {
        filtered = filtered.filter((visit) => Number(visit.visitor_id) === visitorInfo.id);
      }
  
      // If a search is active, filter by elderly_id or visitor_id
      if (searchElderlyId !== null) {
        filtered = filtered.filter((visit) => Number(visit.elderly_id) === searchElderlyId);
      } else if (searchVasId !== null) {
        filtered = filtered.filter((visit) => Number(visit.visitor_id) === searchVasId);
      }
  
      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        filtered = filtered.filter((visit) => {
          const visitDate = new Date(visit.submission_time);
  
          if (dateFilter === 'today') {
            return visitDate.toDateString() === now.toDateString();
          } else if (dateFilter === 'pastWeek') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return visitDate >= oneWeekAgo && visitDate <= now;
          }
          return true;
        });
      }
  
      // Apply status filter (only for staff)
      if (visitorInfo.role === 'staff' && statusFilter !== 'all') {
        filtered = filtered.filter((visit) => {
          if (statusFilter === 'good') {
            return visit.status === 'Good';
          } else if (statusFilter === 'notGood') {
            return visit.status === 'Not Good';
          } else if (statusFilter === 'notAround') {
            return visit.status === 'Not Around';
          }
          return true;
        });
      }
    
      filtered.sort((a, b) => new Date(b.submission_time).getTime() - new Date(a.submission_time).getTime());

      setFilteredVisits(filtered);
    };
  
    // Handle filtering visits based on search query
    const handleSearch = (value: string) => {
      setSearchValue(value); // Update the input value
      const searchQuery = value.toLowerCase();
  
      // Filter elderly options
      const elderlyOptions = seniors
        .filter(
          (senior) =>
            senior.name.toLowerCase().includes(searchQuery) ||
            senior.elderly_code.toLowerCase().includes(searchQuery),
        )
        .map((senior) => {
          const displayText = `[${senior.elderly_code}] - ${senior.name.toUpperCase()}`;
          return {
            value: displayText, // This will be displayed in the input when selected
            label: displayText, // This will be displayed in the dropdown
            id: senior.id, // Include the id for reference
            type: 'elderly',
          };
        });
  
      // Filter vas options
      const vasOptions = vasList
        .filter(
          (vas) =>
            vas.full_name.toLowerCase().includes(searchQuery) ||
            vas.volunteer_or_staff_code.toLowerCase().includes(searchQuery),
        )
        .map((vas) => {
          const displayText = `[${vas.volunteer_or_staff_code}] - ${vas.full_name.toUpperCase()}`;
          return {
            value: displayText,
            label: displayText,
            id: vas.id,
            type: 'vas',
          };
        });
  
      // Combine options
      const combinedOptions = [...elderlyOptions, ...vasOptions];
  
      setOptions(combinedOptions); // Update the dropdown options
    };
  
    // Handle selection of a specific elderly name or code from AutoComplete
    const handleSelect = (value: string, option: any) => {
      setSearchValue(value); // Set the input to display the selected value
      const selectedId = option.id;
      const selectedType = option.type;
  
      if (selectedId !== undefined) {
        if (selectedType === 'elderly') {
          setSearchElderlyId(selectedId);
          setSearchVasId(null); // Reset vas filter
        } else if (selectedType === 'vas') {
          setSearchElderlyId(null); // Reset elderly filter
          setSearchVasId(selectedId);
        }
      } else {
        message.warning('No matching entry found.');
      }
    };
  
    // Clear search filter when input is cleared
    const handleClearSearch = () => {
      setSearchValue(''); // Clear the input value
      setSearchElderlyId(null);
      setSearchVasId(null);
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
  
    // Define the status menu for the dropdown
    const statusMenu = (
      <Menu
        onClick={(e) => {
          setStatusFilter(e.key);
        }}
        selectedKeys={[statusFilter]}
      >
        <Menu.Item key="all">All Statuses</Menu.Item>
        <Menu.Item key="good">Good</Menu.Item>
        <Menu.Item key="notGood">Not Good</Menu.Item>
        <Menu.Item key="notAround">Not Around</Menu.Item>
      </Menu>
    );
  
    return (
      <>
        <Row justify="center" style={{ marginTop: '24px' }}>
          <Col xs={22} sm={20} md={16} lg={12}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Title level={3} style={{ marginBottom: '-2px' }}>
                {intl.formatMessage({ id: 'menu.DisplayVisits' })}
              </Title>
  
              {/* AutoComplete search for elderly or volunteer/staff (staff only) */}
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
                style={{ width: '100%', marginBottom: '0px' }}
              />
            )}

            {/* Date Filter */}
            <Space style={{ marginBottom: '0px' }}>
              <Radio.Group
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <Radio.Button value="all">All Dates</Radio.Button>
                <Radio.Button value="today">Today</Radio.Button>
                <Radio.Button value="pastWeek">Past Week</Radio.Button>
              </Radio.Group>

              {/* Status Filter Toggle Button (staff only) */}
              {visitorInfo.role === 'staff' && (
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setShowStatusFilters(!showStatusFilters)}
                />
              )}
            </Space>

            {/* Status Filter Buttons (staff only, conditionally shown) */}
            {showStatusFilters && (
              <Radio.Group
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ marginTop: '-2px' }}
              >
                <Radio.Button value="all">All Statuses</Radio.Button>
                <Radio.Button value="good">Good</Radio.Button>
                <Radio.Button value="notGood">Not Good</Radio.Button>
                <Radio.Button value="notAround">Not Around</Radio.Button>
              </Radio.Group>
            )}
  
              {filteredVisits.length === 0 && !loading ? (
                <Text>{intl.formatMessage({ id: 'noVisits' })}</Text>
              ) : (
                filteredVisits.map((visit) => {
                  const visitor = vasMap[visit.visitor_id];
                  if (!visitor) {
                    return null; // Wait until visitor info is loaded
                  }
                  return (
                    <Card
                      key={visit.id}
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                      }}
                      bodyStyle={{ paddingBottom: 12, paddingTop: 12 }}
                      loading={loading}
                      onClick={() => {
                        setSelectedVisit(visit);
                        setIsVisitModalVisible(true);
                      }}
                    >
                      <Row gutter={16} align="middle">
                        <Col xs={16} sm={18} md={18} lg={19}>
                          <div>
                            {/* Visitor Name and Role */}
                            <Text strong style={{ fontSize: '16px' }}>
                              👤 {visitor.full_name} (
                              {visitor.role === 'staff' ? 'AAC Staff' : 'Volunteer'})
                            </Text>
                            <br />
  
                            {/* Location */}
                            <Text>
                              📍 {visit.mode_of_interaction || intl.formatMessage({ id: 'NA' })}
                            </Text>
                            <br />
  
                            <Text>
                              🕒{' '}
                              {new Date(visit.submission_time).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                              ,{' '}
                              {new Date(visit.submission_time).toLocaleTimeString([], {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                              })}{' '}
                              <Text type="secondary" strong>
                                ({formatTimeDifference(visit.submission_time)})
                              </Text>
                            </Text>
                            <br />
  
                            {visit.status === 'Good' && (
                              <Text strong style={{ color: 'green', fontSize: '16px' }}>
                                <CheckCircleOutlined
                                  style={{ color: 'green', marginRight: '8px' }}
                                />
                                Good
                              </Text>
                            )}
                            {visit.status === 'Not Good' && (
                              <Text strong style={{ color: 'red', fontSize: '16px' }}>
                                <ExclamationCircleOutlined
                                  style={{ color: 'red', marginRight: '8px' }}
                                />
                                Not Good
                              </Text>
                            )}
                            {visit.status === 'Not Around' && (
                              <Text strong style={{ color: 'orange', fontSize: '16px' }}>
                                <QuestionCircleOutlined
                                  style={{ color: 'orange', marginRight: '8px' }}
                                />
                                Not Around
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
        {selectedVisit && (
          <VisitModal
            visit={selectedVisit}
            isVisible={isVisitModalVisible}
            onClose={() => {
              setSelectedVisit(null);
              setIsVisitModalVisible(false);
            }}
          />
        )}
      </>
    );
  };
  
  export default DisplayVisitsPage;
  
