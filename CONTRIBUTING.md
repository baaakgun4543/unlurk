# Contributing to Unlurk

Thanks for your interest in contributing to Unlurk!

## Development Setup

```bash
# Clone the repo
git clone https://github.com/unlurk/unlurk.git
cd unlurk

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

## Project Structure

```
unlurk/
├── src/                  # Core SDK source
│   ├── index.ts         # Main entry point
│   ├── core.ts          # Core logic (init, enhance)
│   ├── types.ts         # TypeScript types
│   ├── providers/       # LLM provider implementations
│   └── ui/              # UI components (overlay, buttons)
├── packages/
│   └── react/           # @unlurk/react package
├── dist/                # Built files
└── examples/            # Usage examples
```

## Making Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add my feature'`)
6. Push to your fork (`git push origin feature/my-feature`)
7. Open a Pull Request

## Code Style

- Use TypeScript
- Follow existing code patterns
- Keep functions small and focused
- Write descriptive commit messages

## Adding a New LLM Provider

1. Create a new file in `src/providers/`
2. Implement the `LLMProviderInterface`
3. Export from `src/providers/index.ts`
4. Add to provider initialization in `src/core.ts`

## Questions?

Open an issue or reach out on Discord.
