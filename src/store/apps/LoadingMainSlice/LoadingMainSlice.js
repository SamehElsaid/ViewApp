import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: false
}

const LoadingHome = createSlice({
  name: 'LoadingHome',
  initialState,
  reducers: {
    SET_ACTIVE_LOADING: (state, action) => {
      state.data = true
    }
  }
})

export let { SET_ACTIVE_LOADING } = LoadingHome.actions

export default LoadingHome.reducer
