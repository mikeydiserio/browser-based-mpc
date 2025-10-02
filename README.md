# browser-based-mpc

A browser-based groovebox / MPC-style sampler and step sequencer.

## Pattern workflow

- Patterns are numbered 1–99.
- Each pattern stores its own 16×N step matrix (N = 8/16/32/64).
- Switching patterns does not stop playback. The sequencer switches immediately.
- Pattern selector is a numeric input labeled "Pat" in the sequencer footer.
- Enter a number (1..99) to jump to that pattern. New patterns start empty.
- Steps count changes resize the current pattern and are saved per pattern.

Tips:

- Arrow Up/Down also jump patterns by ±5.
- In the Timeline view, clips can reference a pattern index to switch on bar boundaries when Arrangement is on.

