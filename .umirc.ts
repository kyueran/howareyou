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
      name: 'menu.LinkTree',
      component: './LinkTree',
      layout: true,
      access: ['isVolunteer', 'isStaff'],
    },
    {
      name: 'menu.Login',
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
      name: 'menu.ElderlyProfile',
      access: 'isStaff',
      layout: true,
    },
    {
      path: '/record-visit/:id',
      component: './RecordVisit',
      name: 'menu.RegisterVisit',
      access: ['isVolunteer', 'isStaff'],
      layout: true,
    },
    {
      name: 'menu.DisplayVisits',
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
