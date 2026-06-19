'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileSplash } from './MobileSplash';
import { MobileOnboarding } from './MobileOnboarding';
import { MobileLogin } from './MobileLogin';
import { MobileHome } from './MobileHome';
import { MobileShop } from './MobileShop';
import { MobilePDP } from './MobilePDP';
import { MobileCompare } from './MobileCompare';
import { MobileAnalyser } from './MobileAnalyser';
import { MobileRoutine } from './MobileRoutine';
import { MobileLearn } from './MobileLearn';
import { MobileAdmin } from './MobileAdmin';

export type ScreenType = 
  | 'SPLASH' 
  | 'ONBOARDING' 
  | 'LOGIN' 
  | 'HOME' 
  | 'SHOP' 
  | 'PDP' 
  | 'COMPARE' 
  | 'ANALYSER' 
  | 'ROUTINE' 
  | 'LEARN' 
  | 'ADMIN';

export default function MobileAppFrame() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('SPLASH');
  const [user, setUser] = useState<{ name: string; email: string; isGuest: boolean } | null>(null);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [routineProfile, setRoutineProfile] = useState<any>(null);

  // Auto-login guest for direct testing if they bypass screens, but let's follow the flow
  const handleSplashComplete = () => {
    setActiveScreen('ONBOARDING');
  };

  const handleOnboardingComplete = () => {
    setActiveScreen('LOGIN');
  };

  const handleLoginComplete = (userData: { name: string; email: string; isGuest: boolean }) => {
    setUser(userData);
    setActiveScreen('HOME');
  };

  const handleNavigate = (screen: ScreenType, productId?: string) => {
    if (productId) {
      setSelectedProductId(productId);
    }
    setActiveScreen(screen);
  };

  const handleToggleSave = (productId: string) => {
    setSavedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleToggleCompare = (productId: string) => {
    setCompareList(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 4) {
        alert("You can compare a maximum of 4 products.");
        return prev;
      }
      return [...prev, productId];
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#282828] flex items-center justify-center p-0 md:p-6 font-sans">
      {/* Mobile Mock Container Bezel */}
      <div className="relative w-full max-w-[390px] h-screen md:h-[844px] bg-white md:rounded-[40px] md:shadow-[0_24px_50px_rgba(0,0,0,0.3)] md:border-[12px] md:border-[#282828] overflow-hidden flex flex-col justify-between">
        
        {/* Mock Notch / Dynamic Island on desktop bezel */}
        <div className="hidden md:block absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#282828] rounded-full z-50 pointer-events-none" />

        <div className="flex-grow overflow-y-auto h-full relative flex flex-col bg-white">
          <AnimatePresence mode="wait">
            {activeScreen === 'SPLASH' && (
              <motion.div key="splash" className="absolute inset-0 z-40" exit={{ opacity: 0 }}>
                <MobileSplash onComplete={handleSplashComplete} />
              </motion.div>
            )}

            {activeScreen === 'ONBOARDING' && (
              <motion.div key="onboarding" className="absolute inset-0 z-30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MobileOnboarding onComplete={handleOnboardingComplete} />
              </motion.div>
            )}

            {activeScreen === 'LOGIN' && (
              <motion.div key="login" className="absolute inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MobileLogin onLogin={handleLoginComplete} />
              </motion.div>
            )}

            {activeScreen === 'HOME' && (
              <motion.div key="home" className="w-full h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MobileHome 
                  user={user} 
                  onNavigate={handleNavigate} 
                  savedProducts={savedProducts}
                  compareList={compareList}
                  onToggleSave={handleToggleSave}
                  onToggleCompare={handleToggleCompare}
                />
              </motion.div>
            )}

            {activeScreen === 'SHOP' && (
              <motion.div key="shop" className="w-full h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MobileShop 
                  onNavigate={handleNavigate}
                  savedProducts={savedProducts}
                  compareList={compareList}
                  onToggleSave={handleToggleSave}
                  onToggleCompare={handleToggleCompare}
                />
              </motion.div>
            )}

            {activeScreen === 'PDP' && (
              <motion.div key="pdp" className="w-full h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MobilePDP 
                  productId={selectedProductId}
                  onNavigate={handleNavigate}
                  savedProducts={savedProducts}
                  compareList={compareList}
                  onToggleSave={handleToggleSave}
                  onToggleCompare={handleToggleCompare}
                />
              </motion.div>
            )}

            {activeScreen === 'COMPARE' && (
              <motion.div key="compare" className="w-full h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MobileCompare 
                  compareList={compareList}
                  onNavigate={handleNavigate}
                  onToggleCompare={handleToggleCompare}
                />
              </motion.div>
            )}

            {activeScreen === 'ANALYSER' && (
              <motion.div key="analyser" className="w-full h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MobileAnalyser 
                  onNavigate={handleNavigate}
                />
              </motion.div>
            )}

            {activeScreen === 'ROUTINE' && (
              <motion.div key="routine" className="w-full h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MobileRoutine 
                  profile={routineProfile}
                  setProfile={setRoutineProfile}
                  onNavigate={handleNavigate}
                />
              </motion.div>
            )}

            {activeScreen === 'LEARN' && (
              <motion.div key="learn" className="w-full h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MobileLearn 
                  onNavigate={handleNavigate}
                />
              </motion.div>
            )}

            {activeScreen === 'ADMIN' && (
              <motion.div key="admin" className="w-full h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MobileAdmin 
                  onNavigate={handleNavigate}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
