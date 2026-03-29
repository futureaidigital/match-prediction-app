/**
 * Region Configuration Context
 *
 * Fetches region-based config from backend on app load.
 * Controls visibility of pricing, monetisation, and payment flows.
 *
 * Backend endpoint: GET /api/v1/config
 * Response: { show_pricing: boolean, monetisation_enabled: boolean, payment_live: boolean, region: string }
 *
 * Backend uses Cloudflare CF-IPCountry header to detect region.
 * Africa = free (show_pricing: false, auto-premium via custom claims)
 * EU/UK = paid (show_pricing: true, payment_live: true/false)
 *
 * UNCOMMENT when backend config endpoint is live.
 */

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { env } from '@/config/env';

// interface RegionConfig {
//   show_pricing: boolean;
//   monetisation_enabled: boolean;
//   payment_live: boolean;
//   region: string;
// }

// const DEFAULT_CONFIG: RegionConfig = {
//   show_pricing: true,
//   monetisation_enabled: true,
//   payment_live: false,
//   region: 'unknown',
// };

// interface RegionConfigContextType {
//   config: RegionConfig;
//   isLoading: boolean;
// }

// const RegionConfigContext = createContext<RegionConfigContextType>({
//   config: DEFAULT_CONFIG,
//   isLoading: true,
// });

// export const RegionConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [config, setConfig] = useState<RegionConfig>(DEFAULT_CONFIG);
//   const [isLoading, setIsLoading] = useState(true);
//
//   useEffect(() => {
//     const fetchConfig = async () => {
//       try {
//         const baseUrl = env.API_BASE_URL || '';
//         const res = await fetch(`${baseUrl}/api/v1/config`);
//         if (res.ok) {
//           const data = await res.json();
//           if (data.success && data.data) {
//             setConfig(data.data);
//           }
//         }
//       } catch (err) {
//         console.warn('Failed to fetch region config, using defaults:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchConfig();
//   }, []);
//
//   return (
//     <RegionConfigContext.Provider value={{ config, isLoading }}>
//       {children}
//     </RegionConfigContext.Provider>
//   );
// };

// export const useRegionConfig = () => useContext(RegionConfigContext);

// ==================== Temporary stub (remove when backend is live) ====================
// Returns default config that shows everything (current behaviour)
export const useRegionConfig = () => ({
  config: {
    show_pricing: true,
    monetisation_enabled: true,
    payment_live: false,
    region: 'unknown',
  },
  isLoading: false,
});
