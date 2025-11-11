# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VS Code Extension                        │
│                      (Jira Copilot Bridge)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Jira Service │ │  Git Service │ │Copilot Service│
        └──────────────┘ └──────────────┘ └──────────────┘
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │  Jira API    │ │  Git/GitHub  │ │ GitHub Copilot│
        │   REST v3    │ │     CLI      │ │     Chat      │
        └──────────────┘ └──────────────┘ └──────────────┘
```

## Component Breakdown

### 1. Extension Entry Point (`extension.ts`)
- Activates the extension
- Registers commands and views
- Coordinates between services
- Handles user interactions

### 2. Services Layer

#### JiraService (`services/jiraService.ts`)
```
Responsibilities:
- Authenticate with Jira API
- Fetch issues from Jira project
- Update issue status (transitions)
- Add comments to issues
- Handle Jira API errors

Methods:
+ getIssues(): JiraIssue[]
+ getIssue(key): JiraIssue
+ updateIssueStatus(key, status): boolean
+ addComment(key, comment): boolean
```

#### GitService (`services/gitService.ts`)
```
Responsibilities:
- Create Git branches
- Commit changes
- Push to remote
- Create pull requests
- Extract issue keys from branch names

Methods:
+ createBranch(issueKey, summary): string
+ commitChanges(issueKey, summary): void
+ pushBranch(): void
+ createPullRequest(key, summary, desc): string
+ getCurrentBranch(): string
```

#### CopilotService (`services/copilotService.ts`)
```
Responsibilities:
- Integrate with GitHub Copilot
- Generate code prompts
- Apply code changes (placeholder)
- Open Copilot Chat with context

Methods:
+ generateCode(summary, description): CodeChange[]
+ applyChanges(changes): void
+ invokeCopilotChat(summary, description): void
```

### 3. Views Layer

#### IssueViewProvider (`views/issueViewProvider.ts`)
```
Responsibilities:
- Render WebView UI for issue list
- Handle user selections
- Display issue metadata
- Trigger workflows
- Show progress notifications

Features:
- Real-time issue refresh
- Click-to-select interface
- Visual status badges
- Empty state handling
```

### 4. Models Layer

#### Types (`models/types.ts`)
```typescript
interface JiraIssue {
    key: string;
    summary: string;
    description: string;
    status: string;
    type: string;
    assignee?: string;
}

interface CodeChange {
    filePath: string;
    content: string;
    operation: 'create' | 'update' | 'delete';
}
```

## User Workflow

```
1. User Opens Extension
   │
   ├─> Sidebar displays Jira issues
   │
2. User Selects Issue (e.g., DEMO-123)
   │
   ├─> GitService.createBranch("DEMO-123", "Add feature")
   │   └─> Creates branch: demo-123/add-feature
   │
   ├─> CopilotService.invokeCopilotChat(...)
   │   └─> Opens Copilot Chat with issue context
   │
3. User Develops with Copilot
   │
   ├─> Writes code using AI assistance
   │
4. User Clicks "Commit & PR"
   │
   ├─> GitService.commitChanges(...)
   │   └─> Commits: "DEMO-123: Add feature"
   │
   ├─> GitService.createPullRequest(...)
   │   └─> Creates PR with GitHub CLI
   │
   ├─> JiraService.updateIssueStatus("DEMO-123", "In Review")
   │   └─> Transitions issue in Jira
   │
   └─> JiraService.addComment("DEMO-123", "PR: https://...")
       └─> Links PR to Jira issue
```

## Data Flow

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │ Selects Issue
       ▼
┌──────────────────┐
│  WebView UI      │
│  (Issue List)    │
└──────┬───────────┘
       │ Triggers Command
       ▼
┌──────────────────┐
│  Extension.ts    │◄─────────┐
│  (Orchestrator)  │          │
└──────┬───────────┘          │
       │                      │
       ├─────────────┬────────┼────────┐
       ▼             ▼        ▼        ▼
  JiraService   GitService  CopilotService
       │             │        │
       ▼             ▼        ▼
   Jira API      Git/GH     Copilot
```

## Security Model

### Input Validation
- Branch names sanitized (alphanumeric + hyphens only)
- Git commands use `execFile` (no shell injection)
- Jira credentials stored in VS Code settings
- API tokens never logged or exposed

### Command Execution
```typescript
// ❌ UNSAFE (shell injection risk)
exec(`git commit -m "${message}"`)

// ✅ SAFE (arguments array)
execFile('git', ['commit', '-m', message])
```

### Authentication
- Jira: Basic Auth with API token
- GitHub: Via GitHub CLI (user's credentials)
- No credentials stored in code

## Configuration

### User Settings
```json
{
  "jiraCopilotBridge.jiraUrl": "https://company.atlassian.net",
  "jiraCopilotBridge.jiraEmail": "user@company.com",
  "jiraCopilotBridge.jiraApiToken": "API_TOKEN_HERE",
  "jiraCopilotBridge.jiraProject": "DEMO",
  "jiraCopilotBridge.gitRemote": "origin"
}
```

## Extension Points

### Future Enhancements
1. **Direct Copilot API Integration**
   - Automated code generation
   - No manual Copilot Chat required

2. **Multi-Project Support**
   - Work across multiple Jira projects
   - Project-specific configurations

3. **Custom Workflows**
   - Configurable status transitions
   - Custom branch naming patterns

4. **Advanced Features**
   - Time tracking
   - Sprint management
   - Issue creation from VS Code
   - Webhook integrations
