import { useAuth } from '@/hooks/useAuth';
import { useIssues } from '@/hooks/useIssues';
import DashboardStats from '@/components/dashboard/DashboardStats';
import IssueCard from '@/components/issues/IssueCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { profile } = useAuth();
  const { issues: allIssues, loading } = useIssues({ limit: 6 });
  const { issues: myIssues } = useIssues({ 
    reporterId: profile?.user_id,
    limit: 3 
  });

  const stats = {
    totalIssues: allIssues.length,
    pendingIssues: allIssues.filter(issue => issue.status === 'pending').length,
    resolvedIssues: allIssues.filter(issue => issue.status === 'resolved').length,
    myIssues: myIssues.length,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRecentHighPriorityIssues = () => {
    return allIssues
      .filter(issue => ['high', 'critical'].includes(issue.priority))
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {profile?.full_name}!
            </h1>
            <p className="text-muted-foreground">
              Welcome to your civic engagement dashboard. Here's what's happening in your community.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              {profile?.role?.toUpperCase()}
            </Badge>
            <Link to="/report">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats {...stats} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Issues */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Issues</h2>
            <Link to="/map">
              <Button variant="outline" size="sm">
                View All on Map
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-4">
            {allIssues.slice(0, 3).map((issue) => (
              <IssueCard 
                key={issue.id} 
                issue={issue}
                showActions={false}
              />
            ))}
          </div>
          
          {allIssues.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No issues reported yet</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* High Priority Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-destructive" />
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getRecentHighPriorityIssues().map((issue) => (
                <div key={issue.id} className="border-l-4 border-destructive pl-3">
                  <h4 className="font-medium text-sm leading-tight">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {issue.category} • {issue.address}
                  </p>
                  <Badge 
                    className="mt-2 text-xs"
                    variant={issue.priority === 'critical' ? 'destructive' : 'secondary'}
                  >
                    {issue.priority}
                  </Badge>
                </div>
              ))}
              
              {getRecentHighPriorityIssues().length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No high priority issues at the moment
                </p>
              )}
            </CardContent>
          </Card>

          {/* My Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Recent Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myIssues.map((issue) => (
                <div key={issue.id} className="border-l-4 border-primary pl-3">
                  <h4 className="font-medium text-sm leading-tight">
                    {issue.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {issue.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {issue.votes_count} votes
                    </span>
                  </div>
                </div>
              ))}
              
              {myIssues.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    You haven't reported any issues yet
                  </p>
                  <Link to="/report">
                    <Button size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Report First Issue
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions for Admin/Employee */}
          {(profile?.role === 'admin' || profile?.role === 'employee') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/manage" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Review Pending Issues
                  </Button>
                </Link>
                {profile?.role === 'admin' && (
                  <Link to="/analytics" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;