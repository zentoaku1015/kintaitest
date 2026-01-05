"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
} | null>(null)

export function Dialog({
    children,
    open,
    onOpenChange,
}: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isControlled = open !== undefined
    const finalOpen = isControlled ? open : internalOpen
    const finalOnOpenChange = (v: boolean) => {
        if (!isControlled) setInternalOpen(v)
        onOpenChange?.(v)
    }

    return (
        <DialogContext.Provider value={{ open: finalOpen, onOpenChange: finalOnOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

export function DialogTrigger({ asChild, children, ...props }: any) {
    const context = React.useContext(DialogContext)
    if (!context) throw new Error("DialogTrigger must be used within Dialog")

    const Comp = asChild ? React.Children.only(children) : "button"

    return (
        <Comp // @ts-ignore
            onClick={(e) => {
                children.props.onClick?.(e)
                context.onOpenChange(true)
            }}
            {...props}
        >
            {children.props?.children || children} // handle if not asChild perfectly
        </Comp>
    )
}

export function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const context = React.useContext(DialogContext)
    if (!context) throw new Error("DialogContent must be used within Dialog")

    if (!context.open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in-0">
            <div
                className="absolute inset-0"
                onClick={() => context.onOpenChange(false)}
            />
            <div
                className={cn(
                    "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg md:w-full",
                    className
                )}
                {...props}
            >
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    onClick={() => context.onOpenChange(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    )
}

export function DialogHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex flex-col space-y-1.5 text-center sm:text-left",
                className
            )}
            {...props}
        />
    )
}

export function DialogFooter({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
                className
            )}
            {...props}
        />
    )
}

export function DialogTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                "text-lg font-semibold leading-none tracking-tight",
                className
            )}
            {...props}
        />
    )
}

export function DialogDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}
