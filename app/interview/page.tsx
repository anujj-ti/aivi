import Link from 'next/link';

export default function InterviewPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-[#1a365d] mb-8 text-center">
          Welcome to Your AI Interview
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#1a365d] mb-4">What to Expect:</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              The interview will last 15 minutes
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              Questions will be tailored to your resume
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              You&apos;ll receive real-time feedback on your responses
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              A final summary will be provided at the end
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#1a365d] mb-4">Tips for Success:</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              Speak clearly and concisely
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              Take a moment to think before answering
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              Provide specific examples when possible
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              Stay relaxed and be yourself
            </li>
          </ul>
        </section>

        <div className="flex justify-center">
          <Link href="/interview/upload">
            <button className="bg-teal-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-teal-700 transition-colors">
              Start Interview
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
} 