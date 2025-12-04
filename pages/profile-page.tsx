import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api"; 
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Check, X } from "lucide-react";
import { Menubar, MenubarItem } from "@/components/ui/menubar"
import { MenubarMenu, MenubarTrigger } from "@radix-ui/react-menubar";
import { motion } from 'framer-motion';

export default function ProfilePage(){
    const router = useRouter(); 
    const { isLoading, isAuthenticated } = useConvexAuth(); 
    const { signOut } = useAuthActions(); 
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [usernameValue, setUsernameValue] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const updateProfile = useMutation(api.userProfiles.upsert);

    // Fetch current user Data
    const currentUser = useQuery(api.auth.loggedInUser);
    const userProfile = useQuery(api.userProfiles.getCurrent);

    // Initialize username value when profile loads or when starting to edit
    useEffect(() => {
        if (!isEditingUsername) {
            setUsernameValue(userProfile?.username || "");
        }
    }, [userProfile?.username, isEditingUsername]); 

    // Redirect unauthenticated users to login
    useEffect(() => {
        if (!isLoading && !isAuthenticated){
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);
    
    const queryLoading = currentUser === undefined || userProfile === undefined; 
    console.log({
    isLoading,
    isAuthenticated,
    currentUser,
    userProfile
    });

    // Show loading spinner while checking authentication
    if (isLoading || queryLoading){
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        );
    }

    // Handle signout
    async function handleSignout() {
        try {
        await signOut();      
        router.push("/");  
        toast.success("Logout successful!"); 
        } catch (err) {
        console.error("Error signing out:", err);
        toast.warning("Error logging out!") 
        }
    }

    // Handle username update
    async function handleUsernameUpdate() {
        if (isUpdating) return; // Prevent double clicks
        
        const trimmedUsername = usernameValue.trim();
        if (!trimmedUsername) {
            toast.error("Username cannot be empty");
            return;
        }

        if (trimmedUsername.length < 3) {
            toast.error("Username must be at least 3 characters");
            return;
        }

        // If profile exists and username hasn't changed, just exit edit mode
        if (userProfile && trimmedUsername === userProfile.username) {
            setIsEditingUsername(false);
            return;
        }

        setIsUpdating(true);
        try {
            // If profile doesn't exist, create it with default values
            // If it exists, update it with current values
            await updateProfile({
                username: trimmedUsername,
                enable_rated_r: userProfile?.enable_rated_r ?? false,
                avatar_file_id: userProfile?.avatar_file_id,
            });
            toast.success(userProfile ? "Username updated successfully!" : "Profile created successfully!");
            setIsEditingUsername(false);
        } catch (error: any) {
            console.error("Error updating username:", error);
            if (error?.message?.includes("already taken")) {
                toast.error("Username is already taken. Please choose another.");
            } else {
                toast.error(error?.message || "Failed to update username");
            }
        } finally {
            setIsUpdating(false);
        }
    }

    function handleCancelEdit() {
        setUsernameValue(userProfile?.username || "");
        setIsEditingUsername(false);
    }

    // Convert creation time to date
    // Source - https://stackoverflow.com/a
    // Posted by srolfe26, modified by community. See post 'Timeline' for change history
    // Retrieved 2025-11-16, License - CC BY-SA 4.0
    function toDateTime() {
        let sec = currentUser?._creationTime ?? 0;
        let normalDate = new Date(sec).toLocaleDateString('en-US');
        return normalDate; 
    }

    // Generate avatar 
    /*
    While our code is MIT licensed, 
    the design of this avatar style is licensed under 
    Free for personal and commercial use. 
    See details for more information.
     */
    function getAvatar(seed: string) {
        //  API - generates unique avatar based on seed
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
    }

    return(
        <div className="flex flex-col">
        {/* Include Profile Navigation Bar */}
            <Menubar className="mx-auto flex gap-4 mb-8">
                <MenubarMenu>
                    <MenubarTrigger 
                    className="bg-primary text-black rounded-md px-4 py-2"
                    onClick={() => router.push("/profile-page")}>
                        Profile
                    </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger 
                    className="hover:bg-primary hover:text-black rounded-md px-4 py-2"
                    onClick={() => router.push("/watched")}>
                        Watched
                    </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger 
                    className="hover:bg-primary hover:text-black rounded-md px-4 py-2"
                    onClick={() => router.push("/watch-queue")}>
                        Movie Queue
                    </MenubarTrigger>
                </MenubarMenu>
            </Menubar>
        <div className="min-h-screen py-10 md:py-14">
            <div className="container mx-auto max-w-md">
                <motion.div
                initial={{x: "100%"}}
                animate={{x: 0}}
                exit={{x: "-100%"}}
                transition={{duration: 0.6}}
                >
                <Card>
                    <CardHeader style={{paddingTop: 16}}>
                        <CardTitle className="text-2xl">Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6" style={{padding: 16}}>
                        {/* User Avatar */}
                        <div className="flex justify-center">
                            <Avatar className="size-24 ring-2 ring-primary rounded-full overflow-hidden">
                                <AvatarImage
                                src={getAvatar(userProfile?.username || currentUser?.email || "default")}
                                alt={userProfile?.username || "User"} />
                                <AvatarFallback className="text-2xl flex items-center justify-center">
                                    {userProfile?.username?.[0]?.toUpperCase() ||
                                    currentUser?.email?.[0].toUpperCase() || "?"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        {/* User Information */}
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                                Email
                            </p>
                            <p className="text-sm font-semibold">
                                {currentUser?.email || "N/A"}
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Username
                                </p>
                                {!isEditingUsername && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setIsEditingUsername(true)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {isEditingUsername ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={usernameValue}
                                        onChange={(e) => setUsernameValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleUsernameUpdate();
                                            } else if (e.key === "Escape") {
                                                handleCancelEdit();
                                            }
                                        }}
                                        placeholder="Enter username"
                                        minLength={3}
                                        className="flex-1"
                                        autoFocus
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled={isUpdating}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleUsernameUpdate();
                                        }}
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4 text-green-600" />
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleCancelEdit();
                                        }}
                                    >
                                        <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-base font-semibold">
                                    {userProfile?.username || "N/A"}
                                </p>
                            )}
                        </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                                Member since
                            </p>
                            <p className="text-base font-semibold">
                            {toDateTime()}
                            </p>
                        <div>

                        </div>
                        {/* Sign Out Button */}
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleSignout}
                        >
                            Sign out
                        </Button>
                    </CardContent>
                </Card>
                </motion.div>
            </div>
        </div>
    </div>

    )

}
