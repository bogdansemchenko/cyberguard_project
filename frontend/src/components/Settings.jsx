import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save, Bell, Shield, Sliders } from 'lucide-react';

const API_URL = "http://localhost:8000/api";

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Загружаем настройки при старте
    axios.get(`${API_URL}/protection`).then(res => setConfig(res.data));
  }, []);

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
      setLoading(true);
      try {
          // Отправляем объект в формате, который ждет Pydantic: { "config": { ... } }
          await axios.post(`${API_URL}/protection/update`, { config: config });
          alert("Настройки успешно сохранены в базе данных!");
      } catch (e) {
          alert("Ошибка сохранения");
      } finally {
          setLoading(false);
      }
  };

  if (!config) return <div className="p-10 text-gray-400">Загрузка конфигурации...</div>;

  return (
    <div className="space-y-6">
        <div className="bg-blue-900/20 p-4 rounded border border-blue-800 text-blue-200 text-sm flex items-center gap-2">
            <Sliders size={16}/> Параметры системы применяются глобально ко всем модулям защиты.
        </div>

        {/* Параметры обнаружения */}
        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
            <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><Shield size={18}/> Параметры обнаружения</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Чувствительность</label>
                    <select
                        value={config.sensitivity || "Средняя"}
                        onChange={(e) => handleChange('sensitivity', e.target.value)}
                        className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white"
                    >
                        <option>Высокая</option>
                        <option>Средняя</option>
                        <option>Низкая</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Интервал сканирования</label>
                    <select
                        value={config.scan_interval || "Каждые 15 минут"}
                        onChange={(e) => handleChange('scan_interval', e.target.value)}
                        className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white"
                    >
                        <option>В реальном времени</option>
                        <option>Каждые 15 минут</option>
                        <option>Каждый час</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Уведомления */}
        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
             <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><Bell size={18}/> Каналы связи</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Способ уведомления</label>
                    <select
                        value={config.notifications || "Email"}
                        onChange={(e) => handleChange('notifications', e.target.value)}
                        className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-white"
                    >
                        <option>Email + Push</option>
                        <option>Только Email</option>
                        <option>SMS (Critical only)</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Email администратора</label>
                    <input
                        type="text"
                        value="admin@cyberguard.local"
                        readOnly
                        className="w-full bg-[#111827] border border-gray-600 rounded p-2 text-sm text-gray-500 cursor-not-allowed"
                    />
                 </div>
             </div>
        </div>

        <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 w-full py-3 rounded font-bold hover:bg-blue-500 flex justify-center items-center gap-2 transition"
        >
            <Save size={18}/> {loading ? "Сохранение..." : "Сохранить настройки"}
        </button>
    </div>
  );
}