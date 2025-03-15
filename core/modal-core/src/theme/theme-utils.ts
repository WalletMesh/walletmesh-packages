/**
 * Theme utility functions and type definitions
 * Provides core theme types and helper functions for theme management
 */

/**
 * Base color palette definition
 * Defines the core colors used throughout the UI
 * @interface ColorPalette
 */
export interface ColorPalette {
  /** Primary brand color */
  primary: string;
  /** Secondary/accent color */
  secondary: string;
  /** Background colors for different contexts */
  background: {
    /** Main background color */
    primary: string;
    /** Alternative background color */
    secondary: string;
  };
  /** Text colors for different contexts */
  text: {
    /** Main text color */
    primary: string;
    /** Secondary text color */
    secondary: string;
    /** Accent text color */
    accent: string;
  };
  /** Border color for UI elements */
  border: string;
  /** Colors for different state indicators */
  state: {
    /** Success state color */
    success: string;
    /** Error state color */
    error: string;
    /** Warning state color */
    warning: string;
    /** Info state color */
    info: string;
  };
}

/**
 * Typography configuration
 * Defines font families, weights, and sizes
 * @interface Typography
 */
export interface Typography {
  /** Font families for different text elements */
  fonts: {
    /** Main font family */
    primary: string;
    /** Optional alternative font family */
    secondary?: string;
  };
  /** Font weights for different text styles */
  weights: {
    /** Regular font weight */
    regular: number;
    /** Medium font weight */
    medium: number;
    /** Bold font weight */
    bold: number;
  };
  /** Font sizes for different text elements */
  sizes: {
    /** Small text size */
    small: string;
    /** Medium text size */
    medium: string;
    /** Large text size */
    large: string;
    /** Extra large text size */
    xlarge: string;
  };
}

/**
 * Spacing configuration
 * Defines consistent spacing throughout the UI
 * @interface Spacing
 */
export interface Spacing {
  /** Base unit for spacing calculations */
  unit: number;
  /** Predefined spacing sizes */
  sizes: {
    /** Extra extra small spacing */
    xxsmall: number;
    /** Extra small spacing */
    xsmall: number;
    /** Small spacing */
    small: number;
    /** Medium spacing */
    medium: number;
    /** Large spacing */
    large: number;
    /** Extra large spacing */
    xlarge: number;
    /** Extra extra large spacing */
    xxlarge: number;
  };
}

/**
 * Border radius configuration
 * Defines corner rounding for UI elements
 * @interface BorderRadius
 */
export interface BorderRadius {
  /** Small border radius */
  small: string;
  /** Medium border radius */
  medium: string;
  /** Large border radius */
  large: string;
  /** Circular border radius */
  round: string;
}

/**
 * Animation configuration
 * Defines timing and easing for UI animations
 * @interface Animation
 */
export interface Animation {
  /** Animation duration presets */
  duration: {
    /** Fast animation */
    fast: string;
    /** Normal animation */
    normal: string;
    /** Slow animation */
    slow: string;
  };
  /** Animation easing presets */
  easing: {
    /** Ease in and out */
    easeInOut: string;
    /** Ease out */
    easeOut: string;
    /** Ease in */
    easeIn: string;
  };
}

/**
 * Complete theme configuration
 * Combines all theme elements into a single configuration object
 * @interface Theme
 */
export interface Theme {
  /** Color palette */
  colors: ColorPalette;
  /** Typography settings */
  typography: Typography;
  /** Spacing configuration */
  spacing: Spacing;
  /** Border radius settings */
  borderRadius: BorderRadius;
  /** Animation configuration */
  animation: Animation;
}

/**
 * Common breakpoints for responsive design
 * @const breakpoints
 */
export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const;

/**
 * Helper to generate spacing value
 * @param theme - Theme configuration
 * @param size - Spacing size key
 * @returns Spacing value in pixels
 */
export const getSpacing = (theme: Theme, size: keyof Theme['spacing']['sizes']): string => {
  const { unit, sizes } = theme.spacing;
  return `${sizes[size] * unit}px`;
};

/**
 * Helper to generate color with opacity
 * @param color - Hex color code
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string
 */
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Helper to generate box shadow
 * @param offsetX - Horizontal offset in pixels
 * @param offsetY - Vertical offset in pixels
 * @param blurRadius - Blur radius in pixels
 * @param spreadRadius - Spread radius in pixels
 * @param color - Shadow color
 * @returns Box shadow CSS value
 */
export const generateBoxShadow = (
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  spreadRadius: number,
  color: string,
): string => {
  return `${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${color}`;
};

/**
 * Helper to generate transition
 * @param properties - CSS properties to animate
 * @param duration - Animation duration
 * @param easing - Animation easing function
 * @returns Transition CSS value
 */
export const generateTransition = (properties: string[], duration: string, easing: string): string => {
  return properties.map((property) => `${property} ${duration} ${easing}`).join(', ');
};
