import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "text" | "contained" | "outlined"; // Button styles
}

const Button: React.FC<ButtonProps> = ({ variant = "contained", className, children, ...props }) => {
  // Define basic styles for each variant
  const baseClass = "px-4 py-2 rounded font-medium focus:outline-none";
  const variantClasses = {
    text: "bg-transparent text-primary hover:underline",
    contained: "bg-primary text-white hover:bg-primary-dark",
    outlined: "border border-primary text-primary hover:bg-primary-light",
  };

  const combinedClassName = `${baseClass} ${variantClasses[variant]} ${className || ""}`.trim();

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;
