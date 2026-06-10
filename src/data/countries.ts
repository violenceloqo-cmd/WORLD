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
 * 48 FIFA World Cup 2026™ qualified nations.
 * Paste each pump.fun mint into the `mint` field on the matching country line.
 */
export const COUNTRIES: Country[] = [
  { iso: "us", iso3: "USA", name: "United States",  ticker: "USA", flagEmoji: "🇺🇸", population:  335000000, region: "Americas", colors: ["#B22234", "#3C3B6E"], lat: 39.5,   lng: -98.35,  mint: "8Cr34Xe1QzM4ab5U9VQUj5YLLCRDZUHCyYep3dM7BSMe", pumpFunUrl: "" },
  { iso: "br", iso3: "BRA", name: "Brazil",         ticker: "BRZ", flagEmoji: "🇧🇷", population:  216000000, region: "Americas", colors: ["#009C3B", "#FFDF00"], lat: -14.2,  lng: -51.92,  mint: "25P3V3xrEsGD2SnfLUpsYMAmBGznqaj9vXybFPX7bGkH", pumpFunUrl: "" },
  { iso: "mx", iso3: "MEX", name: "Mexico",         ticker: "MEX", flagEmoji: "🇲🇽", population:  129000000, region: "Americas", colors: ["#006847", "#CE1126"], lat: 23.63,  lng: -102.55, mint: "ATK4QLyPfe6kWFWYAVZyhqV1uusksPTm7HNUNkuThPqi", pumpFunUrl: "" },
  { iso: "jp", iso3: "JPN", name: "Japan",          ticker: "JPN", flagEmoji: "🇯🇵", population:  123000000, region: "Asia",     colors: ["#BC002D", "#FFFFFF"], lat: 36.2,   lng: 138.25,  mint: "BpX4YCbS2H5KjJUTmvAoTo86qjQg5if4AhB8Q4uUueGh", pumpFunUrl: "" },
  { iso: "eg", iso3: "EGY", name: "Egypt",          ticker: "EGY", flagEmoji: "🇪🇬", population:  114000000, region: "Africa",   colors: ["#CE1126", "#000000"], lat: 26.82,  lng: 30.8,    mint: "3XJrqq5uLYdkV3aPJDSbup6JQQj3r7kzLLCb4r7FTgoJ", pumpFunUrl: "" },
  { iso: "cd", iso3: "COD", name: "DR Congo",       ticker: "COD", flagEmoji: "🇨🇩", population:  105000000, region: "Africa",   colors: ["#007FFF", "#F7D618"], lat: -4.04,  lng: 21.76,   mint: "5ENUP6L8rqdiK3BDLaeQeekTyprTMxN69N32igNXaSqo", pumpFunUrl: "" },
  { iso: "ir", iso3: "IRN", name: "Iran",           ticker: "IRN", flagEmoji: "🇮🇷", population:   89000000, region: "Asia",     colors: ["#239F40", "#DA0000"], lat: 32.43,  lng: 53.69,   mint: "HDckdJj96tXM11a7WKmkR5PaRKofH24pYHKpGpReL7oy", pumpFunUrl: "" },
  { iso: "tr", iso3: "TUR", name: "Türkiye",        ticker: "TUR", flagEmoji: "🇹🇷", population:   86000000, region: "Asia",     colors: ["#E30A17", "#FFFFFF"], lat: 38.96,  lng: 35.24,   mint: "Fi8vU3GBUKSfZCYMXFMnMcT7H2PtXfddp2ndFPUHzGwp", pumpFunUrl: "" },
  { iso: "de", iso3: "DEU", name: "Germany",        ticker: "GER", flagEmoji: "🇩🇪", population:   84000000, region: "Europe",   colors: ["#000000", "#FFCE00"], lat: 51.16,  lng: 10.45,   mint: "3FESyyGFMLG5MM84TLwLkAgAtPy2ko7tLRgvMAoS4fgY", pumpFunUrl: "" },
  { iso: "eng", iso3: "ENG", name: "England",       ticker: "ENG", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", population:   56000000, region: "Europe",   colors: ["#012169", "#C8102E"], lat: 52.35,  lng: -1.17,   mint: "31Eoo2NbRdPeoMRjbLTtowaVYL53LAWdYd7aSU7WU4gX", pumpFunUrl: "" },
  { iso: "fr", iso3: "FRA", name: "France",         ticker: "FRA", flagEmoji: "🇫🇷", population:   66000000, region: "Europe",   colors: ["#0055A4", "#EF4135"], lat: 46.23,  lng: 2.21,    mint: "9VGkWLirkvAYA1JxcaUtYXfung78stamcjqcEqYHV6wv", pumpFunUrl: "" },
  { iso: "za", iso3: "ZAF", name: "South Africa",   ticker: "ZAF", flagEmoji: "🇿🇦", population:   62000000, region: "Africa",   colors: ["#007749", "#FFB81C"], lat: -30.56, lng: 22.94,   mint: "cZbV4pCeGkVkbWGDSb7USmVJ8Jr9UQqhLwkQkMsnbf6", pumpFunUrl: "" },
  { iso: "kr", iso3: "KOR", name: "South Korea",    ticker: "KOR", flagEmoji: "🇰🇷", population:   52000000, region: "Asia",     colors: ["#003478", "#C60C30"], lat: 35.91,  lng: 127.77,  mint: "CnsWbsNgsovBVzHxsSL6cNy4qQxB3AsyfgcHteG5FjCK", pumpFunUrl: "" },
  { iso: "co", iso3: "COL", name: "Colombia",       ticker: "COL", flagEmoji: "🇨🇴", population:   52000000, region: "Americas", colors: ["#FCD116", "#003893"], lat: 4.57,   lng: -74.30,  mint: "BT6uHEWW9xqsv9z3HSpEFqNww2qDGMPHqz8c4EcHibFz", pumpFunUrl: "" },
  { iso: "es", iso3: "ESP", name: "Spain",          ticker: "ESP", flagEmoji: "🇪🇸", population:   48000000, region: "Europe",   colors: ["#AA151B", "#F1BF00"], lat: 40.46,  lng: -3.75,   mint: "ED89bHxZLRP9XsyMRb4gdb5if2iz8p26MNf85hTbzi4q", pumpFunUrl: "" },
  { iso: "dz", iso3: "DZA", name: "Algeria",        ticker: "DZA", flagEmoji: "🇩🇿", population:   46000000, region: "Africa",   colors: ["#006633", "#FFFFFF"], lat: 28.03,  lng: 1.66,    mint: "49gL27p61Htdjb4cCZD9t7EQMAJ9E5M6YNBvxj4Cv5Fn", pumpFunUrl: "" },
  { iso: "ar", iso3: "ARG", name: "Argentina",      ticker: "ARG", flagEmoji: "🇦🇷", population:   46000000, region: "Americas", colors: ["#74ACDF", "#F6B40E"], lat: -38.42, lng: -63.62,  mint: "21CaAbEvw1SkkwkZJuty6G7TLVhWP2UK6SZ5SLQsgA4h", pumpFunUrl: "" },
  { iso: "iq", iso3: "IRQ", name: "Iraq",           ticker: "IRQ", flagEmoji: "🇮🇶", population:   45000000, region: "Asia",     colors: ["#CE1126", "#000000"], lat: 33.22,  lng: 43.68,   mint: "3qyW8L2kmoTbkJ5eFcgRZy3vnJcJ79P115uHqF6PXYJn", pumpFunUrl: "" },
  { iso: "ca", iso3: "CAN", name: "Canada",         ticker: "CAN", flagEmoji: "🇨🇦", population:   40000000, region: "Americas", colors: ["#FF0000", "#FFFFFF"], lat: 56.13,  lng: -106.35, mint: "Ae7wQf9KV3mLp8Us8qrz5JmzHT4S7JgG936dvQJYRT7F", pumpFunUrl: "" },
  { iso: "ma", iso3: "MAR", name: "Morocco",        ticker: "MAR", flagEmoji: "🇲🇦", population:   38000000, region: "Africa",   colors: ["#C1272D", "#006233"], lat: 31.79,  lng: -7.09,   mint: "52xVVnkWWqpFge8qJ3sqCRHfJ95aoDCjTPTZeXe64VQV", pumpFunUrl: "" },
  { iso: "sa", iso3: "SAU", name: "Saudi Arabia",   ticker: "SAR", flagEmoji: "🇸🇦", population:   36000000, region: "Asia",     colors: ["#006C35", "#FFFFFF"], lat: 23.89,  lng: 45.08,   mint: "45Y4X29PSghSS6xhhELnqinQnVng1LaJ17tX1SbasUtF", pumpFunUrl: "" },
  { iso: "uz", iso3: "UZB", name: "Uzbekistan",     ticker: "UZB", flagEmoji: "🇺🇿", population:   36000000, region: "Asia",     colors: ["#1EB53A", "#0099B5"], lat: 41.38,  lng: 64.59,   mint: "EKtyvN7ZsoAx7APxmgxFFvGRkn82e7pyq6yqTB5rudfv", pumpFunUrl: "" },
  { iso: "gh", iso3: "GHA", name: "Ghana",          ticker: "GHA", flagEmoji: "🇬🇭", population:   34000000, region: "Africa",   colors: ["#CE1126", "#FCD116"], lat: 7.95,   lng: -1.02,   mint: "5shyZxqi59gwy5pWg2cAqdoJHKTKCn7q5LqFrKSWbbp1", pumpFunUrl: "" },
  { iso: "ci", iso3: "CIV", name: "Côte d'Ivoire",  ticker: "CIV", flagEmoji: "🇨🇮", population:   28000000, region: "Africa",   colors: ["#FF8200", "#009639"], lat: 7.54,   lng: -5.55,   mint: "42U9kNxLVL6KFKaS4ADP8ZHmgEkhzyn1GUJKtzxDXRwQ", pumpFunUrl: "" },
  { iso: "au", iso3: "AUS", name: "Australia",      ticker: "AUS", flagEmoji: "🇦🇺", population:   27000000, region: "Oceania",  colors: ["#012169", "#E4002B"], lat: -25.27, lng: 133.77,  mint: "GNbnNF5A4oCiuXHRxYwkM1tn5fJQS2b3j88YAfpqoGNq", pumpFunUrl: "" },
  { iso: "sn", iso3: "SEN", name: "Senegal",        ticker: "SEN", flagEmoji: "🇸🇳", population:   18000000, region: "Africa",   colors: ["#00853F", "#FDEF42"], lat: 14.5,   lng: -14.45,  mint: "4ZfZmNbdk3t4kqNbvu6bkgdR8A2zgEjiUKt19qXuUqz3", pumpFunUrl: "" },
  { iso: "ec", iso3: "ECU", name: "Ecuador",        ticker: "ECU", flagEmoji: "🇪🇨", population:   18000000, region: "Americas", colors: ["#FFD100", "#003DA5"], lat: -1.83,  lng: -78.18,  mint: "6vcqZVyjQxUp1Wsu1Hd4REzVPqpvk3wmKXbLQt14siwT", pumpFunUrl: "" },
  { iso: "nl", iso3: "NLD", name: "Netherlands",    ticker: "NED", flagEmoji: "🇳🇱", population:   18000000, region: "Europe",   colors: ["#AE1C28", "#21468B"], lat: 52.13,  lng: 5.29,    mint: "DPhkR4zAMAAECuyGjFVkAZ2yC4okdVdfQwMhoXu2p5ye", pumpFunUrl: "" },
  { iso: "pt", iso3: "PRT", name: "Portugal",       ticker: "POR", flagEmoji: "🇵🇹", population:   10000000, region: "Europe",   colors: ["#006600", "#FF0000"], lat: 39.4,   lng: -8.22,   mint: "57V8bhAtTCYpaNX44YhnbNgMH2a8NDe92mdo8omCuJkm", pumpFunUrl: "" },
  { iso: "be", iso3: "BEL", name: "Belgium",        ticker: "BEL", flagEmoji: "🇧🇪", population:   12000000, region: "Europe",   colors: ["#000000", "#FDDA24"], lat: 50.5,   lng: 4.47,    mint: "6sgHWoKG5VeSwADFN3QfNnVnqx6ib7baTQkWqsNaJdir", pumpFunUrl: "" },
  { iso: "tn", iso3: "TUN", name: "Tunisia",        ticker: "TUN", flagEmoji: "🇹🇳", population:   12000000, region: "Africa",   colors: ["#E70013", "#FFFFFF"], lat: 33.89,  lng: 9.54,    mint: "8EJHK4JbZPXEwyz2VBHfAMpTirNXmrSTx2YcY7wpEcmz", pumpFunUrl: "" },
  { iso: "jo", iso3: "JOR", name: "Jordan",         ticker: "JOR", flagEmoji: "🇯🇴", population:   11000000, region: "Asia",     colors: ["#00732F", "#000000"], lat: 31.24,  lng: 36.51,   mint: "G55UTfhAHzvSP3mauaAAnpquNMDanofszgYtZFR9Kx2E", pumpFunUrl: "" },
  { iso: "cz", iso3: "CZE", name: "Czechia",        ticker: "CZE", flagEmoji: "🇨🇿", population:   11000000, region: "Europe",   colors: ["#11457E", "#D7141A"], lat: 49.82,  lng: 15.47,   mint: "DZmY8afyrs5eTbnjLxd6FWoRVKpA4uTVM9GmbfrhertQ", pumpFunUrl: "" },
  { iso: "ht", iso3: "HTI", name: "Haiti",          ticker: "HTI", flagEmoji: "🇭🇹", population:   11000000, region: "Americas", colors: ["#00209F", "#D21034"], lat: 18.97,  lng: -72.29,  mint: "4JjhJFsPc9SCjugXvTG1oQTEnFmZymsKkihAG6uSB3zS", pumpFunUrl: "" },
  { iso: "ch", iso3: "CHE", name: "Switzerland",    ticker: "SUI", flagEmoji: "🇨🇭", population:    9000000, region: "Europe",   colors: ["#FF0000", "#FFFFFF"], lat: 46.82,  lng: 8.23,    mint: "2JsjWmaaeenFmrec1YPTmme9x7c6S5KRa65hLDixUcz4", pumpFunUrl: "" },
  { iso: "at", iso3: "AUT", name: "Austria",        ticker: "AUT", flagEmoji: "🇦🇹", population:    9000000, region: "Europe",   colors: ["#ED2939", "#FFFFFF"], lat: 47.52,  lng: 14.55,   mint: "BTVKKEbjVwtQCaw4QddpXLEmJmLj2BQfhFF39sZrh17S", pumpFunUrl: "" },
  { iso: "sct", iso3: "SCO", name: "Scotland",      ticker: "SCO", flagEmoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", population:    5500000, region: "Europe",   colors: ["#0065BD", "#FFFFFF"], lat: 56.49,  lng: -4.2,    mint: "8rsPhTKASao4XWWT68tk67u1onRc82PxaNf6yyp1qLCe", pumpFunUrl: "" },
  { iso: "no", iso3: "NOR", name: "Norway",         ticker: "NOR", flagEmoji: "🇳🇴", population:    5500000, region: "Europe",   colors: ["#BA0C2F", "#00205B"], lat: 60.47,  lng: 8.47,    mint: "733aNTgP4Zu4ZkTP6tc9aQPsgGtvzEcESyp53oVAjFAB", pumpFunUrl: "" },
  { iso: "nz", iso3: "NZL", name: "New Zealand",    ticker: "NZL", flagEmoji: "🇳🇿", population:    5200000, region: "Oceania",  colors: ["#012169", "#FFFFFF"], lat: -40.9,  lng: 174.89,  mint: "4L1uGasVcqhKNRgSAReTvPu6Th9Rc8hoqis2urzjYn5B", pumpFunUrl: "" },
  { iso: "py", iso3: "PRY", name: "Paraguay",       ticker: "PRY", flagEmoji: "🇵🇾", population:    6000000, region: "Americas", colors: ["#D52B1E", "#0038A8"], lat: -23.44, lng: -58.44,  mint: "4zVcJKRQMhN35KG3VHMab5uHSUk3LqLGEXfKHr1iLjsa", pumpFunUrl: "" },
  { iso: "hr", iso3: "HRV", name: "Croatia",        ticker: "CRO", flagEmoji: "🇭🇷", population:    4000000, region: "Europe",   colors: ["#FF0000", "#FFFFFF"], lat: 45.1,   lng: 15.2,    mint: "6wSzxkPtS54tNioMQBtqA5eiSkcq3FPZeaJfqhfN4xx3", pumpFunUrl: "" },
  { iso: "pa", iso3: "PAN", name: "Panama",         ticker: "PAN", flagEmoji: "🇵🇦", population:    4400000, region: "Americas", colors: ["#005293", "#DC0714"], lat: 8.54,   lng: -80.78,  mint: "G6UmXZqxXeAEZvZNHPvoMpYremZ4udq3UnuGYc9VWxh2", pumpFunUrl: "" },
  { iso: "uy", iso3: "URY", name: "Uruguay",        ticker: "URU", flagEmoji: "🇺🇾", population:    3500000, region: "Americas", colors: ["#0038A8", "#FFFFFF"], lat: -32.52, lng: -55.77,  mint: "G8D4aMZaLQuqbGNCDUqhVyNkxuPcqLFYQMUcuUHAv44G", pumpFunUrl: "" },
  { iso: "qa", iso3: "QAT", name: "Qatar",          ticker: "QAT", flagEmoji: "🇶🇦", population:    3000000, region: "Asia",     colors: ["#8D1B3D", "#FFFFFF"], lat: 25.35,  lng: 51.18,   mint: "D7DwGRBFbBEP8tKnmTCLfVwWaGCciBCpTqUqyvEdSV6m", pumpFunUrl: "" },
  { iso: "ba", iso3: "BIH", name: "Bosnia and Herzegovina", ticker: "BIH", flagEmoji: "🇧🇦", population:    3200000, region: "Europe", colors: ["#002395", "#FECB00"], lat: 43.92, lng: 17.68, mint: "7GetPoAFmJaruXKVqfZMQ3pfUUeLa3vp7LU1e9StCiEd", pumpFunUrl: "" },
  { iso: "se", iso3: "SWE", name: "Sweden",         ticker: "SWE", flagEmoji: "🇸🇪", population:   10500000, region: "Europe",   colors: ["#006AA7", "#FECC00"], lat: 60.13,  lng: 18.64,   mint: "rqi4C4ChdWTyk2tSkLGbjZT21c7rSri66cEpAuNx2vo", pumpFunUrl: "" },
  { iso: "cw", iso3: "CUW", name: "Curaçao",        ticker: "CUW", flagEmoji: "🇨🇼", population:     150000, region: "Americas", colors: ["#002B7F", "#FAD116"], lat: 12.17,  lng: -68.99,  mint: "7KEi3shKCm4HsjXemCXKsmRyyHkhjzFd3xeZSGBZZTgv", pumpFunUrl: "" },
  { iso: "cv", iso3: "CPV", name: "Cabo Verde",     ticker: "CPV", flagEmoji: "🇨🇻", population:     600000, region: "Africa",   colors: ["#003893", "#CF2027"], lat: 16.0,   lng: -24.01,  mint: "APWeH6cEEmpK2MrKQYSjksj2s71iFGYvh8RnzWDwQriy", pumpFunUrl: "" },
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
