import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CivicIssue, IssueStatus, IssueCategory, IssuePriority } from '@/types/database.types';
import { toast } from '@/hooks/use-toast';

interface UseIssuesOptions {
  status?: IssueStatus;
  category?: IssueCategory;
  priority?: IssuePriority;
  reporterId?: string;
  assignedTo?: string;
  limit?: number;
}

export const useIssues = (options: UseIssuesOptions = {}) => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('civic_issues')
        .select(`
          *,
          reporter:profiles!civic_issues_reporter_id_fkey(
            id,
            user_id,
            full_name,
            email,
            role
          ),
          assignee:profiles!civic_issues_assigned_to_fkey(
            id,
            user_id,
            full_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.category) {
        query = query.eq('category', options.category);
      }
      if (options.priority) {
        query = query.eq('priority', options.priority);
      }
      if (options.reporterId) {
        query = query.eq('reporter_id', options.reporterId);
      }
      if (options.assignedTo) {
        query = query.eq('assigned_to', options.assignedTo);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setIssues(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issues');
      toast({
        title: 'Error',
        description: 'Failed to load issues',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const voteOnIssue = async (issueId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const { data: existingVote } = await supabase
        .from('issue_votes')
        .select('*')
        .eq('issue_id', issueId)
        .eq('voter_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('issue_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('issue_votes')
          .insert({
            issue_id: issueId,
            voter_id: (await supabase.auth.getUser()).data.user?.id,
            vote_type: voteType,
          });

        if (error) throw error;
      }

      // Update votes count
      const { data: votes } = await supabase
        .from('issue_votes')
        .select('vote_type')
        .eq('issue_id', issueId);

      const upvotes = votes?.filter(v => v.vote_type === 'upvote').length || 0;
      const downvotes = votes?.filter(v => v.vote_type === 'downvote').length || 0;
      const netVotes = upvotes - downvotes;

      await supabase
        .from('civic_issues')
        .update({ votes_count: netVotes })
        .eq('id', issueId);

      // Refresh issues
      fetchIssues();

      toast({
        title: 'Vote recorded',
        description: `You ${voteType}d this issue`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to record vote',
        variant: 'destructive',
      });
    }
  };

  const updateIssueStatus = async (issueId: string, newStatus: IssueStatus, notes?: string) => {
    try {
      const { data: issue } = await supabase
        .from('civic_issues')
        .select('status')
        .eq('id', issueId)
        .single();

      if (!issue) throw new Error('Issue not found');

      // Update issue status
      const updateData: any = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('civic_issues')
        .update(updateData)
        .eq('id', issueId);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('issue_status_history')
        .insert({
          issue_id: issueId,
          changed_by: (await supabase.auth.getUser()).data.user?.id,
          old_status: issue.status,
          new_status: newStatus,
          notes,
        });

      fetchIssues();

      toast({
        title: 'Status updated',
        description: `Issue status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update issue status',
        variant: 'destructive',
      });
    }
  };

  const assignIssue = async (issueId: string, assigneeId: string, department?: string) => {
    try {
      const { error } = await supabase
        .from('civic_issues')
        .update({ 
          assigned_to: assigneeId,
          department,
          status: 'in_progress'
        })
        .eq('id', issueId);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('issue_status_history')
        .insert({
          issue_id: issueId,
          changed_by: (await supabase.auth.getUser()).data.user?.id,
          old_status: 'pending',
          new_status: 'in_progress',
          notes: `Assigned to ${department || 'department'}`,
        });

      fetchIssues();

      toast({
        title: 'Issue assigned',
        description: 'Issue has been assigned for resolution',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to assign issue',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [JSON.stringify(options)]);

  return {
    issues,
    loading,
    error,
    refetch: fetchIssues,
    voteOnIssue,
    updateIssueStatus,
    assignIssue,
  };
};