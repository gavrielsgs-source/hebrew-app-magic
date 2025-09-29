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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm shadow-xl border-b-4 border-primary/20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => window.history.back()}
              className="rounded-2xl bg-white/60 shadow-md hover:shadow-lg transition-all"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-slate-800">
                  ניהול צוות
                </h1>
                <p className="text-lg text-slate-600 mt-1">
                  נהל את משתמשי הצוות שלך והגדר הרשאות גישה
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="space-y-8">
          {/* Usage Overview */}
          <Card className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 shadow-2xl rounded-3xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-2xl shadow-lg">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      שימוש במשתמשים
                    </h3>
                    <p className="text-lg text-slate-600 mt-1">
                      {currentUsage} מתוך {userLimit} משתמשים
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAddUser}
                  disabled={!canAddMore}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
                >
                  <Users className="h-5 w-5 mr-2" />
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
          <Card className="shadow-2xl rounded-3xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-3 rounded-2xl shadow-lg">
                    <Settings className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800 text-right">חברי הצוות</CardTitle>
                    <p className="text-lg text-slate-600 text-right mt-1">
                      נהל הרשאות וגישה של חברי הצוות
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
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