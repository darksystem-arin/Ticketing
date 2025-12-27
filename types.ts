
// ================================================================================================
// انواع داده (Types)
// این فایل، ساختار تمام داده‌های مورد استفاده در اپلیکیشن را تعریف می‌کند.
// ================================================================================================

/**
 * @enum TicketStatus
 * وضعیت‌های مختلف یک تیکت را مشخص می‌کند.
 */
export enum TicketStatus {
  OPEN = 'باز',
  PENDING = 'در انتظار کارشناسی',
  CLOSED = 'بسته شده'
}

/**
 * @enum UserRole
 * نقش‌های مختلف کاربران در سیستم.
 */
export enum UserRole {
  USER = 'USER',
  EXPERT = 'EXPERT',
  ADMIN = 'ADMIN'
}

/**
 * @enum UnitType
 * نوع واحد کاری را برای تفکیک دپارتمان‌های داخلی از گروه‌های مشتریان مشخص می‌کند.
 */
export enum UnitType {
  SUPPORT = 'پشتیبانی',
  CUSTOMER = 'مشتری',
}

/**
 * @interface Unit
 * ساختار داده‌ای برای یک واحد کاری یا دپارتمان.
 */
export interface Unit {
  id: string;
  name: string;
  type: UnitType; // نوع واحد (پشتیبانی یا مشتری)
}

/**
 * @interface UserPermissions
 * سطح دسترسی‌های یک کاربر را تعریف می‌کند.
 */
export interface UserPermissions {
  canView: boolean;      // آیا می‌تواند تیکت‌ها را ببیند؟
  canReply: boolean;     // آیا می‌تواند به تیکت‌ها پاسخ دهد؟
  canCreate: boolean;    // آیا می‌تواند تیکت جدید ایجاد کند؟
  isAdminPanel: boolean; // آیا به پنل ادمین دسترسی دارد؟
}

/**
 * @interface ManagedUser
 * ساختار کامل یک کاربر تعریف‌شده در سیستم توسط ادمین.
 */
export interface ManagedUser {
  username: string;      // نام کاربری برای ورود
  password: string;      // رمز عبور کاربر
  name: string;          // نام نمایشی کاربر در چت و...
  phone?: string;        // شماره تماس کاربر
  role: UserRole;
  assignedUnitId?: string; // شناسه‌ی واحدی که به آن اختصاص داده شده
  permissions: UserPermissions;
}

/**
 * @interface Message
 * ساختار یک پیام در چت تیکت.
 */
export interface Message {
  id: string;
  sender: UserRole;
  senderName?: string;   // نام فرستنده پیام
  text: string;
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
  timestamp: number;
}

/**
 * @interface Ticket
 * ساختار کامل یک تیکت پشتیبانی.
 */
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  unitId: string;        // شناسه‌ی واحدی که تیکت به آن ارجاع داده شده
  createdAt: number;
  userUsername: string; // نام کاربری که تیکت را ایجاد کرده
  lastUpdate: number;
  messages: Message[];
  slaLimitHours: number;
}

/**
 * @interface AuthState
 * وضعیت فعلی احراز هویت کاربر (کاربری که لاگین کرده).
 */
export interface AuthState {
  isLoggedIn: boolean;
  username: string;
  name: string;
  phone?: string;
  role: UserRole;
  assignedUnitId?: string;
  permissions: UserPermissions;
}