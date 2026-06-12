import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, UserPlus, Baby, Users, GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'child' as 'child' | 'parent' | 'teacher',
    parentCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (form.password.length < 6) {
      setError('密码至少需要6位');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username,
        password: form.password,
        name: form.name,
        role: form.role,
        parentCode: form.parentCode || undefined,
      });
      const redirectMap: Record<string, string> = {
        child: '/child',
        parent: '/parent',
        teacher: '/teacher',
      };
      navigate(redirectMap[form.role]);
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'child', label: '小朋友', icon: Baby, color: 'pink', desc: '学习编程闯关' },
    { value: 'parent', label: '家长', icon: Users, color: 'emerald', desc: '查看孩子进度' },
    { value: 'teacher', label: '老师', icon: GraduationCap, color: 'blue', desc: '管理班级教学' },
  ];

  const roleColorMap: Record<string, string> = {
    pink: 'from-pink-400 to-rose-500 border-pink-400',
    emerald: 'from-emerald-400 to-teal-500 border-emerald-400',
    blue: 'from-blue-400 to-indigo-500 border-blue-400',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 mb-4">
            <UserPlus size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">加入编程乐园！</h2>
          <p className="text-gray-500 mt-2">创建账号开始你的编程之旅</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">我是...</label>
          <div className="grid grid-cols-3 gap-3">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = form.role === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() => setForm({ ...form, role: r.value as any })}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${roleColorMap[r.color]} text-white border-transparent shadow-lg scale-105`
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={28} className="mx-auto mb-2" />
                  <div className={`font-semibold ${isActive ? '' : 'text-gray-700'}`}>{r.label}</div>
                  <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {r.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                placeholder="你的名字"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="登录用的账号"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="至少6位"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">确认密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="再输一次"
                  required
                />
              </div>
            </div>
          </div>

          {form.role === 'child' && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                👨‍👩‍👧 家长关联码（可选）
              </label>
              <input
                type="text"
                value={form.parentCode}
                onChange={(e) => setForm({ ...form, parentCode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none bg-white"
                placeholder="填写家长的用户名，可以让家长看到你的进度"
              />
              <p className="text-xs text-blue-700 mt-2">
                💡 问问爸爸妈妈他们的用户名是什么吧！
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? '注册中...' : '🎉 创建账号'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          已有账号？{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
