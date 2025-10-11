# Public Assets Directory

This directory contains static assets served directly by the web server.

## Structure

### `/drum-machines/`

Sample libraries for classic drum machines:

#### Akai Linndrum

- Bassdrum, Clap, Closed Hat, Cowbell, Crash, Open Hat, Ride, SD (Snare), Shuffle, Tambourin
- Tom H (High), Tom L (Low), Tom M (Medium)
- Includes `.asd` files (Adobe Audition session data)

#### Akai MPC-60

- Comprehensive sample set with 21 unique sounds
- Professional drum machine samples

#### Korg Minipops

- Organized by category: BASSDRUM, CYMBALS, MISC, SNARES
- Vintage analog drum machine sounds

#### Oberheim DMX

- Classic 80s drum machine samples
- Multiple variations of bass drums and snares
- Includes percussion elements like Cabasa, Timbale

#### Roland TR Series

- **TR-606**: Early analog drum machine
- **TR-707**: Digital drum machine with classic sounds
- **TR-808**: Legendary analog drum machine
- **TR-909**: Hybrid analog/digital drum machine

#### Yamaha RX Series

- **RX-5**: Digital drum machine
- **RY-30**: Advanced digital drum machine with extensive sample set

### `/IMAGE_INSTRUCTIONS.md`

Instructions for adding drum machine images and visual assets.

## Usage

These samples are loaded dynamically by the application's drum kit system. Each drum machine folder contains:

1. **Audio Files** (`.wav`): The actual sample data
2. **Session Files** (`.asd`): Adobe Audition session data (optional)

## Sample Organization

Samples are organized by:

- **Manufacturer**: Akai, Korg, Oberheim, Roland, Yamaha
- **Model**: Specific drum machine model
- **Type**: Bass drum, snare, hi-hat, cymbal, tom, percussion

## Integration

The application's drum kit system (`src/utils/drumKits.ts`) maps these samples to the 16-pad grid, allowing users to load complete drum machine presets or individual samples.

## File Formats

- **Primary**: WAV files for maximum compatibility
- **Metadata**: ASD files contain additional processing information
- **Quality**: Professional-grade samples suitable for music production

## Licensing

All samples are royalty-free and suitable for use in music production. Please verify individual sample licensing if redistributing.
