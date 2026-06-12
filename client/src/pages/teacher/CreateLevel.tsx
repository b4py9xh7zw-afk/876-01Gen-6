import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, X, GripVertical, RotateCcw, Save,
  Lightbulb, AlertTriangle, CheckCircle2, ChevronRight
} from 'lucide-react';
import api from '../../api';

interface BlockDef {
  id: string;
  label: string;
  color: string;
}

const colorOptions = [
  '#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa',
  '#fb923c', '#ef4444', '#3b82f6', '#22c55e', '#8b5cf6',
];

const categoryOptions = [
  { value: 'logic', label: '逻辑基础', emoji: '🧩' },
  { value: 'loop', label: '循环结构', emoji: '🔁' },
  { value: 'condition', label: '条件判断', emoji: '🤔' },
  { value: 'project', label: '小项目', emoji: '🎯' },
];

export default function CreateLevel() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'logic',
    difficulty: 2,
    goal_description: '',
    order_matters: true,
  });
  const [blocks, setBlocks] = useState<BlockDef[]>([
    { id: 'move_forward', label: '⬆️ 前进', color: '#4ade80' },
    { id: 'turn_right', label: '➡️ 右转', color: '#60a5fa' },
  ]);
  const [newBlock, setNewBlock] = useState<BlockDef>({ id: '', label: '', color: '#4ade80' });
  const [sequence, setSequence] = useState<string[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [newHint, setNewHint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [draggingSeq, setDraggingSeq] = useState<number | null>(null);

  const addBlock = () => {
    if (!newBlock.id.trim() || !newBlock.label.trim()) return;
    setBlocks([...blocks, { ...newBlock, id: newBlock.id.trim() }]);
    setNewBlock({ id: '', label: '', color: newBlock.color });
  };

  const removeBlock = (idx: number) => {
    const blockId = blocks[idx].id;
    setBlocks(blocks.filter((_, i) => i !== idx));
    setSequence(sequence.filter((id) => id !== blockId));
  };

  const addToSequence = (blockId: string) => {
    setSequence([...sequence, blockId]);
  };

  const removeFromSequence = (idx: number) => {
    setSequence(sequence.filter((_, i) => i !== idx));
  };

  const clearSequence = () => setSequence([]);

  const moveSeqItem = (fromIdx: number, toIdx: number) => {
    const newSeq = [...sequence];
    const [removed] = newSeq.splice(fromIdx, 1);
    newSeq.splice(toIdx, 0, removed);
    setSequence(newSeq);
  };

  const handleSeqDragStart = (idx: number) => setDraggingSeq(idx);
  const handleSeqDragEnd = () => setDraggingSeq(null);
  const handleSeqDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleSeqDrop = (toIdx: number) => {
    if (draggingSeq !== null && draggingSeq !== toIdx) {
      moveSeqItem(draggingSeq, toIdx);
    }
    setDraggingSeq(null);
  };

  const addHint = () => {
    if (!newHint.trim()) return;
    setHints([...hints, newHint.trim()]);
    setNewHint('');
  };

  const removeHint = (idx: number) => {
    setHints(hints.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!form.title.trim()) errors.push('请输入关卡标题');
    if (!form.description.trim()) errors.push('请输入关卡描述');
    if (!form.goal_description.trim()) errors.push('请输入关卡目标');
    if (blocks.length === 0) errors.push('请至少添加一个可用积木');
    if (sequence.length === 0) errors.push('请设置正确答案的积木顺序');

    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors[0] });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/levels', {
        ...form,
        blocks_available: blocks,
        expected_blocks: sequence,
        hints: hints.length > 0 ? hints : null,
      });
      setMessage({ type: 'success', text: '关卡创建成功！' });
      setTimeout(() => navigate('/teacher'), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || '创建失败' });
    } finally {
      setSubmitting(false);
    }
  };

  const getBlockInfo = (id: string) => blocks.find((b) => b.id === id);

  return (
    <div className="space-y-6 pb-10">
      {message && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-pop ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BookOpen size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">创建新关卡</h1>
              <p className="text-gray-500 mt-1">设计一个有趣的编程挑战吧</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">🎯 关卡标题</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="例如：第一关：初识积木"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">📂 关卡分类</label>
              <div className="grid grid-cols-4 gap-2">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      form.category === cat.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className={`text-xs font-medium ${form.category === cat.value ? 'text-blue-700' : 'text-gray-600'}`}>
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">📝 关卡描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
              placeholder="简单介绍这个关卡要学习什么内容..."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">⭐ 难度等级</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, difficulty: n })}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all text-2xl ${
                      form.difficulty >= n
                        ? 'border-yellow-400 bg-yellow-50 scale-105'
                        : 'border-gray-100 opacity-40 hover:opacity-60'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">🔀 顺序是否重要</label>
              <div className="flex gap-3 h-[52px] items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.order_matters}
                    onChange={() => setForm({ ...form, order_matters: true })}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="font-medium text-gray-700">重要（按顺序执行）</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!form.order_matters}
                    onChange={() => setForm({ ...form, order_matters: false })}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="font-medium text-gray-700">不重要（只要积木都用到）</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100">
            <label className="block text-sm font-bold text-blue-800 mb-2">🎯 本关目标</label>
            <textarea
              value={form.goal_description}
              onChange={(e) => setForm({ ...form, goal_description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none transition-colors resize-none bg-white"
              placeholder="描述孩子需要完成什么任务，例如：让小猫咪向前走3步到达终点！"
            />
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <span className="text-2xl">🧱</span>
          可用积木库
        </h2>

        <div className="grid md:grid-cols-3 gap-4 mb-5 p-4 rounded-2xl bg-gray-50">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">积木ID</label>
            <input
              type="text"
              value={newBlock.id}
              onChange={(e) => setNewBlock({ ...newBlock, id: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm"
              placeholder="如: move_forward"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">显示名称</label>
            <input
              type="text"
              value={newBlock.label}
              onChange={(e) => setNewBlock({ ...newBlock, label: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm"
              placeholder="如: ⬆️ 前进"
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-2">颜色</label>
              <div className="flex gap-1.5 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewBlock({ ...newBlock, color: c })}
                    className={`w-7 h-7 rounded-lg transition-all ${newBlock.color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={addBlock}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              添加
            </button>
          </div>
        </div>

        {blocks.length > 0 && (
          <div className="mb-6">
            <div className="text-sm font-bold text-gray-600 mb-3">已添加的积木（点击添加到答案）</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {blocks.map((b, idx) => (
                <div
                  key={b.id}
                  className="group relative"
                >
                  <button
                    type="button"
                    onClick={() => addToSequence(b.id)}
                    className="w-full px-4 py-3 rounded-xl text-white font-semibold shadow-md flex items-center gap-2 hover:scale-[1.02] transition-transform"
                    style={{ backgroundColor: b.color }}
                  >
                    <span className="flex-1 text-left text-sm truncate">{b.label}</span>
                    <Plus size={16} className="opacity-70 group-hover:opacity-100" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(idx)}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-5 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-600" />
                正确答案（积木顺序）
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                按从上到下的顺序排列，代表正确的解题步骤 {form.order_matters ? '(顺序敏感)' : '(顺序不敏感)'}
              </p>
            </div>
            {sequence.length > 0 && (
              <button
                type="button"
                onClick={clearSequence}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded-lg"
              >
                <RotateCcw size={14} />
                清空答案
              </button>
            )}
          </div>

          {sequence.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-5xl mb-3">📥</div>
              <p>点击上方积木添加到正确答案中</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sequence.map((blockId, idx) => {
                const info = getBlockInfo(blockId);
                return (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => handleSeqDragStart(idx)}
                    onDragEnd={handleSeqDragEnd}
                    onDragOver={handleSeqDragOver}
                    onDrop={() => handleSeqDrop(idx)}
                    className={`flex items-center gap-3 group ${draggingSeq === idx ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-gray-600 text-sm font-bold border-2 border-gray-200 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <GripVertical size={18} className="text-gray-400 flex-shrink-0" />
                    <div
                      className="flex-1 px-4 py-3 rounded-xl text-white font-semibold shadow-sm flex items-center gap-3"
                      style={{ backgroundColor: info?.color || '#888' }}
                    >
                      <span className="flex-1">{info?.label || blockId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromSequence(idx)}
                      className="w-9 h-9 rounded-xl hover:bg-red-100 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Lightbulb size={22} className="text-yellow-500" />
          提示系统（可选）
          <span className="text-sm font-normal text-gray-500 ml-auto">
            已添加 {hints.length} 条提示
          </span>
        </h2>

        <div className="flex gap-3 mb-5">
          <input
            type="text"
            value={newHint}
            onChange={(e) => setNewHint(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHint())}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:outline-none transition-colors"
            placeholder="输入一条提示，按回车添加..."
          />
          <button
            type="button"
            onClick={addHint}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold flex items-center gap-1 hover:opacity-90 transition-opacity shadow-md"
          >
            <Plus size={18} />
            添加提示
          </button>
        </div>

        {hints.length > 0 && (
          <div className="space-y-2">
            {hints.map((hint, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-100"
              >
                <div className="w-8 h-8 rounded-lg bg-yellow-400 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 text-yellow-900">{hint}</div>
                <button
                  type="button"
                  onClick={() => removeHint(idx)}
                  className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-6 flex justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-3 flex gap-3 border-2 border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/teacher')}
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg flex items-center gap-2"
          >
            <Save size={18} />
            {submitting ? '保存中...' : '创建关卡'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
