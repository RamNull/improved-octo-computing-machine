import * as vscode from 'vscode';
import { JiraService } from '../services/jiraService';
import { GitService } from '../services/gitService';
import { CopilotService } from '../services/copilotService';
import { JiraIssue } from '../models/types';

export class IssueViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'jiraCopilotBridge.issuesView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly jiraService: JiraService,
        private readonly gitService: GitService,
        private readonly copilotService: CopilotService
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'loadIssues':
                    await this.loadIssues();
                    break;
                case 'selectIssue':
                    await this.processIssue(message.issueKey);
                    break;
                case 'refreshIssues':
                    await this.loadIssues();
                    break;
            }
        });
    }

    public async showIssues() {
        await this.loadIssues();
    }

    private async loadIssues() {
        if (!this._view) {
            return;
        }

        try {
            const issues = await this.jiraService.getIssues();
            this._view.webview.postMessage({
                command: 'updateIssues',
                issues: issues
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to load issues: ${errorMessage}`);
        }
    }

    private async processIssue(issueKey: string) {
        try {
            const issue = await this.jiraService.getIssue(issueKey);
            if (!issue) {
                return;
            }

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Processing issue ${issue.key}`,
                cancellable: false
            }, async (progress) => {
                // Step 1: Create branch
                progress.report({ increment: 0, message: 'Creating branch...' });
                const branchName = await this.gitService.createBranch(issue.key, issue.summary);
                
                // Step 2: Generate code using Copilot
                progress.report({ increment: 25, message: 'Preparing AI prompt...' });
                await this.copilotService.invokeCopilotChat(issue.summary, issue.description);
                
                progress.report({ increment: 100, message: 'Ready for development!' });
                
                vscode.window.showInformationMessage(
                    `Branch ${branchName} created. Use GitHub Copilot Chat to implement the feature.`,
                    'Commit & PR',
                    'Cancel'
                ).then(async selection => {
                    if (selection === 'Commit & PR') {
                        await this.commitAndCreatePR(issue);
                    }
                });
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Error processing issue: ${errorMessage}`);
        }
    }

    private async commitAndCreatePR(issue: JiraIssue) {
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Creating PR for ${issue.key}`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Committing changes...' });
                await this.gitService.commitChanges(issue.key, issue.summary);
                
                progress.report({ increment: 50, message: 'Creating pull request...' });
                const prUrl = await this.gitService.createPullRequest(issue.key, issue.summary, issue.description);
                
                progress.report({ increment: 75, message: 'Updating Jira...' });
                await this.jiraService.updateIssueStatus(issue.key, 'In Review');
                
                if (prUrl) {
                    await this.jiraService.addComment(issue.key, `Pull request created: ${prUrl}`);
                }
                
                progress.report({ increment: 100, message: 'Done!' });
                
                if (prUrl) {
                    vscode.window.showInformationMessage(
                        `Successfully created PR for ${issue.key}`,
                        'View PR'
                    ).then(selection => {
                        if (selection === 'View PR') {
                            vscode.env.openExternal(vscode.Uri.parse(prUrl));
                        }
                    });
                } else {
                    vscode.window.showInformationMessage(`Changes committed for ${issue.key}`);
                }
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Error creating PR: ${errorMessage}`);
        }
    }

    private _getHtmlForWebview(_webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jira Issues</title>
    <style>
        body {
            padding: 10px;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        h2 {
            margin: 0;
            font-size: 16px;
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 2px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .issue-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .issue-item {
            padding: 12px;
            margin-bottom: 8px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .issue-item:hover {
            background-color: var(--vscode-list-hoverBackground);
        }
        .issue-key {
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
            font-size: 12px;
        }
        .issue-summary {
            margin: 4px 0;
            font-size: 14px;
        }
        .issue-meta {
            display: flex;
            gap: 12px;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 6px;
        }
        .status-badge {
            padding: 2px 8px;
            border-radius: 3px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }
        .empty {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }
        .empty-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Jira Issues</h2>
        <button id="refreshBtn" title="Refresh issues">🔄</button>
    </div>
    
    <div id="content">
        <div class="loading">Loading issues...</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // Load issues on startup
        vscode.postMessage({ command: 'loadIssues' });
        
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            document.getElementById('content').innerHTML = '<div class="loading">Loading issues...</div>';
            vscode.postMessage({ command: 'refreshIssues' });
        });
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateIssues':
                    displayIssues(message.issues);
                    break;
            }
        });
        
        function displayIssues(issues) {
            const content = document.getElementById('content');
            
            if (!issues || issues.length === 0) {
                content.innerHTML = \`
                    <div class="empty">
                        <div class="empty-icon">📋</div>
                        <div>No issues found</div>
                        <div style="margin-top: 8px; font-size: 12px;">Configure your Jira settings in VS Code preferences</div>
                    </div>
                \`;
                return;
            }
            
            const issueList = issues.map(issue => \`
                <div class="issue-item" onclick="selectIssue('\${issue.key}')">
                    <div class="issue-key">\${issue.key}</div>
                    <div class="issue-summary">\${issue.summary}</div>
                    <div class="issue-meta">
                        <span class="status-badge">\${issue.status}</span>
                        <span>\${issue.type}</span>
                        \${issue.assignee ? '<span>👤 ' + issue.assignee + '</span>' : ''}
                    </div>
                </div>
            \`).join('');
            
            content.innerHTML = '<ul class="issue-list">' + issueList + '</ul>';
        }
        
        function selectIssue(issueKey) {
            vscode.postMessage({ 
                command: 'selectIssue',
                issueKey: issueKey
            });
        }
    </script>
</body>
</html>`;
    }
}
