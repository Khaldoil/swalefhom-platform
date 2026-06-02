import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Camera, 
  Book,
  LogOut, 
  Settings,
  Award,
  UserCheck,
  Tag,
  FileText,
  Library
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
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

  return (
    <div className="min-h-screen bg-[#0F2837] flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A1B26] text-white p-6 flex flex-col">
        <div className="flex items-center justify-center mb-8">
          <img 
            src="https://i.postimg.cc/N0RDmg7H/Artboard-56-copy-2x-8.png" 
            alt="سواليفهم" 
           className="h-16"
          />
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-[#FF9619] text-[#0F2837]'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 pt-4 space-y-2">
          <Link
            to="/admin/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/admin/settings'
                ? 'bg-[#FF9619] text-[#0F2837]'
                : 'hover:bg-white/10'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>الإعدادات</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}