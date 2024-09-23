import { defineConfig } from '@umijs/max';

export default defineConfig({
  esbuildMinifyIIFE: true,
  history: {
    type: 'browser', // Use browser-based routing
  },
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
      redirect: '/elderly',
    },
    {
      name: 'Login',
      path: '/login',
      component: './Login',
      layout: false,
    },
    {
      name: 'Elderly Residents',
      path: '/elderly',
      access: 'isStaff',
      component: './Home',
    },
    {
      path: '/elderly/:id',
      component: './ElderlyProfile',
      access: 'isStaff',
      hideInMenu: true,
    },
    {
      name: 'Register Visit',
      path: '/record-visit/:id',
      component: './RecordVisit',
      access: ['isVolunteer', 'isStaff'],
      hideInMenu: true,
    },
    {
      name: 'Display Visits',
      path: '/display-visits',
      component: './DisplayVisits',
      access: ['isVolunteer', 'isStaff'],
      hideInMenu: true,
    },
    {
      name: 'Visit Detail',
      path: '/visit/:id',
      component: './VisitDetail',
      access: ['isVolunteer', 'isStaff'],
      hideInMenu: true,
    },
  ],
  npmClient: 'pnpm',
});
