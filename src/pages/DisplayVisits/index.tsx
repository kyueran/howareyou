import {
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    QuestionCircleOutlined,
    FilterOutlined,
    UserOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    BellOutlined,
    CloseCircleOutlined,
    showFilters,
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
  import dayjs from 'dayjs';
  import React, { useEffect, useState, useMemo } from 'react';
  import VisitModal from '../../components/VisitModal';
  import { VisitInfo } from '../ElderlyResidents';
 import relativeTime from 'dayjs/plugin/relativeTime';
 import utc from 'dayjs/plugin/utc';
 import timezone from 'dayjs/plugin/timezone';

 dayjs.extend(relativeTime)
 dayjs.extend(utc);
 dayjs.extend(timezone);

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
    const [showFilters, setShowFilters] = useState(false);
  
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
      const now = dayjs().tz("Asia/Singapore");
      const submissionDate = dayjs(submissionTime);
      const diffInSeconds = Math.floor((now.valueOf() - submissionDate.valueOf()) / 1000);
  
      if (diffInSeconds < 60) {
        // If less than 60 seconds, show seconds
        return `${diffInSeconds} sec${diffInSeconds > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 60 * 60) {
        // If less than 60 minutes (1 hour), show minutes
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 24 * 60 * 60) {
        // If less than 24 hours, show hours
        const hours = Math.floor(diffInSeconds / (60 * 60));
        return `${hours} hr${hours > 1 ? 's' : ''} ago`;
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
                <Row gutter={8} align="middle">
                  <Col xs={18} sm={18} md={20} lg={20} xl={20}>
                    <AutoComplete
                      options={options}
                      onSearch={handleSearch}
                      onSelect={handleSelect}
                      onChange={(value) => {
                        if (!value) {
                          handleClearSearch();
                        } else {
                          setSearchValue(value);
                        }
                      }}
                      value={searchValue}
                      allowClear
                      clearIcon={<CloseCircleOutlined style={{ color: 'red' }} />}
                      placeholder={intl.formatMessage({ id: 'searchPlaceholder' })}
                      style={{ width: '100%', marginBottom: '0px' }}
                    />
                  </Col>
                  <Col xs={6} sm={6} md={4} lg={4} xl={4}>
                    <Button
                      icon={<FilterOutlined />}
                      onClick={() => setShowFilters(!showFilters)}
                      type={showFilters ? 'primary' : 'default'}
                    />
                  </Col>
                </Row>
              )}
  
              {/* Filters for both staff and volunteers */}
              {(showFilters || visitorInfo.role === 'volunteer') && (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  {/* Date Filter */}
                  <Radio.Group
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <Radio.Button value="today">Today</Radio.Button>
                    <Radio.Button value="pastWeek">Past Week</Radio.Button>
                    <Radio.Button value="all">All</Radio.Button>
                  </Radio.Group>
  
                  {/* Status Filter (only for staff) */}
                  {visitorInfo.role === 'staff' && (
                    <Radio.Group
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ marginTop: '-2px' }}
                    >
                      <Radio.Button value="good">Good</Radio.Button>
                      <Radio.Button value="notGood">Not Good</Radio.Button>
                      <Radio.Button value="notAround">Not Around</Radio.Button>
                      <Radio.Button value="all">All</Radio.Button>
                    </Radio.Group>
                  )}
                </Space>
              )}
  
              {filteredVisits.length === 0 && !loading ? (
                <Text>{intl.formatMessage({ id: 'noVisits' })}</Text>
              ) : (
                filteredVisits.map((visit) => {
                  const visitor = vasMap[visit.visitor_id];
                  if (!visitor) {
                    return null; // Wait until visitor info is loaded
                  }
  
                  // Volunteers can only see mode_of_interaction, submission_time, and status
                  const isVolunteer = visitorInfo.role === 'volunteer';
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
                        <Col>
                          <div>
                            {/* For volunteers, only display mode_of_interaction, submission_time, and status */}
                            {isVolunteer ? (
                              <>
                                {/* Location */}
                                <Text>
                                  <EnvironmentOutlined style={{ marginRight: '8px' }} />
                                  {visit.mode_of_interaction || intl.formatMessage({ id: 'NA' })}
                                </Text>
                                <br />
  
                                {/* Time */}
                                <Text style={{ fontSize: '12px' }}>
                                  <ClockCircleOutlined style={{ marginRight: '8px' }} />
                                  {dayjs(visit.submission_time).format('D MMM YYYY, h:mmA')}{' '}
                                  <Text type="secondary" strong style={{ fontSize: '9px' }}>
                                    ({formatTimeDifference(visit.submission_time)})
                                  </Text>
                                </Text>
                                <br />
  
                                {/* Status */}
                                {visit.status === 'Good' && (
                                  <Text strong style={{ color: 'green', fontSize: '12px' }}>
                                    <CheckCircleOutlined
                                      style={{ color: 'green', marginRight: '8px' }}
                                    />
                                    Good
                                  </Text>
                                )}
                                {visit.status === 'Not Good' && (
                                  <Text strong style={{ color: 'red', fontSize: '12px' }}>
                                    <ExclamationCircleOutlined
                                      style={{ color: 'red', marginRight: '8px' }}
                                    />
                                    Not Good
                                  </Text>
                                )}
                                {visit.status === 'Not Around' && (
                                  <Text strong style={{ color: 'orange', fontSize: '12px' }}>
                                    <QuestionCircleOutlined
                                      style={{ color: 'orange', marginRight: '8px' }}
                                    />
                                    Not Around
                                  </Text>
                                )}
                              </>
                            ) : (
                              <>
                                {/* Staff view, with full information */}
                                <UserOutlined style={{ marginRight: '8px' }} />
                                <Text strong style={{ fontSize: '12px' }}>{visitor.full_name}</Text>
                                <div>
                                  <Text style={{ color: 'purple', fontSize: '12px' }}>
                                    {visitor.volunteer_service_role_and_organisation}
                                  </Text>
                                </div>
  
                                {/* Location */}
                                <Text>
                                  <EnvironmentOutlined style={{ marginRight: '8px' }} />
                                  {visit.mode_of_interaction || intl.formatMessage({ id: 'NA' })}
                                </Text>
                                <br />
  
                                {/* Time */}
                                <Text style={{ fontSize: '12px' }}>
                                  <ClockCircleOutlined style={{ marginRight: '8px' }} />
                                  {dayjs(visit.submission_time).format('D MMM YYYY, h:mmA')}{' '}
                                  <Text type="secondary" strong style={{ fontSize: '9px' }}>
                                    ({formatTimeDifference(visit.submission_time)})
                                  </Text>
                                </Text>
                                <br />
  
                                {/* Status */}
                                {visit.status === 'Good' && (
                                  <Text strong style={{ color: 'green', fontSize: '12px' }}>
                                    <CheckCircleOutlined
                                      style={{ color: 'green', marginRight: '8px' }}
                                    />
                                    Good
                                  </Text>
                                )}
                                {visit.status === 'Not Good' && (
                                  <Text strong style={{ color: 'red', fontSize: '12px' }}>
                                    <ExclamationCircleOutlined
                                      style={{ color: 'red', marginRight: '8px' }}
                                    />
                                    Not Good
                                  </Text>
                                )}
                                {visit.status === 'Not Around' && (
                                  <Text strong style={{ color: 'orange', fontSize: '12px' }}>
                                    <QuestionCircleOutlined
                                      style={{ color: 'orange', marginRight: '8px' }}
                                    />
                                    Not Around
                                  </Text>
                                )}
                                <br />
  
                                {/* Elderly Comments */}
                                <Text><BellOutlined style={{ marginRight: '8px' }} /> {visit.key_concerns || '-'}</Text>
                              </>
                            )}
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
  
