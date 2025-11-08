import { ISO_4217_CURRENCY_CODES } from "./isoCurrencies";

export type CurrencyOption = {
  code: string;
  name: string;
};

function buildCurrencyOptions(): CurrencyOption[] {
  const codes = (() => {
    const globalIntl = Intl as typeof Intl & { supportedValuesOf?: (category: string) => string[] };
    if (typeof globalIntl.supportedValuesOf === "function") {
      try {
        const supported = globalIntl.supportedValuesOf("currency");
        if (Array.isArray(supported) && supported.length > 0) {
          return Array.from(new Set(supported.concat(ISO_4217_CURRENCY_CODES))).sort();
        }
      } catch (error) {
        console.warn("Falling back to static ISO currency list", error);
      }
    }
    return [...ISO_4217_CURRENCY_CODES].sort();
  })();

  const displayNames =
    typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["en"], { type: "currency" })
      : undefined;

  return codes.map((code) => ({
    code,
    name: (displayNames && displayNames.of(code)) || code,
  }));
}

export const CURRENCY_OPTIONS: CurrencyOption[] = buildCurrencyOptions();
export const CURRENCY_CODE_SET = new Set(CURRENCY_OPTIONS.map((option) => option.code));
