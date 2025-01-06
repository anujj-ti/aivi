'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2 } from 'lucide-react';

export default function ResumeUploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    if (file.type === 'application/pdf') {
      setIsLoading(true);
      try {
        // Here we'll implement the actual file upload logic
        // For now, simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/interview/start');
      } catch (error) {
        console.error('Upload failed:', error);
        setIsLoading(false);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleUpload(files[0]);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-[#1a365d] mb-8 text-center">
          Upload Your Resume
        </h1>

        <div 
          className={`border-2 border-dashed rounded-lg p-12 mb-6 text-center
            ${isDragging ? 'border-teal-600 bg-teal-50' : 'border-gray-300'}
            transition-colors cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-teal-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Processing your resume...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Drag and drop your resume here, or
              </p>
              <label className="bg-teal-600 text-white px-6 py-2 rounded-md text-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer">
                Browse Files
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="text-sm text-gray-500 mt-4">
                PDF files only
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
} 