import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';

const CourageAcademy: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [role, setRole] = useState<'parent' | 'teacher' | 'counselor' | 'admin'>('teacher');
  const [schoolOrg, setSchoolOrg] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ schoolOrg?: string; email?: string; consent?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>('Mission Preview');

  // Check localStorage on mount
  useEffect(() => {
    const unlocked = localStorage.getItem('cc_toolkit_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
      const storedRole = localStorage.getItem('cc_toolkit_role');
      const storedSchool = localStorage.getItem('cc_toolkit_school');
      const storedEmail = localStorage.getItem('cc_toolkit_email');
      if (storedRole) setRole(storedRole as 'parent' | 'teacher' | 'counselor' | 'admin');
      if (storedSchool) setSchoolOrg(storedSchool);
      if (storedEmail) setEmail(storedEmail);
    }
  }, []);

  const handleComingSoonClick = useCallback(() => {
    // Handler for coming soon clicks
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleEducatorAccessClick = () => {
    const element = document.getElementById('educator-toolkit');
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleToolkitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Validation
    const newErrors: { schoolOrg?: string; email?: string; consent?: string } = {};
    if (!schoolOrg.trim()) {
      newErrors.schoolOrg = 'School or organization is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!consent) {
      newErrors.consent = 'Please consent to receive the toolkit';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Store in localStorage
    localStorage.setItem('cc_toolkit_unlocked', 'true');
    localStorage.setItem('cc_toolkit_role', role);
    localStorage.setItem('cc_toolkit_school', schoolOrg);
    localStorage.setItem('cc_toolkit_email', email);

    // Unlock
    setIsUnlocked(true);
    setIsSubmitting(false);

    // Scroll to unlocked content
    setTimeout(() => {
      const element = document.getElementById('toolkit-downloads');
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      {/* Hero Section with subtle gradient */}
      <div className="bg-white px-4 py-20 sm:py-24 lg:py-28 pb-24 sm:pb-28 lg:pb-32" style={{ marginTop: '100px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column: Text Content */}
            <div className="relative z-10">
              <p className="text-sm sm:text-base text-navy-500 font-semibold mb-3 uppercase tracking-wide">
                COURAGE ACADEMY
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 mb-5">
                Camp Courage
              </h1>
              <p className="text-lg sm:text-xl text-navy-600 max-w-2xl mb-8">
                A calm, welcoming space for kids to practice courage — together with the adults who support them.
              </p>
              <div className="flex flex-col sm:flex-row gap-4" style={{ transform: 'scale(0.9)', transformOrigin: 'left center' }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => scrollToSection('explore-modules')}
                  className="w-full sm:w-auto"
                >
                  Explore the Academy
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleEducatorAccessClick}
                  className="w-full sm:w-auto"
                >
                  Request Educator Access
                </Button>
              </div>
            </div>

            {/* Right Column: Camp Visual */}
            <div className="relative lg:order-2 mt-12 lg:mt-0 flex justify-end">
              {/* Colorful Background Shapes */}
              <div className="absolute inset-0 -z-10" style={{ right: '-40px', left: 'auto', width: '600px', height: '600px' }}>
                {/* Orange shape */}
                <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-orange-400 opacity-40 blur-xl"></div>
                {/* Blue shape */}
                <div className="absolute bottom-1/4 left-1/4 w-40 h-40 rounded-full bg-blue-400 opacity-35 blur-xl"></div>
                {/* Yellow/Golden shape */}
                <div className="absolute top-1/2 left-1/3 w-36 h-36 rounded-full bg-yellow-400 opacity-40 blur-xl"></div>
              </div>

              {/* Masked Image Container */}
              <div className="relative max-w-md lg:max-w-lg z-10" style={{
                clipPath: 'polygon(50% 0%, 88% 10%, 100% 45%, 90% 88%, 52% 100%, 12% 90%, 0% 52%, 10% 12%)',
                border: '3px solid white',
                boxShadow: '0 10px 30px -5px rgba(36, 62, 112, 0.15), 0 4px 12px -2px rgba(36, 62, 112, 0.08)'
              }}>
                <div className="aspect-square bg-gradient-to-br from-navy-100 via-golden-100 to-navy-50 overflow-hidden">
                  <img
                    src="/images/NeuroCamp_smaller.webp"
                    alt="Courage Academy camp visual"
                    className="w-full h-full object-cover scale-110"
                    style={{ objectPosition: 'center center' }}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Floating Sticker Circles */}
              {/* Top-right sticker - Star */}
              <div className="float-y absolute top-4 right-4 lg:top-8 lg:right-8 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-lg z-10 pointer-events-none" style={{
                border: '3px solid white',
                boxShadow: '0 4px 12px rgba(36, 62, 112, 0.15)',
                animationDuration: '6s'
              }}>
                <span className="text-2xl sm:text-3xl">⭐</span>
              </div>

              {/* Mid-left sticker - Target/Arrow (moved closer) */}
              <div className="float-y absolute top-1/3 -translate-y-1/3 -left-2 lg:-left-4 bg-white rounded-full flex items-center justify-center shadow-lg z-10 pointer-events-none" style={{
                border: '3px solid white',
                boxShadow: '0 4px 12px rgba(36, 62, 112, 0.15)',
                width: '56px',
                height: '56px',
                animationDuration: '5s',
                animationDelay: '0.5s'
              }}>
                <span className="text-xl sm:text-2xl">🎯</span>
              </div>

              {/* Bottom-right sticker - Rocket */}
              <div className="float-y absolute bottom-4 right-8 lg:bottom-8 lg:right-12 bg-white rounded-full flex items-center justify-center shadow-lg z-10 pointer-events-none" style={{
                border: '3px solid white',
                boxShadow: '0 4px 12px rgba(36, 62, 112, 0.15)',
                width: '56px',
                height: '56px',
                animationDuration: '7s',
                animationDelay: '1s'
              }}>
                <span className="text-xl sm:text-2xl">🚀</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educator + Parent Toolkit Section */}
      <div id="educator-toolkit" className="py-24 sm:py-28 lg:py-32 px-4 relative overflow-hidden mt-16 lg:mt-20 scroll-mt-[100px]" style={{ backgroundColor: '#F3F8FF' }}>
        {/* Decorative elements */}
        <div className="absolute top-6 right-6 opacity-10">
          <div className="w-20 h-20 bg-navy-400 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold">B-4</span>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 opacity-10">
          <div className="w-16 h-16 bg-golden-400 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-16 lg:mb-20">
            <p className="text-xs sm:text-sm text-navy-500 font-semibold mb-3 uppercase tracking-wider">
              FOR PARENTS + EDUCATORS
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
              Get calm-ready tools for real moments
            </h2>
            <p className="text-lg sm:text-xl text-navy-600 max-w-3xl mx-auto">
              Quick, printable supports for regulation, routines, and confidence — designed for neurodivergent learners.
            </p>
          </div>

          {/* Toolkit Card */}
          {!isUnlocked ? (
            <div className="max-w-5xl mx-auto relative">
              {/* Character Badge */}
              <div className="absolute -top-8 -left-8 z-20 w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-white bg-gradient-to-br from-golden-400/90 to-golden-500/90" style={{ width: '64px', height: '64px', boxShadow: '0 4px 12px rgba(240, 206, 110, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)' }}>
                <span className="text-2xl sm:text-3xl lg:text-4xl">🧩</span>
              </div>
              
              {/* Gradient Background Wash */}
              <div className="absolute inset-0 rounded-2xl opacity-[0.08] pointer-events-none" style={{ 
                background: 'radial-gradient(ellipse at top right, rgba(36, 62, 112, 0.15) 0%, rgba(240, 206, 110, 0.12) 50%, transparent 70%)'
              }}></div>
              
              {/* Dotted Pattern Background */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-2xl opacity-[0.06] pointer-events-none" style={{
                backgroundImage: 'repeating-radial-gradient(circle at 2px 2px, rgba(36, 62, 112, 0.4) 0px, transparent 8px, transparent 16px)'
              }}></div>
              
              <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 relative z-10" style={{
                boxShadow: '0 10px 30px -5px rgba(36, 62, 112, 0.15), 0 4px 12px -2px rgba(36, 62, 112, 0.08)',
                border: '1px solid rgba(36, 62, 112, 0.12)'
              }}>
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                  {/* Left: Form */}
                  <div>
                    <form onSubmit={handleToolkitSubmit} className="space-y-5">
                      {/* Role Selection */}
                      <div>
                        <label htmlFor="role-select" className="block text-sm font-semibold text-navy-700 mb-2.5">
                          I am a:
                        </label>
                        <select
                          id="role-select"
                          value={role}
                          onChange={(e) => setRole(e.target.value as 'parent' | 'teacher' | 'counselor' | 'admin')}
                          className="w-full px-4 py-3 rounded-lg border-2 border-navy-300 focus:border-navy-500 focus:outline-none text-navy-700 text-base bg-white appearance-none cursor-pointer"
                          style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23243E70' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 1rem center',
                            paddingRight: '2.5rem'
                          }}
                        >
                          <option value="parent">Parent / Caregiver</option>
                          <option value="teacher">Teacher</option>
                          <option value="counselor">Counselor</option>
                          <option value="admin">Education Admin</option>
                        </select>
                      </div>

                      {/* School/Organization */}
                      <div>
                        <label htmlFor="school-org" className="block text-sm font-semibold text-navy-700 mb-2.5">
                          School / Organization <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="school-org"
                          type="text"
                          value={schoolOrg}
                          onChange={(e) => setSchoolOrg(e.target.value)}
                          placeholder="e.g., Jefferson Elementary"
                          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none text-navy-700 text-base ${
                            errors.schoolOrg
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-navy-300 focus:border-navy-500'
                          }`}
                        />
                        {errors.schoolOrg && (
                          <p className="mt-2 text-sm text-red-600" role="alert">
                            {errors.schoolOrg}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="toolkit-email" className="block text-sm font-semibold text-navy-700 mb-2.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="toolkit-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@school.org or you@gmail.com"
                          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none text-navy-700 text-base ${
                            errors.email
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-navy-300 focus:border-navy-500'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-2 text-sm text-red-600" role="alert">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Consent Checkbox */}
                      <div>
                        <label className="flex items-start cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="mt-1 w-5 h-5 text-navy-500 border-2 border-navy-300 rounded focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                          />
                          <span className="ml-3 text-sm text-navy-600">
                            Email me the toolkit + occasional updates. No spam. <span className="text-red-500">*</span>
                          </span>
                        </label>
                        {errors.consent && (
                          <p className="mt-2 ml-8 text-sm text-red-600" role="alert">
                            {errors.consent}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-6 bg-golden-500 text-navy-500 rounded-full font-semibold hover:bg-golden-400 hover:-translate-y-[1px] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none text-base font-bold"
                        style={{ boxShadow: '0 4px 12px rgba(240, 206, 110, 0.3)' }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send me the Courage Toolkit'}
                      </button>

                      <p className="text-xs text-navy-500 text-center mt-2">
                        No spam. Just tools + occasional updates.
                      </p>
                    </form>
                  </div>

                  {/* Right: Preview */}
                  <div className="lg:pl-8">
                    <h3 className="font-display text-xl sm:text-2xl font-extrabold text-navy-500 mb-2">
                      What you'll get
                    </h3>
                    <p className="text-sm text-navy-500 mb-6">
                      Built for calm, predictable use — no timers, no scores, no wrong answers.
                    </p>
                    <ul className="space-y-4 text-base sm:text-lg text-navy-600" style={{ lineHeight: '1.7' }}>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 flex-shrink-0">🧠</span>
                        <span>Printable mission prompts</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 flex-shrink-0">⚡</span>
                        <span>Reset routine cards (B-4 / Courage modules)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 flex-shrink-0">🏫</span>
                        <span>Classroom pilot overview</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 flex-shrink-0">📘</span>
                        <span>Training & implementation guide</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Unlocked Success Message */
            <div className="max-w-5xl mx-auto mb-12">
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                <p className="text-lg font-semibold text-green-800">
                  ✓ Unlocked! Here are your tools.
                </p>
              </div>
            </div>
          )}

          {/* Toolkit Downloads Grid - Revealed after unlock */}
          {isUnlocked && (
            <div id="toolkit-downloads" className="max-w-7xl mx-auto mt-12">
              <div className="text-center mb-10">
                <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-500 mb-3">
                  Toolkit Downloads
                </h3>
                <p className="text-lg text-navy-600">
                  Start with these — more coming soon.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Download Card 1: B-4 Reset Guide */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-navy-100 flex flex-col">
                  <h4 className="font-display text-xl font-bold text-navy-500 mb-2">
                    B-4 Reset Guide (PDF)
                  </h4>
                  <p className="text-sm text-navy-600 mb-4 flex-grow">
                    Complete guide to using B-4 reset tools in the classroom and at home.
                  </p>
                  <Link to="/resources#library">
                    <Button variant="primary" size="md" className="w-full">
                      Download
                    </Button>
                  </Link>
                </div>

                {/* Download Card 2: Mission Prompt Pack */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-navy-100 flex flex-col">
                  <h4 className="font-display text-xl font-bold text-navy-500 mb-2">
                    Mission Prompt Pack
                  </h4>
                  <p className="text-sm text-navy-600 mb-4 flex-grow">
                    Ready-to-use prompts for guided SEL missions and reflection.
                  </p>
                  <Link to="/resources#teachers">
                    <Button variant="primary" size="md" className="w-full">
                      Download
                    </Button>
                  </Link>
                </div>

                {/* Download Card 3: Calm Corner Setup Sheet */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-navy-100 flex flex-col">
                  <h4 className="font-display text-xl font-bold text-navy-500 mb-2">
                    Calm Corner Setup Sheet
                  </h4>
                  <p className="text-sm text-navy-600 mb-4 flex-grow">
                    Step-by-step guide for creating a calm space in your classroom or home.
                  </p>
                  <Link to="/resources#downloads">
                    <Button variant="primary" size="md" className="w-full">
                      Download
                    </Button>
                  </Link>
                </div>

                {/* Download Card 4: Classroom Pilot Overview */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-navy-100 flex flex-col">
                  <h4 className="font-display text-xl font-bold text-navy-500 mb-2">
                    Classroom Pilot Overview
                  </h4>
                  <p className="text-sm text-navy-600 mb-4 flex-grow">
                    Learn how to bring Caiden's Courage tools to your school or organization.
                  </p>
                  <Link to="/classroom-pilots">
                    <Button variant="primary" size="md" className="w-full">
                      Learn more
                    </Button>
                  </Link>
                </div>

                {/* Download Card 5: Training & Guides */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-navy-100 flex flex-col">
                  <h4 className="font-display text-xl font-bold text-navy-500 mb-2">
                    Training & Guides
                  </h4>
                  <p className="text-sm text-navy-600 mb-4 flex-grow">
                    Quick guidance for using B-4 tools with neurodivergent learners.
                  </p>
                  <Link to="/training-guides">
                    <Button variant="primary" size="md" className="w-full">
                      View
                    </Button>
                  </Link>
                </div>

                {/* Download Card 6: Browse all Resources */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-navy-100 flex flex-col">
                  <h4 className="font-display text-xl font-bold text-navy-500 mb-2">
                    Browse all Resources
                  </h4>
                  <p className="text-sm text-navy-600 mb-4 flex-grow">
                    Explore our full library of printables, guides, and classroom tools.
                  </p>
                  <Link to="/resources">
                    <Button variant="primary" size="md" className="w-full">
                      Browse
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explore Modules Accordion Section */}
      <div id="explore-modules" className="py-16 sm:py-20 lg:py-24 px-4 bg-white mt-16 lg:mt-20 scroll-mt-[100px]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
              Explore what's inside Camp Courage
            </h2>
            <p className="text-lg sm:text-xl text-navy-600 max-w-3xl mx-auto">
              Tap a module to see what you'll get — designed for calm, predictable use at home and in the classroom.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Preview Image */}
            <div className="order-2 lg:order-1 flex items-center justify-center">
              <img
                src="/images/NeuroCamp_explore_smaller.webp"
                alt="Explore Camp Courage"
                className="w-full max-w-lg rounded-2xl shadow-lg"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            
            {/* Right: Accordion */}
            <div className="order-1 lg:order-2">
              <div className="space-y-0">
                {/* Accordion Item 1: Guided Missions */}
                <div className="border-t border-navy-200 first:border-t-0">
                  <button
                    onClick={() => {
                      const newIndex = openAccordionIndex === 0 ? null : 0;
                      setOpenAccordionIndex(newIndex);
                      setPreviewLabel(newIndex === 0 ? 'Mission Preview' : previewLabel);
                    }}
                    className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                    aria-expanded={openAccordionIndex === 0}
                  >
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                      Guided Missions
                    </h3>
                    <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                      <span className="text-white text-xl font-bold">
                        {openAccordionIndex === 0 ? '−' : '+'}
                      </span>
                    </span>
                  </button>
                  {openAccordionIndex === 0 && (
                    <div className="pb-6 px-1">
                      <p className="text-lg text-navy-600 leading-relaxed mb-6">
                        Short, supportive missions that help kids build emotional awareness and regulation — one step at a time. Use them at home, in small groups, or as a calm reset in the classroom.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/b4-tools">
                          <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            Start B-4 Reset Tools
                          </Button>
                        </Link>
                        <Link to="/resources#teachers">
                          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                            Download Mission Prompts
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion Item 2: Companion Activities */}
                <div className="border-t border-navy-200">
                  <button
                    onClick={() => {
                      const newIndex = openAccordionIndex === 1 ? null : 1;
                      setOpenAccordionIndex(newIndex);
                      setPreviewLabel(newIndex === 1 ? 'Printable Activity' : previewLabel);
                    }}
                    className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                    aria-expanded={openAccordionIndex === 1}
                  >
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                      Companion Activities
                    </h3>
                    <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                      <span className="text-white text-xl font-bold">
                        {openAccordionIndex === 1 ? '−' : '+'}
                      </span>
                    </span>
                  </button>
                  {openAccordionIndex === 1 && (
                    <div className="pb-6 px-1">
                      <p className="text-lg text-navy-600 leading-relaxed mb-4">
                        Printable activities and conversation prompts that help caregivers and educators bring the story into real-life moments — before, during, and after big feelings.
                      </p>
                      <ul className="space-y-3 text-base text-navy-600 mb-6">
                        <li className="flex items-start">
                          <span className="text-golden-500 mr-3 font-bold">•</span>
                          <span>Printable reflection sheets</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-golden-500 mr-3 font-bold">•</span>
                          <span>Discussion prompts for families</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-golden-500 mr-3 font-bold">•</span>
                          <span>Classroom-friendly extensions</span>
                        </li>
                      </ul>
                      <Link to="/resources">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                          Browse resources
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Accordion Item 3: Classroom Pilots */}
                <div className="border-t border-navy-200">
                  <button
                    onClick={() => {
                      const newIndex = openAccordionIndex === 2 ? null : 2;
                      setOpenAccordionIndex(newIndex);
                      setPreviewLabel(newIndex === 2 ? 'Pilot Kit' : previewLabel);
                    }}
                    className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                    aria-expanded={openAccordionIndex === 2}
                  >
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                      Classroom Pilots
                    </h3>
                    <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                      <span className="text-white text-xl font-bold">
                        {openAccordionIndex === 2 ? '−' : '+'}
                      </span>
                    </span>
                  </button>
                  {openAccordionIndex === 2 && (
                    <div className="pb-6 px-1">
                      <p className="text-lg text-navy-600 leading-relaxed mb-6">
                        Want to bring Caiden's Courage to your school or organization? Classroom pilots help us learn what works best for neurodivergent learners — with simple routines that fit real schedules.
                      </p>
                      <Link to="/classroom-pilots">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                          Learn about pilots
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Accordion Item 4: Training & Guides */}
                <div className="border-t border-navy-200">
                  <button
                    onClick={() => {
                      const newIndex = openAccordionIndex === 3 ? null : 3;
                      setOpenAccordionIndex(newIndex);
                      setPreviewLabel(newIndex === 3 ? 'Training Guide' : previewLabel);
                    }}
                    className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                    aria-expanded={openAccordionIndex === 3}
                  >
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                      Training & Guides
                    </h3>
                    <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                      <span className="text-white text-xl font-bold">
                        {openAccordionIndex === 3 ? '−' : '+'}
                      </span>
                    </span>
                  </button>
                  {openAccordionIndex === 3 && (
                    <div className="pb-6 px-1">
                      <p className="text-lg text-navy-600 leading-relaxed mb-6">
                        Quick guidance for adults — how to introduce B-4 tools, support different learners, and keep the experience calm, predictable, and non-judgmental.
                      </p>
                      <Link to="/training-guides">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                          View training & guides
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You may also like */}
      <div className="py-16 sm:py-20 lg:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4 text-center">
            You May Also Like
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center">
            Free activities and resources to keep the story going.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Caiden Coloring Pages */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 border border-navy-100 flex flex-col">
              <div className="w-full aspect-square bg-white overflow-hidden">
                <img
                  src="/images/coloringpage_Caiden.webp"
                  alt="Caiden Coloring Pages"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-display text-xl font-bold text-navy-500 mb-4">
                  Caiden Coloring Pages
                </h4>
                <Link to="/resources?type=coloring" className="mt-auto">
                  <button className="w-full px-6 py-3 bg-navy-500 text-white rounded-lg font-semibold hover:bg-navy-600 transition-colors duration-200">
                    Explore
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Card 2: Caiden Desktop Wallpaper */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 border border-navy-100 flex flex-col">
              <div className="w-full aspect-square bg-gradient-to-br from-blue-400 to-yellow-400 overflow-hidden flex items-center justify-center">
                <img
                  src="/images/CoolCaiden_header.webp"
                  alt="Caiden Desktop Wallpaper"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-display text-xl font-bold text-navy-500 mb-4">
                  Caiden Desktop Wallpaper
                </h4>
                <Link to="/resources?type=wallpaper" className="mt-auto">
                  <button className="w-full px-6 py-3 bg-navy-500 text-white rounded-lg font-semibold hover:bg-navy-600 transition-colors duration-200">
                    Explore
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Card 3: Emotional Awareness Worksheet */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 border border-navy-100 flex flex-col">
              <div className="w-full aspect-square bg-white overflow-hidden flex items-center justify-center relative">
                <img
                  src="/images/SELThubmails.webp"
                  alt="Emotional Awareness Worksheet"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-display text-xl font-bold text-navy-500 mb-4">
                  Emotional Awareness Worksheet
                </h4>
                <Link to="/resources?type=worksheet" className="mt-auto">
                  <button className="w-full px-6 py-3 bg-navy-500 text-white rounded-lg font-semibold hover:bg-navy-600 transition-colors duration-200">
                    Explore
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Closing CTA Band */}
      <div className="bg-navy-500 text-white py-20 sm:py-24 lg:py-28 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
                Keep the Courage going
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-8">
                More free tools, printable supports, and missions for home and classroom.
              </p>
              <Link to="/resources">
                <Button variant="primary" size="lg" className="bg-golden-500 hover:bg-golden-400 text-navy-500">
                  Explore Resources
                </Button>
              </Link>
            </div>
            <div className="hidden lg:block">
              {/* Subtle line-art graphic */}
              <div className="relative h-64">
                <svg viewBox="0 0 400 300" className="w-full h-full opacity-20">
                  <circle cx="100" cy="80" r="60" fill="none" stroke="white" strokeWidth="2" />
                  <circle cx="300" cy="150" r="50" fill="none" stroke="white" strokeWidth="2" />
                  <circle cx="200" cy="220" r="40" fill="none" stroke="white" strokeWidth="2" />
                  <line x1="160" y1="110" x2="250" y2="130" stroke="white" strokeWidth="2" />
                  <line x1="250" y1="130" x2="180" y2="200" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CourageAcademy;
