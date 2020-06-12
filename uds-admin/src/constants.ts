export const ROUTES = {
  HOME: '/',
  ASSETS: '/assets',
  USERS: '/users',
  MESSAGES: '/messages',
  MESSAGE: '/messages/:id/details',
  COURSES: '/courses',
  COURSE_ADD: '/courses/add',
  COURSE: '/courses/:id',
  LESSON_ADD: '/lessons/add',
  LESSON: '/courses/:course_id/lessons/:lesson_id',
  PURCHASES: '/purchases',
  LOGIN: '/login',
  FORGOT: `${process.env.REACT_APP_PUBLIC}/forgot`
} as const;

export const ROLES = {
  ROLE_USER: 1,
  ROLE_ADMIN: 2,
  ROLE_ASSISTANT: 3
} as const;