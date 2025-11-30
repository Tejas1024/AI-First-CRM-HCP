import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateField } from '../store';
import axios from 'axios';
import { Mic, Search, Plus, Calendar, Clock, Users } from 'lucide-react';

export default function InteractionForm() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.interaction);

  const handleChange = (field, value) => {
    dispatch(updateField({ field, value }));
  };

  const handleSubmit = async () => {
    try {
      // CHANGE: Use 127.0.0.1 instead of localhost
      await axios.post('http://127.0.0.1:8000/interactions/', {
        hcp_name: data.hcpName,
        interaction_type: data.interactionType,
        interaction_date: data.date,
        interaction_time: data.time,
        attendees: data.attendees,
        topics_discussed: data.topics,
        materials_shared: data.materials,
        samples_distributed: data.samples,
        sentiment: data.sentiment,
        outcomes: data.outcomes,
        follow_up_actions: data.followUp
      });
      alert('Interaction Logged Successfully!');
    } catch (e) {
      alert('Error logging interaction. Check backend console.');
    }
  };

  const inputClass = "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";
  const sectionClass = "bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4";

  return (
    <div className="w-2/3 h-screen overflow-y-auto bg-gray-50 font-inter border-r border-gray-200">
      <div className="max-w-4xl mx-auto py-8 px-6">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Log HCP Interaction</h1>
        
        {/* Section 1: Core Details [cite: 28-31, 36-40] */}
        <div className={sectionClass}>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={labelClass}>HCP Name</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className={inputClass} 
                            placeholder="Search or select HCP..."
                            value={data.hcpName}
                            onChange={(e) => handleChange('hcpName', e.target.value)}
                        />
                        <Search className="absolute right-2 top-2.5 text-gray-400" size={16}/>
                    </div>
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

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Date</label>
                    <div className="relative">
                        <input 
                            type="date" 
                            className={inputClass}
                            value={data.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                        />
                        <Calendar className="absolute right-8 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Time</label>
                    <div className="relative">
                        <input 
                            type="time" 
                            className={inputClass}
                            value={data.time}
                            onChange={(e) => handleChange('time', e.target.value)}
                        />
                        <Clock className="absolute right-8 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                    </div>
                </div>
            </div>
        </div>

        {/* Section 2: Attendees [cite: 41, 42] */}
        <div className={sectionClass}>
             <label className={labelClass}>Attendees</label>
             <div className="relative">
                <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="Enter names of attendees..."
                    value={data.attendees}
                    onChange={(e) => handleChange('attendees', e.target.value)}
                />
                <Users className="absolute right-2 top-2.5 text-gray-400" size={16}/>
             </div>
        </div>

        {/* Section 3: Topics & Voice Note [cite: 43, 44] */}
        <div className={sectionClass}>
            <label className={labelClass}>Topics Discussed</label>
            <textarea 
                rows={3} 
                className={inputClass} 
                placeholder="Enter key discussion points..."
                value={data.topics}
                onChange={(e) => handleChange('topics', e.target.value)}
            />
            
            <button className="mt-3 flex items-center justify-center w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-indigo-400 transition-colors">
                <Mic size={16} className="mr-2 text-indigo-500"/>
                Summarize from Voice Note (Requires Consent)
            </button>
        </div>

        {/* Section 4: Materials & Samples [cite: 45-47, 57, 58] */}
        <div className={sectionClass}>
            <div className="mb-4">
                <label className={labelClass}>Materials Shared</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        className={inputClass} 
                        placeholder="Brochures, Clinical Papers..."
                        value={data.materials}
                        onChange={(e) => handleChange('materials', e.target.value)}
                    />
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-200 flex items-center whitespace-nowrap">
                        <Search size={14} className="mr-1"/> Search/Add
                    </button>
                </div>
            </div>
            <div>
                <label className={labelClass}>Samples Distributed</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        className={inputClass} 
                        placeholder="No samples added"
                        value={data.samples}
                        onChange={(e) => handleChange('samples', e.target.value)}
                    />
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-200 flex items-center whitespace-nowrap">
                        <Plus size={14} className="mr-1"/> Add Sample
                    </button>
                </div>
            </div>
        </div>

        {/* Section 5: Sentiment [cite: 48, 49] */}
        <div className={sectionClass}>
            <label className={labelClass}>Observed/Inferred HCP Sentiment</label>
            <div className="flex gap-6 mt-2">
                {['Positive', 'Neutral', 'Negative'].map((sent) => (
                    <label key={sent} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="sentiment" 
                            checked={data.sentiment === sent}
                            onChange={() => handleChange('sentiment', sent)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">{sent}</span>
                    </label>
                ))}
            </div>
        </div>

        {/* Section 6: Outcomes & Follow-up [cite: 50-53] */}
        <div className={sectionClass}>
            <div className="mb-4">
                <label className={labelClass}>Outcomes</label>
                <textarea 
                    rows={2} 
                    className={inputClass} 
                    placeholder="Key outcomes or agreements..."
                    value={data.outcomes}
                    onChange={(e) => handleChange('outcomes', e.target.value)}
                />
            </div>
            <div>
                <label className={labelClass}>Follow-up Actions</label>
                <textarea 
                    rows={2} 
                    className={inputClass} 
                    placeholder="Enter next steps or tasks..."
                    value={data.followUp}
                    onChange={(e) => handleChange('followUp', e.target.value)}
                />
            </div>
        </div>

        {/* Section 7: AI Suggested Follow-ups [cite: 54-56] */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
                ✨ AI Suggested Follow-ups
            </h3>
            <ul className="space-y-2">
                <li className="flex items-start">
                    <input type="checkbox" className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                    <span className="ml-2 text-sm text-indigo-800">Schedule follow-up meeting in 2 weeks</span>
                </li>
                <li className="flex items-start">
                    <input type="checkbox" className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                    <span className="ml-2 text-sm text-indigo-800">Send "CardioPhase Phase III" PDF</span>
                </li>
            </ul>
        </div>

        {/* Footer Button [cite: 59] */}
        <div className="mt-6 pb-6">
            <button 
                onClick={handleSubmit}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Log Interaction
            </button>
        </div>

      </div>
    </div>
  );
}