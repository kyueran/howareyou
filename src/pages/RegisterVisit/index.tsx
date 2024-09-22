import { PlusOutlined } from '@ant-design/icons';
import { Access, history, useAccess, useParams } from '@umijs/max';
import { Button, Card, Col, Form, Input, message, Row, Space, Typography, Upload, Select } from 'antd';
import { upload } from '@vercel/blob/client';
import type { UploadProps } from 'antd/es/upload/interface';
import React, { useEffect, useState } from 'react';
import ButtonGroupInput from '../../components/ButtonGroupInput';

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

const RegisterVisitPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Store multiple selected files
  const [customMode, setCustomMode] = useState(false); // State to enable custom mode input
  const [seniorData, setSeniorData] = useState<any>(null); // Store fetched senior data
  const [submitting, setSubmitting] = useState(false);

  const access = useAccess();
  const params = useParams<{ id: string }>();

  useEffect(() => {
    const fetchSeniorData = async () => {
      try {
        const response = await fetch(`/api/senior/${params.id}`);
        const data = await response.json();
        console.log(data[0])
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

  useEffect(() => {
    populateForm();
  }, [form]);

  const populateForm = async () => {
    setLoading(true);
    try {
      const result = {
        id: 1,
        elderlyCode: 'WL-8829',
        name: 'Goh Seok Meng',
        address: 'Woodlands Drive 62, #02-144, S623182',
        contact: 81234567,
      };
      form.setFieldsValue(result);
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const onFinish = async (values: any) => {
    setSubmitting(true); 
  
    const { id } = params;
    const { status, comments, relationship, modeOfInteraction, customModeOfInteraction, duration } = values;
  
    // Determine the mode_of_interaction
    const mode_of_interaction = modeOfInteraction === 'others' ? customModeOfInteraction : modeOfInteraction;
  
    try {
      const visitor_id = await getVisitorId(access);
  
      // Ensure that the photos are uploaded before submitting the form data
      const uploadedPhotoUrls: string[] = [];
  
      for (const file of selectedFiles) {
        try {
          const result = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: '/api/uploadPhoto',
          });
          uploadedPhotoUrls.push(result.url); // Add the uploaded photo URL
          message.success(`Photo ${file.name} uploaded successfully to Blob Storage.`);
        } catch (error: any) {
          setSubmitting(false);
          message.error(`Error uploading photo ${file.name}: ${error.message}`);
          return; // Stop submission if photo upload fails
        }
      }
  
      // Prepare request body with the uploaded photo URLs and form values
      const requestBody = {
        elderly_id: parseInt(id, 10),         // Elderly ID from params
        visitor_id,                           // Visitor ID determined based on user role
        relationship,                         // Relationship from form
        mode_of_interaction,                  // Mode of interaction from form, handling "Others"
        duration_of_contact: duration,        // Duration of contact from form
        status,                               // Status from form
        comments,                             // Comments from form
        photoUrls: uploadedPhotoUrls,         // Use the array of uploaded photo URLs
      };
  
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
  
      // Submit the form data to the backend
      const response = await fetch('/api/logVisits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const result = await response.json();
  
      if (result.success) {
        message.success('Form submitted and logged successfully!');
        history.push(`/display-visits`);
      } else {
        message.error(result.message || 'Failed to log the form. Please try again.');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      message.error('There was an error submitting the form.');
    } finally {
      setSubmitting(false); // Re-enable the submit button after processing
    }
  };


  // Handle changes in Mode of Interaction selection
  const handleModeChange = (value: string) => {
    if (value === 'others') {
      setCustomMode(true); // Enable custom mode input
    } else {
      setCustomMode(false); // Disable custom mode input
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isCorrectFormat =
        file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/heic';
      if (!isCorrectFormat) {
        message.error('You can only upload JPG/PNG/HEIC files!');
        return Upload.LIST_IGNORE;
      }

      // Add the selected file to the array
      setSelectedFiles((prevFiles) => [...prevFiles, file]);
      return false; // Prevent automatic upload
    },
    onRemove: (file) => {
      // Remove the specific file from the selectedFiles array
      setSelectedFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
    },
    listType: 'picture-card',
    fileList: selectedFiles.map((file, index) => ({
      uid: index.toString(),
      name: file.name,
      status: 'done',
    })),
  };

  const handleRedirectToElderlyProfile = () => {
    const { id } = params;
    history.push(`/elderly/${id}`);
  };

  return (
    <Access accessible={access.isVolunteer || access.isStaff}>
      <Row justify="center" style={{ marginTop: '24px' }}>
        <Col xs={22} sm={20} md={16} lg={12}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <Title level={3} style={{ marginBottom: '0px' }}>
              Register Visit
            </Title>
            <Access accessible={access.isStaff}>
              <Card style={{ width: '100%' }} bodyStyle={{ padding: '16px' }} loading={loading}>
                <Row gutter={16} align="middle">
                  <Col xs={8} sm={6} md={6} lg={6} xl={5}>
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '100%',
                        overflow: 'hidden',
                        borderRadius: '8px',
                      }}
                    >
                      <img
                        src={seniorData?.photo_url || 'https://via.placeholder.com/150'}
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
                        {seniorData?.name || 'Loading name...'}
                      </Text>
                      <br />
                      <Text type="secondary">
                        {`${seniorData?.block} ${seniorData?.floor}-${seniorData?.unit_number}, ${seniorData?.address}, ${seniorData?.postal_code}`}
                      </Text>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <Button type="primary" onClick={handleRedirectToElderlyProfile}>
                        View Profile
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Access>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              {/* For Volunteers only */}
              {access.isVolunteer && (
                <Form.Item
                  label="Relationship to the elderly"
                  name="relationship"
                  rules={[{ required: true, message: 'Please enter the relationship to the elderly' }]}
                >
                  <Input />
                </Form.Item>
              )}

              {/* Mode of Interaction */}
              <Form.Item label="Mode of Interaction" required>
                <Row gutter={8}>
                  <Col span={8}>
                    <Form.Item
                      name="modeOfInteraction"
                      rules={[{ required: true, message: 'Please select a mode of interaction or enter custom interaction' }]}
                      noStyle
                    >
                      <Select onChange={handleModeChange} placeholder="Select Mode">
                        <Option value="homeVisit">Home Visit</Option>
                        {access.isStaff && <Option value="neighborhood">Met around Neighborhood</Option>}
                        {access.isStaff && <Option value="phoneCall">Phone Call</Option>}
                        <Option value="others">Others</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  {customMode && (
                    <Col span={16}>
                      <Form.Item
                        name="customModeOfInteraction"
                        rules={[{ required: true, message: 'Please specify the mode of interaction' }]}
                        noStyle
                      >
                        <Input placeholder="Specify mode" />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </Form.Item>

              {/* Duration of Contact */}
              <Form.Item
                label="Duration of contact (minutes)"
                name="duration"
                rules={[{ required: true, message: 'Please enter the duration of contact in minutes' }]}
              >
                <Input type="number" style={{ width: '33%' }} />
              </Form.Item>

              <Form.Item label="How is he/she doing?" name="status" rules={[{ required: true, message: 'Please select an option' }]}>
                <ButtonGroupInput
                  options={[
                    { value: 'good', label: '😄 GOOD' },
                    { value: 'notGood', label: '😰 NOT GOOD' },
                    { value: 'notAround', label: '❌ NOT AROUND' },
                  ]}
                />
              </Form.Item>

              <Form.Item label="Any comments or observations?" name="comments">
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item label="Any photos to share?" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload {...uploadProps}>
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item>
              <Button type="primary" htmlType="submit" block disabled={submitting}>
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

export default RegisterVisitPage;