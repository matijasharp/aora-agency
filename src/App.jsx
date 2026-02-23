import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, Activity, Terminal, Clock, MousePointer2, Check, Languages, Globe2, Building2,
  Utensils, Scissors, Stethoscope, Ship, Users, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ownChairLogo from './assets/square-logo-iOwnChair.png';
import horecaLogo from './assets/2.png';

gsap.registerPlugin(ScrollTrigger);

// --- Reusable Interactive Grid Hook/Component ---

const InteractiveGrid = ({ type = 'dark' }) => {
  const gridRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current || !gridRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gridRef.current.style.setProperty('--x', `${x}px`);
      gridRef.current.style.setProperty('--y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div
        ref={gridRef}
        className={`absolute inset-0 transition-opacity duration-300 ${type === 'dark' ? 'interactive-grid-layer' : 'light-grid-layer-interactive'
          }`}
        style={{ '--x': '-1000px', '--y': '-1000px' }}
      ></div>
    </div>
  );
};

// --- Preloader Component ---
const Loader = ({ onComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: onComplete
      });

      const counter = { value: 0 };

      gsap.set('.logo-rest', { width: 0, opacity: 0, display: 'inline-block', whiteSpace: 'nowrap' });
      gsap.set('.logo-a', { opacity: 0, y: 30 });

      // Step 1: Fade and slide in 'A'
      tl.to('.logo-a', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
        // Step 2: Percentage counts up while A stays
        .to(counter, {
          value: 100,
          duration: 1.5,
          ease: 'power2.inOut',
          onUpdate: () => {
            const el = document.querySelector('.loader-counter');
            if (el) el.textContent = Math.round(counter.value) + '%';
          }
        }, "-=0.2")
        // Step 3: Expand the rest of the logo
        .to('.logo-rest', { width: 'auto', opacity: 1, duration: 1, ease: 'power3.out' }, "-=0.2")
        // Step 4: Hide counter, and slide up the whole preloader
        .to('.loader-counter', { opacity: 0, duration: 0.4 }, "+=0.2")
        .to(containerRef.current, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, "-=0.2");

    }, containerRef);
    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-[#030304] flex flex-col items-center justify-center cursor-wait bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/loading-bg.png')" }}>
      <div className="absolute inset-0 bg-[#030304]/40 z-0"></div>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="font-heading font-bold text-5xl md:text-7xl tracking-tight flex items-center overflow-hidden drop-shadow-2xl">
          <span className="text-accent inline-block logo-a">A</span>
          <span className="logo-rest text-white inline-block">or<span className="text-accent">AA</span>gency</span>
        </div>
        <div className="loader-counter font-data text-accent mt-8 text-sm tracking-widest drop-shadow-md">0%</div>
      </div>
    </div>
  );
};

// --- Contact Modal Component ---
const ContactModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const containerRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (isOpen) {
        gsap.to(modalRef.current, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
        gsap.fromTo(containerRef.current, { y: 40, scale: 0.95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
        document.body.style.overflow = 'hidden';
      } else {
        gsap.to(modalRef.current, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
        document.body.style.overflow = '';
      }
    });
    return () => ctx.revert();
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-[100] invisible opacity-0 flex items-center justify-center px-4 cursor-default">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#030304]/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div ref={containerRef} className="relative z-10 w-full max-w-2xl bg-[#0D0D12]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_0_80px_rgba(201,168,76,0.1)]">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <h2 className="font-drama italic text-4xl md:text-5xl text-white mb-2">{t('contact.title')}</h2>
        <p className="font-heading text-white/50 mb-8">{t('contact.desc')}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-heading">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-white/40 font-data">{t('contact.name')}</label>
              <input type="text" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent/50 transition-colors" placeholder={t('contact.name_placeholder')} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-white/40 font-data">{t('contact.email')}</label>
              <input type="email" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent/50 transition-colors" placeholder={t('contact.email_placeholder')} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-white/40 font-data">{t('contact.type')}</label>
            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors appearance-none">
              <option value="" className="bg-[#0D0D12]">{t('contact.type_placeholder')}</option>
              <option value="website" className="bg-[#0D0D12]">{t('contact.type_opt1')}</option>
              <option value="booking" className="bg-[#0D0D12]">{t('contact.type_opt2')}</option>
              <option value="branding" className="bg-[#0D0D12]">{t('contact.type_opt3')}</option>
              <option value="other" className="bg-[#0D0D12]">{t('contact.type_opt4')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-white/40 font-data">{t('contact.details')}</label>
            <textarea required rows="4" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent/50 transition-colors resize-none" placeholder={t('contact.details_placeholder')}></textarea>
          </div>

          <button type="submit" className="btn-magnetic mt-4 bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold text-lg w-full hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-shadow">
            {t('contact.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Component Architecture ---

const Navbar = ({ onConsultationClick }) => {
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const { t, i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // GSAP timeline for mobile menu
  const tlMenu = useRef(null);

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'hr', label: 'HR' }
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 'top -50',
        end: 99999,
        toggleClass: {
          className: 'scrolled',
          targets: navRef.current
        }
      });

      // Setup mobile menu animation timeline
      tlMenu.current = gsap.timeline({ paused: true })
        .to(menuRef.current, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' })
        .from('.mobile-menu-link', {
          y: 60,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out'
        }, "-=0.2");

    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (tlMenu.current) {
      if (isMenuOpen) {
        tlMenu.current.play();
        document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
      } else {
        tlMenu.current.reverse();
        document.body.style.overflow = '';
      }
    }
  }, [isMenuOpen]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(false);
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 rounded-full px-6 py-3 flex items-center justify-between gap-4 md:gap-8 text-background w-[90%] md:w-auto
          [&.scrolled]:bg-background/80 [&.scrolled]:backdrop-blur-xl [&.scrolled]:text-primary [&.scrolled]:border [&.scrolled]:border-slate/10 [&.scrolled]:shadow-lg`}
      >
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-heading font-bold text-xl tracking-tight leading-none pt-1 shrink-0 hover:opacity-80 transition-opacity">
          <span className="text-accent">A</span>or<span className="text-accent">AA</span>gency
        </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 font-heading text-sm font-medium">
          <a href="#features" className="hover:-translate-y-[1px] transition-transform">{t('nav.features')}</a>
          <a href="#projects" className="hover:-translate-y-[1px] transition-transform">{t('nav.projects')}</a>
          <a href="#protocol" className="hover:-translate-y-[1px] transition-transform">{t('nav.protocol')}</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity font-data text-xs uppercase"
            >
              <Languages size={16} />
              {i18n.language?.split('-')[0].toUpperCase()}
            </button>
            {isLangOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-slate/10 p-2 flex flex-col min-w-[60px] text-primary">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-data hover:bg-slate/5 transition-colors ${i18n.language === lang.code ? 'text-accent font-bold' : ''}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={onConsultationClick} className="hidden md:block btn-magnetic bg-accent text-primary px-5 py-2 rounded-full font-heading font-semibold text-sm shrink-0">
            {t('nav.consultation')}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 focus:outline-none z-50 shrink-0 relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`bg-current h-0.5 w-6 rounded-sm transition-all duration-300 ease-out ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
            <span className={`bg-current h-0.5 w-6 rounded-sm transition-all duration-300 ease-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`bg-current h-0.5 w-6 rounded-sm transition-all duration-300 ease-out ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-40 bg-[#030304]/95 backdrop-blur-2xl flex flex-col items-center justify-center invisible opacity-0"
      >
        <div className="flex flex-col items-center gap-8 w-full px-8 text-center">
          <a href="#features" onClick={handleMenuClick} className="mobile-menu-link font-drama italic text-5xl text-white hover:text-accent transition-colors w-full">{t('nav.features')}</a>
          <a href="#projects" onClick={handleMenuClick} className="mobile-menu-link font-drama italic text-5xl text-white hover:text-accent transition-colors w-full">{t('nav.projects')}</a>
          <a href="#protocol" onClick={handleMenuClick} className="mobile-menu-link font-drama italic text-5xl text-white hover:text-accent transition-colors w-full">{t('nav.protocol')}</a>

          <button onClick={() => { handleMenuClick(); onConsultationClick(); }} className="mobile-menu-link mt-8 btn-magnetic w-full max-w-xs bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold text-lg flex items-center justify-center gap-3">
            {t('nav.consultation')}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

const Hero = ({ appLoaded, onConsultationClick }) => {
  const container = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!appLoaded) return;
    let ctx = gsap.context(() => {
      gsap.from('.hero-elem', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative min-h-[100dvh] w-full overflow-hidden bg-primary flex flex-col justify-end pb-24 px-8 md:px-16 text-background cursor-none">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600607688969-a5bfcd64ddfc?q=80&w=2000&auto=format&fit=crop"
          alt="Dark marble texture"
          className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/95 to-primary/60"></div>
      </div>

      <InteractiveGrid type="dark" />

      <div className="relative z-10 max-w-5xl pointer-events-none mt-24">
        <h1 className="flex flex-col gap-2">
          <span className="hero-elem font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-background/90 max-w-4xl leading-tight text-balance">
            {t('hero.subtitle')}
          </span>
          <span className="hero-elem font-drama italic text-6xl md:text-[8rem] leading-[1] text-accent pr-10">
            {t('hero.title')}
          </span>
        </h1>
        <p className="hero-elem mt-8 font-heading text-lg md:text-xl text-background/70 max-w-2xl text-balance">
          {t('hero.description')}
        </p>

        <div className="hero-elem mt-12 flex flex-col sm:flex-row gap-4 items-start sm:items-center pointer-events-auto">
          <button onClick={onConsultationClick} className="btn-magnetic bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold text-lg flex items-center justify-center gap-3 group w-full sm:w-auto">
            <span>{t('hero.cta')}</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="hero-elem mt-6 font-data text-xs text-background/40 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
          {t('hero.trust')}
        </p>
      </div>
    </section>
  );
};

const WhoWeAre = () => {
  const { t } = useTranslation();
  const icons = [<Utensils />, <Scissors />, <Stethoscope />, <Ship />, <Users />];

  return (
    <section className="min-h-screen py-24 px-8 md:px-16 bg-background rounded-t-[3rem] -mt-8 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden flex items-center">
      <div className="absolute inset-0 light-grid-layer opacity-40"></div>
      <div className="absolute inset-0 light-marble-overlay"></div>

      <InteractiveGrid type="light" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 justify-between items-start relative z-10 w-full">
        <div className="max-w-lg">
          <h2 className="font-heading font-medium text-slate text-sm uppercase tracking-widest mb-6 flex items-center gap-4">
            <span className="w-12 h-px bg-slate/20"></span>
            {t('who_we_are.title')}
          </h2>
          <h3 className="font-drama italic text-4xl md:text-6xl text-primary leading-tight text-balance">
            {t('who_we_are.subtitle')}
          </h3>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`p-8 bg-white/80 backdrop-blur-sm border border-slate/5 rounded-2xl flex flex-col gap-4 shadow-sm hover:border-accent/30 transition-colors group ${i === 5 ? 'sm:col-span-2 bg-gradient-to-br from-white to-slate/5' : ''}`}>
              <div className="text-accent group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(icons[i - 1], { size: 32 })}
              </div>
              <p className="font-heading font-bold text-primary text-xl">{t(`who_we_are.item${i}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const InlineCta = ({ variant, theme = 'light', onConsultationClick }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <section className={`py-12 px-8 md:px-16 relative z-20 ${isDark ? 'bg-[#030304] text-white' : 'bg-background text-primary'}`}>
      <div className={`max-w-5xl mx-auto rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm border ${isDark ? 'bg-white/5 border-white/10' : 'bg-primary/5 border-slate/10'}`}>
        <h3 className="font-heading font-medium text-2xl md:text-3xl max-w-lg text-balance text-center md:text-left">
          {t(`inline_cta.${variant}.title`)}
        </h3>
        <button onClick={onConsultationClick} className="btn-magnetic bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold text-lg flex items-center gap-3 transition-transform hover:scale-105 shrink-0">
          <span>{t(`inline_cta.${variant}.btn`)}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
};

// Feature Interactive Components
const InteractiveShuffler = () => {
  const { t } = useTranslation();
  const [cards, setCards] = useState([{ id: 1, key: 'c1' }, { id: 2, key: 'c2' }, { id: 3, key: 'c3' }]);
  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newArr = [...prev];
        const last = newArr.pop();
        newArr.unshift(last);
        return newArr;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative w-full h-[200px] flex items-center justify-center">
      {cards.map((card, idx) => (
        <div key={card.id} className="absolute w-full max-w-[280px] p-6 rounded-2xl bg-[#1e1e1e] border border-white/5 shadow-xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" style={{ zIndex: 3 - idx, transform: `translateY(${idx * 15}px) scale(${1 - idx * 0.05})`, opacity: 1 - idx * 0.2 }}>
          <Activity className="text-accent mb-3" size={24} />
          <div className="font-data text-xs text-white/30 mb-1">Process 0{card.id}</div>
          <h4 className="font-heading font-bold text-white mb-1">{t(`features.card1.${card.key}_title`)}</h4>
          <p className="font-heading text-sm text-white/50">{t(`features.card1.${card.key}_desc`)}</p>
        </div>
      ))}
    </div>
  );
};

const OperationsGrid = () => {
  const { t } = useTranslation();
  const listRef = useRef(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.op-item');
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.fromTo(items, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.2, ease: 'power2.out' })
        .to(items, { opacity: 0, x: 10, duration: 0.5, stagger: 0.1, ease: 'power2.in', delay: 2 });
    }, listRef);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={listRef} className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 h-[220px] relative overflow-hidden flex flex-col justify-end">
      <div className="grid gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="op-item flex items-center gap-2 font-data text-[10px] text-[#A0A0A0]">
            <span className="text-accent">›</span> {t(`features.card2.c${i}_title`)}
          </div>
        ))}
      </div>
    </div>
  );
};

const CursorProtocol = () => {
  const container = useRef(null);
  const cursor = useRef(null);
  const cell = useRef(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.to(cursor.current, { x: 80, y: 50, duration: 1, ease: 'power2.inOut' })
        .to(cursor.current, { scale: 0.8, duration: 0.1 })
        .to(cell.current, { backgroundColor: '#C9A84C', color: '#0D0D12', duration: 0.2 }, '<')
        .to(cursor.current, { scale: 1, duration: 0.1 })
        .to(cursor.current, { x: 180, y: 120, duration: 1, ease: 'power2.inOut', delay: 0.5 })
        .to(cursor.current, { opacity: 0, duration: 0.2 })
        .to(cell.current, { backgroundColor: 'transparent', color: '', duration: 0.2 })
        .set(cursor.current, { x: 0, y: 0, opacity: 1 });
    }, container);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={container} className="relative w-full h-[200px] bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 overflow-hidden">
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i} className="text-center font-heading text-[10px] text-white/20 pb-2">{day}</div>)}
        {Array.from({ length: 14 }).map((_, i) => <div key={i} ref={i === 9 ? cell : null} className={`aspect-square rounded border border-white/5 transition-colors ${i === 9 ? '' : 'bg-white/5'}`} />)}
      </div>
      <div ref={cursor} className="absolute top-0 left-0 z-10 pointer-events-none drop-shadow-md">
        <MousePointer2 className="text-white fill-accent" size={24} />
      </div>
    </div>
  );
}

const Features = () => {
  const { t } = useTranslation();
  return (
    <section id="features" className="min-h-screen py-24 px-8 md:px-16 bg-primary relative z-20 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="font-heading font-medium text-background/40 text-sm uppercase tracking-widest mb-16 flex items-center gap-4">
          <span className="w-12 h-px bg-white/20"></span>
          {t('features.label')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 hover:border-accent/40 transition-colors">
            <h3 className="font-heading font-bold text-3xl text-white mb-4">{t('features.card1.title')}</h3>
            <p className="font-heading text-background/60 mb-10 text-lg">{t('features.card1.desc')}</p>
            <InteractiveShuffler />
          </div>
          <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 hover:border-accent/40 transition-colors">
            <h3 className="font-heading font-bold text-3xl text-white mb-4">{t('features.card2.title')}</h3>
            <p className="font-heading text-background/60 mb-10 text-lg">{t('features.card2.desc')}</p>
            <OperationsGrid />
          </div>
          <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 hover:border-accent/40 transition-colors">
            <h3 className="font-heading font-bold text-3xl text-white mb-4">{t('features.card3.title')}</h3>
            <p className="font-heading text-background/60 mb-10 text-lg">{t('features.card3.desc')}</p>
            <CursorProtocol />
          </div>
        </div>
      </div>
    </section>
  );
};

const ProtocolSection = () => {
  const containerRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    let ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card');

      cards.forEach((card, i) => {
        const isLast = i === cards.length - 1;
        // Pin the card
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          pin: true,
          pinSpacing: isLast,
          end: () => `+=${window.innerHeight}`,
        });

        // Animation for the card UNDERNEATH as the next one comes in
        if (i < cards.length - 1) {
          gsap.to(card, {
            scale: 0.9,
            filter: "blur(20px)",
            opacity: 0.5,
            scrollTrigger: {
              trigger: cards[i + 1],
              start: "top 100%",
              end: "top 0%",
              scrub: true,
            }
          });
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const protocols = [
    {
      step: '01',
      title: t('protocol.phase1.name'),
      desc: t('protocol.phase1.desc'),
      anim: (
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] opacity-50 text-accent">
          <g className="animate-[spin_40s_linear_infinite] origin-center">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="1 10" />
            <path d="M50 5 L50 20 M95 50 L80 50 M50 95 L50 80 M5 50 L20 50" stroke="currentColor" strokeWidth="1" />
          </g>
          <circle cx="50" cy="50" r="5" fill="currentColor" className="animate-pulse" />
        </svg>
      )
    },
    {
      step: '02',
      title: t('protocol.phase2.name'),
      desc: t('protocol.phase2.desc'),
      anim: (
        <div className="w-[80%] h-[80%] relative border border-white/10 rounded-xl overflow-hidden bg-primary/20 p-8 shadow-2xl">
          <div className="grid grid-cols-10 grid-rows-10 gap-2 h-full w-full opacity-10">
            {Array.from({ length: 100 }).map((_, i) => <div key={i} className="bg-accent rounded-full w-1 h-1"></div>)}
          </div>
          <div className="absolute top-0 left-0 w-full h-[3px] bg-accent shadow-[0_0_20px_rgba(201,168,76,1)] animate-[laser_4s_ease-in-out_infinite_alternate]" />
          <style>{`
             @keyframes laser { from { top: 0%; } to { top: 100%; } }
           `}</style>
        </div>
      )
    },
    {
      step: '03',
      title: t('protocol.phase3.name'),
      desc: t('protocol.phase3.desc'),
      anim: (
        <svg viewBox="0 0 200 100" className="w-[80%] h-[50%] text-accent overflow-visible">
          <path
            d="M 0 50 L 40 50 L 50 10 L 65 90 L 75 50 L 100 50 L 110 30 L 120 70 L 130 50 L 200 50"
            fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray="600" strokeDashoffset="600"
            className="animate-[ekg_3s_linear_infinite]"
          />
          <style>{`
            @keyframes ekg { to { stroke-dashoffset: 0; } }
          `}</style>
          <circle cx="200" cy="50" r="4" fill="currentColor" className="animate-ping" />
        </svg>
      )
    }
  ];

  return (
    <section id="protocol" ref={containerRef} className="bg-[#030304] relative">
      <div className="absolute top-12 left-12 z-50">
        <h2 className="font-heading font-medium text-white/30 text-sm uppercase tracking-widest flex items-center gap-4">
          <span className="w-12 h-px bg-white/20"></span>
          {t('protocol.label')}
        </h2>
      </div>

      {protocols.map((p, i) => (
        <div key={i} className="protocol-card w-full h-screen flex items-center justify-center bg-transparent px-8 md:px-16 overflow-hidden">
          <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-16 bg-[#0D0D12] border border-white/5 rounded-[4rem] p-12 md:p-24 shadow-2xl relative">
            <div className="absolute top-12 right-12 font-data text-accent/20 text-8xl font-bold opacity-10">{p.step}</div>
            <div className="w-full lg:w-1/2 flex flex-col gap-6 relative z-10">
              <div className="font-data text-accent text-sm uppercase tracking-widest px-4 py-1 border border-accent/20 rounded-full w-fit">Phase {p.step}</div>
              <h3 className="font-heading font-bold text-5xl md:text-7xl text-white leading-tight">{p.title}</h3>
              <p className="font-heading text-white/50 text-xl max-w-lg leading-relaxed">{p.desc}</p>
            </div>
            <div className="w-full lg:w-1/2 aspect-square flex items-center justify-center relative">
              <div className="absolute inset-0 bg-accent/5 rounded-full blur-[120px]" />
              {p.anim}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

const PlatformsAndProjects = () => {
  const { t } = useTranslation();
  return (
    <section id="projects" className="min-h-screen py-32 px-8 md:px-16 bg-[#030304] text-background flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="font-heading font-medium text-white/30 text-sm uppercase tracking-widest mb-16 flex items-center gap-4">
          <span className="w-12 h-px bg-white/20"></span>
          {t('projects.subtitle')}
        </h2>
        <h3 className="font-drama italic text-5xl md:text-8xl text-white mb-20">{t('projects.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 hover:bg-white/10 transition-all duration-500 group flex flex-col justify-between">
            <div>
              <div className="w-20 h-20 rounded-3xl bg-[#0D0D12] border border-white/10 flex items-center justify-center mb-10 overflow-hidden shadow-xl group-hover:scale-110 transition-transform p-4">
                <img src={ownChairLogo} alt="iOwnChair Logo" className="w-full h-full object-contain" />
              </div>
              <h4 className="font-heading font-bold text-3xl text-white mb-2">{t('projects.proj1.name')}</h4>
              <p className="font-data text-accent/60 text-xs uppercase tracking-widest mb-4">{t('projects.proj1.subtitle')}</p>
              <p className="font-heading text-lg text-white/60 mb-8">{t('projects.proj1.desc')}</p>
            </div>
            <a href="https://iownchair.com" target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center gap-3 text-accent text-lg font-bold hover:gap-6 transition-all">{t('projects.proj1.link')} <ArrowRight size={24} /></a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 hover:bg-white/10 transition-all duration-500 group flex flex-col justify-between">
            <div>
              <div className="w-20 h-20 rounded-3xl bg-[#0D0D12] border border-white/10 flex items-center justify-center mb-10 overflow-hidden shadow-xl group-hover:scale-110 transition-transform p-1">
                <img src={horecaLogo} alt="HoReCa Optimizer Logo" className="w-full h-full object-contain" />
              </div>
              <h4 className="font-heading font-bold text-3xl text-white mb-2">{t('projects.proj3.name')}</h4>
              <p className="font-data text-accent/60 text-xs uppercase tracking-widest mb-4">{t('projects.proj3.subtitle')}</p>
              <p className="font-heading text-lg text-white/60 mb-8">{t('projects.proj3.desc')}</p>
            </div>
            <a href="https://horeca-optimizer.com" target="_blank" rel="noopener noreferrer" className="mt-auto w-fit flex items-center gap-3 text-accent text-lg font-bold hover:gap-6 transition-all">{t('projects.proj3.link')} <ArrowRight size={24} /></a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 hover:bg-white/10 transition-all duration-500 group flex flex-col justify-between">
            <div>
              <div className="w-20 h-20 rounded-3xl bg-white/10 text-white flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform"><Terminal size={40} /></div>
              <h4 className="font-heading font-bold text-3xl text-white mb-2">{t('projects.proj2.name')}</h4>
              <p className="font-data text-accent/60 text-xs uppercase tracking-widest mb-4">{t('projects.proj2.subtitle')}</p>
              <p className="font-heading text-lg text-white/60 mb-8">{t('projects.proj2.desc')}</p>
            </div>
            <button className="mt-auto w-fit flex items-center gap-3 text-accent text-lg font-bold hover:gap-6 transition-all">{t('projects.proj2.link')} <ArrowRight size={24} /></button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Philosophy = () => {
  const sectionRef = useRef(null);
  const { t } = useTranslation();
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.phil-line', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        y: 50, opacity: 0, duration: 1.5, stagger: 0.3, ease: 'power4.out'
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);
  return (
    <section id="philosophy" ref={sectionRef} className="min-h-screen relative py-40 px-8 md:px-16 bg-background text-primary overflow-hidden flex items-center">
      <div className="absolute inset-0 light-grid-layer opacity-40"></div>
      <div className="absolute inset-0 light-marble-overlay"></div>

      <InteractiveGrid type="light" />

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col gap-16">
        <p className="phil-line font-heading text-2xl md:text-3xl text-slate/60 leading-relaxed max-w-3xl">
          {t('philosophy.line1', { focus: t('philosophy.focus1') })}
        </p>
        <p className="phil-line font-drama italic text-6xl md:text-8xl leading-none text-primary pr-10">
          {t('philosophy.line2', { focus: t('philosophy.focus2') })}
        </p>
        <p className="phil-line font-heading text-xl text-slate/50 max-w-xl">
          {t('philosophy.supporting')}
        </p>
      </div>
    </section>
  );
};

const Pricing = ({ onConsultationClick }) => {
  const { t } = useTranslation();
  return (
    <section className="min-h-screen py-32 bg-background text-primary px-8 rounded-[4rem] relative z-20 flex items-center overflow-hidden">
      <div className="absolute inset-0 light-grid-layer opacity-40"></div>

      <InteractiveGrid type="light" />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="text-center mb-24">
          <h2 className="font-drama italic text-6xl md:text-8xl text-primary mb-8">{t('pricing.title')}</h2>
          <p className="font-heading text-slate/50 text-xl max-w-xl mx-auto mb-4">{t('pricing.subtitle')}</p>
          <p className="font-data text-accent text-sm uppercase tracking-widest">{t('pricing.duration')}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
          <div className="bg-white/80 backdrop-blur-md border border-slate/10 shadow-sm rounded-[3rem] p-12 flex flex-col">
            <h3 className="font-heading font-bold text-2xl mb-4">{t('pricing.tier1.name')}</h3>
            <p className="font-data text-accent text-sm mb-10">{t('pricing.tier1.period')} <span className="text-4xl text-primary font-heading ml-2">{t('pricing.tier1.price')}</span></p>
            <ul className="flex flex-col gap-6 mb-12 flex-1 font-heading text-lg">
              {[1, 2, 3].map(i => <li key={i} className="flex items-center gap-4"><Check size={20} className="text-accent" /> {t(`pricing.tier1.feat${i}`)}</li>)}
            </ul>
            <button onClick={onConsultationClick} className="w-full py-5 rounded-full border border-slate/20 font-heading font-bold hover:bg-primary hover:text-white transition-all">{t('pricing.select')}</button>
          </div>
          <div className="bg-primary rounded-[3rem] p-12 text-background lg:scale-110 shadow-2xl relative overflow-hidden flex flex-col z-10 border border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -mr-20 -mt-20" />
            <h3 className="font-heading font-bold text-2xl mb-4 text-white">{t('pricing.tier2.name')}</h3>
            <p className="font-data text-accent text-sm mb-2">{t('pricing.tier2.period')} <span className="text-4xl text-white font-heading ml-2">{t('pricing.tier2.price')}</span></p>
            <p className="font-heading text-white/50 text-sm mb-8 leading-relaxed italic">{t('pricing.tier2.choice')}</p>
            <ul className="flex flex-col gap-6 mb-12 flex-1 font-heading text-lg text-white/80">
              {[1, 2, 3, 4].map(i => <li key={i} className="flex items-center gap-4"><Check size={20} className="text-accent" /> {t(`pricing.tier2.feat${i}`)}</li>)}
            </ul>
            <button onClick={onConsultationClick} className="btn-magnetic w-full py-5 bg-accent text-primary rounded-full font-heading font-bold shadow-xl">{t('pricing.select')}</button>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-slate/10 shadow-sm rounded-[3rem] p-12 flex flex-col">
            <h3 className="font-heading font-bold text-2xl mb-4">{t('pricing.tier3.name')}</h3>
            <p className="font-data text-slate/40 text-sm mb-10"><span className="text-4xl text-primary font-heading">{t('pricing.tier3.price')}</span> {t('pricing.tier3.period')}</p>
            <ul className="flex flex-col gap-6 mb-12 flex-1 font-heading text-lg">
              {[1, 2, 3].map(i => <li key={i} className="flex items-center gap-4"><Check size={20} className="text-accent" /> {t(`pricing.tier3.feat${i}`)}</li>)}
            </ul>
            <button onClick={onConsultationClick} className="w-full py-5 rounded-full border border-slate/20 font-heading font-bold hover:bg-primary hover:text-white transition-all">{t('pricing.contact')}</button>
          </div>
        </div>
      </div>
    </section>
  );
};

const FinalCta = ({ onConsultationClick }) => {
  const { t } = useTranslation();
  return (
    <section className="min-h-screen bg-primary text-background flex items-center justify-center p-8 relative z-0 overflow-hidden">
      <InteractiveGrid type="dark" />

      <div className="max-w-5xl mx-auto text-center flex flex-col items-center relative z-10 pointer-events-none">
        <h2 className="font-drama italic text-6xl md:text-9xl mb-12 leading-tight">{t('final_cta.title')}</h2>
        <div className="flex flex-wrap justify-center gap-6 mb-20 max-w-3xl pointer-events-auto">
          {[1, 2, 3].map(i => <div key={i} className="bg-white/5 px-8 py-5 rounded-2xl border border-white/10 flex items-center gap-4 font-heading text-lg"><Check size={24} className="text-accent" /> {t(`final_cta.list${i}`)}</div>)}
        </div>
        <button onClick={onConsultationClick} className="btn-magnetic bg-accent text-primary px-12 py-6 rounded-full font-heading font-bold text-2xl flex items-center gap-4 group pointer-events-auto">
          <span>{t('final_cta.btn')}</span>
          <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </section>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#030304] text-background pt-32 pb-16 px-8 relative z-10 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-24">
        <div className="max-w-md">
          <div className="font-heading font-bold text-3xl mb-6">
            <span className="text-accent">A</span>or<span className="text-accent">AA</span>gency
          </div>
          <p className="font-heading text-lg text-white/40 mb-12 leading-relaxed">{t('footer.tagline')}</p>
          <div className="flex flex-col gap-2 mb-12">
            <p className="font-heading text-white/60">{t('footer.address')}</p>
            <a href={`mailto:${t('footer.email')}`} className="font-heading text-accent hover:underline">{t('footer.email')}</a>
            <p className="font-data text-xs text-white/30 uppercase tracking-widest mt-4">{t('footer.region')}</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 w-fit">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" />
            <span className="font-data text-xs text-white/60 uppercase tracking-widest">{t('footer.status')}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-24 font-heading">
          <div className="flex flex-col gap-6">
            <div className="text-white/20 uppercase tracking-[0.2em] text-xs font-bold">{t('footer.nav_label')}</div>
            <a href="#features" className="hover:text-accent transition-colors text-lg">{t('nav.features')}</a>
            <a href="#projects" className="hover:text-accent transition-colors text-lg">{t('nav.projects')}</a>
            <a href="#protocol" className="hover:text-accent transition-colors text-lg">{t('nav.protocol')}</a>
          </div>
          <div className="flex flex-col gap-6">
            <div className="text-white/20 uppercase tracking-[0.2em] text-xs font-bold">{t('footer.legal_label')}</div>
            <a href="#" className="hover:text-accent transition-colors text-lg">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors text-lg">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const CustomPointer = () => {
  const dotRef = useRef(null);

  useEffect(() => {
    const setDotX = gsap.quickTo(dotRef.current, "x", { duration: 0.6, ease: "power3.out" });
    const setDotY = gsap.quickTo(dotRef.current, "y", { duration: 0.6, ease: "power3.out" });

    const handleMouseMove = (e) => {
      setDotX(e.clientX);
      setDotY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={dotRef}
      className="fixed top-0 left-0 w-4 h-4 bg-accent rounded-full border border-primary pointer-events-none z-[9999] -mt-2 -ml-2 shadow-sm"
      style={{ transform: 'translate(-100px, -100px)' }}
    ></div>
  );
}

const BrandGuidelines = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#030304] min-h-screen text-white selection:bg-accent selection:text-primary pt-32 pb-24 px-8 md:px-16 relative">
      <InteractiveGrid type="dark" />

      <div className="max-w-5xl mx-auto relative z-10">
        <a href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-accent transition-colors font-data text-xs uppercase tracking-widest mb-16">
          <ArrowRight className="rotate-180" size={16} /> Back to Home
        </a>

        <header className="mb-24">
          <h1 className="font-drama italic text-6xl md:text-8xl text-accent mb-6 leading-none">Brand Identity</h1>
          <p className="font-heading text-xl text-white/60 max-w-2xl">The official design system and brand guidelines for Aora Agency. Built to convey precision, luxury, and relentless performance.</p>
        </header>

        <section className="mb-32">
          <h2 className="font-heading font-medium text-white/30 text-sm uppercase tracking-widest mb-12 flex items-center gap-4">
            <span className="w-12 h-px bg-white/20"></span> Logs & Wordmark
          </h2>
          <div className="bg-[#0D0D12] border border-white/10 rounded-[3rem] p-12 md:p-24 shadow-2xl flex flex-col items-center justify-center">
            <div className="font-heading font-bold text-6xl md:text-8xl tracking-tight leading-none">
              <span className="text-accent">A</span>or<span className="text-accent">AA</span>gency
            </div>
            <p className="font-data text-white/40 mt-12 text-sm text-center max-w-md">Primary wordmark. The capital 'A's must always be rendered in the primary accent gold color.</p>
          </div>
        </section>

        <section className="mb-32">
          <h2 className="font-heading font-medium text-white/30 text-sm uppercase tracking-widest mb-12 flex items-center gap-4">
            <span className="w-12 h-px bg-white/20"></span> Color Palette
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-square rounded-[2rem] bg-[#030304] border border-white/10 shadow-lg" />
              <div>
                <h3 className="font-heading font-bold text-xl">Void Black</h3>
                <p className="font-data text-white/50 text-sm">#030304 — Primary Background</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-square rounded-[2rem] bg-[#0D0D12] border border-white/10 shadow-lg" />
              <div>
                <h3 className="font-heading font-bold text-xl">Deep Onyx</h3>
                <p className="font-data text-white/50 text-sm">#0D0D12 — Elevated Surfaces</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-square rounded-[2rem] bg-[#C9A84C] shadow-[0_0_40px_rgba(201,168,76,0.2)]" />
              <div>
                <h3 className="font-heading font-bold text-xl text-accent">Signature Gold</h3>
                <p className="font-data text-white/50 text-sm">#C9A84C — Accents & Actions</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-32">
          <h2 className="font-heading font-medium text-white/30 text-sm uppercase tracking-widest mb-12 flex items-center gap-4">
            <span className="w-12 h-px bg-white/20"></span> Typography
          </h2>
          <div className="flex flex-col gap-16">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
              <div className="font-data text-accent text-sm mb-4">Display — Editorial New (Italic)</div>
              <div className="font-drama italic text-5xl md:text-7xl">Cinematic & Elegant.</div>
              <p className="font-heading text-white/50 mt-4 max-w-xl">Used exclusively for large, impactful statements, hero sections, and section titles.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
              <div className="font-data text-accent text-sm mb-4">Heading & Body — Clash Display / Inter</div>
              <div className="font-heading font-bold text-4xl md:text-5xl">Structural and Bold.</div>
              <div className="font-heading text-xl mt-4">Clean body copy that remains highly readable.</div>
              <p className="font-heading text-white/50 mt-4 max-w-xl">Primarily used for navigation, paragraphs, features, and buttons.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
              <div className="font-data text-accent text-sm mb-4">Technical — JetBrains Mono</div>
              <div className="font-data text-lg uppercase tracking-[0.2em]">ENGINEERED PRECISION.</div>
              <p className="font-heading text-white/50 mt-4 max-w-xl">Used for labels, code snippets, micro-copy, and technical data points.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default function App() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    // Monkey patch pushState to detect local navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  if (currentPath === '/brand') {
    return (
      <>
        <CustomPointer />
        <BrandGuidelines />
      </>
    );
  }

  return (
    <div className="bg-background min-h-screen text-primary selection:bg-accent selection:text-primary overflow-x-hidden cursor-none">
      {!appLoaded && <Loader onComplete={() => setAppLoaded(true)} />}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <CustomPointer />
      <Navbar onConsultationClick={() => setIsContactOpen(true)} />
      <main>
        <Hero appLoaded={appLoaded} onConsultationClick={() => setIsContactOpen(true)} />
        <WhoWeAre />
        <InlineCta variant="1" theme="light" onConsultationClick={() => setIsContactOpen(true)} />
        <Features />
        <Philosophy />
        <InlineCta variant="2" theme="light" onConsultationClick={() => setIsContactOpen(true)} />
        <ProtocolSection />
        <PlatformsAndProjects />
        <InlineCta variant="3" theme="dark" onConsultationClick={() => setIsContactOpen(true)} />
        <Pricing onConsultationClick={() => setIsContactOpen(true)} />
        <FinalCta onConsultationClick={() => setIsContactOpen(true)} />
      </main>
      <Footer />
    </div>
  );
}
