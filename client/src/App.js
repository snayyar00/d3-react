import logo from './logo.svg';
import './App.css';
import React,{ useEffect, useState , useRef } from 'react';
import * as d3 from "d3"
import { lab } from 'd3';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import background from "../src/background.webp";


function App() {

  const [chartdata,setChartdata] = useState()

  const [data, setData] = useState();

  useEffect(() => {
    axios
      .get('http://localhost:3000/data')
      .then(res => {
        setData(res.data)
        dataload(res.data)
      })
      .catch(err => console.error(err));

  }, []);


  const dataload=(data)=>{
   console.log('heloo', data)

   const formatMonth = d3.timeFormat("%B")
  
   data.forEach(d=>{
     d.month = formatMonth(new Date(d.date))
   })
   const months = d3.map(data, d => d.month).keys()
   var mixedChartData = []
   months.forEach(mon=>{
     const monthData = data.filter(d=>{return d.month == mon})
     const type1 = monthData.filter(d=>{return d.type == 'incrementality'})
     const type2 = monthData.filter(d=>{return d.type == 'baseline'})
     const totalConversion = d3.sum(type1, d=>{return +d.attributed_revenue})
     const totalRevenue = d3.sum(type2, d=>{return +d.attributed_revenue})
     mixedChartData.push({month:mon, incrementality:totalRevenue, baseline:totalConversion})
   })

   drawMixedChart(mixedChartData)
   drawPieChart(data)
   drawBubbleChart(data)
   drawRangeChart(data)
   drawHeatMap(data)

  }

  d3.select('#month').on('change', function(){drawPieChart(data)})

  const drawMixedChart=(dataset)=>{

    d3.select('#mixedChart svg').remove()

      var margin = {top: 80, right: 20, bottom: 100, left: 80},
      width = 600,
      height = 340;

      const maxValue = Math.max(d3.max(dataset, d=>{return d.incrementality}) , d3.max(dataset, d=>{return d.baseline}))
      var xScale = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.1)
      .domain(dataset.map(function(d) {
        return d.month;
      }));
      var yScale = d3.scaleLinear()
          .rangeRound([height, 0])
          .domain([0, maxValue]);

      var svg = d3.select("#mixedChart").append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 "+(width + margin.left + margin.right)+" "+(height + margin.top + margin.bottom))
            .attr("preserveAspectRatio", "none");

      var g = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // axis-x
      g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale));
      svg.append("text")      // text label for the x axis
          .attr("x",  (width + margin.left + margin.right)/2)
          .attr("y",  height + margin.top+35)
          .style("text-anchor", "middle").style("font-size", "15px")
          .text("Month");

      // axis-y
      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(yScale));
      svg.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 0 )
              .attr("x",0 - (height / 2))
              .attr("dy", "1em")
              .style("text-anchor", "middle")
              .text("Total Revenue (€)");


          var bar = g.selectAll("rect")
        .data(dataset)
        .enter().append("g");

      // bar chart
      bar.append("rect")
        .attr("x", function(d) { return xScale(d.month); })
        .attr("y", function(d) { return yScale(+d.incrementality); })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) { return height - yScale(+d.incrementality); })
        .attr('fill' , 'yellow')
        .on('mousemove', function(d){
          d3.select(this).style("cursor", "pointer").style("stroke",'black'); 
          d3.select("#tooltip")
          .style('opacity' , 1)
            .html("<b>Type:</b> Baseline" +
            "<br><b>Total Revenue:</b> "+ d.incrementality.toFixed(2) +' €')
            .style("left", ( d3.event.pageX)  +"px") 
            .style("top", (d3.event.pageY - 40) + "px")
            .style("fill-opacity","0.5")
      })
      .on('mouseout' , function(d){
          d3.select(this).style("cursor", "default").style("stroke",'none'); 

          d3.select("#tooltip").style('opacity' , 0).html('')
            .style("left", (0) + "px") 
            .style("top", (0) + "px")
      })

        // line chart
      var line = d3.line()
      .x(function(d, i) { return xScale(d.month) + xScale.bandwidth() / 2; })
      .y(function(d) { return yScale(d.baseline); })
      .curve(d3.curveMonotoneX);

      bar.append("path")
      .attr("class", "line") // Assign a class for styling
      .attr("d", line(dataset)) // 11. Calls the line generator
      .attr('fill' , 'none')
      .attr('stroke' , 'firebrick')

      bar.append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d, i) { return xScale(d.month) + xScale.bandwidth() / 2; })
        .attr("cy", function(d) { return yScale(d.baseline); })
        .attr("r", 5)
        .attr('fill' , 'firebrick')
        .on('mousemove', function(d){
          d3.select(this).style("cursor", "pointer").style("stroke",'black'); 
          d3.select("#tooltip")
          .style('opacity' , 1)
            .html("<b>Type:</b> Incremental" +
            "<br><b>Total Revenue:</b> "+ d.baseline.toFixed(2)+' €' )
            .style("left", ( d3.event.pageX)  +"px") 
            .style("top", (d3.event.pageY - 40) + "px")
            .style("fill-opacity","0.5")
      })
      .on('mouseout' , function(d){
          d3.select(this).style("cursor", "default").style("stroke",'none'); 

          d3.select("#tooltip").style('opacity' , 0).html('')
            .style("left", (0) + "px") 
            .style("top", (0) + "px")
      })

      //append legend
      var legend = svg.append('g').attr('class' , 'legend').attr("transform",
      "translate(" + (margin.left) + "," + (height+ margin.top - margin.bottom) + ")");

      legend.append("text").attr("x", 50).attr("y", 160).text("Type:").style("font-size", "15px").attr("alignment-baseline","middle")

      legend.append("text").attr("x", 220).attr("y", 160).text("Baseline").style("font-size", "15px").attr("alignment-baseline","middle")

      legend.append("rect")
      .attr("x", 160)
      .attr("y", 150)
      .attr("width", 50)
      .attr("height", 20)
      .style("fill", 'yellow')

      legend.append('line')
      .style("stroke", "firebrick")
      .style("stroke-width", 1)
      .attr("x1", 350)
      .attr("x2", 400)
      .attr("y1", 160)
      .attr("y2", 160)
      legend.append("circle").attr("cx",375).attr("cy",160).attr("r", 6).style("fill", "firebrick")
      legend.append("text").attr("x", 410).attr("y", 160).text("Incremental").style("font-size", "15px").attr("alignment-baseline","middle")

      //add title
      svg.append("text")
        .attr("x", ((width+margin.left+margin.right) / 2))             
        .attr("y",  (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .style("text-decoration", "underline")  
        .text("Sales revenue over time");

  }

  const drawPieChart=(dataset)=>{

    const selectedMonth = d3.select('#month').property('value')
    
    d3.select('#pieChart svg').remove()

    // set the dimensions and margins of the graph
      var width = 600,
      height = 600,
      margin = 130

      var radius = Math.min(width, height) / 2 - margin

      var svg = d3.select("#pieChart")
      .append("svg").attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 "+(width )+" "+(height-100 ))
      .attr("preserveAspectRatio", "none")
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      //add title
      svg.append("text")
        .attr("x", ((0)))             
        .attr("y",  -(margin*2))
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .style("text-decoration", "underline")  
        .text("Sales conversion over time");

      const monthData = dataset.filter(d=>{return d.month == selectedMonth})
      const type1 = monthData.filter(d=>{return d.type === 'incrementality'})
        const type2 = monthData.filter(d=>{return d.type === 'baseline'})
        const totalConversion = d3.sum(type1, d=>{return +d.attributed_conversions})
        const totalRevenue = d3.sum(type2, d=>{return +d.attributed_conversions})
      var data ={incrementality:totalConversion, baseline: totalRevenue}


      const total = totalConversion+totalRevenue;

      // set the color scale
      var color = d3.scaleOrdinal()
      .domain(["incrementality", "baseline"])
      .range(d3.schemeDark2);

      // Compute the position of each group on the pie:
      var pie = d3.pie()
      .sort(null) // Do not sort group by size
      .value(function(d) {return d.value; })
      var data_ready = pie(d3.entries(data))

      // The arc generator
      var arc = d3.arc()
      .innerRadius(radius * 0.5)         // This is the size of the donut hole
      .outerRadius(radius * 0.8)

      // Another arc that won't be drawn. Just for labels positioning
      var outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9)

      // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
      svg
      .selectAll('allSlices')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d){ return(color(d.data.key)) })
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7)
      .on('mousemove', function(d){
        d3.select(this).style("cursor", "pointer").style("stroke",'black'); 
        d3.select("#tooltip")
        .style('opacity' , 1)
          .html(" <b>Total Conversions:</b> "+ d.data.value.toFixed(2)+' €' )
          .style("left", ( d3.event.pageX)  +"px") 
          .style("top", (d3.event.pageY - 40) + "px")
          .style("fill-opacity","0.5")
    })
    .on('mouseout' , function(d){
        d3.select(this).style("cursor", "default").style("stroke",'white'); 

        d3.select("#tooltip").style('opacity' , 0).html('')
          .style("left", (0) + "px") 
          .style("top", (0) + "px")
    })

      // Add the polylines between chart and labels:
      svg
      .selectAll('allPolylines')
      .data(data_ready)
      .enter()
      .append('polyline')
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr('points', function(d) {
        var posA = arc.centroid(d) // line insertion in the slice
        var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
        var posC = outerArc.centroid(d); // Label position = almost the same as posB
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC]
      })

      // Add the polylines between chart and labels:
      svg
      .selectAll('allLabels')
      .data(data_ready)
      .enter()
      .append('text')
      .text( function(d) {return d.data.key+' '+((d.data.value/total)*100).toFixed(0) +'%' } )
      .attr('transform', function(d) {
          var pos = outerArc.centroid(d);
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
          return 'translate(' + pos + ')';
      })
      .style('text-anchor', function(d) {
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          return (midangle < Math.PI ? 'start' : 'end')
      }).style("font-size", "15px")

  }

  const drawBubbleChart = (dataset)=>{

    d3.select('#bubbleChart svg').remove()

    const labels = d3.map(dataset, d => d.label).keys()
        var data = []
        labels.forEach(label=>{
          const LabelData = dataset.filter(d=>{return d.label === label})
          const totalSpends = d3.sum(LabelData, d=>{return +d.spends})
          const totalConversions = d3.sum(LabelData, d=>{return +d.attributed_conversions})
          const totalRevenue = d3.sum(LabelData, d=>{return +d.attributed_revenue})
          data.push({label:label, revenue:totalRevenue, spends:totalSpends, size:totalConversions })
        })
        console.log('dataset' , data)

        // set the dimensions and margins of the graph
        var margin = {top: 80, right: 150, bottom: 50, left: 80},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        // set the ranges
        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        var svg = d3.select("#bubbleChart").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 "+(width + margin.left + margin.right)+" "+(height + margin.top + margin.bottom))
        .attr("preserveAspectRatio", "none")
                    .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");

      //add title
      svg.append("text")
      .attr("x", (width/2))             
      .attr("y",  -(margin.top/2))
      .attr("text-anchor", "middle")  
      .style("font-size", "20px") 
      .style("text-decoration", "underline")  
      .text("Total spent over label conversion");


        // Scale the range of the data
        x.domain([0, d3.max(data, function(d) { return +d.revenue; })]);
        y.domain([0, d3.max(data, function(d) { return +d.spends; })]);
        var z = d3.scaleSqrt().domain(d3.extent(data, function(d) { return +d.size; })).range([5, 20]);
        var color = d3.scaleOrdinal().domain(labels)
        .range(['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#808000', 'black', '#000075', '#808080']);

        // Add the X Axis
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

        svg.append("text")      // text label for the x axis
        .attr("x",  (width )/2)
        .attr("y",  height + 40)
        .style("text-anchor", "middle").style("font-size", "15px")
        .text("Total Revenue (€)");


      // Add the Y Axis
      svg.append("g")
        .call(d3.axisLeft(y));

        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left  )
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle").style("font-size", "15px")
        .text("Total Amount Spent (€)");

        // Add the scatterplot
        svg.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", function(d) { return z(+d.size); })
        .attr("cx", function(d) { return x(+d.revenue); })
        .attr("cy", function(d) { return y(+d.spends); })
        .style("fill", function (d) { return color(d.label); } )
        .style("stroke",function (d) { return color(d.label); } )
        .attr("stroke-opacity","1")
        .attr("fill-opacity","0.5").style("stroke-width","1px")
        .on('mousemove', function(d){
          d3.select(this).style("cursor", "pointer").style("stroke",'black'); 
          d3.select("#tooltip")
          .style('opacity' , 1)
            .html("<b>Label:</b> "+ d.label+
            "<br><b>Total Revenue:</b> "+ +d.revenue.toFixed(2) +' €'+
            "<br><b>Total Amount Spent:</b> "+ +d.spends.toFixed(2) +' €'+
            "<br><b>Attributed Conversions:</b> "+ +d.size.toFixed(2)+' €' 
            )
            .style("left", ( d3.event.pageX)  +"px") 
            .style("top", (d3.event.pageY - 40) + "px")
            .style("fill-opacity","0.5")
      })
      .on('mouseout' , function(d){
          d3.select(this).style("cursor", "default").style("stroke",function (d) { return color(d.label); } ); 
  
          d3.select("#tooltip").style('opacity' , 0).html('')
            .style("left", (0) + "px") 
            .style("top", (0) + "px")
      }) 

    var legend = svg.append('g').attr('class' , 'legend').attr("transform",
          "translate(" + (width-margin.right) + "," + (0) + ")");

          legend.append("text")      // text label for the x axis
        .attr("x", 40)
        .attr("y",  0)
        .style("text-anchor", "middle")
        .text("Types:");

        legend.append('rect')
        .attr("x", 10)
      .attr("y", -30)
      .attr("width", 270)
      .attr("height", 280)
      .style("fill", 'none')
      .style('stroke' , 'black')


    // Add one dot in the legend for each name.
    legend.selectAll("mylabels")
    .data(labels)
    .enter()
    .append("text")
        .attr("x", function(d,i){ return (20  )})
        .attr("y", function(d,i){ return (15 + i*15 )}) 
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style('font' , '12px sans-serif')
        .style("alignment-baseline", "middle").style("text-transform", "capitalize")



  }

  const drawRangeChart = (dataset)=>{

    d3.select('#rangeChart svg').remove()

    const labels = d3.map(dataset, d => d.label).keys()
        var data = []
        labels.forEach(label=>{
          const LabelData = dataset.filter(d=>{return d.label === label})
          const type1 = LabelData.filter(d=>{return d.type === 'incrementality'})
          const type2 = LabelData.filter(d=>{return d.type === 'baseline'})
          const totalincrementality = d3.sum(type1, d=>{return +d.attributed_conversions})
          const totalbaseline = d3.sum(type2, d=>{return +d.attributed_conversions})
          const totalSpends = d3.sum(LabelData, d=>{return +d.attributed_conversions})
          data.push({label:label, incrementality:totalincrementality, spends:totalSpends, baseline:totalbaseline })
        })
  
      var margin = {top: 90, right: 10, bottom: 50, left: 230},
          width = 700 - margin.left - margin.right,
          height = 520 - margin.top - margin.bottom;

          var svg = d3.select("#rangeChart")
                      .append("svg")
                      .attr("preserveAspectRatio", "xMinYMin meet")
                      .attr("viewBox", "0 0 "+(width + margin.left + margin.right)+" "+(height + margin.top + margin.bottom))
                      .attr("preserveAspectRatio", "none")
                      .append("g")
                        .attr("transform",
                              "translate(" + margin.left + "," + margin.top + ")");

           //add title
           svg.append("text")
           .attr("x", ((width -margin.left)/ 2))             
           .attr("y", 0 - (margin.top /1.5))
           .attr("text-anchor", "middle")  
           .style("font-size", "20px") 
           .style("text-decoration", "underline")
          .text("Revenue generated over Sales Item");

                              // Add X axis
          var x = d3.scaleLinear()
          .domain([0, d3.max(data, function(d) { return d.spends; })])
          .range([ 0, width]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

            
        svg.append("text")      // text label for the x axis
        .attr("x",  (width )/2)
        .attr("y",  height +50 )
        .style("text-anchor", "middle").style("font-size", "15px")
        .text("Total Conversion  (€)");

        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left  )
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle").style("font-size", "15px")
          .text("Labels");



        // Y axis
        var y = d3.scaleBand()
          .range([ 0, height ])
          .domain(data.map(function(d) { return d.label; }))
          .padding(.1);
        svg.append("g")
          .call(d3.axisLeft(y))

          
          //add line connecter
          svg.selectAll("lines")
          .data(data)
        .enter().append("line")
          .attr("x1", function(d) { return x(d.baseline); })
          .attr("x2", function(d) { return x(d.incrementality); })
          .attr("y1", function(d) { return y(d.label)+12; })
          .attr("y2", function(d) { return y(d.label)+12; })
          .style("stroke", 'black')

          //add dots for incremental
          svg.selectAll("dot")
          .data(data)
        .enter().append("circle")
          .attr("r",5)
          .attr("cx", function(d) { return x(d.incrementality); })
          .attr("cy", function(d) { return y(d.label)+12; })
          .style("fill", 'steelblue')
          .on('mousemove', function(d){
            d3.select(this).style("cursor", "pointer").style("stroke",'black'); 
            d3.select("#tooltip")
            .style('opacity' , 1)
              .html("<b>Label:</b> "+ d.label+
              "<br><b>Total Amount Spent:</b> "+ d.incrementality.toFixed(2) +' €'
              )
              .style("left", ( d3.event.pageX)  +"px") 
              .style("top", (d3.event.pageY - 40) + "px")
              .style("fill-opacity","0.5")
        })
        .on('mouseout' , function(d){
            d3.select(this).style("cursor", "default").style("stroke",'none'); 
    
            d3.select("#tooltip").style('opacity' , 0).html('')
              .style("left", (0) + "px") 
              .style("top", (0) + "px")
        }) 

          //add dots for baseline
          svg.selectAll("dot")
          .data(data)
        .enter().append("circle")
          .attr("r",5)
          .attr("cx", function(d) { return x(d.baseline); })
          .attr("cy", function(d) { return y(d.label)+12; })
          .style("fill", 'firebrick')
          .on('mousemove', function(d){
            d3.select(this).style("cursor", "pointer").style("stroke",'black'); 
            d3.select("#tooltip")
            .style('opacity' , 1)
              .html("<b>Label:</b> "+ d.label+
              "<br><b>Total Amount Spent:</b> "+ d.baseline.toFixed(2) +' €'
              )
              .style("left", ( d3.event.pageX)  +"px") 
              .style("top", (d3.event.pageY - 40) + "px")
              .style("fill-opacity","0.5")
        })
        .on('mouseout' , function(d){
            d3.select(this).style("cursor", "default").style("stroke",'none'); 
    
            d3.select("#tooltip").style('opacity' , 0).html('')
              .style("left", (0) + "px") 
              .style("top", (0) + "px")
        }) 

        //adding legend 
        svg.append("circle").attr("cx", 50).attr("cy", -20).attr("r", 6).style("fill", "firebrick")
        svg.append("circle").attr("cx",200).attr("cy",-20).attr("r", 6).style("fill", "steelblue")
        svg.append("text").attr("x",  60).attr("y", -20).text("Baseline").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 210).attr("y", -20).text("Incrementality").style("font-size", "15px").attr("alignment-baseline","middle")

  }

  const drawHeatMap = (dataset)=>{

    d3.select('#heatmap svg').remove()

    const labels = d3.map(dataset, d => d.label).keys()
    const months = d3.map(dataset, d => d.month).keys()
        var data = []
        labels.forEach(label=>{
          const LabelData = dataset.filter(d=>{return d.label == label})
          months.forEach(month=>{
            const monthData = LabelData.filter(d=>{return d.month == month})
            const totalSpends = d3.sum(monthData, d=>{return +d.spends})
            data.push({label:label, month:month, spends:totalSpends})
          })
        })
        console.log('data' , data)

        // set the dimensions and margins of the graph
        var margin = {top: 70, right: 10, bottom: 40, left: 220},
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#heatmap")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 "+(width + margin.left + margin.right)+" "+(height + margin.top + margin.bottom))
            .attr("preserveAspectRatio", "none")
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

              //add title
           svg.append("text")
           .attr("x", ((width -margin.left)/ 2))             
           .attr("y", 0 - (margin.top /1.5))
           .attr("text-anchor", "middle")  
           .style("font-size", "20px") 
           .style("text-decoration", "underline")
          .text(" Amount Spent on each label over time");

          svg.append("text")      // text label for the x axis
          .attr("x",  (width )/2)
          .attr("y",  height +40 )
          .style("text-anchor", "middle").style("font-size", "15px")
          .text("Month");
  
          svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left  )
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle").style("font-size", "15px")
            .text("Label");

              // Build X scales and axis:
        var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(months)
        .padding(0.01);
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

        

        // Build X scales and axis:
        var y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(labels)
        .padding(0.01);
        svg.append("g")
        .call(d3.axisLeft(y));

        d3.selectAll('g.tick text').style("text-transform", "capitalize")

        // Build color scale
        var myColor = d3.scaleLinear()
        .range(["#BFBFFF", "#7879FF"])
        .domain([0, d3.max(data, function(d) { return d.spends; })/50,d3.max(data, function(d) { return d.spends; })])


        //add squares
        svg.selectAll()
        .data(data, function(d) {return d.month+':'+d.label;})
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.month) })
        .attr("y", function(d) { return y(d.label) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d.spends)} )
        .on('mousemove', function(d){
          d3.select(this).style("cursor", "pointer").style("stroke",'black'); 
          d3.select("#tooltip")
          .style('opacity' , 1)
            .html("<b>Label:</b> "+ d.label+
            "<br><b>Total Amount Spent:</b> "+ d.spends.toFixed(2) +' €'
            )
            .style("left", ( d3.event.pageX)  +"px") 
            .style("top", (d3.event.pageY - 40) + "px")
            .style("fill-opacity","0.5")
      })
      .on('mouseout' , function(d){
          d3.select(this).style("cursor", "default").style("stroke",'none'); 
  
          d3.select("#tooltip").style('opacity' , 0).html('')
            .style("left", (0) + "px") 
            .style("top", (0) + "px")
      }) 


  }



  return (
  
      <><div className='appBack'>
      <Container className='container' fluid="md">


        <Row >
          <Col sm="true">
            <Card className="m-3 border-0 shadow">
              <Card.Body>
                <div class="custom-select">
                  <select id='month'>
                    <option value='June'>June</option>
                    <option value='July'>July</option>
                    <option value='August'>August</option>
                    <option value='September'>September</option>
                    <option value='October'>October</option>
                    <option value='November'>November</option>
                  </select>
                </div>
                <div id='pieChart'></div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm="true" >
            <Card className="m-3 border-0 shadow">
              <Card.Body>
                <div id='heatmap'></div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row >
          <Col sm="true" >
            <Card className="m-3 border-0 shadow">
              <div id='mixedChart'></div>
            </Card>
          </Col>
          <Col >
            <Card className="m-3 border-0 shadow">
              <div id='rangeChart'></div>
            </Card>
          </Col>
        </Row>
        <Row >
          <Col sm="true">
            <Card className="m-3 border-0 shadow">
              <div id='bubbleChart'></div>
            </Card>
          </Col>
        </Row>
        <div id='tooltip'></div>

      </Container>
    </div></>
 
  );
}

export default App;
