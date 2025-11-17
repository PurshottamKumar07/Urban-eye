import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIssues } from '@/hooks/useIssues';
import { MapPin, Filter, RefreshCw } from 'lucide-react';
import { IssueCategory, IssueStatus, IssuePriority } from '@/types/database.types';

const IssuesMap = () => {
  const [filters, setFilters] = useState<{
    status?: IssueStatus;
    category?: IssueCategory;
    priority?: IssuePriority;
  }>({});

  const { issues, loading, refetch } = useIssues(filters);

  const categories: { value: IssueCategory; label: string }[] = [
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'sanitation', label: 'Sanitation' },
    { value: 'traffic', label: 'Traffic' },
    { value: 'environment', label: 'Environment' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'safety', label: 'Safety' },
    { value: 'other', label: 'Other' },
  ];

  const statuses: { value: IssueStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'escalated', label: 'Escalated' },
  ];

  const priorities: { value: IssuePriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-secondary';
      case 'medium': return 'bg-accent';
      case 'high': return 'bg-destructive';
      case 'critical': return 'bg-destructive animate-pulse';
      default: return 'bg-secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-accent';
      case 'in_progress': return 'border-secondary';
      case 'resolved': return 'border-green-500';
      case 'rejected': return 'border-destructive';
      case 'escalated': return 'border-destructive';
      default: return 'border-muted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Issues Map</h1>
          <p className="text-muted-foreground">
            Interactive view of all reported civic issues in your area
          </p>
        </div>
        <Button onClick={refetch} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select 
                value={filters.status || ''} 
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, status: value as IssueStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select 
                value={filters.category || ''} 
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, category: value as IssueCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select 
                value={filters.priority || ''} 
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, priority: value as IssuePriority }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setFilters({})}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder - In a real implementation, this would be an interactive map */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Map View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
            {/* Simulated map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10" />
            
            {/* Simulated issue markers */}
            <div className="absolute inset-0 p-8">
              {issues.slice(0, 8).map((issue, index) => (
                <div
                  key={issue.id}
                  className={`absolute w-4 h-4 rounded-full ${getPriorityColor(issue.priority)} 
                    border-2 ${getStatusColor(issue.status)} cursor-pointer transform hover:scale-125 transition-transform`}
                  style={{
                    left: `${20 + (index % 4) * 20}%`,
                    top: `${20 + Math.floor(index / 4) * 30}%`,
                  }}
                  title={issue.title}
                />
              ))}
            </div>
            
            <div className="text-center z-10">
              <MapPin className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">
                Interactive Map
              </h3>
              <p className="text-muted-foreground">
                {issues.length} issues plotted on the map
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                In production, this would show an interactive map with real locations
              </p>
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary border-2 border-accent" />
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary border-2 border-secondary" />
              <span className="text-sm">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary border-2 border-green-500" />
              <span className="text-sm">Resolved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive border-2 border-destructive" />
              <span className="text-sm">High Priority</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Issues List ({issues.length} found)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}

          {!loading && issues.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No issues found with current filters</p>
            </div>
          )}

          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="border rounded-lg p-4 hover:bg-accent/10 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{issue.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {issue.category}
                    </Badge>
                    <Badge 
                      className={getPriorityColor(issue.priority).replace('bg-', 'bg-')} 
                      variant="secondary"
                    >
                      {issue.priority}
                    </Badge>
                    <Badge variant="outline">
                      {issue.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-2 line-clamp-2">
                  {issue.description}
                </p>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {issue.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {issue.address}
                      </div>
                    )}
                    <span>
                      {issue.votes_count} votes
                    </span>
                  </div>
                  <span>
                    {new Date(issue.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssuesMap;