function groups(parts: string[]) {
  return parts.filter(Boolean).join(" ");
}

export function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isPhoneValid(value: string) {
  const digits = phoneDigits(value);
  return (
    (digits.length === 10 && digits.startsWith("5")) ||
    (digits.length === 11 && digits.startsWith("05")) ||
    (digits.length === 12 && digits.startsWith("905"))
  );
}

export function formatPhoneInput(value: string) {
  let digits = phoneDigits(value);
  if (digits.startsWith("90")) digits = digits.slice(0, 12);
  else if (digits.startsWith("0")) digits = digits.slice(0, 11);
  else digits = digits.slice(0, 10);

  if (digits.startsWith("90")) {
    const rest = digits.slice(2);
    return groups([
      "90",
      rest.slice(0, 3),
      rest.slice(3, 6),
      rest.slice(6, 8),
      rest.slice(8, 10),
    ]);
  }
  if (digits.startsWith("0")) {
    return groups([
      digits.slice(0, 4),
      digits.slice(4, 7),
      digits.slice(7, 9),
      digits.slice(9, 11),
    ]);
  }
  return groups([
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ]);
}
