import {
  CheckCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  QuestionCircleFilled,
  RightOutlined,
} from '@ant-design/icons';
import { ProSkeleton } from '@ant-design/pro-components';
import { Access, history, useAccess, useIntl, useParams } from '@umijs/max';
import { upload } from '@vercel/blob/client';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tabs,
  Typography,
  Upload,
} from 'antd';
import TabPane from 'antd/es/tabs/TabPane';
import type { UploadProps } from 'antd/es/upload/interface';
import React, { useCallback, useEffect, useState } from 'react';
import QRScanner from '../../components/QRScanner';

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
  const [elderlies, setElderlies] = useState<any[]>([]);
  const [filteredElderlies, setFilteredElderlies] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const intl = useIntl();
  const access = useAccess();
  const params = useParams<{ id: string }>();
  const [id, setId] = useState<string | undefined>(params.id);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [rearCameraId, setRearCameraId] = useState<string>();

  useEffect(() => {
    const fetchSeniorData = async () => {
      try {
        setLoading(true);
        if (id === undefined) {
          const response = await fetch('/api/fetchSeniors');
          const data = await response.json();
          setElderlies(data);
          setFilteredElderlies(data);
        } else {
          const response = await fetch(`/api/senior/${id}`);
          const data = await response.json();
          setSeniorData(data[0]);
        }
      } catch (error) {
        message.error('Failed to fetch senior data');
      } finally {
        setLoading(false);
      }
    };
    fetchSeniorData();
  }, [id]);

  const getVisitorId = async () => {
    const user = localStorage.getItem('user');
    let visitorId = 0;
    if (user) {
      const parsedUser = JSON.parse(user);
      visitorId = parsedUser.id;
    }
    return visitorId;
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);

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

    const relationship = access.isStaff ? 'Staff' : values.relationship || '';

    try {
      const visitor_id = await getVisitorId();

      const uploadedPhotoUrls: string[] = [];

      for (const file of selectedFiles) {
        try {
          const result = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: '/api/uploadPhoto',
          });
          uploadedPhotoUrls.push(result.url);
          // message.success(
          //   intl.formatMessage(
          //     { id: 'photoUploadSuccess' },
          //     { filename: file.name },
          //   ),
          // );
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

  // Handle search filtering
  const handleSearch = useCallback(
    (searchText: string) => {
      setSearchValue(searchText);

      const filtered = elderlies.filter(
        (elderly) =>
          elderly.name.toLowerCase().includes(searchText.toLowerCase()) ||
          elderly.block.toLowerCase().includes(searchText.toLowerCase()) ||
          elderly.unit_number.includes(searchText) ||
          elderly.address.toLowerCase().includes(searchText.toLowerCase()) ||
          elderly.elderly_code
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          elderly.postal_code.includes(searchText),
      );
      setFilteredElderlies(filtered);
    },
    [elderlies],
  );

  const handleClear = useCallback(() => {
    setSearchValue(''); // Clear the search value
    setFilteredElderlies(elderlies); // Reset filtered data to the full list
  }, [elderlies]);

  const handleSelectElderly = (id) => {
    if (form.getFieldValue('modeOfInteraction') === undefined) {
      message.error('Please select a location');
      return;
    } else if (
      customMode &&
      form.getFieldValue('customModeOfInteraction') === undefined
    ) {
      message.error('Please specify the Other location');
      return;
    } else {
      setId(id);
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

  useEffect(() => {
    if (isScannerOpen) {
      // Get the deviceId of the rear camera when the scanner is opened
      getRearCameraDeviceId().then((deviceId) => {
        setRearCameraId(deviceId);
      });
    }
  }, [isScannerOpen]);

  async function getRearCameraDeviceId() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      );

      // Try to find a device labeled 'back' or 'rear'
      const rearCamera = videoDevices.find(
        (device) =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear'),
      );

      // If not found, default to the last video device
      return (
        rearCamera?.deviceId || videoDevices[videoDevices.length - 1]?.deviceId
      );
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return undefined;
    }
  }

  return (
    <Access accessible={access.isVolunteer || access.isStaff}>
      <Row justify="center" style={{ marginTop: '24px' }}>
        <Col xs={22} sm={20} md={16} lg={12}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            {id === undefined ? (
              <>
                <Tabs defaultActiveKey="1" centered>
                  <TabPane
                    tab={intl.formatMessage({ id: 'qrCodeTab' })}
                    key="1"
                  >
                    {/* Button to open QR scanner */}
                    <Text type="primary">
                      {intl.formatMessage({ id: 'areYouAtResidence' })}
                    </Text>

                    <Button
                      type="primary"
                      block
                      onClick={() => setIsScannerOpen(true)}
                      style={{ margin: '16px 0px' }}
                    >
                      {intl.formatMessage({ id: 'scanQRCode' })}
                    </Button>
                    <Text type="secondary">
                      {intl.formatMessage({ id: 'note' })}
                    </Text>
                    <br />
                    <Text type="secondary">
                      {intl.formatMessage({ id: 'permissionsNote' })}
                    </Text>
                    <br />
                    <Text type="secondary">
                      {intl.formatMessage({ id: 'reloadPageReminder' })}
                    </Text>

                    {/* Modal for QR scanner */}
                    <Modal
                      title={intl.formatMessage({ id: 'scanQRCode' })}
                      open={isScannerOpen}
                      onCancel={() => setIsScannerOpen(false)}
                      footer={null}
                    >
                      <QRScanner
                        fps={10}
                        qrbox={250}
                        disableFlip={false}
                        qrCodeSuccessCallback={(decodedText, decodedResult) => {
                          setIsScannerOpen(false);
                          history.push(decodedText);
                        }}
                      />
                    </Modal>
                  </TabPane>
                  {access.isStaff && (
                    <TabPane
                      tab={intl.formatMessage({ id: 'fillUpFormTab' })}
                      key="2"
                    >
                      <Form form={form}>
                        <Form.Item
                          name="modeOfInteraction"
                          label={intl.formatMessage({ id: 'indicateLocation' })}
                        >
                          <Select
                            onChange={(value) => {
                              form.setFieldValue('modeOfInteraction', value);
                              setCustomMode(value === 'Others');
                            }}
                          >
                            <Option value="AAC / PA Centre">
                              {intl.formatMessage({ id: 'aacPaCentre' })}
                            </Option>
                            <Option value="Neighbourhood Area">
                              {intl.formatMessage({ id: 'neighbourhoodArea' })}
                            </Option>
                            <Option value="Phone Call">
                              {intl.formatMessage({ id: 'phoneCall' })}
                            </Option>
                            <Option value="Others">
                              {intl.formatMessage({ id: 'others' })}
                            </Option>
                          </Select>
                        </Form.Item>
                        {customMode && (
                          <Form.Item
                            name="customModeOfInteraction"
                            label={intl.formatMessage({ id: 'ifOthers' })}
                          >
                            <Input.TextArea
                              onChange={(e) =>
                                form.setFieldValue(
                                  'customModeOfInteraction',
                                  e.target.value,
                                )
                              }
                            />
                          </Form.Item>
                        )}
                      </Form>
                      {/* Elderly Selection */}
                      <Space
                        direction="vertical"
                        size={20}
                        style={{ width: '100%' }}
                      >
                        <Text>
                          {intl.formatMessage({ id: 'searchElderly' })}
                        </Text>
                        <Input
                          style={{ width: '100%', margin: '8px 0' }}
                          size="large"
                          placeholder={intl.formatMessage({
                            id: 'searchElderlyPlaceholder',
                          })}
                          suffix={
                            searchValue.length > 0 ? (
                              <CloseOutlined
                                style={{
                                  fontSize: '20px',
                                  color: 'rgba(0, 0, 0, 0.45)',
                                  cursor: 'pointer',
                                }}
                                onClick={handleClear}
                              />
                            ) : (
                              <span />
                            )
                          }
                          value={searchValue}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                        {loading ? (
                          <ProSkeleton type="list" />
                        ) : (
                          filteredElderlies.map((elderly) => (
                            <Card
                              key={elderly.id}
                              style={{
                                cursor: 'pointer',
                                transition:
                                  'transform 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Initial light shadow
                                overflow: 'hidden',
                              }}
                              bodyStyle={{ padding: '8px 16px' }}
                              onClick={() => handleSelectElderly(elderly.id)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.03)'; // Slightly enlarge the card
                                e.currentTarget.style.boxShadow =
                                  '0 6px 16px rgba(0, 0, 0, 0.15)'; // Darker shadow
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'; // Reset scale
                                e.currentTarget.style.boxShadow =
                                  '0 2px 8px rgba(0, 0, 0, 0.1)'; // Reset shadow
                              }}
                              onTouchStart={(e) => {
                                e.currentTarget.style.transform = 'scale(1.03)'; // Enlarge slightly on touch
                                e.currentTarget.style.boxShadow =
                                  '0 6px 16px rgba(0, 0, 0, 0.15)'; // Darker shadow
                              }}
                              onTouchEnd={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'; // Reset scale
                                e.currentTarget.style.boxShadow =
                                  '0 2px 8px rgba(0, 0, 0, 0.1)'; // Reset shadow
                              }}
                            >
                              <Row gutter={0} justify="space-between">
                                <Col
                                  xs={8}
                                  sm={6}
                                  style={{ alignContent: 'center' }}
                                >
                                  <Image
                                    preview={false}
                                    src={
                                      elderly.photo_url ||
                                      'https://via.placeholder.com/48x48'
                                    } // Reduce size for compact layout
                                    width={96}
                                    height={96}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </Col>
                                <Col xs={16} sm={18}>
                                  <Space
                                    direction="vertical"
                                    size={0}
                                    style={{ width: '100%' }}
                                  >
                                    <Space
                                      direction="horizontal"
                                      style={{
                                        justifyContent: 'space-between',
                                        width: '100%',
                                      }}
                                    >
                                      <Title level={5} style={{ margin: 0 }}>
                                        {elderly.name} ({elderly.elderly_code})
                                      </Title>

                                      {/* Right-aligned RightOutlined icon */}
                                      <div style={{ marginLeft: 'auto' }}>
                                        <RightOutlined
                                          style={{ fontSize: '14px' }}
                                        />
                                      </div>
                                    </Space>

                                    {/* Block, Floor, Unit, Address */}
                                    <Text type="secondary">
                                      {elderly.block} {elderly.floor}-
                                      {elderly.unit_number}, {elderly.address}
                                    </Text>
                                    <Text type="secondary">
                                      Singapore {elderly.postal_code}
                                    </Text>
                                  </Space>
                                </Col>
                              </Row>
                            </Card>
                          ))
                        )}
                      </Space>
                    </TabPane>
                  )}
                </Tabs>
              </>
            ) : (
              <>
                <Title level={3} style={{ marginBottom: '0px' }}>
                  {intl.formatMessage({ id: 'menu.RecordVisit' })}
                </Title>
                <div>
                  <Space direction="vertical" size="small">
                    <Text strong style={{ fontSize: '16px' }}>
                      {intl.formatMessage({ id: 'residentsAddress' })}
                    </Text>{' '}
                    {/* Bold and slightly larger label */}
                    <Card
                      loading={loading}
                      style={{
                        backgroundColor: '#d6eaf8', // Light gray background
                        borderRadius: '8px', // Rounded corners
                        width: '100%', // Full width
                      }}
                      bordered={false} // No border
                    >
                      <Text>
                        {seniorData?.block} {seniorData?.floor}-
                        {seniorData?.unit_number}, {seniorData?.address},
                        {seniorData?.postal_code}
                      </Text>
                    </Card>
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
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap', // Allows wrapping on smaller screens
                        gap: '10px', // Space between buttons
                        justifyContent: 'space-around', // Distributes buttons evenly
                      }}
                    >
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
                          padding: '15px 20px', // Reduced padding for mobile
                          flex: '1 1 100px', // Flex basis ensures the buttons resize properly
                          backgroundColor:
                            selectedStatus === 'Good' ? '#1890ff' : '',
                          color: selectedStatus === 'Good' ? 'white' : '',
                        }}
                        onClick={() => {
                          handleStatusChange('Good');
                          form.setFieldsValue({ status: 'Good' });
                        }}
                      >
                        {intl.formatMessage({ id: 'good' })}
                      </Button>

                      <Button
                        type="default"
                        icon={
                          <QuestionCircleFilled
                            style={{ fontSize: '18px', color: 'blue' }}
                          />
                        }
                        size="large"
                        style={{
                          borderWidth: '2px',
                          padding: '15px 20px',
                          flex: '1 1 100px',
                          backgroundColor:
                            selectedStatus === 'Not Around' ? '#1890ff' : '',
                          color: selectedStatus === 'Not Around' ? 'white' : '',
                        }}
                        onClick={() => {
                          handleStatusChange('Not Around');
                          form.setFieldsValue({ status: 'Not Around' });
                        }}
                      >
                        {intl.formatMessage({ id: 'notAround' })}
                      </Button>

                      <Button
                        type="default"
                        icon={
                          <ExclamationCircleFilled
                            style={{ fontSize: '18px', color: 'red' }}
                          />
                        }
                        size="large"
                        style={{
                          borderWidth: '2px',
                          padding: '15px 20px',
                          flex: '1 1 100px',
                          backgroundColor:
                            selectedStatus === 'Not Good' ? '#1890ff' : '',
                          color: selectedStatus === 'Not Good' ? 'white' : '',
                        }}
                        onClick={() => {
                          handleStatusChange('Not Good');
                          form.setFieldsValue({ status: 'Not Good' });
                        }}
                      >
                        {intl.formatMessage({ id: 'notGood' })}
                      </Button>
                    </div>
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
                        <Text strong>
                          {intl.formatMessage({ id: 'duration' })}
                        </Text>
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

                  {access.isVolunteer && (
                    <>
                      <Text strong>
                        {intl.formatMessage({ id: 'relationship' })}
                      </Text>
                      <br />
                      <Text style={{ fontSize: '12px', color: 'gray' }}>
                        {intl.formatMessage({ id: 'indicateRelationship' })}
                      </Text>
                      <Form.Item name="relationship">
                        <TextArea rows={1} />
                      </Form.Item>
                    </>
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
              </>
            )}
          </Space>
        </Col>
      </Row>
    </Access>
  );
};

export default RecordVisit;
