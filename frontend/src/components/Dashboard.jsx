import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, BarChart2, Shield, Play, Ban } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = "http://localhost:8000/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [scanning, setScanning] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/dashboard`);
      setData(res.data);
    } catch (e) {
      console.error("Ошибка загрузки дашборда:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- ЛОГИКА КНОПКИ СКАНИРОВАНИЯ ---
  const handleScan = async () => {
    setScanning(true);
    try {
        await axios.post(`${API_URL}/scan/start`);
        alert("Сканирование завершено. Данные обновлены.");
        fetchData(); // Обновляем цифры сразу
    } catch (e) {
        alert("Ошибка при запуске сканирования");
    } finally {
        setScanning(false);
    }
  };

  const handleBlockAll = async () => {
      if(window.confirm("Вы уверены? Это заблокирует все активные угрозы.")) {
          await axios.post(`${API_URL}/threats/block_all`);
          fetchData();
      }
  };

  if (!data) return <div className="text-center mt-20 text-gray-400">Загрузка системы CyberGuard...</div>;

  const stats = data.stats || { threat_level: 0, network_health: 100 };
  const activeThreats = data.active_threats ?? 0;
  const incidentsList = data.incidents || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Карточка: Текущий статус */}
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
            {/* ЖИВАЯ КНОПКА СКАНИРОВАНИЯ */}
            <button
                onClick={handleScan}
                disabled={scanning}
                className={`bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition flex justify-center items-center gap-2 ${scanning ? 'opacity-50' : ''}`}
            >
                <Play size={12} /> {scanning ? "Сканирование..." : "Запустить проверку"}
            </button>

            <button onClick={handleBlockAll} className="bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-600 text-xs py-2 rounded transition flex justify-center items-center gap-2">
                <Shield size={12}/> Блокировать угрозы
            </button>
          </div>
        </div>

        {/* Карточка: Инциденты */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 shadow-lg col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-blue-400 font-semibold flex items-center gap-2">
                    <AlertTriangle size={18} /> Последние инциденты
                </h3>
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
                        {incidentsList.map(inc => (
                            <tr key={inc.id} className="hover:bg-gray-700/30">
                                <td className="px-4 py-3 font-mono text-blue-400">{inc.code}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-white">{inc.type}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${inc.severity === 'Critical' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}`}>
                                        {inc.severity}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}