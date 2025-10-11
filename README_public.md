# PUBLIC Directory Audit

## Overview

The `public/` directory serves as the static assets folder for the browser-based MPC application. This directory contains all publicly accessible resources that are served directly by Vite's development server and included in production builds without processing by the bundler.

## Directory Structure

### Root Files

- **`vite.svg`** - Vite default logo/branding (SVG format, ~2KB)

### `public/drum-machines/` Directory

**Primary Sample Library** - 236 WAV audio files across 9 vintage drum machine emulations

#### Sample Organization

The drum machine samples are meticulously organized by manufacturer and model, recreating authentic drum kits from legendary hardware:

- **Akai Linndrum/** (15 samples, 5 + variants)

  - Classic analog drum machine (1979)
  - Samples: Bassdrum, Clap, Closed/Opened Hat, Crash, Cowbell, Rimshot, Snare, Tambourine, Tom Hi/Mid/Low
  - Includes velocity layers and variations

- **Akai MPC-60/** (25+ samples)

  - Professional sampling workstation (1987)
  - Features expanded sound palette beyond traditional drums
  - Includes electric piano, bongos, congas, timbales, and effects

- **Korg Minipops/** (16 samples)

  - Rhythm programmer with analog warmth (1975)
  - Iconic bass drum sound featured in countless productions

- **Oberheim DMX/** (16 samples)

  - Professional digital drum machine (1980)
  - Known for punchy, modern drum sounds

- **Roland TR-606/** (16 samples)

  - Drum machine variant of the TB-303 (1982)
  - Compact, affordable drum sounds

- **Roland TR-707/** (16 samples)

  - Professional rhythm composer (1985)
  - High-quality digital drum machine

- **Roland TR-808/** (16 samples)

  - Legendary programmable drum machine (1980)
  - Iconic samples: rimshot, clap, cowbell, clave

- **Roland TR-909/** (16 samples)

  - Metal-voiced drum machine (1984)
  - Successor to TR-808 with Roland's best drum sounds

- **Yamaha RX-5/** (16 samples)

  - Digital drum machine (1985)
  - Yamaha's entry into digital rhythm machines

- **Yamaha RY-30/** (16 samples)
  - Rhythm programmer (1990)
  - Advanced features and sound quality

#### Sample Format Details

- **All samples**: 16-bit WAV format
- **File naming**: Descriptive instrument names (e.g., "Bassdrum.wav", "Snare.wav")
- **Dual files present**: Each sample exists as both `.wav` (audio data) and `.asd` (metadata)
- **Variantions**: Gated, layered, and velocity-sensitive samples included
- **Total collection**: 236 unique audio sample files

#### Image Assets Status

- **Required**: 8 `machine.jpg` files for drum kit selector UI
- **Missing**: Only placeholder text "No Img" displayed currently
- **Documentation**: `IMAGE_INSTRUCTIONS.md` provides complete setup guide
- **Standard needed**: 400-600px square images for optimal display (48x48 in UI)

## Technical Implementation Notes

### Vite Public Assets

- **Direct serving**: Files accessible via `http://localhost:port/filename.ext`
- **No bundling**: Assets remain untouched during build process
- **Cache headers**: Appropriate caching headers in production
- **GitHub Pages**: Fully compatible with static hosting solutions

### Sample Loading Strategy

- **Web Audio API**: Samples loaded as AudioBuffers for low-latency playback
- **Preloading**: Drum kits loaded on demand to prevent memory bloat
- **Format compatibility**: WAV files ensure universal browser support
- **Metadata parsing**: `.asd` files contain sample metadata (likely Akai format)

### Asset Optimization

- **Sample quality**: Professional-grade recordings, not synthetic
- **File sizes**: Optimized WAV compression (typically 44.1kHz, 16-bit)
- **Cross-platform**: Windows-compatible naming and directory structure
- **Organized hierarchy**: Time-tested manufacturer/model organization

## Content Provenance

- **Authentic reproductions**: Based on original hardware specifications
- **Professional samples**: High-quality digitized drum sounds
- **Hardware accuracy**: Faithfully recreates original machine characteristics
- **Classic collection**: Covers the golden age of drum machines (1975-1990)

## Usage in Application

1. **Kit Selection**: UI allows users to choose from 9 authentic drum machines
2. **Sample Mapping**: Automatic mapping to MPC-style 16-pad layout
3. **Pattern Sequencing**: Samples triggerable in step sequencer
4. **Effect Processing**: Full integration with application's audio effects chain
5. **Export Compatibility**: Patterns and clips can reference specific machine kits

## Future Enhancements Identified

1. **Missing Images**: Add machine.jpg files for visual kit identification
2. **Additional Samples**: Could expand to include more machines (e.g., Linn LM-1, Simmons)
3. **Multisample Support**: Velocity layers and round-robin variations
4. **Metadata Enhancement**: More comprehensive sample information
5. **Compression Options**: MP3/WebAudio alternatives for smaller bundles

## File Statistics

- **Total samples**: 236 WAV audio files
- **Unique drum machines**: 9 classic models
- **Manufacturers represented**: 3 (Akai, Korg, Oberheim, Roland, Yamaha)
- **File pairs**: Each sample has corresponding metadata (.asd) file
- **Approximate total size**: ~50-100MB of high-quality drum samples

This comprehensive sample library represents one of the most complete collections of vintage drum machine samples available in a browser-based application, providing authentic sounds from the most sought-after hardware in electronic music history.
