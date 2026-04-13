import React, { useState, useEffect } from 'react';
import { 
  Check, ChevronRight, RefreshCw, Sparkles, AlertCircle, ArrowLeft, 
  Lock, Info, ScanFace, User, Mail, Shield, Key
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

import OptionCard from './components/OptionCard';
import ReviewRow from './components/ReviewRow';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import CameraModule from './components/CameraModule';
import { TREATMENTS, MATERIALS, SHADES } from './constants';
import { SelectionState, Treatment, Material, Shade } from './types';

export default function App() {
  const [step, setStep] = useState(0); 
  const [selection, setSelection] = useState<SelectionState>({ treatment: null, material: null, shade: null });
  const [hasConsented, setHasConsented] = useState(false);
  const [image, setImage] = useState<string | null>(null); 
  const [isSimulating, setIsSimulating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  // Check for API Key on mount
  useEffect(() => {
    const checkApiKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleStartFlow = async () => {
    if (!apiKeySelected) {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        try {
          await (window as any).aistudio.openSelectKey();
          setApiKeySelected(true);
        } catch (e) {
          console.error("API Key selection failed", e);
        }
      } else {
        console.warn("window.aistudio not found, proceeding (might fail if key not in env)");
        nextStep();
      }
    } else {
      nextStep();
    }
  };

  const handleSelect = (key: keyof SelectionState, value: Treatment | Material | Shade) => {
    setSelection(prev => ({ ...prev, [key]: value }));
    nextStep();
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => Math.max(0, prev - 1));

  const handleImageCapture = (imgData: string) => {
    setImage(imgData);
    nextStep();
  };

  const generateSimulation = async () => {
    setIsSimulating(true);
    setError(null);

    try {
      if (!image) throw new Error("No image data available to simulate.");

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const treatment = selection.treatment;
      const material = selection.material;
      const shade = selection.shade;
      
      const isStructural = treatment?.structuralChange ?? true;

      let anatomicalDirectives = "";
      
      if (!isStructural) {
        anatomicalDirectives = `Only adjust color/brightness. DO NOT change tooth shape, fix chips, or close gaps. Preserve original texture.`;
      } else {
        anatomicalDirectives = `Correct shape and alignment for symmetry. Straighten teeth within the open mouth area.`;
      }

      const prompt = `Edit the teeth in this image to simulate ${treatment?.title} using ${material?.title} (${shade?.title}).
${treatment?.promptContext}
${material?.promptMod}
${shade?.promptMod}
${anatomicalDirectives}
CRITICAL: Keep the original face, lips, mouth shape, and framing EXACTLY the same. Only modify the teeth.`;

      // Extract MIME type and base64 data
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      let mimeType = 'image/jpeg';
      let base64Data = image;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      }

      // Using Gemini 2.5 Flash Image for editing
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: prompt
            }
          ]
        }
      });

      let generatedBase64 = null;
      
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedBase64 = part.inlineData.data;
            const outMime = part.inlineData.mimeType || 'image/png';
            setResultImage(`data:${outMime};base64,${generatedBase64}`);
            break;
          }
        }
      }

      if (!generatedBase64) {
        const textOutput = response.text;
        if (textOutput) {
             throw new Error("AI Refusal: " + textOutput);
        }
        throw new Error("No image generated. The model might have filtered the response due to safety settings.");
      }

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("API key not valid") || err.message?.includes("API_KEY")) {
         setError("Invalid API Key. Please restart and select a valid Paid API Key.");
         setApiKeySelected(false);
      } else {
         setError("Simulation failed. " + (err.message || "Unknown error"));
      }
    } finally {
      setIsSimulating(false);
    }
  };

  // Main Container is fixed h-screen to prevent global scroll
  return (
    <div className="fixed inset-0 bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 flex flex-col">
      {step > 0 && (
        <header className="bg-white border-b border-slate-200 flex-none z-50">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">D</div>
              <span className="font-bold text-base tracking-tight text-blue-950">DENTAKAY<span className="text-blue-500 font-light">VISUALS</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Preview Mode</span>
            </div>
          </div>
          <div className="h-1 bg-slate-100 w-full">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out" 
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </header>
      )}

      {/* Main content area expands to fill remaining height */}
      <main className={`flex-1 flex flex-col min-h-0 w-full max-w-md mx-auto relative ${step === 0 ? '' : 'bg-slate-50'}`}>
        
        {step > 1 && step < 7 && (
          <div className="flex-none px-4 pt-4 pb-2">
            <button 
              onClick={prevStep}
              className="flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>
        )}

        {/* Inner content is scrollable if needed, but we try to fit */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-hide">

          {/* --- STEP 0: INTRO SCREEN --- */}
          {step === 0 && (
            <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-950 via-slate-900 to-black text-white relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

              <div className="z-10 text-center space-y-6 max-w-sm flex flex-col h-full justify-center">
                 <div className="flex-1 flex flex-col justify-center items-center">
                   <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto border border-white/20 shadow-2xl mb-8">
                     D
                   </div>
                   
                   <div className="space-y-4 mb-8">
                     <h1 className="text-4xl font-bold tracking-tight leading-tight">
                       See Your Future <span className="text-blue-400">Smile</span>
                     </h1>
                     <p className="text-slate-300 text-lg font-light leading-relaxed">
                       Experience your dental transformation instantly using AI.
                     </p>
                   </div>
                 </div>

                 <div className="w-full pb-8">
                   <button 
                     onClick={handleStartFlow}
                     className={`group relative w-full py-4 px-8 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all overflow-hidden ${apiKeySelected ? 'bg-white text-blue-950' : 'bg-blue-600 text-white'}`}
                   >
                     <span className="relative z-10 flex items-center justify-center">
                       {apiKeySelected ? (
                           <>
                             Start Visualisation
                             <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                           </>
                       ) : (
                           <>
                              <Key className="w-5 h-5 mr-2" />
                              See Your Future Smile
                           </>
                       )}
                     </span>
                     {apiKeySelected && <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />}
                   </button>

                   <div className="flex items-center justify-center space-x-4 text-slate-400 text-[10px] font-medium mt-6">
                     <div className="flex items-center"><Shield className="w-3 h-3 mr-1" />GDPR Safe</div>
                     <div className="flex items-center"><ScanFace className="w-3 h-3 mr-1" />No Storage</div>
                     <div className="flex items-center"><Sparkles className="w-3 h-3 mr-1" />AI Powered</div>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {/* --- STEP 1: TREATMENT --- */}
          {step === 1 && (
            <div className="animate-fade-in py-2">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Select Treatment</h1>
              <p className="text-slate-500 mb-6">Choose the procedure you are interested in.</p>
              <div className="space-y-3">
                {TREATMENTS.map((t) => (
                  <OptionCard 
                    key={t.id} 
                    title={t.title} 
                    desc={t.desc} 
                    icon={t.icon}
                    onClick={() => handleSelect('treatment', t)} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* --- STEP 2: MATERIAL --- */}
          {step === 2 && (
            <div className="animate-fade-in py-2">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Select Material</h1>
              <p className="text-slate-500 mb-6">Preferred brand or material for {selection.treatment?.title}.</p>
              <div className="space-y-3">
                {(selection.treatment && MATERIALS[selection.treatment.id] ? MATERIALS[selection.treatment.id] : MATERIALS.veneers).map((m) => (
                  <OptionCard 
                    key={m.id} 
                    title={m.title} 
                    desc={m.desc} 
                    onClick={() => handleSelect('material', m)} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* --- STEP 3: SHADE --- */}
          {step === 3 && (
            <div className="animate-fade-in py-2">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Select Shade</h1>
              <p className="text-slate-500 mb-6">From Hollywood bright to natural aesthetics.</p>
              <div className="grid grid-cols-1 gap-3">
                {SHADES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect('shade', s)}
                    className="group relative flex items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left"
                  >
                    <div className={`w-12 h-12 rounded-full border-2 border-slate-100 shadow-inner mr-4 flex-shrink-0 bg-gradient-to-br from-white to-slate-100`} 
                         style={{ 
                           backgroundColor: s.id === 'bl1' ? '#ffffff' : s.id === 'a2' ? '#fefce0' : '#fffdf5' 
                         }} 
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{s.title}</div>
                      <div className="text-sm text-slate-500">{s.desc}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- STEP 4: CONSENT & CAMERA --- */}
          {step === 4 && (
            <div className="animate-fade-in h-full flex flex-col">
              {!hasConsented ? (
                 <div className="flex flex-col h-full pt-2">
                   <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6 flex-1 flex flex-col justify-center">
                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 mx-auto">
                       <Lock className="w-6 h-6" />
                     </div>
                     <h2 className="text-lg font-bold text-slate-900 mb-2 text-center">Privacy & Consent</h2>
                     <p className="text-sm text-slate-600 mb-4 leading-relaxed text-center">
                       To generate your smile preview, we need to process your photo temporarily.
                     </p>
                     <ul className="space-y-3 mb-6 flex-1">
                       <li className="flex items-start text-sm text-slate-700">
                         <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                         <span>Your photo is processed temporarily for this simulation only.</span>
                       </li>
                       <li className="flex items-start text-sm text-slate-700">
                         <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                         <span>We do not store your face data for identification.</span>
                       </li>
                       <li className="flex items-start text-sm text-slate-700">
                         <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                         <span>This is a visual preview, <strong>not a medical diagnosis</strong>.</span>
                       </li>
                     </ul>
                     
                     <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-400 transition-colors">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                          onChange={(e) => {
                            if(e.target.checked) setHasConsented(true);
                          }}
                        />
                        <span className="text-xs text-slate-500 font-medium">
                          I consent to processing my photo for this simulation.
                        </span>
                     </label>
                   </div>
                   <div className="text-center pb-4">
                      <button 
                        disabled={!hasConsented}
                        onClick={() => {}} 
                        className={`px-6 py-4 rounded-full font-bold w-full transition-colors ${hasConsented ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        {hasConsented ? 'Continue to Camera' : 'Accept to Continue'}
                      </button>
                   </div>
                 </div>
              ) : (
                <div className="fixed inset-0 z-50 bg-black">
                  <CameraModule onCapture={handleImageCapture} />
                </div>
              )}
            </div>
          )}

          {/* --- STEP 5: REVIEW --- */}
          {step === 5 && (
            <div className="animate-fade-in flex flex-col h-full">
               <div className="flex-none">
                 <h1 className="text-2xl font-bold text-slate-900 mb-2">Ready to Visualize?</h1>
                 <p className="text-slate-500 mb-4">We will simulate your new smile.</p>
               </div>
               
               <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4 space-y-2 flex-none">
                 <ReviewRow label="Treatment" value={selection.treatment?.title} />
                 <ReviewRow label="Material" value={selection.material?.title} />
                 <ReviewRow label="Shade" value={selection.shade?.title} />
               </div>

               <div className="flex-1 min-h-0 relative bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-200">
                  {image && <img src={image} alt="Original" className="absolute inset-0 w-full h-full object-cover" />}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">Original Photo</p>
                  </div>
               </div>

               <div className="flex-none pb-4">
                 <button 
                   onClick={() => { nextStep(); generateSimulation(); }}
                   className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2"
                 >
                   <Sparkles className="w-5 h-5" />
                   <span>Generate Smile</span>
                 </button>
                 <p className="text-xs text-slate-400 text-center mt-3">
                   By clicking Generate, you agree to our Terms of Service.
                 </p>
               </div>
            </div>
          )}

          {/* --- STEP 6: PROCESSING & LEAD GATE --- */}
          {step === 6 && (
            <div className="animate-fade-in h-full flex flex-col">
              {isSimulating ? (
                /* LOADING STATE */
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Analysing Anatomy...</h2>
                  <p className="text-slate-500 text-sm">Our AI is designing your {selection.treatment?.title} using {selection.material?.title} parameters.</p>
                </div>
              ) : error ? (
                 /* ERROR STATE */
                 <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                   <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                     <AlertCircle className="w-8 h-8" />
                   </div>
                   <h2 className="text-xl font-bold text-slate-800 mb-2">Simulation Failed</h2>
                   <p className="text-slate-500 mb-6">{error}</p>
                   <button onClick={() => setStep(4)} className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium">Try Another Photo</button>
                 </div>
              ) : (
                /* LEAD GATE STATE */
                <div className="flex-1 flex flex-col justify-center px-2">
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl text-center flex flex-col h-full max-h-[600px] justify-center">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Check className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Smile is Ready!</h2>
                      <p className="text-slate-500 mb-6 text-sm">
                        High-resolution simulation generated.
                      </p>

                      <div className="space-y-3 text-left mb-6">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 ml-1">Full Name</label>
                          <div className="relative mt-1">
                            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="John Doe" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700 ml-1">Email Address</label>
                          <div className="relative mt-1">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input type="email" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="john@example.com" />
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={nextStep}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2"
                      >
                        <span>Unlock My New Smile</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      <button 
                        onClick={nextStep}
                        className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2"
                      >
                        Demo Mode: Skip this step
                      </button>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* --- STEP 7: FINAL RESULT --- */}
          {step === 7 && (
            <div className="animate-fade-in flex flex-col h-full pb-4">
                <div className="flex items-center justify-between mb-2 flex-none">
                  <h1 className="text-xl font-bold text-slate-900">Your New Smile</h1>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">AI Simulation</span>
                </div>
                
                {/* Before / After Slider - Flex Grow to fill space */}
                <div className="flex-1 min-h-0 mb-4 relative flex flex-col justify-center">
                  {image && resultImage && (
                    <div className="h-full w-full flex items-center justify-center bg-black rounded-2xl overflow-hidden shadow-lg">
                      <BeforeAfterSlider original={image} simulation={resultImage} />
                    </div>
                  )}
                  <div className="flex justify-between mt-2 text-xs text-slate-400 px-1 flex-none">
                    <span>Original</span>
                    <span>Simulation</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4 flex-none">
                   <div className="flex items-start space-x-3">
                     <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                     <div className="text-[10px] text-slate-600 leading-relaxed">
                       <strong>Visualisation Only:</strong> This is an AI-generated preview for aesthetic purposes. It is not a clinical guarantee or a medical diagnosis. A dentist must assess your oral health.
                     </div>
                   </div>
                </div>

                <div className="space-y-3 flex-none mt-auto">
                   <button 
                    onClick={() => setStep(0)}
                    className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center"
                   >
                     <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                   </button>
                   <button className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-colors">
                     Get Free Treatment Plan
                   </button>
                </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
