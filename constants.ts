import { Role, User, Branch, Order, OrderStatus, MarketplaceTool, View } from './types';

export const USERS: User[] = [
  { id: 'user-1', name: 'المسؤول الأعلى', username: 'admin', password: 'password', role: Role.Admin },
  { id: 'user-2', name: 'مدير فرع الرياض', username: 'riyadh_manager', password: 'password', role: Role.Manager, assignedBranchId: 'branch-1' },
  { id: 'user-3', name: 'مدير فرع جدة', username: 'jeddah_manager', password: 'password', role: Role.Manager, assignedBranchId: 'branch-2' },
];

export const BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    name: 'فرع الرياض',
    location: 'طريق الملك فهد، الرياض',
    menu: [
      {
        id: 'cat-1-1',
        name: 'المقبلات',
        items: [
          { id: 'item-1-1-1', name: 'حمص', description: 'حمص بالطحينة وزيت الزيتون.', price: 15, imageUrl: 'https://picsum.photos/400/300?random=1', isAvailable: true },
          { id: 'item-1-1-2', name: 'تبولة', description: 'سلطة بقدونس، طماطم، برغل.', price: 18, imageUrl: 'https://picsum.photos/400/300?random=2', isAvailable: true },
        ],
      },
      {
        id: 'cat-1-2',
        name: 'الأطباق الرئيسية',
        items: [
          { id: 'item-1-2-1', name: 'مشاوي مشكلة', description: 'تشكيلة من الكباب وأوصال اللحم.', price: 75, imageUrl: 'https://picsum.photos/400/300?random=3', isAvailable: true },
          { id: 'item-1-2-2', name: 'مندي دجاج', description: 'أرز المندي مع نصف دجاجة.', price: 40, imageUrl: 'https://picsum.photos/400/300?random=4', isAvailable: true },
        ],
      },
    ],
  },
  {
    id: 'branch-2',
    name: 'فرع جدة',
    location: 'الكورنيش، جدة',
    menu: [
      {
        id: 'cat-2-1',
        name: 'مأكولات بحرية',
        items: [
          { id: 'item-2-1-1', name: 'سمك مشوي', description: 'سمك هامور طازج مشوي.', price: 85, imageUrl: 'https://picsum.photos/400/300?random=5', isAvailable: true },
          { id: 'item-2-1-2', name: 'جمبري مقلي', description: 'جمبري مقلي مع صوص خاص.', price: 65, imageUrl: 'https://picsum.photos/400/300?random=6', isAvailable: true },
        ],
      },
       {
        id: 'cat-2-2',
        name: 'الحلويات',
        items: [
          { id: 'item-2-2-1', name: 'كنافة بالجبنة', description: 'كنافة ساخنة بالجبنة العكاوية.', price: 25, imageUrl: 'https://picsum.photos/400/300?random=7', isAvailable: true },
        ],
      },
    ],
  },
];

const orderStatuses: OrderStatus[] = ['Pending', 'Paid', 'Completed', 'Cancelled'];

export const MOCK_ORDERS: Order[] = Array.from({ length: 50 }).map((_, i) => {
    const branchId = i % 2 === 0 ? 'branch-1' : 'branch-2';
    const branch = BRANCHES.find(b => b.id === branchId)!;
    const category = branch.menu[Math.floor(Math.random() * branch.menu.length)];
    const item = category.items[Math.floor(Math.random() * category.items.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const paymentMethod = Math.random() > 0.4 ? 'Online' : 'Cash';
    let status: OrderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

    // Logic for more realistic statuses
    if (paymentMethod === 'Cash' && status === 'Paid') {
      status = 'Pending';
    }
    if (paymentMethod === 'Online' && status === 'Pending') {
      status = 'Paid';
    }


    return {
        id: `order-${i}`,
        branchId,
        tableNumber: `T${Math.floor(Math.random() * 20) + 1}`,
        items: [{ itemId: item.id, name: item.name, quantity, price: item.price }],
        total: item.price * quantity,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Orders in the last 30 days
        status: status,
        paymentMethod: paymentMethod,
        paymentId: paymentMethod === 'Online' ? `txn_${Math.random().toString(36).substr(2, 9)}` : undefined,
    }
});

export const MARKETPLACE_TOOLS: Omit<MarketplaceTool, 'isInstalled'>[] = [
  {
    id: 'pos-system',
    name: 'نظام الكاشير والمبيعات (POS)',
    description: 'نظام متكامل لإدارة نقاط البيع، يدعم الطابعات الحرارية وأجهزة مسح الباركود لتسريع عملية المحاسبة.',
    price: 99,
    pricePeriod: 'شهرياً',
    icon: 'Printer',
    rating: 4.8,
    dateAdded: '2023-05-15',
  },
  {
    id: 'whatsapp-integration',
    name: 'ربط واتساب للأعمال',
    description: 'أرسل تأكيدات الطلبات وتحديثات الحالة للعملاء تلقائياً عبر واتساب لتحسين تجربة العميل.',
    price: 49,
    pricePeriod: 'شهرياً',
    icon: 'Whatsapp',
    rating: 4.5,
    dateAdded: '2023-06-01',
  },
  {
    id: 'sms-gateway',
    name: 'بوابة الرسائل القصيرة (SMS)',
    description: 'أطلق حملات تسويقية وأرسل عروضاً خاصة لعملائك عبر الرسائل القصيرة لزيادة المبيعات والولاء.',
    price: 79,
    pricePeriod: 'شهرياً',
    icon: 'SMS',
    rating: 4.2,
    dateAdded: '2023-07-20',
  },
  {
    id: 'barcode-scanning',
    name: 'مسح الباركود',
    description: 'تسريع عملية البيع عبر مسح باركود المنتجات مباشرة باستخدام الكاميرا أو جهاز مخصص.',
    price: 39,
    pricePeriod: 'شهرياً',
    icon: 'ScanLine',
    rating: 4.6,
    dateAdded: '2023-08-11',
  },
  {
    id: 'multi-payment-options',
    name: 'خيارات دفع متعددة',
    description: 'قبول المدفوعات من خلال بطاقات الائتمان، المحافظ الإلكترونية، والدفع عند الاستلام لتوفير مرونة أكبر للعملاء.',
    price: 29,
    pricePeriod: 'شهرياً',
    icon: 'CreditCard',
    rating: 4.9,
    dateAdded: '2023-04-05',
  },
  {
    id: 'inventory-management',
    name: 'إدارة المخزون الذكية',
    description: 'تتبع مستويات المخزون في الوقت الفعلي، تلقي تنبيهات عند انخفاض الكميات، وإدارة الموردين بكفاءة.',
    price: 89,
    pricePeriod: 'شهرياً',
    icon: 'Warehouse',
    view: View.Inventory,
    rating: 4.7,
    dateAdded: '2023-09-01',
  },
  {
    id: 'crm-module',
    name: 'إدارة علاقات العملاء (CRM)',
    description: 'بناء قاعدة بيانات لعملائك، تتبع سجلات شرائهم، وإطلاق حملات ولاء مخصصة لزيادة التفاعل.',
    price: 69,
    pricePeriod: 'شهرياً',
    icon: 'Users',
    view: View.CRM,
    rating: 4.4,
    dateAdded: '2023-08-25',
  },
  {
    id: 'financial-reports',
    name: 'التقارير المالية والإدارية',
    description: 'الحصول على تقارير مفصلة عن المبيعات، الأرباح، والمصاريف لاتخاذ قرارات عمل مستنيرة.',
    price: 59,
    pricePeriod: 'شهرياً',
    icon: 'Reports',
    view: View.FinancialReports,
    rating: 4.6,
    dateAdded: '2023-10-10',
  },
  {
    id: 'vat-support',
    name: 'دعم ضريبة القيمة المضافة (VAT)',
    description: 'تطبيق ضريبة القيمة المضافة تلقائياً على الفواتير وإنشاء تقارير ضريبية متوافقة مع الأنظمة المحلية.',
    price: 49,
    pricePeriod: 'شهرياً',
    icon: 'Receipt',
    rating: 4.8,
    dateAdded: '2023-03-18',
  },
  {
    id: 'customer-experience-suite',
    name: 'تحسين تجربة العميل',
    description: 'أدوات متقدمة مثل شاشات عرض العملاء وبرامج الولاء لتقديم تجربة شراء استثنائية.',
    price: 75,
    pricePeriod: 'شهرياً',
    icon: 'Smile',
    rating: 4.7,
    dateAdded: '2024-01-15',
  },
  {
    id: 'technical-flexibility',
    name: 'مرونة فنية وتكامل',
    description: 'القدرة على العمل دون اتصال بالإنترنت والتكامل مع أنظمة خارجية عبر واجهات برمجية (API).',
    price: 129,
    pricePeriod: 'شهرياً',
    icon: 'GitMerge',
    rating: 4.3,
    dateAdded: '2024-02-20',
  },
  {
    id: 'cloud-pos',
    name: 'نظام كاشير سحابي',
    description: 'الوصول إلى بيانات مبيعاتك ومخزونك من أي مكان وفي أي وقت عبر نظام سحابي آمن.',
    price: 119,
    pricePeriod: 'شهرياً',
    icon: 'Cloud',
    rating: 4.9,
    dateAdded: '2023-11-30',
  },
  {
    id: 'industry-specific-solutions',
    name: 'حلول متخصصة للقطاعات',
    description: 'ميزات مصممة خصيصاً لتلبية احتياجات قطاعك، سواء كان مطعماً، مقهى، أو متجر تجزئة.',
    price: 149,
    pricePeriod: 'شهرياً',
    icon: 'Cog',
    rating: 4.5,
    dateAdded: '2024-03-01',
  },
];