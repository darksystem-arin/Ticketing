
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, Unit, UnitType } from '../types';
import { ICONS } from '../constants';
import { formatTimeAgo } from '../utils';

// ================================================================================================
// کامپوننت لیست تیکت‌ها (TicketList)
// این کامپوننت لیست تیکت‌ها را نمایش می‌دهد، امکان فیلتر کردن و ایجاد تیکت جدید را فراهم می‌کند.
// ================================================================================================

interface Props {
  tickets: Ticket[];      // لیست تیکت‌هایی که کاربر فعلی به آن‌ها دسترسی دارد
  units: Unit[];          // لیست واحدها برای انتخاب در مدال ایجاد تیکت
  onSelectTicket: (id: string) => void; // تابعی که هنگام انتخاب یک تیکت فراخوانی می‌شود
  onCreateTicket: (title: string, desc: string, unitId: string) => void; // تابعی برای ایجاد تیکت جدید
  canCreate: boolean;     // آیا کاربر مجوز ایجاد تیکت جدید را دارد؟
}

const TicketList: React.FC<Props> = ({ tickets, units, onSelectTicket, onCreateTicket, canCreate }) => {
  // فیلتر کردن واحدها برای نمایش فقط واحدهای پشتیبانی در فرم ایجاد تیکت
  const supportUnits = units.filter(u => u.type === UnitType.SUPPORT);

  // وضعیت‌های محلی برای مدیریت مدال، فیلتر و فیلدهای فرم
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState(supportUnits[0]?.id || '');

  // وضعیتی برای به‌روزرسانی دوره‌ای زمان‌های نسبی
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // تایمری که هر دقیقه یک‌بار اجرا می‌شود تا زمان‌های «... پیش» به‌روز شوند
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // به‌روزرسانی هر 60 ثانیه

    return () => clearInterval(timer); // پاک‌سازی تایمر هنگام خروج از کامپوننت
  }, []);

  // فیلتر کردن تیکت‌ها بر اساس وضعیت انتخاب شده
  const filteredTickets = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

  /**
   * @function handleSubmit
   * هنگام ارسال فرم ایجاد تیکت جدید، این تابع فراخوانی می‌شود.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && newDesc && selectedUnitId) {
      onCreateTicket(newTitle, newDesc, selectedUnitId);
      setNewTitle(''); setNewDesc('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      {/* هدر صفحه لیست تیکت‌ها */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">تیکت‌های پشتیبانی</h2>
          <p className="text-slate-500">مشاهده و مدیریت درخواست‌ها بر اساس واحدهای کاری</p>
        </div>
        {/* دکمه ایجاد تیکت جدید فقط در صورت داشتن دسترسی نمایش داده می‌شود */}
        {canCreate && (
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all">
            <ICONS.Plus /><span>ثبت تیکت جدید</span>
          </button>
        )}
      </header>

      {/* دکمه‌های فیلتر */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['ALL', ...Object.values(TicketStatus)].map((s) => (
          <button key={s} onClick={() => setFilter(s as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === s ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>
            {s === 'ALL' ? 'همه' : s}
          </button>
        ))}
      </div>

      {/* لیست تیکت‌ها */}
      <div className="space-y-4">
        {filteredTickets.map(ticket => (
          <div key={ticket.id} onClick={() => onSelectTicket(ticket.id)} className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer shadow-sm flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-[10px] rounded-full font-bold ${
                  ticket.status === TicketStatus.OPEN ? 'bg-blue-100 text-blue-700' : ticket.status === TicketStatus.CLOSED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {ticket.status}
                </span>
                <span className="text-[10px] px-2 py-1 bg-slate-50 text-slate-500 rounded-lg font-bold">
                  {units.find(u => u.id === ticket.unitId)?.name || 'بدون واحد'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{ticket.title}</h3>
              <p className="text-slate-400 text-sm mt-1 line-clamp-1 font-light">{ticket.description}</p>
            </div>
            <div className="text-slate-400 text-xs font-medium">
               {formatTimeAgo(ticket.createdAt)}
            </div>
          </div>
        ))}
        {filteredTickets.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">تیکتی یافت نشد</div>
        )}
      </div>

      {/* مدال ایجاد تیکت جدید */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-6">ثبت درخواست جدید</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">انتخاب واحد کاری (دپارتمان)</label>
                <select 
                  value={selectedUnitId}
                  onChange={e => setSelectedUnitId(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50"
                >
                  {supportUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">موضوع تیکت</label>
                <input autoFocus required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50" placeholder="مثلا: مشکل در ورود" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">توضیحات</label>
                <textarea required rows={4} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 resize-none" placeholder="جزئیات مشکل..." />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl">ثبت تیکت</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;