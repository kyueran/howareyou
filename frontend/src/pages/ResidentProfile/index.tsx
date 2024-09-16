import {
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PrinterOutlined,
  QrcodeOutlined,
  SaveOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Flex,
  Image,
  List,
  message,
  Modal,
  QRCode,
  Row,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import html2canvas from 'html2canvas';
import { useEffect, useRef, useState } from 'react';

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

dayjs.extend(advancedFormat);

const dateformat = 'D MMM YYYY, hA';

const { Title, Text, Paragraph } = Typography;

type VisitInfo = {
  datetime: string;
  notes: string;
  visitor: API.UserInfo;
  location: string;
  attachments: string[];
};

type NokInfo = {
  name: string;
  relationship: string;
  contact: number;
};

type Language =
  | 'Chinese'
  | 'Mandarin'
  | 'Malay'
  | 'Tamil'
  | 'Hokkien'
  | 'Teochew'
  | 'Cantonese';

type ResidentProfileInfo = {
  id: number;
  name: string;
  address: string;
  nok: NokInfo[];
  notes: string;
  contact: number;
  elderlyCode: string;
  aacCode: string;
  attachments: string[];
  visits: VisitInfo[];
  languages: Language[];
};

const ResidentProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResidentProfileInfo>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const { styles } = useGradientButtonStyle();

  useEffect(() => {
    const fetchResidentData = async () => {
      setLoading(true);
      try {
        setData(
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                id: 1,
                elderlyCode: 'WL-8829',
                aacCode: 'AAC-123162',
                name: 'Goh Seok Meng',
                address: 'Woodlands Drive 62, #02-144, S623182',
                contact: 81234567,
                nok: [
                  { name: 'David Goh', relationship: 'Son', contact: 91234567 },
                ],
                notes:
                  'Goh Seok Meng lives alone on weekdays, can only speak Hokkien, and has difficulty walking. She does not mind having pictures taken.',
                languages: ['Hokkien'],
                attachments: [],
                visits: [
                  {
                    datetime: '09-10-2024 20:00',
                    visitor: { id: 99, name: 'David', role: 'public' },
                    location: 'Home',
                    attachments: [],
                    notes: 'All good.',
                  },
                  {
                    datetime: '09-08-2024 17:00',
                    visitor: { id: 2, name: 'David Hiong', role: 'volunteer' },
                    location: 'Woodlands Hawker Centre',
                    attachments: [],
                    notes:
                      "Saw auntie at Woodlands Hawker Centre, she's doing well",
                  },
                ],
              });
            }, 1000);
          }),
        );
      } catch (error) {
        message.error('An error occurred when fetching resident data.');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchResidentData();
  }, [params.id]);

  const qrUrl = `${window.location.origin}/howareyou/register-visit/${params.id}`;

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

  const handlePrint = () => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current).then((canvas) => {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(
          '<img src="' +
            canvas.toDataURL('image/png') +
            '" style="width: 100%;"/>',
        );
        printWindow?.document.close();
        printWindow?.print();
      });
    }
  };

  const handleRedirectToSubmit = () => {
    history.push(`/register-visit/${params.id}`);
  };

  return (
    <PageContainer style={{ padding: '8px' }}>
      {loading ? (
        <Skeleton active title paragraph={{ rows: 4 }} avatar />
      ) : (
        <ConfigProvider button={{ className: styles.gradientButton }}>
          {/* Profile Information Section */}
          <Card style={{ marginBottom: 8 }} bodyStyle={{ padding: '16px' }}>
            <Row gutter={[8, 8]} align="middle">
              <Col xs={8} sm={6}>
                <Avatar
                  size={96}
                  shape="square"
                  src={
                    data?.attachments[0] || 'https://via.placeholder.com/128'
                  }
                  alt="Elderly Profile Picture"
                />
              </Col>
              <Col xs={16} sm={18}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: '100%' }}
                >
                  <Title level={4} style={{ margin: 0 }}>
                    Elderly Profile
                  </Title>
                  <Row justify="space-between">
                    <Col>
                      <Text strong style={{ fontSize: '14px' }}>
                        Elderly Code:
                      </Text>{' '}
                      {data?.elderlyCode}
                    </Col>
                    <Col>
                      <Button
                        type="text"
                        onClick={showModal}
                        icon={<QrcodeOutlined style={{ fontSize: '24px' }} />}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Text strong style={{ fontSize: '14px' }}>
                        AAC Code:
                      </Text>{' '}
                      {data?.aacCode}
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>
            <Divider style={{ margin: '16px 0' }} />

            {/* Custom Layout for Descriptions */}
            <Row gutter={[4, 4]}>
              <Col xs={24} sm={12}>
                <Text strong style={{ fontSize: '14px' }}>
                  Name:
                </Text>{' '}
                <Text>{data?.name}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong style={{ fontSize: '14px' }}>
                  Contact:
                </Text>{' '}
                <Text>
                  {data?.contact} <PhoneOutlined />
                </Text>
              </Col>
              {data?.nok.map((nok, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Text strong style={{ fontSize: '14px' }}>
                    NOK ({nok.relationship}):
                  </Text>{' '}
                  <Text>
                    {nok.name}, {nok.contact} <PhoneOutlined />
                  </Text>
                </Col>
              ))}
              <Col xs={24} sm={12}>
                <Text strong style={{ fontSize: '14px' }}>
                  Address:
                </Text>{' '}
                <Text>{data?.address}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong style={{ fontSize: '14px' }}>
                  Notes:
                </Text>{' '}
                <Paragraph
                  ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                >
                  {data?.notes}
                </Paragraph>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong style={{ fontSize: '14px' }}>
                  Attachments:
                </Text>{' '}
                <Text>
                  {data?.attachments.length > 0 ? 'Available' : 'None'}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Flex justify="space-between">
                  <div>
                    <Text strong style={{ fontSize: '14px' }}>
                      Last Visit:
                    </Text>
                    {data?.visits && data.visits.length > 0 ? (
                      <>
                        <br />
                        <Text>
                          {dayjs(data.visits[0].datetime).format(dateformat)}
                        </Text>{' '}
                        <br />
                        By {data.visits[0].visitor.name} (
                        <Text type="secondary">
                          {data.visits[0].visitor.role}
                        </Text>
                        ) <br />
                        <Text style={{ color: 'green' }}>
                          {dayjs().diff(dayjs(data.visits[0].datetime), 'days')}{' '}
                          days ago
                        </Text>
                      </>
                    ) : (
                      <Text>No visits</Text>
                    )}
                  </div>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={handleRedirectToSubmit}
                    style={{
                      marginTop: '24px',
                      paddingTop: '20px',
                      paddingBottom: '20px',
                    }}
                  >
                    Submit Info
                  </Button>
                </Flex>
              </Col>
            </Row>
          </Card>

          {/* Recent Visits Section */}
          <Card style={{ marginTop: 8 }} bodyStyle={{ padding: '16px' }}>
            <Title level={4} style={{ marginBottom: 8 }}>
              Recent Visits
            </Title>
            <List
              itemLayout="vertical"
              dataSource={data?.visits || []}
              renderItem={(visit) => (
                <List.Item style={{ padding: '8px' }}>
                  <Card
                    bordered={false}
                    style={{ backgroundColor: '#f9f9f9' }}
                    bodyStyle={{ padding: '8px' }}
                  >
                    <Row gutter={[8, 8]}>
                      <Col xs={8} sm={6}>
                        {visit.attachments && visit.attachments.length > 0 ? (
                          <Image
                            width={64}
                            height={48}
                            src={visit.attachments[0]}
                            alt={`Visit image`}
                            style={{ borderRadius: '4px' }}
                          />
                        ) : (
                          <Image
                            width={64}
                            height={48}
                            src="https://via.placeholder.com/64x48?text=No+Image"
                            alt="Placeholder"
                            style={{ borderRadius: '4px' }}
                          />
                        )}
                      </Col>
                      <Col xs={16} sm={18}>
                        <Space direction="vertical" size="small">
                          <Text style={{ fontSize: '14px' }}>
                            {visit.notes}
                          </Text>
                          <Text style={{ fontSize: '14px' }}>
                            <UserOutlined /> {visit.visitor.name},{' '}
                            <Text type="secondary">{visit.visitor.role}</Text>
                          </Text>
                          <Text style={{ fontSize: '14px' }}>
                            <CalendarOutlined />{' '}
                            {dayjs(visit.datetime).format(dateformat)} (
                            {dayjs().diff(dayjs(visit.datetime), 'days')} days
                            ago)
                          </Text>
                          <Text style={{ fontSize: '14px' }}>
                            <EnvironmentOutlined /> {visit.location}
                          </Text>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          </Card>

          <Modal
            title="QR Code"
            open={isModalVisible}
            onCancel={handleCancel}
            footer={[
              <Button
                key="print"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Print
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
            <div
              ref={qrCodeRef}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '16px',
              }}
            >
              <QRCode value={qrUrl} size={180} errorLevel="H" />
            </div>
            <Paragraph style={{ textAlign: 'center' }}>
              Elderly Code: {data?.elderlyCode}
            </Paragraph>
          </Modal>
        </ConfigProvider>
      )}
    </PageContainer>
  );
};

export default ResidentProfilePage;
