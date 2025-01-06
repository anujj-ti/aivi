'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2 } from 'lucide-react';

export default function ResumeUploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async (file: File) => {
    // Disabled for demo purposes
    console.log('File upload disabled for demo');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Disabled for demo purposes
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Disabled for demo purposes
  };

  const handleSubmitResume = async () => {
    if (resumeText.trim()) {
      setIsLoading(true);
      try {
        // Here we'll implement the actual text processing logic
        // For now, simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/interview/start');
      } catch (error) {
        console.error('Processing failed:', error);
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-[#1a365d] mb-8 text-center">
          Upload Your Resume
        </h1>

        {/* File upload UI (disabled for demo) */}
        <div 
          className={`border-2 border-dashed rounded-lg p-12 mb-6 text-center opacity-50
            ${isDragging ? 'border-teal-600 bg-teal-50' : 'border-gray-300'}
            transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop your resume here, or
          </p>
          <label className="bg-gray-400 text-white px-6 py-2 rounded-md text-lg font-semibold cursor-not-allowed">
            Browse Files
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              disabled
            />
          </label>
          <p className="text-sm text-gray-500 mt-4">
            PDF files only (Disabled for demo)
          </p>
        </div>

        {/* Resume text input */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#1a365d] mb-4">
            Or Paste Your Resume Content
          </h2>
          <textarea
            className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-black"
            placeholder="Paste your resume content here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <button
            className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-md text-lg font-semibold hover:bg-teal-700 transition-colors w-full"
            onClick={handleSubmitResume}
            disabled={isLoading || !resumeText.trim()}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              'Submit Resume'
            )}
          </button>
        </div>
      </div>
    </main>
  );
} 