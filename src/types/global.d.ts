declare global {
  interface Window {
    alert: (message?: any) => void;
  }
}

export { }; // Important: This line is required for module augmentation
