
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useEffect, useRef, useState } from 'react';
import { VoxelEngine } from './services/VoxelEngine';
import { UIOverlay } from './components/UIOverlay';
import { JsonModal } from './components/JsonModal';
import { PromptModal } from './components/PromptModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Generators } from './utils/voxelGenerators';
import { AppState, VoxelData, SavedModel } from './types';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VoxelEngine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [appState, setAppState] = useState<AppState>(AppState.DISMANTLING);
  const [previousState, setPreviousState] = useState<AppState>(AppState.DISMANTLING);
  const [voxelCount, setVoxelCount] = useState<number>(0);
  
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonModalMode, setJsonModalMode] = useState<'view' | 'import'>('view');
  
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<'create' | 'morph'>('create');
  
  const [showIntro, setShowIntro] = useState(true);
  const [showEnding, setShowEnding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [jsonData, setJsonData] = useState('');
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // --- State for Custom Models ---
  const [currentBaseModel, setCurrentBaseModel] = useState<string>('LoveScene');
  const [customBuilds, setCustomBuilds] = useState<SavedModel[]>([]);
  const [customRebuilds, setCustomRebuilds] = useState<SavedModel[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Engine
    const engine = new VoxelEngine(
      containerRef.current,
      (newState) => {
          setPreviousState(prev => {
              // Detect transition from REBUILDING to STABLE to trigger ending message
              if (prev === AppState.REBUILDING && newState === AppState.STABLE) {
                  setShowEnding(true);
                  // Auto hide ending after 6s, but allow user to close it earlier
                  setTimeout(() => setShowEnding(false), 6000);
              }
              return newState;
          });
          setAppState(newState);
      },
      (count) => setVoxelCount(count)
    );

    engineRef.current = engine;

    // Initial Model Load - LOVE SCENE
    // Pass 'true' to start dismantled immediately (no flash of finished model)
    engine.loadInitialModel(Generators.LoveScene(), true);
    
    // Resize Listener
    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.cleanup();
    };
  }, []);

  const handleDismantle = () => {
    engineRef.current?.dismantle();
  };

  const handleNewScene = (type: 'LoveScene') => {
    const generator = Generators[type];
    if (generator && engineRef.current) {
      engineRef.current.loadInitialModel(generator(), true); // Also load new scenes dismantled for effect
      setCurrentBaseModel('LoveScene');
    }
  };

  const handleSelectCustomBuild = (model: SavedModel) => {
      if (engineRef.current) {
          engineRef.current.loadInitialModel(model.data, true);
          setCurrentBaseModel(model.name);
      }
  };

  const handleRebuild = (type: 'LoveScene' | 'CuteRabbit') => {
    // Hide intro if user clicked Rebuild/Surprise
    if (showIntro) setShowIntro(false);
    
    const generator = Generators[type];
    if (generator && engineRef.current) {
      engineRef.current.rebuild(generator());
    }
  };

  const handleSelectCustomRebuild = (model: SavedModel) => {
      if (showIntro) setShowIntro(false);
      if (engineRef.current) {
          engineRef.current.rebuild(model.data);
      }
  };

  const handleShowJson = () => {
    if (engineRef.current) {
      setJsonData(engineRef.current.getJsonData());
      setJsonModalMode('view');
      setIsJsonModalOpen(true);
    }
  };

  const handleImportClick = () => {
      setJsonModalMode('import');
      setIsJsonModalOpen(true);
  };

  const handleJsonImport = (jsonStr: string) => {
      try {
          const rawData = JSON.parse(jsonStr);
          if (!Array.isArray(rawData)) throw new Error("JSON must be an array");

          const voxelData: VoxelData[] = rawData.map((v: any) => {
              let colorVal = v.c || v.color;
              let colorInt = 0xCCCCCC;

              if (typeof colorVal === 'string') {
                  if (colorVal.startsWith('#')) colorVal = colorVal.substring(1);
                  colorInt = parseInt(colorVal, 16);
              } else if (typeof colorVal === 'number') {
                  colorInt = colorVal;
              }

              return {
                  x: Number(v.x) || 0,
                  y: Number(v.y) || 0,
                  z: Number(v.z) || 0,
                  color: isNaN(colorInt) ? 0xCCCCCC : colorInt
              };
          });
          
          if (engineRef.current) {
              engineRef.current.loadInitialModel(voxelData, true);
              setCurrentBaseModel('Imported Memory');
          }
      } catch (e) {
          console.error("Failed to import JSON", e);
          alert("Error al importar JSON. Asegúrate de que el formato sea correcto.");
      }
  };

  const openPrompt = (mode: 'create' | 'morph') => {
      setPromptMode(mode);
      setIsPromptModalOpen(true);
  }
  
  const handleToggleRotation = () => {
      const newState = !isAutoRotate;
      setIsAutoRotate(newState);
      if (engineRef.current) {
          engineRef.current.setAutoRotate(newState);
      }
  }
  
  // --- PHOTO UPLOAD LOGIC ---
  const handlePhotoUploadClick = () => {
      if (fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (!process.env.API_KEY) {
          alert("No se encontró la clave API");
          return;
      }

      setIsGenerating(true);
      if (showIntro) setShowIntro(false);

      try {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
              const base64Image = (reader.result as string).split(',')[1];
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              
              // Use Pro model for better instruction following to avoid "half-hearts"
              const model = 'gemini-3-pro-preview'; 
              
              const response = await ai.models.generateContent({
                  model,
                  contents: [
                      {
                        inlineData: {
                            mimeType: file.type,
                            data: base64Image
                        }
                      },
                      {
                          text: `
                            Eres un experto artista 3D de Vóxeles.
                            
                            TU MISIÓN: Generar una figura HUMANA COMPLETA basada en la foto.
                            
                            REGLAS ESTRICTAS:
                            1. GENERA SOLO LA PERSONA. NO generes corazones, fondos, ni formas abstractas.
                            2. La figura debe ser DE CUERPO COMPLETO: Cabeza, Cuerpo, Brazos, Piernas.
                            3. ESTILO: Chibi / Funko Pop (Cabeza grande, cuerpo pequeño pero proporcional).
                            4. COORDENADAS: 
                               - Y debe comenzar en -14 (el suelo).
                               - X e Z centrados en 0.
                               - La figura debe tener volumen 3D (no plana).
                            
                            DETALLES DE LA FOTO A CAPTURAR:
                            - ROPA: Identifica el color exacto (ej. Suéter blanco tejido) y replícalo.
                            - CABELLO: Color negro/oscuro, largo. Peinado exacto.
                            - CARA: Piel clara. Si está haciendo "duck face" o besito, ponle labios rosados/rojos.
                            
                            FORMATO DE SALIDA:
                            - JSON Array de objetos {x, y, z, color}.
                            - Usa colores HEX string (ej. "#FFFFFF").
                            - LIMITE: 600 vóxeles para asegurar que la respuesta esté completa y no cortada.
                          `
                      }
                  ],
                  config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                x: { type: Type.INTEGER },
                                y: { type: Type.INTEGER },
                                z: { type: Type.INTEGER },
                                color: { type: Type.STRING, description: "Hex color code" }
                            },
                            required: ["x", "y", "z", "color"]
                        }
                    }
                }
              });
              
              if (response.text) {
                  const rawData = JSON.parse(response.text);
                  const voxelData: VoxelData[] = rawData.map((v: any) => {
                      let colorStr = v.color;
                      if (colorStr.startsWith('#')) colorStr = colorStr.substring(1);
                      return {
                          x: v.x,
                          y: v.y,
                          z: v.z,
                          color: parseInt(colorStr, 16)
                      };
                  });

                  if (engineRef.current) {
                      // Load ASSEMBLED (false) so user sees result immediately!
                      // Loading dismantled can be confusing if they don't click rebuild.
                      engineRef.current.loadInitialModel(voxelData, false);
                      
                      // Save to history
                      setCustomBuilds(prev => [...prev, { name: 'Foto Mágica', data: voxelData }]);
                      setCurrentBaseModel('Foto Mágica');
                  }
              }
          };
      } catch (e) {
          console.error("Photo gen error", e);
          alert("No pudimos procesar la foto correctamente. Intenta con una imagen más clara o de cuerpo completo.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handlePromptSubmit = async (prompt: string) => {
    if (!process.env.API_KEY) {
        throw new Error("No se encontró la clave API");
    }

    setIsGenerating(true);
    setIsPromptModalOpen(false);
    if (showIntro) setShowIntro(false);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-3-pro-preview';
        
        let systemContext = "";
        if (promptMode === 'morph' && engineRef.current) {
            const availableColors = engineRef.current.getUniqueColors().join(', ');
            systemContext = `
                CONTEXTO: Estás reensamblando vóxeles mágicos para un regalo romántico.
                La pila actual consiste en estos colores: [${availableColors}].
                Trata de usar colores brillantes y felices.
                El modelo debe ser estilo 'chibi', tierno o romántico.
            `;
        } else {
            systemContext = `
                CONTEXTO: Estás creando un arte vóxel 3D muy tierno para regalárselo a una novia.
                Estilo: Chibi, Estética de las Chicas Superpoderosas, Romántico, Kawaii.
            `;
        }

        const response = await ai.models.generateContent({
            model,
            contents: `
                    ${systemContext}
                    Tarea: Generar un modelo de arte vóxel 3D de: "${prompt}".
                    Devuelve SOLAMENTE un array JSON de objetos.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.INTEGER },
                            y: { type: Type.INTEGER },
                            z: { type: Type.INTEGER },
                            color: { type: Type.STRING }
                        },
                        required: ["x", "y", "z", "color"]
                    }
                }
            }
        });

        if (response.text) {
            const rawData = JSON.parse(response.text);
            
            const voxelData: VoxelData[] = rawData.map((v: any) => {
                let colorStr = v.color;
                if (colorStr.startsWith('#')) colorStr = colorStr.substring(1);
                const colorInt = parseInt(colorStr, 16);
                
                return {
                    x: v.x,
                    y: v.y,
                    z: v.z,
                    color: isNaN(colorInt) ? 0xFF69B4 : colorInt
                };
            });

            if (engineRef.current) {
                if (promptMode === 'create') {
                    engineRef.current.loadInitialModel(voxelData, true);
                    setCustomBuilds(prev => [...prev, { name: prompt, data: voxelData }]);
                    setCurrentBaseModel(prompt);
                } else {
                    engineRef.current.rebuild(voxelData);
                    setCustomRebuilds(prev => [...prev, { 
                        name: prompt, 
                        data: voxelData,
                        baseModel: currentBaseModel 
                    }]);
                }
            }
        }
    } catch (err) {
        console.error("Generation failed", err);
        alert("¡Uy! Algo salió mal generando la magia. Intenta de nuevo.");
    } finally {
        setIsGenerating(false);
    }
  };

  const relevantRebuilds = customRebuilds.filter(
      r => r.baseModel === currentBaseModel
  );

  return (
    <div className="relative w-full h-screen bg-[#FFE4E1] overflow-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {/* 3D Container */}
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      {/* UI Overlay */}
      <UIOverlay 
        voxelCount={voxelCount}
        appState={appState}
        currentBaseModel={currentBaseModel}
        customBuilds={customBuilds}
        customRebuilds={relevantRebuilds} 
        isAutoRotate={isAutoRotate}
        isInfoVisible={showEnding} 
        isGenerating={isGenerating}
        onDismantle={handleDismantle}
        onRebuild={handleRebuild}
        onNewScene={handleNewScene}
        onSelectCustomBuild={handleSelectCustomBuild}
        onSelectCustomRebuild={handleSelectCustomRebuild}
        onPromptCreate={() => openPrompt('create')}
        onPromptMorph={() => openPrompt('morph')}
        onShowJson={handleShowJson}
        onImportJson={handleImportClick}
        onToggleRotation={handleToggleRotation}
        onToggleInfo={() => setShowEnding(!showEnding)}
        onPhotoUpload={handlePhotoUploadClick}
      />

      <WelcomeScreen 
        visible={showIntro || showEnding} 
        mode={showEnding ? 'ending' : 'intro'}
        onClose={() => {
            setShowIntro(false);
            setShowEnding(false);
        }}
      />

      <JsonModal 
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        data={jsonData}
        isImport={jsonModalMode === 'import'}
        onImport={handleJsonImport}
      />

      <PromptModal
        isOpen={isPromptModalOpen}
        mode={promptMode}
        onClose={() => setIsPromptModalOpen(false)}
        onSubmit={handlePromptSubmit}
      />
    </div>
  );
};

export default App;
