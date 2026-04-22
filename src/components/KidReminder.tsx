import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Flame, X } from 'lucide-react';
import { KidProfile, TaskInstance } from '../types';

interface Props {
  user: KidProfile;
  taskInstances: TaskInstance[];
}

export function KidReminder({ user, taskInstances }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  const pendingCount = taskInstances.filter(
    i => i.childId === user.id && (i.status === 'pending' || i.status === 'rejected')
  ).length;

  if (pendingCount === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl p-5 text-white shadow-md relative overflow-hidden"
        >
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Cerrar recordatorio"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 pr-6">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Bell className="w-7 h-7 text-white fill-white/50" />
              </motion.div>
            </div>
            <div>
              <h3 className="font-extrabold text-xl leading-tight">
                ¡Tienes {pendingCount} {pendingCount === 1 ? 'tarea pendiente' : 'tareas pendientes'}!
              </h3>
              {user.streak > 0 ? (
                <p className="text-orange-50 font-bold text-sm mt-1.5 flex items-center gap-1.5">
                  <Flame className="w-5 h-5 fill-orange-200 text-orange-200" /> 
                  ¡No pierdas tu racha de {user.streak} días!
                </p>
              ) : (
                <p className="text-orange-50 font-bold text-sm mt-1.5 flex items-center gap-1.5">
                  <Flame className="w-5 h-5 fill-orange-200 text-orange-200" /> 
                  ¡Haz una tarea para empezar tu racha!
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
