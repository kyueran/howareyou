export default (initialState: API.UserInfo) => {
  // Determine whether the current user is a volunteer or staff
  const isVolunteer = !!(initialState && initialState.role === 'volunteer');
  const isStaff = !!(initialState && initialState.role === 'staff');

  return {
    isVolunteer,
    isStaff,
  };
};
