export const metadata = {
  title: "Pay3 — A new L1 is coming",
  description:
    "Pay3 is an upcoming Layer 1 blockchain built for speed, security, and fees you barely notice. Launch the Pay3 Wallet or add the Chrome extension.",
  metadataBase: new URL("https://pay3.space"),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Pay3 — A new L1 is coming",
    description: "An upcoming Layer 1 blockchain built for speed, security, and fees you barely notice.",
    url: "https://pay3.space",
    siteName: "Pay3",
    images: ["/logo.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#000000" }}>{children}</body>
    </html>
  );
}
