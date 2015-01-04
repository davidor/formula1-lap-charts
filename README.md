# Formula 1 Lap Charts

Interactive lap chart visualization of Formula 1 races.
The application is hosted [here](http://davidor.github.io/formula1-lap-charts/#/).

![screenshot](https://github.com/davidor/formula1-lap-charts/blob/master/screenshot.jpg?raw=true "screenshot")

This project is based on the lap chart designed by [Chris Pudney](http://www.vislives.com/2012/03/d3-lap-charts.html).
Chris used a custom JSON for a single race. I developed a backend service that is able to automatically generate the
JSON needed to draw the chart for any race starting from the 2011 season.

I have used [Angular JS](https://angularjs.org/) for the frontend, and [Express JS](http://expressjs.com/) and
[MongoDB](http://www.mongodb.org/) for the backend.
I retrieve the race results from the [Ergast web service](http://ergast.com/mrd/)
using this [Ergast client for NodeJS](https://github.com/davidor/ergast-client-nodejs).


## Deployment

### Database
I have included a tool that populates the DB automatically. This tool retrieves all the information needed
to draw the charts from the Ergast web service. The tool is under the `db_update` directory.

To use this tool:
* You need to have [Node.js](http://nodejs.org/) installed.
* Go to the `db_update` directory and execute `npm install`.
* Specify an IP, a port, and your mongodb credentials in /db_update/config/config.js
* Start the service with `npm start`.

First, save the list of races of the available seasons in the DB with PUT http://`ip`:`port`/seasons.
Next, save the race results with a PUT request to http://`ip`:`port`/raceresults.
You can also use PUT http://`ip`:`port`/raceresults/`{season}` or
http://`ip`:`port`/raceresults/`{season}`/`{round}` if you only need to update some races.

### Backend
* You need to have the race results stored in the database (see previous section).
* You need to have [Node.js](http://nodejs.org/) installed.
* Go to the `backend` directory and execute `npm install`.
* Specify an IP, a port, and your mongodb credentials in /backend/config/config.js
* Start the service with `npm start`.

### Frontend
You need to use an HTTP Server. For example, you can execute `python -m SimpleHTTPServer 9999` in the
`frontend` directory.
The webapp will be available in http://localhost:9999. You can choose a different port.

If you modified the address or the port of the backend service, you will need to change the BASE_URL constant in
/frontend/app/configuration.js


## Known Issues
There are at least a couple of races that are not visualized correctly:
- The 11th race of 2014.
- The 18th race of 2014.


## License
[Creative Commons. Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)](http://creativecommons.org/licenses/by-sa/3.0/)
