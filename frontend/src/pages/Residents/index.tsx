import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProDescriptionsItemProps,
  ProTable,
} from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button, Col, Divider, Drawer, message, Row, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import { history } from 'umi'; // Import history for navigation
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

// Define the mock API functions (Replace these with actual API calls in a real application)
const queryResidentsList = async (params: any) => {
  // Mock API call
  return new Promise<{ data: { list: API.ResidentInfo[] }; success: boolean }>(
    (resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            list: [
              {
                id: 1,
                name: 'John Doe',
                address: '123 Main St',
                gender: 0,
                phoneNumber: '123-456-7890',
              },
              {
                id: 2,
                name: 'Jane Smith',
                address: '456 Elm St',
                gender: 1,
                phoneNumber: '987-654-3210',
              },
            ],
          },
          success: true,
        });
      }, 500);
    },
  );
};

const handleAdd = async (value: API.ResidentInfo) => {
  // Mock API call
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      message.success('Resident added successfully!');
      resolve(true);
    }, 500);
  });
};

const handleUpdate = async (value: API.ResidentInfo) => {
  // Mock API call
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      message.success('Resident updated successfully!');
      resolve(true);
    }, 500);
  });
};

const handleRemove = async (selectedRows: API.ResidentInfo[]) => {
  // Mock API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      message.success('Residents deleted successfully!');
      resolve();
    }, 500);
  });
};

const ResidentsTable: React.FC<unknown> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] =
    useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<API.ResidentInfo>();
  const [selectedRowsState, setSelectedRows] = useState<API.ResidentInfo[]>([]);
  const access = useAccess();
  const { Text } = Typography;

  const columns: ProDescriptionsItemProps<API.ResidentInfo>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      tip: 'Name is a unique key',
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'Name is required',
          },
        ],
      },
    },
    {
      title: 'Address',
      dataIndex: 'address',
      valueType: 'text',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      hideInForm: true,
      valueEnum: {
        0: { text: 'Male', status: 'MALE' },
        1: { text: 'Female', status: 'FEMALE' },
      },
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      valueType: 'text',
    },
    {
      title: 'Actions',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
            }}
          >
            Edit
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              history.push(`/residents/${record.id}`);
            }}
          >
            View Details
          </a>
        </>
      ),
    },
  ];

  return (
    <>
      <Access accessible={access.isPublic}>
        <Row justify="center" style={{ marginTop: '24px' }}>
          <Col xs={22} sm={20} md={16} lg={12}>
            <Text strong style={{ fontSize: '16px' }}>
              Thank you for being a kind neighbour! 🏡
            </Text>
            <br />
            <Text type="secondary">
              In the near future, you will be able to see all your past visits
              here!
            </Text>
          </Col>
        </Row>
      </Access>
      <Access accessible={access.isVolunteer || access.isStaff}>
        <PageContainer
          style={{ padding: '8px' }}
          header={{
            title: 'Elderly residents staying near you',
          }}
        >
          <ProTable<API.ResidentInfo>
            headerTitle="Residents List"
            actionRef={actionRef}
            rowKey="id"
            search={{
              labelWidth: 120,
            }}
            toolBarRender={() => [
              <Button
                key="1"
                type="primary"
                onClick={() => handleModalVisible(true)}
              >
                Add Resident
              </Button>,
            ]}
            request={async (params, sorter, filter) => {
              const { data, success } = await queryResidentsList({
                ...params,
                sorter,
                filter,
              });
              return {
                data: data?.list || [],
                success,
              };
            }}
            columns={columns}
            rowSelection={{
              onChange: (_, selectedRows) => setSelectedRows(selectedRows),
            }}
          />
          {selectedRowsState?.length > 0 && (
            <FooterToolbar
              extra={
                <div>
                  Selected{' '}
                  <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
                  items&nbsp;&nbsp;
                </div>
              }
            >
              <Button
                onClick={async () => {
                  await handleRemove(selectedRowsState);
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                Batch Delete
              </Button>
              <Button type="primary">Batch Approve</Button>
            </FooterToolbar>
          )}
          <CreateForm
            onCancel={() => handleModalVisible(false)}
            modalVisible={createModalVisible}
          >
            <ProTable<API.ResidentInfo, API.ResidentInfo>
              onSubmit={async (value) => {
                const success = await handleAdd(value);
                if (success) {
                  handleModalVisible(false);
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              }}
              rowKey="id"
              type="form"
              columns={columns}
            />
          </CreateForm>
          {stepFormValues && Object.keys(stepFormValues).length ? (
            <UpdateForm
              onSubmit={async (value) => {
                const success = await handleUpdate(value);
                if (success) {
                  handleUpdateModalVisible(false);
                  setStepFormValues({});
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              }}
              onCancel={() => {
                handleUpdateModalVisible(false);
                setStepFormValues({});
              }}
              updateModalVisible={updateModalVisible}
              values={stepFormValues}
            />
          ) : null}

          <Drawer
            width={600}
            open={!!row}
            onClose={() => {
              setRow(undefined);
            }}
            closable={false}
          >
            {row?.name && (
              <ProDescriptions<API.ResidentInfo>
                column={2}
                title={row?.name}
                request={async () => ({
                  data: row || {},
                })}
                params={{
                  id: row?.name,
                }}
                columns={columns}
              />
            )}
          </Drawer>
        </PageContainer>
      </Access>
    </>
  );
};

export default ResidentsTable;
