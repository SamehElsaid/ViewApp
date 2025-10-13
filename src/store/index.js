// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

import auth from './apps/authSlice/authSlice'
import LoadingHome from './apps/LoadingMainSlice/LoadingMainSlice'
import calendar from './apps/calendar/index'
import api from './apps/apiSlice/apiSlice'
import errorInAllRow from './apps/errorInAllRow/errorInAllRow'
import LoadingPages from './apps/LoadingPages/LoadingPages'

export const store = configureStore({
  reducer: {
    auth,
    LoadingHome,
    api,
    errorInAllRow,
    calendar,
    LoadingPages
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
