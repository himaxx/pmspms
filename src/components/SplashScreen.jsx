import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [stage, setStage] = useState('entering');

  useEffect(() => {
    // Start exit animation after 2.5 seconds
    const timer1 = setTimeout(() => {
      setStage('exiting');
    }, 2500);

    // Call onFinish to completely unmount after exit animation completes
    const timer2 = setTimeout(() => {
      onFinish();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        stage === 'exiting' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background decoration - subtle gradients matching Ketan logo colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#00AEEF]/10 blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#FA97B6]/10 blur-[120px]" />
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FFD15C]/10 blur-[90px]" />
      </div>

      <div className="relative flex flex-col items-center justify-center p-8 w-full max-w-sm">
        {/* Logo container with scale and fade */}
        <div 
           className="animate-[slideUp_800ms_cubic-bezier(0.22,1,0.36,1)_both]"
        >
          <img
            src="/ketan_logo.png"
            alt="Ketan App Logo"
            className="w-[280px] h-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
          />
        </div>

        {/* Bouncing dots - colors manually extracted from the Ketan logo */}
        <div className="mt-14 flex gap-2.5 animate-[fadeIn_600ms_ease-in-out_600ms_both]">
           <div className="w-2.5 h-2.5 rounded-full bg-[#00AEEF] animate-bounce shadow-sm" style={{ animationDelay: '0ms' }} />
           <div className="w-2.5 h-2.5 rounded-full bg-[#FA97B6] animate-bounce shadow-sm" style={{ animationDelay: '150ms' }} />
           <div className="w-2.5 h-2.5 rounded-full bg-[#FFD15C] animate-bounce shadow-sm" style={{ animationDelay: '300ms' }} />
           <div className="w-2.5 h-2.5 rounded-full bg-[#8CC63F] animate-bounce shadow-sm" style={{ animationDelay: '450ms' }} />
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center animate-[fadeIn_800ms_ease-in-out_800ms_both]">
         <span className="text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase opacity-70">Production Management</span>
      </div>
    </div>
  );
}
