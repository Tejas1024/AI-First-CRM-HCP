import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateField } from '../store';
import axios from 'axios';

export default function InteractionForm() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.interaction);

  const handleChange = (field, value) => {
    dispatch(updateField({ field, value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:8000/interactions/', {
        hcp_name: data.hcpName,
        interaction_type: data.interactionType,
        attendees: data.attendees,
        topics_discussed: data.topics,
        materials_shared: data.materials,
        sentiment: data.sentiment,
        outcomes: data.outcomes,
        follow_up_actions: data.followUp
      });
      alert('Interaction Logged Successfully via Form');
    } catch (e) {
      alert('Error logging interaction');
    }
  };

  // Common input style class to reuse
  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm text-gray-900";

  return (
    <div className="w-2/3 bg-gray-50 h-screen overflow-y-auto font-inter border-r border-gray-200">
      <div className="max-w-3xl mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">Log HCP Interaction</h1>
        <p className="text-gray-500 mb-8">Record details of your recent field visit or meeting.</p>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-6">
            
            {/* Row 1: Name & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700">HCP Name</label>
                <input 
                  type="text"
                  className={inputClass}
                  placeholder="Search or select HCP..."
                  value={data.hcpName}
                  onChange={(e) => handleChange('hcpName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Interaction Type</label>
                <select 
                  className={inputClass}
                  value={data.interactionType}
                  onChange={(e) => handleChange('interactionType', e.target.value)}
                >
                  <option>Meeting</option>
                  <option>Call</option>
                  <option>Email</option>
                  <option>Conference</option>
                </select>
              </div>
            </div>

            {/* Row 2: Topics */}
            <div>
                <label className="block text-sm font-semibold text-gray-700">Topics Discussed</label>
                <textarea 
                    rows={4}
                    className={inputClass}
                    placeholder="Enter key discussion points, product feedback, etc..."
                    value={data.topics}
                    onChange={(e) => handleChange('topics', e.target.value)}
                />
            </div>

            {/* Row 3: Sentiment */}
            <div>
                [cite_start]<label className="block text-sm font-semibold text-gray-700 mb-3">Observed/Inferred HCP Sentiment [cite: 43]</label>
                <div className="flex gap-4">
                    {['Positive', 'Neutral', 'Negative'].map((sent) => (
                        <label key={sent} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200">
                            <input 
                                type="radio" 
                                name="sentiment" 
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                checked={data.sentiment === sent}
                                onChange={() => handleChange('sentiment', sent)}
                            />
                            <span className="text-sm font-medium text-gray-700">{sent}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Row 4: Outcomes */}
            <div>
                <label className="block text-sm font-semibold text-gray-700">Outcomes</label>
                <textarea 
                    rows={3}
                    className={inputClass}
                    placeholder="Key outcomes or agreements..."
                    value={data.outcomes}
                    onChange={(e) => handleChange('outcomes', e.target.value)}
                />
            </div>
          </div>
          
          {/* Footer Button */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <button 
                onClick={handleSubmit}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Log Interaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}