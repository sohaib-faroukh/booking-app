import * as express from 'express';
import { NextFunction, Request, Response, Router } from 'express';
import * as logger from 'morgan';
import { CalendarController } from './app/controllers/calendar.controller';
import { getEnvironment } from './app/environments/env.util';
import { cors } from './app/middlewares/cors.middleware';
import { requestResponder } from './app/middlewares/request-responder.middleware';

const env = process.argv?.includes( '--production' ) ? getEnvironment( 'prod' ) : getEnvironment();
const PORT = env.PORT || 3005;
const PREFIX = '/v1/api';

const apiRoutes: Router = Router();

// endpoints
apiRoutes.route( PREFIX + '/calendar' ).get( CalendarController.get );

const bootstrapTheApp = async () => {
	// Bootstrapping the application
	const expressApp = express();

	expressApp.use( express.json() );
	expressApp.use( express.urlencoded( { limit: '200mb', extended: true } ) );

	expressApp.use( cors );
	expressApp.use( logger( 'short' ) );
	expressApp.use( apiRoutes );

	expressApp.use( '/', requestResponder( ( req: Request, res: Response, next: NextFunction ) => {
		throw new Error( 'this route is not implemented' );
	} ) );
	expressApp.listen( PORT, async () => {
		console.log( `\n***** THE APP IS RUNNING ON PORT #${ PORT } *****\n` );
	} );
};
bootstrapTheApp();
