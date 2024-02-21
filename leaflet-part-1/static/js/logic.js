let centerCoords = [39.8283, -98.5795];
let mapZoomLevel = 3;
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"

// Define colors for markers based on depth
function getColor(d) {
    return d > 90 ? '#ff1400' :
       d > 70  ? '#FF6600' :
       d > 50  ? '#FF9900' :
       d > 30  ? '#FFCC00' :
       d > 10  ? '#ADFF2F' :
       d > -10 ? '#7CFC00' :
                '#7CFC00' ;
}

// Create the createMap function.
function createMap(earthquakes) {

  // Create the tile layer that will be the background of our map.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object to hold the lightmap layer.
  let baseMaps = {
    "Street Map": street,
  };

  // Create an overlayMaps object to hold the earthquakes layer.
  
  let overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create the map object with options.
  let myMap = L.map("map", {
    center: centerCoords,
    zoom: mapZoomLevel,
    layers: [street, earthquakes]
  });

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  layerControl = L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Create legend and add to the map.
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [-10, 10, 30, 50, 70, 90],
          labels = [];
      
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : 
              '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);

}

// Create the createMarkers function.
function createMarkers(response) {
  // Pull the "features" property from response
  console.log(response.features)
  let earthquakeData = response.features;
  // Initialize an array to hold the earthquake markers.
  let earthquakes = [];

//   Loop through the earthquakes array.
//     For each station, create a marker, and bind a popup with the earthquake's location and time.

  for (let i = 0; i < earthquakeData.length; i++) {

    // Pull the coordinates of each earthquake
    let earthquakeCoords = earthquakeData[i].geometry.coordinates

    // Pull the depth of each earthquake
    let earthquakeDepth = earthquakeData[i].geometry.coordinates[2]

    // Convert unix time to datetime
    const earthquakeTime = earthquakeData[i].properties.time
    let unixTime = earthquakeTime / 1000;
    let earthquakeDateTime = new Date(unixTime * 1000)

    // Add circles to the map.
    let newMarker = L.circle([earthquakeCoords[1], earthquakeCoords[0]], {
      fillOpacity: 0.75,
      color: "white",
      stroke: true,
      weight: 1,
      fillColor: getColor(earthquakeDepth),
    // Adjust the radius.
      radius: earthquakeData[i].properties.mag * 20000
    })
    .bindPopup(`<h3> ${earthquakeData[i].properties.place} <br> 
        <h5> ${earthquakeDateTime.toDateString()} ${earthquakeDateTime.toTimeString()} <br>
        Magnitude: ${earthquakeData[i].properties.mag} <br>
        Depth: ${earthquakeDepth} </h5>`);
    earthquakes.push(newMarker);
  }
    
    let earthquakeLayer = L.layerGroup(earthquakes);
    createMap(earthquakeLayer);
} 

// Perform a call to the USGS dataset to get the earthquake information. Call createMarkers when it completes.
// Get the data with d3.

d3.json(url).then(createMarkers);