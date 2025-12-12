import React from 'react';
import { LayoutDashboard, ShieldAlert, AlertTriangle, BarChart2, FileText, Settings, ShieldCheck } from 'lucide-react';

export default function Sidebar({ active, onChange }) {
  const menu = [
    { id: 'dashboard', label: 'Информационная панель', icon: LayoutDashboard },
    { id: 'threats', label: 'Обнаруженные угрозы', icon: ShieldAlert },
    { id: 'incidents', label: 'Инциденты', icon: AlertTriangle },
    { id: 'analysis', label: 'Анализ данных', icon: BarChart2 },
    { id: 'reports', label: 'Отчеты', icon: FileText },
    { id: 'settings', label: 'Настройки системы', icon: Settings },
    { id: 'protection', label: 'Параметры защиты', icon: ShieldCheck },
  ];

  return (
    <div className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col">
      <div className="p-6 flex items-center gap-2 text-blue-500 font-bold text-xl">
        <ShieldCheck className="fill-current" /> CyberGuard
      </div>

      {/* Профиль как на скрине */}
      <div className="px-6 mb-8 text-center">
         <div className="w-16 h-16 rounded-full bg-gray-700 mx-auto mb-2 overflow-hidden border-2 border-green-500 relative">
            <img src="https://i.pravatar.cc/150?img=11" className="w-full h-full object-cover" />
         </div>
         <h3 className="text-white font-bold">Иван Иванов</h3>
         <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Специалист по кибербезопасности
         </div>
      </div>

      <div className="px-6 pb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Основное меню</div>
          <nav className="space-y-1">
            {menu.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${active === item.id ? 'bg-[#1f2937] text-blue-400 border-l-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
      </div>

      <div className="px-6">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Управление</div>
          <nav className="space-y-1">
            {menu.slice(4).map((item) => (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${active === item.id ? 'bg-[#1f2937] text-blue-400 border-l-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
      </div>
    </div>
  );
}