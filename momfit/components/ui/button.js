export function Button({ children, onClick, className = "", variant = "default", size = "md" }) {
    const base = "rounded-lg px-3 py-2 font-medium transition";
    const variants = {
      default: "bg-pink-500 text-white hover:bg-pink-600",
      outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
      destructive: "bg-red-500 text-white hover:bg-red-600"
    };
    const sizes = {
      sm: "text-sm px-2 py-1",
      md: "text-base px-3 py-2",
      lg: "text-lg px-4 py-3"
    };
  
    return (
      <button onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
        {children}
      </button>
    );
  }
  