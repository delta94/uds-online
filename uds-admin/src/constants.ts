export const ROUTES = {
  HOME: '/',
  ASSETS: '/assets',
  USERS: '/users',
  MESSAGES: '/messages',
  MESSAGE: '/messages/:id/details',
  COURSES: '/courses',
  COURSE_ADD: '/courses/add',
  COURSE: '/courses/:id',
  COURSE_EDIT: '/courses/:id/edit',
  LESSON_ADD: '/courses/:course_id/lessons/add',
  LESSON_EDIT: '/courses/:course_id/lessons/:lesson_id',
  LESSON_PREVIEW: '/courses/:course_id/lessons/:lesson_id/preview',
  SALES: '/sales',
  LOGIN: '/login',
  FORGOT: `${process.env.REACT_APP_HOST_PUBLIC}/forgot`
} as const;

export const ROLES = {
  ROLE_USER: 1,
  ROLE_ADMIN: 2,
  ROLE_ASSISTANT: 3
} as const;