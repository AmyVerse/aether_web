# Toast Component Usage Guide

## Overview

The modernized Toast component provides elegant, accessible notifications with auto-dismiss functionality and a progress bar timer.

## Features

- 🎨 **Modern Design**: Glass-morphism with subtle accent colors
- ⏱️ **Progress Timer**: Visual countdown bar showing remaining time
- 🔄 **Auto-dismiss**: Configurable duration with smooth animations
- 🎭 **Multiple Types**: Success, Error, Warning, and Info variants
- 📱 **Responsive**: Works on all screen sizes
- ♿ **Accessible**: ARIA labels and keyboard navigation

## Quick Start

### 1. Wrap your app with ToastProvider

```tsx
// app/layout.tsx or pages/_app.tsx
import { ToastProvider } from "@/hooks/useToast";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
```

### 2. Use the hook in your components

```tsx
import { useToast } from "@/hooks/useToast";

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess("Data saved successfully!");
    } catch (error) {
      showError("Failed to save data. Please try again.");
    }
  };

  return <button onClick={handleSave}>Save Data</button>;
}
```

## API Reference

### useToast Hook

```tsx
const {
  showToast, // Generic method
  showSuccess, // Green accent, checkmark icon
  showError, // Red accent, X icon
  showWarning, // Amber accent, warning icon
  showInfo, // Blue accent, info icon
} = useToast();
```

### Method Signatures

```tsx
showToast(message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number)
showSuccess(message: string, duration?: number)
showError(message: string, duration?: number)
showWarning(message: string, duration?: number)
showInfo(message: string, duration?: number)
```

### Parameters

- **message**: The text to display
- **type**: Toast variant (success, error, warning, info)
- **duration**: Auto-dismiss time in milliseconds (default: 5000ms)

## Examples

### Basic Usage

```tsx
// Success notification
showSuccess("Profile updated successfully!");

// Error with custom duration
showError("Network error occurred", 8000);

// Warning notification
showWarning("Session expires in 5 minutes");

// Info notification
showInfo("New features available!");
```

### Advanced Usage

```tsx
// Custom duration and stacking
const handleBulkOperation = () => {
  showInfo("Starting bulk operation...", 2000);

  setTimeout(() => {
    showSuccess("50% complete", 3000);
  }, 2000);

  setTimeout(() => {
    showSuccess("Bulk operation completed!", 4000);
  }, 5000);
};
```

## Styling

The toast uses modern design principles:

- **White background** with colored left border accent
- **Subtle shadows** for depth
- **Smooth animations** for enter/exit
- **Progress bar** with matching accent color
- **Hover effects** on close button

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast colors
- Proper focus management
- Semantic HTML structure

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Demo Component

Check out `src/components/demo/toast-demo.tsx` for a live demonstration of all toast types and features.
