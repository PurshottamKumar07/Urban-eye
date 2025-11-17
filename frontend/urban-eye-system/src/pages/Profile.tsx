import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostsSection } from "@/components/profile/PostsSection";
import { useAuth } from "@/hooks/useAuth";
import { useIssues } from "@/hooks/useIssues";

const Profile = () => {
  const { profile, loading } = useAuth();
  const displayName = profile?.full_name || profile?.email || "";
  const avatar = "/placeholder.svg";
  const { issues, loading: issuesLoading } = useIssues({ reporterId: profile?.user_id || undefined });

  const posts = issues.map(issue => ({
    id: issue.id,
    content: issue.description,
    createdAt: issue.created_at,
    likes: issue.votes_count,
    comments: 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-profile-bg">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ProfileHeader isOwner={true} />
        <div className="mt-8">
          <PostsSection userName={displayName} userAvatar={avatar} posts={issuesLoading ? [] : posts} />
        </div>
      </div>
    </div>
  );
};

export default Profile;


