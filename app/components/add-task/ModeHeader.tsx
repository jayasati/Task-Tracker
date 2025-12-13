import React from "react";
import { getModeConfig } from "@/lib/config/modeConfig";

interface ModeHeaderProps {
    category: string;
}

export default function ModeHeader({ category }: ModeHeaderProps) {
    const config = getModeConfig(category);

    return (
        <div className={`bg-gradient-to-r ${config.bgGradient} text-white px-6 py-4 -mx-6 -mt-6 mb-6 rounded-t-2xl`}>
            <div className="flex items-center gap-3">
                <span className="text-3xl" role="img" aria-label={config.title}>
                    {config.icon}
                </span>
                <div>
                    <h3 className="text-lg font-bold">{config.title}</h3>
                    <p className="text-sm text-white/90">{config.description}</p>
                </div>
            </div>
            {config.helperText && (
                <p className="mt-3 text-sm text-white/80 italic">
                    💡 {config.helperText}
                </p>
            )}
        </div>
    );
}
