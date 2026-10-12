import React, { useState } from 'react';
import GridLine from './GridLine';

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: 'What does working together look like?',
    a: 'We work side by side with you in short, visible cycles. You see design and code move together every week — no big reveals, no lost-in-translation handoffs.',
  },
  {
    q: 'How quickly can we start?',
    a: 'Usually within a week or two. We keep a small roster on purpose, so the people you meet on the intro call are the same people who design and build — no handoff to a stranger after the kickoff.',
  },
  {
    q: 'What does a project cost?',
    a: 'We decide pricing based on scope. After a short intro call we map out what the project actually needs and come back with one fixed number — no menu of packages, no hourly meter ticking in the background.',
  },
  {
    q: 'Do you work with early-stage teams?',
    a: 'Absolutely. Some of our favorite work is helping early teams find a voice that feels bigger than their headcount. We meet you wherever you are and grow the surface area from there.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="col-2 py-14 sm:py-20 px-5 sm:px-8 transition-colors duration-300 relative">
      <GridLine className="pillar-line-h top-0 left-[-2000px] right-[-2000px] h-px text-gray-400 dark:text-neutral-600" dashArray="2 4" />

      <div className="animate-fade-in flex flex-col gap-10 mt-4 md:mt-8">
        {/* Heading block */}
        <div className="flex flex-col gap-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
            FAQ_
          </div>
          <h2 className="font-sans text-[34px] sm:text-[44px] leading-[1.02] tracking-[-0.02em] text-[#111] dark:text-[#F3F3F3]">
            Frequently<br />Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="flex flex-col">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border-t border-dotted border-gray-300 dark:border-[#2b2b2b] last:border-b"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-start justify-between gap-6 py-5 sm:py-6 text-left group cursor-pointer"
                >
                  <span className="font-sans text-[17px] sm:text-[19px] tracking-[-0.01em] text-[#111] dark:text-[#F3F3F3] group-hover:opacity-70 transition-opacity">
                    {item.q}
                  </span>
                  <span
                    className={`font-mono text-lg sm:text-xl leading-none mt-0.5 text-gray-500 dark:text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    {isOpen ? '–' : '+'}
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-400 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="font-sans text-[15px] sm:text-[16px] leading-[1.6] text-gray-500 dark:text-gray-400 pb-6 sm:pb-7 pr-8 max-w-[52ch]">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
