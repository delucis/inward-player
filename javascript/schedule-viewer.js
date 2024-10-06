inlets=1;
outlets=1;

this.box.message("border", 0);
this.box.message("ignoreclick", 1);

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

// Global settings
var fontsize = 18;
var leading = fontsize * 1.5;
var sessionMinutes = 25;

function paint() {
	/** Load the global schedule dictionary. **/
	const schedule = new Dict("schedule").get("schedule");
	// TODO: remove hardcoded date
	const date = new Date(/*2024,9,12*/);

	mgraphics.move_to(0, fontsize);
	drawText(getLongDate(date), { bold: true });
	
	const todayKey = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('::');
	const hasToday = schedule.contains(todayKey);

	mgraphics.move_to(0, leading * 2.75);

	if (hasToday) {
		drawText('le programme d’aujourd’hui :');
		
		const slots = schedule.get(todayKey);
		const hours = slots.getkeys();
		for (var i = 0; i < hours.length; i++) {
			const hour = hours[i];
			const minutes = slots.get(hour);
			const isPastHour = parseInt(hour) < date.getHours();
			function hasMinutePassed(minute) {
				const startDate = new Date(date);
				startDate.setHours(hour);
				startDate.setMinutes(minute);
				const endDate = new Date(startDate);
				endDate.setMinutes(minute + sessionMinutes);
				return {
					isPast: endDate < date,
					isCurrent: startDate <= date && endDate >= date,
				};
			}
			
			mgraphics.move_to(0, leading * (i + 4));
			drawText(hour + 'h  ', { bold: true, dim: isPastHour });
			minutes.map(function (minute) {
				const { isPast, isCurrent } = hasMinutePassed(minute);
				drawText(leftPad(minute) + '  ', {
					dim: isPast,
					strikethrough: isPast,
					highlight: isCurrent,
				});
			});
		}
	} else {
		// No events scheduled for today.
		drawText('rien de programmé pour aujourd’hui');
	}
}

function refresh() {
	mgraphics.redraw();
}

function leftPad(str) {
	return String(str).length === 1 ? '0' + str : str;
}
leftPad.local = 1;

function drawText(str, opts) {
	opts = opts || {};
	const [x1, y1] = mgraphics.get_current_point();
	const [textW, textH] = mgraphics.text_measure(str.trim());
	
	if (opts.highlight) {
		// Draw a green highlight behind the text.
		const [ellPadX, ellPadY] = [fontsize * 0.25, fontsize * 0.5];
		const yShift = fontsize * 0.03;
		mgraphics.set_source_rgba(0, 0.98, 0.639, 1);
		mgraphics.ellipse(
			x1 - ellPadX,
			y1 - textH / 2 - ellPadY - yShift,
			textW + 2 * ellPadX,
			textH / 2 + 2 * ellPadY
		);
		mgraphics.fill();
		// Restore position.
		mgraphics.move_to(x1, y1);
	}
	
	// Draw the text.
	mgraphics.select_font_face('Ableton Sans ' + (opts.bold ? 'Bold' : 'Light'));
	mgraphics.set_font_size(opts.size || fontsize);
	mgraphics.set_source_rgba(0, 0, 0, opts.dim ? 0.4 : 1);
	mgraphics.show_text(str);
	const [x2, y2] = mgraphics.get_current_point();
	
	if (opts.strikethrough) {
		// Draw a diagonal line through the text.
		const boxPad = fontsize * 0.1;
		var [width, height] = mgraphics.text_measure(str.trim());
		mgraphics.move_to(x1 - boxPad, y1 + boxPad);
		mgraphics.line_to(
			x1 + width + boxPad,
			y1 - height / 2 - boxPad
		);
		mgraphics.stroke();
		// Restore position.
		mgraphics.move_to(x2, y2);
	}
}
drawText.local = 1;

/** Get a human-readable date, e.g. “Monday, 7 October 2024”. */
function getLongDate(date) {
	const weekday = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][date.getDay()].toLowerCase();
	const month = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'][date.getMonth()];
	return weekday + ', ' + date.getDate() + ' ' + month + ' ' + date.getFullYear();
}
getLongDate.local = 1;