export const metadata = {
  title: "OpportunityScanner — Website Project Tenders",
  description: "Daily AI-powered scanner for website design and redevelopment tenders",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
