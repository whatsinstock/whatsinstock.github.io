function CenterControl(controlDiv, map) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = `
    <a class="btn btn-primary" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
      &nbsp;&nbsp;Item Checklist&nbsp;&nbsp;
    </a>

    <div class="collapse" id="collapseExample">
      <div class="form-inline">
        <div class="form-group">
          <div class="row">
            <div class="col-sm-12">
              <label class="radio-inline">
              <input class="map-control" type="checkbox" name="Toilet Paper">Toilet Paper</label>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <label class="radio-inline">
              <input class="map-control" type="checkbox" name="Rubbing Alcohol">Rubbing Alcohol</label>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <label class="radio-inline">
              <input class="map-control" type="checkbox" name="Disinfecting Wipes">Disinfecting Wipes</label>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <label class="radio-inline">
              <input class="map-control" type="checkbox" name="Hand Sanitizer">Hand Sanitizer</label>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <label class="radio-inline">
              <input class="map-control" type="checkbox" name="Facemasks">Facemasks</label>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <label class="radio-inline">
              <input class="map-control" type="checkbox" name="Water">Water</label>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <label class="radio-inline">
              <input class="map-control" type="checkbox" name="Eggs">Eggs</label>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <label class="radio-inline">
              <input class="map-control" type="checkbox" name="Milk">Milk</label>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <label class="radio-inline">
              <input class="map-control" type="checkbox" name="Bread">Bread</label>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  controlUI.appendChild(controlText);
}

var map;
var markers = [];
var data;

function initMap() {

  const Http = new XMLHttpRequest();
  const url = "https://inventoryinformationbucket.s3.amazonaws.com/store_info.json";
  Http.open("GET", url, true);
  Http.send();

  Http.onreadystatechange = (e) => {
    data = JSON.parse(Http.responseText);

    console.log(data);

    console.log(data['Walgreens #14153']['Products']);

    var center = {
      lat: 40.7190994,
      lng: -73.9633208
    };
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 11,
      center: center
    });

    // add the checkboxes
    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);


    var infowindow = new google.maps.InfoWindow({
      content: "hi"
    });

    for (storeName in data) {
      var address = data[storeName].Address;
      var lat = data[storeName].lat;
      var lng = data[storeName].lng;
      var url = data[storeName].url;

      var contentstring = `<h2>` + storeName + `</h2><a href="https://www.google.com/maps/search/?api=1&query=` + lat + `,` + lng + `">` + address + `</a><br><br>`

      tableMiddle = ""
      for (var idx = 0; idx < data[storeName].Products.length; idx++) {
        var product_data = data[storeName].Products[idx]
        tableMiddle = tableMiddle + `<tr><td>` + product_data[0] + `</td><td><font color="` + product_data[2] + `">` + product_data[1] + `</font></td></tr>`;
      }

      tableMiddle = `<table><tr>
              <th>Item</th>
              <th>Availability</th>
            </tr>` + tableMiddle + "</table>";

      contentstring += tableMiddle;

      // console.log(contentstring);

      var coord = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      }

      // console.log(coord);

      var marker = new google.maps.Marker({
        position: coord,
        map: map,
        title: storeName,
        icon: {
          url: url
        },
        info: contentstring,
        products: data[storeName]['Products']

      });

      marker.addListener('click', function(e) {
        infowindow.setContent(this.info);
        infowindow.open(map, this)
      });

      markers.push(marker);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        map.setCenter(pos);

        console.log(pos);

        var min_dist = 99999999999999999;
        var closestStore;

        for (storeName in data) {
          var lat = data[storeName].lat;
          var lng = data[storeName].lng;

          var dist = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(pos.lat, pos.lng), new google.maps.LatLng(lat, lng)
          );

          console.log(dist);
          if (dist < min_dist) {
            min_dist = dist;
            closestStore = storeName;
          }
        }

        var threshold = 100; //100
        if (min_dist < threshold) {
          $('#storeName').val(closestStore);
          $('#myModal').modal('show');
        }

      });
    }

  }
}

var checked_status = {
  "Toilet Paper": false,
  "Rubbing Alcohol": false,
  "Disinfecting Wipes": false,
  "Hand Sanitizer": false,
  "Facemasks": false,
  "Water": false,
  "Eggs": false,
  "Milk": false,
  "Bread": false
}

function updateChecked() {
  for (idx in markers) {
    // set the marker to be on the map
    var isOnMap = true;

    // make a set of all the items the store has
    var instockSet = new Set();
    for (itemIdx in markers[idx].products) {
      if (markers[idx].products[itemIdx][1] !== "Out of Stock") {
        // We have the item
        instockSet.add(markers[idx].products[itemIdx][0]);
      }
    }

    // if it contains all the ones in true, then it stays on the map
    for (item in checked_status) {
      if (checked_status[item] === true) {
        // we need this item
        if (!instockSet.has(item)) {
          // does not have this item
          isOnMap = false;
        }
      }
    }

    if (isOnMap) {
      markers[idx].setMap(map);
    } else {
      markers[idx].setMap(null);
    }    
  }
}

$(document).on('click', '.map-control', function() {
  checked_status[this.name] = this.checked;

  updateChecked();
});
