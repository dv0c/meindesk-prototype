// components/TenantThemeProvider.tsx
'use client';

import React, { useMemo } from 'react';
import { Theme, ColorVariables, UtilityVariables } from '@/types/site-theme'; // Ensure path is correct

// --- Type Merging Utility ---

// Helper type to combine all theme keys for iteration
type AllVariables = ColorVariables & UtilityVariables;

interface ThemeProviderProps {
  // themeData will be the parsed JSON object from the database
  themeData: Theme | null;
  // initialMode is determined server-side based on preference or cookie
  initialMode: 'light' | 'dark';
  children: React.ReactNode;
}

/**
 * Converts a JS object of variables (snake_case keys) into a CSS variables string (kebab-case).
 * @param variables - The theme object (e.g., themeData.light)
 * @returns A string of CSS variable declarations.
 */
const createVariableString = (variables: Partial<AllVariables>): string => {
  let css = '';
  for (const [key, value] of Object.entries(variables)) {
    // Convert snake_case (JS key) to kebab-case (CSS variable name)
    const cssVarName = `--${key.replace(/_/g, '-')}`; 
    css += `${cssVarName}: ${value};`;
  }
  return css;
};

/**
 * Generates the complete CSS block containing both the :root (light/base) and .dark overrides.
 * @param theme - The full Theme object parsed from the database.
 * @returns A string containing the complete <style> block content.
 */
const generateGlobalThemeCss = (theme: Theme): string => {
  // 1. Get the base (light) variables and convert to CSS
  const lightVariables = theme.light;
  const rootCss = createVariableString(lightVariables);
  
  // 2. Get the dark mode overrides and convert to CSS
  const darkVariables = theme.dark;
  const darkCss = createVariableString(darkVariables);
  
  // 3. Construct the final CSS string
  return `
    :root { 
      /* Tenant Light Theme Variables */
      ${rootCss} 
    }
    
    .dark { 
      /* Tenant Dark Theme Overrides */
      ${darkCss} 
    }
  `;
};

// --- Theme Provider Component ---

export function TenantThemeProvider({ themeData, initialMode, children }: ThemeProviderProps) {
  // Use a sensible default theme if the database theme data is missing or invalid
  const hasValidTheme = themeData && themeData.light;
  
  // Only proceed if we have valid theme data to avoid injecting empty CSS
  const cssString = useMemo(() => {
    if (hasValidTheme) {
      return generateGlobalThemeCss(themeData);
    }
    // Return an empty string if theme data is invalid/missing
    return ''; 
  }, [themeData, hasValidTheme]);

  if (!hasValidTheme) {
      console.warn("Theme data is missing or invalid. Rendering without custom tenant theme.");
  }
  
  return (
    <>
      {/* 1. Inject the CSS variables into the DOM using <style> tag */}
      {/* We use dangerouslySetInnerHTML because we are injecting user-configured but 
          validated/typed CSS variables, and this is the most performant way to apply them. */}
      {hasValidTheme && (
        <style 
          id="tenant-custom-theme" 
          dangerouslySetInnerHTML={{ __html: cssString }} 
        />
      )}

      {/* 2. Apply the active theme class (e.g., 'light' or 'dark') to the wrapper */}
      {/* All children will inherit the theme context and styling */}
      <div className={initialMode}>
        {children}
      </div>
    </>
  );
}