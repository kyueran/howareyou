import { Avatar, Space, Typography } from 'antd';
import React from 'react';
import Logo from '../../assets/undraw_grandma_re_rnv1.svg';

type LogoTitleSubtitleProps = {
  title: string;
  subtitle: string;
};

const LogoTitleSubtitle: React.FC<LogoTitleSubtitleProps> = (props) => {
  const { Title, Text } = Typography;
  const title = props.title;
  const subtitle = props.subtitle;
  return (
    <Space>
      <Avatar size={64} src={Logo} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Title level={2} style={{ margin: '0px' }}>
          {title}
        </Title>
        <Text>{subtitle}</Text>
      </div>
    </Space>
  );
};

export default LogoTitleSubtitle;
