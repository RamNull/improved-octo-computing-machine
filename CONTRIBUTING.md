# Contributing to Jira Copilot Bridge

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/improved-octo-computing-machine.git
   cd improved-octo-computing-machine
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Open in VS Code and press F5 to start debugging

## Development Workflow

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our code style guidelines

3. Run linting:
   ```bash
   npm run lint
   ```

4. Compile to check for errors:
   ```bash
   npm run compile
   ```

5. Test your changes manually by running the extension (F5)

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Follow the existing code structure
- Use ESLint configuration (all checks must pass)

### Commit Messages

Use clear, descriptive commit messages:
- Format: `type: description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Examples:
  - `feat: add support for multiple Jira projects`
  - `fix: resolve branch creation error`
  - `docs: update README with new configuration`

## Pull Request Process

1. Ensure all lint checks pass (`npm run lint`)
2. Ensure code compiles without errors (`npm run compile`)
3. Update documentation if you've changed functionality
4. Update CHANGELOG.md with your changes
5. Submit a pull request with a clear description

### PR Description Template

```markdown
## What does this PR do?
Brief description of changes

## Why is this change needed?
Explanation of the problem being solved

## How was this tested?
Steps to verify the changes work

## Checklist
- [ ] Code compiles without errors
- [ ] ESLint checks pass
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Manually tested
```

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Keep discussions on-topic

## Areas to Contribute

### High Priority
- Direct GitHub Copilot API integration
- Automated testing framework
- Multi-project support
- Advanced issue filtering

### Documentation
- Tutorial videos
- Example workflows
- Troubleshooting guides
- API documentation

### Features
- Custom Jira workflows
- Issue creation from VS Code
- Time tracking
- Sprint management
- Custom field support

### Bug Fixes
- Check the Issues tab for known bugs
- Report new bugs with detailed reproduction steps

## Questions?

- Open an issue for questions
- Tag your issue with `question`
- Be patient - maintainers are volunteers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
