import React from 'react';
import InteractionForm from './components/InteractionForm';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="flex flex-row h-screen w-full overflow-hidden">
      <InteractionForm />
      <ChatInterface />
    </div>
  );
}

export default App;