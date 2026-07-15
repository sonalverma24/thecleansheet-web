'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileOnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Shop beauty with proof, not promises.",
    description: "Our rigorous methodology evaluates every ingredient, so you don't have to guess.",
    imageUrl: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=900&q=85&auto=format&fit=crop",
    type: "image"
  },
  {
    title: "Understand every product before you buy.",
    description: "Access detailed analyses of safety, efficacy, and environmental impact.",
    type: "ui-mock"
  },
  {
    title: "Build routines based on your skin profile.",
    description: "Personalized recommendations tailored to your unique biology and environment.",
    imageUrl: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=900&q=85&auto=format&fit=crop",
    type: "image"
  },
  {
    title: "Buy where you already shop.",
    description: "Seamlessly connect your existing retailer accounts to verify purchases instantly.",
    type: "retailers-mock"
  }
];

export function MobileOnboarding({ onComplete }: MobileOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="w-full h-full bg-[#ffffff] flex flex-col justify-between p-6 relative select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center py-2 z-10">
        <div className="w-8 h-8 rounded-full bg-[#f9f8f7] border border-[#b0a8a4]/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#248179] text-lg">spa</span>
        </div>
        <h2 className="font-display text-lg tracking-tight text-[#248179]">THE CLEAN SHEET</h2>
        <div className="w-8" />
      </div>

      {/* Main Slide Carousel */}
      <div className="flex-grow flex items-center justify-center relative overflow-hidden my-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="w-full flex flex-col h-full justify-between"
          >
            {/* Slide Text Content */}
            <div className="flex flex-col items-start pt-4">
              <h3 className="font-display text-[26px] leading-[32px] text-[#248179] mb-4">
                {slides[currentSlide].title}
              </h3>
              <p className="font-sans text-[14px] leading-[22px] text-[#b0a8a4]">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Slide Graphic Mockup */}
            <div className="w-full h-[260px] xs:h-[300px] mt-6 bg-[#f9f8f7] border border-[#b0a8a4]/20 rounded-lg overflow-hidden relative flex items-center justify-center">
              {slides[currentSlide].type === "image" && (
                <img 
                  alt="Onboarding Visual" 
                  className="w-full h-full object-cover"
                  src={slides[currentSlide].imageUrl} 
                />
              )}

              {slides[currentSlide].type === "ui-mock" && (
                <div className="w-[85%] bg-white border border-[#b0a8a4]/20 p-5 flex flex-col gap-3 shadow-[0_20px_40px_rgba(0,103,96,0.03)] z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#248179]"></div>
                    <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase">Ingredient Analysis</span>
                  </div>
                  <div className="h-px w-full bg-[#b0a8a4]/20" />
                  <div className="flex justify-between items-center py-1">
                    <span className="font-sans text-[14px] text-[#282828]">Niacinamide</span>
                    <span className="font-sans text-[11px] tracking-wider text-[#248179] bg-[#248179]/10 px-2 py-0.5 rounded-full">SAFE</span>
                  </div>
                  <div className="h-px w-full bg-[#b0a8a4]/20" />
                  <div className="flex justify-between items-center py-1">
                    <span className="font-sans text-[14px] text-[#282828]">Phenoxyethanol</span>
                    <span className="font-sans text-[11px] tracking-wider text-[#fd6158] bg-[#fd6158]/10 px-2 py-0.5 rounded-full">FLAGGED</span>
                  </div>
                </div>
              )}

              {slides[currentSlide].type === "retailers-mock" && (
                <div className="flex flex-col gap-4 items-center w-full px-6">
                  <div className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase mb-1">Supported Retailers</div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {["Amazon", "Nykaa", "Tira", "Myntra"].map((store, i) => (
                      <div key={i} className="bg-white border border-[#b0a8a4]/30 rounded py-3 flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                        <span className="font-sans text-[13px] tracking-wider text-[#282828] uppercase">{store}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-4 pt-2 z-10">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 items-center">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-6 bg-[#248179]' : 'w-2 bg-[#b0a8a4]/30'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center w-full mt-2">
          {currentSlide < slides.length - 1 ? (
            <>
              <button 
                onClick={handleSkip}
                className="font-sans text-[12px] tracking-[0.08em] text-[#b0a8a4] hover:text-[#248179] py-2 px-3 uppercase transition-colors"
              >
                Skip
              </button>
              <button 
                onClick={handleNext}
                className="bg-[#248179] text-white font-sans text-[12px] tracking-[0.08em] uppercase px-8 py-3.5 rounded-full hover:bg-[#248179]/90 transition-colors shadow-[0_8px_16px_rgba(0,103,96,0.1)]"
              >
                Continue
              </button>
            </>
          ) : (
            <button 
              onClick={handleNext}
              className="w-full bg-[#248179] text-white font-sans text-[12px] tracking-[0.08em] uppercase py-4 rounded-full text-center hover:bg-[#248179]/90 transition-all duration-300 shadow-[0_8px_20px_rgba(0,103,96,0.12)]"
            >
              Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
