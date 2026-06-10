import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito, Amiri } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ayo-belajar-bicara.foya.dev/"),
  title: "Ayo Belajar Bicara! 🌟",
  description:
    "Aplikasi terapi wicara interaktif untuk anak — belajar bicara sambil bermain!",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    title: "Ayo Belajar Bicara!",
    description:
      "Aplikasi terapi wicara interaktif untuk anak — belajar bicara sambil bermain!",
    type: "website",
    locale: "id_ID",
    siteName: "Ayo Belajar Bicara",
    url: "https://ayo-belajar-bicara.foya.dev/",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "Ayo Belajar Bicara Poster",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayo Belajar Bicara!",
    description:
      "Aplikasi terapi wicara interaktif untuk anak — belajar bicara sambil bermain!",
    images: ["/og-image.png"],
  },
  category: "education",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Belajar Bicara",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF9E6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${fredoka.variable} ${nunito.variable} ${amiri.variable} font-body antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
