"use client";
import { useEffect, useState } from "react";
import { useMutation, useQueries, useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function Comment(props : any) {
	const user = useQuery(api.userProfiles.getUserById, {
				userId: props.comment.user_id
			  });
			  
	return <div key={props.comment._id} className="p-4 border rounded-lg">
		<div className="text-sm text-muted-foreground">{user?.username || "Anonymous"}</div>
        	<div className="text-sm text-muted-foreground">{new Date(props.comment.created_at).toLocaleString()}</div>
			<div className="text-lg text-muted-foreground">{props.comment.value}</div>
        </div>
}