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
async function POST(req) {
    try {
        // Parse and validate request body
        const body = await req.json();
        const validated = __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$lib$2f$schemas$2f$chat$2d$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatRequestSchema"].parse(body);
        const { messages, industry = 'strive', sessionId } = validated;
        // Load industry configuration
        const config = await loadIndustryConfig(industry);
        // Get the latest user message
        const latestUserMessage = messages[messages.length - 1];
        // Build conversation history context
        const conversationHistory = {
            stage: determineConversationStage(messages),
            messageCount: messages.length,
            problemsDiscussed: extractProblemsDiscussed(messages)
        };
        // 🔥 RAG ENHANCEMENT: Get semantic context
        console.log('🔍 Searching for similar conversations...');
        const ragContext = await RAGService.buildRAGContext(latestUserMessage.content, industry, conversationHistory);
        console.log('✅ RAG Context:', {
            detectedProblems: ragContext.searchResults.detectedProblems,
            confidence: ragContext.searchResults.confidence.overallConfidence,
            suggestedApproach: ragContext.guidance.suggestedApproach
        });
        // Build enhanced system prompt with RAG context
        const enhancedSystemPrompt = buildEnhancedSystemPrompt(config.systemPrompt, ragContext);
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
                    // 🏠 PROPERTY SEARCH: Check if response contains property search request
                    if (industry === 'real-estate' && fullResponse.includes('<property_search>')) {
                        try {
                            console.log('🏠 Property search detected in response');
                            // Extract search parameters from LLM response
                            const searchMatch = fullResponse.match(/<property_search>([\s\S]*?)<\/property_search>/);
                            if (searchMatch) {
                                const searchParams = JSON.parse(searchMatch[1]);
                                console.log('🔍 Searching properties with params:', searchParams);
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
                            }
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
 * Build enhanced system prompt with RAG context
 */ function buildEnhancedSystemPrompt(basePrompt, ragContext) {
    const { searchResults, guidance } = ragContext;
    let enhancement = '\n\n## 🎯 CONTEXTUAL INTELLIGENCE (RAG-Enhanced)\n\n';
    // Add detected problems
    if (searchResults.detectedProblems.length > 0) {
        enhancement += `**Similar Conversations Detected These Problems:**\n`;
        searchResults.detectedProblems.forEach((problem)=>{
            enhancement += `- ${problem}\n`;
        });
        enhancement += '\n';
    }
    // Add proven approach
    if (searchResults.bestPattern) {
        enhancement += `**Proven Approach (${Math.round(searchResults.bestPattern.conversionScore * 100)}% conversion rate):**\n`;
        enhancement += `This type of conversation typically succeeds when you focus on quantifying the problem's impact and showing clear ROI.\n\n`;
    }
    // Add guidance
    enhancement += `**Recommended Strategy:**\n`;
    enhancement += `${guidance.suggestedApproach}\n\n`;
    if (guidance.keyPoints.length > 0) {
        enhancement += `**Key Points to Include:**\n`;
        guidance.keyPoints.forEach((point)=>{
            enhancement += `- ${point}\n`;
        });
        enhancement += '\n';
    }
    if (guidance.avoidTopics && guidance.avoidTopics.length > 0) {
        enhancement += `**Topics to Avoid:**\n`;
        guidance.avoidTopics.forEach((topic)=>{
            enhancement += `- ${topic}\n`;
        });
        enhancement += '\n';
    }
    enhancement += `**Confidence Level:** ${Math.round(searchResults.confidence.overallConfidence * 100)}%\n`;
    enhancement += `**Urgency:** ${guidance.urgencyLevel}\n`;
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

//# sourceMappingURL=%5Broot-of-the-server%5D__a09da1cb._.js.map