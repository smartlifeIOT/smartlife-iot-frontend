import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const stats = [
  { label: 'Total Users', value: '12', className: 'bg-indigo-600 text-white' },
  { label: 'Active Devices', value: '48', className: 'bg-emerald-500 text-white' },
  { label: 'Data Usage', value: '2.4GB', className: 'bg-red-500 text-white' },
  { label: 'Uptime', value: '95%', className: 'bg-purple-600 text-white' },
  { label: 'Alerts', value: '03', className: 'bg-amber-400 text-white' },
  { label: 'Last Activity', value: '1hr', className: 'bg-sky-500 text-white' },
];

const activities = [
  { text: 'New user "jane.smith@acme.com" created', time: '2 hours ago' },
  { text: 'Device "Temperature Sensor 945" connected', time: '4 hours ago' },
  { text: 'Dashboard "Production Overview" updated', time: '6 hours ago' },
  { text: 'User "john.doe@acme.com" logged in', time: '8 hours ago' },
];

export default function CompanyProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Acme Corporation</h1>
          <Badge variant="success">ACTIVE</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="secondary" size="sm" className="bg-pink-600 text-white hover:bg-pink-700">
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users (12)</TabsTrigger>
          <TabsTrigger value="devices">Devices (48)</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            <Card className="lg:col-span-1">
              <CardContent className="p-6 space-y-3">
                <h2 className="font-semibold text-slate-900">Customer Information</h2>
                <div className="text-sm text-slate-600 space-y-2">
                  <div>
                    <p className="uppercase text-xs text-slate-400">Contact Email</p>
                    <p>contact@acme.com</p>
                  </div>
                  <div>
                    <p className="uppercase text-xs text-slate-400">Phone Number</p>
                    <p>+1-555-0123</p>
                  </div>
                  <div>
                    <p className="uppercase text-xs text-slate-400">Address</p>
                    <p>Business Street, New York, NY 10001</p>
                  </div>
                  <div>
                    <p className="uppercase text-xs text-slate-400">Date</p>
                    <p>Dec 16, 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-slate-900">Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className={`rounded-lg p-4 text-center ${stat.className}`}
                    >
                      <p className="text-2xl font-semibold">{stat.value}</p>
                      <p className="text-sm opacity-90">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-slate-900">Recent Activity</h2>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.text} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-pink-500" />
                      <p className="text-sm text-slate-700">{activity.text}</p>
                    </div>
                    <p className="text-sm text-slate-500">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="mt-4 text-sm text-slate-600">Users tab content coming soon.</div>
        </TabsContent>
        <TabsContent value="devices">
          <div className="mt-4 text-sm text-slate-600">Devices tab content coming soon.</div>
        </TabsContent>
        <TabsContent value="activity">
          <div className="mt-4 text-sm text-slate-600">Activity tab content coming soon.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
