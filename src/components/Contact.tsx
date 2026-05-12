import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const CONTACT_LINKS = [
  {
    label: 'Email',
    href: 'mailto:koshalkumar0304@gmail.com',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/koshal-kumar-970233240',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/koshal0304',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
];

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    setIsSubmitted(true);
  };

  return (
    <section id="contact" className="bg-background/70 py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="float-orb"
          style={{
            width: '400px',
            height: '400px',
            background: 'var(--aurora-1)',
            top: '30%',
            right: '-5%',
            opacity: 0.04,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-base mb-4">
            Let's Build Something
          </h2>
          <p className="text-text-muted font-body">Open to AI/ML roles, freelance projects, and collaborations.</p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="aurora-divider mx-auto mt-6"
            style={{ maxWidth: '100px', transformOrigin: 'center' }}
          />
        </motion.div>

        {/* Icon links with neon hover */}
        <div className="flex justify-center gap-8 md:gap-12 mb-16">
          {CONTACT_LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.1, y: -4 }}
              data-cursor-text="Open"
              className="flex flex-col items-center gap-2 text-white/40 hover:text-white transition-all duration-300 cursor-pointer group"
              aria-label={link.label}
            >
              <div
                className="p-3 rounded-xl glass-liquid group-hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-shadow duration-500"
              >
                {link.icon}
              </div>
              <span className="font-mono text-xs">{link.label}</span>
            </motion.a>
          ))}
        </div>

        {/* Form with neon focus states */}
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-center py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                >
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: 'var(--aurora-1)' }}
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                    <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <h3 className="font-display text-2xl text-text-base mb-2">Message Sent!</h3>
                <p className="text-text-muted">Thank you for reaching out. I'll get back to you soon.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Name field with neon focus */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                    className={`peer w-full bg-[var(--surface-1)] border ${
                      errors.name ? 'border-red-500' : focusedField === 'name' ? 'border-[var(--aurora-1)]' : 'border-white/5'
                    } rounded-lg px-4 pt-6 pb-2 text-text-base font-body focus:outline-none transition-all input-neon`}
                    style={{ boxShadow: 'none' }}
                  />
                  <label
                    htmlFor="contact-name"
                    className="absolute left-4 top-4 text-text-muted text-sm transition-all duration-200 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[var(--aurora-1)] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
                  >
                    Name
                  </label>
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </motion.div>

                {/* Email field */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                    className={`peer w-full bg-[var(--surface-1)] border ${
                      errors.email ? 'border-red-500' : focusedField === 'email' ? 'border-[var(--aurora-1)]' : 'border-white/5'
                    } rounded-lg px-4 pt-6 pb-2 text-text-base font-body focus:outline-none transition-all input-neon`}
                  />
                  <label
                    htmlFor="contact-email"
                    className="absolute left-4 top-4 text-text-muted text-sm transition-all duration-200 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[var(--aurora-1)] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
                  >
                    Email
                  </label>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </motion.div>

                {/* Message field */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                    rows={4}
                    className={`peer w-full bg-[var(--surface-1)] border ${
                      errors.message ? 'border-red-500' : focusedField === 'message' ? 'border-[var(--aurora-1)]' : 'border-white/5'
                    } rounded-lg px-4 pt-6 pb-2 text-text-base font-body focus:outline-none transition-all resize-none input-neon`}
                  />
                  <label
                    htmlFor="contact-message"
                    className="absolute left-4 top-4 text-text-muted text-sm transition-all duration-200 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[var(--aurora-1)] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
                  >
                    Message
                  </label>
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                </motion.div>

                {/* Submit — aurora gradient button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-cursor-text="Send"
                  className="w-full font-display font-bold py-3.5 rounded-lg transition-all cursor-pointer relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
                    color: 'var(--bg-deep)',
                    boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)',
                  }}
                >
                  {/* Shimmer on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, var(--aurora-2), var(--aurora-3))',
                      }}
                    />
                  </div>
                  <span className="relative z-10">Send Message</span>
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Contact;