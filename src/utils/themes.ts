//@ts-ignore
import ColorContrastChecker from "color-contrast-checker";

// An accessibility checker for validating the contrast between 2 colors based on WCAG 2.0 and WCAG 2.1 standard.
export function hasEnoughContrast(color1: string, color2: string) {
  const ccc = new ColorContrastChecker();

  if (ccc.isLevelAA(color1, color2, 14)) {
    return true;
  }

  return false;
}
