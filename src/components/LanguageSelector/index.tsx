import { GlobalOutlined } from '@ant-design/icons';
import { getLocale, setLocale } from '@umijs/max';
import { Select, Typography } from 'antd';
import React from 'react';

const { Option } = Select;
const { Text } = Typography;

const languageMap = {
  'en-US': 'English',
  'zh-CN': '中文',
  'ms-MY': 'Melayu',
  'ta-IN': 'தமிழ்',
};

const LanguageSelector: React.FC = () => {
  let currentLocale = getLocale();
  currentLocale = Object.keys(languageMap).includes(currentLocale)
    ? currentLocale
    : 'en-US';

  const handleChange = (e: string) => {
    const key = Object.keys(languageMap).find((k) => languageMap[k] === e);
    setLocale(key, false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Text strong>Choose Language:</Text>
      <Select
        defaultValue={languageMap[currentLocale]}
        optionLabelProp="label"
        placeholder={
          <React.Fragment>
            <GlobalOutlined style={{ marginRight: '10px' }} />
            &nbsp;
            {languageMap[currentLocale]}
          </React.Fragment>
        }
        onChange={handleChange}
      >
        {Object.entries(languageMap).map(([key, value]) => (
          <Option
            key={key}
            value={value}
            label={
              <React.Fragment>
                <GlobalOutlined style={{ marginRight: '4px' }} />
                &nbsp;
                {value}
              </React.Fragment>
            }
          >
            {value}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default LanguageSelector;
