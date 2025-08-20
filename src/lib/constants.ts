// Mirolo Brand Colors
export const COLORS = {
  primary: '#7a8471', // Salbeigrün
  background: '#fefdfb', // Warmes Creme
  surface: '#ffffff',
  text: '#2d2d2d',
  textLight: '#6b7361',
  border: '#e4e4e7',
  accent: '#f1f2f0',
} as const;

// App Limits
export const LIMITS = {
  RECIPE_TITLE_MAX: 100,
  RECIPE_SUMMARY_MAX: 500,
  INGREDIENT_NAME_MAX: 100,
  STEP_INSTRUCTION_MAX: 1000,
  TIP_CONTENT_MAX: 500,
  SHOPPING_LIST_NAME_MAX: 50,
  PHOTO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PHOTOS_PER_RECIPE: 10,
  MAX_INGREDIENTS_PER_RECIPE: 50,
  MAX_STEPS_PER_RECIPE: 30,
} as const;

// Recipe Defaults
export const RECIPE_DEFAULTS = {
  SERVINGS: 2,
  DIFFICULTY: 'medium' as const,
  CUISINE: 'Deutsch',
  TOTAL_TIME: 30,
  ACTIVE_TIME: 20,
} as const;

// Supported file types for photo upload
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
] as const;

// Navigation tabs
export const NAV_TABS = {
  HOME: 'home',
  SEARCH: 'search',
  CREATE: 'create',
  DISCOVER: 'discover',
  PROFILE: 'profile',
} as const;

// Recipe tabs
export const RECIPE_TABS = {
  MINE: 'mine',
  FAVORITES: 'favorites',
  RECENT: 'recent',
} as const;

// Available cuisines
export const CUISINES = [
  'Deutsch',
  'Italienisch',
  'Asiatisch',
  'Mexikanisch',
  'Französisch',
  'Griechisch',
  'Indisch',
  'Thai',
  'Amerikanisch',
  'Mediterran',
  'Orientalisch',
  'Spanisch',
] as const;

// Available units for ingredients
export const UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'TL',
  'EL',
  'Tasse',
  'Stück',
  'Bund',
  'Prise',
  'Packung',
  'Dose',
  'Glas',
  'Scheibe',
  'Zehe',
] as const;

// Ingredient categories for better organization
export const INGREDIENT_CATEGORIES = [
  'Gemüse',
  'Fleisch & Fisch',
  'Milchprodukte',
  'Getreide & Hülsenfrüchte',
  'Gewürze & Kräuter',
  'Süßes & Backen',
  'Öle & Essig',
  'Sonstiges',
] as const;

// OpenAI Configuration
export const AI_CONFIG = {
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
} as const;