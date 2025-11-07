import { useMemo, useState } from "react";

type ThemeOption = "Aurora" | "Slate" | "Sunset" | "Forest";
type LayoutDensity = "Compact" | "Comfortable" | "Spacious";
type HeaderBehavior = "Static" | "Sticky" | "Transparent";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered";

type Order = {
  id: string;
  customer: string;
  status: OrderStatus;
  total: number;
  placed: string;
};

type PageBlock = {
  name: string;
  description: string;
  lastEdited: string;
};

type CustomerSegment = {
  name: string;
  description: string;
  customers: number;
  trend: string;
  trendType: "positive" | "negative" | "neutral";
};

type Campaign = {
  name: string;
  channel: string;
  status: "Live" | "Scheduled" | "Draft";
  progress: number;
  budget: string;
};

type SupportTicket = {
  id: string;
  subject: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Escalated" | "Resolved";
  updated: string;
};

type InventoryItem = {
  sku: string;
  product: string;
  stock: number;
  reorderPoint: number;
  status: "In stock" | "Low" | "Out";
};

type Automation = {
  name: string;
  trigger: string;
  successRate: number;
};

type TeamMember = {
  name: string;
  role: string;
  permissions: string;
  status: "Online" | "Offline" | "Away";
};

type Activity = {
  time: string;
  title: string;
  actor: string;
  detail: string;
};

type Announcement = {
  title: string;
  audience: string;
  description: string;
  action: string;
};

const themePalette: Record<ThemeOption, string[]> = {
  Aurora: ["#1b6b93", "#51c4d3", "#126e82", "#132c33"],
  Slate: ["#222831", "#393e46", "#00adb5", "#eeeeee"],
  Sunset: ["#ff4d6d", "#ff758f", "#ffc2d1", "#ffe5d9"],
  Forest: ["#004643", "#abd1c6", "#e8e4e6", "#001e1d"],
};

const orders: Order[] = [
  { id: "#1053", customer: "Cynthia Cooper", status: "Pending", total: 248.5, placed: "2h ago" },
  { id: "#1052", customer: "Liam Patel", status: "Processing", total: 98.25, placed: "4h ago" },
  { id: "#1051", customer: "Mei Chen", status: "Delivered", total: 410.0, placed: "Yesterday" },
  { id: "#1050", customer: "Samuel Green", status: "Shipped", total: 185.75, placed: "Yesterday" },
];

const pageBlocks: PageBlock[] = [
  { name: "Homepage", description: "Hero, featured collections, SEO", lastEdited: "12 minutes ago" },
  { name: "Product detail", description: "Variant gallery, policies", lastEdited: "1 hour ago" },
  { name: "Blog layout", description: "Author bio, related posts", lastEdited: "Yesterday" },
  { name: "Loyalty portal", description: "Rewards tiers, referrals", lastEdited: "2 days ago" },
];

const trafficData = [65, 52, 88, 75, 95, 80, 120];
const revenueData = [4200, 3900, 5600, 6100, 7200, 6950, 8100];
const densityOptions: LayoutDensity[] = ["Compact", "Comfortable", "Spacious"];
const headerOptions: HeaderBehavior[] = ["Static", "Sticky", "Transparent"];

const customerSegments: CustomerSegment[] = [
  {
    name: "High value",
    description: "AOV above $350 over the last quarter",
    customers: 428,
    trend: "+12.1%",
    trendType: "positive",
  },
  {
    name: "First-time buyers",
    description: "Completed checkout within last 30 days",
    customers: 1_245,
    trend: "+6.4%",
    trendType: "positive",
  },
  {
    name: "At-risk",
    description: "No activity in 60 days",
    customers: 312,
    trend: "-4.8%",
    trendType: "negative",
  },
];

const campaigns: Campaign[] = [
  { name: "Autumn drop", channel: "Email & SMS", status: "Live", progress: 68, budget: "$12.4K" },
  { name: "Holiday lookbook", channel: "Paid social", status: "Scheduled", progress: 32, budget: "$7.9K" },
  { name: "Loyalty win-back", channel: "Marketing automation", status: "Draft", progress: 10, budget: "$2.1K" },
];

const supportTickets: SupportTicket[] = [
  { id: "#3421", subject: "Refund follow-up", priority: "High", status: "Escalated", updated: "12m" },
  { id: "#3419", subject: "Shipping delay", priority: "Medium", status: "Open", updated: "28m" },
  { id: "#3412", subject: "Product feedback", priority: "Low", status: "Resolved", updated: "1h" },
  { id: "#3408", subject: "Account access", priority: "High", status: "Open", updated: "3h" },
];

const inventory: InventoryItem[] = [
  { sku: "SK-4839", product: "Merino jacket", stock: 62, reorderPoint: 40, status: "In stock" },
  { sku: "SK-1923", product: "Essential tee", stock: 22, reorderPoint: 50, status: "Low" },
  { sku: "SK-2810", product: "Cuffed beanie", stock: 0, reorderPoint: 20, status: "Out" },
  { sku: "SK-5128", product: "Trail backpack", stock: 88, reorderPoint: 30, status: "In stock" },
];

const automations: Automation[] = [
  { name: "Abandoned cart recovery", trigger: "Cart inactive for 4h", successRate: 42 },
  { name: "Loyalty tier nudges", trigger: "Tier threshold reached", successRate: 33 },
  { name: "Wholesale onboarding", trigger: "B2B signup approved", successRate: 28 },
];

const teamMembers: TeamMember[] = [
  { name: "Jordan Diaz", role: "Founder", permissions: "All access", status: "Online" },
  { name: "Priya Patel", role: "Operations", permissions: "Orders, inventory", status: "Away" },
  { name: "Lars Thomsen", role: "Marketing", permissions: "Campaigns", status: "Online" },
  { name: "Ada Romero", role: "Support", permissions: "Help desk", status: "Offline" },
];

const activities: Activity[] = [
  { time: "09:24", title: "New wholesale order", actor: "Jordan Diaz", detail: "Created invoice for Futura Labs" },
  { time: "08:51", title: "Segment synced", actor: "Automations", detail: "High value customers exported to Klaviyo" },
  { time: "07:38", title: "Theme update", actor: "Priya Patel", detail: "Published seasonal header layout" },
  { time: "07:05", title: "Ticket resolved", actor: "Ada Romero", detail: "Refund follow-up completed" },
];

const announcements: Announcement[] = [
  {
    title: "Flash sale planning",
    audience: "Merchandising & marketing",
    description: "Lock pricing grids and inventory buffers before Wednesday.",
    action: "Assign owners",
  },
  {
    title: "Tax compliance review",
    audience: "Finance",
    description: "Upload jurisdiction certificates for Q4 filings.",
    action: "View checklist",
  },
  {
    title: "Support training sprint",
    audience: "CX team",
    description: "Refresh macros and QA scoring rubric for holiday volume.",
    action: "Open playbook",
  },
];

function App() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>("Aurora");
  const [previewPage, setPreviewPage] = useState(pageBlocks[0]);
  const [layoutDensity, setLayoutDensity] = useState<LayoutDensity>("Comfortable");
  const [headerBehavior, setHeaderBehavior] = useState<HeaderBehavior>("Sticky");
  const [enabledAutomations, setEnabledAutomations] = useState<string[]>([
    "Abandoned cart recovery",
    "Loyalty tier nudges",
  ]);

  const themeSwatches = useMemo(() => themePalette[selectedTheme], [selectedTheme]);
  const toggleAutomation = (name: string) => {
    setEnabledAutomations((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-badge">AE</span>
          <div>
            <h1>Artemis Engine</h1>
            <p>Commerce control center</p>
          </div>
        </div>

        <nav className="nav-groups">
          <div className="nav-group">
            <p className="nav-label">OVERVIEW</p>
            <a className="nav-item active" href="#">Dashboard</a>
            <a className="nav-item" href="#">Analytics</a>
            <a className="nav-item" href="#">Storefront</a>
          </div>
          <div className="nav-group">
            <p className="nav-label">COMMERCE</p>
            <a className="nav-item" href="#">Orders</a>
            <a className="nav-item" href="#">Catalog</a>
            <a className="nav-item" href="#">Customers</a>
            <a className="nav-item" href="#">Discounts</a>
          </div>
          <div className="nav-group">
            <p className="nav-label">AUTOMATIONS</p>
            <a className="nav-item" href="#">Journeys</a>
            <a className="nav-item" href="#">Integrations</a>
            <a className="nav-item" href="#">App marketplace</a>
          </div>
        </nav>

        <div className="quick-actions">
          <h2>Quick actions</h2>
          <button type="button">New product</button>
          <button type="button">Launch campaign</button>
          <button type="button">Invite collaborator</button>
        </div>
      </aside>

      <section className="main">
        <header className="topbar">
          <div>
            <h2>Unified commerce dashboard</h2>
            <p>Monitor performance, tailor storefront experiences, and orchestrate operations.</p>
          </div>
          <div className="topbar-tools">
            <input placeholder="Search anything..." />
            <button type="button">Create</button>
            <div className="avatar">JD</div>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card highlight">
            <header>
              <p className="label">Revenue</p>
              <span className="trend positive">+12.4%</span>
            </header>
            <strong>$82,940</strong>
            <p className="sub">Last 30 days</p>
          </article>
          <article className="stat-card">
            <header>
              <p className="label">Orders</p>
              <span className="trend neutral">1,245</span>
            </header>
            <strong>+8.9%</strong>
            <p className="sub">vs. previous month</p>
          </article>
          <article className="stat-card">
            <header>
              <p className="label">Returning customers</p>
              <span className="trend positive">38%</span>
            </header>
            <strong>+4.1%</strong>
            <p className="sub">New loyalty journey</p>
          </article>
          <article className="stat-card">
            <header>
              <p className="label">Support tickets</p>
              <span className="trend negative">-6.2%</span>
            </header>
            <strong>212</strong>
            <p className="sub">Resolved in 24h</p>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel analytics">
            <header>
              <div>
                <h3>Live traffic</h3>
                <p>Average session duration 4m 24s</p>
              </div>
              <button type="button">View report</button>
            </header>
            <div className="line-chart">
              {trafficData.map((value, index) => (
                <div key={index} style={{ height: `${value}px` }} />
              ))}
            </div>
          </article>

          <article className="panel analytics">
            <header>
              <div>
                <h3>Revenue breakdown</h3>
                <p>Net revenue by week</p>
              </div>
              <button type="button">Download CSV</button>
            </header>
            <div className="bar-chart">
              {revenueData.map((value, index) => (
                <div key={index}>
                  <span style={{ height: `${value / 120}px` }} />
                  <p>W{index + 1}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <header>
              <h3>Latest orders</h3>
              <button type="button">Manage orders</button>
            </header>
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>
                      <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                    </td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>{order.placed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="panel editor">
            <header>
              <h3>Visual storefront editor</h3>
              <button type="button">Publish changes</button>
            </header>
            <div className="editor-body">
              <div className="theme-picker">
                <h4>Theme palette</h4>
                <p>Select the accent kit powering your storefront.</p>
                <div className="theme-options">
                  {(Object.keys(themePalette) as ThemeOption[]).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      className={theme === selectedTheme ? "selected" : ""}
                      onClick={() => setSelectedTheme(theme)}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
                <div className="swatches">
                  {themeSwatches.map((color) => (
                    <span key={color} style={{ background: color }} />
                  ))}
                </div>
                </div>

              <div className="page-preview">
                <h4>Page blueprint</h4>
                <p>Swap sections to compose new experiences in real-time.</p>
                <ul>
                  {pageBlocks.map((block) => (
                    <li
                      key={block.name}
                      className={block.name === previewPage.name ? "selected" : ""}
                      onClick={() => setPreviewPage(block)}
                    >
                      <strong>{block.name}</strong>
                      <span>{block.description}</span>
                      <small>Last edited {block.lastEdited}</small>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="layout-controls">
                <h4>Layout controls</h4>
                <p>Adjust density and header behaviour for desktop storefront.</p>
                <div className="density-options">
                  {densityOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={layoutDensity === option ? "selected" : ""}
                      onClick={() => setLayoutDensity(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="header-select">
                  <label htmlFor="header-behavior">Header behaviour</label>
                  <select
                    id="header-behavior"
                    value={headerBehavior}
                    onChange={(event) => setHeaderBehavior(event.target.value as HeaderBehavior)}
                  >
                    {headerOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="current-settings">{layoutDensity} density • {headerBehavior} header</p>
              </div>
            </div>
            <footer>
              <div>
                <h4>Preview</h4>
                <p>{previewPage.name} • {previewPage.description}</p>
              </div>
              <button type="button" className="ghost">Open staging site</button>
            </footer>
          </article>
        </section>

        <section className="operations-grid">
          <article className="panel">
            <header>
              <div>
                <h3>Customer segments</h3>
                <p>Real-time cohorts synced with marketing destinations.</p>
              </div>
              <button type="button">Manage segments</button>
            </header>
            <ul className="segment-list">
              {customerSegments.map((segment) => (
                <li key={segment.name}>
                  <div>
                    <strong>{segment.name}</strong>
                    <span>{segment.description}</span>
                  </div>
                  <div className="segment-meta">
                    <p>{segment.customers.toLocaleString()} customers</p>
                    <span className={`trend ${segment.trendType}`}>{segment.trend}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel marketing">
            <header>
              <div>
                <h3>Campaign performance</h3>
                <p>Monitor channel pacing and remaining budgets.</p>
              </div>
              <button type="button">View calendar</button>
            </header>
            <div className="campaigns">
              {campaigns.map((campaign) => (
                <div key={campaign.name} className="campaign">
                  <div className="campaign-head">
                    <div>
                      <strong>{campaign.name}</strong>
                      <span>{campaign.channel}</span>
                    </div>
                    <span className={`status-badge ${campaign.status.toLowerCase()}`}>{campaign.status}</span>
                  </div>
                  <div className="progress">
                    <span style={{ width: `${campaign.progress}%` }} />
                  </div>
                  <small>{campaign.progress}% to goal • Budget {campaign.budget}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="panel support">
            <header>
              <div>
                <h3>Support queue</h3>
                <p>Prioritize the conversations impacting customer loyalty.</p>
              </div>
              <button type="button">Open help desk</button>
            </header>
            <ul className="tickets">
              {supportTickets.map((ticket) => (
                <li key={ticket.id}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <span>Updated {ticket.updated} • {ticket.id}</span>
                  </div>
                  <div className="ticket-meta">
                    <span className={`priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                    <span className={`status-badge ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="operations-grid secondary">
          <article className="panel inventory">
            <header>
              <div>
                <h3>Inventory watchlist</h3>
                <p>Forecast fulfilment risk across top velocity SKUs.</p>
              </div>
              <button type="button">Reorder</button>
            </header>
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>On hand</th>
                  <th>Reorder at</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.sku}>
                    <td>{item.sku}</td>
                    <td>{item.product}</td>
                    <td>{item.stock}</td>
                    <td>{item.reorderPoint}</td>
                    <td>
                      <span className={`pill ${item.status.replace(" ", "-").toLowerCase()}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="panel automations">
            <header>
              <div>
                <h3>Automation center</h3>
                <p>Toggle journeys driving lifecycle conversion.</p>
              </div>
              <button type="button">Create journey</button>
            </header>
            <ul className="automations-list">
              {automations.map((automation) => {
                const enabled = enabledAutomations.includes(automation.name);
                return (
                  <li key={automation.name}>
                    <div>
                      <strong>{automation.name}</strong>
                      <span>{automation.trigger}</span>
                    </div>
                    <div className="automation-meta">
                      <span className="success-rate">{automation.successRate}% success</span>
                      <button
                        type="button"
                        className={enabled ? "toggle active" : "toggle"}
                        onClick={() => toggleAutomation(automation.name)}
                      >
                        <span />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="panel team">
            <header>
              <div>
                <h3>Team directory</h3>
                <p>Manage collaborator access and accountability.</p>
              </div>
              <button type="button">Invite member</button>
            </header>
            <ul className="team-list">
              {teamMembers.map((member) => (
                <li key={member.name}>
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                  </div>
                  <div className="team-meta">
                    <span>{member.permissions}</span>
                    <span className={`presence ${member.status.toLowerCase()}`}>{member.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="workspace-grid">
          <article className="panel activity">
            <header>
              <div>
                <h3>Activity feed</h3>
                <p>Audit updates across commerce operations.</p>
              </div>
              <button type="button">Export log</button>
            </header>
            <ol>
              {activities.map((activity) => (
                <li key={activity.time}>
                  <span className="time">{activity.time}</span>
                  <div>
                    <strong>{activity.title}</strong>
                    <span>{activity.actor}</span>
                    <p>{activity.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <article className="panel announcements">
            <header>
              <div>
                <h3>Company announcements</h3>
                <p>Stay aligned with strategic initiatives.</p>
              </div>
              <button type="button">Post update</button>
            </header>
            <div className="announcement-list">
              {announcements.map((announcement) => (
                <div key={announcement.title} className="announcement">
                  <div>
                    <strong>{announcement.title}</strong>
                    <span>{announcement.audience}</span>
                  </div>
                  <p>{announcement.description}</p>
                  <button type="button" className="ghost">
                    {announcement.action}
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </div>
  );
}

export default App;
