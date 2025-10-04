(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/utils/parentCommunication.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/utils/parentCommunication.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
'use client';
;
class ParentCommunication {
    debugLog(message) {
        let force = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        if (this.debugMode || force) {
            console.log("[ParentComm] ".concat(message));
        }
    }
    detectParentOrigin() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Try to get parent origin from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const parentParam = urlParams.get('parent');
        if (parentParam) {
            this.debugLog("🎯 Parent origin from URL: ".concat(parentParam));
            return parentParam;
        }
        // Try to detect from document referrer
        if (document.referrer) {
            try {
                const referrerUrl = new URL(document.referrer);
                this.debugLog("🎯 Parent origin from referrer: ".concat(referrerUrl.origin));
                return referrerUrl.origin;
            } catch (e) {
                this.debugLog("⚠️ Could not parse referrer: ".concat(e));
            }
        }
        this.debugLog('🎯 Using default parent origin: https://strivetech.ai');
        return 'https://strivetech.ai';
    }
    setupEventListeners() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Listen for messages from parent
        window.addEventListener('message', this.handleParentMessage.bind(this));
        // Notify parent when closing
        window.addEventListener('beforeunload', ()=>{
            this.sendToParent('close');
        });
        // Handle visibility changes
        document.addEventListener('visibilitychange', ()=>{
            this.sendToParent('visibility', {
                visible: document.visibilityState === 'visible'
            });
        });
    }
    setupResizeObserver() {
        if ("object" === 'undefined' || !window.ResizeObserver) return;
        const resizeObserver = new ResizeObserver(()=>{
            this.notifyResize();
        });
        // Observe body for size changes
        resizeObserver.observe(document.body);
        // Also observe the chat container if it exists
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            resizeObserver.observe(chatContainer);
        }
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
                this.handleVisibilityChange(data === null || data === void 0 ? void 0 : data.visible);
                break;
            case 'mode':
                this.handleModeChange(data === null || data === void 0 ? void 0 : data.mode);
                break;
            case 'container_resize':
                this.handleContainerResize(data === null || data === void 0 ? void 0 : data.width, data === null || data === void 0 ? void 0 : data.height);
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
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const event = new CustomEvent('chatbot:visibility', {
            detail: {
                visible: isVisible
            }
        });
        window.dispatchEvent(event);
    }
    handleModeChange(mode) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const event = new CustomEvent('chatbot:mode', {
            detail: {
                mode
            }
        });
        window.dispatchEvent(event);
    }
    handleContainerResize(width, height) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const event = new CustomEvent('chatbot:resize', {
            detail: {
                width,
                height
            }
        });
        window.dispatchEvent(event);
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
        this.debugLog("🖼️ iframe check: ".concat("object" !== 'undefined' && window.parent !== window), true);
        this.debugLog("📍 current URL: ".concat(("TURBOPACK compile-time truthy", 1) ? window.location.href : "TURBOPACK unreachable"), true);
        this.debugLog("📊 ready status: ".concat(this.isReady), true);
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
        if ("object" === 'undefined' || typeof document === 'undefined') return;
        const height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        const width = Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
        this.sendToParent('resize', {
            height,
            width
        });
    }
    notifyError(error) {
        let code = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'UNKNOWN_ERROR', recoverable = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
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
    notifyNavigate(url) {
        let target = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : '_self';
        this.sendToParent('navigate', {
            url,
            target
        });
    }
    notifyAnalytics(event) {
        let properties = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        this.sendToParent('analytics', {
            event,
            properties,
            timestamp: Date.now()
        });
    }
    detectMode() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const path = window.location.pathname;
        if (path.includes('/widget')) return 'widget';
        if (path.includes('/full')) return 'full';
        return 'full';
    }
    sendToParent(type) {
        let data = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const message = {
            type,
            data,
            timestamp: Date.now(),
            source: 'sai-chatbot'
        };
        // Queue messages if not ready yet
        if (!this.isReady && type !== 'ready') {
            this.messageQueue.push(message);
            return;
        }
        try {
            // Send to all known origins for maximum compatibility
            window.parent.postMessage(message, '*');
            window.parent.postMessage(message, 'https://strive-website-8xot95578-strive-tech.vercel.app');
            this.debugLog("✅ PostMessage sent: ".concat(JSON.stringify(message)), true);
        } catch (error) {
            this.debugLog("❌ PostMessage failed: ".concat(error), true);
        }
    }
    flushMessageQueue() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        while(this.messageQueue.length > 0){
            const message = this.messageQueue.shift();
            window.parent.postMessage(message, '*');
            window.parent.postMessage(message, 'https://strive-website-8xot95578-strive-tech.vercel.app');
        }
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "debugMode", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "allowedOrigins", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "parentOrigin", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "messageQueue", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "isReady", void 0);
        // Check for debug mode
        if ("TURBOPACK compile-time truthy", 1) {
            const urlParams = new URLSearchParams(window.location.search);
            this.debugMode = urlParams.get('debug') === 'true' || ("TURBOPACK compile-time value", "development") === 'development';
        } else //TURBOPACK unreachable
        ;
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
        if ("TURBOPACK compile-time truthy", 1) {
            this.setupEventListeners();
            this.setupResizeObserver();
            // Send ready message immediately when DOM is loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', ()=>{
                    this.debugLog('🚀 DOM loaded - sending immediate ready message', true);
                    this.sendReadyMessage();
                });
            } else {
                this.debugLog('🚀 DOM already loaded - sending immediate ready message', true);
                setTimeout(()=>this.sendReadyMessage(), 100);
            }
        }
        this.debugLog('🔧 ParentCommunication initialized');
        this.debugLog("🐛 Debug mode: ".concat(this.debugMode ? 'ENABLED' : 'disabled'));
        this.debugLog("🌐 Parent origin: ".concat(this.parentOrigin));
        this.debugLog("🖼️ In iframe: ".concat("object" !== 'undefined' && window.parent !== window));
    }
}
// Create and export singleton instance
const parentComm = new ParentCommunication();
// Expose for debugging in development
if ("TURBOPACK compile-time truthy", 1) {
    window.parentComm = parentComm;
}
const __TURBOPACK__default__export__ = parentComm;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/page.tsx
__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module './components/chat/ChatContainer'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$parentCommunication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/parentCommunication.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function Home() {
    _s();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            setMounted(true);
            document.documentElement.classList.add('dark');
            document.body.classList.add('fullpage-mode');
            // Initialize parent communication
            if ("TURBOPACK compile-time truthy", 1) {
                __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$parentCommunication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].initializeWhenReady();
                // Backup messages
                const timer1 = setTimeout({
                    "Home.useEffect.timer1": ()=>{
                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$parentCommunication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].initializeWhenReady();
                    }
                }["Home.useEffect.timer1"], 1000);
                const timer3 = setTimeout({
                    "Home.useEffect.timer3": ()=>{
                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$parentCommunication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].initializeWhenReady();
                    }
                }["Home.useEffect.timer3"], 3000);
                return ({
                    "Home.useEffect": ()=>{
                        clearTimeout(timer1);
                        clearTimeout(timer3);
                    }
                })["Home.useEffect"];
            }
        }
    }["Home.useEffect"], []);
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 mx-auto mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 min-h-screen flex flex-col py-6 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-4xl mx-auto flex-1 flex flex-col",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatContainer, {
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
            ("TURBOPACK compile-time value", "development") === 'development' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
_s(Home, "LrrVfNW3d1raFE0BNzCTILYmIfo=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_891fe3eb._.js.map