// Simplified example (similar to clsx/tailwind-merge)
export function cn(...inputs: any[]) {
    let className = '';
    for (let i = 0; i < inputs.length; i++) {
      const arg = inputs[i];
      if (arg) { // Check if the argument is truthy (not null, undefined, false, etc.)
        if (typeof arg === 'string' || typeof arg === 'number') {
          className += ' ' + arg;
        } else if (typeof arg === 'object') {
          if (Array.isArray(arg)) {
            // Recursively handle arrays
            className += ' ' + cn(...arg);
          } else {
            // Handle objects (e.g., { 'class-name': condition })
            for (const key in arg) {
              if (arg[key]) {
                className += ' ' + key;
              }
            }
          }
        }
      }
    }
    return className.trim(); // Remove leading/trailing spaces
  }