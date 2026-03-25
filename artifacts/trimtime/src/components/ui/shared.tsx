// Reusable UI primitives tailored to the aesthetic
import React from 'react';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  isLoading, 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  isLoading?: boolean;
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-2 border-input bg-transparent hover:bg-secondary/50 text-foreground",
    ghost: "hover:bg-secondary/50 text-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    success: "bg-[#2d6a4f] text-white hover:bg-[#1b4332] shadow-md shadow-[#2d6a4f]/20 hover:-translate-y-0.5",
  };
  
  const sizes = {
    sm: "h-9 px-3 text-sm",
    default: "h-11 px-5 py-2",
    lg: "h-14 px-8 text-lg rounded-2xl",
    icon: "h-11 w-11",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ 
  className, 
  variant = 'default', 
  children 
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'success' | 'warning' | 'neutral' }) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-[#2d6a4f]/10 text-[#2d6a4f] border-[#2d6a4f]/20",
    warning: "bg-accent/20 text-yellow-800 border-accent/30",
    neutral: "bg-secondary text-secondary-foreground border-border/50",
  };
  
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      {...props}
    />
  );
}
