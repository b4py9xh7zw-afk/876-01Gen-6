import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, BarChart3, Users, BookOpen } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (user?.role === 'child') {
      return [
        { path: '/child', label: '关卡', icon: BookOpen },
      ];
    }
    if (user?.role === 'parent') {
      return [
        { path: '/parent', label: '孩子进度', icon: BarChart3 },
      ];
    }
    if (user?.role === 'teacher') {
      return [
        { path: '/teacher', label: '班级管理', icon: Users },
        { path: '/teacher/create-level', label: '创建关卡', icon: BookOpen },
      ];
    }
    return [];
  };

  const navItems = getNavItems();
  const roleColors: Record<string, string> = {
    child: 'from-pink-400 to-rose-500',
    parent: 'from-emerald-400 to-teal-500',
    teacher: 'from-blue-400 to-indigo-500',
  };
  const roleLabels: Record<string, string> = {
    child: '👶 小朋友',
    parent: '👨‍👩‍👧 家长',
    teacher: '👨‍🏫 老师',
  };

  return (
    <div className="min-h-screen">
      <nav className={`bg-gradient-to-r ${roleColors[user?.role || 'child']} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const redirectMap: Record<string, string> = {
                    child: '/child',
                    parent: '/parent',
                    teacher: '/teacher',
                  };
                  navigate(redirectMap[user?.role || 'child']);
                }}
                className="flex items-center gap-2 text-white"
              >
                <Home size={24} />
                <span className="text-xl font-bold">🚀 编程闯关乐园</span>
              </button>

              <div className="hidden md:flex items-center gap-2 ml-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-white/25 text-white font-semibold'
                          : 'text-white/80 hover:bg-white/15 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-white text-sm hidden sm:block">
                <span className="opacity-80">{roleLabels[user?.role || 'child']}</span>
                <span className="mx-2">·</span>
                <span className="font-semibold">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:bg-white/15 hover:text-white transition-all"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">退出</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden flex overflow-x-auto bg-white/10 backdrop-blur-sm px-4 py-2 gap-2 border-b border-white/20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white/25 text-white font-semibold'
                  : 'text-white/80 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
