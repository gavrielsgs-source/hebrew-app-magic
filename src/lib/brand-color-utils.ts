/**
 * Converts a hex color to HSL components and generates light/dark variants.
 * Used for dynamic brand theming in the public catalog.
 */

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function getBrandCSSVars(hexColor: string): Record<string, string> {
  const { h, s, l } = hexToHsl(hexColor);
  
  return {
    '--brand-color': hexColor,
    '--brand-color-light': `hsl(${h}, ${s}%, ${Math.min(l + 35, 95)}%)`,
    '--brand-color-dark': `hsl(${h}, ${s}%, ${Math.max(l - 15, 10)}%)`,
    '--brand-color-alpha-10': `hsla(${h}, ${s}%, ${l}%, 0.1)`,
    '--brand-color-alpha-40': `hsla(${h}, ${s}%, ${l}%, 0.4)`,
  };
}
