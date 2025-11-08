import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import "./App.css";
import { CURRENCY_CODE_SET, CURRENCY_OPTIONS } from "./data/currencies";

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

type ImportedInvoice = Partial<Omit<Invoice, "company" | "client" | "lineItems">> & {
  company?: Partial<AddressBlock>;
  client?: Partial<AddressBlock>;
  lineItems?: InvoiceLineItem[];
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

const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  "$": "USD",
  "A$": "AUD",
  "AU$": "AUD",
  "C$": "CAD",
  "CA$": "CAD",
  "HK$": "HKD",
  "NZ$": "NZD",
  "S$": "SGD",
  "R$": "BRL",
  "₡": "CRC",
  "₦": "NGN",
  "₫": "VND",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₱": "PHP",
  "₹": "INR",
  "₽": "RUB",
  "₺": "TRY",
  "﷼": "SAR",
  "د.إ": "AED",
  "₪": "ILS",
  "₴": "UAH",
  "₭": "LAK",
  "₲": "PYG",
  "₵": "GHS",
  "₮": "MNT",
  "₼": "AZN",
};

const LINE_ITEM_STOP_WORDS = /\b(invoice|subtotal|total|tax|amount due|balance|bill to|bill from|notes|terms|payment|due date|issue date)\b/i;

function normalizeDateString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  const altMatch = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (altMatch) {
    return `${altMatch[3]}-${altMatch[2]}-${altMatch[1]}`;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return undefined;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const cleaned = value.replace(/[^0-9+\-.,]/g, "").replace(/,/g, "");
  if (!cleaned) {
    return undefined;
  }
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function detectCurrencyFromText(text: string): string | undefined {
  const symbolEntry = Object.entries(CURRENCY_SYMBOL_MAP).find(([symbol]) =>
    text.includes(symbol)
  );
  if (symbolEntry) {
    const code = symbolEntry[1];
    if (CURRENCY_CODE_SET.has(code)) {
      return code;
    }
  }

  const codeMatches = text.match(/\b[A-Z]{3}\b/g);
  if (codeMatches) {
    const code = codeMatches.find((candidate) => CURRENCY_CODE_SET.has(candidate));
    if (code) {
      return code;
    }
  }
  return undefined;
}

function extractLabeledBlock(
  text: string,
  startLabels: string[],
  endLabels: string[]
): string | undefined {
  const startPattern = new RegExp(`(?:${startLabels.join("|")})\s*[:\-]?`, "i");
  const startMatch = startPattern.exec(text);
  if (!startMatch) {
    return undefined;
  }
  const afterStart = text.slice(startMatch.index + startMatch[0].length);
  const endPattern = endLabels.length
    ? new RegExp(`(?:${endLabels.join("|")})\s*[:\-]?`, "i")
    : undefined;
  const endMatch = endPattern ? endPattern.exec(afterStart) : null;
  const block = endMatch ? afterStart.slice(0, endMatch.index) : afterStart;
  return block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .trim();
}

function extractSection(text: string, label: string): string | undefined {
  const pattern = new RegExp(
    `${label}\s*[:\-]?\s*([\\s\\S]*?)(?:\n{2,}|$)`,
    "i"
  );
  const match = pattern.exec(text);
  if (!match) {
    return undefined;
  }
  return match[1].trim();
}

function interpretInvoiceText(rawText: string): ImportedInvoice {
  const text = rawText.replace(/\u00a0/g, " ");
  const result: ImportedInvoice = {};

  const titleMatch = text.match(/^(.*invoice.*)$/im);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  }

  const invoiceNumberMatch = text.match(
    /(invoice\s*(?:number|no\.?|#)\s*[:\-]?\s*)([A-Za-z0-9\-\/]+)/i
  );
  if (invoiceNumberMatch) {
    result.invoiceNumber = invoiceNumberMatch[2].trim();
  }

  const issueDateMatch = text.match(
    /(issue\s*date|invoice\s*date|date\s*of\s*issue)\s*[:\-]?\s*([A-Za-z0-9,\s\/\-]+)/i
  );
  const dueDateMatch = text.match(
    /(due\s*date|payment\s*due)\s*[:\-]?\s*([A-Za-z0-9,\s\/\-]+)/i
  );
  const issueDate = normalizeDateString(issueDateMatch?.[2]);
  const dueDate = normalizeDateString(dueDateMatch?.[2]);
  if (issueDate) {
    result.issueDate = issueDate;
  }
  if (dueDate) {
    result.dueDate = dueDate;
  }

  const currency = detectCurrencyFromText(text);
  if (currency) {
    result.currency = currency;
  }

  const companyBlock = extractLabeledBlock(text, ["Bill From", "From", "Seller"], [
    "Bill To",
    "Ship To",
    "Client",
    "Buyer",
  ]);
  if (companyBlock) {
    const [name, ...rest] = companyBlock.split("\n");
    result.company = {
      name: name ?? "",
      address: rest.join("\n"),
    };
  }

  const clientBlock = extractLabeledBlock(text, ["Bill To", "Client", "Buyer"], [
    "Notes",
    "Terms",
    "Subtotal",
    "Total",
  ]);
  if (clientBlock) {
    const [name, ...rest] = clientBlock.split("\n");
    result.client = {
      name: name ?? "",
      address: rest.join("\n"),
    };
  }

  const notes = extractSection(text, "Notes");
  if (notes) {
    result.notes = notes;
  }
  const terms = extractSection(text, "Terms");
  if (terms) {
    result.terms = terms;
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const lineItems: InvoiceLineItem[] = [];
  for (const line of lines) {
    if (LINE_ITEM_STOP_WORDS.test(line)) {
      continue;
    }
    const percentMatch = line.match(/(\d+(?:\.\d+)?)\s*%/);
    const numericMatches = line.match(/-?\d[\d,.]*/g);
    if (!numericMatches || numericMatches.length < 2) {
      continue;
    }
    const quantity = parseNumber(numericMatches[0]);
    const rateCandidate = parseNumber(numericMatches[1]);
    const totalCandidate = parseNumber(numericMatches[numericMatches.length - 1]);
    if (!quantity || quantity <= 0 || quantity > 100000) {
      continue;
    }
    if (!rateCandidate && !totalCandidate) {
      continue;
    }
    const description = line.slice(0, line.indexOf(numericMatches[0])).trim() ||
      line.replace(/[0-9.,%-]+/g, "").trim() ||
      "Imported line item";
    const rate = rateCandidate ?? (totalCandidate ? totalCandidate / quantity : 0);
    const taxPercent = percentMatch ? Number.parseFloat(percentMatch[1]) : 0;
    lineItems.push({
      id: createId(),
      description,
      quantity,
      rate,
      taxPercent: Number.isFinite(taxPercent) ? taxPercent : 0,
    });
  }
  if (lineItems.length > 0) {
    result.lineItems = lineItems;
  }

  return result;
}

type ZipEntryMetadata = {
  compression: number;
  compressedSize: number;
  uncompressedSize: number;
  dataOffset: number;
};

const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;

function findEndOfCentralDirectory(view: DataView, bytes: Uint8Array): number {
  const minimumOffset = Math.max(0, bytes.length - 0xffff - 22);
  for (let index = bytes.length - 22; index >= minimumOffset; index -= 1) {
    if (view.getUint32(index, true) === ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      return index;
    }
  }
  return -1;
}

function parseZipEntries(buffer: ArrayBuffer): Map<string, ZipEntryMetadata> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const entries = new Map<string, ZipEntryMetadata>();
  const eocdOffset = findEndOfCentralDirectory(view, bytes);
  if (eocdOffset === -1) {
    console.warn("Unable to locate ZIP central directory");
    return entries;
  }
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const decoder = new TextDecoder();
  let pointer = centralDirectoryOffset;
  for (let entryIndex = 0; entryIndex < totalEntries; entryIndex += 1) {
    const signature = view.getUint32(pointer, true);
    if (signature !== ZIP_CENTRAL_DIRECTORY_SIGNATURE) {
      break;
    }
    const compression = view.getUint16(pointer + 10, true);
    const compressedSize = view.getUint32(pointer + 20, true);
    const uncompressedSize = view.getUint32(pointer + 24, true);
    const fileNameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localHeaderOffset = view.getUint32(pointer + 42, true);
    const nameStart = pointer + 46;
    const nameEnd = nameStart + fileNameLength;
    const fileName = decoder.decode(bytes.subarray(nameStart, nameEnd));
    pointer = nameEnd + extraLength + commentLength;

    const localSignature = view.getUint32(localHeaderOffset, true);
    if (localSignature !== ZIP_LOCAL_FILE_HEADER_SIGNATURE) {
      continue;
    }
    const localFileNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataOffset =
      localHeaderOffset + 30 + localFileNameLength + localExtraLength;
    entries.set(fileName, {
      compression,
      compressedSize,
      uncompressedSize,
      dataOffset,
    });
  }
  return entries;
}

async function decompressDeflate(data: Uint8Array): Promise<Uint8Array> {
  const DecompressionStreamConstructor = (
    globalThis as { DecompressionStream?: new (format: string) => TransformStream<Uint8Array, Uint8Array> }
  ).DecompressionStream;
  if (!DecompressionStreamConstructor) {
    console.warn("DecompressionStream is not supported in this browser");
    return new Uint8Array();
  }
  const stream = new Blob([data]).stream().pipeThrough(
    new DecompressionStreamConstructor("deflate-raw")
  );
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

async function getZipEntryData(
  buffer: ArrayBuffer,
  entry: ZipEntryMetadata
): Promise<Uint8Array> {
  const segment = buffer.slice(
    entry.dataOffset,
    entry.dataOffset + entry.compressedSize
  );
  if (entry.compression === 0) {
    return new Uint8Array(segment);
  }
  if (entry.compression === 8) {
    return decompressDeflate(new Uint8Array(segment));
  }
  console.warn(`Unsupported ZIP compression method ${entry.compression}`);
  return new Uint8Array();
}

function columnNameToIndex(column: string): number {
  if (!column) {
    return 0;
  }
  let index = 0;
  for (let i = 0; i < column.length; i += 1) {
    const code = column.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      index = index * 26 + (code - 64);
    }
  }
  return Math.max(index - 1, 0);
}

function decodePdfString(value: string): string {
  return value
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\b/g, " ")
    .replace(/\\f/g, " ")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{1,3})/g, (_, octal) =>
      String.fromCharCode(Number.parseInt(octal, 8))
    );
}

async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const raw = new TextDecoder("latin1").decode(buffer);
  const segments: string[] = [];
  const blockRegex = /BT([\s\S]*?)ET/g;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = blockRegex.exec(raw))) {
    const block = blockMatch[1];
    const stringMatches = block.match(/\(([^()]*)\)/g);
    if (stringMatches) {
      for (const item of stringMatches) {
        const cleaned = decodePdfString(item.slice(1, -1)).trim();
        if (cleaned) {
          segments.push(cleaned);
        }
      }
    }
  }
  if (segments.length === 0) {
    const fallback = raw.match(/\(([^()]*)\)/g) ?? [];
    for (const item of fallback) {
      const cleaned = decodePdfString(item.slice(1, -1)).trim();
      if (cleaned) {
        segments.push(cleaned);
      }
    }
  }
  return segments.join(" ").replace(/\s+/g, " ").trim();
}

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const entries = parseZipEntries(arrayBuffer);
  const entry = entries.get("word/document.xml");
  if (!entry) {
    return "";
  }
  const data = await getZipEntryData(arrayBuffer, entry);
  if (data.length === 0) {
    return "";
  }
  const xml = new TextDecoder().decode(data);
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const paragraphs = Array.from(doc.getElementsByTagName("w:p"));
  const lines = paragraphs
    .map((paragraph) =>
      Array.from(paragraph.getElementsByTagName("w:t"))
        .map((node) => node.textContent ?? "")
        .join("")
        .trim()
    )
    .filter((line) => line.length > 0);
  return lines.join("\n");
}

async function extractSpreadsheetText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const entries = parseZipEntries(arrayBuffer);
  const decoder = new TextDecoder();
  const parser = new DOMParser();
  const sharedEntry = entries.get("xl/sharedStrings.xml");
  const worksheetEntry =
    entries.get("xl/worksheets/sheet1.xml") ??
    [...entries.entries()].find(([name]) =>
      name.startsWith("xl/worksheets/") && name.endsWith(".xml")
    )?.[1];
  if (!worksheetEntry) {
    return "";
  }
  const sharedStrings: string[] = [];
  if (sharedEntry) {
    const sharedXml = decoder.decode(await getZipEntryData(arrayBuffer, sharedEntry));
    const sharedDoc = parser.parseFromString(sharedXml, "application/xml");
    const nodes = Array.from(sharedDoc.getElementsByTagName("si"));
    for (const node of nodes) {
      const text = Array.from(node.getElementsByTagName("t"))
        .map((child) => child.textContent ?? "")
        .join("");
      sharedStrings.push(text);
    }
  }

  const worksheetXml = decoder.decode(
    await getZipEntryData(arrayBuffer, worksheetEntry)
  );
  const worksheetDoc = parser.parseFromString(worksheetXml, "application/xml");
  const rows = Array.from(worksheetDoc.getElementsByTagName("row"));
  const lines: string[] = [];
  for (const row of rows) {
    const cells = Array.from(row.getElementsByTagName("c"));
    const values: string[] = [];
    for (const cell of cells) {
      const reference = cell.getAttribute("r") ?? "";
      const columnIndex = columnNameToIndex(reference.replace(/\d/g, ""));
      while (values.length <= columnIndex) {
        values.push("");
      }
      let cellValue = "";
      const type = cell.getAttribute("t");
      if (type === "inlineStr") {
        const inline = cell.getElementsByTagName("t")[0];
        cellValue = inline?.textContent ?? "";
      } else {
        const valueNode = cell.getElementsByTagName("v")[0];
        cellValue = valueNode?.textContent ?? "";
        if (type === "s") {
          const sharedIndex = Number.parseInt(cellValue, 10);
          if (!Number.isNaN(sharedIndex) && sharedStrings[sharedIndex]) {
            cellValue = sharedStrings[sharedIndex];
          }
        } else if (type === "b") {
          cellValue = cellValue === "1" ? "TRUE" : cellValue === "0" ? "FALSE" : cellValue;
        }
      }
      values[columnIndex] = cellValue;
    }
    lines.push(values.join(","));
  }
  return lines.join("\n");
}

async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") {
    return extractPdfText(file);
  }
  if (extension === "docx") {
    return extractDocxText(file);
  }
  if (extension === "xlsx" || extension === "xls" || extension === "csv") {
    return extractSpreadsheetText(file);
  }
  if (file.type.startsWith("text/")) {
    return file.text();
  }
  throw new Error("Unsupported file type");
}

function applyImportedInvoice(current: Invoice, imported: ImportedInvoice): Invoice {
  const next = { ...current };
  if (imported.title) {
    next.title = imported.title;
  }
  if (imported.invoiceNumber) {
    next.invoiceNumber = imported.invoiceNumber;
  }
  if (imported.issueDate) {
    next.issueDate = imported.issueDate;
  }
  if (imported.dueDate) {
    next.dueDate = imported.dueDate;
  }
  if (imported.notes) {
    next.notes = imported.notes;
  }
  if (imported.terms) {
    next.terms = imported.terms;
  }
  if (imported.currency) {
    const normalized = imported.currency.toUpperCase();
    if (CURRENCY_CODE_SET.has(normalized)) {
      next.currency = normalized;
    }
  }
  if (imported.company) {
    next.company = { ...next.company, ...imported.company };
  }
  if (imported.client) {
    next.client = { ...next.client, ...imported.client };
  }
  if (imported.lineItems && imported.lineItems.length > 0) {
    next.lineItems = imported.lineItems.map((item) => ({
      ...item,
      id: item.id || createId(),
    }));
  }
  return next;
}

function App() {
  const [invoice, setInvoice] = useState<Invoice>(cloneInvoice(DEFAULT_INVOICE));
  const [logo, setLogo] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const currencyOptions = useMemo(() => CURRENCY_OPTIONS, []);
  const currencyForFormatter = useMemo(() => {
    const normalized = invoice.currency?.toUpperCase?.() ?? DEFAULT_INVOICE.currency;
    return CURRENCY_CODE_SET.has(normalized) ? normalized : DEFAULT_INVOICE.currency;
  }, [invoice.currency]);
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyForFormatter,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [currencyForFormatter]
  );

  const formatCurrency = (value: number) => {
    try {
      return currencyFormatter.format(value);
    } catch (error) {
      console.warn("Unable to format currency", error);
      return `${currencyForFormatter} ${value.toFixed(2)}`;
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) {
      return;
    }
    try {
      const parsed = JSON.parse(cached) as PersistedState;
      if (parsed.invoice) {
        const normalizedCurrency = parsed.invoice.currency
          ? parsed.invoice.currency.toUpperCase()
          : DEFAULT_INVOICE.currency;
        const mergedLineItems = (parsed.invoice.lineItems ?? []).map((item) => ({
          ...item,
          id: item.id || createId(),
        }));
        setInvoice({
          ...cloneInvoice(DEFAULT_INVOICE),
          ...parsed.invoice,
          currency: CURRENCY_CODE_SET.has(normalizedCurrency)
            ? normalizedCurrency
            : DEFAULT_INVOICE.currency,
          company: { ...DEFAULT_INVOICE.company, ...parsed.invoice.company },
          client: { ...DEFAULT_INVOICE.client, ...parsed.invoice.client },
          lineItems:
            mergedLineItems.length > 0
              ? mergedLineItems
              : cloneInvoice(DEFAULT_INVOICE).lineItems,
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

  function handleCurrencyChange(value: string) {
    const normalized = value.trim().toUpperCase();
    if (!normalized) {
      return;
    }
    setInvoice((prev) => ({
      ...prev,
      currency: CURRENCY_CODE_SET.has(normalized) ? normalized : prev.currency,
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

  async function handleInvoiceImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        window.alert(
          "We couldn't read any details from that file. Please verify it contains invoice text."
        );
        return;
      }
      const imported = interpretInvoiceText(text);
      const hasContent = Boolean(
        imported.title ||
          imported.invoiceNumber ||
          imported.issueDate ||
          imported.dueDate ||
          imported.notes ||
          imported.terms ||
          imported.currency ||
          (imported.company && Object.keys(imported.company).length > 0) ||
          (imported.client && Object.keys(imported.client).length > 0) ||
          (imported.lineItems && imported.lineItems.length > 0)
      );
      if (!hasContent) {
        window.alert(
          "The selected invoice could not be interpreted automatically. Try a different file or format."
        );
        return;
      }
      setInvoice((prev) => applyImportedInvoice(prev, imported));
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          return;
        }
        const dataUrl = reader.result;
        setAttachments((prev) => {
          if (prev.some((item) => item.name === file.name && item.size === file.size)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: createId(),
              name: file.name,
              size: file.size,
              dataUrl,
            },
          ];
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to import invoice", error);
      window.alert(
        "Unable to import the selected invoice. Supported formats include PDF, DOCX, XLSX, and CSV."
      );
    } finally {
      event.target.value = "";
    }
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
        const normalizedCurrency = parsed.invoice.currency
          ? parsed.invoice.currency.toUpperCase()
          : DEFAULT_INVOICE.currency;
        const mergedLineItems = (parsed.invoice.lineItems ?? []).map((item) => ({
          ...item,
          id: item.id || createId(),
        }));
        setInvoice({
          ...cloneInvoice(DEFAULT_INVOICE),
          ...parsed.invoice,
          currency: CURRENCY_CODE_SET.has(normalizedCurrency)
            ? normalizedCurrency
            : DEFAULT_INVOICE.currency,
          company: {
            ...DEFAULT_INVOICE.company,
            ...parsed.invoice.company,
          },
          client: {
            ...DEFAULT_INVOICE.client,
            ...parsed.invoice.client,
          },
          lineItems:
            mergedLineItems.length > 0
              ? mergedLineItems
              : cloneInvoice(DEFAULT_INVOICE).lineItems,
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
      `Please find attached the invoice ${invoice.invoiceNumber} totaling ${formatCurrency(
        totals.total
      )}.`,
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
              <select
                value={currencyForFormatter}
                onChange={(event) => handleCurrencyChange(event.target.value)}
              >
                {currencyOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} — {option.name}
                  </option>
                ))}
              </select>
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
                        {formatCurrency(lineTotal)}
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
            <h3>Import Existing Invoice</h3>
            <p className="hint">
              Upload an existing invoice in PDF, Word (DOCX), Excel (XLSX/XLS), or
              CSV format. Key information will be read automatically so you can
              continue editing inside Invoice Architect, and the original file
              will be added to your attachments for reference.
            </p>
            <label className="file-input">
              Upload Invoice
              <input
                type="file"
                accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                onChange={handleInvoiceImport}
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
                accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
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
                    {formatCurrency(item.rate)}
                  </td>
                  <td>{item.taxPercent}%</td>
                  <td>
                    {formatCurrency(
                      item.quantity * item.rate * (1 + item.taxPercent / 100)
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
                  {formatCurrency(totals.subtotal)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="numeric">
                  Tax
                </td>
                <td>
                  {formatCurrency(totals.tax)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="numeric grand-total">
                  Total Due
                </td>
                <td className="grand-total">
                  {formatCurrency(totals.total)}
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
