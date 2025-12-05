"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function Comment( props: any ) {
	return <div key={props.comment._id} className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">{props.comment.username}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(props.comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{props.comment.value}</div>
          </div>;
}