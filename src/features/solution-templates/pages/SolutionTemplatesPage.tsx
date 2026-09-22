import { useMemo, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useSolutionTemplates } from '@/features/solution-templates/hooks';
import { debounce } from '@/lib/util';
import { PageHeader } from '@/components/common/PageHeader';
import { useTempInstallation } from '../hooks/useTempInstallation';

export default function SolutionTemplates() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const installTemp = useTempInstallation();
  const {
    searchQuery,
    selectedCategory,
    currentPage,
    isLoading,
    categories: apiCategories,
    templates: paginatedTemplates,
    totalTemplates,
    totalPages,
    handleSearch,
    handleCategoryChange,
    handlePageChange,
    handleClearFilters,
  } = useSolutionTemplates({
    itemsPerPage: 10,
    initialCategory: 'smartCity',
  });

  const [inputValue, setInputValue] = useState(searchQuery);

  // Create debounced search handler (900ms delay)
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        handleSearch(value);
      }, 300),
    []
  );

  // Handle input change with immediate UI update and debounced search
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Update input value immediately for responsive UI (doesn't trigger API)
      setInputValue(value);
      // Debounce the actual search API call
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Sync input value when searchQuery changes externally (e.g., clear filters)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const categories = apiCategories.map((cat) => ({
    key: cat.key,
    translationKey: cat.translationKey,
  }));
  const handleTempActivation = (id: string, installationName: string) => {
    installTemp.mutate({ id, installationName });
  };
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <PageHeader title={t('solutionTemplates.title')} />
      </div>
      <div className="border border-secondary dark:border-gray-700 p-4 rounded-2xl">
        {/* Search Bar */}
        {/* <div className="flex w flex-col md:flex-row justify-between items-center shadow-sm p-4 rounded-lg bg-[#D9D9D92B] dark:bg-gray-950">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
            <Input
              placeholder={t('solutionTemplates.searchPlaceholder')}
              value={inputValue}
              onChange={handleInputChange}
              className="pl-10 w-full md:w-96 rounded-md"
            />
          </div>
        </div> */}

        {/* Popular Domain Section */}
        <div className="  rounded-lg md:p-4  ">
          <h2 className="text-sm font-semibold dark:text-white bg-secondary px-4 py-2 w-fit rounded-full text-white   mb-4">
            {t('solutionTemplates.popularDomain')}
          </h2>
          <div className="relative">
            <div className="flex items-center gap-4  ">
              <div className="flex md:gap-4 gap-2 flex-wrap  w-full">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryChange(category.key)}
                    className={`  flex-shrink-0 p-4  rounded-xl transition-all flex flex-col items-center dark:bg-gray-800 dark:text-white gap-3 ${
                      selectedCategory === category.key
                        ? 'bg-primary text-white shadow-md hover:bg-gray-400 border border-gray-200'
                        : 'bg-white text-gray-700 shadow '
                    }`}
                  >
                    {/* <category.icon className="h-10 w-10" /> */}
                    <span className="text-sm font-medium dark:text-white">
                      {t(
                        category.translationKey ||
                          `solutionTemplates.categories.${category.key}`
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('solutionTemplates.templatesCount', { count: totalTemplates })}
          </h2>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
          )}

          {/* Template Cards Grid */}
          {!isLoading && (
            <div className="grid gap-6 md:grid-cols-3">
              {paginatedTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="hover:shadow-lg  transition-shadow flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    {/* Thumbnail Images */}
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1 h-28 w-20  w bg-gray-200 rounded-lg overflow-hidden relative">
                        <img
                          src={template?.imageUrl}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                    <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex flex-col justify-between">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-secondary text-white capitalize border-0 text-[10px] rounded-md px-2 py-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-white"
                        onClick={() =>
                          navigate(`/solution-templates/preview/${template.id}`)
                        }
                      >
                        {t('solutionTemplates.preview')}
                      </Button>
                      <Button
                        className={`flex-1 ${
                          template.isActivated
                            ? 'bg-secondary hover:bg-secondary/90 text-white  '
                            : 'bg-secondary hover:bg-secondary/90 text-white'
                        } disabled:cursor-not-allowed`}
                        disabled={template.isActivated}
                        onClick={() =>
                          handleTempActivation(template.id, template.name)
                        }
                      >
                        {template.isActivated
                          ? t('solutionTemplates.activated')
                          : t('solutionTemplates.activate')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && paginatedTemplates.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building2 className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('solutionTemplates.noTemplatesFound')}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('solutionTemplates.tryAdjustingSearch')}
                </p>
                <Button variant="ghost" onClick={handleClearFilters}>
                  {t('solutionTemplates.clearFilters')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
