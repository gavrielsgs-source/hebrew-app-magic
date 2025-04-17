
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
import { LogOut, Palette, User, UserCircle } from "lucide-react";

export function UserNav() {
  const { user, signOut } = useAuth();
  const { profile, isLoading } = useProfile();
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

  // Debug log to track profile loading
  console.log("UserNav - Profile state:", { profile, isLoading });

  // קבלת האות הראשונה מהאימייל או משם המשתמש לתצוגה באווטאר
  const userInitial = profile?.full_name 
    ? profile.full_name[0].toUpperCase() 
    : user.email 
      ? user.email[0].toUpperCase() 
      : "U";

  // בחירת צבע מותאם לפי המשתמש - לעיצוב יותר דינמי
  const avatarColors = [
    "bg-gradient-to-br from-pink-500 to-orange-400", 
    "bg-gradient-to-br from-blue-500 to-cyan-400",
    "bg-gradient-to-br from-purple-500 to-indigo-400",
    "bg-gradient-to-br from-green-500 to-emerald-400",
    "bg-gradient-to-br from-yellow-400 to-amber-500"
  ];
  
  // בחירת צבע לפי האות הראשונה של שם המשתמש או האימייל
  const colorIndex = (userInitial.charCodeAt(0) % avatarColors.length);
  const avatarColor = avatarColors[colorIndex];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-white/20 hover:ring-primary/30 transition-all">
          <Avatar className="border-2 border-white/10">
            <AvatarFallback className={`${avatarColor} text-white font-semibold`}>
              {isLoading ? "..." : userInitial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mr-2 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
        <DropdownMenuLabel className="font-semibold">החשבון שלי</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200/70 dark:bg-slate-700/70" />
        <DropdownMenuItem disabled className="opacity-80 flex items-center">
          <User className="ml-2 h-4 w-4 text-blue-500" />
          <span>{user.email}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={navigateToProfile} className="flex items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <UserCircle className="ml-2 h-4 w-4 text-purple-500" />
          <span>פרופיל</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-200/70 dark:bg-slate-700/70" />
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <LogOut className="ml-2 h-4 w-4" />
          <span>התנתקות</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
