import { Toaster as Sonner } from "sonner@2.0.3";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'white',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
        },
        className: 'toaster group',
      }}
    />
  );
}
