# Repsona MCP Server

このプロジェクトは、[Repsona](https://repsona.com/)と連携するMCP（Model Context Protocol）サーバーです。

このMCPサーバーは、RepsonaのAPIを介してタスク管理、プロジェクト管理、ユーザー管理などの機能を提供します。Claude DesktopなどのMCP対応アプリケーションと連携して、Repsonaの機能を利用できます。

## 使用例

MCPサーバーを設定後、以下のようなリクエストが可能です：

- "Repsonaで今日のタスクを教えて"
- "Repsonaで新しいタスクを作成して"
- "Repsonaでプロジェクトの一覧を見せて"
- "Repsonaで特定のノートを更新して"
- "Repsonaで受信トレイの未読件数を教えて"
- "Repsonaで受信トレイを一括既読にして"
- "タグ一覧を見せて"

## 設定

### Claude Desktop

Claude Desktop でこのMCPサーバーを使用するには、設定ファイルに以下を追加してください：

#### macOS
`~/Library/Application\ Support/Claude/claude_desktop_config.json`

#### Windows
`%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "repsona": {
      "command": "npx",
      "args": ["@bellx2/repsona-mcp-server"],
      "env": {
        "REPSONA_SPACE_ID": "your_space_id",
        "REPSONA_API_KEY": "your_api_key"
      }
    }
  }
}
```

### VSCode

VSCodeでこのMCPサーバーを使用するには、以下の設定を`settings.json`に追加してください：
```json
{
  "mcpServers": {
    "repsona": {
      "command": "npx",
      "args": ["@bellx2/repsona-mcp-server"],
      "env": {
        "REPSONA_SPACE_ID": "your_space_id",
        "REPSONA_API_KEY": "your_api_key"
      }
    }
  }
}
```

## 利用可能なツール

https://repsona.com/ja/api

### タスク関連
- `get_tasks`: 指定したプロジェクトのタスク一覧を取得
- `get_task`: 特定のタスクの詳細を取得
- `create_task`: 新しいタスクを作成
- `update_task`: タスクを更新
- `delete_task`: タスクを削除
- `get_task_comments`: タスクのコメント一覧を取得
- `create_task_comment`: タスクにコメントを投稿
- `update_task_comment`: タスクのコメントを更新
- `delete_task_comment`: タスクのコメントを削除
- `get_task_activity_log`: タスクのアクティビティログを取得
- `get_task_history`: タスクの履歴を取得
- `get_task_subtasks`: タスクのサブタスク一覧を取得

### プロジェクト関連
- `get_projects`: 参加しているプロジェクトの一覧を取得
- `get_project`: 指定したプロジェクトの詳細情報を取得
- `create_project`: 新しいプロジェクトを作成
- `update_project`: プロジェクトを更新
- `get_project_users`: プロジェクトに参加しているユーザーを取得
- `get_project_activity`: プロジェクトのアクティビティを取得
- `get_project_statuses`: プロジェクトのステータス一覧を取得
- `get_project_milestones`: プロジェクトのマイルストーン一覧を取得

### ユーザー関連
- `get_me`: 自分の情報を取得
- `update_me`: 自分の情報を更新
- `get_my_tasks`: 指定したタイプの自分のタスクを取得
- `get_my_tasks_count`: 指定したタイプの自分のタスク数を取得
- `get_my_projects`: 参加しているプロジェクトを取得
- `get_feed`: 自分のアクティビティフィードを取得

### プロジェクトノート関連
- `get_project_notes`: プロジェクトノートの一覧を取得
- `get_project_note`: 特定のプロジェクトノートの詳細を取得
- `create_project_note`: 新しいプロジェクトノートを作成
- `update_project_note`: プロジェクトノートを更新
- `delete_project_note`: プロジェクトノートを削除
- `get_project_note_children`: プロジェクトノートの子ノート一覧を取得
- `get_project_note_comments`: プロジェクトノートのコメント一覧を取得
- `create_project_note_comment`: プロジェクトノートにコメントを投稿
- `update_project_note_comment`: プロジェクトノートのコメントを更新
- `delete_project_note_comment`: プロジェクトノートのコメントを削除
- `get_project_note_activity_log`: プロジェクトノートのアクティビティログを取得
- `get_project_note_history`: プロジェクトノートの履歴を取得

### タグ関連
- `get_all_tags`: 全てのタグ一覧を取得

### 受信トレイ関連
- `get_inbox`: 自分の受信トレイを取得
- `update_inbox`: 受信トレイの未読・既読を更新
- `archive_all_inbox`: 受信トレイを一括既読にする
- `get_inbox_unread_count`: 受信トレイの未読件数を取得

### ファイル関連
- `upload_file`: ファイルをアップロード
- `download_file`: ファイルをダウンロード
- `attach_file`: ファイルをタスク・コメント・ノートに添付
- `detach_file`: ファイルの添付を解除
- `delete_file`: ファイルを削除

### ユーザー管理
- `update_user_role`: ユーザーのロールを更新
- `invite_to_space`: 新しいメンバーをスペースに招待

### その他
- `get_members`: メンバーの一覧を取得
- `get_space_info`: スペースの情報を取得

## 利用可能なリソース

- `repsona://me`: 自分の情報
- `repsona://projects`: プロジェクト一覧
- `repsona://space`: スペース情報
- `repsona://tags`: タグ一覧
- `repsona://inbox-unread-count`: 受信トレイ未読件数
