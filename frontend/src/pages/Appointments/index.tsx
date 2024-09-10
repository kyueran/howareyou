import { PageContainer } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button } from 'antd';

const AppointmentsPage: React.FC = () => {
  const access = useAccess();
  return (
    <PageContainer
      ghost
      header={{
        title: 'Appointments',
      }}
    >
      <Access accessible={access.isVolunteer}>
        <Button>只有 Volunteers 可以看到这个按钮</Button>
      </Access>
    </PageContainer>
  );
};

export default AppointmentsPage;
