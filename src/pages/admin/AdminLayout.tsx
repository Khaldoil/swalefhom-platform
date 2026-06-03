import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, Camera, Book,
  LogOut, Settings, Award, UserCheck, Tag, FileText,
  Library, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin' },
    { icon: BookOpen, label: 'القصص', path: '/admin/stories' },
    { icon: Tag, label: 'التصنيفات', path: '/admin/categories' },
    { icon: Award, label: 'رواد التراث', path: '/admin/pioneers' },
    { icon: UserCheck, label: 'طلبات السفراء', path: '/admin/applications' },
    { icon: Camera, label: 'معرض الصور', path: '/admin/gallery' },
    { icon: FileText, label: 'المدونة', path: '/admin/blog' },
    { icon: Book, label: 'مسرد الألفاظ', path: '/admin/glossary' },
    { icon: Library, label: 'مكتبة الكتب', path: '/admin/books' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center py-6 px-4 border-b border-white/10">
        <img
          src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png"
          alt="سواليفهم"
          className="h-14"
        />
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FAC39B]/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-[#FAC39B]" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.email}</p>
            <p className="text-gray-500 text-xs">مدير النظام</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-[#FF9619] text-[#0F2837] font-medium shadow-lg shadow-[#FF9619]/20'
                    : 'text-gray-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`mr-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive(item.path) ? 'bg-[#0F2837]/30 text-[#0F2837]' : 'bg-[#FF9619]/20 text-[#FF9619]'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive(item.path) && (
                  <ChevronRight className="w-4 h-4 mr-auto flex-shrink-0" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link
          to="/admin/settings"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
            isActive('/admin/settings')
              ? 'bg-[#FF9619] text-[#0F2837] font-medium'
              : 'text-gray-300 hover:bg-white/8 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>الإعدادات</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F2837] flex" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex w-60 bg-[#0A1B26] flex-col border-l border-white/5 fixed top-0 bottom-0 right-0 z-30">
        <SidebarContent />
      </aside>

      {/* Sidebar — Mobile */}
      <aside className={`fixed top-0 right-0 bottom-0 w-64 bg-[#0A1B26] z-50 transform transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 left-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:mr-60 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0A1B26] border-b border-white/10 sticky top-0 z-20">
          <img
            src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png"
            alt="سواليفهم"
            className="h-8"
          />
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white p-2"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
