// app/layout.js
import "./globals.css";

export const metadata = {
  title: "MomFit",
  description: "Fitness app for busy moms with live feedback",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
