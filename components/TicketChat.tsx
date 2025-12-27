
import React, { useState, useRef, useEffect } from 'react';
import { Ticket, TicketStatus, UserRole, Message } from '../types';
import { ICONS } from '../constants';

// ================================================================================================
// کامپوننت چت تیکت (TicketChat)
// این کامپوننت رابط کاربری چت برای یک تیکت خاص را نمایش می‌دهد.
// ================================================================================================

interface Props {
  ticket: Ticket;            // داده‌های تیکت فعال
  onBack: () => void;        // تابع برای بازگشت به لیست تیکت‌ها
  onSendMessage: (ticketId: string, text: string, attachment?: any) => void; // تابع برای ارسال پیام
  onCloseTicket: (ticketId: string) => void; // تابع برای بستن تیکت
  role: UserRole;            // نقش کاربر فعلی
  canReply: boolean;         // آیا کاربر مجوز پاسخ دادن دارد؟
}

const TicketChat: React.FC<Props> = ({ ticket, onBack, onSendMessage, onCloseTicket, role, canReply }) => {
  // وضعیت‌های محلی برای مدیریت ورودی متن، فایل پیوست و وضعیت بارگذاری
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // افکتی که با هر بار تغییر پیام‌ها، اسکرول را به پایین‌ترین قسمت می‌برد
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [ticket.messages]);

  /**
   * @function handleSend
   * ارسال پیام جدید را مدیریت می‌کند.
   */
  const handleSend = () => {
    if ((!inputText.trim() && !attachment) || isUploading) return;
    onSendMessage(ticket.id, inputText, attachment);
    setInputText(''); setAttachment(null);
  };

  /**
   * @function handleFileChange
   * انتخاب و خواندن فایل پیوست را مدیریت می‌کند و وضعیت بارگذاری را نمایش می‌دهد.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setAttachment(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        // تاخیر کوتاه برای نمایش بهتر انیمیشن بارگذاری
        setTimeout(() => {
          setAttachment({ name: file.name, type: file.type, url: event.target?.result as string });
          setIsUploading(false);
        }, 1000); 
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-white">
      {/* هدر صفحه چت */}
      <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              {ticket.title}
              <span className={`px-2 py-0.5 text-[8px] rounded-full uppercase ${ticket.status === TicketStatus.OPEN ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>{ticket.status}</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">شناسه: {ticket.id}</p>
          </div>
        </div>
        {ticket.status !== TicketStatus.CLOSED && role !== UserRole.USER && (
          <button onClick={() => onCloseTicket(ticket.id)} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg">بستن تیکت</button>
        )}
      </header>

      {/* ناحیه نمایش پیام‌ها */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {ticket.messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === role ? 'items-start' : 'items-end'}`}>
            <div className={`max-w-[85%] md:max-w-[60%] p-4 rounded-2xl shadow-sm relative ${
              msg.sender === role ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              {msg.attachment && (
                <div className={`mt-3 p-2 rounded-xl border ${msg.sender === role ? 'border-white/20 bg-white/10' : 'border-slate-50 bg-slate-50'}`}>
                   <a href={msg.attachment.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 group">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><ICONS.File /></div>
                      <span className="text-xs font-medium truncate max-w-[150px]">{msg.attachment.name}</span>
                   </a>
                </div>
              )}
              <div className={`text-[9px] mt-2 opacity-60 font-mono ${msg.sender === role ? 'text-left' : 'text-right'}`}>
                {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <span className="text-[9px] text-slate-400 mt-1 mx-2 font-bold">
              {msg.senderName || (msg.sender === UserRole.EXPERT ? 'کارشناس' : 'کاربر')}
            </span>
          </div>
        ))}
      </div>

      {/* ناحیه ورودی متن و ارسال */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        {ticket.status === TicketStatus.CLOSED ? (
          <div className="bg-slate-100 p-4 rounded-xl text-center text-slate-500 text-sm">تیکت بسته شده است.</div>
        ) : !canReply ? (
          <div className="bg-amber-50 p-4 rounded-xl text-center text-amber-600 text-sm">عدم دسترسی به ارسال پاسخ.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {isUploading && (
              <div className="flex items-center justify-center p-3 bg-slate-100 border border-slate-200 rounded-xl">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-bold text-slate-500">در حال بارگذاری فایل...</span>
              </div>
            )}
            {attachment && !isUploading && (
               <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="flex items-center gap-3"><ICONS.File /><span className="text-xs font-bold text-indigo-700">{attachment.name}</span></div>
                  <button onClick={() => setAttachment(null)} className="text-indigo-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
               </div>
            )}
            <div className="flex items-center gap-2">
              <label className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-100 ${isUploading ? 'cursor-not-allowed bg-slate-200' : 'hover:bg-slate-100 cursor-pointer'}`}>
                <ICONS.Paperclip />
                <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
              </label>
              <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="پیام..." className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 text-sm" />
              <button onClick={handleSend} disabled={(!inputText.trim() && !attachment) || isUploading} className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:bg-slate-200 shadow-lg shadow-indigo-100"><ICONS.Send /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketChat;
