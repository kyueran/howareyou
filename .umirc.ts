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
    antd: true, // Enable Ant Design localization
    baseNavigator: true, // Use the browser's language settings
    baseSeparator: '-', // Locale code separator
    useLocalStorage: true, // Save locale to localStorage
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
      path: '/elderly',
      access: 'isStaff',
      component: './Home',
    },
    {
      path: '/elderly/:id',
      component: './ElderlyProfile',
      access: 'isStaff',
      layout: true,
    },
    {
      name: 'Register Visit',
      path: '/record-visit/:id',
      component: './RecordVisit',
      access: ['isVolunteer', 'isStaff'],
      layout: true,
    },
    {
      name: 'Display Visits',
      path: '/display-visits',
      component: './DisplayVisits',
      access: ['isVolunteer', 'isStaff'],
      layout: true,
    },
    {
      path: '/visit/:id',
      component: './VisitDetail',
      access: ['isVolunteer', 'isStaff'],
      hideInMenu: true,
    },
  ],
  npmClient: 'pnpm',
});
