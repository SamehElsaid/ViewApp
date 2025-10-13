import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: null,
  loading: 'loading'
}

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    SET_ACTIVE_USER: (state, action) => {
      state.data = action.payload
      state.loading = 'yes'
    },
    REMOVE_USER: (state, action) => {
      state.data = null
      state.loading = 'no'
    }
  }
})

export let { SET_ACTIVE_USER, REMOVE_USER } = auth.actions

export default auth.reducer
