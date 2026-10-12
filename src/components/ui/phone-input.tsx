"use client";

import { Input } from "@/components/ui/input";
import { formatPhoneInput } from "@/lib/phone";

export function PhoneInput({ onChange, onBeforeInput, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="05xx xxx xx xx"
      {...props}
      onBeforeInput={(event) => {
        const data = (event.nativeEvent as InputEvent).data;
        if (data && [...data].every((char) => /\D/.test(char))) {
          event.preventDefault();
        }
        onBeforeInput?.(event);
      }}
      onChange={(event) => {
        event.target.value = formatPhoneInput(event.target.value);
        onChange?.(event);
      }}
    />
  );
}
