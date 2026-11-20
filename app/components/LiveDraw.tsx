"use client";
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, LinearProgress, Portal, TextField, Typography } from "@mui/material";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import moment from "moment";
import { shuffledFortunes } from "./drawFortunes";
import WarpSpeed from "./WarpSpeed";
import effects from "./LiveDrawEffects.module.css";
import ShuffleIcon from "@mui/icons-material/Shuffle";
export function ResetDrawDialog({ open, count, onClose, onConfirm }: {
    open: boolean;
    count: number;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return <Dialog open={open} onClose={onClose} aria-labelledby="reset-draw-title" sx={{ zIndex: 1500 }} PaperProps={{ sx: { background: "#11182c", color: "#f1f5f9", borderRadius: 4, border: "1px solid #37415e", p: 1 } }}>
    <DialogTitle id="reset-draw-title">Reset this randomizer?</DialogTitle>
    <DialogContent><DialogContentText sx={{ color: "#bac4da" }}>This will clear {count} recorded {count === 1 ? "selection" : "selections"} and stop randomization in progress. This cannot be undone.</DialogContentText></DialogContent>
    <DialogActions><Button autoFocus onClick={onClose} sx={{ color: "#dce5f6" }}>Keep selections</Button><Button color="error" variant="contained" onClick={onConfirm}>Reset randomizer</Button></DialogActions>
  </Dialog>;
}
type Props = {
    winners: {
        address: string;
        ts: string;
    }[];
    address: string;
    spinning: boolean;
    canDraw: boolean;
    goal: number;
    eligible: number;
    target: number;
    min: number;
    max: number;
    weighting: string;
    confirmingReset: boolean;
    onTarget: (value: string) => void;
    onDraw: () => void;
    onReset: () => void;
    onExit: () => void;
};
export default function LiveDraw(p: Props) {
    const [fortune, setFortune] = useState("");
    const fortunes = useRef<string[]>([]);
    const previousWinner = useRef("");
    const latestWinner = p.winners[p.winners.length - 1];
    const winnerKey = latestWinner ? `${latestWinner.address}-${latestWinner.ts}` : "";

    useEffect(() => {
        if (!winnerKey) {
            previousWinner.current = "";
            setFortune("");
            return;
        }
        if (previousWinner.current === winnerKey) return;
        previousWinner.current = winnerKey;
        if (!fortunes.current.length) {
            fortunes.current = shuffledFortunes();
            // Avoid repeating the last fortune at the boundary between cycles.
            if (fortunes.current[fortunes.current.length - 1] === fortune) {
                fortunes.current.unshift(fortunes.current.pop()!);
            }
        }
        setFortune(fortunes.current.pop()!);
    }, [winnerKey, fortune]);

    const complete = p.goal > 0 && p.winners.length >= p.goal;
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (p.confirmingReset || e.repeat || e.ctrlKey || e.metaKey || e.altKey)
                return;
            const target = e.target as HTMLElement;
            if (target.closest('input, textarea, select, button, [role="button"], [contenteditable="true"]'))
                return;
            if (e.key === "Escape") {
                e.preventDefault();
                p.onExit();
            }
            if (e.key.toLowerCase() === "r") {
                e.preventDefault();
                p.onReset();
            }
            if ((e.key === " " || e.key === "Enter") && p.canDraw) {
                e.preventDefault();
                p.onDraw();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [p]);
    return <Portal><Box className={effects.liveScreen} sx={{ position: "fixed", inset: 0, zIndex: 1400, isolation: "isolate", overflowY: "auto", color: "#edf2ff", background: "radial-gradient(ellipse at 50% 25%, #25204d 0%, #10162b 40%, #060b18 80%)", p: { xs: 2, md: 4 }, display: "flex", flexDirection: "column", gap: 3,
            "@keyframes drawOrbit": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
            "@keyframes drawRoll": { from: { opacity: .3, transform: "translateY(-10px)", filter: "blur(3px)" }, to: { opacity: 1, transform: "translateY(0)", filter: "blur(0)" } },
            "@keyframes drawReveal": { from: { opacity: 0, transform: "translateY(18px) scale(.96)" }, to: { opacity: 1, transform: "translateY(0) scale(1)" } },
            "@keyframes drawPulse": { "50%": { opacity: .4, transform: "scale(.85)" } },
            "@media (prefers-reduced-motion: reduce)": { "&, & * , & *::before": { animation: "none !important", transition: "none !important" } },
        }}>
    <Box className={effects.atmosphere} aria-hidden="true">
      <div className={effects.aurora} />
      <div className={effects.grid} />
      <div className={effects.spotlight} />
      {p.spinning && <WarpSpeed />}
      {Array.from({ length: 24 }, (_, i) => <span key={i} className={effects.star} style={{ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 23 + 7) % 100}%`, animationDelay: `${-(i % 7)}s`, animationDuration: `${4 + i % 5}s` }} />)}
    </Box>
    <Box sx={{ width: "100%", maxWidth: 1280, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box><Typography sx={{ color: "#b7a4ff", letterSpacing: 4, fontSize: 11, fontWeight: 800 }}>THE VINE • LIVE</Typography><Typography variant="h5" fontWeight={700}>Live Randomizer</Typography></Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><Typography sx={{ display: { xs: "none", md: "block" }, color: "#96a3bf", fontSize: 12 }}>Space / Enter to randomize · R to reset · Esc to exit</Typography><IconButton aria-label="Exit stream mode" onClick={p.onExit} sx={{ color: "#c9d4eb", border: "1px solid #39415a" }}><FullscreenExitIcon /></IconButton></Box>
    </Box>
    <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", flexShrink: 0, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, p: 2, border: "1px solid #46516d", borderRadius: 3, background: "#111a30" }}><Typography sx={{ color: "#93a1bc", fontSize: 12 }}>{p.eligible} eligible wallets · Weighted by {p.weighting}</Typography><Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}><TextField label="Selections" size="small" type="number" value={p.target} disabled={p.spinning} onChange={e => p.onTarget(e.target.value)} inputProps={{ min: p.min, max: p.max }} sx={{ width: 100, "& input": { color: "#edf2ff" }, "& label": { color: "#a5b4cf" }, "& fieldset": { borderColor: "#46516d" } }}/><Button className={effects.randomizeButton} variant="contained" onClick={p.onDraw} disabled={!p.canDraw} startIcon={<AutoAwesomeIcon />} sx={{ px: 3, py: 1.2, borderRadius: 3, textTransform: "none", fontWeight: 700, background: "linear-gradient(110deg, #9366e9, #6556d7)", "&.Mui-disabled": { background: "#252d44", color: "#8390ab" } }}>{p.spinning ? "Randomizing…" : complete ? "All selections complete" : p.eligible === 0 ? "No eligible wallets" : "Randomize next"}</Button><Button onClick={p.onReset} disabled={!p.winners.length && !p.spinning} sx={{ color: "#a9b4ca", textTransform: "none" }}>Reset</Button></Box></Box>
    <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", textAlign: "center", py: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, color: p.spinning ? "#c4b5fd" : "#7de4ca", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", mb: 3 }}><Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "currentColor", animation: p.spinning ? "drawPulse .7s infinite" : "none" }}/>{p.spinning ? "Selecting a wallet" : complete ? "Selections complete" : p.address ? "Selection confirmed" : "The next moment is yours"}</Box>
      <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 6, p: "2px", boxShadow: p.spinning ? "0 0 90px #8b5cf640" : "0 20px 90px #0005", background: "linear-gradient(120deg, #9780e8, #33455c, #64cbb5)", "&::before": p.spinning ? { content: '""', position: "absolute", inset: "-150%", background: "conic-gradient(transparent 55%, #c4b5fd, #64ffda, transparent 85%)", animation: "drawOrbit 1.6s linear infinite" } : {} }}>
        <Box sx={{ position: "relative", background: "linear-gradient(135deg, #171d35, #10182b)", borderRadius: "22px", px: { xs: 2, md: 5 }, py: { xs: 4, md: 6 } }}>
          {!p.spinning && winnerKey && <div key={`light-${winnerKey}`} className={effects.reveal} aria-hidden="true">
            <span className={effects.ripple} />
            <span className={effects.ripple} style={{ animationDelay: ".2s" }} />
          </div>}
          <Box key={p.spinning ? "drawing-medal" : winnerKey || "ready-medal"} className={effects.medallion} aria-hidden="true">
            {!p.spinning && winnerKey ? <ShuffleIcon sx={{ fontSize: 30, color: complete ? "#f5d991" : "#e4d9ff" }} /> : <AutoAwesomeIcon sx={{ fontSize: 28, animation: p.spinning ? "drawPulse .7s infinite" : "none" }} />}
          </Box>
          <Typography sx={{ color: "#a4aec8", fontSize: 11, letterSpacing: 3, mb: 2 }}>{p.spinning ? "RANDOMIZING" : p.address ? `SELECTION ${String(p.winners.length).padStart(2, "0")}` : "COMMUNITY. POSSIBILITY. YOUR MOMENT."}</Typography>
          <Typography key={`${p.spinning ? "spin" : "reveal"}-${p.address || "ready"}`} aria-live={p.spinning ? "off" : "polite"} sx={{ fontFamily: p.address ? "monospace" : "inherit", fontSize: { xs: p.address ? 18 : 28, md: p.address ? 30 : 44 }, fontWeight: 600, overflowWrap: "anywhere", animation: p.spinning ? "drawRoll .12s ease-out both" : "drawReveal .65s cubic-bezier(.16,1,.3,1) both", textShadow: p.spinning ? "0 0 24px #c4b5fd88" : "none" }}>{p.address || "Who will be next?"}</Typography>
          <Box key={p.spinning ? "drawing-fortune" : winnerKey || "ready-fortune"} className={!p.spinning && fortune ? effects.fortune : undefined} sx={{ position: "relative", mt: 2, minHeight: 58 }}>
            {!p.spinning && fortune && <Typography sx={{ color: "#d9c18c", fontSize: 9, letterSpacing: 3, mb: .75, textTransform: "uppercase" }}>A little Grape fortune</Typography>}
            <Typography aria-live="polite" sx={{ color: !p.spinning && fortune ? "#d7d3e4" : "#a5b2ce", fontSize: { xs: 13, md: 15 }, lineHeight: 1.7, textWrap: "balance" }}>{p.spinning ? "A little suspense. A new possibility." : fortune || "One selection. One moment in the spotlight."}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
    <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", border: "1px solid #ffffff12", background: "#10182bcc", borderRadius: 4, overflow: "hidden" }}>
      <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}><Typography fontWeight={700}>The Vine List <Box component="span" sx={{ ml: 1, color: "#95a4c2", fontWeight: 400, fontSize: 13 }}>{p.winners.length} / {p.goal}</Box></Typography><Typography sx={{ color: "#8e9bb6", fontSize: 12 }}>{p.winners[0] ? moment(p.winners[0].ts).format("LL") : "Your selections appear here"}</Typography></Box>
      <LinearProgress variant="determinate" value={p.goal ? Math.min(100, p.winners.length / p.goal * 100) : 0} sx={{ height: 2, bgcolor: "#ffffff08", "& .MuiLinearProgress-bar": { bgcolor: "#a78bfa" } }}/>
      <Box sx={{ maxHeight: "32dvh", overflowY: "auto", p: 1 }}>
        {!p.winners.length && <Typography sx={{ textAlign: "center", p: 4, color: "#8492af", fontSize: 14 }}>The stage is set. Start the randomizer.</Typography>}
        {p.winners.map((w, i) => <Box key={`${w.address}-${w.ts}`} sx={{ display: "flex", gap: 2, alignItems: "center", px: { xs: 1, md: 2 }, py: 1.5, borderRadius: 2, background: i === p.winners.length - 1 ? "linear-gradient(90deg, #a78bfa18, #64cbb508)" : "transparent", animation: "drawReveal .5s ease both" }}><Typography sx={{ color: "#bba4ff", fontFamily: "monospace", fontSize: 13 }}>{String(i + 1).padStart(2, "0")}</Typography><Typography sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere", fontFamily: "monospace", fontSize: { xs: 12, md: 16 } }}>{w.address}</Typography><Typography sx={{ color: "#8492af", fontSize: 12, flexShrink: 0 }}>{moment(w.ts).format("HH:mm:ss")}</Typography></Box>)}
      </Box>
    </Box>

  </Box></Portal>;
}
