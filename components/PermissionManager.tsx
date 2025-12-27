
import React, { useState } from 'react';
import { ManagedUser, UserRole, Unit, UnitType } from '../types';

// ================================================================================================
// کامپوننت مدیریت دسترسی‌ها (PermissionManager)
// این کامپوننت به ادمین اجازه می‌دهد تا واحدها و کاربران را مدیریت کند.
// شامل تعریف واحد، افزودن کاربر، تخصیص واحد و تعیین سطوح دسترسی است.
// ================================================================================================

interface Props {
  users: ManagedUser[];
  units: Unit[];
  onUpdateUser: (user: ManagedUser) => void;
  onAddUser: (username: string, password: string, name: string, role: UserRole, assignedUnitId?: string) => void;
  onDeleteUser: (username: string) => void;
  onAddUnit: (name: string, type: UnitType) => void;
  onDeleteUnit: (id: string) => void;
}

const PermissionManager: React.FC<Props> = ({ users, units, onUpdateUser, onAddUser, onDeleteUser, onAddUnit, onDeleteUnit }) => {
  // وضعیت‌های محلی برای فیلدهای ورودی
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newUserUnitId, setNewUserUnitId] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.EXPERT);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitType, setNewUnitType] = useState<UnitType>(UnitType.SUPPORT);

  /**
   * @function handleAddUser
   * افزودن کاربر جدید با نام کاربری، رمز عبور و نام نمایشی.
   */
  const handleAddUser = () => {
    if (newUsername.trim() && newPassword && newName.trim()) {
      onAddUser(newUsername.trim(), newPassword, newName.trim(), newUserRole, newUserUnitId || undefined);
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewUserUnitId('');
      setNewUserRole(UserRole.EXPERT);
    }
  };

  const supportUnits = units.filter(u => u.type === UnitType.SUPPORT);
  const customerUnits = units.filter(u => u.type === UnitType.CUSTOMER);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-12">
      {/* بخش مدیریت واحدها */}
      <section>
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">مدیریت واحدهای کاری</h2>
          <p className="text-slate-500 text-sm">تعریف دپارتمان‌های پشتیبانی و گروه‌های مشتریان</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ستون واحدهای پشتیبانی */}
          <UnitSection title="واحدهای پشتیبانی" units={supportUnits} onDelete={onDeleteUnit} />
          {/* ستون واحدهای مشتری */}
          <UnitSection title="واحدهای مشتری" units={customerUnits} onDelete={onDeleteUnit} />
        </div>
        {/* فرم افزودن واحد جدید */}
        <div className="mt-6 bg-white rounded-3xl border border-slate-100 p-6 flex flex-wrap items-center gap-3">
            <input placeholder="نام واحد جدید..." value={newUnitName} onChange={e => setNewUnitName(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 flex-grow" />
            <select value={newUnitType} onChange={e => setNewUnitType(e.target.value as UnitType)} className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white">
              <option value={UnitType.SUPPORT}>پشتیبانی</option>
              <option value={UnitType.CUSTOMER}>مشتری</option>
            </select>
            <button onClick={() => { if(newUnitName) { onAddUnit(newUnitName, newUnitType); setNewUnitName(''); } }} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold">افزودن واحد</button>
        </div>
      </section>

      {/* بخش مدیریت کاربران */}
      <section>
        <header className="mb-6"><h2 className="text-2xl font-bold text-slate-800">مدیریت کاربران</h2><p className="text-slate-500 text-sm">تعیین نام، واحد و سطوح دسترسی برای هر کاربر</p></header>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 grid md:grid-cols-6 gap-4 items-center">
            <input type="text" placeholder="نام کاربری جدید..." value={newUsername} onChange={e => setNewUsername(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm" />
            <input type="text" placeholder="نام نمایشی (مستعار)..." value={newName} onChange={e => setNewName(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm" />
            <input type="password" placeholder="رمز عبور..." value={newPassword} onChange={e => setNewPassword(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm" />
            <select value={newUserRole} onChange={e => { setNewUserRole(e.target.value as UserRole); setNewUserUnitId(''); }} className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white">
              <option value={UserRole.EXPERT}>کارشناس</option>
              <option value={UserRole.USER}>کاربر</option>
            </select>
            <select value={newUserUnitId} onChange={e => setNewUserUnitId(e.target.value)} className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white">
              {newUserRole === UserRole.EXPERT ? (
                <>
                  <option value="">دسترسی کل</option>
                  {supportUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </>
              ) : (
                <>
                  <option value="">بدون واحد</option>
                  {customerUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </>
              )}
            </select>
            <button onClick={handleAddUser} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">افزودن کاربر</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">اطلاعات کاربر</th>
                  <th className="px-6 py-4 font-bold">شماره تماس</th>
                  <th className="px-6 py-4 font-bold">واحد</th>
                  <th className="px-6 py-4 font-bold text-center">مشاهده</th>
                  <th className="px-6 py-4 font-bold text-center">پاسخ</th>
                  <th className="px-6 py-4 font-bold text-center">ایجاد</th>
                  <th className="px-6 py-4 font-bold text-center">ادمین</th>
                  <th className="px-6 py-4 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => (
                  <tr key={user.username} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input value={user.name} onChange={e => onUpdateUser({...user, name: e.target.value})} placeholder="نام نمایشی..." className="font-bold text-slate-700 text-sm bg-transparent border-b border-transparent focus:border-indigo-300 outline-none w-32" />
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-[9px] rounded-md font-bold ${
                          user.role === UserRole.ADMIN ? 'bg-rose-100 text-rose-600' :
                          user.role === UserRole.EXPERT ? 'bg-indigo-100 text-indigo-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {user.role === UserRole.ADMIN ? 'ادمین' : user.role === UserRole.EXPERT ? 'کارشناس' : 'کاربر'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input value={user.phone || ''} onChange={e => onUpdateUser({...user, phone: e.target.value})} placeholder="شماره تماس..." className="text-xs text-slate-500 bg-transparent border-b border-transparent focus:border-indigo-300 outline-none w-28" />
                    </td>
                    <td className="px-6 py-4">
                      {user.role === UserRole.EXPERT ? (
                        <select value={user.assignedUnitId || ''} onChange={e => onUpdateUser({...user, assignedUnitId: e.target.value})} className="text-xs bg-slate-50 border border-slate-100 rounded-lg p-1 outline-none">
                          <option value="">دسترسی کل</option>
                          {supportUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      ) : user.role === UserRole.USER ? (
                        <select value={user.assignedUnitId || ''} onChange={e => onUpdateUser({...user, assignedUnitId: e.target.value})} className="text-xs bg-slate-50 border border-slate-100 rounded-lg p-1 outline-none">
                          <option value="">بدون واحد</option>
                          {customerUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      ) : (
                         <span className="text-xs text-slate-400 font-bold">ادمین کل</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center"><PermissionToggle active={user.permissions.canView} onToggle={() => onUpdateUser({...user, permissions: {...user.permissions, canView: !user.permissions.canView}})} /></td>
                    <td className="px-6 py-4 text-center"><PermissionToggle active={user.permissions.canReply} onToggle={() => onUpdateUser({...user, permissions: {...user.permissions, canReply: !user.permissions.canReply}})} /></td>
                    <td className="px-6 py-4 text-center"><PermissionToggle active={user.permissions.canCreate} onToggle={() => onUpdateUser({...user, permissions: {...user.permissions, canCreate: !user.permissions.canCreate}})} /></td>
                    <td className="px-6 py-4 text-center"><PermissionToggle active={user.permissions.isAdminPanel} onToggle={() => onUpdateUser({...user, permissions: {...user.permissions, isAdminPanel: !user.permissions.isAdminPanel}})} color="bg-rose-500" /></td>
                    <td className="px-6 py-4">
                      <button onClick={() => onDeleteUser(user.username)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 S0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

// کامپوننت کوچک برای بخش‌های واحد
const UnitSection = ({ title, units, onDelete }: { title: string, units: Unit[], onDelete: (id: string) => void }) => (
  <div className="bg-white rounded-3xl border border-slate-100 p-6">
    <h3 className="font-bold text-slate-600 mb-4 text-sm">{title}</h3>
    <div className="flex flex-wrap items-center gap-3">
      {units.map(unit => (
        <div key={unit.id} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group">
          <span className="text-sm font-bold text-slate-700">{unit.name}</span>
          <button onClick={() => onDelete(unit.id)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      ))}
      {units.length === 0 && <p className="text-xs text-slate-400">هیچ واحدی تعریف نشده است.</p>}
    </div>
  </div>
);

// کامپوننت کوچک برای دکمه‌های Toggle
const PermissionToggle = ({ active, onToggle, color = 'bg-indigo-600' }: { active: boolean, onToggle: () => void, color?: string }) => (
  <button onClick={onToggle} className={`w-10 h-5 rounded-full relative transition-all duration-300 ${active ? color : 'bg-slate-200'}`}>
    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${active ? 'right-6' : 'right-1'}`} />
  </button>
);

export default PermissionManager;