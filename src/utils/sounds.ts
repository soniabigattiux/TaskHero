export const playTone = (frequency: number, type: OscillatorType, duration: number, startTime: number, audioCtx: AudioContext) => {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

export const playSuccessSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    // Happy major arpeggio: C5, E5, G5, C6
    playTone(523.25, 'sine', 0.2, now, audioCtx);
    playTone(659.25, 'sine', 0.2, now + 0.1, audioCtx);
    playTone(783.99, 'sine', 0.2, now + 0.2, audioCtx);
    playTone(1046.50, 'sine', 0.4, now + 0.3, audioCtx);
  } catch (e) { 
    console.log("Audio not supported"); 
  }
};

export const playRedeemSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    // Magical sparkle: high rapid notes
    playTone(880, 'triangle', 0.1, now, audioCtx);
    playTone(1108.73, 'triangle', 0.1, now + 0.05, audioCtx);
    playTone(1318.51, 'triangle', 0.1, now + 0.1, audioCtx);
    playTone(1760, 'triangle', 0.4, now + 0.15, audioCtx);
  } catch (e) { 
    console.log("Audio not supported"); 
  }
};

export const playPopSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    // Quick double pop
    playTone(400, 'sine', 0.1, now, audioCtx);
    playTone(600, 'sine', 0.1, now + 0.05, audioCtx);
  } catch (e) { 
    console.log("Audio not supported"); 
  }
};
