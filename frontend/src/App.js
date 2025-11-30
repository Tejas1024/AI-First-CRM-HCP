import React, { useState, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';

// Redux Slice
const interactionSlice = createSlice({
  name: 'interactions',
  initialState: {
    interactions: [],
    loading: false,
    error: null,
    chatMode: false,
    currentChat: [],
    hcps: []
  },
  reducers: {
    setInteractions: (state, action) => {
      state.interactions = action.payload;
    },
    addInteraction: (state, action) => {
      state.interactions.unshift(action.payload);
    },
    updateInteraction: (state, action) => {
      const index = state.interactions.findIndex(i => i.id === action.payload.id);
      if (index !== -1) state.interactions[index] = action.payload;
    },
    deleteInteraction: (state, action) => {
      state.interactions = state.interactions.filter(i => i.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    toggleChatMode: (state) => {
      state.chatMode = !state.chatMode;
    },
    addChatMessage: (state, action) => {
      state.currentChat.push(action.payload);
    },
    clearChat: (state) => {
      state.currentChat = [];
    },
    setHCPs: (state, action) => {
      state.hcps = action.payload;
    }
  }
});

const { setInteractions, addInteraction, updateInteraction, deleteInteraction, 
        setLoading, setError, toggleChatMode, addChatMessage, clearChat, setHCPs } = interactionSlice.actions;

const store = configureStore({
  reducer: {
    interactions: interactionSlice.reducer
  }
});

// API Base URL
const API_BASE = 'http://localhost:8000';

// Main App Component
function CRMApp() {
  const dispatch = useDispatch();
  const { interactions, loading, error, chatMode, currentChat, hcps } = useSelector(state => state.interactions);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    hcp_id: '',
    interaction_type: 'visit',
    notes: '',
    products_discussed: '',
    follow_up_required: false
  });
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    fetchInteractions();
    fetchHCPs();
  }, []);

  const fetchInteractions = async () => {
    try {
      dispatch(setLoading(true));
      const res = await fetch(`${API_BASE}/api/interactions`);
      const data = await res.json();
      dispatch(setInteractions(data));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchHCPs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/hcps`);
      const data = await res.json();
      dispatch(setHCPs(data));
    } catch (err) {
      console.error('Failed to fetch HCPs:', err);
    }
  };

  const handleSubmitForm = async () => {
    try {
      dispatch(setLoading(true));
      const url = editingId 
        ? `${API_BASE}/api/interactions/${editingId}`
        : `${API_BASE}/api/interactions`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (editingId) {
        dispatch(updateInteraction(data));
      } else {
        dispatch(addInteraction(data));
      }
      
      resetForm();
      setShowForm(false);
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    dispatch(addChatMessage(userMessage));
    const currentInput = chatInput;
    setChatInput('');

    try {
      dispatch(setLoading(true));
      const res = await fetch(`${API_BASE}/api/chat/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          history: currentChat 
        })
      });
      
      const data = await res.json();
      dispatch(addChatMessage({ role: 'assistant', content: data.response }));
      
      if (data.interaction_logged) {
        fetchInteractions();
      }
    } catch (err) {
      dispatch(setError(err.message));
      dispatch(addChatMessage({ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleEdit = (interaction) => {
    setEditingId(interaction.id);
    setFormData({
      hcp_id: interaction.hcp_id,
      interaction_type: interaction.interaction_type,
      notes: interaction.notes,
      products_discussed: interaction.products_discussed || '',
      follow_up_required: interaction.follow_up_required
    });
    setShowForm(true);
    if (chatMode) dispatch(toggleChatMode());
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interaction?')) return;
    
    try {
      await fetch(`${API_BASE}/api/interactions/${id}`, { method: 'DELETE' });
      dispatch(deleteInteraction(id));
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  const resetForm = () => {
    setFormData({
      hcp_id: '',
      interaction_type: 'visit',
      notes: '',
      products_discussed: '',
      follow_up_required: false
    });
    setEditingId(null);
  };

  const handleGenerateInsights = async () => {
    try {
      dispatch(setLoading(true));
      const res = await fetch(`${API_BASE}/api/tools/generate-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hcp_id: interactions[0]?.hcp_id || 1 })
      });
      const data = await res.json();
      alert(`Insights Generated:\n\n${data.insights}`);
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearchHCP = async () => {
    const searchTerm = window.prompt('Enter HCP name or specialty to search:');
    if (!searchTerm) return;
    
    try {
      dispatch(setLoading(true));
      const res = await fetch(`${API_BASE}/api/tools/search-hcp?query=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      alert(`Search Results:\n\n${data.results}`);
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleScheduleFollowup = async (interactionId) => {
    const date = window.prompt('Enter follow-up date (YYYY-MM-DD):');
    if (!date) return;
    
    try {
      dispatch(setLoading(true));
      const res = await fetch(`${API_BASE}/api/tools/schedule-followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interaction_id: interactionId, followup_date: date })
      });
      const data = await res.json();
      alert(data.message);
      fetchInteractions();
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">AI-First CRM</h1>
          <p className="text-indigo-600">Healthcare Professional Interaction Management</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Log Interaction</h2>
                <button
                  onClick={() => dispatch(toggleChatMode())}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {chatMode ? '📝 Form Mode' : '💬 Chat Mode'}
                </button>
              </div>

              {!chatMode ? (
                <div>
                  {!showForm ? (
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      + New Interaction
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Healthcare Professional
                        </label>
                        <select
                          value={formData.hcp_id}
                          onChange={(e) => setFormData({...formData, hcp_id: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="">Select HCP</option>
                          {hcps.map(hcp => (
                            <option key={hcp.id} value={hcp.id}>
                              Dr. {hcp.name} - {hcp.specialty}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Interaction Type
                        </label>
                        <select
                          value={formData.interaction_type}
                          onChange={(e) => setFormData({...formData, interaction_type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="visit">In-Person Visit</option>
                          <option value="call">Phone Call</option>
                          <option value="email">Email</option>
                          <option value="webinar">Webinar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          rows="4"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Products Discussed
                        </label>
                        <input
                          type="text"
                          value={formData.products_discussed}
                          onChange={(e) => setFormData({...formData, products_discussed: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., Product A, Product B"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.follow_up_required}
                          onChange={(e) => setFormData({...formData, follow_up_required: e.target.checked})}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Follow-up Required
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmitForm}
                          disabled={loading}
                          className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : editingId ? 'Update' : 'Save'}
                        </button>
                        <button
                          onClick={() => { resetForm(); setShowForm(false); }}
                          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-96">
                  <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                    {currentChat.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <p className="text-lg mb-2">👋 Hi! I'm your AI assistant</p>
                        <p className="text-sm">Tell me about your HCP interaction and I'll help you log it.</p>
                      </div>
                    ) : (
                      currentChat.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              msg.role === 'user'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-800 border border-gray-200'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      disabled={loading}
                    />
                    <button
                      onClick={handleChatSubmit}
                      disabled={loading || !chatInput.trim()}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Tools</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGenerateInsights}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  📊 Generate Insights
                </button>
                <button
                  onClick={handleSearchHCP}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  🔍 Search HCP
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Interactions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {interactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No interactions yet</p>
                ) : (
                  interactions.map(interaction => (
                    <div key={interaction.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {hcps.find(h => h.id === interaction.hcp_id)?.name || 'Unknown HCP'}
                          </p>
                          <p className="text-xs text-gray-500">{interaction.interaction_type}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(interaction.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{interaction.notes.substring(0, 80)}...</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(interaction)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        {interaction.follow_up_required && (
                          <button
                            onClick={() => handleScheduleFollowup(interaction.id)}
                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          >
                            Schedule
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(interaction.id)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <CRMApp />
    </Provider>
  );
}