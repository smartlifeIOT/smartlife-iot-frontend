import { useState } from 'react';
import {
  X,
  Search,
  Layers,
  Box,
  Plus,
  Loader2,
  PieChart,
  Activity,
  BarChart2,
  Zap,
  MapPin,
  ToggleRight,
  ShieldAlert,
  Grid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWidgetBundles, useWidgetTypes } from '@/hooks/useWidgetLibraryApi';
import type { WidgetBundle, WidgetType } from '@/services/api/widgets.api';

interface WidgetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWidgetType: (widgetType: WidgetType) => void;
}

export function WidgetLibraryModal({
  isOpen,
  onClose,
  onSelectWidgetType,
}: WidgetLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<WidgetBundle | null>(
    null
  );

  // 1. Fetch Widget Bundles from https://api.smart-life.sa/widgets/bundles?system=false&page=1&limit=10
  const { data: bundlesData, isLoading: isLoadingBundles } = useWidgetBundles({
    system: false,
    page: 1,
    limit: 10,
    search: searchQuery,
  });

  // 2. Fetch Widget Types from https://api.smart-life.sa/widgets/types?system=false&page=1&limit=10
  const { data: typesData, isLoading: isLoadingTypes } = useWidgetTypes({
    system: false,
    page: 1,
    limit: 10,
    bundleFqn: selectedBundle?.title,
    search: searchQuery,
  });

  if (!isOpen) return null;

  const bundles = bundlesData?.bundles || [];
  const widgetTypes = typesData?.types || [];

  const getCategoryIcon = (cat: string, alias?: string) => {
    const key = (alias || cat).toLowerCase();
    if (key.includes('pie') || key.includes('donut'))
      return <PieChart className="w-5 h-5 text-cyan-500" />;
    if (key.includes('progress') || key.includes('gauge'))
      return <Activity className="w-5 h-5 text-emerald-500" />;
    if (key.includes('chart') || key.includes('line'))
      return <BarChart2 className="w-5 h-5 text-blue-500" />;
    if (key.includes('card') || key.includes('metric'))
      return <Zap className="w-5 h-5 text-amber-500" />;
    if (key.includes('map') || key.includes('gps'))
      return <MapPin className="w-5 h-5 text-purple-500" />;
    if (key.includes('switch') || key.includes('control'))
      return <ToggleRight className="w-5 h-5 text-indigo-500" />;
    if (key.includes('alarm') || key.includes('alert'))
      return <ShieldAlert className="w-5 h-5 text-red-500" />;
    return <Grid className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="fixed inset-0 z-50   flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900   dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Layers className="w-6 h-6  " />
            </div>
            <div>
              <h2 className="text-xl font-bold  dark:text-white">
                Widget Library
              </h2>
              <p className="text-xs   dark:text-slate-400">
                Select a widget bundle and add professional widgets to your
                dashboard
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-300 dark:hover:bg-slate-800 text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search widget bundles or widget names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          {selectedBundle && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedBundle(null)}
              className="text-xs text-slate-600 dark:text-slate-300"
            >
              Clear Selected Bundle ({selectedBundle.title})
            </Button>
          )}
        </div>

        {/* Main Content Area: Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Widget Bundles */}
          <div className="w-72 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Widget Bundles ({bundles.length})
              </span>
              {isLoadingBundles && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              )}
            </div>

            <button
              onClick={() => setSelectedBundle(null)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between text-xs font-semibold ${
                selectedBundle === null
                  ? 'bg-secondary text-white shadow-md shadow-secondary/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                <span>All Bundles</span>
              </div>
              <Badge
                variant="secondary"
                className={
                  selectedBundle === null
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700'
                }
              >
                All
              </Badge>
            </button>

            {bundles.map((bundle) => {
              const isSelected = selectedBundle?.id === bundle.id;
              return (
                <button
                  key={bundle.id}
                  onClick={() => setSelectedBundle(bundle)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-secondary text-white border-secondary shadow-md shadow-secondary/20'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-secondary/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs truncate">
                      {bundle.title}
                    </span>
                    {bundle.system && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        System
                      </span>
                    )}
                  </div>
                  {bundle.description && (
                    <p
                      className={`text-[11px] line-clamp-2 ${
                        isSelected
                          ? 'text-white/80'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {bundle.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Main Grid: Widget Types */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedBundle
                    ? selectedBundle.title
                    : 'Available Widget Types'}
                  <Badge variant="outline" className="text-xs font-normal">
                    {widgetTypes.length} Widgets
                  </Badge>
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedBundle?.description ||
                    'Browse widgets from Smart Life IoT library'}
                </p>
              </div>
              {isLoadingTypes && (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              )}
            </div>

            {widgetTypes.length === 0 && !isLoadingTypes ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Box className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  No widget types found
                </p>
                <p className="text-xs text-slate-400">
                  Try selecting a different bundle or clearing search filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {widgetTypes.map((type) => (
                  <div
                    key={type.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-secondary transition-all shadow-sm hover:shadow-md bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                            {getCategoryIcon(
                              type.category,
                              type.descriptor?.alias
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {type.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              Category: {type.category}
                            </span>
                          </div>
                        </div>
                        {type.descriptor?.sizeX && (
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded">
                            {type.descriptor.sizeX}x{type.descriptor.sizeY}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                        {type.description ||
                          'Professional Smart Life widget component'}
                      </p>
                      {type.tags && type.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {type.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => {
                        onSelectWidgetType(type);
                        onClose();
                      }}
                      className="w-full bg-secondary hover:bg-secondary/90 text-white text-xs h-9 font-medium flex items-center justify-center gap-1.5 rounded-lg shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Canvas
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
