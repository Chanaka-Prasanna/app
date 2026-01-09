/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Brand Colors
const primaryPurple = '#6366F1'; // Main purple from design
const primaryPurpleLight = '#818CF8';
const primaryPurpleDark = '#4F46E5';

// Neutral Colors
const neutral50 = '#F9FAFB';
const neutral100 = '#F3F4F6';
const neutral200 = '#E5E7EB';
const neutral300 = '#D1D5DB';
const neutral400 = '#9CA3AF';
const neutral500 = '#6B7280';
const neutral600 = '#4B5563';
const neutral700 = '#374151';
const neutral800 = '#1F2937';
const neutral900 = '#111827';

// Semantic Colors
const white = '#FFFFFF';
const black = '#000000';
const error = '#EF4444';
const success = '#10B981';
const warning = '#F59E0B';

export const Colors = {
  light: {
    // Text
    text: neutral900,
    textSecondary: neutral600,
    textTertiary: neutral500,
    
    // Backgrounds
    background: white,
    backgroundSecondary: neutral50,
    backgroundTertiary: neutral100,
    
    // Brand
    primary: primaryPurple,
    primaryLight: primaryPurpleLight,
    primaryDark: primaryPurpleDark,
    
    // UI Elements
    border: neutral200,
    borderDashed: neutral300,
    card: white,
    cardShadow: 'rgba(0, 0, 0, 0.05)',
    
    // Icons
    icon: neutral600,
    iconSecondary: neutral500,
    iconOnPrimary: white,
    
    // Tabs
    tint: primaryPurple,
    tabIconDefault: neutral400,
    tabIconSelected: primaryPurple,
    tabBarBackground: white,
    
    // Semantic
    error,
    success,
    warning,
  },
  dark: {
    // Text
    text: neutral50,
    textSecondary: neutral300,
    textTertiary: neutral400,
    
    // Backgrounds
    background: neutral900,
    backgroundSecondary: neutral800,
    backgroundTertiary: neutral700,
    
    // Brand
    primary: primaryPurpleLight,
    primaryLight: '#A5B4FC',
    primaryDark: primaryPurple,
    
    // UI Elements
    border: neutral700,
    borderDashed: neutral600,
    card: neutral800,
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    
    // Icons
    icon: neutral300,
    iconSecondary: neutral400,
    iconOnPrimary: white,
    
    // Tabs
    tint: primaryPurpleLight,
    tabIconDefault: neutral500,
    tabIconSelected: primaryPurpleLight,
    tabBarBackground: neutral900,
    
    // Semantic
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
