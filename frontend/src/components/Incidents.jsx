import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Clock, User, AlertOctagon, MessageSquare, Shield, Bell } from 'lucide-react';

const API_URL = "http://localhost:8000/api";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
        const res = await axios.get(`${API_URL}/incidents`);
        if (Array.isArray(res.data)) setIncidents(res.data);
    } catch (e) { console.error(e); }
  };

  // Создание инцидента
  const handleCreate = async () => {
      setLoading(true);
      try {
          await axios.post(`${API_URL}/incidents/create`);
          await load();
      } catch (e) {
          alert("Ошибка создания");
      } finally {
          setLoading(false);
      }
  };

  // Действия с инцидентом
  const handleAction = async (id, action) => {
      await axios.post(`${API_URL}/incidents/${id}/action?action_type=${action}`);
      load();
  };

  // Уведомление (Новое)
  const handleNotify = async (id) => {
      try {
          await axios.post(`${API_URL}/notifications/send`, { message: `Check incident ${id}` });
          alert("Уведомление отправлено службе безопасности.");
      } catch (e) {
          alert("Ошибка отправки уведомления");
      }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Журнал Инцидентов</h2>
          <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
          >
              <Plus size={16}/> {loading ? "Создание..." : "Создать инцидент"}
          </button>
      </div>

      <div className="space-y-4">
        {incidents.map((inc) => (
            <div key={inc.id} className="bg-[#1f2937] rounded-lg border border-gray-700 overflow-hidden shadow-lg">
                <div className={`border-l-4 ${inc.severity === 'Critical' ? 'border-red-500' : inc.severity === 'High' ? 'border-orange-500' : 'border-blue-500'} p-6`}>

                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            {inc.code}: {inc.type}
                        </h3>
                        <span className={`px-3 py-1 rounded text-xs font-bold ${inc.status === 'Resolved' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
                            {inc.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2"><Clock size={14}/> {new Date(inc.created_at).toLocaleString()}</div>
                        <div className="flex items-center gap-2"><User size={14}/> {inc.responsible || "Не назначен"}</div>
                    </div>

                    <div className="bg-[#111827] p-3 rounded text-sm text-gray-300 mb-4">
                        {inc.description}
                    </div>

                    {inc.status !== 'Resolved' ? (
                        <div className="flex gap-3 flex-wrap">
                            <button onClick={() => handleAction(inc.id, 'block_source')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2">
                                <AlertOctagon size={16}/> Блокировать
                            </button>
                            <button onClick={() => handleAction(inc.id, 'assign')} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2">
                                <MessageSquare size={16}/> Взять в работу
                            </button>
                            {/* Кнопка уведомления */}
                            <button onClick={() => handleNotify(inc.id)} className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2">
                                <Bell size={16}/> Уведомить
                            </button>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                             <Shield size={16}/> Угроза устранена
                         </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}