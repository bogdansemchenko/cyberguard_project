import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Filter, Ban, Globe } from 'lucide-react';

const API_URL = "http://localhost:8000/api";

export default function Threats() {
  const [threats, setThreats] = useState([]);
  const [filters, setFilters] = useState({ type: "Все типы", severity: "Все уровни" });

  const load = async () => {
    // ВАЖНО: Мы передаем параметры только если они выбраны конкретно
    const params = {};
    if (filters.type !== "Все типы") params.type = filters.type;
    if (filters.severity !== "Все уровни") params.severity = filters.severity;

    console.log("Запрос с фильтрами:", params); // Для отладки (F12)

    try {
        const res = await axios.get(`${API_URL}/threats`, { params });
        setThreats(res.data);
    } catch (e) { console.error(e); }
  };

  const blockIP = async (ip) => {
    await axios.post(`${API_URL}/actions/block_ip?ip=${ip}`);
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
        {/* Фильтры */}
        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-gray-400 block mb-1">Тип угрозы</label>
                <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white"
                >
                    <option>Все типы</option>
                    <option>DDoS</option>
                    <option>Phishing</option>
                    <option>Malware</option>
                    <option>SQL-Inj</option>
                </select>
            </div>
            <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-gray-400 block mb-1">Уровень опасности</label>
                <select
                    value={filters.severity}
                    onChange={(e) => setFilters({...filters, severity: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white"
                >
                    <option>Все уровни</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                </select>
            </div>
            {/* Кнопка "Применить" - вызывает load() */}
            <button onClick={load} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 h-[38px] transition shadow-lg">
                <Filter size={16} /> Применить фильтры
            </button>
        </div>

        {/* Сетка угроз */}
        <div className="flex-1 bg-[#0f172a] rounded-xl border border-gray-700 relative overflow-hidden p-6 shadow-inner">
             {/* Фон-сетка */}
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 overflow-y-auto max-h-[60vh] pr-2">
                {threats.length > 0 ? threats.map((t) => (
                    <div key={t.id} className={`p-4 rounded border transition group ${t.is_active ? 'bg-gray-800/80 border-gray-600 shadow-md' : 'bg-green-900/10 border-green-900 opacity-50'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-sm text-white flex items-center gap-2">
                                    {t.type}
                                </div>
                                <div className="font-mono text-xs text-blue-400 mt-1">{t.source_ip}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Обнаружено: {new Date(t.detected_at).toLocaleTimeString()}
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.severity==='Critical'?'bg-red-900 text-red-100': t.severity==='High'?'bg-orange-900 text-orange-100':'bg-blue-900 text-blue-100'}`}>
                                {t.severity}
                            </span>
                        </div>

                        {t.is_active ? (
                            <button onClick={() => blockIP(t.source_ip)} className="mt-3 w-full bg-red-600/10 hover:bg-red-600 border border-red-600/50 text-red-200 hover:text-white text-xs py-1.5 rounded transition flex justify-center items-center gap-2">
                                <Ban size={12} /> Блокировать источник
                            </button>
                        ) : (
                            <div className="mt-3 w-full text-center text-xs text-green-500 font-bold border border-green-900/30 rounded py-1">
                                Угроза нейтрализована
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="col-span-3 text-center text-gray-500 py-10">
                        Угроз по заданным фильтрам не найдено.
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}