import React, { useState, useEffect } from 'react';
import { MenuIcon, OrderIcon, AnalyticsIcon, CheckIcon, SearchIcon, CloseIcon, PlusIcon, HomeIcon, BuildingStorefrontIcon, Cog6ToothIcon, WrenchScrewdriverIcon, PaintBrushIcon, CameraIcon, DevicePhoneMobileIcon, CakeIcon, SparklesIcon, PencilIcon, TrashIcon, UsersIcon, AdjustmentsHorizontalIcon, ChevronDownIcon, CurrencyDollarIcon, BriefcaseIcon, ExclamationTriangleIcon, LinkIcon, FacebookIcon, TwitterIcon, InstagramIcon } from './components/Icons';
import SalesChart from './components/SalesChart';

const initialSiteData = {
  theme: {
    accentColor: '#06b6d4',
  },
  logo: { part1: 'كيومن', part2: 'يو' },
  hero: {
    title: 'نظامك المتكامل لإدارة قوائم الطعام والخدمات',
    subtitle: 'حوّل تجربة عملائك الرقمية. سهولة في الطلب, مرونة في الإدارة, ونمو في الأرباح.',
    cta: 'اكتشف الباقات',
  },
  seo: {
    metaDescription: 'نظام متكامل لإدارة قوائم الطعام والخدمات، يساعدك على تحسين تجربة عملائك وزيادة أرباحك.',
    keywords: 'قائمة طعام, إدارة خدمات, نظام مطاعم, QR menu, طلبات أونلاين',
  },
  social: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
  },
  features: [
    {
      icon: <MenuIcon />,
      title: 'إدارة القوائم بسهولة',
      description: 'أنشئ, عدّل, ونظّم قوائم الطعام أو الخدمات الخاصة بك بدقائق معدودة عبر واجهة سهلة الاستخدام.',
    },
    {
      icon: <OrderIcon />,
      title: 'نظام طلبات متطور',
      description: 'استقبل طلبات الطعام أو حجوزات الخدمات مباشرة من عملائك عبر الإنترنت, وقلل من الأخطاء والانتظار.',
    },
    {
      icon: <AnalyticsIcon />,
      title: 'تحليلات وتقارير',
      description: 'احصل على رؤى قيمة حول أداء مبيعاتك, المنتجات الأكثر طلباً, وسلوك العملاء لاتخاذ قرارات أفضل.',
    },
  ],
  pricing: [
    {
      name: 'الأساسية',
      description: 'للأعمال الناشئة والأفراد',
      price: '49$',
      period: '/شهرياً',
      features: ['قائمة طعام واحدة', '100 طلب شهرياً', 'QR Code للقائمة', 'دعم فني عبر البريد'],
      popular: false,
    },
    {
      name: 'الاحترافية',
      description: 'الأكثر شيوعاً للأعمال النامية',
      price: '99$',
      period: '/شهرياً',
      features: ['5 قوائم طعام/خدمات', 'طلبات غير محدودة', 'QR Code مخصص', 'تحليلات أساسية للمبيعات', 'دعم فني ذو أولوية'],
      popular: true,
    },
    {
      name: 'الشركات',
      description: 'للفروع المتعددة والمؤسسات',
      price: '199$',
      period: '/شهرياً',
      features: ['قوائم غير محدودة', 'طلبات غير محدودة', 'إدارة الفروع', 'تحليلات متقدمة', 'مدير حساب مخصص'],
      popular: false,
    },
  ],
};


const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const mockUsers = [
    { id: 1, username: 'admin', password: 'password', name: 'المسؤول الرئيسي', role: 'مسؤول' },
    { id: 2, username: 'manager', password: 'password', name: 'أحمد عبدالله', role: 'مدير فرع' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundUser = mockUsers.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      setError('');
      onLoginSuccess(foundUser);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
  };

  return (
    <section className="login-page">
      <div className="login-form-container">
        <h2>تسجيل الدخول</h2>
        <p>أهلاً بعودتك! الرجاء إدخال بياناتك.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">اسم المستخدم</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              placeholder="admin or manager" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <a href="#" className="forgot-password-link">نسيت كلمة المرور؟</a>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn" style={{width: '100%'}}>دخول</button>
        </form>
        <p className="signup-prompt">
            ليس لديك حساب؟ <a href="#">سجل الآن</a>
        </p>
      </div>
    </section>
  );
};


const Header = ({ onNavigate, currentPage, siteData, currentUser, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);
  
  const handlePageNavigation = (e, page) => {
    e.preventDefault();
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    onLogout();
    setIsMenuOpen(false);
  }

  const handleAnchorClick = (e) => {
    if (currentPage !== 'main') {
      e.preventDefault();
      onNavigate('main');
    }
    // Let the default anchor behavior happen on the main page
    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <a href="#" className="logo" onClick={(e) => handlePageNavigation(e, 'main')}>{siteData.logo.part1}<span>{siteData.logo.part2}</span></a>
        
        <div className={`nav-wrapper ${isMenuOpen ? 'open' : ''}`}>
          {currentPage !== 'dashboard' && (
            <>
              <nav className="nav-links">
                <a href="#" onClick={(e) => handlePageNavigation(e, 'main')}>الرئيسية</a>
                <a href="#features" onClick={handleAnchorClick}>المميزات</a>
                <a href="#pricing" onClick={handleAnchorClick}>الباقات</a>
              </nav>
              <div className="search-container">
                <SearchIcon />
                <input type="text" placeholder="ابحث..." className="search-input" />
              </div>
            </>
          )}
           <div className="auth-buttons">
            {currentUser ? (
              <>
                <span style={{color: 'var(--slate-300)'}}>مرحباً, {currentUser.name}</span>
                <a href="#" className="login-link" onClick={handleLogoutClick}>تسجيل الخروج</a>
              </>
            ) : (
              <>
                <a href="#" className="login-link" onClick={(e) => handlePageNavigation(e, 'login')}>دخول</a>
                <a href="#" className="btn btn-small" onClick={(e) => { e.preventDefault(); /* Logic for signup */ setIsMenuOpen(false); }}>تسجيل</a>
              </>
            )}
          </div>
        </div>
        
        <button className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
};

const Hero = ({ content }) => (
  <section className="hero">
    <div className="container">
      <h1>{content.title}</h1>
      <p>{content.subtitle}</p>
      <a href="#pricing" className="btn">{content.cta}</a>
    </div>
  </section>
);

const Features = ({ content }) => (
  <section id="features" className="section">
    <div className="container">
      <div className="section-header">
        <h2>لماذا تختار نظامنا؟</h2>
        <p>نقدم لك الأدوات التي تحتاجها للنجاح في عالم رقمي سريع التطور.</p>
      </div>
      <div className="features-grid">
        {content.map((feature, index) => (
            <div className="feature-card" key={index}>
                <div className="icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
            </div>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = ({ content }) => (
  <section id="pricing" className="section" style={{ backgroundColor: '#1e293b' }}>
    <div className="container">
      <div className="section-header">
        <h2>باقات تناسب الجميع</h2>
        <p>سواء كنت قد بدأت للتو أو كنت تدير مؤسسة كبيرة، لدينا الباقة المثالية لك.</p>
      </div>
      <div className="pricing-grid">
        {content.map((plan, index) => (
          <div className={`pricing-card ${plan.popular ? 'popular' : ''}`} key={index}>
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <div className="price">{plan.price}<span>{plan.period}</span></div>
            <ul>
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex}><CheckIcon /> {feature}</li>
              ))}
            </ul>
            <a href="#" className={`btn ${plan.popular ? '' : 'btn-secondary'}`} style={{width: '100%', textAlign: 'center'}}>{plan.popular ? 'اختر الباقة' : 'ابدأ الآن'}</a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const socialMediaPlatforms = [
  { key: 'facebook', label: 'Facebook', component: <FacebookIcon /> },
  { key: 'twitter', label: 'Twitter', component: <TwitterIcon /> },
  { key: 'instagram', label: 'Instagram', component: <InstagramIcon /> },
];

const Footer = ({ socialLinks }) => {
  // Check if there is at least one valid social link
  const hasSocialLinks = socialMediaPlatforms.some(platform => {
    const link = socialLinks[platform.key];
    return link && typeof link === 'string' && link.trim() !== '';
  });

  return (
    <footer id="contact" className="footer">
      {hasSocialLinks && (
        <div className="social-links">
          {socialMediaPlatforms.map(platform => {
            const link = socialLinks[platform.key];
            // Render the link only if it's a valid, non-empty string
            if (link && typeof link === 'string' && link.trim() !== '') {
              return (
                <a key={platform.key} href={link} target="_blank" rel="noopener noreferrer" aria-label={platform.label}>
                  {platform.component}
                </a>
              );
            }
            return null;
          })}
        </div>
      )}
      <p>جميع الحقوق محفوظة &copy; كيومنيو {new Date().getFullYear()}</p>
    </footer>
  );
};

const MainPage = ({ siteData }) => (
  <>
    <Hero content={siteData.hero} />
    <Features content={siteData.features} />
    <Pricing content={siteData.pricing} />
  </>
);

const DashboardOverview = ({ onNavigate }) => {
  const summaryStats = [
    { title: 'إجمالي الأفرع', value: '8', icon: <BuildingStorefrontIcon /> },
    { title: 'إجمالي العملاء', value: '1,250', icon: <UsersIcon /> },
    { title: 'إجمالي المبيعات', value: '$25,680', icon: <CurrencyDollarIcon /> },
    { title: 'أنظمة الخدمات', value: '12 مشروع', icon: <BriefcaseIcon /> },
    { title: 'أنظمة قوائم الطعام', value: '25 مشروع', icon: <MenuIcon /> },
  ];

  const quickActions = [
    { 
      title: 'تخصيص الموقع', 
      description: 'تغيير الألوان، النصوص والصور.', 
      icon: <AdjustmentsHorizontalIcon />, 
      view: 'customization' 
    },
    { 
      title: 'عرض تقرير المبيعات', 
      description: 'تحليل الأداء والمبيعات.', 
      icon: <AnalyticsIcon />, 
      view: 'reports' 
    },
    { 
      title: 'إدارة المستخدمين', 
      description: 'تعديل صلاحيات فريق العمل.', 
      icon: <UsersIcon />, 
      view: 'users' 
    },
    { 
      title: 'الإعدادات العامة', 
      description: 'إدارة إعدادات حسابك والمتجر.', 
      icon: <Cog6ToothIcon />, 
      view: 'settings' 
    },
  ];

  const weeklySalesData = [
    { label: 'السبت', value: 120 }, { label: 'الأحد', value: 190 },
    { label: 'الاثنين', value: 250 }, { label: 'الثلاثاء', value: 210 },
    { label: 'الأربعاء', value: 320 }, { label: 'الخميس', value: 280 },
    { label: 'الجمعة', value: 450 },
  ];

  return (
    <>
      <div className="dashboard-header">
        <h1>أهلاً بعودتك، مسؤول!</h1>
        <p>إليك ملخص سريع لأداء عملك ووصول سريع لأدواتك.</p>
      </div>

      <div className="sales-summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '4rem' }}>
        {summaryStats.map((stat, index) => (
          <div className="summary-card" key={index}>
            <div className="summary-card-icon">{stat.icon}</div>
            <div className="summary-card-content">
              <h4>{stat.title}</h4>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-panel" style={{ marginBottom: '2rem' }}>
        <h2 className="panel-header" style={{ borderBottom: '1px solid #334155', paddingBottom: '1.5rem', marginBottom: '2rem', justifyContent: 'start' }}>إجراءات سريعة</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <div className="action-card" key={action.view} onClick={() => onNavigate(action.view)} role="button" tabIndex={0}>
              <div className="action-card-icon">{action.icon}</div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="dashboard-panel">
        <SalesChart data={weeklySalesData} title="نظرة عامة على المبيعات الأسبوعية" />
      </div>
    </>
  );
};

const BranchManagerDashboardOverview = ({ onNavigate, currentUser }) => {
  const summaryStats = [
    { title: 'طلبات اليوم', value: '25', icon: <OrderIcon /> },
    { title: 'إجمالي المبيعات (اليوم)', value: '$850', icon: <CurrencyDollarIcon /> },
    { title: 'الحجوزات القادمة', value: '8', icon: <CheckIcon /> },
    { title: 'أفضل صنف', value: 'برجر لحم', icon: <CakeIcon /> },
  ];

  const quickActions = [
    { title: 'إدارة القائمة', description: 'تحديث الأصناف والأسعار.', icon: <MenuIcon />, view: 'menu' },
    { title: 'عرض الطلبات', description: 'متابعة الطلبات الجديدة والحالية.', icon: <OrderIcon />, view: 'orders' },
    { title: 'عرض التقارير', description: 'تحليل أداء فرعك.', icon: <AnalyticsIcon />, view: 'reports' },
    { title: 'إعدادات الفرع', description: 'إدارة إعدادات فرعك.', icon: <Cog6ToothIcon />, view: 'settings' },
  ];
  
  const dailySalesData = [
    { label: '8 ص', value: 15 }, { label: '10 ص', value: 40 },
    { label: '12 م', value: 80 }, { label: '2 م', value: 65 },
    { label: '4 م', value: 90 }, { label: '6 م', value: 120 },
    { label: '8 م', value: 150 },
  ];

  return (
    <>
      <div className="dashboard-header">
        <h1>مرحباً بك، {currentUser.name}!</h1>
        <p>لوحة تحكم فرع الرياض. إليك ملخص أداء اليوم.</p>
      </div>
       <div className="sales-summary-grid" style={{ marginBottom: '4rem' }}>
        {summaryStats.map((stat, index) => (
          <div className="summary-card" key={index}>
            <div className="summary-card-icon">{stat.icon}</div>
            <div className="summary-card-content">
              <h4>{stat.title}</h4>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-panel" style={{ marginBottom: '2rem' }}>
        <h2 className="panel-header" style={{ borderBottom: '1px solid #334155', paddingBottom: '1.5rem', marginBottom: '2rem', justifyContent: 'start' }}>وصول سريع</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <div className="action-card" key={action.view} onClick={() => onNavigate(action.view)}>
              <div className="action-card-icon">{action.icon}</div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="dashboard-panel">
        <SalesChart data={dailySalesData} title="حركة المبيعات خلال اليوم" />
      </div>
    </>
  );
};

const BranchesView = () => ( <div className="content-view"><h1>إدارة الفروع</h1><p>هنا يمكنك إضافة وتعديل وحذف الفروع الخاصة بك.</p></div> );
const MenuManagementView = () => ( <div className="content-view"><h1>إدارة القائمة / الخدمات</h1><p>هنا يمكنك إدارة الأصناف والخدمات والأسعار الخاصة بفرعك.</p></div> );
const OrdersView = () => ( <div className="content-view"><h1>الطلبات والحجوزات</h1><p>عرض وإدارة الطلبات الجديدة والحجوزات القادمة.</p></div> );
const SalesReportView = () => {
  const weeklySalesData = [
    { label: 'السبت', value: 120 },
    { label: 'الأحد', value: 190 },
    { label: 'الاثنين', value: 250 },
    { label: 'الثلاثاء', value: 210 },
    { label: 'الأربعاء', value: 320 },
    { label: 'الخميس', value: 280 },
    { label: 'الجمعة', value: 450 },
  ];

  const topProductsData = [
    { label: 'برجر', value: 350 },
    { label: 'بيتزا', value: 280 },
    { label: 'سلطة', value: 150 },
    { label: 'كيك', value: 120 },
    { label: 'قهوة', value: 210 },
  ];

  return (
    <>
      <div className="dashboard-header">
        <h1>تقرير المبيعات</h1>
        <p>تحليل أداء مبيعاتك وأشهر الأصناف.</p>
      </div>
      <div className="sales-summary-grid">
          <div className="summary-card">
              <div className="summary-card-icon"><CurrencyDollarIcon /></div>
              <div className="summary-card-content">
                  <h4>إجمالي المبيعات (هذا الشهر)</h4>
                  <p>$12,450.75</p>
              </div>
          </div>
          <div className="summary-card">
              <div className="summary-card-icon"><OrderIcon /></div>
              <div className="summary-card-content">
                  <h4>إجمالي الطلبات</h4>
                  <p>852</p>
              </div>
          </div>
          <div className="summary-card">
              <div className="summary-card-icon"><UsersIcon /></div>
              <div className="summary-card-content">
                  <h4>عملاء جدد</h4>
                  <p>76</p>
              </div>
          </div>
      </div>
      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        <div className="dashboard-panel">
          <SalesChart data={weeklySalesData} title="المبيعات خلال آخر 7 أيام" />
        </div>
        <div className="dashboard-panel">
          <SalesChart data={topProductsData} title="أفضل الأصناف مبيعاً" barColor="#84cc16" />
        </div>
      </div>
    </>
  );
};
const StoreToolsView = () => ( <div className="content-view"><h1>أدوات المتجر</h1><p>الموافقة على الأدوات والتكاملات للمتجر.</p></div> );

const Accordion = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="accordion-item">
            <button className="accordion-header" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
                <h3>{icon}{title}</h3>
                <ChevronDownIcon />
            </button>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
};

const SettingsView = () => {
    const [settings, setSettings] = useState({
        fullName: 'المسؤول الرئيسي',
        email: 'admin@example.com',
        storeName: 'متجر كيومنيو الافتراضي',
        storeDescription: 'أفضل مكان لتجربة طعام لا تُنسى.',
        currency: 'USD',
        contactEmail: 'contact@example.com',
        phone: '+1234567890',
    });
    
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setFeedback({ type: '', message: '' });

        // Password validation for Account Settings
        if (passwords.newPassword || passwords.confirmPassword) {
            if (passwords.newPassword !== passwords.confirmPassword) {
                setFeedback({ type: 'error', message: 'كلمة المرور الجديدة وتأكيدها غير متطابقين.' });
                return;
            }
             if (passwords.newPassword && passwords.newPassword.length < 6) { 
                setFeedback({ type: 'error', message: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.' });
                return;
            }
        }

        console.log('Saving settings data:', { fullName: settings.fullName, email: settings.email, storeName: settings.storeName });
        if(passwords.newPassword) {
            console.log('Password changed successfully.');
        }
        
        setFeedback({ type: 'success', message: 'تم حفظ التغييرات بنجاح!' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

        setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
    };

    const handleDeleteAccount = () => {
        if (confirm('هل أنت متأكد من رغبتك في حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            alert('تم حذف الحساب.');
        }
    };

    return (
        <>
            <div className="dashboard-header">
                <h1>الإعدادات</h1>
                <p>إدارة إعدادات حسابك والمتجر.</p>
            </div>
            <div className="form-section" style={{ padding: '0 2.5rem' }}>
                <Accordion title="إعدادات الحساب" icon={<UsersIcon />} defaultOpen={true}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fullName">الاسم الكامل</label>
                            <input type="text" id="fullName" name="fullName" value={settings.fullName} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">البريد الإلكتروني</label>
                            <input type="email" id="email" name="email" value={settings.email} onChange={handleInputChange} />
                        </div>
                    </div>
                    <h4 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>تغيير كلمة المرور</h4>
                    <div className="form-group">
                        <label htmlFor="currentPassword">كلمة المرور الحالية</label>
                        <input type="password" id="currentPassword" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="newPassword">كلمة المرور الجديدة</label>
                            <input type="password" id="newPassword" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} />
                        </div>
                    </div>
                </Accordion>
                <Accordion title="إعدادات المتجر" icon={<BuildingStorefrontIcon />}>
                    <div className="form-group">
                        <label htmlFor="storeName">اسم المتجر/العمل</label>
                        <input type="text" id="storeName" name="storeName" value={settings.storeName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="storeDescription">وصف قصير للمتجر</label>
                        <textarea id="storeDescription" name="storeDescription" value={settings.storeDescription} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="currency">العملة الافتراضية</label>
                            <select id="currency" name="currency" value={settings.currency} onChange={handleInputChange}>
                                <option value="USD">الدولار الأمريكي (USD)</option>
                                <option value="SAR">الريال السعودي (SAR)</option>
                                <option value="AED">الدرهم الإماراتي (AED)</option>
                                <option value="EUR">اليورو (EUR)</option>
                            </select>
                        </div>
                         <div className="form-group">
                            <label htmlFor="contactEmail">البريد الإلكتروني للتواصل</label>
                            <input type="email" id="contactEmail" name="contactEmail" value={settings.contactEmail} onChange={handleInputChange} />
                        </div>
                    </div>
                </Accordion>
                 <Accordion title="المنطقة الخطرة" icon={<ExclamationTriangleIcon />}>
                    <div className="danger-zone">
                        <h4>حذف الحساب</h4>
                        <p>بمجرد حذف حسابك، سيتم مسح جميع البيانات بشكل دائم. يرجى توخي الحذر الشديد.</p>
                        <button className="btn btn-danger" onClick={handleDeleteAccount}>أنا أفهم العواقب، قم بحذف حسابي</button>
                    </div>
                </Accordion>
            </div>
             <div className="form-section" style={{ background: 'transparent', border: 'none', padding: '0 2.5rem' }}>
                {feedback.message && (
                    <div className={feedback.type === 'error' ? 'error-message' : 'success-message'}>
                        {feedback.message}
                    </div>
                )}
                <button className="btn" onClick={handleSave}>حفظ التغييرات</button>
            </div>
        </>
    );
};

const ALL_PERMISSIONS = {
    prices: 'تعديل الأسعار',
    content: 'إدارة المحتوى',
    reports: 'عرض التقارير',
    users: 'إدارة المستخدمين',
    site: 'تخصيص الموقع',
    branches: 'إدارة الفروع',
};

const initialMockData = {
    branches: [
        { id: 1, name: 'فرع الرياض' },
        { id: 2, name: 'فرع جدة' },
        { id: 3, name: 'فرع الدمام' },
    ],
    users: [
        { id: 1, name: 'المسؤول الرئيسي', email: 'admin@example.com', role: 'مسؤول', assignedBranches: [], systemType: null },
        { id: 2, name: 'محرر المحتوى', email: 'editor@example.com', role: 'محرر', assignedBranches: [], systemType: null },
        { id: 3, name: 'أحمد عبدالله', email: 'manager.salon@example.com', role: 'مدير فرع', assignedBranches: [1], systemType: 'services' },
        { id: 4, name: 'فاطمة علي', email: 'manager.restaurant@example.com', role: 'مدير فرع', assignedBranches: [2, 3], systemType: 'restaurant' },
    ],
    roles: [
        { name: 'مسؤول', permissions: Object.keys(ALL_PERMISSIONS) },
        { name: 'مدير فرع', permissions: ['content', 'reports'] },
        { name: 'محرر', permissions: ['content', 'reports', 'branches'] }
    ]
};

const systemTypeLabels = {
    services: 'نظام خدمات (صالون)',
    restaurant: 'نظام مطعم (قائمة طعام)',
};

const UserManagementModal = ({ isOpen, onClose, onSave, userToEdit, roles, branches }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setUser({ 
                    ...userToEdit, 
                    assignedBranches: userToEdit.assignedBranches || [],
                    password: '',
                    confirmPassword: ''
                });
            } else {
                setUser({ 
                    id: null, name: '', email: '', role: roles.find(r => r.name === 'مدير فرع')?.name || roles[0]?.name, 
                    assignedBranches: [], systemType: 'services',
                    password: '', confirmPassword: ''
                });
            }
            setError('');
        }
    }, [userToEdit, isOpen, roles]);

    if (!isOpen || !user) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleBranchChange = (branchId) => {
        const assignedBranches = new Set(user.assignedBranches);
        if (assignedBranches.has(branchId)) {
            assignedBranches.delete(branchId);
        } else {
            assignedBranches.add(branchId);
        }
        setUser(prev => ({ ...prev, assignedBranches: Array.from(assignedBranches) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!user.id && !user.password) {
            setError('كلمة المرور مطلوبة للمستخدمين الجدد.');
            return;
        }

        if (user.password && user.password !== user.confirmPassword) {
            setError('كلمتا المرور غير متطابقتين.');
            return;
        }

        if (user.password && user.password.length < 6) {
            setError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
            return;
        }

        onSave(user);
    };

    const isBranchManager = user.role === 'مدير فرع';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{user.id ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h2>
                    <button onClick={onClose} className="close-button"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">الاسم الكامل</label>
                            <input type="text" id="name" name="name" value={user.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">البريد الإلكتروني</label>
                            <input type="email" id="email" name="email" value={user.email} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="role">الدور</label>
                            <select id="role" name="role" value={user.role} onChange={handleChange}>
                                {roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                            </select>
                        </div>
                        {isBranchManager && (
                            <div className="form-group">
                                <label htmlFor="systemType">نوع النظام</label>
                                <select id="systemType" name="systemType" value={user.systemType} onChange={handleChange}>
                                    <option value="services">{systemTypeLabels.services}</option>
                                    <option value="restaurant">{systemTypeLabels.restaurant}</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {isBranchManager && (
                        <div className="form-group">
                            <label>الأفرع المسؤولة</label>
                            <div className="branch-selection-list">
                                {branches.map(branch => (
                                    <label key={branch.id}>
                                        <input
                                            type="checkbox"
                                            checked={user.assignedBranches.includes(branch.id)}
                                            onChange={() => handleBranchChange(branch.id)}
                                        />
                                        {branch.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <h4 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
                        {user.id ? 'إعادة تعيين كلمة المرور' : 'تعيين كلمة المرور'}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--slate-400)', marginBottom: '1.5rem', textAlign: 'right' }}>
                        {user.id ? 'اترك الحقول فارغة لعدم تغيير كلمة المرور.' : 'كلمة المرور مطلوبة للمستخدمين الجدد.'}
                    </p>
                    {error && <p className="error-message" style={{textAlign: 'right'}}>{error}</p>}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">كلمة المرور</label>
                            <input type="password" id="password" name="password" value={user.password} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} />
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
                        <button type="submit" className="btn">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const UsersAndRolesView = () => {
    const [roles, setRoles] = useState(initialMockData.roles);
    const [users, setUsers] = useState(initialMockData.users);
    const [branches] = useState(initialMockData.branches);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    
    const [feedback, setFeedback] = useState('');

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    const handleSaveUser = (userToSave) => {
        if (userToSave.password) {
            console.log(`Password for user ${userToSave.email} is being set/reset.`);
            // In a real app, you would hash and save the password.
            // Here we remove it from the object before saving to state to avoid storing it.
            delete userToSave.password;
            delete userToSave.confirmPassword;
        }

        if (userToSave.id) {
            // Edit user
            setUsers(users.map(u => u.id === userToSave.id ? userToSave : u));
            setFeedback("تم تحديث بيانات المستخدم بنجاح!");
        } else {
            // Add new user
            const newUser = { ...userToSave, id: Date.now() };
            setUsers([...users, newUser]);
            setFeedback("تم إضافة المستخدم بنجاح!");
        }
        handleCloseModal();
        setTimeout(() => setFeedback(''), 5000);
    };

    const handleDeleteUser = (userId) => {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم؟')) {
            setUsers(users.filter(u => u.id !== userId));
            setFeedback("تم حذف المستخدم.");
            setTimeout(() => setFeedback(''), 5000);
        }
    };

    const handlePermissionChange = (roleIndex, permissionKey, isChecked) => {
        if (roles[roleIndex].name === 'مسؤول') return;

        const updatedRoles = [...roles];
        const currentPermissions = new Set(updatedRoles[roleIndex].permissions);
        
        if (isChecked) {
            currentPermissions.add(permissionKey);
        } else {
            currentPermissions.delete(permissionKey);
        }

        updatedRoles[roleIndex].permissions = Array.from(currentPermissions);
        setRoles(updatedRoles);
    };

    const handleSaveRoles = () => {
        console.log("Saving new roles configuration:", roles);
        setFeedback("تم حفظ صلاحيات الأدوار بنجاح!");
        setTimeout(() => setFeedback(''), 5000);
    };
    
    return (
        <>
            <div className="dashboard-header">
                <h1>المستخدمون والأدوار</h1>
                <p>إدارة فريق عملك وصلاحيات الوصول الخاصة بهم.</p>
            </div>

            {feedback && <div className="success-message">{feedback}</div>}
            
            <div className="form-section">
                <div className="panel-header">
                    <h2>قائمة المستخدمين</h2>
                    <button className="btn btn-small" onClick={() => handleOpenModal()}><PlusIcon /><span>إضافة مستخدم</span></button>
                </div>
                <div className="table-container" style={{marginTop: '2rem'}}>
                    <table>
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>البريد الإلكتروني</th>
                                <th>الدور</th>
                                <th>النظام / الأفرع</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        {user.role === 'مدير فرع' ? (
                                            <div style={{display: 'flex', flexDirection:'column', gap: '0.25rem'}}>
                                                <small>{systemTypeLabels[user.systemType] || 'غير محدد'}</small>
                                                <small style={{color: 'var(--slate-400)'}}>
                                                    {user.assignedBranches.map(bId => branches.find(b => b.id === bId)?.name).join(', ')}
                                                </small>
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button onClick={() => handleOpenModal(user)} aria-label="تعديل"><PencilIcon /></button>
                                            {user.role !== 'مسؤول' && 
                                                <button onClick={() => handleDeleteUser(user.id)} className="delete" aria-label="حذف"><TrashIcon /></button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="form-section">
                <h2>صلاحيات الأدوار</h2>
                {roles.map((role, roleIndex) => (
                    <div className="permission-group" key={role.name} style={{borderTop: roleIndex > 0 ? '1px solid #334155' : 'none', paddingTop: roleIndex > 0 ? '1.5rem' : '0' }}>
                        <h3>صلاحيات {role.name}</h3>
                        <div className="permission-list">
                            {Object.entries(ALL_PERMISSIONS).map(([key, label]) => (
                                <label className="permission-item" key={key}>
                                    <input 
                                        type="checkbox" 
                                        checked={role.permissions.includes(key)}
                                        disabled={role.name === 'مسؤول'}
                                        onChange={(e) => handlePermissionChange(roleIndex, key, e.target.checked)}
                                    /> 
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                 <button className="btn" onClick={handleSaveRoles} style={{marginTop: '1rem'}}>حفظ الصلاحيات</button>
            </div>
            
             <UserManagementModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
                userToEdit={editingUser}
                roles={roles}
                branches={branches}
            />
        </>
    );
};

const SiteCustomizationView = ({ siteData, setSiteData }) => {
    const [localData, setLocalData] = useState(siteData);

    const handleInputChange = (section, key, value, index = null) => {
        if (index !== null) {
            const updatedArray = [...localData[section]];
            updatedArray[index] = { ...updatedArray[index], [key]: value };
            setLocalData({ ...localData, [section]: updatedArray });
        } else {
            setLocalData(prev => ({ 
                ...prev, 
                [section]: { ...prev[section], [key]: value } 
            }));
        }
    };
    
    const handlePricingFeaturesChange = (index, value) => {
        const updatedPricing = [...localData.pricing];
        updatedPricing[index].features = value.split('\n');
        setLocalData({ ...localData, pricing: updatedPricing });
    };

    const handleSave = () => {
        setSiteData(localData);
        alert('تم حفظ التغييرات بنجاح!');
    };

    return (
        <>
            <div className="dashboard-header">
                <h1>تخصيص الموقع</h1>
                <p>تحكم كامل في محتوى ومظهر صفحتك الرئيسية.</p>
            </div>
            <div className="form-section" style={{ padding: '0 2.5rem' }}>
                <Accordion title="الإعدادات العامة" icon={<Cog6ToothIcon />}>
                    <div className="form-group">
                        <label>نص الشعار (الجزء الأول)</label>
                        <input type="text" value={localData.logo.part1} onChange={e => handleInputChange('logo', 'part1', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>نص الشعار (الجزء الثاني المميز)</label>
                        <input type="text" value={localData.logo.part2} onChange={e => handleInputChange('logo', 'part2', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="accentColor">اللون الأساسي للموقع</label>
                        <div className="color-input-wrapper">
                            <input 
                                type="color" 
                                id="accentColor"
                                value={localData.theme.accentColor} 
                                onChange={e => handleInputChange('theme', 'accentColor', e.target.value)}
                            />
                            <input 
                                type="text" 
                                aria-label="Hex color code"
                                value={localData.theme.accentColor} 
                                onChange={e => handleInputChange('theme', 'accentColor', e.target.value)}
                            />
                        </div>
                    </div>
                </Accordion>
                <Accordion title="إعدادات SEO" icon={<SearchIcon />}>
                    <div className="form-group">
                        <label>الوصف التعريفي (Meta Description)</label>
                        <textarea 
                            value={localData.seo.metaDescription} 
                            onChange={e => handleInputChange('seo', 'metaDescription', e.target.value)}
                            placeholder="اكتب وصفاً موجزاً وجذاباً لموقعك يظهر في نتائج البحث."
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label>الكلمات المفتاحية (Keywords)</label>
                        <input 
                            type="text" 
                            value={localData.seo.keywords} 
                            onChange={e => handleInputChange('seo', 'keywords', e.target.value)}
                            placeholder="مثال: مطعم, قائمة طعام, طلبات, ..."
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>
                            افصل بين الكلمات المفتاحية بفاصلة (,).
                        </p>
                    </div>
                </Accordion>
                 <Accordion title="روابط التواصل الاجتماعي" icon={<LinkIcon />}>
                    <div className="form-group">
                        <label>رابط فيسبوك</label>
                        <input type="url" value={localData.social.facebook} onChange={e => handleInputChange('social', 'facebook', e.target.value)} placeholder="https://facebook.com/yourpage" />
                    </div>
                    <div className="form-group">
                        <label>رابط تويتر (X)</label>
                        <input type="url" value={localData.social.twitter} onChange={e => handleInputChange('social', 'twitter', e.target.value)} placeholder="https://twitter.com/yourprofile" />
                    </div>
                    <div className="form-group">
                        <label>رابط انستغرام</label>
                        <input type="url" value={localData.social.instagram} onChange={e => handleInputChange('social', 'instagram', e.target.value)} placeholder="https://instagram.com/yourprofile" />
                    </div>
                </Accordion>
                <Accordion title="قسم Hero" icon={<SparklesIcon />}>
                    <div className="form-group">
                        <label>العنوان الرئيسي</label>
                        <input type="text" value={localData.hero.title} onChange={e => handleInputChange('hero', 'title', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>النص الفرعي</label>
                        <textarea value={localData.hero.subtitle} onChange={e => handleInputChange('hero', 'subtitle', e.target.value)}></textarea>
                    </div>
                    <div className="form-group">
                        <label>نص الزر</label>
                        <input type="text" value={localData.hero.cta} onChange={e => handleInputChange('hero', 'cta', e.target.value)} />
                    </div>
                </Accordion>
                 <Accordion title="قسم المميزات" icon={<CheckIcon />}>
                   {localData.features.map((feature, index) => (
                      <div key={index} style={{borderTop: index > 0 ? '1px solid #334155' : 'none', paddingTop: index > 0 ? '1.5rem' : '0', marginTop: index > 0 ? '1.5rem' : '0'}}>
                          <h4 style={{color: 'white', marginBottom: '1rem'}}>الميزة رقم {index+1}</h4>
                           <div className="form-group">
                               <label>العنوان</label>
                               <input type="text" value={feature.title} onChange={e => handleInputChange('features', 'title', e.target.value, index)} />
                           </div>
                           <div className="form-group">
                               <label>الوصف</label>
                               <textarea value={feature.description} onChange={e => handleInputChange('features', 'description', e.target.value, index)}></textarea>
                           </div>
                      </div>
                   ))}
                </Accordion>
                <Accordion title="باقات الأسعار" icon={<CurrencyDollarIcon />}>
                     {localData.pricing.map((plan, index) => (
                      <div key={index} style={{borderTop: index > 0 ? '1px solid #334155' : 'none', paddingTop: index > 0 ? '1.5rem' : '0', marginTop: index > 0 ? '1.5rem' : '0'}}>
                          <h4 style={{color: 'white', marginBottom: '1rem'}}>الباقة: {plan.name}</h4>
                           <div className="form-row">
                               <div className="form-group">
                                   <label>اسم الباقة</label>
                                   <input type="text" value={plan.name} onChange={e => handleInputChange('pricing', 'name', e.target.value, index)} />
                               </div>
                               <div className="form-group">
                                   <label>السعر</label>
                                   <input type="text" value={plan.price} onChange={e => handleInputChange('pricing', 'price', e.target.value, index)} />
                               </div>
                           </div>
                           <div className="form-group">
                               <label>الوصف</label>
                               <input type="text" value={plan.description} onChange={e => handleInputChange('pricing', 'description', e.target.value, index)} />
                           </div>
                           <div className="form-group">
                               <label>المميزات (كل ميزة في سطر)</label>
                               <textarea value={plan.features.join('\n')} onChange={e => handlePricingFeaturesChange(index, e.target.value)} />
                           </div>
                      </div>
                   ))}
                </Accordion>
            </div>
             <div className="form-section" style={{ background: 'transparent', border: 'none', padding: '0 2.5rem' }}>
                <button className="btn" onClick={handleSave}>حفظ كل التغييرات</button>
            </div>
        </>
    );
};


const Sidebar = ({ activeView, onNavigate, userRole }) => {
    const adminNavItems = [
        { id: 'overview', label: 'لوحة التحكم', icon: <HomeIcon /> },
        { id: 'branches', label: 'الأفرع', icon: <BuildingStorefrontIcon /> },
        { id: 'reports', label: 'تقرير المبيعات', icon: <AnalyticsIcon /> },
        { id: 'tools', label: 'أدوات المتجر', icon: <WrenchScrewdriverIcon /> },
        { id: 'customization', label: 'تخصيص الموقع', icon: <AdjustmentsHorizontalIcon /> },
        { id: 'users', label: 'المستخدمون والأدوار', icon: <UsersIcon /> },
        { id: 'settings', label: 'الإعدادات', icon: <Cog6ToothIcon /> },
    ];

    const managerNavItems = [
        { id: 'overview', label: 'لوحة التحكم', icon: <HomeIcon /> },
        { id: 'menu', label: 'إدارة القائمة', icon: <MenuIcon /> },
        { id: 'orders', label: 'الطلبات', icon: <OrderIcon /> },
        { id: 'reports', label: 'تقارير الفرع', icon: <AnalyticsIcon /> },
        { id: 'settings', label: 'الإعدادات', icon: <Cog6ToothIcon /> },
    ];
    
    const navItems = userRole === 'مسؤول' ? adminNavItems : managerNavItems;

    return (
        <aside className="dashboard-sidebar">
            <nav>
                <ul>
                    {navItems.map(item => (
                        <li key={item.id}>
                            <a 
                                href="#" 
                                className={activeView === item.id ? 'active' : ''}
                                onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

const DashboardPage = ({ siteData, setSiteData, currentUser }) => {
    const [dashboardView, setDashboardView] = useState('overview');

    useEffect(() => {
        setDashboardView('overview');
    }, [currentUser]);

    const renderContent = () => {
        if (currentUser.role === 'مدير فرع') {
            switch (dashboardView) {
                case 'overview': return <BranchManagerDashboardOverview currentUser={currentUser} onNavigate={setDashboardView} />;
                case 'menu': return <MenuManagementView />;
                case 'orders': return <OrdersView />;
                case 'reports': return <SalesReportView />;
                case 'settings': return <SettingsView />;
                default: return <BranchManagerDashboardOverview currentUser={currentUser} onNavigate={setDashboardView} />;
            }
        }
        
        // Admin Views
        switch (dashboardView) {
            case 'overview': return <DashboardOverview onNavigate={setDashboardView} />;
            case 'branches': return <BranchesView />;
            case 'reports': return <SalesReportView />;
            case 'settings': return <SettingsView />;
            case 'tools': return <StoreToolsView />;
            case 'users': return <UsersAndRolesView />;
            case 'customization': return <SiteCustomizationView siteData={siteData} setSiteData={setSiteData} />;
            default: return <DashboardOverview onNavigate={setDashboardView} />;
        }
    };

    return (
        <div className="dashboard-page">
            <Sidebar activeView={dashboardView} onNavigate={setDashboardView} userRole={currentUser.role} />
            <main className="dashboard-main-content">
                {renderContent()}
            </main>
        </div>
    );
};


export default function App() {
  const [currentPage, setCurrentPage] = useState('main');
  const [siteData, setSiteData] = useState(initialSiteData);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', siteData.theme.accentColor);
  }, [siteData.theme]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };
  
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('main');
  };
  
  const showFooter = !currentUser && (currentPage === 'main' || currentPage === 'login');

  return (
    <>
      <Header 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
        siteData={siteData}
        currentUser={currentUser}
        onLogout={handleLogout} 
      />
      {currentPage === 'main' && (
        <main>
          <MainPage siteData={siteData} />
        </main>
      )}
      {currentPage === 'login' && (
        <main>
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        </main>
      )}
      {currentPage === 'dashboard' && currentUser && (
        <DashboardPage 
          siteData={siteData} 
          setSiteData={setSiteData} 
          currentUser={currentUser} 
        />
      )}
      {showFooter && <Footer socialLinks={siteData.social} />}
    </>
  );
}