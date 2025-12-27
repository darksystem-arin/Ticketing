
import React, { useState } from 'react';

// ================================================================================================
// کامپوننت صفحه ورود (Login)
// این کامپوننت فرم ورود با نام کاربری و رمز عبور را نمایش می‌دهد.
// ================================================================================================

interface Props {
  /**
   * @prop onLogin
   * تابعی که پس از تلاش برای ورود فراخوانی می‌شود.
   * در صورت موفقیت‌آمیز بودن ورود، true و در غیر این صورت false برمی‌گرداند.
   */
  onLogin: (username: string, password: string) => boolean;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  // وضعیت‌های محلی کامپوننت برای نگهداری نام کاربری، رمز عبور و پیام خطا
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /**
   * @function handleSubmit
   * هنگام ارسال فرم فراخوانی می‌شود و عملیات ورود را انجام می‌دهد.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('نام کاربری و رمز عبور الزامی است.');
      return;
    }
    // فراخوانی تابع onLogin از props
    const loginSuccess = onLogin(username, password);
    if (!loginSuccess) {
      setError('نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200 p-10">
        {/* هدر فرم */}
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a2 2 0 0 0-2-2l-7 7v11h12V10l-3-1z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">ورود به سامانه تیکتینگ</h2>
          <p className="text-slate-500 mt-2">اطلاعات حساب کاربری خود را وارد کنید</p>
        </div>

        {/* فرم ورود */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">نام کاربری</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
              placeholder="مثلا: admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-rose-500 text-xs text-center pt-2">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 mt-6"
          >
            ورود به حساب
          </button>
        </form>

        {/* اطلاعات راهنما برای دمو */}
        <div className="mt-8 pt-8 border-t border-slate-100 text-center space-y-2">
          <p className="text-[10px] text-slate-400">
            دمو مدیر ارشد: <span className="font-mono text-indigo-500 font-bold">username: admin / password: 123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
