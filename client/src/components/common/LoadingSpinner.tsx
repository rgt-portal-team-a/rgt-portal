import React from "react";

interface LoadingSpinnerProps {
  label?: string;
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label,
  size = 32,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Enhanced blur effect with a more prominent container */}
      <div 
        className=""
        style={{ 
          minWidth: size * 3.5,
          minHeight: size * 2.5,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className="animate-spin mx-auto"
        >
          <defs>
            {/* Gradient that transitions from white to pink */}
            <linearGradient id="spinnerGradient" gradientUnits="userSpaceOnUse" x1="12" y1="2" x2="12" y2="22">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#ff00aa" />
              <stop offset="75%" stopColor="#ff00aa" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          
          {/* Main spinner arc with gradient that fades at both ends */}
          <path
            d="M12 2 A 10 10 0 0 1 22 12"
            stroke="url(#spinnerGradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {label && <p className=" text-sm text-muted-foreground">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;