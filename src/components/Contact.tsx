import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import SectionHeader from './SectionHeader';
import VelocityMarquee from './contact/VelocityMarquee';
import { reactTwin } from '../lib/askLab';
import { Magnetic3D, SlotRollText } from './KineticText';

interface FormData {
  name: string;
  email: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL = 'koshalkumar0304@gmail.com';

const CONTACT_LINKS = [
  {
    label: 'Email',
    value: 'koshalkumar0304@gmail.com',
    href: 'mailto:koshalkumar0304@gmail.com',
  },
  {
    label: 'LinkedIn',
    value: 'Koshal Kumar',
    href: 'https://linkedin.com/in/koshal-kumar-970233240',
  },
  {
    label: 'Phone',
    value: '+91 82188 06349',
    href: 'tel:+918218806349',
  },
  {
    label: 'GitHub',
    value: 'github.com/koshal0304',
    href: 'https://github.com/koshal0304',
  },
];

// Caps keep the prefilled mailto inside what mail clients accept.
const FIELDS: { name: keyof FormData; label: string; type?: string; max: number }[] = [
  { name: 'name', label: 'Name', max: 100 },
  { name: 'email', label: 'Email', type: 'email', max: 254 },
  { name: 'message', label: 'Message', max: 1800 },
];

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // No backend: hand the message to the visitor's own mail app, fully URI-encoded (no header injection).
    const subject = encodeURIComponent(`Portfolio enquiry from ${formData.name.trim()}`);
    const body = encodeURIComponent(`${formData.message.trim()}\n\n— ${formData.name.trim()} (${formData.email.trim()})`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setIsSubmitted(true);
    reactTwin('celebrate');
  };

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-5">
        <SectionHeader
          chapter="08"
          eyebrow="Contact"
          title="Let's build something real."
          lead="Based in Bengaluru, India · Open to AI/ML engineering roles, production LLM systems & collaborations."
        />

        <div className="grid gap-5 md:grid-cols-[1fr_1.15fr] items-start">
          {/* Direct lines */}
          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="card rounded-[20px] divide-y divide-white/10 overflow-hidden"
          >
            {CONTACT_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={link.label}
                  data-cursor="Open"
                  className="slot-roll-trigger group flex cursor-pointer items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-white/[0.04]"
                >
                  <span className="min-w-0">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">{link.label}</span>
                    <span className="mt-1 block truncate text-[15px] text-slate-100">
                      <SlotRollText text={link.value} accentClassName="text-accent-300" />
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-300" />
                </a>
              </li>
            ))}
          </motion.ul>

          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="card rounded-[20px] p-10 text-center"
              >
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-accent-300" strokeWidth={1.5} />
                <h3 className="font-display text-[24px] font-medium tracking-tight text-slate-100 mb-2">
                  Your email app has the message ready
                </h3>
                <p className="text-[15px] text-slate-300">
                  Hit send there and it comes straight to me. Nothing opened?{' '}
                  <a href={`mailto:${EMAIL}`} className="text-accent-300 underline-offset-4 hover:underline">
                    {EMAIL}
                  </a>
                </p>
                <button type="button" onClick={() => setIsSubmitted(false)} className="btn btn-ghost mt-6 !py-2 text-[13px]">
                  Edit the message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
                onSubmit={handleSubmit}
                noValidate
                data-guide="contact-form"
                className="card rounded-[20px] p-6 md:p-7 space-y-4"
              >
                {FIELDS.map((field) => {
                  const id = `contact-${field.name}`;
                  const error = errors[field.name];
                  const cls = `peer w-full rounded-[14px] bg-sunken/60 border ${
                    error ? 'border-red-400/80' : 'border-white/10 focus:border-accent-400/60'
                  } px-4 pt-6 pb-2 text-[15px] text-slate-100 focus:outline-none transition-colors`;
                  return (
                    <div key={field.name} className="relative">
                      {field.name === 'message' ? (
                        <textarea
                          id={id}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder=" "
                          rows={4}
                          maxLength={field.max}
                          aria-invalid={!!error}
                          className={`${cls} resize-none`}
                        />
                      ) : (
                        <input
                          type={field.type ?? 'text'}
                          id={id}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder=" "
                          maxLength={field.max}
                          aria-invalid={!!error}
                          className={cls}
                        />
                      )}
                      <label
                        htmlFor={id}
                        className="absolute left-4 top-4 text-[14px] text-slate-400 transition-all duration-200 pointer-events-none peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-accent-300 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px]"
                      >
                        {field.label}
                      </label>
                      {error && <p className="text-red-300 text-[12px] mt-1.5">{error}</p>}
                    </div>
                  );
                })}

                <Magnetic3D strength={0.12} tilt={4} className="w-full">
                  <button type="submit" data-cursor="Send" className="slot-roll-trigger btn btn-primary w-full !py-3">
                    <SlotRollText text="Send message" accentClassName="text-deep" />
                  </button>
                </Magnetic3D>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-20 md:mt-28">
          <VelocityMarquee />
        </div>
      </div>
    </section>
  );
};

export default Contact;
