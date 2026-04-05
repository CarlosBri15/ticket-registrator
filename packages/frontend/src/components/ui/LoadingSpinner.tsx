const sizes = {
  sm: "w-6 h-6 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-12 h-12 border-4",
} as const;

interface LoadingSpinnerProps {
  size?: keyof typeof sizes;
  className?: string;
}

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => (
  <div className={`${sizes[size]} border-brand border-t-transparent rounded-full animate-spin ${className ?? ""}`} />
);
