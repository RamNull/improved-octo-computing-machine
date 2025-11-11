# Quick Start Guide

## Prerequisites

1. **Jira Account**: You need an active Jira account with API access
2. **GitHub Account**: For Git integration and PR creation
3. **VS Code**: Version 1.85.0 or higher
4. **GitHub CLI** (optional): For automated PR creation

## Configuration Steps

### 1. Get Your Jira API Token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name (e.g., "VS Code Extension")
4. Copy the token (you won't be able to see it again!)

### 2. Configure the Extension

1. Open VS Code Settings (`Cmd/Ctrl + ,`)
2. Search for "Jira Copilot Bridge"
3. Fill in the following settings:
   - **Jira URL**: `https://yourcompany.atlassian.net` (replace with your Jira instance)
   - **Jira Email**: Your Jira account email
   - **Jira API Token**: The token you created in step 1
   - **Jira Project**: Your project key (e.g., `DEMO`, `PROJ`)
   - **Git Remote**: `origin` (or your preferred remote name)

Example `.vscode/settings.json`:

```json
{
  "jiraCopilotBridge.jiraUrl": "https://mycompany.atlassian.net",
  "jiraCopilotBridge.jiraEmail": "developer@example.com",
  "jiraCopilotBridge.jiraApiToken": "your-api-token-here",
  "jiraCopilotBridge.jiraProject": "DEMO",
  "jiraCopilotBridge.gitRemote": "origin"
}
```

### 3. Install GitHub CLI (Optional)

For automated PR creation, install GitHub CLI:

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
sudo apt install gh  # Debian/Ubuntu
# or
sudo dnf install gh  # Fedora/RHEL
```

**Windows:**
```bash
winget install GitHub.cli
```

Authenticate:
```bash
gh auth login
```

## Usage

### Method 1: Using the Activity Bar

1. Click the Jira Copilot Bridge icon in the Activity Bar (left sidebar)
2. Browse the list of Jira issues
3. Click on an issue to start working on it
4. The extension will:
   - Create a branch named `{issue-key}/{issue-summary}`
   - Open GitHub Copilot Chat with context
5. Use Copilot to write your code
6. When ready, click "Commit & PR" to finalize

### Method 2: Using Command Palette

1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Type "Jira: Select Issue to Work On"
3. Select an issue from the dropdown
4. Follow the same workflow as above

### Example Workflow

**Scenario**: Working on DEMO-123: Add user authentication

1. **Open the extension**: Click the Jira icon in Activity Bar
2. **Select issue**: Click on "DEMO-123: Add user authentication"
3. **Branch created**: `demo-123/add-user-authentication`
4. **Copilot prompt ready**: Extension prepares a context prompt
5. **Develop**: Use GitHub Copilot to generate authentication code
6. **Commit & PR**: Click "Commit & PR" button
7. **Automation**:
   - Code is committed with message: "DEMO-123: Add user authentication"
   - Branch is pushed to GitHub
   - Pull request is created
   - Jira issue status updated to "In Review"
   - Comment added to Jira with PR link

## Commands

- **Jira: View Issues** - Display all Jira issues
- **Jira: Select Issue to Work On** - Select issue via quick pick
- **Jira: Approve and Update Issue** - Update issue status after PR approval

## Troubleshooting

### "No Jira issues found"
- Check your Jira configuration settings
- Verify your API token is valid
- Ensure you have access to the project

### "GitHub CLI not found"
- Install GitHub CLI (see installation steps above)
- Or manually create PRs from GitHub web interface

### "Failed to create branch"
- Ensure you have uncommitted changes committed
- Check that Git is properly configured
- Verify you're in a Git repository

### "Failed to fetch Jira issues"
- Verify your Jira URL is correct (include https://)
- Check your email and API token
- Ensure you have permission to view the project

## Security Best Practices

- **Never commit credentials** to version control
- Use workspace-specific settings for team projects
- Rotate API tokens regularly
- Use `.gitignore` to exclude settings files with sensitive data

## Tips

1. **Custom JQL**: Modify `jiraService.ts` to customize the JQL query for fetching issues
2. **Status Transitions**: The extension automatically finds the correct status transition
3. **Branch Naming**: Branches are auto-sanitized for Git compatibility
4. **Copilot Integration**: Currently opens Copilot Chat - future versions may have direct API integration

## Need Help?

- Check the [README](README.md) for detailed documentation
- Report issues on GitHub
- Contribute via pull requests
