import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  roles: [],
  reload:0
}

const global = createSlice({
  name: 'globalSlice',
  initialState,
  reducers: {
    setRoles: (state, action) => {
      state.roles = action.payload
      state.reload = state.reload + 1
    },
    removeRoles: (state, action) => {
      state.roles = null
      state.reload = state.reload + 1
    }
  }
})

export let { setRoles, removeRoles } = global.actions

export default global.reducer
