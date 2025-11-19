import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api"; 
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export default function ProfilePage(){
    const router = useRouter(); 
    const { isLoading, isAuthenticated } = useConvexAuth(); 
    const { signOut } = useAuthActions(); 

    // Fetch current user Data
    const currentUser = useQuery(api.auth.loggedInUser);
    const userProfile = useQuery(api.userProfiles.getCurrent); // correct way to get userID?

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

    // Show login prompt if not authenticated --> need this... handled in login.tsx?
    // if (!isAuthenticated) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center p-4">
    //             <Card className="w-full max-w-md">
    //                 <CardHeader>
    //                     <CardTitle>Access Denied</CardTitle>
    //                 </CardHeader>
    //                 <CardContent className="space-y-4">
    //                     <p className="text-muted-foreground">
    //                         Please log in to view your profile
    //                     </p>
    //                     <Button
    //                     className="w-full"
    //                     onClick={() => router.push("/login")}
    //                     >
    //                     Go to Login
    //                     </Button>
    //                 </CardContent>
    //             </Card>
    //         </div>
    //     )
    // }

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
        <div className="min-h-screen py-10 md:py-14">
            <div className="container mx-auto px-4 max-w-md">
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
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                                Username
                            </p>
                            <p className="text-base font-semibold">
                                {userProfile?.username || "N/A"}
                            </p>
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
            </div>
        </div>
    )

}
