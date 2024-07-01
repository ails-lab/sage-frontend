export const throttle = (func: Function, delay: number) => {
  let timerFlag: NodeJS.Timeout | null = null; // Variable to keep track of the timer

  // Returning a throttled version
  return (...args: any[]) => {
    if (timerFlag === null) {
      // If there is no timer currently running
      func(...args); // Execute the main function
      timerFlag = setTimeout(() => {
        // Set a timer to clear the timerFlag after the specified delay
        timerFlag = null; // Clear the timerFlag to allow the main function to be executed again
      }, delay);
    }
  };
};

/**
 * Throttles the execution of a function by delaying subsequent calls, but
 * also allows the last function call to be executed.
 * @param func The function to be throttled.
 * @param delay The delay in milliseconds between function calls.
 * @returns A throttled version of the original function.
 */
export const throttleWithDelay = (func: Function, delay: number) => {
  let lastCalled = 0;
  let timeout: NodeJS.Timeout;

  return (...args: any[]) => {
    const now = Date.now();

    clearTimeout(timeout);

    if (now - lastCalled >= delay) {
      func.apply(this, args);
      lastCalled = now;
    } else {
      timeout = setTimeout(() => {
        func.apply(this, args);
        lastCalled = now;
      }, delay - (now - lastCalled));
    }
  };
};
