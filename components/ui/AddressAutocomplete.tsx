"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { AddressSuggestion, ParsedAddress } from "@/lib/address/types";

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

type AddressAutocompleteProps = {
  value: string;
  onChange: (street: string) => void;
  onSelect: (address: ParsedAddress) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing a US address…",
  className = inputCls,
  disabled = false,
}: AddressAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [minLength, setMinLength] = useState(3);
  const [provider, setProvider] = useState<"google" | "nominatim">("nominatim");

  const pick = useCallback(
    async (item: AddressSuggestion) => {
      setError(null);

      if (item.placeId) {
        setResolving(true);
        try {
          const res = await fetch(
            `/api/address/place?placeId=${encodeURIComponent(item.placeId)}`
          );
          const data = (await res.json()) as {
            address?: ParsedAddress;
            error?: string;
          };
          if (!res.ok || !data.address) {
            setError(data.error ?? "Could not load address details");
            return;
          }
          onChange(data.address.street);
          onSelect(data.address);
        } catch {
          setError("Could not load address details");
          return;
        } finally {
          setResolving(false);
        }
      } else {
        onChange(item.street);
        onSelect({
          street: item.street,
          city: item.city,
          state: item.state,
          zip: item.zip,
          lat: item.lat,
          lng: item.lng,
        });
      }

      setOpen(false);
      setSuggestions([]);
      setHighlight(0);
    },
    [onChange, onSelect]
  );

  useEffect(() => {
    if (disabled || value.trim().length < minLength) {
      setSuggestions([]);
      setOpen(false);
      if (!resolving) setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/address/autocomplete?q=${encodeURIComponent(value.trim())}`,
          { signal: controller.signal }
        );
        const data = (await res.json()) as {
          suggestions?: AddressSuggestion[];
          error?: string;
          minLength?: number;
          provider?: "google" | "nominatim";
        };
        if (data.minLength) setMinLength(data.minLength);
        if (data.provider) setProvider(data.provider);

        if (!res.ok) {
          setError(data.error ?? "Could not search addresses");
          setSuggestions([]);
          setOpen(false);
          return;
        }
        const next = data.suggestions ?? [];
        setSuggestions(next);
        setOpen(next.length > 0);
        setHighlight(0);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Could not search addresses");
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value, disabled, minLength, resolving]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(
        (i) => (i - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      void pick(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const hintMin = minLength;

  return (
    <div ref={rootRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled || resolving}
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {value.trim().length > 0 && value.trim().length < hintMin && (
        <p className="mt-1 text-xs text-slate-400">
          Type at least {hintMin} characters for US address suggestions
        </p>
      )}

      {(loading || resolving) && (
        <p className="mt-1 text-xs text-slate-400">
          {resolving ? "Loading address…" : "Searching addresses…"}
        </p>
      )}
      {error && !loading && !resolving && (
        <p className="mt-1 text-xs text-amber-600">{error}</p>
      )}

      {value.trim().length >= hintMin &&
        !loading &&
        !resolving &&
        suggestions.length === 0 &&
        !error && (
          <p className="mt-1 text-xs text-slate-400">No US addresses found</p>
        )}

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((item, i) => (
            <li key={item.id} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                className={`block w-full px-3 py-2 text-left text-sm ${
                  i === highlight
                    ? "bg-blue-50 text-blue-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void pick(item)}
                onMouseEnter={() => setHighlight(i)}
              >
                <span className="block font-medium">
                  {item.placeId
                    ? item.label
                    : item.street || item.label}
                </span>
                {!item.placeId && (
                  <span className="block text-xs text-slate-500">
                    {[item.city, item.state, item.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                {item.placeId && provider === "google" && (
                  <span className="block text-xs text-slate-400">
                    Google Places · US only
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type { ParsedAddress };
