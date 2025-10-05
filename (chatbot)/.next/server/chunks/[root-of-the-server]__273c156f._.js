module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:stream/web [external] (node:stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/web", () => require("node:stream/web"));

module.exports = mod;
}),
"[project]/shared/lib/schemas/chat-request.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// shared/lib/schemas/chat-request.ts
// Shared Zod validation schema for chat API requests
__turbopack_context__.s([
    "ChatRequestSchema",
    ()=>ChatRequestSchema,
    "MessageSchema",
    ()=>MessageSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const MessageSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    role: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'user',
        'assistant',
        'system'
    ]),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(10000),
    timestamp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const ChatRequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    messages: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(MessageSchema).min(1).max(50),
    industry: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().default('strive'),
    sessionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    conversationStage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    detectedProblems: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional(),
    clientId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
}),
"[project]/(chatbot)/lib/ai/data-extraction.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/ai/data-extraction.ts
__turbopack_context__.s([
    "ContactInfoSchema",
    ()=>ContactInfoSchema,
    "PropertyPreferencesSchema",
    ()=>PropertyPreferencesSchema,
    "extractDataFromMessage",
    ()=>extractDataFromMessage,
    "formatPreferences",
    ()=>formatPreferences,
    "getMissingCriticalFields",
    ()=>getMissingCriticalFields,
    "hasMinimumSearchCriteria",
    ()=>hasMinimumSearchCriteria,
    "mergeExtractedData",
    ()=>mergeExtractedData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/server-only/empty.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$groq$2d$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/groq-sdk/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
;
;
const groq = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$groq$2d$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
    apiKey: process.env.GROQ_API_KEY
});
const PropertyPreferencesSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe('City, state, zip code, or neighborhood'),
    maxPrice: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().optional().describe('Maximum budget in dollars'),
    minBedrooms: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().describe('Minimum number of bedrooms'),
    minBathrooms: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().optional().describe('Minimum number of bathrooms'),
    mustHaveFeatures: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional().describe('Must-have features like pool, backyard, garage'),
    niceToHaveFeatures: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional().describe('Nice-to-have features'),
    propertyType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'single-family',
        'condo',
        'townhouse',
        'multi-family',
        'any'
    ]).optional().describe('Type of property'),
    timeline: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'ASAP',
        'WITHIN_1_MONTH',
        'WITHIN_3_MONTHS',
        'WITHIN_6_MONTHS',
        'FLEXIBLE'
    ]).optional().describe('How soon they want to move'),
    isFirstTimeBuyer: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional().describe('Is this their first home purchase'),
    currentSituation: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'renting',
        'selling',
        'first-time',
        'relocating',
        'unknown'
    ]).optional().describe('Current living situation')
});
const ContactInfoSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe('Full name'),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email().optional().describe('Email address'),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe('Phone number')
});
async function extractDataFromMessage(userMessage, conversationHistory = []) {
    try {
        // Use Groq with function calling for fast, structured extraction
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            messages: [
                {
                    role: 'system',
                    content: `You are a data extraction assistant for a real estate chatbot.
Extract property search preferences and contact information from user messages.

IMPORTANT EXTRACTION RULES:

1. LOCATION:
   - Extract city, state, zip codes
   - Examples: "Nashville, TN", "Austin", "37209", "Denver, Colorado"

2. PRICE/BUDGET:
   - Convert shorthand to full numbers: "$500k" → 500000, "$1.2M" → 1200000
   - Examples: "$700k", "$850,000", "under $1 million"

3. BEDROOMS/BATHROOMS:
   - Extract from phrases like: "3 bed", "4 bedroom", "3BR", "2.5 bath"
   - Examples: "3 bed 2 bath", "4BR/3BA"

4. FEATURES:
   - Extract mentioned amenities: pool, backyard, garage, fireplace, etc.
   - Map variations: "yard" → "backyard", "2 car garage" → "garage"

5. PROPERTY TYPE:
   - Detect: single-family, condo, townhouse, multi-family
   - "house" → single-family, "apartment" → condo

6. TIMELINE:
   - "ASAP" → immediate need
   - "next month" → WITHIN_1_MONTH
   - "6 months" → WITHIN_6_MONTHS
   - "flexible" → FLEXIBLE

7. CONTACT INFO:
   - Extract names, emails, phone numbers when provided
   - Be liberal in extraction but validate formats

Only extract information explicitly mentioned or strongly implied in the current message.
Do NOT make assumptions beyond what's stated.`
                },
                ...conversationHistory.map((msg)=>({
                        role: msg.role,
                        content: msg.content
                    })),
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'extract_property_preferences',
                        description: 'Extract property search preferences from user message',
                        parameters: {
                            type: 'object',
                            properties: {
                                location: {
                                    type: 'string',
                                    description: 'City, state, zip code, or neighborhood (e.g., "Nashville, TN", "37209")'
                                },
                                maxPrice: {
                                    type: 'number',
                                    description: 'Maximum budget in dollars (convert "500k" to 500000)'
                                },
                                minBedrooms: {
                                    type: 'integer',
                                    description: 'Minimum number of bedrooms'
                                },
                                minBathrooms: {
                                    type: 'number',
                                    description: 'Minimum number of bathrooms (can be decimal like 2.5)'
                                },
                                mustHaveFeatures: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    description: 'Must-have features (pool, backyard, garage, etc.)'
                                },
                                niceToHaveFeatures: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    description: 'Nice-to-have features'
                                },
                                propertyType: {
                                    type: 'string',
                                    enum: [
                                        'single-family',
                                        'condo',
                                        'townhouse',
                                        'multi-family',
                                        'any'
                                    ],
                                    description: 'Type of property desired'
                                },
                                timeline: {
                                    type: 'string',
                                    enum: [
                                        'ASAP',
                                        'WITHIN_1_MONTH',
                                        'WITHIN_3_MONTHS',
                                        'WITHIN_6_MONTHS',
                                        'FLEXIBLE'
                                    ],
                                    description: 'Timeline for moving/purchasing'
                                },
                                isFirstTimeBuyer: {
                                    type: 'boolean',
                                    description: 'Is this a first-time home buyer?'
                                },
                                currentSituation: {
                                    type: 'string',
                                    enum: [
                                        'renting',
                                        'selling',
                                        'first-time',
                                        'relocating',
                                        'unknown'
                                    ],
                                    description: 'Current living situation'
                                }
                            }
                        }
                    }
                },
                {
                    type: 'function',
                    function: {
                        name: 'extract_contact_info',
                        description: 'Extract contact information from user message',
                        parameters: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Full name'
                                },
                                email: {
                                    type: 'string',
                                    description: 'Email address'
                                },
                                phone: {
                                    type: 'string',
                                    description: 'Phone number'
                                }
                            }
                        }
                    }
                }
            ],
            tool_choice: 'auto'
        });
        const responseMessage = completion.choices[0]?.message;
        const toolCalls = responseMessage?.tool_calls || [];
        let propertyPreferences = {};
        let contactInfo = {};
        const extractedFields = [];
        let confidence = 0.8; // Default confidence
        // Process tool calls
        for (const toolCall of toolCalls){
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            if (functionName === 'extract_property_preferences') {
                propertyPreferences = PropertyPreferencesSchema.parse(args);
                extractedFields.push(...Object.keys(args).filter((k)=>args[k] !== undefined && args[k] !== null));
            } else if (functionName === 'extract_contact_info') {
                contactInfo = ContactInfoSchema.parse(args);
                extractedFields.push(...Object.keys(args).filter((k)=>args[k] !== undefined && args[k] !== null));
            }
        }
        // Calculate confidence based on number of fields extracted
        if (extractedFields.length > 0) {
            confidence = Math.min(0.9, 0.6 + extractedFields.length * 0.1);
        }
        return {
            propertyPreferences,
            contactInfo,
            extractedFields: [
                ...new Set(extractedFields)
            ],
            confidence
        };
    } catch (error) {
        console.error('❌ Data extraction error:', error);
        // Fallback to regex-based extraction if AI fails
        return fallbackExtraction(userMessage);
    }
}
/**
 * Fallback extraction using regex patterns (when AI extraction fails)
 */ function fallbackExtraction(message) {
    const propertyPreferences = {};
    const contactInfo = {};
    const extractedFields = [];
    // Extract price
    const priceMatch = message.match(/\$?([\d,]+)k?(?:,000)?(?:\s*(?:max|budget|price|under|up to))?/i);
    if (priceMatch) {
        let amount = parseInt(priceMatch[1].replace(/,/g, ''));
        if (message.toLowerCase().includes('k') && amount < 10000) {
            amount *= 1000;
        }
        propertyPreferences.maxPrice = amount;
        extractedFields.push('maxPrice');
    }
    // Extract bedrooms
    const bedroomsMatch = message.match(/(\d+)\s*(?:bed|br|bedroom)/i);
    if (bedroomsMatch) {
        propertyPreferences.minBedrooms = parseInt(bedroomsMatch[1]);
        extractedFields.push('minBedrooms');
    }
    // Extract bathrooms
    const bathroomsMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)/i);
    if (bathroomsMatch) {
        propertyPreferences.minBathrooms = parseFloat(bathroomsMatch[1]);
        extractedFields.push('minBathrooms');
    }
    // Extract features
    const features = [];
    if (/\bpool\b/i.test(message)) features.push('pool');
    if (/\b(?:backyard|yard)\b/i.test(message)) features.push('backyard');
    if (/\bgarage\b/i.test(message)) features.push('garage');
    if (/\bfireplace\b/i.test(message)) features.push('fireplace');
    if (features.length > 0) {
        propertyPreferences.mustHaveFeatures = features;
        extractedFields.push('mustHaveFeatures');
    }
    // Extract property type
    if (/\b(?:single-family|house|home)\b/i.test(message)) {
        propertyPreferences.propertyType = 'single-family';
        extractedFields.push('propertyType');
    } else if (/\bcondo\b/i.test(message)) {
        propertyPreferences.propertyType = 'condo';
        extractedFields.push('propertyType');
    } else if (/\btownhouse\b/i.test(message)) {
        propertyPreferences.propertyType = 'townhouse';
        extractedFields.push('propertyType');
    }
    // Extract email
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
        contactInfo.email = emailMatch[0];
        extractedFields.push('email');
    }
    // Extract phone
    const phoneMatch = message.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
        contactInfo.phone = phoneMatch[0];
        extractedFields.push('phone');
    }
    return {
        propertyPreferences,
        contactInfo,
        extractedFields,
        confidence: extractedFields.length > 0 ? 0.6 : 0.3
    };
}
function mergeExtractedData(existing, extracted) {
    return {
        ...existing,
        ...Object.fromEntries(Object.entries(extracted).filter(([_, value])=>value !== undefined && value !== null))
    };
}
function hasMinimumSearchCriteria(preferences) {
    return !!(preferences.location && preferences.maxPrice);
}
function getMissingCriticalFields(preferences) {
    const missing = [];
    if (!preferences.location) missing.push('location');
    if (!preferences.maxPrice) missing.push('budget');
    return missing;
}
function formatPreferences(preferences) {
    const parts = [];
    if (preferences.location) parts.push(`📍 ${preferences.location}`);
    if (preferences.maxPrice) parts.push(`💰 $${preferences.maxPrice.toLocaleString()}`);
    if (preferences.minBedrooms) parts.push(`🛏️ ${preferences.minBedrooms}+ bed`);
    if (preferences.minBathrooms) parts.push(`🛁 ${preferences.minBathrooms}+ bath`);
    if (preferences.propertyType) parts.push(`🏠 ${preferences.propertyType}`);
    if (preferences.mustHaveFeatures && preferences.mustHaveFeatures.length > 0) {
        parts.push(`✨ ${preferences.mustHaveFeatures.join(', ')}`);
    }
    return parts.join(' | ');
}
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/(chatbot)/lib/services/crm-integration.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/services/crm-integration.ts
__turbopack_context__.s([
    "LeadScore",
    ()=>LeadScore,
    "getLeadSummary",
    ()=>getLeadSummary,
    "logActivity",
    ()=>logActivity,
    "requestShowing",
    ()=>requestShowing,
    "syncLeadToCRM",
    ()=>syncLeadToCRM,
    "trackPropertyView",
    ()=>trackPropertyView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/server-only/empty.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
var LeadScore = /*#__PURE__*/ function(LeadScore) {
    LeadScore["COLD"] = "COLD";
    LeadScore["WARM"] = "WARM";
    LeadScore["HOT"] = "HOT";
    LeadScore["QUALIFIED"] = "QUALIFIED";
    return LeadScore;
}({});
/**
 * Calculate lead score based on conversation engagement
 */ function calculateLeadScore(messageCount, hasContactInfo, hasCompleteCriteria, viewedProperties, budget) {
    let scoreValue = 0;
    // Engagement points
    scoreValue += messageCount * 5; // 5 points per message
    if (hasContactInfo) scoreValue += 30; // Big boost for contact info
    if (hasCompleteCriteria) scoreValue += 20; // Complete search criteria
    scoreValue += viewedProperties * 10; // 10 points per property viewed
    // Budget qualifier
    if (budget && budget >= 500000) scoreValue += 15; // Higher budget = more serious
    // Determine score tier
    let score;
    if (scoreValue >= 80 && hasContactInfo) {
        score = "QUALIFIED"; // Ready for agent contact
    } else if (scoreValue >= 50) {
        score = "HOT"; // Very engaged
    } else if (scoreValue >= 25) {
        score = "WARM"; // Moderately engaged
    } else {
        score = "COLD"; // Just started
    }
    return {
        score,
        scoreValue
    };
}
/**
 * Determine lead status based on conversation stage
 */ function determineLeadStatus(canSearch, hasSearched, hasScheduledShowing) {
    if (hasScheduledShowing) return 'CONTACTED'; // Agent engaged
    if (hasSearched) return 'QUALIFIED'; // Saw properties
    if (canSearch) return 'WORKING'; // Has criteria, ready to search
    return 'NEW_LEAD'; // Just started conversation
}
async function syncLeadToCRM(params) {
    const { sessionId, organizationId, contactInfo, propertyPreferences, messageCount, hasSearched = false, viewedProperties = [], lastMessage } = params;
    try {
        // Check if lead already exists for this session
        const existingLead = await prisma.leads.findFirst({
            where: {
                organization_id: organizationId,
                custom_fields: {
                    path: [
                        'chatbot_session_id'
                    ],
                    equals: sessionId
                }
            }
        });
        // Calculate lead score
        const hasContactInfo = !!(contactInfo?.email || contactInfo?.phone || contactInfo?.name);
        const hasCompleteCriteria = !!(propertyPreferences?.location && propertyPreferences?.maxPrice);
        const { score, scoreValue } = calculateLeadScore(messageCount, hasContactInfo, hasCompleteCriteria, viewedProperties.length, propertyPreferences?.maxPrice);
        // Determine status
        const status = determineLeadStatus(hasCompleteCriteria, hasSearched, false);
        // Build custom fields JSON
        const customFields = {
            chatbot_session_id: sessionId,
            property_preferences: propertyPreferences ? {
                location: propertyPreferences.location,
                maxPrice: propertyPreferences.maxPrice,
                minBedrooms: propertyPreferences.minBedrooms,
                minBathrooms: propertyPreferences.minBathrooms,
                mustHaveFeatures: propertyPreferences.mustHaveFeatures || [],
                niceToHaveFeatures: propertyPreferences.niceToHaveFeatures || [],
                propertyType: propertyPreferences.propertyType,
                timeline: propertyPreferences.timeline,
                isFirstTimeBuyer: propertyPreferences.isFirstTimeBuyer,
                currentSituation: propertyPreferences.currentSituation
            } : undefined,
            last_property_search: hasSearched ? new Date().toISOString() : undefined,
            viewed_properties: viewedProperties,
            chatbot_engagement: {
                message_count: messageCount,
                last_message: lastMessage,
                last_interaction: new Date().toISOString()
            }
        };
        if (existingLead) {
            // Update existing lead
            const updatedLead = await prisma.leads.update({
                where: {
                    id: existingLead.id
                },
                data: {
                    name: contactInfo?.name || existingLead.name,
                    email: contactInfo?.email || existingLead.email,
                    phone: contactInfo?.phone || existingLead.phone,
                    budget: propertyPreferences?.maxPrice ? propertyPreferences.maxPrice.toString() : existingLead.budget,
                    timeline: propertyPreferences?.timeline || existingLead.timeline,
                    score: score,
                    score_value: scoreValue,
                    status: status,
                    notes: `Last message: "${lastMessage.slice(0, 200)}"`,
                    custom_fields: customFields,
                    last_contact_at: new Date(),
                    updated_at: new Date()
                }
            });
            console.log(`✅ Updated lead ${updatedLead.id} (score: ${score}, status: ${status})`);
            return {
                leadId: updatedLead.id,
                isNew: false
            };
        } else {
            // Create new lead
            const newLead = await prisma.leads.create({
                data: {
                    organization_id: organizationId,
                    name: contactInfo?.name || 'Chatbot Lead',
                    email: contactInfo?.email || undefined,
                    phone: contactInfo?.phone || undefined,
                    source: 'CHATBOT',
                    status: status,
                    score: score,
                    score_value: scoreValue,
                    budget: propertyPreferences?.maxPrice ? propertyPreferences.maxPrice.toString() : undefined,
                    timeline: propertyPreferences?.timeline,
                    notes: `First message: "${lastMessage.slice(0, 200)}"`,
                    tags: [
                        'chatbot',
                        'real-estate'
                    ],
                    custom_fields: customFields,
                    last_contact_at: new Date()
                }
            });
            console.log(`✅ Created new lead ${newLead.id} (score: ${score}, status: ${status})`);
            return {
                leadId: newLead.id,
                isNew: true
            };
        }
    } catch (error) {
        console.error('❌ CRM sync error:', error);
        throw new Error('Failed to sync lead to CRM');
    }
}
async function logActivity(params) {
    const { organizationId, leadId, activityType, description, metadata } = params;
    try {
        // Find the lead to get assigned user
        const lead = await prisma.leads.findUnique({
            where: {
                id: leadId
            },
            select: {
                assigned_to_id: true
            }
        });
        await prisma.activities.create({
            data: {
                organization_id: organizationId,
                lead_id: leadId,
                contact_id: undefined,
                type: activityType === 'message' ? 'NOTE' : 'CALL',
                title: `Chatbot: ${activityType}`,
                description,
                metadata: metadata,
                completed_at: new Date(),
                assigned_to_id: lead?.assigned_to_id || undefined
            }
        });
        console.log(`📝 Logged activity: ${activityType} for lead ${leadId}`);
    } catch (error) {
        console.error('❌ Activity logging error:', error);
    // Don't throw - activity logging is non-critical
    }
}
async function trackPropertyView(params) {
    const { sessionId, organizationId, propertyId, propertyAddress } = params;
    try {
        // Find lead by session
        const lead = await prisma.leads.findFirst({
            where: {
                organization_id: organizationId,
                custom_fields: {
                    path: [
                        'chatbot_session_id'
                    ],
                    equals: sessionId
                }
            }
        });
        if (!lead) {
            console.warn('⚠️ No lead found for property view tracking');
            return;
        }
        // Update viewed properties
        const customFields = lead.custom_fields;
        const viewedProperties = customFields?.viewed_properties || [];
        if (!viewedProperties.includes(propertyId)) {
            viewedProperties.push(propertyId);
            await prisma.leads.update({
                where: {
                    id: lead.id
                },
                data: {
                    custom_fields: {
                        ...customFields,
                        viewed_properties: viewedProperties
                    }
                }
            });
            // Log activity
            await logActivity({
                organizationId,
                leadId: lead.id,
                activityType: 'property_view',
                description: `Viewed property: ${propertyAddress}`,
                metadata: {
                    property_id: propertyId,
                    property_address: propertyAddress
                }
            });
        }
    } catch (error) {
        console.error('❌ Property view tracking error:', error);
    // Don't throw - tracking is non-critical
    }
}
async function requestShowing(params) {
    const { sessionId, organizationId, propertyId, propertyAddress, requestedDate, requestedTime } = params;
    try {
        // Find lead by session
        const lead = await prisma.leads.findFirst({
            where: {
                organization_id: organizationId,
                custom_fields: {
                    path: [
                        'chatbot_session_id'
                    ],
                    equals: sessionId
                }
            }
        });
        if (!lead) {
            throw new Error('Lead not found for showing request');
        }
        // Find or assign default agent
        const assignedAgent = lead.assigned_to_id || await getDefaultAgent(organizationId);
        if (!assignedAgent) {
            throw new Error('No agent available for showing');
        }
        // Create appointment (showing request)
        const appointment = await prisma.appointments.create({
            data: {
                organization_id: organizationId,
                contact_id: undefined,
                assigned_to: assignedAgent,
                title: `Property Showing: ${propertyAddress}`,
                description: `Chatbot showing request for property ${propertyId}\nRequested by: ${lead.name || 'Unknown'}\nEmail: ${lead.email || 'N/A'}\nPhone: ${lead.phone || 'N/A'}`,
                start_time: requestedDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
                end_time: requestedDate ? new Date(requestedDate.getTime() + 60 * 60 * 1000) : new Date(Date.now() + 25 * 60 * 60 * 1000),
                status: 'PENDING',
                location: propertyAddress
            }
        });
        // Update lead status
        await prisma.leads.update({
            where: {
                id: lead.id
            },
            data: {
                status: 'CONTACTED',
                score: "QUALIFIED"
            }
        });
        // Log activity
        await logActivity({
            organizationId,
            leadId: lead.id,
            activityType: 'showing_request',
            description: `Requested showing for ${propertyAddress}${requestedDate ? ` on ${requestedDate.toDateString()}` : ''}`,
            metadata: {
                property_id: propertyId,
                property_address: propertyAddress,
                appointment_id: appointment.id
            }
        });
        console.log(`📅 Created showing request ${appointment.id} for lead ${lead.id}`);
        return {
            appointmentId: appointment.id
        };
    } catch (error) {
        console.error('❌ Showing request error:', error);
        throw new Error('Failed to create showing request');
    }
}
/**
 * Get default agent for organization (for auto-assignment)
 */ async function getDefaultAgent(organizationId) {
    try {
        // Find first active admin or employee
        const user = await prisma.users.findFirst({
            where: {
                organization_id: organizationId,
                role: {
                    in: [
                        'ADMIN',
                        'EMPLOYEE'
                    ]
                }
            },
            orderBy: {
                created_at: 'asc'
            }
        });
        return user?.id || null;
    } catch (error) {
        console.error('❌ Default agent lookup error:', error);
        return null;
    }
}
async function getLeadSummary(sessionId, organizationId) {
    try {
        const lead = await prisma.leads.findFirst({
            where: {
                organization_id: organizationId,
                custom_fields: {
                    path: [
                        'chatbot_session_id'
                    ],
                    equals: sessionId
                }
            }
        });
        if (!lead) {
            throw new Error('Lead not found');
        }
        const customFields = lead.custom_fields;
        const preferences = customFields?.property_preferences || null;
        const engagement = customFields?.chatbot_engagement || {};
        const viewedProperties = customFields?.viewed_properties || [];
        return {
            lead,
            preferences,
            engagementMetrics: {
                messageCount: engagement.message_count || 0,
                viewedProperties: viewedProperties.length,
                score: lead.score,
                status: lead.status
            }
        };
    } catch (error) {
        console.error('❌ Lead summary error:', error);
        throw new Error('Failed to get lead summary');
    }
}
}),
"[project]/(chatbot)/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/chat/route.ts
__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$groq$2d$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/groq-sdk/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
(()=>{
    const e = new Error("Cannot find module '@/lib/industries/configs'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/lib/services/rag-service'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/lib/modules/real-estate/services/rentcast-service'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$lib$2f$schemas$2f$chat$2d$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/lib/schemas/chat-request.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$ai$2f$data$2d$extraction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/lib/ai/data-extraction.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$services$2f$crm$2d$integration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/lib/services/crm-integration.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const groq = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$groq$2d$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
    apiKey: process.env.GROQ_API_KEY
});
// Session state cache (in production, use Redis or database)
const sessionStateCache = new Map();
async function POST(req) {
    try {
        // Parse and validate request body
        const body = await req.json();
        const validated = __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$lib$2f$schemas$2f$chat$2d$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatRequestSchema"].parse(body);
        const { messages, industry = 'strive', sessionId, organizationId = 'default_org' } = validated;
        // Load industry configuration
        const config = await loadIndustryConfig(industry);
        // Get the latest user message
        const latestUserMessage = messages[messages.length - 1];
        // 🎯 PHASE 1: INTELLIGENT DATA EXTRACTION
        console.log('🧠 Extracting data from user message...');
        const extraction = await (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$ai$2f$data$2d$extraction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractDataFromMessage"])(latestUserMessage.content, messages.slice(-5).map((m)=>({
                role: m.role,
                content: m.content
            })));
        console.log('✅ Extracted:', {
            fields: extraction.extractedFields,
            confidence: extraction.confidence,
            preferences: (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$ai$2f$data$2d$extraction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatPreferences"])(extraction.propertyPreferences)
        });
        // Get or initialize session state
        let sessionPreferences = sessionStateCache.get(sessionId) || {};
        // Merge extracted data with existing session state
        sessionPreferences = (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$ai$2f$data$2d$extraction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeExtractedData"])(sessionPreferences, extraction.propertyPreferences);
        sessionStateCache.set(sessionId, sessionPreferences);
        console.log('💾 Current session state:', (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$ai$2f$data$2d$extraction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatPreferences"])(sessionPreferences));
        // Check if we can search now
        const canSearchNow = (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$ai$2f$data$2d$extraction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasMinimumSearchCriteria"])(sessionPreferences);
        console.log('🔍 Can search:', canSearchNow);
        // Build conversation history context
        const conversationHistory = {
            stage: determineConversationStage(messages),
            messageCount: messages.length,
            problemsDiscussed: extractProblemsDiscussed(messages),
            currentPreferences: sessionPreferences,
            extractedThisMessage: extraction.extractedFields,
            canSearch: canSearchNow
        };
        // 🔥 RAG ENHANCEMENT: Get semantic context
        console.log('🔍 Searching for similar conversations...');
        const ragContext = await RAGService.buildRAGContext(latestUserMessage.content, industry, conversationHistory);
        console.log('✅ RAG Context:', {
            detectedProblems: ragContext.searchResults.detectedProblems,
            confidence: ragContext.searchResults.confidence.overallConfidence,
            suggestedApproach: ragContext.guidance.suggestedApproach
        });
        // Build enhanced system prompt with RAG context AND extracted data
        const enhancedSystemPrompt = buildEnhancedSystemPrompt(config.systemPrompt, ragContext, sessionPreferences, extraction.extractedFields, canSearchNow);
        // Prepare messages for Groq
        const groqMessages = [
            {
                role: 'system',
                content: enhancedSystemPrompt
            },
            ...messages.filter((m)=>m.role !== 'system').map((m)=>({
                    role: m.role,
                    content: m.content
                }))
        ];
        // Stream response from Groq
        const stream = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: true
        });
        // Create readable stream
        const encoder = new TextEncoder();
        let fullResponse = '';
        const readableStream = new ReadableStream({
            async start (controller) {
                try {
                    // Stream LLM response
                    for await (const chunk of stream){
                        const content = chunk.choices[0]?.delta?.content || '';
                        fullResponse += content;
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                            content
                        })}\n\n`));
                    }
                    // 🏠 PROPERTY SEARCH: Check if response contains property search request OR if we can auto-search
                    const shouldSearch = industry === 'real-estate' && (fullResponse.includes('<property_search>') || canSearchNow);
                    if (shouldSearch) {
                        try {
                            console.log('🏠 Property search triggered');
                            let searchParams;
                            // Check if AI provided explicit search parameters
                            const searchMatch = fullResponse.match(/<property_search>([\s\S]*?)<\/property_search>/);
                            if (searchMatch) {
                                // AI provided explicit search params
                                searchParams = JSON.parse(searchMatch[1]);
                                console.log('🔍 Using AI-provided search params:', searchParams);
                            } else if (canSearchNow) {
                                // Auto-search using extracted session state
                                searchParams = {
                                    location: sessionPreferences.location,
                                    maxPrice: sessionPreferences.maxPrice,
                                    minBedrooms: sessionPreferences.minBedrooms || 2,
                                    minBathrooms: sessionPreferences.minBathrooms || 1,
                                    mustHaveFeatures: sessionPreferences.mustHaveFeatures || [],
                                    niceToHaveFeatures: sessionPreferences.niceToHaveFeatures,
                                    propertyType: sessionPreferences.propertyType === 'any' ? undefined : sessionPreferences.propertyType
                                };
                                console.log('🔍 Auto-searching with extracted params:', searchParams);
                            } else {
                                // Skip search
                                throw new Error('Cannot search: minimum criteria not met');
                            }
                            // Fetch properties from RentCast
                            const properties = await RentCastService.searchProperties(searchParams);
                            console.log(`✅ Found ${properties.length} properties`);
                            // Match and score properties
                            const matches = RentCastService.matchProperties(properties, searchParams);
                            console.log(`🎯 Top ${matches.length} matches selected`);
                            // Send property results to client
                            const propertyData = JSON.stringify({
                                type: 'property_results',
                                properties: matches
                            });
                            controller.enqueue(encoder.encode(`data: ${propertyData}\n\n`));
                        } catch (propertyError) {
                            console.error('❌ Property search error:', propertyError);
                            const errorData = JSON.stringify({
                                type: 'property_search_error',
                                error: 'Failed to search properties. Please try again.'
                            });
                            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                        }
                    }
                    // 🔥 STORE CONVERSATION: Save for future learning
                    console.log('💾 Storing conversation for learning...');
                    await RAGService.storeConversation({
                        industry,
                        sessionId,
                        userMessage: latestUserMessage.content,
                        assistantResponse: fullResponse,
                        conversationStage: conversationHistory.stage,
                        outcome: 'in_progress',
                        bookingCompleted: false,
                        problemDetected: ragContext.searchResults.detectedProblems[0],
                        solutionPresented: ragContext.searchResults.recommendedSolutions[0]
                    });
                    // 💼 CRM INTEGRATION: Sync lead to platform CRM
                    if (industry === 'real-estate') {
                        try {
                            console.log('💼 Syncing lead to CRM...');
                            const { leadId, isNew } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$services$2f$crm$2d$integration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncLeadToCRM"])({
                                sessionId,
                                organizationId,
                                contactInfo: extraction.contactInfo,
                                propertyPreferences: sessionPreferences,
                                messageCount: messages.length,
                                hasSearched: shouldSearch,
                                viewedProperties: [],
                                lastMessage: latestUserMessage.content
                            });
                            console.log(`✅ ${isNew ? 'Created' : 'Updated'} lead ${leadId} in CRM`);
                            // Log conversation activity
                            await (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$services$2f$crm$2d$integration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logActivity"])({
                                organizationId,
                                leadId,
                                activityType: 'message',
                                description: `Chatbot conversation: "${latestUserMessage.content.slice(0, 100)}..."`,
                                metadata: {
                                    extracted_fields: extraction.extractedFields,
                                    can_search: canSearchNow,
                                    preferences: sessionPreferences
                                }
                            });
                            // Log property search activity if triggered
                            if (shouldSearch) {
                                await (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$services$2f$crm$2d$integration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logActivity"])({
                                    organizationId,
                                    leadId,
                                    activityType: 'property_search',
                                    description: `Searched properties in ${sessionPreferences.location} under $${sessionPreferences.maxPrice?.toLocaleString()}`,
                                    metadata: {
                                        search_params: sessionPreferences
                                    }
                                });
                            }
                        } catch (crmError) {
                            console.error('❌ CRM sync error (non-critical):', crmError);
                        // Don't fail the request if CRM sync fails
                        }
                    }
                    // Send completion signal
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (error) {
                    console.error('❌ Streaming error:', error);
                    controller.error(error);
                }
            }
        });
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            }
        });
    } catch (error) {
        // Handle validation errors
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid request format',
                details: error.issues.map((e)=>({
                        path: e.path.join('.'),
                        message: e.message
                    }))
            }, {
                status: 400
            });
        }
        // Handle other errors
        console.error('❌ Chat API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
/**
 * Build enhanced system prompt with RAG context AND conversation state
 */ function buildEnhancedSystemPrompt(basePrompt, ragContext, sessionPreferences, extractedFields, canSearch) {
    const { searchResults, guidance } = ragContext;
    let enhancement = '\n\n## 🎯 CONTEXTUAL INTELLIGENCE\n\n';
    // Add conversation state awareness
    enhancement += `### 📊 Current Conversation State:\n\n`;
    if (Object.keys(sessionPreferences).length > 0) {
        enhancement += `**Information Already Collected:**\n`;
        if (sessionPreferences.location) enhancement += `- 📍 Location: ${sessionPreferences.location}\n`;
        if (sessionPreferences.maxPrice) enhancement += `- 💰 Budget: $${sessionPreferences.maxPrice.toLocaleString()}\n`;
        if (sessionPreferences.minBedrooms) enhancement += `- 🛏️ Bedrooms: ${sessionPreferences.minBedrooms}+\n`;
        if (sessionPreferences.minBathrooms) enhancement += `- 🛁 Bathrooms: ${sessionPreferences.minBathrooms}+\n`;
        if (sessionPreferences.propertyType) enhancement += `- 🏠 Type: ${sessionPreferences.propertyType}\n`;
        if (sessionPreferences.mustHaveFeatures && sessionPreferences.mustHaveFeatures.length > 0) {
            enhancement += `- ✨ Must-have features: ${sessionPreferences.mustHaveFeatures.join(', ')}\n`;
        }
        enhancement += '\n';
    }
    if (extractedFields.length > 0) {
        enhancement += `**Just Extracted from Last Message:** ${extractedFields.join(', ')}\n\n`;
    }
    // Search readiness
    if (canSearch) {
        enhancement += `🚀 **READY TO SEARCH!** You have location + budget. You can trigger a property search NOW by outputting the <property_search> format!\n\n`;
    } else {
        const missing = [];
        if (!sessionPreferences.location) missing.push('location');
        if (!sessionPreferences.maxPrice) missing.push('budget');
        if (missing.length > 0) {
            enhancement += `❌ **Cannot search yet.** Missing: ${missing.join(', ')}\n`;
            enhancement += `Ask for these naturally in your next response!\n\n`;
        }
    }
    // RAG-Enhanced Guidance
    if (searchResults.detectedProblems.length > 0) {
        enhancement += `### 💡 Similar Conversations:\n`;
        searchResults.detectedProblems.forEach((problem)=>{
            enhancement += `- ${problem}\n`;
        });
        enhancement += '\n';
    }
    if (guidance.suggestedApproach) {
        enhancement += `### 🎯 Recommended Approach:\n${guidance.suggestedApproach}\n\n`;
    }
    enhancement += `**REMEMBER:** Don't ask for information you already have! Reference it naturally instead.\n`;
    enhancement += `**REMEMBER:** If you can search now, do it! Don't keep asking unnecessary questions.\n`;
    return basePrompt + enhancement;
}
/**
 * Determine current conversation stage
 */ function determineConversationStage(messages) {
    const userMessages = messages.filter((m)=>m.role === 'user');
    if (userMessages.length <= 2) return 'discovery';
    if (userMessages.length <= 4) return 'qualifying';
    if (userMessages.length <= 6) return 'solutioning';
    return 'closing';
}
/**
 * Extract problems discussed so far
 */ function extractProblemsDiscussed(messages) {
    const problems = [];
    const problemKeywords = [
        'losing customers',
        'churn',
        'defects',
        'quality',
        'support tickets',
        'fraud',
        'maintenance',
        'inventory',
        // Real estate specific
        'looking for',
        'buy',
        'sell',
        'property',
        'home',
        'budget',
        'prequalified',
        'market'
    ];
    messages.forEach((message)=>{
        const content = message.content.toLowerCase();
        problemKeywords.forEach((keyword)=>{
            if (content.includes(keyword) && !problems.includes(keyword)) {
                problems.push(keyword);
            }
        });
    });
    return problems;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__273c156f._.js.map