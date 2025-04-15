
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, UserCircle } from "lucide-react";

export function UserNav() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "התנתקת בהצלחה",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתנתקות",
      });
    }
  };

  const navigateToProfile = () => {
    navigate("/profile");
  };

  // אם אין משתמש, לא מציג כלום
  if (!user) return null;

  // קבלת האות הראשונה מהאימייל או משם המשתמש לתצוגה באווטאר
  const userInitial = profile?.full_name 
    ? profile.full_name[0].toUpperCase() 
    : user.email 
      ? user.email[0].toUpperCase() 
      : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>החשבון שלי</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <User className="ml-2 h-4 w-4" />
          <span>{user.email}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={navigateToProfile}>
          <UserCircle className="ml-2 h-4 w-4" />
          <span>פרופיל</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="ml-2 h-4 w-4" />
          <span>התנתקות</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
