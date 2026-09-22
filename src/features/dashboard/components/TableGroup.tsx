import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { Edit3, Trash2, Download, Share2, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export interface GroupItem {
  id: string;
  title: string;
  description?: string;
  createdTime: string;
  isPublic?: boolean;
}

export interface GroupsTableProps {
  data: GroupItem[];
  onTogglePublic?: (id: string) => void;
  onAction?: (action: 'edit' | 'share' | 'delete' | 'download', id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
}

export function TableGroup({ data, onTogglePublic, onAction, onBulkDelete }: GroupsTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(data.map(d => d.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.length) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-600">{selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected</span>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="ml-auto">
            <Trash2 className="h-4 w-4 mr-2" />
            {t('common.delete')}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-white w-12">
                <Checkbox checked={data.length > 0 && selectedIds.length === data.length} onChange={handleSelectAll} aria-label="Select all" />
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-white">{t('solutionDashboards.table.title')}</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-white">{t('solutionDashboards.table.createdTime')}</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-white">{t('createGroup.shareGroup') || 'Share Group'}</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-white">{t('solutionDashboards.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-gray-500">{t('common.loading')}</td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={item.id} className="border-b border-dotted border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 w-12">
                    <Checkbox checked={selectedIds.includes(item.id)} onChange={(e) => handleSelectOne(item.id, e)} aria-label={`Select ${item.title}`} />
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div>{item.title}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{item.createdTime}</td>
                  <td className="py-4 px-4 text-sm text-gray-600 flex items-center justify-center">
                    <Checkbox checked={!!item.isPublic} onChange={() => onTogglePublic && onTogglePublic(item.id)} aria-label={`Public ${item.title}`} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onAction && onAction('edit', item.id)} className="p-1.5 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded transition-colors" title="Edit">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => onAction && onAction('share', item.id)} className="p-1.5 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded transition-colors" title="Share">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => onAction && onAction('delete', item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => onAction && onAction('download', item.id)} className="p-1.5 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded transition-colors" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end mt-4 gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronsLeft className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
        <div className="text-sm text-gray-600">Page 1 of 1</div>
        <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronsRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
