import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';

interface Unit {
  id: string;
  name: string;
  description: string;
  shortLabel: string;
  icon: string;
  glowColor: string;
}

const units: Unit[] = [
  {
    id: 'fire',
    name: 'The Fire',
    description: 'Hot / Angry / Frustrated',
    shortLabel: 'Hot / Angry / Frustrated',
    icon: '🔥',
    glowColor: '#FF6B35', // Orange/red glow
  },
  {
    id: 'static',
    name: 'The Static',
    description: 'Worried / Jittery / Scared',
    shortLabel: 'Worried / Jittery / Scared',
    icon: '⚡',
    glowColor: '#FFD93D', // Yellow glow
  },
  {
    id: 'cloud',
    name: 'The Cloud',
    description: 'Heavy / Sad / Tired',
    shortLabel: 'Heavy / Sad / Tired',
    icon: '☁️',
    glowColor: '#6C7A89', // Blue-gray glow
  },
  {
    id: 'spark',
    name: 'The Spark',
    description: 'Busy / Fast / Everywhere',
    shortLabel: 'Busy / Fast / Everywhere',
    icon: '✨',
    glowColor: '#9B59B6', // Purple glow
  },
];

const B4Clicker: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screen, setScreen] = useState<'intro' | 'selection' | 'acknowledgement' | 'mission' | 'success'>('intro');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedUnitData, setSelectedUnitData] = useState<Unit | null>(null);

  const missions: Record<string, { header: string; script: string }> = {
    fire: {
      header: 'Cool the Flames',
      script: 'Press your hands together hard.\nHold for 5… 4… 3… 2… 1…\nRelease and shake them out.',
    },
    static: {
      header: 'Calm the Static',
      script: 'Take a deep breath in.\nHold for 3… 2… 1…\nBreathe out slowly.\nRepeat one more time.',
    },
    cloud: {
      header: 'Lift the Cloud',
      script: 'Stretch your arms up high.\nReach for the sky.\nHold for 5… 4… 3… 2… 1…\nLower slowly.',
    },
    spark: {
      header: 'Channel the Energy',
      script: 'Press your hands together hard.\nHold for 5… 4… 3… 2… 1…\nRelease.',
    },
  };

  const missionData = selectedUnit ? missions[selectedUnit] : null;

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setScreen('intro');
    setSelectedUnit(null);
    setSelectedUnitData(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setScreen('intro');
    setSelectedUnit(null);
    setSelectedUnitData(null);
  };

  const handleStartClick = () => {
    setScreen('selection');
  };

  const handleUnitSelect = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (unit) {
      setSelectedUnit(unitId);
      setSelectedUnitData(unit);
      setScreen('acknowledgement');
    }
  };

  const handleStartMission = () => {
    setScreen('mission');
  };

  const handleMissionComplete = () => {
    setScreen('success');
  };

  const handleChooseAnother = () => {
    setScreen('selection');
    setSelectedUnit(null);
    setSelectedUnitData(null);
  };

  const handleAllDone = () => {
    handleCloseModal();
  };

  const canGoBack = screen === 'selection' || screen === 'acknowledgement' || screen === 'mission';

  // Floating organic shapes component
  const FloatingShape = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
    <div
      className={`absolute ${className}`}
      style={{
        borderRadius: style.borderRadius || '50%',
        background: style.background || 'linear-gradient(135deg, rgba(240, 206, 110, 0.2) 0%, rgba(255, 211, 61, 0.15) 100%)',
        opacity: 0.6,
        ...style,
      }}
    />
  );

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header />

      {/* Hero Section with floating shapes */}
      <div className="bg-cream py-20 lg:py-28 relative overflow-hidden" style={{ marginTop: '100px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text and Button */}
            <div className="relative z-10 max-w-xl">
              <p className="text-xs sm:text-sm uppercase tracking-widest text-navy-400 mb-3 text-left">
                COURAGE RESET TOOLS
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 mb-5 text-left leading-[1.05]">
                Courage Command:{' '}
                <span className="text-golden-500">Power up your brain</span>
              </h1>
              <p className="text-lg sm:text-xl text-navy-600 mb-3 font-medium text-left leading-relaxed">
                Feeling a system glitch? Pick a Courage Module to clear the static and get back into the action!
              </p>
              <p className="text-sm md:text-base text-gray-600 mt-3 max-w-[52ch] text-left">
                Each module helps your body and brain reset in a different way.
              </p>
              <div className="text-left mt-12">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleOpenModal}
                  className="w-full sm:w-auto"
                >
                  Get your focus back
                </Button>
              </div>
            </div>

            {/* Right Column - Circular Character Images with Bubble Alignment */}
            <div className="relative flex justify-end min-h-[400px] lg:min-h-[500px]">
              {/* Bubble Field - Anchored to Right Edge */}
              <div className="absolute inset-y-0 right-0 w-[520px] max-w-full pointer-events-none">
                {/* Floating organic shapes */}
                <FloatingShape 
                  className="top-10 -left-4" 
                  style={{ width: '120px', height: '120px', borderRadius: '60% 40% 50% 50%' }}
                />
                <FloatingShape 
                  className="top-20 -right-8" 
                  style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 197, 253, 0.1) 100%)' }}
                />
                <FloatingShape 
                  className="bottom-16 left-1/4" 
                  style={{ width: '100px', height: '100px', borderRadius: '40% 60% 50% 50%', background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.15) 0%, rgba(186, 104, 200, 0.1) 100%)' }}
                />
                <FloatingShape 
                  className="bottom-10 -right-4" 
                  style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(255, 159, 64, 0.1) 100%)' }}
                />

                {/* 3D Small Circles with Animation */}
                <div className="hidden sm:block circle-accent circle-coral w-20 h-20 top-8 right-16 opacity-60" style={{ animationDelay: '0s' }} />
                <div className="hidden sm:block circle-accent circle-coral w-16 h-16 top-32 left-12 opacity-50" style={{ animationDelay: '0.3s' }} />
                <div className="hidden sm:block circle-accent circle-coral w-12 h-12 bottom-24 right-24 opacity-40" style={{ animationDelay: '0.6s' }} />
                <div className="hidden sm:block circle-accent w-14 h-14 bottom-32 left-16 opacity-50" style={{ background: '#FFD93D', animationDelay: '0.2s' }} />
                <div className="hidden sm:block circle-accent circle-coral w-10 h-10 top-40 right-32 opacity-45" style={{ animationDelay: '0.5s' }} />
              </div>

              {/* Circular Character Images - 2x2 Grid - Right-aligned to header button */}
              <div className="relative z-10 flex items-center">
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  {/* Caiden - Top Left */}
                  <button
                    onClick={handleOpenModal}
                    className="flex justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-200 focus-visible:ring-offset-2 rounded-full transition-transform transition-shadow duration-200 hover:scale-[1.03] hover:shadow-xl cursor-pointer"
                    aria-label="Open Courage Module: Caiden"
                  >
                    <div className="w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                      <img 
                        src="/images/Caiden@4x-100.webp" 
                        alt="Caiden" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </button>
                  
                  {/* B-4 - Top Right */}
                  <button
                    onClick={handleOpenModal}
                    className="flex justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-200 focus-visible:ring-offset-2 rounded-full transition-transform transition-shadow duration-200 hover:scale-[1.03] hover:shadow-xl cursor-pointer"
                    aria-label="Open Courage Module: B-4"
                  >
                    <div className="w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                      <img 
                        src="/images/B-4@4x-100.webp" 
                        alt="B-4" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </button>
                  
                  {/* Genesis - Bottom Left */}
                  <button
                    onClick={handleOpenModal}
                    className="flex justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-200 focus-visible:ring-offset-2 rounded-full transition-transform transition-shadow duration-200 hover:scale-[1.03] hover:shadow-xl cursor-pointer"
                    aria-label="Open Courage Module: Genesis"
                  >
                    <div className="w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                      <img 
                        src="/images/Genesis@4x-100.webp" 
                        alt="Genesis" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </button>
                  
                  {/* Turtle - Bottom Right */}
                  <button
                    onClick={handleOpenModal}
                    className="flex justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-200 focus-visible:ring-offset-2 rounded-full transition-transform transition-shadow duration-200 hover:scale-[1.03] hover:shadow-xl cursor-pointer"
                    aria-label="Open Courage Module: Turtle"
                  >
                    <div className="w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                      <img 
                        src="/images/Turtle@4x-100.webp" 
                        alt="Turtle" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informational Section */}
      <div className="py-16 sm:py-20 px-4 mt-16" style={{ backgroundColor: '#F3F7FB' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
              Why B-4 Reset Tools?
            </h2>
            <p className="text-xl sm:text-2xl text-navy-600 font-semibold max-w-3xl mx-auto">
              Because kids don't need to be fixed — they need help understanding their system.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Visual */}
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="bg-white rounded-2xl p-6 text-center border border-navy-100 shadow-sm"
                  >
                    <div className="text-4xl sm:text-5xl mb-3">{unit.icon}</div>
                    <p className="text-sm sm:text-base font-semibold text-navy-600">{unit.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Copy */}
            <div className="order-1 lg:order-2">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 mb-4">
                Built for real moments — at home and in the classroom
              </h3>
              <p className="text-base sm:text-lg text-navy-600 leading-relaxed mb-6">
                The B-4 Reset Tools help children pause, identify how their body feels, and take a small step toward regulation.
                Each interaction follows a simple flow: notice → acknowledge → reset.
                The experience is short, predictable, and non-judgmental — designed to support neurodivergent learners without pressure or overwhelm.
              </p>
              <ul className="space-y-3 text-base sm:text-lg text-navy-600">
                <li className="flex items-start">
                  <span className="text-golden-500 mr-3 font-bold">•</span>
                  <span>Child-led emotional identification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-golden-500 mr-3 font-bold">•</span>
                  <span>No timers, scores, or wrong answers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-golden-500 mr-3 font-bold">•</span>
                  <span>Grounded in body-based calming strategies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-golden-500 mr-3 font-bold">•</span>
                  <span>Designed for neurodivergent learners</span>
                </li>
                <li className="flex items-start">
                  <span className="text-golden-500 mr-3 font-bold">•</span>
                  <span>Usable in under 2 minutes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm sm:text-base text-navy-600 text-center">
            Future expansions may include audio-guided stories and visual storytelling experiences for families and classrooms.
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !canGoBack) {
              handleCloseModal();
            }
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 animate-slide-up">
            {canGoBack && (
              <button
                onClick={() => {
                  if (screen === 'selection') {
                    setScreen('intro');
                  } else if (screen === 'acknowledgement') {
                    setScreen('selection');
                  } else if (screen === 'mission') {
                    setScreen('acknowledgement');
                  }
                }}
                className="absolute top-4 left-4 text-navy-500 hover:text-navy-700 font-semibold flex items-center gap-2 text-sm sm:text-base"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-navy-400 hover:text-navy-600 text-2xl font-bold"
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Intro Screen */}
            {screen === 'intro' && (
              <>
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-navy-500 mb-3">
                    How do you feel right now?
                  </h2>
                  <p className="text-lg sm:text-xl text-navy-600">
                    Pick the Courage Module that feels closest to how your body feels.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartClick}
                    className="w-full sm:w-auto"
                  >
                    Start
                  </Button>
                </div>
              </>
            )}

            {/* Module Selection Screen */}
            {screen === 'selection' && (
              <>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-500 text-center mb-3">
                  Choose Your Courage Module
                </h2>
                <p className="text-lg sm:text-xl text-navy-600 text-center mb-8">
                  Which one feels like you right now? There are no wrong answers.
                </p>
                
                <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
                  {units.map((unit) => (
                    <button
                      key={unit.id}
                      onClick={() => handleUnitSelect(unit.id)}
                      className="relative bg-navy-50 hover:bg-navy-100 border-2 rounded-3xl p-6 sm:p-8 text-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 overflow-hidden"
                      style={{
                        minHeight: '180px',
                        borderColor: unit.glowColor,
                        boxShadow: `0 0 20px ${unit.glowColor}40, inset 0 0 20px ${unit.glowColor}20`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 30px ${unit.glowColor}60, inset 0 0 30px ${unit.glowColor}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 20px ${unit.glowColor}40, inset 0 0 20px ${unit.glowColor}20`;
                      }}
                    >
                      {/* Holographic overlay effect */}
                      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white via-transparent to-transparent pointer-events-none"></div>
                      
                      <div className="mb-4 relative z-10">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center text-5xl sm:text-6xl">
                          {unit.icon}
                        </div>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500 mb-2 relative z-10">
                        {unit.name}
                      </h3>
                      <p className="text-base sm:text-lg text-navy-600 relative z-10">
                        {unit.shortLabel}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Acknowledgement Screen */}
            {screen === 'acknowledgement' && selectedUnitData && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-block mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-navy-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <span className="text-4xl sm:text-5xl text-white">✓</span>
                    </div>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-navy-500 mb-3">
                    {selectedUnitData.name} detected.
                  </h2>
                  <p className="text-lg sm:text-xl text-navy-600 mb-4">
                    Thanks for telling me.
                    <br />
                    Let's help your system reset.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartMission}
                    className="w-full sm:w-auto"
                  >
                    Mission Start
                  </Button>
                </div>
              </>
            )}

            {/* Mission Screen */}
            {screen === 'mission' && selectedUnit && missionData && (
              <>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-navy-500 text-center mb-6">
                  {missionData.header}
                </h2>
                <div className="bg-navy-50 rounded-3xl p-6 sm:p-8 mb-8">
                  <p className="text-lg sm:text-xl text-navy-700 leading-relaxed text-center whitespace-pre-line">
                    {missionData.script}
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleMissionComplete}
                    className="w-full sm:w-auto"
                  >
                    Finished
                  </Button>
                </div>
              </>
            )}

            {/* Success Screen */}
            {screen === 'success' && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-block mb-4">
                    <span className="text-6xl sm:text-7xl">⭐</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-navy-500 mb-3">
                    Mission Accomplished
                  </h2>
                  <p className="text-lg sm:text-xl text-navy-600 mb-6">
                    You have the Courage of Caiden.
                    <br />
                    Your system is doing its best — and you helped it.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleChooseAnother}
                    className="w-full sm:w-auto"
                  >
                    Choose Another Module
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleAllDone}
                    className="w-full sm:w-auto"
                  >
                    All Done for Now
                  </Button>
                </div>
                <div className="text-center">
                  <Link
                    to="/braveminds#library"
                    className="text-sm text-navy-500 hover:text-navy-700 underline"
                    onClick={handleCloseModal}
                  >
                    Download the B-4 Reset Guide
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default B4Clicker;
