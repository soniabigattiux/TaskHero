import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface Props {
  expectedPin: string | string[];
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
}

export function PinPad({ expectedPin, onSuccess, onCancel, title = "Ingresa tu PIN" }: Props) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    // Auto-focus the first input when modal opens
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Handle visual viewport changes (keyboard opening)
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        // If visual viewport is significantly smaller than window, keyboard is likely open
        if (viewportHeight < windowHeight * 0.8) {
          setKeyboardOffset(windowHeight - viewportHeight);
        } else {
          setKeyboardOffset(0);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      // Initial check
      handleResize();
    }

    return () => {
      document.body.style.overflow = 'unset';
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const triggerVibration = (pattern: number | number[] = 50) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const checkPin = (enteredPin: string) => {
    if (enteredPin.length === 4) {
      const isCorrect = Array.isArray(expectedPin) ? expectedPin.includes(enteredPin) : enteredPin === expectedPin;
      if (isCorrect) {
        onSuccess();
      } else {
        setError(true);
        triggerVibration([50, 50, 50]); // Error vibration pattern
        setTimeout(() => {
          setPin(['', '', '', '']);
          setError(false);
          inputRefs.current[0]?.focus();
        }, 500);
      }
    }
  };

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    const digit = value.replace(/\D/g, '').slice(-1);
    
    if (digit) {
      triggerVibration();
      const newPin = [...pin];
      newPin[index] = digit;
      setPin(newPin);
      setError(false);

      // Auto-advance
      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      } else {
        // Check PIN if it's the last digit
        checkPin(newPin.join(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      triggerVibration();
      if (!pin[index] && index > 0) {
        // Move to previous input and clear it
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
      setError(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData) {
      const newPin = ['', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newPin[i] = pastedData[i];
      }
      setPin(newPin);
      if (pastedData.length === 4) {
        inputRefs.current[3]?.focus();
        checkPin(newPin.join(''));
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex flex-col items-center overflow-y-auto transition-all duration-300"
      style={{ paddingBottom: keyboardOffset > 0 ? `${keyboardOffset}px` : '0px' }}
    >
      <div className="w-full max-w-sm mt-auto mb-auto flex flex-col justify-center p-4 sm:p-6 min-h-[50vh]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-2xl relative w-full"
        >
          <button onClick={onCancel} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-8 mt-2">
            <h2 className="text-2xl font-extrabold text-slate-800">{title}</h2>
            <p className="text-slate-500 font-medium mt-2 h-6">
              {error ? <span className="text-red-500 font-bold">PIN incorrecto 🔒</span> : "Solo para administradores"}
            </p>
          </div>

          <motion.div 
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-center gap-3 sm:gap-4 mb-4"
          >
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={pin[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-14 h-16 sm:w-16 sm:h-20 text-center text-3xl font-extrabold rounded-2xl border-2 outline-none transition-all ${
                  error 
                    ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                    : pin[index]
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100'
                }`}
                autoComplete="off"
              />
            ))}
          </motion.div>
          
          <p className="text-center text-sm text-slate-400 mt-8 font-medium">
            Ingresa los 4 dígitos
          </p>
        </motion.div>
      </div>
    </div>
  );
}
