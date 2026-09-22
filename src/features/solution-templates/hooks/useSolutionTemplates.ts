import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  solutionTemplatesApi,
  TemplateCategory,
  PaginatedResponse,
} from '@/features/solution-templates/services/solution-templates.api';
import type { SolutionTemplate } from '@/features/solution-templates/services/solution-templates.api';

// API response wrapper structure: { data: PaginatedResponse<T> }
interface ApiResponseWrapper<T> {
  data: PaginatedResponse<T>;
}

// Template interface matching component expectations
export interface Template {
  isInstalled: boolean;
  installs: number;
  imageUrl: string;
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  image: string[];
  isActivated?: boolean;
}

// Category mapping from component keys to API TemplateCategory enum
const categoryKeyToApiCategory: Record<string, TemplateCategory | undefined> = {
  smartCity: TemplateCategory.SMART_CITY,
  smartAgriculture: TemplateCategory.SMART_AGRICULTURE,
  smartTransportation: TemplateCategory.TRANSPORTATION,
  smartHome: TemplateCategory.SMART_HOME,
  smartFactory: TemplateCategory.SMART_FACTORY,
  smartBuilding: TemplateCategory.SMART_BUILDING,
  healthcare: TemplateCategory.HEALTHCARE,
  energy: TemplateCategory.ENERGY,
  smartRetail: TemplateCategory.SMART_RETAIL,
  logistics: TemplateCategory.LOGISTICS,
  water: TemplateCategory.WATER,
  climate: TemplateCategory.CLIMATE,
  education: TemplateCategory.EDUCATION,
  smartFacility: TemplateCategory.SMART_FACILITY,
  all: undefined,
};

// Category mapping from API TemplateCategory to translation key
const apiCategoryToTranslationKey: Record<TemplateCategory, string> = {
  [TemplateCategory.SMART_HOME]: 'solutionTemplates.categories.smartHome',
  [TemplateCategory.SMART_AGRICULTURE]:
    'solutionTemplates.categories.smartAgriculture',
  [TemplateCategory.SMART_CITY]: 'solutionTemplates.categories.smartCity',
  [TemplateCategory.HEALTHCARE]: 'solutionTemplates.categories.healthcare',
  [TemplateCategory.ENERGY]: 'solutionTemplates.categories.energy',
  [TemplateCategory.SMART_FACTORY]: 'solutionTemplates.categories.smartFactory',
  [TemplateCategory.LOGISTICS]: 'solutionTemplates.categories.logistics',
  [TemplateCategory.WATER]: 'solutionTemplates.categories.water',
  [TemplateCategory.CLIMATE]: 'solutionTemplates.categories.climate',
  [TemplateCategory.EDUCATION]: 'solutionTemplates.categories.education',
  [TemplateCategory.TRANSPORTATION]:
    'solutionTemplates.categories.smartTransportation',
  [TemplateCategory.SMART_RETAIL]: 'solutionTemplates.categories.retail',
  [TemplateCategory.SMART_BUILDING]:
    'solutionTemplates.categories.smartBuilding',
  [TemplateCategory.SMART_FACILITY]:
    'solutionTemplates.categories.smartFacility',
};

// Reverse mapping: API category to component key
const apiCategoryToComponentKey: Record<TemplateCategory, string> = {
  [TemplateCategory.SMART_CITY]: 'smartCity',
  [TemplateCategory.SMART_AGRICULTURE]: 'smartAgriculture',
  [TemplateCategory.TRANSPORTATION]: 'smartTransportation',
  [TemplateCategory.SMART_HOME]: 'smartHome',
  [TemplateCategory.HEALTHCARE]: 'healthcare',
  [TemplateCategory.ENERGY]: 'energy',
  [TemplateCategory.SMART_RETAIL]: 'retail',
  [TemplateCategory.SMART_FACTORY]: 'smartFactory',
  [TemplateCategory.SMART_BUILDING]: 'smartBuilding',
  [TemplateCategory.LOGISTICS]: 'logistics',
  [TemplateCategory.WATER]: 'water',
  [TemplateCategory.CLIMATE]: 'climate',
  [TemplateCategory.EDUCATION]: 'education',
  [TemplateCategory.SMART_FACILITY]: 'facility',
};

// Category interface for component
export interface Category {
  key: string;
  category: TemplateCategory;
  translationKey: string; // Translation key instead of hardcoded name
}

interface UseSolutionTemplatesOptions {
  itemsPerPage?: number;
  initialCategory?: string;
  initialSearchQuery?: string;
}

/**
 * Custom hook for Solution Templates page
 * Manages templates data, filtering, search, and pagination
 */
export const useSolutionTemplates = (
  options: UseSolutionTemplatesOptions = {}
) => {
  const {
    itemsPerPage = 10,
    initialCategory = 'smartCity',
    initialSearchQuery = '',
  } = options;

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch categories from API
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery(
    {
      queryKey: ['solution-templates-categories'],
      queryFn: async () => {
        const response = await solutionTemplatesApi.getCategories();
        // API might return TemplateCategory[] or objects with category property
        return response.data.data;
      },
    }
  );

  // Build API query params
  const queryParams = useMemo(() => {
    const params: {
      search?: string;
      category?: TemplateCategory;
      page?: number;
      limit?: number;
    } = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    console.log(categoryKeyToApiCategory);
    console.log(selectedCategory);
    const apiCategory = categoryKeyToApiCategory[selectedCategory];
    console.log(apiCategory, selectedCategory);
    if (apiCategory && selectedCategory !== 'all') {
      params.category = apiCategory;
    }
    // If 'all' is selected, don't include category filter (API returns all)
    return params;
  }, [searchQuery, selectedCategory, currentPage, itemsPerPage]);

  // Fetch templates from API
  const {
    data: templatesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['solution-templates', queryParams],
    queryFn: () => solutionTemplatesApi.getAll(queryParams),
    retry: 2,
  });
  // Transform API SolutionTemplate to component Template format
  // API response structure: { data: { data: [...], meta: {...} } }
  const templates: Template[] = useMemo(() => {
    // Type assertion for nested response structure
    const responseData = templatesResponse?.data as
      | ApiResponseWrapper<SolutionTemplate>
      | undefined;
    if (!responseData?.data?.data || !Array.isArray(responseData.data.data)) {
      return [];
    }

    return responseData.data.data.map((template: SolutionTemplate) => {
      // Extract image URL from template
      const imageUrl = template?.imageUrl || template?.thumbnail || '';

      // Get category translation key for display
      const categoryKey =
        apiCategoryToComponentKey[template.category] ||
        template.category.toLowerCase();
      const categoryTranslationKey =
        apiCategoryToTranslationKey[template.category] ||
        `solutionTemplates.categories.${categoryKey}`;

      return {
        id: template.id,
        name: template.name || template.title,
        description: template.description || '',
        category: categoryTranslationKey, // Store translation key instead of hardcoded name
        tags: template.tags || [],
        imageUrl,
        image: imageUrl ? [imageUrl] : [],
        isInstalled: template.isInstalled,
        installs: template.installs,
        isActivated: template.isInstalled,
      };
    });
  }, [templatesResponse]);

  // Get total count and pages from API response
  // API response structure: { data: { data: [...], meta: {...} } }
  const totalPages = useMemo(() => {
    const responseData = templatesResponse?.data as
      | ApiResponseWrapper<SolutionTemplate>
      | undefined;
    return responseData?.data?.meta?.totalPages || 1;
  }, [templatesResponse]);

  const totalTemplates = useMemo(() => {
    const responseData = templatesResponse?.data as
      | ApiResponseWrapper<SolutionTemplate>
      | undefined;
    return responseData?.data?.meta?.totalItems || 0;
  }, [templatesResponse]);

  // Filter templates client-side if needed (for additional filtering beyond API)
  const filteredTemplates = useMemo(() => {
    // API already handles search and category filtering
    // This is for any additional client-side filtering if needed
    return templates;
  }, [templates]);

  // Paginated templates (API handles pagination, but we slice for safety)
  const paginatedTemplates = useMemo(() => {
    return filteredTemplates;
  }, [filteredTemplates]);

  // Handler functions
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  // Transform API categories to component format
  const categories: Category[] = useMemo(() => {
    if (!categoriesResponse || categoriesResponse.length === 0) {
      // Fallback to default categories if API returns empty
      return [
        {
          key: 'smartCity',
          category: TemplateCategory.SMART_CITY,
          translationKey: 'solutionTemplates.categories.smartCity',
        },
        {
          key: 'smartAgriculture',
          category: TemplateCategory.SMART_AGRICULTURE,
          translationKey: 'solutionTemplates.categories.smartAgriculture',
        },

        {
          key: 'smartTransportation',
          category: TemplateCategory.TRANSPORTATION,
          translationKey: 'solutionTemplates.categories.smartTransportation',
        },
        {
          key: 'smartHome',
          category: TemplateCategory.SMART_HOME,
          translationKey: 'solutionTemplates.categories.smartHome',
        },
      ];
    }

    // Handle both cases: array of TemplateCategory enum or array of objects with category property
    const categoriesArray = Array.isArray(categoriesResponse)
      ? categoriesResponse
      : [];
    return categoriesArray.map(
      (apiCategory: TemplateCategory | { category: TemplateCategory }) => {
        // Extract the category enum value
        const categoryEnum: TemplateCategory =
          typeof apiCategory === 'object' && 'category' in apiCategory
            ? apiCategory.category
            : (apiCategory as TemplateCategory);

        // Type-safe access to the mapping
        const componentKey =
          apiCategoryToComponentKey[categoryEnum] ||
          categoryEnum.toLowerCase().replace('_', '');
        const translationKey =
          apiCategoryToTranslationKey[categoryEnum] ||
          `solutionTemplates.categories.${componentKey}`;

        return {
          key: componentKey,
          category: categoryEnum,
          translationKey,
        };
      }
    );
  }, [categoriesResponse]);

  return {
    // State
    searchQuery,
    selectedCategory,
    currentPage,
    isLoading,
    isLoadingCategories,
    isError,
    error,

    // Data
    templates: paginatedTemplates,
    filteredTemplates,
    totalTemplates,
    totalPages,
    categories,

    // Handlers
    handleSearch,
    handleCategoryChange,
    handlePageChange,
    handleClearFilters,
    setSearchQuery,
    setSelectedCategory,
    setCurrentPage,

    // Direct access
    refetch,
  };
};
