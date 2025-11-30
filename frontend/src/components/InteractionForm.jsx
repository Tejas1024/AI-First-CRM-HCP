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

  // Improved Input Styling (Force white background and visible text)
  const inputClass = "mt-1 block w-full rounded-md border-2 border-gray-300 bg-white text-gray-900 py-2 px-3 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm placeholder-gray-400";
  const labelClass = "block text-sm font-bold text-gray-800 mb-1";

  return (
    <div className="w-2/3 h-screen overflow-y-auto bg-gray-50 font-inter border-r border-gray-300">
      <div className="max-w-4xl mx-auto py-10 px-8">
        
        {/* Header Section */}
        <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-indigo-900">Log HCP Interaction</h1>
            <p className="text-gray-600 mt-2">Enter the details of your field visit or meeting below.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Row 1: Name & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>HCP Name</label>
                <input 
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Dr. John Smith"
                  value={data.hcpName}
                  onChange={(e) => handleChange('hcpName', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Interaction Type</label>
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
                <label className={labelClass}>Topics Discussed</label>
                <textarea 
                    rows={4}
                    className={inputClass}
                    placeholder="Enter key discussion points, product feedback..."
                    value={data.topics}
                    onChange={(e) => handleChange('topics', e.target.value)}
                />
            </div>

            {/* Row 3: Sentiment */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                [cite_start]<label className={labelClass}>Observed Sentiment [cite: 43]</label>
                <div className="flex gap-6 mt-2">
                    {['Positive', 'Neutral', 'Negative'].map((sent) => (
                        <label key={sent} className="flex items-center space-x-3 cursor-pointer">
                            <input 
                                type="radio" 
                                name="sentiment" 
                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                checked={data.sentiment === sent}
                                onChange={() => handleChange('sentiment', sent)}
                            />
                            <span className="text-sm font-medium text-gray-900">{sent}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Row 4: Outcomes */}
            <div>
                <label className={labelClass}>Outcomes & Next Steps</label>
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
          <div className="bg-gray-100 px-8 py-5 border-t border-gray-200">
            <button 
                onClick={handleSubmit}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                Log Interaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}