import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, Camera, Book,
  LogOut, Settings, Award, UserCheck, Tag, FileText,
  Library, Menu, X, ChevronRight, Bell, Check, Trash2,
  Clock, BookMarked, MessageCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useAdminNotifications();

  /* Close notif dropdown on outside click */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin' },
    { icon: BookOpen,        label: 'القصص',        path: '/admin/stories' },
    { icon: Tag,             label: 'التصنيفات',    path: '/admin/categories' },
    { icon: Award,           label: 'رواد التراث',  path: '/admin/pioneers' },
    { icon: UserCheck,       label: 'طلبات السفراء', path: '/admin/applications' },
    { icon: Camera,          label: 'معرض الصور',   path: '/admin/gallery' },
    { icon: FileText,        label: 'المدونة',       path: '/admin/blog' },
    { icon: BookMarked,      label: 'مسرد الألفاظ', path: '/admin/glossary' },
    { icon: Library,         label: 'مكتبة الكتب',  path: '/admin/books' },
    { icon: MessageCircle,   label: 'التعليقات',    path: '/admin/comments' },
  ];

  const handleLogout = async () => {
    await signOut().catch(console.error);
    navigate('/admin/login');
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  /* Format timestamp */
  const fmtTime = (d: Date) => {
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return 'الآن';
    if (diff < 3_600_000) return `منذ ${Math.floor(diff / 60_000)} د`;
    return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center py-5 px-4 border-b border-white/8">
        <img src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" alt="سواليفهم" className="h-12" />
      </div>

      {/* User chip */}
      <div className="px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FAC39B]/15 flex items-center justify-center flex-shrink-0">
            <Users className="w-3.5 h-3.5 text-[#FAC39B]" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.email}</p>
            <p className="text-gray-600 text-xs">مدير النظام</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2.5 overflow-y-auto">
        <ul className="space-y-0.5">
          {menuItems.map(item => (
            <li key={item.path}>
              <Link to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  isActive(item.path)
                    ? 'bg-[#FF9619] text-[#0F2837] font-semibold shadow-lg shadow-[#FF9619]/15'
                    : 'text-gray-400 hover:bg-white/6 hover:text-white'
                }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive(item.path) && <ChevronRight className="w-3.5 h-3.5 mr-auto flex-shrink-0" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/8 p-2.5 space-y-0.5">
        <Link to="/admin/settings" onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
            isActive('/admin/settings')
              ? 'bg-[#FF9619] text-[#0F2837] font-semibold'
              : 'text-gray-400 hover:bg-white/6 hover:text-white'
          }`}>
          <Settings className="w-4 h-4" /><span>الإعدادات</span>
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/8 transition-all text-sm">
          <LogOut className="w-4 h-4" /><span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F2837] flex" dir="rtl">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-56 bg-[#0A1B26] flex-col border-l border-white/5 fixed top-0 bottom-0 right-0 z-30">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      <aside className={`fixed top-0 right-0 bottom-0 w-64 bg-[#0A1B26] z-50 transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={() => setSidebarOpen(false)} className="absolute top-4 left-4 text-gray-500 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 lg:mr-56 min-h-screen flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0A1B26]/95 backdrop-blur-sm border-b border-white/8 px-4 lg:px-6 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white p-1">
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title from location */}
          <div className="hidden lg:block">
            <p className="text-gray-400 text-xs">
              {menuItems.find(m => isActive(m.path))?.label ?? 'الإعدادات'}
            </p>
          </div>

          {/* Notifications */}
          <div className="relative mr-auto lg:mr-0" ref={notifRef}>
            <button onClick={() => { setNotifOpen(p => !p); if (!notifOpen) markAllRead(); }}
              className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {notifOpen && (
              <div className="absolute left-0 top-12 w-80 bg-[#0A1B26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                  <h3 className="text-white text-sm font-semibold">الإشعارات</h3>
                  <div className="flex gap-2">
                    {notifications.length > 0 && (
                      <>
                        <button onClick={markAllRead} className="text-xs text-gray-500 hover:text-[#FAC39B] transition-colors flex items-center gap-1">
                          <Check className="w-3 h-3" />قراءة الكل
                        </button>
                        <button onClick={clearAll} className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1">
                          <Trash2 className="w-3 h-3" />مسح
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10">
                      <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                      <p className="text-gray-600 text-xs">لا توجد إشعارات</p>
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id}
                      onClick={() => { markRead(n.id); setNotifOpen(false); if (n.link) navigate(n.link); }}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/4 ${!n.read ? 'bg-white/3' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        n.type === 'story' ? 'bg-[#FAC39B]/15' : 'bg-[#91B9B4]/15'
                      }`}>
                        {n.type === 'story'
                          ? <BookOpen className="w-4 h-4 text-[#FAC39B]" />
                          : <UserCheck className="w-4 h-4 text-[#91B9B4]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium mb-0.5 ${!n.read ? 'text-white' : 'text-gray-300'}`}>{n.title}</p>
                        <p className="text-xs text-gray-500 truncate">{n.body}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-2.5 h-2.5 text-gray-600" />
                          <span className="text-xs text-gray-600">{fmtTime(n.timestamp)}</span>
                        </div>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-[#FAC39B] mt-2 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-5 lg:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
