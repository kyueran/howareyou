import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { Button, Divider, message, Space } from 'antd';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
//@ts-ignore
import { history, useModel } from 'umi';

const login = async (body: API.LoginParams) => {
  const { username, password } = body;
  await new Promise((res) => {
    setTimeout(res, 1000);
  });
  if (username === 'volunteer' && password === 'pword') {
    return {
      status: 'ok',
      data: {
        id: 1,
        role: 'volunteer',
        name: 'volname',
        token: 'mock-token-volunteer',
      },
    };
  }
  if (username === 'resident' && password === 'pword') {
    return {
      status: 'ok',
      data: {
        id: 2,
        role: 'resident',
        name: 'resname',
        token: 'mock-token-resident',
      },
    };
  }
  return {
    status: 'error',
    message: 'Invalid username or password',
  };
};

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
