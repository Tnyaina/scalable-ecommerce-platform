import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  KeyboardEvent,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InputVariant = "default" | "search" | "password" | "tags" | "phone";
type InputState = "default" | "error" | "success" | "disabled";
type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface TagItem {
  id: string;
  label: string;
}

export interface PhoneDialCode {
  flag: string;
  code: string;
  country: string;
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "size"> {
  /** Libellé affiché au-dessus du champ */
  label?: string;
  /** Texte d'aide sous le champ */
  hint?: string;
  /** Message d'erreur (active l'état error) */
  error?: string;
  /** Active l'état succès */
  success?: boolean;
  /** Icône à gauche (ReactNode) */
  iconLeft?: ReactNode;
  /** Icône à droite (ReactNode) */
  iconRight?: ReactNode;
  /** Préfixe texte (ex: "https://") */
  prefix?: string;
  /** Suffixe texte (ex: ".com") */
  suffix?: string;
  /** Afficher un compteur de caractères (nécessite maxLength) */
  showCount?: boolean;
  /** Variante du champ */
  variant?: InputVariant;
  /** Indicatif téléphonique (variant="phone") */
  dialCodes?: PhoneDialCode[];
  /** Valeur initiale de l'indicatif sélectionné */
  defaultDialCode?: string;
  /** Callback quand l'indicatif change */
  onDialChange?: (dial: PhoneDialCode) => void;
  /** Tags actuels (variant="tags") */
  tags?: TagItem[];
  /** Callback ajout de tag */
  onTagAdd?: (tag: TagItem) => void;
  /** Callback suppression de tag */
  onTagRemove?: (id: string) => void;
  /** Afficher la barre de force du mot de passe (variant="password") */
  showStrength?: boolean;
  /** Classe CSS additionnelle sur le wrapper */
  className?: string;
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  success?: boolean;
  showCount?: boolean;
  className?: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  success?: boolean;
  children: ReactNode;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 8);

function getStrength(value: string): StrengthLevel {
  if (!value) return 0;
  let s = 0;
  if (value.length >= 8) s++;
  if (/[A-Z]/.test(value)) s++;
  if (/[0-9]/.test(value)) s++;
  if (/[^A-Za-z0-9]/.test(value)) s++;
  return s as StrengthLevel;
}

const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  0: "—",
  1: "Faible",
  2: "Moyen",
  3: "Fort",
  4: "Très fort",
};

const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  0: "transparent",
  1: "var(--input-error)",
  2: "#e67e22",
  3: "#f1c40f",
  4: "var(--input-success)",
};

const DEFAULT_DIALS: PhoneDialCode[] = [
  { flag: "🇫🇷", code: "+33", country: "France" },
  { flag: "🇧🇪", code: "+32", country: "Belgique" },
  { flag: "🇨🇭", code: "+41", country: "Suisse" },
  { flag: "🇲🇬", code: "+261", country: "Madagascar" },
  { flag: "🇨🇦", code: "+1", country: "Canada" },
  { flag: "🇺🇸", code: "+1", country: "États-Unis" },
  { flag: "🇬🇧", code: "+44", country: "Royaume-Uni" },
  { flag: "🇩🇪", code: "+49", country: "Allemagne" },
];

// ─── Styles (CSS-in-JS via style tag injected once) ──────────────────────────

const CSS = `
  .inp-root { display: flex; flex-direction: column; gap: 5px; font-family: 'Sora', sans-serif; }
  .inp-label { font-size: 13px; font-weight: 500; color: var(--input-text, #1a1a1a); }
  .inp-hint  { font-size: 12px; color: var(--input-muted, #7a7872); margin-top: 2px; }
  .inp-error { font-size: 12px; color: var(--input-error, #c0392b); margin-top: 2px; }

  :root {
    --input-bg:       #ffffff;
    --input-border:   #e2e0da;
    --input-border-h: #c5c3bc;
    --input-border-f: #1a1a1a;
    --input-text:     #1a1a1a;
    --input-muted:    #7a7872;
    --input-ph:       #b0aea8;
    --input-surface:  #f0ede7;
    --input-disabled: #f4f2ee;
    --input-error:    #c0392b;
    --input-success:  #1e7b4b;
    --input-radius:   8px;
    --input-shadow-f: rgba(26,26,26,.08);
    --input-shadow-e: rgba(192,57,43,.10);
    --input-shadow-s: rgba(30,123,75,.10);
  }

  .inp-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .inp-wrap--affix {
    display: flex;
    gap: 0;
  }

  .inp-affix {
    border: 1.5px solid var(--input-border);
    background: var(--input-surface);
    padding: 10px 12px;
    font-size: 13px;
    color: var(--input-muted);
    font-family: 'DM Mono', monospace;
    display: flex;
    align-items: center;
    white-space: nowrap;
    user-select: none;
  }
  .inp-affix--left  { border-right: none; border-radius: var(--input-radius) 0 0 var(--input-radius); }
  .inp-affix--right { border-left:  none; border-radius: 0 var(--input-radius) var(--input-radius) 0; }

  .inp-icon-left,
  .inp-icon-right {
    position: absolute;
    display: flex;
    align-items: center;
    color: var(--input-muted);
    pointer-events: none;
    font-size: 15px;
  }
  .inp-icon-left  { left: 12px; }
  .inp-icon-right { right: 12px; }
  .inp-icon-right--clickable { pointer-events: all; cursor: pointer; transition: color .15s; }
  .inp-icon-right--clickable:hover { color: var(--input-text); }

  .inp-counter {
    position: absolute;
    right: 12px;
    top: 10px;
    font-size: 11px;
    color: var(--input-muted);
    font-family: 'DM Mono', monospace;
    pointer-events: none;
  }

  /* Base field */
  .inp-field {
    width: 100%;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1.5px solid var(--input-border);
    border-radius: var(--input-radius);
    padding: 10px 14px;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    appearance: none;
    -webkit-appearance: none;
  }
  .inp-field::placeholder { color: var(--input-ph); }
  .inp-field:hover:not(:disabled) { border-color: var(--input-border-h); }
  .inp-field:focus { border-color: var(--input-border-f); box-shadow: 0 0 0 3px var(--input-shadow-f); }
  .inp-field:disabled { background: var(--input-disabled); color: var(--input-muted); cursor: not-allowed; border-color: #e8e6e1; }

  .inp-field--has-left  { padding-left: 38px; }
  .inp-field--has-right { padding-right: 38px; }
  .inp-field--has-count { padding-right: 52px; }

  .inp-field--error   { border-color: var(--input-error) !important; background: #fff8f8; }
  .inp-field--error:focus { box-shadow: 0 0 0 3px var(--input-shadow-e) !important; }
  .inp-field--success { border-color: var(--input-success) !important; }
  .inp-field--success:focus { box-shadow: 0 0 0 3px var(--input-shadow-s) !important; }

  /* Affix variants — square corners on the joined side */
  .inp-field--prefix { border-radius: 0 var(--input-radius) var(--input-radius) 0; }
  .inp-field--suffix { border-radius: var(--input-radius) 0 0 var(--input-radius); }
  .inp-field--both   { border-radius: 0; }

  /* Select arrow */
  .inp-select-wrap { position: relative; }
  .inp-select-wrap::after {
    content: '';
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    width: 0; height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid var(--input-muted);
  }
  .inp-select-wrap select { cursor: pointer; padding-right: 36px; }

  /* Textarea */
  .inp-textarea {
    resize: vertical;
    min-height: 88px;
    line-height: 1.6;
  }

  /* Password strength */
  .inp-strength-bar { display: flex; gap: 3px; margin-top: 5px; }
  .inp-strength-seg { height: 3px; flex: 1; border-radius: 2px; background: var(--input-border); transition: background .25s; }
  .inp-strength-label { font-size: 11px; color: var(--input-muted); font-family: 'DM Mono', monospace; margin-top: 3px; }

  /* Tag input */
  .inp-tags-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    border: 1.5px solid var(--input-border);
    border-radius: var(--input-radius);
    padding: 8px 10px;
    background: var(--input-bg);
    min-height: 44px;
    cursor: text;
    transition: border-color .15s, box-shadow .15s;
  }
  .inp-tags-wrap:focus-within { border-color: var(--input-border-f); box-shadow: 0 0 0 3px var(--input-shadow-f); }
  .inp-tags-wrap--error { border-color: var(--input-error) !important; }

  .inp-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--input-surface);
    color: #4a4842;
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 5px;
    font-weight: 500;
    font-family: 'Sora', sans-serif;
  }
  .inp-tag-remove {
    border: none;
    background: none;
    cursor: pointer;
    color: var(--input-muted);
    font-size: 14px;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color .1s;
  }
  .inp-tag-remove:hover { color: var(--input-text); }
  .inp-tags-wrap input {
    border: none;
    outline: none;
    background: none;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    color: var(--input-text);
    padding: 2px 4px;
    flex: 1;
    min-width: 80px;
  }
  .inp-tags-wrap input::placeholder { color: var(--input-ph); }

  /* Phone */
  .inp-phone-wrap { display: flex; gap: 0; position: relative; }
  .inp-dial {
    border: 1.5px solid var(--input-border);
    border-right: none;
    border-radius: var(--input-radius) 0 0 var(--input-radius);
    background: var(--input-surface);
    padding: 10px 12px;
    font-size: 13px;
    color: #4a4842;
    font-family: 'DM Mono', monospace;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
    transition: background .15s;
    position: relative;
  }
  .inp-dial:hover { background: #e8e5de; }
  .inp-phone-wrap .inp-field { border-radius: 0 var(--input-radius) var(--input-radius) 0; }

  .inp-dial-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: var(--input-bg);
    border: 1.5px solid var(--input-border);
    border-radius: var(--input-radius);
    overflow: hidden;
    z-index: 100;
    min-width: 180px;
    box-shadow: 0 4px 16px rgba(0,0,0,.08);
  }
  .inp-dial-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: background .1s;
  }
  .inp-dial-option:hover { background: var(--input-surface); }
  .inp-dial-option span:last-child { color: var(--input-muted); font-family: 'DM Mono', monospace; font-size: 12px; margin-left: auto; }
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6m0-6 6 6" />
  </svg>
);

const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconChevron = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// ─── StrengthBar ──────────────────────────────────────────────────────────────

function StrengthBar({ value }: { value: string }) {
  const level = getStrength(value);
  return (
    <>
      <div className="inp-strength-bar">
        {([1, 2, 3, 4] as const).map((i) => (
          <div
            key={i}
            className="inp-strength-seg"
            style={{ background: level >= i ? STRENGTH_COLORS[level] : undefined }}
          />
        ))}
      </div>
      <div className="inp-strength-label">{STRENGTH_LABELS[level]}</div>
    </>
  );
}

// ─── Input (principal) ────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    success,
    iconLeft,
    iconRight,
    prefix,
    suffix,
    showCount,
    variant = "default",
    dialCodes = DEFAULT_DIALS,
    defaultDialCode,
    onDialChange,
    tags = [],
    onTagAdd,
    onTagRemove,
    showStrength,
    className,
    maxLength,
    value,
    defaultValue,
    onChange,
    disabled,
    id,
    ...rest
  },
  ref
) {
  injectCSS();

  const inputId = id ?? useRef(uid()).current;
  const [localValue, setLocalValue] = useState(
    (value ?? defaultValue ?? "") as string
  );
  const [showPwd, setShowPwd] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [selectedDial, setSelectedDial] = useState<PhoneDialCode>(
    dialCodes.find((d) => d.code === defaultDialCode) ?? dialCodes[0]
  );
  const [dialOpen, setDialOpen] = useState(false);
  const tagRef = useRef<HTMLInputElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  const controlled = value !== undefined;
  const displayValue = controlled ? (value as string) : localValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!controlled) setLocalValue(e.target.value);
      onChange?.(e);
    },
    [controlled, onChange]
  );

  // Shared field classes
  const fieldCls = [
    "inp-field",
    iconLeft || variant === "search" ? "inp-field--has-left" : "",
    (iconRight || variant === "password" || variant === "search") && !showCount
      ? "inp-field--has-right"
      : "",
    showCount ? "inp-field--has-count" : "",
    error ? "inp-field--error" : "",
    success && !error ? "inp-field--success" : "",
    prefix && suffix ? "inp-field--both" : prefix ? "inp-field--prefix" : suffix ? "inp-field--suffix" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // ── TAG VARIANT ──────────────────────────────────────────────────────────
  if (variant === "tags") {
    const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const trimmed = tagInput.replace(",", "").trim();
        if (!trimmed) return;
        onTagAdd?.({ id: uid(), label: trimmed });
        setTagInput("");
      } else if (e.key === "Backspace" && !tagInput && tags.length) {
        onTagRemove?.(tags[tags.length - 1].id);
      }
    };
    return (
      <div className={`inp-root${className ? " " + className : ""}`}>
        {label && <label className="inp-label" htmlFor={inputId}>{label}</label>}
        <div
          className={`inp-tags-wrap${error ? " inp-tags-wrap--error" : ""}`}
          onClick={() => tagRef.current?.focus()}
        >
          {tags.map((t) => (
            <span key={t.id} className="inp-tag">
              {t.label}
              <button
                className="inp-tag-remove"
                type="button"
                onClick={(e) => { e.stopPropagation(); onTagRemove?.(t.id); }}
                aria-label={`Supprimer ${t.label}`}
              >×</button>
            </span>
          ))}
          <input
            ref={tagRef}
            id={inputId}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKey}
            disabled={disabled}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        </div>
        {error ? <span className="inp-error">{error}</span> : hint && <span className="inp-hint">{hint}</span>}
      </div>
    );
  }

  // ── PHONE VARIANT ────────────────────────────────────────────────────────
  if (variant === "phone") {
    return (
      <div className={`inp-root${className ? " " + className : ""}`}>
        {label && <label className="inp-label" htmlFor={inputId}>{label}</label>}
        <div className="inp-phone-wrap">
          <div
            className="inp-dial"
            ref={dialRef}
            onClick={() => setDialOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={dialOpen}
          >
            <span>{selectedDial.flag}</span>
            <span>{selectedDial.code}</span>
            <IconChevron />
            {dialOpen && (
              <div className="inp-dial-menu" role="listbox">
                {dialCodes.map((d, i) => (
                  <div
                    key={i}
                    className="inp-dial-option"
                    role="option"
                    aria-selected={d.code === selectedDial.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDial(d);
                      onDialChange?.(d);
                      setDialOpen(false);
                    }}
                  >
                    <span>{d.flag}</span>
                    <span>{d.country}</span>
                    <span>{d.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            ref={ref}
            id={inputId}
            type="tel"
            className={fieldCls}
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            maxLength={maxLength}
            {...rest}
          />
        </div>
        {error ? <span className="inp-error">{error}</span> : hint && <span className="inp-hint">{hint}</span>}
      </div>
    );
  }

  // ── PASSWORD VARIANT ──────────────────────────────────────────────────────
  const isPassword = variant === "password";
  const inputType = isPassword ? (showPwd ? "text" : "password") : rest.type ?? "text";

  // Compose right icon
  let rightIcon: ReactNode = iconRight;
  if (isPassword) {
    rightIcon = (
      <span
        className="inp-icon-right inp-icon-right--clickable"
        onClick={() => setShowPwd((v) => !v)}
        aria-label={showPwd ? "Masquer" : "Afficher"}
        role="button"
        tabIndex={0}
      >
        {showPwd ? <IconEyeOff /> : <IconEye />}
      </span>
    );
  } else if (variant === "search" && displayValue) {
    rightIcon = (
      <span
        className="inp-icon-right inp-icon-right--clickable"
        onClick={() => {
          if (!controlled) setLocalValue("");
          const synth = { target: { value: "" } } as React.ChangeEvent<HTMLInputElement>;
          onChange?.(synth);
        }}
        aria-label="Effacer"
        role="button"
        tabIndex={0}
      >
        <IconClose />
      </span>
    );
  } else if (success && !error) {
    rightIcon = (
      <span className="inp-icon-right" style={{ color: "var(--input-success)", cursor: "default" }}>
        <IconCheck />
      </span>
    );
  }

  const fieldElement = (
    <div className={prefix || suffix ? "inp-wrap inp-wrap--affix" : "inp-wrap"}>
      {prefix && <span className="inp-affix inp-affix--left">{prefix}</span>}
      {!prefix && !suffix && iconLeft && (
        <span className="inp-icon-left">{iconLeft}</span>
      )}
      <input
        ref={ref}
        id={inputId}
        type={inputType}
        className={fieldCls}
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={
          [error ? `${inputId}-error` : "", hint ? `${inputId}-hint` : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
        {...rest}
      />
      {!isPassword && !rightIcon && showCount && maxLength && (
        <span className="inp-counter">
          {displayValue.length}/{maxLength}
        </span>
      )}
      {isPassword && showCount && maxLength && (
        <span className="inp-counter" style={{ right: 36 }}>
          {displayValue.length}/{maxLength}
        </span>
      )}
      {rightIcon && !isPassword && (
        typeof rightIcon === "object" && (rightIcon as any)?.props?.className?.includes("inp-icon-right")
          ? rightIcon
          : <span className="inp-icon-right">{rightIcon}</span>
      )}
      {isPassword && rightIcon}
      {suffix && <span className="inp-affix inp-affix--right">{suffix}</span>}
    </div>
  );

  return (
    <div className={`inp-root${className ? " " + className : ""}`}>
      {label && <label className="inp-label" htmlFor={inputId}>{label}</label>}
      {fieldElement}
      {isPassword && showStrength && <StrengthBar value={displayValue} />}
      {error
        ? <span className="inp-error" id={`${inputId}-error`} role="alert">{error}</span>
        : hint && <span className="inp-hint" id={`${inputId}-hint`}>{hint}</span>}
    </div>
  );
});

// ─── Textarea ─────────────────────────────────────────────────────────────────

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, hint, error, success, showCount, className, maxLength, value, defaultValue, onChange, id, ...rest },
    ref
  ) {
    injectCSS();
    const inputId = id ?? useRef(uid()).current;
    const [localValue, setLocalValue] = useState((value ?? defaultValue ?? "") as string);
    const controlled = value !== undefined;
    const displayValue = controlled ? (value as string) : localValue;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!controlled) setLocalValue(e.target.value);
      onChange?.(e);
    };

    const cls = [
      "inp-field",
      "inp-textarea",
      showCount ? "inp-field--has-count" : "",
      error ? "inp-field--error" : "",
      success && !error ? "inp-field--success" : "",
    ].filter(Boolean).join(" ");

    return (
      <div className={`inp-root${className ? " " + className : ""}`}>
        {label && <label className="inp-label" htmlFor={inputId}>{label}</label>}
        <div className="inp-wrap" style={{ alignItems: "flex-start" }}>
          <textarea
            ref={ref}
            id={inputId}
            className={cls}
            value={displayValue}
            onChange={handleChange}
            maxLength={maxLength}
            aria-invalid={!!error}
            {...rest}
          />
          {showCount && maxLength && (
            <span className="inp-counter">{displayValue.length}/{maxLength}</span>
          )}
        </div>
        {error
          ? <span className="inp-error">{error}</span>
          : hint && <span className="inp-hint">{hint}</span>}
      </div>
    );
  }
);

// ─── Select ───────────────────────────────────────────────────────────────────

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, hint, error, success, className, children, id, ...rest }, ref) {
    injectCSS();
    const inputId = id ?? useRef(uid()).current;
    const cls = [
      "inp-field",
      error ? "inp-field--error" : "",
      success && !error ? "inp-field--success" : "",
    ].filter(Boolean).join(" ");

    return (
      <div className={`inp-root${className ? " " + className : ""}`}>
        {label && <label className="inp-label" htmlFor={inputId}>{label}</label>}
        <div className="inp-select-wrap">
          <select ref={ref} id={inputId} className={cls} aria-invalid={!!error} {...rest}>
            {children}
          </select>
        </div>
        {error
          ? <span className="inp-error">{error}</span>
          : hint && <span className="inp-hint">{hint}</span>}
      </div>
    );
  }
);

export default Input;
