import type { JSONSchema7Definition } from "json-schema";
import type { OpenAPIV3 } from "openapi-types";
/**
 * Converts JSON Schema 7 to OpenAPI Schema 3.0
 */
export declare function jsonSchemaToOpenAPISchema(jsonSchema: JSONSchema7Definition): unknown;
/**
 * Converts JSON Schema 7 to a OpenAI strict schema.
 */
export declare function jsonSchemaToOpenAISchema(schema: JSONSchema7Definition): JSONSchema7Definition;
/**
 * Converts JSON Schema 7 to a Gemini-compatible schema for Google Gemini API.
 * Only includes supported fields and ensures propertyOrdering for objects.
 */
export declare function jsonSchemaToGoogleSchema(jsonSchema: JSONSchema7Definition): OpenAPIV3.SchemaObject;
/**
 * Converts an OpenAPI schema (from jsonSchemaToOpenAPISchema) to a Gemini-compatible schema for Google Gemini API.
 * Only includes supported fields and ensures propertyOrdering for objects.
 */
export declare function openApiSchemaToGoogleSchema(openApiSchema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject;
