import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProDescriptionsItemProps,
  ProTable,
} from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import {
  Button,
  Col,
  Divider,
  Drawer,
  message,
  Modal,
  Row,
  Typography,
} from 'antd';
import { useRef, useState } from 'react';
//@ts-ignore
import { PrinterOutlined, SaveOutlined } from '@ant-design/icons';
import { QRCode } from 'antd';
import html2canvas from 'html2canvas';
import { history } from 'umi';

interface ElderlyInfo {
  id: number;
  elderlyCode: string;
  aacCode: string;
  address: string;
  postalCode: string;
  lastVisitedDate: string;
}

const queryElderlyList = async (params: any) => {
  console.log(params);
  // Mock API call
  return new Promise<{ data: { list: ElderlyInfo[] }; success: boolean }>(
    (resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            list: [
              {
                id: 1,
                elderlyCode: 'WL-8829',
                aacCode: 'AAC-123162',
                address: '123 Main St',
                postalCode: '123456',
                lastVisitedDate: '7 days ago',
              },
              {
                id: 2,
                elderlyCode: 'WL-8830',
                aacCode: 'AAC-123163',
                address: '456 Elm St',
                postalCode: '654321',
                lastVisitedDate: '10 days ago',
              },
            ],
          },
          success: true,
        });
      }, 500);
    },
  );
};

const handleRemove = async (selectedRows: ElderlyInfo[]) => {
  // Mock API call
  console.log(selectedRows);
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      message.success('Elderly deleted successfully!');
      resolve();
    }, 500);
  });
};

const ElderlyTable: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<ElderlyInfo>();
  const [selectedRowsState, setSelectedRows] = useState<ElderlyInfo[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrElderly, setQrElderly] = useState<ElderlyInfo | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const access = useAccess();
  const { Text } = Typography;

  const columns: ProDescriptionsItemProps<ElderlyInfo>[] = [
    {
      title: 'Elderly Code',
      dataIndex: 'elderlyCode',
      tip: 'Unique identifier for the elderly',
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'Elderly Code is required',
          },
        ],
      },
      // Removed the responsive property to ensure it's always displayed
    },
    {
      title: 'AAC Code',
      dataIndex: 'aacCode',
      valueType: 'text',
      responsive: ['sm'],
    },
    {
      title: 'Address',
      dataIndex: 'address',
      valueType: 'text',
      ellipsis: true,
      responsive: ['md'],
    },
    {
      title: 'Postal Code',
      dataIndex: 'postalCode',
      valueType: 'text',
      responsive: ['lg'],
    },
    {
      title: 'Last Visited Date',
      dataIndex: 'lastVisitedDate',
      valueType: 'text',
      responsive: ['xl'],
    },
    {
      title: 'Actions',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              setQrElderly(record);
              setIsModalVisible(true);
            }}
          >
            View QR
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              history.push(`/elderly/${record.id}`);
            }}
          >
            View Details
          </a>
        </>
      ),
    },
  ];

  const handleCancel = () => {
    setIsModalVisible(false);
    setQrElderly(null);
  };

  const handleSaveAsImage = () => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${qrElderly?.elderlyCode}-qr-code.png`;
        link.click();
      });
    }
  };

  const handlePrint = () => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current).then((canvas) => {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(
          '<img src="' +
            canvas.toDataURL('image/png') +
            '" style="width: 100%;"/>',
        );
        printWindow?.document.close();
        printWindow?.print();
      });
    }
  };

  return (
    <>
      <Access accessible={access.isVolunteer}>
        <Row justify="center" style={{ marginTop: '24px' }}>
          <Col xs={22} sm={20} md={16} lg={12}>
            <Text strong style={{ fontSize: '16px' }}>
              Thank you for your help! 🏡
            </Text>
            <br />
            <Text type="secondary">
              In the near future, you will be able to see all your past visits
              here!
            </Text>
          </Col>
        </Row>
      </Access>
      <Access accessible={access.isStaff}>
        <PageContainer
          style={{ padding: '8px' }}
          header={{
            title: 'Elderly Elderlys',
          }}
        >
          <ProTable<ElderlyInfo>
            headerTitle="Elderly List"
            actionRef={actionRef}
            rowKey="id"
            search={{
              labelWidth: 120,
            }}
            request={async (params, sorter, filter) => {
              const { data, success } = await queryElderlyList({
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
            </FooterToolbar>
          )}
          <Drawer
            width={600}
            open={!!row}
            onClose={() => {
              setRow(undefined);
            }}
            closable={false}
          >
            {row?.elderlyCode && (
              <ProDescriptions<ElderlyInfo>
                column={2}
                title={row?.elderlyCode}
                request={async () => ({
                  data: row || {},
                })}
                params={{
                  id: row?.elderlyCode,
                }}
                columns={columns}
              />
            )}
          </Drawer>

          {/* QR Code Modal */}
          <Modal
            title="QR Code"
            open={isModalVisible}
            onCancel={handleCancel}
            footer={[
              <Button
                key="print"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Print
              </Button>,
              <Button
                key="save"
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveAsImage}
              >
                Save as Image
              </Button>,
            ]}
          >
            <div
              ref={qrCodeRef}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '16px',
              }}
            >
              <QRCode
                value={`${window.location.origin}/register-visit/${qrElderly?.id}`}
                size={180}
                errorLevel="H"
              />
            </div>
            <Typography.Paragraph style={{ textAlign: 'center' }}>
              Elderly Code: {qrElderly?.elderlyCode}
            </Typography.Paragraph>
          </Modal>
        </PageContainer>
      </Access>
    </>
  );
};

export default ElderlyTable;
