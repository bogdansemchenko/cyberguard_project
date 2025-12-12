import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, Flame, PieChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = "http://localhost:8000/api";

export default function Analysis() {
  const [data, setData] = useState([]);
  const [types, setTypes] = useState({});
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
        const res = await axios.get(`${API_URL}/analysis`);
        setData(res.data.heatmap || []);
        setTypes(res.data.attacks_by_type || {});
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-gray-400 block mb-1">Источник данных</label>
              <select className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white">
                  <option>Live Stream (Real-time)</option>
                  <option>Архив логов</option>
              </select>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 h-[38px] transition"
          >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Обновление..." : "Обновить данные"}
          </button>
      </div>

      {/* Тепловая карта */}
      <div className="bg-[#1f2937] rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-blue-400 font-bold">Динамика уровня угроз (7 дней)</h3>
              <Flame className="text-orange-500" />
          </div>
          <div className="p-8 h-80 w-full bg-gradient-to-b from-[#1f2937] to-[#111827]">
               <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff'}} />
                        <Area type="monotone" dataKey="val" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
               </ResponsiveContainer>
          </div>
      </div>

      {/* Статистика по типам (добавил для полноты) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
             <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><PieChart size={18}/> Распределение атак</h3>
             <div className="space-y-3">
                {Object.entries(types).map(([key, val]) => (
                    <div key={key}>
                        <div className="flex justify-between text-sm text-gray-300 mb-1">
                            <span>{key}</span>
                            <span className="font-bold">{val}</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(100, val * 5)}%`}}></div>
                        </div>
                    </div>
                ))}
             </div>
          </div>
      </div>
    </div>
  );
}