import React, { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, Activity, Terminal, Clock, MousePointer2, Check, Languages, Globe2, Building2,
  Utensils, Scissors, Stethoscope, Ship, Users, X, ExternalLink, HardHat,
  Globe, Zap, Shield, ChevronDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ownChairLogo from './assets/square-logo-iOwnChair.png';
import horecaLogo from './assets/1.png';
import gradevinskiLogo from './assets/gradevinski dnevnik online logo.jpeg';
import delightAtelierLogo from './assets/logo-transparent-delight-atelier.png';
import elektroLightLogo from './assets/elektrolight transparent logo.png';

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
      <div className="absolute inset-0 bg-[#030304]/80 z-0"></div>
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
// EmailJS config — fill in your IDs from emailjs.com dashboard
const EMAILJS_SERVICE_ID  = 'service_646meli';
const EMAILJS_TEMPLATE_ID = 'template_jkl3ryk';
const EMAILJS_PUBLIC_KEY  = 'ZZKGUGTZMcmNIbher';

const ContactModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const containerRef = useRef(null);
  const { t } = useTranslation();

  const [form, setForm] = useState({ name: '', email: '', type: '', details: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (isOpen) {
        gsap.to(modalRef.current, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
        gsap.fromTo(containerRef.current, { y: 40, scale: 0.95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
        document.body.style.overflow = 'hidden';
      } else {
        gsap.to(modalRef.current, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
        document.body.style.overflow = '';
        setTimeout(() => setStatus('idle'), 400);
      }
    });
    return () => ctx.revert();
  }, [isOpen]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:    form.name,
          from_email:   form.email,
          project_type: form.type,
          message:      form.details,
          to_email:     'aoraagency.cro@gmail.com',
        },
        EMAILJS_PUBLIC_KEY
      );
      setStatus('success');
      setForm({ name: '', email: '', type: '', details: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputCls = "bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent/50 transition-colors";

  return (
    <div ref={modalRef} className="fixed inset-0 z-[100] invisible opacity-0 flex items-center justify-center px-4 cursor-default">
      <div className="absolute inset-0 bg-[#030304]/80 backdrop-blur-md" onClick={onClose} />

      <div ref={containerRef} className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0D0D12]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 md:p-12 shadow-[0_0_80px_rgba(201,168,76,0.1)]">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <h2 className="font-drama italic text-3xl md:text-5xl text-white mb-2">{t('contact.title')}</h2>
        <p className="font-heading text-white/50 mb-8">{t('contact.desc')}</p>

        {status === 'success' ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
              <Check size={28} className="text-accent" />
            </div>
            <p className="font-drama italic text-3xl text-white mb-3">Hvala!</p>
            <p className="font-heading text-white/50">Javit ćemo se uskoro.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-heading">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-data">{t('contact.name')}</label>
                <input name="name" type="text" required value={form.name} onChange={handleChange} className={inputCls} placeholder={t('contact.name_placeholder')} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-data">{t('contact.email')}</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange} className={inputCls} placeholder={t('contact.email_placeholder')} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-white/40 font-data">{t('contact.type')}</label>
              <select name="type" value={form.type} onChange={handleChange} className={`${inputCls} bg-[#0D0D12] appearance-none`}>
                <option value="" className="bg-[#0D0D12]">{t('contact.type_placeholder')}</option>
                <option value="website" className="bg-[#0D0D12]">{t('contact.type_opt1')}</option>
                <option value="booking" className="bg-[#0D0D12]">{t('contact.type_opt2')}</option>
                <option value="branding" className="bg-[#0D0D12]">{t('contact.type_opt3')}</option>
                <option value="other" className="bg-[#0D0D12]">{t('contact.type_opt4')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-white/40 font-data">{t('contact.details')}</label>
              <textarea name="details" required rows="4" value={form.details} onChange={handleChange} className={`${inputCls} resize-none`} placeholder={t('contact.details_placeholder')} />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm font-heading">Greška pri slanju. Pokušajte ponovo ili nas kontaktirajte direktno.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn-magnetic mt-4 bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold text-lg w-full hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-shadow whitespace-nowrap disabled:opacity-60"
            >
              {status === 'sending' ? '...' : t('contact.submit')}
            </button>
          </form>
        )}
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

          <button onClick={onConsultationClick} className="hidden md:block btn-magnetic bg-accent text-primary px-5 py-2 rounded-full font-heading font-semibold text-sm shrink-0 whitespace-nowrap">
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

          <button onClick={() => { handleMenuClick(); onConsultationClick(); }} className="mobile-menu-link mt-8 btn-magnetic w-full max-w-xs bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold text-lg flex items-center justify-center gap-3 whitespace-nowrap">
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
          <button onClick={onConsultationClick} className="btn-magnetic bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold text-lg flex items-center justify-center gap-3 group w-full sm:w-auto whitespace-nowrap">
            <span className="hidden sm:inline">{t('hero.cta')}</span>
            <span className="sm:hidden">{t('hero.cta_mobile')}</span>
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
  const industryImages = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop", // HoReCa
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000&auto=format&fit=crop", // Barbers
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop", // Clinics
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000&auto=format&fit=crop", // Tourism/Marine
    "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1000&auto=format&fit=crop"  // Booking/Business
  ];

  const handleCardEnter = (e) => {
    const card = e.currentTarget;
    const bg = card.querySelector('.card-hover-bg');
    const overlay = card.querySelector('.card-hover-overlay');
    const content = card.querySelector('.card-text');
    const icon = card.querySelector('.card-icon-container');

    gsap.to(bg, { opacity: 1, scale: 1.1, duration: 0.8, ease: 'power2.out' });
    gsap.to(overlay, { opacity: 0.8, duration: 0.8 });
    gsap.to(content, { color: '#ffffff', y: -5, duration: 0.4 });
    gsap.to(icon, { scale: 1.1, duration: 0.4 });
  };

  const handleCardLeave = (e) => {
    const card = e.currentTarget;
    const bg = card.querySelector('.card-hover-bg');
    const overlay = card.querySelector('.card-hover-overlay');
    const content = card.querySelector('.card-text');
    const icon = card.querySelector('.card-icon-container');

    gsap.to(bg, { opacity: 0, scale: 1, duration: 0.8, ease: 'power2.inOut' });
    gsap.to(overlay, { opacity: 0, duration: 0.8 });
    gsap.to(content, { color: '#030304', y: 0, duration: 0.4 });
    gsap.to(icon, { scale: 1, duration: 0.4 });
  };

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
            <div
              key={i}
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleCardLeave}
              className={`p-10 bg-white/80 backdrop-blur-sm border border-slate/5 rounded-[2.5rem] flex flex-col gap-6 shadow-sm hover:border-accent/30 transition-all duration-500 group relative overflow-hidden cursor-none ${i === 5 ? 'sm:col-span-2' : ''}`}
            >
              {/* Hover Background Layer */}
              <div className="card-hover-bg absolute inset-0 opacity-0 z-0">
                <img src={industryImages[i - 1]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="card-hover-overlay absolute inset-0 bg-[#030304] opacity-0 z-10 transition-opacity duration-500"></div>

              <div className="relative z-20 flex flex-col gap-6">
                <div className="card-icon-container text-accent transition-transform duration-500 w-fit">
                  {React.cloneElement(icons[i - 1], { size: 40, strokeWidth: 1.5 })}
                </div>
                <p className="card-text font-heading font-bold text-primary text-2xl leading-tight transition-all duration-500">
                  {t(`who_we_are.item${i}`)}
                </p>
              </div>
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
        <button
          onClick={(e) => {
            if (variant === '3') {
              const element = document.getElementById('pricing');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                return;
              }
            }
            onConsultationClick(e);
          }}
          className="btn-magnetic bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold text-lg flex items-center gap-3 transition-transform hover:scale-105 shrink-0 whitespace-nowrap"
        >
          {t(`inline_cta.${variant}.btn_mobile`) ? (
            <>
              <span className="hidden sm:inline">{t(`inline_cta.${variant}.btn`)}</span>
              <span className="sm:hidden">{t(`inline_cta.${variant}.btn_mobile`)}</span>
            </>
          ) : (
            <span>{t(`inline_cta.${variant}.btn`)}</span>
          )}
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
          end: () => `+=${isLast ? (window.innerWidth < 768 ? 50 : window.innerHeight * 0.4) : window.innerHeight}`,
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
        <div key={i} className="protocol-card w-full h-[100dvh] md:h-screen flex items-center justify-center bg-transparent px-4 md:px-16 overflow-hidden pt-24 pb-4 md:py-0">
          <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-16 bg-[#0D0D12] border border-white/5 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-24 shadow-2xl relative h-full md:h-auto my-auto overflow-hidden">
            <div className="absolute top-4 right-6 md:top-8 md:right-8 font-data text-accent/20 text-5xl md:text-8xl font-bold opacity-10">{p.step}</div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center gap-4 md:gap-6 relative z-10">
              <div className="font-data text-accent text-sm uppercase tracking-widest px-3 md:px-4 py-1 border border-accent/20 rounded-full w-fit mt-4 md:mt-0">Phase {p.step}</div>
              <h3 className="font-heading font-bold text-4xl md:text-7xl text-white leading-tight">{p.title}</h3>
              <p className="font-heading text-white/50 text-base md:text-xl max-w-lg leading-snug md:leading-relaxed">{p.desc}</p>
            </div>
            <div className="w-full lg:w-1/2 aspect-square max-h-[30vh] md:max-h-none flex items-center justify-center relative mt-auto md:mt-0 pb-4 md:pb-0">
              <div className="absolute inset-0 bg-accent/5 rounded-full blur-[120px]" />
              {p.anim}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

// --- Client Work Data ---

// WORK_DATA — non-translatable fields only.
// Translatable content (category, tagline, shortDesc, overview, challenge, deliverables, metrics)
// lives in src/i18n/locales/{en,hr,de}.json under the "work_projects" key.
//
// To add a video: set video to '/videos/your-file.mp4' (place the file in /public/videos/)
// To update logos: replace the logo image in src/assets/ with the same filename
const WORK_DATA = {
  'pecenjara-slon': {
    name: 'Pečenjara Slon',
    year: '2025',
    url: 'https://pecenjaraslon.com/',
    heroImage: new URL('./assets/hero-pecenjara-slon.png', import.meta.url).href,
    fullPageImage: new URL('./assets/fullpage-pecenjara-slon.png', import.meta.url).href,
    logo: new URL('./assets/favicon-pecenjara-slon.png', import.meta.url).href,
    video: '/videos/pecenjara-slon-video.mp4',
    tags: ['Web Design', 'Development', 'Brand Experience'],
  },
  'talentosphere': {
    name: 'TalentoSphere',
    year: '2025',
    url: 'https://www.talentosphere.com/',
    heroImage: new URL('./assets/hero-talentosphere.png', import.meta.url).href,
    fullPageImage: new URL('./assets/fullpage-talentosphere.png', import.meta.url).href,
    logo: new URL('./assets/favicon-talentosphere.png', import.meta.url).href,
    video: '/videos/talentosphere-video.mp4',
    tags: ['Web Design', 'Development', 'Multilingual'],
  },
  'delight-atelier': {
    name: 'Delight Atelier',
    year: '2025',
    url: 'https://delight-atelier.aoraagency.com/',
    heroImage: new URL('./assets/hero-delight-atelier.png', import.meta.url).href,
    fullPageImage: new URL('./assets/fullpage-delight-atelier.png', import.meta.url).href,
    logo: delightAtelierLogo,
    video: '/videos/delight-atelier-video.mp4',
    tags: ['Premium Design', 'Editorial Web', 'Multilingual', 'Brand Identity'],
  },
  'elektro-light': {
    name: 'Elektro Light',
    year: '2025',
    url: 'https://elektrolight.hr',
    heroImage: new URL('./assets/hero-elektro-light.png', import.meta.url).href,
    fullPageImage: new URL('./assets/fullpage-elektro-light.png', import.meta.url).href,
    logo: elektroLightLogo,
    video: '/videos/elektro-light-video.mp4',
    tags: ['Web Design', 'Development', 'Multilingual', 'Lead Generation'],
  },
};

// --- Site Preview Component (browser mockup — screenshot pan or video, no iframe) ---

const SitePreview = ({ url, projectName, fullPageImage, video, visitLabel }) => {
  return (
    <div className="relative group">
      <div className="bg-[#0D0D12] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
        {/* Browser chrome */}
        <div className="px-5 py-3.5 flex items-center gap-3 border-b border-white/5 bg-[#0a0a10]">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 min-w-0 bg-white/5 rounded-full px-4 py-1 font-data text-xs text-white/30 truncate">{url}</div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-accent transition-colors shrink-0">
            <ExternalLink size={14} />
          </a>
        </div>
        {/* Content window — aspect ratio matches 1900×940 source videos, no side cropping */}
        <div className="overflow-hidden relative w-full" style={{ aspectRatio: '1900 / 940' }}>
          {video ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              onLoadedMetadata={(e) => { e.target.playbackRate = 1.5; }}
            >
              <source src={video} type="video/mp4" />
            </video>
          ) : (
            <img
              src={fullPageImage}
              alt={projectName}
              className="w-full object-cover object-top"
              style={{ animation: 'pagePan 18s ease-in-out infinite alternate' }}
            />
          )}
        </div>
      </div>
      {/* Hover CTA */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 right-6 bg-accent text-primary px-5 py-2.5 rounded-full font-heading font-bold text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:gap-3 shadow-xl"
      >
        {visitLabel} <ExternalLink size={14} />
      </a>
    </div>
  );
};

// --- Work Detail Page ---

const WorkDetailPage = ({ slug, onConsultationClick }) => {
  const project = WORK_DATA[slug];
  const { t } = useTranslation();
  const heroRef = useRef(null);

  // All translatable content comes from i18n so the page follows the selected language
  const pt = project ? t(`work_projects.${slug}`, { returnObjects: true }) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    let ctx = gsap.context(() => {
      gsap.from('.work-hero-el', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power4.out',
        delay: 0.1,
      });
    }, heroRef);
    return () => ctx.revert();
  }, [slug]);

  const navigateHome = (e) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.scrollTo(0, 0);
  };

  if (!project) {
    return (
      <div className="bg-[#030304] min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="font-data text-accent text-xs uppercase tracking-widest mb-4">404</p>
          <h1 className="font-drama italic text-6xl mb-8">Project not found</h1>
          <a href="/" onClick={navigateHome} className="text-accent hover:underline font-heading">← {t('work.back')}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#030304] min-h-screen text-white selection:bg-accent selection:text-primary overflow-x-hidden cursor-none">
      <CustomPointer />
      <InteractiveGrid type="dark" />

      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between bg-[#030304]/80 backdrop-blur-md border-b border-white/5">
        <a href="/" onClick={navigateHome} className="font-heading font-bold text-lg md:text-xl tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-accent">A</span>or<span className="text-accent">AA</span>gency
        </a>
        <a
          href="/"
          onClick={navigateHome}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-data text-xs uppercase tracking-widest"
        >
          <ArrowRight className="rotate-180" size={14} />
          <span className="hidden sm:inline">{t('work.back')}</span>
          <span className="sm:hidden">{t('work.back_mobile')}</span>
        </a>
      </div>

      <div ref={heroRef} className="max-w-5xl mx-auto px-4 md:px-8 pt-28 md:pt-40 pb-16 md:pb-32 relative z-10">

        {/* Hero */}
        <div className="mb-12 md:mb-20">
          <div className="work-hero-el flex items-center gap-3 mb-6 md:mb-8 flex-wrap">
            <img src={project.logo} alt="" className="w-5 h-5 rounded object-contain" />
            <span className="font-data text-accent text-xs uppercase tracking-widest px-3 py-1 border border-accent/20 rounded-full">{pt.category}</span>
            <span className="font-data text-white/30 text-xs uppercase tracking-widest">{project.year}</span>
          </div>
          <h1 className="work-hero-el font-drama italic text-5xl sm:text-7xl md:text-[8rem] text-white leading-none mb-6 md:mb-8">{project.name}</h1>
          <p className="work-hero-el font-heading text-xl md:text-2xl text-white/50 max-w-2xl leading-relaxed">{pt.tagline}</p>
        </div>

        {/* Metrics strip */}
        <div className="work-hero-el grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-16 md:mb-24">
          {pt.metrics.map((m, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col gap-2">
              <p className="font-data text-accent text-xs uppercase tracking-widest">{m.label}</p>
              <p className="font-heading font-bold text-xl md:text-2xl text-white">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Overview + Deliverables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mb-16 md:mb-24">
          <div>
            <h2 className="font-heading font-medium text-white/30 text-xs uppercase tracking-widest mb-8 flex items-center gap-4">
              <span className="w-8 h-px bg-white/20"></span> {t('work.overview')}
            </h2>
            <p className="font-heading text-base md:text-xl text-white/70 leading-relaxed mb-6 md:mb-8">{pt.overview}</p>
            <p className="font-heading text-sm md:text-lg text-white/45 leading-relaxed italic">{pt.challenge}</p>
          </div>
          <div>
            <h2 className="font-heading font-medium text-white/30 text-xs uppercase tracking-widest mb-8 flex items-center gap-4">
              <span className="w-8 h-px bg-white/20"></span> {t('work.what_we_built')}
            </h2>
            <ul className="flex flex-col gap-5 mb-10">
              {pt.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-3 md:gap-4 font-heading text-base md:text-lg text-white/70">
                  <Check size={18} className="text-accent mt-0.5 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, i) => (
                <span key={i} className="font-data text-xs text-white/35 uppercase tracking-widest px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Site Preview */}
        <div className="mb-16 md:mb-24">
          <h2 className="font-heading font-medium text-white/30 text-xs uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-4">
            <span className="w-8 h-px bg-white/20"></span> {t('work.live_preview')}
          </h2>
          <SitePreview
            url={project.url}
            projectName={project.name}
            fullPageImage={project.fullPageImage}
            video={project.video}
            visitLabel={t('work.visit_live')}
          />
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-20 overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-accent/5 rounded-full blur-[80px] -mt-20" />
          <h2 className="font-drama italic text-3xl sm:text-4xl md:text-7xl text-white mb-4 md:mb-6 leading-tight relative z-10">{t('work.cta_title')}</h2>
          <p className="font-heading text-white/50 text-sm sm:text-base md:text-xl mb-8 md:mb-12 max-w-lg mx-auto relative z-10">{t('work.cta_desc')}</p>
          <button
            onClick={onConsultationClick}
            className="btn-magnetic bg-accent text-primary px-6 md:px-10 py-4 md:py-5 rounded-full font-heading font-bold text-sm sm:text-base md:text-xl inline-flex items-center gap-2 md:gap-4 group hover:shadow-[0_0_40px_rgba(201,168,76,0.35)] transition-shadow relative z-10"
          >
            <span className="hidden sm:inline">{t('work.cta_btn')}</span>
            <span className="sm:hidden">{t('work.cta_btn_mobile')}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform md:w-5 md:h-5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PlatformsAndProjects = ({ onConsultationClick }) => {
  const { t } = useTranslation();

  const navigateToWork = (e, slug) => {
    e.preventDefault();
    window.history.pushState({}, '', `/work/${slug}`);
    window.scrollTo(0, 0);
  };

  const workEntries = Object.entries(WORK_DATA);

  return (
    <section id="projects" className="py-16 md:py-32 bg-[#030304] text-background overflow-hidden">

      {/* Padded content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 w-full">

        {/* Section header */}
        <h2 className="font-heading font-medium text-white/30 text-sm uppercase tracking-widest mb-10 md:mb-16 flex items-center gap-4">
          <span className="w-12 h-px bg-white/20"></span>
          {t('projects.subtitle')}
        </h2>
        <h3 className="font-drama italic text-4xl sm:text-5xl md:text-8xl text-white mb-12 md:mb-20">{t('projects.title')}</h3>

        {/* Platforms grid — 1×3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

          {/* iOwnChair */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 hover:bg-white/8 transition-all duration-500 group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <img src={ownChairLogo} alt="iOwnChair Logo" className="w-full h-full object-contain" />
              </div>
              <h4 className="font-heading font-bold text-xl md:text-2xl text-white mb-1">{t('projects.proj1.name')}</h4>
              <p className="font-data text-accent/60 text-xs uppercase tracking-widest mb-3">{t('projects.proj1.subtitle')}</p>
              <p className="font-heading text-sm md:text-base text-white/55 mb-6 leading-relaxed">{t('projects.proj1.desc')}</p>
            </div>
            <a href="https://iownchair.com" target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center gap-2 text-accent text-sm font-bold hover:gap-4 transition-all">{t('projects.proj1.link')} <ArrowRight size={16} /></a>
          </div>

          {/* HoReCa Optimizer — temporarily hidden */}

          {/* Građevinski Dnevnik */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 hover:bg-white/8 transition-all duration-500 group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <img src={gradevinskiLogo} alt="Građevinski Dnevnik Logo" className="w-full h-full object-contain" style={{ mixBlendMode: 'screen' }} />
              </div>
              <h4 className="font-heading font-bold text-xl md:text-2xl text-white mb-1">{t('projects.proj4.name')}</h4>
              <p className="font-data text-accent/60 text-xs uppercase tracking-widest mb-3">{t('projects.proj4.subtitle')}</p>
              <p className="font-heading text-sm md:text-base text-white/55 mb-6 leading-relaxed">{t('projects.proj4.desc')}</p>
            </div>
            <a href="https://gradevinskidnevnik.online" target="_blank" rel="noopener noreferrer" className="mt-auto w-fit flex items-center gap-2 text-accent text-sm font-bold hover:gap-4 transition-all">{t('projects.proj4.link')} <ArrowRight size={16} /></a>
          </div>
        </div>

        {/* Custom Systems — full-width CTA card */}
        <div className="mt-6 md:mt-8 bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 hover:bg-white/8 transition-all duration-500 group">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Terminal size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-bold text-xl md:text-2xl text-white mb-1">{t('projects.proj2.name')}</h4>
            <p className="font-data text-accent/60 text-xs uppercase tracking-widest mb-2">{t('projects.proj2.subtitle')}</p>
            <p className="font-heading text-sm md:text-base text-white/55 leading-relaxed">{t('projects.proj2.desc')}</p>
          </div>
          <button
            onClick={onConsultationClick}
            className="shrink-0 btn-magnetic flex items-center gap-3 bg-accent text-primary px-6 py-3 rounded-full font-heading font-bold text-sm md:text-base whitespace-nowrap hover:shadow-[0_0_30px_rgba(201,168,76,0.25)] transition-shadow"
          >
            {t('projects.proj2.link')} <ArrowRight size={16} />
          </button>
        </div>

      </div>

      {/* Client Work Marquee — full viewport width */}
      <div className="mt-16 md:mt-24">

        {/* Label */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 mb-8 flex items-center gap-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="font-data text-white/20 text-xs uppercase tracking-widest shrink-0">{t('work.client_work')}</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Marquee — videos maintain 1900×940 aspect ratio, no gaps at loop point */}
        <div className="marquee-wrapper overflow-hidden">
          <div className="marquee-track" style={{ gap: '20px' }}>
            {[...workEntries, ...workEntries].map(([slug, project], i) => {
              const cardT = t(`work_projects.${slug}`, { returnObjects: true });
              return (
                <a
                  key={i}
                  href={`/work/${slug}`}
                  onClick={(e) => navigateToWork(e, slug)}
                  className="relative flex-shrink-0 group cursor-none outline-none border-0 bg-[#030304]"
                  style={{ width: '520px', aspectRatio: '1900/940', clipPath: 'inset(0 round 1.5rem)', WebkitClipPath: 'inset(0 round 1.5rem)', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
                >
                  {/* Video or hero image — object-contain keeps native ratio */}
                  {project.video ? (
                    <video
                      autoPlay muted loop playsInline
                      className="absolute inset-0 w-full h-full"
                      style={{ objectFit: 'cover' }}
                      onLoadedMetadata={(e) => { e.target.playbackRate = 1.5; }}
                    >
                      <source src={project.video} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={project.heroImage}
                      alt={project.name}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  )}

                  {/* Base dark overlay across entire card */}
                  <div className="absolute inset-0 bg-[#030504]/50" />
                  {/* Stronger gradient at bottom for text legibility */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, #030504 0%, #030504 38%, rgba(3,5,4,0.55) 58%, rgba(3,5,4,0.2) 80%, rgba(3,5,4,0.2) 100%)',
                    }}
                  />

                  {/* Text content — sits above the solid dark band */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <img src={project.logo} alt="" className="w-4 h-4 rounded object-contain shrink-0" />
                      <span className="font-data text-accent/70 text-xs uppercase tracking-widest truncate">{cardT.category}</span>
                    </div>
                    <h4 className="font-heading font-bold text-lg text-white mb-1 leading-tight">{project.name}</h4>
                    <p className="font-heading text-xs text-white/50 leading-relaxed line-clamp-2 mb-3">{cardT.shortDesc}</p>
                    <div className="flex items-center gap-2 text-accent text-sm font-bold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      {t('work.view_case_study')} <ArrowRight size={14} />
                    </div>
                  </div>
                </a>
              );
            })}
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
    <section id="pricing" className="min-h-screen py-32 bg-background text-primary px-8 rounded-[4rem] relative z-20 flex items-center overflow-hidden">
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
            <button onClick={onConsultationClick} className="w-full py-5 rounded-full border border-slate/20 font-heading font-bold hover:bg-primary hover:text-white transition-all whitespace-nowrap">{t('pricing.select')}</button>
          </div>
          <div className="bg-primary rounded-[3rem] p-12 text-background lg:scale-110 shadow-2xl relative overflow-hidden flex flex-col z-10 border border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -mr-20 -mt-20" />
            <h3 className="font-heading font-bold text-2xl mb-4 text-white">{t('pricing.tier2.name')}</h3>
            <p className="font-data text-accent text-sm mb-2">{t('pricing.tier2.period')} <span className="text-4xl text-white font-heading ml-2">{t('pricing.tier2.price')}</span></p>
            <p className="font-heading text-white/50 text-sm mb-8 leading-relaxed italic">{t('pricing.tier2.choice')}</p>
            <ul className="flex flex-col gap-6 mb-12 flex-1 font-heading text-lg text-white/80">
              {[1, 2, 3, 4].map(i => <li key={i} className="flex items-center gap-4"><Check size={20} className="text-accent" /> {t(`pricing.tier2.feat${i}`)}</li>)}
            </ul>
            <button onClick={onConsultationClick} className="btn-magnetic w-full py-5 bg-accent text-primary rounded-full font-heading font-bold shadow-xl whitespace-nowrap">{t('pricing.select')}</button>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-slate/10 shadow-sm rounded-[3rem] p-12 flex flex-col">
            <h3 className="font-heading font-bold text-2xl mb-4">{t('pricing.tier3.name')}</h3>
            <p className="font-data text-slate/40 text-sm mb-10"><span className="text-4xl text-primary font-heading">{t('pricing.tier3.price')}</span> {t('pricing.tier3.period')}</p>
            <ul className="flex flex-col gap-6 mb-12 flex-1 font-heading text-lg">
              {[1, 2, 3].map(i => <li key={i} className="flex items-center gap-4"><Check size={20} className="text-accent" /> {t(`pricing.tier3.feat${i}`)}</li>)}
            </ul>
            <button onClick={onConsultationClick} className="w-full py-5 rounded-full border border-slate/20 font-heading font-bold hover:bg-primary hover:text-white transition-all whitespace-nowrap">{t('pricing.contact')}</button>
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
        <h2 className="font-drama italic text-5xl sm:text-6xl md:text-9xl mb-8 md:mb-12 leading-tight">{t('final_cta.title')}</h2>
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-6 mb-12 md:mb-20 w-full max-w-3xl pointer-events-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 px-5 py-3.5 sm:px-8 sm:py-5 rounded-2xl border border-white/10 flex items-center gap-3 sm:gap-4 font-heading text-base sm:text-lg w-full sm:w-auto justify-center sm:justify-start">
              <Check size={20} className="text-accent shrink-0 sm:w-6 sm:h-6" /> {t(`final_cta.list${i}`)}
            </div>
          ))}
        </div>
        <button onClick={onConsultationClick} className="btn-magnetic bg-accent text-primary px-8 py-4 sm:px-12 sm:py-6 rounded-full font-heading font-bold text-xl sm:text-2xl flex items-center gap-3 sm:gap-4 group pointer-events-auto whitespace-nowrap">
          <span className="hidden sm:inline">{t('final_cta.btn')}</span>
          <span className="sm:hidden">{t('final_cta.btn_mobile')}</span>
          <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform sm:w-8 sm:h-8" />
        </button>
      </div>
    </section>
  );
};

const navigateTo = (path) => {
  window.history.pushState({}, '', path);
  window.scrollTo(0, 0);
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
            <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigateTo('/privacy-policy'); }} className="hover:text-accent transition-colors text-lg cursor-none">{t('footer.privacy')}</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); navigateTo('/terms'); }} className="hover:text-accent transition-colors text-lg cursor-none">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Legal Pages ---

const LegalPageShell = ({ children }) => {
  const { t } = useTranslation();
  const navigateHome = (e) => { e.preventDefault(); navigateTo('/'); };
  return (
    <div className="bg-[#030304] min-h-screen text-white selection:bg-accent selection:text-primary overflow-x-hidden cursor-none">
      <CustomPointer />
      <div className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between bg-[#030304]/80 backdrop-blur-md border-b border-white/5">
        <a href="/" onClick={navigateHome} className="font-heading font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-accent">A</span>or<span className="text-accent">AA</span>gency
        </a>
        <a href="/" onClick={navigateHome} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-data text-xs uppercase tracking-widest">
          <ArrowRight className="rotate-180" size={14} /> Home
        </a>
      </div>
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-28 md:pt-36 pb-24">
        {children}
      </div>
    </div>
  );
};

const PrivacyPolicyPage = () => (
  <LegalPageShell>
    <p className="font-data text-accent text-xs uppercase tracking-widest mb-4">Pravni dokumenti</p>
    <h1 className="font-drama italic text-5xl md:text-7xl text-white leading-none mb-4">Politika privatnosti</h1>
    <p className="font-heading text-white/40 text-sm mb-16">Zadnja izmjena: 1. siječnja 2025.</p>

    <div className="flex flex-col gap-12 font-heading text-white/70 leading-relaxed">

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">1. Voditelj obrade podataka</h2>
        <p>Aora Agency, obrt za web dizajn i razvoj, Zagreb, Hrvatska<br />
        E-mail: <a href="mailto:hello@aoraagency.com" className="text-accent hover:underline">hello@aoraagency.com</a></p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">2. Koje podatke prikupljamo</h2>
        <p className="mb-3">Putem kontaktnog obrasca na ovoj web stranici prikupljamo sljedeće osobne podatke koje nam dobrovoljno dostavljate:</p>
        <ul className="flex flex-col gap-2 list-disc list-inside text-white/60">
          <li>Ime i prezime</li>
          <li>E-mail adresa</li>
          <li>Vrsta projekta i detalji upita</li>
        </ul>
        <p className="mt-3">Web stranica ne koristi analitičke kolačiće niti alate za praćenje posjetitelja. Ne prikupljamo nikakve tehničke podatke osim onih nužnih za funkcioniranje stranice.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">3. Svrha i pravna osnova obrade</h2>
        <p>Vaše podatke obrađujemo isključivo u svrhu odgovora na vaš upit i moguće uspostave poslovne suradnje. Pravna osnova obrade je vaš pristanak koji dajete slanjem kontaktnog obrasca (čl. 6. st. 1. toč. a) GDPR-a) te legitimni interes za odgovaranje na poslovne upite (čl. 6. st. 1. toč. f) GDPR-a).</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">4. Rok čuvanja podataka</h2>
        <p>Vaše podatke čuvamo onoliko dugo koliko je potrebno za obradu upita, odnosno najdulje do završetka eventualnog poslovnog odnosa. Podatke koji nisu rezultirali suradnjom brišemo u roku od 12 mjeseci od primitka upita.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">5. Dijeljenje podataka s trećim stranama</h2>
        <p className="mb-3">Koristimo uslugu EmailJS (emailjs.com) kao tehničkog posrednika za dostavu kontaktnih poruka. EmailJS djeluje kao izvršitelj obrade u skladu s GDPR-om. Vaše podatke ne prodajemo niti dijelimo s trećim stranama u marketinške svrhe.</p>
        <p>Web stranica je pohranjena na platformi Netlify (netlify.com). Netlify može pohraniti tehničke podatke o pristupu u skladu sa svojom politikom privatnosti.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">6. Vaša prava</h2>
        <p className="mb-3">Sukladno GDPR-u, imate sljedeća prava u pogledu svojih osobnih podataka:</p>
        <ul className="flex flex-col gap-2 list-disc list-inside text-white/60">
          <li>Pravo na pristup — možete zatražiti uvid u podatke koje čuvamo o vama</li>
          <li>Pravo na ispravak — možete zatražiti ispravak netočnih podataka</li>
          <li>Pravo na brisanje — možete zatražiti brisanje vaših podataka</li>
          <li>Pravo na ograničenje obrade — možete zatražiti privremenu obustavu obrade</li>
          <li>Pravo na prenosivost podataka — možete zatražiti dostavu podataka u strojno čitljivom formatu</li>
          <li>Pravo na prigovor — možete uložiti prigovor na obradu temeljenu na legitimnom interesu</li>
          <li>Pravo na povlačenje pristanka — u svakom trenutku možete povući pristanak bez utjecaja na zakonitost prethodne obrade</li>
        </ul>
        <p className="mt-4">Zahtjeve možete uputiti na: <a href="mailto:hello@aoraagency.com" className="text-accent hover:underline">hello@aoraagency.com</a></p>
        <p className="mt-3">Imate i pravo podnijeti pritužbu nadležnom nadzornom tijelu — Agenciji za zaštitu osobnih podataka (AZOP), Selska cesta 136, 10 000 Zagreb, <a href="https://azop.hr" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">azop.hr</a>.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">7. Kolačići</h2>
        <p>Ova web stranica ne koristi marketinške niti analitičke kolačiće. Koriste se isključivo tehnički nužni kolačići koji su potrebni za ispravno funkcioniranje stranice i koji ne zahtijevaju vaš pristanak.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">8. Sigurnost podataka</h2>
        <p>Poduzimamo odgovarajuće tehničke i organizacijske mjere zaštite kako bismo osigurali sigurnost vaših osobnih podataka od neovlaštenog pristupa, izmjene, otkrivanja ili uništenja.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">9. Izmjene ove politike</h2>
        <p>Zadržavamo pravo izmjene ove Politike privatnosti. Sve izmjene bit će objavljene na ovoj stranici s ažuriranim datumom zadnje izmjene. Preporučujemo povremenu provjeru ove stranice.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">10. Kontakt</h2>
        <p>Za sva pitanja vezana uz obradu vaših osobnih podataka obratite nam se na:<br />
        <a href="mailto:hello@aoraagency.com" className="text-accent hover:underline">hello@aoraagency.com</a></p>
      </section>
    </div>
  </LegalPageShell>
);

const TermsOfUsePage = () => (
  <LegalPageShell>
    <p className="font-data text-accent text-xs uppercase tracking-widest mb-4">Pravni dokumenti</p>
    <h1 className="font-drama italic text-5xl md:text-7xl text-white leading-none mb-4">Uvjeti korištenja</h1>
    <p className="font-heading text-white/40 text-sm mb-16">Zadnja izmjena: 1. siječnja 2025.</p>

    <div className="flex flex-col gap-12 font-heading text-white/70 leading-relaxed">

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">1. Prihvaćanje uvjeta</h2>
        <p>Korištenjem ove web stranice (aoraagency.com) prihvaćate ove Uvjete korištenja u cijelosti. Ako se ne slažete s bilo kojim dijelom ovih uvjeta, molimo vas da prestanete koristiti stranicu. Vlasnik i upravitelj stranice je Aora Agency, Zagreb, Hrvatska.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">2. Intelektualno vlasništvo</h2>
        <p className="mb-3">Sav sadržaj na ovoj web stranici — uključujući tekstove, grafike, logotipe, fotografije, videa, dizajn i kod — vlasništvo je Aora Agency ili odgovarajućih nositelja prava, te je zaštićen primjenjivim zakonima o autorskim pravima i intelektualnom vlasništvu.</p>
        <p>Nije dozvoljeno kopiranje, reproduciranje, distribucija, javno prikazivanje niti stvaranje izvedenih djela temeljenih na sadržaju ove stranice bez prethodne pisane suglasnosti Aora Agency.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">3. Korištenje stranice</h2>
        <p className="mb-3">Suglasni ste da ćete koristiti ovu stranicu isključivo u zakonite svrhe i na način koji ne krši prava trećih osoba. Zabranjeno je:</p>
        <ul className="flex flex-col gap-2 list-disc list-inside text-white/60">
          <li>Korištenje stranice za bilo kakvu nezakonitu svrhu</li>
          <li>Pokušaj neovlaštenog pristupa sustavima ili podacima</li>
          <li>Slanje neželjenih poruka ili spam sadržaja putem kontaktnog obrasca</li>
          <li>Lažno predstavljanje ili navođenje na pogrešan zaključak o identitetu ili namjeri</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">4. Sadržaj i točnost informacija</h2>
        <p>Nastojimo osigurati točnost i ažurnost svih informacija na ovoj stranici, no ne jamčimo potpunost, točnost ni prikladnost sadržaja za određenu svrhu. Zadržavamo pravo izmjene, dopune ili uklanjanja sadržaja u bilo koje vrijeme bez prethodne najave.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">5. Poveznice na vanjske stranice</h2>
        <p>Ova stranica može sadržavati poveznice na vanjske web stranice. Te stranice nisu pod našom kontrolom i ne odgovaramo za njihov sadržaj, politiku privatnosti ni prakse. Preporučujemo da pregledate uvjete korištenja i politiku privatnosti svake stranice koju posjetite.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">6. Ograničenje odgovornosti</h2>
        <p>U najvećoj mjeri dopuštenoj primjenjivim zakonima, Aora Agency neće biti odgovorna za bilo kakvu izravnu, neizravnu, slučajnu, posebnu ili posljedičnu štetu koja nastane iz korištenja ili nemogućnosti korištenja ove web stranice ili njezinog sadržaja, uključujući ali ne ograničavajući se na gubitak podataka, poslovne prilike ili prihoda.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">7. Dostupnost stranice</h2>
        <p>Ne jamčimo neprekidnu dostupnost web stranice. Stranica može biti privremeno nedostupna zbog tehničkih radova, nadogradnji ili okolnosti izvan naše kontrole. Ne odgovaramo za štetu nastalu zbog privremene nedostupnosti.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">8. Mjerodavno pravo i nadležnost</h2>
        <p>Ovi Uvjeti korištenja podliježu pravu Republike Hrvatske. Za sve sporove koji mogu nastati iz ili u vezi s korištenjem ove web stranice nadležan je sud u Zagrebu, Republika Hrvatska.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">9. Izmjene uvjeta</h2>
        <p>Zadržavamo pravo izmjene ovih Uvjeta korištenja u bilo koje vrijeme. Izmijenjeni uvjeti stupaju na snagu objavom na ovoj stranici. Nastavak korištenja stranice nakon objave izmjena smatra se prihvaćanjem novih uvjeta.</p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-white text-xl mb-4">10. Kontakt</h2>
        <p>Za sva pitanja vezana uz ove Uvjete korištenja obratite nam se na:<br />
        <a href="mailto:hello@aoraagency.com" className="text-accent hover:underline">hello@aoraagency.com</a></p>
      </section>

    </div>
  </LegalPageShell>
);

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
      className="fixed top-0 left-0 w-4 h-4 bg-accent rounded-full border border-primary pointer-events-none z-[9999] -mt-2 -ml-2 shadow-sm hidden md:block"
      style={{ transform: 'translate(-100px, -100px)' }}
    ></div>
  );
}

const BrandGuidelines = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const SectionLabel = ({ children }) => (
    <h2 className="font-heading font-medium text-white/30 text-sm uppercase tracking-widest mb-12 flex items-center gap-4">
      <span className="w-12 h-px bg-white/20 shrink-0" /> {children}
    </h2>
  );

  return (
    <div className="bg-[#030304] min-h-screen text-white selection:bg-accent selection:text-primary pt-32 pb-24 px-8 md:px-16 relative">
      <InteractiveGrid type="dark" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back link */}
        <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }} className="inline-flex items-center gap-2 text-white/50 hover:text-accent transition-colors font-data text-xs uppercase tracking-widest mb-16">
          <ArrowRight className="rotate-180" size={16} /> Back to Home
        </a>

        {/* Header */}
        <header className="mb-24">
          <p className="font-data text-accent text-xs uppercase tracking-widest mb-6">AorAAgency — Brand Identity System</p>
          <h1 className="font-drama italic text-6xl md:text-8xl text-white mb-6 leading-none">Brand <span className="text-accent">Identity.</span></h1>
          <p className="font-heading text-xl text-white/60 max-w-2xl leading-relaxed">The official design system and brand guidelines for AorAAgency. Every decision here reflects one principle: precision over decoration.</p>
        </header>

        {/* 1. Brand Philosophy */}
        <section className="mb-32">
          <SectionLabel>Brand Philosophy</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { n: '01', title: 'Precision over decoration', desc: 'Every element earns its place. No gradients for aesthetics alone, no copy that says nothing.' },
              { n: '02', title: 'Long-term over short-term', desc: 'We build systems that last. The brand should feel relevant in 5 years, not just trend-forward today.' },
              { n: '03', title: 'Premium without excess', desc: 'Restraint is the luxury. White space, sharp type, and gold used sparingly — not liberally.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col gap-6">
                <span className="font-drama italic text-5xl text-accent/40 leading-none">{n}</span>
                <div>
                  <h3 className="font-heading font-bold text-lg mb-2">{title}</h3>
                  <p className="font-heading text-white/50 text-base leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
            <p className="font-data text-accent text-xs uppercase tracking-widest mb-4">Brand Voice</p>
            <p className="font-heading text-white/70 text-lg leading-relaxed max-w-3xl">Direct and confident — never salesy. The copy starts with what we do, not how great we are. Sentences are short. Claims are backed by numbers. We don't use the word <em className="text-white/40">"innovative"</em>.</p>
          </div>
        </section>

        {/* 2. Logo & Wordmark */}
        <section className="mb-32">
          <SectionLabel>Logo & Wordmark</SectionLabel>

          {/* Dark variant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-4">
              <div className="bg-[#0D0D12] border border-white/10 rounded-[2.5rem] p-12 flex items-center justify-center">
                <div className="font-heading font-bold text-5xl md:text-6xl tracking-tight leading-none">
                  <span className="text-accent">A</span>or<span className="text-accent">AA</span>gency
                </div>
              </div>
              <p className="font-data text-white/30 text-xs uppercase tracking-widest text-center">Dark background — primary use</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-[#FAF8F5] border border-black/5 rounded-[2.5rem] p-12 flex items-center justify-center">
                <div className="font-heading font-bold text-5xl md:text-6xl tracking-tight leading-none text-[#0D0D12]">
                  <span className="text-[#C9A84C]">A</span>or<span className="text-[#C9A84C]">AA</span>gency
                </div>
              </div>
              <p className="font-data text-white/30 text-xs uppercase tracking-widest text-center">Light background — secondary use</p>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
            <p className="font-data text-accent text-xs uppercase tracking-widest mb-6">Usage Rules</p>
            <ul className="flex flex-col gap-4">
              {[
                'The two A\'s ("A" and "AA") must always render in Signature Gold (#C9A84C).',
                'Never stretch, rotate, recolor, or add effects to the wordmark.',
                'Minimum digital size: 120px wide. Never render below this threshold.',
                'Never place the wordmark on medium-gray (#888–#CCC range) backgrounds — contrast fails.',
                'Maintain clear space of at least 1× the cap-height of the "A" on all four sides.',
                'Font used: Inter, 700 (bold), tracking-tight. Do not substitute.',
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-4 font-heading text-white/60 text-base">
                  <Check size={16} className="text-accent mt-1 shrink-0" /> {rule}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. Color Palette */}
        <section className="mb-32">
          <SectionLabel>Color Palette</SectionLabel>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {[
              { bg: 'bg-[#030304]', border: 'border-white/10', name: 'Void Black', hex: '#030304', token: 'bg-[#030304]', use: 'Page background, overlays' },
              { bg: 'bg-[#0D0D12]', border: 'border-white/10', name: 'Deep Onyx', hex: '#0D0D12', token: 'bg-primary', use: 'Elevated surfaces, cards' },
              { bg: 'bg-[#2A2A35]', border: 'border-white/10', name: 'Graphite', hex: '#2A2A35', token: 'bg-slate', use: 'Borders, secondary text' },
              { bg: 'bg-[#FAF8F5]', border: 'border-black/10', name: 'Cream', hex: '#FAF8F5', token: 'bg-background', use: 'Light section backgrounds', dark: true },
              { bg: 'bg-[#C9A84C]', border: '', name: 'Signature Gold', hex: '#C9A84C', token: 'bg-accent', use: 'CTAs, highlights, the two A\'s', glow: true },
            ].map(({ bg, border, name, hex, token, use, dark, glow }) => (
              <div key={hex} className="flex flex-col gap-4">
                <div className={`w-full aspect-square rounded-[2rem] ${bg} ${border ? `border ${border}` : ''} ${glow ? 'shadow-[0_0_40px_rgba(201,168,76,0.25)]' : 'shadow-lg'}`} />
                <div>
                  <h3 className={`font-heading font-bold text-lg ${name === 'Signature Gold' ? 'text-accent' : ''}`}>{name}</h3>
                  <p className="font-data text-white/40 text-xs mt-1">{hex} — <span className="text-white/25">{token}</span></p>
                  <p className="font-heading text-white/40 text-sm mt-1">{use}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gold opacity scale */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
            <p className="font-data text-accent text-xs uppercase tracking-widest mb-6">Signature Gold — Opacity Scale</p>
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'Full', cls: 'bg-[#C9A84C]', opacity: '100%' },
                { label: '/80', cls: 'bg-[#C9A84C]/80', opacity: '80%' },
                { label: '/50', cls: 'bg-[#C9A84C]/50', opacity: '50%' },
                { label: '/20', cls: 'bg-[#C9A84C]/20', opacity: '20%' },
                { label: '/10', cls: 'bg-[#C9A84C]/10', opacity: '10%' },
                { label: '/5', cls: 'bg-[#C9A84C]/5', opacity: '5%' },
              ].map(({ label, cls, opacity }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className={`w-16 h-16 rounded-2xl ${cls} border border-white/10`} />
                  <span className="font-data text-white/30 text-xs">{opacity}</span>
                </div>
              ))}
            </div>
            <p className="font-heading text-white/40 text-sm mt-6">Use lower opacities for backgrounds, glows, and subtle tints. Reserve full opacity for interactive elements and the wordmark.</p>
          </div>
        </section>

        {/* 4. Typography */}
        <section className="mb-32">
          <SectionLabel>Typography</SectionLabel>
          <div className="flex flex-col gap-8">
            {/* Display */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <p className="font-data text-accent text-xs uppercase tracking-widest mb-1">Display</p>
                  <p className="font-heading font-bold text-white text-lg">Playfair Display — Italic</p>
                </div>
                <p className="font-data text-white/30 text-xs">Class: <span className="text-white/50">font-drama italic</span></p>
              </div>
              <div className="font-drama italic text-5xl md:text-7xl mb-6 leading-tight">Cinematic & Elegant.</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="font-data text-white/30 text-xs uppercase tracking-widest mb-2">Sizes used</p>
                  <p className="font-heading text-white/60 text-sm">text-5xl → text-9xl (hero, FinalCta, section titles)</p>
                </div>
                <div>
                  <p className="font-data text-white/30 text-xs uppercase tracking-widest mb-2">Rules</p>
                  <p className="font-heading text-white/60 text-sm">Always italic. Never upright. Never body text. Never below text-4xl.</p>
                </div>
              </div>
            </div>

            {/* Heading & Body */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <p className="font-data text-accent text-xs uppercase tracking-widest mb-1">Heading & Body</p>
                  <p className="font-heading font-bold text-white text-lg">Inter</p>
                </div>
                <p className="font-data text-white/30 text-xs">Class: <span className="text-white/50">font-heading</span></p>
              </div>
              <div className="font-heading font-bold text-4xl md:text-5xl mb-2">Structural and Bold.</div>
              <div className="font-heading text-xl text-white/60 mb-6">Clean body copy that remains highly readable at any size.</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="font-data text-white/30 text-xs uppercase tracking-widest mb-2">Weights used</p>
                  <p className="font-heading text-white/60 text-sm">400 (body), 500 (medium), 600 (semibold), 700 (bold / headings)</p>
                </div>
                <div>
                  <p className="font-data text-white/30 text-xs uppercase tracking-widest mb-2">Rules</p>
                  <p className="font-heading text-white/60 text-sm">Default for all UI text. Navigation, paragraphs, buttons, form labels, and most headings.</p>
                </div>
              </div>
            </div>

            {/* Technical */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <p className="font-data text-accent text-xs uppercase tracking-widest mb-1">Technical</p>
                  <p className="font-heading font-bold text-white text-lg">JetBrains Mono</p>
                </div>
                <p className="font-data text-white/30 text-xs">Class: <span className="text-white/50">font-data</span></p>
              </div>
              <div className="font-data text-2xl uppercase tracking-[0.2em] mb-6">ENGINEERED PRECISION.</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="font-data text-white/30 text-xs uppercase tracking-widest mb-2">Sizes used</p>
                  <p className="font-heading text-white/60 text-sm">text-xs → text-sm (labels, badges, metadata, section prefixes)</p>
                </div>
                <div>
                  <p className="font-data text-white/30 text-xs uppercase tracking-widest mb-2">Rules</p>
                  <p className="font-heading text-white/60 text-sm">Always uppercase. Letter spacing: tracking-widest or tracking-[0.15em]+. Never for body text.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Type Scale */}
        <section className="mb-32">
          <SectionLabel>Type Scale</SectionLabel>
          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
            {[
              { cls: 'text-xs', px: '12px', font: 'font-data', use: 'Micro-labels, section prefixes' },
              { cls: 'text-sm', px: '14px', font: 'font-data / font-heading', use: 'Badges, captions, secondary copy' },
              { cls: 'text-base', px: '16px', font: 'font-heading', use: 'Body text, button labels' },
              { cls: 'text-lg', px: '18px', font: 'font-heading', use: 'Feature descriptions, list items' },
              { cls: 'text-xl', px: '20px', font: 'font-heading', use: 'Sub-headings, card titles' },
              { cls: 'text-2xl', px: '24px', font: 'font-heading', use: 'Primary CTA button, card headers' },
              { cls: 'text-3xl', px: '30px', font: 'font-heading / font-drama', use: 'Section sub-titles' },
              { cls: 'text-4xl', px: '36px', font: 'font-drama italic', use: 'Mobile hero headings' },
              { cls: 'text-5xl', px: '48px', font: 'font-drama italic', use: 'Section titles (mobile)' },
              { cls: 'text-6xl', px: '60px', font: 'font-drama italic', use: 'FinalCta title (mobile)' },
              { cls: 'text-7xl', px: '72px', font: 'font-drama italic', use: 'Section titles (desktop)' },
              { cls: 'text-9xl', px: '128px', font: 'font-drama italic', use: 'Hero / FinalCta (desktop)' },
            ].map(({ cls, px, font, use }, i) => (
              <div key={cls} className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-8 py-5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''} border-b border-white/5 last:border-0`}>
                <div className="w-24 shrink-0">
                  <span className="font-data text-accent text-xs">{cls}</span>
                </div>
                <div className="w-16 shrink-0">
                  <span className="font-data text-white/30 text-xs">{px}</span>
                </div>
                <div className="flex-1">
                  <span className="font-data text-white/25 text-xs">{font}</span>
                </div>
                <div className="flex-1">
                  <span className="font-heading text-white/50 text-sm">{use}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Spacing & Border Radius */}
        <section className="mb-32">
          <SectionLabel>Spacing & Border Radius</SectionLabel>

          <div className="mb-12">
            <p className="font-data text-white/30 text-xs uppercase tracking-widest mb-8">Border Radius Scale</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { cls: 'rounded-xl', label: 'rounded-xl', use: 'Inputs, tags' },
                { cls: 'rounded-2xl', label: 'rounded-2xl', use: 'Pills, list cards' },
                { cls: 'rounded-3xl', label: 'rounded-3xl', use: 'Inline CTAs' },
                { cls: 'rounded-[2rem]', label: 'rounded-[2rem]', use: 'Standard cards' },
                { cls: 'rounded-[2.5rem]', label: 'rounded-[2.5rem]', use: 'Feature cards' },
                { cls: 'rounded-[4rem]', label: 'rounded-[4rem]', use: 'Large sections' },
              ].map(({ cls, label, use }) => (
                <div key={label} className="flex flex-col items-center gap-3">
                  <div className={`w-full aspect-square bg-white/10 border border-white/10 ${cls}`} />
                  <div className="text-center">
                    <p className="font-data text-accent text-xs">{label}</p>
                    <p className="font-heading text-white/40 text-xs mt-0.5">{use}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
            <p className="font-data text-white/30 text-xs uppercase tracking-widest mb-8">Spacing Rhythm</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '12px', cls: 'gap-3 / p-3', use: 'Tight: icon + label, badge internals' },
                { value: '24px', cls: 'gap-6 / p-6', use: 'Standard: list items, nav links' },
                { value: '48px', cls: 'gap-12 / p-12', use: 'Medium: section sub-parts, card padding' },
                { value: '96px', cls: 'gap-24 / mb-24', use: 'Large: between major sections' },
              ].map(({ value, cls, use }) => (
                <div key={value} className="flex flex-col gap-3">
                  <div className="font-drama italic text-3xl text-accent">{value}</div>
                  <p className="font-data text-white/50 text-xs">{cls}</p>
                  <p className="font-heading text-white/40 text-sm">{use}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Component Library */}
        <section className="mb-32">
          <SectionLabel>Component Library</SectionLabel>
          <div className="flex flex-col gap-8">

            {/* Buttons */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
              <p className="font-data text-accent text-xs uppercase tracking-widest mb-8">Buttons</p>
              <div className="flex flex-wrap gap-6 items-center mb-6">
                <button className="btn-magnetic bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold text-base flex items-center gap-3">
                  Book a Free Consultation <ArrowRight size={18} />
                </button>
                <button className="py-4 px-8 rounded-full border border-white/20 font-heading font-bold text-base hover:bg-white/5 transition-all">
                  Secondary Action
                </button>
                <button className="py-3 px-6 rounded-full border border-accent/30 font-heading font-bold text-sm text-accent hover:bg-accent/10 transition-all">
                  Tertiary / Outline
                </button>
              </div>
              <div className="flex flex-col gap-2 pt-6 border-t border-white/10">
                <p className="font-data text-white/30 text-xs">Primary: <span className="text-white/50">btn-magnetic bg-accent text-primary px-8 py-4 rounded-full font-heading font-bold</span></p>
                <p className="font-data text-white/30 text-xs">Secondary: <span className="text-white/50">border border-white/20 rounded-full font-heading font-bold hover:bg-white/5</span></p>
                <p className="font-data text-white/30 text-xs">Tertiary: <span className="text-white/50">border border-accent/30 text-accent rounded-full font-heading font-bold hover:bg-accent/10</span></p>
              </div>
            </div>

            {/* Section Label */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
              <p className="font-data text-accent text-xs uppercase tracking-widest mb-8">Section Label</p>
              <div className="mb-6">
                <h2 className="font-heading font-medium text-white/30 text-sm uppercase tracking-widest flex items-center gap-4">
                  <span className="w-12 h-px bg-white/20 shrink-0" /> Section Name
                </h2>
              </div>
              <p className="font-data text-white/30 text-xs pt-6 border-t border-white/10">font-heading font-medium text-white/30 text-sm uppercase tracking-widest + w-12 h-px bg-white/20 rule</p>
            </div>

            {/* Tags / Badges */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
              <p className="font-data text-accent text-xs uppercase tracking-widest mb-8">Tags & Badges</p>
              <div className="flex flex-wrap gap-3 mb-6">
                {['Web Design', 'Development', 'Brand Experience', 'Booking System', 'Multilingual'].map(tag => (
                  <span key={tag} className="font-data text-xs bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-white/60 uppercase tracking-wider">{tag}</span>
                ))}
                <span className="font-data text-xs bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 text-accent uppercase tracking-wider">Featured</span>
              </div>
              <p className="font-data text-white/30 text-xs pt-6 border-t border-white/10">font-data text-xs bg-white/5 border border-white/10 rounded-full px-4 py-1.5 uppercase tracking-wider</p>
            </div>

            {/* Card */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10">
              <p className="font-data text-accent text-xs uppercase tracking-widest mb-8">Feature Card</p>
              <div className="bg-[#0D0D12] border border-white/10 rounded-[2.5rem] p-10 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <Zap size={20} className="text-accent" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">Card Title</h3>
                <p className="font-heading text-white/50 text-base leading-relaxed">Supporting description that explains the feature or benefit clearly and concisely.</p>
              </div>
              <p className="font-data text-white/30 text-xs mt-6 pt-6 border-t border-white/10">bg-[#0D0D12] border border-white/10 rounded-[2.5rem] p-10</p>
            </div>
          </div>
        </section>

        {/* 8. Iconography */}
        <section className="mb-32">
          <SectionLabel>Iconography</SectionLabel>
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10 mb-8">
            <p className="font-data text-accent text-xs uppercase tracking-widest mb-6">Library: Lucide React</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Action / CTA', color: 'text-accent', size: 24, icons: [<ArrowRight key="a" size={24} />, <ExternalLink key="b" size={24} />, <Check key="c" size={24} />] },
                { label: 'Informational', color: 'text-white/50', size: 24, icons: [<Globe key="a" size={24} />, <Shield key="b" size={24} />, <Activity key="c" size={24} />] },
                { label: 'Decorative / Large', color: 'text-white/20', size: 32, icons: [<Zap key="a" size={32} />, <Terminal key="b" size={32} />, <ChevronDown key="c" size={32} />] },
              ].map(({ label, color, icons }) => (
                <div key={label}>
                  <p className="font-data text-white/30 text-xs uppercase tracking-widest mb-4">{label}</p>
                  <div className={`flex gap-6 ${color}`}>{icons}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-6 border-t border-white/10">
              <p className="font-heading text-white/50 text-sm"><span className="text-accent">Action icons:</span> size=16–24, text-accent — use on CTAs, confirmations, navigation arrows</p>
              <p className="font-heading text-white/50 text-sm"><span className="text-white/70">Informational:</span> size=16–24, text-white/50 — use for feature icons, status, metadata</p>
              <p className="font-heading text-white/50 text-sm"><span className="text-white/40">Decorative:</span> size=28–32, text-white/20 — large background or section-break icons only</p>
            </div>
          </div>
        </section>

        {/* 9. Voice & Copy */}
        <section className="mb-32">
          <SectionLabel>Voice & Copy</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                rule: 'Be direct, not clever.',
                good: '"We build websites and booking systems for service businesses."',
                bad: '"We craft transformative digital experiences that elevate your brand ecosystem."',
              },
              {
                rule: 'Numbers over claims.',
                good: '"Most projects launch in 5 days. 3 languages. 24/7 support."',
                bad: '"Fast delivery. Multilingual. Always available."',
              },
              {
                rule: 'Action-first headlines.',
                good: '"Book. Build. Launch. Grow."',
                bad: '"Our innovative solutions help you achieve your goals."',
              },
              {
                rule: 'Confident, never arrogant.',
                good: '"We stay with you as your business grows."',
                bad: '"We are the #1 agency in Croatia with unmatched expertise."',
              },
            ].map(({ rule, good, bad }) => (
              <div key={rule} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col gap-6">
                <h3 className="font-heading font-bold text-lg">{rule}</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <Check size={16} className="text-accent mt-1 shrink-0" />
                    <p className="font-heading text-white/70 text-sm leading-relaxed italic">{good}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <X size={16} className="text-white/20 mt-1 shrink-0" />
                    <p className="font-heading text-white/30 text-sm leading-relaxed italic line-through">{bad}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="border-t border-white/10 pt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="font-data text-white/20 text-xs uppercase tracking-widest">AorAAgency Brand Identity System — Internal Reference</p>
          <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }} className="inline-flex items-center gap-2 text-white/40 hover:text-accent transition-colors font-data text-xs uppercase tracking-widest">
            <ArrowRight className="rotate-180" size={14} /> Back to Home
          </a>
        </div>
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

  if (currentPath === '/privacy-policy') {
    return <PrivacyPolicyPage />;
  }

  if (currentPath === '/terms') {
    return <TermsOfUsePage />;
  }

  if (currentPath === '/brand') {
    return (
      <>
        <CustomPointer />
        <BrandGuidelines />
      </>
    );
  }

  if (currentPath.startsWith('/work/')) {
    const slug = currentPath.replace('/work/', '');
    return (
      <>
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        <WorkDetailPage slug={slug} onConsultationClick={() => setIsContactOpen(true)} />
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
        <PlatformsAndProjects onConsultationClick={() => setIsContactOpen(true)} />
        <InlineCta variant="3" theme="dark" onConsultationClick={() => setIsContactOpen(true)} />
        <Pricing onConsultationClick={() => setIsContactOpen(true)} />
        <FinalCta onConsultationClick={() => setIsContactOpen(true)} />
      </main>
      <Footer />
    </div>
  );
}
