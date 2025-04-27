"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonSchemaToOpenAPISchema = jsonSchemaToOpenAPISchema;
exports.jsonSchemaToOpenAISchema = jsonSchemaToOpenAISchema;
exports.jsonSchemaToGoogleSchema = jsonSchemaToGoogleSchema;
exports.openApiSchemaToGoogleSchema = openApiSchemaToGoogleSchema;
function isEmptyObjectSchema(jsonSchema) {
    return (jsonSchema != null &&
        typeof jsonSchema === "object" &&
        jsonSchema.type === "object" &&
        (jsonSchema.properties == null ||
            Object.keys(jsonSchema.properties).length === 0));
}
/**
 * Converts JSON Schema 7 to OpenAPI Schema 3.0
 */
function jsonSchemaToOpenAPISchema(jsonSchema) {
    // parameters need to be undefined if they are empty objects:
    if (isEmptyObjectSchema(jsonSchema)) {
        return undefined;
    }
    if (typeof jsonSchema === "boolean") {
        return { type: "boolean", properties: {} };
    }
    var type = jsonSchema.type, description = jsonSchema.description, required = jsonSchema.required, properties = jsonSchema.properties, items = jsonSchema.items, allOf = jsonSchema.allOf, anyOf = jsonSchema.anyOf, oneOf = jsonSchema.oneOf, format = jsonSchema.format, constValue = jsonSchema.const, minLength = jsonSchema.minLength, enumValues = jsonSchema.enum;
    var result = {};
    // Remove 'format' and append to description if present
    var newDescription = description || "";
    if (format) {
        newDescription = newDescription
            ? "".concat(newDescription, " format: ").concat(format)
            : "format: ".concat(format);
    }
    if (newDescription)
        result.description = newDescription;
    if (required)
        result.required = required;
    // Do NOT add result.format
    if (constValue !== undefined) {
        result.enum = [constValue];
    }
    // Handle type
    if (type) {
        if (Array.isArray(type)) {
            if (type.includes("null")) {
                result.type = type.filter(function (t) { return t !== "null"; })[0];
                result.nullable = true;
            }
            else {
                result.type = type;
            }
        }
        else if (type === "null") {
            result.type = "null";
        }
        else {
            result.type = type;
        }
    }
    // Handle enum
    if (enumValues !== undefined) {
        result.enum = enumValues;
    }
    if (properties != null) {
        result.properties = Object.entries(properties).reduce(function (acc, _a) {
            var key = _a[0], value = _a[1];
            acc[key] = jsonSchemaToOpenAPISchema(value);
            return acc;
        }, {});
    }
    if (items) {
        result.items = Array.isArray(items)
            ? items.map(jsonSchemaToOpenAPISchema)
            : jsonSchemaToOpenAPISchema(items);
    }
    if (allOf) {
        result.allOf = allOf.map(jsonSchemaToOpenAPISchema);
    }
    if (anyOf) {
        // Handle cases where anyOf includes a null type
        if (anyOf.some(function (schema) { return typeof schema === "object" && (schema === null || schema === void 0 ? void 0 : schema.type) === "null"; })) {
            var nonNullSchemas = anyOf.filter(function (schema) { return !(typeof schema === "object" && (schema === null || schema === void 0 ? void 0 : schema.type) === "null"); });
            if (nonNullSchemas.length === 1) {
                // If there's only one non-null schema, convert it and make it nullable
                var converted = jsonSchemaToOpenAPISchema(nonNullSchemas[0]);
                if (typeof converted === "object") {
                    result.nullable = true;
                    Object.assign(result, converted);
                }
            }
            else {
                // If there are multiple non-null schemas, keep them in anyOf
                result.anyOf = nonNullSchemas.map(jsonSchemaToOpenAPISchema);
                result.nullable = true;
            }
        }
        else {
            result.anyOf = anyOf.map(jsonSchemaToOpenAPISchema);
        }
    }
    if (oneOf) {
        result.oneOf = oneOf.map(jsonSchemaToOpenAPISchema);
    }
    if (minLength !== undefined) {
        result.minLength = minLength;
    }
    return result;
}
/**
 * Converts JSON Schema 7 to a OpenAI strict schema.
 */
function jsonSchemaToOpenAISchema(schema) {
    if (typeof schema !== "object" || schema === null)
        return schema;
    if (typeof schema === "boolean")
        return schema;
    // List of supported fields for OpenAI strict schema
    var supportedFields = new Set([
        "type",
        "description",
        "required",
        "properties",
        "items",
        "allOf",
        "anyOf",
        "oneOf",
        "enum",
        "const",
        "minLength",
        "nullable",
        "additionalProperties",
        "patternProperties",
        "definitions",
        "$defs",
        "dependencies",
        "dependentSchemas",
        "not",
        "if",
        "then",
        "else",
        "contains",
        "propertyNames",
    ]);
    // Separate supported and unsupported fields
    var supported = {};
    var description = schema.description || "";
    for (var _i = 0, _a = Object.keys(schema); _i < _a.length; _i++) {
        var key = _a[_i];
        if (supportedFields.has(key)) {
            supported[key] = schema[key];
        }
        else {
            // Append unsupported field to description
            var value = schema[key];
            var valueStr = typeof value === "object" ? JSON.stringify(value) : String(value);
            description = description
                ? "".concat(description, " ").concat(key, ": ").concat(valueStr)
                : "".concat(key, ": ").concat(valueStr);
        }
    }
    if (description) {
        supported.description = description;
    }
    // Helper to process sub-schemas
    var process = function (sub) { return jsonSchemaToOpenAISchema(sub); };
    // Handle arrays
    if (supported.type === "array" && supported.items) {
        return __assign(__assign({}, supported), { items: Array.isArray(supported.items)
                ? supported.items.map(process)
                : process(supported.items) });
    }
    // Handle objects strictly
    if (supported.type === "object") {
        // Recursively process properties
        var properties = supported.properties || {};
        var processedProperties = Object.fromEntries(Object.entries(properties).map(function (_a) {
            var k = _a[0], v = _a[1];
            return [k, process(v)];
        }));
        var propertyKeys = Object.keys(processedProperties);
        // Always set required to all property keys
        // If properties is empty, required should be an empty array
        return __assign(__assign(__assign({}, supported), { properties: processedProperties, required: propertyKeys, additionalProperties: false }), (supported.patternProperties && {
            patternProperties: Object.fromEntries(Object.entries(supported.patternProperties).map(function (_a) {
                var k = _a[0], v = _a[1];
                return [
                    k,
                    process(v),
                ];
            })),
        }));
    }
    // Handle combinators and other schema keywords
    var combinators = [
        "allOf",
        "anyOf",
        "oneOf",
        "not",
        "if",
        "then",
        "else",
        "contains",
        "propertyNames",
    ];
    var result = __assign({}, supported);
    for (var _b = 0, combinators_1 = combinators; _b < combinators_1.length; _b++) {
        var key = combinators_1[_b];
        if (supported[key]) {
            if (Array.isArray(supported[key])) {
                result[key] = supported[key].map(process);
            }
            else {
                result[key] = process(supported[key]);
            }
        }
    }
    // Handle definitions, $defs, dependencies, dependentSchemas
    if (supported.definitions) {
        result.definitions = Object.fromEntries(Object.entries(supported.definitions).map(function (_a) {
            var k = _a[0], v = _a[1];
            return [k, process(v)];
        }));
    }
    if (supported.$defs) {
        result.$defs = Object.fromEntries(Object.entries(supported.$defs).map(function (_a) {
            var k = _a[0], v = _a[1];
            return [k, process(v)];
        }));
    }
    if (supported.dependencies) {
        result.dependencies = Object.fromEntries(Object.entries(supported.dependencies).map(function (_a) {
            var k = _a[0], v = _a[1];
            return [
                k,
                Array.isArray(v) ? v : process(v),
            ];
        }));
    }
    if (supported.dependentSchemas) {
        result.dependentSchemas = Object.fromEntries(Object.entries(supported.dependentSchemas).map(function (_a) {
            var k = _a[0], v = _a[1];
            return [
                k,
                process(v),
            ];
        }));
    }
    // Recursively process properties for non-object types with properties (rare, but possible)
    if (supported.properties && supported.type !== "object") {
        result.properties = Object.fromEntries(Object.entries(supported.properties).map(function (_a) {
            var k = _a[0], v = _a[1];
            return [k, process(v)];
        }));
    }
    return result;
}
/**
 * Converts JSON Schema 7 to a Gemini-compatible schema for Google Gemini API.
 * Only includes supported fields and ensures propertyOrdering for objects.
 */
function jsonSchemaToGoogleSchema(jsonSchema) {
    var openApiSchema = jsonSchemaToOpenAPISchema(jsonSchema);
    return openApiSchemaToGoogleSchema(openApiSchema);
}
/**
 * Converts an OpenAPI schema (from jsonSchemaToOpenAPISchema) to a Gemini-compatible schema for Google Gemini API.
 * Only includes supported fields and ensures propertyOrdering for objects.
 */
function openApiSchemaToGoogleSchema(openApiSchema) {
    if (typeof openApiSchema !== "object" || openApiSchema === null)
        return openApiSchema;
    // Supported Gemini fields
    var supportedFields = [
        "type",
        "format",
        "description",
        "nullable",
        "enum",
        "maxItems",
        "minItems",
        "properties",
        "required",
        "propertyOrdering",
        "items",
    ];
    var result = {};
    for (var _i = 0, supportedFields_1 = supportedFields; _i < supportedFields_1.length; _i++) {
        var key = supportedFields_1[_i];
        if (openApiSchema[key] !== undefined) {
            result[key] = openApiSchema[key];
        }
    }
    // Recursively process properties for objects
    if (result.type === "object" && result.properties) {
        var propertyOrdering = [];
        for (var _a = 0, _b = Object.keys(result.properties); _a < _b.length; _a++) {
            var key = _b[_a];
            result.properties[key] = openApiSchemaToGoogleSchema(result.properties[key]);
            propertyOrdering.push(key);
        }
        result.propertyOrdering = propertyOrdering;
    }
    // Recursively process items for arrays
    if (result.type === "array" && result.items) {
        if (Array.isArray(result.items)) {
            result.items = result.items.map(openApiSchemaToGoogleSchema);
        }
        else {
            result.items = openApiSchemaToGoogleSchema(result.items);
        }
    }
    return result;
}
