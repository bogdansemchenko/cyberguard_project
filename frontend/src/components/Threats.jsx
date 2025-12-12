import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Filter, Ban, Globe, RefreshCcw } from 'lucide-react';

export default function Threats() {
  const [threats, setThreats] = useState([]);

  const load = async () => {
    const res = await axios.get('http://localhost:8000/api/threats');
    setThreats(res.data);
  };

  const blockIP = async (ip) => {
    await axios.post(`http://localhost:8000/api/actions/block_ip?ip=${ip}`);
    load(); // Refresh logic
    alert(`Источник ${ip} заблокирован. Правила фаервола обновлены.`);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
        {/* Фильтры как на скрине */}
        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 flex gap-4 items-end">
            <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Тип угрозы</label>
                <select className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm">
                    <option>Все типы</option>
                    <option>DDoS</option>
                    <option>Phishing</option>
                </select>
            </div>
            <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Уровень опасности</label>
                <select className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm">
                    <option>Все уровни</option>
                    <option>Критический</option>
                </select>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 h-10 transition">
                <Filter size={16} /> Применить фильтры
            </button>
        </div>

        {/* Визуализация карты (имитация) */}
        <div className="flex-1 bg-[#0f172a] rounded-xl border border-gray-700 relative overflow-hidden p-6 shadow-inner">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>

            <h3 className="relative z-10 text-gray-400 text-sm mb-4 flex items-center gap-2">
                <Globe size={16}/> Геолокация активных угроз
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 overflow-y-auto max-h-[60vh] pr-2">
                {threats.map((t) => (
                    <div key={t.id} className={`p-4 rounded border transition group ${t.is_active ? 'bg-gray-800/80 border-gray-600' : 'bg-green-900/20 border-green-800 opacity-60'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-sm text-white">{t.type}</div>
                                <div className="font-mono text-xs text-blue-400 mt-1">{t.source_ip}</div>
                                <div className="text-xs text-gray-500 mt-1">{t.location}</div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${t.is_active ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                        </div>

                        {t.is_active && (
                            <button
                                onClick={() => blockIP(t.source_ip)}
                                className="mt-3 w-full bg-red-600/10 hover:bg-red-600 border border-red-600/50 text-red-200 hover:text-white text-xs py-1.5 rounded transition flex justify-center items-center gap-2"
                            >
                                <Ban size={12} /> Блокировать IP
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}