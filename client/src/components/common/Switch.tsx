// components/ui/switch.tsx
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = ({
  checked,
  onCheckedChange,
  className,
  ...props
}: SwitchPrimitive.SwitchProps) => (
  <SwitchPrimitive.Root
    checked={checked}
    onCheckedChange={onCheckedChange}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary",
      "data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
        "data-[state=checked]:translate-x-5",
        "data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitive.Root>
);

export { Switch };
