(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/(chatbot)/components/(web)/shared/avatars.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// components/(web)/shared/avatars.tsx
__turbopack_context__.s([
    "LoadingSaiAvatar",
    ()=>LoadingSaiAvatar,
    "MessageSaiAvatar",
    ()=>MessageSaiAvatar,
    "SaiAvatar",
    ()=>SaiAvatar,
    "UserAvatar",
    ()=>UserAvatar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-client] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-round.js [app-client] (ecmascript) <export default as UserRound>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
'use client';
;
;
;
const MOBILE_AVATAR_SIZE = 65;
const DESKTOP_AVATAR_SIZE = 80;
// Bot icon component
const WhiteBotIcon = ({ size = 50, className = "", style = {} })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center justify-center ${className}`,
        style: {
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 flex items-center justify-center shadow-lg ring-2 ring-white",
            style: {
                width: `${size * 0.8}px`,
                height: `${size * 0.8}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                size: size * 0.45,
                className: "text-white",
                strokeWidth: 2
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
            lineNumber: 28,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
        lineNumber: 17,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c = WhiteBotIcon;
const UserAvatar = ({ size = 50, className = "" })=>{
    _s();
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UserAvatar.useEffect": ()=>{
            const checkMobile = {
                "UserAvatar.useEffect.checkMobile": ()=>setIsMobile(window.innerWidth < 768)
            }["UserAvatar.useEffect.checkMobile"];
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return ({
                "UserAvatar.useEffect": ()=>window.removeEventListener('resize', checkMobile)
            })["UserAvatar.useEffect"];
        }
    }["UserAvatar.useEffect"], []);
    const avatarSize = isMobile ? MOBILE_AVATAR_SIZE : size;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        className: `flex items-center justify-center ${className}`,
        style: {
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
        },
        whileHover: {
            scale: 1.1
        },
        transition: {
            duration: 0.2
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center shadow-lg ring-2 ring-white",
            style: {
                width: `${avatarSize * 0.8}px`,
                height: `${avatarSize * 0.8}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__["UserRound"], {
                size: avatarSize * 0.45,
                className: "text-white",
                strokeWidth: 2,
                style: {
                    display: 'block'
                }
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
            lineNumber: 70,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(UserAvatar, "0VTTNJATKABQPGLm9RVT0tKGUgU=");
_c1 = UserAvatar;
// Base avatar component
const BaseAvatar = ({ size = 50, isAnimating = false, animationConfig = {}, className = "", style = {} })=>{
    return isAnimating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        className: className,
        animate: animationConfig.animate,
        transition: animationConfig.transition,
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WhiteBotIcon, {
            size: size
        }, void 0, false, {
            fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
            lineNumber: 111,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
        lineNumber: 100,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WhiteBotIcon, {
        size: size,
        className: className,
        style: style
    }, void 0, false, {
        fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c2 = BaseAvatar;
const SaiAvatar = ({ size = 60, className = "" })=>{
    _s1();
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SaiAvatar.useEffect": ()=>{
            const checkMobile = {
                "SaiAvatar.useEffect.checkMobile": ()=>setIsMobile(window.innerWidth < 768)
            }["SaiAvatar.useEffect.checkMobile"];
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return ({
                "SaiAvatar.useEffect": ()=>window.removeEventListener('resize', checkMobile)
            })["SaiAvatar.useEffect"];
        }
    }["SaiAvatar.useEffect"], []);
    const avatarSize = isMobile ? MOBILE_AVATAR_SIZE : size;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        className: `flex items-center justify-center relative ${className}`,
        whileHover: {
            scale: 1.2
        },
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "absolute inset-0 rounded-full bg-primary-500",
                animate: {
                    scale: [
                        1,
                        1.4,
                        1.2,
                        1.6,
                        1
                    ],
                    opacity: [
                        0.1,
                        0.3,
                        0.15,
                        0.4,
                        0.1
                    ],
                    filter: [
                        "blur(8px) brightness(1)",
                        "blur(12px) brightness(1.2)",
                        "blur(10px) brightness(1.1)",
                        "blur(15px) brightness(1.3)",
                        "blur(8px) brightness(1)"
                    ]
                },
                transition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "reverse"
                },
                style: {
                    width: `${avatarSize + 30}px`,
                    height: `${avatarSize + 30}px`,
                    left: '-15px',
                    top: '-15px'
                }
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
                lineNumber: 137,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BaseAvatar, {
                size: avatarSize,
                className: "relative z-10",
                isAnimating: true,
                animationConfig: {
                    animate: {
                        filter: [
                            'drop-shadow(0 8px 16px rgba(255, 255, 255, 0.4)) brightness(1)',
                            'drop-shadow(0 12px 24px rgba(255, 255, 255, 0.6)) brightness(1.1)',
                            'drop-shadow(0 8px 16px rgba(255, 255, 255, 0.4)) brightness(1)'
                        ]
                    },
                    transition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
        lineNumber: 132,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(SaiAvatar, "0VTTNJATKABQPGLm9RVT0tKGUgU=");
_c3 = SaiAvatar;
const LoadingSaiAvatar = ({ size = 50 })=>{
    _s2();
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LoadingSaiAvatar.useEffect": ()=>{
            const checkMobile = {
                "LoadingSaiAvatar.useEffect.checkMobile": ()=>setIsMobile(window.innerWidth < 768)
            }["LoadingSaiAvatar.useEffect.checkMobile"];
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return ({
                "LoadingSaiAvatar.useEffect": ()=>window.removeEventListener('resize', checkMobile)
            })["LoadingSaiAvatar.useEffect"];
        }
    }["LoadingSaiAvatar.useEffect"], []);
    const avatarSize = isMobile ? MOBILE_AVATAR_SIZE : size;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        className: "flex items-center justify-center relative",
        animate: {
            rotate: [
                0,
                360
            ]
        },
        transition: {
            rotate: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
            }
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "absolute inset-0 rounded-full bg-primary-500",
                animate: {
                    scale: [
                        1,
                        1.3,
                        1
                    ],
                    opacity: [
                        0.3,
                        0.1,
                        0.3
                    ]
                },
                transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                },
                style: {
                    width: `${avatarSize + 20}px`,
                    height: `${avatarSize + 20}px`,
                    left: '-10px',
                    top: '-10px'
                }
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BaseAvatar, {
                size: avatarSize,
                style: {
                    filter: 'drop-shadow(0 5px 15px rgba(255, 255, 255, 0.8))'
                }
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
                lineNumber: 185,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
        lineNumber: 174,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s2(LoadingSaiAvatar, "0VTTNJATKABQPGLm9RVT0tKGUgU=");
_c4 = LoadingSaiAvatar;
const MessageSaiAvatar = ({ size = 36, isStreaming = false })=>{
    _s3();
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MessageSaiAvatar.useEffect": ()=>{
            const checkMobile = {
                "MessageSaiAvatar.useEffect.checkMobile": ()=>setIsMobile(window.innerWidth < 768)
            }["MessageSaiAvatar.useEffect.checkMobile"];
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return ({
                "MessageSaiAvatar.useEffect": ()=>window.removeEventListener('resize', checkMobile)
            })["MessageSaiAvatar.useEffect"];
        }
    }["MessageSaiAvatar.useEffect"], []);
    const avatarSize = isMobile ? MOBILE_AVATAR_SIZE : size;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        className: "flex items-center justify-center relative",
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        whileHover: !isStreaming ? {
            scale: 1.1
        } : {},
        transition: {
            duration: 0.2
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            animate: isStreaming ? {
                rotate: 360
            } : {},
            transition: isStreaming ? {
                rotate: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                }
            } : {},
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            children: [
                isStreaming && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: "absolute inset-0 bg-primary-500 rounded-full",
                    animate: {
                        scale: [
                            1,
                            1.4,
                            1
                        ],
                        opacity: [
                            0.3,
                            0.1,
                            0.3
                        ]
                    },
                    transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    },
                    style: {
                        width: `${avatarSize}px`,
                        height: `${avatarSize}px`
                    }
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
                    lineNumber: 232,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WhiteBotIcon, {
                    size: avatarSize,
                    style: {
                        filter: isStreaming ? 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.9))' : 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))'
                    }
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
                    lineNumber: 247,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
            lineNumber: 214,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/(chatbot)/components/(web)/shared/avatars.tsx",
        lineNumber: 204,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s3(MessageSaiAvatar, "0VTTNJATKABQPGLm9RVT0tKGUgU=");
_c5 = MessageSaiAvatar;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "WhiteBotIcon");
__turbopack_context__.k.register(_c1, "UserAvatar");
__turbopack_context__.k.register(_c2, "BaseAvatar");
__turbopack_context__.k.register(_c3, "SaiAvatar");
__turbopack_context__.k.register(_c4, "LoadingSaiAvatar");
__turbopack_context__.k.register(_c5, "MessageSaiAvatar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/app/constants/chatConstants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/constants/chatConstants.ts
__turbopack_context__.s([
    "ANIMATIONS",
    ()=>ANIMATIONS,
    "COLORS",
    ()=>COLORS,
    "SERVICE_CARDS",
    ()=>SERVICE_CARDS,
    "SIZES",
    ()=>SIZES,
    "URLS",
    ()=>URLS
]);
const URLS = {
    CALENDLY: 'https://calendly.com/strivetech',
    STRIVE_WEBSITE: 'https://strivetech.ai',
    GROQ_CONSOLE: 'https://console.groq.com'
};
const SERVICE_CARDS = [
    {
        icon: 'TrendingUp',
        title: 'Lead Generation',
        description: 'AI-powered lead qualification and automated nurturing to convert more prospects.',
        color: 'primary',
        gradientFrom: 'from-primary-500',
        gradientTo: 'to-primary-600'
    },
    {
        icon: 'Eye',
        title: 'Property Matching',
        description: 'Intelligent buyer-property matching system that finds perfect fits automatically.',
        color: 'blue',
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-blue-600'
    },
    {
        icon: 'MessageCircle',
        title: 'Market Insights',
        description: 'Predictive analytics for pricing trends and market opportunities in your area.',
        color: 'green',
        gradientFrom: 'from-green-500',
        gradientTo: 'to-green-600'
    }
];
const ANIMATIONS = {
    GLOW_DURATION: 4,
    ROTATE_DURATION: 2,
    PULSE_DURATION: 2,
    BOUNCE_DELAY: 0.2,
    FADE_DURATION: 0.5,
    HOVER_SCALE: 1.05,
    TAP_SCALE: 0.95
};
const SIZES = {
    AVATAR_LARGE: 80,
    AVATAR_MEDIUM: 60,
    AVATAR_SMALL: 36,
    GLOW_OFFSET: 30,
    ICON_SMALL: 12,
    ICON_MEDIUM: 16,
    ICON_LARGE: 20
};
const COLORS = {
    PRIMARY_RGB: '245, 104, 52',
    BLUE_RGB: '59, 130, 246',
    GREEN_RGB: '16, 185, 129',
    RED_RGB: '239, 68, 68',
    PURPLE_RGB: '168, 85, 247'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/app/features/property-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bed$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bed$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bed.js [app-client] (ecmascript) <export default as Bed>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bath$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bath$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bath.js [app-client] (ecmascript) <export default as Bath>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.js [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const PropertyCard = ({ match, rank, onScheduleShowing = ()=>{}, onSaveFavorite, onViewDetails, onShare })=>{
    _s();
    const [showPhotos, setShowPhotos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentImageIndex, setCurrentImageIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isFavorited, setIsFavorited] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { property, matchReasons, matchScore } = match;
    // Calculate match percentage (0-100%)
    const maxScore = 200; // From enhanced matching algorithm
    const matchPercentage = Math.min(Math.round(matchScore / maxScore * 100), 100);
    const handleNextImage = ()=>{
        setCurrentImageIndex((prev)=>prev === property.images.length - 1 ? 0 : prev + 1);
    };
    const handlePrevImage = ()=>{
        setCurrentImageIndex((prev)=>prev === 0 ? property.images.length - 1 : prev - 1);
    };
    const avgSchoolRating = property.schoolRatings ? ((property.schoolRatings.elementary || 0) + (property.schoolRatings.middle || 0) + (property.schoolRatings.high || 0)) / 3 : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative h-48 bg-gradient-to-br from-blue-50 to-blue-100",
                        children: [
                            property.images && property.images.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: property.images[0],
                                alt: property.address,
                                className: "w-full h-full object-cover"
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full h-full flex items-center justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                    size: 64,
                                    className: "text-blue-300"
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                    lineNumber: 99,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            rank && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-3 left-3 bg-white text-gray-900 px-3 py-1.5 rounded-full font-bold shadow-lg",
                                children: [
                                    "#",
                                    rank
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 105,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `absolute ${rank ? 'top-14' : 'top-3'} left-3 px-4 py-2 rounded-full font-bold text-lg shadow-lg ${matchPercentage >= 90 ? 'bg-green-600 text-white' : matchPercentage >= 75 ? 'bg-blue-600 text-white' : matchPercentage >= 60 ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-white'}`,
                                children: [
                                    matchPercentage,
                                    "% Match"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-14 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full font-bold text-base shadow-lg",
                                children: [
                                    "$",
                                    property.price.toLocaleString()
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 121,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            property.daysOnMarket <= 7 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 128,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    property.daysOnMarket === 0 ? 'Just Listed!' : `${property.daysOnMarket}d ago`
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 127,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    setIsFavorited(!isFavorited);
                                    if (onSaveFavorite) {
                                        onSaveFavorite(property.id, property.address);
                                    }
                                },
                                className: `absolute top-14 right-3 p-2 rounded-full shadow-lg transition-all ${isFavorited ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                    size: 20,
                                    className: isFavorited ? 'fill-current' : ''
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                    lineNumber: 148,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                        className: "text-blue-500 mt-1 flex-shrink-0",
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 156,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-bold text-lg text-gray-800",
                                                children: property.address
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 158,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-gray-600 text-sm",
                                                children: [
                                                    property.city,
                                                    ", ",
                                                    property.state,
                                                    " ",
                                                    property.zipCode
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 159,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 157,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4 mb-3 text-gray-700",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bed$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bed$3e$__["Bed"], {
                                                size: 18,
                                                className: "text-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 168,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold",
                                                children: property.bedrooms
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 169,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm",
                                                children: "bed"
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 170,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 167,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bath$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bath$3e$__["Bath"], {
                                                size: 18,
                                                className: "text-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 173,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold",
                                                children: property.bathrooms
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 174,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm",
                                                children: "bath"
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 175,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 172,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                                size: 18,
                                                className: "text-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 178,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold",
                                                children: property.sqft.toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 179,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm",
                                                children: "sqft"
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 180,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 177,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 166,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            matchReasons.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3 space-y-1",
                                children: matchReasons.slice(0, 4).map((reason, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start gap-2 text-sm text-gray-700",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-green-500 mt-0.5",
                                                children: "✓"
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 189,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: reason
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 190,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 188,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 186,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            avgSchoolRating > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3 flex items-center gap-2 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                        className: "text-yellow-500 fill-yellow-500",
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 199,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold text-gray-700",
                                        children: [
                                            avgSchoolRating.toFixed(1),
                                            "/10"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 200,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-600",
                                        children: "School Rating"
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 203,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 198,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 mb-3 text-sm text-gray-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium capitalize",
                                        children: property.propertyType?.replace(/-/g, ' ')
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 209,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    property.yearBuilt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "•"
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 212,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Built ",
                                                    property.yearBuilt
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 213,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true),
                                    property.lotSize && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "•"
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 218,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    (property.lotSize / 43560).toFixed(2),
                                                    " acres"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 219,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 208,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 mt-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowPhotos(true),
                                        disabled: !property.images || property.images.length === 0,
                                        className: "flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                                size: 18
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 231,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Photos (",
                                            property.images?.length || 0,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 226,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onScheduleShowing(property.id, property.address),
                                        className: "flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                size: 18
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 238,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Schedule Tour"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 234,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 225,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 mt-2",
                                children: [
                                    onViewDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onViewDetails(property.id),
                                        className: "flex-1 bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 250,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Details"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 246,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    onShare && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onShare(property.id, property.address),
                                        className: "flex-1 bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                                lineNumber: 259,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Share"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                        lineNumber: 255,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 244,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            showPhotos && property.images.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-4xl w-full relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setShowPhotos(false),
                            className: "absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-200 transition-colors z-10",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                lineNumber: 276,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                            lineNumber: 272,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative bg-white rounded-lg overflow-hidden",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: property.images[currentImageIndex],
                                    alt: `${property.address} - Photo ${currentImageIndex + 1}`,
                                    className: "w-full h-auto max-h-[80vh] object-contain"
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                    lineNumber: 281,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                property.images.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handlePrevImage,
                                            className: "absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-3 transition-all",
                                            children: "←"
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                            lineNumber: 290,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleNextImage,
                                            className: "absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-3 transition-all",
                                            children: "→"
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                            lineNumber: 296,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm",
                                    children: [
                                        currentImageIndex + 1,
                                        " / ",
                                        property.images.length
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                                    lineNumber: 306,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                            lineNumber: 280,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                    lineNumber: 270,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/app/features/property-card.tsx",
                lineNumber: 269,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
_s(PropertyCard, "42A9LhRgFjiKqRA/QI3je+7rRIk=");
_c = PropertyCard;
const __TURBOPACK__default__export__ = PropertyCard;
var _c;
__turbopack_context__.k.register(_c, "PropertyCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/app/features/property-results.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/features/property-results.tsx
__turbopack_context__.s([
    "PropertyResults",
    ()=>PropertyResults
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$features$2f$property$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/app/features/property-card.tsx [app-client] (ecmascript)"); // ✅ Fixed: default import
'use client';
;
;
// ✅ Inline Badge component (shadcn not installed)
const Badge = ({ children, className = '' })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/(chatbot)/app/features/property-results.tsx",
        lineNumber: 9,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c = Badge;
function PropertyResults({ properties, searchParams }) {
    if (!properties || properties.length === 0) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 my-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between border-b border-gray-700 pb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold text-gray-100",
                                children: [
                                    "🏡 Found ",
                                    properties.length,
                                    " Perfect Matches"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-results.tsx",
                                lineNumber: 33,
                                columnNumber: 11
                            }, this),
                            searchParams && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-400 mt-1",
                                children: [
                                    searchParams.location && `${searchParams.location}`,
                                    searchParams.maxPrice && `, under $${(searchParams.maxPrice / 1000).toFixed(0)}k`,
                                    searchParams.minBedrooms && `, ${searchParams.minBedrooms}+ beds`
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/app/features/property-results.tsx",
                                lineNumber: 37,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/(chatbot)/app/features/property-results.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Badge, {
                        className: "bg-green-600 text-white border-green-500",
                        children: [
                            "Top ",
                            properties.length,
                            " Picks"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/(chatbot)/app/features/property-results.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/(chatbot)/app/features/property-results.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 md:grid-cols-2",
                children: properties.map((match, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$features$2f$property$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        match: match,
                        rank: index + 1
                    }, match.property.id, false, {
                        fileName: "[project]/(chatbot)/app/features/property-results.tsx",
                        lineNumber: 52,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/app/features/property-results.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-300 mb-2",
                        children: "Want to see more properties or adjust your criteria?"
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/app/features/property-results.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-400",
                        children: "Just ask me to search again with different preferences!"
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/app/features/property-results.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/(chatbot)/app/features/property-results.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/(chatbot)/app/features/property-results.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_c1 = PropertyResults;
var _c, _c1;
__turbopack_context__.k.register(_c, "Badge");
__turbopack_context__.k.register(_c1, "PropertyResults");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// components/(web)/features/chatbot/chat-message.tsx
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$components$2f28$web$292f$shared$2f$avatars$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/components/(web)/shared/avatars.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$constants$2f$chatConstants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/app/constants/chatConstants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$features$2f$property$2d$results$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/app/features/property-results.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
;
;
;
const ChatMessage = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(_c = ({ message, isStreaming = false, mode = 'full', isFirst = false })=>{
    const isUser = message.role === 'user';
    const isError = message.isError;
    const isPartial = message.isPartial;
    const isWelcome = message.isWelcome;
    const isThinking = message.isThinking;
    const actuallyStreaming = message.isStreaming !== undefined ? message.isStreaming : isStreaming;
    const handleScheduleClick = ()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            window.open(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$constants$2f$chatConstants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["URLS"].CALENDLY, '_blank');
        }
    };
    const getTimeBasedGreeting = ()=>{
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return 'Good Morning';
        } else if (hour >= 12 && hour < 17) {
            return 'Good Afternoon';
        } else if (hour >= 17 && hour < 21) {
            return 'Good Evening';
        } else {
            return 'Good Evening';
        }
    };
    const formatContent = (content)=>{
        if (!content) return '';
        return content.split('\n').map((line, index)=>{
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-2"
                }, index, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                    lineNumber: 67,
                    columnNumber: 16
                }, ("TURBOPACK compile-time value", void 0));
            }
            // Bold text formatting
            if (trimmedLine.includes('**')) {
                const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-2",
                    children: parts.map((part, partIndex)=>{
                        if (part.startsWith('**') && part.endsWith('**')) {
                            const boldText = part.slice(2, -2);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-bold text-gray-100",
                                children: boldText
                            }, partIndex, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                lineNumber: 79,
                                columnNumber: 19
                            }, ("TURBOPACK compile-time value", void 0));
                        }
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: part
                        }, partIndex, false, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                            lineNumber: 84,
                            columnNumber: 22
                        }, ("TURBOPACK compile-time value", void 0));
                    })
                }, index, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                    lineNumber: 74,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0));
            }
            // Bullet points
            if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                const bulletContent = trimmedLine.substring(1).trim();
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: "flex items-start space-x-3 my-3",
                    initial: {
                        opacity: 0,
                        x: -10
                    },
                    animate: {
                        opacity: 1,
                        x: 0
                    },
                    transition: {
                        delay: index * 0.05
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-6 h-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white text-xs",
                                children: "•"
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                lineNumber: 102,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                            lineNumber: 101,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex-1 text-sm leading-relaxed font-medium",
                            children: bulletContent
                        }, void 0, false, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                            lineNumber: 104,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, index, true, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                    lineNumber: 94,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0));
            }
            // URL formatting - handle Calendly links properly
            if (trimmedLine.includes('calendly.com') || trimmedLine.includes('strivetech.ai') || trimmedLine.includes('http')) {
                if (trimmedLine.includes('calendly.com')) {
                    const urlRegex = /(https?:\/\/)?calendly\.com\/[^\s]+/g;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2",
                        children: trimmedLine.split(urlRegex).map((part, partIndex)=>{
                            if (part && part.includes('calendly.com')) {
                                const fullUrl = part.startsWith('http') ? part : `https://${part}`;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].a, {
                                    href: fullUrl,
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    className: "text-primary-400 hover:text-primary-300 font-semibold underline decoration-2 underline-offset-2 transition-all duration-200 mx-1",
                                    whileHover: {
                                        scale: 1.05
                                    },
                                    whileTap: {
                                        scale: 0.95
                                    },
                                    children: [
                                        part,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                            size: 12,
                                            className: "inline ml-1"
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                            lineNumber: 130,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, partIndex, true, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                    lineNumber: 120,
                                    columnNumber: 21
                                }, ("TURBOPACK compile-time value", void 0));
                            }
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: part
                            }, partIndex, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                lineNumber: 134,
                                columnNumber: 24
                            }, ("TURBOPACK compile-time value", void 0));
                        })
                    }, index, false, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                        lineNumber: 115,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0));
                }
                const urlRegex = /(https?:\/\/[^\s]+|strivetech\.ai|[\w-]+\.[\w-]+(?:\.[\w-]+)*)/g;
                const parts = trimmedLine.split(urlRegex);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-2",
                    children: parts.map((part, partIndex)=>{
                        if (part && part.match(urlRegex) && !part.includes('calendly')) {
                            let url = part;
                            const isStrive = part.includes('strivetech.ai');
                            if (!part.startsWith('http')) {
                                url = `https://${part}`;
                            }
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].a, {
                                href: url,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: `inline-flex items-center gap-1 font-semibold underline decoration-2 underline-offset-2 transition-all duration-200 mx-1 ${isStrive ? 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/20 px-2 py-1 rounded-md' : 'text-blue-400 hover:text-blue-300'}`,
                                whileHover: {
                                    scale: 1.05
                                },
                                whileTap: {
                                    scale: 0.95
                                },
                                children: [
                                    part,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                        size: 12,
                                        className: "inline"
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                        lineNumber: 169,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, partIndex, true, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                lineNumber: 155,
                                columnNumber: 19
                            }, ("TURBOPACK compile-time value", void 0));
                        }
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: part
                        }, partIndex, false, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                            lineNumber: 173,
                            columnNumber: 22
                        }, ("TURBOPACK compile-time value", void 0));
                    })
                }, index, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                    lineNumber: 144,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0));
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-2 leading-relaxed",
                children: trimmedLine
            }, index, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                lineNumber: 180,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0));
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 30,
            scale: 0.95
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1
        },
        transition: {
            duration: 0.5,
            ease: "easeOut",
            type: "spring",
            stiffness: 300,
            damping: 25
        },
        className: `flex items-start ${mode === 'widget' ? 'gap-2' : 'md:gap-3 gap-2'} mb-6 ${isUser ? 'flex-row-reverse' : ''}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: `flex-shrink-0 flex items-center justify-center relative ${isUser ? '' : isError ? 'w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white ring-2 ring-red-200 shadow-lg' : mode === 'widget' ? 'w-16 h-16' : 'w-24 h-24'}`,
                style: isUser ? {
                    paddingTop: '4px'
                } : {},
                whileHover: isError ? {
                    scale: 1.1
                } : {},
                transition: {
                    duration: 0.2
                },
                children: isUser ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$components$2f28$web$292f$shared$2f$avatars$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserAvatar"], {
                    size: mode === 'widget' ? 60 : 80
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                    lineNumber: 214,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)) : isError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                    size: 28
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                    lineNumber: 216,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$components$2f28$web$292f$shared$2f$avatars$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MessageSaiAvatar"], {
                    size: mode === 'widget' ? 60 : 80,
                    isStreaming: actuallyStreaming || isThinking
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                    lineNumber: 218,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex flex-col ${isUser ? 'items-end' : 'items-start'} md:max-w-[85%] max-w-full`,
                children: [
                    (!isThinking || message.content) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: `message-bubble relative ${isUser ? 'user-message bg-gradient-to-br from-gray-100/10 via-primary-800/30 to-primary-700/40 border-2 border-primary-600 text-gray-100 shadow-xl md:max-w-[80%] max-w-full' : isError ? 'error-message bg-gradient-to-br from-red-900/20 to-red-800/20 border-2 border-red-600 text-red-300 md:max-w-[80%] max-w-full' : 'bg-gradient-to-br from-blue-900/20 via-indigo-900/20 to-primary-900/20 border-2 border-primary-700 text-gray-200 shadow-xl md:max-w-[80%] max-w-full'} ${actuallyStreaming ? 'animate-pulse border-primary-300' : ''} ${isPartial ? 'border-orange-300 bg-orange-50' : ''}`,
                        initial: {
                            scale: 0.8,
                            opacity: 0,
                            rotate: isUser ? 5 : -5
                        },
                        animate: {
                            scale: 1,
                            opacity: 1,
                            rotate: 0
                        },
                        transition: {
                            duration: 0.4,
                            ease: "easeOut"
                        },
                        whileHover: {
                            scale: 1.02,
                            y: -2
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm leading-relaxed relative z-10",
                            children: [
                                formatContent(message.content),
                                actuallyStreaming && message.content && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                    className: "inline-block w-2 h-5 ml-0.5 bg-gradient-to-r from-primary-400 to-primary-500 rounded-sm",
                                    animate: {
                                        opacity: [
                                            1,
                                            0.2,
                                            1
                                        ],
                                        scaleY: [
                                            1,
                                            0.8,
                                            1
                                        ]
                                    },
                                    transition: {
                                        duration: 0.8,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                    lineNumber: 244,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                isPartial && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-3 p-2 bg-orange-900/20 rounded-md",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-orange-300 font-medium flex items-center space-x-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                                lineNumber: 261,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Response was interrupted"
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                                lineNumber: 262,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                        lineNumber: 260,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                    lineNumber: 259,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                            lineNumber: 240,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                        lineNumber: 225,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    message.propertyResults && message.propertyResults.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.2,
                            duration: 0.4
                        },
                        className: "w-full mt-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$features$2f$property$2d$results$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PropertyResults"], {
                            properties: message.propertyResults
                        }, void 0, false, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                            lineNumber: 278,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                        lineNumber: 272,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: `flex items-center space-x-2 text-xs text-gray-500 mt-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`,
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        transition: {
                            delay: 0.3
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                size: 12
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                lineNumber: 289,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: message.timestamp && new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                lineNumber: 290,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            isError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-red-300 font-medium",
                                children: "Error"
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                lineNumber: 297,
                                columnNumber: 23
                            }, ("TURBOPACK compile-time value", void 0)),
                            isPartial && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-orange-300 font-medium",
                                children: "Partial"
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                lineNumber: 298,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            isWelcome && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "•"
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                        lineNumber: 301,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-primary-400 font-medium",
                                        children: getTimeBasedGreeting()
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                        lineNumber: 302,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true),
                            actuallyStreaming && !isThinking && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                className: "text-primary-400 font-medium flex items-center space-x-1",
                                animate: {
                                    opacity: [
                                        1,
                                        0.6,
                                        1
                                    ]
                                },
                                transition: {
                                    duration: 1.5,
                                    repeat: Infinity
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-2 h-2 bg-primary-500 rounded-full animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                        lineNumber: 311,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Live"
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                        lineNumber: 312,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                lineNumber: 306,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            isThinking && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                className: "text-primary-400 font-medium",
                                animate: {
                                    opacity: [
                                        1,
                                        0.6,
                                        1
                                    ]
                                },
                                transition: {
                                    duration: 1.5,
                                    repeat: Infinity
                                },
                                children: "Thinking..."
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                                lineNumber: 316,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                        lineNumber: 283,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
                lineNumber: 222,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx",
        lineNumber: 188,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = ChatMessage;
ChatMessage.displayName = 'ChatMessage';
const __TURBOPACK__default__export__ = ChatMessage;
var _c, _c1;
__turbopack_context__.k.register(_c, "ChatMessage$memo");
__turbopack_context__.k.register(_c1, "ChatMessage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/hooks/use-advanced-chat.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// hooks/useAdvancedChat.ts
__turbopack_context__.s([
    "useIdleDetection",
    ()=>useIdleDetection,
    "useKeyboardShortcuts",
    ()=>useKeyboardShortcuts,
    "useNetworkStatus",
    ()=>useNetworkStatus,
    "useTimeBasedGreeting",
    ()=>useTimeBasedGreeting
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
'use client';
;
const useKeyboardShortcuts = ({ onSearch, onShowShortcuts, onClear })=>{
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useKeyboardShortcuts.useEffect": ()=>{
            const handleKeyPress = {
                "useKeyboardShortcuts.useEffect.handleKeyPress": (e)=>{
                    // Cmd/Ctrl + K - Quick search
                    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                        e.preventDefault();
                        onSearch?.();
                    }
                    // Cmd/Ctrl + / - Show shortcuts
                    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                        e.preventDefault();
                        onShowShortcuts?.();
                    }
                    // Escape - Clear input
                    if (e.key === 'Escape') onClear?.();
                }
            }["useKeyboardShortcuts.useEffect.handleKeyPress"];
            if ("TURBOPACK compile-time truthy", 1) {
                window.addEventListener('keydown', handleKeyPress);
                return ({
                    "useKeyboardShortcuts.useEffect": ()=>window.removeEventListener('keydown', handleKeyPress)
                })["useKeyboardShortcuts.useEffect"];
            }
        }
    }["useKeyboardShortcuts.useEffect"], [
        onSearch,
        onShowShortcuts,
        onClear
    ]);
};
_s(useKeyboardShortcuts, "OD7bBpZva5O2jO+Puf00hKivP7c=");
const useTimeBasedGreeting = ()=>{
    _s1();
    const [greeting, setGreeting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [timeOfDay, setTimeOfDay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('morning');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useTimeBasedGreeting.useEffect": ()=>{
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                setGreeting('Good morning');
                setTimeOfDay('morning');
            } else if (hour >= 12 && hour < 17) {
                setGreeting('Good afternoon');
                setTimeOfDay('afternoon');
            } else if (hour >= 17 && hour < 21) {
                setGreeting('Good evening');
                setTimeOfDay('evening');
            } else {
                setGreeting('Welcome');
                setTimeOfDay('night');
            }
        }
    }["useTimeBasedGreeting.useEffect"], []);
    return {
        greeting,
        timeOfDay
    };
};
_s1(useTimeBasedGreeting, "OuGfRW3CWPVuaSXpv+CdX9qAM7s=");
const useNetworkStatus = ()=>{
    _s2();
    const [isOnline, setIsOnline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [connectionSpeed, setConnectionSpeed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('4g');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useNetworkStatus.useEffect": ()=>{
            if (("TURBOPACK compile-time value", "object") === 'undefined' || typeof navigator === 'undefined') return;
            setIsOnline(navigator.onLine);
            const handleOnline = {
                "useNetworkStatus.useEffect.handleOnline": ()=>setIsOnline(true)
            }["useNetworkStatus.useEffect.handleOnline"];
            const handleOffline = {
                "useNetworkStatus.useEffect.handleOffline": ()=>setIsOnline(false)
            }["useNetworkStatus.useEffect.handleOffline"];
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
            // Check connection speed if available
            if ('connection' in navigator) {
                const connection = navigator.connection;
                setConnectionSpeed(connection?.effectiveType || '4g');
                const handleConnectionChange = {
                    "useNetworkStatus.useEffect.handleConnectionChange": ()=>setConnectionSpeed(connection?.effectiveType || '4g')
                }["useNetworkStatus.useEffect.handleConnectionChange"];
                connection?.addEventListener('change', handleConnectionChange);
                return ({
                    "useNetworkStatus.useEffect": ()=>{
                        window.removeEventListener('online', handleOnline);
                        window.removeEventListener('offline', handleOffline);
                        connection?.removeEventListener('change', handleConnectionChange);
                    }
                })["useNetworkStatus.useEffect"];
            }
            return ({
                "useNetworkStatus.useEffect": ()=>{
                    window.removeEventListener('online', handleOnline);
                    window.removeEventListener('offline', handleOffline);
                }
            })["useNetworkStatus.useEffect"];
        }
    }["useNetworkStatus.useEffect"], []);
    return {
        isOnline,
        connectionSpeed
    };
};
_s2(useNetworkStatus, "9JfgTJ4qL/Yu9KrWxPykYoPlgak=");
const useIdleDetection = (timeout = 60000)=>{
    _s3();
    const [isIdle, setIsIdle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const timeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const resetTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useIdleDetection.useCallback[resetTimer]": ()=>{
            setIsIdle(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout({
                "useIdleDetection.useCallback[resetTimer]": ()=>setIsIdle(true)
            }["useIdleDetection.useCallback[resetTimer]"], timeout);
        }
    }["useIdleDetection.useCallback[resetTimer]"], [
        timeout
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useIdleDetection.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const events = [
                'mousedown',
                'mousemove',
                'keypress',
                'scroll',
                'touchstart'
            ];
            events.forEach({
                "useIdleDetection.useEffect": (event)=>document.addEventListener(event, resetTimer, true)
            }["useIdleDetection.useEffect"]);
            resetTimer();
            return ({
                "useIdleDetection.useEffect": ()=>{
                    events.forEach({
                        "useIdleDetection.useEffect": (event)=>document.removeEventListener(event, resetTimer, true)
                    }["useIdleDetection.useEffect"]);
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }
                }
            })["useIdleDetection.useEffect"];
        }
    }["useIdleDetection.useEffect"], [
        resetTimer
    ]);
    return isIdle;
};
_s3(useIdleDetection, "4WaT7+NYlzeFD/YAAlq2IB9287s=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// components/(web)/features/chatbot/chat-input.tsx
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$advanced$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/hooks/use-advanced-chat.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const ChatInput = ({ onSendMessage, isLoading, disabled, onStop, onClear, onScheduleClick, mode = 'full', messageCount = 0 })=>{
    _s();
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isFocused, setIsFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showQuestions, setShowQuestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentCategory, setCurrentCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isIdle = (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$advanced$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIdleDetection"])(60000);
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (message.trim() && !disabled && !isLoading) {
            onSendMessage(message);
            setMessage('');
            if ("TURBOPACK compile-time truthy", 1) {
                const messageCountStorage = parseInt(localStorage.getItem('strive-message-count') || '0');
                localStorage.setItem('strive-message-count', (messageCountStorage + 1).toString());
            }
        }
    };
    const handleKeyPress = (e)=>{
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatInput.useEffect": ()=>{
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = 'auto';
                const newHeight = Math.min(textarea.scrollHeight, 140);
                textarea.style.height = `${newHeight}px`;
            }
        }
    }["ChatInput.useEffect"], [
        message
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatInput.useEffect": ()=>{
            if (!isIdle) textareaRef.current?.focus();
        }
    }["ChatInput.useEffect"], [
        isIdle
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatInput.useEffect": ()=>{
            if (message.length > 0) {
                setShowQuestions(false);
            }
        }
    }["ChatInput.useEffect"], [
        message
    ]);
    // REAL ESTATE SPECIFIC QUESTIONS
    const sampleQuestions = [
        {
            category: "Getting Started",
            questions: [
                "I need help finding my dream home",
                "What's my property worth in today's market?",
                "How can AI help me attract more qualified buyers?"
            ]
        },
        {
            category: "Common Challenges",
            questions: [
                "My listings are sitting on the market too long",
                "I'm not getting enough qualified leads",
                "How do I stand out from other agents?"
            ]
        },
        {
            category: "Cost & Implementation",
            questions: [
                "How much does it cost to get started?",
                "What's the typical implementation timeline?",
                "Do I need a technical team to use this?"
            ]
        }
    ];
    const currentQuestions = sampleQuestions[currentCategory].questions;
    const handleSampleQuestion = (question)=>{
        setMessage(question);
        setShowQuestions(false);
        textareaRef.current?.focus();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-gray-800 border-t border-gray-600 relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: isIdle && message.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: -10
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    exit: {
                        opacity: 0,
                        y: -10
                    },
                    className: "absolute -top-40 left-6 right-6 z-20",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-700 border border-gray-600 text-gray-300 rounded-lg p-3 text-sm",
                        children: "Still there? I'm here whenever you're ready to continue exploring real estate solutions!"
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                        lineNumber: 127,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                    lineNumber: 121,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: !message && !isLoading && mode !== 'widget' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        height: 0
                    },
                    animate: {
                        opacity: 1,
                        height: "auto"
                    },
                    exit: {
                        opacity: 0,
                        height: 0
                    },
                    transition: {
                        duration: 0.3
                    },
                    className: "bg-gray-800",
                    children: [
                        messageCount > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                y: 20
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            transition: {
                                duration: 0.3
                            },
                            className: "px-4 pt-4 pb-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 bg-gray-800 border border-gray-600 rounded-xl glow-orange-subtle",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-3 group hidden md:flex",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    className: "w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700",
                                                    whileHover: {
                                                        rotate: 360
                                                    },
                                                    transition: {
                                                        duration: 0.5,
                                                        ease: "linear"
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                        size: 20,
                                                        className: "text-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                        lineNumber: 160,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                    lineNumber: 155,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "font-semibold text-base text-gray-200",
                                                            children: "Ready to discuss your real estate strategy?"
                                                        }, void 0, false, {
                                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                            lineNumber: 163,
                                                            columnNumber: 25
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-gray-400",
                                                            children: "Let's explore how AI can transform your business"
                                                        }, void 0, false, {
                                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                            lineNumber: 164,
                                                            columnNumber: 25
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                    lineNumber: 162,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                            lineNumber: 154,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                            onClick: onScheduleClick,
                                            className: "brand-orange-button px-8 py-3 text-white rounded-xl font-semibold flex items-center space-x-2 text-sm w-full md:w-auto justify-center",
                                            whileHover: {
                                                scale: 1.02
                                            },
                                            whileTap: {
                                                scale: 0.98
                                            },
                                            transition: {
                                                duration: 0.15
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                    size: 16
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Schedule Free Consultation"
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                    size: 16
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                    lineNumber: 176,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                            lineNumber: 167,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                    lineNumber: 153,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                lineNumber: 152,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                            lineNumber: 146,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-4 py-4 border-b border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-2",
                                            children: sampleQuestions.map((category, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                    onClick: ()=>{
                                                        if (currentCategory === index && showQuestions) {
                                                            setShowQuestions(false);
                                                        } else {
                                                            setCurrentCategory(index);
                                                            setShowQuestions(true);
                                                        }
                                                    },
                                                    className: `text-xs px-3 py-1.5 rounded-full transition-all duration-300 font-medium flex items-center space-x-1 ${currentCategory === index && showQuestions ? 'bg-primary-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`,
                                                    whileHover: {
                                                        scale: 1.02
                                                    },
                                                    whileTap: {
                                                        scale: 0.98
                                                    },
                                                    children: [
                                                        index === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                            lineNumber: 207,
                                                            columnNumber: 39
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        index === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                            lineNumber: 208,
                                                            columnNumber: 39
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        index === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                            lineNumber: 209,
                                                            columnNumber: 39
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: category.category
                                                        }, void 0, false, {
                                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                            lineNumber: 210,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, index, true, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                    lineNumber: 189,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)))
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                            lineNumber: 187,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                            onClick: onScheduleClick,
                                            className: "text-xs px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-full transition-all duration-300 font-medium flex items-center space-x-1 hidden md:flex",
                                            whileHover: {
                                                scale: 1.02
                                            },
                                            whileTap: {
                                                scale: 0.98
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                    size: 12
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                    lineNumber: 221,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Book Call"
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                    lineNumber: 222,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                            lineNumber: 215,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                    lineNumber: 186,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    children: showQuestions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            height: 0
                                        },
                                        animate: {
                                            opacity: 1,
                                            height: "auto"
                                        },
                                        exit: {
                                            opacity: 0,
                                            height: 0
                                        },
                                        transition: {
                                            duration: 0.3
                                        },
                                        className: "space-y-2 mt-4",
                                        children: currentQuestions.map((question, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                onClick: ()=>handleSampleQuestion(question),
                                                className: "w-full text-left text-sm px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-primary-600 text-gray-300 hover:text-primary-400 rounded-xl transition-all duration-300 group",
                                                initial: {
                                                    opacity: 0,
                                                    y: 10
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    y: 0
                                                },
                                                transition: {
                                                    delay: index * 0.05
                                                },
                                                whileHover: {
                                                    scale: 1.01
                                                },
                                                whileTap: {
                                                    scale: 0.99
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-start space-x-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                                            size: 16,
                                                            className: "text-primary-400 mt-0.5 flex-shrink-0"
                                                        }, void 0, false, {
                                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                            lineNumber: 248,
                                                            columnNumber: 27
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "leading-relaxed font-medium",
                                                            children: question
                                                        }, void 0, false, {
                                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                            lineNumber: 249,
                                                            columnNumber: 27
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                    lineNumber: 247,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, `${currentCategory}-${index}`, false, {
                                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                                lineNumber: 237,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                        lineNumber: 229,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                    lineNumber: 227,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                            lineNumber: 184,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                    lineNumber: 137,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                lineNumber: 135,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "flex items-center space-x-2 p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex-1 relative ${isFocused ? 'ring-2 ring-primary-600 ring-opacity-50 rounded-xl' : ''}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                ref: textareaRef,
                                value: message,
                                onChange: (e)=>setMessage(e.target.value),
                                onKeyDown: handleKeyPress,
                                onFocus: ()=>setIsFocused(true),
                                onBlur: ()=>setIsFocused(false),
                                placeholder: ("TURBOPACK compile-time value", "object") !== 'undefined' && window.innerWidth < 768 ? "Your real estate needs..." : "Tell me about your real estate needs...",
                                className: "chat-input w-full align-bottom",
                                style: {
                                    minHeight: '52px',
                                    maxHeight: '140px',
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word'
                                },
                                disabled: disabled,
                                rows: 1
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                lineNumber: 264,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            message.length > 200 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute bottom-2 right-2 text-xs text-gray-500 bg-gray-700 px-1 rounded",
                                children: [
                                    message.length,
                                    "/2000"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                lineNumber: 286,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                        lineNumber: 263,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center space-x-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                children: isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                    type: "button",
                                    onClick: onStop,
                                    className: "p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300 glow-orange-subtle",
                                    whileHover: {
                                        scale: 1.02
                                    },
                                    whileTap: {
                                        scale: 0.98
                                    },
                                    initial: {
                                        opacity: 0,
                                        scale: 0.8
                                    },
                                    animate: {
                                        opacity: 1,
                                        scale: 1
                                    },
                                    exit: {
                                        opacity: 0,
                                        scale: 0.8
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                                        size: 18
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                        lineNumber: 306,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                    lineNumber: 296,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                lineNumber: 294,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                type: "submit",
                                disabled: !message.trim() || disabled || isLoading,
                                className: "send-button",
                                whileHover: !disabled && message.trim() ? {
                                    scale: 1.02
                                } : {},
                                whileTap: !disabled && message.trim() ? {
                                    scale: 0.98
                                } : {},
                                transition: {
                                    duration: 0.3
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    mode: "wait",
                                    children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0
                                        },
                                        animate: {
                                            opacity: 1
                                        },
                                        exit: {
                                            opacity: 0
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            size: 20,
                                            className: "animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                            lineNumber: 323,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, "loading", false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                        lineNumber: 322,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0
                                        },
                                        animate: {
                                            opacity: 1
                                        },
                                        exit: {
                                            opacity: 0
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                            lineNumber: 327,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, "send", false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                        lineNumber: 326,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                    lineNumber: 320,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                lineNumber: 312,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                        lineNumber: 292,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                lineNumber: 262,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-2 bg-gray-800 border-t border-gray-700",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between text-xs text-gray-400",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-1 text-green-400",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 bg-green-500 rounded-full"
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                            lineNumber: 340,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Sai ready"
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                            lineNumber: 341,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                    lineNumber: 339,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                    onClick: onScheduleClick,
                                    className: "text-primary-400 hover:text-primary-300 font-medium transition-all duration-300 flex items-center space-x-1",
                                    whileHover: {
                                        scale: 1.02
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                            size: 12
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                            lineNumber: 349,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Free consultation available"
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                            lineNumber: 350,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                    lineNumber: 344,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                            lineNumber: 338,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "hidden sm:inline",
                                    children: "STRIVE TECH LLC"
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                    lineNumber: 355,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                onClear && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClear,
                                    className: "hover:text-gray-200 transition-all duration-300",
                                    children: "New chat"
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                                    lineNumber: 357,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                            lineNumber: 354,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                    lineNumber: 337,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
                lineNumber: 336,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx",
        lineNumber: 117,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ChatInput, "A7vUSqO7e4HlF+vaRY60RzCck30=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$advanced$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIdleDetection"]
    ];
});
_c = ChatInput;
const __TURBOPACK__default__export__ = ChatInput;
var _c;
__turbopack_context__.k.register(_c, "ChatInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/hooks/use-chat-helpers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// hooks/useChatHelpers.ts
__turbopack_context__.s([
    "detectProblemsClientSide",
    ()=>detectProblemsClientSide,
    "determineConversationStage",
    ()=>determineConversationStage,
    "getCurrentDateContext",
    ()=>getCurrentDateContext,
    "getWelcomeMessage",
    ()=>getWelcomeMessage,
    "performBasicGrammarCheck",
    ()=>performBasicGrammarCheck
]);
'use client';
const getCurrentDateContext = ()=>{
    const now = new Date();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `Current date: ${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}. Q${quarter} ${now.getFullYear()}.`;
};
const getWelcomeMessage = (showContinueOption = false)=>{
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const baseMessage = `Welcome to STRIVE REAL ESTATE AI! I'm Sai, your real estate AI consultant.\n\nHope you're having a good ${greeting}!`;
    const continueMessage = showContinueOption ? '\n\nI see we have a previous conversation. Would you like to continue where we left off?\n\nType "yes" to resume, or just tell me about your current real estate needs.' : "\n\nI help real estate professionals attract more qualified leads, match buyers with perfect properties, and stay ahead of market trends. Whether you're a real estate agent, broker, or property developer - what brings you here today? Are you facing a specific challenge, or just curious about what AI can do for your business?";
    return {
        id: 'welcome-message',
        role: 'assistant',
        content: baseMessage + continueMessage,
        timestamp: new Date(),
        isWelcome: true
    };
};
const performBasicGrammarCheck = (text)=>{
    if (!text) return text;
    const fixes = [
        {
            pattern: / {2,}/g,
            replacement: ' '
        },
        {
            pattern: /([.!?])([A-Z])/g,
            replacement: '$1 $2'
        },
        {
            pattern: /\.{2,}/g,
            replacement: '.'
        },
        {
            pattern: /\b(a|an|the)\s+\1\b/gi,
            replacement: '$1'
        }
    ];
    let correctedText = text.trim();
    fixes.forEach((fix)=>{
        correctedText = correctedText.replace(fix.pattern, fix.replacement);
    });
    // Fix Calendly links
    if (correctedText.includes('calendly.com/strivetech')) {
        correctedText = correctedText.split(' ').map((word)=>{
            if (word.includes('calendly.com/strivetech') && !word.includes('https://')) {
                return word.replace('calendly.com/strivetech', 'https://calendly.com/strivetech');
            }
            return word;
        }).join(' ');
    }
    return correctedText;
};
const detectProblemsClientSide = (message)=>{
    const lowerMessage = message.toLowerCase();
    const detected = [];
    const problemKeywords = {
        churn: {
            keywords: [
                'losing customers',
                'retention',
                'leaving',
                'cancel',
                'churn',
                'unsubscribe'
            ],
            urgency: 'high'
        },
        support: {
            keywords: [
                'customer support',
                'tickets',
                'help desk',
                'overwhelmed',
                'complaints'
            ],
            urgency: 'medium'
        },
        quality: {
            keywords: [
                'defect',
                'quality control',
                'inspection',
                'faulty',
                'qa'
            ],
            urgency: 'high'
        },
        fraud: {
            keywords: [
                'fraud',
                'suspicious',
                'risk',
                'scam',
                'unauthorized'
            ],
            urgency: 'high'
        },
        maintenance: {
            keywords: [
                'equipment failure',
                'breakdown',
                'downtime',
                'maintenance'
            ],
            urgency: 'high'
        }
    };
    Object.entries(problemKeywords).forEach(([key, { keywords, urgency }])=>{
        const matchedKeywords = keywords.filter((kw)=>lowerMessage.includes(kw));
        if (matchedKeywords.length > 0) {
            detected.push({
                key,
                confidence: matchedKeywords.length > 1 ? 'high' : 'medium',
                urgency,
                matchedKeywords
            });
        }
    });
    return detected;
};
const determineConversationStage = (messageCount, problemsDetected)=>{
    if (messageCount <= 2) return 'discovery';
    if (messageCount <= 4 && problemsDetected === 0) return 'discovery';
    if (problemsDetected > 0 && messageCount <= 6) return 'qualifying';
    if (problemsDetected > 0 && messageCount > 6) return 'solutioning';
    if (messageCount > 10) return 'closing';
    return 'discovery';
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/hooks/use-chat.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// hooks/use-chat.ts
__turbopack_context__.s([
    "useChat",
    ()=>useChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$chat$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/hooks/use-chat-helpers.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const useChat = (industry = 'strive')=>{
    _s();
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "useChat.useState": ()=>[
                (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$chat$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWelcomeMessage"])()
            ]
    }["useChat.useState"]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [streamingMessage, setStreamingMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [identifiedProblems, setIdentifiedProblems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [conversationStage, setConversationStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('discovery');
    const [hasShownCalendlyButton, setHasShownCalendlyButton] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasSavedChat, setHasSavedChat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const abortControllerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const conversationIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(`conv-${Date.now()}`);
    const streamingIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Generate session ID once - invoke function immediately
    const getSessionId = ()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            const stored = sessionStorage.getItem('strive-session-id');
            if (stored) return stored;
            const newId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            sessionStorage.setItem('strive-session-id', newId);
            return newId;
        }
        //TURBOPACK unreachable
        ;
    };
    const sessionIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(getSessionId());
    // Load saved chat on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useChat.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            try {
                const saved = localStorage.getItem('strive-chat-history');
                if (saved) {
                    const parsedHistory = JSON.parse(saved);
                    if (parsedHistory.messages?.length > 1) {
                        setHasSavedChat(true);
                    }
                }
            } catch (error) {
                console.warn('Failed to load chat history:', error);
            }
        }
    }["useChat.useEffect"], []);
    // Load previous conversation
    const loadPreviousChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useChat.useCallback[loadPreviousChat]": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            try {
                const saved = localStorage.getItem('strive-chat-history');
                if (saved) {
                    const parsedHistory = JSON.parse(saved);
                    if (parsedHistory.messages?.length > 1) {
                        setMessages(parsedHistory.messages);
                        if (parsedHistory.identifiedProblems) {
                            setIdentifiedProblems(parsedHistory.identifiedProblems);
                        }
                        if (parsedHistory.stage) {
                            setConversationStage(parsedHistory.stage);
                        }
                        setHasSavedChat(false);
                    }
                }
            } catch (error) {
                console.warn('Failed to load chat history:', error);
            }
        }
    }["useChat.useCallback[loadPreviousChat]"], []);
    // Clear error
    const clearError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useChat.useCallback[clearError]": ()=>setError(null)
    }["useChat.useCallback[clearError]"], []);
    // Send message with RAG integration
    const sendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useChat.useCallback[sendMessage]": async (userMessage)=>{
            if (!userMessage.trim() || isLoading) return;
            // Check if user wants to continue previous chat
            if (userMessage.toLowerCase().trim() === 'yes' && hasSavedChat) {
                loadPreviousChat();
                return;
            }
            clearError();
            // Client-side problem detection (basic)
            const detectedProblems = (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$chat$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectProblemsClientSide"])(userMessage);
            if (detectedProblems.length > 0) {
                setIdentifiedProblems({
                    "useChat.useCallback[sendMessage]": (prev)=>{
                        const newProblems = [
                            ...prev
                        ];
                        detectedProblems.forEach({
                            "useChat.useCallback[sendMessage]": (problem)=>{
                                if (!newProblems.find({
                                    "useChat.useCallback[sendMessage]": (p)=>p.key === problem.key
                                }["useChat.useCallback[sendMessage]"])) {
                                    newProblems.push(problem);
                                }
                            }
                        }["useChat.useCallback[sendMessage]"]);
                        return newProblems;
                    }
                }["useChat.useCallback[sendMessage]"]);
            }
            // Update conversation stage
            const messageCount = messages.filter({
                "useChat.useCallback[sendMessage]": (m)=>m.role === 'user'
            }["useChat.useCallback[sendMessage]"]).length + 1;
            const newStage = (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$chat$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["determineConversationStage"])(messageCount, identifiedProblems.length + detectedProblems.length);
            setConversationStage(newStage);
            // Add user message
            const newUserMessage = {
                id: `user-${Date.now()}`,
                role: 'user',
                content: userMessage.trim(),
                timestamp: new Date(),
                conversationId: conversationIdRef.current
            };
            setMessages({
                "useChat.useCallback[sendMessage]": (prev)=>[
                        ...prev,
                        newUserMessage
                    ]
            }["useChat.useCallback[sendMessage]"]);
            setIsLoading(true);
            setStreamingMessage('');
            // Create assistant placeholder
            const assistantMessageId = `assistant-${Date.now()}`;
            streamingIdRef.current = assistantMessageId;
            const assistantMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: 'Thinking...',
                timestamp: new Date(),
                conversationId: conversationIdRef.current,
                isStreaming: true,
                isThinking: true
            };
            setMessages({
                "useChat.useCallback[sendMessage]": (prev)=>[
                        ...prev,
                        assistantMessage
                    ]
            }["useChat.useCallback[sendMessage]"]);
            try {
                // Small delay for UX
                await new Promise({
                    "useChat.useCallback[sendMessage]": (resolve)=>setTimeout(resolve, 800)
                }["useChat.useCallback[sendMessage]"]);
                // Prepare messages for API (exclude welcome and system messages)
                const apiMessages = [
                    ...messages,
                    newUserMessage
                ].filter({
                    "useChat.useCallback[sendMessage].apiMessages": (m)=>!m.isWelcome && m.role !== 'system'
                }["useChat.useCallback[sendMessage].apiMessages"]).slice(-10) // Last 10 messages for context
                .map({
                    "useChat.useCallback[sendMessage].apiMessages": (m)=>({
                            role: m.role,
                            content: m.content
                        })
                }["useChat.useCallback[sendMessage].apiMessages"]);
                // ✅ ADD DATE CONTEXT - Prepend current date as system message
                const messagesWithContext = [
                    {
                        role: 'system',
                        content: (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$chat$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentDateContext"])()
                    },
                    ...apiMessages
                ];
                // 🔥 CRITICAL: Call Next.js API route with RAG integration
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: messagesWithContext,
                        industry,
                        sessionId: sessionIdRef.current,
                        conversationStage: newStage,
                        detectedProblems: [
                            ...identifiedProblems,
                            ...detectedProblems
                        ].map({
                            "useChat.useCallback[sendMessage]": (p)=>p.key
                        }["useChat.useCallback[sendMessage]"])
                    })
                });
                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }
                // Handle Server-Sent Events (SSE) streaming
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let accumulatedResponse = '';
                let propertyResults; // ✨ NEW: Store property results
                if (!reader) {
                    throw new Error('No response body');
                }
                while(true){
                    const { value, done } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    for (const line of lines){
                        if (!line.startsWith('data: ')) continue;
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            // Stream complete
                            const checkedResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$chat$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["performBasicGrammarCheck"])(accumulatedResponse);
                            setMessages({
                                "useChat.useCallback[sendMessage]": (prev)=>prev.map({
                                        "useChat.useCallback[sendMessage]": (msg)=>msg.id === assistantMessageId ? {
                                                ...msg,
                                                content: checkedResponse,
                                                propertyResults,
                                                isStreaming: false,
                                                isThinking: false
                                            } : msg
                                    }["useChat.useCallback[sendMessage]"])
                            }["useChat.useCallback[sendMessage]"]);
                            setStreamingMessage('');
                            setIsLoading(false);
                            return;
                        }
                        if (data) {
                            try {
                                const parsed = JSON.parse(data);
                                // ✨ NEW: Handle regular content
                                if (parsed.content) {
                                    accumulatedResponse += parsed.content;
                                    // Update streaming message in real-time
                                    setMessages({
                                        "useChat.useCallback[sendMessage]": (prev)=>prev.map({
                                                "useChat.useCallback[sendMessage]": (msg)=>msg.id === assistantMessageId ? {
                                                        ...msg,
                                                        content: accumulatedResponse,
                                                        isThinking: false
                                                    } : msg
                                            }["useChat.useCallback[sendMessage]"])
                                    }["useChat.useCallback[sendMessage]"]);
                                }
                                // ✨ NEW: Handle property results
                                if (parsed.type === 'property_results') {
                                    propertyResults = parsed.properties;
                                    console.log('🏠 Received property results:', propertyResults);
                                    console.log('🏘️ Property count:', propertyResults?.length);
                                    console.log('🏡 First property:', propertyResults?.[0]?.property?.address);
                                    // Update message with property results immediately
                                    setMessages({
                                        "useChat.useCallback[sendMessage]": (prev)=>prev.map({
                                                "useChat.useCallback[sendMessage]": (msg)=>msg.id === assistantMessageId ? {
                                                        ...msg,
                                                        propertyResults
                                                    } : msg
                                            }["useChat.useCallback[sendMessage]"])
                                    }["useChat.useCallback[sendMessage]"]);
                                }
                                // ✨ NEW: Handle property search errors
                                if (parsed.type === 'property_search_error') {
                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(parsed.error || 'Failed to search properties');
                                }
                            } catch (parseError) {
                                console.warn('Failed to parse SSE data:', data);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Chat error:', error);
                handleStreamError(error, '', streamingIdRef.current);
            } finally{
                setIsLoading(false);
                abortControllerRef.current = null;
                streamingIdRef.current = null;
            }
        }
    }["useChat.useCallback[sendMessage]"], [
        messages,
        isLoading,
        clearError,
        identifiedProblems,
        conversationStage,
        industry,
        hasSavedChat,
        loadPreviousChat
    ]);
    // Handle streaming errors
    const handleStreamError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useChat.useCallback[handleStreamError]": (error, partialResponse, messageId)=>{
            console.error('Chat error:', error);
            setStreamingMessage('');
            const errorMessage = 'I apologize for the technical issue. Let\'s continue - what were you telling me about your business?';
            if (partialResponse?.trim() && messageId) {
                setMessages({
                    "useChat.useCallback[handleStreamError]": (prev)=>prev.map({
                            "useChat.useCallback[handleStreamError]": (msg)=>msg.id === messageId ? {
                                    ...msg,
                                    content: partialResponse + '\n\n*[Connection interrupted - please continue]*',
                                    isPartial: true,
                                    isStreaming: false,
                                    isThinking: false
                                } : msg
                        }["useChat.useCallback[handleStreamError]"])
                }["useChat.useCallback[handleStreamError]"]);
            } else if (messageId) {
                setMessages({
                    "useChat.useCallback[handleStreamError]": (prev)=>prev.map({
                            "useChat.useCallback[handleStreamError]": (msg)=>msg.id === messageId ? {
                                    ...msg,
                                    content: errorMessage,
                                    isError: true,
                                    isStreaming: false,
                                    isThinking: false
                                } : msg
                        }["useChat.useCallback[handleStreamError]"])
                }["useChat.useCallback[handleStreamError]"]);
            }
            setError(error.message);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Connection issue - please retry', {
                duration: 3000
            });
        }
    }["useChat.useCallback[handleStreamError]"], []);
    // Clear messages
    const clearMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useChat.useCallback[clearMessages]": ()=>{
            setMessages([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$chat$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWelcomeMessage"])()
            ]);
            setStreamingMessage('');
            setError(null);
            setIdentifiedProblems([]);
            setConversationStage('discovery');
            setHasShownCalendlyButton(false);
            conversationIdRef.current = `conv-${Date.now()}`;
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.removeItem('strive-chat-history');
            }
        }
    }["useChat.useCallback[clearMessages]"], []);
    // Stop generation
    const stopGeneration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useChat.useCallback[stopGeneration]": ()=>{
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                if (streamingIdRef.current) {
                    setMessages({
                        "useChat.useCallback[stopGeneration]": (prev)=>prev.map({
                                "useChat.useCallback[stopGeneration]": (msg)=>msg.id === streamingIdRef.current ? {
                                        ...msg,
                                        isStreaming: false,
                                        isThinking: false
                                    } : msg
                            }["useChat.useCallback[stopGeneration]"])
                    }["useChat.useCallback[stopGeneration]"]);
                }
                setIsLoading(false);
                setStreamingMessage('');
                streamingIdRef.current = null;
            }
        }
    }["useChat.useCallback[stopGeneration]"], []);
    // Retry last message
    const retryLastMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useChat.useCallback[retryLastMessage]": ()=>{
            const lastUserMessage = [
                ...messages
            ].reverse().find({
                "useChat.useCallback[retryLastMessage].lastUserMessage": (msg)=>msg.role === 'user'
            }["useChat.useCallback[retryLastMessage].lastUserMessage"]);
            if (lastUserMessage) {
                setMessages({
                    "useChat.useCallback[retryLastMessage]": (prev)=>prev.filter({
                            "useChat.useCallback[retryLastMessage]": (msg)=>!(msg.role === 'assistant' && (msg.isError || msg.isPartial))
                        }["useChat.useCallback[retryLastMessage]"])
                }["useChat.useCallback[retryLastMessage]"]);
                sendMessage(lastUserMessage.content);
            }
        }
    }["useChat.useCallback[retryLastMessage]"], [
        messages,
        sendMessage
    ]);
    // Get stats
    const getStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useChat.useCallback[getStats]": ()=>{
            const userMessages = messages.filter({
                "useChat.useCallback[getStats]": (msg)=>msg.role === 'user'
            }["useChat.useCallback[getStats]"]).length;
            const assistantMessages = messages.filter({
                "useChat.useCallback[getStats]": (msg)=>msg.role === 'assistant' && !msg.isWelcome
            }["useChat.useCallback[getStats]"]).length;
            return {
                totalMessages: messages.length,
                userMessages,
                assistantMessages,
                conversationId: conversationIdRef.current,
                hasApiKey: true,
                isStreaming: isLoading && !!streamingIdRef.current,
                identifiedProblems: identifiedProblems.map({
                    "useChat.useCallback[getStats]": (p)=>p.key
                }["useChat.useCallback[getStats]"]),
                conversationStage,
                needsConsultation: conversationStage === 'closing' || userMessages >= 8
            };
        }
    }["useChat.useCallback[getStats]"], [
        messages,
        isLoading,
        identifiedProblems,
        conversationStage
    ]);
    // Auto-save conversation
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useChat.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            if (messages.length <= 1) return;
            try {
                const chatHistory = {
                    messages: messages.filter({
                        "useChat.useEffect": (msg)=>!msg.isStreaming
                    }["useChat.useEffect"]),
                    timestamp: new Date(),
                    conversationId: conversationIdRef.current,
                    identifiedProblems: identifiedProblems,
                    stage: conversationStage
                };
                localStorage.setItem('strive-chat-history', JSON.stringify(chatHistory));
            } catch (error) {
                console.warn('Failed to save chat history:', error);
            }
        }
    }["useChat.useEffect"], [
        messages,
        identifiedProblems,
        conversationStage
    ]);
    return {
        messages,
        isLoading,
        streamingMessage,
        error,
        sendMessage,
        clearMessages,
        stopGeneration,
        retryLastMessage,
        clearError,
        getStats,
        identifiedProblems,
        conversationStage,
        hasShownCalendlyButton,
        hasSavedChat
    };
};
_s(useChat, "HpQoAB70ZuUfzpU+E3pHNfKSAiM=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/hooks/use-scroll-manager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// hooks/useScrollManager.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
const useScrollManager = (messages, streamingMessage)=>{
    _s();
    const [isNearBottom, setIsNearBottom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showScrollButton, setShowScrollButton] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const scrollContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastScrollTop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const scrollTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const animationFrameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const previousMessageCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const previousStreamingContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])('');
    const previousLastMessageContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])('');
    const NEAR_BOTTOM_THRESHOLD = 100;
    // Check if user is near bottom
    const checkIfNearBottom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useScrollManager.useCallback[checkIfNearBottom]": ()=>{
            if (!scrollContainerRef.current) return true;
            const container = scrollContainerRef.current;
            const { scrollTop, scrollHeight, clientHeight } = container;
            const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
            return distanceFromBottom <= NEAR_BOTTOM_THRESHOLD;
        }
    }["useScrollManager.useCallback[checkIfNearBottom]"], []);
    // Smooth scroll to bottom
    const scrollToBottom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useScrollManager.useCallback[scrollToBottom]": (force = false, smooth = true)=>{
            if (!scrollContainerRef.current && !messagesEndRef.current) return;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            const performScroll = {
                "useScrollManager.useCallback[scrollToBottom].performScroll": ()=>{
                    try {
                        if (scrollContainerRef.current) {
                            const container = scrollContainerRef.current;
                            const scrollOptions = {
                                top: container.scrollHeight,
                                behavior: smooth ? 'smooth' : 'auto'
                            };
                            container.scrollTo(scrollOptions);
                        } else if (messagesEndRef.current) {
                            messagesEndRef.current.scrollIntoView({
                                behavior: smooth ? 'smooth' : 'auto',
                                block: 'end',
                                inline: 'nearest'
                            });
                        }
                    } catch (error) {
                        console.warn('Scroll failed:', error);
                    }
                }
            }["useScrollManager.useCallback[scrollToBottom].performScroll"];
            const currentNearBottom = checkIfNearBottom();
            const currentAutoScrollEnabled = isAutoScrollEnabled;
            if (force || currentAutoScrollEnabled && currentNearBottom) {
                animationFrameRef.current = requestAnimationFrame({
                    "useScrollManager.useCallback[scrollToBottom]": ()=>{
                        performScroll();
                        setTimeout({
                            "useScrollManager.useCallback[scrollToBottom]": ()=>{
                                if (checkIfNearBottom()) {
                                    setIsNearBottom(true);
                                    setShowScrollButton(false);
                                }
                            }
                        }["useScrollManager.useCallback[scrollToBottom]"], 100);
                    }
                }["useScrollManager.useCallback[scrollToBottom]"]);
            }
        }
    }["useScrollManager.useCallback[scrollToBottom]"], [
        checkIfNearBottom,
        isAutoScrollEnabled
    ]);
    // Handle manual scroll to bottom
    const handleScrollToBottom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useScrollManager.useCallback[handleScrollToBottom]": ()=>{
            setIsAutoScrollEnabled(true);
            scrollToBottom(true, true);
        }
    }["useScrollManager.useCallback[handleScrollToBottom]"], [
        scrollToBottom
    ]);
    // Scroll event handler
    const handleScroll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useScrollManager.useCallback[handleScroll]": ()=>{
            if (!scrollContainerRef.current) return;
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout({
                "useScrollManager.useCallback[handleScroll]": ()=>{
                    const nearBottom = checkIfNearBottom();
                    setIsNearBottom(nearBottom);
                    setShowScrollButton(!nearBottom);
                    setIsAutoScrollEnabled(nearBottom);
                    if (scrollContainerRef.current) {
                        lastScrollTop.current = scrollContainerRef.current.scrollTop;
                    }
                }
            }["useScrollManager.useCallback[handleScroll]"], 100);
        }
    }["useScrollManager.useCallback[handleScroll]"], [
        checkIfNearBottom
    ]);
    // Auto-scroll on new messages
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useScrollManager.useEffect": ()=>{
            const currentMessageCount = messages.length;
            if (currentMessageCount > previousMessageCount.current && currentMessageCount > 0) {
                setTimeout({
                    "useScrollManager.useEffect": ()=>{
                        scrollToBottom(true, true);
                    }
                }["useScrollManager.useEffect"], 50);
            }
            previousMessageCount.current = currentMessageCount;
        }
    }["useScrollManager.useEffect"], [
        messages.length,
        scrollToBottom
    ]);
    // Auto-scroll during streaming
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useScrollManager.useEffect": ()=>{
            const currentStreamingContent = streamingMessage || '';
            if (streamingMessage && currentStreamingContent !== previousStreamingContent.current && currentStreamingContent.length > previousStreamingContent.current.length) {
                setTimeout({
                    "useScrollManager.useEffect": ()=>{
                        scrollToBottom(false, false);
                    }
                }["useScrollManager.useEffect"], 10);
            }
            previousStreamingContent.current = currentStreamingContent;
        }
    }["useScrollManager.useEffect"], [
        streamingMessage,
        scrollToBottom
    ]);
    // Auto-scroll on assistant message updates
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useScrollManager.useEffect": ()=>{
            if (messages.length === 0) return;
            const lastMessage = messages[messages.length - 1];
            const currentLastMessageContent = lastMessage ? lastMessage.content : '';
            if (lastMessage && lastMessage.role === 'assistant' && currentLastMessageContent !== previousLastMessageContent.current && currentLastMessageContent.length > previousLastMessageContent.current.length && currentLastMessageContent !== 'Thinking...') {
                setTimeout({
                    "useScrollManager.useEffect": ()=>{
                        scrollToBottom(true, true);
                    }
                }["useScrollManager.useEffect"], 50);
            }
            previousLastMessageContent.current = currentLastMessageContent;
        }
    }["useScrollManager.useEffect"], [
        messages,
        scrollToBottom
    ]);
    // Attach scroll listener
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useScrollManager.useEffect": ()=>{
            const container = scrollContainerRef.current;
            if (!container) return;
            container.addEventListener('scroll', handleScroll, {
                passive: true
            });
            return ({
                "useScrollManager.useEffect": ()=>{
                    container.removeEventListener('scroll', handleScroll);
                    if (scrollTimeoutRef.current) {
                        clearTimeout(scrollTimeoutRef.current);
                    }
                    if (animationFrameRef.current) {
                        cancelAnimationFrame(animationFrameRef.current);
                    }
                }
            })["useScrollManager.useEffect"];
        }
    }["useScrollManager.useEffect"], [
        handleScroll
    ]);
    // Initialize scroll position
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useScrollManager.useEffect": ()=>{
            const timer = setTimeout({
                "useScrollManager.useEffect.timer": ()=>{
                    if (scrollContainerRef.current) {
                        const container = scrollContainerRef.current;
                        container.scrollTo({
                            top: container.scrollHeight,
                            behavior: 'auto'
                        });
                    }
                }
            }["useScrollManager.useEffect.timer"], 100);
            return ({
                "useScrollManager.useEffect": ()=>clearTimeout(timer)
            })["useScrollManager.useEffect"];
        }
    }["useScrollManager.useEffect"], []);
    return {
        scrollContainerRef,
        messagesEndRef,
        isNearBottom,
        showScrollButton,
        isAutoScrollEnabled,
        scrollToBottom,
        handleScrollToBottom,
        setIsAutoScrollEnabled
    };
};
_s(useScrollManager, "doP9VRMtYmgQWhc9XBaYm5bQ+X4=");
const __TURBOPACK__default__export__ = useScrollManager;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/lib/utils/parent-communication.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/utils/parentCommunication.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use client';
class ParentCommunication {
    debugMode;
    allowedOrigins;
    parentOrigin;
    messageQueue;
    isReady;
    constructor(){
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
        this.debugLog(`🐛 Debug mode: ${this.debugMode ? 'ENABLED' : 'disabled'}`);
        this.debugLog(`🌐 Parent origin: ${this.parentOrigin}`);
        this.debugLog(`🖼️ In iframe: ${("TURBOPACK compile-time value", "object") !== 'undefined' && window.parent !== window}`);
    }
    debugLog(message, force = false) {
        if (this.debugMode || force) {
            console.log(`[ParentComm] ${message}`);
        }
    }
    detectParentOrigin() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Try to get parent origin from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const parentParam = urlParams.get('parent');
        if (parentParam) {
            this.debugLog(`🎯 Parent origin from URL: ${parentParam}`);
            return parentParam;
        }
        // Try to detect from document referrer
        if (document.referrer) {
            try {
                const referrerUrl = new URL(document.referrer);
                this.debugLog(`🎯 Parent origin from referrer: ${referrerUrl.origin}`);
                return referrerUrl.origin;
            } catch (e) {
                this.debugLog(`⚠️ Could not parse referrer: ${e}`);
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
        if (("TURBOPACK compile-time value", "object") === 'undefined' || !window.ResizeObserver) return;
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
        this.debugLog(`🖼️ iframe check: ${("TURBOPACK compile-time value", "object") !== 'undefined' && window.parent !== window}`, true);
        this.debugLog(`📍 current URL: ${("TURBOPACK compile-time truthy", 1) ? window.location.href : "TURBOPACK unreachable"}`, true);
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
        if (("TURBOPACK compile-time value", "object") === 'undefined' || typeof document === 'undefined') return;
        const height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        const width = Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
        this.sendToParent('resize', {
            height,
            width
        });
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
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const path = window.location.pathname;
        if (path.includes('/widget')) return 'widget';
        if (path.includes('/full')) return 'full';
        return 'full';
    }
    sendToParent(type, data = {}) {
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
            this.debugLog(`✅ PostMessage sent: ${JSON.stringify(message)}`, true);
        } catch (error) {
            this.debugLog(`❌ PostMessage failed: ${error}`, true);
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
"[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// components/(web)/features/chatbot/chat-container.tsx
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minimize-2.js [app-client] (ecmascript) <export default as Minimize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-client] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$command$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Command$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/command.js [app-client] (ecmascript) <export default as Command>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$components$2f28$web$292f$features$2f$chatbot$2f$chat$2d$message$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/components/(web)/features/chatbot/chat-message.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$components$2f28$web$292f$features$2f$chatbot$2f$chat$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/components/(web)/features/chatbot/chat-input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/hooks/use-chat.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$constants$2f$chatConstants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/app/constants/chatConstants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$advanced$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/hooks/use-advanced-chat.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$scroll$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/hooks/use-scroll-manager.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$utils$2f$parent$2d$communication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/lib/utils/parent-communication.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
// Quick action suggestions component
const QuickActions = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(({ messageCount, onAction })=>{
    const suggestions = messageCount === 0 ? [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
            text: "Quick Demo",
            action: "show_demo"
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
            text: "ROI Calculator",
            action: "roi_calc"
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
            text: "Case Studies",
            action: "case_studies"
        }
    ] : [];
    if (!suggestions.length) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1
        },
        className: "flex gap-2 mb-4",
        children: suggestions.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                initial: {
                    opacity: 0,
                    scale: 0.8
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                transition: {
                    delay: i * 0.1
                },
                onClick: ()=>onAction(s.action),
                className: "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-300",
                whileHover: {
                    scale: 1.05
                },
                whileTap: {
                    scale: 0.95
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(s.icon, {
                        size: 14
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: s.text
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, s.action, true, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                lineNumber: 32,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)))
    }, void 0, false, {
        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
_c = QuickActions;
QuickActions.displayName = 'QuickActions';
// Service showcase card component - REAL ESTATE
const ServiceCard = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(({ service, sendMessage })=>{
    const iconMap = {
        TrendingUp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
        Eye: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"],
        MessageCircle: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"]
    };
    const Icon = iconMap[service.icon];
    if (!Icon) return null;
    const handleCardClick = ()=>{
        const serviceMessages = {
            'TrendingUp': "I'm interested in learning about Lead Generation. Can you explain how AI can help me attract and qualify more real estate leads? Then I'd like to explore solutions specific to my business.",
            'Eye': "I'm interested in learning about Property Matching. Can you explain how AI can help match buyers with the perfect properties? Then I'd like to explore solutions specific to my business.",
            'MessageCircle': "I'm interested in learning about Market Insights. Can you explain how AI can provide predictive analytics for pricing and market opportunities? Then I'd like to explore solutions specific to my business."
        };
        const messageToSend = serviceMessages[service.icon];
        if (messageToSend && sendMessage) {
            sendMessage(messageToSend);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        className: "bg-gray-700 rounded-xl px-4 py-3 border border-gray-600 transition-all duration-300 cursor-pointer hover:bg-gray-600 flex items-center space-x-3",
        onClick: handleCardClick,
        whileHover: {
            scale: 1.02
        },
        whileTap: {
            scale: 0.95
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: `w-10 h-10 bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo} rounded-lg flex items-center justify-center flex-shrink-0`,
                whileHover: {
                    rotate: 10
                },
                transition: {
                    duration: 0.15
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                    size: 20,
                    className: "text-white"
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold text-sm text-gray-200",
                        children: service.title
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-primary-500 font-medium",
                        children: "Learn More →"
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = ServiceCard;
ServiceCard.displayName = 'ServiceCard';
const ChatContainer = ({ mode = 'full' })=>{
    _s();
    const { messages, isLoading, streamingMessage, error, sendMessage, clearMessages, stopGeneration, retryLastMessage, getStats } = (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChat"])('real-estate'); // ✅ Configure for Real Estate industry
    const { scrollContainerRef, messagesEndRef, showScrollButton, handleScrollToBottom } = (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$scroll$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(messages, streamingMessage);
    const [isMinimized, setIsMinimized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showStats, setShowStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$advanced$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTimeBasedGreeting"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatContainer.useEffect": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$utils$2f$parent$2d$communication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notifyAnalytics('chat_opened', {
                    mode
                });
            }
        }
    }["ChatContainer.useEffect"], [
        mode
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$advanced$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useKeyboardShortcuts"])({
        onSearch: {
            "ChatContainer.useKeyboardShortcuts": ()=>console.log('Search triggered')
        }["ChatContainer.useKeyboardShortcuts"],
        onShowShortcuts: {
            "ChatContainer.useKeyboardShortcuts": ()=>setShowKeyboardShortcuts(!showKeyboardShortcuts)
        }["ChatContainer.useKeyboardShortcuts"],
        onClear: clearMessages
    });
    const handleScheduleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatContainer.useCallback[handleScheduleClick]": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                if (window.parent && window.parent !== window) {
                    __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$utils$2f$parent$2d$communication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notifyNavigate(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$constants$2f$chatConstants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["URLS"].CALENDLY, '_blank');
                } else {
                    window.open(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$constants$2f$chatConstants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["URLS"].CALENDLY, '_blank');
                }
            }
        }
    }["ChatContainer.useCallback[handleScheduleClick]"], []);
    const handleWebsiteClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatContainer.useCallback[handleWebsiteClick]": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                if (window.parent && window.parent !== window) {
                    __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$utils$2f$parent$2d$communication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notifyNavigate(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$constants$2f$chatConstants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["URLS"].STRIVE_WEBSITE, '_blank');
                } else {
                    window.open(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$constants$2f$chatConstants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["URLS"].STRIVE_WEBSITE, '_blank');
                }
            }
        }
    }["ChatContainer.useCallback[handleWebsiteClick]"], []);
    const handleSendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatContainer.useCallback[handleSendMessage]": (message)=>{
            if ("TURBOPACK compile-time truthy", 1) {
                __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$utils$2f$parent$2d$communication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notifyAnalytics('message_sent', {
                    messageLength: message.length,
                    mode
                });
            }
            sendMessage(message);
        }
    }["ChatContainer.useCallback[handleSendMessage]"], [
        sendMessage,
        mode
    ]);
    const handleQuickAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatContainer.useCallback[handleQuickAction]": (action)=>{
            switch(action){
                case 'schedule':
                    handleScheduleClick();
                    break;
                case 'export':
                    if ("TURBOPACK compile-time truthy", 1) {
                        const blob = new Blob([
                            JSON.stringify(messages, null, 2)
                        ], {
                            type: 'application/json'
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `strive-chat-${Date.now()}.json`;
                        a.click();
                    }
                    break;
                case 'email':
                    if ("TURBOPACK compile-time truthy", 1) {
                        window.open(`mailto:contact@strivetech.ai?subject=${encodeURIComponent('STRIVE Real Estate AI Consultation')}&body=${encodeURIComponent('I would like to discuss the real estate AI solutions we explored.')}`);
                    }
                    break;
                default:
                    handleSendMessage(`Tell me more about ${action.replace('_', ' ')}`);
            }
        }
    }["ChatContainer.useCallback[handleQuickAction]"], [
        handleScheduleClick,
        messages,
        handleSendMessage
    ]);
    const stats = getStats();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        className: `chat-container ${mode === 'widget' ? 'widget-chat' : 'full-chat'} flex flex-col bg-gray-800 border border-gray-600 rounded-xl overflow-hidden transition-all duration-300 relative ${isMinimized ? 'h-16' : mode === 'widget' ? 'h-full' : 'h-screen'}`,
        initial: {
            opacity: 0,
            y: 50
        },
        animate: {
            opacity: 1,
            y: 0
        },
        transition: {
            duration: 0.3
        },
        style: {
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 overflow-hidden pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute inset-0 bg-gradient-to-br from-primary-900/10 via-transparent to-transparent opacity-50"
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                    lineNumber: 198,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                lineNumber: 197,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            mode === 'full' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "chat-header flex items-center justify-between p-4 bg-gray-900 text-gray-100 relative z-10 border-b border-gray-700",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between w-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    className: "flex items-center mt-0 ml-5 cursor-pointer",
                                    whileHover: {
                                        scale: 1.05
                                    },
                                    onClick: handleWebsiteClick,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].img, {
                                        src: "/images/strive-wordmark.png",
                                        alt: "STRIVE",
                                        className: "h-10 w-auto",
                                        style: {
                                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                        lineNumber: 211,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 206,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    className: "flex items-center space-x-2 text-sm mt-5 ml-5 text-gray-400",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-2 h-2 rounded-full bg-green-500 glow-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                                    lineNumber: 221,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Sai Active"
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                                    lineNumber: 222,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                            lineNumber: 220,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "•"
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                            lineNumber: 224,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                stats.totalMessages - 1,
                                                " messages"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                            lineNumber: 225,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        !stats.hasApiKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "•"
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                                    lineNumber: 228,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-amber-400 flex items-center space-x-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                                            lineNumber: 230,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "API key needed"
                                                        }, void 0, false, {
                                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                                            lineNumber: 231,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                                    lineNumber: 229,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 219,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                            lineNumber: 205,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-2 mt-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                    onClick: handleScheduleClick,
                                    className: "brand-orange-button px-4 py-2.5 text-white rounded-xl font-semibold text-sm flex items-center space-x-2",
                                    whileHover: {
                                        scale: 1.05,
                                        boxShadow: "0 0 25px rgba(229, 95, 42, 0.6)"
                                    },
                                    whileTap: {
                                        scale: 0.95
                                    },
                                    transition: {
                                        duration: 0.15
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                            size: 24
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                            lineNumber: 247,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "hidden sm:inline",
                                            children: "Book Call"
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                            lineNumber: 248,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 240,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                [
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
                                        onClick: ()=>setShowStats(!showStats),
                                        rotate: 360
                                    },
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"],
                                        onClick: clearMessages,
                                        rotate: -360,
                                        className: "danger-button"
                                    },
                                    {
                                        icon: isMinimized ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize2$3e$__["Minimize2"],
                                        onClick: ()=>{
                                            const newMinimizedState = !isMinimized;
                                            setIsMinimized(newMinimizedState);
                                            if (newMinimizedState && ("TURBOPACK compile-time value", "object") !== 'undefined') {
                                                __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$utils$2f$parent$2d$communication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notifyMinimize();
                                            }
                                        },
                                        scale: [
                                            1,
                                            1.3,
                                            0.8,
                                            1.1,
                                            1
                                        ]
                                    }
                                ].map(({ icon: Icon, onClick, rotate, scale, className = "secondary-button hidden-mobile" }, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                        onClick: onClick,
                                        className: `p-3 ${className} rounded-xl`,
                                        whileHover: {
                                            scale: 1.05,
                                            backgroundColor: "rgba(255, 255, 255, 0.1)"
                                        },
                                        whileTap: {
                                            scale: 0.95
                                        },
                                        transition: {
                                            duration: 0.15
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            whileHover: rotate ? {
                                                rotate
                                            } : scale ? {
                                                scale
                                            } : {},
                                            animate: {
                                                rotate: 0
                                            },
                                            transition: {
                                                duration: rotate === 360 || rotate === -360 ? 0.4 : 0.5,
                                                ease: rotate === -360 ? "linear" : "easeInOut"
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                size: 24
                                            }, void 0, false, {
                                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                                lineNumber: 275,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                            lineNumber: 270,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, i, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                        lineNumber: 262,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                            lineNumber: 239,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                    lineNumber: 204,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                lineNumber: 203,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: showStats && !isMinimized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        height: 0
                    },
                    animate: {
                        opacity: 1,
                        height: "auto"
                    },
                    exit: {
                        opacity: 0,
                        height: 0
                    },
                    transition: {
                        duration: 0.3
                    },
                    className: "bg-gray-850 border-b border-gray-700 p-4 relative z-10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center",
                        children: [
                            {
                                value: stats.userMessages,
                                label: "Your Messages",
                                color: "text-primary-500"
                            },
                            {
                                value: stats.assistantMessages,
                                label: "Sai Responses",
                                color: "text-blue-500"
                            },
                            {
                                value: stats.hasApiKey ? 'Active' : 'Setup',
                                label: "Status",
                                color: "text-green-500"
                            },
                            {
                                value: stats.isStreaming ? 'Live' : 'Ready',
                                label: "Connection",
                                color: "text-purple-500"
                            }
                        ].map(({ value, label, color })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-700 rounded-xl p-3 border border-gray-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `text-2xl font-semibold ${color}`,
                                        children: value
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                        lineNumber: 302,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-400",
                                        children: label
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                        lineNumber: 303,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, label, true, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                lineNumber: 301,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                        lineNumber: 294,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                    lineNumber: 287,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                lineNumber: 285,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: !isMinimized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        height: 0,
                        opacity: 0
                    },
                    animate: {
                        height: "auto",
                        opacity: 1
                    },
                    exit: {
                        height: 0,
                        height: 0
                    },
                    transition: {
                        duration: 0.3
                    },
                    className: "flex-1 flex flex-col relative z-10 min-h-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: scrollContainerRef,
                            className: `flex-1 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-800 to-gray-900 chat-scrollbar scroll-container ${mode === 'widget' ? 'p-3 pb-32' : 'p-6 pb-64'}`,
                            children: [
                                messages.length === 1 && mode === 'full' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 20
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    transition: {
                                        duration: 0.3
                                    },
                                    className: "grid md:grid-cols-3 gap-4 mb-8 hidden md:grid",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$app$2f$constants$2f$chatConstants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SERVICE_CARDS"].map((service, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ServiceCard, {
                                            service: service,
                                            sendMessage: sendMessage
                                        }, index, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                            lineNumber: 334,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0)))
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 327,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(QuickActions, {
                                    messageCount: messages.length,
                                    onAction: handleQuickAction
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 339,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    mode: "popLayout",
                                    children: messages.map((message, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$components$2f28$web$292f$features$2f$chatbot$2f$chat$2d$message$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            message: message,
                                            isFirst: index === 0,
                                            mode: mode
                                        }, message.id, false, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                            lineNumber: 344,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)))
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 342,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    children: isLoading && streamingMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$components$2f28$web$292f$features$2f$chatbot$2f$chat$2d$message$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        message: {
                                            id: 'streaming',
                                            role: 'assistant',
                                            content: streamingMessage,
                                            timestamp: new Date()
                                        },
                                        isStreaming: true,
                                        mode: mode
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                        lineNumber: 351,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 349,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    children: error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            scale: 0.9
                                        },
                                        animate: {
                                            opacity: 1,
                                            scale: 1
                                        },
                                        exit: {
                                            opacity: 0,
                                            scale: 0.9
                                        },
                                        className: "flex justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: retryLastMessage,
                                            className: "brand-orange-button px-6 py-3 text-white text-sm font-semibold rounded-xl flex items-center space-x-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Retry with Sai"
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                                    lineNumber: 377,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                    size: 16
                                                }, void 0, false, {
                                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                                    lineNumber: 378,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                            lineNumber: 373,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                        lineNumber: 367,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 365,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    ref: messagesEndRef,
                                    className: "h-7"
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 384,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                            lineNumber: 321,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                            children: showScrollButton && !isMinimized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                initial: {
                                    opacity: 0,
                                    scale: 0.8,
                                    y: 20
                                },
                                animate: {
                                    opacity: 1,
                                    scale: 1,
                                    y: 0
                                },
                                exit: {
                                    opacity: 0,
                                    scale: 0.8,
                                    y: 20
                                },
                                transition: {
                                    duration: 0.2,
                                    ease: "easeOut"
                                },
                                onClick: handleScrollToBottom,
                                className: `scroll-to-bottom-inside visible ${mode === 'widget' ? 'bottom-16' : messages.length > 1 ? 'bottom-52' : 'bottom-36'}`,
                                whileHover: {
                                    scale: 1.1
                                },
                                whileTap: {
                                    scale: 0.9
                                },
                                "aria-label": "Scroll to bottom",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                    size: mode === 'widget' ? 16 : 20
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 401,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                lineNumber: 390,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                            lineNumber: 388,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                    lineNumber: 314,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                lineNumber: 312,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: !isMinimized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: 50
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    exit: {
                        opacity: 0,
                        y: 50
                    },
                    transition: {
                        duration: 0.3
                    },
                    className: "absolute bottom-0 left-0 right-0 z-20",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$components$2f28$web$292f$features$2f$chatbot$2f$chat$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        onSendMessage: handleSendMessage,
                        isLoading: isLoading,
                        disabled: !stats.hasApiKey,
                        onStop: stopGeneration,
                        onClear: clearMessages,
                        onScheduleClick: handleScheduleClick,
                        mode: mode,
                        messageCount: messages.length
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                        lineNumber: 419,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                    lineNumber: 412,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                lineNumber: 410,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: showKeyboardShortcuts && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        x: -20
                    },
                    animate: {
                        opacity: 1,
                        x: 0
                    },
                    exit: {
                        opacity: 0,
                        x: -20
                    },
                    transition: {
                        duration: 0.15
                    },
                    className: "fixed bottom-20 left-4 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                            className: "text-xs font-bold text-gray-300 mb-2 flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$command$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Command$3e$__["Command"], {
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                    lineNumber: 444,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                "Keyboard Shortcuts"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                            lineNumber: 443,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        [
                            {
                                key: "⌘+K",
                                action: "Quick search"
                            },
                            {
                                key: "⌘+/",
                                action: "Toggle shortcuts"
                            },
                            {
                                key: "⌘+Enter",
                                action: "Send message"
                            },
                            {
                                key: "Esc",
                                action: "Clear input"
                            }
                        ].map((shortcut, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    x: -10
                                },
                                animate: {
                                    opacity: 1,
                                    x: 0
                                },
                                transition: {
                                    delay: i * 0.05,
                                    duration: 0.15
                                },
                                className: "flex justify-between items-center gap-4 text-xs text-gray-400 py-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                        className: "px-2 py-1 bg-gray-800 rounded text-gray-300 font-mono",
                                        children: shortcut.key
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                        lineNumber: 460,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: shortcut.action
                                    }, void 0, false, {
                                        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                        lineNumber: 461,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, shortcut.key, true, {
                                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                                lineNumber: 453,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)))
                    ]
                }, void 0, true, {
                    fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                    lineNumber: 436,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
                lineNumber: 434,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx",
        lineNumber: 189,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ChatContainer, "QTwt6Orr2+synf+WPJP5tKD5CIs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChat"],
        __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$scroll$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$advanced$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTimeBasedGreeting"],
        __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$hooks$2f$use$2d$advanced$2d$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useKeyboardShortcuts"]
    ];
});
_c2 = ChatContainer;
const __TURBOPACK__default__export__ = ChatContainer;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "QuickActions");
__turbopack_context__.k.register(_c1, "ServiceCard");
__turbopack_context__.k.register(_c2, "ChatContainer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/(chatbot)/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$components$2f28$web$292f$features$2f$chatbot$2f$chat$2d$container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/components/(web)/features/chatbot/chat-container.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$utils$2f$parent$2d$communication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/(chatbot)/lib/utils/parent-communication.ts [app-client] (ecmascript)");
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
                __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$utils$2f$parent$2d$communication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].initializeWhenReady();
                // Backup messages
                const timer1 = setTimeout({
                    "Home.useEffect.timer1": ()=>{
                        __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$utils$2f$parent$2d$communication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].initializeWhenReady();
                    }
                }["Home.useEffect.timer1"], 1000);
                const timer3 = setTimeout({
                    "Home.useEffect.timer3": ()=>{
                        __TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$lib$2f$utils$2f$parent$2d$communication$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].initializeWhenReady();
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
                            fileName: "[project]/(chatbot)/app/page.tsx",
                            lineNumber: 42,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/app/page.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-200 font-medium text-lg",
                        children: "Loading AI Solutions Platform..."
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/app/page.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/(chatbot)/app/page.tsx",
                lineNumber: 40,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/(chatbot)/app/page.tsx",
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
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f28$chatbot$292f$components$2f28$web$292f$features$2f$chatbot$2f$chat$2d$container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            mode: "full"
                        }, void 0, false, {
                            fileName: "[project]/(chatbot)/app/page.tsx",
                            lineNumber: 73,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/(chatbot)/app/page.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/(chatbot)/app/page.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/(chatbot)/app/page.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            ("TURBOPACK compile-time value", "development") === 'development' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-4 left-4 text-xs text-gray-400 bg-gray-800 bg-opacity-80 px-3 py-2 rounded-lg backdrop-blur-sm shadow-lg border border-gray-600",
                children: "Dev Mode • Next.js"
            }, void 0, false, {
                fileName: "[project]/(chatbot)/app/page.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/(chatbot)/app/page.tsx",
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

//# sourceMappingURL=%28chatbot%29_20980493._.js.map