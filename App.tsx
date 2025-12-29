import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import { NavBar } from './components/NavBar';
import { Gallery } from './components/Gallery';
import { HeroJourney } from './components/HeroJourney';
import FlightBookView from './components/FlightBookView';
import { SpitfireInteractive } from './components/SpitfireInteractive';

const App: React.FC = () => {
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);

  // Temporary loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAssetsLoading(false);
    }, 250); // 0.25 seconds delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-900 font-sans">
        {!hasEntered && <LoadingScreen isLoaded={!isAssetsLoading} onEnter={() => setHasEntered(true)} />}
        
        {hasEntered && (
          <>
            <NavBar />
            <div className="flex-1 overflow-hidden flex flex-col">
              <Routes>
                <Route path="/" element={<FlightBookView />} />
                <Route path="/journey" element={<HeroJourney />} />
                <Route path="/spitfire" element={<SpitfireInteractive />} />
                <Route path="/gallery" element={<Navigate to="/gallery/photos" replace />} />
                <Route path="/gallery/:tab" element={<Gallery />} />
                <Route path="/gallery/:tab/:itemId" element={<Gallery />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
