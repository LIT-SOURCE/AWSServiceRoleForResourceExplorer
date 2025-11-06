import "./App.css";

const productList = [
  {
    name: "Wellness Essentials Kit",
    description:
      "Daily vitamins and probiotics curated by pharmacists to bolster immunity and all-day energy.",
    price: "$64",
    badge: "Bestseller",
    accent: "linear-gradient(135deg, rgba(140,239,191,0.8), rgba(151,201,255,0.9))",
  },
  {
    name: "Sleep Harmony Bundle",
    description:
      "Restful sleep support featuring melatonin, chamomile, and aromatherapy essentials.",
    price: "$52",
    badge: "New",
    accent: "linear-gradient(135deg, rgba(137,207,240,0.8), rgba(188,240,209,0.9))",
  },
  {
    name: "Heart Health Program",
    description:
      "30-day supplement plan with pharmacist check-ins and lifestyle tracking tools.",
    price: "$89",
    badge: "Member Favorite",
    accent: "linear-gradient(135deg, rgba(189,243,203,0.85), rgba(132,210,235,0.9))",
  },
  {
    name: "Family First Aid Suite",
    description:
      "Smart first aid caddy with refill reminders and pediatric-safe options included.",
    price: "$74",
    badge: "Limited",
    accent: "linear-gradient(135deg, rgba(167,220,231,0.85), rgba(206,249,225,0.9))",
  },
  {
    name: "Active Lifestyle Stack",
    description:
      "Electrolyte mixes, joint care, and rapid recovery must-haves for every workout.",
    price: "$58",
    badge: "Bundle",
    accent: "linear-gradient(135deg, rgba(129,226,255,0.82), rgba(162,242,200,0.88))",
  },
  {
    name: "Personalized RX Pack",
    description:
      "Pre-sorted daily medications delivered on schedule with pharmacist monitoring.",
    price: "$112",
    badge: "Subscription",
    accent: "linear-gradient(135deg, rgba(154,239,205,0.82), rgba(123,199,255,0.88))",
  },
];

const blogEntries = [
  {
    title: "5 Everyday Habits for Stronger Immunity",
    excerpt: "Discover simple rituals to reinforce your body's natural defenses year-round.",
    date: "April 12, 2024",
    category: "Wellness",
  },
  {
    title: "Telehealth vs. In-Store Consults",
    excerpt: "When to visit us in person and when a video visit is the smart move.",
    date: "March 28, 2024",
    category: "Care Advice",
  },
  {
    title: "How We Handcraft Custom Compounds",
    excerpt: "Peek inside the lab for a look at how precision medicine comes to life.",
    date: "March 2, 2024",
    category: "Behind the Counter",
  },
];

const serviceHighlights = [
  {
    icon: "💊",
    title: "Auto Refills",
    copy: "Zero-miss medication schedules with text reminders and doorstep delivery.",
  },
  {
    icon: "🩺",
    title: "On-Demand Pharmacists",
    copy: "Video consults and secure messaging crafted in Google Studio for seamless UX.",
  },
  {
    icon: "📦",
    title: "Same-Day Drop",
    copy: "Local couriers ensure refrigerated therapies arrive in perfect condition.",
  },
  {
    icon: "🧘‍♀️",
    title: "Lifestyle Coaching",
    copy: "Personal health roadmaps designed with physicians, nutritionists, and you.",
  },
];

const customerOrders = [
  {
    id: "RX-1024",
    medication: "Vitamin D3 2000IU",
    status: "Ready for pickup",
    refillDate: "May 28, 2024",
  },
  {
    id: "RX-0976",
    medication: "Allergy Relief 24h",
    status: "In transit",
    refillDate: "May 25, 2024",
  },
  {
    id: "RX-0842",
    medication: "Heart Care Combo",
    status: "Refill requested",
    refillDate: "June 2, 2024",
  },
];

const adminMetrics = [
  { label: "Fulfilled orders", value: "1,248", change: "+12%" },
  { label: "Inventory accuracy", value: "99.2%", change: "+2%" },
  { label: "Net promoter score", value: "87", change: "+5" },
];

const adminFocus = [
  "Review specialty cold-chain shipments arriving before noon.",
  "Approve three pending telehealth prescriptions requiring dosage confirmation.",
  "Launch the seasonal allergy awareness campaign in Google Studio.",
];

const contactChannels = [
  { label: "Customer Support", value: "1-800-MEDI-CARE" },
  { label: "Pharmacist On Call", value: "+1 (415) 555-0112" },
  { label: "Email", value: "care@medistudio.health" },
];

const stores = [
  { city: "San Francisco", address: "1900 Market Street", hours: "7a – 10p" },
  { city: "Austin", address: "411 Congress Ave", hours: "8a – 9p" },
  { city: "Seattle", address: "77 Cascade Way", hours: "7a – 10p" },
];

function App() {
  return (
    <div className="app-shell">
      <nav className="global-nav" aria-label="Primary">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ⊹
          </span>
          MediStudio Pharmacy
        </div>
        <ul className="nav-links">
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#shop">Shop All</a>
          </li>
          <li>
            <a href="#blog">Blog</a>
          </li>
          <li>
            <a href="#about">About Us</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
        <button className="primary-cta">Book Consultation</button>
      </nav>

      <main>
        <section id="home" className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Elevated pharmacy care</p>
            <h1>
              Apple-inspired clarity, Google Studio-crafted experiences, clinical-grade
              wellness.
            </h1>
            <p>
              Welcome to MediStudio, the digital-first pharmacy that blends human expertise
              with intuitive design. Track prescriptions, chat with pharmacists, and get
              curated wellness kits—anytime, on any device.
            </p>
            <div className="hero-actions">
              <a className="primary-cta" href="#shop">
                Shop wellness
              </a>
              <a className="secondary-cta" href="#dashboards">
                Explore dashboards
              </a>
            </div>
            <div className="trust-strip">
              <span>HIPAA compliant</span>
              <span>24/7 pharmacist chat</span>
              <span>Rated 4.9/5 by members</span>
            </div>
          </div>
          <div className="hero-panel">
            <article className="snapshot-card">
              <h2>Today&apos;s Health Snapshot</h2>
              <ul>
                <li>
                  Personalized RX packs synced
                  <strong> 100%</strong>
                </li>
                <li>
                  Consultations confirmed<strong> 42</strong>
                </li>
                <li>
                  Wellness plans updated<strong> 68</strong>
                </li>
              </ul>
              <p>Stay aligned with actionable guidance created in Google Studio.</p>
            </article>
          </div>
        </section>

        <section id="shop" className="section products">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Shop all</p>
              <h2>Curated health programs</h2>
            </div>
            <a className="secondary-cta" href="#contact">
              Need a custom plan?
            </a>
          </header>
          <div className="product-grid">
            {productList.map((product) => (
              <article
                key={product.name}
                className="product-card"
                style={{ backgroundImage: product.accent }}
              >
                <div className="card-badge">{product.badge}</div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="card-footer">
                  <span className="price">{product.price}</span>
                  <button type="button" className="ghost-cta">
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section services" aria-label="Health services">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Health services</p>
              <h2>Care that flexes with you</h2>
            </div>
          </header>
          <div className="service-grid">
            {serviceHighlights.map((service) => (
              <article key={service.title} className="service-card">
                <span className="service-icon" aria-hidden="true">
                  {service.icon}
                </span>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="dashboards" className="section dashboards">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Dashboards</p>
              <h2>Customer &amp; admin command centers</h2>
            </div>
            <p>
              Seamless panels bring clarity to every role—from customers tracking wellness
              wins to admins optimizing pharmacy operations in real time.
            </p>
          </header>
          <div className="dashboard-grid">
            <article className="dashboard-card customer">
              <header>
                <h3>Customer dashboard</h3>
                <p>Quick-glance insights tuned for everyday health decisions.</p>
              </header>
              <div className="metric-row">
                <div className="metric">
                  <span className="metric-label">Active prescriptions</span>
                  <span className="metric-value">6</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Goals completed</span>
                  <span className="metric-value">82%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Rewards available</span>
                  <span className="metric-value">$24</span>
                </div>
              </div>
              <div className="table-wrapper" role="region" aria-live="polite">
                <table>
                  <caption className="sr-only">Customer orders and refill status</caption>
                  <thead>
                    <tr>
                      <th scope="col">Order</th>
                      <th scope="col">Medication</th>
                      <th scope="col">Status</th>
                      <th scope="col">Refill date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map((order) => (
                      <tr key={order.id}>
                        <th scope="row">{order.id}</th>
                        <td>{order.medication}</td>
                        <td>{order.status}</td>
                        <td>{order.refillDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className="primary-cta">
                Manage prescriptions
              </button>
            </article>

            <article className="dashboard-card admin">
              <header>
                <h3>Admin dashboard</h3>
                <p>Operational intelligence synchronized across every channel.</p>
              </header>
              <div className="metric-row">
                {adminMetrics.map((metric) => (
                  <div className="metric" key={metric.label}>
                    <span className="metric-label">{metric.label}</span>
                    <span className="metric-value">{metric.value}</span>
                    <span className="metric-change">{metric.change}</span>
                  </div>
                ))}
              </div>
              <ul className="focus-list">
                {adminFocus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="snapshot">
                <strong>Live view</strong>
                <p>
                  Inventory, revenue, and compliance analytics are visualized through Google
                  Studio dashboards tailored to pharmacy leadership.
                </p>
              </div>
              <button type="button" className="ghost-cta">
                Review analytics
              </button>
            </article>
          </div>
        </section>

        <section id="blog" className="section blog">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Health articles</p>
              <h2>Read the latest insights</h2>
            </div>
            <a className="secondary-cta" href="#contact">
              Subscribe for updates
            </a>
          </header>
          <div className="blog-grid">
            {blogEntries.map((entry) => (
              <article key={entry.title} className="blog-card">
                <p className="blog-category">{entry.category}</p>
                <h3>{entry.title}</h3>
                <p>{entry.excerpt}</p>
                <div className="blog-meta">
                  <span>{entry.date}</span>
                  <button type="button" className="ghost-cta">
                    Read article
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="section about">
          <div className="about-content">
            <div>
              <p className="eyebrow">About us</p>
              <h2>Redefining personalized pharmacy care</h2>
              <p>
                MediStudio unites clinical pharmacists, technologists, and designers to deliver
                frictionless wellness journeys. From compounding labs to telehealth suites, every
                touchpoint is crafted with empathy and precision inspired by apple.com&apos;s polish.
              </p>
            </div>
            <ul className="about-list">
              <li>
                <strong>60+</strong>
                Board-certified pharmacists across specialties
              </li>
              <li>
                <strong>15</strong>
                Cities with immersive Wellness Lounges
              </li>
              <li>
                <strong>98%</strong>
                Member satisfaction with our dashboards
              </li>
            </ul>
          </div>
        </section>

        <section id="contact" className="section contact">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Contact us</p>
              <h2>We&apos;re here to help</h2>
            </div>
          </header>
          <div className="contact-grid">
            <div className="contact-panel">
              <h3>Talk to a human</h3>
              <ul className="contact-list">
                {contactChannels.map((channel) => (
                  <li key={channel.label}>
                    <span>{channel.label}</span>
                    <strong>{channel.value}</strong>
                  </li>
                ))}
              </ul>
              <h3>Visit a studio pharmacy</h3>
              <ul className="contact-list">
                {stores.map((store) => (
                  <li key={store.city}>
                    <span>{store.city}</span>
                    <strong>{store.address}</strong>
                    <small>{store.hours}</small>
                  </li>
                ))}
              </ul>
            </div>
            <form className="contact-form">
              <fieldset>
                <legend>Send a message</legend>
                <label>
                  Full name
                  <input type="text" name="name" placeholder="Jordan Carter" required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" placeholder="you@example.com" required />
                </label>
                <label>
                  How can we help?
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Tell us about your prescription or wellness goals"
                    required
                  />
                </label>
                <button type="submit" className="primary-cta">
                  Request support
                </button>
              </fieldset>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              ⊹
            </span>
            MediStudio Pharmacy
          </div>
          <p>
            Crafted with the precision of apple.com&apos;s UI and the flexibility of Google Studio to
            deliver health experiences that simply work.
          </p>
        </div>
        <div className="footer-grid">
          <div>
            <h4>About Us</h4>
            <ul>
              <li><a href="#about">Our story</a></li>
              <li><a href="#dashboards">Meet the pharmacists</a></li>
              <li><a href="#contact">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4>Our Products</h4>
            <ul>
              <li><a href="#shop">Wellness programs</a></li>
              <li><a href="#shop">Compounded medicines</a></li>
              <li><a href="#shop">Family care bundles</a></li>
            </ul>
          </div>
          <div>
            <h4>Health Services</h4>
            <ul>
              <li><a href="#contact">Pharmacist consults</a></li>
              <li><a href="#dashboards">Customer dashboard</a></li>
              <li><a href="#dashboards">Admin analytics</a></li>
            </ul>
          </div>
          <div>
            <h4>Prescription Refill</h4>
            <ul>
              <li><a href="#dashboards">Manage prescriptions</a></li>
              <li><a href="#contact">Upload a prescription</a></li>
              <li><a href="#contact">Insurance partners</a></li>
            </ul>
          </div>
          <div>
            <h4>Pharmacists / Our Team</h4>
            <ul>
              <li><a href="#about">Clinical team</a></li>
              <li><a href="#about">Care coordinators</a></li>
              <li><a href="#about">Wellness experts</a></li>
            </ul>
          </div>
          <div>
            <h4>Store Locator</h4>
            <ul>
              {stores.map((store) => (
                <li key={store.city}>
                  <a href="#contact">{store.city}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact Us</h4>
            <ul>
              {contactChannels.map((channel) => (
                <li key={channel.value}>
                  <a href="#contact">{channel.value}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>FAQs</h4>
            <ul>
              <li><a href="#blog">Shipping &amp; delivery</a></li>
              <li><a href="#blog">Medication safety</a></li>
              <li><a href="#blog">Telehealth visits</a></li>
            </ul>
          </div>
          <div>
            <h4>Health Articles / Blog</h4>
            <ul>
              {blogEntries.map((entry) => (
                <li key={entry.title}>
                  <a href="#blog">{entry.title}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Privacy Policy</h4>
            <ul>
              <li><a href="#">Security commitments</a></li>
              <li><a href="#">Data usage</a></li>
            </ul>
          </div>
          <div>
            <h4>Terms &amp; Conditions</h4>
            <ul>
              <li><a href="#">Membership terms</a></li>
              <li><a href="#">Service agreements</a></li>
            </ul>
          </div>
          <div>
            <h4>Return &amp; Refund Policy</h4>
            <ul>
              <li><a href="#">Wellness kits</a></li>
              <li><a href="#">Prescription items</a></li>
            </ul>
          </div>
          <div>
            <h4>Shipping Information</h4>
            <ul>
              <li><a href="#">Same-day delivery</a></li>
              <li><a href="#">Cold-chain handling</a></li>
            </ul>
          </div>
          <div>
            <h4>Customer Support</h4>
            <ul>
              <li><a href="#contact">Help center</a></li>
              <li><a href="#contact">Live chat</a></li>
            </ul>
          </div>
          <div>
            <h4>Follow Us</h4>
            <ul className="social-links">
              <li>
                <a href="#">Instagram</a>
              </li>
              <li>
                <a href="#">LinkedIn</a>
              </li>
              <li>
                <a href="#">YouTube</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="footer-note">© {new Date().getFullYear()} MediStudio Pharmacy. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
