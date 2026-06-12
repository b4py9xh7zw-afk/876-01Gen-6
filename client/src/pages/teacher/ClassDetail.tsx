import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, BookOpen, Plus, X, UserPlus, Trash2,
  ChevronRight, Trophy, Star, AlertTriangle, CheckCircle2
} from 'lucide-react';
import api from '../../api';
import { Level, Student } from '../../types';
import StarRating from '../../components/StarRating';

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignedLevels, setAssignedLevels] = useState<any[]>([]);
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAssignLevel, setShowAssignLevel] = useState(false);
  const [newStudents, setNewStudents] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [classRes, levelsRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get('/levels'),
      ]);
      setClassInfo(classRes.data.class);
      setStudents(classRes.data.students);
      setAssignedLevels(classRes.data.assignedLevels);
      setAllLevels(levelsRes.data.levels);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    const usernames = newStudents.split(/[,，\s\n]+/).filter(Boolean);
    if (usernames.length === 0) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/classes/${id}/students`, { studentUsernames: usernames });
      setMessage({
        type: res.data.added.length > 0 ? 'success' : 'error',
        text: `成功添加 ${res.data.added.length} 名学生${res.data.errors.length > 0 ? `，${res.data.errors.length} 名失败` : ''}`,
      });
      setNewStudents('');
      setShowAddStudent(false);
      loadData();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || '操作失败' });
    } finally {
      setSubmitting(false);
    }
  };

  const removeStudent = async (studentId: number, name: string) => {
    if (!confirm(`确定要将 ${name} 移出班级吗？`)) return;
    try {
      await api.delete(`/classes/${id}/students/${studentId}`);
      loadData();
      setMessage({ type: 'success', text: '已移出班级' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || '操作失败' });
    }
  };

  const assignLevels = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLevels.length === 0) return;

    setSubmitting(true);
    try {
      await api.post(`/classes/${id}/levels`, {
        levelIds: selectedLevels,
        dueDate: dueDate || undefined,
      });
      setSelectedLevels([]);
      setDueDate('');
      setShowAssignLevel(false);
      loadData();
      setMessage({ type: 'success', text: `成功布置 ${selectedLevels.length} 个关卡` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || '操作失败' });
    } finally {
      setSubmitting(false);
    }
  };

  const removeLevel = async (levelId: number, title: string) => {
    if (!confirm(`确定要移除关卡"${title}"吗？`)) return;
    try {
      await api.delete(`/classes/${id}/levels/${levelId}`);
      loadData();
      setMessage({ type: 'success', text: '已移除关卡' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || '操作失败' });
    }
  };

  const toggleLevel = (levelId: number) => {
    setSelectedLevels((prev) =>
      prev.includes(levelId)
        ? prev.filter((id) => id !== levelId)
        : [...prev, levelId]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="text-center py-20 text-white">
        <div className="text-6xl mb-4">😵</div>
        <p className="text-xl mb-4">班级不存在</p>
        <Link to="/teacher" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-bold">
          返回班级列表
        </Link>
      </div>
    );
  }

  const unassignedLevels = allLevels.filter(
    (l) => !assignedLevels.some((al) => al.id === l.id)
  );

  const categoryLabels: Record<string, { label: string; emoji: string; color: string }> = {
    logic: { label: '逻辑', emoji: '🧩', color: 'bg-green-100 text-green-700' },
    loop: { label: '循环', emoji: '🔁', color: 'bg-orange-100 text-orange-700' },
    condition: { label: '条件', emoji: '🤔', color: 'bg-blue-100 text-blue-700' },
    project: { label: '项目', emoji: '🎯', color: 'bg-purple-100 text-purple-700' },
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-pop ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/teacher')}
            className="flex items-center gap-2 text-white hover:text-white/80 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
            <span>班级列表</span>
          </button>
        </div>
        <button
          onClick={() => navigate(`/teacher/class/${id}/analytics`)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
        >
          📊 查看数据分析
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{classInfo.name}</h1>
              <p className="text-gray-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><Users size={14} /> {students.length} 名学生</span>
                <span>·</span>
                <span className="flex items-center gap-1"><BookOpen size={14} /> {assignedLevels.length} 个关卡</span>
                <span>·</span>
                <span>创建于 {new Date(classInfo.created_at).toLocaleDateString('zh-CN')}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border-2 border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} />
                学生列表
              </h2>
              <button
                onClick={() => setShowAddStudent(true)}
                className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-blue-50 transition-colors"
              >
                <UserPlus size={16} />
                添加学生
              </button>
            </div>

            {students.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <div className="text-5xl mb-3">👨‍🎓</div>
                <p>还没有学生，点击右上角添加</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto scrollbar-hide">
                {students.map((s) => (
                  <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">
                        {s.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{s.name}</div>
                        <div className="text-xs text-gray-500">@{s.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm text-gray-500">通关</div>
                        <div className="font-bold text-indigo-600">{s.completed_levels || 0} 关</div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-sm text-gray-500">星星</div>
                        <div className="flex items-center justify-end gap-1">
                          <StarRating stars={Math.min(3, Math.round((s.total_stars || 0) / Math.max(1, s.completed_levels || 1)))} size={14} />
                          <span className="font-bold text-yellow-600 text-sm">{s.total_stars || 0}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStudent(s.id, s.name)}
                        className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border-2 border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen size={20} />
                已布置关卡
              </h2>
              <button
                onClick={() => setShowAssignLevel(true)}
                className="bg-white text-purple-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-purple-50 transition-colors"
              >
                <Plus size={16} />
                布置关卡
              </button>
            </div>

            {assignedLevels.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <div className="text-5xl mb-3">📚</div>
                <p>还没有布置关卡，点击右上角添加</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto scrollbar-hide">
                {assignedLevels.map((level) => {
                  const cat = categoryLabels[level.category];
                  return (
                    <div key={level.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${cat?.color || 'bg-gray-100'}`}>
                          {cat?.emoji || '📦'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{level.title}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full ${cat?.color || ''}`}>
                              {cat?.label}
                            </span>
                            <span>难度 {'⭐'.repeat(level.difficulty)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeLevel(level.id, level.title)}
                        className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddStudent(false)}>
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <UserPlus size={22} className="text-blue-500" />
                添加学生
              </h3>
              <button
                onClick={() => setShowAddStudent(false)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={addStudents}>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学生用户名
                </label>
                <textarea
                  value={newStudents}
                  onChange={(e) => setNewStudents(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="输入用户名，支持多个，用逗号或换行分隔&#10;例如：child1, child2, child3"
                  autoFocus
                />
              </div>
              <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="text-sm text-blue-800 font-medium mb-1">💡 提示</div>
                <div className="text-xs text-blue-700">
                  请确保学生已经注册了账号，使用他们的"用户名"添加到班级
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newStudents.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
                >
                  {submitting ? '添加中...' : '确认添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignLevel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAssignLevel(false)}>
          <div className="bg-white rounded-3xl p-7 max-w-2xl w-full shadow-2xl animate-pop max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen size={22} className="text-purple-500" />
                布置关卡
              </h3>
              <button
                onClick={() => setShowAssignLevel(false)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={assignLevels} className="flex flex-col flex-1 overflow-hidden">
              <div className="mb-4 flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  截止日期（可选）
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-2 flex-shrink-0 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  选择关卡 {selectedLevels.length > 0 && <span className="text-purple-600">（已选 {selectedLevels.length}）</span>}
                </label>
              </div>

              <div className="mb-4 flex-1 overflow-y-auto scrollbar-hide border-2 border-gray-100 rounded-xl p-3 space-y-2">
                {unassignedLevels.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-sm">所有关卡都已布置到这个班级</p>
                  </div>
                ) : (
                  unassignedLevels.map((level) => {
                    const cat = categoryLabels[level.category];
                    const isSelected = selectedLevels.includes(level.id);
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => toggleLevel(level.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cat?.color || 'bg-gray-100'}`}>
                          {cat?.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-sm truncate">{level.title}</div>
                          <div className="text-xs text-gray-500">
                            {cat?.label} · 难度 {'⭐'.repeat(level.difficulty)}
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && '✓'}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="flex gap-3 flex-shrink-0 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignLevel(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedLevels.length === 0}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg flex items-center justify-center gap-1"
                >
                  <Trophy size={18} />
                  {submitting ? '布置中...' : `布置 ${selectedLevels.length} 个关卡`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
