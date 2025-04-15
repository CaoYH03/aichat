import { useEffect } from 'react';

/**
 * A React hook that redirects users to about:blank when they open the developer console
 * and removes history entries to prevent users from navigating back.
 * 
 * @returns void
 */
export const useConsoleProtection = (): void => {
  useEffect(() => {
    // Function to detect if DevTools is open
    const detectDevTools = (): boolean => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      // Check if DevTools is docked to the right/bottom or in a separate window
      if (widthThreshold || heightThreshold) {
        return true;
      }

      // Check using console timing attack
      const startTime = performance.now();
      console.log('%c', 'font-size:0;padding:' + '0'.repeat(1000000) + ';');
      console.clear();
      const endTime = performance.now();
      
      // If console is open, this operation will take longer
      return endTime - startTime > 100;
    };

    // Function to redirect and clear history
    const redirectAndClearHistory = (): void => {
      // Push several entries to make back button navigation more difficult
      for (let i = 0; i < 5; i++) {
        history.pushState(null, '', window.location.href);
      }
      
      // Redirect to about:blank
      window.location.href = 'about:blank';
      
      // Attempt to clear history (modern browsers might prevent this)
      try {
        window.history.replaceState(null, '', 'about:blank');
      } catch (e) {
        console.error('Could not replace history state:', e);
      }
    };

    // Detect DevTools initially
    if (detectDevTools()) {
      redirectAndClearHistory();
    }

    // Set up interval to periodically check
    const intervalId = setInterval(() => {
      if (detectDevTools()) {
        redirectAndClearHistory();
        clearInterval(intervalId);
      }
    }, 1000);

    // Add event listeners for various console opening methods
    const consoleEvents = [
      'resize',
      'contextmenu', // Right click menu can lead to "Inspect Element"
      'keydown'      // F12 or Ctrl+Shift+I
    ];

    const eventHandler = (event: KeyboardEvent | MouseEvent): void => {
      // Check for key combinations that open dev tools
      if (event.type === 'keydown') {
        const keyEvent = event as KeyboardEvent;
        // F12 key or Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+Shift+C
        if (
          keyEvent.key === 'F12' ||
          (keyEvent.ctrlKey && keyEvent.shiftKey && 
           (keyEvent.key === 'I' || keyEvent.key === 'J' || keyEvent.key === 'C'))
        ) {
          event.preventDefault();
          if (detectDevTools()) {
            redirectAndClearHistory();
          }
          return;
        }
      }
      
      // Check after a small delay for other events that might open dev tools
      setTimeout(() => {
        if (detectDevTools()) {
          redirectAndClearHistory();
        }
      }, 100);
    };

    // Add all event listeners
    consoleEvents.forEach(event => {
      window.addEventListener(event, eventHandler);
    });

    // Debounce function for console.log override check
    let debounceTimer: NodeJS.Timeout;
    const checkConsoleOverride = (): void => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (detectDevTools()) {
          redirectAndClearHistory();
        }
      }, 100);
    };

    // Override console.log to detect if it's being used
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      checkConsoleOverride();
      return originalLog.apply(console, args);
    };

    // Clean up on component unmount
    return () => {
      clearInterval(intervalId);
      consoleEvents.forEach(event => {
        window.removeEventListener(event, eventHandler);
      });
      console.log = originalLog;
      clearTimeout(debounceTimer);
    };
  }, []);
};