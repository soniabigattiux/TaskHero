import React, { useState } from 'react';
import { Task, TaskInstance, KidProfile, ParentProfile, TaskHistory } from '../types';
import { CheckCircle, XCircle, Star, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateLevel } from '../utils/levels';
import { playSuccessSound } from '../utils/sounds';
import { Confetti } from './Confetti';
import { getLogicalDay } from '../utils/date';

interface Props {
  kids: KidProfile[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  taskInstances: TaskInstance[];
  setTaskInstances: React.Dispatch<React.SetStateAction<TaskInstance[]>>;
  currentUser?: ParentProfile;
  setTaskHistory?: React.Dispatch<React.SetStateAction<TaskHistory[]>>;
}

export function ParentValidationManager({ kids, setUsers, tasks, setTasks, taskInstances, setTaskInstances, currentUser, setTaskHistory }: Props) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const pendingApprovals = taskInstances.filter(i => i.status === 'completed_pending_approval' || i.status === 'completed');

  const handleApprove = (instance: TaskInstance) => {
    const task = tasks.find(t => t.id === instance.taskId);
    if (!task) return;

    const kid = kids.find(k => k.id === instance.childId);
    
    // Play sound and show celebration
    playSuccessSound();
    setShowConfetti(true);
    setFeedback(`¡${kid?.name} GANÓ ${task.points} puntos! ⭐`);

    // 1. Create history record
    if (setTaskHistory) {
      const historyRecord: TaskHistory = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        taskId: task.id,
        title: task.title,
        description: task.description,
        points: task.points,
        icon: task.icon,
        kidId: instance.childId,
        approvedBy: currentUser?.id || 'admin',
        completedAt: new Date().toISOString(),
      };
      setTaskHistory(prev => [historyRecord, ...prev]);
    }

    // 2. Update instance (reset if recurring, delete if once)
    if (task.frequency === 'once') {
      setTaskInstances(prev => prev.filter(i => i.id !== instance.id));
      // If no more instances for this 'once' task, delete the task definition too
      if (!taskInstances.some(i => i.taskId === task.id && i.id !== instance.id)) {
        setTasks(prev => prev.filter(t => t.id !== task.id));
      }
    } else {
      const timesPerDay = task.timesPerDay || 1;
      const currentCount = instance.completedCountToday || 1;
      const currentLogicalDay = getLogicalDay();
      const instanceLogicalDay = instance.lastResetLogicalDay || getLogicalDay(instance.date);
      
      if (instanceLogicalDay < currentLogicalDay) {
        // Approving a task from a previous day. Reset it for today.
        setTaskInstances(prev => prev.map(i => 
          i.id === instance.id ? { 
            ...i, 
            status: 'pending', 
            completionTimestamp: undefined, 
            approvedBy: undefined,
            completedCountToday: 0,
            lastResetLogicalDay: currentLogicalDay
          } : i
        ));
      } else if (currentCount >= timesPerDay) {
        setTaskInstances(prev => prev.map(i => 
          i.id === instance.id ? { ...i, status: 'approved', completionTimestamp: undefined, approvedBy: currentUser?.id || 'admin' } : i
        ));
      } else {
        setTaskInstances(prev => prev.map(i => 
          i.id === instance.id ? { ...i, status: 'pending', completionTimestamp: undefined, approvedBy: undefined } : i
        ));
      }
    }

    // 3. Add points to the specific kid and recalculate level
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === instance.childId && user.role === 'kid') {
        const newPoints = user.points + task.points;
        const newLifetime = user.lifetimePoints + task.points;
        return { 
          ...user, 
          points: newPoints,
          lifetimePoints: newLifetime,
          level: calculateLevel(newLifetime)
        };
      }
      return user;
    }));

    setTimeout(() => {
      setFeedback(null);
      setShowConfetti(false);
    }, 3500);
  };

  const handleReject = (instanceId: string) => {
    // Reset task status so the kid can try again
    setTaskInstances(prev => prev.map(i => {
      if (i.id === instanceId) {
        const currentLogicalDay = getLogicalDay();
        const instanceLogicalDay = i.lastResetLogicalDay || getLogicalDay(i.date);
        
        if (instanceLogicalDay < currentLogicalDay) {
          // Rejecting a task from a previous day. Just reset it for today.
          return { 
            ...i, 
            status: 'pending', 
            completedCountToday: 0,
            lastResetLogicalDay: currentLogicalDay
          };
        }

        const newCount = Math.max(0, (i.completedCountToday || 1) - 1);
        return { ...i, status: 'rejected', completedCountToday: newCount };
      }
      return i;
    }));
  };

  return (
    <div className="space-y-4 text-left relative">
      <Confetti active={showConfetti} />

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute -top-2 left-0 right-0 bg-amber-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 font-bold z-20 text-lg"
          >
            <Star className="w-6 h-6 fill-amber-200 text-amber-200" />
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Validar Tareas</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Revisa las tareas que tus hijos han marcado como hechas.
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-bold">Todo al día</p>
          <p className="text-sm text-slate-400 mt-1">No hay tareas pendientes de revisión.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {pendingApprovals.map(instance => {
              const task = tasks.find(t => t.id === instance.taskId);
              const kid = kids.find(k => k.id === instance.childId);
              if (!task || !kid) return null;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  key={instance.id}
                  className="bg-white p-5 rounded-3xl shadow-sm border-2 border-indigo-50 transition-all hover:shadow-md hover:border-indigo-200"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-100 flex-shrink-0">
                        {task.icon || '📝'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{task.title}</h3>
                        <div className="flex items-center gap-3 mt-2 text-sm font-semibold">
                          <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                            <UserIcon className="w-4 h-4" /> {kid.name}
                          </span>
                          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-amber-500" /> +{task.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReject(instance.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-5 h-5" /> Rechazar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(instance)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5" /> Aprobar
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
