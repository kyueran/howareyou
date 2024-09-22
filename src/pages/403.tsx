import React from 'react';
import { Button } from 'antd';
import { history } from 'umi';

const ForbiddenPage: React.FC = () => {
  const handleBackHome = () => {
    history.push('/'); // Redirect to home or another relevant page
  };

  return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <h1>403 - Access Denied</h1>
      <p>Sorry, you cannot access this page because you are not a Staff member.</p>
      <Button type="primary" onClick={handleBackHome}>
        Back to Home
      </Button>
    </div>
  );
};

export default ForbiddenPage;
