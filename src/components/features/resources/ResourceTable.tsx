import React from 'react';
import { AcademicResource } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { FileText, Download, Eye, Flag } from 'lucide-react';
import { formatFileSize } from '../../../lib/utils';
import { triggerResourceDownload } from '../../../lib/download';
import { useToast } from '../../ui/Toast';

interface ResourceTableProps {
  resources: AcademicResource[];
  selectedId?: string;
  onSelect: (resource: AcademicResource) => void;
  onReport: (resource: AcademicResource) => void;
}

export const ResourceTable: React.FC<ResourceTableProps> = ({
  resources,
  selectedId,
  onSelect,
  onReport,
}) => {
  const toast = useToast();

  const handleDownload = (e: React.MouseEvent, res: AcademicResource) => {
    e.stopPropagation();
    triggerResourceDownload(res, (title, message) => {
      toast.success(title, message);
    });
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border-light bg-surface-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-light bg-surface-bg text-xs font-bold text-text-muted">
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Resource Title</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Session</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light/60 text-xs text-text-main">
            {resources.map((res) => {
              const isSelected = selectedId === res.id;
              return (
                <tr
                  key={res.id}
                  onClick={() => onSelect(res)}
                  className={`group cursor-pointer transition-colors hover:bg-emerald-50/40 ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-l-brand-green' : ''
                  }`}
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge variant="course">{res.courseCode}</Badge>
                  </td>
                  <td className="py-3 px-4 font-semibold max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-green shrink-0" />
                      <span className="truncate group-hover:text-brand-green transition-colors">{res.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-text-muted">
                    {res.type}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-text-muted font-medium">
                    {res.session}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-text-muted">
                    {formatFileSize(res.fileSizeBytes)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge 
                      variant={res.verificationStatus === 'Verified' ? 'verified' : 'needs-review'}
                      withIcon
                    >
                      {res.verificationStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onReport(res)}
                        title="Report an issue"
                        className="p-1.5 text-text-subtle hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Report issue"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelect(res)}
                        className="h-8 px-2.5 text-xs font-semibold"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={(e) => handleDownload(e, res)}
                        className="h-8 px-3 text-xs font-bold shadow-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
