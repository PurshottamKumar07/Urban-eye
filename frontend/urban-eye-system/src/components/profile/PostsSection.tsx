import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export interface ProfilePost {
    id: string;
    content: string;
    createdAt: string | Date;
    likes: number;
    comments: number;
}

interface PostsSectionProps {
    userName: string;
    userAvatar: string;
    posts: ProfilePost[];
}

export const PostsSection = ({ userName, userAvatar, posts }: PostsSectionProps) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Posts</h2>
            {posts.map((post) => (
                <Card key={post.id} className="bg-profile-card border-border p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={userAvatar} />
                            <AvatarFallback className="bg-primary text-white">
                                {userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-foreground">{userName}</h3>
                                <span className="text-muted-foreground text-sm">
                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-foreground leading-relaxed mb-4">
                                {post.content}
                            </p>
                            <div className="flex gap-6 text-muted-foreground text-sm">
                                <span className="hover:text-primary cursor-pointer transition-colors">
                                    {post.likes} likes
                                </span>
                                <span className="hover:text-primary cursor-pointer transition-colors">
                                    {post.comments} comments
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
            {posts.length === 0 && (
                <div className="text-sm text-muted-foreground">No posts yet.</div>
            )}
        </div>
    );
};


