export const ROUTES = {
  HOME: '/',
  USERS: '/users',
  MESSAGES: '/messages',
  MESSAGE: '/messages/:id/details',
  COURSES: '/courses',
  COURSE: '/courses/:id',
  LOGIN: '/login',
  FORGOT: `${process.env.REACT_APP_PUBLIC}/forgot`
};

export const ROLES = {
  ROLE_USER: 1,
  ROLE_ADMIN: 2,
  ROLE_ASSISTANT: 3
};