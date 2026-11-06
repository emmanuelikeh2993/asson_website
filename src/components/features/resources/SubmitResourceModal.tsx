import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { COURSES } from '../../../lib/mockData';
import { ResourceType } from '../../../types';
import { uploadAndSubmitResource } from '../../../lib/supabase';
import { 
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  X, 
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { formatFileSize, cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';

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
  const [contributorName, setContributorName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
    const maxBytes = 15 * 1024 * 1024; // 15MB limit
    if (selectedFile.size > maxBytes) {
      setError('File size exceeds the 15MB limit. Please compress the document before uploading.');
      return;
    }
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/octet-stream'
    ];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|docx|zip)$/i)) {
      setError('Invalid file format. Please upload a PDF, DOCX, or ZIP file.');
      return;
    }
    setFile(selectedFile);
    if (!title) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(`${courseCode} ${cleanName}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drag-and-drop a document to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a descriptive title for this academic material.');
      return;
    }
    if (!hasPermission) {
      setError('Please check the permission box below to authorize ASSON UI to host this academic material.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const res = await uploadAndSubmitResource(
        {
          file,
          courseCode,
          title: title.trim(),
          resourceType,
          session,
          contributorName: contributorName.trim() || undefined,
          matricNumber: matricNumber.trim() || undefined,
        },
        (progress) => setUploadProgress(progress)
      );

      setUploadProgress(100);
      setIsUploading(false);
      setSubmittedId(res.referenceCode || res.submissionId);
      onSuccess(title);
    } catch (err: any) {
      setIsUploading(false);
      setError(err?.message || 'Upload failed. Please check your connection and try again.');
    }
  };

  const handleModalClose = () => {
    if (isUploading) return;
    if ((file || title.trim() || contributorName.trim()) && !submittedId && !showExitConfirm) {
      setShowExitConfirm(true);
      return;
    }
    forceExit();
  };

  const forceExit = () => {
    setFile(null);
    setTitle('');
    setError(null);
    setUploadProgress(0);
    setSubmittedId(null);
    setHasPermission(false);
    setShowExitConfirm(false);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleModalClose} 
      title={showExitConfirm ? "Discard Upload?" : submittedId ? "Submission Confirmed" : "Submit Academic Material"} 
      maxWidth="lg"
    >
      {showExitConfirm ? (
        /* Discard Changes / Exit Confirmation Screen */
        <div className="py-6 px-3 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-main">
              Discard Upload and Exit?
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
              You have unsaved changes. Exiting now will clear your attached file and typed details without uploading.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExitConfirm(false)}
              className="text-xs font-semibold h-9 px-4"
            >
              Keep Editing
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={forceExit}
              className="bg-brand-red hover:bg-red-700 text-white text-xs font-bold h-9 px-4 shadow-xs"
            >
              Discard & Exit
            </Button>
          </div>
        </div>
      ) : submittedId ? (
        /* Success Confirmation View */
        <div className="py-6 px-2 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-brand-green flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-brand-green border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Published Directly to Catalog
            </span>
            <h3 className="text-xl font-bold text-text-main tracking-tight">
              Material Live in ASSON Library!
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto mt-2 leading-relaxed">
              Your upload <strong className="text-text-main font-semibold">"{title}"</strong> is now live and published in the ASSON UI academic library for all students to access, preview, and download.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-bg border border-border-light text-left text-xs space-y-1.5 max-w-md mx-auto">
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">Submission Reference:</span>
              <span className="font-mono font-bold text-brand-deep">{submittedId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">Course Code:</span>
              <span className="font-semibold text-text-main">{courseCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">Status:</span>
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live & Published
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">File Size:</span>
              <span className="font-medium text-text-main">{file ? formatFileSize(file.size) : 'PDF'}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dashboard"
              onClick={forceExit}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-brand-green text-white hover:bg-brand-deep transition-colors shadow-sm"
            >
              View in Student Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
            <Button variant="ghost" onClick={forceExit} className="w-full sm:w-auto text-xs">
              Close Window
            </Button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Notice alert */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-brand-deep flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <span>
              <strong>Read it please:</strong> All uploaded academic materials are published directly to the ASSON UI library for students. Please ensure the document is genuine, legible, and belongs to the official UI curriculum.
            </span>
          </div>

          {/* Course Code Dropdown & Session */}
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

          {/* Material Category Selector */}
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
                      ? 'border-brand-green bg-brand-light text-brand-deep font-semibold shadow-xs'
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
            placeholder="e.g. STA 211 First Semester Exam (2024) with Worked Solutions"
            required
          />

          {/* Contributor Details (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Your Name <span className="text-text-subtle font-normal">(Optional, for credit)</span>
              </label>
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder="e.g. Insight Adewale"
                className="w-full rounded-lg border border-border-light bg-surface-card px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Matriculation Number <span className="text-text-subtle font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                placeholder="e.g. UI/2023/12345"
                className="w-full rounded-lg border border-border-light bg-surface-card px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>

          {/* Drag and drop upload zone */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Attach Document (PDF, DOCX, ZIP • Max 15MB) *
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

          {/* Attached file row & progress */}
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
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 text-text-muted hover:text-brand-red rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-green transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted text-right font-medium">Uploading to cloud storage... {uploadProgress}%</p>
                </div>
              )}
            </div>
          )}

          {/* Permission to Upload & Academic Verification Checkbox */}
          <div className={cn(
            "p-3.5 sm:p-4 rounded-xl border transition-all duration-200 select-none",
            hasPermission 
              ? "bg-emerald-50/80 border-brand-green/50 shadow-xs" 
              : "bg-surface-bg border-border-light hover:border-gray-300"
          )}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPermission}
                onChange={(e) => {
                  setHasPermission(e.target.checked);
                  if (error) setError(null);
                }}
                className="mt-0.5 rounded border-border-light text-brand-green focus:ring-brand-green h-4 w-4 shrink-0 cursor-pointer accent-brand-green"
              />
              <div className="text-xs space-y-1">
                <div className="font-bold text-text-main flex items-center gap-1.5">
                  <ShieldCheck className={cn("w-4 h-4", hasPermission ? "text-brand-green" : "text-text-muted")} />
                  <span>Permission to Upload & Academic Rights Confirmation *</span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  I confirm that this document is genuine, legible, and directly belongs to the official University of Ibadan curriculum. I authorize ASSON UI to host, index, and distribute this material to students for study and revision purposes.
                </p>
              </div>
            </label>
          </div>

          {/* Requirements Checklist Indicators */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium pt-1">
            <span className="text-text-muted text-[11px] mr-1">Checklist:</span>
            <span className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] transition-colors",
              file 
                ? "bg-emerald-50 text-brand-green border-emerald-200" 
                : "bg-gray-50 text-text-muted border-gray-200"
            )}>
              {file ? <CheckCircle2 className="w-3 h-3 text-brand-green" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
              Document Attached
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] transition-colors",
              title.trim() 
                ? "bg-emerald-50 text-brand-green border-emerald-200" 
                : "bg-gray-50 text-text-muted border-gray-200"
            )}>
              {title.trim() ? <CheckCircle2 className="w-3 h-3 text-brand-green" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
              Title Provided
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] transition-colors",
              hasPermission 
                ? "bg-emerald-50 text-brand-green border-emerald-200" 
                : "bg-gray-50 text-text-muted border-gray-200"
            )}>
              {hasPermission ? <CheckCircle2 className="w-3 h-3 text-brand-green" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
              Permission Granted
            </span>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-brand-red flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit & Cancel Actions */}
          <div className="pt-3 border-t border-border-light flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleModalClose} 
              disabled={isUploading}
              className="w-full sm:w-auto text-xs font-semibold hover:bg-red-50 hover:text-brand-red hover:border-red-200 transition-colors"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Cancel & Exit
            </Button>

            <Button 
              type="submit" 
              variant="primary" 
              isLoading={isUploading} 
              disabled={!file || !title.trim() || !hasPermission}
              className={cn(
                "w-full sm:w-auto text-xs font-bold px-5 h-9 transition-all shadow-xs",
                (!file || !title.trim() || !hasPermission) && "opacity-55 cursor-not-allowed bg-gray-300 text-gray-600 hover:bg-gray-300"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              {(!file || !title.trim() || !hasPermission) ? 'Complete Checklist to Confirm' : 'Confirm & Upload Material'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
