import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AssetTreeNode } from '../types';

interface AssetTreeViewProps {
  nodes: AssetTreeNode[];
  expandedNodes: string[];
  selectedAsset?: string;
  onToggleExpand: (nodeId: string) => void;
  onSelectAsset: (assetId: string) => void;
}

export const AssetTreeView = ({
  nodes,
  expandedNodes,
  selectedAsset,
  onToggleExpand,
  onSelectAsset,
}: AssetTreeViewProps) => {
  const renderNode = (node: AssetTreeNode, level = 0) => {
    const isExpanded = expandedNodes.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedAsset === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-2 rounded hover:bg-accent cursor-pointer ${
            isSelected ? 'bg-accent' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onSelectAsset(node.id)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {!hasChildren && <div className="w-5" />}
          
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-yellow-500" />
          ) : (
            <Folder className="h-4 w-4 text-yellow-500" />
          )}
          
          <span className="text-sm font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground">({node.type})</span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {nodes.map((node) => renderNode(node))}
    </div>
  );
};