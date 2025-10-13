import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: []
}

const errorInAllRow = createSlice({
  name: 'errorInAllRow',
  initialState,
  reducers: {
    seterrorInAllRowData: (state, action) => {
      const { row, key, error } = action.payload
      const existing = state.data.find(el => el.index === row.index)
      if (existing) {
        existing.error = {
          ...existing.error,
          [key]: error
        }
      } else {
        state.data.push({
          index: row.index,
          error: { [key]: error }
        })
      }
    },
    removeerrorInAllRowData: (state) => {
      state.data = []
    }
  }
})

export let { seterrorInAllRowData, removeerrorInAllRowData } = errorInAllRow.actions

export default errorInAllRow.reducer
