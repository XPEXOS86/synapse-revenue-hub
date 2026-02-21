import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileSettings } from "@/components/auth/ProfileSettings";
import { CreateTeam } from "@/components/auth/CreateTeam";
import { TeamInvitations } from "@/components/auth/TeamInvitations";
import { TeamMembers } from "@/components/auth/TeamMembers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TeamSettings() {
  const navigate = useNavigate();
  const { profile, currentTeam, teams, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-500 mt-1">
              Manage your profile, teams, and account preferences
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <ProfileSettings />
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <p className="font-medium">
                      {profile?.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase">Member Since</p>
                    <p className="font-medium">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Current Team</h2>
                {currentTeam ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{currentTeam.name}</CardTitle>
                      <CardDescription>{currentTeam.slug}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentTeam.description && (
                          <p className="text-sm">{currentTeam.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Created{" "}
                          {new Date(currentTeam.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">No team selected</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {teams.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Your Teams</h2>
                  <div className="grid gap-3">
                    {teams.map((team) => (
                      <Card key={team.id} className="cursor-pointer hover:bg-gray-50">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {team.name}
                          </CardTitle>
                          <CardDescription>
                            {team.slug} • {team.is_active ? "Active" : "Inactive"}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <CreateTeam />
            </div>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations">
            <TeamInvitations />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            {currentTeam ? (
              <TeamMembers />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">
                    Please select a team to manage members
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
