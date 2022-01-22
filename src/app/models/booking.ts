import { Moment } from 'moment';

export type MyDateTimeType = Moment;

export interface IBookingRequest {
	id: string;
	index: number;
	submissionTime: string;
	employeeId: string;
	startTime: string;
	duration: number;
}

export interface IBookingRequestExtended extends IBookingRequest {
	submissionTimeMoment: MyDateTimeType;
	startTimeMoment: MyDateTimeType;
	endTimeMoment: MyDateTimeType;
	overlaps: string[];

}

export interface IBookingByDay {
	[ key: string ]: IBookingRequestExtended[];
}
