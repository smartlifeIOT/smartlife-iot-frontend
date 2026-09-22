import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';

export default function UploadFlorPLanModel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('floorplans.uploadFloorPlan')}</DialogTitle>
          <DialogDescription>
            {t('floorplans.uploadFloorPlanDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-4 h-[500px] overflow-y-scroll">
          <div className="space-y-2">
            <Label htmlFor="plan-name">
              {t('floorplans.floorPlanName')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="plan-name"
              placeholder={t('floorplans.floorPlanNamePlaceholder')}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building">
                {t('floorplans.building')}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="building"
                placeholder={t('floorplans.buildingPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">
                {t('floorplans.floor')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="floor"
                placeholder={t('floorplans.floorPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              {t('floorplans.category')} <span className="text-red-500">*</span>
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('floorplans.categoryPlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industrial">
                  {t('floorplans.industrial')}
                </SelectItem>
                <SelectItem value="commercial">
                  {t('floorplans.commercial')}
                </SelectItem>
                <SelectItem value="residential">
                  {t('floorplans.residential')}
                </SelectItem>
                <SelectItem value="logistics">
                  {t('floorplans.logistics')}
                </SelectItem>
                <SelectItem value="healthcare">
                  {t('floorplans.healthcare')}
                </SelectItem>
                <SelectItem value="education">
                  {t('floorplans.education')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">
              {t('floorplans.floorPlanImage')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 cursor-pointer transition-colors">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {t('floorplans.clickToUploadOrDragAndDrop')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('floorplans.pngJpgSvgUpTo10Mb')}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">{t('floorplans.width')} (meters)</Label>
              <Input id="width" type="number" placeholder="100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">{t('floorplans.height')} (meters)</Label>
              <Input id="height" type="number" placeholder="80" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scale">{t('floorplans.scale')}</Label>
              <Input id="scale" placeholder="1:100" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('floorplans.description')}</Label>
            <Textarea
              id="description"
              placeholder={t('floorplans.floorPlanDescriptionPlaceholder')}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange}>
            {t('floorplans.cancel')}
          </Button>
          <Button>{t('floorplans.uploadFloorPlan')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
