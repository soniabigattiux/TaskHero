import React, { useState } from 'react';
import { Task, TaskInstance, KidProfile, User, TaskHistory } from '../types';
import { CheckCircle, Star, Clock, Sparkles, ShieldCheck, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Confetti } from './Confetti';
import { KidReminder } from './KidReminder';
import { playPopSound } from '../utils/sounds';

interface Props {
  user: KidProfile;
  users: User[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  taskInstances: TaskInstance[];
  setTaskInstances: React.Dispatch<React.SetStateAction<TaskInstance[]>>;
  taskHistory?: TaskHistory[];
}

export function KidTaskManager({ user, users, tasks, setTasks, taskInstances, setTaskInstances, taskHistory = [] }: Props) {
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const myInstances = taskInstances.filter(i => i.childId === user.id);
  const pendingInstances = myInstances.filter(i => i.status === 'pending' || i.status === 'rejected');
  
  // Under review tasks (completed but not yet approved)
  const underReviewInstances = myInstances.filter(i => i.status === 'completed_pending_approval' || i.status === 'completed');
  
  // History tasks (approved)
  const myHistory = taskHistory
    .filter(t => t.kidId === user.id)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  const handleMarkAsDone = (instanceId: string) => {
    // Trigger celebration and sound
    playPopSound();
    setShowConfetti(true);
    setFeedback('¡Genial! 🚀 Ahora falta que mamá o papá lo revisen');
    
    // Playful delay before moving the task to let them see the button react
    setTimeout(() => {
      setTaskInstances(prev => prev.map(i => {
        if (i.id === instanceId) {
          const task = getTaskDef(i.taskId);
          const timesPerDay = task?.timesPerDay || 1;
          const newCount = (i.completedCountToday || 0) + 1;
          return { 
            ...i, 
            status: 'completed_pending_approval', 
            completedCountToday: newCount,
            completionTimestamp: new Date().toISOString() 
          };
        }
        return i;
      }));
    }, 400);

    setTimeout(() => {
      setFeedback(null);
      setShowConfetti(false);
    }, 3500);
  };

  // Helper to get task definition
  const getTaskDef = (taskId: string) => tasks.find(t => t.id === taskId);

  return (
    <div className="space-y-6 text-left relative">
      <Confetti active={showConfetti} />

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute -top-2 left-0 right-0 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 font-bold z-20 text-lg text-center"
          >
            <Sparkles className="w-6 h-6 flex-shrink-0" />
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      <KidReminder user={user} taskInstances={taskInstances} />

      {/* Filters - Larger touch targets for kids */}
      <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-4 rounded-xl font-extrabold text-base transition-all ${
            filter === 'pending' 
              ? 'bg-white text-emerald-600 shadow-sm scale-100' 
              : 'text-slate-500 hover:text-slate-700 scale-95'
          }`}
        >
          Pendientes ({pendingInstances.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-4 rounded-xl font-extrabold text-base transition-all ${
            filter === 'completed' 
              ? 'bg-white text-emerald-600 shadow-sm scale-100' 
              : 'text-slate-500 hover:text-slate-700 scale-95'
          }`}
        >
          Historial ({myHistory.length})
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filter === 'pending' ? (
          pendingInstances.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200"
            >
              <motion.div 
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Star className="w-12 h-12 text-emerald-300" />
              </motion.div>
              <p className="text-slate-600 font-extrabold text-xl">
                ¡No tienes tareas pendientes!
              </p>
              <p className="text-slate-400 font-bold mt-2 text-lg">
                ¡Tiempo libre para jugar! 🎮
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {pendingInstances.map(instance => {
                const task = getTaskDef(instance.taskId);
                if (!task) return null;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    key={instance.id}
                    className={`p-5 rounded-3xl border-2 transition-all hover:shadow-md ${
                      instance.status === 'rejected'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-slate-100 shadow-sm hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/60 shadow-sm flex-shrink-0">
                          {task.icon || '📝'}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-xl leading-tight">{task.title}</h3>
                          {task.description && (
                            <p className="text-slate-500 text-base font-bold mt-1">{task.description}</p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="flex items-center gap-1 text-amber-600 bg-amber-100/50 px-3 py-1.5 rounded-xl font-extrabold text-sm">
                              <Star className="w-4 h-4 fill-amber-500" /> {task.points} pts
                            </span>
                            {(task.timesPerDay || 1) > 1 && (
                              <span className="text-indigo-600 text-sm font-extrabold bg-indigo-100 px-3 py-1.5 rounded-xl">
                                {instance.completedCountToday || 0} de {task.timesPerDay} completadas hoy 🍽️
                              </span>
                            )}
                            {instance.status === 'rejected' && (
                              <span className="text-red-600 text-sm font-extrabold bg-red-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                                ¡Intenta de nuevo! 🔄
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9, rotate: -5 }}
                        onClick={() => handleMarkAsDone(instance.id)}
                        className="flex-shrink-0 w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-200 transition-colors shadow-sm"
                        aria-label="Marcar como completada"
                      >
                        <CheckCircle className="w-10 h-10" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )
        ) : (
          /* History Tab */
          <div className="space-y-6">
            {/* Under Review Section */}
            {underReviewInstances.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider ml-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> En Revisión
                </h3>
                {underReviewInstances.map(instance => {
                  const task = getTaskDef(instance.taskId);
                  if (!task) return null;
                  return (
                    <motion.div
                      key={instance.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 rounded-3xl border-2 bg-emerald-50 border-emerald-100 transition-all"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/60 shadow-sm flex-shrink-0">
                            {task.icon || '📝'}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-xl leading-tight">{task.title}</h3>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="flex items-center gap-1 text-amber-600 bg-amber-100/50 px-3 py-1 rounded-xl font-extrabold text-sm">
                                <Star className="w-4 h-4 fill-amber-500" /> {task.points} pts
                              </span>
                              {(task.timesPerDay || 1) > 1 && (
                                <span className="text-indigo-600 text-sm font-extrabold bg-indigo-100 px-3 py-1 rounded-xl">
                                  {instance.completedCountToday || 0} de {task.timesPerDay} completadas hoy 🍽️
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-center justify-center text-center">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 bg-emerald-200/50 text-emerald-600 rounded-full flex items-center justify-center mb-1"
                          >
                            <Clock className="w-6 h-6" />
                          </motion.div>
                          <span className="text-[10px] font-extrabold text-emerald-600 leading-tight max-w-[80px]">
                            Esperando aprobación 👀
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Approved History Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider ml-2 flex items-center gap-2">
                <History className="w-4 h-4" /> Historial Aprobado
              </h3>
              
              {myHistory.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200"
                >
                  <div className="text-4xl mb-2">😄</div>
                  <p className="text-slate-600 font-extrabold text-lg">Todavía no completaste tareas</p>
                  <p className="text-slate-400 font-bold mt-1">¡Empezá para ver tu progreso!</p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {myHistory.map(historyItem => {
                    const approvedByParent = users.find(u => u.id === historyItem.approvedBy);
                    const date = new Date(historyItem.completedAt);
                    const formattedDate = new Intl.DateTimeFormat('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(date);

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        key={historyItem.id}
                        className="p-5 rounded-3xl border-2 bg-amber-50 border-amber-100 transition-all hover:shadow-md"
                      >
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/60 shadow-sm flex-shrink-0">
                              {historyItem.icon || '📝'}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-800 text-xl leading-tight">{historyItem.title}</h3>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="flex items-center gap-1 text-amber-600 bg-amber-100/50 px-3 py-1 rounded-xl font-extrabold text-sm">
                                  +{historyItem.points} <Star className="w-4 h-4 fill-amber-500" />
                                </span>
                                <span className="text-slate-500 text-xs font-bold bg-white/50 px-2 py-1 rounded-lg">
                                  {formattedDate}
                                </span>
                              </div>
                              {approvedByParent && (
                                <div className="mt-2 text-amber-700 text-sm font-extrabold bg-amber-100/50 px-3 py-1.5 rounded-xl inline-flex items-center gap-1">
                                  Aprobado por {approvedByParent.avatar || <ShieldCheck className="w-4 h-4" />} {approvedByParent.name} ✅
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
