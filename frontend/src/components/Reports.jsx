import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Plus, Calendar, Eye, Download, X } from 'lucide-react';

const API_URL = "http://localhost:8000/api";

export default function Reports() {
  const [reports, setReports] = useState([]);
  // Состояния для модальных окон
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Форма создания
  const [formData, setFormData] = useState({ title: '', type: 'Сводный', description: '' });

  const load = () => axios.get(`${API_URL}/reports`).then(res => setReports(res.data));

  useEffect(() => { load(); }, []);

  // Отправка формы создания
  const handleSubmitCreate = async (e) => {
      e.preventDefault();
      try {
          await axios.post(`${API_URL}/reports/create`, formData);
          setShowCreateModal(false);
          setFormData({ title: '', type: 'Сводный', description: '' }); // Сброс
          load();
      } catch (e) {
          alert("Ошибка при создании отчета");
      }
  };

  const downloadReport = (id, format) => {
      window.open(`${API_URL}/reports/${id}/export?format=${format}`, '_blank');
  };

  const openView = (rep) => {
      setSelectedReport(rep);
      setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
        <div className="bg-[#1f2937] p-4 rounded-lg text-sm text-gray-300 mb-6">
            Управление отчетностью и документацией.
        </div>

        <div className="flex gap-4 mb-6">
            <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-lg"
            >
                <Plus size={16}/> Создать отчет
            </button>
        </div>

        {/* Сетка отчетов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((rep) => (
                <div key={rep.id} className="bg-[#1f2937] p-6 rounded-xl border border-gray-700 flex flex-col justify-between h-64 hover:border-blue-500 transition shadow-lg">
                    <div>
                        <h3 className="font-bold text-blue-400 text-lg leading-tight mb-2 truncate">{rep.title}</h3>
                        <div className="text-xs text-gray-500 mb-4">{new Date(rep.created_at).toLocaleDateString()}</div>
                        <p className="text-sm text-gray-300 mb-1"><span className="font-bold">Тип:</span> {rep.type}</p>
                        <p className="text-sm text-gray-300 truncate"><span className="font-bold">Инфо:</span> {rep.date_range}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={() => openView(rep)} className="flex-1 bg-blue-600/20 hover:bg-blue-600 text-blue-200 hover:text-white py-2 rounded text-xs flex justify-center items-center gap-2 font-bold transition">
                            <Eye size={14}/> Просмотр
                        </button>
                        <button onClick={() => downloadReport(rep.id, 'PDF')} className="px-3 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-bold">PDF</button>
                    </div>
                </div>
            ))}
        </div>

        {/* МОДАЛКА: СОЗДАНИЕ ОТЧЕТА */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                <div className="bg-[#1e293b] w-full max-w-md rounded-xl border border-gray-600 p-6 animate-in fade-in zoom-in duration-200">
                    <h2 className="text-xl font-bold text-white mb-4">Новый отчет</h2>
                    <form onSubmit={handleSubmitCreate} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Заголовок</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                                placeholder="Например: Отчет за Ноябрь"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Тип отчета</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
                            >
                                <option>Сводный</option>
                                <option>Аналитический</option>
                                <option>По инциденту</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Краткое содержание / Описание</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white h-24 focus:border-blue-500 outline-none"
                                placeholder="Основные показатели..."
                            />
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700">Отмена</button>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold">Создать</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* МОДАЛКА: ПРОСМОТР */}
        {showViewModal && selectedReport && (
            <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                <div className="bg-[#1e293b] w-full max-w-lg rounded-xl border border-gray-600 p-6 relative">
                    <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
                    <h2 className="text-xl font-bold text-blue-400 mb-4">{selectedReport.title}</h2>
                    <div className="space-y-4 text-sm text-gray-300">
                        <div className="bg-gray-800 p-3 rounded border border-gray-700">
                            <span className="text-gray-500 text-xs block">Тип</span>
                            {selectedReport.type}
                        </div>
                        <div className="bg-gray-800 p-3 rounded border border-gray-700 h-40 overflow-auto">
                            <span className="text-gray-500 text-xs block mb-1">Содержание</span>
                            {selectedReport.date_range}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                            ID: {selectedReport.id} | {new Date(selectedReport.created_at).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}