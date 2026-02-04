/**
 * MCP Prompts
 *
 * Prompt definitions for agent-like behaviors.
 */
import { DatabaseClient } from '../db/client.js';
/**
 * Prompt definition
 */
export interface Prompt {
    name: string;
    description: string;
    arguments: Array<{
        name: string;
        description: string;
        required: boolean;
    }>;
}
/**
 * Prompt message
 */
export interface PromptMessage {
    role: 'user' | 'assistant';
    content: {
        type: 'text';
        text: string;
    };
}
/**
 * Prompt context
 */
export interface PromptContext {
    db: DatabaseClient;
    projectRoot: string;
}
/**
 * Available prompts (agents)
 */
export declare const PROMPT_DEFINITIONS: Prompt[];
/**
 * Get a prompt by name
 */
export declare function getPrompt(name: string, args: Record<string, string>, ctx: PromptContext): {
    description: string;
    messages: PromptMessage[];
};
//# sourceMappingURL=handlers.d.ts.map