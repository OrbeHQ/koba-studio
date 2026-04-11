import React from 'react';

export default function Notes() {
  return (
    <div className="w-full bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-200 dark:border-[#262626] p-6 flex flex-col gap-4 transition-colors duration-300">
      <span className="font-mono text-xs font-bold tracking-widest text-gray-900 dark:text-white uppercase">Notes</span>
      <p className="font-sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        This site is constantly evolving, expect frequent nitpick commits. Last updated:<br/>
        10/Apr/2026
      </p>
    </div>
  );
}
