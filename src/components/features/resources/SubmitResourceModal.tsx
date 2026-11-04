import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { COURSES } from '../../../lib/mockData';
import { ResourceType } from '../../../types';
import { UploadCloud, CheckCircle, FileText, AlertCircle, X } from 'lucide-react';
import { formatFileSize } from '../../../lib/utils';

interface SubmitResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newResourceTitle: string) => void;
}

export const SubmitResourceModal: React.FC<SubmitResourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [courseCode, setCourseCode] = useState('STA 211');
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('Past Question');
  const [session, setSession] = useState('2024/2025');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resourceTypes: ResourceType[] = [
    'Past Question',
    'Lecture Note',
    'Course Outline',
    'Tutorial Sheet',
    'Reference Material',
  ];

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const maxBytes = 15 * 1024 * 1024; // 15MB limit per spec Section 12.4
    if (selectedFile.size > maxBytes) {
      setError('File size exceeds the 15MB limit. Please compress the PDF before uploading.');
      return;
    }
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf')) {
      setError('Invalid file format. Please upload a PDF, DOCX, or ZIP file.');
      return;
    }
    setFile(selectedFile);
    if (!title) {
      // Auto-suggest title based on filename
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(`${courseCode} ${cleanName}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drag-and-drop a document to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a descriptive title for this academic material.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    // Simulate progress animation (inspired by Image 09)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      onSuccess(title);
      onClose();
      // Reset form
      setFile(null);
      setTitle('');
      setUploadProgress(0);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Academic Material" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Notice alert */}
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-brand-deep flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
          <span>
            Thank you for contributing! All student submissions are vetted by the ASSON Academic Editorial Committee before being published to protect accuracy.
          </span>
        </div>

        {/* Course Code Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Course Code *
            </label>
            <select
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full rounded-lg border border-border-light bg-surface-card px-3 py-2 text-sm text-text-main focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            >
              {COURSES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Academic Session *
            </label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="e.g. 2024/2025"
              className="w-full rounded-lg border border-border-light bg-surface-card px-3 py-2 text-sm text-text-main focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
              required
            />
          </div>
        </div>

        {/* Resource Category */}
        <div>
          <label className="block text-xs font-semibold text-text-main mb-1.5">
            Material Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {resourceTypes.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setResourceType(type)}
                className={`text-xs p-2 rounded-lg text-left font-medium border transition-colors ${
                  resourceType === type
                    ? 'border-brand-green bg-brand-light text-brand-deep font-semibold'
                    : 'border-border-light bg-surface-card text-text-muted hover:bg-surface-bg'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Title input */}
        <Input
          label="Material Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. STA 211 Final Exam (2024) with Worked Solutions"
          required
        />

        {/* Drag and drop upload zone (inspired by Image 09) */}
        <div>
          <label className="block text-xs font-semibold text-text-main mb-1.5">
            Attach Document (PDF, max 15MB) *
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-border-light hover:border-brand-green rounded-xl p-6 text-center cursor-pointer transition-colors bg-surface-bg/50 group"
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".pdf,.docx,.zip"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-text-main">
                Click to browse or drag and drop your file here
              </p>
              <p className="text-[11px] text-text-muted">
                PDF format preferred • Maximum file size 15MB
              </p>
            </div>
          </div>
        </div>

        {/* Attached file row & progress (inspired by Image 09) */}
        {file && (
          <div className="p-3 rounded-lg border border-border-light bg-surface-card space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-brand-green shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-main truncate">{file.name}</p>
                  <p className="text-[11px] text-text-muted">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 text-text-muted hover:text-brand-red rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isUploading && (
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-green transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-muted text-right">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-brand-red flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-3 border-t border-border-light flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isUploading} disabled={!file || !title.trim()}>
            Submit for Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

