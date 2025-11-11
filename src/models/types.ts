export interface JiraIssue {
    key: string;
    summary: string;
    description: string;
    status: string;
    type: string;
    assignee?: string;
}

export interface CodeChange {
    filePath: string;
    content: string;
    operation: 'create' | 'update' | 'delete';
}
