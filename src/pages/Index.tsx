import React, { useEffect, useState } from 'react';
import Terminal from '@/components/Terminal';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Animate the terminal appearance for a smoother experience
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
      <div className={`w-full max-w-4xl transition-all duration-700 ease-out transform ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="text-center mb-8 space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-terminal-accent/10 text-terminal-accent text-xs font-medium mb-2 tracking-wide animate-slide-up">
            UBUNTU TERMINAL EMULATOR
          </div>

        </div>
        
        <Terminal />
        
      </div>
    </div>
  );
};

export default Index;
