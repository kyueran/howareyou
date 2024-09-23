import {
  BellOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  PlusOutlined,
  PrinterOutlined,
  QrcodeOutlined,
  RightOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useAccess, useNavigate, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Image,
  List,
  message,
  Modal,
  QRCode,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import html2canvas from 'html2canvas';
import React, { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import { ElderlyInfo, VisitInfo } from '../Home'; // Ensure path is correct

const { Title, Text, Paragraph } = Typography;

dayjs.extend(advancedFormat);

const useGradientButtonStyle = createStyles(({ prefixCls, css }) => ({
  gradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      border-width: 0;
      color: white;
      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #ff4d4f, #ff7875);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0.8;
      }
    }
  `,
}));

const ResidentProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ElderlyInfo | null>(null);
  const [visits, setVisits] = useState<VisitInfo[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { styles } = useGradientButtonStyle();
  const access = useAccess();

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
          keyConcerns: row.key_concerns || [],
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
          setVisits(
            result.data.filter(
              (visit: VisitInfo) => visit.elderly_id === Number(params.id),
            ),
          );
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

  const getVisitStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not good':
        return 'red'
      case 'good':
        return 'green';
      default:
        return 'grey';
    }
  }

  return (
    <PageContainer style={{ padding: '8px' }}>
      {loading || !data ? (
        <Skeleton active title paragraph={{ rows: 4 }} avatar />
      ) : (
        <ConfigProvider button={{ className: styles.gradientButton }}>
          {/* Profile Information Section */}
          <Card style={{ marginBottom: 8 }} bodyStyle={{ padding: '16px' }}>
            <Row style={{ alignItems: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>
                {data?.name}
              </Title>
            </Row>

            <Row style={{ width: '100%' }}>
              <Col>
                <Space direction="horizontal">
                  <Space.Compact direction="vertical">
                    <Text
                      style={{
                        whiteSpace: 'normal',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {`${data.block} ${data.floor}-${data.unitNumber}, ${data.address}, Singapore ${data.postalCode}`}
                    </Text>
                  </Space.Compact>
                  <div style={{ alignItems: 'center', alignContent: 'center' }}>
                    <Button
                      type="default"
                      size="small"
                      style={{ marginLeft: 8, borderRadius: 4 }} // Center the button vertically
                      icon={
                        <CopyOutlined
                          style={{ color: 'rgba(0, 0, 0, 0.45)' }}
                        />
                      } // Secondary-colored icon
                      onClick={(e) => {
                        handleCopy(e, `${data.address}, ${data.postalCode}`); // Handle copy action
                      }}
                    />
                  </div>
                </Space>
              </Col>
            </Row>

            <Row
              style={{ marginTop: 4 }}
              gutter={8}
              align="middle"
              justify="space-between"
            >
              <Col xs={9} style={{ maxWidth: '128px', maxHeight: '128px' }}>
                <Image
                  style={{ cursor: 'pointer' }}
                  width="100%"
                  height="100%"
                  src={data?.photoUrl || 'https://via.placeholder.com/128'}
                  alt="Elderly Profile Picture"
                />
              </Col>
              <Col xs={15}>
                <Space
                  direction="horizontal"
                  style={{
                    width: '100%',
                    maxWidth: 240,
                    justifyContent: 'space-between',
                  }}
                >
                  <Space direction="vertical" align="center">
                    <div>
                      <Text strong>Senior Code:</Text>{' '}
                      <Text>{data?.elderlyCode}</Text>
                      <br />
                      <Text strong>Centre Code:</Text>{' '}
                      <Text>{data?.centreCode}</Text>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleSubmitInfo}
                    >
                      Add Visit
                    </Button>
                  </Space>
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

            <Row style={{ marginTop: 12 }}>
              <Space
                direction="horizontal"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <Space direction="horizontal">
                  <Text strong>Contact:</Text>
                  <Text style={{ display: 'block', fontSize: '14px' }}>
                    {data?.contactDetails} <PhoneOutlined />
                  </Text>
                </Space>
                <Space direction="horizontal">
                  <Text strong>Call Response:</Text>
                  <Text
                    strong
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      color: data?.callResponse === 'Low' ? 'red' : 'gray',
                    }}
                  >
                    {data?.callResponse ?? 'None'}
                  </Text>
                </Space>
              </Space>
            </Row>

            {/* NOK Section */}
            <Row style={{ marginTop: 4 }}>
              <Col>
                <Text strong>Next-of-kin:</Text>
                {data?.nok.map((nok, index) => (
                  <Text
                    key={index}
                    style={{ display: 'block', fontSize: '14px' }}
                  >
                    {nok.name} ({nok.relationship}) - {nok.contactDetails}{' '}
                    <PhoneOutlined />
                  </Text>
                ))}
              </Col>
            </Row>

            <Row style={{ marginTop: 8 }}>
              <Col>
                <Text strong>Languages: </Text>
                {data && data?.languages.length > 0 ? (
                  data.languages.map((lang, i) => (
                    <Tag key={i} color="" bordered={false}>
                      {lang}
                    </Tag>
                  ))
                ) : (
                  <Text color="gray">None</Text>
                )}
              </Col>
            </Row>

            {/* Social Information */}
            <Row style={{ marginTop: 8 }}>
              <Col style={{ width: '100%', maxWidth: 240 }}>
                <Row justify="space-between">
                  <Col>
                    <Text strong>Days Living Alone (a week): </Text>
                  </Col>
                  <Col>
                    <Text
                      strong
                      style={{ color: getDaysLivingAloneColor(
                        data?.noOfDaysLivingAlone || 0,
                      )}}
                    >
                      {data?.noOfDaysLivingAlone} days
                    </Text>
                  </Col>
                </Row>
                <Row justify="space-between">
                  <Col>
                    <Text strong>Social Interaction Level: </Text>
                  </Col>
                  <Col>
                    <Text
                      strong
                      style={{ color: getTextColor(data?.socialInteraction || '')}}
                    >
                      {data?.socialInteraction}
                    </Text>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Health Information */}
            <Row style={{ marginTop: 8 }}>
              <Col>
                <Text strong>ADL Difficulty: </Text>
                {data && data?.adlDifficulty.length > 0 ? (
                  data.adlDifficulty.map((adl, i) => (
                    <Tag key={i} color={'red'} bordered={false}>
                      {adl}
                    </Tag>
                  ))
                ) : (
                  <Text color="gray">None</Text>
                )}
              </Col>
            </Row>

            <Row style={{ marginTop: 8 }}>
              <Col>
                <Text strong>Fall Risk: </Text>
                <Text strong style={{ color: getTextColor(data?.fallRisk || '') }}>
                  {data?.fallRisk}
                </Text>
                <br />
                <Text strong>Fall History:</Text>
                {data && data.fallHistory.length > 0 ? (
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
                    <Text type="secondary">None</Text>
                    <br />
                  </>
                )}

                <Text strong>Key Concerns (from visits):</Text>
                {data && data.keyConcerns.length > 0 ? (
                  <ul style={{ margin: 0, marginLeft: 8, paddingLeft: '16px' }}>
                    {data.keyConcerns.map((concern, index) => (
                      <li key={index}>
                        {dayjs(concern.date).format('D MMM YYYY')} -{' '}
                        {concern.details}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <br />
                    <Text type="secondary">None</Text>
                  </>
                )}
              </Col>
            </Row>

            {/* Other Information */}
            <Row style={{ marginTop: 8 }}>
              <Col>
                <Text strong>Notes:</Text>
                <Paragraph
                  ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                >
                  {data?.notes}
                </Paragraph>
                <Text strong>Key Attachments: </Text>
                <Text type="secondary">
                  {data && data.keyAttachments.length > 0
                    ? 'Available'
                    : 'None'}
                </Text>
              </Col>
            </Row>
          </Card>

          {/* Recent Visits Section */}
          <Title level={4} style={{ marginTop: 16 }}>
            Recent Visits
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
                    onClick={() => history.push(`/visit/${visit.id}`)}
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
                    bordered={false}
                  >
                    <Row
                      gutter={[16, 16]}
                      align="middle"
                      justify="space-between"
                    >
                      <Col>
                        <Space.Compact direction="vertical" size={0}>
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
                          {visit.comments && (
                            <Space align="center">
                              <BellOutlined />
                              <Text>
                                {visit.comments ||
                                  'Elderly does not want to be visited'}
                              </Text>
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

          <Modal
            title="QR Code"
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
                Print QR Code
              </Button>,
              <Button
                key="save"
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveAsImage}
              >
                Save as Image
              </Button>,
            ]}
          >
            <div ref={qrCodeRef} style={{ textAlign: 'center' }}>
              <QRCode value={qrUrl} size={180} style={{ margin: 'auto' }} />
            </div>
          </Modal>
        </ConfigProvider>
      )}
    </PageContainer>
  );
};

export default ResidentProfilePage;
