import { useAuth } from '@/hooks/useAuth';
import { useIssues } from '@/hooks/useIssues';
import IssueCard from '@/components/issues/IssueCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyIssues = () => {
  const { profile } = useAuth();
  const { issues, loading, voteOnIssue } = useIssues({ 
    reporterId: profile?.user_id 
  });

  const getStatusStats = () => {
    const stats = {
      pending: issues.filter(issue => issue.status === 'pending').length,
      in_progress: issues.filter(issue => issue.status === 'in_progress').length,
      resolved: issues.filter(issue => issue.status === 'resolved').length,
      rejected: issues.filter(issue => issue.status === 'rejected').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Reported Issues</h1>
          <p className="text-muted-foreground">
            Track the status of issues you've reported to the community
          </p>
        </div>
        <Link to="/report">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Report New Issue
          </Button>
        </Link>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{stats.in_progress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      {issues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Issues Reported Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't reported any issues yet. Start by reporting your first civic issue.
            </p>
            <Link to="/report">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Report Your First Issue
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onVote={voteOnIssue}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIssues;