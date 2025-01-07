import { Clock, DollarSign, Users, Globe, CheckCircle, BarChart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-24 max-w-7xl mx-auto relative">
      {/* Sample Link */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-700">
          <span className="font-medium">New:</span> Check out a sample interview to see how it works!
        </div>
        <Link href="/sample">
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
            View Sample
          </button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-6">
          Unlock the Power of AI in Your Hiring Process
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Transform your recruitment strategy with our AI-powered interview platform. Experience
          unmatched efficiency, precision, and scalability.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16">
        {/* Time & Cost Saving */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex gap-2 mb-4">
            <Clock className="w-6 h-6 text-teal-600" />
            <DollarSign className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a365d] mb-4">Time & Cost Saving</h2>
          <p className="text-gray-600">
            Streamlined 15-minute interviews with instant feedback, eliminating scheduling
            delays and reducing operational costs.
          </p>
        </div>

        {/* Interview More Candidates */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex gap-2 mb-4">
            <Users className="w-6 h-6 text-teal-600" />
            <Globe className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a365d] mb-4">Interview More Candidates</h2>
          <p className="text-gray-600">
            24/7 automated interviews across time zones, enabling higher candidate
            volume without overwhelming your HR team.
          </p>
        </div>

        {/* Unbiased and Consistent Evaluation */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a365d] mb-4">Unbiased and Consistent Evaluation</h2>
          <p className="text-gray-600">
            Fair, objective assessments ensuring every candidate is evaluated equally
            based on skills and experience.
          </p>
        </div>

        {/* Instant Feedback & Insights */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex gap-2 mb-4">
            <BarChart className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a365d] mb-4">Instant Feedback & Insights</h2>
          <p className="text-gray-600">
            Real-time, data-driven evaluation with detailed reports on candidate
            performance and potential.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <Link href="/interview">
        <button className="bg-teal-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-teal-700 transition-colors">
          Start Your AI Interview Now
        </button>
      </Link>
    </main>
  );
}
