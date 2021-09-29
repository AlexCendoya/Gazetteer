
$(document).ready(function(){

    //map and geolocation

    var mymap = L.map('mapid');	
	
	var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	}).addTo(mymap);

	var infoButton = L.easyButton('<i class="fas fa-globe-europe fa-lg"></i>', function(btn, mymap) {
		$('#myModal').modal('show');
	}, {position: 'bottomright'}).addTo(mymap);

	//Preloader

    mymap.on('load', onMapLoad);
	
	mymap.setView([47, 2], 3);
	
	function onMapLoad()
	{
		//Dropdown menu

		$.ajax({
			url: "php/navBar.php",
			type: 'POST',
			dataType: "json",     
			success: function(result) {

				//console.log(result);

				if (result.status.name == "ok") {

					$.each(result['data'], function (i, val) {

						$('#selectCountry').append(`<option value="${val['iso_a2']}">${val['name']}</option>`);

					});

					//Sort the dropdown menu in alphabetical order
					
					var options = $("#selectCountry option");            // Collect options    
					
					options.detach().sort(function(a,b) {               // Detach from select, then Sort
						var at = $(a).text();
						var bt = $(b).text();         
						return (at > bt)?1:((at < bt)?-1:0);            // Tell the sort function how to order
					});
					
					options.appendTo("#selectCountry");

					//Geolocation
										
					if(!navigator.geolocation) {
						console.log("Your browser doesn't support geolocation")
					} else {
						navigator.geolocation.getCurrentPosition( getPosition )
					}
					
				}     

			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
			}

		});
		
		// latitude&longitude values

		var isoCode, lat, lng, border, markerCluster1, markerCluster2
		
		var inMyCountry = true;		
		
		function getPosition(position) {
			
			lat = position.coords.latitude
			lng = position.coords.longitude
			var accuracy = position.coords.accuracy

			let coords = [lat, lng];

			//geolocation out of lat/lng: get ISO code out API and use it highlight location

			var marker, localTime, localTemperature, localWeather, localHumidity, localWeatherIcon

			$.ajax({
				url: "php/countryCode.php",
				type: 'POST',
				dataType: "json", 
				data: {
					lat: lat,
					lng: lng,
				}, 
				success: function(result) {

					isoCode = result['data'].toUpperCase();

					$("#selectCountry").change();

					if (result.status.name == "ok") {

						//popup content

						$.ajax({

							url: "php/cityName.php",
							type: 'POST',
							dataType: "json",
							data: {
								lat: lat,
								lng: lng,
							},   

							success: function(r1) {

								//console.log(r1);

								if (r1.status.name == "ok") {

									$('#cityName').html(r1.data.suburb + "(" + r1.data.city + ")");

									var suburb = r1.data.suburb
									var cityName = r1.data.city;
									var tidiedLocation = cityName.replace(/ /g,"_");

									//console.log(r1.data.city);

									$.ajax({
										url: "php/localWeather.php",
										type: 'POST',
										dataType: "json",
										data: {
											lat: lat,
											lng: lng,
										},   
										success: function(result) {

											//console.log(result);

											if (result.status.name == "ok") {

												localTemperature = result.data1.temp;
												localHumidity = result.data1.humidity;
												localWeather = result['data2'][0]['description'].charAt(0).toUpperCase() + result['data2'][0]['description'].slice(1);
												localWeatherIcon = result['data2'][0]['icon'];

												// popup marker

												marker = L.marker(coords).addTo(mymap).bindPopup(

													"<h5 align='center'>You are here!</h5><h6>" + suburb + " (" + cityName + ")</h6><hr/><table><tr><td><img src='https://openweathermap.org/img/wn/" 
													+ localWeatherIcon 
													+ "@2x.png' /></td><td>" 
													+ localTemperature + "°C</td></tr></table>"
													+ localWeather + ", " + localHumidity + "% humidity <br/>" 
													+ localTime + "<br/>" 
													+ "<a href =https://en.wikipedia.org/wiki/" + tidiedLocation + " target='_blank'>" + cityName + "</a>"

												).openPopup();

											}

										},
										error: function(jqXHR, textStatus, errorThrown) {
											console.log(jqXHR);
										}                       

									});

								}


							},

							error: function(jqXHR, textStatus, errorThrown) {
								console.log(jqXHR);

							}


						});

						$.ajax({
							url: "php/localTime.php",
							type: 'POST',
							dataType: "json",
							data: {
								lat: lat,
								lng: lng,
							},   
							success: function(result) {

								//console.log(result);

								if (result.status.name == "ok") {

									localTime = result['data'];

								}

							},
							error: function(jqXHR, textStatus, errorThrown) {
								console.log(jqXHR);
							}


						}); 

					}				

				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
				}

			});



		}  

		// Borders

		$('#selectCountry').change( function() {
			
			if( inMyCountry )
			{
			
				$("#selectCountry").val(isoCode);
				
				$("#preloader").fadeOut('slow', function() {

					$(this).remove();

				});
				
				inMyCountry = false;
									
			} else {
				
				isoCode = $("#selectCountry").val();
				
			}
			
			//console.log("Country we are in: " + isoCode);			

			$.ajax({
				url: "php/borders.php",
				type: 'POST',
				dataType: "json",
				data: {"isoCode": isoCode},  
				success: function(result) {

					//console.log(result);

					if (result.status.name == "ok") {

						if( isoCode != "" )
						{
							
							if (mymap.hasLayer(border)) {								
								mymap.removeLayer(border);								
							}
							
							if (mymap.hasLayer(markerCluster1)) {
								mymap.removeLayer(markerCluster1);
							}

                            if (mymap.hasLayer(markerCluster2)) {
								mymap.removeLayer(markerCluster2);
							}

							var borderLines = result["data"];

							var borderStyle = {
								"color": "#ff0000",     
								"weight": 10,
								"opacity": 0.5
							};

							border = L.geoJSON(borderLines, {
								style : borderStyle
							}).addTo(mymap); 
							
							mymap.fitBounds(border.getBounds());
							
							// modal show

							$("#myModal").modal('show');

							// modal content

							$('#countryFlag').html("<img src='https://www.countryflags.io/" + isoCode + "/flat/64.png' />");

                            $.ajax({
								url: "php/restCountries.php",
								type: 'POST',
								dataType: "json",
								data: {"isoCode": isoCode}, 
								success: function(result) {

                                    //console.log(result);

                                    if (result.status.name == "ok") {

                                        $('#population').html(result['data1']);
										$('#currency').html(result['data2'][0]['name'] + " (" + result['data2'][0]['symbol'] + ")");
										$('#language').html(result['data3'][0]['name']);
										$('#callingCode').html("+" + result['data4']);

                                    }


                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    console.log(jqXHR);
                                }
                            });

							$.ajax({
								url: "php/countryName.php",
								type: 'POST',
								dataType: "json",
								data: {"isoCode": isoCode},  
								success: function(result) {

									//console.log(result);

									if (result.status.name == "ok") {

										var countryName = result.data1.common;
										var capitalCity = result.data2;
										var tidiedCountry = countryName.replace(/ /g,"_");

										$('#countryName').html(result.data1.official);
										$('#capitalCity').html(capitalCity);
										$('#countryWikipedia').html("<a href =https://en.wikipedia.org/wiki/" + tidiedCountry + " target='_blank'>" + countryName + "</a>");

										// capital city temperature, humidity, weather, weather icon and coordinates, in order to retrieve local time

										$.ajax({
											url: "php/countryWeather.php",
											type: 'POST',
											dataType: "json",
											data: {"capitalCity": capitalCity},
											success: function(result) {

												//console.log(result);

												if (result.status.name == "ok") {

													$('#countryTemperature').html(result.data1.temp + "°C");
													$('#countryHumidity').html(result.data1.humidity + "%");
													$('#countryWeather').html(result['data2'][0]['description'].charAt(0).toUpperCase() + result['data2'][0]['description'].slice(1));

													var countryWeatherIcon = result['data2'][0]['icon'];

													$('#countryWeatherIcon').html("<img src='https://openweathermap.org/img/wn/" + countryWeatherIcon + "@2x.png' />");

													//reassign the lat, lng values to capital city in order to get a nationally representative response

													let lat = result.data3.lat;
													let lng = result.data3.lon;

													$.ajax({
														url: "php/localTime.php",
														type: 'POST',
														dataType: "json",
														data: {
															lat: lat,
															lng: lng,
														}, 
														success: function(result) {

															//console.log(result);  

															if (result.status.name == "ok") {

																$('#countryTime').html(result['data']);

															}
														},
														error: function(jqXHR, textStatus, errorThrown) {
															console.log(jqXHR);
														}
													});

												}

											},
											error: function(jqXHR, textStatus, errorThrown) {
												console.log(jqXHR);
											}

										});


										//marker clusters

										$.ajax({
											url: "php/cityCluster.php",
											type: 'POST',
											dataType: "json",
											data: {"tidiedCountry": tidiedCountry},
											success: function(result) {

												//console.log(result);  

												if (result.status.name == "ok") {

													var cityPoints = result['data'];

													markerCluster1 = L.markerClusterGroup();

													for (let i = 0; i < cityPoints.length; i++) {

														var yellowMarker = L.ExtraMarkers.icon({
															icon: 'fa-city',
															markerColor: 'yellow',
															shape: 'square',
															prefix: 'fa',
														});

														var tidiedCity = cityPoints[i].name.replace(/ /g,"_");

														let m = L.marker([cityPoints[i].coordinates.latitude, cityPoints[i].coordinates.longitude], {icon: yellowMarker}).bindPopup(
															"<h6 align='center'>" + cityPoints[i].name + "</h6>" + cityPoints[i].snippet + "<br/>" 
															+ "<a href =https://en.wikipedia.org/wiki/" + tidiedCity + " target='_blank'>" + cityPoints[i].name + "</a>"
															);
														
														markerCluster1.addLayer(m);
													}

													mymap.addLayer(markerCluster1);

												}
											},
											error: function(jqXHR, textStatus, errorThrown) {
												console.log(jqXHR);
											}
										});

										$.ajax({
											url: "php/poiCluster.php",
											type: 'POST',
											dataType: "json",
											data: {"tidiedCountry": tidiedCountry},
											success: function(result) {

												//console.log(result);  

												if (result.status.name == "ok") {

													var poiPoints = result['data'];

													markerCluster2 = L.markerClusterGroup();

													for (let i = 0; i < poiPoints.length; i++) {

														var purpleMarker = L.ExtraMarkers.icon({
															icon: 'fa-exclamation',
															markerColor: 'purple',
															shape: 'star',
															prefix: 'fa',
														});

														var tidiedPoi = poiPoints[i].name.replace(/ /g,"_");

														let m = L.marker([poiPoints[i].coordinates.latitude, poiPoints[i].coordinates.longitude], {icon: purpleMarker}).bindPopup(
															"<h6 align='center'>" + poiPoints[i].name + "</h6>" + "<br/>" 
															+ "<a href =https://en.wikipedia.org/wiki/" + tidiedPoi + " target='_blank'>" + poiPoints[i].name + "</a>"
															);

														markerCluster2.addLayer(m);
													}

													mymap.addLayer(markerCluster2);

												}
											},
											error: function(jqXHR, textStatus, errorThrown) {
												console.log(jqXHR);
											}
										});


									}

								},
								error: function(jqXHR, textStatus, errorThrown) {
									console.log(jqXHR);
								}
							});
						
						}

					}

				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
				}

			});

		});	
		
	}
	
});

