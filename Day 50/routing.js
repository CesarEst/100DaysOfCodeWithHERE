// Get an instance of the routing service version 8:
var router = platform.getRoutingService(null, 8);

// Create the parameters for the routing request:
var routingParameters = {
  transportMode:'pedestrian',
  routingMode: 'fast',
  origin: '52.4569927,13.380545',
  destination: '52.52407865,13.429371',
  via:'52.505582,13.3692024!stopDuration=900',
  alternatives:3,
  departureTime:'2020-05-13T09:00:00',
  return:'polyline,summary,actions,instructions',
  spans:'speedLimit'
  };
  
  // Define a callback function to process the routing response:
var onResult = function(result) {
  console.log(result);
  if (result.routes.length) {

    result.routes.forEach(route =>{

      let totalLength = 0; 
      let totalDuration = 0;
      route.sections.forEach((section) => {
        // Create a linestring to use as a point source for the route line
       let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

       // Create a polyline to display the route:
       let routeLine = new H.map.Polyline(linestring, {
         style: { strokeColor: '#034F84', lineWidth: 3,lineDash: [1,2] }
       });

       // Create a marker for the start point:
       let startMarker = new H.map.Marker(section.departure.place.location);

       // Create a marker for the end point:
       let endMarker = new H.map.Marker(section.arrival.place.location);

       totalLength += section.summary.length;
       totalDuration += section.summary.duration;
       
       section.actions.forEach(action =>{
         document.getElementById("panel").innerHTML += `<br>`+ action.instruction;

       });

       if(section.postActions){
        document.getElementById("panel").innerHTML += `<br>`+ section.postActions[0].action +' '+ section.postActions[0].duration + ' sec' ;
       }

 
       // Add the route polyline and the two markers to the map:
       map.addObjects([routeLine, startMarker, endMarker]);

       // Set the map's viewport to make the whole route visible:
       map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});


  
      });

      document.getElementById("panel").innerHTML += `<br>`+'Route '+(result.routes.indexOf(route)+1)+ ' Distance: '+ totalLength/1000 +' Km'+' Duration: '+ totalDuration.toMMSS() + `<br>`;

    });
      
  }
};

var onError = function(error) {
  alert(error.message);
};

Number.prototype.toMMSS = function () {
  return  Math.floor(this / 60)  +' minutes '+ (this % 60)  + ' seconds.';
}
  
  
// Call calculateRoute() with the routing parameters,
// the callback and an error callback function (called if a
// communication error occurs):
router.calculateRoute(routingParameters, onResult, onError);