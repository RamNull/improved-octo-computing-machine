# Changelog

All notable changes to the "jira-copilot-bridge" extension will be documented in this file.

## [0.0.1] - 2024-11-11

### Added
- Initial release of Jira Copilot Bridge extension
- Jira integration for viewing and selecting issues
- WebView UI for browsing Jira issues in VS Code sidebar
- Automatic Git branch creation based on Jira issue keys
- GitHub Copilot Chat integration with issue context
- Automatic commit and push functionality
- Pull request creation with GitHub CLI integration
- Jira status updates after PR creation
- Comment posting to Jira with PR links
- Configuration settings for Jira credentials and project
- Comprehensive documentation (README and QUICKSTART)

### Features
- **Issue Selection**: Browse and select Jira issues directly in VS Code
- **Branch Management**: Auto-create branches with sanitized names
- **AI Integration**: Leverage GitHub Copilot for code generation
- **Workflow Automation**: One-click commit, push, and PR creation
- **Jira Updates**: Automatic status transitions and comments

### Technical Details
- TypeScript-based implementation
- VS Code Extension API v1.85.0+
- Jira REST API v3 integration
- Git and GitHub CLI integration
- Axios for HTTP requests
- Full ESLint compliance
- Zero npm security vulnerabilities
