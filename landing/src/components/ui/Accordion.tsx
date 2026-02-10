'use client';

import { useState } from 'react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="accordion-item">
          <button
            className="accordion-trigger"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span>{item.question}</span>
            <span style={{ transform: openIndex === index ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              ▼
            </span>
          </button>
          <div className={`accordion-content ${openIndex === index ? 'open' : ''}`}>
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
