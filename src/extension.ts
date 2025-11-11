import * as vscode from 'vscode';
import { JiraService } from './services/jiraService';
import { GitService } from './services/gitService';
import { CopilotService } from './services/copilotService';
import { IssueViewProvider } from './views/issueViewProvider';

let jiraService: JiraService;
let gitService: GitService;
let copilotService: CopilotService;

export function activate(context: vscode.ExtensionContext) {
    console.log('Jira Copilot Bridge is now active!');

    // Initialize services
    jiraService = new JiraService();
    gitService = new GitService();
    copilotService = new CopilotService();

    // Register webview provider for issue list
    const issueViewProvider = new IssueViewProvider(context.extensionUri, jiraService, gitService, copilotService);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('jiraCopilotBridge.issuesView', issueViewProvider)
    );

    // Register commands
    const viewIssuesCommand = vscode.commands.registerCommand('jira-copilot-bridge.viewIssues', async () => {
        await issueViewProvider.showIssues();
    });

    const selectIssueCommand = vscode.commands.registerCommand('jira-copilot-bridge.selectIssue', async () => {
        await selectAndProcessIssue();
    });

    const approveChangesCommand = vscode.commands.registerCommand('jira-copilot-bridge.approveChanges', async () => {
        await approveAndUpdateJira();
    });

    context.subscriptions.push(viewIssuesCommand, selectIssueCommand, approveChangesCommand);
}

async function selectAndProcessIssue() {
    try {
        // Fetch issues from Jira
        const issues = await jiraService.getIssues();
        
        if (!issues || issues.length === 0) {
            vscode.window.showInformationMessage('No Jira issues found.');
            return;
        }

        // Show quick pick for issue selection
        const issueItems = issues.map(issue => ({
            label: `${issue.key}: ${issue.summary}`,
            description: issue.status,
            issue: issue
        }));

        const selected = await vscode.window.showQuickPick(issueItems, {
            placeHolder: 'Select a Jira issue to work on'
        });

        if (!selected) {
            return;
        }

        const issue = selected.issue;
        
        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Processing issue ${issue.key}`,
            cancellable: false
        }, async (progress) => {
            // Step 1: Create branch
            progress.report({ increment: 0, message: 'Creating branch...' });
            await gitService.createBranch(issue.key, issue.summary);
            
            // Step 2: Generate code using Copilot
            progress.report({ increment: 25, message: 'Generating code with AI...' });
            const codeChanges = await copilotService.generateCode(issue.summary, issue.description);
            
            // Step 3: Apply changes
            progress.report({ increment: 50, message: 'Applying code changes...' });
            await copilotService.applyChanges(codeChanges);
            
            // Step 4: Commit changes
            progress.report({ increment: 75, message: 'Committing changes...' });
            await gitService.commitChanges(issue.key, issue.summary);
            
            // Step 5: Create pull request
            progress.report({ increment: 90, message: 'Creating pull request...' });
            const prUrl = await gitService.createPullRequest(issue.key, issue.summary, issue.description);
            
            progress.report({ increment: 100, message: 'Done!' });
            
            vscode.window.showInformationMessage(
                `Successfully created PR for ${issue.key}`,
                'View PR'
            ).then(selection => {
                if (selection === 'View PR' && prUrl) {
                    vscode.env.openExternal(vscode.Uri.parse(prUrl));
                }
            });
        });

    } catch (error) {
        vscode.window.showErrorMessage(`Error processing issue: ${error}`);
    }
}

async function approveAndUpdateJira() {
    try {
        const currentBranch = await gitService.getCurrentBranch();
        const issueKey = gitService.extractIssueKeyFromBranch(currentBranch);
        
        if (!issueKey) {
            vscode.window.showWarningMessage('No Jira issue found for current branch.');
            return;
        }

        // Update Jira issue status
        await jiraService.updateIssueStatus(issueKey, 'In Review');
        
        vscode.window.showInformationMessage(`Updated ${issueKey} status to 'In Review'`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error updating Jira: ${error}`);
    }
}

export function deactivate() {}
