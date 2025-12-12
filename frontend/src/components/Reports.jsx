import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Plus, Calendar, Eye, Download } from 'lucide-react';

const API_URL = "http://localhost:8000/api";

export default function Reports() {
  const [reports, setReports] = useState([]);

  const load = () => axios.get(`${API_URL}/reports`).then(res => setReports(res.data));
  const create = () => axios.post(`${API_URL}/reports/create`).then(load);

  // Скачивание файла
  const downloadReport = (id, format) => {
      // Открываем URL в новом окне, браузер сам начнет загрузку
      window.open(`${API_URL}/reports/${id}/export?format=${format}`, '_blank');
  };

  const scheduleReport = () => {
      alert("Еженедельный отчет запланирован на отправку (Email: admin@company.com).");
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
        <div className="bg-[#1f2937] p-4 rounded-lg text-sm text-gray-300 mb-6 border border-gray-700">
            Здесь вы можете сформировать и просмотреть отчеты о безопасности вашей системы.
        </div>

        <div className="flex gap-4 mb-6">
            <button onClick={create} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-900/20">
                <Plus size={16}/> Создать новый отчет
            </button>
            <button onClick={scheduleReport} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-lg shadow-green-900/20">
                <Calendar size={16}/> Запланировать отчет
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((rep) => (
                <div key={rep.id} className="bg-[#1f2937] p-6 rounded-xl border border-gray-700 flex flex-col justify-between h-64 hover:border-blue-500 transition duration-300 shadow-xl">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-blue-400 text-lg leading-tight">{rep.title}</h3>
                        </div>
                        <div className="text-xs text-gray-500 mb-4">{new Date().toLocaleDateString()}</div>
                        <p className="text-sm text-gray-300 mb-2"><span className="font-bold">Тип:</span> {rep.type}</p>
                        <p className="text-sm text-gray-300"><span className="font-bold">Статус:</span> {rep.status}</p>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button className="flex-1 bg-blue-600/20 hover:bg-blue-600 text-blue-200 hover:text-white py-2 rounded text-xs flex justify-center items-center gap-2 transition font-semibold">
                            <Eye size={14}/> Просмотр
                        </button>
                        <button onClick={() => downloadReport(rep.id, 'PDF')} className="px-3 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white rounded text-xs transition font-bold flex items-center gap-1">
                            <Download size={12}/> PDF
                        </button>
                        <button onClick={() => downloadReport(rep.id, 'Excel')} className="px-3 bg-green-600/20 hover:bg-green-600 text-green-200 hover:text-white rounded text-xs transition font-bold flex items-center gap-1">
                            <Download size={12}/> XLS
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}