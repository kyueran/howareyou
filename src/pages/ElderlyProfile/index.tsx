import {
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PlusOutlined,
  PrinterOutlined,
  QrcodeOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useParams, useNavigate } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  List,
  message,
  Modal,
  QRCode,
  Row,
  Skeleton,
  Space,
  Typography,
  Image,
} from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import React, { useEffect, useRef, useState } from 'react';
import { ElderlyInfo, VisitInfo } from '../Home'; // Ensure path is correct
import html2canvas from 'html2canvas';

const { Title, Text, Paragraph } = Typography;

dayjs.extend(advancedFormat);

const dateformat = 'D MMM YYYY, hA';

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

  useEffect(() => {
    const fetchResidentData = async () => {
      setLoading(true);
      try {
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
          visits: [],
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
          setVisits(result.data.filter((visit: VisitInfo) => visit.elderly_id === Number(params.id)));
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
      case 'low':
      case 'mild':
      case 'isolated':
      case 'washing':
      case 'toileting':
      case 'dressing':
      case 'feeding':
      case 'mobility':
      case 'transferring':
        return { color: 'red' }; // Use Ant Design built-in red color for warnings
      case 'high':
        return { color: '#fa8c16' }; // Orange
      default:
        return { color: '#595959' }; // Default gray
    }
  };

  const getDaysLivingAloneColor = (days: number) => {
    if (days <= 3) {
      return { color: 'red' };
    } else if (days <= 5) {
      return { color: '#fa8c16' }; // Orange
    } else {
      return { color: '#52c41a' }; // Green
    }
  };

  return (
    <PageContainer style={{ padding: '8px' }}>
      {loading ? (
        <Skeleton active title paragraph={{ rows: 4 }} avatar />
      ) : (
        <ConfigProvider button={{ className: styles.gradientButton }}>
          {/* Profile Information Section */}
          <Card style={{ marginBottom: 8 }} bodyStyle={{ padding: '16px' }}>
            <Row>
              <Col>
                <Title level={4} style={{ margin: 0 }}>{data?.name}</Title>
                <Text style={{ color: '#7b7b7b' }}>{`${data?.block} ${data?.floor}-${data?.unitNumber}, ${data?.address}, ${data?.postalCode}`}</Text>
              </Col>
            </Row>

            <Row style={{ marginTop: 4 }} gutter={0} align='middle' justify='space-between'>
              <Col xs={10}>
                <Image
                  style={{ maxWidth: '120px', maxHeight: '120px', cursor: 'pointer' }} 
                  width='100%'
                  height='100%'
                  src={data?.photoUrl || 'https://via.placeholder.com/128'}
                  alt="Elderly Profile Picture"
                />
              </Col>
              <Col xs={14}>
                <Space direction='horizontal' style={{ width: '100%', maxWidth: 240, justifyContent: 'space-between' }}>
                  <Space direction='vertical' style={{ paddingLeft: 12 }}>
                    <div>
                      <Text strong>Senior Code:</Text> <Text>{data?.elderlyCode}</Text>
                      <br />
                      <Text strong>Centre Code:</Text> <Text>{data?.aacCode}</Text>
                    </div>
                    <Button style={{ marginTop: 8 }} type="primary" icon={<PlusOutlined />} onClick={handleSubmitInfo}>
                      Add Visit
                    </Button>
                  </Space>
                  <Button onClick={showModal} icon={<QrcodeOutlined style={{ fontSize: '24px', alignItems: 'center' }} />} />
                </Space>
              </Col>
            </Row>

            {/* NOK Section */}
            <Row style={{ marginTop: '12px' }}>
              <Col>
                <Text strong>NOK:</Text> 
                {data?.nok.map((nok, index) => (
                  <Text key={index} style={{ display: 'block', fontSize: '14px' }}>
                    {nok.name} ({nok.relationship}) - {nok.contactDetails} <PhoneOutlined />
                  </Text>
                ))}
              </Col>
            </Row>

            {/* Social Information */}
            <Row style={{ marginTop: '12px' }}>
              <Col>
                <Text strong>Days Living Alone: </Text> 
                <Text style={getDaysLivingAloneColor(data?.noOfDaysLivingAlone || 0)}>{data?.noOfDaysLivingAlone} days</Text>
                <br />
                <Text strong>Social Interaction Level: </Text> 
                <Text style={getTextColor(data?.socialInteraction || '')}>{data?.socialInteraction}</Text>
              </Col>
            </Row>

            {/* Health Information */}
            <Row style={{ marginTop: '12px' }}>
              <Col>
                <Text strong>ADL Difficulty: </Text> 
                <Text style={getTextColor(data?.adlDifficulty.join(', ') || '')}>
                  {data?.adlDifficulty.join(', ') || 'None'}
                </Text>
                <br />
                <Text strong>Fall Risk: </Text> 
                <Text style={getTextColor(data?.fallRisk || '')}>{data?.fallRisk}</Text>
                <br />
                <Text strong>Fall History:</Text>
                <ul style={{ margin: 0, marginLeft: 8, paddingLeft: '16px' }}>
                  {data?.fallHistory
                    ? data.fallHistory.map((fall, index) => (
                        <li key={index}>
                          {dayjs(fall.date).format('D MMM YYYY')} - {fall.details}
                        </li>
                      ))
                    : 'None'}
                </ul>
              </Col>
            </Row>

            {/* Other Information */}
            <Row style={{ marginTop: '12px' }}>
              <Col>
                <Text strong>Notes:</Text>
                <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>{data?.notes}</Paragraph>
                <Text strong>Key Attachments: </Text> 
                <Text>{data?.keyAttachments.length > 0 ? 'Available' : 'None'}</Text>
              </Col>
            </Row>
          </Card>

          {/* Recent Visits Section */}
          <Card style={{ marginTop: 8 }} bodyStyle={{ padding: '16px' }}>
            <Title level={4} style={{ marginBottom: 8 }}>Recent Visits</Title>
            <List
              itemLayout="vertical"
              dataSource={visits}
              renderItem={(visit) => (
                <List.Item>
                  <Card bordered={false} style={{ backgroundColor: '#f9f9f9' }} bodyStyle={{ padding: '8px' }}>
                    <Row gutter={[0, 0]}>
                      <Col xs={8}>
                        {visit.photo_urls?.[0] ? (
                          <Image
                            src={visit.photo_urls[0]}
                            width={96}
                            height={96}
                            style={{ maxWidth: '200px', maxHeight: '200px', cursor: 'pointer' }}
                          />
                        ) : (
                          <Image src="https://via.placeholder.com/64x48?text=No+Image" width={64} height={48} />
                        )}
                      </Col>
                      <Col xs={16}>
                        <Space size={0} direction="vertical">
                          <Text>{visit.comments || 'No comments available.'}</Text>
                          <Text>👤 {visit.visitor_id}</Text>
                          <Text>📅 {dayjs(visit.submission_time).format(dateformat)}</Text>
                          <Text>📍 {visit.mode_of_interaction || 'N/A'}</Text>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          </Card>

          <Modal title="QR Code" open={isModalVisible} onCancel={handleCancel} footer={[
              <Button key="print" icon={<PrinterOutlined />} onClick={() => html2canvas(qrCodeRef.current!).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const printWindow = window.open('', '_blank');
                printWindow?.document.write(`<img src='${imgData}' style='width: 100%' />`);
                printWindow?.document.close();
                printWindow?.print();
              })}>Print QR Code</Button>,
              <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSaveAsImage}>Save as Image</Button>,
            ]}>
            <div ref={qrCodeRef} style={{ textAlign: 'center' }}>
              <QRCode value={qrUrl} size={180} />
            </div>
          </Modal>
        </ConfigProvider>
      )}
    </PageContainer>
  );
};

export default ResidentProfilePage;
