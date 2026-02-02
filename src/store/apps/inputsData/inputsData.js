import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: null
}

const inputsData = createSlice({
  name: 'inputsData',
  initialState,
  reducers: {
    SET_INPUTS_DATA: (state, action) => {
      state.data = action.payload
    },
    REMOVE_INPUTS_DATA: (state, action) => {
      state.data = null
    }
  }
})

export const { SET_INPUTS_DATA, REMOVE_INPUTS_DATA } = inputsData.actions

export default inputsData.reducer
