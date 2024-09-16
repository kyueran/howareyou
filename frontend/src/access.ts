export default (initialState: API.UserInfo) => {
  // 在这里按照初始化数据定义项目中的权限，统一管理
  // 参考文档 https://umijs.org/docs/max/access
  const isVolunteer = !!(initialState && initialState.role === 'volunteer');
  const isPublic = !!(initialState && initialState.role === 'public');
  const isStaff = !!(initialState && initialState.role === 'staff');

  console.log('Access check:', { isVolunteer, isPublic, isStaff });

  return {
    isVolunteer,
    isPublic,
    isStaff,
  };
};
