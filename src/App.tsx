import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import "./App.css";

const client = generateClient<Schema>();

type Todo = Schema["Todo"]["type"];

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isComposerOpen) {
      inputRef.current?.focus();
    }
  }, [isComposerOpen]);

  const orderedTodos = useMemo(
    () =>
      [...todos].sort((first, second) => {
        const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
        const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;

        return secondDate - firstDate;
      }),
    [todos],
  );

  function openComposer() {
    setComposerOpen(true);
  }

  function resetComposer() {
    setComposerOpen(false);
    setDraft("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    await client.models.Todo.create({ content: trimmed });
    resetComposer();
  }

  return (
    <div className="aurora-shell">
      <main className="assistant-shell" role="main">
        <header className="assistant-header">
          <div className="assistant-orb" aria-hidden="true">
            <span className="assistant-orb__glow" />
            <span className="assistant-orb__pulse" />
            <span className="assistant-orb__core">☁️</span>
          </div>
          <div className="assistant-title">
            <p className="assistant-eyebrow">AWS Resource Explorer</p>
            <h1>Let&apos;s orchestrate your cloud day.</h1>
            <p className="assistant-subtitle">
              I&apos;m ready with curated insights, todo captures, and a gentle nudge toward clarity.
              Add a new intent or review the latest discoveries below.
            </p>
          </div>
        </header>

        <section className="assistant-status" aria-live="polite">
          <div className="assistant-wave" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p>
            Listening for your next request <span className="assistant-dot" /> synced in real-time
          </p>
        </section>

        <section className="assistant-panels">
          <article className="assistant-panel">
            <div className="assistant-panel__header">
              <div>
                <p className="assistant-panel__eyebrow">Recent prompts</p>
                <h2 className="assistant-panel__title">Captured insights</h2>
              </div>
              <button type="button" className="assistant-panel__action" onClick={openComposer}>
                <span className="assistant-panel__actionWave" aria-hidden="true" />
                <span>Create new</span>
              </button>
            </div>
            <ul className="assistant-list" aria-live="polite">
              {orderedTodos.length === 0 ? (
                <li className="assistant-empty">
                  <span role="img" aria-hidden="true">
                    ✨
                  </span>
                  Start the conversation with a fresh ask. I&apos;ll archive every insight right here.
                </li>
              ) : (
                orderedTodos.map((todo) => (
                  <li className="assistant-item" key={todo.id}>
                    <div className="assistant-item__pulse" aria-hidden="true" />
                    <div>
                      <p className="assistant-item__content">{todo.content}</p>
                      {todo.createdAt && (
                        <p className="assistant-item__meta">
                          logged {new Date(todo.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </article>
        </section>

        <button
          type="button"
          className="assistant-fab"
          onClick={openComposer}
          aria-haspopup="dialog"
          aria-expanded={isComposerOpen}
          aria-controls="assistant-composer"
        >
          <span className="assistant-fab__waves" aria-hidden="true" />
          <span className="assistant-fab__icon" role="img" aria-label="Microphone">
            🎙️
          </span>
          <span className="assistant-fab__label">New</span>
        </button>

        <div
          id="assistant-composer"
          className={`assistant-composer ${isComposerOpen ? "is-open" : ""}`}
          role="dialog"
          aria-modal={isComposerOpen}
          aria-hidden={!isComposerOpen}
          aria-label="Create a new todo"
        >
          <form className="assistant-composer__form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              name="todo"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="What should we remember?"
              autoComplete="off"
            />
            <div className="assistant-composer__actions">
              <button type="button" onClick={resetComposer} className="assistant-composer__ghost">
                Cancel
              </button>
              <button type="submit" disabled={!draft.trim()} className="assistant-composer__primary">
                Add note
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
