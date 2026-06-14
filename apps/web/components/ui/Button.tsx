import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'sos';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    
    const variants = {
      default: "bg-accent text-black hover:bg-accent-dark hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-[1px]",
      destructive: "bg-danger text-white hover:bg-danger-dark hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:-translate-y-[1px]",
      outline: "border border-surface-border bg-transparent text-foreground hover:border-accent hover:text-accent hover:bg-accent/5",
      ghost: "hover:bg-surface-hover hover:text-accent",
      link: "text-accent underline-offset-4 hover:underline",
      sos: "bg-danger text-white rounded-full shadow-[0_0_0_8px_rgba(220,38,38,0.2),0_0_0_16px_rgba(220,38,38,0.1)] hover:scale-95",
    };

    const sizes = {
      default: "h-12 px-6 py-3 text-sm",
      sm: "h-10 px-4 text-xs",
      lg: "h-14 px-8 text-base",
      icon: "h-12 w-12",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-heading font-bold tracking-wider uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
          variant === 'sos' ? "rounded-full" : "rounded-md",
          variants[variant],
          variant === 'sos' ? "w-[72px] h-[72px] text-xs" : sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
