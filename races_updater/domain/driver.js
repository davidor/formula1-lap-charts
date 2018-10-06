function Driver(name, placing, pitstops, mechanical, accident) {
    this.name = name;
    this.placing = placing;
    this.pitstops = pitstops;
    this.mechanical = mechanical;
    this.accident = accident;
}

module.exports = Driver;