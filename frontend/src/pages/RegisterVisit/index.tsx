import { PlusOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Space,
  Typography,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd/es/upload/interface';
import React from 'react';
import ButtonGroupInput from '../../components/ButtonGroupInput';

const { TextArea } = Input;
const { Text, Title } = Typography;

const normFile = (e: any) => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const RegisterVisitPage: React.FC = () => {
  const [form] = Form.useForm();
  const access = useAccess();

  // Handle form submission
  const onFinish = (values: any) => {
    console.log('Form values:', values);
    message.success('Form submitted successfully!');
  };

  // Upload component props
  const uploadProps: UploadProps = {
    action: 'https://jsonplaceholder.typicode.com/posts/', // Dummy endpoint
    listType: 'picture-card',
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
        return Upload.LIST_IGNORE;
      }
      // const isLt2M = file.size / 1024 / 1024 < 2;
      // if (!isLt2M) {
      //   message.error('Image must be smaller than 2MB!');
      //   return Upload.LIST_IGNORE;
      // }
      return true;
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    // <Access accessible={access.isVolunteer}>
    <Row justify="center" style={{ marginTop: '24px' }}>
      <Col xs={22} sm={20} md={16} lg={12}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Title level={3} style={{ marginBottom: '0px' }}>
            Register Visit
          </Title>
          <Card style={{ width: '100%' }} bodyStyle={{ padding: '16px' }}>
            <Row gutter={16} align="middle">
              <Col xs={8} sm={6} md={6} lg={6} xl={5}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '100%', // 1:1 aspect ratio
                    overflow: 'hidden',
                    borderRadius: '8px', // Slightly round the corners
                  }}
                >
                  <img
                    src="https://www.josejeuland.com/wp-content/uploads/2022/11/DSF6022.jpg"
                    alt="Profile"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
              </Col>
              <Col xs={16} sm={18} md={18} lg={18} xl={19}>
                <div>
                  <Text strong style={{ fontSize: '16px' }}>
                    Goh Seok Meng
                  </Text>
                  <br />
                  <Text type="secondary">
                    Woodlands Drive 62, #02-144, S623182
                  </Text>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Button type="primary">View Profile</Button>
                </div>
              </Col>
            </Row>
          </Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={
                <span style={{ fontWeight: 'bold' }}>How is he/she doing?</span>
              }
              name="status"
              rules={[{ required: true, message: 'Please select an option' }]}
            >
              <ButtonGroupInput
                options={[
                  { value: 'good', label: 'GOOD' },
                  { value: 'notGood', label: 'NOT GOOD' },
                  { value: 'notAround', label: 'NOT AROUND' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={
                <span style={{ fontWeight: 'bold' }}>
                  Any comments or observations?
                </span>
              }
              name="comments"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label={
                <div>
                  <Text strong>Any photos to share?</Text>
                  <div>
                    <Text type="secondary">
                      Optional. Seek their consent, and be respectful.
                    </Text>
                  </div>
                </div>
              }
              name="upload"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload {...uploadProps}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Col>
    </Row>
    // </Access>
  );
};

export default RegisterVisitPage;
