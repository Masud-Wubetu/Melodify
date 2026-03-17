import React from 'react';

const Input = React.forwardRef(({ className = '', label, error, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-bold text-white mb-2">{label}</label>}
            <input
                className={`flex h-12 w-full rounded-md border text-white border-zinc-600 bg-zinc-800 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500 focus-visible:ring-red-500' : 'hover:border-zinc-500'
                    } ${className}`}
                ref={ref}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export { Input };
