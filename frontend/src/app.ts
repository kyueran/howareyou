import { RunTimeLayoutConfig } from '@umijs/max';
import { history } from 'umi';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<API.UserInfo> {
  return {};
}

export const layout: RunTimeLayoutConfig = (initialState) => {
  // redirect user to login page if not logged in yet
  if (!initialState.initialState?.role) {
    let currentPath = history.location.pathname;
    const basePath = '/howareyou';
    if (currentPath.startsWith(basePath))
      currentPath = currentPath.slice(basePath.length);
    if (currentPath !== '/login')
      history.push(`/login?redirect=${currentPath}`);
  }

  return {
    title: '',
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
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
