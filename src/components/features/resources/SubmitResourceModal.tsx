import React, { useState, useMemo } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { COURSES } from '../../../lib/mockData';
import { ResourceType, AcademicLevel } from '../../../types';
import { uploadAndSubmitResource } from '../../../lib/supabase';
import {
  UploadCloud,
  CheckCircle2,
  FileText,
  BookOpen,
  HelpCircle,
  Code2,
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  FileCheck2,
  FolderOpen
} from 'lucide-react';
import { formatFileSize, cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';

interface SubmitResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newResourceTitle: string) => void;
}

type Step = 1 | 2 | 3;

export const SubmitResourceModal: React.FC<SubmitResourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [courseCode, setCourseCode] = useState('STA 211');
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<AcademicLevel | 'All'>('All');
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('Past Question');
  const [session, setSession] = useState('2024/2025');
  const [contributorName, setContributorName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submittedReceipt, setSubmittedReceipt] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Suggestions chips for quick tap
  const popularCourseSuggestions = ['STA 111', 'STA 211', 'STA 231', 'STA 312', 'MAT 121', 'STA 421'];

  // Sessions chips
  const sessionOptions = ['2024/2025', '2023/2024', '2022/2023', '2021/2022', '2020/2021'];

  // Filtered courses for Step 1
  const filteredCourses = useMemo(() => {
    return COURSES.filter((c) => {
      if (selectedLevelFilter !== 'All' && c.level !== selectedLevelFilter) return false;
      if (courseSearch.trim() !== '') {
        const q = courseSearch.toLowerCase().trim();
        return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedLevelFilter, courseSearch]);

  const selectedCourseMeta = useMemo(() => {
    return COURSES.find((c) => c.code === courseCode) || {
      code: courseCode,
      title: 'Departmental Academic Course',
      level: '200',
      units: 3,
    };
  }, [courseCode]);

  // Material types with icons and descriptions
  const materialTypeOptions: { type: ResourceType; label: string; desc: string; icon: any }[] = [
    {
      type: 'Past Question',
      label: 'Past Question',
      desc: 'Official examination papers, class test questions, or marking guides.',
      icon: FileText,
    },
    {
      type: 'Lecture Note',
      label: 'Lecture Note',
      desc: 'Course syllabus outlines, lecture slide notes, or theoretical handouts.',
      icon: BookOpen,
    },
    {
      type: 'Tutorial Sheet',
      label: 'Tutorial Sheet',
      desc: 'Weekly problem sets, practice exercises, or worked student solutions.',
      icon: HelpCircle,
    },
    {
      type: 'Reference Material',
      label: 'Practical / Lab Script',
      desc: 'Statistical computing code in R, Python, SPSS, or lab datasets.',
      icon: Code2,
    },
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
      setError('File size exceeds 15MB limit. Please compress document before uploading.');
      return;
    }
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const hasValidExtension = Boolean(selectedFile.name.match(/\.(pdf|docx)$/i));
    const hasValidMime = validTypes.includes(selectedFile.type) || (selectedFile.type === '' && hasValidExtension);
    if (!hasValidExtension || !hasValidMime) {
      setError('Invalid format. Per ASSON security guidelines, only verified PDF and DOCX files are permitted. Archives (.zip) are strictly prohibited.');
      return;
    }
    setFile(selectedFile);
    if (!title || title.trim() === `${courseCode} Academic Material`) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(`${courseCode} ${cleanName}`);
    }
  };

  const handleNextFromStep1 = () => {
    if (!courseCode) {
      setError('Please select a course code to proceed.');
      return;
    }
    setError(null);
    if (!title) {
      setTitle(`${courseCode} ${resourceType} (${session})`);
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!title.trim()) {
      setTitle(`${courseCode} ${resourceType} (${session})`);
    }
    setError(null);
    setCurrentStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drag-and-drop a document to upload.');
      return;
    }
    if (!hasPermission) {
      setError('Please check the permission box below to authorize ASSON UI to host this academic material.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(15);

    try {
      const res = await uploadAndSubmitResource(
        {
          file,
          courseCode,
          title: title.trim() || `${courseCode} ${resourceType} (${session})`,
          resourceType,
          session,
          contributorName: contributorName.trim() || undefined,
        },
        (progress) => setUploadProgress(progress)
      );

      setUploadProgress(100);
      setIsUploading(false);
      setSubmittedReceipt(res.referenceCode || res.submissionId);
      onSuccess(title);
    } catch (err: any) {
      setIsUploading(false);
      setError(err?.message || 'Upload failed. Please check your connection and try again.');
    }
  };

  const handleModalClose = () => {
    if (isUploading) return;
    if ((file || title.trim() || contributorName.trim()) && !submittedReceipt && !showExitConfirm) {
      setShowExitConfirm(true);
      return;
    }
    forceExit();
  };

  const forceExit = () => {
    setCurrentStep(1);
    setFile(null);
    setTitle('');
    setError(null);
    setUploadProgress(0);
    setSubmittedReceipt(null);
    setHasPermission(false);
    setShowExitConfirm(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={
        showExitConfirm
          ? 'Discard Upload?'
          : submittedReceipt
          ? 'Upload Confirmed'
          : 'Contribute Academic Material'
      }
      maxWidth="lg"
    >
      {showExitConfirm ? (
        /* Discard Confirmation Screen */
        <div className="py-6 px-3 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-main">
              Discard Upload and Exit?
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
              You have unsaved upload details. Exiting will clear your attached document.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExitConfirm(false)}
              className="text-xs font-semibold h-9 px-4"
            >
              Continue Uploading
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={forceExit}
              className="text-xs font-semibold h-9 px-4"
            >
              Discard & Close
            </Button>
          </div>
        </div>
      ) : submittedReceipt ? (
        /* Celebratory Completion State (Inspired by Dribbble Frame 4) */
        <div className="py-6 px-2 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-brand-green border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-brand-green border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Live in Public Library
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
              Material Published Successfully!
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto mt-1 leading-relaxed">
              Your document <strong className="text-text-main font-semibold">"{title}"</strong> is now live in the ASSON UI repository for all students to preview and download.
            </p>
          </div>

          {/* Receipt Box */}
          <div className="p-4 rounded-2xl bg-surface-bg border border-border-light text-left text-xs space-y-2 max-w-md mx-auto shadow-2xs">
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">Tracking Receipt:</span>
              <span className="font-mono font-bold text-brand-deep bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {submittedReceipt}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">Course:</span>
              <span className="font-bold text-text-main">{courseCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">Type & Session:</span>
              <span className="font-medium text-text-main">{resourceType} ({session})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-light">
              <span className="text-text-muted">File Size:</span>
              <span className="font-medium text-text-main">{file ? formatFileSize(file.size) : 'PDF'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Verification Status:</span>
              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Verified & Accessible
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dashboard"
              onClick={forceExit}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold rounded-xl bg-brand-green text-white hover:bg-brand-deep transition-all shadow-sm active:scale-95"
            >
              View in Student Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setSubmittedReceipt(null);
                setCurrentStep(1);
                setFile(null);
                setTitle('');
              }}
              className="w-full sm:w-auto text-xs font-semibold h-10 px-4"
            >
              Submit Another Document
            </Button>
          </div>
        </div>
      ) : (
        /* Multi-Step Interactive Journey (Inspired by Dribbble Reference) */
        <div className="space-y-6">
          {/* Stepper Header Bar */}
          <div className="flex items-center justify-between border-b border-border-light pb-4">
            {[
              { num: 1, label: 'Course' },
              { num: 2, label: 'Material Details' },
              { num: 3, label: 'Upload & Submit' },
            ].map((step, idx) => {
              const isDone = currentStep > step.num;
              const isActive = currentStep === step.num;

              return (
                <React.Fragment key={step.num}>
                  <div
                    onClick={() => {
                      if (currentStep > step.num) setCurrentStep(step.num as Step);
                    }}
                    className={`flex items-center gap-2 transition-all ${
                      isDone ? 'cursor-pointer group' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-amber-400 text-amber-950 font-extrabold shadow-2xs'
                          : isActive
                          ? 'bg-brand-deep text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                    </div>
                    <span
                      className={`text-xs font-bold transition-colors hidden sm:inline ${
                        isActive
                          ? 'text-brand-deep'
                          : isDone
                          ? 'text-text-main group-hover:text-brand-green'
                          : 'text-text-subtle'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {idx < 2 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                        currentStep > idx + 1 ? 'bg-amber-400' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* STEP 1: Course Selection (Inspired by Dribbble Frame 1) */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold text-text-main block mb-1">
                  Step 1: Select Academic Course <span className="text-brand-red">*</span>
                </label>
                <p className="text-[11px] text-text-muted mb-3">
                  Select the University of Ibadan course code for this academic document.
                </p>

                {/* Course Search & Filter */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by course code or title (e.g. STA 211, MAT 121)..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>

                {/* Level Quick Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
                  {(['All', '100', '200', '300', '400', 'Postgraduate'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevelFilter(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                        selectedLevelFilter === lvl
                          ? 'bg-brand-green text-white shadow-2xs'
                          : 'bg-neutral-100 text-text-muted hover:bg-neutral-200'
                      }`}
                    >
                      {lvl === 'All' ? 'All' : lvl === 'Postgraduate' ? 'PG' : `${lvl}L`}
                    </button>
                  ))}
                </div>

                {/* Suggestions / Quick Tap Chips */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-subtle block mb-1.5">
                    Popular Suggestions:
                  </span>
                  <div className="flex items-center flex-wrap gap-1.5">
                    {popularCourseSuggestions.map((code) => {
                      const isSelected = courseCode === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setCourseCode(code);
                            setError(null);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs scale-105'
                              : 'bg-surface-bg hover:bg-neutral-100 text-text-main border border-border-light'
                          }`}
                        >
                          {code}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Course Dropdown Selector */}
                <div>
                  <label className="text-[11px] font-bold text-text-subtle block mb-1">
                    Select from Course Catalog ({filteredCourses.length} available):
                  </label>
                  <select
                    value={courseCode}
                    onChange={(e) => {
                      setCourseCode(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs font-semibold focus:outline-none focus:border-brand-green"
                  >
                    {filteredCourses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.title} ({c.level}L, {c.units} Units)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Course Card Confirmation */}
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-deep block">
                      Selected: {selectedCourseMeta.code}
                    </span>
                    <span className="text-[11px] text-emerald-800 line-clamp-1">
                      {selectedCourseMeta.title} • {selectedCourseMeta.level}L ({selectedCourseMeta.units} Units)
                    </span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 ml-2" />
                </div>
              </div>

              {error && (
                <p className="text-xs text-brand-red font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </p>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextFromStep1}
                  className="font-bold text-xs h-10 px-5 active:scale-95"
                >
                  Continue to Material Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Material Details & Session (Inspired by Dribbble Frame 2) */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold text-text-main block mb-1">
                  Step 2: Choose Material Type & Session <span className="text-brand-red">*</span>
                </label>
                <p className="text-[11px] text-text-muted mb-3">
                  Categorize this document so students searching for past questions or notes find it instantly.
                </p>

                {/* Material Type Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {materialTypeOptions.map((opt) => {
                    const isSelected = resourceType === opt.type;
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.type}
                        onClick={() => {
                          setResourceType(opt.type);
                          setTitle(`${courseCode} ${opt.type} (${session})`);
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                          isSelected
                            ? 'border-brand-green bg-emerald-50/80 shadow-xs ring-2 ring-brand-green/20'
                            : 'border-border-light bg-surface-card hover:border-border-hover'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-brand-green text-white'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-main">
                              {opt.label}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-brand-green bg-brand-green text-white'
                                  : 'border-neutral-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Session Selector Chips */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-text-main block mb-1.5">
                    Academic Session
                  </span>
                  <div className="flex items-center flex-wrap gap-1.5">
                    {sessionOptions.map((sess) => {
                      const isSelected = session === sess;
                      return (
                        <button
                          key={sess}
                          type="button"
                          onClick={() => {
                            setSession(sess);
                            setTitle(`${courseCode} ${resourceType} (${sess})`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-deep text-white shadow-2xs font-bold'
                              : 'bg-surface-bg hover:bg-neutral-100 text-text-main border border-border-light'
                          }`}
                        >
                          {sess}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Document Title Input */}
                <div>
                  <label className="text-xs font-bold text-text-main block mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. STA 211 Past Examination Paper (2023/2024)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                  />
                  <p className="text-[10px] text-text-subtle mt-1">
                    Auto-generated from your selection; customize if you wish.
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-xs text-brand-red font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </p>
              )}

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="font-semibold text-xs h-10 px-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextFromStep2}
                  className="font-bold text-xs h-10 px-5 active:scale-95"
                >
                  Continue to Upload <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: File Upload & Submission (Inspired by Dribbble Frame 3) */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
              {/* Summary Strip of Step 1 & 2 */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-text-muted text-[11px] block">Upload Target:</span>
                  <span className="font-bold text-brand-deep">
                    {courseCode} • {resourceType} ({session})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-brand-green hover:underline cursor-pointer"
                >
                  Edit details
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div>
                <label className="text-xs font-bold text-text-main block mb-1">
                  Attach Academic File (PDF or DOCX Only) <span className="text-brand-red">*</span>
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    file
                      ? 'border-brand-green bg-emerald-50/50'
                      : 'border-neutral-300 hover:border-brand-green bg-surface-bg'
                  }`}
                >
                  {file ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-brand-green flex items-center justify-center">
                        <FileCheck2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-main truncate max-w-xs mx-auto">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {formatFileSize(file.size)} • Document Ready for Verification
                        </p>
                      </div>
                      <label className="text-xs font-bold text-brand-green hover:underline cursor-pointer inline-flex items-center gap-1 mt-1">
                        <span>Change file</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-500 flex items-center justify-center">
                        <UploadCloud className="w-6 h-6 text-brand-green" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-brand-deep hover:underline cursor-pointer">
                          <span>Click to upload</span>
                          <input
                            type="file"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs text-text-muted"> or drag and drop</span>
                      </div>
                      <p className="text-[10px] text-text-subtle">
                        PDF or Word (.docx) documents up to 15MB. Archives (.zip) are strictly prohibited.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Peer Contributor Field (Zero Personal Data / No Matriculation Required) */}
              <div className="pt-1">
                <label className="text-xs font-bold text-text-main block mb-1">
                  Contributor Name or Course Rep Alias (Optional Credit)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tunde Balogun or 200L Course Rep (or leave blank for Anonymous)"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs focus:outline-none focus:border-brand-green"
                />
                <p className="text-[10px] text-text-subtle mt-1">
                  Per NDPA and ASSON privacy standards, matriculation numbers are never collected.
                </p>
              </div>

              {/* Upload Terms & Policy Confirmation Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border-light bg-surface-card hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPermission}
                    onChange={(e) => {
                      setHasPermission(e.target.checked);
                      setError(null);
                    }}
                    className="mt-0.5 rounded border-neutral-300 text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-xs text-text-muted leading-relaxed">
                    I have read and agree to the{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-brand-green font-semibold underline hover:text-brand-deep inline-flex items-center gap-0.5"
                    >
                      Terms of Academic Contribution
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-brand-green font-semibold underline hover:text-brand-deep inline-flex items-center gap-0.5"
                    >
                      Privacy Policy
                    </Link>
                    , and I confirm this academic material is genuine for UI Statistics scholars.
                  </span>
                </label>
              </div>

              {error && (
                <p className="text-xs text-brand-red font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </p>
              )}

              {/* Progress Bar (if uploading) */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-green h-2 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-subtle font-mono text-right block">
                    Uploading and verifying... {uploadProgress}%
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => setCurrentStep(2)}
                  className="font-semibold text-xs h-10 px-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUploading || !file}
                  className="font-bold text-xs h-11 px-6 active:scale-95 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  {isUploading ? 'Publishing Material...' : 'Publish Academic Material'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
};
