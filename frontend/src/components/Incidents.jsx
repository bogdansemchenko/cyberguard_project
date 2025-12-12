import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Clock, User, AlertOctagon, MessageSquare, Shield } from 'lucide-react';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);

  const load = async () => {
    const res = await axios.get('http://localhost:8000/api/incidents');
    setIncidents(res.data);
  };

  const handleAction = async (id, action) => {
      await axios.post(`http://localhost:8000/api/incidents/${id}/action?action=${action}`);
      load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      {/* Фильтры и кнопка создания */}
      <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 flex gap-4 items-center flex-wrap">
          <select className="bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white"><option>Все статусы</option></select>
          <select className="bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white"><option>Все уровни</option></select>
          <select className="bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white"><option>Последние 24 часа</option></select>
          <button className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
              <Plus size={16}/> Создать инцидент
          </button>
      </div>

      <div className="space-y-4">
        {incidents.map((inc) => (
            <div key={inc.id} className="bg-[#1f2937] rounded-lg border border-gray-700 overflow-hidden shadow-lg">
                <div className={`border-l-4 ${inc.severity === 'Critical' ? 'border-red-500' : inc.severity === 'High' ? 'border-orange-500' : 'border-yellow-500'} p-6`}>

                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            {inc.code}: {inc.type}
                        </h3>
                        <span className={`px-3 py-1 rounded text-xs font-bold ${inc.severity === 'Critical' ? 'bg-red-900 text-red-100' : 'bg-orange-900 text-orange-100'}`}>
                            {inc.severity === 'Critical' ? 'Критический' : inc.severity === 'High' ? 'Высокий' : 'Средний'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2"><Clock size={14}/> Время: {new Date(inc.created_at || Date.now()).toLocaleString()}</div>
                        <div className="flex items-center gap-2"><User size={14}/> Ответственный: {inc.responsible}</div>
                    </div>

                    <div className="bg-[#111827] p-3 rounded text-sm text-gray-300 mb-4">
                        <span className="font-bold text-gray-400">Описание: </span> {inc.description}
                    </div>

                    {inc.status !== 'Resolved' ? (
                        <div className="flex gap-3">
                            <button onClick={() => handleAction(inc.id, 'block_source')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2">
                                <AlertOctagon size={16}/> Блокировать источник
                            </button>
                            <button onClick={() => handleAction(inc.id, 'assign')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2">
                                <MessageSquare size={16}/> Назначить действия
                            </button>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2 text-green-500 font-bold text-sm border border-green-800 bg-green-900/20 p-2 rounded w-fit">
                             <Shield size={16}/> Инцидент устранен
                         </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}