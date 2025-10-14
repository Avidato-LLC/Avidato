// src/app/page.tsx
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useTypewriter, Cursor } from 'react-simple-typewriter';

// --- Layout Components ---
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

// --- Modular Icon Imports ---
// (These should be created as individual component files in `src/components/icons/`)
import AutoAwesomeIcon from '@/components/icons/AutoAwesomeIcon';
import FactCheckIcon from '@/components/icons/FactCheckIcon';
import ManageAccountsIcon from '@/components/icons/ManageAccountsIcon';
import ShareIcon from '@/components/icons/ShareIcon';
import ArrowForwardIcon from '@/components/icons/ArrowForwardIcon';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import SchemaIcon from '@/components/icons/SchemaIcon';
import TaskAltIcon from '@/components/icons/TaskAltIcon';
import RuleIcon from '@/components/icons/RuleIcon';
import AddIcon from '@/components/icons/AddIcon';

// --- Page-Specific Data ---
// It's good practice to keep data separate from the component logic.
const features = [
  { icon: <AutoAwesomeIcon className="h-8 w-8 text-brand-primary" />, title: "AI Course Outlines", description: "Instantly generate a 10-lesson course outline based on your student's proficiency level and learning goals." },
  { icon: <FactCheckIcon className="h-8 w-8 text-brand-secondary" />, title: "Detailed Lesson Plans", description: "Go from outline to a complete, structured lesson plan with warm-ups, activities, and vocabulary in a single click." },
  { icon: <ManageAccountsIcon className="h-8 w-8 text-brand-accent" />, title: "Simple Student Hub", description: "Keep all your student notes, progress, and generated lesson plans organized in one central dashboard." },
  { icon: <ShareIcon className="h-8 w-8 text-brand-dark" />, title: "Shareable Links", description: "Send a read-only link of the lesson plan to your student. No login required for them to view the materials." },
];

const methodologies = [
  { id: 'PPP', title: 'Presentation, Practice, Production (PPP)', description: 'A classic, structured approach. Our AI introduces new concepts clearly (Presentation), provides guided exercises (Practice), and creates opportunities for free-form student expression (Production).', icon: <SchemaIcon className="h-8 w-8" /> },
  { id: 'TBL', title: 'Task-Based Learning (TBL)', description: 'Focus on real-world outcomes. Lessons are built around completing a meaningful task—like ordering food or booking a hotel—making language acquisition practical and motivating.', icon: <TaskAltIcon className="h-8 w-8" /> },
  { id: 'TTT', title: 'Test-Teach-Test (TTT)', description: 'Identify and address specific knowledge gaps. The AI structures activities to first assess student understanding (Test), provide targeted instruction (Teach), and then re-evaluate for progress (Test).', icon: <RuleIcon className="h-8 w-8" /> },
];

const faqData = [
    { id: 'faq1', question: 'Is this just another AI content generator like ChatGPT?', answer: 'Not at all. While we use powerful AI, Avidato is a purpose-built tool for educators. Instead of generic text, you get structured, pedagogically-sound lesson plans with specific sections like warm-ups, vocabulary, and activities, all tailored to your student\'s profile.' },
    { id: 'faq2', question: 'Will the AI-generated lessons actually be good?', answer: 'Yes. Our AI is trained on educational frameworks like PPP, TBL, and TTT. It understands the flow of an effective language lesson. We encourage you to use the generated plans as a strong first draft that you can then quickly adapt with your own professional expertise, saving you 90% of the prep time.' },
    { id: 'faq3', question: 'I\'m not very tech-savvy. Is this complicated to use?', answer: 'Not at all! We designed the interface to be as simple and intuitive as possible. The entire process, from adding a student to generating a complete lesson, takes just a few clicks. If you can use email, you can use Avidato.' },
    { id: 'faq4', question: 'Can I customize the plans, or am I stuck with what the AI gives me?', answer: 'You have full control. The AI provides a comprehensive template. You can then copy the text for any section and easily edit or add your own ideas and activities before your class. The goal is to accelerate your workflow, not replace your creativity.' },
    { id: 'faq5', question: 'What happens if I hit my daily limit on the free plan?', answer: 'You\'ll see a friendly message letting you know you\'ve reached your limit for the day. Your limit will reset to 5 new lesson plans at midnight (your local time). To generate unlimited lessons anytime, you can upgrade to our Pro plan.' },
    { id: 'faq6', question: 'Do my students need an account to see the lessons?', answer: 'No, and that\'s one of the best features! When you share a lesson, it creates a unique, public link. Your student can open it on any device to see the beautifully formatted lesson plan without needing to log in or create an account.' },
];

const pricingPlans = [
    { title: 'Starter', description: 'Perfect for trying things out.', price: { monthly: 0, annual: 0 }, buttonText: 'Get Started', features: ['5 lesson plans / day', 'Unlimited students', 'Shareable lesson links'] },
    { title: 'Pro', description: 'For the dedicated professional tutor.', price: { monthly: 15, annual: 12 }, buttonText: 'Upgrade to Pro', features: ['<strong>Everything in Starter, plus:</strong>', '<strong>Unlimited</strong> lesson plans', 'Priority email support'], isPopular: true },
    { title: 'Premium', description: 'For small teams and power users.', price: { monthly: 40, annual: 32 }, buttonText: 'Choose Premium', features: ['<strong>Everything in Pro, plus:</strong>', 'Team access (up to 3 tutors)', 'Custom branding on shared links'] },
];

// --- Main Landing Page Component ---
const LandingPage: React.FC = () => {
  // --- State for Interactive Elements ---
  const [expandedFaq, setExpandedFaq] = useState<string | false>('faq1');
  const [pricingTier, setPricingTier] = useState<'monthly' | 'annual'>('monthly');
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number>(1); // Default to highlighting the 'Pro' plan
  const [activeMethod, setActiveMethod] = useState('PPP');

  // --- Typewriter Effect Hook ---
  const [text] = useTypewriter({
    words: ['Stop Planning, Start Teaching.', 'Personalize lessons.', 'Focus On Your Students.'],
    loop: 0, typeSpeed: 60, deleteSpeed: 40, delaySpeed: 1500,
  });

  const currentMethod = methodologies.find(m => m.id === activeMethod);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PublicNavbar />

      <main className="flex-grow">
        {/* === HERO SECTION === */}
        <section className="relative overflow-hidden">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="container mx-auto px-4 py-20 md:py-24 z-10 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4 min-h-[120px] md:min-h-[150px]">
                  <span className="text-brand-primary">{text}</span>
                  <Cursor cursorColor="#3d74b5" />
                </h1>
                <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 mb-8">
                  Your AI assistant for creating tailored language lesson plans in minutes, not hours. Reclaim your time and focus on what you do best.
                </p>
                <Link href="/signup" className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-brand-primary rounded-full hover:bg-brand-accent transition-colors">
                    Get Started for Free
                    <ArrowForwardIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
              <div className="w-full h-80 lg:h-96 rounded-2xl shadow-2xl overflow-hidden">
                <div style={{ backgroundImage: `url(/images/tutor-hero.png)` }} className="w-full h-full bg-cover bg-center" />
              </div>
            </div>
          </div>
        </section>

        {/* === FEATURES SECTION === */}
        <section id="features" className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-brand-primary uppercase tracking-wider">Why You'll Love It</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mt-2">
                  A Smarter Way to Prepare Lessons
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-brand-primary transition-all duration-300">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === 'IN ACTION' SECTION === */}
        <section className="py-20 md:py-28 bg-gray-50 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <p className="text-sm font-semibold text-brand-primary uppercase tracking-wider">SEE IT IN ACTION</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mt-2 mb-6">From Idea to Lesson in 3 Clicks</h2>
                <p className="text-base text-gray-600 mb-8">Our intuitive workflow takes the guesswork out of planning. Simply define your student's needs, and let our AI handle the heavy lifting.</p>
                <ul className="space-y-4">
                  <li className="flex items-start"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white font-bold mr-4">1</span><span><strong className="font-semibold">Add Student:</strong> Enter your student's goals and proficiency level.</span></li>
                  <li className="flex items-start"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white font-bold mr-4">2</span><span><strong className="font-semibold">Generate Outline:</strong> Get a 10-lesson course structure in seconds.</span></li>
                  <li className="flex items-start"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white font-bold mr-4">3</span><span><strong className="font-semibold">Create Lesson:</strong> Generate a detailed, activity-packed plan.</span></li>
                </ul>
              </div>
              <div className="relative h-96 flex items-center justify-center">
                <div className="shadow-2xl rounded-xl w-full max-w-sm transform rotate-3 hover:-rotate-1 transition-transform duration-300 z-10 bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Lesson 3/10: Travel</p>
                    <h3 className="text-xl font-bold mb-2 mt-1">Discussing Future Trips</h3>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center"><div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div><p>Warm-up: Dream Vacation</p></div>
                      <div className="flex items-center"><div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div><p>Vocabulary: Booking & Itinerary</p></div>
                      <div className="flex items-center"><div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div><p>Grammar: Future Tense</p></div>
                      <div className="flex items-center opacity-50"><div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div><p>Activity: Roleplay at the Airport</p></div>
                    </div>
                </div>
                <div className="absolute top-10 left-0 w-24 h-12 flex items-center justify-center rounded-lg -rotate-12 bg-white shadow-lg"><p className="text-xs">Student: Alex</p></div>
                <div className="absolute bottom-10 right-0 w-16 h-16 flex items-center justify-center rounded-full bg-brand-primary text-white rotate-12 shadow-lg"><AutoAwesomeIcon className="w-8 h-8"/></div>
              </div>
            </div>
          </div>
        </section>

        {/* === PEDAGOGY SECTION === */}
        <section id="pedagogy" className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-brand-primary uppercase tracking-wider">Built on Proven Pedagogy</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mt-2">Grounded in Teaching Science</h2>
              <p className="mt-4 max-w-3xl mx-auto text-gray-600 text-lg">
                Our AI doesn't just write content; it structures lessons using methodologies you know and trust, ensuring effective and engaging learning experiences.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="flex flex-col space-y-2 lg:col-span-1">
                {methodologies.map((method) => (
                  <button key={method.id} onClick={() => setActiveMethod(method.id)} className={`p-4 justify-start text-left transition-all duration-200 rounded-xl ${activeMethod === method.id ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                    <span className="font-bold">{method.title}</span>
                  </button>
                ))}
              </div>
              <div className="lg:col-span-2">
                <div key={activeMethod} className="p-8 rounded-xl border border-gray-200 animate-fade-in bg-white">
                  <div className="flex flex-row space-x-3 items-center">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      {currentMethod?.icon}
                    </div>
                    <div><h3 className="text-xl font-bold text-gray-900">{currentMethod?.title}</h3></div>
                  </div>
                  <p className="mt-6 text-base text-gray-600">{currentMethod?.description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === PRICING SECTION === */}
        <section id="pricing" className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Choose the Plan That's Right for You</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Join for free. Upgrade for unlimited power.</p>
            </div>
            <div className="flex justify-center mb-10">
              <div className="inline-flex rounded-full bg-gray-200 p-1">
                <button onClick={() => setPricingTier('monthly')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${pricingTier === 'monthly' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Monthly</button>
                <button onClick={() => setPricingTier('annual')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${pricingTier === 'annual' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Annual (Save 20%)</button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {pricingPlans.map((plan, index) => {
                const isHighlighted = hoveredCardIndex === index;
                return (
                  <div key={plan.title} onMouseEnter={() => setHoveredCardIndex(index)} onMouseLeave={() => setHoveredCardIndex(1)} className={`p-8 rounded-xl flex flex-col h-full relative transition-all duration-300 ${isHighlighted ? 'bg-gradient-to-br from-brand-primary to-brand-accent text-white shadow-2xl transform scale-105' : 'bg-white text-gray-900 border border-gray-200'}`}>
                    {plan.isPopular && isHighlighted && (<div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white text-brand-primary px-3 py-1 rounded-full text-sm font-semibold shadow-md">Most Popular</div>)}
                    <h3 className="text-xl font-bold">{plan.title}</h3>
                    <p className={`mt-2 min-h-[48px] ${isHighlighted ? 'opacity-90' : 'text-gray-500'}`}>{plan.description}</p>
                    <div className="mt-6 text-4xl font-extrabold">${pricingTier === 'monthly' ? plan.price.monthly : plan.price.annual}{plan.price.monthly > 0 && <span className={`text-lg font-normal ${isHighlighted ? 'opacity-70' : 'text-gray-500'}`}> / month</span>}</div>
                    <div className="flex-grow" />
                    <Link href="/signup" className={`block w-full text-center mt-8 py-2.5 rounded-md font-semibold transition-colors ${isHighlighted ? 'bg-white text-brand-primary hover:bg-gray-100' : 'border border-brand-primary text-brand-primary hover:bg-brand-primary/5'}`}>{plan.buttonText}</Link>
                    <ul className="mt-8 space-y-4 text-left text-sm">
                      {plan.features.map((feature, fIndex) => (<li key={fIndex} className="flex items-start">
                        <CheckCircleIcon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${isHighlighted ? 'text-white' : 'text-brand-secondary'}`} />
                        <span dangerouslySetInnerHTML={{ __html: feature }} />
                      </li>))}
                    </ul>
                  </div>);
              })}
            </div>
          </div>
        </section>

        {/* === FAQ SECTION === */}
        <section id="faq" className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-brand-primary uppercase tracking-wider">ANSWERS TO YOUR QUESTIONS</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mt-2">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col space-y-2">
                {faqData.map((faq) => (
                  <div key={faq.id} className={`border border-gray-200 rounded-xl transition-all ${expandedFaq === faq.id ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
                    <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? false : faq.id)} className="w-full flex justify-between items-center text-left p-4">
                      <h3 className={`font-semibold text-lg ${expandedFaq === faq.id ? 'text-brand-primary' : 'text-gray-800'}`}>{faq.question}</h3>
                      <AddIcon className={`w-6 h-6 text-brand-primary transition-transform ${expandedFaq === faq.id ? 'rotate-45' : ''}`} />
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="p-4 pt-0 animate-fade-in">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* === FINAL CTA SECTION === */}
        <section className="py-20 md:py-28 text-center bg-gray-50">
          <div className="container mx-auto px-4 max-w-md">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-6">Ready to Cut Your Prep Time in Half?</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">Join today and experience the future of lesson planning. The first 5 lesson plans are on us.</p>
            <Link href="/signup" className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-brand-primary rounded-full hover:bg-brand-accent transition-colors">
                Start Generating Lessons
                <ArrowForwardIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>
      </main>

     <PublicFooter />
    </div>
  );
};

export default LandingPage;