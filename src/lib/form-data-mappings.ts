/**
 * Form Data Mappings
 * 
 * This file serves as the single source of truth for all form data arrays
 * used throughout the application. Centralizing these mappings ensures
 * consistency and makes updates easier to manage.
 * 
 * Features:
 * - Language options with country flags and proper values
 * - Standardized language proficiency levels (CEFR)
 * - Age group categories with clear ranges
 * - Extensible structure for future form data needs
 */

// Language options with country flags for visual enhancement
export const languages = [
  { label: "English", country: "🇺🇸", value: "English" },
  { label: "Spanish", country: "🇪🇸", value: "Spanish" },
  { label: "German", country: "🇩🇪", value: "German" },
  { label: "Polish", country: "🇵🇱", value: "Polish" },
  { label: "French", country: "🇫🇷", value: "French" },
  { label: "Italian", country: "🇮🇹", value: "Italian" },
  { label: "Arabic", country: "🇸🇦", value: "Arabic" },
  { label: "Russian", country: "🇷🇺", value: "Russian" },
  { label: "Ukrainian", country: "🇺🇦", value: "Ukrainian" },
  { label: "Chinese", country: "🇨🇳", value: "Chinese" },
  { label: "Japanese", country: "🇯🇵", value: "Japanese" },
  { label: "Portuguese", country: "🇵🇹", value: "Portuguese" },
  { label: "Korean", country: "🇰🇷", value: "Korean" },
];

// Language proficiency levels based on Common European Framework of Reference (CEFR)
export const levels = [
  { value: "A1", label: "A1 - Beginner" },
  { value: "A2", label: "A2 - Elementary" },
  { value: "B1", label: "B1 - Intermediate" },
  { value: "B2", label: "B2 - Upper Intermediate" },
  { value: "C1", label: "C1 - Advanced" },
  { value: "C2", label: "C2 - Proficient" },
];

// Age group categories with clear age ranges
export const ageGroups = [
  { value: "child", label: "Child (6–12 years)" },
  { value: "teenager", label: "Teenager (13–17 years)" },
  { value: "adult-18-39", label: "Adult (18–39 years)" },
  { value: "adult-40-59", label: "Adult (40–59 years)" },
  { value: "senior", label: "Senior (60+ years)" },
];

// Contact preference options
export const contactPreferences = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "both", label: "Both Email and Phone" },
];

// Common timezone options
export const timezones = [
  { value: "UTC", label: "UTC - Coordinated Universal Time" },
  { value: "EST", label: "EST - Eastern Standard Time" },
  { value: "PST", label: "PST - Pacific Standard Time" },
  { value: "GMT", label: "GMT - Greenwich Mean Time" },
  { value: "CET", label: "CET - Central European Time" },
  { value: "JST", label: "JST - Japan Standard Time" },
  { value: "CST", label: "CST - China Standard Time" },
  { value: "IST", label: "IST - India Standard Time" },
];

/**
 * Helper functions for working with form data
 */

/**
 * Get language option by value
 * @param value - Language value to search for
 * @returns Language object or undefined if not found
 */
export const getLanguageByValue = (value: string) => {
  return languages.find(lang => lang.value === value);
};

/**
 * Get level option by value
 * @param value - Level value to search for
 * @returns Level object or undefined if not found
 */
export const getLevelByValue = (value: string) => {
  return levels.find(level => level.value === value);
};

/**
 * Get age group option by value
 * @param value - Age group value to search for
 * @returns Age group object or undefined if not found
 */
export const getAgeGroupByValue = (value: string) => {
  return ageGroups.find(ageGroup => ageGroup.value === value);
};

/**
 * Format language display with flag
 * @param languageValue - Language value
 * @returns Formatted string with flag and label
 */
export const formatLanguageDisplay = (languageValue: string): string => {
  const language = getLanguageByValue(languageValue);
  return language ? `${language.country} ${language.label}` : languageValue;
};