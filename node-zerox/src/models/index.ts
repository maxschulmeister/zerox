import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  AISDKCredentials,
  CreateModelArgs,
  ModelInterface,
  ModelProvider,
  UnifiedLLMParams,
} from "../types";
import { validateLLMParams } from "../utils/model";
import AISDKModel from "./ai-sdk";

// Convert legacy credentials to AI SDK format
const convertCredentials = (
  credentials: any,
  provider: ModelProvider | string
): AISDKCredentials => {
  switch (provider) {
    case ModelProvider.OPENAI:
      if (!credentials.apiKey || credentials.apiKey.trim() === "") {
        throw new Error("OpenAI API key is required");
      }
      return { apiKey: credentials.apiKey };
    case ModelProvider.AZURE:
      if (!credentials.apiKey || credentials.apiKey.trim() === "") {
        throw new Error("Azure API key is required");
      }
      if (!credentials.endpoint || credentials.endpoint.trim() === "") {
        throw new Error("Azure endpoint is required");
      }
      return {
        apiKey: credentials.apiKey,
        endpoint: credentials.endpoint,
      };
    case ModelProvider.GOOGLE:
      if (!credentials.apiKey || credentials.apiKey.trim() === "") {
        throw new Error("Google API key is required");
      }
      return { apiKey: credentials.apiKey };
    case ModelProvider.BEDROCK:
      if (!credentials.region || credentials.region.trim() === "") {
        throw new Error("Bedrock region is required");
      }
      return {
        apiKey: "", // Bedrock uses AWS credentials
        region: credentials.region,
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      };
    case ModelProvider.OPENROUTER:
      if (!credentials.apiKey || credentials.apiKey.trim() === "") {
        throw new Error("OpenRouter API key is required");
      }
      return { apiKey: credentials.apiKey };
    default:
      throw new Error(
        `Unsupported provider for credential conversion: ${provider}`
      );
  }
};

// Convert legacy LLM params to unified format
const convertLLMParams = (
  params: any,
  provider: ModelProvider | string
): Partial<UnifiedLLMParams> => {
  const unified: Partial<UnifiedLLMParams> = {
    temperature: params.temperature,
    topP: params.topP,
    frequencyPenalty: params.frequencyPenalty,
    presencePenalty: params.presencePenalty,
    logprobs: params.logprobs,
  };

  // Handle provider-specific token limits
  if (provider === ModelProvider.GOOGLE) {
    unified.maxTokens = params.maxOutputTokens || params.maxTokens;
  } else {
    unified.maxTokens = params.maxTokens;
  }

  return unified;
};

// Create AI SDK model instance based on provider
const createAISDKModelInstance = (
  credentials: AISDKCredentials,
  provider: ModelProvider | string,
  model: string
) => {
  switch (provider) {
    case ModelProvider.OPENAI:
      const openaiProvider = createOpenAI({
        apiKey: credentials.apiKey,
      });
      return openaiProvider(model);
    case ModelProvider.AZURE:
      const azureProvider = createOpenAI({
        apiKey: credentials.apiKey,
        baseURL: credentials.endpoint,
      });
      return azureProvider(model);
    case ModelProvider.GOOGLE:
      const googleProvider = createGoogleGenerativeAI({
        apiKey: credentials.apiKey,
      });
      return googleProvider(model);
    case ModelProvider.BEDROCK:
      // Note: Bedrock support is implemented via Anthropic provider
      // This provides compatibility until native Bedrock support is available in AI SDK
      const bedrockProvider = createAmazonBedrock({
        region: credentials.region,
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      });
      return bedrockProvider(model);
    case ModelProvider.OPENROUTER:
      const openrouterProvider = createOpenRouter({
        apiKey: credentials.apiKey,
      });
      return openrouterProvider(model);
    default:
      throw new Error(`Unsupported AI SDK provider: ${provider}`);
  }
};

export const createModel = ({
  credentials,
  llmParams,
  model,
  provider,
}: CreateModelArgs): ModelInterface => {
  // Validate parameters using existing validation
  const validatedParams = validateLLMParams(llmParams, provider);

  // Convert to AI SDK format
  const aiCredentials = convertCredentials(credentials, provider);
  const unifiedParams = convertLLMParams(validatedParams, provider);

  // Create AI SDK model instance
  const aiModel = createAISDKModelInstance(aiCredentials, provider, model);

  // Return new unified model
  return new AISDKModel(aiModel, provider, model, unifiedParams);
};
