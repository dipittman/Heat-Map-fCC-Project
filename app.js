let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
let req = new XMLHttpRequest();
let w = 1200;
let h = 600;
let p = 60;
let svg = d3.select("#chart");
let legend = d3.select("#legend");
let yScale;
let xScale;
let values = [];
let baseTemp;
let temps;
let minTemp;
let maxTemp;
let xAxis;
let yAxis;
var colors = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];


let drawCanvas = () => {
    svg.attr("width", w)
       .attr("height", h)
    
}

let generateScales = () => {
    xScale = d3.scaleLinear()
               .domain([d3.min(values, (d) => d.year), d3.max(values, (d) => d.year)])
               .range([p, w - p])

    yScale = d3.scaleBand()
                  .domain(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])
                  .range([p, h - p])
    xAxis = d3.axisBottom(xScale)
              .tickFormat(d3.format('d'))

    yAxis = d3.axisLeft(yScale)

    svg.append('g')
       .attr("transform", `translate(0, ${h - p})`)
       .attr("id", "x-axis")
       .call(xAxis)
       
    
    svg.append('g')
       .attr("transform", `translate(${p}, 0)`)
       .attr("id", "y-axis")
       .call(yAxis)
}

let drawCells = () => {

    var colorScale = d3.scaleQuantile()
                   .domain([minTemp, maxTemp])
                   .range(colors)

    let toolTip = d3.select("body")
                    .append("div")
                    .attr("id", "tooltip")
                    .style("opacity", 0)
                    .style("width", "auto")
                    .style("height", "auto")
                    .style("position", "absolute")
                    .style("padding", "5px")

    let monthScale = d3.scaleOrdinal()
                       .domain(values.map((d) => d.month))
                       .range(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])
   
    svg.selectAll("rect")
       .data(values)
       .enter()
       .append("rect")
       .attr("class", "cell")
       .attr("data-month", (d) => d.month - 1)
       .attr("data-year", (d) => d.year)
       .attr("data-temp", (d) => baseTemp + d.variance)
       .attr("width", (w - 2 * p) / (values.length / 12))
       .attr("height", (h - 2 * p) / 12)
       .attr("x", (d) => xScale(d.year))
       .attr("y", (d) => p + (d.month - 1) * ((h - 2 * p) / 12))
       .attr("fill", (d) => {
            return colorScale(baseTemp + d.variance)
       })
       .attr("rx", 0)
       .attr("ry", 0)
       .on("mouseover", (e, d) => {
        toolTip.transition()
        .style("opacity", 80)
        .style("left", (event.pageX + 10)+ "px") 
        .style("top", (event.pageY) + "px")
      toolTip.html(`${monthScale(d.month)} ${d.year}<br />${baseTemp + d.variance}℃ <br />${d.variance}℃`)
      document.querySelector('#tooltip').setAttribute('data-year', d.year)
      })
      .on("mouseout", (d) => {
        toolTip.transition()
            .style("opacity", 0)
      })

}

let drawLegend = () => {

    var colorScale = d3.scaleQuantile()
                   .domain([minTemp, maxTemp])
                   .range(colors)

    let quantiles = colorScale.quantiles();
   
    quantiles.unshift(minTemp);
    quantiles.push(maxTemp);

    let legendHeight = 50;
    legend.attr("width", w)
    legend.attr("height", legendHeight)

    let xScaleLegend = d3.scaleLinear()
                         .domain([minTemp, maxTemp])  
                         .range([800, w - p])
    
    let xAxisLegend = d3.axisBottom(xScaleLegend)
                        .tickValues(quantiles)
                        .tickFormat(d3.format('.3f'))

    legend.append('g')
    .attr("transform", `translate(0, ${legendHeight - 30})`)
    .call(xAxisLegend)

    legend.selectAll("rect")
          .data(colors)
          .enter()
          .append("rect")
          .attr("width", (w - p - 800) / 11)
          .attr("height", 30)
          .attr("x", (d, i) => 800 + i * ((w - p - 800) / 11))
          .attr("y", -10)
          .attr("fill", (d) => {
            return d
          })
          .style("stroke", "black")
          .style("stroke-width", "1px")

}



req.open('GET', url, true)
req.onload = () => {
    let data = JSON.parse(req.responseText)
    baseTemp = data.baseTemperature
    values = data.monthlyVariance
    temps = values.map((d) => baseTemp + d.variance)
    minTemp = d3.min(temps, (d) => d)
    maxTemp = d3.max(temps, (d) => d)
    drawCanvas()
    generateScales()
    drawCells()
    drawLegend()
}
req.send()