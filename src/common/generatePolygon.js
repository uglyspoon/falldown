function generatePolygon (pos, radius, number, theta) {
  var ang = Math.PI * 2 / number
  var points = []
  for (var i = 0; i < number; i++) {
    var x = radius * Math.sin(ang * i + ang / 2 + theta) + pos[0]
    var y = radius * Math.cos(ang * i + ang / 2 + theta) + pos[1]
    x = parseInt(x)
    y = parseInt(y)
    points.push([x, y])
  }
  return points
}

export default generatePolygon
