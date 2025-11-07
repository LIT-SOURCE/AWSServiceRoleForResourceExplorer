import { useEffect, useState, type MouseEvent } from "react";
import "./App.css";

const MOBILE_BREAKPOINT = 768;

const previewMetrics = [
  {
    metric: "42",
    label: "Private Coaches Streaming",
  },
  {
    metric: "18",
    label: "Telehealth Disciplines",
  },
  {
    metric: "24/7",
    label: "Concierge Response",
  },
];

const programSuites = [
  {
    title: "Precision Strength Collective",
    summary:
      "Encrypted load progression and movement intelligence shaped for your biometric profile.",
    label: "Strength",
    accent: "#617bff",
  },
  {
    title: "Metabolic Reset Vault",
    summary:
      "Hormone and lab integrations that unlock metabolic balance through medical direction.",
    label: "Metabolic",
    accent: "#5fcf83",
  },
  {
    title: "Wellness Concierge Privive",
    summary:
      "Human-led recovery, supplementation, and mobility flows orchestrated for private members.",
    label: "Lifestyle",
    accent: "#f38d5f",
  },
];

const experienceTiles = [
  {
    title: "Unified Telehealth Preview",
    description:
      "Consult with board-certified clinicians and Havok performance leads inside an encrypted session hub.",
  },
  {
    title: "Dynamic Training Engine",
    description:
      "See how adaptive programming recalibrates in real time as your wearable data and labs stream in.",
  },
  {
    title: "Concierge Logistics",
    description:
      "From supplement stacks to recovery equipment, track every shipment and adjustment in one private lane.",
  },
];

const timelineSteps = [
  {
    title: "Activate Preview",
    detail: "Confirm credentials, lock two-factor, and step into the Privive staging lobby.",
  },
  {
    title: "Sync Ecosystem",
    detail: "Pair labs, wearables, and previous training logs so the team can calibrate your path.",
  },
  {
    title: "Coached Immersion",
    detail: "Experience a two-week private sprint with clinicians and coaches guiding every adjustment.",
  },
];

const complianceHighlights = [
  "HIPAA, SOC2, and HITRUST-aligned operational controls",
  "Zero-trust environment with biometric lock-ins and AES-256 encryption",
  "Independent audits, PHI retention policies, and live breach monitoring",
];

function calculateLuminanceFromHex(hex: string): number | null {
  const value = hex.replace("#", "");
  const pairs = value.match(/.{1,2}/g);
  if (!pairs || pairs.length < 3) {
    return null;
  }
  const [r, g, b] = pairs.map((segment) => {
    const normalized = segment.length === 1 ? segment + segment : segment;
    return parseInt(normalized, 16);
  });

  const srgb = (channel: number) => {
    const v = channel / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false,
  );

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobileViewport(isMobile);

      if (!isMobile) {
        setIsMenuOpen(false);
        setIsProductsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      setIsProductsOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const averageColor = styles.getPropertyValue("--banner-avg").trim() || "#7ed9d3";
    const luminance = calculateLuminanceFromHex(averageColor);

    if (luminance === null) {
      return;
    }

    if (luminance > 0.6) {
      root.style.setProperty("--on-banner", "#0a1726");
      root.style.setProperty("--on-banner-muted", "rgba(10,23,38,.75)");
      root.style.setProperty("--btn-outline-fg", "#0a1726");
      root.style.setProperty("--btn-outline-bd", "rgba(10,23,38,.35)");
    } else {
      root.style.setProperty("--on-banner", "#ffffff");
      root.style.setProperty("--on-banner-muted", "#f0f7ff");
      root.style.setProperty("--btn-outline-fg", "#ffffff");
      root.style.setProperty("--btn-outline-bd", "rgba(255,255,255,.85)");
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((previous) => !previous);
  };

  const handleProductsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      event.preventDefault();
      setIsProductsOpen((previous) => !previous);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProductsOpen(false);
  };

  return (
    <div className={`app-shell${isMenuOpen ? " menu-open" : ""}`}>
      <header className={`main-header${isMenuOpen ? " menu-open" : ""}`}>
        <div className="header-content">
          <a href="#" className="logo-link" onClick={closeMenu}>
            <img src="path/to/transparent_hf_glowing_logo.png" alt="HF Logo" className="hf-logo" />
          </a>

          <nav className="main-nav" aria-hidden={isMobileViewport && !isMenuOpen}>
            <ul className="nav-links">
              <li>
                <a href="#" onClick={closeMenu}>
                  Home
                </a>
              </li>
              <li className={`dropdown${isProductsOpen ? " submenu-expanded" : ""}`}>
                <a href="#" onClick={handleProductsClick}>
                  Products <span className="arrow">▼</span>
                </a>
                <ul className="submenu">
                  <li>
                    <a href="#" onClick={closeMenu}>
                      Subcategory 1
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={closeMenu}>
                      Subcategory 2
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={closeMenu}>
                      Subcategory 3
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="#" onClick={closeMenu}>
                  Blogs
                </a>
              </li>
              <li>
                <a href="#" onClick={closeMenu}>
                  About Us
                </a>
              </li>
              <li>
                <a href="#" onClick={closeMenu}>
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          <div className="utility-icons">
            <a href="#" className="icon-link login-icon" title="Login" aria-label="Login">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </a>
            <a href="#" className="icon-link cart-icon" title="Cart" aria-label="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 12.08a2 2 0 0 0 2 1.92h9.23a2 2 0 0 0 2-1.92L23 6H6"></path>
              </svg>
            </a>
          </div>

          <button
            className={`menu-toggle${isMenuOpen ? " is-active" : ""}`}
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
            type="button"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </header>

      <nav className="offer-bar" aria-label="Special offer">
        <p className="offer-text">
          Get 40% on over $600 purchase from now
          <a href="#" className="offer-link">
            Shop Now
          </a>
        </p>
      </nav>

      <main>
        <section className="banner" aria-label="Havok Fitness Privive preview">
          <div className="content">
            <div className="hero-preamble">
              <div className="verified" role="status" aria-live="polite">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                HIPAA Verified
              </div>
              <span className="preview-pill" aria-label="Privive preview status">
                Privive Preview
              </span>
            </div>

            <h1>Experience Havok Fitness all together</h1>
            <p className="subtitle">
              Tour the private telehealth, performance, and concierge network that powers Havok Fitness Privive.
              Every insight, every coach, every protocol—previewed in one secure experience.
            </p>

            <div className="cta" aria-label="Primary actions">
              <button className="btn primary" type="button">
                Launch Preview Tour
              </button>
              <button className="btn secondary" type="button">
                Download Program Brief
              </button>
            </div>
          </div>
        </section>

        <section className="preview-intro" aria-labelledby="preview-overview-heading">
          <div className="preview-intro__content">
            <h2 id="preview-overview-heading">One pane to explore the entire Privive stack</h2>
            <p>
              Walk through the dashboard our private members use to coordinate labs, training, and concierge logistics.
              The preview compiles coaching rooms, compliance updates, and delivery tracking into a single encrypted
              view so you can assess the Havok Fitness ecosystem end-to-end.
            </p>

            <dl className="preview-intro__metrics">
              {previewMetrics.map((highlight) => (
                <div key={highlight.metric} className="preview-intro__metric">
                  <dt>{highlight.metric}</dt>
                  <dd>{highlight.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="preview-intro__device" aria-hidden="true">
            <div className="device-shell">
              <div className="device-screen">
                <div className="screen-header">
                  <span className="screen-indicator">Privive Overview</span>
                  <span className="screen-signal" aria-hidden="true"></span>
                </div>
                <div className="screen-body">
                  <div className="screen-chart">
                    <div className="chart-line"></div>
                    <div className="chart-line chart-line--secondary"></div>
                  </div>
                  <div className="screen-cards">
                    <div className="screen-card screen-card--active">
                      <span>Today</span>
                      <strong>Performance Consult</strong>
                      <p>12 min lab review • Mobility warm-up • Recovery breathwork</p>
                    </div>
                    <div className="screen-card">
                      <span>Tomorrow</span>
                      <strong>Strength + Telehealth</strong>
                      <p>Coach stacked superset • Clinician follow-up • Supplement tune</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="preview-experience" aria-labelledby="experience-heading">
          <header className="preview-experience__header">
            <h2 id="experience-heading">Preview everything working together</h2>
            <p>
              Each tile mirrors a live module inside the private environment. Jump between clinicians, performance
              coaches, and concierge flows without leaving the encrypted workspace.
            </p>
          </header>

          <div className="preview-experience__grid">
            {experienceTiles.map((tile) => (
              <article key={tile.title} className="experience-card">
                <h3>{tile.title}</h3>
                <p>{tile.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="program-preview" aria-labelledby="program-preview-heading">
          <header className="program-preview__header">
            <h2 id="program-preview-heading">Program suites inside the preview</h2>
            <p>
              Explore confidential slices of our flagship Havok Fitness protocols. These previews combine physician
              oversight, adaptive training, and concierge logistics for a unified experience.
            </p>
          </header>

          <div className="program-preview__grid">
            {programSuites.map((program) => (
              <article className="program-card" key={program.title}>
                <span className="program-card__label" style={{ backgroundColor: program.accent }}>
                  {program.label}
                </span>
                <h3>{program.title}</h3>
                <p>{program.summary}</p>
                <button className="ghost-button" type="button">
                  View Preview Module
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="preview-timeline" aria-labelledby="timeline-heading">
          <div className="preview-timeline__content">
            <h2 id="timeline-heading">Three steps to experience the preview</h2>
            <ol className="timeline-list">
              {timelineSteps.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="preview-compliance" aria-labelledby="compliance-heading">
          <div className="preview-compliance__content">
            <h2 id="compliance-heading">Security woven through every preview session</h2>
            <p>
              Havok Fitness Privive layers regulatory, technical, and operational controls so you can evaluate the
              platform with confidence before onboarding members.
            </p>
            <ul>
              {complianceHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="preview-callout" aria-labelledby="callout-heading">
          <div className="preview-callout__content">
            <h2 id="callout-heading">Ready to join the combined preview?</h2>
            <p>
              Secure a guided walk-through that blends clinical and performance modules, tour concierge automations,
              and collect the launch checklist your team needs to activate membership.
            </p>
          </div>
          <div className="preview-callout__actions">
            <button className="btn primary" type="button">
              Book Preview Walk-through
            </button>
            <button className="btn secondary" type="button">
              Email Me the Checklist
            </button>
          </div>
        </section>

        <footer className="preview-footer">
          <div className="preview-footer__brand">
            <span className="preview-footer__logo" aria-hidden="true">
              HF
            </span>
            <div>
              <p className="preview-footer__title">Havok Fitness Privive</p>
              <p className="preview-footer__note">Private Telehealth, Strength, and Concierge Preview</p>
            </div>
          </div>
          <nav className="preview-footer__nav" aria-label="Private footer">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Accessibility</a>
            <a href="#">Contact</a>
          </nav>
        </footer>
      </main>
    </div>
  );
}

export default App;
