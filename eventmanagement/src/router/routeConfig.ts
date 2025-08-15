export const routes = {
  home: '/',
  events: {
    list: '/events',
    detail: '/events/:id',
    create: '/events/create',
    edit: '/events/:id/edit',
  },
  categories: '/categories',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  profile: {
    view: '/profile',
    edit: '/profile/edit',
    registrations: '/profile/registrations',
    settings: '/profile/settings',
  },
  admin: {
    dashboard: '/admin',
    events: '/admin/events',
    users: '/admin/users',
    categories: '/admin/categories',
  },
  unauthorized: '/unauthorized',
  notFound: '/404',
} as const