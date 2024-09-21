import { defineConfig } from '@umijs/max';

export default defineConfig({
  history: {
    type: 'browser', // Use browser-based routing
  },
  // Remove base and publicPath to serve from the root
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
      redirect: '/home',
    },
    {
      name: 'Login',
      path: '/login',
      component: './Login',
      layout: false,
    },
    {
      name: 'Home',
      path: '/home',
      access: ['isVolunteer', 'isStaff'],
      component: './Home',
    },
    {
      name: 'Resident Profile',
      path: '/elderly/:id',
      component: './ElderlyProfile',
      access: 'isStaff',
      hideInMenu: true,
    },
    {
      name: 'Register Visit',
      path: '/register-visit/:id',
      component: './RegisterVisit',
      access: ['isVolunteer', 'isStaff'],
      hideInMenu: true,
    },
  ],
  npmClient: 'pnpm',
});
