import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as util from 'util';

const exec = util.promisify(cp.exec);

export class GitService {
    private workspaceRoot: string;

    constructor() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        this.workspaceRoot = workspaceFolders ? workspaceFolders[0].uri.fsPath : '';
    }

    async createBranch(issueKey: string, issueSummary: string): Promise<string> {
        try {
            // Create a clean branch name from issue key and summary
            const sanitizedSummary = issueSummary
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 50);
            
            const branchName = `${issueKey.toLowerCase()}/${sanitizedSummary}`;

            // Create and checkout the new branch
            await exec(`git checkout -b ${branchName}`, { cwd: this.workspaceRoot });

            vscode.window.showInformationMessage(`Created and checked out branch: ${branchName}`);
            return branchName;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to create branch: ${errorMessage}`);
        }
    }

    async getCurrentBranch(): Promise<string> {
        try {
            const { stdout } = await exec('git rev-parse --abbrev-ref HEAD', { cwd: this.workspaceRoot });
            return stdout.trim();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get current branch: ${errorMessage}`);
        }
    }

    extractIssueKeyFromBranch(branchName: string): string | null {
        // Extract issue key from branch name (e.g., "PROJ-123/feature-name" -> "PROJ-123")
        const match = branchName.match(/^([A-Z]+-\d+)\//);
        return match ? match[1] : null;
    }

    async commitChanges(issueKey: string, issueSummary: string): Promise<void> {
        try {
            // Stage all changes
            await exec('git add .', { cwd: this.workspaceRoot });

            // Check if there are changes to commit
            const { stdout: status } = await exec('git status --porcelain', { cwd: this.workspaceRoot });
            
            if (!status.trim()) {
                vscode.window.showInformationMessage('No changes to commit');
                return;
            }

            // Commit with a meaningful message
            const commitMessage = `${issueKey}: ${issueSummary}`;
            await exec(`git commit -m "${commitMessage}"`, { cwd: this.workspaceRoot });

            vscode.window.showInformationMessage('Changes committed successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to commit changes: ${errorMessage}`);
        }
    }

    async pushBranch(): Promise<void> {
        try {
            const currentBranch = await this.getCurrentBranch();
            const config = vscode.workspace.getConfiguration('jiraCopilotBridge');
            const remote = config.get('gitRemote', 'origin');

            await exec(`git push -u ${remote} ${currentBranch}`, { cwd: this.workspaceRoot });

            vscode.window.showInformationMessage(`Pushed branch ${currentBranch} to ${remote}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to push branch: ${errorMessage}`);
        }
    }

    async createPullRequest(issueKey: string, issueSummary: string, issueDescription: string): Promise<string | null> {
        try {
            // Push the branch first
            await this.pushBranch();

            // Try to use GitHub CLI if available
            try {
                const prTitle = `${issueKey}: ${issueSummary}`;
                const prBody = `${issueDescription}\n\nRelated: ${issueKey}`;
                
                const { stdout } = await exec(
                    `gh pr create --title "${prTitle}" --body "${prBody}" --web`,
                    { cwd: this.workspaceRoot }
                );

                // Extract PR URL from output
                const urlMatch = stdout.match(/https:\/\/github\.com\/[^\s]+/);
                return urlMatch ? urlMatch[0] : null;
            } catch (ghError) {
                // If gh CLI is not available, provide manual instructions
                vscode.window.showWarningMessage(
                    'GitHub CLI not found. Please create PR manually.',
                    'Open GitHub'
                ).then(selection => {
                    if (selection === 'Open GitHub') {
                        // Try to get the remote URL and open it
                        exec('git remote get-url origin', { cwd: this.workspaceRoot })
                            .then(({ stdout }) => {
                                const remoteUrl = stdout.trim()
                                    .replace(/\.git$/, '')
                                    .replace(/^git@github\.com:/, 'https://github.com/');
                                vscode.env.openExternal(vscode.Uri.parse(remoteUrl));
                            });
                    }
                });
                return null;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to create pull request: ${errorMessage}`);
        }
    }

    async getRepositoryInfo(): Promise<{ owner: string; repo: string } | null> {
        try {
            const { stdout } = await exec('git remote get-url origin', { cwd: this.workspaceRoot });
            const remoteUrl = stdout.trim();

            // Parse GitHub URL
            const match = remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/);
            if (match) {
                return {
                    owner: match[1],
                    repo: match[2]
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}
