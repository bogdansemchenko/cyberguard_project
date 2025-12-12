import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Brain, Bot, Plug, Save } from 'lucide-react';

export default function Protection() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/protection').then(res => setConfig(res.data));
  }, []);

  const toggle = (key) => {
    const newConfig = { ...config, [key]: !config[key] };
    setConfig(newConfig);
    axios.post('http://localhost:8000/api/protection/update', newConfig); // Сохраняем в БД
  };

  if (!config) return <div>Загрузка параметров...</div>;

  return (
    <div className="space-y-6">
       <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg text-sm text-blue-200">
           На этой странице вы можете настроить стратегии защиты и параметры автоматических действий.
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Алгоритмы */}
           <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-blue-400 font-bold">Алгоритмы обнаружения</h3>
                   <Brain className="text-blue-500" />
               </div>
               <div className="space-y-4">
                   <label className="block text-sm text-gray-400">Основной алгоритм</label>
                   <select className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white mb-4">
                       <option>Комбинированный (ML + сигнатурный)</option>
                       <option>Эвристический</option>
                   </select>

                   {['algo_ml', 'algo_network', 'algo_user'].map(key => (
                       <div key={key} className="flex justify-between items-center">
                           <span className="text-sm text-gray-300">
                               {key === 'algo_ml' ? 'Анализ аномалий' : key === 'algo_network' ? 'Сетевой анализ' : 'Поведение пользователей'}
                           </span>
                           <div onClick={() => toggle(key)} className={`w-10 h-5 rounded-full cursor-pointer relative transition ${config[key] ? 'bg-blue-500' : 'bg-gray-600'}`}>
                               <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${config[key] ? 'left-6' : 'left-1'}`}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>

           {/* Автоматические действия */}
           <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-blue-400 font-bold">Автоматические действия</h3>
                   <Bot className="text-blue-500" />
               </div>
               <div className="space-y-4">
                   <h4 className="text-xs text-gray-500 uppercase font-bold mt-2">При критических угрозах</h4>
                   {['auto_block', 'isolate', 'restart'].map(key => (
                       <div key={key} className="flex justify-between items-center">
                           <span className="text-sm text-gray-300">
                               {key === 'auto_block' ? 'Блокировка источника' : key === 'isolate' ? 'Изоляция устройства' : 'Перезагрузка служб'}
                           </span>
                           <div onClick={() => toggle(key)} className={`w-10 h-5 rounded-full cursor-pointer relative transition ${config[key] ? 'bg-blue-500' : 'bg-gray-600'}`}>
                               <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${config[key] ? 'left-6' : 'left-1'}`}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>

           {/* Интеграции */}
           <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-blue-400 font-bold">Интеграции</h3>
                   <Plug className="text-blue-500" />
               </div>
               <div className="space-y-4">
                   <h4 className="text-xs text-gray-500 uppercase font-bold mt-2">Внешние системы</h4>
                   {['siem', 'backup'].map(key => (
                       <div key={key} className="flex justify-between items-center">
                           <span className="text-sm text-gray-300">
                               {key === 'siem' ? 'SIEM-система' : 'Резервное копирование'}
                           </span>
                           <div onClick={() => toggle(key)} className={`w-10 h-5 rounded-full cursor-pointer relative transition ${config[key] ? 'bg-blue-500' : 'bg-gray-600'}`}>
                               <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${config[key] ? 'left-6' : 'left-1'}`}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </div>
    </div>
  );
}