import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/dashboard');
        setData(res.data);
      } catch (e) {
        console.error("Ошибка загрузки дашборда:", e);
      }
    };
    fetch();
    const interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="text-center mt-20 text-gray-400">Загрузка системы CyberGuard...</div>;

  // Безопасное получение данных (защита от ошибок)
  const stats = data.stats || { threat_level: 0, network_health: 100 };
  const activeThreats = data.active_threats ?? 0; // Используем правильный ключ из API
  const incidentsList = data.incidents || [];     // Используем правильный ключ из API

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Карточка: Текущий статус сети */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-blue-400 font-semibold">Текущий статус сети</h3>
            <Activity className="text-blue-500" />
          </div>
          <div className="text-sm text-gray-400 mb-2">Общий уровень безопасности: <span className="text-yellow-500 font-bold">Средний</span></div>

          <div className="mb-1 flex justify-between text-xs">
             <span>Уровень угроз</span>
             <span className="text-red-400 font-bold">{stats.threat_level}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
             <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{width: `${stats.threat_level}%`}}></div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
             <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-white">{activeThreats}</div>
                <div className="text-xs text-gray-500">Активные угрозы</div>
             </div>
             <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-white">{stats.network_health.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Доступность</div>
             </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition">Запустить проверку</button>
            <button className="bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-600 text-xs py-2 rounded transition">Блокировать угрозы</button>
          </div>
        </div>

        {/* Карточка: Последние инциденты */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 shadow-lg col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-blue-400 font-semibold flex items-center gap-2">
                    <AlertTriangle size={18} /> Последние инциденты
                </h3>
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">Требуют внимания</span>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Тип</th>
                            <th className="px-4 py-2">Статус</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {incidentsList.length > 0 ? incidentsList.map(inc => (
                            <tr key={inc.id} className="hover:bg-gray-700/30">
                                <td className="px-4 py-3 font-mono text-blue-400">{inc.code}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-white">{inc.type}</div>
                                    <div className="text-xs text-gray-500 truncate w-48">{inc.description}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${inc.severity === 'Critical' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}`}>
                                        {inc.severity}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                          <tr><td colSpan="3" className="p-4 text-center text-gray-500">Нет активных инцидентов</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* График активности */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 shadow-lg col-span-3">
            <div className="flex justify-between mb-4">
                <h3 className="text-blue-400 font-semibold">Активность сети за 24ч</h3>
                <BarChart2 className="text-gray-500" />
            </div>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                        {time: '00:00', val: 20}, {time: '04:00', val: 45}, {time: '08:00', val: 30},
                        {time: '12:00', val: 80}, {time: '16:00', val: 65}, {time: '20:00', val: 50}, {time: '24:00', val: 90}
                    ]}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#4b5563" tick={{fontSize: 12}} />
                        <Tooltip contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151'}} />
                        <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs text-gray-400 flex gap-6">
                <p><strong>Пик активности:</strong> 14:30 - 15:45 (Подозрительные соединения)</p>
                <p><strong>Источник атак:</strong> 18 различных IP-адресов</p>
            </div>
        </div>

      </div>
    </div>
  );
}