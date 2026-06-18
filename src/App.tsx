import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import XRScene from "./xr/XRScene";
import KeyboardMovement from "./xr/KeyboardMovement";
import { tlog } from "./lib/log";

type SimMode =
  | "menu"
  | "aed"
  | "rjp"
  | "pad-test"
  | "aed-button-test"
  | "marker-test";

const xrStore = createXRStore({ domOverlay: true });

function enterAR() {
  xrStore.enterAR();
}

export default function App() {
  const [mode, setMode] = useState<SimMode>("menu");
  const overlayRef = useRef<HTMLDivElement>(null);
  const markerBitmapRef = useRef<ImageBitmap | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/asset/marker.jpeg")
      .then((r) => r.blob())
      .then((b) => createImageBitmap(b))
      .then((bitmap) => {
        if (cancelled) return;
        markerBitmapRef.current = bitmap;
        tlog("[App] marker bitmap ready");
      })
      .catch((e) => tlog(`[App] marker load failed: ${e}`));
    return () => {
      cancelled = true;
    };
  }, []);

  function enterARPadTest() {
    setMode("pad-test");
    xrStore.enterAR();
  }

  function enterARMarkerTest() {
    const bitmap = markerBitmapRef.current;
    if (!bitmap) {
      tlog("[App] marker bitmap not ready");
      return;
    }

    // @pmndrs/xr ignores trackedImages in customSessionInit — patch at navigator level
    const orig = navigator.xr!.requestSession.bind(navigator.xr);
    (navigator.xr as any).requestSession = (
      mode: XRSessionMode,
      options: any,
    ) => {
      navigator.xr!.requestSession = orig;
      const patched = {
        ...options,
        optionalFeatures: [
          ...(options?.optionalFeatures ?? []),
          "image-tracking",
        ],
        trackedImages: [{ image: bitmap, widthInMeters: 0.15 }],
      };
      tlog(
        `[App] requestSession patched optionalFeatures=${JSON.stringify(patched.optionalFeatures)}`,
      );
      return orig(mode, patched);
    };

    setMode("marker-test");
    xrStore.enterAR();
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas>
        <KeyboardMovement />
        <XR store={xrStore}>
          <XRScene mode={mode} />
        </XR>
      </Canvas>

      <div id="xr-overlay" ref={overlayRef} style={overlayStyle}>
        {mode === "menu" && (
          <>
            <h1 style={{ marginBottom: 16, fontSize: 20 }}>
              AR Simulasi AED &amp; RJP
            </h1>
            <button
              type="button"
              style={btnStyle}
              onClick={() => setMode("aed")}
            >
              Mulai Simulasi AED
            </button>
            <button
              type="button"
              style={btnStyle}
              onClick={() => setMode("rjp")}
            >
              Mulai Simulasi RJP
            </button>

            {/* Button untuk Play AED Simulation */}
            <button
              type="button"
              style={btnStylePrimary}
              onClick={() => setMode("pad-test")}
            >
              Play AED Simulation
            </button>
            <button
              type="button"
              style={btnStyle}
              onClick={() => setMode("aed-button-test")}
            >
              Test AED Buttons
            </button>
            <button type="button" style={btnStyle} onClick={enterAR}>
              Masuk AR
            </button>
            <button
              type="button"
              style={{ ...btnStyle, background: "#2a9d8f" }}
              onClick={enterARPadTest}
            >
              AR + Grab Pad Test
            </button>
            <button
              type="button"
              style={{ ...btnStyle, background: "#457b9d" }}
              onClick={enterARMarkerTest}
            >
              AR Marker Test
            </button>
          </>
        )}
        {mode !== "menu" && (
          <>
            <button type="button" style={btnStyle} onClick={enterAR}>
              Masuk AR
            </button>
            <button
              type="button"
              style={{ ...btnStyle, background: "#555" }}
              onClick={() => setMode("menu")}
            >
              ← Kembali
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 32,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  zIndex: 10,
};

const btnStyle: React.CSSProperties = {
  padding: "12px 28px",
  fontSize: 16,
  borderRadius: 8,
  border: "none",
  background: "#e63946",
  color: "#fff",
  cursor: "pointer",
  minWidth: 220,
};

const btnStylePrimary: React.CSSProperties = {
  padding: "12px 28px",
  fontSize: 32,
  borderRadius: 8,
  border: "none",
  background: "#003cff",
  color: "#fff",
  cursor: "pointer",
  minWidth: 220,
};
