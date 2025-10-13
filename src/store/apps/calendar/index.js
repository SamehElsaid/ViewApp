// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Fetch Events

// ** Add Event

// ** Update Event

export const appCalendarSlice = createSlice({
  name: 'appCalendar',
  initialState: {
    events: [
      {
        id: 1,
        url: '',
        title: 'Design Review',
        start: '2024-11-12T15:21:27.333Z',
        end: '2024-11-13T15:21:27.333Z',
        allDay: false,
        extendedProps: {
          calendar: 'Business'
        }
      },
      {
        id: 2,
        url: '',
        title: 'Meeting With Client',
        start: '2024-11-18T22:00:00.000Z',
        end: '2024-11-19T22:00:00.000Z',
        allDay: true,
        extendedProps: {
          calendar: 'Business'
        },
        description: 'Meeting with client lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      },
      {
        id: 3,
        url: '',
        title: 'Family Trip',
        allDay: true,
        start: '2024-11-20T22:00:00.000Z',
        end: '2024-11-22T22:00:00.000Z',
        extendedProps: {
          calendar: 'Holiday'
        }
      },
      {
        id: 4,
        url: '',
        title: "Doctor's Appointment",
        start: '2024-11-18T22:00:00.000Z',
        end: '2024-11-19T22:00:00.000Z',
        allDay: true,
        extendedProps: {
          calendar: 'Personal'
        }
      },
      {
        id: 5,
        url: '',
        title: 'Dart Game?',
        start: '2024-11-16T22:00:00.000Z',
        end: '2024-11-17T22:00:00.000Z',
        allDay: true,
        extendedProps: {
          calendar: 'ETC'
        }
      },
      {
        id: 6,
        url: '',
        title: 'Meditation',
        start: '2024-11-16T22:00:00.000Z',
        end: '2024-11-17T22:00:00.000Z',
        allDay: true,
        extendedProps: {
          calendar: 'Personal'
        }
      },
      {
        id: 7,
        url: '',
        title: 'Dinner',
        start: '2024-11-16T22:00:00.000Z',
        end: '2024-11-17T22:00:00.000Z',
        allDay: true,
        extendedProps: {
          calendar: 'Family'
        }
      },
      {
        id: 8,
        url: '',
        title: 'Product Review',
        start: '2024-11-16T22:00:00.000Z',
        end: '2024-11-17T22:00:00.000Z',
        allDay: true,
        extendedProps: {
          calendar: 'Business'
        }
      },
      {
        id: 9,
        url: '',
        title: 'Monthly Meeting',
        start: '2024-11-30T22:00:00.000Z',
        end: '2024-11-30T22:00:00.000Z',
        allDay: true,
        extendedProps: {
          calendar: 'Business'
        }
      },
      {
        id: 10,
        url: '',
        title: 'Monthly Checkup',
        start: '2024-09-30T21:00:00.000Z',
        end: '2024-09-30T21:00:00.000Z',
        allDay: true,
        extendedProps: {
          calendar: 'Personal'
        }
      }
    ],
    selectedEvent: null,
    selectedCalendars: ['Personal', 'Business', 'Family', 'Holiday', 'ETC']
  },
  reducers: {
    handleSelectEvent: (state, action) => {
      state.selectedEvent = action.payload
    },
    handleCalendarsUpdate: (state, action) => {
      const filterIndex = state.selectedCalendars.findIndex(i => i === action.payload)
      if (state.selectedCalendars.includes(action.payload)) {
        state.selectedCalendars.splice(filterIndex, 1)
      } else {
        state.selectedCalendars.push(action.payload)
      }
      if (state.selectedCalendars.length === 0) {
        state.events.length = 0
      }
    },
    handleAllCalendars: (state, action) => {
      const value = action.payload
      if (value === true) {
        state.selectedCalendars = ['Personal', 'Business', 'Family', 'Holiday', 'ETC']
      } else {
        state.selectedCalendars = []
      }
    }
  }
})

export const { handleSelectEvent, handleCalendarsUpdate, handleAllCalendars } = appCalendarSlice.actions

export default appCalendarSlice.reducer
