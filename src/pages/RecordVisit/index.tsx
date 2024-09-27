import {
  CheckCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  LeftOutlined,
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
import { Html5QrcodeResult } from 'html5-qrcode';
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

  const [modeOfInteraction, setModeOfInteraction] =
    useState<string>('Home Visit'); // Default to 'Home Visit'
  const [customModeOfInteraction, setCustomModeOfInteraction] =
    useState<string>('');

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

    const { comments, key_concerns, duration } = values;

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

      console.log('REQUEST BODY', requestBody);
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

  form.setFieldValue('modeOfInteraction', 'Home Visit');

  const handleModeOfInteractionChange = (value: string) => {
    setModeOfInteraction(value);
    setCustomMode(value === 'Others'); // Only trigger custom input if "Others" is selected
    form.setFieldValue('modeOfInteraction', value);
  };

  const handleCustomModeChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setCustomModeOfInteraction(e.target.value); // Update the custom mode state
    form.setFieldValue('customModeOfInteraction', e.target.value);
  };

  const handleRedirectToElderlyProfile = useCallback(() => {
    history.push(`/elderly/${id}`);
  }, [id]);

  return (
    <Access accessible={access.isVolunteer || access.isStaff}>
      <Row justify="center" style={{ marginTop: '24px' }}>
        <Col xs={22} sm={20} md={16} lg={12}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Space
              direction="horizontal"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
              }}
            >
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => history.go(-1)}
              >
                {intl.formatMessage({ id: 'backBtn' })}
              </Button>
              <Title level={3} style={{ margin: '0px' }}>
                {intl.formatMessage({ id: 'menu.RecordVisit' })}
              </Title>
            </Space>
            {id === undefined ? (
              <>
                <Tabs defaultActiveKey="1" centered type="card">
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
                      destroyOnClose
                    >
                      <QRScanner
                        onScanSuccess={(
                          decodedText: string,
                          decodedResult: Html5QrcodeResult,
                        ) => {
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
                      <Form form={form} onFinish={onFinish}>
                        <Form.Item
                          label={intl.formatMessage({ id: 'indicateLocation' })}
                          rules={[
                            {
                              required: true,
                              message: intl.formatMessage({
                                id: 'pleaseSelect',
                              }),
                            },
                          ]}
                        >
                          <Select
                            defaultValue="Home Visit" // Default value to 'Home Visit'
                            onChange={handleModeOfInteractionChange} // Update modeOfInteraction in state
                          >
                            <Option value="Home Visit">
                              {intl.formatMessage({ id: 'homeVisit' })}
                            </Option>
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

                        {/* Conditionally show custom mode input */}
                        {customMode && (
                          <Form.Item
                            name="customModeOfInteraction"
                            label={intl.formatMessage({ id: 'ifOthers' })}
                            rules={[
                              {
                                required: true,
                                message: intl.formatMessage({
                                  id: 'pleaseSpecify',
                                }),
                              },
                            ]}
                          >
                            <Input.TextArea
                              placeholder={intl.formatMessage({
                                id: 'ifOthersPlaceHolder',
                              })}
                              onChange={handleCustomModeChange} // Update custom mode state
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
                        <span>
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
                        </span>
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
                <Access accessible={access.isStaff}>
                  <Card
                    style={{ width: '100%' }}
                    bodyStyle={{ padding: '16px' }}
                    loading={loading}
                  >
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
                            src={
                              seniorData?.photo_url ||
                              'https://via.placeholder.com/150'
                            }
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
                          <Button
                            type="primary"
                            onClick={handleRedirectToElderlyProfile}
                          >
                            View Profile
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Access>
                <Access accessible={access.isVolunteer}>
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
                </Access>
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
                  {access.isStaff && (
                    <>
                      <Text strong>
                        {intl.formatMessage({ id: 'keyConcernsLabel' })}
                      </Text>
                      <br />
                      <Text style={{ fontSize: '12px', color: 'gray' }}>
                        {intl.formatMessage({ id: 'keyConcernsPlaceholder' })}
                      </Text>
                      <Form.Item name="key_concerns">
                        <TextArea rows={3} />
                      </Form.Item>
                    </>
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
