import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Recipe utility functions
export function scaleIngredients(ingredients: any[], currentServings: number, targetServings: number) {
  const scale = targetServings / currentServings;
  
  return ingredients.map(ingredient => ({
    ...ingredient,
    amount: ingredient.amount * scale
  }));
}

export function formatCookingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} Min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} Std`;
  }
  
  return `${hours} Std ${remainingMinutes} Min`;
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getDifficultyText(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'Einfach';
    case 'medium':
      return 'Mittel';
    case 'hard':
      return 'Schwer';
    default:
      return difficulty;
  }
}