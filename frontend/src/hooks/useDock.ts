import { useRef, useCallback } from "react";

export function useDock(maxScale = 1.6, spread = 80) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const items = containerRef.current?.querySelectorAll<HTMLElement>("[data-dock-item]");
        if (!items) return;

        items.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const dist = Math.abs(e.clientY - center);
            const scale = dist < spread
                ? 1 + (maxScale - 1) * Math.cos((dist / spread) * (Math.PI / 2))
                : 1;
            item.style.transform = `scale(${scale})`;
        });
    }, [maxScale, spread]);

    const handleMouseLeave = useCallback(() => {
        const items = containerRef.current?.querySelectorAll<HTMLElement>("[data-dock-item]");
        items?.forEach((item) => {
            item.style.transform = "scale(1)";
        });
    }, []);

    return { containerRef, handleMouseMove, handleMouseLeave };
}