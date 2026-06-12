import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Rocket, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      setTimeout(() => {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const redirectMap: Record<string, string> = {
          child: '/child',
          parent: '/parent',
          teacher: '/teacher',
        };
        navigate(from || redirectMap[savedUser.role] || '/child');
      }, 100);
    } catch (err: any) {
      console.error('登录错误:', err);
      setError(err.response?.data?.error || err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (uname: string, pwd: string, role: string) => {
    setUsername(uname);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="text-white text-center md:text-left order-2 md:order-1">
          <div className="inline-block mb-6 animate-float">
            <div className="text-8xl">🚀</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            编程闯关乐园
          </h1>
          <p className="text-xl text-white/90 mb-6">
            小朋友，准备好开始你的编程冒险了吗？
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
              <div className="text-3xl mb-2">🧩</div>
              <div className="font-semibold">拖拽积木</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-semibold">星级挑战</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold">闯关成长</div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 justify-center md:justify-start">
            <Sparkles size={20} className="text-yellow-300" />
            <span className="text-white/80 text-sm">拖拽积木 · 学习编程 · 快乐成长</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 order-1 md:order-2">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <Rocket size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">欢迎回来！</h2>
            <p className="text-gray-500 mt-2">登录后开始你的冒险吧</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="请输入用户名"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? '登录中...' : '🚀 登录'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500 mb-3">快速体验（点击账号填充）</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => quickLogin('teacher1', '123456', 'teacher')}
                className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                👨‍🏫 老师
              </button>
              <button
                onClick={() => quickLogin('parent1', '123456', 'parent')}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                👨‍👩‍👧 家长
              </button>
              <button
                onClick={() => quickLogin('child1', '123456', 'child')}
                className="p-2 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors"
              >
                👶 孩子
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            还没有账号？{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
