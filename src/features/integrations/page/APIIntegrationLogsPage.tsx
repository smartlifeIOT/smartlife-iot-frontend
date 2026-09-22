import { ChevronRight, ChevronDown, Eye } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/components/common/DataTable/columns';

const logs = [
  {
    id: 1,
    timestamp: '2024-06-01 14:32:15',
    level: 'INFO',
    levelColor: 'bg-emerald-100 text-emerald-700',
    message: 'Successfully processed weather data for location: Dubai',
  },
  {
    id: 2,
    timestamp: '2024-06-01 14:31:45',
    level: 'SUCCESS',
    levelColor: 'bg-fuchsia-100 text-fuchsia-700',
    message: 'HTTP Request Completed: 200 OK - 1.2KB Received',
  },
  {
    id: 3,
    timestamp: '2024-06-01 14:30:12',
    level: 'WARNING',
    levelColor: 'bg-orange-100 text-orange-700',
    message: 'Rate limit approaching: 890/1000 requests per hour',
  },
  {
    id: 4,
    timestamp: '2024-06-01 14:28:30',
    level: 'ERROR',
    levelColor: 'bg-red-100 text-red-700',
    message: 'Connection timeout after 5000ms - retrying in 30 seconds',
  },
  {
    id: 5,
    timestamp: '2024-06-01 14:30:12',
    level: 'DEBUG',
    levelColor: 'bg-green-100 text-green-700',
    message: 'Parsing response payload: {"temperature": 32, "humidity": 68}',
  },
  {
    id: 6,
    timestamp: '2024-06-01 14:28:30',
    level: 'INFO',
    levelColor: 'bg-sky-100 text-sky-700',
    message: 'Integration started successfully - polling interval: 60 seconds',
  },
];

export const APIIntegrationLogsPage = () => {
  return (
    <div className=" ">
      {/* Header section */}
      <div className="mb-6">
        <PageHeader
          title="Integration Logs: Weather API"
          description="Type: HTTP | Status: Active | Last Activity: 2 Minutes Ago"
        />

        <div className="flex mt-3 gap-2">
          <Button variant="primary">Configuration</Button>
          <Button variant="secondary">Edit</Button>
          <Button variant="outline">Clone</Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Filters:</span>

          <div className="relative">
            <select className="appearance-none bg-slate-100 border-none text-slate-600 text-xs py-1.5 pl-3 pr-8 rounded-md focus:ring-0 cursor-pointer">
              <option>All Levels</option>
              <option>INFO</option>
              <option>ERROR</option>
              <option>WARNING</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select className="appearance-none bg-slate-100 border-none text-slate-600 text-xs py-1.5 pl-3 pr-8 rounded-md focus:ring-0 cursor-pointer">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search logs..."
              className="bg-slate-100 border-none text-slate-600 text-xs py-1.5 pl-3 pr-3 rounded-md focus:ring-0 w-48 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors">
            Refresh
          </button>
          <button className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-md transition-colors">
            Auto-refresh
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3 px-4 font-medium w-12"></TableHead>
              <TableHead className="py-3 px-4 font-medium w-48">
                TIMESTAMP
              </TableHead>
              <TableHead className="py-3 px-4 font-medium w-32">
                LEVEL
              </TableHead>
              <TableHead className="py-3 px-4 font-medium">MESSAGE</TableHead>
              <TableHead className="py-3 px-4 font-medium w-24 text-center">
                DETAILS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 divide-dashed">
            {logs.map((log) => (
              <TableRow
                key={log.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <TableCell>
                  <ChevronRight className="w-4 h-4 cursor-pointer hover:text-slate-600" />
                </TableCell>
                <TableCell>{formatDate(log.timestamp)}</TableCell>
                <TableCell>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${log.levelColor}`}
                  >
                    {log.level}
                  </span>
                </TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                  <Button variant={'secondary'} size={'sm'}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination / Footer */}
    </div>
  );
};

export default APIIntegrationLogsPage;
