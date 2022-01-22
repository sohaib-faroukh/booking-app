## Meeting Booking

### prerequisites
1. node.js > v13 installed on your OS
2. vs code or any suitable editor 

### install the dependencies
change to the root directory of the project, then please run `npm install`

### Run the app - dev environment


### Run the app - prod environment
1. build the app using the command `npm run build`
2. run the command `npm run start:prod`

### How to use
the application provide a REST api endpoint as a GET method, you can use it as the following template 

- method: GET 
- url: `http://<host>:<port>/v1/api/calendar?input=<your_formartted_input>` 
- query string params
		- input: string includes your input
- output: json object include a string of the exected output as the following:
	```
		{

		"code":  200,

		"message":  "success",

		"data":  "2011-03-21\n09:00 11:00 EMP002\n2011-03-22\n14:00 16:00 EMP003\n16:00 17:00 EMP004"

		}
		```

### Test
- please run `npm run test` to run all the prepared test cases
- all the test cases are located into the file `src/test/calendar.test.ts`
- all the test results will show in the console that you used to run the test command  
