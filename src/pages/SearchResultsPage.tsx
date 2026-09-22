import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/common/PageHeader';
import { ChevronRight, Edit, Eye, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SearchResult {
  id: string;
  name: string;
  role: string;
  type: 'User' | 'Customer';
  email: string;
  customer: string;
  status: 'Active' | 'Pending' | 'Inactive';
  lastLogin: string;
  avatar: string;
}

const searchResults: SearchResult[] = [
  {
    id: '1',
    name: 'John Admin',
    role: 'System Administrator',
    type: 'User',
    email: 'john.admin@system.com',
    customer: 'System',
    status: 'Active',
    lastLogin: '2024-03-15',
    avatar: 'JD',
  },
  {
    id: '2',
    name: 'Acme Corporation',
    role: 'SysAdmin',
    type: 'Customer',
    email: 'contact@acme.com',
    customer: 'Acme Corporation',
    status: 'Pending',
    lastLogin: '2024-03-14',
    avatar: 'AC',
  },
  {
    id: '3',
    name: 'John Admin',
    role: 'Manager',
    type: 'User',
    email: 'john.admin@system.com',
    customer: 'TechCorp Ltd.',
    status: 'Active',
    lastLogin: 'Never',
    avatar: 'JD',
  },
];

interface AppliedFilter {
  id: string;
  label: string;
  value: string;
}

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || 'admin';
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([
    { id: '1', label: 'Role', value: 'Admin' },
    { id: '2', label: 'Status', value: 'Active' },
    { id: '3', label: 'Customer', value: 'Active' },
  ]);

  const handleRemoveFilter = (filterId: string) => {
    setAppliedFilters((prev) => prev.filter((f) => f.id !== filterId));
    toast.success('Filter removed');
  };

  const handleClearAll = () => {
    setAppliedFilters([]);
    toast.success('All filters cleared');
  };

  const handleEdit = (id: string) => {
    toast.success('Edit functionality');
  };

  const handleView = (id: string) => {
    toast.success('View functionality');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500 text-white';
      case 'Pending':
        return 'bg-yellow-500 text-white';
      case 'Inactive':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'User':
        return 'bg-secondary  text-white';
      case 'Customer':
        return 'bg-secondary-main text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRoleColor = (role: string) => {
    if (role.includes('SysAdmin') || role.includes('System Administrator')) {
      return 'bg-secondary text-white';
    }
    return 'bg-secondary-main text-white';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  Search Results
                </h1>
                <p className="text-gray-600 text-sm">
                  Found 12 results for "{searchQuery}" in Users and Customers
                </p>
              </div>
            </div>
            {appliedFilters.length > 0 && (
              <div className="flex items-center  mt-4 justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">
                    Applied Filters:
                  </span>
                  {appliedFilters.map((filter) => (
                    <Badge
                      key={filter.id}
                      variant="outline"
                      className="bg-gray-100 text-gray-700 px-3 py-1 flex items-center gap-2"
                    >
                      <span>
                        {filter.label}: {filter.value}
                      </span>
                      <button
                        onClick={() => handleRemoveFilter(filter.id)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  size="sm"
                  className="text-gray-700"
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filter and Action Bar */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <Select defaultValue="all-types" className="w-[140px]">
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all-roles" className="w-[140px]">
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-roles">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all-roles-2" className="w-[140px]">
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-roles-2">All Roles</SelectItem>
                    <SelectItem value="sysadmin">SysAdmin</SelectItem>
                    <SelectItem value="tenant-admin">Tenant Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="last-30" className="w-[160px]">
                  <SelectTrigger>
                    <SelectValue placeholder="Last 30 days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-30">Last 30 days</SelectItem>
                    <SelectItem value="last-7">Last 7 days</SelectItem>
                    <SelectItem value="last-90">Last 90 days</SelectItem>
                    <SelectItem value="all-time">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Advanced
                </Button>
                <Button className="bg-gray-600 hover:bg-gray-700 text-white">
                  Export
                </Button>
                <Button className="bg-secondary hover:bg-secondary/90 text-white">
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-white shadow-sm p-8">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-700 hover:bg-gray-700">
                    <TableHead className="text-white font-semibold">
                      NAME
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      TYPE
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      EMAIL/CONTACT
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      ROLE
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      CUSTOMER
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      STATUS
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      LAST LOGIN
                    </TableHead>
                    <TableHead className="text-white font-semibold text-right">
                      ACTIONS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((result) => (
                    <TableRow key={result.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* <Avatar className="h-8 w-8 bg-gray-200">
                            <AvatarFallback className="text-gray-600 text-xs font-semibold">
                              {result.avatar}
                            </AvatarFallback>
                          </Avatar> */}
                          <div>
                            <p className="font-medium text-gray-900">
                              {result.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {result.role}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getTypeColor(result.type)} px-2 py-1`}
                        >
                          {result.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {result.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getRoleColor(result.role)} px-2 py-1`}
                        >
                          {result.role.includes('System Administrator')
                            ? 'SysAdmin'
                            : result.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {result.customer}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusColor(
                            result.status
                          )} px-2 py-1`}
                        >
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {result.lastLogin}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleEdit(result.id)}
                            variant="ghost"
                            size="sm"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                          >
                            <Edit className="h-4 w-4  " />
                          </Button>
                          <Button
                            onClick={() => handleView(result.id)}
                            size="sm"
                            className="bg-secondary hover:bg-secondary/90 text-white h-8 w-8 p-0 rounded-md"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
