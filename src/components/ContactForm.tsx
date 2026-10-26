import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

// Messages land in info@orbelabs.org without opening a mail client.
// Formsubmit needs a one-time activation: the first submission sends an
// activation link to that inbox, and delivery starts once it is clicked.
const ENDPOINT = 'https://formsubmit.co/ajax/info@orbelabs.org';

const labelClass =
  'font-mono text-[11px] tracking-[0.25em] uppercase text-black/60 dark:text-white/60';
const inputClass =
  'w-full bg-transparent border-b border-gray-400 dark:border-neutral-600 py-2 font-sans text-[17px] leading-[1.65] text-[#111] dark:text-[#F3F3F3] placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:border-black dark:focus:border-white cursor-auto transition-colors';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [project, setProject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email,
          project,
          message,
          _subject: 'New project inquiry — orbelabs.org',
          _template: 'table',
          _honey: '',
        }),
      });
      if (!res.ok) throw new Error(`Form endpoint returned ${res.status}`);
      setStatus('sent');
      setName('');
      setEmail('');
      setProject('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="border border-gray-400 dark:border-neutral-600 px-5 py-6 sm:px-6">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-black dark:text-white">
          Message sent
        </p>
        <p className="font-sans text-[17px] leading-[1.65] text-[#111] dark:text-[#F3F3F3] mt-3">
          Thanks — we&apos;ll get back to you from info@orbelabs.org. No pitch
          deck needed, just the idea.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-5 font-mono text-[11px] tracking-[0.25em] uppercase underline underline-offset-4 hover:opacity-70 transition-opacity cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-name" className={labelClass}>
          Your name
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Lovelace"
          autoComplete="name"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-project" className={labelClass}>
          What are you building? <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="contact-project"
          type="text"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="A website, an app, a product…"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className={labelClass}>
          Tell us about your idea
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What are you excited about?"
          className={`${inputClass} resize-y`}
        />
      </div>

      {status === 'error' && (
        <p
          role="alert"
          className="font-sans text-[15px] leading-[1.65] text-[#111] dark:text-[#F3F3F3]"
        >
          Something went wrong sending this — please email us directly at{' '}
          <a
            href="mailto:info@orbelabs.org"
            className="font-medium text-black dark:text-white underline decoration-[1.5px] underline-offset-4 hover:opacity-70 transition-opacity"
          >
            info@orbelabs.org
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-1 self-start bg-black text-white dark:bg-white dark:text-black px-6 py-3 font-mono text-xs tracking-[0.25em] uppercase hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-auto"
      >
        {status === 'sending' ? 'Sending…' : 'Start your project'}
      </button>

      <p className="font-mono text-[11px] leading-relaxed text-black/50 dark:text-white/50">
        We reply from info@orbelabs.org.
      </p>
    </form>
  );
}
