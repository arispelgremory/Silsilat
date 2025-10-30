'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageReturn<T> {
  value: T | null;
  setValue: (newValue: T | null) => void;
  removeValue: () => void;
  isLoading: boolean;
}

function useLocalStorage<T>(key: string, initialValue?: T): UseLocalStorageReturn<T> {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [value, setValue] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      } else if (initialValue) {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        setValue(initialValue);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue]);

  // Return a wrapped version of useState's setter function that 
  // persists the new value to localStorage
  const saveValue = useCallback((newValue: T | null) => {
    try {
      // Allow value to be a function so we have same API as useState
      setValue(newValue);
      if (newValue === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  const removeValue = useCallback(() => {
    setValue(null);
    window.localStorage.removeItem(key);
  }, [key]);

  return { value, setValue: saveValue, removeValue, isLoading };
}

export { useLocalStorage };