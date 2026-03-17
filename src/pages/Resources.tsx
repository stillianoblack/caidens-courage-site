import React, { useState, useMemo, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { useLocation } from 'react-router-dom';
import { RESOURCES, ResourceType, Audience } from '../data/resources';
import { getWaitlistUrl, openExternalUrl } from '../config/externalLinks';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GlobalNotification from '../components/GlobalNotification';
import { submitNetlifyForm } from '../utils/netlifyForms';

const Resources: React.FC = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('coloring');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<Audience | 'all'>('all');
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [notifyShowNotice, setNotifyShowNotice] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  // Check URL params for filter on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    const audienceParam = params.get('audience');
    
    if (typeParam === 'all') {
      setSelectedType('coloring');
    } else if (typeParam && ['wallpaper', 'coloring', 'worksheet', 'teacher-pack'].includes(typeParam)) {
      setSelectedType(typeParam as ResourceType);
    }
    
    if (audienceParam === 'kids') {
      setSelectedAudience('students');
    } else if (audienceParam && ['parents', 'teachers', 'all'].includes(audienceParam)) {
      setSelectedAudience(audienceParam as Audience);
    }

    // Handle hash navigation (#kids, #parents, #teachers, #downloads, #library)
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    const scrollToEl = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    };
    if (location.hash) {
      const hash = location.hash.substring(1); // Remove #
      if (hash === 'kids') {
        setSelectedAudience('students');
        timeoutIds.push(setTimeout(() => scrollToEl('kids'), 300));
      } else if (hash === 'parents') {
        setSelectedAudience('parents');
        timeoutIds.push(setTimeout(() => scrollToEl('parents'), 300));
      } else if (hash === 'teachers') {
        setSelectedAudience('teachers');
        timeoutIds.push(setTimeout(() => scrollToEl('teachers'), 300));
      } else if (hash === 'downloads' || hash === 'library') {
        timeoutIds.push(setTimeout(() => scrollToEl(hash), 300));
      } else if (hash === 'faq') {
        timeoutIds.push(setTimeout(() => scrollToEl('faq'), 300));
      }
    }
    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [location.search, location.hash]);

  // Scroll to top when Resources page mounts (e.g. from Explore buttons on Camp Courage)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll to results when audience filter changes (from URL or dropdown)
  useEffect(() => {
    if (location.pathname === '/resources') {
      const params = new URLSearchParams(location.search);
      const audienceParam = params.get('audience');
      if (audienceParam) {
        const t = setTimeout(() => {
          const el = document.getElementById('resource-results');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.querySelectorAll('.section-anchor.anchor-landed').forEach((element) => element.classList.remove('anchor-landed'));
            el.classList.add('anchor-landed');
            setTimeout(() => el.classList.remove('anchor-landed'), 1100);
          }
        }, 100);
        return () => clearTimeout(t);
      }
    }
  }, [location.search, location.pathname]);


  const handleWaitlistClick = () => {
    const waitlistUrl = getWaitlistUrl();
    if (waitlistUrl) return openExternalUrl(waitlistUrl);
    setIsPreorderOpen(true);
  };

  const handleResourceNotifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim();
    const botField = (form.elements.namedItem('bot-field') as HTMLInputElement)?.value || '';
    if (!email || notifySubmitting) return;

    setNotifySubmitting(true);
    setNotifyError(null);
    setNotifyShowNotice(false);

    try {
      const res = await submitNetlifyForm('resource_notify', {
        email,
        'bot-field': botField,
      });

      if (res.ok) {
        setNotifySuccess(true);
        setNotifyShowNotice(true);
        if (form.elements.namedItem('email')) {
          (form.elements.namedItem('email') as HTMLInputElement).value = '';
        }
      } else {
        setNotifyError('Please try again in a moment.');
        setNotifyShowNotice(true);
      }
    } catch {
      setNotifyError('Please try again in a moment.');
      setNotifyShowNotice(true);
    } finally {
      setNotifySubmitting(false);
    }
  };

  const handleComingSoonClick = useCallback(() => {
    setIsComingSoonModalOpen(true);
  }, []);

  // Get all unique tags from resources
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    RESOURCES.forEach(resource => {
      resource.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Filter resources based on search, type, tag, and audience
  const filteredResources = useMemo(() => {
    return RESOURCES.filter(resource => {
      // Type filter
      if (selectedType !== 'all' && resource.type !== selectedType) {
        return false;
      }

      // Tag filter
      if (selectedTag !== 'all' && !resource.tags.includes(selectedTag)) {
        return false;
      }

      // Audience filter
      if (selectedAudience !== 'all' && !resource.audience.includes(selectedAudience)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          resource.title,
          resource.description || '',
          ...resource.tags
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedType, selectedTag, selectedAudience]);

  // Kept for when HIDE_FILTERS is false (tag filter restored)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
  };

  const handleDownload = (fileUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    // Use filename from URL to preserve extension (e.g. .jpg, .png)
    const filenameFromUrl = fileUrl.split('/').pop();
    link.download = filenameFromUrl || title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleDownloadAll = async () => {
    if (filteredResources.length === 0 || isDownloadingAll) return;
    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();
      for (const resource of filteredResources) {
        const filename = resource.fileUrl.split('/').pop() || `${resource.title.replace(/\s+/g, '-')}.jpg`;
        const res = await fetch(resource.fileUrl);
        if (res.ok) {
          const blob = await res.blob();
          zip.file(filename, blob);
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      const zipName = `Caiden-Courage-${getFilteredSectionTitle().replace(/\s+/g, '-')}.zip`;
      link.download = zipName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      // Fallback: try sequential individual downloads
      filteredResources.forEach((resource, index) => {
        setTimeout(() => handleDownload(resource.fileUrl, resource.title), index * 400);
      });
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const getCategoryCount = (type: ResourceType) =>
    RESOURCES.filter((r) => r.type === type).length;

  const CATEGORY_CARDS = [
    { type: 'coloring' as const, title: 'Coloring Pages', description: 'Print and color your own Courage moments', cta: 'Explore Coloring Pages' },
    { type: 'wallpaper' as const, title: 'Wallpapers', description: "Bring Caiden's Courage to your screen", cta: 'Explore Wallpapers' },
    { type: 'worksheet' as const, title: 'Worksheets', description: 'Build focus, confidence, and emotional strength', cta: 'Explore Worksheets' },
  ];

  const getDownloadAllLabel = () => {
    if (selectedType === 'coloring') return 'Download All Coloring Pages';
    if (selectedType === 'wallpaper') return 'Download All Wallpapers';
    if (selectedType === 'worksheet') return 'Download Worksheet';
    return null;
  };

  const getFilteredSectionTitle = () => {
    if (selectedType === 'coloring') return 'Coloring Pages';
    if (selectedType === 'wallpaper') return 'Wallpapers';
    if (selectedType === 'worksheet') return 'Worksheets';
    return 'Resources';
  };

  const HIDE_FILTERS = true; // Set to false to restore search, audience, tag filters

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      {/* Header */}
      <div 
        id="resources-header"
        data-section="header"
        className="bg-navy-500 text-white py-16 pt-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            Brave Mind Club Activities
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mb-2">
            SEL tools, coloring pages, wallpapers, and worksheets for kids, parents, and educators.
          </p>
          <p className="text-sm sm:text-base text-white/80">
            All resources are free and designed to support neurodiverse kids.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div 
        id="resources-filters"
        data-section="filters"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        style={{ marginTop: '70px' }}
      >
        {/* White Card Container - Filters (hidden when HIDE_FILTERS) */}
        {!HIDE_FILTERS && (
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          {/* Audience Filter Buttons */}
          <div className="mb-6" id="kids">
            <div id="parents" style={{ position: 'absolute', marginTop: '-100px' }}></div>
            <div id="teachers" style={{ position: 'absolute', marginTop: '-100px' }}></div>
            <label className="block text-sm font-semibold text-navy-700 mb-3">I'm looking for resources for:</label>
            <div className="pill-toggle is-scroll">
              <button
                onClick={() => setSelectedAudience('all')}
                className="pill"
                data-persona="everyone"
                data-selected={selectedAudience === 'all'}
              >
                Everyone
              </button>
              <button
                onClick={() => setSelectedAudience('parents')}
                className="pill"
                data-persona="parents"
                data-selected={selectedAudience === 'parents'}
              >
                Parents
              </button>
              <button
                onClick={() => setSelectedAudience('teachers')}
                className="pill"
                data-persona="teachers"
                data-selected={selectedAudience === 'teachers'}
              >
                Teachers
              </button>
              <button
                onClick={() => setSelectedAudience('students')}
                className="pill"
                data-persona="kids"
                data-selected={selectedAudience === 'students'}
              >
                Students
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-navy-500 focus:outline-none text-navy-700 bg-white shadow-sm"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            </div>

            {/* Type Filter */}
            <div className="md:w-64 relative">
              <label htmlFor="type-filter" className="sr-only">Resource Type</label>
              <select
                id="type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ResourceType | 'all')}
                className="w-full px-4 py-3 pr-10 rounded-full border-2 border-gray-300 focus:border-navy-500 focus:outline-none text-navy-700 bg-white shadow-sm appearance-none"
              >
                <option value="all">All Resource Types</option>
                <option value="wallpaper">Wallpapers</option>
                <option value="coloring">Coloring Pages</option>
                <option value="worksheet">SEL Worksheets</option>
                <option value="teacher-pack">Teacher Packs</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Tag Filter */}
            <div className="md:w-64 relative">
              <label htmlFor="tag-filter" className="sr-only">Tags</label>
              <select
                id="tag-filter"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-full border-2 border-gray-300 focus:border-navy-500 focus:outline-none text-navy-700 bg-white shadow-sm appearance-none"
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {CATEGORY_CARDS.map((card) => {
            const isSelected = selectedType === card.type;
            const count = getCategoryCount(card.type);
            return (
              <button
                key={card.type}
                type="button"
                onClick={() => {
                  setSelectedType(card.type);
                  setSelectedTag('all');
                }}
                className={`rounded-2xl p-6 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 ${
                  isSelected
                    ? 'bg-navy-500 border-2 border-navy-600 shadow-xl'
                    : 'bg-white border-2 border-gray-200 shadow-md opacity-90 hover:opacity-100 hover:border-navy-200 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-display font-bold text-lg ${isSelected ? 'text-white' : 'text-navy-500'}`}>
                    {card.title}
                  </h3>
                  <span
                    className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-sm font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-navy-100 text-navy-600'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <p className={`text-sm mb-4 leading-relaxed ${isSelected ? 'text-white/90' : 'text-navy-600'}`}>
                  {card.description}
                </p>
                <span className={`inline-flex items-center text-sm font-semibold ${isSelected ? 'text-white' : 'text-navy-600 hover:text-navy-700'}`}>
                  {card.cta}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic heading + Download All */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-navy-500">
              {getFilteredSectionTitle()}
            </h2>
            {getDownloadAllLabel() && filteredResources.length > 0 && (
              <Button
                variant="primary"
                size="md"
                onClick={handleDownloadAll}
                disabled={isDownloadingAll}
                className="w-full sm:w-auto sm:flex-shrink-0"
              >
                {isDownloadingAll ? 'Creating zip…' : getDownloadAllLabel()}
              </Button>
            )}
          </div>
          {filteredResources.length > 0 && (
            <p className="text-sm text-navy-500 mt-1">
              {filteredResources.length} {filteredResources.length === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>

        {/* Resources Grid - Wrapped in anchor div for scroll target */}
        <div id="downloads" className="section-anchor">
        <div id="resource-results" className="section-anchor">
        <div 
          id="resources-grid"
          data-section="grid"
          className=""
        >
        {filteredResources.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-navy-600 text-lg mb-4">
              We're creating more courage tools right now 💛
            </p>
            <p className="text-navy-500 text-base mb-6">
              Want to be notified when new resources are added?
            </p>
            <form
              name="resource_notify"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              action="/resources/notify-success"
              onSubmit={handleResourceNotifySubmit}
              className="max-w-md mx-auto"
            >
              <input type="hidden" name="form-name" value="resource_notify" />
              <p className="hidden">
                <label>Don&apos;t fill this out: <input name="bot-field" /></label>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-navy-300 focus:border-navy-500 focus:outline-none text-navy-700"
                />
                <button
                  type="submit"
                  disabled={notifySubmitting}
                  className="btn btn--sm"
                  style={{
                    backgroundColor: 'var(--navy-500)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  {notifySuccess ? 'Subscribed!' : notifySubmitting ? 'Sending…' : 'Notify Me'}
                </button>
              </div>
              {notifyShowNotice && (
                <GlobalNotification
                  show={notifyShowNotice}
                  title={notifySuccess ? 'You\'re in!' : 'Hmm — that didn\'t send.'}
                  message={
                    notifySuccess
                      ? 'Thanks — we\'ll email you shortly. Keep an eye on your inbox (and spam folder).'
                      : notifyError || 'Please try again in a moment.'
                  }
                  tone={notifySuccess ? 'success' : 'error'}
                  durationMs={4000}
                  autoClose
                  onClose={() => { setNotifyShowNotice(false); setNotifySuccess(false); }}
                />
              )}
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                role="button"
                tabIndex={0}
                onClick={() => handlePreview(resource.fileUrl)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePreview(resource.fileUrl);
                  }
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-navy-100 flex flex-col h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
              >
                {/* Thumbnail - uses file path as image */}
                <div className="aspect-square bg-navy-100 relative overflow-hidden">
                  <img
                    src={resource.fileUrl}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="px-5 pt-5 pb-6 flex flex-col flex-grow">
                  <h3 className="font-display font-bold text-lg text-navy-500 mb-4" title={resource.title}>
                    {resource.title}
                  </h3>

                  {/* Download button - stops propagation so card click doesn't fire */}
                  <a
                    href={resource.fileUrl}
                    download={resource.title}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-auto inline-flex items-center justify-center px-4 py-2 bg-golden-500 text-navy-500 rounded-full font-semibold hover:bg-golden-600 hover:shadow-lg transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-golden-500 focus:ring-offset-2"
                    style={{ backgroundColor: '#F0CE6E' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e8c255';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F0CE6E';
                    }}
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        </div>
        </div>

      {/* Spacer between resource cards and FAQ */}
      <div className="h-16 sm:h-20 lg:h-24" aria-hidden="true" />

      {/* FAQ Section - Full Width */}
      <div id="faq" className="faqSectionFullBleed bg-white py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg sm:text-xl text-navy-600 max-w-3xl mx-auto mb-3">
                Everything you need to know about downloading and using our free resources.
              </p>
              <p className="text-base text-navy-500">
                Parents, teachers, and students can download resources instantly – no login required.
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left: Illustration */}
              <div className="order-2 lg:order-1 flex items-center justify-center">
                <img
                  src="/images/Caiden_FAQ_section.webp"
                  alt="Child using resources"
                  className="w-full max-w-lg rounded-2xl shadow-lg"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>

              {/* Right: FAQ Accordion */}
              <div className="order-1 lg:order-2">
                <div className="space-y-0">
                  {/* FAQ Item 1 */}
                  <div className="border-t border-navy-200 first:border-t-0">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                      className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                      aria-expanded={openFaqIndex === 0}
                    >
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                        Are these resources free?
                      </h3>
                      <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                        <span className="text-white text-xl font-bold">
                          {openFaqIndex === 0 ? '−' : '+'}
                        </span>
                      </span>
                    </button>
                    {openFaqIndex === 0 && (
                      <div className="pb-6 px-1">
                        <p className="text-lg text-navy-600 leading-relaxed">
                          Yes. All resources on this page are free to download and designed to support courage, creativity, and neurodiverse kids.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 2 */}
                  <div className="border-t border-navy-200">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                      className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                      aria-expanded={openFaqIndex === 1}
                    >
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                        Do I need an account to download?
                      </h3>
                      <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                        <span className="text-white text-xl font-bold">
                          {openFaqIndex === 1 ? '−' : '+'}
                        </span>
                      </span>
                    </button>
                    {openFaqIndex === 1 && (
                      <div className="pb-6 px-1">
                        <p className="text-lg text-navy-600 leading-relaxed">
                          No account needed. Simply click the download button on any resource to get started.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 3 */}
                  <div className="border-t border-navy-200">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                      className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                      aria-expanded={openFaqIndex === 2}
                    >
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                        What ages are these for?
                      </h3>
                      <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                        <span className="text-white text-xl font-bold">
                          {openFaqIndex === 2 ? '−' : '+'}
                        </span>
                      </span>
                    </button>
                    {openFaqIndex === 2 && (
                      <div className="pb-6 px-1">
                        <p className="text-lg text-navy-600 leading-relaxed">
                          Most resources are designed for ages 6-12, but many can be adapted for younger or older kids. Check the age range on each resource card.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 4 */}
                  <div className="border-t border-navy-200">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
                      className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                      aria-expanded={openFaqIndex === 3}
                    >
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                        Can I use these in the classroom?
                      </h3>
                      <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                        <span className="text-white text-xl font-bold">
                          {openFaqIndex === 3 ? '−' : '+'}
                        </span>
                      </span>
                    </button>
                    {openFaqIndex === 3 && (
                      <div className="pb-6 px-1">
                        <p className="text-lg text-navy-600 leading-relaxed">
                          Absolutely! Many resources are designed for classroom use. Look for the "Classroom & Home" or "Classroom" tag on resource cards.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 5 */}
                  <div className="border-t border-navy-200">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === 4 ? null : 4)}
                      className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                      aria-expanded={openFaqIndex === 4}
                    >
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                        Can I print these worksheets?
                      </h3>
                      <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                        <span className="text-white text-xl font-bold">
                          {openFaqIndex === 4 ? '−' : '+'}
                        </span>
                      </span>
                    </button>
                    {openFaqIndex === 4 && (
                      <div className="pb-6 px-1">
                        <p className="text-lg text-navy-600 leading-relaxed">
                          Yes! All printable resources are designed to be printed at home or in the classroom. They're formatted for standard letter-size paper.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 6 */}
                  <div className="border-t border-navy-200">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === 5 ? null : 5)}
                      className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                      aria-expanded={openFaqIndex === 5}
                    >
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                        How do I use the SEL worksheets?
                      </h3>
                      <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                        <span className="text-white text-xl font-bold">
                          {openFaqIndex === 5 ? '−' : '+'}
                        </span>
                      </span>
                    </button>
                    {openFaqIndex === 5 && (
                      <div className="pb-6 px-1">
                        <p className="text-lg text-navy-600 leading-relaxed">
                          SEL worksheets can be used one-on-one, in small groups, or as a class activity. Each worksheet includes guidance for use at home or in the classroom.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 7 */}
                  <div className="border-t border-navy-200">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === 6 ? null : 6)}
                      className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                      aria-expanded={openFaqIndex === 6}
                    >
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                        What if I can't open the file?
                      </h3>
                      <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                        <span className="text-white text-xl font-bold">
                          {openFaqIndex === 6 ? '−' : '+'}
                        </span>
                      </span>
                    </button>
                    {openFaqIndex === 6 && (
                      <div className="pb-6 px-1">
                        <p className="text-lg text-navy-600 leading-relaxed">
                          Most resources are PDFs, which can be opened with any PDF reader. If you're having trouble, try using a different browser or device. Contact us if you need help.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 8 */}
                  <div className="border-t border-navy-200">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === 7 ? null : 7)}
                      className="w-full flex items-center justify-between py-6 text-left hover:bg-navy-50 transition-colors px-1"
                      aria-expanded={openFaqIndex === 7}
                    >
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500">
                        Will you add more resources?
                      </h3>
                      <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center" style={{ minWidth: '32px' }}>
                        <span className="text-white text-xl font-bold">
                          {openFaqIndex === 7 ? '−' : '+'}
                        </span>
                      </span>
                    </button>
                    {openFaqIndex === 7 && (
                      <div className="pb-6 px-1">
                        <p className="text-lg text-navy-600 leading-relaxed">
                          Yes! We're always creating new resources. Check back regularly or sign up to be notified when new downloads are available.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscribe Banner - Full Width */}
        <div className="newsletterSectionFullBleed bg-white py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-navy-500 to-golden-400 rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left: Character Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                    <img
                      src="/images/Caiden@4x-100.webp"
                      alt="Caiden"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Right: Text and Form */}
                <div className="flex-grow w-full lg:w-auto">
                  <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                    Get notified when new free resources are added
                  </h3>
                  <p className="text-white/90 text-base sm:text-lg mb-6">
                    Join the Courage community for free tools and updates
                  </p>
                  <form
                    name="resource_notify"
                    method="POST"
                    data-netlify="true"
                    data-netlify-honeypot="bot-field"
                    action="/resources/notify-success"
                    onSubmit={handleResourceNotifySubmit}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <input type="hidden" name="form-name" value="resource_notify" />
                    <p className="hidden">
                      <label>Don&apos;t fill this out: <input name="bot-field" /></label>
                    </p>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button
                      type="submit"
                      disabled={notifySubmitting}
                      className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {notifySuccess ? 'Subscribed!' : notifySubmitting ? 'Sending…' : 'Subscribe'}
                    </button>
                  </form>
                  {notifyShowNotice && (
                    <GlobalNotification
                      show={notifyShowNotice}
                      title={notifySuccess ? 'You\'re in!' : 'Hmm — that didn\'t send.'}
                      message={
                        notifySuccess
                          ? 'Thanks — we\'ll email you shortly. Keep an eye on your inbox (and spam folder).'
                          : notifyError || 'Please try again in a moment.'
                      }
                      tone={notifySuccess ? 'success' : 'error'}
                      durationMs={4000}
                      autoClose
                      onClose={() => { setNotifyShowNotice(false); setNotifySuccess(false); }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Coming Soon Modal */}
      {isComingSoonModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsComingSoonModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-md animate-slide-up bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
            <button
              className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-white text-navy-500 font-bold shadow-lg flex items-center justify-center hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 z-10"
              onClick={() => setIsComingSoonModalOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>
            
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 mb-4">
                We're building this next.
              </h2>
              <p className="text-navy-600 text-base sm:text-lg leading-relaxed mb-8">
                We're designing Caiden & B-4 plushies and limited-edition shirts.
                <br />
                Join the Courage Community to get early access when they launch.
              </p>
              
              <div className="flex flex-col gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    handleWaitlistClick();
                    setIsComingSoonModalOpen(false);
                  }}
                  className="w-full"
                >
                  Join the Courage Community
                </Button>
                <button
                  onClick={() => setIsComingSoonModalOpen(false)}
                  className="text-navy-400 text-sm font-medium hover:text-navy-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-order Modal */}
      {isPreorderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-2xl animate-slide-up">
            <button
              className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-white text-navy-500 font-bold shadow-lg flex items-center justify-center hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 z-10"
              onClick={() => setIsPreorderOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <iframe
              src="https://beacons.ai/stillianoblack"
              title="Join the Courage Community"
              className="w-full h-[70vh] rounded-2xl bg-white shadow-2xl"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;

