module.exports = [
"[project]/app/utils/parentCommunication.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/utils/parentCommunication.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
'use client';
class ParentCommunication {
    debugMode;
    allowedOrigins;
    parentOrigin;
    messageQueue;
    isReady;
    constructor(){
        // Check for debug mode
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            this.debugMode = false;
        }
        // Allow both production and development origins
        this.allowedOrigins = [
            'https://strivetech.ai',
            'https://www.strivetech.ai',
            'https://strive-website-8xot95578-strive-tech.vercel.app',
            'http://localhost:5000',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173'
        ];
        this.parentOrigin = this.detectParentOrigin();
        this.messageQueue = [];
        this.isReady = false;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        this.debugLog('🔧 ParentCommunication initialized');
        this.debugLog(`🐛 Debug mode: ${this.debugMode ? 'ENABLED' : 'disabled'}`);
        this.debugLog(`🌐 Parent origin: ${this.parentOrigin}`);
        this.debugLog(`🖼️ In iframe: ${"undefined" !== 'undefined' && window.parent !== window}`);
    }
    debugLog(message, force = false) {
        if (this.debugMode || force) {
            console.log(`[ParentComm] ${message}`);
        }
    }
    detectParentOrigin() {
        if ("TURBOPACK compile-time truthy", 1) return 'https://strivetech.ai';
        //TURBOPACK unreachable
        ;
        // Try to get parent origin from URL parameter
        const urlParams = undefined;
        const parentParam = undefined;
    }
    setupEventListeners() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
    setupResizeObserver() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const resizeObserver = undefined;
        // Also observe the chat container if it exists
        const chatContainer = undefined;
    }
    handleParentMessage(event) {
        // Security: validate origin
        if (!this.allowedOrigins.includes(event.origin)) {
            console.warn('Ignored message from untrusted origin:', event.origin);
            return;
        }
        const { type, data, source } = event.data || {};
        // Only handle messages from website
        if (source && source !== 'strivetech-website') {
            console.warn('Ignored message from unknown source:', source);
            return;
        }
        switch(type){
            case 'visibility':
                this.handleVisibilityChange(data?.visible);
                break;
            case 'mode':
                this.handleModeChange(data?.mode);
                break;
            case 'container_resize':
                this.handleContainerResize(data?.width, data?.height);
                break;
            case 'ping':
                this.sendToParent('pong', {
                    timestamp: Date.now()
                });
                break;
            default:
                console.log('Unknown message type:', type);
        }
    }
    handleVisibilityChange(isVisible) {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const event = undefined;
    }
    handleModeChange(mode) {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const event = undefined;
    }
    handleContainerResize(width, height) {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const event = undefined;
    }
    sendReadyMessage() {
        this.debugLog('📤 Sending immediate ready message', true);
        this.sendToParent('ready', {
            version: '1.0.0',
            mode: this.detectMode(),
            capabilities: [
                'chat',
                'streaming',
                'analytics'
            ],
            timestamp: Date.now()
        });
    }
    initializeWhenReady() {
        this.debugLog('🔧 initializeWhenReady called', true);
        this.debugLog(`🖼️ iframe check: ${"undefined" !== 'undefined' && window.parent !== window}`, true);
        this.debugLog(`📍 current URL: ${("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 'N/A'}`, true);
        this.debugLog(`📊 ready status: ${this.isReady}`, true);
        if (!this.isReady) {
            this.debugLog('🚀 Sending initial ready message...', true);
            this.notifyReady();
        } else {
            this.debugLog('⚠️ Already ready, sending ready message again for reliability...', true);
            this.sendToParent('ready', {
                version: '1.0.0',
                mode: this.detectMode(),
                capabilities: [
                    'chat',
                    'streaming',
                    'analytics'
                ],
                timestamp: Date.now()
            });
        }
    }
    notifyReady() {
        this.isReady = true;
        this.debugLog('📤 Sending ready message to parent...', true);
        this.sendToParent('ready', {
            version: '1.0.0',
            mode: this.detectMode(),
            capabilities: [
                'chat',
                'streaming',
                'analytics'
            ],
            timestamp: Date.now()
        });
        this.flushMessageQueue();
    }
    notifyResize() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const height = undefined;
        const width = undefined;
    }
    notifyError(error, code = 'UNKNOWN_ERROR', recoverable = true) {
        this.sendToParent('error', {
            error: error.message || 'Unknown error',
            code,
            recoverable,
            stack: error.stack,
            timestamp: Date.now()
        });
    }
    notifyMinimize() {
        this.sendToParent('minimize', {});
    }
    notifyClose() {
        this.sendToParent('close', {});
    }
    notifyNavigate(url, target = '_self') {
        this.sendToParent('navigate', {
            url,
            target
        });
    }
    notifyAnalytics(event, properties = {}) {
        this.sendToParent('analytics', {
            event,
            properties,
            timestamp: Date.now()
        });
    }
    detectMode() {
        if ("TURBOPACK compile-time truthy", 1) return 'full';
        //TURBOPACK unreachable
        ;
        const path = undefined;
    }
    sendToParent(type, data = {}) {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const message = undefined;
    }
    flushMessageQueue() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
}
// Create and export singleton instance
const parentComm = new ParentCommunication();
// Expose for debugging in development
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const __TURBOPACK__default__export__ = parentComm;
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/page.tsx
__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module './components/chat/ChatContainer'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$parentCommunication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/parentCommunication.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function Home() {
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
        document.documentElement.classList.add('dark');
        document.body.classList.add('fullpage-mode');
        // Initialize parent communication
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, []);
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 mx-auto mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/images/strive-triangle.svg",
                            alt: "Loading",
                            className: "w-full h-full animate-spin",
                            style: {
                                filter: 'drop-shadow(0 8px 20px rgba(245, 104, 52, 0.5))'
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 42,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-200 font-medium text-lg",
                        children: "Loading AI Solutions Platform..."
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 40,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 39,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 min-h-screen flex flex-col py-6 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-4xl mx-auto flex-1 flex flex-col",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "flex-1 min-h-0",
                        initial: {
                            opacity: 0,
                            scale: 0.9,
                            y: 60
                        },
                        animate: {
                            opacity: 1,
                            scale: 1,
                            y: 0
                        },
                        transition: {
                            duration: 1,
                            ease: "easeOut",
                            type: "spring",
                            stiffness: 100,
                            delay: 0.2
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatContainer, {
                            mode: "full"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 73,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            ("TURBOPACK compile-time value", "development") === 'development' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-4 left-4 text-xs text-gray-400 bg-gray-800 bg-opacity-80 px-3 py-2 rounded-lg backdrop-blur-sm shadow-lg border border-gray-600",
                children: "Dev Mode • Next.js"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_631b72bb._.js.map