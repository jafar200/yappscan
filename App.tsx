



import React, { useState, useEffect, createContext } from 'react';
import { User, Role, Branch, MenuItem, MenuCategory, Order, CartItem, Setting, OrderStatus, MarketplaceTool, View } from './types';
import { MARKETPLACE_TOOLS } from './constants';
import { Icons } from './components/Icons';
import { QRCodeModal } from './components/QRCodeModal';
import { SalesChart } from './components/SalesChart';
import { generateDescription } from './services/geminiService';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Save, User as UserIcon } from 'lucide-react';
import { db } from './services/db';
import { ViewMenuButton } from './components/ViewMenuButton';
import { getPublicMenuUrl } from './services/utils';
import { ConfirmationModal } from './components/ConfirmationModal';

// --- CONTEXT ---
interface AppContextType {
  currentUser: User | null;
  users: User[];
  branches: Branch[];
  orders: Order[];
  settings: Setting[];
  marketplaceTools: MarketplaceTool[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addBranch: (branch: Omit<Branch, 'id' | 'menu'>) => Promise<void>;
  updateBranch: (branch: Branch) => Promise<void>;
  deleteBranch: (branchId: string) => Promise<void>;
  addCategory: (branchId: string, categoryName: string) => Promise<void>;
  updateCategory: (branchId: string, categoryId: string, newName: string) => Promise<void>;
  deleteCategory: (branchId: string, categoryId: string) => Promise<void>;
  addItem: (branchId: string, categoryId: string, item: Omit<MenuItem, 'id' | 'isAvailable'>) => Promise<void>;
  updateItem: (branchId: string, categoryId: string, item: MenuItem) => Promise<void>;
  deleteItem: (branchId: string, categoryId: string, itemId: string) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
  updateMenuOrder: (branchId: string, categories: MenuCategory[]) => Promise<void>;
  updateCategoryItemsOrder: (branchId: string, categoryId: string, items: MenuItem[]) => Promise<void>;
  updateSetting: (key: string, value: any) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  toggleToolInstallation: (toolId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// --- HELPER HOOK ---
const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// --- FULL SCREEN LOADER ---
const FullScreenLoader: React.FC = () => (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center z-50">
        <Icons.Menu className="h-20 w-20 text-indigo-500 animate-pulse" />
        <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">جاري تحميل النظام...</p>
    </div>
);


// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.Login);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [marketplaceTools, setMarketplaceTools] = useState<MarketplaceTool[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [hash, setHash] = useState(window.location.hash);

  // Effect to track hash changes for routing
  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Effect for initializing app data (for admin panel)
  useEffect(() => {
    const initApp = async () => {
        const [loadedBranches, loadedOrders, loadedSettings, loadedUsers] = await Promise.all([
            db.getAll('branches'),
            db.getAll('orders'),
            db.getAll('settings'),
            db.getAll('users'),
        ]);
        setBranches(loadedBranches as Branch[]);
        setUsers(loadedUsers as User[]);
        setOrders((loadedOrders as Order[]).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setSettings(loadedSettings as Setting[]);
        
        // Initialize marketplace tools
        const installedToolsSetting = (loadedSettings as Setting[]).find(s => s.key === 'installed_tools');
        const installedToolIds = installedToolsSetting?.value || [];
        const toolsWithStatus = MARKETPLACE_TOOLS.map(tool => ({
            ...tool,
            isInstalled: installedToolIds.includes(tool.id)
        }));
        setMarketplaceTools(toolsWithStatus);

        setIsLoading(false);
    };
    initApp();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setCurrentView(View.Dashboard);
      if(user.role === Role.Manager && user.assignedBranchId) {
        setActiveBranchId(user.assignedBranchId);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView(View.Login);
    setActiveBranchId(null);
    window.location.hash = '';
  };
  
  const navigate = (view: View, branchId?: string) => {
      setCurrentView(view);
      if (branchId) {
          setActiveBranchId(branchId);
      } else if (currentUser?.role === Role.Manager && currentUser.assignedBranchId) {
          setActiveBranchId(currentUser.assignedBranchId);
      }
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
      const newUser: User = { ...userData, id: `user-${Date.now()}` };
      await db.add('users', newUser);
      setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (updatedUser: User) => {
      await db.put('users', updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = async (userId: string) => {
      await db.delete('users', userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const addBranch = async (branchData: Omit<Branch, 'id' | 'menu'>) => {
    const newBranch: Branch = {
      ...branchData,
      id: `branch-${Date.now()}`,
      menu: [],
    };
    await db.add('branches', newBranch);
    setBranches(prev => [...prev, newBranch]);
  };
  
  const updateBranch = async (updatedBranch: Branch) => {
    await db.put('branches', updatedBranch);
    setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
  };
  
  const deleteBranch = async (branchId: string) => {
    await db.delete('branches', branchId);
    setBranches(prev => prev.filter(b => b.id !== branchId));
  };

  const addCategory = async (branchId: string, categoryName: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;
    const newCategory: MenuCategory = { id: `cat-${Date.now()}`, name: categoryName, items: [] };
    const updatedBranch = { ...branch, menu: [...branch.menu, newCategory] };
    await db.put('branches', updatedBranch);
    setBranches(prev => prev.map(b => b.id === branchId ? updatedBranch : b));
  };

  const updateCategory = async (branchId: string, categoryId: string, newName: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;
    const updatedMenu = branch.menu.map(c => c.id === categoryId ? { ...c, name: newName } : c);
    const updatedBranch = { ...branch, menu: updatedMenu };
    await db.put('branches', updatedBranch);
    setBranches(prev => prev.map(b => b.id === branchId ? updatedBranch : b));
  };

  const deleteCategory = async (branchId: string, categoryId: string) => {
     const branch = branches.find(b => b.id === branchId);
     if (!branch) return;
     const updatedMenu = branch.menu.filter(c => c.id !== categoryId);
     const updatedBranch = { ...branch, menu: updatedMenu };
     await db.put('branches', updatedBranch);
     setBranches(prev => prev.map(b => b.id === branchId ? updatedBranch : b));
  };
  
  const addItem = async (branchId: string, categoryId: string, itemData: Omit<MenuItem, 'id' | 'isAvailable'>) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;
    const newItem: MenuItem = { ...itemData, id: `item-${Date.now()}`, isAvailable: true };
    const updatedMenu = branch.menu.map(c => {
      if (c.id === categoryId) {
        return { ...c, items: [...c.items, newItem] };
      }
      return c;
    });
    const updatedBranch = { ...branch, menu: updatedMenu };
    await db.put('branches', updatedBranch);
    setBranches(prev => prev.map(b => b.id === branchId ? updatedBranch : b));
  };

  const updateItem = async (branchId: string, categoryId: string, updatedItem: MenuItem) => {
     const branch = branches.find(b => b.id === branchId);
     if (!branch) return;
     const updatedMenu = branch.menu.map(c => {
       if (c.id === categoryId) {
         const updatedItems = c.items.map(i => i.id === updatedItem.id ? updatedItem : i);
         return { ...c, items: updatedItems };
       }
       return c;
     });
     const updatedBranch = { ...branch, menu: updatedMenu };
     await db.put('branches', updatedBranch);
     setBranches(prev => prev.map(b => b.id === branchId ? updatedBranch : b));
  };
  
  const deleteItem = async (branchId: string, categoryId: string, itemId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;
    const updatedMenu = branch.menu.map(c => {
      if (c.id === categoryId) {
        return { ...c, items: c.items.filter(i => i.id !== itemId) };
      }
      return c;
    });
    const updatedBranch = { ...branch, menu: updatedMenu };
    await db.put('branches', updatedBranch);
    setBranches(prev => prev.map(b => b.id === branchId ? updatedBranch : b));
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      createdAt: new Date(),
    };
    await db.add('orders', newOrder);
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
      const order = orders.find(o => o.id === orderId);
      if(!order) return;
      const updatedOrder = {...order, status};
      await db.put('orders', updatedOrder);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
  };
  
  const updateSetting = async (key: string, value: any) => {
      const newSetting: Setting = { key, value };
      await db.put('settings', newSetting);
      setSettings(prev => {
          const existing = prev.find(s => s.key === key);
          if (existing) {
              return prev.map(s => s.key === key ? newSetting : s);
          }
          return [...prev, newSetting];
      });
  };

  const updateBranchWithMenuChange = async (branchId: string, updatedMenu: MenuCategory[]) => {
      const branch = branches.find(b => b.id === branchId);
      if (!branch) return;
      const updatedBranch = { ...branch, menu: updatedMenu };
      await db.put('branches', updatedBranch);
      setBranches(prev => prev.map(b => b.id === branchId ? updatedBranch : b));
  };

  const updateMenuOrder = async (branchId: string, categories: MenuCategory[]) => {
    await updateBranchWithMenuChange(branchId, categories);
  };
  
  const updateCategoryItemsOrder = async (branchId: string, categoryId: string, items: MenuItem[]) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;
    const updatedMenu = branch.menu.map(c => c.id === categoryId ? {...c, items: items} : c);
    await updateBranchWithMenuChange(branchId, updatedMenu);
  };

  const toggleToolInstallation = async (toolId: string) => {
    const installedToolsSetting = settings.find(s => s.key === 'installed_tools');
    let installedToolIds: string[] = installedToolsSetting?.value || [];
    
    if (installedToolIds.includes(toolId)) {
      installedToolIds = installedToolIds.filter(id => id !== toolId);
    } else {
      installedToolIds.push(toolId);
    }
    
    await updateSetting('installed_tools', installedToolIds);

    // Update local state for immediate UI feedback
    setMarketplaceTools(prevTools =>
      prevTools.map(tool =>
        tool.id === toolId ? { ...tool, isInstalled: !tool.isInstalled } : tool
      )
    );
  };

  const contextValue: AppContextType = {
    currentUser,
    users,
    branches,
    orders,
    settings,
    marketplaceTools,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    addBranch,
    updateBranch,
    deleteBranch,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
    addOrder,
    updateMenuOrder,
    updateCategoryItemsOrder,
    updateSetting,
    updateOrderStatus,
    toggleToolInstallation,
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <DashboardView navigate={navigate} />;
      case View.Branches:
        return <BranchesView navigate={navigate} />;
      case View.Menu:
        return <MenuView branchId={activeBranchId!} />;
      case View.Orders:
        return <OrdersView branchId={currentUser?.role === Role.Manager ? currentUser.assignedBranchId : undefined} />;
      case View.Reports:
        return <ReportsView branchId={currentUser?.role === Role.Manager ? currentUser.assignedBranchId : undefined} />;
      case View.Settings:
        return <SettingsView />;
      case View.Marketplace:
        return <MarketplaceView />;
      case View.UserManagement:
        return <UserManagementView />;
      case View.CRM:
        return <CRMView />;
      case View.Inventory:
        return <InventoryView />;
      case View.FinancialReports:
        return <FinancialReportsView />;
      case View.Login:
      default:
        return <LoginView />;
    }
  };
  
  const mainLayoutClasses = "flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
  const contentLayoutClasses = "flex-1 flex flex-col overflow-hidden";
  const mainContentClasses = "flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-8";

  const renderContent = () => {
    if (isLoading) {
      return <FullScreenLoader />;
    }

    // Public Routes Logic
    if (hash.startsWith('#/')) {
        if (hash.startsWith('#/about')) {
            return <PublicAboutUsPage />;
        }
        
        if (hash.startsWith('#/menu/')) {
            const branchId = hash.substring('#/menu/'.length).split('?')[0].replace('/', '');
            return <PublicMenuPage branchId={branchId} />;
        }
        
        // If the hash is unrecognized, show the Not Found page.
        return <NotFoundPage />;
    }

    // Admin Panel Logic
    if (!currentUser) {
      return <LoginView />;
    }

    return (
      <div className={mainLayoutClasses}>
        <Sidebar navigate={navigate} currentView={currentView} />
        <div className={contentLayoutClasses}>
          <Header toggleDarkMode={() => setDarkMode(!darkMode)} darkMode={darkMode} />
          <main className={mainContentClasses}>
            {renderView()}
          </main>
        </div>
      </div>
    );
  };

  return (
    <AppContext.Provider value={contextValue}>
      {renderContent()}
    </AppContext.Provider>
  );
};

// --- LAYOUT COMPONENTS ---
const Sidebar: React.FC<{navigate: (view: View) => void, currentView: View}> = ({ navigate, currentView }) => {
    const { currentUser, marketplaceTools } = useAppContext();
    const navItemClass = (view: View) => `flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${currentView === view ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`;
    
    const installedTools = marketplaceTools.filter(tool => tool.isInstalled && tool.view !== undefined);

    return (
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
                <Icons.Menu className="h-8 w-8 text-indigo-500" />
                <h1 className="text-2xl font-bold ml-2 text-gray-800 dark:text-white">القائمة</h1>
            </div>
            <nav className="flex-1 px-4 py-4">
                <a onClick={() => navigate(View.Dashboard)} className={navItemClass(View.Dashboard)}>
                    <Icons.Dashboard className="h-6 w-6" />
                    <span className="mx-4 font-semibold">لوحة التحكم</span>
                </a>
                {currentUser?.role === Role.Admin && (
                    <>
                    <a onClick={() => navigate(View.Branches)} className={navItemClass(View.Branches)}>
                        <Icons.Branches className="h-6 w-6" />
                        <span className="mx-4 font-semibold">الفروع</span>
                    </a>
                     <a onClick={() => navigate(View.UserManagement)} className={navItemClass(View.UserManagement)}>
                        <Icons.Users className="h-6 w-6" />
                        <span className="mx-4 font-semibold">إدارة المستخدمين</span>
                    </a>
                    </>
                )}
                 <a onClick={() => navigate(View.Menu)} className={navItemClass(View.Menu)}>
                    <Icons.Menu className="h-6 w-6" />
                    <span className="mx-4 font-semibold">إدارة القائمة</span>
                </a>
                <a onClick={() => navigate(View.Orders)} className={navItemClass(View.Orders)}>
                    <Icons.Orders className="h-6 w-6" />
                    <span className="mx-4 font-semibold">الطلبات</span>
                </a>
                <a onClick={() => navigate(View.Reports)} className={navItemClass(View.Reports)}>
                    <Icons.Reports className="h-6 w-6" />
                    <span className="mx-4 font-semibold">التقارير</span>
                </a>
                 {currentUser?.role === Role.Admin && (
                    <a onClick={() => navigate(View.Marketplace)} className={navItemClass(View.Marketplace)}>
                        <Icons.Store className="h-6 w-6" />
                        <span className="mx-4 font-semibold">المتجر</span>
                    </a>
                )}
                 <a onClick={() => navigate(View.Settings)} className={navItemClass(View.Settings)}>
                    <Icons.Settings className="h-6 w-6" />
                    <span className="mx-4 font-semibold">الإعدادات</span>
                </a>

                {installedTools.length > 0 && (
                    <>
                        <hr className="my-4 border-gray-200 dark:border-gray-600" />
                        <h3 className="px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">الأدوات المفعّلة</h3>
                    </>
                )}
                {installedTools.map(tool => {
                    const IconComponent = Icons[tool.icon];
                    // The view property is checked in the filter above, so it's safe to use !
                    return (
                         <a key={tool.id} onClick={() => navigate(tool.view!)} className={navItemClass(tool.view!)}>
                            <IconComponent className="h-6 w-6" />
                            <span className="mx-4 font-semibold">{tool.name}</span>
                        </a>
                    );
                })}
            </nav>
        </div>
    );
};

const Header: React.FC<{toggleDarkMode: () => void, darkMode: boolean}> = ({ toggleDarkMode, darkMode }) => {
    const { currentUser, logout } = useAppContext();
    return (
        <header className="flex justify-between items-center h-20 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center">
                {/* Search can be added here */}
            </div>
            <div className="flex items-center">
                 <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-4">
                    {darkMode ? <Icons.Sun className="h-6 w-6 text-yellow-400" /> : <Icons.Moon className="h-6 w-6 text-gray-600" />}
                </button>
                <div className="flex items-center">
                    <span className="mr-4 font-semibold text-gray-700 dark:text-gray-200">أهلاً, {currentUser?.name}</span>
                    <button onClick={logout} className="flex items-center text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                        <Icons.Logout className="h-6 w-6 mr-2" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

// --- VIEW COMPONENTS ---

const LoginView: React.FC = () => {
    const { login } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);
        // Simulate network delay for better UX
        await new Promise(res => setTimeout(res, 500)); 
        const success = await login(username, password);
        if (!success) {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        }
        setIsLoggingIn(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
                    <Icons.Menu className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">نظام إدارة القائمة</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">أهلاً بك، الرجاء تسجيل الدخول للمتابعة.</p>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                             <input
                                type="text"
                                placeholder="اسم المستخدم"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full text-lg p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="كلمة المرور"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full text-lg p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full text-lg text-white font-bold p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center disabled:bg-indigo-400"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <Icons.Spinner className="w-6 h-6 mr-2 animate-spin" />
                                        <span>جاري الدخول...</span>
                                    </>
                                ) : (
                                    <span>تسجيل الدخول</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                 <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>المسؤول: admin / password</p>
                    <p>مدير الرياض: riyadh_manager / password</p>
                </div>
            </div>
        </div>
    );
};

const DashboardView: React.FC<{ navigate: (view: View, branchId?: string) => void }> = ({ navigate }) => {
    const { branches, orders, currentUser } = useAppContext();

    const totalBranches = branches.length;
    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, order) => acc + order.total, 0).toFixed(2);
    
    const branchForManager = branches.find(b => b.id === currentUser?.assignedBranchId);

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">لوحة التحكم</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Stat Cards */}
                {currentUser?.role === Role.Admin && (
                    <StatCard icon={<Icons.Branches className="h-8 w-8 text-white" />} title="إجمالي الفروع" value={totalBranches.toString()} color="bg-blue-500" />
                )}
                <StatCard icon={<Icons.Orders className="h-8 w-8 text-white" />} title="إجمالي الطلبات" value={totalOrders.toString()} color="bg-green-500" />
                <StatCard icon={<Icons.Price className="h-8 w-8 text-white" />} title="إجمالي المبيعات" value={`${totalSales} ريال`} color="bg-yellow-500" />
            </div>
             <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">إجراءات سريعة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentUser?.role === Role.Admin && (
                       <QuickActionButton icon={<Icons.Branches className="h-10 w-10" />} title="إدارة الفروع" onClick={() => navigate(View.Branches)} />
                    )}
                    <QuickActionButton icon={<Icons.Menu className="h-10 w-10" />} title="إدارة القائمة" onClick={() => navigate(View.Menu, branchForManager?.id)} />
                    <QuickActionButton icon={<Icons.Orders className="h-10 w-10" />} title="عرض الطلبات" onClick={() => navigate(View.Orders)} />
                    <QuickActionButton icon={<Icons.Reports className="h-10 w-10" />} title="عرض التقارير" onClick={() => navigate(View.Reports)} />
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center">
        <div className={`rounded-full h-16 w-16 flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div className="ml-4">
            <h4 className="text-gray-500 dark:text-gray-400 text-md">{title}</h4>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode, title: string, onClick: () => void }> = ({ icon, title, onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
         <div className="text-indigo-500 mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
    </button>
);

const BranchesView: React.FC<{ navigate: (view: View, branchId?: string) => void }> = ({ navigate }) => {
    const { branches, addBranch, updateBranch, deleteBranch } = useAppContext();
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [showQrModal, setShowQrModal] = useState<Branch | null>(null);
    const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

    const handleSave = async (branchData: { name: string, location: string }) => {
        if (editingBranch) {
            await updateBranch({ ...editingBranch, ...branchData });
        } else {
            await addBranch(branchData);
        }
        setShowModal(false);
        setEditingBranch(null);
    };
    
    const confirmDeleteBranch = () => {
        if (branchToDelete) {
            deleteBranch(branchToDelete.id);
            setBranchToDelete(null);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">إدارة الفروع</h1>
                <button onClick={() => { setEditingBranch(null); setShowModal(true); }} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition flex items-center">
                    <Icons.Add className="w-5 h-5 mr-2" />
                    إضافة فرع
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {branches.map(branch => (
                        <li key={branch.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex flex-col md:flex-row items-start md:items-center justify-between">
                            <div className="mb-4 md:mb-0">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{branch.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">{branch.location}</p>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                 <ViewMenuButton branch={branch} />
                                <button onClick={() => setShowQrModal(branch)} className="flex-1 text-sm flex items-center justify-center bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition">
                                    <Icons.QRCode className="w-4 h-4 ml-2" />
                                    QR والرابط
                                </button>
                                <button onClick={() => { setEditingBranch(branch); setShowModal(true); }} className="flex-1 text-sm flex items-center justify-center bg-blue-500 text-white font-semibold py-2 px-3 rounded-md hover:bg-blue-600 transition">
                                    <Icons.Edit className="w-4 h-4 mr-1" />
                                    تعديل
                                </button>
                                <button onClick={() => setBranchToDelete(branch)} className="flex-1 text-sm flex items-center justify-center bg-red-500 text-white font-semibold py-2 px-3 rounded-md hover:bg-red-600 transition">
                                    <Icons.Delete className="w-4 h-4 mr-1" />
                                    حذف
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {showModal && <BranchModal branch={editingBranch} onSave={handleSave} onClose={() => setShowModal(false)} />}
            {showQrModal && <QRCodeModal url={getPublicMenuUrl(showQrModal)} title={showQrModal.name} onClose={() => setShowQrModal(null)} />}
            {branchToDelete && (
                <ConfirmationModal
                    isOpen={!!branchToDelete}
                    onClose={() => setBranchToDelete(null)}
                    onConfirm={confirmDeleteBranch}
                    title="تأكيد حذف الفرع"
                    message={
                        <span>
                            هل أنت متأكد أنك تريد حذف فرع <strong>"{branchToDelete.name}"</strong>؟
                            <br />
                            سيتم حذف جميع بياناته بشكل نهائي.
                        </span>
                    }
                    variant="danger"
                    confirmText="تأكيد الحذف"
                />
            )}
        </div>
    );
};

const BranchModal: React.FC<{ branch: Branch | null, onSave: (data: { name: string, location: string }) => void, onClose: () => void }> = ({ branch, onSave, onClose }) => {
    const [name, setName] = useState(branch?.name || '');
    const [location, setLocation] = useState(branch?.location || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && location) {
            onSave({ name, location });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{branch ? 'تعديل الفرع' : 'إضافة فرع جديد'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">اسم الفرع</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">الموقع</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div className="flex justify-end space-x-3 space-x-reverse">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UserManagementView: React.FC = () => {
    const { users, addUser, updateUser, deleteUser, branches, currentUser } = useAppContext();
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const handleSave = async (userData: Omit<User, 'id'>) => {
        if (editingUser) {
            await updateUser({ ...editingUser, ...userData });
        } else {
            await addUser(userData);
        }
        setShowModal(false);
        setEditingUser(null);
    };

    const confirmDeleteUser = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
        }
    };

    const getRoleText = (role: Role) => role === Role.Admin ? 'مسؤول' : 'مدير فرع';
    const getBranchName = (branchId?: string) => branches.find(b => b.id === branchId)?.name || 'غير محدد';

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">إدارة المستخدمين</h1>
                <button onClick={() => { setEditingUser(null); setShowModal(true); }} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition flex items-center">
                    <Icons.Add className="w-5 h-5 mr-2" />
                    إضافة مستخدم
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">الاسم</th>
                            <th scope="col" className="px-6 py-3">اسم المستخدم</th>
                            <th scope="col" className="px-6 py-3">الدور</th>
                            <th scope="col" className="px-6 py-3">الفرع المعين</th>
                            <th scope="col" className="px-6 py-3">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.name}</td>
                                <td className="px-6 py-4">{user.username}</td>
                                <td className="px-6 py-4">{getRoleText(user.role)}</td>
                                <td className="px-6 py-4">{user.role === Role.Manager ? getBranchName(user.assignedBranchId) : 'N/A'}</td>
                                <td className="px-6 py-4 flex items-center space-x-2 space-x-reverse">
                                    <button onClick={() => { setEditingUser(user); setShowModal(true); }} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full"><Icons.Edit className="w-5 h-5" /></button>
                                    {/* Prevent deleting yourself */}
                                    {currentUser?.id !== user.id && (
                                        <button onClick={() => setUserToDelete(user)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full"><Icons.Delete className="w-5 h-5" /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {showModal && <UserModal user={editingUser} onSave={handleSave} onClose={() => setShowModal(false)} />}
             {userToDelete && (
                <ConfirmationModal
                    isOpen={!!userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onConfirm={confirmDeleteUser}
                    title="تأكيد حذف المستخدم"
                    message={<span>هل أنت متأكد أنك تريد حذف المستخدم <strong>"{userToDelete.name}"</strong>؟</span>}
                    variant="danger"
                    confirmText="تأكيد الحذف"
                />
            )}
        </div>
    );
};

const UserModal: React.FC<{ user: User | null, onSave: (data: Omit<User, 'id'>) => void, onClose: () => void }> = ({ user, onSave, onClose }) => {
    const { branches } = useAppContext();
    const [name, setName] = useState(user?.name || '');
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>(user?.role || Role.Manager);
    const [assignedBranchId, setAssignedBranchId] = useState(user?.assignedBranchId || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Password is required for new users, but optional when editing
        if (name && username && (password || user)) {
            const userData: Omit<User, 'id'> = {
                name,
                username,
                password: password || user!.password, // Keep old password if new one isn't entered
                role,
                assignedBranchId: role === Role.Manager ? assignedBranchId : undefined,
            };
            onSave(userData);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{user ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="الاسم الكامل" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <input type="text" placeholder="اسم المستخدم" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <input type="password" placeholder={user ? "أدخل كلمة مرور جديدة للتغيير" : "كلمة المرور"} value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg" required={!user} />
                    <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <option value={Role.Manager}>مدير فرع</option>
                        <option value={Role.Admin}>مسؤول</option>
                    </select>
                    {role === Role.Manager && (
                        <select value={assignedBranchId} onChange={e => setAssignedBranchId(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg" required>
                            <option value="" disabled>-- اختر فرع --</option>
                            {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                        </select>
                    )}
                    <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MenuView: React.FC<{ branchId: string }> = ({ branchId }) => {
    const { branches, currentUser, addCategory, updateCategory, deleteCategory, addItem, updateItem, deleteItem, updateMenuOrder, updateCategoryItemsOrder } = useAppContext();
    const branch = branches.find(b => b.id === branchId);
    
    const [editingItem, setEditingItem] = useState<{ categoryId: string, item: MenuItem | null } | null>(null);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ categoryId: string; item: MenuItem } | null>(null);
    const [selectedBranch, setSelectedBranch] = useState(branchId);
    
    useEffect(() => {
        setSelectedBranch(branchId);
    }, [branchId]);

    const activeBranch = branches.find(b => b.id === selectedBranch);

    if (currentUser?.role === Role.Admin && branches.length > 0 && !activeBranch) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Icons.Branches className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">الرجاء اختيار فرع</h2>
                <p className="text-gray-500 dark:text-gray-400">اختر فرعاً من القائمة أعلاه لعرض قائمته وإدارتها.</p>
            </div>
        );
    }
    
    if (!activeBranch) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                 <Icons.Menu className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">قائمة فارغة</h2>
                {currentUser?.role === Role.Manager ? (
                     <p className="text-gray-500 dark:text-gray-400">لم يتم تعيين قائمة لهذا الفرع بعد. ابدأ بإضافة فئة جديدة.</p>
                ) : (
                     <p className="text-gray-500 dark:text-gray-400">لم يتم العثور على الفرع المحدد.</p>
                )}
            </div>
        );
    }
    
    const confirmDeleteCategory = () => {
        if (categoryToDelete) {
            deleteCategory(activeBranch.id, categoryToDelete.id);
            setCategoryToDelete(null);
        }
    };
    
    const confirmDeleteItem = () => {
        if (itemToDelete) {
            deleteItem(activeBranch.id, itemToDelete.categoryId, itemToDelete.item.id);
            setItemToDelete(null);
        }
    };

    const handleGenerateDescription = async (itemName: string, callback: (desc: string) => void) => {
        setIsGeneratingDesc(true);
        try {
            const description = await generateDescription(itemName);
            callback(description);
        } catch (error) {
            console.error("Failed to generate description:", error);
        } finally {
            setIsGeneratingDesc(false);
        }
    };
    
    const handleToggleAvailability = (category: MenuCategory, itemToToggle: MenuItem) => {
        updateItem(activeBranch.id, category.id, {
            ...itemToToggle,
            isAvailable: !itemToToggle.isAvailable,
        });
    };

    return (
        <div className="container mx-auto">
             <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                 <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">إدارة قائمة: {activeBranch.name}</h1>
                     {currentUser?.role === Role.Admin && (
                         <select 
                            value={selectedBranch} 
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="mt-2 block w-full md:w-72 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                         >
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                         </select>
                     )}
                 </div>
                <button onClick={() => {
                    const name = window.prompt('أدخل اسم الفئة الجديدة:');
                    if (name) addCategory(activeBranch.id, name);
                }} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center md:justify-start">
                    <Icons.Add className="w-5 h-5 mr-2" />
                    إضافة فئة
                </button>
            </div>

            <Reorder.Group axis="y" values={activeBranch.menu} onReorder={(newOrder) => updateMenuOrder(activeBranch.id, newOrder)} className="space-y-8">
                {activeBranch.menu.map(category => (
                    <Reorder.Item key={category.id} value={category} whileDrag={{ scale: 1.01, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
                                <div className="flex items-center">
                                    <GripVertical className="h-6 w-6 text-gray-400 dark:text-gray-500 cursor-grab mr-3 rtl:ml-3 rtl:mr-0" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category.name}</h2>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <button onClick={() => {
                                        const name = window.prompt('أدخل الاسم الجديد للفئة:', category.name);
                                        if (name) updateCategory(activeBranch.id, category.id, name);
                                    }} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full"><Icons.Edit className="w-5 h-5" /></button>
                                    <button onClick={() => setCategoryToDelete(category)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full"><Icons.Delete className="w-5 h-5" /></button>
                                </div>
                            </div>
                            
                            <Reorder.Group axis="y" values={category.items} onReorder={(newOrder) => updateCategoryItemsOrder(activeBranch.id, category.id, newOrder)} className="space-y-4">
                            {category.items.map(item => (
                                <Reorder.Item key={item.id} value={item} whileDrag={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', scale: 1.02 }}>
                                    <div className={`flex items-center p-3 rounded-lg transition-opacity ${!item.isAvailable ? 'opacity-60 bg-gray-100 dark:bg-gray-700/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                                        <GripVertical className="h-5 w-5 text-gray-400 dark:text-gray-500 cursor-grab mr-2 rtl:ml-2 rtl:mr-0" />
                                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover mr-4 rtl:ml-4 rtl:mr-0" />
                                        <div className="flex-grow">
                                            <h4 className="font-semibold text-lg">{item.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                        </div>
                                        <div className="font-bold text-lg text-indigo-600 dark:text-indigo-400 mx-4">{item.price} ريال</div>
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                             <button 
                                                onClick={() => handleToggleAvailability(category, item)}
                                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${item.isAvailable ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                title={item.isAvailable ? 'متوفر' : 'غير متوفر'}
                                            >
                                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${item.isAvailable ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'}`}/>
                                            </button>
                                            <button onClick={() => setEditingItem({ categoryId: category.id, item })} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-600 rounded-full"><Icons.Edit className="w-5 h-5" /></button>
                                            <button onClick={() => setItemToDelete({ categoryId: category.id, item })} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-600 rounded-full"><Icons.Delete className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                            </Reorder.Group>

                            <button onClick={() => setEditingItem({ categoryId: category.id, item: null })} className="mt-4 w-full text-indigo-600 dark:text-indigo-400 font-bold py-3 px-4 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 border-2 border-dashed border-indigo-200 dark:border-gray-600 transition flex items-center justify-center">
                                <Icons.Add className="w-5 h-5 mr-2" />
                                إضافة عنصر جديد
                            </button>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
             {editingItem && (
                <ItemModal
                    categoryId={editingItem.categoryId}
                    item={editingItem.item}
                    onSave={async (itemData, isNew) => {
                        if (isNew) {
                            await addItem(activeBranch.id, editingItem.categoryId, itemData);
                        } else {
                            await updateItem(activeBranch.id, editingItem.categoryId, { ...editingItem.item!, ...itemData });
                        }
                        setEditingItem(null);
                    }}
                    onClose={() => setEditingItem(null)}
                    onGenerateDescription={handleGenerateDescription}
                    isGeneratingDesc={isGeneratingDesc}
                />
            )}
            {categoryToDelete && (
                <ConfirmationModal
                    isOpen={!!categoryToDelete}
                    onClose={() => setCategoryToDelete(null)}
                    onConfirm={confirmDeleteCategory}
                    title="تأكيد حذف الفئة"
                    message={
                        <span>
                            هل أنت متأكد أنك تريد حذف فئة <strong>"{categoryToDelete.name}"</strong>؟
                            <br/>
                            سيتم حذف جميع العناصر الموجودة بداخلها.
                        </span>
                    }
                    variant="danger"
                    confirmText="تأكيد الحذف"
                />
            )}
            {itemToDelete && (
                <ConfirmationModal
                    isOpen={!!itemToDelete}
                    onClose={() => setItemToDelete(null)}
                    onConfirm={confirmDeleteItem}
                    title="تأكيد حذف العنصر"
                    message={
                        <span>
                            هل أنت متأكد أنك تريد حذف عنصر <strong>"{itemToDelete.item.name}"</strong>؟
                        </span>
                    }
                    variant="danger"
                    confirmText="تأكيد الحذف"
                />
            )}
        </div>
    );
};

const ItemModal: React.FC<{
    categoryId: string;
    item: MenuItem | null;
    onSave: (item: Omit<MenuItem, 'id' | 'isAvailable'>, isNew: boolean) => void;
    onClose: () => void;
    onGenerateDescription: (itemName: string, callback: (desc: string) => void) => void;
    isGeneratingDesc: boolean;
}> = ({ item, onSave, onClose, onGenerateDescription, isGeneratingDesc }) => {
    const [name, setName] = useState(item?.name || '');
    const [description, setDescription] = useState(item?.description || '');
    const [price, setPrice] = useState(item?.price || 0);
    const [imageUrl, setImageUrl] = useState(item?.imageUrl || `https://picsum.photos/400/300?random=${Date.now()}`);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             if (!file.type.startsWith('image/')) {
                alert('الرجاء اختيار ملف صورة.');
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('حجم الصورة كبير جداً. الرجاء اختيار صورة أصغر من 2 ميجابايت.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && price >= 0) {
            onSave({ name, description, price, imageUrl }, !item);
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{item ? 'تعديل العنصر' : 'إضافة عنصر جديد'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">اسم العنصر</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">الوصف</label>
                        <div className="relative">
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                            <button type="button" onClick={() => onGenerateDescription(name, setDescription)} disabled={!name || isGeneratingDesc} className="absolute bottom-2 left-2 flex items-center bg-indigo-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                                <Icons.AI className={`w-4 h-4 mr-1 ${isGeneratingDesc ? 'animate-spin' : ''}`} />
                                {isGeneratingDesc ? 'جاري الإنشاء...' : 'إنشاء بالذكاء الاصطناعي'}
                            </button>
                        </div>
                    </div>
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2">السعر (ريال)</label>
                            <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2">صورة العنصر</label>
                            <div className="flex items-center gap-4">
                                <img src={imageUrl} alt="معاينة" className="w-20 h-20 rounded-lg object-cover bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500" />
                                <div>
                                    <input
                                        type="file"
                                        id="imageUpload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('imageUpload')?.click()}
                                        className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center"
                                    >
                                        <Icons.Upload className="w-4 h-4 mr-2" />
                                        تغيير
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 space-x-reverse">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const OrdersView: React.FC<{ branchId?: string }> = () => {
    const { orders, branches, updateOrderStatus } = useAppContext();
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

    useEffect(() => {
        setFilteredOrders(branchId ? orders.filter(o => o.branchId === branchId) : orders);
    }, [orders, branchId]);

    const getBranchName = (branchId: string) => branches.find(b => b.id === branchId)?.name || 'غير معروف';

    const statusStyles: { [key in OrderStatus]: string } = {
        Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        Paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    
    const statusText: { [key in OrderStatus]: string } = {
        Pending: 'قيد الانتظار',
        Paid: 'مدفوع',
        Completed: 'مكتمل',
        Cancelled: 'ملغي',
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">إدارة الطلبات</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">الطلب</th>
                            <th scope="col" className="px-6 py-3">الفرع</th>
                            <th scope="col" className="px-6 py-3">الطاولة</th>
                            <th scope="col" className="px-6 py-3">المجموع</th>
                            <th scope="col" className="px-6 py-3">طريقة الدفع</th>
                            <th scope="col" className="px-6 py-3">التاريخ</th>
                            <th scope="col" className="px-6 py-3">الحالة</th>
                            <th scope="col" className="px-6 py-3">تغيير الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    #{order.id.slice(-6)}
                                </td>
                                <td className="px-6 py-4">{getBranchName(order.branchId)}</td>
                                <td className="px-6 py-4">{order.tableNumber}</td>
                                <td className="px-6 py-4">{order.total.toFixed(2)} ريال</td>
                                <td className="px-6 py-4">{order.paymentMethod === 'Online' ? 'إلكتروني' : 'نقدي'}</td>
                                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleString('ar-SA')}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full font-semibold text-xs ${statusStyles[order.status]}`}>
                                        {statusText[order.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                     <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                        className="p-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                    >
                                        <option value="Pending">قيد الانتظار</option>
                                        <option value="Paid">مدفوع</option>
                                        <option value="Completed">مكتمل</option>
                                        <option value="Cancelled">ملغي</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const ReportsView: React.FC<{ branchId?: string }> = ({ branchId }) => {
    const { orders, branches } = useAppContext();
    
    const filteredOrders = branchId ? orders.filter(o => o.branchId === branchId) : orders;
    const branchName = branchId ? branches.find(b => b.id === branchId)?.name : 'جميع الفروع';

    // Sales by day (last 7 days)
    const salesByDay: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric' });
        salesByDay[key] = 0;
    }
    filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        if (orderDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
            const key = orderDate.toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric' });
            if (salesByDay[key] !== undefined) {
                salesByDay[key] += order.total;
            }
        }
    });
    const dailyChartData = Object.entries(salesByDay).map(([name, sales]) => ({ name, 'المبيعات': sales }));

    // Sales by branch
    const salesByBranch: { [key: string]: number } = {};
    if (!branchId) { // Only calculate if admin is viewing
        branches.forEach(b => salesByBranch[b.name] = 0);
        orders.forEach(order => {
            const branch = branches.find(b => b.id === order.branchId);
            if (branch) {
                salesByBranch[branch.name] += order.total;
            }
        });
    }
    const branchChartData = Object.entries(salesByBranch).map(([name, sales]) => ({ name, 'المبيعات': sales }));


    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">تقارير المبيعات: {branchName}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SalesChart data={dailyChartData} type="line" dataKey="المبيعات" title="المبيعات في آخر 7 أيام" />
                 {!branchId && (
                    <SalesChart data={branchChartData} type="bar" dataKey="المبيعات" title="المبيعات حسب الفرع" />
                 )}
            </div>
        </div>
    );
};

const SettingsView: React.FC = () => {
    const { settings, updateSetting } = useAppContext();
    const aboutUsSetting = settings.find(s => s.key === 'aboutUs');
    const [aboutUsText, setAboutUsText] = useState(aboutUsSetting?.value || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setAboutUsText(aboutUsSetting?.value || '');
    }, [aboutUsSetting]);

    const handleSave = async () => {
        setIsSaving(true);
        await updateSetting('aboutUs', aboutUsText);
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">الإعدادات</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">صفحة "من نحن"</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    اكتب هنا نبذة تعريفية عن مطعمك أو مشروعك. سيظهر هذا النص للعملاء في صفحة "من نحن".
                </p>
                <textarea
                    value={aboutUsText}
                    onChange={(e) => setAboutUsText(e.target.value)}
                    rows={8}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="اكتب نبذة عن مشروعك..."
                />
                <div className="mt-6 flex justify-end items-center">
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <span className="text-green-600 dark:text-green-400 font-semibold ml-4">تم الحفظ بنجاح!</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-indigo-700 transition flex items-center disabled:bg-indigo-400"
                    >
                        <Save className={`w-5 h-5 ml-2 ${isSaving ? 'animate-spin' : ''}`} />
                        {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ToolCard: React.FC<{ tool: MarketplaceTool }> = ({ tool }) => {
    const { toggleToolInstallation } = useAppContext();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const IconComponent = Icons[tool.icon];

    const handleActivate = () => {
        if (!tool.isInstalled) {
            setShowConfirmModal(true);
        }
    };
    
    const confirmActivation = () => {
        toggleToolInstallation(tool.id);
        setShowConfirmModal(false);
    };

    const cancelActivation = () => {
        setShowConfirmModal(false);
    };
    
    const renderStars = (rating: number) => {
        const stars = [];
        const roundedRating = Math.round(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Icons.Star key={i} className={`w-5 h-5 ${i < roundedRating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} />
            );
        }
        return <div className="flex items-center gap-1">{stars}</div>;
    };

    return (
        <>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocus={() => setIsHovered(true)}
                onBlur={() => setIsHovered(false)}
                tabIndex={0}
            >
                <div>
                    <div className="flex items-center mb-4">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg mr-4 rtl:ml-4 rtl:mr-0">
                            <IconComponent className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tool.name}</h3>
                    </div>
                    <div className="h-24 relative">
                        <AnimatePresence>
                            {!isHovered ? (
                                <motion.p
                                    key="desc"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-gray-600 dark:text-gray-400"
                                >
                                    {tool.description}
                                </motion.p>
                            ) : (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col justify-center h-full space-y-3"
                                >
                                    {tool.rating && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-500 dark:text-gray-300">التقييم:</span>
                                            {renderStars(tool.rating)}
                                        </div>
                                    )}
                                    {tool.dateAdded && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-semibold text-gray-500 dark:text-gray-300">تاريخ الإضافة:</span>
                                            <span className="text-gray-500 dark:text-gray-400">{new Date(tool.dateAdded).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                    )}
                                    {!(tool.rating || tool.dateAdded) && (
                                            <p className="text-gray-400">لا توجد تفاصيل إضافية.</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="border-t dark:border-gray-700 pt-4 mt-4 flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{tool.price}</span>
                        <span className="text-gray-500 dark:text-gray-400"> ريال/{tool.pricePeriod}</span>
                    </div>
                    {tool.isInstalled ? (
                        <div className="flex items-center font-bold py-2 px-4 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                            <Icons.Check className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                            <span>مفعّل</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleActivate}
                            className="font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-300 bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            <span>تفعيل</span>
                        </button>
                    )}
                </div>
            </div>
            {showConfirmModal && (
                <ConfirmationModal
                    isOpen={showConfirmModal}
                    onClose={cancelActivation}
                    onConfirm={confirmActivation}
                    title={`تفعيل أداة: ${tool.name}`}
                    message={
                        <div className="space-y-4">
                            <p>
                                أنت على وشك تفعيل هذه الأداة. سيتم إضافة التكلفة التالية إلى فاتورتك:
                            </p>
                            <p className="text-center font-bold text-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700 p-3 rounded-md">
                                {tool.price} ريال / {tool.pricePeriod}
                            </p>
                            <p className="text-sm text-gray-500">
                                قد تتطلب بعض الأدوات خطوات إعداد إضافية بعد التفعيل. هل أنت متأكد أنك تريد المتابعة؟
                            </p>
                        </div>
                    }
                    variant="primary"
                    confirmText="نعم، قم بالتفعيل"
                    icon={<Icons.CreditCard className="w-6 h-6" />}
                />
            )}
        </>
    );
};

const MarketplaceView: React.FC = () => {
    const { marketplaceTools } = useAppContext();
    
    const sortedTools = [...marketplaceTools].sort((a, b) => Number(b.isInstalled) - Number(a.isInstalled));

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">المتجر</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">أضف أدوات جديدة لنظامك لتعزيز قدراته.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {sortedTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>
        </div>
    );
};


// --- INSTALLED TOOL VIEWS (PLACEHOLDERS) ---

const CRMView: React.FC = () => (
    <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">إدارة علاقات العملاء (CRM)</h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center flex flex-col items-center">
            <Icons.Users className="w-20 h-20 text-indigo-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">أداة CRM مفعّلة</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                هذه هي لوحة التحكم الخاصة بإدارة علاقات العملاء. من هنا يمكنك عرض قاعدة بيانات عملائك، تتبع سجلات شرائهم، وإطلاق حملات ولاء مخصصة لزيادة التفاعل.
            </p>
        </div>
    </div>
);

const InventoryView: React.FC = () => (
    <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">إدارة المخزون الذكية</h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center flex flex-col items-center">
            <Icons.Warehouse className="w-20 h-20 text-indigo-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">أداة إدارة المخزون مفعّلة</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                 هذه هي لوحة التحكم الخاصة بإدارة المخزون. يمكنك تتبع مستويات المخزون للمكونات والمنتجات في الوقت الفعلي، وتلقي تنبيهات عند انخفاض الكميات.
            </p>
        </div>
    </div>
);

const FinancialReportsView: React.FC = () => (
    <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">التقارير المالية والإدارية</h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center flex flex-col items-center">
            <Icons.Reports className="w-20 h-20 text-indigo-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">أداة التقارير المتقدمة مفعّلة</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
               هنا يمكنك الحصول على تقارير مفصلة ومتقدمة عن المبيعات، الأرباح، والمصاريف لاتخاذ قرارات عمل مستنيرة.
            </p>
        </div>
    </div>
);

// --- Mock Payment Modal ---
const PaymentModal: React.FC<{
    amount: number;
    onClose: () => void;
    onSuccess: (paymentId: string) => void;
}> = ({ amount, onClose, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => {
            const fakePaymentId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            onSuccess(fakePaymentId);
            setIsProcessing(false);
        }, 2000); // Simulate network delay
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md"
            >
                <header className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">الدفع الإلكتروني الآمن</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Icons.X /></button>
                </header>
                <form onSubmit={handlePayment}>
                    <div className="p-6">
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-2">المبلغ الإجمالي للدفع</p>
                        <p className="text-center text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-6">{amount.toFixed(2)} ريال</p>
                        
                        {/* This is a mock form for demonstration */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم البطاقة</label>
                                <div className="relative">
                                    <input type="text" placeholder="•••• •••• •••• ••••" className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10" />
                                    <Icons.CreditCard className="absolute top-1/2 -translate-y-1/2 right-3 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الانتهاء</label>
                                    <input type="text" placeholder="شهر/سنة" className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                                    <input type="text" placeholder="•••" className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                         <button type="submit" disabled={isProcessing} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition flex items-center justify-center disabled:bg-green-400 disabled:cursor-wait">
                            {isProcessing ? (
                                <>
                                    <Icons.Spinner className="w-5 h-5 mr-2 animate-spin" />
                                    <span>جاري معالجة الدفع...</span>
                                </>
                            ) : (
                                `ادفع الآن ${amount.toFixed(2)} ريال`
                            )}
                        </button>
                    </footer>
                </form>
            </motion.div>
        </div>
    );
};


const PublicMenuPage: React.FC<{ branchId: string }> = ({ branchId }) => {
    const [branch, setBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        const fetchBranch = async () => {
            setLoading(true);
            try {
                const branchData = await db.get<Branch>('branches', branchId);
                setBranch(branchData || null);
            } catch (error) {
                console.error("Failed to fetch branch:", error);
                setBranch(null);
            } finally {
                setLoading(false);
            }
        };
        fetchBranch();
    }, [branchId]);
    
    // We can't use useAppContext here as this is a public page.
    // So we need a way to add an order.
    // A simplified addOrder function for the public page:
    const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
        const newOrder: Order = {
          ...orderData,
          id: `order-${Date.now()}`,
          createdAt: new Date(),
        };
        await db.add('orders', newOrder);
    };


    const updateQuantity = (itemId: string, newQuantity: number) => {
        setCart(currentCart => {
            const itemExists = currentCart.find(item => item.id === itemId);
            if (newQuantity <= 0) {
                return currentCart.filter(item => item.id !== itemId);
            }
            if (itemExists) {
                return currentCart.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
            } else {
                const itemToAdd = branch?.menu.flatMap(c => c.items).find(i => i.id === itemId);
                if (itemToAdd) {
                    return [...currentCart, { ...itemToAdd, quantity: newQuantity }];
                }
            }
            return currentCart;
        });
    };

    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handlePlaceOrder = async (paymentDetails?: { paymentId: string }) => {
        if (!tableNumber.trim()) { setError('الرجاء إدخال رقم الطاولة.'); return; }
        if (cart.length === 0) { setError('سلة التسوق فارغة!'); return; }
        // A guard to ensure branch data is loaded before placing an order.
        // This prevents potential race conditions and uses the verified branch ID from state.
        if (!branch) {
            setError('خطأ: معلومات الفرع غير متوفرة. لا يمكن إكمال الطلب.');
            return;
        }
        setError('');

        const newOrder: Omit<Order, 'id' | 'createdAt'> = {
            // FIX: Use branch.id from state instead of the branchId prop to avoid potential scoping issues.
            branchId: branch.id,
            tableNumber,
            items: cart.map(item => ({ itemId: item.id, name: item.name, quantity: item.quantity, price: item.price })),
            total: cartTotal,
            paymentMethod,
            status: paymentMethod === 'Online' ? 'Paid' : 'Pending',
            paymentId: paymentDetails?.paymentId,
        };

        try {
            await addOrder(newOrder);
            setOrderPlaced(true);
            setCart([]);
            setIsCartOpen(false);
            setShowPaymentModal(false);
            setTableNumber('');
        } catch (e) {
            console.error("Failed to place order:", e);
            setError('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
        }
    };
    
    const handleSubmitOrder = () => {
        if (!tableNumber.trim()) { setError('الرجاء إدخال رقم الطاولة.'); return; }
        if (cart.length === 0) { setError('سلة التسوق فارغة!'); return; }
        setError('');
        
        if (paymentMethod === 'Online') {
            setShowPaymentModal(true);
        } else {
            handlePlaceOrder();
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center">
            <Icons.Menu className="h-20 w-20 text-indigo-500 animate-pulse" />
            <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">جاري تحميل القائمة...</p>
        </div>
    );

    if (!branch) return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center text-center p-4">
            <Icons.Menu className="h-20 w-20 text-red-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">القائمة غير متوفرة</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">عذراً, لم نتمكن من العثور على قائمة الطعام لهذا الفرع.</p>
        </div>
    );
    
    if (orderPlaced) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center text-center p-4">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                <div className="bg-green-100 dark:bg-green-900/50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
                    <Icons.ShoppingCart className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">تم استلام طلبك بنجاح!</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">سيتم تحضير طلبك قريباً.</p>
                <button onClick={() => setOrderPlaced(false)} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
                    تقديم طلب جديد
                </button>
            </motion.div>
        </div>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24">
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">{branch.name}</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{branch.location}</p>
                </div>
            </header>
            <main className="container mx-auto px-4 md:px-8 py-10">
                {branch.menu.map(category => (
                    <div key={category.id} className="mb-12">
                        <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-200 dark:border-indigo-800 pb-3 mb-8">{category.name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {category.items.map(item => {
                                const cartItem = cart.find(ci => ci.id === item.id);
                                return (
                                <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 ${!item.isAvailable ? 'grayscale opacity-60' : ''}`}>
                                    <div className="relative">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-56 object-cover" />
                                        {!item.isAvailable && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="bg-gray-700 text-white font-bold py-1 px-4 rounded-full text-sm shadow-lg">غير متوفر حالياً</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                                            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{item.price} ريال</p>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 flex-grow mb-4">{item.description}</p>
                                        
                                        {item.isAvailable && (
                                            <div className="mt-auto">
                                                {!cartItem ? (
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition flex items-center justify-center">
                                                        <Icons.Add className="w-5 h-5 mr-2" />
                                                        أضف للسلة
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-center space-x-4">
                                                        <button onClick={() => updateQuantity(item.id, cartItem.quantity + 1)} className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition"><Icons.Plus /></button>
                                                        <span className="text-xl font-bold w-12 text-center">{cartItem.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, cartItem.quantity - 1)} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition"><Icons.Minus /></button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </main>
            {totalCartItems > 0 &&
                <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
                    <button onClick={() => setIsCartOpen(true)} className="flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
                        <Icons.ShoppingCart className="w-6 h-6 mr-3" />
                        <span>عرض السلة ({totalCartItems})</span>
                        <span className="mx-2">|</span>
                        <span>{cartTotal.toFixed(2)} ريال</span>
                    </button>
                </motion.div>
            }
            <AnimatePresence>
            {isCartOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-30 p-4" onClick={() => setIsCartOpen(false)}>
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween" }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">سلة التسوق</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Icons.X /></button>
                        </header>
                        <div className="flex-grow overflow-y-auto p-6">
                            {cart.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">سلة التسوق فارغة.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {cart.map(item => (
                                    <li key={item.id} className="flex items-center">
                                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                                        <div className="flex-grow">
                                            <h4 className="font-semibold">{item.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.price} ريال</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-gray-700 flex items-center justify-center hover:bg-indigo-200 dark:hover:bg-gray-600 transition"><Icons.Plus className="w-4 h-4" /></button>
                                            <span className="font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition"><Icons.Minus className="w-4 h-4" /></button>
                                        </div>
                                    </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <footer className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                             <div className="mb-4">
                                <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الطاولة *</label>
                                <input id="tableNumber" type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="مثال: T5 أو 12" className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">طريقة الدفع</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${paymentMethod === 'Cash' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600'}`}>
                                        <input type="radio" name="paymentMethod" value="Cash" checked={paymentMethod === 'Cash'} onChange={() => setPaymentMethod('Cash')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                        <span className="mr-3">الدفع عند الاستلام</span>
                                    </label>
                                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${paymentMethod === 'Online' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600'}`}>
                                        <input type="radio" name="paymentMethod" value="Online" checked={paymentMethod === 'Online'} onChange={() => setPaymentMethod('Online')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                        <span className="mr-3">الدفع عبر الإنترنت</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-4 text-lg">
                                <span className="font-medium text-gray-600 dark:text-gray-300">الإجمالي:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{cartTotal.toFixed(2)} ريال</span>
                            </div>
                            {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                            <button onClick={handleSubmitOrder} disabled={cart.length === 0 || !tableNumber.trim()} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                {paymentMethod === 'Online' ? 'المتابعة للدفع' : 'إرسال الطلب'}
                            </button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
            <AnimatePresence>
                {showPaymentModal && (
                    <PaymentModal 
                        amount={cartTotal}
                        onClose={() => setShowPaymentModal(false)}
                        onSuccess={(paymentId) => {
                            handlePlaceOrder({ paymentId });
                        }}
                    />
                )}
            </AnimatePresence>
             <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                <a href="#/about" className="hover:text-indigo-500 transition-colors">من نحن</a>
                <p className="mt-2">تم إنشاؤه بواسطة نظام إدارة القائمة</p>
            </footer>
        </div>
    );
};

const PublicAboutUsPage: React.FC = () => {
    const [aboutUsText, setAboutUsText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const setting = await db.get<Setting>('settings', 'aboutUs');
            setAboutUsText(setting?.value || 'لم يتم العثور على محتوى.');
            setLoading(false);
        };
        fetchSettings();
    }, []);

    if (loading) return <FullScreenLoader />;

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <header className="bg-white dark:bg-gray-800 shadow-md">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center">
                        <Icons.BookOpen className="w-8 h-8 text-indigo-500 ml-3" />
                        من نحن
                    </h1>
                     <a href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        العودة للقائمة
                    </a>
                </div>
            </header>
            <main className="container mx-auto px-4 md:px-8 py-10">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
                    <p className="text-gray-700 dark:text-gray-300 leading-loose whitespace-pre-wrap text-lg">
                        {aboutUsText}
                    </p>
                </div>
            </main>
             <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                <p>تم إنشاؤه بواسطة نظام إدارة القائمة</p>
            </footer>
        </div>
    );
};

const NotFoundPage: React.FC = () => (
    <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center text-center p-4">
        <Icons.Menu className="h-20 w-20 text-red-500 mb-4" />
        <h1 className="text-5xl font-extrabold text-gray-800 dark:text-white mb-3">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">الصفحة غير موجودة</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            عذراً, لم نتمكن من العثور على الصفحة التي تبحث عنها.
        </p>
        <a href="#" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
            العودة إلى الصفحة الرئيسية
        </a>
    </div>
);

export default App;