export const ORDER_STATUS_LABELS = [
  {
    value: "pending",
    label: "در انتظار پرداخت",
  },
  {
    value: "paid",
    label: "پرداخت شده",
  },
  {
    value: "processing",
    label: "در حال پردازش",
  },
  {
    value: "shipped",
    label: "ارسال شده",
  },
  {
    value: "delivered",
    label: "تحویل شده",
  },
  {
    value: "canceled",
    label: "لغو شده",
  },
  {
    value: "failed",
    label: "ناموفق",
  },
  {
    value: "returned",
    label: "مرجوع شده",
  },
];





// ── داده‌های placeholder (بعداً از API جایگزین کن) ──
const stats = [
  {
    label: "کل محصولات",
    value: "۱۲۴",
    change: "+۸ این ماه",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    color: "blue",
  },
  {
    label: "سفارشات امروز",
    value: "۳۷",
    change: "+۱۲٪ نسبت به دیروز",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><path d="M9 12h6m-6 4h4" />
      </svg>
    ),
    color: "teal",
  },
  {
    label: "درآمد این ماه",
    value: "۴۸٫۲ م",
    change: "-۳٪ نسبت به ماه قبل",
    positive: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    color: "purple",
  },
  {
    label: "کاربران فعال",
    value: "۸۶۳",
    change: "+۲۴ این هفته",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "orange",
  },
];

const recentOrders = [
  { id: "#۱۰۰۴۵", customer: "علی رضایی", product: "شارژر بی‌سیم Anker", amount: "۲٫۹۰۰٫۰۰۰", status: "تحویل داده شده", statusKey: "delivered" },
  { id: "#۱۰۰۴۴", customer: "مریم احمدی", product: "تبلت iPad Air M2", amount: "۳۲٫۰۰۰٫۰۰۰", status: "در حال ارسال", statusKey: "shipping" },
  { id: "#۱۰۰۴۳", customer: "سارا کریمی", product: "هدفون Sony WH-1000", amount: "۸٫۵۰۰٫۰۰۰", status: "در انتظار پرداخت", statusKey: "pending" },
  { id: "#۱۰۰۴۲", customer: "محمد حسینی", product: "لپ‌تاپ MacBook Air", amount: "۸۵٫۰۰۰٫۰۰۰", status: "تحویل داده شده", statusKey: "delivered" },
  { id: "#۱۰۰۴۱", customer: "نیلوفر موسوی", product: "ساعت هوشمند Galaxy", amount: "۱۲٫۰۰۰٫۰۰۰", status: "لغو شده", statusKey: "cancelled" },
];
