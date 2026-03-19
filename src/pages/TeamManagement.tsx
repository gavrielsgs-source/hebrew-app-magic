import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Settings } from "lucide-react";
import { TeamUsersTable } from "@/components/team/TeamUsersTable";
import { AddTeamUserDialog } from "@/components/team/AddTeamUserDialog";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/contexts/subscription-context";
import { UsageBar } from "@/components/subscription/UsageBar";
import { useTeamManagement } from "@/hooks/use-team-management";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export default function TeamManagement() {
  const { user } = useAuth();
  const { subscription, checkEntitlement } = useSubscription();
  const { teamUsers, isLoading, addTeamUser, updateUserRole, removeTeamUser } = useTeamManagement();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const isMobile = useIsMobile();

  const userLimit = subscription.userLimit || 2;
  const currentUsage = teamUsers.length;
  const canAddMore = checkEntitlement('userLimit', currentUsage + 1);

  const handleAddUser = () => {
    setIsAddUserOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl border-b-4 border-primary/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center gap-3 sm:gap-6">
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "lg"}
              onClick={() => window.history.back()}
              className="rounded-2xl bg-white/60 shadow-md hover:shadow-lg transition-all shrink-0"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="bg-primary/10 p-2.5 sm:p-4 rounded-2xl shrink-0">
                <Users className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} text-primary`} />
              </div>
              <div className="text-right min-w-0">
                <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-slate-800`}>
                  ניהול צוות
                </h1>
                <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-slate-600 mt-0.5 sm:mt-1 truncate`}>
                  נהל את משתמשי הצוות שלך והגדר הרשאות
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Usage Overview */}
          <Card className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 shadow-2xl rounded-3xl border-0">
            <CardContent className="p-4 sm:p-8">
              <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'} mb-4 sm:mb-6`}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 sm:p-4 rounded-2xl shadow-lg shrink-0">
                    <Users className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-primary`} />
                  </div>
                  <div>
                    <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-slate-800`}>
                      שימוש במשתמשים
                    </h3>
                    <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-slate-600 mt-0.5`}>
                      {currentUsage} מתוך {userLimit} משתמשים
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAddUser}
                  disabled={!canAddMore}
                  size={isMobile ? "default" : "lg"}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all text-base sm:text-lg font-semibold w-full sm:w-auto"
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

          {/* Team Members */}
          <Card className="shadow-2xl rounded-3xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-2.5 sm:p-3 rounded-2xl shadow-lg shrink-0">
                  <Settings className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-secondary-foreground`} />
                </div>
                <div>
                  <CardTitle className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-slate-800 text-right`}>חברי הצוות</CardTitle>
                  <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-slate-600 text-right mt-0.5`}>
                    נהל הרשאות וגישה של חברי הצוות
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 sm:pt-4">
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
          const result = await addTeamUser.mutateAsync(userData);
          return result;
        }}
      />
    </div>
  );
}
