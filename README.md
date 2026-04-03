# Jyutjyu MCP Server

[![npm version](https://badge.fury.io/js/jyutjyu-mcp.svg)](https://badge.fury.io/js/jyutjyu-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> MCP server for [Jyutjyu.com](https://jyutjyu.com) | 粵語辭叢 MCP 服務器

**粵語辭叢** 係一個粵語詞典聚合平台，收錄 11 部詞典、超過 26 萬詞條。呢個 MCP server 等你可以喺 Claude Desktop、Cursor 等 AI 工具入面直接查粵語詞典。

## 功能特色

- 🔍 **智能搜尋** — 支援詞頭、粵拼、釋義反查
- 📖 **多詞典支援** — 一次過搜尋 11 部粵語詞典
- 🎯 **精確查詢** — 用 ID 或詞頭獲取完整詞條信息
- 💡 **自動補全** — 詞頭建議功能
- 🎲 **隨機探索** — 發掘新詞彙

## 安裝

### 前置要求

1. 安裝 [jyutjyu-cli](https://github.com/jyutjyucom/jyutjyu-cli):
   ```bash
   pip install jyutjyu-cli
   ```

2. 驗證安裝:
   ```bash
   jyutjyu --help
   ```

### 安裝 MCP Server

**方法一：從 npm 安裝（推薦）**
```bash
npm install -g jyutjyu-mcp
```

**方法二：從源碼安裝**
```bash
git clone https://github.com/jyutjyucom/jyutjyu-mcp.git
cd jyutjyu-mcp
npm install
npm run build
```

## 使用方法

### 配置 Claude Desktop

編輯 Claude Desktop 配置文件：

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

添加以下內容：

```json
{
  "mcpServers": {
    "jyutjyu": {
      "command": "jyutjyu-mcp"
    }
  }
}
```

如果 jyutjyu CLI 唔喺 PATH 入面，可以指定路徑：

```json
{
  "mcpServers": {
    "jyutjyu": {
      "command": "jyutjyu-mcp",
      "env": {
        "JYUTJYU_CLI_PATH": "/path/to/jyutjyu"
      }
    }
  }
}
```

重啟 Claude Desktop 後即可使用。

### 配置 Cursor

編輯 Cursor 設置 (`~/.cursor/mcp.json`)：

```json
{
  "mcpServers": {
    "jyutjyu": {
      "command": "jyutjyu-mcp"
    }
  }
}
```

## 可用工具

| 工具 | 功能 | 參數 |
|------|------|------|
| `search` | 搜尋詞條 | `query`, `mode?`, `dict?`, `limit?` |
| `entry` | 用 ID 獲取詞條 | `entry_id` |
| `suggest` | 詞頭自動補全 | `query`, `limit?` |
| `dictionaries` | 列出所有詞典 | - |
| `word` | 獲取詞頭的所有條目 | `headword`, `dict?` |
| `random` | 隨機詞條 | `count?`, `dict?` |

### 工具詳情

#### search

搜尋粵語詞典詞條，支援詞頭、粵拼、釋義反查。

```typescript
{
  query: string,      // 搜索詞（漢字、粵拼或釋義關鍵詞）
  mode?: "normal" | "reverse",  // normal=詞頭/粵拼，reverse=釋義反查
  dict?: string,      // 限定詞典 ID
  limit?: number      // 最多返回結果數（1-50，默認 10）
}
```

#### entry

用詞條 ID 獲取完整詞條信息。

```typescript
{
  entry_id: string    // 詞條 ID（格式：<詞典ID>_<編號>）
}
```

#### suggest

詞頭自動補全建議。

```typescript
{
  query: string,      // 部分詞頭或粵拼
  limit?: number      // 最多建議數（1-20，默認 10）
}
```

## 測試

使用 MCP Inspector 測試：

```bash
npm run inspector
```

## 環境變量

| 變量 | 默認值 | 說明 |
|------|--------|------|
| `JYUTJYU_CLI_PATH` | `jyutjyu` | jyutjyu CLI 路徑 |

## 開發

```bash
# 安裝依賴
npm install

# 監聽模式
npm run dev

# 構建
npm run build
```

## 收錄詞典

| ID | 名稱 | 詞條數 |
|----|------|--------|
| wiktionary-cantonese | 維基辭典 | 102,195 |
| hk-cantowords | 粵典 (words.hk) | 59,019 |
| ts-english-dict | 台山話英文字典 | 42,499 |
| gz-modern | 現代粵語詞典 | 16,347 |
| qz-jyutping | 欽州粵拼 | 12,657 |
| gz-dict | 廣州話詞典（第2版） | 10,823 |
| gz-practical-classified | 實用廣州話分類詞典 | 7,549 |
| gz-dialect | 廣州方言詞典 | 7,476 |
| gz-word-origins | 粵語辭源 | 3,951 |
| kp-dialect | 開平方言 | 3,725 |
| gz-colloquialisms | 廣州話俗語詞典 | 2,516 |

## 相關項目

- [粵語辭叢網頁版](https://github.com/jyutjyucom/jyutjyu) - 主要網頁應用
- [jyutjyu-cli](https://github.com/jyutjyucom/jyutjyu-cli) - 命令行工具
- [jyutjyu.com](https://jyutjyu.com) - 網上詞典網站

## 授權

- **代碼**: [MIT License](./LICENSE)
- **詞典數據**: 見 [jyutjyu-cli](https://github.com/jyutjyucom/jyutjyu-cli#內容授權)

## 致謝

感謝所有為粵語文化保育做出貢獻嘅學者、編者同義工。

---

**網站**: https://jyutjyu.com  
**問題反饋**: [GitHub Issues](https://github.com/jyutjyucom/jyutjyu-mcp/issues)
