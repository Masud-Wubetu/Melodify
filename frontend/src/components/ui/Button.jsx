import React from 'react';

const Button = React.forwardRef(({ className = '', variant = 'primary', size = 'default', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

    const variants = {
        primary: 'bg-primary text-black hover:bg-primary-hover',
        secondary: 'bg-white text-black hover:bg-zinc-200',
        outline: 'border border-zinc-500 bg-transparent hover:border-white text-white',
        ghost: 'bg-transparent hover:bg-zinc-800 text-white',
        danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizes = {
        default: 'h-12 py-2 px-8 text-base',
        sm: 'h-9 px-4 rounded-md text-sm',
        lg: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };
