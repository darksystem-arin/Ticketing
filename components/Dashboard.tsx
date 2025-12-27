
import React from 'react';
import { Ticket, TicketStatus, UserRole, Unit, UnitType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ================================================================================================
// کامپوننت داشبورد (Dashboard)
// این کامپوننت خلاصه‌ای از وضعیت تیکت‌ها را در قالب آمار و نمودار نمایش می‌دهد.
// این صفحه فقط برای کاربران با دسترسی ادمین قابل مشاهده است.
// ================================================================================================

interface Props {
  tickets: Ticket[]; // لیست تمام تیکت‌ها برای محاسبه آمار
  role: UserRole;    // نقش کاربر فعلی (برای نمایش‌های احتمالی در آینده)
  units: Unit[];     // لیست واحدها برای نمایش آمار تفکیکی
}

const Dashboard: React.FC<Props> = ({ tickets, role, units }) => {
  // محاسبه آمار کلی تیکت‌ها
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
    pending: tickets.filter(t => t.status === TicketStatus.PENDING).length,
    closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
  };

  // آماده‌سازی داده‌ها برای نمودار میله‌ای
  const chartData = [
    { name: 'باز', value: stats.open, color: '#3b82f6' },
    { name: 'کارشناسی', value: stats.pending, color: '#f59e0b' },
    { name: 'بسته', value: stats.closed, color: '#10b981' },
  ];

  // محاسبه آمار به تفکیک هر واحد کاری (فقط برای واحدهای پشتیبانی و برای ادمین)
  const supportUnits = units.filter(unit => unit.type === UnitType.SUPPORT);
  const unitStats = supportUnits.map(unit => {
    const unitTickets = tickets.filter(ticket => ticket.unitId === unit.id);
    return {
      id: unit.id,
      name: unit.name,
      total: unitTickets.length,
      open: unitTickets.filter(t => t.status === TicketStatus.OPEN).length,
      pending: unitTickets.filter(t => t.status === TicketStatus.PENDING).length,
      closed: unitTickets.filter(t => t.status === TicketStatus.CLOSED).length,
    };
  });

  return (
    <div className="p-8">
      {/* هدر صفحه داشبورد */}
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">داشبورد مدیریت</h2>
        <p className="text-slate-500">خلاصه وضعیت تیکت‌های سامانه</p>
      </header>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'کل تیکت‌ها', value: stats.total, color: 'indigo' },
          { label: 'تیکت‌های باز', value: stats.open, color: 'blue' },
          { label: 'در انتظار پاسخ', value: stats.pending, color: 'amber' },
          { label: 'بسته شده', value: stats.closed, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* جدول آمار واحدها - فقط برای ادمین */}
      {role === UserRole.ADMIN && (
        <section className="mb-12">
          <header className="mb-6"><h3 className="text-lg font-bold text-slate-700">آمار بر اساس واحد کاری</h3></header>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">نام واحد</th>
                    <th className="px-6 py-4 font-bold text-center">کل تیکت‌ها</th>
                    <th className="px-6 py-4 font-bold text-center">باز</th>
                    <th className="px-6 py-4 font-bold text-center">در انتظار</th>
                    <th className="px-6 py-4 font-bold text-center">بسته شده</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {unitStats.map(unit => (
                    <tr key={unit.id}>
                      <td className="px-6 py-4 font-bold text-slate-700 text-sm">{unit.name}</td>
                      <td className="px-6 py-4 font-bold text-slate-600 text-center text-sm font-mono">{unit.total}</td>
                      <td className="px-6 py-4 text-blue-600 text-center text-sm font-mono">{unit.open}</td>
                      <td className="px-6 py-4 text-amber-600 text-center text-sm font-mono">{unit.pending}</td>
                      <td className="px-6 py-4 text-emerald-600 text-center text-sm font-mono">{unit.closed}</td>
                    </tr>
                  ))}
                  {unitStats.length === 0 && <tr><td colSpan={5} className="text-center text-slate-400 p-10">واحد پشتیبانی برای نمایش آمار یافت نشد.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* نمودارها و فعالیت‌های اخیر */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* نمودار وضعیت تیکت‌ها */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-700 mb-6">نمودار وضعیت</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* لیست آخرین فعالیت‌ها */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-700 mb-6">آخرین فعالیت‌ها</h3>
          <div className="space-y-4">
            {tickets.slice(0, 4).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-700">{ticket.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(ticket.lastUpdate).toLocaleTimeString('fa-IR')}</p>
                </div>
                <span className={`px-3 py-1 text-[10px] rounded-full font-bold ${
                  ticket.status === TicketStatus.OPEN ? 'bg-blue-100 text-blue-700' :
                  ticket.status === TicketStatus.CLOSED ? 'bg-emerald-100 text-emerald-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {ticket.status}
                </span>
              </div>
            ))}
            {tickets.length === 0 && <p className="text-center text-slate-400 py-10">فعالیتی یافت نشد</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;