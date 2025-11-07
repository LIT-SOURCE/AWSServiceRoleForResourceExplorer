import { FormEvent, useEffect, useMemo, useState } from "react";
import "./App.css";

const heroSlides = [
  {
    title: "Care crafted for every body",
    subtitle: "Telehealth • Pharmacy • Wellness",
    description:
      "Seamlessly consult, compound, and check out with our AI-guided pharmacy experience inspired by the polish of apple.com.",
    badge: "Now supporting 24/7 video visits",
  },
  {
    title: "Smart refills on your schedule",
    subtitle: "Subscriptions that adapt",
    description:
      "From daily ED therapies to family wellness staples, our automations keep dosages on track and doorstep-ready.",
    badge: "HIPAA compliant + pharmacist verified",
  },
  {
    title: "Whole-health plans made simple",
    subtitle: "From supplements to lifestyle coaching",
    description:
      "Bundle the essentials, discover botanicals, and connect with coaches for a life you feel confident living.",
    badge: "Exclusive launch pricing for members",
  },
];

const productSubcategories = [
  "ED Meds",
  "Supplements",
  "Wellness",
  "Personal Care",
  "Herbal",
];

const subscriptionPlans = [
  { label: "Monthly", price: "$39", highlight: "Flexible starts" },
  { label: "3 Month", price: "$105", highlight: "Save 10%" },
  { label: "6 Month", price: "$198", highlight: "Includes pharmacist consult" },
  { label: "1 Year", price: "$372", highlight: "Two bonus wellness labs" },
  { label: "Lifetime", price: "$1,499", highlight: "AI concierge + family sharing" },
];

const healthServices = [
  { title: "Refill", detail: "Set-and-forget deliveries with adaptive reminders." },
  {
    title: "On-Demand Pharmacists",
    detail: "Board-certified experts available instantly for secure telehealth.",
  },
  { title: "Fast Drop", detail: "Temperature-safe courier drop-offs in under two hours." },
  { title: "Free Lifestyle Coaching", detail: "Human coaches + AI insights to keep goals on track." },
];

const healthCategories = [
  { title: "ED Meds", copy: "Clinically guided therapies with discreet packaging." },
  { title: "Supplements", copy: "Evidence-backed blends for energy, immunity, and sleep." },
  { title: "Wellness", copy: "Daily rituals, trackers, and guided programs." },
  { title: "Personal Care", copy: "Derm-grade care with gentle botanicals." },
  { title: "Herbal", copy: "Traditional remedies elevated with modern science." },
];

const blogPosts = [
  {
    title: "Build a smarter supplement stack",
    excerpt: "Pair AI-guided dosing with pharmacist reviews for the ultimate daily routine.",
    date: "April 24, 2024",
  },
  {
    title: "Telehealth etiquette 101",
    excerpt: "Five ways to make your video consults seamless, from prep to follow-up.",
    date: "April 15, 2024",
  },
  {
    title: "Inside our compounding lab",
    excerpt: "See how we merge botanicals and pharmaceuticals for precise results.",
    date: "April 2, 2024",
  },
];

const productShowcase = [
  {
    name: "NovaRise Daily Vital Pack",
    price: "$54",
    rating: 4.8,
    status: "Best Seller",
  },
  { name: "CalmPulse Sleep Gels", price: "$42", rating: 4.6, status: "Best Seller" },
  { name: "CardioFlow Omega Trio", price: "$36", rating: 4.7, status: "Best Seller" },
  { name: "HerbalEase Joint Relief", price: "$48", rating: 4.5, status: "Best Seller" },
  { name: "PeakFocus Nootropic", price: "$62", rating: 4.9, status: "Best Seller" },
  { name: "ReVive Hydration Pods", price: "$29", rating: 4.4, status: "Best Seller" },
  { name: "ImmuniShield Duo", price: "$58", rating: 4.8, status: "Best Seller" },
  { name: "GlowGuard Skin Serum", price: "$64", rating: 4.6, status: "Best Seller" },
  { name: "CoreBalance Probiotic", price: "$34", rating: 4.5, status: "Best Seller" },
  { name: "FlexiMove Support Bands", price: "$39", rating: 4.3, status: "Best Seller" },
  { name: "ZenWave Mind Tonics", price: "$31", rating: 4.7, status: "New" },
  { name: "PulseGuard Heart Kit", price: "$76", rating: 4.9, status: "New" },
  { name: "FreshStart Detox Tea", price: "$22", rating: 4.4, status: "New" },
  { name: "BrightSight Vision Pack", price: "$55", rating: 4.6, status: "New" },
  { name: "SereniTeen Hormone Balance", price: "$47", rating: 4.5, status: "New" },
  { name: "LumaLift Collagen Sticks", price: "$33", rating: 4.8, status: "New" },
  { name: "Motiv+ Fitness Fuel", price: "$41", rating: 4.6, status: "New" },
  { name: "BreatheWell Allergy Care", price: "$27", rating: 4.7, status: "New" },
  { name: "ImmuWave Kids Gummies", price: "$19", rating: 4.4, status: "New" },
  { name: "SerumFlow Recovery Cream", price: "$46", rating: 4.5, status: "New" },
];

const communityHighlights = [
  { label: "Customers supported", metric: "48,320" },
  { label: "Verified 5★ reviews", metric: "6,204" },
];

function formatRating(rating: number) {
  return rating.toFixed(1).replace(".0", "");
}

function chunkProducts<T>(items: T[], rows: number) {
  const buckets = Array.from({ length: rows }, () => [] as T[]);
  items.forEach((item, index) => {
    buckets[index % rows].push(item);
  });
  return buckets;
}

export default function App() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const productRows = useMemo(() => chunkProducts(productShowcase, 3), []);

  const handleHeroSelect = (index: number) => {
    setActiveSlide(index);
  };

  const handleCtaSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="site-shell">
      <header className="global-nav" aria-label="Primary">
        <div className="nav-left">
          <button className="nav-login" type="button">
            Login
          </button>
          <button className="nav-cart" type="button" aria-label="Shopping cart">
            <span aria-hidden="true">🛒</span>
          </button>
        </div>
        <div className="nav-center" aria-label="Havok Fitness home">
          Havok Fitness Pharmacy
        </div>
        <nav className="nav-right" aria-label="Primary menu">
          <a href="#home">Home</a>
          <div className="nav-dropdown">
            <button type="button" aria-haspopup="true">
              Product
            </button>
            <div className="dropdown-panel" role="menu">
              {productSubcategories.map((item) => (
                <a key={item} href={`#category-${item.toLowerCase().replace(/\s+/g, "-")}`}>
                  {item}
                </a>
              ))}
            </div>
          </div>
          <a href="#blogs">Blogs</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact Us</a>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-visual">
            {heroSlides.map((slide, index) => (
              <article
                key={slide.title}
                className={`hero-slide ${index === activeSlide ? "is-active" : ""}`}
              >
                <div className="slide-badge">{slide.badge}</div>
                <h1>{slide.title}</h1>
                <p className="slide-subtitle">{slide.subtitle}</p>
                <p className="slide-body">{slide.description}</p>
                <div className="slide-actions">
                  <a className="primary-link" href="#products">
                    Shop curated care
                  </a>
                  <a className="ghost-link" href="#telehealth">
                    Explore telehealth support
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div className="hero-controls" role="tablist" aria-label="Featured slides">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                role="tab"
                aria-selected={activeSlide === index}
                className={activeSlide === index ? "is-active" : ""}
                onClick={() => handleHeroSelect(index)}
              >
                <span>{`0${index + 1}`}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="telehealth" className="hipaa-banner">
          <div className="hipaa-card">
            <h2>HIPAA compliant telehealth, compounded with care</h2>
            <p>
              Secure consults, pharmacist check-ins, and medicine management backed by encrypted
              AI workflows. Havok Fitness Pharmacy keeps every prescription aligned with HIPAA,
              so your telehealth, counseling, and medication purchases stay private.
            </p>
            <ul>
              <li>24/7 telehealth support and follow-up messaging</li>
              <li>Instant prescription buy flow with clinical oversight</li>
              <li>Seamless insurance coordination and refill reminders</li>
            </ul>
          </div>
        </section>

        <section id="subscriptions" className="subscription-section">
          <header>
            <h2>Health subscriptions that flex with your goals</h2>
            <p>Choose a cadence that meets your pace and update anytime.</p>
          </header>
          <div className="subscription-grid">
            {subscriptionPlans.map((plan) => (
              <article key={plan.label} className="subscription-card">
                <h3>{plan.label}</h3>
                <p className="plan-price">{plan.price}</p>
                <p className="plan-note">{plan.highlight}</p>
                <button type="button">Activate plan</button>
              </article>
            ))}
          </div>
        </section>

        <section className="services-section">
          <header>
            <h2>Health services, redesigned</h2>
            <p>Care choices curated by humans, supercharged by AI.</p>
          </header>
          <div className="service-grid">
            {healthServices.map((service) => (
              <article key={service.title} className="service-card">
                <h3>{service.title}</h3>
                <p>{service.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="products" className="category-section">
          <div className="category-header">
            <h2>Shop by category</h2>
            <p>Discover hand-picked collections built for next-level performance.</p>
          </div>
          <div className="category-grid">
            {healthCategories.map((category) => (
              <article
                key={category.title}
                id={`category-${category.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="category-card"
              >
                <h3>{category.title}</h3>
                <p>{category.copy}</p>
                <a href="#products">Browse {category.title}</a>
              </article>
            ))}
            <article className="category-card ad-card">
              <h3>Member-only bundles</h3>
              <p>
                Stack therapies, supplements, and coaching into one basket and unlock tiered
                savings designed for every lifestyle.
              </p>
              <a href="#subscriptions">View offers</a>
            </article>
          </div>
        </section>

        <div className="running-marquee" aria-live="polite">
          <span>30% to 60% off — Deal of the day on select wellness + prescription bundles</span>
          <span>30% to 60% off — Deal of the day on select wellness + prescription bundles</span>
          <span>30% to 60% off — Deal of the day on select wellness + prescription bundles</span>
        </div>

        <section className="product-section">
          <header>
            <h2>Best sellers &amp; new finds</h2>
            <p>Three flowing rows of curated products ready to ship now.</p>
          </header>
          <div className="product-board" role="list">
            {productRows.map((row, rowIndex) => (
              <div className="product-row" key={rowIndex} role="group">
                {row.map((product) => (
                  <article key={product.name} className="product-card" role="listitem">
                    <span className="product-badge">{product.status}</span>
                    <h3>{product.name}</h3>
                    <p className="product-price">{product.price}</p>
                    <div className="product-rating" aria-label={`Rated ${formatRating(product.rating)} out of 5`}>
                      <span aria-hidden="true">★★★★★</span>
                      <span>{formatRating(product.rating)}</span>
                    </div>
                    <button type="button">Buy now</button>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </section>

        <div className="running-marquee secondary" aria-live="polite">
          <span>Get a free health consultation today with a Havok Fitness advisor</span>
          <span>Get a free health consultation today with a Havok Fitness advisor</span>
          <span>Get a free health consultation today with a Havok Fitness advisor</span>
        </div>

        <section id="blogs" className="blog-section">
          <header>
            <h2>Insights from the Havok Fitness blog</h2>
            <p>Fresh guidance from our pharmacists, trainers, and care team.</p>
          </header>
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <article key={post.title} className="blog-card">
                <p className="blog-date">{post.date}</p>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <a href="#blogs">Read article</a>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section" id="contact">
          <div className="cta-card">
            <h2>Talk with our health advisors</h2>
            <p>
              Share your goals and we will match you with a pharmacist-led wellness plan tailored
              to your routine.
            </p>
            <form className="cta-form" onSubmit={handleCtaSubmit}>
              <label>
                Name
                <input type="text" name="name" placeholder="Your full name" required />
              </label>
              <label>
                Email
                <input type="email" name="email" placeholder="you@example.com" required />
              </label>
              <label>
                Phone
                <input type="tel" name="phone" placeholder="(555) 123-4567" required />
              </label>
              <label className="consent">
                <input
                  type="checkbox"
                  required
                  checked={consentChecked}
                  onChange={(event) => setConsentChecked(event.target.checked)}
                />
                <span>
                  By checking this box, I consent to receive text messages from <strong>HAVOK FITNESS LLC</strong>,
                  including class reminders, promotional offers, and account updates. Message &amp; Data Rates may
                  apply. Messaging frequency may vary. Reply STOP to unsubscribe or HELP for help. See our
                  <a href="/sms-terms" target="_blank" rel="noreferrer"> SMS Terms and Conditions</a> and
                  <a href="/privacy-policy" target="_blank" rel="noreferrer"> Privacy Policy</a>.
                </span>
              </label>
              <button type="submit" disabled={!consentChecked}>
                Request consultation
              </button>
            </form>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="about-card">
            <h2>About Havok Fitness Pharmacy</h2>
            <p>
              We pair trusted pharmacists, telehealth physicians, and AI-driven insights to keep every
              member powered up. Our teams coordinate compounding, coaching, and compliance in a single
              flow so you can focus on living fully.
            </p>
            <div className="about-grid">
              <div>
                <h3>How we work</h3>
                <ul>
                  <li>AI-assisted intake to personalize recommendations instantly</li>
                  <li>Dedicated pharmacist concierge for every subscription tier</li>
                  <li>Seamless integrations with wearables for adaptive care plans</li>
                </ul>
              </div>
              <div>
                <h3>Why customers choose us</h3>
                <ul>
                  <li>Apple-inspired design that keeps experiences effortless</li>
                  <li>Encrypted HIPAA-compliant infrastructure across every touchpoint</li>
                  <li>Exclusive bundles with lifestyle coaching included</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="community-section">
          <div className="community-card">
            <h2>Community impact</h2>
            <div className="community-grid">
              {communityHighlights.map((highlight) => (
                <article key={highlight.label}>
                  <span>{highlight.metric}</span>
                  <p>{highlight.label}</p>
                </article>
              ))}
            </div>
            <p className="community-note">
              Real members. Real results. Stories and reviews flow in daily as we reimagine how fitness
              and pharmacy unite.
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Havok Fitness Pharmacy &mdash; HIPAA compliant telehealth and fulfillment.</p>
      </footer>
    </div>
  );
}
