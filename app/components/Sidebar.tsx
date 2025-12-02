"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "Hero", targets: ["hero"] },
  { id: "second-row", label: "Second", targets: ["second-1", "second-2"] },
  { id: "assets-continued", label: "More", targets: ["assets-continued"] },
];

export default function Sidebar({ hasSecondRow = true, hasAssetsContinued = true }: { hasSecondRow?: boolean; hasAssetsContinued?: boolean }) {
  const [active, setActive] = useState<string | null>(null);

  // Add hover listeners for page sections to sync highlight with sidebar
  useEffect(() => {
    // For each section, attach mouseenter/leave to all targets
    const handlers: Array<{
      el: Element;
      enter: (e: Event) => void;
      leave: (e: Event) => void;
    }> = [];

    sections.forEach((s) => {
      // Attach to known targets (IDs) if present
      s.targets.forEach((tid) => {
        const el = document.getElementById(tid);
        if (el) {
          const enter = () => setActive(s.id);
          const leave = () => setActive((prev) => (prev === s.id ? null : prev));
          el.addEventListener("mouseenter", enter);
          el.addEventListener("mouseleave", leave);
          handlers.push({ el, enter, leave });
        }
      });

      // Attach to any element using data-section attribute
      const nodes = document.querySelectorAll(`[data-section="${s.id}"]`);
      nodes.forEach((el) => {
        const enter = () => setActive(s.id);
        const leave = () => setActive((prev) => (prev === s.id ? null : prev));
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        handlers.push({ el, enter, leave });
      });
    });

    return () => {
      handlers.forEach(({ el, enter, leave }) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  // IntersectionObserver: watch section targets, set active when a target is in view
  useEffect(() => {
    const idToSection = new Map<string, string>();
    sections.forEach((s) => s.targets.forEach((t) => idToSection.set(t, s.id)));
    const observedEls: Element[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the largest intersectionRatio that is intersecting
        let bestId: string | null = null;
        let bestRatio = 0;
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id || "";
          const sectionId = idToSection.get(id);
          if (!sectionId) return;
          if (entry.isIntersecting) {
            const ratio = entry.intersectionRatio || 0;
            if (bestId === null || ratio > bestRatio) {
              bestId = sectionId;
              bestRatio = ratio;
            }
          }
        });

        setActive(bestId);
      },
      {
        root: null,
        rootMargin: "-25% 0% -50% 0%",
        threshold: [0.25, 0.5, 0.75],
      }
    );

    idToSection.forEach((sectionId, targetId) => {
      const el = document.getElementById(targetId);
      if (el) {
        observer.observe(el);
        observedEls.push(el);
      }
    });

    return () => {
      observer.disconnect();
      observedEls.length = 0;
    };
  }, []);

  function handleSegmentEnter(id: string) {
    // Add highlight class to the corresponding sections.
    setActive(id);
    highlightSection(id, true);
  }

  function handleSegmentLeave(id: string) {
    setActive(null);
    highlightSection(null, false);
  }

  function handleSegmentClick(id: string) {
    const sec = sections.find((s) => s.id === id);
    if (!sec) return;
    const targetId = sec.targets?.[0];
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // flash highlight on click
      highlightSection(id, true);
      setTimeout(() => highlightSection(null, false), 700);
    }
  }

  function highlightSection(id: string | null, on: boolean) {
    // If id is null, clear all
    if (id === null) {
      sections.forEach((s) => {
        s.targets.forEach((tid) => {
          const el = document.getElementById(tid);
          if (el) el.classList.toggle("section-hover", false);
        });
      });
      return;
    }

    const sec = sections.find((s) => s.id === id);
    if (!sec) return;
    // Clear others first then set this section
    sections.forEach((s) =>
      s.targets.forEach((tid) => {
        const el = document.getElementById(tid);
        if (el) el.classList.toggle("section-hover", s.id === id && on);
      })
    );

    const el = document.getElementById(id);
    if (el) el.classList.toggle("section-hover", on);
  }

  // Keep DOM highlight classes in sync when `active` changes (for scroll-driven updates)
  useEffect(() => {
    highlightSection(active, active !== null);
  }, [active]);

  return (
    <aside className="sidebar" aria-hidden={false} aria-label="Section navigation">
      {sections.map((s, i) => (
        <button
          key={s.id}
          aria-label={`Go to ${s.label}`}
          className={`sidebar-seg ${active === s.id ? "sidebar-active" : ""}`}
          aria-current={active === s.id ? "true" : undefined}
          disabled={(s.id === "second-row" && !hasSecondRow) || (s.id === "assets-continued" && !hasAssetsContinued)}
          onMouseEnter={() => handleSegmentEnter(s.id)}
          onMouseLeave={() => handleSegmentLeave(s.id)}
          onClick={() => handleSegmentClick(s.id)}
        />
      ))}
    </aside>
  );
}
