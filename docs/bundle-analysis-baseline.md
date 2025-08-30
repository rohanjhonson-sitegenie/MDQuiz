# Bundle Analysis Baseline

Generated: 2025-01-28

## Problem Statement
Main chunk `index-BYXuTdUl.js` is 721.51 kB (216.69 kB gzipped), exceeding the 500 kB warning threshold.

## Current Chunk Analysis

### Largest Chunks (>100 kB)
1. **index-BYXuTdUl.js**: 721.51 kB (216.69 kB gzipped) ⚠️ **MAIN ISSUE**
2. **blog-vendor-Bl3Nqu9b.js**: 396.32 kB (119.36 kB gzipped) - Markdown processing
3. **top-nav-RubcMV9d.js**: 263.58 kB (83.90 kB gzipped) - Navigation components
4. **markdown-content-KYRm0Z_P.js**: 246.18 kB (52.99 kB gzipped) - Markdown content
5. **index-DMgr14eO.js**: 233.37 kB (44.15 kB gzipped) - Route components
6. **badges.lazy-Ws_0fLth.js**: 129.64 kB (12.86 kB gzipped) - Badge components

### Medium Chunks (50-100 kB)
- **index-GGJC1EVM.js**: 87.88 kB (14.27 kB gzipped)
- **index-BYJOuM0e.js**: 84.47 kB (23.56 kB gzipped)
- **index-Cmm98YAP.js**: 80.92 kB (18.13 kB gzipped)
- **index-Bc-jp12-.js**: 77.66 kB (11.25 kB gzipped)
- **index-BhwVn5sv.js**: 75.63 kB (13.62 kB gzipped)
- **video-wall-cinematic-BnvQ_lwN.js**: 73.56 kB (11.38 kB gzipped)
- **index-D_GQNxwF.js**: 69.62 kB (13.37 kB gzipped)
- **layout-flows-ChXlhnPZ.js**: 59.82 kB (6.42 kB gzipped)
- **accessibility-B2CtQoRn.js**: 58.61 kB (7.16 kB gzipped)
- **navigation-BDbKKiXg.js**: 58.18 kB (5.97 kB gzipped)
- **overlays-BEmrMeB6.js**: 58.13 kB (5.90 kB gzipped)
- **index-yUWJ4PVS.js**: 56.05 kB (15.87 kB gzipped)
- **index-COCXX_GI.js**: 55.78 kB (15.07 kB gzipped)
- **feedback-CLmaOSv-.js**: 50.06 kB (5.62 kB gzipped)

### Key Library Contributors (Estimated)
- **@tabler/icons-react**: Multiple chunks including IconSun-kWi5qjgX.js (26.85 kB)
- **@radix-ui components**: Distributed across form, select, dialog, and other UI chunks
- **TanStack Router/Query**: Likely in main chunk and route components
- **React Hook Form + Zod**: In form-Cm23cTxg.js (35.35 kB) and schemas chunks
- **Markdown processing**: Already isolated in blog-vendor chunk (good!)

## Optimization Targets
1. **Primary Goal**: Reduce main chunk (721.51 kB → <500 kB)
2. **Secondary Goals**: 
   - Split vendor libraries into cacheable chunks
   - Optimize icon library tree-shaking
   - Improve route-level code splitting

## Total Bundle Stats
- **Number of chunks**: 150+ individual chunks
- **Total uncompressed size**: ~3.2 MB
- **Total compressed size**: ~800 kB
- **Current warning**: Main chunk exceeds 500 kB threshold

## Next Steps
1. Implement splitVendorChunkPlugin
2. Create manual chunks for major libraries
3. Optimize imports for better tree-shaking
4. Set appropriate chunk size limits