import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sonata — AI playlists from a vibe",
  description: "Describe a vibe. Get a playlist.",
};

const themeBootstrap = `(function(){try{var s=JSON.parse(localStorage.getItem('sonata-settings-cache')||'{}');var t=s.theme||'dark';var r=t==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):t;document.documentElement.classList.toggle('light',r==='light');var a={green:'29 185 84',blue:'59 130 246',purple:'168 85 247',pink:'236 72 153',red:'239 68 68',orange:'249 115 22',teal:'20 184 166'};document.documentElement.style.setProperty('--accent-rgb',a[s.accentColor]||a.green);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
