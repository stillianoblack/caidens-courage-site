import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import B4ChatGate from '../components/b4/B4ChatGate';

const ChatWithB4: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream font-body">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-500 mb-4 text-left">
          Chat with B-4
        </h1>
        <p className="text-navy-600 mb-8 text-left max-w-2xl">
          B-4 is here to help with questions about Caiden&apos;s Courage, resources, and how to use our tools.
        </p>
        <B4ChatGate />
      </main>
      <Footer />
    </div>
  );
};

export default ChatWithB4;

