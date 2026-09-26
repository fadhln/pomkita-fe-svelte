let dirty = false;
const tracked = new Set<() => void>();

/**
 * Marks shift entry state as changed so the context switchers can ask
 * for confirmation before the server applies a new active context.
 */
export function setUnsavedShiftEdits(value: boolean) {
	dirty = value;
	for (const notify of tracked) notify();
}

/** Runs the callback whenever the unsaved-edits flag changes. */
export function onUnsavedShiftEditsChange(callback: () => void) {
	tracked.add(callback);
	return () => tracked.delete(callback);
}

export function hasUnsavedShiftEdits() {
	return dirty;
}
