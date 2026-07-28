export const metadata = {
  title: "Pay3 — A Layer 1 built for speed",
  description:
    "Pay3 is an upcoming Layer 1 blockchain built for speed, security, and fees you barely notice. Try the live testnet, launch the wallet, or read the docs.",
  metadataBase: new URL("https://pay3.space"),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Pay3 — A Layer 1 built for speed",
    description: "An upcoming Layer 1 blockchain with a live testnet and wallet you can use today.",
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
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#000000" }}>{children}</body>
    </html>
  );
}
