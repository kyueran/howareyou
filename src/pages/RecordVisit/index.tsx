import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  PlusOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';
import { Access, history, useAccess, useIntl, useParams } from '@umijs/max';
import { upload } from '@vercel/blob/client';
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd/es/upload/interface';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

const normFile = (e: any) => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const RecordVisit: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [customMode, setCustomMode] = useState(false);
  const [seniorData, setSeniorData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const intl = useIntl();
  const access = useAccess();
  const params = useParams<{ id: string }>();

  useEffect(() => {
    const fetchSeniorData = async () => {
      try {
        const response = await fetch(`/api/senior/${params.id}`);
        const data = await response.json();
        console.log(data[0]);
        setSeniorData(data[0]);
      } catch (error) {
        message.error('Failed to fetch senior data');
      } finally {
        setLoading(false);
      }
    };
    fetchSeniorData();
  }, [params.id]);

  const getVisitorId = async (access: Access) => {
    if (access.isVolunteer) {
      return 1;
    } else if (access.isStaff) {
      return 2;
    } else {
      return 3;
    }
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);

    const { id } = params;
    const {
      comments,
      key_concerns,
      modeOfInteraction,
      customModeOfInteraction,
      duration,
    } = values;

    const mode_of_interaction =
      modeOfInteraction === 'others'
        ? customModeOfInteraction
        : modeOfInteraction;
    const relationship = access.isStaff
      ? '$-staff-$'
      : values.relationship || '';

    try {
      const visitor_id = await getVisitorId(access);

      const uploadedPhotoUrls: string[] = [];

      for (const file of selectedFiles) {
        try {
          const result = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: '/api/uploadPhoto',
          });
          uploadedPhotoUrls.push(result.url);
          message.success(
            intl.formatMessage(
              { id: 'photoUploadSuccess' },
              { filename: file.name },
            ),
          );
        } catch (error: any) {
          setSubmitting(false);
          message.error(`Error uploading photo ${file.name}: ${error.message}`);
          return;
        }
      }
      const requestBody: any = {
        elderly_id: parseInt(id, 10),
        visitor_id,
        status: selectedStatus,
        comments,
        photoUrls: uploadedPhotoUrls,
        relationship,
      };

      // Only add keyConcerns, mode_of_interaction, and duration if the user is a staff member
      if (access.isStaff) {
        Object.assign(requestBody, {
          key_concerns: key_concerns,
          mode_of_interaction: mode_of_interaction,
          duration_of_contact: duration,
        });
      }

      const response = await fetch('/api/logVisits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        message.success(intl.formatMessage({ id: 'formSubmitSuccess' }));
        history.push(`/display-visits`);
      } else {
        message.error(
          result.message || 'Failed to log the form. Please try again.',
        );
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      message.error('There was an error submitting the form.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModeChange = (value: string) => {
    if (value === 'others') {
      setCustomMode(true);
    } else {
      setCustomMode(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isCorrectFormat =
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/heic';
      if (!isCorrectFormat) {
        message.error('You can only upload JPG/PNG/HEIC files!');
        return Upload.LIST_IGNORE;
      }

      setSelectedFiles((prevFiles) => [...prevFiles, file]);
      return false;
    },
    onRemove: (file) => {
      setSelectedFiles((prevFiles) =>
        prevFiles.filter((f) => f.name !== file.name),
      );
    },
    listType: 'picture-card',
    fileList: selectedFiles.map((file, index) => ({
      uid: index.toString(),
      name: file.name,
      status: 'done',
    })),
  };

  return (
    <Access accessible={access.isVolunteer || access.isStaff}>
      <Row justify="center" style={{ marginTop: '24px' }}>
        <Col xs={22} sm={20} md={16} lg={12}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Title level={3} style={{ marginBottom: '0px' }}>
              {intl.formatMessage({ id: 'menu.RecordVisit' })}
            </Title>
            <div>
              <Space direction="vertical" size="small">
                <Text strong style={{ fontSize: '16px' }}>
                  {intl.formatMessage({ id: 'residentsAddress' })}
                </Text>{' '}
                {/* Bold and slightly larger label */}
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#595959',
                    backgroundColor: '#d6eaf8', // Light gray background
                    padding: '10px 15px', // Padding around the text
                    borderRadius: '8px', // Rounded corners
                    display: 'inline-block', // Ensures the background wraps tightly around the text
                  }}
                >
                  {`${seniorData?.block} ${seniorData?.floor}-${seniorData?.unit_number}, ${seniorData?.address}, ${seniorData?.postal_code}` ||
                    intl.formatMessage({ id: 'loading' })}
                </Text>
              </Space>
            </div>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label={
                  <Text strong>
                    {intl.formatMessage({ id: 'howIsTheResidentDoing' })}
                  </Text>
                }
                name="status"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'pleaseSelect' }),
                  },
                ]}
              >
                <Space size={40}>
                  {' '}
                  {/* Increased space between buttons */}
                  <Button
                    type="default"
                    icon={
                      <CheckCircleFilled
                        style={{ fontSize: '18px', color: 'green' }}
                      />
                    }
                    size="large"
                    style={{
                      borderWidth: '2px',
                      padding: '30px 40px', // Increase padding
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'transform 0.2s ease-in-out',
                      backgroundColor:
                        selectedStatus === 'Good' ? '#1890ff' : '', // Highlight if selected
                      color: selectedStatus === 'Good' ? 'white' : '', // Change text color when highlighted
                    }}
                    onClick={() => {
                      handleStatusChange('Good'); // Call your handleStatusChange function
                      form.setFieldsValue({ status: 'Good' }); // Set the form value
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {intl.formatMessage({ id: 'good' })}
                  </Button>
                  <Button
                    type="default"
                    icon={
                      <QuestionCircleFilled
                        style={{ fontSize: '18px', color: 'blue' }}
                        twoToneColor="blue"
                      />
                    }
                    size="large"
                    style={{
                      borderWidth: '2px',
                      padding: '30px 30px', // Increase padding
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'transform 0.2s ease-in-out',
                      backgroundColor:
                        selectedStatus === 'Not Around' ? '#1890ff' : '', // Highlight if selected
                      color: selectedStatus === 'Not Around' ? 'white' : '', // Change text color when highlighted
                    }}
                    onClick={() => {
                      handleStatusChange('Not Around'); // Call your handleStatusChange function
                      form.setFieldsValue({ status: 'Not Around' }); // Set the form value
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {intl.formatMessage({ id: 'notAround' })}
                  </Button>
                  <Button
                    type="default"
                    icon={
                      <ExclamationCircleFilled
                        style={{ fontSize: '18px', color: 'red' }}
                        twoToneColor="red"
                      />
                    }
                    size="large"
                    style={{
                      borderWidth: '2px',
                      padding: '30px 30px', // Increase padding
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'transform 0.2s ease-in-out',
                      backgroundColor:
                        selectedStatus === 'Not Good' ? '#1890ff' : '', // Highlight if selected
                      color: selectedStatus === 'Not Good' ? 'white' : '', // Change text color when highlighted
                    }}
                    onClick={() => {
                      handleStatusChange('Not Good'); // Call your handleStatusChange function
                      form.setFieldsValue({ status: 'Not Good' }); // Set the form value
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {intl.formatMessage({ id: 'notGood' })}
                  </Button>
                </Space>
              </Form.Item>

              {/* Comments */}
              <Text strong>{intl.formatMessage({ id: 'comments' })}</Text>
              <br />
              <Text style={{ fontSize: '12px', color: 'gray' }}>
                {intl.formatMessage({ id: 'shareInteractions' })}
              </Text>
              <Form.Item name="comments">
                <TextArea rows={4} />
              </Form.Item>

              {/* Key Concerns for Staff only */}
              <Text strong>
                {intl.formatMessage({ id: 'keyConcernsLabel' })}
              </Text>
              <br />
              <Text style={{ fontSize: '12px', color: 'gray' }}>
                {intl.formatMessage({ id: 'keyConcernsPlaceholder' })}
              </Text>
              {access.isStaff && (
                <Form.Item name="key_concerns">
                  <TextArea rows={3} />
                </Form.Item>
              )}

              {/* Duration for Staff only */}
              {access.isStaff && (
                <Form.Item
                  label={
                    <Text strong>{intl.formatMessage({ id: 'duration' })}</Text>
                  }
                  name="duration"
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({ id: 'pleaseDuration' }),
                    },
                  ]}
                >
                  <Text style={{ fontSize: '12px', color: 'gray' }}>
                    {intl.formatMessage({ id: 'interactionPeriod' })}
                  </Text>
                  <Select
                    placeholder="Select Duration"
                    onChange={(value) =>
                      form.setFieldsValue({ duration: value })
                    } // Set the form value
                  >
                    <Option value="5">5 minutes</Option>
                    <Option value="10">10 minutes</Option>
                    <Option value="15">15 minutes</Option>
                    <Option value="20">20 minutes</Option>
                    <Option value="25">25 minutes</Option>
                    <Option value="30">30 minutes</Option>
                    <Option value="45">45 minutes</Option>
                    <Option value="60">1 hour</Option>
                    <Option value="120">2 hours</Option>
                    <Option value="180">3 hours</Option>
                  </Select>
                </Form.Item>
              )}

              {/* Upload Photos */}
              <Form.Item
                label={
                  <Text strong>
                    {intl.formatMessage({ id: 'uploadPhotos' })}
                  </Text>
                }
                name="upload"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload {...uploadProps}>
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>
                      {intl.formatMessage({ id: 'camera' })}
                    </div>
                  </div>
                </Upload>
              </Form.Item>

              <Text strong>{intl.formatMessage({ id: 'relationship' })}</Text>
              <br />
              <Text style={{ fontSize: '12px', color: 'gray' }}>
                {intl.formatMessage({ id: 'indicateRelationship' })}
              </Text>
              {access.isVolunteer && (
                <Form.Item name="relationship">
                  <TextArea rows={1} />
                </Form.Item>
              )}

              {/* Submit Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  disabled={submitting}
                  style={{ padding: '12px 0' }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Col>
      </Row>
    </Access>
  );
};

export default RecordVisit;
