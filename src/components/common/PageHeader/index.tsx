import React from 'react';
import { cn } from '@/lib/util';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRTL } from '@/hooks/useRTL';

export interface PageHeaderAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  icon?: React.ReactNode;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: PageHeaderAction[];
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
  children,
}) => {
  const navigate = useNavigate();
  const { isRTL } = useRTL();
  return (
    <div className={cn('space-y-4 ', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1 relative">
          <Button
            variant="social"
            size="sm"
            onClick={() => navigate(-1)}
            className={cn(
              'p-1 px-2 rounded-full absolute top-0',
              isRTL ? '-right-10' : '-left-8.5'
            )}
          >
            {isRTL ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {children}
    </div>
  );
};
