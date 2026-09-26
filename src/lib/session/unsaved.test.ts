import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasUnsavedShiftEdits, onUnsavedShiftEditsChange, setUnsavedShiftEdits } from './unsaved';

afterEach(() => setUnsavedShiftEdits(false));

describe('unsaved shift edits flag', () => {
	it('starts without unsaved edits', () => {
		expect(hasUnsavedShiftEdits()).toBe(false);
	});

	it('tracks changes from both directions', () => {
		setUnsavedShiftEdits(true);
		expect(hasUnsavedShiftEdits()).toBe(true);
		setUnsavedShiftEdits(false);
		expect(hasUnsavedShiftEdits()).toBe(false);
	});

	it('notifies listeners on every change and stops after unsubscribe', () => {
		const listener = vi.fn();
		const stop = onUnsavedShiftEditsChange(listener);

		setUnsavedShiftEdits(true);
		setUnsavedShiftEdits(false);
		expect(listener).toHaveBeenCalledTimes(2);

		stop();
		setUnsavedShiftEdits(true);
		expect(listener).toHaveBeenCalledTimes(2);
	});
});
