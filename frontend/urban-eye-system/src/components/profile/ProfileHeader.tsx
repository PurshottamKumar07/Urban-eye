import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, Save, X, Camera, Image as ImageIcon, Trash2, Move } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  isOwner?: boolean;
}

export const ProfileHeader = ({ isOwner = true }: ProfileHeaderProps) => {
  const { profile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar: "/placeholder.svg",
    avatar_url: "",
    banner_url: "",
    banner_offset_y: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const lastYRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // banner input
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        avatar: "/placeholder.svg",
        avatar_url: (profile as any).avatar_url ?? "",
        banner_url: (profile as any).banner_url ?? "",
        banner_offset_y: (profile as any).banner_offset_y ?? 0
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    await supabase
      .from('profiles')
      .update({
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url || null,
        banner_url: profileData.banner_url || null,
        banner_offset_y: profileData.banner_offset_y || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const onPickBanner = () => fileInputRef.current?.click();
  const onPickAvatar = () => avatarInputRef.current?.click();

  const onUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `banners/${user.id}-${Date.now()}.${fileExt}`;
    // Show immediate preview
    const localUrl = URL.createObjectURL(file);
    setProfileData(prev => ({ ...prev, banner_url: localUrl }));
    const { error: uploadError } = await supabase.storage.from('profile-banners').upload(filePath, file, { upsert: true });
    if (uploadError) return;
    const { data } = supabase.storage.from('profile-banners').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    setProfileData(prev => ({ ...prev, banner_url: publicUrl }));
  };

  const onRemoveBanner = async () => {
    setProfileData(prev => ({ ...prev, banner_url: "", banner_offset_y: 0 }));
  };

  const onUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;
    const localUrl = URL.createObjectURL(file);
    setProfileData(prev => ({ ...prev, avatar_url: localUrl }));
    const { error: uploadError } = await supabase.storage.from('profile-avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Upload failed', description: 'Could not upload avatar', variant: 'destructive' });
      return;
    }
    const { data } = supabase.storage.from('profile-avatars').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
    toast({ title: 'Avatar updated', description: 'Remember to Save to persist profile.' });
  };

  const onBannerMouseDown = (e: React.MouseEvent) => {
    if (!isEditing || !profileData.banner_url) return;
    setIsDragging(true);
    lastYRef.current = e.clientY;
  };

  const onBannerMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || lastYRef.current === null) return;
    const deltaY = e.clientY - lastYRef.current;
    lastYRef.current = e.clientY;
    setProfileData(prev => ({ ...prev, banner_offset_y: Math.max(-200, Math.min(200, prev.banner_offset_y + deltaY)) }));
  };

  const onBannerMouseUp = () => {
    if (!isEditing) return;
    setIsDragging(false);
    lastYRef.current = null;
  };

  return (
    <Card className="bg-profile-card border-border shadow-lg">
      <div
        className="bg-profile-header h-40 rounded-t-lg relative overflow-hidden"
        onMouseMove={onBannerMouseMove}
        onMouseUp={onBannerMouseUp}
        onMouseLeave={onBannerMouseUp}
      >
        {profileData.banner_url && (
          <img
            src={profileData.banner_url}
            alt="Profile banner"
            className="absolute inset-0 w-full object-cover rounded-t-lg select-none"
            style={{ top: 0, transform: `translateY(${profileData.banner_offset_y}px)` }}
            onMouseDown={onBannerMouseDown}
            draggable={false}
          />
        )}
        {isEditing && (
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <Button size="sm" variant="secondary" onClick={onPickBanner}>
              <ImageIcon className="h-4 w-4 mr-1" /> Change cover
            </Button>
            {profileData.banner_url && (
              <Button size="sm" variant="destructive" onClick={onRemoveBanner}>
                <Trash2 className="h-4 w-4 mr-1" /> Remove
              </Button>
            )}
            {profileData.banner_url && (
              <div className="hidden md:flex items-center text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded border">
                <Move className="h-3 w-3 mr-1" /> Drag to reposition
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onUploadBanner} />
          </div>
        )}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <Avatar className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
              <AvatarImage src={profileData.avatar_url || profileData.avatar} />
              <AvatarFallback className="text-2xl bg-white text-primary">
                {profileData.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isOwner && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 shadow-md"
                onClick={onPickAvatar}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onUploadAvatar} />
          </div>
        </div>
      </div>

      <div className="pt-20 p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                {/* Removed banner URL text input */}
                <Input
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className="text-2xl font-bold bg-white border-border"
                  placeholder="Full Name"
                />
                <Input
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="bg-white border-border"
                  placeholder="Email"
                  type="email"
                />
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="bg-white border-border"
                  placeholder="Phone Number"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {profileData.full_name}
                </h1>
                {isOwner && (
                  <>
                    <p className="text-muted-foreground mb-1">{profileData.email}</p>
                    <p className="text-muted-foreground">{profileData.phone}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {isOwner && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm" className="bg-primary hover:bg-primary-dark" disabled={isSaving}>
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};


