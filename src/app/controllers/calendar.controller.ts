import { NextFunction, Request, RequestHandler, Response } from 'express';
import { query } from 'express-validator';
import * as moment from 'moment';
import { requestResponder } from '../middlewares/request-responder.middleware';
import { requestValidator } from '../middlewares/request-validator.middleware';
import { IBookingByDay, IBookingRequestExtended } from '../models/booking';
import { uuid } from '../utils/uuid.util';


export class CalendarController {

	private static readonly FORMAT = 'YYYY-MM-DD HH:mm';
	private static readonly DAY_FORMAT = 'YYYY-MM-DD';
	private static readonly TIME_FORMAT = 'HH:mm';
	private static readonly INPUT_TIME_FORMAT = 'HHmm';


	/**
	 * entry to the express endpoint
	 */
	public static readonly get: RequestHandler[] = [
		query( 'input' ).exists().isString(),
		requestValidator,
		requestResponder( async ( req: Request, res: Response, next: NextFunction ) => {
			const input = ( req?.query as { input: string } ).input;
			return this.handle( input );
		} ),

	];


	/**
	 * decompose the string content to structured typed objects of type `IBookingRequest`
	 * @param input string input to be processed
	 * @returns booking requests objects
	 */
	private static decompose = ( input: string ): IBookingRequestExtended[] => {
		const lines = input.split( '\n' );
		const result: IBookingRequestExtended[] = [];

		// TODO: check the `input` format, should include suitable count of lines, should

		// skip the first line, which represents the office working hours, so that i=1 not 0
		for ( let i = 1; i < ( lines.length - 1 ); i += 2 ) {
			const line1 = lines[ i ].trim().split( ' ' );
			const line2 = lines[ i + 1 ].trim().split( ' ' );

			if ( !line2[ 2 ] || isNaN( Number( line2[ 2 ] ) ) || Number( line2[ 2 ] ) <= 0 ) throw new Error( 'invalid format of duration' );
			const duration = Number( line2[ 2 ] );
			const employeeId = line1[ 2 ];

			const startTime = line2[ 0 ] + ' ' + line2[ 1 ];
			const submissionTime = line1[ 0 ] + ' ' + line1[ 1 ];
			const startTimeMoment = moment( startTime, this.FORMAT );
			const endTimeMoment = startTimeMoment.clone().add( duration, 'hours' );
			const submissionTimeMoment = moment( submissionTime, this.FORMAT );

			const extendedBookingRequest: IBookingRequestExtended = {
				id: uuid(),
				index: ( i - 1 ) / 2,
				duration,
				employeeId,
				startTime,
				startTimeMoment,
				endTimeMoment,
				submissionTime,
				submissionTimeMoment,
			} as IBookingRequestExtended;

			result.push( extendedBookingRequest );
		}

		return result;
	}

	private static isOutsideOfficeHours = ( officeHours: string[], value: IBookingRequestExtended ): boolean => {
		if ( officeHours.length !== 2 ) throw new Error( 'invalid office hours format' );
		const numericOfficeHours = officeHours.map( v => Number( v ) );


		const startTimeValue = Number( value.startTimeMoment.format( 'HHmm' ) );
		const endTimeValue = Number( value.endTimeMoment.format( 'HHmm' ) );

		if (
			startTimeValue < numericOfficeHours[ 0 ]
			|| startTimeValue > numericOfficeHours[ 1 ]
			|| endTimeValue < numericOfficeHours[ 0 ]
			|| endTimeValue > numericOfficeHours[ 1 ]
		) {
			return true;
		}
		return false;
	}

	private static sortBySubmissionTime = ( input: IBookingRequestExtended[] ): IBookingRequestExtended[] => {
		return input.sort( ( a, b ) => {
			if ( a.submissionTimeMoment.isAfter( b.submissionTimeMoment ) ) return 1;
			else return -1;
		} );
	}

	private static isOverlap = ( a: IBookingRequestExtended, b: IBookingRequestExtended ): boolean => {
		if (
			/* a start before and ends after b start  */
			(
				a.startTimeMoment.isSameOrBefore( b.startTimeMoment )
				&& b.startTimeMoment.isBefore( a.endTimeMoment )
			)
			||
			/* a starts after b starts but before b ends  */
			(
				b.startTimeMoment.isSameOrBefore( a.startTimeMoment )
				&& a.startTimeMoment.isBefore( b.endTimeMoment )
			)
		) {
			return true;
		}
		return false;
	}

	private static removeOverlaps = ( input: IBookingRequestExtended[] ): IBookingRequestExtended[] => {
		// sort asc by submission time
		const res = input.sort( ( a, b ) => a.submissionTimeMoment.isAfter( b.submissionTimeMoment ) ? 1 : -1 );
		const itemsToRemove = new Set<string>();

		for ( let i = 1; i < res.length; i++ ) {
			if ( itemsToRemove.has( res[ i ].id ) ) continue;

			for ( let j = 0; j < res.length; j++ ) {
				if (
					i !== j
					&& !itemsToRemove.has( res[ j ].id )
					&& this.isOverlap( res[ i ], res[ j ] )
				) {
					if ( res[ j ].submissionTimeMoment.isAfter( res[ i ].submissionTimeMoment ) ) itemsToRemove.add( res[ j ].id );
					else itemsToRemove.add( res[ i ].id );
				}
			}
		}

		return res.filter( item => !itemsToRemove.has( item.id ) );
	}

	private static groupByDay = ( input: IBookingRequestExtended[] ): IBookingByDay => {
		return input.reduce( ( res: IBookingByDay, next: IBookingRequestExtended ) => {
			if ( !res ) res = {} as IBookingByDay;
			const day = next.startTimeMoment.format( this.DAY_FORMAT );

			res[ day ] ??= [];
			res[ day ].push( next );

			return res;
		}, {} );
	}

	private static formatOutput = ( input: IBookingByDay ): string => {
		const sortedKeys: string[] = Object.keys( input ).sort( ( a, b ) => a > b ? 1 : -1 );
		let res = '';
		for ( const key of sortedKeys ) {
			if ( input[ key ] ) {
				res += key + '\n';
				for ( const request of input[ key ] ) {
					const { startTimeMoment, endTimeMoment, employeeId } = request;
					res += `${ startTimeMoment.format( this.TIME_FORMAT ) } ${ endTimeMoment.format( this.TIME_FORMAT ) } ${ employeeId }\n`;
				}
			}
		}
		return ( res ?? '' ).trim();
	}

	private static getOfficeHours = ( input: string ): string[] => {
		const result = input.split( '\n' )[ 0 ].trim().split( ' ' );
		if (
			result.length !== 2
			|| !result[ 0 ]
			|| !result[ 1 ]
			|| !Number( result[ 0 ] )
			|| !Number( result[ 1 ] )
			|| !moment( result[ 0 ], this.INPUT_TIME_FORMAT ).isValid()
			|| !moment( result[ 1 ], this.INPUT_TIME_FORMAT ).isValid()
		) {
			throw new Error( 'invalid format of office hours' );
		}

		if ( Number( result[ 1 ] ) < Number( result[ 0 ] ) ) {
			throw new Error( 'end time smaller than start time' );
		}
		return result;
	}

	private static removeIfOutsideOfficeHours = ( input: IBookingRequestExtended[], officeHours: string[] ): IBookingRequestExtended[] => {
		// exclude if the start/end times outside office hours
		return input.filter( r => !this.isOutsideOfficeHours( officeHours, r ) );
	}

	public static handle = ( input: string ): any => {
		input = ( input ?? '' ).trim();
		const officeHours: string[] = this.getOfficeHours( input );

		let requests: IBookingRequestExtended[] = [];

		requests = this.decompose( input );
		requests = this.removeIfOutsideOfficeHours( requests, officeHours );
		requests = this.sortBySubmissionTime( requests );
		requests = this.removeOverlaps( requests );


		const groupedByDay: IBookingByDay = this.groupByDay( requests );
		const result: string = this.formatOutput( groupedByDay );

		console.log( result );
		return result;
	}


}
