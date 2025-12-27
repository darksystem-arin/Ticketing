
import React, { useState, useEffect } from 'react';
import { AuthState, UserRole, Ticket, TicketStatus, Message, ManagedUser, Unit, UnitType } from './types';
import { ICONS, SLA_DEFAULT_HOURS } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import TicketChat from './components/TicketChat';
import PermissionManager from './components/PermissionManager';
import Profile from './components/Profile';

// ================================================================================================
// کامپوننت اصلی اپلیکیشن (App)
// این کامپوننت مسئول مدیریت وضعیت کلی برنامه، مسیریابی بین صفحات و منطق اصلی است.
// ================================================================================================
const App: React.FC = () => {

  // ----------------------------------------------------------------------------------------------
  // تعریف وضعیت‌ها (States)
  // ----------------------------------------------------------------------------------------------

  // وضعیت واحدهای کاری: از localStorage خوانده می‌شود یا با داده‌های پیش‌فرض مقداردهی می‌شود.
  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem('units');
    return saved ? JSON.parse(saved) : [
      { id: 'u1', name: 'پشتیبانی فنی', type: UnitType.SUPPORT },
      { id: 'u2', name: 'واحد فروش', type: UnitType.SUPPORT }
    ];
  });

  // وضعیت کاربران مدیریت‌شده: شامل ادمین پیش‌فرض برای اولین اجرا.
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    const saved = localStorage.getItem('managedUsers');
    return saved ? JSON.parse(saved) : [{
      username: 'admin',
      password: '123',
      name: 'مدیر کل سیستم',
      phone: '09120000000',
      role: UserRole.ADMIN,
      permissions: { canView: true, canReply: true, canCreate: true, isAdminPanel: true }
    }];
  });

  // وضعیت احراز هویت کاربر فعلی.
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('auth');
    return saved ? JSON.parse(saved) : { 
      isLoggedIn: false, username: '', name: '', role: UserRole.USER,
      permissions: { canView: false, canReply: false, canCreate: false, isAdminPanel: false }
    };
  });

  // وضعیت تمام تیکت‌های سیستم.
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('tickets');
    return saved ? JSON.parse(saved) : [];
  });
  
  // وضعیت‌های مربوط به ناوبری و نمایش کامپوننت‌ها
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'tickets' | 'chat' | 'users' | 'profile'>('tickets');

  // ----------------------------------------------------------------------------------------------
  // افکت‌ها (Effects) برای ذخیره‌سازی داده‌ها در localStorage
  // ----------------------------------------------------------------------------------------------
  useEffect(() => localStorage.setItem('auth', JSON.stringify(auth)), [auth]);
  useEffect(() => localStorage.setItem('tickets', JSON.stringify(tickets)), [tickets]);
  useEffect(() => localStorage.setItem('managedUsers', JSON.stringify(managedUsers)), [managedUsers]);
  useEffect(() => localStorage.setItem('units', JSON.stringify(units)), [units]);

  // ----------------------------------------------------------------------------------------------
  // توابع مدیریت منطق برنامه
  // ----------------------------------------------------------------------------------------------

  /**
   * @function handleLogin
   * ورود کاربر را بر اساس نام کاربری و رمز عبور مدیریت می‌کند.
   */
  const handleLogin = (username: string, password: string): boolean => {
    const trimmedUsername = username.trim();
    const managedUser = managedUsers.find(u => u.username === trimmedUsername && u.password === password);
    
    if (managedUser) {
      setAuth({ 
        isLoggedIn: true, 
        username: trimmedUsername,
        name: managedUser.name, 
        phone: managedUser.phone,
        role: managedUser.role,
        assignedUnitId: managedUser.assignedUnitId, 
        permissions: managedUser.permissions 
      });
      return true;
    }
    return false;
  };

  /**
   * @function handleLogout
   * خروج کاربر و بازنشانی وضعیت احراز هویت.
   */
  const handleLogout = () => {
    setAuth({
      isLoggedIn: false, username: '', name: '', role: UserRole.USER,
      permissions: { canView: false, canReply: false, canCreate: false, isAdminPanel: false }
    });
  };

  /**
   * @function createTicket
   * یک تیکت جدید ایجاد می‌کند.
   */
  const createTicket = (title: string, description: string, unitId: string) => {
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      title, description, status: TicketStatus.OPEN, unitId,
      createdAt: Date.now(), userUsername: auth.username, lastUpdate: Date.now(),
      messages: [{ id: Date.now().toString(), sender: UserRole.USER, text: description, timestamp: Date.now(), senderName: auth.name }],
      slaLimitHours: SLA_DEFAULT_HOURS,
    };
    setTickets([newTicket, ...tickets]);
  };
  
  /**
   * @function addMessage
   * یک پیام جدید به تیکت اضافه می‌کند.
   */
  const addMessage = async (ticketId: string, text: string, attachment?: any) => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        const newMessage: Message = {
          id: Date.now().toString(), sender: auth.role, senderName: auth.name,
          text, attachment, timestamp: Date.now(),
        };
        // اگر کاربر پیام دهد، منتظر کارشناس می‌ماند. اگر کارشناس پاسخ دهد، برای کاربر باز می‌شود.
        const newStatus = auth.role === UserRole.USER ? TicketStatus.PENDING : TicketStatus.OPEN;
        return { ...t, lastUpdate: Date.now(), status: newStatus, messages: [...t.messages, newMessage] };
      }
      return t;
    });
    setTickets(updatedTickets);
  };

  /**
   * @function closeTicket
   * وضعیت یک تیکت را به "بسته شده" تغییر می‌دهد.
   */
  const closeTicket = (ticketId: string) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: TicketStatus.CLOSED } : t));
  };
  
  // ----------------------------------------------------------------------------------------------
  // فیلتر کردن تیکت‌ها بر اساس دسترسی کاربر
  // ----------------------------------------------------------------------------------------------
  const visibleTickets = tickets.filter(t => {
    // کاربر عادی (مشتری) فقط تیکت‌های خودش را می‌بیند.
    if (auth.role === UserRole.USER) {
      return t.userUsername === auth.username;
    }
  
    // برای ادمین و کارشناس، دسترسی «مشاهده» شرط اصلی است.
    if (!auth.permissions.canView) {
      return false; // اگر دسترسی مشاهده نداشته باشد، هیچ تیکتی نمی‌بیند.
    }
    
    // ادمین با دسترسی مشاهده، همه تیکت‌ها را می‌بیند.
    if (auth.role === UserRole.ADMIN) {
      return true;
    }
  
    // کارشناس با دسترسی مشاهده:
    if (auth.role === UserRole.EXPERT) {
      // اگر به واحد خاصی اختصاص داده شده، فقط تیکت‌های آن واحد را می‌بیند.
      if (auth.assignedUnitId) {
        return t.unitId === auth.assignedUnitId;
      }
      // اگر به واحدی اختصاص داده نشده (کارشناس عمومی)، همه تیکت‌ها را می‌بیند.
      return true;
    }
  
    // حالت پیش‌فرض برای جلوگیری از نمایش ناخواسته تیکت‌ها.
    return false;
  });
  
  // ----------------------------------------------------------------------------------------------
  // رندر کردن کامپوننت‌ها
  // ----------------------------------------------------------------------------------------------
  if (!auth.isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      <aside className="w-full md:w-64 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><ICONS.Check /></div>
          <h1 className="text-xl font-bold text-slate-800">سوییفت‌تیکت</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {auth.permissions.isAdminPanel && <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}><ICONS.User /><span>داشبورد</span></button>}
          {auth.permissions.canView && <button onClick={() => setView('tickets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'tickets' || view === 'chat' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}><ICONS.File /><span>تیکت‌ها</span></button>}
          {auth.role === UserRole.ADMIN && <button onClick={() => setView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'users' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}><ICONS.User /><span>کاربران و واحدها</span></button>}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-3 px-4 py-2 mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs shrink-0">{auth.name.charAt(0)}</div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate">{auth.name}</p>
                <p className="text-[9px] text-slate-400">{auth.username}</p>
              </div>
            </div>
            <button onClick={() => setView('profile')} title="مشاهده پروفایل" className={`p-2 rounded-lg transition-colors ${view === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}>
              <ICONS.Profile />
            </button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-500 hover:bg-rose-50"><ICONS.LogOut /><span>خروج</span></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto">
        {view === 'dashboard' && <Dashboard tickets={visibleTickets} role={auth.role} units={units} />}
        {view === 'profile' && <Profile auth={auth} units={units} onBack={() => setView(auth.permissions.isAdminPanel ? 'dashboard' : 'tickets')} />}
        {view === 'users' && (
          <PermissionManager 
            users={managedUsers} units={units}
            onUpdateUser={u => setManagedUsers(managedUsers.map(x => x.username === u.username ? u : x))}
            onAddUser={(username, password, name, role, assignedUnitId) => {
              const permissions = role === UserRole.USER 
                ? { canView: true, canReply: true, canCreate: true, isAdminPanel: false }
                : { canView: true, canReply: true, canCreate: false, isAdminPanel: false };
              
              setManagedUsers([...managedUsers, { 
                username, password, name, role, assignedUnitId, 
                permissions 
              }]);
            }}
            onDeleteUser={u => setManagedUsers(managedUsers.filter(x => x.username !== u))}
            onAddUnit={(name, type) => setUnits([...units, { id: Math.random().toString(36).substr(2, 5), name, type }])}
            onDeleteUnit={i => setUnits(units.filter(x => x.id !== i))}
          />
        )}
        {view === 'tickets' && <TicketList tickets={visibleTickets} units={units} onSelectTicket={id => { setActiveTicketId(id); setView('chat'); }} onCreateTicket={createTicket} canCreate={auth.permissions.canCreate} />}
        {view === 'chat' && activeTicketId && <TicketChat ticket={tickets.find(t => t.id === activeTicketId)!} onBack={() => setView('tickets')} onSendMessage={addMessage} onCloseTicket={closeTicket} role={auth.role} canReply={auth.permissions.canReply} />}
      </main>
    </div>
  );
};

export default App;