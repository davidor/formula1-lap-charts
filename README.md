# Formula 1 Lap Charts

Interactive lap chart visualization of Formula 1 races.
The application is hosted [here](http://davidor.github.io/formula1-lap-charts/#/).

![screenshot](https://github.com/davidor/formula1-lap-charts/blob/master/screenshot.jpg?raw=true "screenshot")

This project is based on the lap chart designed by [Chris
Pudney](http://www.vislives.com/2012/03/d3-lap-charts.html). Chris used a custom JSON for a single
race. I developed an application that is able to automatically generate the JSON needed to draw the
chart for any race starting from the 2011 season.

This application uses [Angular JS](https://angularjs.org/) and gets the race results from the
[Ergast web service](http://ergast.com/mrd/) using this [Ergast client for
NodeJS](https://github.com/davidor/ergast-client-nodejs).


## Usage

### Download the races data

* You need to have [Node.js](http://nodejs.org/) installed.
* Go to the `races_updater` directory and run `npm install`.
* Run `node updater.js -h` and follow the instructions.

### Frontend

* You need to use an HTTP Server. For example, you can execute `python -m SimpleHTTPServer 8080` in the
`frontend` directory.
* The webapp will be available in `http://localhost:8080`. You can choose a different port.

If you are using a different host or port, change the `DATA_DIR` constant in
`/frontend/app/configuration.js`.


## License
[Creative Commons. Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)](http://creativecommons.org/licenses/by-sa/3.0/)
