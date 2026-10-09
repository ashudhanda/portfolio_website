
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge conditional class names into a single Tailwind-safe string.
 *
 * Combines clsx (conditional/templated class handling) with tailwind-merge,
 * so conflicting utilities (e.g. "px-2 px-4") resolve to the last one
 * instead of both being emitted.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Inject a keyframe-based animation into the document head at runtime.
 *
 * Builds a `@keyframes` rule from the given keyframe map plus a utility
 * class named `.animate-<name>`, appends it to a fresh <style> element, and
 * returns the utility class name. Safe to call outside the browser: it is a
 * no-op when `document` is undefined (e.g. during SSR or prerendering).
 */
export function createAnimationClass(name: string, keyframes: object, settings: string) {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    const keyframeString = Object.entries(keyframes)
      .map(([key, value]) => {
        const cssProps = Object.entries(value as object)
          .map(([cssKey, cssValue]) => `${cssKey}: ${cssValue};`)
          .join(' ');
        return `${key} { ${cssProps} }`;
      })
      .join(' ');
    
    style.textContent = `@keyframes ${name} { ${keyframeString} } .animate-${name} { animation: ${name} ${settings}; }`;
    document.head.appendChild(style);
  }
  
  return `animate-${name}`;
}

// Register the slow-bounce keyframes used by the floating WhatsApp button.
// Guarded for non-browser environments where `document` does not exist.
if (typeof document !== 'undefined') {
  createAnimationClass('bounce-slow', {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' }
  }, '3s ease-in-out infinite');
}
