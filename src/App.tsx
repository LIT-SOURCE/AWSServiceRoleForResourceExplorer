import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import "./App.css";
import cromaLogo from "./assets/croma-logo.svg";
import { CURRENCY_CODE_SET, CURRENCY_OPTIONS } from "./data/currencies";

type AddressBlock = {
  name: string;
  address: string;
  email: string;
  phone: string;
  phoneAlt: string;
  website: string;
  taxId: string;
  gstin: string;
  state: string;
  stateCode: string;
};

type InvoiceLineItem = {
  id: string;
  description: string;
  serialNumber?: string;
  quantity: number;
  rate: number;
  taxPercent: number;
  hsnSac: string;
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
  invoiceTime: string;
  dueDate: string;
  currency: string;
  qrType: string;
  irn: string;
  amountInWords: string;
  company: AddressBlock;
  client: AddressBlock;
  notes: string;
  terms: string;
  paymentSummary: string;
  lineItems: InvoiceLineItem[];
  placeOfSupply: string;
  gstTreatment: "intra" | "inter";
  ewayBill: string;
  charges: {
    shipping: number;
    wrapping: number;
    donation: number;
  };
  qrImageDataUrl?: string | null;
};

type ImportedInvoice = Partial<
  Omit<
    Invoice,
    | "company"
    | "client"
    | "lineItems"
    | "charges"
    | "paymentSummary"
    | "amountInWords"
  >
> & {
  company?: Partial<AddressBlock>;
  client?: Partial<AddressBlock>;
  lineItems?: InvoiceLineItem[];
  charges?: Partial<Invoice["charges"]>;
  paymentSummary?: string;
  amountInWords?: string;
};

const BELOW_TWENTY = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const CURRENCY_WORDS: Record<
  string,
  {
    majorSingular: string;
    majorPlural: string;
    minorSingular: string;
    minorPlural: string;
    style: "indian" | "international";
  }
> = {
  INR: {
    majorSingular: "Rupee",
    majorPlural: "Rupees",
    minorSingular: "Paise",
    minorPlural: "Paise",
    style: "indian",
  },
  USD: {
    majorSingular: "Dollar",
    majorPlural: "Dollars",
    minorSingular: "Cent",
    minorPlural: "Cents",
    style: "international",
  },
  EUR: {
    majorSingular: "Euro",
    majorPlural: "Euros",
    minorSingular: "Cent",
    minorPlural: "Cents",
    style: "international",
  },
  GBP: {
    majorSingular: "Pound",
    majorPlural: "Pounds",
    minorSingular: "Pence",
    minorPlural: "Pence",
    style: "international",
  },
};

function twoDigitToWords(value: number) {
  if (value < 20) {
    return BELOW_TWENTY[value];
  }
  const tens = Math.floor(value / 10);
  const units = value % 10;
  return units > 0 ? `${TENS[tens]} ${BELOW_TWENTY[units]}` : TENS[tens];
}

function convertNumberToIndianWords(value: number): string {
  if (value === 0) {
    return BELOW_TWENTY[0];
  }
  const segments: string[] = [];
  const crore = Math.floor(value / 10000000);
  if (crore > 0) {
    segments.push(`${convertNumberToIndianWords(crore)} Crore`);
    value %= 10000000;
  }
  const lakh = Math.floor(value / 100000);
  if (lakh > 0) {
    segments.push(`${convertNumberToIndianWords(lakh)} Lakh`);
    value %= 100000;
  }
  const thousand = Math.floor(value / 1000);
  if (thousand > 0) {
    segments.push(`${convertNumberToIndianWords(thousand)} Thousand`);
    value %= 1000;
  }
  const hundred = Math.floor(value / 100);
  if (hundred > 0) {
    segments.push(`${convertNumberToIndianWords(hundred)} Hundred`);
    value %= 100;
  }
  if (value > 0) {
    if (segments.length > 0) {
      segments.push("and");
    }
    segments.push(twoDigitToWords(value));
  }
  return segments.join(" ");
}

function convertNumberToInternationalWords(value: number): string {
  if (value === 0) {
    return BELOW_TWENTY[0];
  }
  const segments: string[] = [];
  const units = [
    { divisor: 1000000000, label: "Billion" },
    { divisor: 1000000, label: "Million" },
    { divisor: 1000, label: "Thousand" },
    { divisor: 100, label: "Hundred" },
  ];
  for (const unit of units) {
    if (value >= unit.divisor) {
      const count = Math.floor(value / unit.divisor);
      segments.push(
        `${convertNumberToInternationalWords(count)} ${unit.label}`
      );
      value %= unit.divisor;
    }
  }
  if (value > 0) {
    if (segments.length > 0) {
      segments.push("and");
    }
    segments.push(twoDigitToWords(value));
  }
  return segments.join(" ");
}

function convertAmountToWords(amount: number, currencyCode: string) {
  const rounded = Math.round((Number.isFinite(amount) ? amount : 0) * 100) / 100;
  const absolute = Math.abs(rounded);
  const whole = Math.floor(absolute);
  const fraction = Math.round((absolute - whole) * 100);
  const currency = CURRENCY_WORDS[currencyCode] ?? {
    majorSingular: currencyCode,
    majorPlural: `${currencyCode}s`,
    minorSingular: "Cent",
    minorPlural: "Cents",
    style: "international" as const,
  };
  const numberToWords =
    currency.style === "indian"
      ? convertNumberToIndianWords
      : convertNumberToInternationalWords;
  let result = "";
  if (whole === 0) {
    result = `Zero ${currency.majorPlural}`;
  } else {
    const majorLabel = whole === 1 ? currency.majorSingular : currency.majorPlural;
    result = `${numberToWords(whole)} ${majorLabel}`;
  }
  if (fraction > 0) {
    const minorLabel =
      fraction === 1 ? currency.minorSingular : currency.minorPlural;
    result = `${result} and ${numberToWords(fraction)} ${minorLabel}`;
  }
  if (rounded < 0) {
    result = `Negative ${result}`;
  }
  return `${result} Only`;
}

function calculateInvoiceTotals(invoice: Invoice) {
  const aggregate = invoice.lineItems.reduce(
    (sum, item) => {
      const taxableValue = item.quantity * item.rate;
      const rate = Number.isFinite(item.taxPercent) ? item.taxPercent : 0;
      const normalizedRate = Math.max(rate, 0);
      const gstAmount = (taxableValue * normalizedRate) / 100;
      sum.subtotal += taxableValue;
      if (invoice.gstTreatment === "inter") {
        sum.igst += gstAmount;
      } else {
        const split = gstAmount / 2;
        sum.cgst += split;
        sum.sgst += split;
      }
      return sum;
    },
    { subtotal: 0, cgst: 0, sgst: 0, igst: 0 }
  );
  const chargesTotal =
    (invoice.charges?.shipping ?? 0) +
    (invoice.charges?.wrapping ?? 0) +
    (invoice.charges?.donation ?? 0);
  const tax = aggregate.cgst + aggregate.sgst + aggregate.igst;
  const total = aggregate.subtotal + tax + chargesTotal;
  return { ...aggregate, tax, total, chargesTotal };
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const DEFAULT_INVOICE: Invoice = {
  title: "Invoice",
  invoiceNumber: "SLA698370248308",
  issueDate: "2025-04-29",
  invoiceTime: "20:53:34",
  dueDate: "2025-04-29",
  currency: "INR",
  qrType: "Dynamic QR Code",
  irn: "",
  amountInWords: "",
  company: {
    name: "INFINITI RETAIL LIMITED (trading as Croma)",
    address:
      "Unit No.701 & 702, Wing A, 7th Floor, Kaledonia, Sahar Road, Andheri (East), Mumbai 400069, India",
    email: "customersupport@croma.com",
    phone: "1800-572-7662",
    phoneAlt: "040-46517910",
    website: "www.croma.com",
    taxId: "U31900MH2005PLC158120",
    gstin: "27AACCV1726H1ZE",
    state: "Maharashtra",
    stateCode: "27",
  },
  client: {
    name: "Nirmal Yadav",
    address:
      "Ambernath, Ambernath, Ambernath, AMBERNATH, Maharashtra-27, 421501",
    email: "",
    phone: "9096551379",
    phoneAlt: "",
    website: "",
    taxId: "",
    gstin: "",
    state: "Maharashtra",
    stateCode: "27",
  },
  notes: [
    "This is a computer generated invoice and does not require a signature.",
    "Wherever applicable, GST is levied at applicable rate on the value determined as per Rule 32(5) of the CGST Rules.",
    "Covered under reverse charge: No.",
  ].join("\n"),
  terms:
    "Payment accepted via UPI, credit/debit cards, or net banking. Goods once sold are covered by Croma's return and refund policy.",
  paymentSummary:
    "Card: Axis EDC Tender • ****1254 | Card: HDFC EDC Tender • ****3526",
  lineItems: [
    {
      id: createId(),
      description: "DELL 15 INSP 3520 12Gi3 8GBN 512GBSD+OB",
      serialNumber: "98ZSN04",
      quantity: 1,
      rate: 29971.44,
      taxPercent: 18,
      hsnSac: "84713010",
    },
    {
      id: createId(),
      description: "Dell 15 Essential Backpack New",
      serialNumber: "",
      quantity: 1,
      rate: 846.6,
      taxPercent: 18,
      hsnSac: "42021220",
    },
  ],
  placeOfSupply: "Maharashtra-27",
  gstTreatment: "intra",
  ewayBill: "",
  charges: {
    shipping: 0,
    wrapping: 0,
    donation: 0,
  },
  qrImageDataUrl: null,
};

const DEFAULT_LOGO = cromaLogo;

const defaultTotals = calculateInvoiceTotals(DEFAULT_INVOICE);
DEFAULT_INVOICE.amountInWords = convertAmountToWords(
  defaultTotals.total,
  DEFAULT_INVOICE.currency
);

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

const LINE_ITEM_STOP_WORDS = /\b(invoice|subtotal|total|tax|cgst|sgst|igst|gst|amount due|balance|bill to|bill from|notes|terms|payment|due date|issue date)\b/i;

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
    const filtered = rest.filter((line) => {
      const normalized = line.trim().toLowerCase();
      return !(
        normalized.startsWith("gstin") ||
        normalized.startsWith("pan") ||
        normalized.startsWith("state code") ||
        normalized.startsWith("state") ||
        normalized.startsWith("place of supply")
      );
    });
    const addressLines = filtered.filter((line) => line.trim().length > 0);
    const companyDetails: Partial<AddressBlock> = {
      name: name ?? "",
      address:
        addressLines.length > 0 ? addressLines.join("\n") : rest.join("\n"),
    };
    const gstMatch = companyBlock.match(/GSTIN\s*[:\-]?\s*([0-9A-Z]{15})/i);
    if (gstMatch) {
      companyDetails.gstin = gstMatch[1];
    }
    const panMatch = companyBlock.match(/PAN\s*[:\-]?\s*([A-Z]{5}\d{4}[A-Z])/i);
    if (panMatch) {
      companyDetails.taxId = panMatch[1];
    }
    const stateCodeMatch = companyBlock.match(/State\s*Code\s*[:\-]?\s*(\d{2})/i);
    if (stateCodeMatch) {
      companyDetails.stateCode = stateCodeMatch[1];
    }
    const stateMatch = companyBlock.match(/State(?!\s*Code)\s*[:\-]?\s*([A-Za-z\s]+)/i);
    if (stateMatch) {
      companyDetails.state = stateMatch[1].trim();
    }
    result.company = companyDetails;
  }

  const clientBlock = extractLabeledBlock(text, ["Bill To", "Client", "Buyer"], [
    "Notes",
    "Terms",
    "Subtotal",
    "Total",
  ]);
  if (clientBlock) {
    const [name, ...rest] = clientBlock.split("\n");
    const filtered = rest.filter((line) => {
      const normalized = line.trim().toLowerCase();
      return !(
        normalized.startsWith("gstin") ||
        normalized.startsWith("pan") ||
        normalized.startsWith("state code") ||
        normalized.startsWith("state") ||
        normalized.startsWith("place of supply")
      );
    });
    const addressLines = filtered.filter((line) => line.trim().length > 0);
    const clientDetails: Partial<AddressBlock> = {
      name: name ?? "",
      address:
        addressLines.length > 0 ? addressLines.join("\n") : rest.join("\n"),
    };
    const clientGstMatch = clientBlock.match(/GSTIN\s*[:\-]?\s*([0-9A-Z]{15})/i);
    if (clientGstMatch) {
      clientDetails.gstin = clientGstMatch[1];
    }
    const clientPanMatch = clientBlock.match(/PAN\s*[:\-]?\s*([A-Z]{5}\d{4}[A-Z])/i);
    if (clientPanMatch) {
      clientDetails.taxId = clientPanMatch[1];
    }
    const clientStateCodeMatch = clientBlock.match(/State\s*Code\s*[:\-]?\s*(\d{2})/i);
    if (clientStateCodeMatch) {
      clientDetails.stateCode = clientStateCodeMatch[1];
    }
    const clientStateMatch = clientBlock.match(/State(?!\s*Code)\s*[:\-]?\s*([A-Za-z\s]+)/i);
    if (clientStateMatch) {
      clientDetails.state = clientStateMatch[1].trim();
    }
    result.client = clientDetails;
  }

  const notes = extractSection(text, "Notes");
  if (notes) {
    result.notes = notes;
  }
  const terms = extractSection(text, "Terms");
  if (terms) {
    result.terms = terms;
  }

  const placeOfSupplyMatch = text.match(/Place\s+of\s+Supply\s*[:\-]?\s*([^\n]+)/i);
  if (placeOfSupplyMatch) {
    result.placeOfSupply = placeOfSupplyMatch[1].trim();
  }

  const ewayBillMatch = text.match(
    /E[-\s]?Way\s+Bill(?:\s*(?:No\.?|Number))?\s*[:\-]?\s*([A-Za-z0-9]+)/i
  );
  if (ewayBillMatch) {
    result.ewayBill = ewayBillMatch[1].trim();
  }

  if (!result.gstTreatment) {
    if (/IGST/i.test(text) && !/CGST/i.test(text)) {
      result.gstTreatment = "inter";
    } else if (/CGST/i.test(text) && /SGST/i.test(text)) {
      result.gstTreatment = "intra";
    }
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
      hsnSac: "",
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

type DecompressionStreamConstructor = new (
  format: string
) => TransformStream<Uint8Array, Uint8Array>;

async function decompressWithStream(
  data: Uint8Array,
  format: "deflate" | "deflate-raw"
): Promise<Uint8Array> {
  const DecompressionStreamConstructor = (
    globalThis as { DecompressionStream?: DecompressionStreamConstructor }
  ).DecompressionStream;
  if (!DecompressionStreamConstructor) {
    console.warn("DecompressionStream is not supported in this browser");
    return new Uint8Array();
  }
  try {
    const stream = new Blob([data]).stream().pipeThrough(
      new DecompressionStreamConstructor(format)
    );
    const buffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    console.warn(`Failed to decompress using ${format}`, error);
    return new Uint8Array();
  }
}

async function decompressDeflate(data: Uint8Array): Promise<Uint8Array> {
  return decompressWithStream(data, "deflate-raw");
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
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, " ")
    .replace(/\\b/g, "")
    .replace(/\\f/g, " ")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{1,3})/g, (_, octal) =>
      String.fromCharCode(Number.parseInt(octal, 8))
    )
    .replace(/\u0000/g, "");
}

function decodePdfBytes(bytes: Uint8Array): string {
  if (bytes.length >= 2) {
    const hasBigEndianBom = bytes[0] === 0xfe && bytes[1] === 0xff;
    const hasLittleEndianBom = bytes[0] === 0xff && bytes[1] === 0xfe;
    if (hasBigEndianBom || hasLittleEndianBom) {
      const view = new DataView(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength
      );
      let text = "";
      for (let offset = 2; offset < bytes.length; offset += 2) {
        const codePoint = view.getUint16(offset, hasLittleEndianBom);
        if (codePoint !== 0) {
          text += String.fromCharCode(codePoint);
        }
      }
      return text;
    }
  }
  try {
    const decoder = new TextDecoder("utf-8", { fatal: false });
    return decoder.decode(bytes).replace(/\u0000/g, "");
  } catch (error) {
    console.warn("Failed to decode UTF-8 PDF bytes", error);
  }
  try {
    const decoder = new TextDecoder("windows-1252", { fatal: false });
    return decoder.decode(bytes).replace(/\u0000/g, "");
  } catch (error) {
    console.warn("Failed to decode Windows-1252 PDF bytes", error);
  }
  let fallback = "";
  for (let index = 0; index < bytes.length; index += 1) {
    const code = bytes[index];
    if (code !== 0) {
      fallback += String.fromCharCode(code);
    }
  }
  return fallback;
}

function decodePdfHexString(value: string): string {
  const cleaned = value.replace(/[^0-9A-Fa-f]/g, "");
  if (cleaned.length === 0) {
    return "";
  }
  const bytes = new Uint8Array(Math.ceil(cleaned.length / 2));
  for (let index = 0; index < cleaned.length; index += 2) {
    const pair = cleaned.slice(index, index + 2);
    bytes[index / 2] = Number.parseInt(pair.padEnd(2, "0"), 16);
  }
  return decodePdfBytes(bytes);
}

function hasFlateDecodeFilter(dictionary: string): boolean {
  if (!dictionary) {
    return false;
  }
  const singleFilterMatch = dictionary.match(/\/Filter\s*\/([A-Za-z0-9]+)/);
  if (singleFilterMatch) {
    return singleFilterMatch[1] === "FlateDecode";
  }
  const arrayMatch = dictionary.match(/\/Filter\s*\[(.*?)\]/);
  if (arrayMatch) {
    return /FlateDecode/.test(arrayMatch[1]);
  }
  return false;
}

async function readPdfStreams(buffer: ArrayBuffer): Promise<string[]> {
  const latinDecoder = new TextDecoder("latin1");
  const rawText = latinDecoder.decode(buffer);
  const bytes = new Uint8Array(buffer);
  const segments: string[] = [];
  let searchIndex = 0;

  while (searchIndex < rawText.length) {
    const streamIndex = rawText.indexOf("stream", searchIndex);
    if (streamIndex === -1) {
      break;
    }

    let dataStart = streamIndex + 6;
    if (rawText[dataStart] === "\r" && rawText[dataStart + 1] === "\n") {
      dataStart += 2;
    } else if (rawText[dataStart] === "\n") {
      dataStart += 1;
    }

    const endIndex = rawText.indexOf("endstream", dataStart);
    if (endIndex === -1) {
      break;
    }

    let dataEnd = endIndex;
    if (rawText[dataEnd - 1] === "\r") {
      dataEnd -= 1;
    }

    const dictionaryStart = rawText.lastIndexOf("<<", streamIndex);
    const dictionaryEnd = rawText.indexOf(">>", dictionaryStart);
    const dictionary =
      dictionaryStart !== -1 && dictionaryEnd !== -1
        ? rawText.slice(dictionaryStart, dictionaryEnd + 2)
        : "";

    const chunk = bytes.subarray(dataStart, dataEnd);
    const isImage = /\/Subtype\s*\/Image/.test(dictionary);
    let decoded = "";

    if (isImage) {
      decoded = "";
    } else if (hasFlateDecodeFilter(dictionary)) {
      const inflated = await decompressWithStream(chunk, "deflate");
      if (inflated.length > 0) {
        decoded = decodePdfBytes(inflated);
      } else {
        decoded = latinDecoder.decode(chunk);
      }
    } else if (/\/Filter\s*\/(?:ASCII85Decode|LZWDecode)/.test(dictionary)) {
      // Unsupported filter types – skip these streams.
      decoded = "";
    } else {
      decoded = latinDecoder.decode(chunk);
    }

    if (decoded && decoded.trim()) {
      segments.push(decoded);
    }

    searchIndex = endIndex + 9;
  }

  if (segments.length === 0) {
    segments.push(rawText);
  }

  return segments;
}

async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const streamContents = await readPdfStreams(buffer);
  const segments: string[] = [];
  for (const content of streamContents) {
    const blockRegex = /BT([\s\S]*?)ET/g;
    let blockMatch: RegExpExecArray | null;
    while ((blockMatch = blockRegex.exec(content))) {
      const block = blockMatch[1];
      const tokenRegex = /\((?:\\.|[^\\)])*\)|<([0-9A-Fa-f\s]+)>/g;
      let match: RegExpExecArray | null;
      while ((match = tokenRegex.exec(block))) {
        const token = match[0];
        let decoded = "";
        if (token.startsWith("(")) {
          decoded = decodePdfString(token.slice(1, -1));
        } else if (token.startsWith("<") && token.endsWith(">")) {
          decoded = decodePdfHexString(token.slice(1, -1));
        }
        if (decoded.trim()) {
          segments.push(decoded.trim());
        }
      }
    }
  }

  if (segments.length === 0) {
    const rawText = streamContents.join("\n");
    const tokenRegex = /\((?:\\.|[^\\)])*\)|<([0-9A-Fa-f\s]+)>/g;
    let fallbackMatch: RegExpExecArray | null;
    while ((fallbackMatch = tokenRegex.exec(rawText))) {
      const token = fallbackMatch[0];
      let decoded = "";
      if (token.startsWith("(")) {
        decoded = decodePdfString(token.slice(1, -1));
      } else if (token.startsWith("<") && token.endsWith(">")) {
        decoded = decodePdfHexString(token.slice(1, -1));
      }
      if (decoded.trim()) {
        segments.push(decoded.trim());
      }
    }
  }

  const normalized = segments
    .join("\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (normalized) {
    return normalized;
  }

  return streamContents
    .join("\n")
    .replace(/\u0000/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
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
  if (imported.invoiceTime) {
    next.invoiceTime = imported.invoiceTime;
  }
  if (imported.notes) {
    next.notes = imported.notes;
  }
  if (imported.terms) {
    next.terms = imported.terms;
  }
  if (typeof imported.qrType === "string") {
    next.qrType = imported.qrType;
  }
  if (typeof imported.irn === "string") {
    next.irn = imported.irn;
  }
  if (typeof imported.paymentSummary === "string") {
    next.paymentSummary = imported.paymentSummary;
  }
  if (typeof imported.amountInWords === "string") {
    next.amountInWords = imported.amountInWords;
  }
  if (imported.placeOfSupply) {
    next.placeOfSupply = imported.placeOfSupply;
  }
  if (imported.gstTreatment === "intra" || imported.gstTreatment === "inter") {
    next.gstTreatment = imported.gstTreatment;
  }
  if (typeof imported.ewayBill === "string") {
    next.ewayBill = imported.ewayBill;
  }
  if (imported.charges) {
    next.charges = { ...next.charges, ...imported.charges };
  }
  if (typeof imported.qrImageDataUrl === "string") {
    next.qrImageDataUrl = imported.qrImageDataUrl;
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
      hsnSac: item.hsnSac ?? "",
    }));
  }
  return next;
}

function App() {
  const [invoice, setInvoice] = useState<Invoice>(cloneInvoice(DEFAULT_INVOICE));
  const [logo, setLogo] = useState<string | null>(DEFAULT_LOGO);
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
        const defaults = cloneInvoice(DEFAULT_INVOICE);
        const normalizedCurrency = parsed.invoice.currency
          ? parsed.invoice.currency.toUpperCase()
          : DEFAULT_INVOICE.currency;
        const mergedLineItems = (parsed.invoice.lineItems ?? []).map((item) => ({
          ...item,
          id: item.id || createId(),
          hsnSac: item.hsnSac ?? "",
        }));
        setInvoice({
          ...defaults,
          ...parsed.invoice,
          invoiceTime: parsed.invoice.invoiceTime ?? defaults.invoiceTime,
          qrType: parsed.invoice.qrType ?? defaults.qrType,
          irn: parsed.invoice.irn ?? defaults.irn,
          paymentSummary:
            parsed.invoice.paymentSummary ?? defaults.paymentSummary,
          amountInWords:
            parsed.invoice.amountInWords ?? defaults.amountInWords,
          currency: CURRENCY_CODE_SET.has(normalizedCurrency)
            ? normalizedCurrency
            : DEFAULT_INVOICE.currency,
          gstTreatment:
            parsed.invoice.gstTreatment === "inter"
              ? "inter"
              : defaults.gstTreatment,
          placeOfSupply: parsed.invoice.placeOfSupply ?? defaults.placeOfSupply,
          ewayBill: parsed.invoice.ewayBill ?? defaults.ewayBill,
          charges: {
            ...defaults.charges,
            ...(parsed.invoice.charges ?? {}),
          },
          qrImageDataUrl:
            Object.prototype.hasOwnProperty.call(parsed.invoice, "qrImageDataUrl")
              ? parsed.invoice.qrImageDataUrl
              : defaults.qrImageDataUrl,
          company: { ...DEFAULT_INVOICE.company, ...parsed.invoice.company },
          client: { ...DEFAULT_INVOICE.client, ...parsed.invoice.client },
          lineItems:
            mergedLineItems.length > 0
              ? mergedLineItems
              : cloneInvoice(DEFAULT_INVOICE).lineItems,
        });
      }
      if (Object.prototype.hasOwnProperty.call(parsed, "logo")) {
        setLogo(parsed.logo ?? null);
      } else {
        setLogo(DEFAULT_LOGO);
      }
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

  const totals = useMemo(
    () => calculateInvoiceTotals(invoice),
    [invoice.charges, invoice.lineItems, invoice.gstTreatment]
  );

  const taxSummary = useMemo(() => {
    const summary = new Map<
      string,
      { type: string; rate: number; taxable: number; tax: number }
    >();
    invoice.lineItems.forEach((item) => {
      const taxableValue = item.quantity * item.rate;
      const rate = Math.max(Number.isFinite(item.taxPercent) ? item.taxPercent : 0, 0);
      if (rate <= 0 || taxableValue <= 0) {
        return;
      }
      const gstAmount = (taxableValue * rate) / 100;
      if (invoice.gstTreatment === "inter") {
        const key = `IGST-${rate}`;
        const entry = summary.get(key) ?? {
          type: "IGST",
          rate,
          taxable: 0,
          tax: 0,
        };
        entry.taxable += taxableValue;
        entry.tax += gstAmount;
        summary.set(key, entry);
      } else {
        const halfRate = rate / 2;
        const halfTax = gstAmount / 2;
        const cgstKey = `CGST-${halfRate}`;
        const cgstEntry = summary.get(cgstKey) ?? {
          type: "CGST",
          rate: halfRate,
          taxable: 0,
          tax: 0,
        };
        cgstEntry.taxable += taxableValue;
        cgstEntry.tax += halfTax;
        summary.set(cgstKey, cgstEntry);

        const sgstKey = `SGST-${halfRate}`;
        const sgstEntry = summary.get(sgstKey) ?? {
          type: "SGST",
          rate: halfRate,
          taxable: 0,
          tax: 0,
        };
        sgstEntry.taxable += taxableValue;
        sgstEntry.tax += halfTax;
        summary.set(sgstKey, sgstEntry);
      }
    });
    return Array.from(summary.values());
  }, [invoice.lineItems, invoice.gstTreatment]);

  const amountFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatAmount = (value: number) => amountFormatter.format(value);

  const quantityFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatQuantity = (value: number) => quantityFormatter.format(value);

  const currencySymbol = useMemo(() => {
    try {
      const parts = currencyFormatter.formatToParts(0);
      const currencyPart = parts.find((part) => part.type === "currency");
      return currencyPart?.value ?? currencyForFormatter;
    } catch (error) {
      console.warn("Unable to derive currency symbol", error);
      return currencyForFormatter;
    }
  }, [currencyForFormatter, currencyFormatter]);

  const sortedTaxSummary = useMemo(() => {
    const order: Record<string, number> = { CGST: 0, SGST: 1, IGST: 2 };
    return [...taxSummary].sort((a, b) => {
      const aOrder = order[a.type] ?? 3;
      const bOrder = order[b.type] ?? 3;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      if (a.rate !== b.rate) {
        return a.rate - b.rate;
      }
      return a.taxable - b.taxable;
    });
  }, [taxSummary]);

  const noteLines = useMemo(
    () =>
      invoice.notes
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    [invoice.notes]
  );

  const paymentSummaryText = useMemo(() => {
    const parts = invoice.paymentSummary
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return parts.length > 0 ? parts.join(" | ") : "—";
  }, [invoice.paymentSummary]);

  const computedAmountInWords = useMemo(
    () => convertAmountToWords(totals.total, currencyForFormatter),
    [totals.total, currencyForFormatter]
  );

  useEffect(() => {
    setInvoice((prev) => {
      const trimmed = prev.amountInWords?.trim?.() ?? "";
      if (trimmed.length > 0 || prev.amountInWords === computedAmountInWords) {
        return prev;
      }
      return { ...prev, amountInWords: computedAmountInWords };
    });
  }, [computedAmountInWords]);

  const amountInWordsDisplay = useMemo(() => {
    const trimmed = invoice.amountInWords?.trim?.() ?? "";
    return trimmed.length > 0 ? trimmed : computedAmountInWords;
  }, [invoice.amountInWords, computedAmountInWords]);

  const companyMetaLine = useMemo(() => {
    const parts: string[] = [];
    if (invoice.company.gstin) {
      parts.push(`GSTIN: ${invoice.company.gstin}`);
    }
    if (invoice.company.taxId) {
      parts.push(`CIN: ${invoice.company.taxId}`);
    }
    if (invoice.company.website) {
      parts.push(invoice.company.website);
    }
    return parts.join(" · ");
  }, [invoice.company.gstin, invoice.company.taxId, invoice.company.website]);

  const companyPhoneLine = useMemo(() => {
    const phones = [invoice.company.phone, invoice.company.phoneAlt].filter(
      (value) => value && value.trim().length > 0
    );
    return phones.join(" · ");
  }, [invoice.company.phone, invoice.company.phoneAlt]);

  const clientPhoneLine = useMemo(() => {
    const phones = [invoice.client.phone, invoice.client.phoneAlt].filter(
      (value) => value && value.trim().length > 0
    );
    return phones.join(" · ");
  }, [invoice.client.phone, invoice.client.phoneAlt]);

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

  function handleChargeChange(key: keyof Invoice["charges"], value: string) {
    const cleaned = value.trim();
    const amount = cleaned === "" ? 0 : Number.parseFloat(cleaned);
    if (Number.isNaN(amount)) {
      return;
    }
    setInvoice((prev) => ({
      ...prev,
      charges: {
        ...prev.charges,
        [key]: amount,
      },
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
          serialNumber: "",
          quantity: 1,
          rate: 0,
          taxPercent: 0,
          hsnSac: "",
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
                key === "description" || key === "hsnSac" || key === "serialNumber"
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
      :root{
        --ink:#0f2321;
        --muted:#2f4b48;
        --line:#d4ebe8;
        --accent:#0f8682;
      }
      *{ box-sizing:border-box; }
      body{
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        color:var(--ink); margin:0; background:#eef9f8;
      }
      .invoice-container{
        max-width:1000px; margin:24px auto; padding:24px; background:#fff; border:1px solid var(--line); border-radius:18px;
        box-shadow: 0 10px 24px rgba(15,134,130,.12);
      }
      .invoice-header{
        display:flex; gap:24px; align-items:center; border-bottom:2px solid var(--line); padding-bottom:16px;
      }
      .invoice-header .brand{ display:flex; gap:16px; align-items:center; flex:1; }
      .invoice-header .brand-logo{ width:96px; height:96px; border:1px solid var(--line); border-radius:12px; display:flex; align-items:center; justify-content:center; background:#f2f9f8; overflow:hidden; }
      .invoice-header .brand-logo img{ max-width:100%; max-height:100%; object-fit:contain; }
      .invoice-header .brand h1{ font-size:22px; margin:0 0 4px; letter-spacing:.2px; }
      .invoice-header .brand .sub{ color:var(--muted); font-size:13px; }
      .invoice-header .meta{ text-align:right; }
      .invoice-header .meta h2{ margin:0; font-size:24px; }
      .invoice-header .meta .small{ color:var(--muted); font-size:12px; }
      .invoice-header .badge{ display:inline-block; padding:4px 10px; border:1px dashed var(--accent); color:var(--accent); border-radius:999px; font-size:12px; font-weight:600; margin-bottom:8px; }
      .invoice-template .grid{ display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin:18px 0 0; }
      .invoice-template .card{ border:1px solid var(--line); border-radius:12px; padding:14px; background:#fff; }
      .invoice-template .card h3{ margin:0 0 8px; font-size:14px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); }
      .invoice-template .card p{ margin:2px 0; font-size:14px; }
      .invoice-template table{ width:100%; border-collapse:collapse; }
      .invoice-template table.items{ margin-top:18px; font-size:14px; }
      .invoice-template table.items th,
      .invoice-template table.items td{ padding:10px 12px; border-bottom:1px solid var(--line); }
      .invoice-template table.items thead th{ text-align:left; font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; background:#f2f9f8; }
      .invoice-template table.items .right{ text-align:right; }
      .invoice-template table.items tfoot td{ font-weight:600; }
      .invoice-template .totals{ margin-top:18px; display:grid; grid-template-columns: 1fr minmax(260px, 30%); gap:16px; align-items:start; }
      .invoice-template .amount-block{ margin-top:18px; border:1px solid var(--line); border-radius:12px; padding:14px; background:#fff; }
      .invoice-template .amount-block h3{ margin:0 0 6px; font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); }
      .invoice-template .amount-block p{ margin:0; font-weight:600; font-size:15px; }
      .invoice-template .box{ border:1px solid var(--line); border-radius:12px; padding:14px; background:#fff; }
      .invoice-template .box table{ width:100%; border-collapse:collapse; font-size:14px; }
      .invoice-template .box td{ padding:6px 0; }
      .invoice-template .box .total-label,
      .invoice-template .box .total-value{ border-top:1px solid var(--line); font-weight:700; padding-top:10px; }
      .invoice-template .box .grand{ font-size:18px; font-weight:800; }
      .invoice-template .qr-row{ display:flex; gap:12px; align-items:center; margin-top:12px; }
      .invoice-template .qr{ width:120px; height:120px; border:1px dashed var(--line); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:11px; color:var(--muted); overflow:hidden; }
      .invoice-template .qr img{ width:100%; height:100%; object-fit:cover; }
      .invoice-template .muted{ color:var(--muted); font-size:12px; }
      .invoice-template .notes{ margin-top:12px; font-size:12px; color:var(--muted); }
      .invoice-template .notes div{ margin-bottom:4px; }
      .invoice-template .actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:16px; }
      .invoice-template .btn{ border:1px solid var(--line); background:#fff; padding:10px 14px; border-radius:10px; cursor:pointer; font-weight:600; }
      .invoice-template .btn.primary{ background:var(--accent); color:#fff; border-color:transparent; }
      .invoice-template .preview-attachments{ margin-top:16px; font-size:12px; }
      .invoice-template .preview-attachments ul{ margin:8px 0 0; padding-left:18px; }
      @media print{
        body{ background:#fff; }
        .invoice-container{ box-shadow:none; border:none; margin:0; border-radius:0; }
        .invoice-template .actions{ display:none; }
        a[href]:after{ content:"" !important; }
      }
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
        const defaults = cloneInvoice(DEFAULT_INVOICE);
        const normalizedCurrency = parsed.invoice.currency
          ? parsed.invoice.currency.toUpperCase()
          : DEFAULT_INVOICE.currency;
        const mergedLineItems = (parsed.invoice.lineItems ?? []).map((item) => ({
          ...item,
          id: item.id || createId(),
          hsnSac: item.hsnSac ?? "",
        }));
        setInvoice({
          ...defaults,
          ...parsed.invoice,
          invoiceTime: parsed.invoice.invoiceTime ?? defaults.invoiceTime,
          qrType: parsed.invoice.qrType ?? defaults.qrType,
          irn: parsed.invoice.irn ?? defaults.irn,
          paymentSummary:
            parsed.invoice.paymentSummary ?? defaults.paymentSummary,
          amountInWords:
            parsed.invoice.amountInWords ?? defaults.amountInWords,
          currency: CURRENCY_CODE_SET.has(normalizedCurrency)
            ? normalizedCurrency
            : DEFAULT_INVOICE.currency,
          gstTreatment:
            parsed.invoice.gstTreatment === "inter"
              ? "inter"
              : defaults.gstTreatment,
          placeOfSupply: parsed.invoice.placeOfSupply ?? defaults.placeOfSupply,
          ewayBill: parsed.invoice.ewayBill ?? defaults.ewayBill,
          charges: {
            ...defaults.charges,
            ...(parsed.invoice.charges ?? {}),
          },
          qrImageDataUrl:
            Object.prototype.hasOwnProperty.call(parsed.invoice, "qrImageDataUrl")
              ? parsed.invoice.qrImageDataUrl
              : defaults.qrImageDataUrl,
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
        if (Object.prototype.hasOwnProperty.call(parsed, "logo")) {
          setLogo(parsed.logo ?? null);
        } else {
          setLogo(DEFAULT_LOGO);
        }
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
    setLogo(DEFAULT_LOGO);
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
        <div className="header-title">
          <h1>Invoice Architect</h1>
          <span className="theme-badge">Croma Theme</span>
        </div>
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
              Issue Time
              <input
                type="time"
                step={1}
                value={invoice.invoiceTime}
                onChange={(event) =>
                  handleInvoiceFieldChange("invoiceTime", event.target.value)
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
            <label>
              QR Badge Label
              <input
                value={invoice.qrType}
                onChange={(event) =>
                  handleInvoiceFieldChange("qrType", event.target.value)
                }
              />
            </label>
            <label>
              Place of Supply
              <input
                value={invoice.placeOfSupply}
                onChange={(event) =>
                  handleInvoiceFieldChange("placeOfSupply", event.target.value)
                }
              />
            </label>
            <label>
              GST Treatment
              <select
                value={invoice.gstTreatment}
                onChange={(event) =>
                  handleInvoiceFieldChange(
                    "gstTreatment",
                    event.target.value === "inter" ? "inter" : "intra"
                  )
                }
              >
                <option value="intra">Intra-state (CGST + SGST)</option>
                <option value="inter">Inter-state (IGST)</option>
              </select>
            </label>
            <label>
              E-Way Bill No.
              <input
                value={invoice.ewayBill}
                onChange={(event) =>
                  handleInvoiceFieldChange("ewayBill", event.target.value)
                }
              />
            </label>
            <label>
              IRN
              <input
                value={invoice.irn}
                onChange={(event) =>
                  handleInvoiceFieldChange("irn", event.target.value)
                }
              />
            </label>
            <label className="full">
              Payment Summary
              <textarea
                value={invoice.paymentSummary}
                onChange={(event) =>
                  handleInvoiceFieldChange(
                    "paymentSummary",
                    event.target.value
                  )
                }
                rows={2}
              />
            </label>
            <label className="full">
              Amount in Words
              <textarea
                value={invoice.amountInWords}
                onChange={(event) =>
                  handleInvoiceFieldChange(
                    "amountInWords",
                    event.target.value
                  )
                }
                rows={2}
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
                Alternate Phone
                <input
                  value={invoice.company.phoneAlt}
                  onChange={(event) =>
                    handleCompanyChange("phoneAlt", event.target.value)
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
                CIN
                <input
                  value={invoice.company.taxId}
                  onChange={(event) =>
                    handleCompanyChange("taxId", event.target.value)
                  }
                />
              </label>
              <label>
                GSTIN
                <input
                  value={invoice.company.gstin}
                  onChange={(event) =>
                    handleCompanyChange("gstin", event.target.value)
                  }
                />
              </label>
              <label>
                State
                <input
                  value={invoice.company.state}
                  onChange={(event) =>
                    handleCompanyChange("state", event.target.value)
                  }
                />
              </label>
              <label>
                State Code
                <input
                  value={invoice.company.stateCode}
                  onChange={(event) =>
                    handleCompanyChange("stateCode", event.target.value)
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
              <div className="logo-actions">
                <label className="file-input">
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </label>
                {logo ? (
                  <button
                    type="button"
                    onClick={() => setLogo(null)}
                    className="ghost"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
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
                Alternate Phone
                <input
                  value={invoice.client.phoneAlt}
                  onChange={(event) =>
                    handleClientChange("phoneAlt", event.target.value)
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
                PAN
                <input
                  value={invoice.client.taxId}
                  onChange={(event) =>
                    handleClientChange("taxId", event.target.value)
                  }
                />
              </label>
              <label>
                GSTIN
                <input
                  value={invoice.client.gstin}
                  onChange={(event) =>
                    handleClientChange("gstin", event.target.value)
                  }
                />
              </label>
              <label>
                State
                <input
                  value={invoice.client.state}
                  onChange={(event) =>
                    handleClientChange("state", event.target.value)
                  }
                />
              </label>
              <label>
                State Code
                <input
                  value={invoice.client.stateCode}
                  onChange={(event) =>
                    handleClientChange("stateCode", event.target.value)
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
            <h3>Additional Charges</h3>
            <div className="grid">
              <label>
                Shipping
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={invoice.charges.shipping}
                  onChange={(event) =>
                    handleChargeChange("shipping", event.target.value)
                  }
                />
              </label>
              <label>
                Wrapping
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={invoice.charges.wrapping}
                  onChange={(event) =>
                    handleChargeChange("wrapping", event.target.value)
                  }
                />
              </label>
              <label>
                Donation
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={invoice.charges.donation}
                  onChange={(event) =>
                    handleChargeChange("donation", event.target.value)
                  }
                />
              </label>
            </div>
          </div>

          <div className="panel">
            <h3>Line Items</h3>
            <div className="table-scroll">
              <table className="line-items">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Serial No.</th>
                    <th>HSN/SAC</th>
                    <th className="numeric">Qty</th>
                    <th className="numeric">Rate</th>
                    <th className="numeric">GST %</th>
                    <th className="numeric">Taxable Value</th>
                    <th className="numeric">GST Amount</th>
                    <th className="numeric">Line Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => {
                    const taxableValue = item.quantity * item.rate;
                    const gstAmount =
                      (taxableValue * Math.max(item.taxPercent, 0)) / 100;
                    const lineTotal = taxableValue + gstAmount;
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
                            value={item.serialNumber ?? ""}
                            onChange={(event) =>
                              updateLineItem(
                                item.id,
                                "serialNumber",
                                event.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={item.hsnSac}
                            onChange={(event) =>
                              updateLineItem(item.id, "hsnSac", event.target.value)
                          }
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
                        {formatCurrency(taxableValue)}
                      </td>
                      <td className="numeric">
                        {formatCurrency(gstAmount)}
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
            </div>
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
          <div className="invoice-template">
            <div className="invoice-container">
              <header className="invoice-header">
                <div className="brand">
                  <div className="brand-logo">
                    {logo ? (
                      <img src={logo} alt="Company logo" />
                    ) : (
                      <span>Logo</span>
                    )}
                  </div>
                  <div>
                    <h1 id="companyName">{invoice.company.name || "—"}</h1>
                    <div className="sub" id="companySub">
                      {companyMetaLine || "—"}
                    </div>
                  </div>
                </div>
                <div className="meta">
                  <div className="badge" id="qrType">
                    {invoice.qrType || "QR"}
                  </div>
                  <h2>{invoice.title || "Invoice"}</h2>
                  <div className="small">
                    No: <span id="invNo">{invoice.invoiceNumber || "—"}</span>
                  </div>
                  <div className="small">
                    Date: <span id="invDate">{invoice.issueDate || "—"}</span>{" "}
                    {invoice.invoiceTime ? (
                      <span id="invTime">at {invoice.invoiceTime}</span>
                    ) : (
                      <span id="invTime" />
                    )}
                  </div>
                  <div className="small">
                    Place of Supply: <span id="pos">{invoice.placeOfSupply || "—"}</span>
                  </div>
                </div>
              </header>

              <section className="grid">
                <div className="card">
                  <h3>Bill From</h3>
                  <p id="billFrom">
                    {invoice.company.address
                      ? invoice.company.address.split("\n").map((line, index) => (
                          <span key={`from-${index}`}>
                            {line}
                            <br />
                          </span>
                        ))
                      : "—"}
                  </p>
                  <p className="muted">
                    Phone: <span id="phonePrimary">{companyPhoneLine || "—"}</span>
                  </p>
                  <p className="muted">
                    Email: <span id="email">{invoice.company.email || "—"}</span>
                  </p>
                </div>
                <div className="card">
                  <h3>Bill To</h3>
                  <p id="custName">
                    <strong>{invoice.client.name || "—"}</strong>
                  </p>
                  <p id="custAddress">
                    {invoice.client.address
                      ? invoice.client.address.split("\n").map((line, index) => (
                          <span key={`to-${index}`}>
                            {line}
                            <br />
                          </span>
                        ))
                      : "—"}
                  </p>
                  <p className="muted">
                    Mobile: <span id="custMobile">{clientPhoneLine || "—"}</span>
                  </p>
                </div>
              </section>

              <table className="items" id="itemsTable">
                <thead>
                  <tr>
                    <th style={{ width: "42%" }}>Description</th>
                    <th>HSN</th>
                    <th className="right">Qty</th>
                    <th className="right">Taxable ({currencySymbol})</th>
                    <th className="right">Tax ({currencySymbol})</th>
                    <th className="right">Total ({currencySymbol})</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.length > 0 ? (
                    invoice.lineItems.map((item) => {
                      const taxableValue = item.quantity * item.rate;
                      const gstAmount =
                        (taxableValue * Math.max(item.taxPercent, 0)) / 100;
                      const lineTotal = taxableValue + gstAmount;
                      return (
                        <tr key={item.id}>
                          <td>
                            {item.description || "—"}
                            {item.serialNumber ? (
                              <span className="muted">
                                {" "}(SN: {item.serialNumber})
                              </span>
                            ) : null}
                          </td>
                          <td>{item.hsnSac || "—"}</td>
                          <td className="right">{formatQuantity(item.quantity)}</td>
                          <td className="right">{formatAmount(taxableValue)}</td>
                          <td className="right">{formatAmount(gstAmount)}</td>
                          <td className="right">{formatAmount(lineTotal)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="muted">
                        Add line items to populate the invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="right">
                      Sub-Total
                    </td>
                    <td className="right" id="subtotalTaxable">
                      {formatAmount(totals.subtotal)}
                    </td>
                    <td className="right" id="subtotalTax">
                      {formatAmount(totals.tax)}
                    </td>
                    <td className="right" id="subtotalTotal">
                      {formatAmount(totals.subtotal + totals.tax)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="totals">
                <div className="box">
                  <h3>Tax Summary</h3>
                  <table id="taxSummaryTable">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th className="right">Rate</th>
                        <th className="right">Taxable ({currencySymbol})</th>
                        <th className="right">Tax ({currencySymbol})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTaxSummary.length > 0 ? (
                        sortedTaxSummary.map((row, index) => (
                          <tr key={`${row.type}-${row.rate}-${index}`}>
                            <td>{row.type}</td>
                            <td className="right">{formatQuantity(row.rate)}%</td>
                            <td className="right">
                              {formatAmount(row.taxable)}
                            </td>
                            <td className="right">{formatAmount(row.tax)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="muted">
                            No taxable items yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="box">
                  <table>
                    <tbody>
                      <tr>
                        <td>Shipping</td>
                        <td className="right" id="ship">
                          {formatCurrency(invoice.charges.shipping)}
                        </td>
                      </tr>
                      <tr>
                        <td>Wrapping</td>
                        <td className="right" id="wrap">
                          {formatCurrency(invoice.charges.wrapping)}
                        </td>
                      </tr>
                      <tr>
                        <td>Donation</td>
                        <td className="right" id="don">
                          {formatCurrency(invoice.charges.donation)}
                        </td>
                      </tr>
                      <tr>
                        <td className="total-label">Total Tax</td>
                        <td className="right total-value" id="totalTax">
                          {formatCurrency(totals.tax)}
                        </td>
                      </tr>
                      <tr>
                        <td className="grand">Grand Total</td>
                        <td className="right grand" id="grand">
                          {formatCurrency(totals.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="qr-row">
                    <div className="qr" id="qrBox">
                      {invoice.qrImageDataUrl ? (
                        <img src={invoice.qrImageDataUrl} alt="QR code" />
                      ) : (
                        "QR"
                      )}
                    </div>
                    <div>
                      <div className="muted">
                        IRN: <span id="irn">{invoice.irn || "—"}</span>
                      </div>
                      <div className="muted">
                        Payment: <span id="paySummary">{paymentSummaryText}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="amount-block">
                <h3>Amount in Words</h3>
                <p id="amountWords">{amountInWordsDisplay}</p>
              </div>

              <div className="notes" id="notes">
                {noteLines.length > 0 ? (
                  noteLines.map((line, index) => (
                    <div key={`note-${index}`}>• {line}</div>
                  ))
                ) : (
                  <div className="muted">Add notes to display additional details.</div>
                )}
              </div>

              <div className="invoice-actions">
                <button
                  className="invoice-btn"
                  type="button"
                  onClick={downloadPdf}
                >
                  Print / Save PDF
                </button>
                <button
                  className="invoice-btn primary"
                  type="button"
                  onClick={exportTemplate}
                >
                  Download JSON
                </button>
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
