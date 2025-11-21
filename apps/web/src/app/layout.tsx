import './global.css';
import { ThemeProvider } from '../contexts/ThemeContext';

export const metadata = {
  title: 'GO Transit Live',
  description: 'Real-time GO Transit tracking and schedules',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
