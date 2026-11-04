import React from 'react';
import { AcademicResource } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { FileText, Download, Eye, Flag, ArrowUpDown } from 'lucide-react';
import { formatFileSize, formatDate } from '../../../lib/utils';

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
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border-light bg-surface-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-light bg-surface-bg text-xs font-semibold text-text-muted">
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
                  <td className="py-3 px-4 font-medium max-w-xs truncate">
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
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onReport(res)}
                        title="Report an issue"
                        className="p-1.5 text-text-subtle hover:text-brand-red hover:bg-red-50 rounded transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelect(res)}
                        className="h-7 px-2 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          alert(`Starting download for: ${res.title}`);
                        }}
                        className="h-7 px-2.5 text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Get
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

