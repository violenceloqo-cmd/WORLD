export type Region =
  | "Americas"
  | "Europe"
  | "Asia"
  | "Africa"
  | "Oceania";

export type Country = {
  iso: string;            // ISO 3166-1 alpha-2 (lowercase used in routes)
  iso3: string;           // ISO 3166-1 alpha-3
  name: string;
  ticker: string;         // proposed pump.fun ticker
  flagEmoji: string;
  population: number;     // 2024 estimate
  region: Region;
  /** Two flag-derived accent colors used for rank badges and ambient surfaces. */
  colors: [string, string];
  /** Approximate centroid for the globe pin. */
  lat: number;
  lng: number;
  /**
   * Solana mint from pump.fun. Paste the contract address between the quotes.
   * Leave as "" until that country's coin is launched.
   */
  mint: string;
  /** Optional pump.fun URL override. Leave "" to auto-generate from mint. */
  pumpFunUrl: string;
};

/** Treat blank mint as not launched (empty string is not a valid mint). */
export function resolveMint(mint: string | undefined | null): string | null {
  const m = mint?.trim();
  return m ? m : null;
}

/**
 * 50 countries selected by 2024 population.
 * Paste each pump.fun mint into the `mint` field on the matching country line.
 */
export const COUNTRIES: Country[] = [
  { iso: "in", iso3: "IND", name: "India",          ticker: "IND", flagEmoji: "🇮🇳", population: 1450000000, region: "Asia",     colors: ["#FF9933", "#138808"], lat: 22.0,   lng: 79.0,   mint: "64fkyky2PeyGHBKkwDdT8EgcDe6Xtfj11YxbnUxopump", pumpFunUrl: "" },
  { iso: "cn", iso3: "CHN", name: "China",          ticker: "CHN", flagEmoji: "🇨🇳", population: 1410000000, region: "Asia",     colors: ["#EE1C25", "#FFFF00"], lat: 35.86,  lng: 104.19, mint: "", pumpFunUrl: "" },
  { iso: "us", iso3: "USA", name: "United States",  ticker: "USA", flagEmoji: "🇺🇸", population:  335000000, region: "Americas", colors: ["#B22234", "#3C3B6E"], lat: 39.5,   lng: -98.35, mint: "", pumpFunUrl: "" },
  { iso: "id", iso3: "IDN", name: "Indonesia",      ticker: "IDN", flagEmoji: "🇮🇩", population:  281000000, region: "Asia",     colors: ["#FF0000", "#FFFFFF"], lat: -2.5,   lng: 118.0,  mint: "", pumpFunUrl: "" },
  { iso: "pk", iso3: "PAK", name: "Pakistan",       ticker: "PAK", flagEmoji: "🇵🇰", population:  245000000, region: "Asia",     colors: ["#01411C", "#FFFFFF"], lat: 30.37,  lng: 69.34,  mint: "", pumpFunUrl: "" },
  { iso: "ng", iso3: "NGA", name: "Nigeria",        ticker: "NGN", flagEmoji: "🇳🇬", population:  230000000, region: "Africa",   colors: ["#008751", "#FFFFFF"], lat: 9.08,   lng: 8.68,   mint: "", pumpFunUrl: "" },
  { iso: "br", iso3: "BRA", name: "Brazil",         ticker: "BRZ", flagEmoji: "🇧🇷", population:  216000000, region: "Americas", colors: ["#009C3B", "#FFDF00"], lat: -14.2,  lng: -51.92, mint: "", pumpFunUrl: "" },
  { iso: "bd", iso3: "BGD", name: "Bangladesh",     ticker: "BGD", flagEmoji: "🇧🇩", population:  173000000, region: "Asia",     colors: ["#006A4E", "#F42A41"], lat: 23.68,  lng: 90.36,  mint: "", pumpFunUrl: "" },
  { iso: "ru", iso3: "RUS", name: "Russia",         ticker: "RUS", flagEmoji: "🇷🇺", population:  143000000, region: "Europe",   colors: ["#0039A6", "#D52B1E"], lat: 61.52,  lng: 105.31, mint: "", pumpFunUrl: "" },
  { iso: "mx", iso3: "MEX", name: "Mexico",         ticker: "MEX", flagEmoji: "🇲🇽", population:  129000000, region: "Americas", colors: ["#006847", "#CE1126"], lat: 23.63,  lng: -102.55, mint: "", pumpFunUrl: "" },
  { iso: "et", iso3: "ETH", name: "Ethiopia",       ticker: "ETH", flagEmoji: "🇪🇹", population:  126000000, region: "Africa",   colors: ["#078930", "#FCDD09"], lat: 9.15,   lng: 40.49,  mint: "", pumpFunUrl: "" },
  { iso: "jp", iso3: "JPN", name: "Japan",          ticker: "JPN", flagEmoji: "🇯🇵", population:  123000000, region: "Asia",     colors: ["#BC002D", "#FFFFFF"], lat: 36.2,   lng: 138.25, mint: "", pumpFunUrl: "" },
  { iso: "ph", iso3: "PHL", name: "Philippines",    ticker: "PHP", flagEmoji: "🇵🇭", population:  118000000, region: "Asia",     colors: ["#0038A8", "#CE1126"], lat: 12.88,  lng: 121.77, mint: "", pumpFunUrl: "" },
  { iso: "eg", iso3: "EGY", name: "Egypt",          ticker: "EGY", flagEmoji: "🇪🇬", population:  114000000, region: "Africa",   colors: ["#CE1126", "#000000"], lat: 26.82,  lng: 30.8,   mint: "", pumpFunUrl: "" },
  { iso: "cd", iso3: "COD", name: "DR Congo",       ticker: "COD", flagEmoji: "🇨🇩", population:  105000000, region: "Africa",   colors: ["#007FFF", "#F7D618"], lat: -4.04,  lng: 21.76,  mint: "", pumpFunUrl: "" },
  { iso: "vn", iso3: "VNM", name: "Vietnam",        ticker: "VNM", flagEmoji: "🇻🇳", population:  100000000, region: "Asia",     colors: ["#DA251D", "#FFFF00"], lat: 14.06,  lng: 108.28, mint: "", pumpFunUrl: "" },
  { iso: "ir", iso3: "IRN", name: "Iran",           ticker: "IRN", flagEmoji: "🇮🇷", population:   89000000, region: "Asia",     colors: ["#239F40", "#DA0000"], lat: 32.43,  lng: 53.69,  mint: "", pumpFunUrl: "" },
  { iso: "tr", iso3: "TUR", name: "Türkiye",        ticker: "TUR", flagEmoji: "🇹🇷", population:   86000000, region: "Asia",     colors: ["#E30A17", "#FFFFFF"], lat: 38.96,  lng: 35.24,  mint: "", pumpFunUrl: "" },
  { iso: "de", iso3: "DEU", name: "Germany",        ticker: "GER", flagEmoji: "🇩🇪", population:   84000000, region: "Europe",   colors: ["#000000", "#FFCE00"], lat: 51.16,  lng: 10.45,  mint: "", pumpFunUrl: "" },
  { iso: "th", iso3: "THA", name: "Thailand",       ticker: "THA", flagEmoji: "🇹🇭", population:   72000000, region: "Asia",     colors: ["#A51931", "#2D2A4A"], lat: 15.87,  lng: 100.99, mint: "", pumpFunUrl: "" },
  { iso: "gb", iso3: "GBR", name: "United Kingdom", ticker: "GBR", flagEmoji: "🇬🇧", population:   68000000, region: "Europe",   colors: ["#012169", "#C8102E"], lat: 55.38,  lng: -3.43,  mint: "", pumpFunUrl: "" },
  { iso: "tz", iso3: "TZA", name: "Tanzania",       ticker: "TZA", flagEmoji: "🇹🇿", population:   67000000, region: "Africa",   colors: ["#1EB53A", "#00A3DD"], lat: -6.37,  lng: 34.89,  mint: "", pumpFunUrl: "" },
  { iso: "fr", iso3: "FRA", name: "France",         ticker: "FRA", flagEmoji: "🇫🇷", population:   66000000, region: "Europe",   colors: ["#0055A4", "#EF4135"], lat: 46.23,  lng: 2.21,   mint: "", pumpFunUrl: "" },
  { iso: "za", iso3: "ZAF", name: "South Africa",   ticker: "ZAF", flagEmoji: "🇿🇦", population:   62000000, region: "Africa",   colors: ["#007749", "#FFB81C"], lat: -30.56, lng: 22.94,  mint: "", pumpFunUrl: "" },
  { iso: "it", iso3: "ITA", name: "Italy",          ticker: "ITA", flagEmoji: "🇮🇹", population:   59000000, region: "Europe",   colors: ["#009246", "#CE2B37"], lat: 41.87,  lng: 12.57,  mint: "", pumpFunUrl: "" },
  { iso: "ke", iso3: "KEN", name: "Kenya",          ticker: "KEN", flagEmoji: "🇰🇪", population:   55000000, region: "Africa",   colors: ["#BB0000", "#006600"], lat: -0.02,  lng: 37.91,  mint: "", pumpFunUrl: "" },
  { iso: "mm", iso3: "MMR", name: "Myanmar",        ticker: "MMR", flagEmoji: "🇲🇲", population:   54000000, region: "Asia",     colors: ["#FECB00", "#34B233"], lat: 21.91,  lng: 95.96,  mint: "", pumpFunUrl: "" },
  { iso: "co", iso3: "COL", name: "Colombia",       ticker: "COL", flagEmoji: "🇨🇴", population:   52000000, region: "Americas", colors: ["#FCD116", "#003893"], lat: 4.57,   lng: -74.30, mint: "", pumpFunUrl: "" },
  { iso: "kr", iso3: "KOR", name: "South Korea",    ticker: "KOR", flagEmoji: "🇰🇷", population:   52000000, region: "Asia",     colors: ["#003478", "#C60C30"], lat: 35.91,  lng: 127.77, mint: "", pumpFunUrl: "" },
  { iso: "ug", iso3: "UGA", name: "Uganda",         ticker: "UGA", flagEmoji: "🇺🇬", population:   49000000, region: "Africa",   colors: ["#FCDC04", "#D90000"], lat: 1.37,   lng: 32.29,  mint: "", pumpFunUrl: "" },
  { iso: "sd", iso3: "SDN", name: "Sudan",          ticker: "SDN", flagEmoji: "🇸🇩", population:   48000000, region: "Africa",   colors: ["#D21034", "#000000"], lat: 12.86,  lng: 30.22,  mint: "", pumpFunUrl: "" },
  { iso: "es", iso3: "ESP", name: "Spain",          ticker: "ESP", flagEmoji: "🇪🇸", population:   48000000, region: "Europe",   colors: ["#AA151B", "#F1BF00"], lat: 40.46,  lng: -3.75,  mint: "", pumpFunUrl: "" },
  { iso: "dz", iso3: "DZA", name: "Algeria",        ticker: "DZA", flagEmoji: "🇩🇿", population:   46000000, region: "Africa",   colors: ["#006633", "#FFFFFF"], lat: 28.03,  lng: 1.66,   mint: "", pumpFunUrl: "" },
  { iso: "ar", iso3: "ARG", name: "Argentina",      ticker: "ARG", flagEmoji: "🇦🇷", population:   46000000, region: "Americas", colors: ["#74ACDF", "#F6B40E"], lat: -38.42, lng: -63.62, mint: "", pumpFunUrl: "" },
  { iso: "iq", iso3: "IRQ", name: "Iraq",           ticker: "IRQ", flagEmoji: "🇮🇶", population:   45000000, region: "Asia",     colors: ["#CE1126", "#000000"], lat: 33.22,  lng: 43.68,  mint: "", pumpFunUrl: "" },
  { iso: "af", iso3: "AFG", name: "Afghanistan",    ticker: "AFG", flagEmoji: "🇦🇫", population:   42000000, region: "Asia",     colors: ["#000000", "#D32011"], lat: 33.94,  lng: 67.71,  mint: "", pumpFunUrl: "" },
  { iso: "pl", iso3: "POL", name: "Poland",         ticker: "POL", flagEmoji: "🇵🇱", population:   41000000, region: "Europe",   colors: ["#DC143C", "#FFFFFF"], lat: 51.92,  lng: 19.15,  mint: "", pumpFunUrl: "" },
  { iso: "ca", iso3: "CAN", name: "Canada",         ticker: "CAN", flagEmoji: "🇨🇦", population:   40000000, region: "Americas", colors: ["#FF0000", "#FFFFFF"], lat: 56.13,  lng: -106.35, mint: "", pumpFunUrl: "" },
  { iso: "ma", iso3: "MAR", name: "Morocco",        ticker: "MAR", flagEmoji: "🇲🇦", population:   38000000, region: "Africa",   colors: ["#C1272D", "#006233"], lat: 31.79,  lng: -7.09,  mint: "", pumpFunUrl: "" },
  { iso: "sa", iso3: "SAU", name: "Saudi Arabia",   ticker: "SAR", flagEmoji: "🇸🇦", population:   36000000, region: "Asia",     colors: ["#006C35", "#FFFFFF"], lat: 23.89,  lng: 45.08,  mint: "", pumpFunUrl: "" },
  { iso: "ua", iso3: "UKR", name: "Ukraine",        ticker: "UKR", flagEmoji: "🇺🇦", population:   36000000, region: "Europe",   colors: ["#0057B7", "#FFD700"], lat: 48.38,  lng: 31.17,  mint: "", pumpFunUrl: "" },
  { iso: "uz", iso3: "UZB", name: "Uzbekistan",     ticker: "UZB", flagEmoji: "🇺🇿", population:   36000000, region: "Asia",     colors: ["#1EB53A", "#0099B5"], lat: 41.38,  lng: 64.59,  mint: "", pumpFunUrl: "" },
  { iso: "ao", iso3: "AGO", name: "Angola",         ticker: "AGO", flagEmoji: "🇦🇴", population:   36000000, region: "Africa",   colors: ["#CE1126", "#000000"], lat: -11.20, lng: 17.87,  mint: "", pumpFunUrl: "" },
  { iso: "pe", iso3: "PER", name: "Peru",           ticker: "PER", flagEmoji: "🇵🇪", population:   34000000, region: "Americas", colors: ["#D91023", "#FFFFFF"], lat: -9.19,  lng: -75.02, mint: "", pumpFunUrl: "" },
  { iso: "my", iso3: "MYS", name: "Malaysia",       ticker: "MYR", flagEmoji: "🇲🇾", population:   34000000, region: "Asia",     colors: ["#CC0001", "#010066"], lat: 4.21,   lng: 101.98, mint: "", pumpFunUrl: "" },
  { iso: "gh", iso3: "GHA", name: "Ghana",          ticker: "GHA", flagEmoji: "🇬🇭", population:   34000000, region: "Africa",   colors: ["#CE1126", "#FCD116"], lat: 7.95,   lng: -1.02,  mint: "", pumpFunUrl: "" },
  { iso: "ye", iso3: "YEM", name: "Yemen",          ticker: "YEM", flagEmoji: "🇾🇪", population:   34000000, region: "Asia",     colors: ["#CE1126", "#000000"], lat: 15.55,  lng: 48.52,  mint: "", pumpFunUrl: "" },
  { iso: "mz", iso3: "MOZ", name: "Mozambique",     ticker: "MOZ", flagEmoji: "🇲🇿", population:   33000000, region: "Africa",   colors: ["#009639", "#FFD100"], lat: -18.67, lng: 35.53,  mint: "", pumpFunUrl: "" },
  { iso: "np", iso3: "NPL", name: "Nepal",          ticker: "NPL", flagEmoji: "🇳🇵", population:   30000000, region: "Asia",     colors: ["#DC143C", "#003893"], lat: 28.39,  lng: 84.12,  mint: "", pumpFunUrl: "" },
  { iso: "au", iso3: "AUS", name: "Australia",      ticker: "AUS", flagEmoji: "🇦🇺", population:   27000000, region: "Oceania",  colors: ["#012169", "#E4002B"], lat: -25.27, lng: 133.77, mint: "", pumpFunUrl: "" },
];

export const REGIONS: Region[] = [
  "Americas",
  "Europe",
  "Asia",
  "Africa",
  "Oceania",
];

export function getCountryByIso(iso: string): Country | undefined {
  return COUNTRIES.find((c) => c.iso === iso.toLowerCase());
}

export function getCountryByMint(mint: string): Country | undefined {
  const key = mint.trim();
  return COUNTRIES.find((c) => resolveMint(c.mint) === key);
}
