import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, GraduationCap, Star, Trophy, ChevronRight,
  BookOpen, TrendingUp, AlertTriangle, X
} from 'lucide-react';
import api from '../../api';
import { Class } from '../../types';
import StarRating from '../../components/StarRating';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.classes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      setError('请输入班级名称');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/classes', { name: newClassName.trim() });
      setShowCreateModal(false);
      setNewClassName('');
      navigate(`/teacher/class/${res.data.classId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const totalStudents = classes.reduce((sum, c: any) => sum + (c.student_count || 0), 0);
  const totalLevels = classes.reduce((sum, c: any) => sum + (c.level_count || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <GraduationCap className="text-blue-200" />
              欢迎，老师！
            </h1>
            <p className="text-white/90">管理班级、布置作业、跟踪学生学习进度</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
          >
            <Plus size={20} />
            创建班级
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-4">
            <div className="text-3xl font-bold">{classes.length}</div>
            <div className="text-xs text-white/80 flex items-center gap-1 mt-1">
              <Users size={14} /> 班级数量
            </div>
          </div>
          <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-4">
            <div className="text-3xl font-bold">{totalStudents}</div>
            <div className="text-xs text-white/80 flex items-center gap-1 mt-1">
              <GraduationCap size={14} /> 学生总数
            </div>
          </div>
          <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-4">
            <div className="text-3xl font-bold">{totalLevels}</div>
            <div className="text-xs text-white/80 flex items-center gap-1 mt-1">
              <BookOpen size={14} /> 已布置关卡
            </div>
          </div>
          <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-4">
            <div className="text-3xl font-bold flex items-center gap-1">
              <Star size={28} className="fill-yellow-300 text-yellow-300" />
            </div>
            <div className="text-xs text-white/80 flex items-center gap-1 mt-1">
              <TrendingUp size={14} /> 教学平台
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users size={22} />
          我的班级
        </h2>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
            <GraduationCap size={48} className="text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">还没有创建班级</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
            创建第一个班级，邀请学生加入，开始布置编程闯关作业吧！
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            <Plus size={20} />
            创建第一个班级
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls: any) => (
            <button
              key={cls.id}
              onClick={() => navigate(`/teacher/class/${cls.id}`)}
              className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <Users size={28} />
                </div>
                <ChevronRight
                  size={24}
                  className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
                {cls.name}
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-600">{cls.student_count || 0}</div>
                  <div className="text-xs text-gray-500">学生</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">{cls.level_count || 0}</div>
                  <div className="text-xs text-gray-500">关卡</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-1">
                  创建于 {new Date(cls.created_at).toLocaleDateString('zh-CN')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/teacher/class/${cls.id}/analytics`);
                  }}
                  className="text-blue-600 font-semibold hover:underline underline-offset-4 flex items-center gap-1"
                >
                  <TrendingUp size={16} />
                  数据分析
                </button>
              </div>
            </button>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Plus size={24} className="text-blue-500" />
                创建新班级
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={createClass}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  班级名称
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="例如：编程启蒙班 2024"
                  autoFocus
                />
              </div>

              {error && (
                <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
                >
                  {creating ? '创建中...' : '创建班级'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
