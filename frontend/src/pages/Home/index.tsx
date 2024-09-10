import Guide from '@/components/Guide';
import { PageContainer } from '@ant-design/pro-components';
import { Access, useAccess, useModel } from '@umijs/max';
import { Button } from 'antd';
import styles from './index.less';

const HomePage: React.FC = () => {
  const access = useAccess();
  const { name } = useModel('global');
  return (
    <PageContainer ghost>
      <Access
        accessible={access.isVolunteer}
        fallback={<Button>Only volunteers can access this page!</Button>}
      >
        <div className={styles.container}>
          <Guide name={name.trim()} />
        </div>
      </Access>
    </PageContainer>
  );
};

export default HomePage;
