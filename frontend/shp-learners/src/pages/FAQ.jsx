import React, { useState, useEffect } from 'react';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

function FAQ() {
  // Static FAQs to always show
  const staticFaqs = [
    { id: 'static-1', question: 'What is this platform about?', answer: 'Our platform provides high-quality online courses across various domains to help you learn and grow your skills.' },
    { id: 'static-2', question: 'How do I buy a course?', answer: 'Choose a course, add it to your cart, and complete the checkout process using UPI, debit/credit cards, or wallets.' },
    { id: 'static-3', question: 'Do you offer certificates?', answer: 'Yes, we provide certificates for most paid courses after successful completion.' },
    { id: 'static-4', question: 'Can I access the course after purchase forever?', answer: 'Yes, once you purchase a course, you get lifetime access unless specified otherwise.' },
    { id: 'static-5', question: 'Is there a mobile app?', answer: 'We are working on our mobile app. Meanwhile, you can access all features through your mobile browser.' },
    { id: 'static-6', question: 'How can I get support?', answer: 'You can email us at <a href="mailto:patelbr5118s@gmail.com" class="text-blue-400 hover:underline">patelbr5118s@gmail.com</a> or use the contact form on our website.' },
  ];

  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [question, setQuestion] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Fetch FAQs from API on mount
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/faqs/`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setFaqs(data);
        } else {
          setFaqs([]);
        }
      } catch {
        setFaqs([]);
      }
    };
    fetchFaqs();
  }, []);

  // Combine static and dynamic FAQs
  const allFaqs = [...faqs, ...staticFaqs];

  // Filter FAQs based on search term
  const filteredFaqs = allFaqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (question.trim()) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/faqs/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '',
          },
          credentials: 'include',
          body: JSON.stringify({ question }),
        });
        if (res.ok) {
          setQuestion('');
          setShowThankYou(true);
          setTimeout(() => {
            setShowThankYou(false);
          }, 3000);
          // Optionally, refetch FAQs to show new question if API returns it
          // await fetchFaqs();
        } else {
          alert('Failed to submit your question. Please try again.');
        }
      } catch {
        alert('Failed to submit your question. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 my-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-900 tracking-tight">Frequently Asked Questions</h1>

      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white pb-6 mb-8">
        <input
          type="text"
          id="searchInput"
          placeholder="🔍 Search questions..."
          className="w-full p-3 text-lg border border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search FAQs"
        />
      </div>

      {/* FAQ List */}
      <div id="faqList" className="mb-10">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => (
            <div
              key={faq.id}
              className={`faq mb-4 rounded-xl border border-blue-100 shadow-sm transition-all duration-200 ${
                openFaq === idx ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <button
                type="button"
                aria-expanded={openFaq === idx}
                aria-controls={`faq-content-${faq.id}`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition font-semibold text-lg text-blue-900 hover:bg-blue-100"
              >
                <span>{faq.question}</span>
                <span className={`transform transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              <div
                id={`faq-content-${faq.id}`}
                className={`overflow-hidden transition-all duration-300 px-6 ${
                  openFaq === idx ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
                }`}
                aria-hidden={openFaq !== idx}
              >
                <div className="text-gray-800 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-10 text-lg">No FAQs match your search.</p>
        )}
      </div>

      {/* Ask Your Own Question */}
      <div className="qa-section text-center mt-12 bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-inner border border-blue-200">
        <h2 className="text-2xl font-bold mb-4 text-blue-900 flex items-center justify-center gap-2">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block text-blue-700"><circle cx="14" cy="14" r="12" /><path d="M14 10v4m0 4h.01" /></svg>
          Have a Question?
        </h2>
        <form onSubmit={handleSubmitQuestion} className="max-w-xl mx-auto">
          <div className="form-group mb-4">
            <label htmlFor="question" className="sr-only">Your Question</label>
            <textarea
              id="question"
              rows="4"
              placeholder="Type your question here..."
              className="w-full resize-y border border-blue-300 rounded-lg p-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-900 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg shadow transition"
          >
            Submit Question
          </button>
        </form>
        {showThankYou && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mt-4 font-medium transition">
            Thank you for your question! We will get back to you shortly.
          </div>
        )}
      </div>

      {/* Feedback Button */}
      <div className="feedback-btn text-center mt-10">
        <a
          href="mailto:patelbr5118s@gmail.com?subject=Website Feedback"
          className="inline-block bg-green-500 text-white hover:bg-green-600 px-8 py-3 rounded-lg font-semibold text-lg shadow transition"
        >
          💬 Give Feedback
        </a>
      </div>
    </div>
  );
}

export default FAQ;
