import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqItems: FAQItem[] = [
  {
    question: "How do I make a reservation?",
    answer: "You can book directly with us via WhatsApp or email, or through Airbnb if the unit is listed there. We respond fast and confirm within hours."
  },
  {
    question: "What is your cancellation policy?",
    answer: "On Airbnb: we follow a strict policy. Guests who cancel 7 or more days before check-in receive a 50% refund. After that, the booking becomes non-refundable. For promo-rate bookings made directly, no refund is provided."
  },
  {
    question: "Do you require a deposit?",
    answer: "Yes, we require a 20–30% deposit to confirm your stay. Balance is due at check-in or via online transfer. Airbnb bookings follow their payment system."
  },
  {
    question: "What are the check-in and check-out times?",
    answer: "Check-in: from 2:00 PM. Check-out: by 10:00 AM. Early check-in / late check-out may be possible — ask us in advance."
  },
  {
    question: "How do I check in to the property?",
    answer: "We'll meet you in person or send a self-check-in guide depending on arrival time. Our team is always on standby if you need help."
  },
  {
    question: "Are your properties child-friendly?",
    answer: "Yes, most units are family-friendly. Some have stairs or open balconies — ask us about the best fit for your group."
  },
  {
    question: "Are pets allowed?",
    answer: "Some units allow pets; others don't. Please confirm in advance — a pet deposit may apply."
  },
  {
    question: "What amenities are included?",
    answer: (
      <>
        Each listing is unique, but most include:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Fast Wi-Fi</li>
          <li>Kitchen or kitchenette</li>
          <li>Air conditioning</li>
          <li>Towels, bed sheets, and basic toiletries</li>
          <li>Weekly or daily cleaning</li>
          <li>On-call maintenance</li>
          <li>Local guest support</li>
        </ul>
      </>
    )
  },
  {
    question: "Can you help arrange activities and tours?",
    answer: (
      <>
        Absolutely. We connect you with trusted local providers for island hopping, diving, e-bike rental, golf, and more. You can also follow our blog for ideas, inspiration, and tips for your journey: <a href="https://www.boracay.house/blog" className="text-amber-600 hover:text-amber-700 underline">https://www.boracay.house/blog</a>
      </>
    )
  },
  {
    question: "What payment methods do you accept?",
    answer: "Direct bookings: bank transfer (local or international), Wise, Revolut, GCash, or PayPal (fees may apply). Airbnb: through their platform."
  },
  {
    question: "Do you offer airport transfers?",
    answer: "Yes — we can book airport pickup and drop-off with trusted local providers. Let us know your arrival details at least 24 hours in advance, or we'll connect you directly so you can book online yourself."
  },
  {
    question: "Are these Airbnb properties or direct rentals?",
    answer: "Yes — all homes are Airbnb-ready and can be booked either directly or via Airbnb. You get verified hosts, guest-reviewed properties, and simple check-in."
  },
  {
    question: "How close are the homes to White Beach?",
    answer: "Most rentals are 2–10 minutes from White Beach, D'Mall, and Station 1 — walkable but without the beachfront markup. Many units are near Diniwid Beach (4 min walk), and a short E-trike from nightlife and restaurants."
  },
  {
    question: "Can I rent monthly or long-term?",
    answer: "Yes. We welcome digital nomads and long-stay guests. Monthly rates are discounted, especially off-season."
  },
  {
    question: "Can you help manage my property?",
    answer: "Yes — we offer full property management: listings, guest support, cleaning, maintenance, photos, pricing strategy. Hands-free for owners."
  },
  {
    question: "We are a group of 16–20 people — can you organize something for us?",
    answer: "Yes, we specialize in group bookings. We can arrange nearby units or private villas to host your full group. Just send us your dates."
  }
];

const FAQ: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Split FAQ items into two columns
  const faqColumns = [
    faqItems.slice(0, Math.ceil(faqItems.length / 2)),
    faqItems.slice(Math.ceil(faqItems.length / 2))
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {faqColumns.map((column, colIndex) => (
        <div key={colIndex} className="space-y-4">
          {column.map((item, index) => {
            const globalIndex = colIndex === 0 ? index : index + Math.ceil(faqItems.length / 2);
            const isExpanded = expandedIndex === globalIndex;
            
            return (
              <div 
                key={globalIndex} 
                className="border border-gray-100 rounded-lg overflow-hidden transition-all duration-300 hover:border-primary-200"
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-primary-50 transition-colors duration-300"
                  onClick={() => toggleFaq(globalIndex)}
                >
                  <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-primary transition-transform duration-300 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 flex-shrink-0" />
                  )}
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 py-4 bg-primary-50/50">
                    <div className="text-gray-600 leading-relaxed">{item.answer}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default FAQ;