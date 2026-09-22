import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { CreateAlarmRuleForm } from '../components/CreateAlarmRuleForm';

export const CreateAlarmRulePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/alarms');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <PageHeader
        title="Create Alert Rule"
        description="Set up automatic monitoring conditions, threshold triggers, and dispatch channels."
        showBack={true}
        onBack={() => navigate(-1)}
      />

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <CreateAlarmRuleForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAlarmRulePage;
