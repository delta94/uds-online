export const ROUTES = {
  HOME: '/',
  ACCOUNT: '/account',
  MESSAGES: '/messages',
  MESSAGE: '/messages/:id/details',
  COMPOSE_MESSAGE: '/messages/compose',
  COURSES: '/courses',
  COURSE: '/courses/:id',
  LESSON: '/courses/:course_id/lessons/:lesson_id',
  LOGIN: '/login',
  RESET: '/reset',
  FORGOT: '/forgot',
  SIGNUP: '/signup',
} as const;

export const ROLES = {
  ROLE_USER: 1
} as const;