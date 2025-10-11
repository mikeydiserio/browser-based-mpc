# Source Code Directory

This directory contains the main source code for the Browser-Based MPC application.

## Structure

### `/audio/`

Audio processing and synthesis modules including:

- `AudioEngine.ts` - Main audio engine for sample playback and sequencing
- `TB303Synth.ts` - TB-303 bass synthesizer emulation
- `effects.ts` - Audio effects processing
- `eq.ts` - Equalizer implementation
- `eqCurve.ts` - EQ curve visualization

### `/components/`

React components organized by functionality:

- **Audio Controls**: `MasterVolume/`, `MasterWaveform/`, `Transport/`
- **Sample Management**: `PadGrid/`, `PadBrowser/`, `SampleEditor/`, `SampleInfo/`
- **Sequencing**: `Sequencer/`, `PianoRoll/`, `Timeline/`
- **Effects**: `FX/`, `ParametricEQ/`, `ReverbPlugin/`
- **Synthesis**: `TB303Controls/`
- **UI Layout**: `layout/`, `AppContent.tsx`
- **Session Management**: `session-view.tsx`, `arrangement-view.tsx`

### `/contexts/`

React Context providers for state management:

- `TB303Context.tsx` - TB-303 synthesizer state and controls

### `/hooks/`

Custom React hooks for:

- Audio engine integration (`use-transport.ts`, `use-tracks.ts`)
- Pattern management (`use-patterns.ts`, `use-arrangement.ts`)
- Sample handling (`use-sample-pads.ts`)
- UI state (`use-mobile.ts`, `use-toast.ts`)

### `/lib/`

Core business logic and utilities:

- `audio-engine.ts` - Audio processing and sample management
- `track-manager.ts` - Track and clip management
- `pattern-manager.ts` - Pattern sequencing logic
- `project-manager.ts` - Project save/load functionality
- `synthesizer.ts` - Synthesis engine
- `transport.ts` - Playback control
- `utils.ts` - General utilities

### `/storage/`

Data persistence layer:

- `local.ts` - Local storage implementation for samples, patterns, and settings

### `/styles/`

Styling system:

- `GlobalStyles.tsx` - Global CSS styles
- `theme.ts` - Theme configuration
- `styled.d.ts` - TypeScript declarations for styled-components

### `/utils/`

Utility functions and data:

- `drumKits.ts` - Drum kit presets and sample mappings

### `/shaders/`

WebGL shaders for visual effects:

- `example.glsl` - Example shader
- `shaders.tsx` - Shader components

## Key Features

- **Sample-based MPC**: 16-pad sampler with drag-and-drop loading
- **Step Sequencer**: 16-step pattern sequencer with swing and quantization
- **TB-303 Emulation**: Bass synthesizer with ADSR envelope and filter
- **Session View**: Live performance interface with clip launching
- **Timeline View**: Arrangement and composition interface
- **Real-time Effects**: EQ, reverb, and other audio processing
- **Pattern Management**: 99 patterns with independent step matrices
- **Project Persistence**: Save/load projects with samples and settings

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **Components**: UI presentation layer
- **Hooks**: State management and side effects
- **Lib**: Business logic and audio processing
- **Storage**: Data persistence
- **Audio**: Low-level audio processing

## Dependencies

- React 19.2.0 with TypeScript
- Styled Components for styling
- Web Audio API for audio processing
- Lucide React for icons
- Vite for build tooling
