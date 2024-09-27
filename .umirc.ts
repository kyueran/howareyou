import { purple } from '@ant-design/colors';
import { defineConfig } from '@umijs/max';

export default defineConfig({
  esbuildMinifyIIFE: true,
  history: {
    type: 'browser', // Use browser-based routing
  },
  antd: {
    theme: {
      token: {
        // Seed Token
        colorLink: purple[4],
        colorInfo: purple[4],
        colorIcon: purple[4],
        colorPrimary: purple[4],
      },
    },
  },
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
      path: '/home',
      name: 'menu.LinkTree',
      component: './LinkTree',
      layout: true,
      access: ['isVolunteer', 'isStaff'],
    },
    // {
    //   name: 'menu.Login',
    //   path: '/login',
    //   component: './Login',
    //   layout: false,
    // },
    {
      name: 'menu.ElderlyResidents',
      path: '/elderly',
      access: 'isStaff',
      component: './ElderlyResidents',
      layout: true,
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
      name: 'menu.RecordVisit',
      access: ['isVolunteer', 'isStaff'],
      layout: true,
    },
    {
      path: '/record-visit',
      component: './RecordVisit',
      name: 'menu.RecordVisitNoId',
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
      layout: true,
    },
    {
      path: '/my-profile',
      component: './MyProfile',
      access: ['isVolunteer', 'isStaff'],
      layout: true,
      name: 'menu.MyProfile',
    },
    {
      path: '/',
      component: './LandingPage',
      layout: false,
    },
  ],
  npmClient: 'pnpm',
});
