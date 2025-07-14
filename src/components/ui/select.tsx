"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || "");

  React.useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  return (
    <div className="relative">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              open,
              setOpen,
              selectedValue,
              setSelectedValue,
              onValueChange,
            })
          : child,
      )}
    </div>
  );
};

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps & any
>(({ className, children, open, setOpen, selectedValue, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    onClick={() => setOpen?.(!open)}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="line-clamp-1">{placeholder}</span>
);

export const SelectContent = ({
  children,
  open,
  setOpen,
  selectedValue,
  setSelectedValue,
  onValueChange,
}: SelectContentProps & any) => {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen?.(false)} />
      <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md top-full mt-1 w-full">
        <div className="p-1">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<any>, {
                  selectedValue,
                  setSelectedValue,
                  onValueChange,
                  setOpen,
                })
              : child,
          )}
        </div>
      </div>
    </>
  );
};

export const SelectItem = React.forwardRef<
  HTMLButtonElement,
  SelectItemProps & any
>(
  (
    {
      className,
      children,
      value,
      selectedValue,
      setSelectedValue,
      onValueChange,
      setOpen,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        selectedValue === value && "bg-accent text-accent-foreground",
        className,
      )}
      onClick={() => {
        setSelectedValue?.(value);
        onValueChange?.(value);
        setOpen?.(false);
      }}
      {...props}
    >
      {children}
    </button>
  ),
);
SelectItem.displayName = "SelectItem";
