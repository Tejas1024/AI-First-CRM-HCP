import { configureStore, createSlice } from '@reduxjs/toolkit';

const interactionSlice = createSlice({
  name: 'interaction',
  initialState: {
    hcpName: '',
    interactionType: 'Meeting',
    date: new Date().toISOString().split('T')[0], // Default to today
    time: '12:00',
    attendees: '',
    topics: '',
    materials: '',
    samples: '', // Added [cite: 47]
    sentiment: 'Neutral',
    outcomes: '',
    followUp: '',
    chatHistory: []
  },
  reducers: {
    updateField: (state, action) => {
      state[action.payload.field] = action.payload.value;
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    }
  }
});

export const { updateField, addChatMessage } = interactionSlice.actions;
export const store = configureStore({ reducer: { interaction: interactionSlice.reducer } });