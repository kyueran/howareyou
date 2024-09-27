import { Avatar, Button, Col, Collapse, Layout, Row, Typography } from 'antd';
import React from 'react';
import { flushSync } from 'react-dom';
import ChineseMan1 from '../../assets/chinese-man-1.jpg';
import ChineseMan2 from '../../assets/chinese-man-2.jpg';
import ChineseWoman1 from '../../assets/chinese-woman-1.jpg';
import ChineseWoman2 from '../../assets/chinese-woman-2.jpg';
import IndianMan from '../../assets/indian-man.jpg';
import IndianWoman from '../../assets/indian-woman.jpg';
//@ts-ignore
import { purple } from '@ant-design/colors';
import { history, useModel } from 'umi';
import LogoTitleSubtitle from '../../components/LogoTitleSubtitle';

const { Header, Content } = Layout;
const { Panel } = Collapse;

const LandingPage: React.FC = () => {
  const { Title, Text } = Typography;
  const { initialState, setInitialState } = useModel('@@initialState');

  const staffUsers = [
    {
      id: 1,
      role: 'staff',
      volunteer_or_staff_code: 'S001',
      phone_number: '+6591234567',
      full_name: 'Sarah Kong',
      home_address: 'Blk 123 Woodlands Ave 6, #10-145',
      postal_code: '730123',
      volunteer_service_role_and_organisation: 'PA Staff (Woodlands)',
      access_rights: 'woodlands',
      profile_pic: ChineseWoman1,
    },
    {
      id: 2,
      role: 'staff',
      volunteer_or_staff_code: 'S002',
      phone_number: '+6591345678',
      full_name: 'Sam Chow',
      home_address: 'Blk 234 Queenstown St 32, #05-123',
      postal_code: '149234',
      volunteer_service_role_and_organisation: 'AAC Staff (Queenstown)',
      access_rights: 'queenstown',
      profile_pic: ChineseMan1,
    },
    {
      id: 3,
      role: 'staff',
      volunteer_or_staff_code: 'S003',
      phone_number: '+6591456789',
      full_name: 'Sally Liew',
      home_address: 'Blk 345 Bedok North Ave 3, #12-567',
      postal_code: '460345',
      volunteer_service_role_and_organisation: 'AAC Staff (Admin)',
      access_rights: 'all',
      profile_pic: ChineseWoman2,
    },
  ];

  const volunteerUsers = [
    {
      id: 4,
      role: 'volunteer',
      volunteer_or_staff_code: 'V001',
      phone_number: '+6591567890',
      full_name: 'Veeva Shek',
      home_address: 'Blk 456 Tampines St 22, #09-678',
      postal_code: '520456',
      volunteer_service_role_and_organisation: 'AAC Volunteer',
      access_rights: 'none',
      profile_pic: IndianWoman,
    },
    {
      id: 5,
      role: 'volunteer',
      volunteer_or_staff_code: 'V002',
      phone_number: '+6591678901',
      full_name: 'Viknesh Singh',
      home_address: 'Blk 567 Bukit Batok West Ave 8, #03-456',
      postal_code: '650567',
      volunteer_service_role_and_organisation: 'Lions Befrienders',
      access_rights: 'none',
      profile_pic: IndianMan,
    },
    {
      id: 6,
      role: 'volunteer',
      volunteer_or_staff_code: 'V003',
      phone_number: '+6591789012',
      full_name: 'Vicky Tay',
      home_address: 'Blk 678 Toa Payoh Lorong 4, #07-890',
      postal_code: '310678',
      volunteer_service_role_and_organisation: 'Family / Neighbour',
      access_rights: 'none',
      profile_pic: ChineseMan2,
    },
  ];

  const faqs = [
    {
      question: 'Background Information',
      answer: `As Singapore’s population ages, 100,000 seniors will have mild disabilities, and 83,000 will live alone by 2030.\n\nRecently, Silver Generation Office (SGO) has launched a new pilot programme called Community Monitoring System (CMS). SGO has shorlisted at-risk seniors living alone with health concerns and poor social support and requires weekly home visits.`,
    },
    {
      question: 'Why are home visits important?',
      answer: `1. Regular home visits help detect early signs of distress and provide medical or social interventions.\n\n2. Research also shown that home visits significantly reduce mortality and delay the need for long-term care (Elkan et al., 2001).\n\n3. In the first 3 months of CMS pilot, 5 - 10% of seniors received life-changing support, including medical referrals, social worker referrals and hospitalisations.`,
    },
    {
      question: 'What is our problem statement?',
      answer: `AAC and PA’s role in CMS pilot is to visit shortlisted elderly 1x every week to detect signs of distress and intervene early. Despite early successes, they faced some challenges:\n\n1. Data sharing between SGO, AAC and PA are silo-ed. There is no centralised platform to share visitations data. Currently, AAC and PA staffs must fill up a FormSG for every door they visit. Submission rate is low today.\n\n2. Visitations done by other community partners (e.g., Lion Befrienders) and informal groups (e.g., families and neighbours) are not captured. This could be useful additional information and could potentially reduce burden on staffs.`,
    },
    {
      question: 'What is our solution?',
      answer: `Our HowAreYou application empowers:\n\n1. Community members (e.g., Lions befriends, family and friends) can also submit their visitation data via QR code.\n\n2. Staff from SGO, AIC, and PA have access to a centralised platform that allows them to:\n\t• View a database of elderly individuals and visitation records.\n\t• Receive smart recommendations on who to visit next, based on live GPS location.`,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header Section with Flexbox */}
      <Header
        style={{
          backgroundColor: purple[2],
          padding: '20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100px',
        }}
      >
        {/* <Title level={2} style={{ margin: 0 }}>
          HowAreYou
        </Title>
        <Text>Empowering Communities to Care for the Elderly</Text> */}
        <LogoTitleSubtitle
          title="HowAreYou"
          subtitle="Empowering Communities to Care"
        />
      </Header>

      {/* Content Section */}
      <Content style={{ padding: '50px', backgroundColor: purple[1] }}>
        {/* Grid layout with two rows and three columns */}
        <Row gutter={[16, 16]}>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Title level={4}>
              Login as a{' '}
              <span style={{ color: 'red', fontSize: '24px' }}>STAFF</span>
            </Title>
            <Text type="secondary">
              Staffs have privileged access to selected elderly’s database and
              visit logs.
            </Text>
          </Col>
          {staffUsers.map((user) => {
            return (
              <Col key={user.id} xs={24} sm={12} md={8}>
                <Button
                  type="primary"
                  block
                  style={{
                    border: 'none', // Remove default border
                    borderRadius: '10px', // Rounded corners
                    padding: '15px', // Padding for better spacing
                    height: 'auto', // Allow height to adjust automatically
                  }}
                  onClick={() => {
                    localStorage.setItem('userRole', user.role);
                    localStorage.setItem('user', JSON.stringify(user));
                    flushSync(() =>
                      setInitialState({ ...initialState, ...user }),
                    );
                    const redirectUrl =
                      new URLSearchParams(location.search).get('redirect') ||
                      '/home';
                    history.push(redirectUrl);
                  }}
                >
                  <Row gutter={[16, 16]} style={{ width: '100%' }}>
                    <Col span={8}>
                      <Avatar shape="square" src={user.profile_pic} size={64} />
                    </Col>
                    <Col span={16}>
                      <Row>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {user.full_name}
                        </span>
                      </Row>
                      <Row>
                        <span style={{ fontSize: '14px', marginTop: '5px' }}>
                          {user.volunteer_service_role_and_organisation}
                        </span>
                      </Row>
                    </Col>
                  </Row>
                </Button>
              </Col>
            );
          })}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: '50px' }}>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Title level={4}>
              Log in as a{' '}
              <span style={{ color: 'red', fontSize: '24px' }}>VOLUNTEER</span>
            </Title>
            <Text type="secondary">
              Volunteers can submit visitation records by scanning a QR code
              provided for each elderly resident.
            </Text>
          </Col>
          {volunteerUsers.map((user) => {
            return (
              <Col key={user.id} xs={24} sm={12} md={8}>
                <Button
                  type="primary"
                  block
                  style={{
                    border: 'none', // Remove default border
                    borderRadius: '10px', // Rounded corners
                    padding: '15px', // Padding for better spacing
                    height: 'auto', // Allow height to adjust automatically
                  }}
                  onClick={() => {
                    localStorage.setItem('userRole', user.role);
                    localStorage.setItem('user', JSON.stringify(user));
                    flushSync(() =>
                      setInitialState({ ...initialState, ...user }),
                    );
                    history.push('/home');
                  }}
                >
                  <Row gutter={[16, 16]} style={{ width: '100%' }}>
                    <Col span={8}>
                      <Avatar shape="square" src={user.profile_pic} size={64} />
                    </Col>
                    <Col span={16}>
                      <Row>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {user.full_name}
                        </span>
                      </Row>
                      <Row>
                        <span style={{ fontSize: '14px', marginTop: '5px' }}>
                          {user.volunteer_service_role_and_organisation}
                        </span>
                      </Row>
                    </Col>
                  </Row>
                </Button>
              </Col>
            );
          })}
        </Row>
      </Content>
      <Content style={{ padding: '50px', backgroundColor: 'white', flex: 1 }}>
        <h2>Frequently Asked Questions</h2>
        <Collapse accordion>
          <Panel header="1. What is this?" key="1">
            <p>
              Developed by Team AccessBridge, HowAreYou is a visitation record
              management system that enables seamless data sharing between SGO,
              AAC, and PA staff. It also allows contributions to visitation
              records from other community partners, such as Lion Befrienders,
              as well as informal visits by family, friends, and neighbors.
            </p>
          </Panel>
          <Panel header="2. Background information" key="2">
            <p>
              As Singapore's population ages, 100,000 seniors will have mild
              disabilities, and 83,000 will live alone by 2030.
            </p>
            <p>
              Recently, Silver Generation Office (SGO) has launched a new pilot
              programme called Community Monitoring System (CMS). SGO has
              shortlisted at-risk seniors living alone with health concerns and
              poor social support and requires weekly home visits.
            </p>
          </Panel>

          <Panel header="3. Why are home visits important?" key="3">
            <p>
              1. Regular home visits help detect early signs of distress and
              provide medical or social interventions.
            </p>
            <p>
              2. Research has shown that home visits significantly reduce
              mortality and delay the need for long-term care (Elkan et al.,
              2001).
            </p>
            <p>
              3. In the first 3 months of the CMS pilot, 5 - 10% of seniors
              received life-changing support, including medical referrals,
              social worker referrals, and hospitalizations.
            </p>
          </Panel>

          <Panel header="4. What is the problem statement?" key="4">
            <p>
              AAC and PA’s role in CMS is to visit shortlisted elderly 1x every
              week to detect signs of distress and intervene early. Despite
              early successes, they faced some challenges:
            </p>
            <p>
              1. Data sharing between SGO, AAC, and PA is silo-ed. There is no
              centralised platform to share visitations data. Currently, AAC and
              PA staffs must fill up a FormSG for every door they visit.
              Submission rate is low today.
            </p>
            <p>
              2. Visitations done by other community partners (e.g., Lion
              Befrienders) and informal groups (e.g., families and neighbours)
              are not captured. This could be useful additional information and
              could potentially reduce the burden on staff.
            </p>
          </Panel>

          <Panel header="5. What is our solution?" key="5">
            <p>Our HowAreYou application empowers:</p>
            <p>
              1. Community members (e.g., Lions befrienders, family and friends)
              to also submit their visitation data via QR code.
            </p>
            <p>
              2. Staff from SGO, AIC, and PA to have access to a centralised
              platform that allows them to:
            </p>
            <ul>
              <li>
                View a database of elderly individuals and visitation records.
              </li>
              <li>
                Receive smart recommendations on who to visit next, based on
                live GPS location.
              </li>
            </ul>
          </Panel>
        </Collapse>
      </Content>
    </Layout>
  );
};

export default LandingPage;
