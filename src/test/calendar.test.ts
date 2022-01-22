import { CalendarController } from '../app/controllers/calendar.controller';


test( 'TC #01 - pass case sample 1', () => {
	const input =
		'0900 1730\n'
		+ '\t2011-03-17 10:17:06 EMP001\n\t2011-03-21 09:00 2\n'
		+ '\t2011-03-16 12:34:56 EMP002\n\t2011-03-21 09:00 2\n'
		+ '\t2011-03-16 09:28:23 EMP003\n\t2011-03-22 14:00 2\n'
		+ '\t2011-03-17 10:17:06 EMP004\n\t2011-03-22 16:00 1\n'
		+ '\t2011-03-15 17:29:12 EMP005\n\t2011-03-21 16:00 3';

	const expectedOutput =
		'2011-03-21\n'
		+ '09:00 11:00 EMP002\n'
		+ '2011-03-22\n'
		+ '14:00 16:00 EMP003\n'
		+ '16:00 17:00 EMP004';


	expect( CalendarController.handle( input ) ).toEqual( expectedOutput );
} );
test( 'TC #02 - pass case sample 2', () => {
	const input =
		'0830 1930\n'
		+ '2020-08-10 11:11 EMP001\n2020-08-11 15:30 3\n'
		+ '2020-08-10 11:15 EMP002\n2020-08-11 18:30 1\n'
		+ '2020-08-15 11:00 EMP003\n2020-08-16 15:30 2\n'
		+ '2020-08-15 11:15 EMP004\n2020-08-16 17:00 2\n'
		+ '2020-08-15 11:30 EMP005\n2020-08-16 09:11 2';

	const expectedOutput =
		'2020-08-11\n'
		+ '15:30 18:30 EMP001\n'
		+ '18:30 19:30 EMP002\n'
		+ '2020-08-16\n'
		+ '15:30 17:30 EMP003\n'
		+ '09:11 11:11 EMP005';

	expect( CalendarController.handle( input ) ).toEqual( expectedOutput );
} );
test( 'TC #03 - pass case sample 3', () => {
	const input =
		'0900 1700\n'
		+ '2020-08-15 11:00 EMP003\n2020-08-16 13:00 2\n'
		+ '2020-08-15 11:15 EMP004\n2020-08-16 15:00 2\n'
		+ '2020-08-10 11:00 EMP002\n2020-08-11 11:30 1\n'
		+ '2020-08-10 11:11 EMP001\n2020-08-11 09:30 3\n'
		+ '2020-08-15 11:30 EMP005\n2020-08-16 15:45 1';

	const expectedOutput =
		'2020-08-11\n'
		+ '11:30 12:30 EMP002\n'
		+ '2020-08-16\n'
		+ '13:00 15:00 EMP003\n'
		+ '15:00 17:00 EMP004';

	expect( CalendarController.handle( input ) ).toEqual( expectedOutput );
} );





test( 'TC #10 - invalid office hours - no end time', () => {
	const input =
		'0900\n'
		+ '\t2011-03-17 10:17:06 EMP001\n\t2011-03-21 09:00 2\n'
		+ '\t2011-03-16 12:34:56 EMP002\n\t2011-03-21 09:00 2\n'
		+ '\t2011-03-16 09:28:23 EMP003\n\t2011-03-22 14:00 2\n'
		+ '\t2011-03-17 10:17:06 EMP004\n\t2011-03-22 16:00 1\n'
		+ '\t2011-03-15 17:29:12 EMP005\n\t2011-03-21 16:00 3';

	expect( () => CalendarController.handle( input ) ).toThrow( new Error( 'invalid format of office hours' ) );
} );

test( 'TC #11 - invalid office hours - end time before start time', () => {
	const input =
		'1800 0900\n'
		+ '\t2011-03-17 10:17:06 EMP001\n\t2011-03-21 09:00 2\n'
		+ '\t2011-03-16 12:34:56 EMP002\n\t2011-03-21 09:00 2\n'
		+ '\t2011-03-16 09:28:23 EMP003\n\t2011-03-22 14:00 2\n'
		+ '\t2011-03-17 10:17:06 EMP004\n\t2011-03-22 16:00 1\n'
		+ '\t2011-03-15 17:29:12 EMP005\n\t2011-03-21 16:00 3';

	expect( () => CalendarController.handle( input ) ).toThrow( new Error( 'end time smaller than start time' ) );
} );





test( 'TC #20 - invalid format of duration - NAN', () => {
	const input =
		'0900 1730\n'
		+ '\t2011-03-17 10:17:06 EMP001\n\t2011-03-21 09:00 2i\n'
		+ '\t2011-03-16 12:34:56 EMP002\n\t2011-03-21 09:00 2\n'
		+ '\t2011-03-16 09:28:23 EMP003\n\t2011-03-22 14:00 2\n'
		+ '\t2011-03-17 10:17:06 EMP004\n\t2011-03-22 16:00 1\n'
		+ '\t2011-03-15 17:29:12 EMP005\n\t2011-03-21 16:00 3';

	expect( () => CalendarController.handle( input ) ).toThrow( new Error( 'invalid format of duration' ) );
} );


test( 'TC #21 - invalid format of duration - not exist', () => {
	const input =
		'0900 1730\n'
		+ '\t2011-03-17 10:17:06 EMP001\n\t2011-03-21 09:00\n'
		+ '\t2011-03-16 12:34:56 EMP002\n\t2011-03-21 09:00 2\n'
		+ '\t2011-03-16 09:28:23 EMP003\n\t2011-03-22 14:00 2\n'
		+ '\t2011-03-17 10:17:06 EMP004\n\t2011-03-22 16:00 1\n'
		+ '\t2011-03-15 17:29:12 EMP005\n\t2011-03-21 16:00 3';

	expect( () => CalendarController.handle( input ) ).toThrow( new Error( 'invalid format of duration' ) );
} );


test( 'TC #22 - invalid format of duration - equal zero', () => {
	const input =
		'0900 1730\n'
		+ '\t2011-03-17 10:17:06 EMP001\n\t2011-03-21 09:00 1\n'
		+ '\t2011-03-16 12:34:56 EMP002\n\t2011-03-21 09:00 0\n'
		+ '\t2011-03-16 09:28:23 EMP003\n\t2011-03-22 14:00 2\n'
		+ '\t2011-03-17 10:17:06 EMP004\n\t2011-03-22 16:00 1\n'
		+ '\t2011-03-15 17:29:12 EMP005\n\t2011-03-21 16:00 3';

	expect( () => CalendarController.handle( input ) ).toThrow( new Error( 'invalid format of duration' ) );
} );



test( 'TC #23 - invalid format of duration - less than zero', () => {
	const input =
		'0900 1730\n'
		+ '\t2011-03-17 10:17:06 EMP001\n\t2011-03-21 09:00 1\n'
		+ '\t2011-03-16 12:34:56 EMP002\n\t2011-03-21 09:00 1\n'
		+ '\t2011-03-16 09:28:23 EMP003\n\t2011-03-22 14:00 -2\n'
		+ '\t2011-03-17 10:17:06 EMP004\n\t2011-03-22 16:00 1\n'
		+ '\t2011-03-15 17:29:12 EMP005\n\t2011-03-21 16:00 3';

	expect( () => CalendarController.handle( input ) ).toThrow( new Error( 'invalid format of duration' ) );
} );
