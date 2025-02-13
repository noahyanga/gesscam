import { cn } from "@/lib/utils"; // A utility function for conditional classNames
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-lg border bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("border-b p-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn("border-t p-4", className)}>
      {children}
    </div>
  );
}
