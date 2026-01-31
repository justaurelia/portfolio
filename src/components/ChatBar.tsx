import { useState, useRef, useEffect } from "react";
import { getOrCreateSessionId } from "../lib/sessionId";

type BestSource = { title: string; url: string; type: "case-study" | "timeline" | "github" | "contact" | "prompt" };

function pillToBestSource(p: { label: string; url: string }): BestSource {
  let type: BestSource["type"] = "case-study";
  if (p.url.startsWith("prompt:")) type = "prompt";
  else if (p.url.startsWith("mailto:")) type = "contact";
  else if (p.url === "/about" || p.label === "Timeline") type = "timeline";
  else if (/github\.com/i.test(p.url)) type = "github";
  else if (/linkedin\.com|cal\.com|tel:/i.test(p.url)) type = "contact";
  return { title: p.label, url: p.url, type };
}

type Message = {
  role: "user" | "assistant";
  content: string;
  bestSources?: BestSource[];
};

/** Split long text into sentences (at . ! ? followed by space and capital letter). */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** When there's only one long block, break it into paragraphs of 2 sentences so it's readable. */
function ensureParagraphs(blocks: string[], minLengthForSplit = 180): string[] {
  if (blocks.length !== 1 || blocks[0].length < minLengthForSplit) return blocks;
  const sentences = splitIntoSentences(blocks[0]);
  if (sentences.length <= 1) return blocks;
  const out: string[] = [];
  const sentencesPerParagraph = 2;
  for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
    out.push(sentences.slice(i, i + sentencesPerParagraph).join(" "));
  }
  return out;
}

/** Renders message content. Assistant: paragraphs, bold, links, line breaks. */
function MessageContent({ content, role }: { content: string; role: Message["role"] }) {
  if (role === "user") {
    return <>{content}</>;
  }
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const normalized = escaped.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let paragraphs = normalized.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  paragraphs = ensureParagraphs(paragraphs);
  const extLinkClass =
    'class="underline text-powderBlue hover:text-powderBlue/90" target="_blank" rel="noopener noreferrer"';
  const formatted = paragraphs
    .map((p) => {
      let s = p;
      s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      s = s.replace(
        /\[([^\]]+)\]\((\/[^)]*)\)/g,
        '<a href="$2" class="underline text-powderBlue hover:text-powderBlue/90" target="_self" rel="noopener">$1</a>'
      );
      // Raw http(s) URLs -> open in new tab
      s = s.replace(
        /(https?:\/\/[^\s<>"']+)/g,
        `<a href="$1" ${extLinkClass}>$1</a>`
      );
      // Email -> mailto
      s = s.replace(
        /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
        '<a href="mailto:$1" class="underline text-powderBlue hover:text-powderBlue/90">$1</a>'
      );
      // Phone (e.g. +1(925)915-2274 or 925-915-2274) -> tel
      s = s.replace(
        /(\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g,
        (match) => {
          const digits = match.replace(/\D/g, "");
          const tel = match.startsWith("+") ? `+${digits}` : digits;
          return `<a href="tel:${tel}" class="underline text-powderBlue hover:text-powderBlue/90">${match}</a>`;
        }
      );
      s = s.replace(/\n/g, "<br />");
      return `<p class="mb-2 text-[15px] leading-relaxed">${s}</p>`;
    })
    .join("");
  return (
    <div
      className="message-content [&>p:last-child]:mb-0"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  );
}

function SourcePill({
  source,
  onClick,
  onPrompt,
}: {
  source: BestSource;
  onClick: () => void;
  onPrompt?: (prompt: string) => void;
}) {
  const isPrompt = source.url.startsWith("prompt:");
  const isExternal = source.url.startsWith("http://") || source.url.startsWith("https://");
  const openNewTab = isExternal;
  const label =
    source.type === "prompt"
      ? source.title
      : source.type === "timeline"
        ? "Timeline"
        : source.type === "github"
          ? `GitHub · ${source.title}`
          : source.type === "contact"
            ? source.title
            : isExternal
              ? `Website · ${source.title}`
              : `Case study · ${source.title}`;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
    
    if (isPrompt) {
      const prompt = source.url.replace(/^prompt:/, "");
      if (onPrompt) onPrompt(prompt);
    } else if (openNewTab) {
      window.open(source.url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = source.url;
    }
  };
  
  return (
    <a
      href={isPrompt ? "#" : source.url}
      target={openNewTab ? "_blank" : "_self"}
      rel={openNewTab ? "noopener noreferrer" : "noopener"}
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-porcelain/30 bg-porcelain/10 px-3 py-1.5 text-[13px] text-porcelain hover:bg-porcelain/20 hover:border-porcelain/50 transition-colors"
    >
      <span aria-hidden>→</span>
      {label}
    </a>
  );
}

const PROPOSITIONS = [
  "What drives your product decisions?",
  "Tell me about a case study.",
  "What's your startup journey?",
  "How do you approach product philosophy?",
  "What are you building right now?",
  "What's your take on AI in product?",
];

const TYPING_INTERVAL_MS = 80;
const PAUSE_AFTER_FULL_MS = 1500;

export default function ChatBar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [propositionIndex, setPropositionIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [clickedPillUrls, setClickedPillUrls] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickedPillUrlsRef = useRef(clickedPillUrls);
  const prevLoadingRef = useRef(loading);
  clickedPillUrlsRef.current = clickedPillUrls;

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (prevLoadingRef.current === true && loading === false) {
      inputRef.current?.focus();
    }
    prevLoadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (isFocused) return;

    const full = PROPOSITIONS[propositionIndex];
    const isComplete = typedLength >= full.length;

    if (isComplete) {
      const id = setTimeout(() => {
        setPropositionIndex((i) => (i + 1) % PROPOSITIONS.length);
        setTypedLength(0);
      }, PAUSE_AFTER_FULL_MS);
      return () => clearTimeout(id);
    }

    const id = setInterval(() => {
      setTypedLength((n) => Math.min(n + 1, full.length));
    }, TYPING_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isFocused, propositionIndex, typedLength]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          session_id: getOrCreateSessionId(),
          page_path: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      let reply: string;
      let bestSources: BestSource[] = [];
      if (res.ok && typeof data?.reply === "string") {
        reply = data.reply;
        const raw = data.pills ?? [];
        const clicked = clickedPillUrlsRef.current;
        bestSources = (Array.isArray(raw) ? raw : [])
          .filter(
            (p: unknown) =>
              p && typeof (p as { label: string; url: string }).label === "string" && typeof (p as { label: string; url: string }).url === "string"
          )
          .map((p: { label: string; url: string }) => pillToBestSource(p))
          .filter((s) => !clicked.has(s.url));
      } else if (!res.ok && typeof data?.error === "string") {
        reply = data.error;
      } else {
        reply = "Sorry, I couldn't get a response. Please try again.";
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          bestSources: bestSources.length > 0 ? bestSources : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong on my side. Please check your connection and try again.",
          bestSources: undefined,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  };

  const sendPrompt = async (prompt: string) => {
    await sendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Message list - fills available height */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto scrollbar-transparent py-0 px-1 pb-4 flex flex-col gap-3"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] flex flex-col ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`w-full py-2.5 px-3.5 rounded-2xl text-[15px] leading-normal ${
                m.role === "user"
                  ? "self-end bg-powderBlue text-inkBlack"
                  : "self-start bg-porcelain/15 text-porcelain border border-porcelain/15"
              }`}
            >
              <MessageContent content={m.content} role={m.role} />
            </div>
            {m.role === "assistant" && m.bestSources && m.bestSources.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {m.bestSources.map((source) => (
                  <SourcePill
                    key={source.url}
                    source={source}
                    onClick={() =>
                      setClickedPillUrls((prev) => new Set(prev).add(source.url))
                    }
                    onPrompt={sendPrompt}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="self-start py-2.5 px-3.5 rounded-2xl text-[15px] bg-porcelain/15 text-porcelain/70 border border-porcelain/15 inline-flex gap-0.5">
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
          </div>
        )}
      </div>

      {/* Chat input: palette background, porcelain border, powderBlue focus */}
      <div className="flex items-center gap-3 mt-2 py-3 px-4 rounded-3xl border border-porcelain/[0.12] bg-yaleBlue/40 focus-within:border-powderBlue transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setTypedLength(0);
          }}
          placeholder={
            isFocused
              ? PROPOSITIONS[propositionIndex]
              : PROPOSITIONS[propositionIndex].slice(0, typedLength)
          }
          disabled={loading}
          className="chat-input flex-1 py-3.5 px-1 border-0 bg-transparent rounded-none text-[15px] text-porcelain placeholder:text-porcelain/50 outline-none focus:ring-0 focus-visible:ring-0 focus-visible:shadow-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full border-0 text-base flex-shrink-0 flex items-center justify-center disabled:cursor-not-allowed disabled:bg-porcelain/20 disabled:text-porcelain/40 bg-powderBlue text-inkBlack hover:enabled:bg-powderBlue/90 hover:enabled:brightness-110 focus-visible:ring-2 focus-visible:ring-powderBlue focus-visible:ring-offset-2 focus-visible:ring-offset-inkBlack transition-colors"
          aria-label="Send"
        >
          →
        </button>
      </div>
    </div>
  );
}
