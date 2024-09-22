import { PhoneOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';
import {
  Avatar,
  Card,
  Col,
  List,
  message,
  Row,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import React, { useEffect, useState } from 'react';
const { Title, Text } = Typography;

dayjs.extend(advancedFormat);

const dateformat = 'D MMM YYYY, hA';

export type ElderlyInfo = {
  id: number;
  elderlyCode: string;
  aacCode: string;
  name: string;
  contactDetails: string;
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
  fallRisk: string;
  fallHistory: FallHistory[];
  socialInteraction: string;
  photoUrl: string;
  languages: Language[];
  visits: VisitInfo[];
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

export type FallHistory = {
  date: string;
  details: string;
};

export type VisitInfo = {
  datetime: string;
  mode: string;
  notes: string;
  visitor: { id: number; name: string; role: string };
  location: string;
  attachments: string[];
};

const ResidentListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ElderlyInfo[]>([]);
  const navigate = useNavigate(); // Use navigate hook for navigation

  useEffect(() => {
    const fetchResidentData = async () => {
      setLoading(true);
      try {
        // Fetch data from the real endpoint (adjust the URL as needed)
        const response = await fetch('/api/fetchSeniors');
        const result = await response.json(); // Now result is an array of seniors
        // Map the result rows into the SeniorInfo type
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
          photoUrl: row.photo_url,
          languages: [row.languages as Language], // Assuming languages is a single enum value
          visits: [], // Handle visits if applicable
        }));
        // Set the data to the state
        setData(seniors);
      } catch (error) {
        message.error('An error occurred when fetching resident data.');
      } finally {
        setLoading(false);
      }
    };
    fetchResidentData();
  }, []);

  const handleCardClick = (id: number) => {
    navigate(`/elderly/${id}`); // Navigate to the detailed page with the id
  };

  return (
    <PageContainer>
      {loading ? (
        <Skeleton active title paragraph={{ rows: 4 }} />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={data}
          renderItem={(elderly) => (
            <List.Item>
              <Card
                bordered={false}
                style={{ marginBottom: 16, cursor: 'pointer' }} // Add pointer cursor for clickable effect
                onClick={() => handleCardClick(elderly.id)} // Make card clickable
              >
                <Row gutter={16}>
                  <Col xs={6} sm={4}>
                    <Avatar
                      size={96}
                      src={
                        elderly.photoUrl || 'https://via.placeholder.com/96'
                      }
                      shape="square"
                      alt={elderly.name}
                    />
                  </Col>
                  <Col xs={18} sm={20}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: '100%' }}
                    >
                      <Title level={4} style={{ margin: 0 }}>
                        {elderly.name}
                      </Title>
                      <Text>Senior Code: {elderly.elderlyCode}</Text>
                      <Text>
                        Contact: {elderly.contactDetails} <PhoneOutlined />
                      </Text>
                      {elderly.nok.map((nok, index) => (
                        <Text key={index}>
                          NOK ({nok.relationship}): {nok.name},{' '}
                          {nok.contactDetails} <PhoneOutlined />
                        </Text>
                      ))}
                      <Text>
                        Address: {elderly.block} {elderly.floor}-
                        {elderly.unitNumber}, {elderly.address},{' '}
                        {elderly.postalCode}
                      </Text>
                      <Text>Notes: {elderly.notes}</Text>
                      <Text>
                        Last Visit:{' '}
                        {elderly.visits.length > 0
                          ? `${dayjs(elderly.visits[0].datetime).format(
                              dateformat,
                            )}`
                          : 'No visits recorded'}
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </List.Item>
          )}
        />
      )}
    </PageContainer>
  );
};

export default ResidentListPage;
