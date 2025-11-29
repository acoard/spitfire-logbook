import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#dcd0b2] overflow-hidden">
      {/* Background Texture/Effects */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235c4033' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
           }} 
      />
      
      {/* Coffee stains / vintage texture overlays - simulated with radial gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,_rgba(101,67,33,0.15)_0%,_transparent_20%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_90%_80%,_rgba(101,67,33,0.2)_0%,_transparent_25%)] pointer-events-none" />

      <div className="relative w-full max-w-4xl h-full max-h-[90vh] p-8 flex flex-col items-center justify-center">
        
        {/* Main Content Container */}
        <div className="relative bg-[#f4f1ea] p-4 shadow-[0_0_15px_rgba(0,0,0,0.3)] rotate-1 max-w-2xl w-full border border-stone-300">
          
          {/* Tape effects */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#e8dfc8] opacity-80 rotate-1 shadow-sm z-10"></div>
          
          <div className="flex flex-col md:flex-row gap-6 p-4 border-2 border-stone-300 border-dashed min-h-[400px]">
            
            {/* Left Column: Text */}
            <div className="flex-1 flex flex-col justify-center items-center md:items-start space-y-6 relative">
              <div className="absolute top-0 left-0 -rotate-6 opacity-80">
                 <span className="font-typewriter text-xs border border-stone-800 p-1 px-2">1940s</span>
              </div>
              
              <div className="text-center md:text-left mt-8 md:mt-0">
                <h1 className="font-handwriting text-5xl text-stone-800 mb-2 transform -rotate-2">Spitfire</h1>
                <h2 className="font-handwriting text-4xl text-stone-700 ml-8 transform -rotate-1">Pilot Logbook</h2>
              </div>

              <div className="bg-white p-2 shadow-md rotate-2 w-48 self-center md:self-start border border-stone-200">
                 <img 
                   src="Spitfire-MkIX.jpg" 
                   alt="Spitfire Sketch" 
                   className="w-full h-auto sepia filter contrast-75"
                 />
                 <div className="text-center font-typewriter text-[10px] mt-1 text-stone-500">Fig. 1 - Supermarine</div>
              </div>
            </div>

            {/* Right Column: Pilot Photo */}
            <div className="flex-1 relative flex items-center justify-center">
               <div className="relative bg-stone-200 p-2 shadow-lg -rotate-1">
                  {/* Photo Corners */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-stone-700 z-10"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-stone-700 z-10"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-stone-700 z-10"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-stone-700 z-10"></div>
                  
                  <div className="w-64 h-80 overflow-hidden bg-stone-800 grayscale sepia-[.2] relative">
                    <img 
                        src="standing-by-spitfire.png"
                        alt="Pilot standing by Spitfire" 
                        className="w-full h-full object-cover opacity-90"
                    />
                    {/* Scratches overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-20 mix-blend-overlay"></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Bottom Section: Loading Indicator */}
          <div className="mt-8 flex flex-col items-center justify-center">
             <div className="relative w-24 h-24 flex items-center justify-center">
               {/* Propeller Animation */}
               <div className="absolute inset-0 animate-spin duration-[3000ms] linear">
                 <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm opacity-80">
                    <path d="M50 50 C 60 30, 70 10, 50 5 C 30 10, 40 30, 50 50" fill="#3d342b" />
                    <path d="M50 50 C 70 60, 90 70, 95 50 C 90 30, 70 40, 50 50" fill="#3d342b" />
                    <path d="M50 50 C 40 70, 30 90, 50 95 C 70 90, 60 70, 50 50" fill="#3d342b" />
                    <path d="M50 50 C 30 40, 10 30, 5 50 C 10 70, 30 60, 50 50" fill="#3d342b" />
                    <circle cx="50" cy="50" r="5" fill="#5c4d42" />
                 </svg>
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 border-2 border-stone-400 rounded-full border-dashed opacity-40 animate-[spin_10s_linear_infinite]"></div>
               </div>
             </div>
             <div className="font-typewriter text-xl mt-4 text-stone-700 tracking-widest">LOADING...</div>
             
             {/* Handwritten Note */}
             <div className="absolute bottom-10 right-10 transform rotate-3 hidden md:block">
               <div className="font-handwriting text-stone-600 text-lg w-40 leading-5">
                 "Mission records retrieving... standby for briefing."
               </div>
               <div className="w-full h-px bg-stone-400 mt-1"></div>
             </div>
          </div>

        </div>
        
        {/* Stamps */}
        <div className="absolute top-10 right-10 transform rotate-12 opacity-70 pointer-events-none hidden md:block">
            <div className="border-4 border-red-800/60 text-red-800/60 rounded-full w-32 h-32 flex items-center justify-center font-old-print font-bold text-xl p-2 text-center rotate-[-15deg]">
                OFFICIAL<br/>SECRET
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

