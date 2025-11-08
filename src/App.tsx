import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import "./App.css";

type AddressBlock = {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
};

type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxPercent: number;
};

type Attachment = {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
};

type Invoice = {
  title: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  company: AddressBlock;
  client: AddressBlock;
  notes: string;
  terms: string;
  lineItems: InvoiceLineItem[];
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const DEFAULT_INVOICE: Invoice = {
  title: "Professional Invoice",
  invoiceNumber: "INV-001",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
    .toISOString()
    .slice(0, 10),
  currency: "USD",
  company: {
    name: "Your Company",
    address: "123 Business Rd.\nSuite 100\nMetropolis, USA",
    email: "billing@example.com",
    phone: "+1 (555) 123-4567",
    website: "https://example.com",
    taxId: "AB-123456",
  },
  client: {
    name: "Client Name",
    address: "456 Client Ave.\nFloor 5\nGotham, USA",
    email: "accounts-payable@example.org",
    phone: "+1 (555) 765-4321",
    website: "",
    taxId: "",
  },
  notes: "Thank you for your business.",
  terms: "Payment due within 14 days via bank transfer.",
  lineItems: [
    {
      id: createId(),
      description: "Consulting services",
      quantity: 10,
      rate: 120,
      taxPercent: 5,
    },
  ],
};

const STORAGE_KEY = "invoice_workbench_state_v1";

type PersistedState = {
  invoice: Invoice;
  logo?: string | null;
  attachments?: Attachment[];
};

function cloneInvoice(invoice: Invoice): Invoice {
  return JSON.parse(JSON.stringify(invoice)) as Invoice;
}

function App() {
  const [invoice, setInvoice] = useState<Invoice>(cloneInvoice(DEFAULT_INVOICE));
  const [logo, setLogo] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) {
      return;
    }
    try {
      const parsed = JSON.parse(cached) as PersistedState;
      if (parsed.invoice) {
        setInvoice({
          ...cloneInvoice(DEFAULT_INVOICE),
          ...parsed.invoice,
          company: { ...DEFAULT_INVOICE.company, ...parsed.invoice.company },
          client: { ...DEFAULT_INVOICE.client, ...parsed.invoice.client },
        });
      }
      setLogo(parsed.logo ?? null);
      setAttachments(parsed.attachments ?? []);
    } catch (error) {
      console.error("Failed to load cached invoice", error);
    }
  }, []);

  useEffect(() => {
    const payload: PersistedState = {
      invoice,
      logo,
      attachments,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [invoice, logo, attachments]);

  const totals = useMemo(() => {
    const subtotal = invoice.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const tax = invoice.lineItems.reduce(
      (sum, item) =>
        sum + (item.quantity * item.rate * item.taxPercent) / 100,
      0
    );
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [invoice.lineItems]);

  function handleCompanyChange<K extends keyof AddressBlock>(
    key: K,
    value: AddressBlock[K]
  ) {
    setInvoice((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        [key]: value,
      },
    }));
  }

  function handleClientChange<K extends keyof AddressBlock>(
    key: K,
    value: AddressBlock[K]
  ) {
    setInvoice((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [key]: value,
      },
    }));
  }

  function handleInvoiceFieldChange<K extends keyof Invoice>(
    key: K,
    value: Invoice[K]
  ) {
    setInvoice((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function addLineItem() {
    setInvoice((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: createId(),
          description: "New service",
          quantity: 1,
          rate: 0,
          taxPercent: 0,
        },
      ],
    }));
  }

  function duplicateLineItem(id: string) {
    setInvoice((prev) => {
      const index = prev.lineItems.findIndex((item) => item.id === id);
      if (index === -1) {
        return prev;
      }
      const copy = { ...prev.lineItems[index], id: createId() };
      const items = [...prev.lineItems];
      items.splice(index + 1, 0, copy);
      return { ...prev, lineItems: items };
    });
  }

  function updateLineItem(
    id: string,
    key: keyof InvoiceLineItem,
    value: string
  ) {
    setInvoice((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]:
                key === "description"
                  ? value
                  : Number.isNaN(Number(value))
                  ? item[key]
                  : Number(value),
            }
          : item
      ),
    }));
  }

  function removeLineItem(id: string) {
    setInvoice((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  }

  function downloadPdf() {
    if (!previewRef.current) {
      return;
    }
    const doc = window.open("", "invoice-preview", "width=900,height=1200");
    if (!doc) {
      window.alert("Enable pop-ups to generate a printable invoice.");
      return;
    }
    const title = `${invoice.invoiceNumber || "invoice"}`;
    const styles = `
      body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 2rem; background: #f4f7fb; }
      .preview { box-shadow: none !important; border: none !important; position: static !important; }
      .preview * { color: #17212b !important; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 0.75rem 0; border-bottom: 1px solid rgba(23, 33, 43, 0.12); }
      thead th { text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; }
      tfoot td { font-weight: 700; }
      .preview-attachments { page-break-inside: avoid; }
    `;
    doc.document.write(`<!doctype html>
      <html>
        <head>
          <title>${title}</title>
          <style>${styles}</style>
        </head>
        <body>
          ${previewRef.current.outerHTML}
        </body>
      </html>`);
    doc.document.close();
    doc.focus();
    setTimeout(() => {
      doc.print();
      doc.close();
    }, 150);
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  function handleAttachmentUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        return;
      }
      setAttachments((prev) => [
        ...prev,
        {
          id: createId(),
          name: file.name,
          size: file.size,
          dataUrl: result,
        },
      ]);
    };
    reader.readAsDataURL(file);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((file) => file.id !== id));
  }

  function exportTemplate() {
    const payload: PersistedState = {
      invoice,
      logo,
      attachments,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoiceNumber || "invoice"}-template.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function importTemplate(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as PersistedState;
        if (!parsed.invoice) {
          throw new Error("Invalid template format");
        }
        setInvoice({
          ...cloneInvoice(DEFAULT_INVOICE),
          ...parsed.invoice,
          company: {
            ...DEFAULT_INVOICE.company,
            ...parsed.invoice.company,
          },
          client: {
            ...DEFAULT_INVOICE.client,
            ...parsed.invoice.client,
          },
        });
        setLogo(parsed.logo ?? null);
        setAttachments(parsed.attachments ?? []);
      } catch (error) {
        console.error("Failed to import template", error);
        window.alert("Unable to import template. Please verify the file format.");
      }
    };
    reader.readAsText(file);
  }

  function resetToDefault() {
    setInvoice(cloneInvoice(DEFAULT_INVOICE));
    setLogo(null);
    setAttachments([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function composeEmail() {
    if (!invoice.client.email) {
      window.alert("Add a client email before composing a message.");
      return;
    }
    const subject = encodeURIComponent(
      `Invoice ${invoice.invoiceNumber} from ${invoice.company.name}`
    );
    const bodyLines = [
      `Hello ${invoice.client.name},`,
      "",
      `Please find attached the invoice ${invoice.invoiceNumber} totaling ${invoice.currency} ${totals.total.toFixed(2)}.`,
      "",
      invoice.notes,
      "",
      "Best regards,",
      invoice.company.name,
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:${invoice.client.email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Invoice Architect</h1>
        <p>
          Craft, personalize, and export invoices entirely in your browser. Import
          custom templates, attach supporting PDFs, and save your progress for
          offline use.
        </p>
        <div className="header-actions">
          <button type="button" onClick={downloadPdf} className="primary">
            Download PDF
          </button>
          <button type="button" onClick={exportTemplate}>
            Export Template
          </button>
          <label className="file-input">
            Import Template
            <input
              type="file"
              accept="application/json"
              onChange={importTemplate}
            />
          </label>
          <button type="button" onClick={composeEmail}>
            Compose Email Draft
          </button>
          <button type="button" onClick={resetToDefault} className="danger">
            Reset
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="editor">
          <h2>Invoice Details</h2>
          <div className="grid">
            <label>
              Title
              <input
                value={invoice.title}
                onChange={(event) =>
                  handleInvoiceFieldChange("title", event.target.value)
                }
              />
            </label>
            <label>
              Invoice #
              <input
                value={invoice.invoiceNumber}
                onChange={(event) =>
                  handleInvoiceFieldChange("invoiceNumber", event.target.value)
                }
              />
            </label>
            <label>
              Issue Date
              <input
                type="date"
                value={invoice.issueDate}
                onChange={(event) =>
                  handleInvoiceFieldChange("issueDate", event.target.value)
                }
              />
            </label>
            <label>
              Due Date
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(event) =>
                  handleInvoiceFieldChange("dueDate", event.target.value)
                }
              />
            </label>
            <label>
              Currency
              <input
                value={invoice.currency}
                onChange={(event) =>
                  handleInvoiceFieldChange("currency", event.target.value)
                }
              />
            </label>
          </div>

          <div className="panel">
            <h3>Company</h3>
            <div className="grid">
              <label>
                Name
                <input
                  value={invoice.company.name}
                  onChange={(event) =>
                    handleCompanyChange("name", event.target.value)
                  }
                />
              </label>
              <label>
                Email
                <input
                  value={invoice.company.email}
                  onChange={(event) =>
                    handleCompanyChange("email", event.target.value)
                  }
                />
              </label>
              <label>
                Phone
                <input
                  value={invoice.company.phone}
                  onChange={(event) =>
                    handleCompanyChange("phone", event.target.value)
                  }
                />
              </label>
              <label>
                Website
                <input
                  value={invoice.company.website}
                  onChange={(event) =>
                    handleCompanyChange("website", event.target.value)
                  }
                />
              </label>
              <label>
                Tax ID
                <input
                  value={invoice.company.taxId}
                  onChange={(event) =>
                    handleCompanyChange("taxId", event.target.value)
                  }
                />
              </label>
              <label className="full">
                Address
                <textarea
                  value={invoice.company.address}
                  onChange={(event) =>
                    handleCompanyChange("address", event.target.value)
                  }
                  rows={3}
                />
              </label>
            </div>
            <label className="full">
              Logo
              <label className="file-input">
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </label>
            </label>
          </div>

          <div className="panel">
            <h3>Client</h3>
            <div className="grid">
              <label>
                Name
                <input
                  value={invoice.client.name}
                  onChange={(event) =>
                    handleClientChange("name", event.target.value)
                  }
                />
              </label>
              <label>
                Email
                <input
                  value={invoice.client.email}
                  onChange={(event) =>
                    handleClientChange("email", event.target.value)
                  }
                />
              </label>
              <label>
                Phone
                <input
                  value={invoice.client.phone}
                  onChange={(event) =>
                    handleClientChange("phone", event.target.value)
                  }
                />
              </label>
              <label>
                Website
                <input
                  value={invoice.client.website}
                  onChange={(event) =>
                    handleClientChange("website", event.target.value)
                  }
                />
              </label>
              <label>
                Tax ID
                <input
                  value={invoice.client.taxId}
                  onChange={(event) =>
                    handleClientChange("taxId", event.target.value)
                  }
                />
              </label>
              <label className="full">
                Address
                <textarea
                  value={invoice.client.address}
                  onChange={(event) =>
                    handleClientChange("address", event.target.value)
                  }
                  rows={3}
                />
              </label>
            </div>
          </div>

          <div className="panel">
            <h3>Line Items</h3>
            <table className="line-items">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Tax %</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => {
                  const lineTotal =
                    item.quantity * item.rate * (1 + item.taxPercent / 100);
                  return (
                    <tr key={item.id}>
                      <td>
                        <textarea
                          value={item.description}
                          onChange={(event) =>
                            updateLineItem(
                              item.id,
                              "description",
                              event.target.value
                            )
                          }
                          rows={2}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step={0.25}
                          value={item.quantity}
                          onChange={(event) =>
                            updateLineItem(item.id, "quantity", event.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.rate}
                          onChange={(event) =>
                            updateLineItem(item.id, "rate", event.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={item.taxPercent}
                          onChange={(event) =>
                            updateLineItem(
                              item.id,
                              "taxPercent",
                              event.target.value
                            )
                          }
                        />
                      </td>
                      <td className="numeric">
                        {invoice.currency} {lineTotal.toFixed(2)}
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          onClick={() => duplicateLineItem(item.id)}
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="danger"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button type="button" onClick={addLineItem} className="primary">
              Add Line Item
            </button>
          </div>

          <div className="panel">
            <h3>Notes & Terms</h3>
            <label className="full">
              Notes
              <textarea
                value={invoice.notes}
                onChange={(event) =>
                  handleInvoiceFieldChange("notes", event.target.value)
                }
                rows={3}
              />
            </label>
            <label className="full">
              Terms
              <textarea
                value={invoice.terms}
                onChange={(event) =>
                  handleInvoiceFieldChange("terms", event.target.value)
                }
                rows={3}
              />
            </label>
          </div>

          <div className="panel">
            <h3>Attachments</h3>
            <p className="hint">
              Attach signed contracts, purchase orders, or existing PDFs. Files are
              stored locally so you can continue editing without an internet
              connection.
            </p>
            <label className="file-input">
              Add Attachment
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleAttachmentUpload}
              />
            </label>
            <ul className="attachments">
              {attachments.map((file) => (
                <li key={file.id}>
                  <span>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <div className="attachment-actions">
                    <a href={file.dataUrl} download={file.name}>
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="danger"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="preview" ref={previewRef}>
          <div className="preview-header">
            {logo ? <img src={logo} alt="Company logo" /> : null}
            <div>
              <h2>{invoice.title}</h2>
              <div className="invoice-meta">
                <div>
                  <span className="label">Invoice #</span>
                  <span>{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="label">Issue Date</span>
                  <span>{invoice.issueDate}</span>
                </div>
                <div>
                  <span className="label">Due Date</span>
                  <span>{invoice.dueDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="preview-columns">
            <div>
              <h3>Bill From</h3>
              <p>
                <strong>{invoice.company.name}</strong>
                <br />
                {invoice.company.address.split("\n").map((line, index) => (
                  <span key={`company-address-${index}`}>
                    {line}
                    <br />
                  </span>
                ))}
                {invoice.company.email && (
                  <span>
                    {invoice.company.email}
                    <br />
                  </span>
                )}
                {invoice.company.phone && (
                  <span>
                    {invoice.company.phone}
                    <br />
                  </span>
                )}
                {invoice.company.website && (
                  <span>
                    {invoice.company.website}
                    <br />
                  </span>
                )}
                {invoice.company.taxId && (
                  <span>Tax ID: {invoice.company.taxId}</span>
                )}
              </p>
            </div>
            <div>
              <h3>Bill To</h3>
              <p>
                <strong>{invoice.client.name}</strong>
                <br />
                {invoice.client.address.split("\n").map((line, index) => (
                  <span key={`client-address-${index}`}>
                    {line}
                    <br />
                  </span>
                ))}
                {invoice.client.email && (
                  <span>
                    {invoice.client.email}
                    <br />
                  </span>
                )}
                {invoice.client.phone && (
                  <span>
                    {invoice.client.phone}
                    <br />
                  </span>
                )}
                {invoice.client.website && (
                  <span>
                    {invoice.client.website}
                    <br />
                  </span>
                )}
                {invoice.client.taxId && (
                  <span>Tax ID: {invoice.client.taxId}</span>
                )}
              </p>
            </div>
          </div>

          <table className="preview-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Tax</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>
                    {invoice.currency} {item.rate.toFixed(2)}
                  </td>
                  <td>{item.taxPercent}%</td>
                  <td>
                    {invoice.currency}
                    {" "}
                    {(item.quantity * item.rate * (1 + item.taxPercent / 100)).toFixed(
                      2
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="numeric">
                  Subtotal
                </td>
                <td>
                  {invoice.currency} {totals.subtotal.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="numeric">
                  Tax
                </td>
                <td>
                  {invoice.currency} {totals.tax.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="numeric grand-total">
                  Total Due
                </td>
                <td className="grand-total">
                  {invoice.currency} {totals.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="preview-notes">
            <h3>Notes</h3>
            <p>{invoice.notes}</p>
          </div>
          <div className="preview-terms">
            <h3>Terms</h3>
            <p>{invoice.terms}</p>
          </div>

          {attachments.length > 0 && (
            <div className="preview-attachments">
              <h3>Attachments</h3>
              <ul>
                {attachments.map((file) => (
                  <li key={file.id}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
