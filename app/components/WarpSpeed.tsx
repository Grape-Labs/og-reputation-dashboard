import React from "react";
import effects from "./LiveDrawEffects.module.css";

/** Decorative only; mounting ties the effect directly to the draw lifecycle. */
export default function WarpSpeed() {
    return <div className={effects.warp} aria-hidden="true">
        {Array.from({ length: 64 }, (_, i) => <span
            key={i}
            className={effects.warpRay}
            style={{
                "--angle": `${i * 137.508}deg`,
                "--travel": `${45 + i % 5 * 9}vmax`,
                animationDelay: `${-(i * .173 % 1.2)}s`,
                animationDuration: `${.75 + i % 7 * .09}s`,
                color: i % 3 === 0 ? "#7de4ca" : "#c4b5fd",
            } as React.CSSProperties}
        />)}
    </div>;
}
