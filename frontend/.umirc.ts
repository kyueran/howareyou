import { defineConfig } from '@umijs/max';

export default defineConfig({
  // NOTE: USING HASH ROUTER MEANS ON LOCALHOST NEED TO GO TO http://localhost:8000/#/howareyou
  history: {
    type: 'hash', // Switch to hash-based routing
  },
  base: '/howareyou/',
  publicPath: '/howareyou/',
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  locale: {
    default: 'en-US',
  },
  layout: {},
  routes: [
    {
      path: '/',
      redirect: '/residents',
    },
    {
      name: 'Login',
      path: '/login',
      component: './Login',
      layout: false,
    },
    {
      name: 'Elderly Residents',
      path: '/residents',
      access: ['isVolunteer', 'isPublic', 'isStaff'],
      component: './Residents',
    },
    {
      name: 'Resident Profile',
      path: '/residents/:id',
      component: './ResidentProfile',
      access: 'isVolunteer',
      hideInMenu: true,
    },
    {
      name: 'Register Visit',
      path: '/register-visit/:id',
      component: './RegisterVisit',
      access: ['isVolunteer', 'isPublic', 'isStaff'],
      hideInMenu: true,
    },
  ],
  npmClient: 'pnpm',
});
