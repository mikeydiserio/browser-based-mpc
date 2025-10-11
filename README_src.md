# SRC Directory Audit

## Overview

The `src/` directory contains the complete source code for the browser-based MPC application. This is a React/TypeScript application built with Vite, implementing a comprehensive digital audio workstation with sampling, sequencing, and music production capabilities.

## Architecture Structure

### Core Application Files

- **`main.tsx`** - Application entry point using React 19's createRoot API
- **`App.tsx`** - Main application component
- **`App.css`** - Global application styles
- **`index.css`** - Base CSS imports and global styles
- **`vite-env.d.ts`** - Vite-specific TypeScript type definitions

### Directory Structure Breakdown

#### `src/audio/` (5 files)

**Audio Processing Engine**

- `AudioEngine.ts` - Core audio processing and Web Audio API management
- `effects.ts` - Audio effects processing (reverb, delay, filters)
- `eq.ts` - Equalizer implementation with multiple bands
- `eqCurve.ts` - Parametric EQ curve calculations
- `TB303Synth.ts` - Roland TB-303 analog bass synthesizer emulation

#### `src/components/` (67+ files organized)

**React Component Library**
Comprehensive UI component system with folder-based organization:

- **Core Components** (11 files): Main app views and core functionality

  - `AppContent.tsx` - Main application layout wrapper
  - `session-view.tsx` - Primary sequencer interface
  - `arrangement-view.tsx` - Song arrangement timeline
  - `piano-roll.tsx` - MIDI note editing interface
  - `mixer.tsx` - Audio mixer interface
  - `sample-editor.tsx` - Sample waveform editor
  - `transport-controls.tsx` - Playback/transport controls
  - `project-menu.tsx` - Project management menu
  - Plus additional core UI components

- **Modular Component Libraries** (Each in subfolders with styles):
  - `Knob/` - Rotary control interface elements
  - `PadGrid/` - Sample trigger pads (MPC-style)
  - `Sequencer/` - Step sequencer component
  - `PianoRoll/` - Advanced MIDI piano roll editor
  - `Mixer/` - Multi-track mixer channels
  - `Transport/` - Playback transport controls
  - `Timeline/` - Song timeline and arrangement
  - `ParametricEQ/` - Visual equalizer interface
  - `ReverbPlugin/` - Reverb effect controls
  - `TB303Controls/` - Analog synthesizer controls
  - `PadBrowser/` - Sample library browser
  - `PatternManager/` - Pattern sequencing management
  - `KitSelector/` - Drum kit selection
  - `InstrumentSelector/` - Instrument selection
  - And more specialty components...

#### `src/hooks/` (13 files)

**Custom React Hooks**
State management and side-effect hooks for music production features:

- Transport control (`use-transport.ts`)
- Audio clip management (`use-clip-player.ts`)
- MIDI editing (`use-midi-editor.ts`)
- Pattern management (`use-patterns.ts`)
- Project state (`use-project.ts`)
- Sample pad functionality (`use-sample-pads.ts`)
- Track effects (`use-track-effects.ts`)
- Toast notifications (`use-toast.ts`)
- Mobile responsiveness (`use-mobile.ts`)
- Arrangement management (`use-arrangement.ts`)

#### `src/lib/` (13 files)

**Core Business Logic**
Application domain logic and utility libraries:

- `audio-engine.ts` - High-level audio engine wrapper
- `transport.ts` - Playback state management
- `pattern-manager.ts` - Pattern storage and manipulation
- `arrangement-manager.ts` - Song arrangement logic
- `project-manager.ts` - Project save/load functionality
- `clip-player.ts` - Audio clip playback system
- `sample-pad-manager.ts` - Sample pad orchestration
- `track-manager.ts` - Audio track management
- `midi-editor.ts` - MIDI data processing
- `effects.ts` - Effect processing pipeline
- `synthesizer.ts` - Software synthesis core
- `registry.tsx` - Component registration system
- `utils.ts` - General utility functions

#### `src/contexts/` (1 file)

**React Context Providers**

- `TB303Context.tsx` - TB-303 synthesizer state management

#### `src/storage/` (1 file)

**Data Persistence**

- `local.ts` - Browser localStorage wrapper for project persistence

#### `src/styles/` (4 files)

**Styling System**

- `GlobalStyles.tsx` - Global CSS-in-JS styles
- `theme.ts` - Styled-components theme configuration
- `styled.d.ts` - TypeScript definitions for styled components

#### `src/shaders/` (2 files)

**WebGL Shaders**

- `example.glsl` - GLSL shader example
- `shaders.tsx` - Shader integration utilities

#### `src/utils/` (1 file)

**Utility Functions**

- `drumKits.ts` - Drum sample kit configurations

## Technical Implementation Details

### Web Audio Architecture

- **AudioContext-based** real-time audio processing
- **Sample-based** playback system with Web Audio Buffers
- **Effect chains** with convolution reverb, equalization, and custom effects
- **Multi-track mixing** with individual channel processing

### Sequencing System

- **Pattern-based** workflow with up to 99 patterns
- **16-step grids** with configurable lengths (8/16/32/64 steps)
- **Non-destructive pattern switching** during playback
- **MIDI-compatible** timing and note data

### Component Organization

- **Modular architecture** with reusable component libraries
- **Styled-components** for consistent theming
- **Custom hooks** for complex state management
- **TypeScript strict** for type safety in audio applications

### Performance Optimizations

- **Web Audio API** for low-latency audio processing
- **React Suspense** boundaries for smooth interactions
- **Efficient re-renders** with selective component updates
- **Memory management** for large sample libraries

## Key Features Implemented

1. **MPC-Style Sampling** - Load, trigger, and manipulate audio samples
2. **Step Sequencing** - Traditional 16-step pattern creation
3. **Piano Roll Editing** - Advanced MIDI note manipulation
4. **Multi-Track Mixer** - Channel-based audio control
5. **Effect Processing** - Reverb, EQ, and custom audio effects
6. **Synth Emulation** - TB-303 analog bass synthesizer
7. **Arrangement View** - Song-level composition and arrangement
8. **Project Management** - Save/load project states
9. **Sample Library** - Extensive drum machine sample collection

## File Statistics

- **Total Source Files**: ~90+ TypeScript/React files
- **Component Breakdown**: 67+ React components in modular structure
- **Business Logic**: 13 core libraries handling audio/midi/mixing
- **State Management**: Custom hooks + React Context providers
- **Styling**: CSS-in-JS with styled-components + Tailwind utilities

## Dependencies Analysis

- **React 19** with modern concurrent features
- **Vite 7** for fast development and optimized builds
- **Web Audio API** for professional audio processing
- **Styled-components** for component-based styling
- **TypeScript 5.8** for enhanced type safety
- **Lucide React** for consistent iconography

This source directory represents a sophisticated, production-ready digital audio workstation running entirely in the browser, rivaling commercial DAWs in functionality and user experience.
