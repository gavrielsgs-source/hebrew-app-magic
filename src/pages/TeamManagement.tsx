import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Settings } from "lucide-react";
import { TeamUsersTable } from "@/components/team/TeamUsersTable";
import { AddTeamUserDialog } from "@/components/team/AddTeamUserDialog";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/contexts/subscription-context";
import { UsageBar } from "@/components/subscription/UsageBar";
import { useTeamManagement } from "@/hooks/use-team-management";
import { useState } from "react";

export default function TeamManagement() {
  const { user } = useAuth();
  const { subscription, checkEntitlement } = useSubscription();
  const { teamUsers, isLoading, addTeamUser, updateUserRole, removeTeamUser } = useTeamManagement();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const userLimit = subscription.userLimit || 2;
  const currentUsage = teamUsers.length;
  const canAddMore = checkEntitlement('userLimit', currentUsage + 1);

  const handleAddUser = () => {
    setIsAddUserOpen(true);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-foreground">
                ניהול צוות
              </h1>
              <p className="text-muted-foreground">
                נהל את משתמשי הצוות שלך והגדר הרשאות גישה
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          {/* Usage Overview */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      שימוש במשתמשים
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentUsage} מתוך {userLimit} משתמשים
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAddUser}
                  disabled={!canAddMore}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Users className="h-4 w-4 mr-2" />
                  הוסף משתמש
                </Button>
              </div>
              
              <UsageBar
                used={currentUsage}
                limit={userLimit}
                label="משתמשים"
              />
            </CardContent>
          </Card>

          {/* Team Members Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-2 rounded-lg">
                    <Settings className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-right">חברי הצוות</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      נהל הרשאות וגישה של חברי הצוות
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TeamUsersTable 
                users={teamUsers} 
                onChangeRole={(userId, newRole) => updateUserRole.mutate({ userId, newRole })}
                onDeleteUser={(userId) => removeTeamUser.mutate(userId)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <AddTeamUserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        canAddMore={canAddMore}
        userLimit={userLimit}
        currentUsage={currentUsage}
        onAddUser={async (userData) => {
          await addTeamUser.mutateAsync(userData);
        }}
      />
    </div>
  );
}