#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execa } from "execa";

const JYUTJYU_CLI = process.env.JYUTJYU_CLI_PATH || "jyutjyu";
const DEFAULT_LIMIT = 10;
const TIMEOUT_MS = 15000;

interface CliResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

async function executeJyutjyu(args: string[]): Promise<CliResult> {
  try {
    const result = await execa(JYUTJYU_CLI, ["-j", ...args], {
      timeout: TIMEOUT_MS,
      reject: false,
    });

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr || `Command failed with exit code ${result.exitCode}`,
      };
    }

    const data = JSON.parse(result.stdout);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

const server = new McpServer({
  name: "jyutjyu-mcp",
  version: "1.0.0",
});

server.tool(
  "search",
  "搜尋粵語詞典詞條（支援詞頭、粵拼、釋義反查）\n\nSearch for Cantonese dictionary entries by headword (詞頭), Jyutping romanization (粵拼), or definition (釋義).",
  {
    query: z.string().describe("搜索詞（可以是可以是漢字、粵拼或釋義關鍵詞）"),
    mode: z
      .enum(["normal", "reverse"])
      .optional()
      .default("normal")
      .describe("搜尋模式：normal=詞頭/粵拼搜索，reverse=釋義反查"),
    dict: z
      .string()
      .optional()
      .describe("限定詞典 ID（如 hk-cantowords, gz-practical-classified）"),
    limit: z
      .number()
      .min(1)
      .max(50)
      .optional()
      .default(DEFAULT_LIMIT)
      .describe("最多返回結果數"),
  },
  async ({ query, mode, dict, limit }) => {
    const args = ["search", query, "--limit", String(limit)];
    
    if (mode === "reverse") {
      args.push("--mode", "reverse");
    }
    
    if (dict) {
      args.push("-D", dict);
    }

    const result = await executeJyutjyu(args);

    if (!result.success) {
      return {
        content: [
          {
            type: "text" as const,
            text: `搜尋失敗: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "entry",
  "用詞條 ID 獲取完整詞條信息\n\nGet detailed information about a specific dictionary entry by its ID.",
  {
    entry_id: z
      .string()
      .describe("詞條 ID（格式：<詞典ID>_<編號>，如 hk-cantowords_119577）"),
  },
  async ({ entry_id }) => {
    const result = await executeJyutjyu(["entry", entry_id]);

    if (!result.success) {
      return {
        content: [
          {
            type: "text" as const,
            text: `詞條未找到: ${entry_id}\n\n錯誤: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "suggest",
  "詞頭自動補全建議\n\nGet autocomplete suggestions for partial word input.",
  {
    query: z.string().describe("部分詞頭或粵拼"),
    limit: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .default(10)
      .describe("最多建議數"),
  },
  async ({ query, limit }) => {
    const result = await executeJyutjyu([
      "suggest",
      query,
      "--limit",
      String(limit),
    ]);

    if (!result.success) {
      return {
        content: [
          {
            type: "text" as const,
            text: `建議獲取失敗: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "dictionaries",
  "列出所有可用詞典\n\nList all available dictionaries with their metadata (name, entry count, dialect, etc.).",
  {},
  async () => {
    const result = await executeJyutjyu(["dict", "list"]);

    if (!result.success) {
      return {
        content: [
          {
            type: "text" as const,
            text: `詞典列表獲取失敗: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "word",
  "獲取某個詞頭在所有詞典中的條目\n\nFind all dictionary entries for a specific headword across dictionaries.",
  {
    headword: z.string().describe("詞頭（漢字）"),
    dict: z.string().optional().describe("限定詞典 ID"),
  },
  async ({ headword, dict }) => {
    const args = ["word", headword];
    
    if (dict) {
      args.push("-D", dict);
    }

    const result = await executeJyutjyu(args);

    if (!result.success) {
      return {
        content: [
          {
            type: "text" as const,
            text: `詞條未找到: ${headword}\n\n錯誤: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "random",
  "獲取隨機詞條\n\nGet random dictionary entries for discovery and learning.",
  {
    count: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .default(5)
      .describe("隨機詞條數量"),
    dict: z.string().optional().describe("限定詞典 ID"),
  },
  async ({ count, dict }) => {
    const args = ["random", "--count", String(count)];
    
    if (dict) {
      args.push("-D", dict);
    }

    const result = await executeJyutjyu(args);

    if (!result.success) {
      return {
        content: [
          {
            type: "text" as const,
            text: `隨機詞條獲取失敗: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Jyutjyu MCP Server started");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
