import { getModeConfig } from "@/lib/config/modeConfig";

export const baseInputClass = "w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:border-gray-400";

export const labelClass = "block text-sm font-semibold text-gray-700 mb-2 ml-1";

export function getInputClass(category: string): string {
    const config = getModeConfig(category);
    return `${baseInputClass} ${config.focusRing}`;
}

export function getButtonClass(category: string): string {
    const config = getModeConfig(category);
    return `${config.buttonBg} text-white px-8 py-3 rounded-xl font-semibold ${config.buttonHover} hover:shadow-md active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap`;
}

export const inputClass = baseInputClass + " focus:ring-blue-500 focus:border-blue-500";
