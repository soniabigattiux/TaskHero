import React, { useState } from 'react';
import { Reward, RewardClaim, KidProfile } from '../types';
import { Plus, Edit2, Trash2, X, Gift, Star, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';

interface Props {
  rewards: Reward[];
  setRewards: React.Dispatch<React.SetStateAction<Reward[]>>;
  rewardClaims?: RewardClaim[];
  setRewardClaims?: React.Dispatch<React.SetStateAction<RewardClaim[]>>;
  kids?: KidProfile[];
}

export function ParentRewardManager({ rewards, setRewards, rewardClaims = [], setRewardClaims, kids = [] }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(50);
  const [icon, setIcon] = useState('🎁');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState('');

  const pendingClaims = rewardClaims.filter(c => c.status === 'pending');

  const openForm = (reward?: Reward) => {
    if (reward) {
      setEditingId(reward.id);
      setTitle(reward.title);
      setCost(reward.cost);
      setIcon(reward.icon || '🎁');
    } else {
      setEditingId(null);
      setTitle('');
      setCost(50);
      setIcon('🎁');
    }
    setError('');
    setShowEmojiPicker(false);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) { setError('El título es requerido'); return; }
    if (cost <= 0) { setError('El costo debe ser mayor a 0'); return; }

    const newReward: Reward = {
      id: editingId || Math.random().toString(36).substring(2, 9),
      title,
      cost,
      icon,
    };

    if (editingId) {
      setRewards(rewards.map(r => r.id === editingId ? newReward : r));
    } else {
      setRewards([...rewards, newReward]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

  const handleDeliver = (claimId: string) => {
    if (setRewardClaims) {
      setRewardClaims(prev => prev.map(c => 
        c.id === claimId ? { ...c, status: 'delivered', deliveredAt: new Date().toISOString() } : c
      ));
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setIcon(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (isFormOpen) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-left relative pb-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{editingId ? 'Editar Premio' : 'Nuevo Premio'}</h2>
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
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-400 outline-none transition-colors h-16" placeholder="Ej. Ir al cine" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700">Costo (Puntos)</label>
          <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-400 outline-none transition-colors" min="1" />
        </div>

        <button onClick={handleSave} className="w-full py-4 mt-6 bg-indigo-600 text-white font-bold rounded-2xl text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
          Guardar Premio
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 text-left pb-20">
      {/* Pending Claims Section */}
      {pendingClaims.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Gift className="w-6 h-6 text-indigo-500" /> Premios por entregar
          </h2>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pendingClaims.map(claim => {
                const kid = kids.find(k => k.id === claim.kidId);
                const reward = rewards.find(r => r.id === claim.rewardId);
                if (!kid || !reward) return null;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={claim.id} 
                    className="bg-indigo-50 p-4 rounded-2xl shadow-sm border-2 border-indigo-100 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                        {reward.icon || '🎁'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{reward.title}</h3>
                        <p className="text-sm font-bold text-indigo-600 mt-0.5">
                          Canjeado por {kid.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="flex items-center gap-1 text-amber-600 font-bold text-sm bg-amber-100/50 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 fill-amber-500" /> {reward.cost} pts
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeliver(claim.id)} 
                      className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5" /> Marcar como Entregado
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Catalog Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-slate-800">Catálogo de Premios</h2>
          <button onClick={() => openForm()} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-200 transition-colors">
            <Plus className="w-5 h-5" /> Nuevo
          </button>
        </div>

        {rewards.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold">No hay premios creados</p>
            <p className="text-sm text-slate-400 mt-1">¡Agrega uno para motivarlos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {rewards.map(reward => (
              <motion.div key={reward.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    {reward.icon || '🎁'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{reward.title}</h3>
                    <span className="flex items-center gap-1 text-amber-500 font-bold text-sm mt-0.5">
                      <Star className="w-4 h-4 fill-amber-500" /> {reward.cost} pts
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openForm(reward)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(reward.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
