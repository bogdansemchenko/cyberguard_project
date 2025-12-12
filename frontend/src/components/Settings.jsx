import React from 'react';
import { Save, Bell, Database, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
        <div className="bg-blue-900/20 p-4 rounded border border-blue-800 text-blue-200 text-sm">
            На этой странице вы можете настроить параметры системы безопасности в соответствии с потребностями вашей организации.
        </div>

        {/* Параметры обнаружения */}
        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
            <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><Shield size={18}/> Параметры обнаружения угроз</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Чувствительность детектора</label>
                    <select className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white">
                        <option>Средняя (оптимальный баланс)</option>
                        <option>Высокая</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Интервал сканирования</label>
                    <select className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white">
                        <option>Каждые 15 минут</option>
                        <option>В реальном времени</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Уведомления */}
        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
             <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><Bell size={18}/> Настройки уведомлений</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-[#111827] p-4 rounded border border-gray-600 flex justify-between items-center">
                     <div>
                         <div className="text-white font-bold text-sm">Критические угрозы</div>
                         <div className="text-xs text-gray-500">Способы оповещения</div>
                     </div>
                     <div className="text-green-400 text-xs font-mono">Email + SMS + Push</div>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Email для уведомлений</label>
                    <input type="text" value="security@company.com" readOnly className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white"/>
                 </div>
             </div>
        </div>

        <button className="bg-blue-600 w-full py-3 rounded font-bold hover:bg-blue-500 flex justify-center items-center gap-2">
            <Save size={18}/> Сохранить настройки
        </button>
    </div>
  );
}