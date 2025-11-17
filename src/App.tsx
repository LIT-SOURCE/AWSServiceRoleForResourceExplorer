import { FormEvent, useMemo, useState } from "react";
import "./App.css";

const USPS_TRACKING_URL =
  "https://tools.usps.com/go/TrackConfirmAction?tLabels=";
const USPS_VALIDATION = /^[A-Za-z0-9]{10,34}$/;

const sampleTrackingNumbers = [
  { label: "Priority Mail", value: "9405509699937137429830" },
  { label: "Certified Mail", value: "9214490285280400000000" },
  { label: "Global Express Guaranteed", value: "82AA000000000" },
];

type HistoryEntry = {
  value: string;
  timestamp: string;
};

function App() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const helperMessage = useMemo(() => {
    if (!trackingNumber.trim()) {
      return "Paste or type your USPS® tracking number to begin.";
    }

    if (!USPS_VALIDATION.test(cleanTrackingNumber(trackingNumber))) {
      return "USPS numbers are typically 10-34 letters or digits with no spaces.";
    }

    return "Looks good! Use the button below to jump straight to USPS.com.";
  }, [trackingNumber]);

  function cleanTrackingNumber(value: string) {
    return value.replace(/\s+/g, "").toUpperCase();
  }

  function openTrackingWindow(value: string) {
    window.open(
      `${USPS_TRACKING_URL}${encodeURIComponent(value)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate = cleanTrackingNumber(trackingNumber);

    if (!candidate) {
      setError("Enter a tracking number before checking the status.");
      return;
    }

    if (!USPS_VALIDATION.test(candidate)) {
      setError(
        "That doesn't look like a USPS tracking number. Remove spaces and punctuation."
      );
      return;
    }

    setError(null);
    setHistory((prev) => {
      const nextEntries = [
        { value: candidate, timestamp: new Date().toISOString() },
        ...prev.filter((entry) => entry.value !== candidate),
      ];
      return nextEntries.slice(0, 5);
    });

    openTrackingWindow(candidate);
  }

  function handleSampleClick(value: string) {
    setTrackingNumber(value);
    setError(null);
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">USPS® helper</p>
        <h1>Tracking number checker</h1>
        <p>
          Validate your tracking number locally and jump straight to
          USPS.com to see the latest scan events in one click.
        </p>
      </header>

      <main className="tracker">
        <section className="panel">
          <form className="tracking-form" onSubmit={handleSubmit}>
            <label htmlFor="tracking-input">Tracking number</label>
            <div className="input-group">
              <input
                id="tracking-input"
                name="trackingNumber"
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 9400 1234 5678 9012 3456 78"
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
              />
              <button type="submit">Check on USPS.com</button>
            </div>
            <p className="helper">{helperMessage}</p>
            {error && <p className="error">{error}</p>}
          </form>

          <div className="sample-numbers">
            <p>Need an example? Try one of these sample formats:</p>
            <div className="sample-buttons">
              {sampleTrackingNumbers.map((sample) => (
                <button
                  key={sample.value}
                  type="button"
                  className="secondary"
                  onClick={() => handleSampleClick(sample.value)}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="panel history-panel">
          <h2>Recent lookups</h2>
          {history.length === 0 ? (
            <p className="muted">
              Every time you submit a tracking number we keep it here so you
              can revisit USPS.com in a single tap.
            </p>
          ) : (
            <ul>
              {history.map((entry) => (
                <li key={entry.timestamp}>
                  <span className="tracking-value">{entry.value}</span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => openTrackingWindow(entry.value)}
                  >
                    View on USPS.com
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer>
        <p>
          This utility simply validates the format of a USPS tracking number
          and routes you to the official tracking page at
          <a
            href="https://www.usps.com/"
            target="_blank"
            rel="noreferrer"
          >
            USPS.com
          </a>
          .
        </p>
      </footer>
    </div>
  );
}

export default App;
