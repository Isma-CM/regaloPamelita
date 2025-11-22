/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect, useRef } from 'react';
import { AppState, SavedModel, VoxelData } from '../types';
import { Box, Heart, Star, Sparkles, Smile, Crown, Wand2, Hammer, FolderOpen, ChevronUp, FileJson, History, Play, Pause, Info, Wrench, Loader2, Gift, Camera } from 'lucide-react';

interface UIOverlayProps {
  voxelCount: number;
  appState: AppState;
  currentBaseModel: string;
  customBuilds: SavedModel[];
  customRebuilds: SavedModel[];
  isAutoRotate: boolean;
  isInfoVisible: boolean;
  isGenerating: boolean;
  onDismantle: () => void;
  onRebuild: (type: 'LoveScene' | 'CuteRabbit') => void;
  onNewScene: (type: 'LoveScene') => void;
  onSelectCustomBuild: (model: SavedModel) => void;
  onSelectCustomRebuild: (model: SavedModel) => void;
  onPromptCreate: () => void;
  onPromptMorph: () => void;
  onShowJson: () => void;
  onImportJson: () => void;
  onToggleRotation: () => void;
  onToggleInfo: () => void;
  onPhotoUpload: () => void;
}

const LOADING_MESSAGES = [
    "Analizando Belleza...",
    "Agregando Azúcar...",
    "Agregando Flores...",
    "Mezclando Colores...",
    "Creando Magia...",
    "Salvando el día..."
];

export const UIOverlay: React.FC<UIOverlayProps> = ({
  voxelCount,
  appState,
  currentBaseModel,
  customBuilds,
  customRebuilds,
  isAutoRotate,
  isInfoVisible,
  isGenerating,
  onDismantle,
  onRebuild,
  onNewScene,
  onSelectCustomBuild,
  onSelectCustomRebuild,
  onPromptCreate,
  onPromptMorph,
  onShowJson,
  onImportJson,
  onToggleRotation,
  onToggleInfo,
  onPhotoUpload
}) => {
  const isStable = appState === AppState.STABLE;
  const isDismantling = appState === AppState.DISMANTLING;
  
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (isGenerating) {
        const interval = setInterval(() => {
            setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);
        return () => clearInterval(interval);
    } else {
        setLoadingMsgIndex(0);
    }
  }, [isGenerating]);
  
  const isLoveScene = currentBaseModel === 'LoveScene';

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none">
      
      {/* --- Top Bar (Stats & Tools) --- */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        
        {/* Global Scene Controls */}
        <div className="pointer-events-auto flex flex-col gap-2">
            <DropdownMenu 
                icon={<Heart size={20} fill="currentColor" />}
                label="Mis Amores"
                color="rose"
            >
                <div className="px-2 py-1 text-xs font-bold text-rose-300 uppercase tracking-wider">ESCENAS</div>
                <DropdownItem onClick={() => onNewScene('LoveScene')} icon={<Crown size={16}/>} label="Amor Superpoderoso" />
                <DropdownItem onClick={onPromptCreate} icon={<Wand2 size={16}/>} label="Regalo Mágico" highlight />
                <DropdownItem onClick={onPhotoUpload} icon={<Camera size={16}/>} label="Foto a Vóxel" highlight />
                <div className="h-px bg-rose-100 my-1" />
                
                {customBuilds.length > 0 && (
                    <>
                        <div className="px-2 py-1 text-xs font-bold text-rose-300 uppercase tracking-wider">TUS REGALOS</div>
                        {customBuilds.map((model, idx) => (
                            <DropdownItem 
                                key={`build-${idx}`} 
                                onClick={() => onSelectCustomBuild(model)} 
                                icon={<Star size={16}/>} 
                                label={model.name} 
                                truncate
                            />
                        ))}
                        <div className="h-px bg-rose-100 my-1" />
                    </>
                )}

                <DropdownItem onClick={onImportJson} icon={<FileJson size={16}/>} label="Importar Recuerdo" />
            </DropdownMenu>

            <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl border border-rose-100 text-rose-400 font-bold w-fit mt-2">
                <div className="bg-rose-100 p-1.5 rounded-lg text-rose-500">
                    <Box size={16} strokeWidth={3} />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] uppercase tracking-wider opacity-60">Bloques de Amor</span>
                    <span className="text-lg text-rose-600 font-extrabold font-mono">{voxelCount}</span>
                </div>
            </div>
        </div>

        {/* Utilities */}
        <div className="pointer-events-auto flex gap-2">
            <TactileButton
                onClick={onToggleInfo}
                color={isInfoVisible ? 'rose' : 'slate'}
                icon={<Info size={18} strokeWidth={2.5} />}
                label="Mensaje"
                compact
            />
            <TactileButton
                onClick={onToggleRotation}
                color={isAutoRotate ? 'rose' : 'slate'}
                icon={isAutoRotate ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                label={isAutoRotate ? "Pausa" : "Repro."}
                compact
            />
            <TactileButton
                onClick={onShowJson}
                color="slate"
                icon={<Heart size={18} strokeWidth={2.5} />}
                label="Compartir"
            />
        </div>
      </div>

      {/* --- Loading Indicator --- */}
      {isGenerating && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in duration-300">
              <div className="bg-white/90 backdrop-blur-md border-4 border-rose-200 px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 min-w-[280px]">
                  <div className="relative">
                      <div className="absolute inset-0 bg-rose-200 rounded-full animate-ping opacity-40"></div>
                      <Loader2 size={48} className="text-rose-500 animate-spin" />
                  </div>
                  <div className="text-center">
                      <h3 className="text-lg font-extrabold text-rose-600">Creando Magia...</h3>
                      <p className="text-rose-400 font-bold text-sm transition-all duration-300">
                          {LOADING_MESSAGES[loadingMsgIndex]}
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* --- Bottom Control Center --- */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center items-end pointer-events-none">
        
        <div className="pointer-events-auto transition-all duration-500 ease-in-out transform">
            
            {/* STATE 1: STABLE -> DISMANTLE */}
            {isStable && (
                 <div className="animate-in slide-in-from-bottom-10 fade-in duration-300">
                     <BigActionButton 
                        onClick={onDismantle} 
                        icon={<Sparkles size={32} strokeWidth={2.5} />} 
                        label="¡PUF!" 
                        color="rose" 
                     />
                 </div>
            )}

            {/* STATE 2: DISMANTLED -> REBUILD */}
            {isDismantling && !isGenerating && (
                <div className="flex items-end gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
                     
                     {/* BIG SURPRISE BUTTON FOR LOVE SCENE */}
                     {isLoveScene && (
                        <BigActionButton 
                            onClick={() => onRebuild('LoveScene')} 
                            icon={<Gift size={32} strokeWidth={2.5} />} 
                            label="¡SORPRESA!" 
                            color="rose" 
                            pulse
                        />
                     )}

                     <DropdownMenu 
                        icon={<Wrench size={24} />}
                        label="Opciones"
                        color="indigo"
                        direction="up"
                        big={!isLoveScene} // Make it big if it's the only button
                     >
                        <div className="px-2 py-1 text-xs font-bold text-indigo-300 uppercase tracking-wider">TRANSFORMAR</div>
                        
                        {/* Standard Presets */}
                        <DropdownItem onClick={() => onRebuild('LoveScene')} icon={<Heart size={18}/>} label="Restaurar Amor" />
                        <DropdownItem onClick={() => onRebuild('CuteRabbit')} icon={<Smile size={18}/>} label="Conejito Sorpresa" />
                        
                        <div className="h-px bg-indigo-100 my-1" />

                        {/* Custom Rebuilds */}
                        {customRebuilds.length > 0 && (
                            <>
                                <div className="px-2 py-1 text-xs font-bold text-indigo-300 uppercase tracking-wider">TUS SORPRESAS</div>
                                {customRebuilds.map((model, idx) => (
                                    <DropdownItem 
                                        key={`rebuild-${idx}`} 
                                        onClick={() => onSelectCustomRebuild(model)} 
                                        icon={<Star size={18}/>} 
                                        label={model.name}
                                        truncate 
                                    />
                                ))}
                                <div className="h-px bg-indigo-100 my-1" />
                            </>
                        )}

                        <DropdownItem onClick={onPromptMorph} icon={<Wand2 size={18}/>} label="Nueva Sorpresa" highlight />
                     </DropdownMenu>
                </div>
            )}
        </div>
      </div>

    </div>
  );
};

// --- Components ---

interface TactileButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  color: 'slate' | 'rose';
  compact?: boolean;
}

const TactileButton: React.FC<TactileButtonProps> = ({ onClick, disabled, icon, label, color, compact }) => {
  const colorStyles = {
    slate:   'bg-slate-200 text-slate-600 shadow-slate-300 hover:bg-slate-300',
    rose:    'bg-rose-400 text-white shadow-rose-600 hover:bg-rose-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all duration-100
        border-b-[4px] active:border-b-0 active:translate-y-[4px]
        ${compact ? 'p-2.5' : 'px-4 py-3'}
        ${disabled 
          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed shadow-none' 
          : `${colorStyles[color]} border-black/10 shadow-lg`}
      `}
    >
      {icon}
      {!compact && <span>{label}</span>}
    </button>
  );
};

const BigActionButton: React.FC<{onClick: () => void, icon: React.ReactNode, label: string, color: 'rose', pulse?: boolean}> = ({ onClick, icon, label, color, pulse }) => {
    return (
        <button 
            onClick={onClick}
            className={`
                group relative flex flex-col items-center justify-center w-32 h-32 rounded-full 
                bg-rose-400 hover:bg-rose-500 text-white shadow-xl shadow-rose-900/20 
                border-b-[8px] border-rose-700 active:border-b-0 active:translate-y-[8px] 
                transition-all duration-150
                ${pulse ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}
            `}
        >
            <div className={`mb-2 ${pulse ? 'animate-bounce' : ''}`}>{icon}</div>
            <div className="text-sm font-black tracking-wider">{label}</div>
        </button>
    )
}

// --- Dropdown Components ---

interface DropdownProps {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    color: 'indigo' | 'rose';
    direction?: 'up' | 'down';
    big?: boolean;
}

const DropdownMenu: React.FC<DropdownProps> = ({ icon, label, children, color, direction = 'down', big }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const bgClass = color === 'indigo' ? 'bg-indigo-400 hover:bg-indigo-500 border-indigo-700' : 'bg-rose-400 hover:bg-rose-500 border-rose-700';

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 font-bold text-white shadow-lg rounded-2xl transition-all active:scale-95
                    ${bgClass}
                    ${big ? 'px-8 py-4 text-lg border-b-[6px] active:border-b-0 active:translate-y-[6px]' : 'px-4 py-3 text-sm border-b-[4px] active:border-b-0 active:translate-y-[4px]'}
                `}
            >
                {icon}
                {label}
                <ChevronUp size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${direction === 'down' ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`
                    absolute left-0 ${direction === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'} 
                    w-64 max-h-[60vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-2 border-rose-100 p-2 flex flex-col gap-1 animate-in fade-in zoom-in duration-200 z-50
                `}>
                    {children}
                </div>
            )}
        </div>
    )
}

const DropdownItem: React.FC<{ onClick: () => void, icon: React.ReactNode, label: string, highlight?: boolean, truncate?: boolean }> = ({ onClick, icon, label, highlight, truncate }) => {
    return (
        <button 
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors text-left
                ${highlight 
                    ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 hover:from-rose-100 hover:to-pink-100' 
                    : 'text-slate-600 hover:bg-rose-50 hover:text-rose-800'}
            `}
        >
            <div className="shrink-0 text-rose-400">{icon}</div>
            <span className={truncate ? "truncate w-full" : ""}>{label}</span>
        </button>
    )
}