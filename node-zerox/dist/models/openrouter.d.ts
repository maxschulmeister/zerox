import { CompletionArgs, CompletionResponse, ExtractionArgs, ExtractionResponse, ModelInterface, OpenRouterCredentials, OpenRouterLLMParams, OperationMode } from "../types";
export default class OpenRouterModel implements ModelInterface {
    private apiKey;
    private model;
    private llmParams?;
    constructor(credentials: OpenRouterCredentials, model: string, llmParams?: Partial<OpenRouterLLMParams>);
    getCompletion(mode: OperationMode, params: CompletionArgs | ExtractionArgs): Promise<CompletionResponse | ExtractionResponse>;
    private createMessageContent;
    private handleOCR;
    private handleExtraction;
}
