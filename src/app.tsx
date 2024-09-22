import { RunTimeLayoutConfig } from '@umijs/max';
import { history } from 'umi';
import './global.css'

type UserRole = 'volunteer' | 'staff';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<API.UserInfo> {
  // Retrieve role from local storage
  const savedRole = localStorage.getItem('userRole');

  // Check if savedRole is a valid UserRole
  if (savedRole && (savedRole === 'volunteer' || savedRole === 'staff')) {
    return { role: savedRole as UserRole }; // Assert the type explicitly
  }

  // If no saved role or invalid role, return an empty state (this will trigger login redirect)
  return {};
}

export const layout: RunTimeLayoutConfig = (initialState) => {
  // Check if the role exists, if not, redirect to login
  if (!initialState.initialState?.role) {
    let currentPath = history.location.pathname;
    const basePath = '/';
    if (currentPath.startsWith(basePath))
      currentPath = currentPath.slice(basePath.length);
    if (currentPath !== '/login')
      history.push(`/login?redirect=${currentPath}`);
  } else {
    // Save the role to localStorage when the user is logged in
    localStorage.setItem('userRole', initialState.initialState.role);
  }

  return {
    title: '',
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    logout: (initialState: any) => {
      localStorage.removeItem('userRole');
      history.push('/login')
    },
    locale: 'en-US',
    token: {
      pageContainer: {
        paddingBlockPageContainerContent: 0,
        paddingInlinePageContainerContent: 0,
      },
    },
  };
};