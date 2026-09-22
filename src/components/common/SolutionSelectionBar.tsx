import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';

interface Solution {
  key: string;
  icon: LucideIcon;
  active?: boolean;
}

interface SolutionSelectionBarProps {
  solutions: Solution[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export const SolutionSelectionBar: React.FC<SolutionSelectionBarProps> = ({
  solutions,
  selectedCategory,
  onCategorySelect,
}) => {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4 pb-4">
        <button
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={`hidden sm:flex absolute left-0 z-10 p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all ${
            canScrollLeft
              ? 'opacity-100 cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={26} className="text-gray-700 dark:text-white" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex flex-1 items-center gap-4 bg-[#D9D9D92B] dark:bg-gray-950 rounded-xl overflow-x-auto pb-4 no-scrollbar scroll-smooth px-10 sm:px-12"
        >
          <div className="flex gap-4 w-full py-4">
            {solutions.map((solution) => (
              <button
                key={solution.key}
                onClick={() => onCategorySelect(solution.key)}
                className={`min-w-[140px] sm:min-w-[160px] flex-shrink-0 p-4 py-8 rounded-xl dark:bg-gray-800 dark:text-white transition-all flex flex-col items-center gap-3 ${
                  selectedCategory === solution.key
                    ? 'bg-secondary text-white shadow-md border border-gray-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <solution.icon className="h-10 w-10" />
                <span className="text-sm font-medium">
                  {t(`dashboard.solutionCategories.${solution.key}`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={`hidden sm:flex absolute right-0 z-10 p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all ${
            canScrollRight
              ? 'opacity-100 cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={26} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
};
