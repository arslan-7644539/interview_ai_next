import { Toaster } from 'react-hot-toast';
import "./globals.css";

export const metadata = {
  title: "AI Interview Auditor & Platform",
  description: "Evaluate your skills in real-time with our AI-driven voice interview and auditing platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        {children}
      </body>
    </html>
  );
}
