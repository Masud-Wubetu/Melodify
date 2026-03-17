import React from 'react';

const Card = React.forwardRef(({ className = '', children, ...props }, ref) => (
    <div
        ref={ref}
        className={`rounded-xl border border-zinc-800 bg-zinc-900 text-white shadow-sm ${className}`}
        {...props}
    >
        {children}
    </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`flex flex-col space-y-1.5 p-6 ${className}`}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className = '', ...props }, ref) => (
    <h3
        ref={ref}
        className={`font-semibold leading-none tracking-tight text-2xl ${className}`}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className = '', ...props }, ref) => (
    <p
        ref={ref}
        className={`text-sm text-zinc-400 ${className}`}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className = '', ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`flex items-center p-6 pt-0 ${className}`}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
