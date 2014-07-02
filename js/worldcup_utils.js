function drawBar(bar, d) {
  var team = (d.team) ? d.team.split(/\s+/) : [];

  d.totalDistance = (d.team) ? d.totalDistance : 0;

  var title = bar.select("text.bar_title");

  title.selectAll("tspan").remove();

  title.transition()
    .attr({
      "x": 30,
      "y": inverseLinearScale(d.totalDistance) - 24
    });

  while (team.length > 0) {
    title.append("tspan")
      .attr({
        "x": 30,
        "dy": "-1.1em"
      })
      .text(team.pop() || "");
  }

  bar.select("use")
    .transition()
    .attr("transform", function() {
      var vpos = inverseLinearScale(d.totalDistance) - 126;
      return "matrix(1 0 0 1 0 " + vpos + ")";
    });
  bar.select("rect")
    .transition()
    .attr({
      "y": inverseLinearScale(d.totalDistance),
      "height": function() {
        var height = linearScale(d.totalDistance) - 80;
        height = (height < 0) ? 0 : height;
        return height;
      }
    });
  bar.select("text.bar_details")
    .transition()
    .attr({
      "x": 30,
      "y": inverseLinearScale(d.totalDistance) - 16
    })
    .text(d.totalDistance + " KM");
}