import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, Github as GitHub, Linkedin, Send, CheckCircle } from 'lucide-react';
import MovingStarsBackground from './MovingStarsBackground';

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

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });

      // Reset submission state after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-20 bg-black relative overflow-hidden">
      {/* Moving stars background */}
      <MovingStarsBackground starCount={100} />

      {/* Space-themed decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-900/10 to-transparent"></div>
      <div className="absolute -top-10 -right-10 w-60 h-60 bg-blue-500/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-indigo-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div
        ref={sectionRef}
        className="container mx-auto px-4 opacity-0 translate-y-10 transition-all duration-1000 ease-out relative z-10"
      >
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-1 bg-blue-900/30 text-blue-300 text-sm font-medium rounded-full backdrop-blur-sm border border-blue-800/30">
              Contact
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
              style={{ textShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}>
            Get In Touch
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full animate-pulse-slow"></div>
          <p className="max-w-2xl mx-auto text-blue-200 text-lg">
            Have a project in mind or want to know more about my work? Feel free to reach out!
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-gray-900/60 rounded-2xl shadow-xl overflow-hidden transition-transform hover:shadow-blue-500/20 hover:-translate-y-1 backdrop-blur-sm border border-blue-900/30"
               style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6" style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.3)' }}>Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-800/50"
                       style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)' }}>
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-blue-300">Email</h4>
                    <a
                      href="mailto:koshalkumar0304@gmail.com"
                      className="text-blue-100 font-medium hover:text-blue-300 transition-colors"
                      style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.2)' }}
                    >
                      koshalkumar0304@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-800/50"
                       style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)' }}>
                    <Phone className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-blue-300">Phone</h4>
                    <a
                      href="tel:+918218806349"
                      className="text-blue-100 font-medium hover:text-blue-300 transition-colors"
                      style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.2)' }}
                    >
                      +91 8218806349
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-800/50"
                       style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)' }}>
                    <GitHub className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-blue-300">GitHub</h4>
                    <a
                      href="https://github.com/koshal0304"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-100 font-medium hover:text-blue-300 transition-colors"
                      style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.2)' }}
                    >
                      github.com/koshal0304
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-800/50"
                       style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)' }}>
                    <Linkedin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-blue-300">LinkedIn</h4>
                    <a
                      href="https://linkedin.com/in/koshal-kumar-970233240"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-100 font-medium hover:text-blue-300 transition-colors"
                      style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.2)' }}
                    >
                      linkedin.com/in/koshal-kumar-970233240
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/60 rounded-2xl shadow-xl overflow-hidden transition-transform hover:shadow-blue-500/20 hover:-translate-y-1 backdrop-blur-sm border border-blue-900/30"
               style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6" style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.3)' }}>Send a Message</h3>

              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="bg-blue-900/40 p-3 rounded-full mb-4 border border-blue-800/50"
                       style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}>
                    <CheckCircle className="w-10 h-10 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-medium text-blue-100 mb-2" style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.3)' }}>Message Sent!</h4>
                  <p className="text-blue-200 text-center">
                    Thank you for your message. I'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-blue-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.name ? 'border-red-500' : 'border-blue-800/50'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-900/80 text-white backdrop-blur-sm`}
                        placeholder="Your name"
                        style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)' }}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-blue-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.email ? 'border-red-500' : 'border-blue-800/50'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-900/80 text-white backdrop-blur-sm`}
                        placeholder="Your email"
                        style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)' }}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-blue-300 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.message ? 'border-red-500' : 'border-blue-800/50'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-gray-900/80 text-white backdrop-blur-sm`}
                        placeholder="Your message"
                        style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)' }}
                      ></textarea>
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center transition-all border border-blue-500/50 ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'
                      }`}
                      style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;