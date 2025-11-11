# Jira Copilot Bridge

A VS Code extension that bridges Jira issue tracking with AI-powered code generation and Git workflow automation. This extension allows developers to seamlessly integrate their Jira workflow with GitHub Copilot and Git, streamlining the entire development process from issue selection to PR creation.

## Features

- 🎯 **View and Select Jira Issues**: Browse your Jira project issues directly within VS Code
- 🤖 **AI-Powered Development**: Integrates with GitHub Copilot to generate code based on issue descriptions
- 🌿 **Automatic Branch Creation**: Creates feature branches automatically based on Jira issue keys
- 📝 **Smart Commits**: Commits changes with properly formatted messages including issue keys
- 🔄 **PR Automation**: Automatically creates pull requests with issue context
- 📊 **Jira Status Updates**: Updates Jira issue status when PRs are created or approved

## Installation

### Prerequisites

- Visual Studio Code (version 1.85.0 or higher)
- Node.js and npm
- Git
- GitHub CLI (optional, for PR creation)
- GitHub Copilot (optional, for AI code generation)

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```
4. Open in VS Code and press F5 to run the extension in development mode

## Configuration

Configure the extension through VS Code settings:

1. Open Settings (File > Preferences > Settings or `Cmd/Ctrl + ,`)
2. Search for "Jira Copilot Bridge"
3. Configure the following settings:

   - **Jira URL**: Your Jira instance URL (e.g., `https://yourcompany.atlassian.net`)
   - **Jira Email**: Your Jira account email
   - **Jira API Token**: Your Jira API token ([Create one here](https://id.atlassian.com/manage-profile/security/api-tokens))
   - **Jira Project**: Your project key (e.g., `PROJ`)
   - **Git Remote**: Git remote name (default: `origin`)

## Usage

### View Issues

1. Click on the Jira Copilot Bridge icon in the Activity Bar
2. The Issues panel will display your Jira project issues
3. Click the refresh button (🔄) to reload issues

### Work on an Issue

1. Click on an issue in the Issues panel
2. The extension will:
   - Create a new Git branch named `{issue-key}/{issue-summary}`
   - Prepare a GitHub Copilot prompt based on the issue
   - Open Copilot Chat for AI-assisted development

3. Use GitHub Copilot to generate code for the feature
4. When ready, click "Commit & PR" to:
   - Commit your changes with a formatted message
   - Push the branch to the remote repository
   - Create a pull request
   - Update the Jira issue status to "In Review"

### Alternative: Command Palette

You can also use commands from the Command Palette (`Cmd/Ctrl + Shift + P`):

- **Jira: View Issues** - Display all issues
- **Jira: Select Issue to Work On** - Select an issue via quick pick
- **Jira: Approve and Update Issue** - Update issue status after PR approval

## Workflow Example

1. **Select Issue**: Developer selects "PROJ-123: Add user authentication" from the Issues panel
2. **Branch Creation**: Extension creates branch `proj-123/add-user-authentication`
3. **AI Assistance**: GitHub Copilot Chat opens with context about the issue
4. **Development**: Developer uses Copilot to generate authentication code
5. **Commit & PR**: Developer clicks "Commit & PR" button
6. **Automation**: Extension commits, pushes, creates PR, and updates Jira to "In Review"

## Architecture

```
src/
├── extension.ts              # Extension entry point
├── models/
│   └── types.ts             # Type definitions
├── services/
│   ├── jiraService.ts       # Jira API integration
│   ├── gitService.ts        # Git operations
│   └── copilotService.ts    # Copilot integration
└── views/
    └── issueViewProvider.ts # WebView UI for issue list
```

## Development

### Build

```bash
npm run compile
```

### Watch Mode

```bash
npm run watch
```

### Lint

```bash
npm run lint
```

### Run Extension

Press `F5` in VS Code to start debugging the extension

## Technologies Used

- **TypeScript**: Type-safe development
- **VS Code Extension API**: Extension framework
- **Jira REST API**: Issue tracking integration
- **GitHub CLI**: Pull request creation
- **Git**: Version control operations
- **Axios**: HTTP client for API calls

## Limitations

- Requires manual configuration of Jira credentials
- GitHub Copilot integration is currently manual (opens Chat with context)
- PR creation requires GitHub CLI or manual creation
- Limited to single Jira project per workspace

## Future Enhancements

- Direct GitHub Copilot API integration for automated code generation
- Multi-project support
- Custom transition workflows
- Issue creation from VS Code
- Time tracking integration
- Advanced filtering and search
- Webhook support for real-time updates

## Security

- API tokens are stored in VS Code settings
- Never commit credentials to version control
- Use environment-specific settings for team workflows

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/RamNull/improved-octo-computing-machine).