import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: [],
  reload:0
}

const api = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setApiData: (state, action) => {
      state.data = action.payload
      state.reload = state.reload + 1
    },
    removeWithLink: (state, action) => {
      state.data = state.data.filter(item => item.link !== action.payload)
      state.reload = state.reload + 1
    },
    removeApiData: (state, action) => {
      state.data = null
      state.reload = state.reload + 1
    }
  }
})

export let { setApiData, removeApiData, removeWithLink } = api.actions

export default api.reducer
