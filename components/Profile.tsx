
import React from 'react';
import { AuthState, Unit } from '../types';

// ================================================================================================
// کامپوننت پروفایل کاربری (Profile)
// این کامپوننت اطلاعات کاربر لاگین کرده را نمایش می‌دهد.
// ================================================================================================

interface Props {
  auth: AuthState;
  units: Unit[];
  onBack: () => void;
}

const Profile: React.FC<Props> = ({ auth, units, onBack }) => {
  // پیدا کردن نام واحد سازمانی کاربر
  const assignedUnit = units.find(u => u.id === auth.assignedUnitId);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50/50">
      <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <div>
            <h3 className="font-bold text-slate-800">پروفایل کاربری</h3>
            <p className="text-sm text-slate-500">مشاهده اطلاعات حساب کاربری</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          {/* بخش اطلاعات اصلی */}
          <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
            <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-4xl font-bold shrink-0">
              {auth.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{auth.name}</h3>
              <p className="text-sm text-slate-500 font-mono">{auth.username}</p>
            </div>
          </div>

          {/* بخش جزئیات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
            <InfoField label="نام نمایشی" value={auth.name} />
            <InfoField label="نام کاربری" value={auth.username} />
            <InfoField label="شماره تماس" value={auth.phone || 'ثبت نشده'} />
            <InfoField label="واحد سازمانی" value={assignedUnit?.name || 'تعیین نشده'} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @component InfoField
 * یک کامپوننت کوچک برای نمایش یک فیلد اطلاعاتی در پروفایل.
 */
const InfoField = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
    <label className="text-xs text-slate-400">{label}</label>
    <p className="text-md font-bold text-slate-700 mt-1">{value}</p>
  </div>
);

export default Profile;