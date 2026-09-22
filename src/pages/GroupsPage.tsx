import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Search as SearchIcon,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GroupsTable } from '@/components/common/GroupsTable';

const mockData = [
  {
    id: '1',
    title: 'All',
    description: 'Dummy Content',
    createdTime: '2023-04-10 15:37:57',
    isPublic: true,
  },
  {
    id: '2',
    title: 'Customer Dashboards',
    description: 'Dummy Content',
    createdTime: '2023-04-05 09:22:31',
    isPublic: true,
  },
  {
    id: '3',
    title: 'User Generated',
    description: 'Dummy Content',
    createdTime: '2023-03-28 14:15:02',
    isPublic: true,
  },
];

export default function GroupsPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePublic = (id: string) => {
    console.log('toggle public', id);
  };

  const handleAction = (action: string, id: string) => {
    console.log(action, id);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl border-secondary/50">
        <CardContent className="p-6">
          <GroupsTable
            data={mockData}
            onTogglePublic={handleTogglePublic}
            onAction={handleAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
