import React, { useState } from 'react';
import { Task, TaskInstance, KidProfile, TaskFrequency } from '../types';
import { Plus, Edit2, Trash2, X, User as UserIcon, Star, Calendar, Smile, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';

interface Props {
  kids: KidProfile[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  taskInstances: TaskInstance[];
  setTaskInstances: React.Dispatch<React.SetStateAction<TaskInstance[]>>;
}

export function ParentTaskManager({ kids, tasks, setTasks, taskInstances, setTaskInstances }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(10);
  const [frequency, setFrequency] = useState<TaskFrequency>('daily');
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [icon, setIcon] = useState('📝');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState('');

  const openForm = (task?: Task) => {
    if (task) {
      setEditingId(task.id);
      setTitle(task.title);
      setDescription(task.description);
      setPoints(task.points);
      setFrequency(task.frequency);
      setTimesPerDay(task.timesPerDay || 1);
      setAssignedTo(task.assignedTo || []);
      setIcon(task.icon || '📝');
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setPoints(10);
      setFrequency('daily');
      setTimesPerDay(1);
      setAssignedTo(kids.length > 0 ? [kids[0].id] : []);
      setIcon('📝');
    }
    setError('');
    setShowEmojiPicker(false);
    setIsFormOpen(true);
  };

  const toggleAssignee = (kidId: string) => {
    setAssignedTo(prev => 
      prev.includes(kidId) 
        ? prev.filter(id => id !== kidId)
        : [...prev, kidId]
    );
  };

  const handleSave = () => {
    if (!title.trim()) { setError('El título es requerido'); return; }
    if (points <= 0) { setError('Los puntos deben ser mayores a 0'); return; }
    if (assignedTo.length === 0) { setError('Debes asignar la tarea a al menos un niño'); return; }

    const taskId = editingId || Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const newTask: Task = {
      id: taskId,
      title,
      description,
      points,
      frequency,
      timesPerDay: frequency === 'daily' ? timesPerDay : 1,
      assignedTo,
      icon,
      createdAt: editingId ? tasks.find(t => t.id === editingId)?.createdAt || now : now,
    };

    if (editingId) {
      setTasks(tasks.map(t => t.id === editingId ? newTask : t));
      
      // Update instances: remove unassigned, add newly assigned
      const existingInstances = taskInstances.filter(i => i.taskId === taskId);
      const instancesToKeep = existingInstances.filter(i => assignedTo.includes(i.childId));
      
      const newInstances = assignedTo
        .filter(kidId => !existingInstances.some(i => i.childId === kidId))
        .map(kidId => ({
          id: `${taskId}_${kidId}_${Date.now()}`,
          taskId,
          childId: kidId,
          status: 'pending' as const,
          date: now
        }));

      setTaskInstances([
        ...taskInstances.filter(i => i.taskId !== taskId), // Remove all old
        ...instancesToKeep, // Add back kept
        ...newInstances // Add new
      ]);

    } else {
      setTasks([...tasks, newTask]);
      
      // Create instances for each assigned child
      const newInstances: TaskInstance[] = assignedTo.map(kidId => ({
        id: `${taskId}_${kidId}_${Date.now()}`,
        taskId,
        childId: kidId,
        status: 'pending',
        date: now
      }));
      
      setTaskInstances([...taskInstances, ...newInstances]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    setTaskInstances(taskInstances.filter(i => i.taskId !== id));
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setIcon(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (isFormOpen) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-left relative pb-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{editingId ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button onClick={() => setIsFormOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm font-bold">{error}</div>}

        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <label className="block text-sm font-bold text-slate-700 mb-3">Icono</label>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(true)}
              className="w-16 h-16 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-3xl hover:border-indigo-400 transition-colors"
            >
              {icon}
            </button>
            
            <AnimatePresence>
              {showEmojiPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-white flex flex-col"
                  >
                    <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-100">
                      <span className="font-bold text-slate-700">Elige un icono</span>
                      <button type="button" onClick={() => setShowEmojiPicker(false)} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick}
                      theme={Theme.LIGHT}
                      searchPlaceHolder="Buscar emoji..."
                      width={320}
                      height={400}
                    />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 space-y-3">
            <label className="block text-sm font-bold text-slate-700">Título</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-400 outline-none transition-colors h-16" placeholder="Ej. Ordenar el cuarto" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700">Descripción (opcional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-400 outline-none transition-colors" placeholder="Detalles de la tarea..." rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">Puntos</label>
            <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-400 outline-none transition-colors" min="1" />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">Frecuencia</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value as TaskFrequency)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-400 outline-none transition-colors">
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="once">Una vez</option>
            </select>
          </div>
        </div>

        {frequency === 'daily' && (
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">Veces por día</label>
            <input type="number" value={timesPerDay} onChange={e => setTimesPerDay(Math.max(1, Number(e.target.value)))} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-400 outline-none transition-colors" min="1" max="10" />
            <p className="text-xs text-slate-500 font-medium">¿Cuántas veces al día debe completarse esta tarea?</p>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700">Asignar a</label>
          <div className="flex flex-col gap-2">
            {kids.map(kid => {
              const isAssigned = assignedTo.includes(kid.id);
              return (
                <button 
                  key={kid.id} 
                  onClick={() => toggleAssignee(kid.id)} 
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 font-bold transition-colors ${isAssigned ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{kid.avatar}</div>
                    <span>{kid.name}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isAssigned ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300'}`}>
                    {isAssigned && <Check className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleSave} className="w-full py-4 mt-6 bg-indigo-600 text-white font-bold rounded-2xl text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
          Guardar Tarea
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Tareas Asignadas</h2>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-200 transition-colors">
          <Plus className="w-5 h-5" /> Nueva
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-bold">No hay tareas creadas</p>
          <p className="text-sm text-slate-400 mt-1">¡Agrega una para empezar!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => {
            const assignedKids = kids.filter(k => task.assignedTo?.includes(k.id));
            return (
              <motion.div key={task.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-100 flex-shrink-0">
                    {task.icon || '📝'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{task.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm font-semibold">
                      <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-amber-500" /> {task.points}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                        <UserIcon className="w-3 h-3" /> 
                        {assignedKids.length === 1 ? assignedKids[0].name : `${assignedKids.length} niños`}
                      </span>
                      <span className="text-slate-400 capitalize">
                        {task.frequency === 'daily' ? 'Diaria' : task.frequency === 'weekly' ? 'Semanal' : 'Una vez'}
                        {task.frequency === 'daily' && task.timesPerDay && task.timesPerDay > 1 ? ` (${task.timesPerDay}x)` : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => openForm(task)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
