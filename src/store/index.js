import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import coursesReducer from './slices/coursesSlice'
import leavesReducer from './slices/leavesSlice'
import studentsReducer from './slices/studentsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    leaves: leavesReducer,
    students: studentsReducer,
  },
})
