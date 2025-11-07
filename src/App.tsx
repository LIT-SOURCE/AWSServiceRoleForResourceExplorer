import { FormEvent, useEffect, useState } from "react";
import "./App.css";

const heroSlides = [
  {
    title: "Your AI-Powered Wellness Journey",
    description:
      "Experience concierge telehealth support, curated supplements, and proactive care programs designed for modern lifestyles.",
    cta: "Explore Services",
  },
  {
    title: "Trusted Pharmacy, Delivered Fast",
    description:
      "Refill prescriptions in seconds and tap into on-demand pharmacists backed by HIPAA-compliant virtual consults.",
    cta: "Refill Now",
  },
  {
    title: "Smarter Health Decisions Every Day",
    description:
      "Unlock personalized insights, free lifestyle coaching, and exclusive savings across wellness essentials.",
    cta: "Start Your Plan",
  },
];

const subscriptionPlans = [
  { label: "Monthly", price: "$79", description: "Flexible support with monthly renewals." },
  { label: "3 Months", price: "$219", description: "Sustained progress with seasonal check-ins." },
  { label: "6 Months", price: "$399", description: "Transformative care with guided milestones." },
  { label: "1 Year", price: "$749", description: "Premium access for year-round performance." },
  { label: "Lifetime", price: "$1,999", description: "Legacy membership for lifelong wellness." },
];

const services = [
  {
    name: "Prescription Refill",
    description: "Rapid, secure refills with reminders tailored to your schedule.",
  },
  {
    name: "On-Demand Pharmacists",
    description: "Chat instantly with licensed experts for clarity and confidence.",
  },
  {
    name: "Fast Drop Delivery",
    description: "Track AI-routed deliveries that prioritize cold-chain quality.",
  },
  {
    name: "Lifestyle Coaching",
    description: "Access free coaching for nutrition, recovery, and stress management.",
  },
];

const categories = ["ED Meds", "Supplements", "Wellness", "Personal Care", "Herbal"];

const bestSellerProducts = Array.from({ length: 10 }).map((_, index) => ({
  name: `Core Vitality Pack ${index + 1}`,
  price: `$${(89 + index * 3).toFixed(2)}`,
  rating: (4 + ((index + 1) % 2 ? 0.5 : 0)).toFixed(1),
  type: "Best Seller",
}));

const newProducts = Array.from({ length: 10 }).map((_, index) => ({
  name: `Adaptive Wellness Kit ${index + 1}`,
  price: `$${(99 + index * 4).toFixed(2)}`,
  rating: (4.2 + ((index + 2) % 3) * 0.2).toFixed(1),
  type: "New Arrival",
}));

const testimonials = [
  {
    quote:
      "The AI-guided consult nailed my needs in minutes and the refill reminders keep me on track without thinking about it.",
    name: "Jordan M.",
    role: "Triathlete & Founder",
  },
  {
    quote:
      "Lifestyle coaching plus lifetime access means my family can focus on living well instead of managing logistics.",
    name: "Priya S.",
    role: "Parent & Care Advocate",
  },
];

function App() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleCTA = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    form.reset();
    alert("Thank you! Our health advisors will contact you shortly.");
  };

  return (
    <div className="app-shell">
      <header className="primary-header">
        <div className="header-left">
          <button className="icon-button" aria-label="Log in">
            <span role="img" aria-hidden="true">
              🔐
            </span>
            <span>Login</span>
          </button>
          <button className="icon-button" aria-label="View cart">
            <span role="img" aria-hidden="true">
              🛒
            </span>
            <span>Cart</span>
          </button>
        </div>
        <div className="brand">HAVOK</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <a href="#home" className="nav-link">
            Home
          </a>
          <div className="nav-link dropdown">
            <button className="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
              Products
            </button>
            <div className="dropdown-menu" role="menu">
              <a href="#products" role="menuitem">
                Prescription Solutions
              </a>
              <a href="#products" role="menuitem">
                Wellness Devices
              </a>
              <a href="#products" role="menuitem">
                Fitness Tech
              </a>
              <a href="#products" role="menuitem">
                Preventive Care
              </a>
            </div>
          </div>
          <a href="#blogs" className="nav-link">
            Blogs
          </a>
          <a href="#about" className="nav-link">
            About Us
          </a>
          <a href="#contact" className="nav-link">
            Contact Us
          </a>
        </nav>
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="hero-slides">
            {heroSlides.map((slide, index) => (
              <article
                key={slide.title}
                className={`hero-slide ${index === activeSlide ? "active" : ""}`}
                aria-hidden={index !== activeSlide}
              >
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <a className="cta-button" href="#contact">
                  {slide.cta}
                </a>
              </article>
            ))}
          </div>
          <div className="hero-dots" role="tablist" aria-label="Hero slides">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                className={`dot ${index === activeSlide ? "active" : ""}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show slide ${index + 1}`}
                aria-pressed={index === activeSlide}
              />
            ))}
          </div>
        </section>

        <section className="hipaa-banner">
          <h2>HIPAA-Compliant Telehealth Confidence</h2>
          <p>
            HAVOK Fitness leverages encrypted AI triage, board-certified clinicians, and curated pharmacy partners for compliant
            telehealth support and concierge medicine on demand.
          </p>
          <div className="hipaa-tags">
            <span>Virtual Consults</span>
            <span>Telehealth Support</span>
            <span>Medication Delivery</span>
          </div>
        </section>

        <section className="subscription-section" aria-labelledby="subscription-heading">
          <div className="section-heading">
            <h2 id="subscription-heading">Health Subscriptions</h2>
            <p>Select the cadence that matches your performance goals.</p>
          </div>
          <div className="subscription-grid">
            {subscriptionPlans.map((plan) => (
              <article key={plan.label} className="subscription-card">
                <h3>{plan.label}</h3>
                <p className="price">{plan.price}</p>
                <p>{plan.description}</p>
                <button type="button" className="ghost-button">
                  Choose Plan
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="services-section" aria-labelledby="services-heading">
          <div className="section-heading">
            <h2 id="services-heading">Health Services</h2>
            <p>Smart refills, expert answers, and concierge delivery ready when you are.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article key={service.name} className="service-card">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="category-section" aria-labelledby="category-heading">
          <div className="section-heading">
            <h2 id="category-heading">Shop by Category</h2>
            <p>Curated essentials crafted with AI insights and clinical rigor.</p>
          </div>
          <div className="category-tags">
            {categories.map((category) => (
              <button key={category} type="button" className="category-pill">
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="announcement-bar">
          <span>Save 30% - 60% on Deal of the Day • Exclusive AI-curated bundles drop hourly.</span>
        </section>

        <section id="products" className="product-section" aria-labelledby="product-heading">
          <div className="section-heading">
            <h2 id="product-heading">Top Products</h2>
            <p>Best sellers trusted by our community and new launches to watch.</p>
          </div>
          <div className="product-grid">
            {[...bestSellerProducts, ...newProducts].map((product) => (
              <article key={product.name} className="product-card">
                <div className="product-badge">{product.type}</div>
                <div className="product-image" aria-hidden="true" />
                <h3>{product.name}</h3>
                <p className="rating">⭐ {product.rating}</p>
                <p className="price">{product.price}</p>
                <button type="button" className="primary-button">
                  Buy Now
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="blogs" className="blog-section" aria-labelledby="blog-heading">
          <div className="section-heading">
            <h2 id="blog-heading">Insights &amp; Stories</h2>
            <p>Stay ahead with telehealth trends, recovery tips, and founder spotlights curated by our experts.</p>
          </div>
          <div className="blog-grid">
            {[1, 2, 3].map((blog) => (
              <article key={blog} className="blog-card">
                <h3>Future of AI-Assisted Wellness {blog}</h3>
                <p>
                  Discover how predictive data, empathetic clinicians, and immersive experiences are reshaping proactive health for
                  athletes, executives, and families alike.
                </p>
                <a className="blog-link" href="#">
                  Read Story →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="advisor-bar">
          <span>Get a free health consultation today with a dedicated health advisor.</span>
        </section>

        <section id="contact" className="cta-section" aria-labelledby="cta-heading">
          <div className="cta-card">
            <div className="cta-copy">
              <h2 id="cta-heading">Step Into a Healthier Future</h2>
              <p>
                Share your details and our advisors will align the perfect HAVOK Fitness program for your goals.
              </p>
            </div>
            <form onSubmit={handleCTA} className="cta-form">
              <label>
                Name
                <input name="name" type="text" placeholder="Full name" required />
              </label>
              <label>
                Email
                <input name="email" type="email" placeholder="name@email.com" required />
              </label>
              <label>
                Phone
                <input name="phone" type="tel" placeholder="(555) 555-5555" required />
              </label>
              <label className="consent">
                <input name="smsConsent" type="checkbox" required />
                <span>
                  By checking this box, I consent to receive text messages from <strong>HAVOK FITNESS LLC</strong>, including class
                  reminders, promotional offers, and account updates. Message &amp; Data Rates may apply. Messaging frequency may vary.
                  Reply STOP to unsubscribe or HELP for help. See our <a href="/sms-terms" target="_blank" rel="noreferrer">SMS Terms and Conditions</a> and
                  <a href="/privacy-policy" target="_blank" rel="noreferrer"> Privacy Policy</a>.
                </span>
              </label>
              <button type="submit" className="primary-button">
                Request Consultation
              </button>
            </form>
          </div>
        </section>

        <section id="about" className="about-section" aria-labelledby="about-heading">
          <div className="section-heading">
            <h2 id="about-heading">About HAVOK Fitness</h2>
            <p>We blend telehealth, AI, and human care to deliver elite wellness at scale.</p>
          </div>
          <div className="about-grid">
            <article className="about-card">
              <h3>How We Work</h3>
              <p>
                HAVOK Fitness unites predictive analytics with compassionate clinicians to create dynamic care plans. Every interaction
                is secured, data-informed, and personalized for measurable impact.
              </p>
            </article>
            <article className="about-card">
              <h3>What Sets Us Apart</h3>
              <ul>
                <li>AI companions available 24/7 for instant triage guidance.</li>
                <li>Board-certified experts that know your goals and history.</li>
                <li>Biofeedback and wearable integrations that evolve programs in real time.</li>
                <li>Exclusive community access with wellness events and curated labs.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="metrics-section" aria-labelledby="metrics-heading">
          <div className="metrics-card">
            <div className="metric">
              <span className="metric-value">58K+</span>
              <span className="metric-label">Clients Empowered</span>
            </div>
            <div className="metric">
              <span className="metric-value">4.9/5</span>
              <span className="metric-label">Average Review Score</span>
            </div>
            <div className="metric">
              <span className="metric-value">120</span>
              <span className="metric-label">Clinical &amp; Coaching Experts</span>
            </div>
          </div>
          <div className="testimonial-wrapper">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="testimonial">
                <blockquote>“{testimonial.quote}”</blockquote>
                <figcaption>
                  {testimonial.name} · <span>{testimonial.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer" aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">
          HAVOK Fitness footer navigation
        </h2>
        <div className="footer-grid">
          <div className="footer-column">
            <h3>About Us</h3>
            <ul>
              <li>
                <a href="#about">Our Story</a>
              </li>
              <li>
                <a href="#">Mission &amp; Vision</a>
              </li>
              <li>
                <a href="#">HIPAA Compliance</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Our Products</h3>
            <ul>
              <li>
                <a href="#products">Health Subscriptions</a>
              </li>
              <li>
                <a href="#products">AI Diagnostics</a>
              </li>
              <li>
                <a href="#products">Supplements</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Health Services</h3>
            <ul>
              <li>
                <a href="#services-heading">Telehealth Support</a>
              </li>
              <li>
                <a href="#services-heading">Prescription Refill</a>
              </li>
              <li>
                <a href="#services-heading">On-Demand Pharmacists</a>
              </li>
              <li>
                <a href="#services-heading">Pharmacists / Our Team</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Support</h3>
            <ul>
              <li>
                <a href="#contact">Customer Support</a>
              </li>
              <li>
                <a href="#contact">Contact Us</a>
               </li>
              <li>
                <a href="#">Return &amp; Refund Policy</a>
              </li>
              <li>
                <a href="#">Shipping Information</a>
              </li>
              <li>
                <a href="#">FAQs</a>
              </li>
              <li>
                <a href="#">Store Locator</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Resources</h3>
            <ul>
              <li>
                <a href="#blogs">Health Articles / Blog</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms &amp; Conditions</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Follow Us</h3>
            <ul className="social-links">
              <li>
                <a href="#" aria-label="Follow on Instagram">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" aria-label="Follow on LinkedIn">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" aria-label="Follow on YouTube">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="footer-note">© {new Date().getFullYear()} HAVOK Fitness LLC · All rights reserved · HIPAA law compliant.</p>
      </footer>
    </div>
  );
}

export default App;
