import React, { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import './SectionNav.css';

export interface SectionNavItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string;
}

interface SectionNavProps {
  sections: SectionNavItem[];
}

export function SectionNav({ sections }: SectionNavProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    if (!sections.length) return;
    if (!sections.some((section) => section.id === activeSection)) {
      setActiveSection(sections[0].id);
    }
  }, [activeSection, sections]);

  useEffect(() => {
    if (!sections.length) return;

    const scrollRoot = document.querySelector('.main-content') as HTMLElement | null;
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        root: scrollRoot,
        rootMargin: '-15% 0px -52% 0px',
        threshold: [0.2, 0.4, 0.6],
      }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  const handleSelect = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="section-nav-wrap" aria-label="Quick section navigation">
      <div className="section-nav-list">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              className={`section-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleSelect(section.id)}
              aria-pressed={isActive}
            >
              {Icon && <Icon size={14} />}
              <span>{section.label}</span>
              {section.badge && <span className="section-nav-badge">{section.badge}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
