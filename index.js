#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// .envファイルを読み込む（出力を抑制）
const originalLog = console.log;
console.log = () => {};
dotenv.config();
console.log = originalLog;

class RepsonaAPI {
  constructor(config) {
    this.config = config;
  }

  async makeRequest(endpoint, method = 'GET', body) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Repsona API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // タスク関連のメソッド
  async getTasks(projectId, params) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page);
    if (params?.keywords) query.append('keywords', params.keywords);
    if (params?.tags) query.append('tags', params.tags);
    if (params?.statuses) query.append('statuses', params.statuses);
    if (params?.milestones) query.append('milestones', params.milestones);
    if (params?.priorities) query.append('priorities', params.priorities);
    if (params?.responsible_users) query.append('responsible_users', params.responsible_users);
    if (params?.ball_holding_users) query.append('ball_holding_users', params.ball_holding_users);
    if (params?.due_date_gte) query.append('due_date_gte', params.due_date_gte);
    if (params?.due_date_lte) query.append('due_date_lte', params.due_date_lte);
    if (params?.is_expired !== undefined) query.append('is_expired', params.is_expired.toString());
    if (params?.is_closed !== undefined) query.append('is_closed', params.is_closed.toString());
    
    const endpoint = `/project/${projectId}/task${query.toString() ? '?' + query.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  async getTask(projectId, taskId) {
    return this.makeRequest(`/projects/${projectId}/task/${taskId}`);
  }

  async createTask(projectId, task) {
    return this.makeRequest(`/project/${projectId}/task`, 'POST', task);
  }

  async updateTask(projectId, taskId, updates) {
    return this.makeRequest(`/project/${projectId}/task/${taskId}`, 'PATCH', updates);
  }

  async deleteTask(projectId, taskId) {
    return this.makeRequest(`/project/${projectId}/task/${taskId}`, 'DELETE');
  }

  async getTaskComments(projectId, taskId) {
    return this.makeRequest(`/project/${projectId}/task/${taskId}/comment/in_tree`);
  }

  async createTaskComment(projectId, taskId, comment) {
    return this.makeRequest(`/project/${projectId}/task/${taskId}/task_comment`, 'POST', comment);
  }

  async updateTaskComment(projectId, taskCommentId, comment) {
    return this.makeRequest(`/project/${projectId}/task_comment/${taskCommentId}`, 'PATCH', comment);
  }

  async deleteTaskComment(projectId, taskCommentId) {
    return this.makeRequest(`/project/${projectId}/task_comment/${taskCommentId}`, 'DELETE');
  }

  async getTaskActivityLog(projectId, taskId, params) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    
    const endpoint = `/activity/project/${projectId}/Task/${taskId}${query.toString() ? '?' + query.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  async getTaskHistory(projectId, taskId) {
    return this.makeRequest(`/history/project/${projectId}/Task/${taskId}`);
  }

  async getTaskSubtasks(projectId, taskId) {
    return this.makeRequest(`/project/${projectId}/task/${taskId}/children`);
  }

  // ノート関連のメソッド

  async getProjectNotes(projectId) {
    return this.makeRequest(`/project/${projectId}/note`);
  }

  async getProjectNote(projectId, noteId) {
    return this.makeRequest(`/project/${projectId}/note/${noteId}`);
  }

  async createProjectNote(projectId, note) {
    return this.makeRequest(`/project/${projectId}/note`, 'POST', note);
  }

  async updateProjectNote(projectId, noteId, updates) {
    return this.makeRequest(`/project/${projectId}/note/${noteId}`, 'PATCH', updates);
  }

  async deleteProjectNote(projectId, noteId) {
    return this.makeRequest(`/project/${projectId}/note/${noteId}`, 'DELETE');
  }

  async getProjectNoteChildren(projectId, noteId) {
    return this.makeRequest(`/project/${projectId}/note/${noteId}/children`);
  }

  async getProjectNoteComments(projectId, noteId) {
    return this.makeRequest(`/project/${projectId}/note/${noteId}/comment/in_tree`);
  }

  async createProjectNoteComment(projectId, noteId, comment) {
    return this.makeRequest(`/project/${projectId}/note/${noteId}/note_comment`, 'POST', comment);
  }

  async updateProjectNoteComment(projectId, noteCommentId, comment) {
    return this.makeRequest(`/project/${projectId}/note_comment/${noteCommentId}`, 'PATCH', comment);
  }

  async deleteProjectNoteComment(projectId, noteCommentId) {
    return this.makeRequest(`/project/${projectId}/note_comment/${noteCommentId}`, 'DELETE');
  }

  async getProjectNoteActivityLog(projectId, noteId, params) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    
    const endpoint = `/activity/project/${projectId}/Note/${noteId}${query.toString() ? '?' + query.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  async getProjectNoteHistory(projectId, noteId) {
    return this.makeRequest(`/history/project/${projectId}/Note/${noteId}`);
  }

  // ファイル関連のメソッド
  async downloadFile(hash) {
    return this.makeRequest(`/file/${hash}/download`);
  }

  async uploadFile(projectId, fileData) {
    return this.makeRequest(`/project/${projectId}/file`, 'POST', fileData);
  }

  async attachFile(projectId, model, modelId, fileId) {
    return this.makeRequest(`/project/${projectId}/${model}/${modelId}/files/${fileId}`, 'PUT');
  }

  async detachFile(projectId, model, modelId, fileId) {
    return this.makeRequest(`/project/${projectId}/${model}/${modelId}/files/${fileId}`, 'DELETE');
  }

  async deleteFile(hash) {
    return this.makeRequest(`/file/${hash}`, 'DELETE');
  }

  // メンバー関連のメソッド
  async getMe() {
    return this.makeRequest('/me');
  }

  async updateMe(updates) {
    return this.makeRequest('/me', 'PATCH', updates);
  }

  async getMyTasks(type) {
    return this.makeRequest(`/me/task/${type}`);
  }

  async getMyTasksCount(type) {
    return this.makeRequest(`/me/task/${type}/count`);
  }

  async getMyProjects() {
    return this.makeRequest('/me/project');
  }

  async getFeed(params) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    
    const endpoint = `/feed${query.toString() ? '?' + query.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  // 受信トレイ関連のメソッド

  async getInbox(status) {
    return this.makeRequest(`/inbox/${status}`);
  }

  async updateInbox(id, status) {
    const query = new URLSearchParams();
    query.append('status', status);
    
    const endpoint = `/inbox/${id}?${query.toString()}`;
    return this.makeRequest(endpoint, 'PATCH');
  }

  async archiveAllInbox() {
    return this.makeRequest('/inbox/archive_all', 'POST');
  }

  async getInboxUnreadCount() {
    return this.makeRequest('/inbox/unread_count');
  }

  //自分関連のメソッド

  async getMembers() {
    return this.makeRequest('/me');
  }

  async getMember(memberId) {
    return this.makeRequest(`/me`);
  }

  async updateUserRole(userId, role) {
    return this.makeRequest(`/user/${userId}/role`, 'PATCH', { role });
  }

  // スペース関連のメソッド
  async getSpaceInfo() {
    return this.makeRequest('/space/base');
  }

  async inviteToSpace(inviteData) {
    return this.makeRequest('/space/invite', 'POST', inviteData);
  }

  async getAllTags() {
    return this.makeRequest('/tag/all');
  }

  // プロジェクト関連のメソッド
  async getProjects() {
    return this.makeRequest('/me/project');
  }

  async getProject(projectId) {
    return this.makeRequest(`/project/${projectId}`);
  }

  async createProject(project) {
    return this.makeRequest('/project', 'POST', project);
  }

  async updateProject(projectId, updates) {
    return this.makeRequest(`/project/${projectId}`, 'PATCH', updates);
  }

  async getProjectUsers(projectId) {
    return this.makeRequest(`/project/${projectId}/users`);
  }

  async getProjectActivity(projectId, params) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    
    const endpoint = `/activity/project/${projectId}${query.toString() ? '?' + query.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  async getProjectStatuses(projectId) {
    return this.makeRequest(`/project/${projectId}/status`);
  }

  async getProjectMilestones(projectId) {
    return this.makeRequest(`/project/${projectId}/milestone`);
  }
}

class RepsonaMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'repsona-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // 環境変数から設定を読み込み
    const spaceId = process.env.REPSONA_SPACE_ID;
    const apiKey = process.env.REPSONA_API_KEY;

    if (!spaceId || !apiKey) {
      throw new Error('REPSONA_SPACE_ID and REPSONA_API_KEY environment variables are required');
    }

    this.repsonaAPI = new RepsonaAPI({
      spaceId,
      apiKey,
      baseUrl: `https://${spaceId}.repsona.com/api`,
    });

    this.setupHandlers();
  }

  setupHandlers() {
    // ツールの一覧を返す
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_tasks',
            description: 'Repsonaからタスクの一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                page: { type: 'string', description: '一覧の開始ページ' },
                keywords: { type: 'string', description: 'キーワード' },
                tags: { type: 'string', description: 'タグID' },
                statuses: { type: 'string', description: 'ステータスID' },
                milestones: { type: 'string', description: 'マイルストーンID' },
                priorities: { type: 'string', description: '優先度' },
                responsible_users: { type: 'string', description: '担当者のユーザーID' },
                ball_holding_users: { type: 'string', description: 'ボール保持者のユーザーID' },
                due_date_gte: { type: 'string', description: '期限の開始日' },
                due_date_lte: { type: 'string', description: '期限の終了日' },
                is_expired: { type: 'boolean', description: '期限切れを表示する' },
                is_closed: { type: 'boolean', description: '完了済み表示する' },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'get_task',
            description: '特定のタスクの詳細を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                taskId: { type: 'string', description: 'タスクID' },
              },
              required: ['projectId', 'taskId'],
            },
          },
          {
            name: 'create_task',
            description: '新しいタスクを作成します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                name: { type: 'string', description: 'タスク名' },
                description: { type: 'string', description: '内容' },
                startDate: { type: 'number', description: '開始日時' },
                dueDate: { type: 'number', description: '期限' },
                status: { type: 'number', description: 'ステータスID' },
                tags: { type: 'array', items: { type: 'number' }, description: 'タグID' },
                priority: { type: 'number', enum: [1, 2, 3], description: '優先度' },
                milestone: { type: 'number', description: 'マイルストーンID' },
                parent: { type: 'number', description: '親タスクID' },
                addToBottom: { type: 'boolean', description: '一番下に追加するかどうか' },
                responsibleUser: { type: 'number', description: '担当者' },
                ballHoldingUser: { type: 'number', description: 'ボール保持者' },
              },
              required: ['projectId', 'name'],
            },
          },
          {
            name: 'update_task',
            description: 'タスクを更新します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                taskId: { type: 'string', description: 'タスクID' },
                name: { type: 'string', description: 'タスク名' },
                description: { type: 'string', description: '内容' },
                startDate: { type: 'number', description: '開始日時' },
                dueDate: { type: 'number', description: '期限' },
                status: { type: 'number', description: 'ステータスID' },
                tags: { type: 'array', items: { type: 'number' }, description: 'タグID' },
                priority: { type: 'number', enum: [1, 2, 3], description: '優先度' },
                milestone: { type: 'number', description: 'マイルストーンID' },
                parent: { type: 'number', description: '親タスクID' },
                responsibleUser: { type: 'number', description: '担当者' },
                ballHoldingUser: { type: 'number', description: 'ボール保持者' },
              },
              required: ['projectId', 'taskId'],
            },
          },
          {
            name: 'delete_task',
            description: 'タスクを削除します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                taskId: { type: 'string', description: 'タスクID' },
              },
              required: ['projectId', 'taskId'],
            },
          },
          {
            name: 'get_project_notes',
            description: '指定したプロジェクト内のノート一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'get_project_note',
            description: '指定したプロジェクト内の特定のノートの詳細を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                noteId: { type: 'string', description: 'ノートID' },
              },
              required: ['projectId', 'noteId'],
            },
          },
          {
            name: 'create_project_note',
            description: '指定したプロジェクト内にノートを作成します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                name: { type: 'string', description: 'ノート名' },
                description: { type: 'string', description: 'ノートの内容' },
                tags: { type: 'array', items: { type: 'number' }, description: 'タグID' },
                parent: { type: 'number', description: '親ノートID' },
                addToBottom: { type: 'boolean', description: '一番下に追加するかどうか' },
              },
              required: ['projectId', 'name'],
            },
          },
          {
            name: 'update_project_note',
            description: '指定したプロジェクト内のノートを更新します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                noteId: { type: 'string', description: 'ノートID' },
                name: { type: 'string', description: 'ノート名' },
                description: { type: 'string', description: 'ノートの内容' },
                tags: { type: 'array', items: { type: 'number' }, description: 'タグID' },
                parent: { type: 'number', description: '親ノートID' },
              },
              required: ['projectId', 'noteId'],
            },
          },
          {
            name: 'delete_project_note',
            description: '指定したプロジェクト内のノートを削除します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                noteId: { type: 'string', description: 'ノートID' },
              },
              required: ['projectId', 'noteId'],
            },
          },
          {
            name: 'get_project_note_children',
            description: '指定したプロジェクト内のノートのサブノート一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                noteId: { type: 'string', description: 'ノートID' },
              },
              required: ['projectId', 'noteId'],
            },
          },
          {
            name: 'get_project_note_comments',
            description: '指定したプロジェクト内のノートのコメント一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                noteId: { type: 'string', description: 'ノートID' },
              },
              required: ['projectId', 'noteId'],
            },
          },
          {
            name: 'create_project_note_comment',
            description: '指定したプロジェクト内のノートにコメントを投稿します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                noteId: { type: 'string', description: 'ノートID' },
                comment: { type: 'string', description: 'コメント内容' },
                parent: { type: 'number', description: '返信先コメントID' },
              },
              required: ['projectId', 'noteId', 'comment'],
            },
          },
          {
            name: 'update_project_note_comment',
            description: '指定したプロジェクト内のノートのコメントを更新します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                noteCommentId: { type: 'string', description: 'コメントID' },
                comment: { type: 'string', description: 'コメント内容' },
              },
              required: ['projectId', 'noteCommentId', 'comment'],
            },
          },
          {
            name: 'delete_project_note_comment',
            description: '指定したプロジェクト内のノートのコメントを削除します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                noteCommentId: { type: 'string', description: 'コメントID' },
              },
              required: ['projectId', 'noteCommentId'],
            },
          },
          {
            name: 'get_project_note_activity_log',
            description: '指定したプロジェクト内のノートのアクティビティログを取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                noteId: { type: 'string', description: 'ノートID' },
                page: { type: 'number', description: 'ページ番号（1が最初）' },
              },
              required: ['projectId', 'noteId'],
            },
          },
          {
            name: 'get_project_note_history',
            description: '指定したプロジェクト内のノートの履歴を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                noteId: { type: 'string', description: 'ノートID' },
              },
              required: ['projectId', 'noteId'],
            },
          },
          {
            name: 'download_file',
            description: '指定したファイルハッシュでファイルをダウンロードします',
            inputSchema: {
              type: 'object',
              properties: {
                hash: { type: 'string', description: 'ファイルハッシュ' },
              },
              required: ['hash'],
            },
          },
          {
            name: 'upload_file',
            description: '指定したプロジェクトにファイルをアップロードします',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                fileData: { type: 'object', description: 'ファイルデータ（multipart/form-data形式）' },
              },
              required: ['projectId', 'fileData'],
            },
          },
          {
            name: 'attach_file',
            description: '指定したファイルをタスクやノートに添付します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                model: { 
                  type: 'string', 
                  enum: ['task', 'task_comment', 'note', 'note_comment'],
                  description: 'タスク、タスクコメント、ノート、ノートコメント' 
                },
                modelId: { type: 'string', description: 'タスクID、タスクコメントID、ノートID、ノートコメントID' },
                fileId: { type: 'string', description: 'ファイルID' },
              },
              required: ['projectId', 'model', 'modelId', 'fileId'],
            },
          },
          {
            name: 'detach_file',
            description: '指定したファイルをタスクやノートから添付を外します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                model: { 
                  type: 'string', 
                  enum: ['task', 'task_comment', 'note', 'note_comment'],
                  description: 'タスク、タスクコメント、ノート、ノートコメント' 
                },
                modelId: { type: 'string', description: 'タスクID、タスクコメントID、ノートID、ノートコメントID' },
                fileId: { type: 'string', description: 'ファイルID' },
              },
              required: ['projectId', 'model', 'modelId', 'fileId'],
            },
          },
          {
            name: 'delete_file',
            description: '指定したファイルハッシュでファイルを削除します（アップロードしたユーザーのみ）',
            inputSchema: {
              type: 'object',
              properties: {
                hash: { type: 'string', description: 'ファイルハッシュ' },
              },
              required: ['hash'],
            },
          },
          {
            name: 'update_user_role',
            description: '指定したユーザーのロールを更新します（Owner/Admin権限が必要）',
            inputSchema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'ユーザーID' },
                role: { 
                  type: 'string', 
                  enum: ['owner', 'admin', 'member', 'no-login'],
                  description: 'ロール（owner: オーナー、admin: 管理者、member: メンバー、no-login: ログイン不可）' 
                },
              },
              required: ['userId', 'role'],
            },
          },
          {
            name: 'invite_to_space',
            description: '新しいメンバーをスペースに招待します（Owner/Admin権限が必要）',
            inputSchema: {
              type: 'object',
              properties: {
                email: { type: 'string', description: 'メールアドレス' },
                name: { type: 'string', description: '名前' },
                fullName: { type: 'string', description: 'フルネーム' },
                projects: { type: 'array', items: { type: 'string' }, description: 'プロジェクトID' },
              },
              required: ['email', 'name'],
            },
          },
          {
            name: 'get_me',
            description: '自分の情報を取得します',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'update_me',
            description: '自分の情報を更新します',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: '名前' },
                fullName: { type: 'string', description: 'フルネーム' },
                whatAreYouDoing: { type: 'string', description: '何をやっていますか？' },
              },
            },
          },
          {
            name: 'get_my_tasks',
            description: '指定したタイプの自分のタスクを取得します',
            inputSchema: {
              type: 'object',
              properties: {
                type: { 
                  type: 'string', 
                  enum: ['responsible', 'ballHolding', 'following'],
                  description: 'タイプ。responsible（担当）、ballHolding（ボール保持）、following（フォロー中）を指定できます。' 
                },
              },
              required: ['type'],
            },
          },
          {
            name: 'get_my_tasks_count',
            description: '指定したタイプの自分のタスク数を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                type: { 
                  type: 'string', 
                  enum: ['responsible', 'ballHolding', 'following'],
                  description: 'タイプ。responsible（担当）、ballHolding（ボール保持）、following（フォロー中）を指定できます。' 
                },
              },
              required: ['type'],
            },
          },
          {
            name: 'get_my_projects',
            description: '参加しているプロジェクトを取得します',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_feed',
            description: '自分のアクティビティフィードを取得します',
            inputSchema: {
              type: 'object',
              properties: {
                page: { type: 'number', description: 'ページ番号（1が最初）' },
              },
            },
          },
          {
            name: 'get_members',
            description: 'メンバーの一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_projects',
            description: 'プロジェクトの一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_project',
            description: '指定したプロジェクトの詳細情報を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'create_project',
            description: '新しいプロジェクトを作成します',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'プロジェクト名' },
                fullName: { type: 'string', description: '正式名称' },
                purpose: { type: 'string', description: 'プロジェクトの目的' },
              },
              required: ['name'],
            },
          },
          {
            name: 'update_project',
            description: '指定したプロジェクトを更新します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                name: { type: 'string', description: 'プロジェクト名' },
                fullName: { type: 'string', description: '正式名称' },
                purpose: { type: 'string', description: 'プロジェクトの目的' },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'get_project_users',
            description: '指定したプロジェクトに参加しているユーザーを取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'get_project_activity',
            description: '指定したプロジェクトのアクティビティを取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                page: { type: 'number', description: 'ページ番号（1が最初）' },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'get_project_statuses',
            description: '指定したプロジェクトのステータス一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'get_project_milestones',
            description: '指定したプロジェクトのマイルストーン一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'get_space_info',
            description: 'スペースの情報を取得します',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_all_tags',
            description: '全てのタグ一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_inbox',
            description: '自分の受信トレイを取得します',
            inputSchema: {
              type: 'object',
              properties: {
                status: { 
                  type: 'string', 
                  description: 'ステータス（例: all, unread, read）' 
                },
              },
              required: ['status'],
            },
          },
          {
            name: 'update_inbox',
            description: '受信トレイの未読・既読を更新します',
            inputSchema: {
              type: 'object',
              properties: {
                id: { 
                  type: 'string', 
                  description: '受信トレイID' 
                },
                status: { 
                  type: 'string', 
                  enum: ['unread', 'archived'],
                  description: 'ステータス（unread: 未読、archived: 既読）' 
                },
              },
              required: ['id', 'status'],
            },
          },
          {
            name: 'archive_all_inbox',
            description: '受信トレイを一括既読にします',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_inbox_unread_count',
            description: '受信トレイの未読件数を取得します',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_task_comments',
            description: '指定したタスクのコメント一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                taskId: { type: 'string', description: 'タスクID' },
              },
              required: ['projectId', 'taskId'],
            },
          },
          {
            name: 'create_task_comment',
            description: '指定したタスクにコメントを投稿します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                taskId: { type: 'string', description: 'タスクID' },
                comment: { type: 'string', description: 'コメント内容' },
                parent: { type: 'number', description: '親コメントID（返信の場合）' },
              },
              required: ['projectId', 'taskId', 'comment'],
            },
          },
          {
            name: 'update_task_comment',
            description: '指定したタスクのコメントを更新します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                taskCommentId: { type: 'string', description: 'コメントID' },
                comment: { type: 'string', description: 'コメント内容' },
              },
              required: ['projectId', 'taskCommentId', 'comment'],
            },
          },
          {
            name: 'delete_task_comment',
            description: '指定したタスクのコメントを削除します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                taskCommentId: { type: 'string', description: 'コメントID' },
              },
              required: ['projectId', 'taskCommentId'],
            },
          },
          {
            name: 'get_task_activity_log',
            description: '指定したタスクのアクティビティログを取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                taskId: { type: 'string', description: 'タスクID' },
                page: { type: 'number', description: 'ページ番号（1が最初）' },
              },
              required: ['projectId', 'taskId'],
            },
          },
          {
            name: 'get_task_history',
            description: '指定したタスクの履歴を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                taskId: { type: 'string', description: 'タスクID' },
              },
              required: ['projectId', 'taskId'],
            },
          },
          {
            name: 'get_task_subtasks',
            description: '指定したタスクのサブタスク一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'プロジェクトID' },
                taskId: { type: 'string', description: 'タスクID' },
              },
              required: ['projectId', 'taskId'],
            },
          },
        ],
      };
    });

    // ツールの実行
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_tasks':
            const { projectId, ...taskParams } = args;
            const tasks = await this.repsonaAPI.getTasks(projectId, taskParams);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(tasks, null, 2),
                },
              ],
            };

          case 'get_task':
            const task = await this.repsonaAPI.getTask(args.projectId, args.taskId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(task, null, 2),
                },
              ],
            };

          case 'create_task':
            const { projectId: createProjectId, ...taskData } = args;
            const newTask = await this.repsonaAPI.createTask(createProjectId, taskData);
            return {
              content: [
                {
                  type: 'text',
                  text: `タスクが作成されました: ${JSON.stringify(newTask, null, 2)}`,
                },
              ],
            };

          case 'update_task':
            const { projectId: updateProjectId, taskId: updateTaskId, ...updates } = args;
            const updatedTask = await this.repsonaAPI.updateTask(updateProjectId, updateTaskId, updates);
            return {
              content: [
                {
                  type: 'text',
                  text: `タスクが更新されました: ${JSON.stringify(updatedTask, null, 2)}`,
                },
              ],
            };
            
          case 'delete_task':
            await this.repsonaAPI.deleteTask(args.projectId, args.taskId);
            return {
              content: [
                {
                  type: 'text',
                  text: `タスクID ${args.taskId} が削除されました`,
                },
              ],
            };

          case 'get_project_notes':
            const projectNotes = await this.repsonaAPI.getProjectNotes(args.projectId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projectNotes, null, 2),
                },
              ],
            };

          case 'get_project_note':
            const projectNote = await this.repsonaAPI.getProjectNote(args.projectId, args.noteId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projectNote, null, 2),
                },
              ],
            };

          case 'create_project_note':
            const { projectId: createProjectNoteId, ...noteData } = args;
            const newProjectNote = await this.repsonaAPI.createProjectNote(createProjectNoteId, noteData);
            return {
              content: [
                {
                  type: 'text',
                  text: `プロジェクト内にノートが作成されました: ${JSON.stringify(newProjectNote, null, 2)}`,
                },
              ],
            };

          case 'update_project_note':
            const { projectId: updateProjectNoteId, noteId: updateNoteId, ...projectNoteUpdates } = args;
            const updatedProjectNote = await this.repsonaAPI.updateProjectNote(updateProjectNoteId, updateNoteId, projectNoteUpdates);
            return {
              content: [
                {
                  type: 'text',
                  text: `プロジェクト内のノートが更新されました: ${JSON.stringify(updatedProjectNote, null, 2)}`,
                },
              ],
            };

          case 'delete_project_note':
            await this.repsonaAPI.deleteProjectNote(args.projectId, args.noteId);
            return {
              content: [
                {
                  type: 'text',
                  text: `プロジェクト内のノートID ${args.noteId} が削除されました`,
                },
              ],
            };

          case 'get_project_note_children':
            const projectNoteChildren = await this.repsonaAPI.getProjectNoteChildren(args.projectId, args.noteId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projectNoteChildren, null, 2),
                },
              ],
            };

          case 'get_project_note_comments':
            const projectNoteComments = await this.repsonaAPI.getProjectNoteComments(args.projectId, args.noteId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projectNoteComments, null, 2),
                },
              ],
            };

          case 'create_project_note_comment':
            const { projectId: commentProjectId, noteId: commentNoteId, ...commentData } = args;
            const newNoteComment = await this.repsonaAPI.createProjectNoteComment(commentProjectId, commentNoteId, commentData);
            return {
              content: [
                {
                  type: 'text',
                  text: `プロジェクト内のノートにコメントが投稿されました: ${JSON.stringify(newNoteComment, null, 2)}`,
                },
              ],
            };

          case 'update_project_note_comment':
            const { projectId: updateCommentProjectId, noteCommentId, ...updateCommentData } = args;
            const updatedNoteComment = await this.repsonaAPI.updateProjectNoteComment(updateCommentProjectId, noteCommentId, updateCommentData);
            return {
              content: [
                {
                  type: 'text',
                  text: `プロジェクト内のノートのコメントが更新されました: ${JSON.stringify(updatedNoteComment, null, 2)}`,
                },
              ],
            };

          case 'delete_project_note_comment':
            await this.repsonaAPI.deleteProjectNoteComment(args.projectId, args.noteCommentId);
            return {
              content: [
                {
                  type: 'text',
                  text: `プロジェクト内のノートのコメントID ${args.noteCommentId} が削除されました`,
                },
              ],
            };

          case 'get_project_note_activity_log':
            const { projectId: logProjectId, noteId: logNoteId, ...logParams } = args;
            const noteActivityLog = await this.repsonaAPI.getProjectNoteActivityLog(logProjectId, logNoteId, logParams);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(noteActivityLog, null, 2),
                },
              ],
            };

          case 'get_project_note_history':
            const noteHistory = await this.repsonaAPI.getProjectNoteHistory(args.projectId, args.noteId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(noteHistory, null, 2),
                },
              ],
            };

          case 'download_file':
            const fileData = await this.repsonaAPI.downloadFile(args.hash);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(fileData, null, 2),
                },
              ],
            };

          case 'upload_file':
            const uploadResult = await this.repsonaAPI.uploadFile(args.projectId, args.fileData);
            return {
              content: [
                {
                  type: 'text',
                  text: `ファイルがアップロードされました: ${JSON.stringify(uploadResult, null, 2)}`,
                },
              ],
            };

          case 'attach_file':
            const attachResult = await this.repsonaAPI.attachFile(args.projectId, args.model, args.modelId, args.fileId);
            return {
              content: [
                {
                  type: 'text',
                  text: `ファイルが添付されました: ${JSON.stringify(attachResult, null, 2)}`,
                },
              ],
            };

          case 'detach_file':
            const detachResult = await this.repsonaAPI.detachFile(args.projectId, args.model, args.modelId, args.fileId);
            return {
              content: [
                {
                  type: 'text',
                  text: `ファイルの添付が外されました: ${JSON.stringify(detachResult, null, 2)}`,
                },
              ],
            };

          case 'delete_file':
            const deleteResult = await this.repsonaAPI.deleteFile(args.hash);
            return {
              content: [
                {
                  type: 'text',
                  text: `ファイルが削除されました: ${JSON.stringify(deleteResult, null, 2)}`,
                },
              ],
            };

          case 'update_user_role':
            const roleUpdateResult = await this.repsonaAPI.updateUserRole(args.userId, args.role);
            return {
              content: [
                {
                  type: 'text',
                  text: `ユーザーのロールが更新されました: ${JSON.stringify(roleUpdateResult, null, 2)}`,
                },
              ],
            };

          case 'invite_to_space':
            const inviteResult = await this.repsonaAPI.inviteToSpace(args);
            return {
              content: [
                {
                  type: 'text',
                  text: `新しいメンバーが招待されました: ${JSON.stringify(inviteResult, null, 2)}`,
                },
              ],
            };

          case 'get_me':
            const me = await this.repsonaAPI.getMe();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(me, null, 2),
                },
              ],
            };

          case 'update_me':
            const updatedMe = await this.repsonaAPI.updateMe(args);
            return {
              content: [
                {
                  type: 'text',
                  text: `自分の情報が更新されました: ${JSON.stringify(updatedMe, null, 2)}`,
                },
              ],
            };

          case 'get_my_tasks':
            const myTasks = await this.repsonaAPI.getMyTasks(args.type);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(myTasks, null, 2),
                },
              ],
            };

          case 'get_my_tasks_count':
            const myTasksCount = await this.repsonaAPI.getMyTasksCount(args.type);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(myTasksCount, null, 2),
                },
              ],
            };

          case 'get_my_projects':
            const myProjects = await this.repsonaAPI.getMyProjects();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(myProjects, null, 2),
                },
              ],
            };

          case 'get_feed':
            const feed = await this.repsonaAPI.getFeed(args);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(feed, null, 2),
                },
              ],
            };

          case 'get_members':
            const members = await this.repsonaAPI.getMembers();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(members, null, 2),
                },
              ],
            };

          case 'get_projects':
            const projects = await this.repsonaAPI.getProjects();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projects, null, 2),
                },
              ],
            };

          case 'get_project':
            const project = await this.repsonaAPI.getProject(args.projectId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(project, null, 2),
                },
              ],
            };

          case 'create_project':
            const newProject = await this.repsonaAPI.createProject(args);
            return {
              content: [
                {
                  type: 'text',
                  text: `プロジェクトが作成されました: ${JSON.stringify(newProject, null, 2)}`,
                },
              ],
            };

          case 'update_project':
            const { projectId: projectUpdateId, ...projectUpdates } = args;
            const updatedProject = await this.repsonaAPI.updateProject(projectUpdateId, projectUpdates);
            return {
              content: [
                {
                  type: 'text',
                  text: `プロジェクトが更新されました: ${JSON.stringify(updatedProject, null, 2)}`,
                },
              ],
            };

          case 'get_project_users':
            const projectUsers = await this.repsonaAPI.getProjectUsers(args.projectId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projectUsers, null, 2),
                },
              ],
            };

          case 'get_project_activity':
            const { projectId: activityProjectId, ...activityParams } = args;
            const projectActivity = await this.repsonaAPI.getProjectActivity(activityProjectId, activityParams);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projectActivity, null, 2),
                },
              ],
            };

          case 'get_project_statuses':
            const projectStatuses = await this.repsonaAPI.getProjectStatuses(args.projectId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projectStatuses, null, 2),
                },
              ],
            };

          case 'get_project_milestones':
            const projectMilestones = await this.repsonaAPI.getProjectMilestones(args.projectId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projectMilestones, null, 2),
                },
              ],
            };

          case 'get_space_info':
            const spaceInfo = await this.repsonaAPI.getSpaceInfo();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(spaceInfo, null, 2),
                },
              ],
            };

          case 'get_all_tags':
            const allTags = await this.repsonaAPI.getAllTags();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(allTags, null, 2),
                },
              ],
            };

          case 'get_inbox':
            const inbox = await this.repsonaAPI.getInbox(args.status);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(inbox, null, 2),
                },
              ],
            };

          case 'update_inbox':
            const updatedInbox = await this.repsonaAPI.updateInbox(args.id, args.status);
            return {
              content: [
                {
                  type: 'text',
                  text: `受信トレイが更新されました: ${JSON.stringify(updatedInbox, null, 2)}`,
                },
              ],
            };

          case 'archive_all_inbox':
            const archiveResult = await this.repsonaAPI.archiveAllInbox();
            return {
              content: [
                {
                  type: 'text',
                  text: `受信トレイを一括既読にしました: ${JSON.stringify(archiveResult, null, 2)}`,
                },
              ],
            };

          case 'get_inbox_unread_count':
            const unreadCount = await this.repsonaAPI.getInboxUnreadCount();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(unreadCount, null, 2),
                },
              ],
            };

          case 'get_task_comments':
            const taskComments = await this.repsonaAPI.getTaskComments(args.projectId, args.taskId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(taskComments, null, 2),
                },
              ],
            };

          case 'create_task_comment':
            const { projectId: taskCommentProjectId, taskId: commentTaskId, ...taskCommentData } = args;
            const newComment = await this.repsonaAPI.createTaskComment(taskCommentProjectId, commentTaskId, taskCommentData);
            return {
              content: [
                {
                  type: 'text',
                  text: `タスクコメントが投稿されました: ${JSON.stringify(newComment, null, 2)}`,
                },
              ],
            };

          case 'update_task_comment':
            const { projectId: commentUpdateProjectId, taskCommentId, ...taskCommentUpdateData } = args;
            const updatedComment = await this.repsonaAPI.updateTaskComment(commentUpdateProjectId, taskCommentId, taskCommentUpdateData);
            return {
              content: [
                {
                  type: 'text',
                  text: `タスクコメントが更新されました: ${JSON.stringify(updatedComment, null, 2)}`,
                },
              ],
            };

          case 'delete_task_comment':
            await this.repsonaAPI.deleteTaskComment(args.projectId, args.taskCommentId);
            return {
              content: [
                {
                  type: 'text',
                  text: `タスクコメントID ${args.taskCommentId} が削除されました`,
                },
              ],
            };

          case 'get_task_activity_log':
            const { projectId: taskLogProjectId, taskId: logTaskId, ...taskLogParams } = args;
            const activityLog = await this.repsonaAPI.getTaskActivityLog(taskLogProjectId, logTaskId, taskLogParams);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(activityLog, null, 2),
                },
              ],
            };

          case 'get_task_history':
            const taskHistory = await this.repsonaAPI.getTaskHistory(args.projectId, args.taskId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(taskHistory, null, 2),
                },
              ],
            };

          case 'get_task_subtasks':
            const subtasks = await this.repsonaAPI.getTaskSubtasks(args.projectId, args.taskId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(subtasks, null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `エラーが発生しました: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });

    // リソースの一覧を返す
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'repsona://me',
            mimeType: 'application/json',
            name: 'Repsona自分の情報',
            description: 'Repsonaの自分の情報',
          },
          {
            uri: 'repsona://projects',
            mimeType: 'application/json',
            name: 'Repsonaプロジェクト',
            description: 'Repsonaのプロジェクト一覧',
          },
          {
            uri: 'repsona://space',
            mimeType: 'application/json',
            name: 'Repsonaスペース情報',
            description: 'Repsonaのスペース情報',
          },
          {
            uri: 'repsona://tags',
            mimeType: 'application/json',
            name: 'Repsonaタグ一覧',
            description: 'Repsonaの全てのタグ一覧',
          },
          {
            uri: 'repsona://inbox-unread-count',
            mimeType: 'application/json',
            name: 'Repsona受信トレイ未読件数',
            description: 'Repsonaの受信トレイの未読件数',
          },
        ],
      };
    });

    // リソースの読み込み
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case 'repsona://me':
            const me = await this.repsonaAPI.getMe();
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(me, null, 2),
                },
              ],
            };

          case 'repsona://projects':
            const projects = await this.repsonaAPI.getProjects();
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(projects, null, 2),
                },
              ],
            };

          case 'repsona://space':
            const space = await this.repsonaAPI.getSpaceInfo();
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(space, null, 2),
                },
              ],
            };

          case 'repsona://tags':
            const tags = await this.repsonaAPI.getAllTags();
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(tags, null, 2),
                },
              ],
            };

          case 'repsona://inbox-unread-count':
            const inboxUnreadCount = await this.repsonaAPI.getInboxUnreadCount();
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(inboxUnreadCount, null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error) {
        throw new Error(`Failed to read resource ${uri}: ${error.message}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Repsona MCP Server running on stdio');
  }
}

// サーバーの起動
const server = new RepsonaMCPServer();
server.run().catch(console.error);