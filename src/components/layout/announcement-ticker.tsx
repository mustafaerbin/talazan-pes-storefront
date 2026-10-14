"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const HOLD_MS = 10_000;

interface AnnouncementTickerProps {
  texts: string[];
}

export function AnnouncementTicker({ texts }: AnnouncementTickerProps) {
  const [index, setIndex] = useState(0);
  const items = texts.map((text) => text.trim()).filter(Boolean);

  useEffect(() => {
    setIndex(0);
  }, [items.join("\n")]);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
  }, [items.length, items.join("\n")]);

  if (!items.length) return null;

  const current = items[index] ?? items[0];

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={`${index}-${current}`}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="truncate font-medium tracking-wide"
        >
          {current}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
