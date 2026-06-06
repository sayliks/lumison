import React from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../../contexts/I18nContext";

interface AboutDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4 select-none pointer-events-none"
        >
            <style>{`
        @keyframes modal-in {
            0% { opacity: 0; transform: scale(0.96) translateY(-8px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modal-out {
            0% { opacity: 1; transform: scale(1) translateY(0); }
            100% { opacity: 0; transform: scale(0.98) translateY(4px); }
        }
        .dialog-in { animation: modal-in 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; will-change: transform, opacity; }
      `}</style>

            {/* Shared backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto cursor-pointer"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="dialog-in relative w-full max-w-[380px] bg-black/40 backdrop-blur-2xl saturate-150 rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.45)] overflow-hidden ring-1 ring-white/5 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Gradient Blob */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none blur-3xl" />

                {/* Content */}
                <div className="relative p-8 flex flex-col items-center text-center z-10">
                    {/* Title */}
                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 tracking-tight mb-6">
                        Lumison
                    </h3>

                    {/* Description */}
                    <p className="text-white/70 text-[15px] leading-relaxed mb-8 font-medium">
                        {t("about.description")}
                        <br />
                        {t("about.inspiredBy")}
                    </p>
                </div>

                {/* Footer / Close */}
                <div className="border-t border-white/10 bg-white/[0.02] p-2">
                    <button
                        onClick={onClose}
                        className="group w-full py-3.5 rounded-2xl text-[16px] font-semibold text-white/70 hover:text-white/90 hover:bg-white/[0.06] active:bg-white/[0.10] active:scale-[0.98] transition-all duration-200"
                    >
                        {t("common.done")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AboutDialog;
