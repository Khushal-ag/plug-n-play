import { Inter, JetBrains_Mono, Poppins } from "next/font/google";

export const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const fontPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const fontVariables = `${fontInter.variable} ${fontPoppins.variable} ${fontMono.variable}`;
