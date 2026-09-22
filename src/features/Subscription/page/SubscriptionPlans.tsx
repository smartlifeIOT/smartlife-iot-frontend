import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, Rocket, Users, Gift } from 'lucide-react';
import {
  subscriptionsApi,
  SubscriptionPlan,
  BillingPeriod,
} from '@/features/Subscription/services/subscriptions.api';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/utils/helpers/apiErrorHandler';
import { format } from 'date-fns';
import apiClient from '@/lib/axios';
import { useCurrentSubscription } from '@/features/Subscription/hooks';
import {
  ApiPlan,
  getSubscriptionPlans,
} from '@/features/Subscription/hooks/useSubscriptionPlans';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  icon: React.ReactNode;
  features: string[];
  limits: {
    devices: string;
    assets: string;
    users: string;
    apiCalls: string;
    dataRetention: string;
    ruleChains: string;
  };
  isPopular?: boolean;
  isEnterprise?: boolean;
}

const formatLimit = (value: number, t: any): number | string => {
  if (value === -1) return t('subscriptions.features.unlimited');
  return value;
};

const formatDataRetention = (days: number, t: any): string => {
  if (days === -1) return t('subscriptions.features.unlimited');
  if (days >= 365) {
    const years = Math.round(days / 365);
    return `${years} ${t(years >= 2 ? 'subscriptions.features.units.years' : 'subscriptions.features.units.year')}`;
  }
  return `${days} ${t(days !== 1 ? 'subscriptions.features.units.days' : 'subscriptions.features.units.day')}`;
};

const formatApiCalls = (calls: number, t: any): number | string => {
  if (calls === -1) return t('subscriptions.features.unlimited');
  if (calls >= 1000000) return `${(calls / 1000000).toFixed(1)}M`;
  if (calls >= 1000) return `${(calls / 1000).toFixed(0)}K`;
  return calls;
};

const formatStorage = (gb: number, t: any): string => {
  if (gb === -1) return t('subscriptions.features.unlimited');
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)}TB`;
  return t('subscriptions.features.storage', { gb });
};

const getPlanIcon = (planId: string): React.ReactNode => {
  switch (planId) {
    case 'free':
      return <Gift className="h-6 w-6" />;
    case 'starter':
      return <Users className="h-6 w-6" />;
    case 'professional':
      return <Rocket className="h-6 w-6" />;
    case 'enterprise':
      return <Zap className="h-6 w-6" />;
    default:
      return <Users className="h-6 w-6" />;
  }
};

const generateFeatures = (apiPlan: ApiPlan, t: any): string[] => {
  const features: string[] = [];

  // Device limits
  if (apiPlan.limits.devices !== -1) {
    features.push(
      t('subscriptions.features.upToDevices', { count: apiPlan.limits.devices })
    );
  } else {
    features.push(t('subscriptions.features.unlimitedDevices'));
  }

  // User limits
  if (apiPlan.limits.users !== -1) {
    features.push(
      t('subscriptions.features.upToUsers', { count: apiPlan.limits.users })
    );
  } else {
    features.push(t('subscriptions.features.unlimitedUsers'));
  }

  // Analytics
  if (apiPlan.features.realtimeAnalytics) {
    features.push(t('subscriptions.features.realtimeAnalytics'));
  }

  // Automation
  if (apiPlan.features.advancedAutomation) {
    features.push(t('subscriptions.features.advancedAutomation'));
  } else if (apiPlan.features.ruleEngine !== 'basic') {
    features.push(
      t('subscriptions.features.ruleEngine', {
        type: apiPlan.features.ruleEngine,
      })
    );
  }

  // Integrations
  if (apiPlan.features.customIntegrations) {
    if (apiPlan.limits.customIntegrations === -1) {
      features.push(t('subscriptions.features.unlimitedIntegrations'));
    } else if (apiPlan.limits.customIntegrations > 0) {
      features.push(
        t('subscriptions.features.upToIntegrations', {
          count: apiPlan.limits.customIntegrations,
        })
      );
    }
  }

  // White label
  if (apiPlan.features.whiteLabelBranding) {
    features.push(
      t('subscriptions.features.whiteLabel', {
        level: apiPlan.features.brandingLevel,
      })
    );
  }

  // Support level
  features.push(
    t('subscriptions.features.support', {
      level: apiPlan.features.supportLevel,
    })
  );

  // Data retention
  features.push(
    t('subscriptions.features.dataRetention', {
      retention: formatDataRetention(apiPlan.limits.dataRetentionDays, t),
    })
  );

  // Storage
  features.push(formatStorage(apiPlan.limits.storageGB, t));

  // Additional features
  if (apiPlan.features.multiTenancy) {
    features.push(t('subscriptions.features.multiTenancy'));
  }

  if (apiPlan.features.customerManagement) {
    features.push(t('subscriptions.features.customerManagement'));
  }

  if (apiPlan.features.roleBasedAccess) {
    features.push(t('subscriptions.features.roleBasedAccess'));
  }

  if (apiPlan.features.auditLogs) {
    features.push(t('subscriptions.features.auditLogs'));
  }

  if (apiPlan.features.backupRecovery) {
    features.push(t('subscriptions.features.backupRecovery'));
  }

  if (apiPlan.features.geofencing) {
    features.push(t('subscriptions.features.geofencing'));
  }

  if (apiPlan.features.dataAggregation) {
    features.push(t('subscriptions.features.dataAggregation'));
  }

  return features;
};

const transformApiPlanToPlan = (apiPlan: ApiPlan, t: any): Plan => {
  return {
    id: apiPlan.plan,
    name: apiPlan.name,
    description: t('subscriptions.messages.planDescription', {
      name: apiPlan.name,
    }),
    price: {
      monthly: apiPlan.monthlyPrice,
      yearly: apiPlan.yearlyPrice,
    },
    icon: getPlanIcon(apiPlan.plan),
    features: generateFeatures(apiPlan, t),
    limits: {
      devices: String(formatLimit(apiPlan.limits.devices, t)),
      assets: String(formatLimit(apiPlan.limits.devices, t)), // Using devices as proxy for assets
      users: String(formatLimit(apiPlan.limits.users, t)),
      apiCalls: String(formatApiCalls(apiPlan.limits.apiCallsPerMonth, t)),
      dataRetention: formatDataRetention(apiPlan.limits.dataRetentionDays, t),
      ruleChains:
        apiPlan.features.advancedAutomation ||
        apiPlan.features.ruleEngine !== 'basic'
          ? t('subscriptions.features.unlimited')
          : '0',
    },
    isPopular: apiPlan.popular || apiPlan.plan === 'professional',
    isEnterprise: apiPlan.plan === 'enterprise',
  };
};

export default function SubscriptionPlans() {
  const { t } = useTranslation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    'monthly'
  );

  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const { data: currentSubscriptionResponse } = useCurrentSubscription();
  const { data: plansResponse, isError } = getSubscriptionPlans();

  // call payment method here to pay get the url and open in new tab and return the url
  const handlePayment = async (
    plan: SubscriptionPlan,
    billingPeriod: BillingPeriod
  ) => {
    const response = await apiClient.post(`/payments/create`, {
      plan,
      billingPeriod,
    });
    return response.data.data.paymentUrl;
  };

  const currentPlanId = currentSubscriptionResponse?.plan;

  const plans = useMemo(() => {
    if (!plansResponse || !Array.isArray(plansResponse)) return [];
    return plansResponse.map((p) => transformApiPlanToPlan(p, t));
  }, [plansResponse, t]);

  // Map plan IDs to SubscriptionPlan enum
  const mapPlanIdToSubscriptionPlan = (planId: string): SubscriptionPlan => {
    switch (planId) {
      case 'free':
        return SubscriptionPlan.FREE;
      case 'starter':
        return SubscriptionPlan.BASIC;
      case 'professional':
        return SubscriptionPlan.PROFESSIONAL;
      case 'enterprise':
        return SubscriptionPlan.ENTERPRISE;
      default:
        return SubscriptionPlan.FREE;
    }
  };

  const handlePlanSelection = async (planId: string) => {
    // Don't allow subscribing to the current plan
    if (planId === currentPlanId) {
      toast.error(t('subscriptions.messages.currentPlanError'));
      return;
    }
    setIsSubscribing(planId);
    try {
      const plan = mapPlanIdToSubscriptionPlan(planId);
      const billing =
        billingPeriod === 'monthly'
          ? BillingPeriod.MONTHLY
          : BillingPeriod.YEARLY;

      const result = await subscriptionsApi.upgrade(plan, billing);
      const requiresPayment = result.data.data.requiresPayment;
      if (requiresPayment) {
        const paymentUrl = await handlePayment(plan, billing);
        window.location.href = paymentUrl;
      } else {
        toast.success(t('subscriptions.messages.subscribeSuccess'));
      }
    } catch (error: unknown) {
      const errorMessage =
        getErrorMessage(error) || t('subscriptions.messages.subscribeError');
      toast.error(errorMessage);
    } finally {
      setIsSubscribing(null);
    }
  };

  return (
    <div className="space-y-6 border bg-[#fff6fb]/50 p-6 rounded-lg border-secondary dark:bg-gray-800 dark:border-gray-700 ">
      <div className="">
        <Badge className="text-base  mb-4 font-normal px-4 py-2 bg-secondary dark:bg-gray-900 dark:border-gray-700 text-white">
          {t('subscriptions.badge')}
        </Badge>
        <div className="text-2xl font-semibold">{t('subscriptions.title')}</div>
        <div className="text-sm text-muted-foreground">
          {t('subscriptions.description')}
        </div>
      </div>

      {/* Current Plan Card */}
      {currentSubscriptionResponse && (
        <Card className="border-secondary ">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  {t('subscriptions.currentPlan.title')}{' '}
                  {plans.find((p) => p.id === currentPlanId)?.name ||
                    currentPlanId}
                  <Badge className="text-sm font-normal px-4 bg-secondary dark:bg-gray-900 dark:border-gray-700 text-white">
                    {currentSubscriptionResponse.status === 'active'
                      ? t('subscriptions.currentPlan.active')
                      : currentSubscriptionResponse.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="dark:text-white">
                  {currentSubscriptionResponse.nextBillingDate && (
                    <>
                      {t('subscriptions.currentPlan.nextBilling', {
                        date: format(
                          new Date(currentSubscriptionResponse.nextBillingDate),
                          'MMMM d, yyyy'
                        ),
                      })}
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 ">
        <Label
          htmlFor="billing"
          className={`cursor-pointer ${
            billingPeriod === 'monthly'
              ? 'font-semibold text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-white'
          }`}
        >
          {t('subscriptions.billing.monthly')}
        </Label>
        <Switch
          id="billing"
          checked={billingPeriod === 'yearly'}
          onCheckedChange={(checked) =>
            setBillingPeriod(checked ? 'yearly' : 'monthly')
          }
        />
        <div className="flex items-center gap-2">
          <Label
            htmlFor="billing"
            className={`cursor-pointer ${
              billingPeriod === 'yearly'
                ? 'font-semibold text-gray-900 dark:text-white'
                : 'text-gray-500'
            }`}
          >
            {t('subscriptions.billing.yearly')}
          </Label>
          {billingPeriod === 'yearly' && (
            <Badge className="bg-green-100 text-green-700 border-green-300">
              {t('subscriptions.billing.savePercent')}
            </Badge>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-20">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col overflow-hidden rounded-3xl transition-all hover:shadow-md  hover:translate-y-[-5px] duration-500 ${
              plan.isPopular
                ? 'border-2 border-primary shadow-lg'
                : 'border border-gray-400'
            }`}
          >
            {/* Header Section with Plan Name and Badge */}
            <div
              className={`px-6 pt-6 pb-4 ${
                plan.isPopular ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className={`text-xl font-semibold ${
                    plan.isPopular ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name} {t('subscriptions.plans.nameSuffix')}
                </h3>
                <Badge
                  className={`${
                    plan.id === 'free'
                      ? 'bg-blue-500 text-white'
                      : plan.isPopular
                        ? 'bg-pink-500 text-white'
                        : 'bg-blue-600 text-white'
                  } px-6 py-1  font-semibold uppercase`}
                >
                  {plan.id === 'free'
                    ? t('subscriptions.plans.freeBadge')
                    : plan.isPopular
                      ? t('subscriptions.plans.proBadge')
                      : t('subscriptions.plans.advanceBadge')}
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-4xl font-bold ${
                    plan.isPopular ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t('subscriptions.plans.priceLabel')}
                  {billingPeriod === 'monthly'
                    ? plan.price.monthly
                    : Math.round(plan.price.yearly / 12)}
                  .00
                </span>
                <span
                  className={`text-sm ${
                    plan.isPopular ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  {t('subscriptions.plans.month')}
                </span>
              </div>
            </div>

            {/* Current Plan / Upgrade Button */}
            <div
              className={`px-6 py-3 ${
                plan.isPopular ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              {(() => {
                const isCurrentPlan = plan.id === currentPlanId;
                const currentBillingPeriod =
                  currentSubscriptionResponse?.billingPeriod?.toLowerCase();
                const isBillingPeriodMatch =
                  (billingPeriod === 'monthly' &&
                    currentBillingPeriod === 'monthly') ||
                  (billingPeriod === 'yearly' &&
                    currentBillingPeriod === 'yearly');
                const showCurrentPlan = isCurrentPlan && isBillingPeriodMatch;

                if (showCurrentPlan) {
                  return (
                    <Button
                      className="w-full bg-gray-100 border border-gray-300 text-black hover:bg-gray-800 font-medium"
                      disabled
                    >
                      {t('subscriptions.actions.currentPlan')}
                    </Button>
                  );
                }

                return (
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 bg-black text-white hover:bg-black/80 font-medium"
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={isSubscribing !== null}
                    isLoading={isSubscribing === plan.id}
                  >
                    {currentPlanId &&
                    plans.findIndex((p) => p.id === plan.id) >
                      plans.findIndex((p) => p.id === currentPlanId)
                      ? t('subscriptions.actions.upgrade')
                      : isCurrentPlan && !isBillingPeriodMatch
                        ? t('subscriptions.actions.upgrade')
                        : t('subscriptions.actions.subscribe')}
                  </Button>
                );
              })()}
            </div>

            {/* Features List */}
            <CardContent
              className={`flex-1 px-6 pb-6 ${
                plan.isPopular
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              <ol className="space-y-3 list-decimal list-inside">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={`text-sm ${
                      plan.isPopular ? 'text-gray-300' : 'text-gray-900'
                    }`}
                  >
                    {feature}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-white">
            {t('subscriptions.comparison.title')}
          </CardTitle>
          <CardDescription className="dark:text-white">
            {t('subscriptions.comparison.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 pr-8 font-semibold text-gray-900 dark:text-white">
                    {t('subscriptions.comparison.featureHeader')}
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className={`text-center py-4 px-4 font-semibold ${
                        plan.isPopular
                          ? 'text-primary'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: t('subscriptions.comparison.features.devices'),
                    key: 'devices',
                  },
                  {
                    feature: t('subscriptions.comparison.features.assets'),
                    key: 'assets',
                  },
                  {
                    feature: t('subscriptions.comparison.features.users'),
                    key: 'users',
                  },
                  {
                    feature: t('subscriptions.comparison.features.apiCalls'),
                    key: 'apiCalls',
                  },
                  {
                    feature: t(
                      'subscriptions.comparison.features.dataRetention'
                    ),
                    key: 'dataRetention',
                  },
                  {
                    feature: t('subscriptions.comparison.features.ruleChains'),
                    key: 'ruleChains',
                  },
                ].map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-4 pr-8 font-medium text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    {plans.map((plan) => (
                      <td
                        key={plan.id}
                        className={`text-center py-4 px-4 ${
                          plan.isPopular ? 'bg-primary/5' : ''
                        }`}
                      >
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {plan.limits[row.key as keyof typeof plan.limits]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
