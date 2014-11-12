# Formula 1 Lap Charts

Interactive lap chart visualization of Formula 1 races. Demo [here](http://davidor.github.io/formula1-lap-charts/#/).

![screenshot](https://github.com/davidor/formula1-lap-charts/blob/master/screenshot.jpg?raw=true "screenshot")

This project is based on the lap chart designed by [Chris Pudney](http://www.vislives.com/2012/03/d3-lap-charts.html).
Chris used a custom JSON for a single race. I developed a backend service that is able to automatically generate the
JSON needed to draw the chart for any race starting from the 2011 season.

I have used [Express JS](http://expressjs.com/) for the backend and [Angular JS](https://angularjs.org/)
for the frontend.
I retrieve the race results from the [Ergast web service](http://ergast.com/mrd/)
using [this client for NodeJS](https://github.com/davidor/ergast-client-nodejs).

The Ergast web service only contains lap information for races starting from the 2011 season. This is why I can only generate charts starting from the 2011 season. Also, Chris' visualization includes some information like the laps where the safety car was deployed that I cannot show because I cannot get it is not available in the Ergast service.

## Deploying

### Backend
* You need to have [Node.js](http://nodejs.org/) installed.
* Go to the backend directory and execute `npm install`.
* Start the service with `npm start`.

By default, the service listens in http://localhost:8080. You can select a different address or port by editing
the configuration file (/backend/lib/config.js).

### Frontend
You need to use an HTTP Server. For example, you can execute `python -m SimpleHTTPServer 9999` in the frontend directory.
The webapp will be available in http://localhost:9999. You can choose a different port.

If you modified the address or the port of the backend service, you will need to change the BASE_URL constant in the
file /frontend/app/configuration.js

## License
[Creative Commons. Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)](http://creativecommons.org/licenses/by-sa/3.0/)
