import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Calendar,
  User
} from 'lucide-react';
import { CivicIssue } from '@/types/database.types';

interface IssueCardProps {
  issue: CivicIssue;
  onVote?: (issueId: string, voteType: 'upvote' | 'downvote') => void;
  onViewDetails?: (issueId: string) => void;
  showActions?: boolean;
}

const IssueCard = ({ issue, onVote, onViewDetails, showActions = true }: IssueCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'outline';
      case 'rejected':
        return 'destructive';
      case 'escalated':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-secondary text-secondary-foreground';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'critical':
        return 'bg-destructive text-destructive-foreground animate-pulse';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    // You can extend this with more specific icons
    return MapPin;
  };

  const CategoryIcon = getCategoryIcon(issue.category);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
            <Badge className={getPriorityColor(issue.priority)}>
              {issue.priority}
            </Badge>
            <Badge variant={getStatusColor(issue.status)}>
              {issue.status.replace('_', ' ')}
            </Badge>
          </div>
          <Badge variant="outline" className="capitalize">
            {issue.category}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg leading-tight">{issue.title}</h3>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-muted-foreground mb-3 line-clamp-2">
          {issue.description}
        </p>
        
        {issue.address && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-3 w-3 mr-1" />
            {issue.address}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
            </div>
            {issue.reporter && (
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {issue.reporter.full_name}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <ThumbsUp className="h-3 w-3 mr-1" />
              {issue.votes_count || 0}
            </div>
          </div>
        </div>

        {issue.image_urls && issue.image_urls.length > 0 && (
          <div className="mt-3">
            <img
              src={issue.image_urls[0]}
              alt="Issue"
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              {onVote && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVote(issue.id, 'upvote')}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Support
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVote(issue.id, 'downvote')}
                  >
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    Dispute
                  </Button>
                </>
              )}
            </div>
            
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(issue.id)}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Details
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default IssueCard;