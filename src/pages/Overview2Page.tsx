import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Smartphone,
  Bell,
  LayoutDashboard,
  Upload,
  Cog,
  UserPlus,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/util';
import DashboardNavigation from '@/components/ui/DashboardNavigation';

const accent = 'bg-[#b366a4] hover:bg-[#9d5590] text-white border-0';

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
        >
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Overview2Page() {
  const { t } = useTranslation();
  const [trendDays, setTrendDays] = useState<'7' | '30' | '90'>('7');

  const recentActivities = useMemo(
    () => [
      {
        id: '1',
        name: 'John',
        action: t('overview2.recentActivities.addedCustomer'),
        time: t('overview2.recentActivities.minsAgo', { count: 3 }),
        dotClass: 'bg-emerald-500',
      },
      {
        id: '2',
        name: 'Sarah',
        action: t('overview2.recentActivities.updatedConfig'),
        time: t('overview2.recentActivities.minsAgo', { count: 12 }),
        dotClass: 'bg-blue-500',
      },
      {
        id: '3',
        name: 'Mike',
        action: t('overview2.recentActivities.resolvedAlarm'),
        time: t('overview2.recentActivities.hourAgo', { count: 1 }),
        dotClass: 'bg-amber-500',
      },
      {
        id: '4',
        name: 'Mike',
        action: t('overview2.recentActivities.resolvedAlarm'),
        time: t('overview2.recentActivities.hourAgo', { count: 1 }),
        dotClass: 'bg-amber-500',
      },
      {
        id: '5',
        name: 'Mike',
        action: t('overview2.recentActivities.resolvedAlarm'),
        time: t('overview2.recentActivities.hourAgo', { count: 1 }),
        dotClass: 'bg-amber-500',
      },
      {
        id: '6',
        name: 'Mike',
        action: t('overview2.recentActivities.resolvedAlarm'),
        time: t('overview2.recentActivities.hourAgo', { count: 1 }),
        dotClass: 'bg-amber-500',
      },
    ],
    [t]
  );

  const quickActions = useMemo(
    () => [
      { label: t('overview2.quickActions.addDevice'), icon: Smartphone },
      { label: t('overview2.quickActions.setAlarmRule'), icon: Bell },
      { label: t('overview2.quickActions.createDashboard'), icon: LayoutDashboard },
      { label: t('overview2.quickActions.importData'), icon: Upload },
      { label: t('overview2.quickActions.configureRuleEngine'), icon: Cog },
      { label: t('overview2.quickActions.inviteUser'), icon: UserPlus },
    ],
    [t]
  );

  const trendByRange = useMemo<
    Record<string, { name: string; value: number }[]>
  >(
    () => ({
      '7': [
        { name: 'Mon', value: 12 },
        { name: 'Tue', value: 19 },
        { name: 'Wed', value: 15 },
        { name: 'Thu', value: 22 },
        { name: 'Fri', value: 28 },
        { name: 'Sat', value: 24 },
        { name: 'Sun', value: 30 },
      ],
      '30': [
        { name: 'W1', value: 45 },
        { name: 'W2', value: 52 },
        { name: 'W3', value: 48 },
        { name: 'W4', value: 61 },
      ],
      '90': [
        { name: 'M1', value: 120 },
        { name: 'M2', value: 135 },
        { name: 'M3', value: 128 },
      ],
    }),
    []
  );

  const liveMetrics = useMemo(
    () => [
      {
        label: t('overview2.liveData.metrics.temperature'),
        value: '28.5°C',
        border: 'border-pink-100',
        spark: [2, 24, 100, 26, 28, 90, 28.5],
        lineColor: '#b366a4',
      },
      {
        label: t('overview2.liveData.metrics.humidity'),
        value: '65%',
        border: 'border-blue-400',
        spark: [58, 60, 62, 63, 64, 65, 65],
        lineColor: '#3b82f6',
      },
      {
        label: t('overview2.liveData.metrics.occupancy'),
        value: '73%',
        border: 'border-blue-100',
        spark: [5, 68, 70, 71, 72, 73, 93],
        lineColor: '#22c55e',
      },
      {
        label: t('overview2.liveData.metrics.co2'),
        value: '450 ppm',
        border: 'border-amber-100',
        spark: [200, 230, 240, 25, 248, 20, 250],
        lineColor: '#eab308',
      },
    ],
    [t]
  );

  const docLinks = useMemo(
    () => [
      { label: t('overview2.documentation.gettingStarted'), active: true },
      { label: t('overview2.documentation.apiReference'), active: false },
      { label: t('overview2.documentation.alarmRules'), active: false },
      { label: t('overview2.documentation.faqs'), active: false },
    ],
    [t]
  );

  const onboardingSteps = useMemo(
    () => [
      { id: '1', label: t('overview2.onboarding.addDevice'), done: true },
      { id: '2', label: t('overview2.onboarding.connectGateway'), done: true },
      { id: '3', label: t('overview2.onboarding.buildDashboard'), done: false },
      { id: '4', label: t('overview2.onboarding.setUpAlarms'), done: false },
    ],
    [t]
  );

  const trendData = trendByRange[trendDays];

  const guideProgress = useMemo(() => {
    const done = onboardingSteps.filter((s) => s.done).length;
    return Math.round((done / onboardingSteps.length) * 100);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {t('overview2.title')}
        </h1>
      </div>

      <div className="rounded-2xl border-2 border-pink-200/80 dark:border-pink-900/50 bg-white/80 dark:bg-slate-950/40 p-4 md:p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <CardTitle className="text-base font-semibold">
                  {t('overview2.recentActivities.title')}
                </CardTitle>
                <Button variant="primary" size="sm" asChild>
                  <Link to="/analytics">{t('overview2.recentActivities.viewAll')}</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4  h-[270px] overflow-y-auto  sidebar-scroll ">
                {recentActivities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 border-b  border-slate-300 pb-3 last:border-0 last:pb-0"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-[#b366a4]/15 text-[#b366a4] text-sm font-medium">
                        {item.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        <span className="font-semibold">{item.name}</span>{' '}
                        {item.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.time}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'mt-2 h-2 w-2 shrink-0 rounded-full',
                        item.dotClass
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200/80">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {t('overview2.quickActions.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      className="flex   items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-center transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#b366a4] text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200/80">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  {t('overview2.trends.title')}
                </CardTitle>
                <div className="flex rounded-md border border-slate-200 p-0.5 text-xs dark:border-slate-700">
                  {(['7', '30', '90'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTrendDays(d)}
                      className={cn(
                        'rounded px-2 py-1 transition',
                        trendDays === d
                          ? 'bg-[#b366a4] text-white'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300'
                      )}
                    >
                      {t('overview2.trends.days', { count: parseInt(d) })}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#b366a4"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#b366a4' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200/80">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {t('overview2.liveData.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {liveMetrics.map((m) => (
                    <div
                      key={m.label}
                      className={cn(
                        'rounded-lg border  border-slate-100 hover:border-slate-200 transition-all bg-white p-4 dark:bg-slate-900/40',
                        m.border
                      )}
                    >
                      <p className="text-xs text-slate-500">{m.label}</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {m.value}
                      </p>
                      <MiniSparkline data={m.spark} color={m.lineColor} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200/80">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {t('overview2.documentation.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {docLinks.map((doc) => (
                    <Button
                      key={doc.label}
                      variant={doc.active ? 'default' : 'outline'}
                      className={cn(
                        'h-auto justify-between py-3 px-3 font-normal',
                        doc.active && accent
                      )}
                      type="button"
                    >
                      <span className="text-left text-sm">{doc.label}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200/80">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {t('overview2.onboarding.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-0">
                  {onboardingSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={cn(
                        'flex items-center gap-3 border-dashed border-slate-200 py-3 dark:border-slate-700',
                        index < onboardingSteps.length - 1 && 'border-b'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm',
                          step.done
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-slate-200 bg-slate-50 text-transparent dark:border-slate-600'
                        )}
                      >
                        {step.done ? <Check className="h-4 w-4" /> : null}
                      </div>
                      <span
                        className={cn(
                          'text-sm',
                          step.done
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-500'
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{t('overview2.onboarding.progress')}</span>
                    <span>{guideProgress}%</span>
                  </div>
                  <Progress value={guideProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DashboardNavigation
          previousRoute="/dashboard"
          nextRoute="/dashboard/overview-2"
        />
      </div>
    </div>
  );
}
