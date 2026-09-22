import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Plus } from 'lucide-react';

import { edgeInstances, edgeActivities } from '@/features/Edge-managment/data';
import { EdgeStats } from '@/features/Edge-managment/components/EdgeStats';
import { EdgeTable } from '@/features/Edge-managment/components/EdgeTable';
import { EdgeCreateDialog } from '@/features/Edge-managment/components/EdgeCreateDialog';
import { EdgeRecentActivities } from '@/features/Edge-managment/components/EdgeRecentActivities';

export default function EdgeManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edge Management"
        description="Manage edge computing instances and monitor their status"
        actions={[
          {
            label: 'Add Edge Instance',
            onClick: () => setIsCreateOpen(true),
            icon: <Plus className="h-4 w-4 mr-2" />,
          },
        ]}
      />

      <EdgeStats edgeInstances={edgeInstances} />

      <EdgeTable edgeInstances={edgeInstances} />

      <EdgeRecentActivities activities={edgeActivities} />
      {/* <EdgeCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} /> */}
    </div>
  );
}
