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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var types_1 = require("../types");
var constants_1 = require("../constants");
var generative_ai_1 = require("@google/generative-ai");
var fs_extra_1 = __importDefault(require("fs-extra"));
var GoogleModel = /** @class */ (function () {
    function GoogleModel(credentials, model, llmParams) {
        this.client = new generative_ai_1.GoogleGenerativeAI(credentials.apiKey);
        this.model = model;
        this.llmParams = llmParams;
    }
    GoogleModel.prototype.getCompletion = function (mode, params) {
        return __awaiter(this, void 0, void 0, function () {
            var modeHandlers, handler;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        modeHandlers = (_a = {},
                            _a[types_1.OperationMode.EXTRACTION] = function () {
                                return _this.handleExtraction(params);
                            },
                            _a[types_1.OperationMode.OCR] = function () { return _this.handleOCR(params); },
                            _a);
                        handler = modeHandlers[mode];
                        if (!handler) {
                            throw new Error("Unsupported operation mode: ".concat(mode));
                        }
                        return [4 /*yield*/, handler()];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    GoogleModel.prototype.createMessageContent = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var processImages, imagePaths, text, images;
            var _this = this;
            var input = _b.input, options = _b.options;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        processImages = function (imagePaths) { return __awaiter(_this, void 0, void 0, function () {
                            var nestedImages;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Promise.all(imagePaths.map(function (imagePath) { return __awaiter(_this, void 0, void 0, function () {
                                            var imageBuffer, buffers;
                                            var _a, _b, _c;
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0: return [4 /*yield*/, fs_extra_1.default.readFile(imagePath)];
                                                    case 1:
                                                        imageBuffer = _d.sent();
                                                        return [4 /*yield*/, (0, utils_1.cleanupImage)({
                                                                correctOrientation: (_a = options === null || options === void 0 ? void 0 : options.correctOrientation) !== null && _a !== void 0 ? _a : false,
                                                                imageBuffer: imageBuffer,
                                                                scheduler: (_b = options === null || options === void 0 ? void 0 : options.scheduler) !== null && _b !== void 0 ? _b : null,
                                                                trimEdges: (_c = options === null || options === void 0 ? void 0 : options.trimEdges) !== null && _c !== void 0 ? _c : false,
                                                            })];
                                                    case 2:
                                                        buffers = _d.sent();
                                                        return [2 /*return*/, buffers.map(function (buffer) { return ({
                                                                inlineData: {
                                                                    data: (0, utils_1.encodeImageToBase64)(buffer),
                                                                    mimeType: "image/png",
                                                                },
                                                            }); })];
                                                }
                                            });
                                        }); }))];
                                    case 1:
                                        nestedImages = _a.sent();
                                        return [2 /*return*/, nestedImages.flat()];
                                }
                            });
                        }); };
                        if (Array.isArray(input)) {
                            return [2 /*return*/, processImages(input)];
                        }
                        if (typeof input === "string") {
                            return [2 /*return*/, [{ text: input }]];
                        }
                        imagePaths = input.imagePaths, text = input.text;
                        return [4 /*yield*/, processImages(imagePaths)];
                    case 1:
                        images = _c.sent();
                        return [2 /*return*/, __spreadArray(__spreadArray([], images, true), [{ text: text }], false)];
                }
            });
        });
    };
    GoogleModel.prototype.handleOCR = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var generativeModel, promptParts, imageContents, result, response, err_1;
            var _c, _d, _e;
            var buffers = _b.buffers, maintainFormat = _b.maintainFormat, priorPage = _b.priorPage, prompt = _b.prompt;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        generativeModel = this.client.getGenerativeModel({
                            generationConfig: (0, utils_1.convertKeysToSnakeCase)((_c = this.llmParams) !== null && _c !== void 0 ? _c : null),
                            model: this.model,
                        });
                        promptParts = [];
                        // Add system prompt
                        promptParts.push({ text: prompt || constants_1.SYSTEM_PROMPT_BASE });
                        // If content has already been generated, add it to context
                        if (maintainFormat && priorPage && priorPage.length) {
                            promptParts.push({ text: (0, constants_1.CONSISTENCY_PROMPT)(priorPage) });
                        }
                        imageContents = buffers.map(function (buffer) { return ({
                            inlineData: {
                                data: (0, utils_1.encodeImageToBase64)(buffer),
                                mimeType: "image/png",
                            },
                        }); });
                        promptParts.push.apply(promptParts, imageContents);
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, generativeModel.generateContent({
                                contents: [{ role: "user", parts: promptParts }],
                            })];
                    case 2:
                        result = _f.sent();
                        return [4 /*yield*/, result.response];
                    case 3:
                        response = _f.sent();
                        return [2 /*return*/, {
                                content: response.text(),
                                inputTokens: ((_d = response.usageMetadata) === null || _d === void 0 ? void 0 : _d.promptTokenCount) || 0,
                                outputTokens: ((_e = response.usageMetadata) === null || _e === void 0 ? void 0 : _e.candidatesTokenCount) || 0,
                            }];
                    case 4:
                        err_1 = _f.sent();
                        console.error("Error in Google completion", err_1);
                        throw err_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    GoogleModel.prototype.handleExtraction = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var generativeModel, promptParts, parts, result, response, err_2;
            var _c, _d, _e;
            var input = _b.input, options = _b.options, prompt = _b.prompt, schema = _b.schema;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        generativeModel = this.client.getGenerativeModel({
                            generationConfig: __assign(__assign({}, (0, utils_1.convertKeysToSnakeCase)((_c = this.llmParams) !== null && _c !== void 0 ? _c : null)), { responseMimeType: "application/json", responseSchema: schema }),
                            model: this.model,
                        });
                        promptParts = [];
                        // Add system prompt
                        promptParts.push({ text: prompt || "Extract schema data" });
                        return [4 /*yield*/, this.createMessageContent({ input: input, options: options })];
                    case 1:
                        parts = _f.sent();
                        promptParts.push.apply(promptParts, parts);
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, generativeModel.generateContent({
                                contents: [{ role: "user", parts: promptParts }],
                            })];
                    case 3:
                        result = _f.sent();
                        return [4 /*yield*/, result.response];
                    case 4:
                        response = _f.sent();
                        return [2 /*return*/, {
                                extracted: JSON.parse(response.text()),
                                inputTokens: ((_d = response.usageMetadata) === null || _d === void 0 ? void 0 : _d.promptTokenCount) || 0,
                                outputTokens: ((_e = response.usageMetadata) === null || _e === void 0 ? void 0 : _e.candidatesTokenCount) || 0,
                            }];
                    case 5:
                        err_2 = _f.sent();
                        console.error("Error in Google completion", err_2);
                        throw err_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return GoogleModel;
}());
exports.default = GoogleModel;
