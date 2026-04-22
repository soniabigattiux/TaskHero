import React, { useState } from 'react';
import { Reward, KidProfile, RewardClaim } from '../types';
import { Gift, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Confetti } from './Confetti';
import { playRedeemSound } from '../utils/sounds';

interface Props {
  user: KidProfile;
  rewards: Reward[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  rewardClaims?: RewardClaim[];
  setRewardClaims?: React.Dispatch<React.SetStateAction<RewardClaim[]>>;
}

export function KidRewardManager({ user, rewards, setUsers, rewardClaims, setRewardClaims }: Props) {
  const [feedback, setFeedback] = useState<{ title: string, subtitle: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleRedeem = (reward: Reward) => {
    if (user.points < reward.cost) return;

    // Celebration
    playRedeemSound();
    setShowConfetti(true);
    setFeedback({
      title: '¡Canjeado! 🎉',
      subtitle: 'Avisamos a tus padres'
    });

    // Deduct points
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === user.id && u.role === 'kid') {
        return { ...u, points: u.points - reward.cost };
      }
      return u;
    }));

    // Create claim
    if (setRewardClaims) {
      const newClaim: RewardClaim = {
        id: Date.now().toString(),
        rewardId: reward.id,
        kidId: user.id,
        status: 'pending',
        claimedAt: new Date().toISOString()
      };
      setRewardClaims(prev => [...prev, newClaim]);
    }

    setTimeout(() => {
      setFeedback(null);
      setShowConfetti(false);
    }, 3500);
  };

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
            className="absolute -top-2 left-0 right-0 bg-indigo-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 font-bold z-20 text-center"
          >
            <Sparkles className="w-8 h-8 flex-shrink-0 text-indigo-200" />
            <div className="text-left">
              <div className="text-xl font-extrabold">{feedback.title}</div>
              <div className="text-sm text-indigo-100 font-bold">{feedback.subtitle}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800">Premios Disponibles</h2>
        <p className="text-slate-500 text-base font-bold mt-1">
          ¡Usa tus puntos para canjear recompensas geniales!
        </p>
      </div>

      {rewards.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200"
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Gift className="w-12 h-12 text-indigo-300" />
          </motion.div>
          <p className="text-slate-600 font-extrabold text-xl">Aún no hay premios</p>
          <p className="text-slate-400 font-bold mt-2 text-lg">¡Pídele a tus padres que agreguen algunos!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rewards.map(reward => {
            const canAfford = user.points >= reward.cost;
            const missingPoints = reward.cost - user.points;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={canAfford ? { scale: 1.02, y: -4 } : {}}
                className={`p-5 rounded-3xl border-2 transition-all flex items-center gap-4 hover:shadow-md ${
                  canAfford 
                    ? 'bg-white border-indigo-100 shadow-sm hover:border-indigo-300' 
                    : 'bg-slate-50 border-slate-100 opacity-75'
                }`}
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 ${
                  canAfford ? 'bg-indigo-50' : 'bg-slate-200 grayscale'
                }`}>
                  {reward.icon || '🎁'}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-extrabold text-slate-800 text-xl leading-tight">{reward.title}</h3>
                  <div className="flex items-center gap-1 text-amber-500 font-extrabold mt-1.5 text-base">
                    <Star className="w-5 h-5 fill-amber-500" /> {reward.cost} pts
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {canAfford ? (
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      whileTap={{ scale: 0.9, rotate: -3 }}
                      onClick={() => handleRedeem(reward)}
                      className="px-5 py-4 bg-indigo-600 text-white font-extrabold rounded-2xl hover:bg-indigo-700 transition-colors shadow-sm text-lg"
                    >
                      Canjear
                    </motion.button>
                  ) : (
                    <div className="text-center px-4 py-3 bg-slate-200 rounded-2xl">
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Faltan</span>
                      <span className="block text-base font-extrabold text-slate-600">{missingPoints} pts</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}


