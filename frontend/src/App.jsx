import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Threats from './components/Threats';
import Incidents from './components/Incidents';
import Analysis from './components/Analysis';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Protection from './components/Protection';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-[#0f1115] text-white font-sans overflow-hidden">
      <Sidebar active={currentTab} onChange={setCurrentTab} />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">CyberGuard Protection System</h1>
            <p className="text-gray-400 text-sm">Система мониторинга и предотвращения угроз</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <div className="font-bold text-sm">Иван Иванов</div>
                <div className="text-xs text-blue-400">Специалист безопасности</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-green-500 overflow-hidden">
                <img src="https://i.pravatar.cc/150?img=11" alt="User" />
             </div>
          </div>
        </header>

        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'threats' && <Threats />}
        {currentTab === 'incidents' && <Incidents />}
        {currentTab === 'analysis' && <Analysis />}
        {currentTab === 'reports' && <Reports />}
        {currentTab === 'settings' && <Settings />}
        {currentTab === 'protection' && <Protection />}

      </main>
    </div>
  );
}
export default App;