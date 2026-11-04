import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { AcademicResource } from '../../../types';
import { Flag, CheckCircle, AlertTriangle } from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: AcademicResource | null;
  onSubmit: (report: { issueType: string; description: string }) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  resource,
  onSubmit,
}) => {
  const [issueType, setIssueType] = useState('Broken / Corrupt Link');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!resource) return null;

  const issueOptions = [
    'Broken / Corrupt Link',
    'Incorrect Course Code / Title',
    'Low Resolution / Illegible Pages',
    'Wrong Academic Session',
    'Inappropriate Content',
    'Other Issue',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ issueType, description });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report an Issue" maxWidth="md">
      {submitted ? (
        <div className="py-6 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-brand-green mx-auto" />
          <h4 className="text-sm font-semibold text-text-main">Report Received</h4>
          <p className="text-xs text-text-muted">
            Thank you for helping keep the ASSON library accurate. The academic committee has been alerted.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-surface-bg border border-border-light text-xs space-y-1">
            <span className="font-semibold text-text-main">{resource.courseCode}</span>: {resource.title}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Issue Category *
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full rounded-lg border border-border-light bg-surface-card px-3 py-2 text-sm text-text-main focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            >
              {issueOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Page 3 is missing question 4b..."
              className="w-full rounded-lg border border-border-light bg-surface-card p-3 text-xs text-text-main placeholder:text-text-subtle focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green resize-none"
            />
          </div>

          <div className="pt-3 border-t border-border-light flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              <Flag className="w-3.5 h-3.5 mr-1.5" />
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

