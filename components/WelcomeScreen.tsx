
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { Heart, X } from 'lucide-react';

interface WelcomeScreenProps {
  visible: boolean;
  mode: 'intro' | 'ending';
  onClose: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ visible, mode, onClose }) => {
  const isIntro = mode === 'intro';

  return (
    <div className={`
        absolute top-0 left-0 w-full h-full pointer-events-none flex z-40 select-none
        transition-all duration-500 ease-out transform font-sans
        ${isIntro ? 'items-center justify-center' : 'items-end justify-center pb-24'}
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
    `}>
        {/* Positioning container */}
        <div className={`relative transition-all duration-500 ${isIntro ? '-translate-y-32' : 'translate-y-0 w-full max-w-xl px-4'}`}>
            
            <div className={`
                pointer-events-auto relative flex flex-col items-center gap-4 
                ${isIntro ? 'bg-white/80 p-8 border-4 border-rose-200 shadow-2xl' : 'bg-white/60 py-4 px-6 border-2 border-rose-100/50 shadow-lg backdrop-blur-sm'}
                rounded-3xl text-center mx-auto
            `}>
                
                {/* Close button for Ending mode */}
                {!isIntro && (
                    <button 
                        onClick={onClose}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-100/50 text-rose-400 hover:bg-rose-200 transition-colors"
                    >
                        <X size={16} strokeWidth={3} />
                    </button>
                )}

                <div>
                    <h1 className={`${isIntro ? 'text-3xl mb-2' : 'text-xl mb-1'} font-black text-rose-500 uppercase tracking-widest drop-shadow-sm`}>
                        {isIntro ? 'Para Pamelita' : 'La Receta Perfecta'}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-rose-400 uppercase tracking-[0.3em]">
                        <Heart size={12} fill="currentColor" /> 
                        {isIntro ? 'Un Regalo Especial' : 'Hecho con Amor'}
                        <Heart size={12} fill="currentColor" />
                    </div>
                </div>
                
                <div className="space-y-2 mt-1">
                    {isIntro ? (
                        <>
                             <p className="text-lg font-bold text-slate-600">Tengo una sorpresa desordenada para ti...</p>
                             <p className="text-xl font-extrabold text-rose-600 animate-pulse">¡Presiona el botón Sorpresa! 👇</p>
                        </>
                    ) : (
                        <>
                             <p className="text-sm font-bold text-slate-600 leading-tight italic max-w-md">
                                "Azúcar... flores... y muchos colores... <br/>
                                Estos fueron los ingredientes elegidos para crear a la chica perfecta..."
                             </p>
                             <p className="text-lg font-black text-rose-600 pt-1 animate-bounce">
                                ¡TE AMO PAMELITA!
                             </p>
                        </>
                    )}
                </div>
            </div>

        </div>
    </div>
  );
};
