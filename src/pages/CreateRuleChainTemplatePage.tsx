import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit2, Trash2 } from 'lucide-react';

export default function CreateRuleChainTemplatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    isRoot: false,
    debugMode: false,
    additionalSettings: '{"maxExecutionTime": 30000, "debugMode": false}',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Template created:', formData);
    // TODO: API integration
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Rule Chain Template"
        actions={[
          {
            label: 'Edit',
            onClick: () => {},
            icon: <Edit2 className="h-4 w-4 mr-2" />,
            variant: 'outline',
          },
          {
            label: 'Delete',
            onClick: () => {},
            icon: <Trash2 className="h-4 w-4 " />,
            variant: 'destructive',
          },
        ]}
      />

      <Card className="max-w-4xl shadow-none border-slate-200">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className=" font-semibold text-slate-800">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-600 font-medium">
                    Template Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter instance name"
                    className="bg-white border-slate-200 p-2 border rounded-md"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-slate-600 font-medium">
                    Template Type *
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({ ...formData, type: val })
                    }
                  >
                    <SelectTrigger
                      id="type"
                      className="bg-white border-slate-200 "
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard Rule Chain
                      </SelectItem>
                      <SelectItem value="advanced">
                        Advanced Processing
                      </SelectItem>
                      <SelectItem value="edge-optimized">
                        Edge Optimized
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-slate-600 font-medium"
                >
                  Description
                </Label>

                <Input
                  id="description"
                  placeholder="Enter description (optional)"
                  className="bg-white border-slate-200  p-2 border rounded-md"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Template Configuration */}
            <div className="space-y-4">
              <h3 className=" font-semibold text-slate-800">
                Template Configuration
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isRoot"
                    className="h-5 w-5 border-slate-300"
                    checked={formData.isRoot}
                    onChange={(e) =>
                      setFormData({ ...formData, isRoot: e.target.checked })
                    }
                  />
                  <Label
                    htmlFor="isRoot"
                    className="text-slate-600 font-medium cursor-pointer"
                  >
                    Root Rule Chain
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="debugMode"
                    className="h-5 w-5 border-slate-300"
                    checked={formData.debugMode}
                    onChange={(e) =>
                      setFormData({ ...formData, debugMode: e.target.checked })
                    }
                  />
                  <Label
                    htmlFor="debugMode"
                    className="text-slate-600 font-medium cursor-pointer"
                  >
                    Enable Debug Mode
                  </Label>
                </div>
              </div>
            </div>

            {/* Additional Settings (JSON) */}
            <div className="space-y-4">
              <Label htmlFor="json" className="font-semibold">
                Additional Settings (JSON)
              </Label>
              <Input
                id="json"
                value={formData.additionalSettings}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalSettings: e.target.value,
                  })
                }
                className="bg-white border-slate-200  border rounded-md p-2  font-mono text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary">
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
