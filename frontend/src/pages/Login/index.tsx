import { login } from '@/services/user/api';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { Button, Divider, message, Space } from 'antd';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
//@ts-ignore
import { history, useModel } from 'umi';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  const handleSubmit = async (values: API.LoginParams) => {
    setLoading(true);
    try {
      const response = await login(values); // Make API call for login
      if (response.status === 'ok') {
        // Set user info into global state
        flushSync(() => setInitialState({ ...initialState, ...response.data }));
        // Redirect to homepage after successful login
        const redirectUrl =
          new URLSearchParams(location.search).get('redirect') || '/';
        history.push(redirectUrl);
        message.success('Login successful!');
      } else {
        message.error(response.message || 'Login failed!');
      }
    } catch (error) {
      message.error('Error occurred during login!');
    }
    setLoading(false);
  };

  return (
    <Space
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <LoginForm
        title="Login"
        onFinish={handleSubmit}
        submitter={{
          searchConfig: {
            submitText: 'Login',
          },
          render: (_, _dom) => (
            <Button loading={loading} type="primary" htmlType="submit">
              Login
            </Button>
          ),
        }}
      >
        <Divider />
        <ProFormText
          name="username"
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined />,
          }}
          placeholder="Username"
          rules={[{ required: true, message: 'Please enter your username!' }]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder="Password"
          rules={[{ required: true, message: 'Please enter your password!' }]}
        />
      </LoginForm>
    </Space>
  );
};

export default Login;
