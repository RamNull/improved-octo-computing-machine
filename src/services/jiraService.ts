import * as vscode from 'vscode';
import axios from 'axios';
import { JiraIssue } from '../models/types';

export class JiraService {
    private jiraUrl: string = '';
    private jiraEmail: string = '';
    private jiraApiToken: string = '';
    private jiraProject: string = '';

    constructor() {
        this.loadConfiguration();
        
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('jiraCopilotBridge')) {
                this.loadConfiguration();
            }
        });
    }

    private loadConfiguration() {
        const config = vscode.workspace.getConfiguration('jiraCopilotBridge');
        this.jiraUrl = config.get('jiraUrl', '');
        this.jiraEmail = config.get('jiraEmail', '');
        this.jiraApiToken = config.get('jiraApiToken', '');
        this.jiraProject = config.get('jiraProject', '');
    }

    private validateConfiguration(): boolean {
        if (!this.jiraUrl || !this.jiraEmail || !this.jiraApiToken || !this.jiraProject) {
            vscode.window.showWarningMessage(
                'Please configure Jira settings in VS Code settings.',
                'Open Settings'
            ).then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'jiraCopilotBridge');
                }
            });
            return false;
        }
        return true;
    }

    private getAuthHeader(): string {
        const auth = Buffer.from(`${this.jiraEmail}:${this.jiraApiToken}`).toString('base64');
        return `Basic ${auth}`;
    }

    async getIssues(): Promise<JiraIssue[]> {
        if (!this.validateConfiguration()) {
            return [];
        }

        try {
            const response = await axios.get(
                `${this.jiraUrl}/rest/api/3/search`,
                {
                    headers: {
                        'Authorization': this.getAuthHeader(),
                        'Accept': 'application/json'
                    },
                    params: {
                        jql: `project = ${this.jiraProject} AND status != Done ORDER BY created DESC`,
                        maxResults: 50
                    }
                }
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return response.data.issues.map((issue: any) => ({
                key: issue.key,
                summary: issue.fields.summary,
                description: issue.fields.description || '',
                status: issue.fields.status.name,
                type: issue.fields.issuetype.name,
                assignee: issue.fields.assignee?.displayName
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to fetch Jira issues: ${errorMessage}`);
            return [];
        }
    }

    async getIssue(issueKey: string): Promise<JiraIssue | null> {
        if (!this.validateConfiguration()) {
            return null;
        }

        try {
            const response = await axios.get(
                `${this.jiraUrl}/rest/api/3/issue/${issueKey}`,
                {
                    headers: {
                        'Authorization': this.getAuthHeader(),
                        'Accept': 'application/json'
                    }
                }
            );

            const issue = response.data;
            return {
                key: issue.key,
                summary: issue.fields.summary,
                description: issue.fields.description || '',
                status: issue.fields.status.name,
                type: issue.fields.issuetype.name,
                assignee: issue.fields.assignee?.displayName
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to fetch issue ${issueKey}: ${errorMessage}`);
            return null;
        }
    }

    async updateIssueStatus(issueKey: string, status: string): Promise<boolean> {
        if (!this.validateConfiguration()) {
            return false;
        }

        try {
            // Get available transitions for the issue
            const transitionsResponse = await axios.get(
                `${this.jiraUrl}/rest/api/3/issue/${issueKey}/transitions`,
                {
                    headers: {
                        'Authorization': this.getAuthHeader(),
                        'Accept': 'application/json'
                    }
                }
            );

            const transitions = transitionsResponse.data.transitions;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const targetTransition = transitions.find((t: any) => 
                t.to.name.toLowerCase() === status.toLowerCase()
            );

            if (!targetTransition) {
                vscode.window.showWarningMessage(
                    `Cannot transition to status '${status}' for issue ${issueKey}`
                );
                return false;
            }

            // Perform the transition
            await axios.post(
                `${this.jiraUrl}/rest/api/3/issue/${issueKey}/transitions`,
                {
                    transition: {
                        id: targetTransition.id
                    }
                },
                {
                    headers: {
                        'Authorization': this.getAuthHeader(),
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to update issue status: ${errorMessage}`);
            return false;
        }
    }

    async addComment(issueKey: string, comment: string): Promise<boolean> {
        if (!this.validateConfiguration()) {
            return false;
        }

        try {
            await axios.post(
                `${this.jiraUrl}/rest/api/3/issue/${issueKey}/comment`,
                {
                    body: {
                        type: 'doc',
                        version: 1,
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: comment
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': this.getAuthHeader(),
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to add comment: ${errorMessage}`);
            return false;
        }
    }
}
