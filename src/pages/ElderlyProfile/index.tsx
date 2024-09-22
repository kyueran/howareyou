import {
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PrinterOutlined,
  QrcodeOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
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
import React, { useEffect, useRef, useState } from 'react';
import { ElderlyInfo, Language } from '../Home'; // Ensure this path is correct

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

const ResidentProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ElderlyInfo | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ id: string }>(); // Ensure params id is typed
  const { styles } = useGradientButtonStyle();

  useEffect(() => {
    const fetchResidentData = async () => {
      setLoading(true);
      try {
        // Fetch data for the specific elderly using the ID from params
        const response = await fetch(`/api/senior/${params.id}`);
        const result = await response.json();
        const seniors: ElderlyInfo[] = result.map((row: any) => ({
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
          photoBase64: row.photo_base64,
          languages: [row.languages as Language], // Assuming languages is a single enum value
          visits: [], // Handle visits if applicable
        }));
        setData(seniors[0]); // Assuming result matches the ElderlyInfo type
      } catch (error) {
        message.error('An error occurred when fetching resident data.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchResidentData();
  }, [params.id]);

  const qrUrl = `${window.location.origin}/register-visit/${params.id}`;

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

  // Print the entire page with all elderly information
  const handlePrintPage = () => {
    window.print();
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
                  src={data?.photoBase64 || 'https://via.placeholder.com/128'}
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
                        Senior Code:
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
                  {data?.contactDetails} <PhoneOutlined />
                </Text>
              </Col>
              {data?.nok.map((nok, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Text strong style={{ fontSize: '14px' }}>
                    NOK ({nok.relationship}):
                  </Text>{' '}
                  <Text>
                    {nok.name}, {nok.contactDetails} <PhoneOutlined />
                  </Text>
                </Col>
              ))}
              <Col xs={24} sm={12}>
                <Text strong style={{ fontSize: '14px' }}>
                  Address:
                </Text>{' '}
                <Text>{`${data?.block} ${data?.floor}-${data?.unitNumber}, ${data?.address}, ${data?.postalCode}`}</Text>
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
                  {data?.keyAttachments && data?.keyAttachments.length > 0
                    ? 'Available'
                    : 'None'}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="small">
                  <Text strong style={{ fontSize: '14px' }}>
                    Last Visit:
                  </Text>
                  {data?.visits && data.visits.length > 0 ? (
                    <>
                      <Text>
                        {dayjs(data.visits[0].datetime).format(dateformat)}
                      </Text>{' '}
                      By {data.visits[0].visitor.name} (
                      <Text type="secondary">
                        {data.visits[0].visitor.role}
                      </Text>
                      <Text style={{ color: 'green' }}>
                        {dayjs().diff(dayjs(data.visits[0].datetime), 'days')}{' '}
                        days ago
                      </Text>
                    </>
                  ) : (
                    <Text>No visits</Text>
                  )}
                </Space>
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
                onClick={handlePrintPage}
              >
                Print Profile
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
              Senior Code: {data?.elderlyCode}
            </Paragraph>
          </Modal>

          {/* Add a dedicated print button on the main page */}
          <div style={{ textAlign: 'right', marginTop: '16px' }}>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrintPage}
            >
              Print All Information
            </Button>
          </div>
        </ConfigProvider>
      )}
    </PageContainer>
  );
};

export default ResidentProfilePage;
