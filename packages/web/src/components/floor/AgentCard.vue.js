const props = defineProps();
const __VLS_emit = defineEmits();
const statusBorderClass = computed(() => {
    switch (props.agent.status) {
        case 'active': return 'border-slate-700';
        case 'new': return 'border-blue-900';
        case 'idle': return 'border-slate-800';
        case 'error': return 'border-red-900';
        default: return 'border-slate-800';
    }
});
const statusBarClass = computed(() => {
    switch (props.agent.status) {
        case 'active': return 'bg-green-500';
        case 'new': return 'bg-blue-500';
        case 'idle': return 'bg-slate-700';
        case 'error': return 'bg-red-500';
        default: return 'bg-slate-700';
    }
});
const statusBadgeClass = computed(() => {
    switch (props.agent.status) {
        case 'active': return 'bg-green-500/10 text-green-400';
        case 'new': return 'bg-blue-500/10 text-blue-400';
        case 'error': return 'bg-red-500/10 text-red-400';
        default: return 'bg-slate-800 text-slate-500';
    }
});
const nameColorClass = computed(() => {
    const colors = {
        STRATEGIST: 'text-yellow-400',
        'HEY-SALES': 'text-orange-400',
        COMMUNITY: 'text-blue-400',
        YOUTUBE: 'text-red-400',
        REPURPOSE: 'text-purple-400',
        TWITTER: 'text-sky-400',
        LINKEDIN: 'text-blue-500',
        VISUALS: 'text-pink-400',
        'GRAM - BETA ADD': 'text-rose-400',
    };
    return colors[props.agent.name] ?? 'text-white';
});
const progressBarClass = computed(() => {
    switch (props.agent.status) {
        case 'active': return 'bg-green-500';
        case 'new': return 'bg-blue-500';
        case 'error': return 'bg-red-500';
        default: return 'bg-slate-600';
    }
});
function metricColorClass(color) {
    switch (color) {
        case 'yellow': return 'bg-yellow-500/10 text-yellow-400';
        case 'red': return 'bg-red-500/10 text-red-400';
        case 'blue': return 'bg-blue-500/10 text-blue-400';
        case 'green': return 'bg-green-500/10 text-green-400';
        case 'orange': return 'bg-orange-500/10 text-orange-400';
        case 'purple': return 'bg-purple-500/10 text-purple-400';
        default: return 'bg-slate-800 text-slate-400';
    }
}
import { computed } from 'vue';
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('select', __VLS_ctx.agent.id);
        } },
    ...{ class: "relative flex flex-col bg-[#0d1117] border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:border-opacity-60 select-none" },
    ...{ class: ([__VLS_ctx.statusBorderClass, __VLS_ctx.isSelected ? 'ring-1 ring-white/20' : '']) },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "h-0.5 w-full" },
    ...{ class: (__VLS_ctx.statusBarClass) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex items-start justify-between px-4 pt-3 pb-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex items-center gap-2 mb-0.5" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "text-xs font-bold tracking-widest" },
    ...{ class: (__VLS_ctx.nameColorClass) },
});
(__VLS_ctx.agent.name);
if (__VLS_ctx.agent.status !== 'idle') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" },
        ...{ class: (__VLS_ctx.statusBadgeClass) },
    });
    if (__VLS_ctx.agent.status === 'active') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
            ...{ class: "w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" },
        });
    }
    (__VLS_ctx.agent.status.toUpperCase());
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-[11px] text-slate-500 leading-tight" },
});
(__VLS_ctx.agent.subtitle);
if (__VLS_ctx.agent.thumbnail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "w-14 h-10 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden ml-3" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-slate-600 text-xs" },
    });
    (__VLS_ctx.agent.thumbnail);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "px-4 pb-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-[11px] text-slate-400 leading-relaxed line-clamp-3" },
});
(__VLS_ctx.agent.description);
if (__VLS_ctx.agent.metrics?.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex flex-wrap gap-1.5 px-4 pb-3" },
    });
    for (const [m] of __VLS_getVForSourceType((__VLS_ctx.agent.metrics))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (m.label),
            ...{ class: "text-[11px] font-semibold px-2 py-0.5 rounded" },
            ...{ class: (__VLS_ctx.metricColorClass(m.color)) },
        });
        (m.value);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "font-normal text-slate-500 ml-0.5" },
        });
        (m.label);
    }
}
if (__VLS_ctx.agent.tags?.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex flex-wrap gap-1 px-4 pb-3 mt-auto" },
    });
    for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.agent.tags))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (tag),
            ...{ class: "text-[10px] text-slate-600 border border-slate-800 rounded px-1.5 py-0.5" },
        });
        (tag);
    }
}
if (__VLS_ctx.agent.progress !== undefined) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "absolute right-0 top-0 bottom-0 w-1 bg-slate-900" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "absolute bottom-0 left-0 right-0 transition-all duration-700" },
        ...{ class: (__VLS_ctx.progressBarClass) },
        ...{ style: ({ height: __VLS_ctx.agent.progress + '%' }) },
    });
}
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#0d1117]']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-opacity-60']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
/** @type {__VLS_StyleScopedClasses['h-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-400']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['w-14']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-800']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['line-clamp-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-900']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-700']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            statusBorderClass: statusBorderClass,
            statusBarClass: statusBarClass,
            statusBadgeClass: statusBadgeClass,
            nameColorClass: nameColorClass,
            progressBarClass: progressBarClass,
            metricColorClass: metricColorClass,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=AgentCard.vue.js.map