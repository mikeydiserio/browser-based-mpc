# Browser-Based MPC

A browser-based groovebox / MPC-style sampler and step sequencer built with React, TypeScript, and Web Audio API.

## Features

### Core Functionality

- **16-Pad Sampler**: Load and trigger samples with drag-and-drop support
- **Step Sequencer**: 16-step pattern sequencer with swing and quantization
- **Pattern Management**: 99 patterns with independent step matrices
- **Real-time Audio**: Web Audio API for low-latency sample playback
- **Project Persistence**: Save/load projects with samples and settings

### Synthesis

- **TB-303 Emulation**: Bass synthesizer with ADSR envelope and filter
- **Real-time Controls**: Draggable popup window for TB-303 parameters
- **Piano Roll**: MIDI note editing for TB-303 sequences

### Session Management

- **Session View**: Live performance interface with clip launching
- **Timeline View**: Arrangement and composition interface
- **Track Management**: Multiple MIDI and audio tracks
- **Mixer**: Per-track volume, pan, mute, solo, and effects

### Audio Processing

- **Effects Chain**: Reverb, delay, distortion, and more
- **Parametric EQ**: Multi-band equalizer with real-time visualization
- **Master Controls**: Master volume and recording capabilities

## Technology Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Styling**: Styled Components (no Tailwind CSS)
- **Audio**: Web Audio API for real-time audio processing
- **Build**: Vite for fast development and optimized builds
- **State Management**: React Context API and custom hooks

## Project Structure

```
├── src/                    # Source code
│   ├── components/         # React components
│   ├── audio/             # Audio processing modules
│   ├── contexts/          # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core business logic
│   ├── storage/           # Data persistence
│   ├── styles/            # Styling system
│   └── utils/             # Utility functions
├── public/                # Static assets and samples
├── dist/                  # Built production files
├── static/                # Additional static assets
└── node_modules/          # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd browser-based-mpc

# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev
# or
pnpm dev
```

### Building

```bash
# Build for production
npm run build
# or
pnpm build
```

### Preview

```bash
# Preview production build
npm run preview
# or
pnpm preview
```

## Usage

### Pattern Workflow

- Patterns are numbered 1–99
- Each pattern stores its own 16×N step matrix (N = 8/16/32/64)
- Switching patterns does not stop playback
- Pattern selector is a numeric input labeled "Pat" in the sequencer footer
- Enter a number (1..99) to jump to that pattern
- Arrow Up/Down also jump patterns by ±5

### TB-303 Controls

- Click the TB-303 icon in the right sidebar to open the synthesizer controls
- The popup window can be dragged, minimized, and closed
- All TB-303 parameters are real-time and affect the synthesizer immediately

### Sample Management

- Drag and drop audio files onto pads to load samples
- Use the sample editor to slice and assign portions of samples
- Save and load drum kit presets with Ctrl+1-8

### Session View

- Click track headers to select tracks and view their controls
- Double-click clip slots to edit MIDI clips in the piano roll
- Use the mixer for volume, pan, mute, and solo controls

## Browser Compatibility

The application requires modern browsers with Web Audio API support:

- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Sample libraries from classic drum machines (Roland TR-808, TR-909, etc.)
- Web Audio API for real-time audio processing
- React and TypeScript communities for excellent tooling
