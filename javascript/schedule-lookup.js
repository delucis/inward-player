inlets = 1;
outlets = 1;
setinletassist(0, '“should_trigger” message checks if playback should be started at the current time');
setoutletassist(0, '1 if playback should be triggered, otherwise 0');

/**
 * Check if playback should start at the current time.
 */
function should_trigger() {
	/** Load the global schedule dictionary. **/
	const store = new Dict("schedule");

	// Use arguments for testing a datetime other than the current one:
	// e.g. a message of "should_trigger 2024 10 7 10 0" would check for October 7, 2024 at 10:00
	const [y, M, d, H, m] = arrayfromargs(arguments);
	const date = y ? new Date(y, M - 1, d, H, m) : new Date();

	// Build a dictionary key from the current time.
	// e.g. "schedule::2024::10::7::10: for the example date above.
	const path = ['schedule', date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours()];
	const key = path.join('::');
	
	// Check if the schedule dictionary contains events for the current time.
	const hasKey = store.contains(key);
	if (!hasKey) {
		// If there are no events, we should not trigger.
		return outlet(0, false);
	}
	
	// Get the list of minutes for the current hour and output whether or not a trigger is scheduled.
	const minutes = store.get(key);
	const isScheduled = minutes.indexOf(date.getMinutes()) > -1;
	return outlet(0, isScheduled);
}