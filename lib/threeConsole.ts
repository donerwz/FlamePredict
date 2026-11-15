import { setConsoleFunction } from "three";

/**
 * @react-three/fiber 9.8.x still constructs a THREE.Clock in its store, which
 * three r183+ flags as deprecated on every Canvas mount. That warning is not
 * actionable from app code, so it is dropped here; every other three.js
 * log/warn/error is forwarded unchanged. Remove once fiber switches to Timer.
 * Import this module (for its side effect) before any <Canvas> mounts.
 */
const SILENCED = ["THREE.Clock: This module has been deprecated"];

interface StackTraceLike {
  isStackTrace: true;
  getError: (message: string) => Error;
}

function isStackTrace(v: unknown): v is StackTraceLike {
  return typeof v === "object" && v !== null && "isStackTrace" in v;
}

setConsoleFunction((type, message, ...params) => {
  if (SILENCED.some((s) => message.startsWith(s))) return;
  const [first] = params;
  if (isStackTrace(first)) console[type](first.getError(message));
  else console[type](message, ...params);
});
