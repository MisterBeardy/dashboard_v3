import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a hexadecimal color code to an HSL string suitable for CSS variables.
 * @param hex The hexadecimal color code (e.g., "#RRGGBB" or "#RGB").
 * @returns An HSL string (e.g., "221.2 83.2% 53.3%") or an empty string if invalid.
 */
export function hexToHsl(hex: string): string {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    console.warn("Invalid hex color provided:", hex);
    return ""; // Return empty string for invalid input
  }

  let r = 0, g = 0, b = 0;

  // Handle 3-digit hex
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // Handle 6-digit hex
  else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else {
    return ""; // Should not happen with the regex check, but as a fallback
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = Math.round(h * 360 * 10) / 10; // Round to 1 decimal place for hue
  s = Math.round(s * 100 * 10) / 10; // Round to 1 decimal place for saturation
  l = Math.round(l * 100 * 10) / 10; // Round to 1 decimal place for lightness

  return `${h} ${s}% ${l}%`;
}
