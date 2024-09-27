import {
  BellOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  LeftOutlined,
  PlusOutlined,
  PrinterOutlined,
  QrcodeOutlined,
  RightOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAccess, useIntl, useNavigate, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Image,
  List,
  message,
  Modal,
  QRCode,
  Row,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import html2canvas from 'html2canvas';
import React, { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import VisitModal from '../../components/VisitModal';
import { ElderlyInfo, LineItem, VisitInfo } from '../ElderlyResidents'; // Ensure path is correct
import TabPane from 'antd/es/tabs/TabPane';

const { Title, Text, Paragraph } = Typography;

dayjs.extend(advancedFormat);

const ResidentProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ElderlyInfo | null>(null);
  const [visits, setVisits] = useState<VisitInfo[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVisitModalVisible, setIsVisitModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitInfo | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const access = useAccess();
  const intl = useIntl();
  const [keyConcerns, setKeyConcerns] = useState<LineItem[]>([]);

  useEffect(() => {
    const fetchResidentData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/senior/${params.id}`);
        const result = await response.json();
        const seniors: ElderlyInfo[] = result.map((row: any) => ({
          id: row.id,
          elderlyCode: row.elderly_code,
          centreCode: row.aac_code,
          name: row.name,
          contactDetails: row.contact_details,
          callResponse: row.call_response,
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
          languages: [row.languages],
        }));
        setData(seniors[0]);
      } catch (error) {
        message.error('An error occurred when fetching resident data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchVisits = async () => {
      try {
        const response = await fetch(`/api/fetchVisits`);
        const result = await response.json();
        if (result.success) {
          // Filter visits related to this elderly ID
          const relevantVisits: VisitInfo[] = result.data.filter(
            (visit: VisitInfo) => visit.elderly_id === Number(params.id),
          );

          // Sort visits by submission_time in descending order (most recent first)
          const sortedVisits = relevantVisits.sort((a, b) =>
            dayjs(b.submission_time).diff(dayjs(a.submission_time)),
          );

          // Extract key concerns from sorted visits
          const extractedKeyConcerns: LineItem[] = sortedVisits
            .map((visit) => ({
              date: dayjs(visit.submission_time).format('D MMM YYYY, h:mm A'), // Format the date
              details: visit.key_concerns || 'None', // Use 'None' if key concerns are empty
            }))
            .filter((item) => item.details !== 'None'); // Optionally filter out empty concerns

          setVisits(sortedVisits);
          setKeyConcerns(extractedKeyConcerns);
        } else {
          message.error(result.message || 'Failed to fetch visits.');
        }
      } catch (error) {
        message.error('There was an error fetching the visits.');
      }
    };

    if (params.id) {
      fetchResidentData();
      fetchVisits();
    }
  }, [params.id]);

  const qrUrl = `${window.location.origin}/record-visit/${params.id}`;

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSaveAsImage = () => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'qr-code.png';
        link.click();
      });
    }
  };

  // Redirect to the submission page
  const handleSubmitInfo = () => {
    navigate(`/record-visit/${params.id}`);
  };

  // Function to get text color based on values
  const getTextColor = (value: string) => {
    const valueLower = value.toLowerCase();
    switch (valueLower) {
      case 'high': // fall risk
      case 'isolated': // social
      case 'washing': // ADL
      case 'toileting':
      case 'dressing':
      case 'feeding':
      case 'mobility':
      case 'transferring':
        return 'red';
      case 'mild': // fall risk
      case 'limited': // social
        return 'orange';
      case 'healthy':
      case 'low':
        return 'green';
      default:
        return 'gray'; // Default gray
    }
  };

  const getDaysLivingAloneColor = (days: number) => {
    if (days <= 1) {
      return 'green';
    } else if (days <= 4) {
      return 'orange';
    } else {
      return 'red';
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not good':
        return 'red';
      case 'good':
        return 'green';
      default:
        return 'grey';
    }
  };

  return (
    <div>
      <Row
        align="middle" // Vertically align the button and title
        style={{ width: '100%', marginBottom: 8, marginTop: 16, position: 'relative' }} // Add margin to avoid overlap
      >
        <Col flex="none" style={{ marginRight: 'auto', zIndex: 3 }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => history.go(-1)}
          >
            {intl.formatMessage({ id: 'backBtn' })}
          </Button>
        </Col>
        
        <Col flex="auto" style={{ textAlign: 'center', position: 'absolute', left: 0, right: 0 }}>
          <Title level={3} style={{ margin: 0 }}>
            {intl.formatMessage({ id: 'menu.ElderlyProfile' })}
          </Title>
        </Col>
      </Row>

      {loading || !data ? (
        <Skeleton active title paragraph={{ rows: 4 }} />
      ) : (
        <>
          {/* Profile Information Section */}
          <Tabs
            defaultActiveKey="1"
            centered
            type="card"
            tabBarStyle={{ marginBottom: 0 }}
          >
            <TabPane
              key="1"
              tab={intl.formatMessage({ id: 'elderlyProfile' })}
              style={{ backgroundColor: 'white', padding: 16, paddingBottom: '10vh' }}
            >
              {/* Profile Header */}
              <Title level={3} style={{ margin: 0 }}>
                {data.name}
              </Title>

            <Row
              style={{ padding: 16, maxWidth: 400 }}
              gutter={16}
              align="middle"
              justify='space-between'
            >
              <Col xs={9}>
                <Image
                  style={{
                    cursor: 'pointer',
                    maxWidth: '100px',
                    maxHeight: '100px',
                  }}
                  width="100%"
                  height="100%"
                  src={data.photoUrl || 'https://via.placeholder.com/128'}
                  alt={intl.formatMessage({ id: 'altProfilePic' })}
                />
              </Col>
              <Col xs={15}>
                <Space
                  direction="horizontal"
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: 240,
                    justifyContent: 'space-between',
                  }}
                >
                  <Space.Compact direction="vertical" align="center">
                    <div>
                      <Text strong>
                        {intl.formatMessage({ id: 'seniorCode' })}
                      </Text>
                      <Text>{data.elderlyCode}</Text>
                      <br />
                      <Text strong>
                        {intl.formatMessage({ id: 'centreCode' })}
                      </Text>
                      <Text>{data.centreCode}</Text>
                    </div>

                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleSubmitInfo}
                      style={{ marginTop: 8, borderRadius: 5 }}
                    >
                      {intl.formatMessage({ id: 'addVisitBtn' })}
                    </Button>
                  </Space.Compact>
                  <Button
                    onClick={showModal}
                    icon={
                      <QrcodeOutlined
                        style={{ fontSize: '24px', alignItems: 'center' }}
                      />
                    }
                  />
                </Space>
              </Col>
            </Row>

            
            <Card bodyStyle={{ padding: 16, paddingTop: 8, paddingBottom: 8 }} style={{ maxWidth: 400 }}>
              <Row>
              <Space direction="horizontal">
                <Text strong>{intl.formatMessage({ id: 'contact' })}</Text>
                <Text style={{ display: 'block', fontSize: '14px' }}>
                  {data.contactDetails}
                </Text>
              </Space>
              </Row>
              <Row>
                <Space direction="horizontal">
                  <Text strong>
                    {intl.formatMessage({ id: 'callResponse' })}
                  </Text>
                  <Text
                    strong
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      color: data.callResponse === 'Low' ? 'red' : 'gray',
                    }}
                  >
                    {data.callResponse ?? intl.formatMessage({ id: 'none' })}
                  </Text>
                </Space>
              </Row>

              <Row gutter={16} style={{ marginTop: 4, alignItems: 'start' }}>
                <Col> {/* Fixed width for the label */}
                  <Text strong>{intl.formatMessage({ id: 'address' })}</Text>
                </Col>
                <Col flex="auto">
                  {/* Address Line 1 */}
                  <Text style={{ whiteSpace: 'normal', wordWrap: 'break-word', display: 'block' }}>
                    {`${data.block} ${data.floor}-${data.unitNumber}`}
                  </Text>
                  {/* Address Line 2 */}
                  <Text style={{ whiteSpace: 'normal', wordWrap: 'break-word', display: 'block' }}>
                    {`${data.address}, ${data.postalCode}`}
                  </Text>
                </Col>
              </Row>

            {/* NOK Section */}
            <Row gutter={24} style={{ marginTop: 4, alignItems: 'start' }}>
              <Col> {/* Fixed width for the label */}
                <Text strong>{intl.formatMessage({ id: 'nok' })}</Text>
              </Col>
              <Col flex="auto"> {/* The NOK info will take up the remaining space */}
                <Text style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {`${data.nok[0].name} (${data.nok[0].relationship}) - ${data.nok[0].contactDetails}`}
                </Text>
              </Col>
            </Row>

            <Row style={{ marginTop: 4 }}>
              <Col>
                <Text strong>{intl.formatMessage({ id: 'languages' })}</Text>
                {data.languages.length > 0 ? (
                  data.languages.map((lang, i) => (
                    <Tag key={i} color="" bordered={false}>
                      {lang}
                    </Tag>
                  ))
                ) : (
                  <Text color="gray">{intl.formatMessage({ id: 'none' })}</Text>
                )}
              </Col>
            </Row>
            </Card>

            {/* Social Information */}
            <Title level={4} style={{ marginBottom: 8, marginTop: 16 }}>{intl.formatMessage({ id: 'socialInformation' })}</Title>
            <Card bodyStyle={{ padding: 16, paddingTop: 8, paddingBottom: 8 }} style={{ maxWidth: 400 }}>
            <Row>
              <Col style={{ width: '100%', maxWidth: 260 }}>
                <Row justify="space-between">
                  <Col>
                    <Text strong>
                      {intl.formatMessage({ id: 'daysLivingAlone' })}
                    </Text>
                  </Col>
                  <Col>
                    <Text
                      strong
                      style={{
                        color: getDaysLivingAloneColor(
                          data.noOfDaysLivingAlone || 0,
                        ),
                      }}
                    >
                      {data.noOfDaysLivingAlone}
                      {intl.formatMessage({ id: 'days' })}
                    </Text>
                  </Col>
                </Row>
                <Row justify="space-between">
                  <Col>
                    <Text strong>
                      {intl.formatMessage({ id: 'socialInteractionLevel' })}
                    </Text>
                  </Col>
                  <Col>
                    <Text
                      strong
                      style={{
                        color: getTextColor(data.socialInteraction || ''),
                      }}
                    >
                      {data.socialInteraction}
                    </Text>
                  </Col>
                </Row>
              </Col>
            </Row>
            </Card>

            {/* Health Information */}
            <Title level={4} style={{ marginBottom: 8, marginTop: 16 }}>Health</Title>
            <Card bodyStyle={{ padding: 16, paddingTop: 8, paddingBottom: 8 }} style={{ maxWidth: 400 }}>
            <Row>
              <Col>
                <Text strong>
                  {intl.formatMessage({ id: 'adlDifficulty' })}
                </Text>
                {data.adlDifficulty.length > 0 ? (
                  data.adlDifficulty.map((adl, i) => (
                    <Tag key={i} color={'red'} bordered={false}>
                      {adl}
                    </Tag>
                  ))
                ) : (
                  <Text color="gray">{intl.formatMessage({ id: 'none' })}</Text>
                )}
              </Col>
            </Row>

            <Row style={{ marginTop: 8 }}>
              <Col>
                <Text strong>{intl.formatMessage({ id: 'fallRisk' })}</Text>
                <Text
                  strong
                  style={{ color: getTextColor(data.fallRisk || '') }}
                >
                  {data.fallRisk}
                </Text>
                <br />
                <Text strong>{intl.formatMessage({ id: 'fallHistory' })}</Text>
                {data.fallHistory.length > 0 ? (
                  <ul
                    style={{
                      margin: 0,
                      marginLeft: 8,
                      marginBottom: 8,
                      paddingLeft: '16px',
                    }}
                  >
                    {data.fallHistory.map((fall, index) => (
                      <li key={index}>
                        {dayjs(fall.date).format('D MMM YYYY')} - {fall.details}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <br />
                    <Text type="secondary">
                      {intl.formatMessage({ id: 'none' })}
                    </Text>
                    <br />
                  </>
                )}

                <Text strong>{intl.formatMessage({ id: 'keyConcerns' })}</Text>
                {keyConcerns.length > 0 ? (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: '16px',
                        marginLeft: 8,
                        marginBottom: 8,
                      }}
                    >
                      {keyConcerns
                        .sort((a, b) => dayjs(b.date).diff(dayjs(a.date))) // Sort by most recent date first
                        .slice(0, 5) // Get the 5 most recent concerns
                        .map((concern, index) => (
                          <li key={index}>
                            {dayjs(concern.date).format('D MMM YYYY')} - {concern.details}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    intl.formatMessage({ id: 'none' })
                  )}
              </Col>
            </Row>
            </Card>

            {/* Other Information */}
            <Title level={4} style={{ marginBottom: 8, marginTop: 16 }}>Other</Title>
            <Card bodyStyle={{ padding: 16, paddingTop: 8, paddingBottom: 8 }} style={{ maxWidth: 400 }}>
            <Row>
              <Col>
                <Text strong>{intl.formatMessage({ id: 'notes' })}</Text>
                <Paragraph
                  ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                >
                  {data.notes}
                </Paragraph>
                <Text strong>
                  {intl.formatMessage({ id: 'keyAttachments' })}
                </Text>
                <Text type="secondary">
                  {data.keyAttachments.length > 0
                    ? intl.formatMessage({ id: 'available' })
                    : intl.formatMessage({ id: 'none' })}
                </Text>
              </Col>
            </Row>
            </Card>
            </TabPane>

          <TabPane key='2' tab={intl.formatMessage({ id: 'visits' })} style={{ backgroundColor: 'white', padding: 16 }}>
          {/* Recent Visits Section */}
          <Title level={3}>
            {intl.formatMessage({ id: 'recentVisits' })}
          </Title>
          <List
            itemLayout="vertical"
            dataSource={visits}
            renderItem={(visit) => {
              const daysSinceLastVisit = dayjs().diff(
                dayjs(visit.submission_time).startOf('day'),
                'days',
              );
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
                    onClick={() => {
                      setSelectedVisit(visit);
                      setIsVisitModalVisible(true);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)'; // Slightly enlarge the card
                      e.currentTarget.style.boxShadow =
                        '0 6px 16px rgba(0, 0, 0, 0.15)'; // Darker shadow
                      e.currentTarget.style.backgroundColor = '#f0f0f0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'; // Reset scale
                      e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0, 0, 0, 0.1)'; // Reset shadow
                      e.currentTarget.style.backgroundColor = 'white'
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)'; // Enlarge slightly on touch
                      e.currentTarget.style.boxShadow =
                        '0 6px 16px rgba(0, 0, 0, 0.15)'; // Darker shadow
                      e.currentTarget.style.backgroundColor = '#f0f0f0'
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'; // Reset scale
                      e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0, 0, 0, 0.1)'; // Reset shadow
                      e.currentTarget.style.backgroundColor = 'white'
                    }}
                    bordered={false}
                  >
                    <Row
                      gutter={[16, 16]}
                      align="middle"
                      justify="space-between"
                    >
                      <Col>
                        <Space.Compact direction="vertical">
                          {/* User Info */}
                          <Space align="center">
                            <UserOutlined />
                            <Text strong>
                              {access.isStaff
                                ? 'Ms Josephine Lam (AAC Staff)'
                                : 'Mr Wong Ah Fook (Volunteer)'}
                            </Text>
                          </Space>

                          {/* Contact Mode */}
                          <Space align="center">
                            <EnvironmentOutlined />
                            <Text>
                              {visit.mode_of_interaction || 'Unknown'}
                            </Text>
                          </Space>

                          {/* Submission Time */}
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text>
                              {dayjs(visit.submission_time).format(
                                'D MMM YYYY, h:mmA',
                              )}{' '}
                              (
                              <Text
                                strong
                              >{`${daysSinceLastVisit} days ago`}</Text>
                              )
                            </Text>
                          </Space>

                          {/* Status Indicator */}
                          <Space align="center">
                            <ExclamationCircleOutlined />
                            <Text
                              strong
                              style={{
                                color: getVisitStatusColor(visit.status),
                              }}
                            >
                              {visit.status || 'None'}
                            </Text>
                          </Space>

                          {/* Key Concern */}
                          {visit.key_concerns && (
                            <Space align="center">
                              <BellOutlined />
                              <Text>{visit.key_concerns || 'None'}</Text>
                            </Space>
                          )}
                        </Space.Compact>
                      </Col>

                      {/* Right Arrow */}
                      <Col flex="none">
                        <RightOutlined style={{ fontSize: '20px' }} />
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              );
            }}
          />
          </TabPane>
          </Tabs>

          <Modal
            title={intl.formatMessage({ id: 'QRCode' })}
            open={isModalVisible}
            onCancel={handleCancel}
            footer={[
              <Button
                key="print"
                icon={<PrinterOutlined />}
                onClick={() =>
                  html2canvas(qrCodeRef.current!).then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const printWindow = window.open('', '_blank');
                    printWindow?.document.write(
                      `<img src='${imgData}' style='width: 100%' />`,
                    );
                    printWindow?.document.close();
                    printWindow?.print();
                  })
                }
              >
                {intl.formatMessage({ id: 'printQRCode' })}
              </Button>,
              <Button
                key="save"
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveAsImage}
              >
                {intl.formatMessage({ id: 'saveAsImage' })}
              </Button>,
            ]}
          >
            <div ref={qrCodeRef} style={{ textAlign: 'center' }}>
              <QRCode value={qrUrl} size={180} style={{ margin: 'auto' }} />
            </div>
          </Modal>
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
      )}
    </div>
  );
};

export default ResidentProfilePage;
