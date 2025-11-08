import "./App.css";

const categories = [
  {
    name: "Prescription Refills",
    description:
      "Fast, licensed delivery from US pharmacies with automatic renewal reminders.",
  },
  {
    name: "Wellness & Vitamins",
    description:
      "Evidence-backed supplements curated by board-certified clinicians to boost everyday health.",
  },
  {
    name: "Chronic Care",
    description:
      "Personalized plans for diabetes, heart health, respiratory care, and more long-term conditions.",
  },
  {
    name: "Urgent Relief",
    description:
      "Over-the-counter essentials and same-day courier options for those can’t-wait moments.",
  },
];

const careHighlights = [
  {
    title: "Free Clinical Guidance",
    copy: "Chat with an EdMeds nurse practitioner any day of the week. No copays, no hidden fees.",
  },
  {
    title: "US-Licensed Pharmacists",
    copy: "Every order is double-checked by pharmacists licensed in all 50 states for safety and accuracy.",
  },
  {
    title: "Holistic Wellness Plans",
    copy: "Integrate prescriptions, lifestyle coaching, lab reminders, and follow-ups in one dashboard.",
  },
];

const services = [
  "24/7 secure chat with clinicians",
  "Insurance and FSA/HSA friendly",
  "Transparent pricing with savings finder",
  "Same-day delivery in 40+ US metro areas",
  "HIPAA-compliant medical records storage",
  "Seamless refill scheduling across devices",
];

const testimonials = [
  {
    name: "Jordan M.",
    role: "Busy Parent",
    quote:
      "The refill reminders and quick consult saved me hours every month. I feel supported and in control.",
  },
  {
    name: "Avery R.",
    role: "Small Business Owner",
    quote:
      "Pricing is transparent and the clinicians are kind. EdMeds is my go-to for both medication and wellness.",
  },
  {
    name: "Sasha K.",
    role: "Triathlete",
    quote:
      "I love how the team blends supplements, labs, and prescriptions. It's a holistic view of my health.",
  },
];

function App() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="app">
      <header className="hero" id="top">
        <nav className="nav">
          <a className="brand" href="#top">
            <span className="brand-mark" aria-hidden="true">
              ed
            </span>
            <span className="brand-text">edmeds.shop</span>
          </a>
          <ul className="nav-links">
            <li>
              <a href="#catalog">Shop</a>
            </li>
            <li>
              <a href="#consult">Consultancy</a>
            </li>
            <li>
              <a href="#why-edmeds">Why EdMeds</a>
            </li>
            <li>
              <a href="#testimonials">Stories</a>
            </li>
          </ul>
          <a className="cta" href="#download">
            Download App
          </a>
        </nav>
        <div className="hero-content">
          <div>
            <p className="tag">US-based • Board-certified • Available 24/7</p>
            <h1>
              Your ISO-grade medical shop, wellness concierge, and care coach—all in one app.
            </h1>
            <p className="lead">
              EdMeds.shop pairs licensed US pharmacies with free virtual consults. Order prescriptions,
              discover vitamins, and follow a personalized care plan crafted for your lifestyle.
            </p>
            <div className="hero-actions">
              <a className="btn primary" href="#catalog">
                Explore catalog
              </a>
              <a className="btn secondary" href="#consult">
                Start free consult
              </a>
            </div>
            <a className="preview-link" href="#preview">
              Preview here
            </a>
            <div className="hero-glance">
              <div>
                <strong>4.9/5</strong>
                <span>Patient satisfaction</span>
              </div>
              <div>
                <strong>50k+</strong>
                <span>Orders delivered</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>HIPAA compliant</span>
              </div>
            </div>
          </div>
          <div className="hero-card" id="preview" aria-label="Mobile preview of EdMeds app">
            <span className="preview-label">App preview</span>
            <div className="device">
              <div className="device-status">Refill arrives tomorrow</div>
              <div className="device-body">
                <h2>Your wellness plan</h2>
                <ul>
                  <li>
                    <span>Rx refill</span>
                    <strong>Atorvastatin 20mg</strong>
                    <small>Shipped • Tracking #ED2045</small>
                  </li>
                  <li>
                    <span>Consult</span>
                    <strong>Sleep reset program</strong>
                    <small>Video follow-up • Friday 3 PM ET</small>
                  </li>
                  <li>
                    <span>Supplement</span>
                    <strong>Omega-3 triple strength</strong>
                    <small>Personalized dose • Free nutrition consult</small>
                  </li>
                </ul>
              </div>
            </div>
            <p className="card-caption">
              Designed in Figma. Visual assets prepared in Canva. Built for responsive iOS, Android, and web.
            </p>
          </div>
        </div>
      </header>

      <main>
        <section className="section catalog" id="catalog">
          <div className="section-heading">
            <h2>Shop by health goal</h2>
            <p>
              Every product is sourced from trusted US suppliers and tracked with ISO-certified logistics for
              temperature-sensitive care.
            </p>
          </div>
          <div className="grid four">
            {categories.map((category) => (
              <article key={category.name} className="card">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <a className="link" href="#consult">
                  Browse {category.name.toLowerCase()}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section consult" id="consult">
          <div className="section-heading">
            <h2>Free health consultancy that feels human</h2>
            <p>
              Book a session with our licensed clinicians in seconds. We combine predictive insights with
              compassionate coaching to keep you on track.
            </p>
          </div>
          <div className="consult-layout">
            <div className="consult-panel">
              <h3>How it works</h3>
              <ol>
                <li>Answer a guided intake built with clinical best practices.</li>
                <li>Match with a nurse practitioner in your state—no subscription required.</li>
                <li>
                  Receive a care plan, prescriptions, and lifestyle tips directly in the app with instant
                  follow-up.
                </li>
              </ol>
              <a className="btn primary" href="#download">
                Reserve a free 15-min consult
              </a>
            </div>
            <div className="consult-benefits">
              {careHighlights.map((highlight) => (
                <article key={highlight.title}>
                  <h4>{highlight.title}</h4>
                  <p>{highlight.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section why" id="why-edmeds">
          <div className="section-heading">
            <h2>Everything you expect from a modern pharmacy—plus more</h2>
            <p>
              EdMeds.shop is built for speed, transparency, and peace of mind. Here is what our members rely on
              every day.
            </p>
          </div>
          <div className="grid three">
            {services.map((service) => (
              <div key={service} className="pill">
                {service}
              </div>
            ))}
          </div>
        </section>

        <section className="section testimonials" id="testimonials">
          <div className="section-heading">
            <h2>Trusted by families, athletes, and professionals nationwide</h2>
            <p>
              Join tens of thousands of EdMeds members who experience high-touch care and lightning-fast
              delivery.
            </p>
          </div>
          <div className="grid three">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name}>
                <blockquote>“{testimonial.quote}”</blockquote>
                <figcaption>
                  {testimonial.name} • <span>{testimonial.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="section download" id="download">
          <div className="download-card">
            <h2>Ready to feel better?</h2>
            <p>
              Download the EdMeds.shop app for iOS or Android, or access the responsive web dashboard from any
              device. Manage prescriptions, consult clinicians, and track wellness goals in one secure place.
            </p>
            <div className="stores">
              <a className="btn store" href="#">
                App Store
              </a>
              <a className="btn store" href="#">
                Google Play
              </a>
              <a className="btn tertiary" href="#catalog">
                Continue on web
              </a>
            </div>
          </div>
          <form className="newsletter" aria-label="Join the EdMeds newsletter">
            <h3>Stay in the loop</h3>
            <p>Weekly wellness tips, exclusive savings, and product drops—no spam, we promise.</p>
            <label className="input">
              <span className="input-label">Email</span>
              <input type="email" name="email" placeholder="you@email.com" required />
            </label>
            <button className="btn primary" type="submit">
              Subscribe
            </button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>edmeds.shop</strong>
          <p>ISO-compliant, US-based pharmacy and health consultancy.</p>
        </div>
        <div className="footer-links">
          <a href="#catalog">Shop</a>
          <a href="#consult">Consultancy</a>
          <a href="#why-edmeds">Security</a>
          <a href="#download">Download</a>
          <a href="#top">Back to top</a>
        </div>
        <p className="footer-copy">© {currentYear} EdMeds Health Group. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
