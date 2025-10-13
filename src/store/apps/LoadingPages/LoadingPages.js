import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loading: true
}

const LoadingPages = createSlice({
  name: 'LoadingPages',
  initialState,
  reducers: {
    SET_ACTIVE_LOADING: (state, action) => {
      state.loading = false
    }
  }
})

export let { SET_ACTIVE_LOADING } = LoadingPages.actions

export default LoadingPages.reducer
