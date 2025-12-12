import React from 'react';
import { RefreshCw, Flame } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analysis() {
  const data = [
    { name: 'Пн', val: 40 }, { name: 'Вт', val: 30 }, { name: 'Ср', val: 20 },
    { name: 'Чт', val: 27 }, { name: 'Пт', val: 18 }, { name: 'Сб', val: 23 }, { name: 'Вс', val: 34 }
  ];

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-gray-400 block mb-1">Тип данных</label>
              <select className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white">
                  <option>Логи безопасности</option>
                  <option>Трафик</option>
              </select>
          </div>
          <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-gray-400 block mb-1">Временной период</label>
              <select className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white">
                  <option>Последняя неделя</option>
                  <option>24 часа</option>
              </select>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 h-[38px]">
              <RefreshCw size={16} /> Обновить данные
          </button>
      </div>

      {/* Тепловая карта */}
      <div className="bg-[#1f2937] rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-blue-400 font-bold">Тепловая карта активности угроз</h3>
              <Flame className="text-orange-500" />
          </div>
          <div className="p-8 h-96 flex flex-col justify-center items-center bg-gradient-to-b from-[#1f2937] to-[#111827] relative">
               {/* Имитация графика */}
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
                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}} />
                        <Area type="monotone" dataKey="val" stroke="#ef4444" fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
               </ResponsiveContainer>
               <div className="absolute top-1/2 text-center pointer-events-none">
                   <Flame size={48} className="mx-auto text-blue-500 mb-2 opacity-50" />
                   <p className="text-gray-500 text-sm">Визуализация интенсивности и распределения угроз</p>
               </div>
          </div>
      </div>
    </div>
  );
}