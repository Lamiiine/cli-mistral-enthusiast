
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
            MISTRAL AI CLI EMULATOR
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Interactive Terminal Experience
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            A minimalist CLI emulator powered by Mistral AI. Type <code className="text-terminal-accent px-1.5 py-0.5 rounded bg-terminal-accent/10">help</code> to get started.
          </p>
        </div>
        
        <Terminal />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Built with precision and simplicity in mind.
            <br />
            <span className="text-xs opacity-75">Use <code className="text-xs text-terminal-accent/80 px-1 py-0.5 rounded bg-terminal-accent/5">mistral</code> command to interact with the AI.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
