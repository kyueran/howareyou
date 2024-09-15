import { defineConfig } from '@umijs/max';

export default defineConfig({
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
      name: 'Appointments',
      path: '/appointments',
      component: './Appointments',
      access: 'isVolunteer',
    },
    {
      name: 'Elderly Residents',
      path: '/residents',
      access: 'isVolunteer',
      component: './Residents',
    },
    {
      name: 'Resident Profile',
      path: '/residents/:id',
      component: './ResidentProfile',
      access: 'isVolunteer',
    },
  ],
  npmClient: 'pnpm',
});
