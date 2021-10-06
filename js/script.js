
$(document).ready(function(){

    //maps 

    var mymap = L.map('mapid');	
	
	var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	}).addTo(mymap);

	var NASAGIBS_ViirsEarthAtNight2012 = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
		attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
		bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
		minZoom: 1,
		maxZoom: 8,
		format: 'jpg',
		time: '',
		tilematrixset: 'GoogleMapsCompatible_Level'
	});

	var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
		maxZoom: 17,
		attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
	});
	
	var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	});

	
	var markerCluster1 = L.markerClusterGroup();
	var markerCluster2 = L.markerClusterGroup();
	var markerCluster3 = L.markerClusterGroup();
	var markerCluster4 = L.markerClusterGroup();

	//Layer control
	
	var baseLayers = {
		"Satellite": Esri_WorldImagery,
		"Nocturnal satellite": NASAGIBS_ViirsEarthAtNight2012,
		"Geophysical": OpenTopoMap,
		"Streets": OpenStreetMap_Mapnik
	};

	var overLays = {
		"Main cities": markerCluster1,
		"Best hiking tracks": markerCluster2,
		"Best restaurants": markerCluster3,
		"Best sightseeing points": markerCluster4
	};

	L.control.layers(baseLayers, overLays).addTo(mymap);

	//Info Buttons

	var countryButton = L.easyButton('<i class="fas fa-info fa-lg"></i>', function(btn, mymap) {
		$('#myModal').modal('show');
	}, {position: 'bottomright'}).addTo(mymap);
	
	var covidButton = L.easyButton('<i class="fas fa-viruses fa-lg"></i>', function(btn, mymap) {
		$('#myModal2').modal('show');
	}, {position: 'bottomright'}).addTo(mymap);

	var newsButton = L.easyButton('<i class="fas fa-newspaper fa-lg"></i>', function(btn, mymap) {
		$('#myModal3').modal('show');
	}, {position: 'bottomright'}).addTo(mymap);

	var picturesButton = L.easyButton('<i class="fas fa-images fa-lg"></i>', function(btn, mymap) {
		$('#myModal4').modal('show');
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

		var isoCode, lat, lng, border
		
		var inMyCountry = true;		
		
		function getPosition(position) {
			
			lat = position.coords.latitude
			lng = position.coords.longitude
			var accuracy = position.coords.accuracy

			let coords = [lat, lng];

			//geolocation out of lat/lng: get ISO code out API and use it highlight location

			var localTime, localTemperature, localWeather, localHumidity, localWeatherIcon

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
												localWeatherIcon = "https://openweathermap.org/img/wn/" + result['data2'][0]['icon'] + "@2x.png";

												// popup marker

												marker = L.marker(coords).addTo(mymap).bindPopup(

													"<div class='popuptitle'><h5 align='center'>You are here!</h5><h6>" + suburb + " (" + cityName + ")</h6></div><hr/><table><tr><td>"
													+ localTime +"</td><td><img src="
													+ localWeatherIcon + " ></td><td>"
													+ localTemperature + "°C</td></tr></table><div class='popupbottom'"
													+ localWeather + ", " + localHumidity + "% humidity <br/>"  
													+ "<a href =https://en.wikipedia.org/wiki/" + tidiedLocation + " target='_blank'><i class='fab fa-wikipedia-w fa-lg'></i></a></div>"

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

									localTime = Date.parse(result['data'].replace(" ", "T")).toString('dddd, MMMM dd, yyyy h:mm:ss tt');

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

		function getWeatherForecast( lat, lng )
		{
			
			var weatherForecast = new Array();
			
			$.ajax({
				url: "php/weatherForecast.php",
				type: 'POST',
				dataType: "json",
				data: {
					lat: lat,
					lng: lng,
				},   
				success: function(result) {

					//console.log(result);

					if (result.status.name == "ok") {
						
						
						var lastEntry = 0;
						
						for( var i = 1; i < 6; i++ )
						{
														
							if(i == 5)
							{
								lastEntry = 1;
							}
							
							var day = []
							
							var getDayPosition = ( i * 8 ) - lastEntry;
							
							day["day"] = i;
							day["temp_min"] = result['data'][getDayPosition].main.temp_min;
							day["temp_max"] = result['data'][getDayPosition].main.temp_max;
							day["description"] = result['data'][getDayPosition]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][getDayPosition]['weather'][0]['description'].slice(1);
							day["icon"] = "https://openweathermap.org/img/wn/" + result['data'][getDayPosition]['weather'][0]['icon'] + "@2x.png";
										
							weatherForecast[i-1] = day;
							
						}
								
					}

				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
				}

			});
			
			//var data = { "weatherForecast" : weatherForecast }; 
			
			return weatherForecast;
			
		}



		// Borders

		$('#selectCountry').change( function() {
			
			if(inMyCountry)
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
							
							if (mymap.hasLayer(overLays)) {
								mymap.removeLayer(overLays);
							}

							//console.log(overLays);

							if (mymap.hasLayer(markerCluster1)) {
								mymap.removeLayer(markerCluster1);
							}

                            if (mymap.hasLayer(markerCluster2)) {
								mymap.removeLayer(markerCluster2);
							}

							if (mymap.hasLayer(markerCluster3)) {
								mymap.removeLayer(markerCluster3);
							}

							if (mymap.hasLayer(markerCluster4)) {
								mymap.removeLayer(markerCluster4);
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

							// modals content

							$('.countryFlag').html("<img src='https://www.countryflags.io/" + isoCode + "/flat/64.png' />");


                            $.ajax({
								url: "php/restCountries.php",
								type: 'POST',
								dataType: "json",
								data: {"isoCode": isoCode}, 
								success: function(result) {

                                    //console.log(result);

                                    if (result.status.name == "ok") {

										$('#tld').html(result['data1']);
										$('#callingCode').html("+" + result['data2']);
                                        $('#population').html(result['data3'].toLocaleString("en"));
										$('#area').html(result['data4'].toLocaleString("en"));
										$('#gini').html(result['data5']);
										$('#currency').html(result['data6'][0]['name'] + " (" + result['data6'][0]['symbol'] + ")");
										$('#language').html(result['data7'][0]['name']);

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

										$('.countryName').html(result.data1.official);
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

																$('#countryTime').html(Date.parse(result['data'].replace(" ", "T")).toString('dddd, MMMM dd, yyyy h:mm:ss tt'));

																var year = result['data'].slice(0,4);
																var month = result['data'].slice(5,7);
																var day = result['data'].slice(8,10);

																//National holiday

																$.ajax({
																	url: "php/holidayApi.php",
																	type: 'POST',
																	dataType: "json",
																	data: {
																		"isoCode": isoCode,
																		"year": year,
																		"month": month,
																		"day": day}, 
																	success: function(result) {
									
																		console.log(result);
									
																		if (result.status.name == "ok") {
									
																			$('#holiday').html(result['data1'] + " (" + result['data2'] + ")");

																		} else {

																			$('#holiday').html("No");

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

													//markerCluster1 = L.markerClusterGroup();

													for (let i = 0; i < cityPoints.length; i++) {

														var blackMarker = L.ExtraMarkers.icon({
															icon: 'fa-city',
															markerColor: 'blue-dark',
															shape: 'square',
															prefix: 'fa',
														});

														var tidiedCity = cityPoints[i].name.replace(/ /g,"_");

														let lat = cityPoints[i].coordinates.latitude;
														let lng = cityPoints[i].coordinates.longitude;
														
														let weatherForecast = [];
														
														weatherForecast[tidiedCity] = getWeatherForecast( lat, lng );
														
														//console.log( weatherForecast );
														
														//console.log( weatherForecast[tidiedCity][0] );
														
														//array1.forEach(element => console.log(element));
														
														//console.log(  weatherForecast["city"][0] );
														
														for( var w = 0; w < weatherForecast.length; w++)
														{
															
															//console.log( );

														}											
														
														
														let m = L.marker([lat, lng], {icon: blackMarker}).bindPopup(
															"<h6 align='center'>" + cityPoints[i].name + "</h6><br/><img src='" + result['data'][i]['images'][0].sizes.medium.url + "' class='cityImage'><br/>" + cityPoints[i].snippet + "<br/>" 
															+ "<a href =https://en.wikipedia.org/wiki/" + tidiedCity + " target='_blank'><i class='fab fa-wikipedia-w fa-lg'></a>"
															
															+ "<table><tr><td>" +
															
															//+ weatherForeCastOutput + 
															
															+ "</td></tr></table>"
															
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
											url: "php/hikingCluster.php",
											type: 'POST',
											dataType: "json",
											data: {"tidiedCountry": tidiedCountry},
											success: function(result) {

												//console.log(result);  

												if (result.status.name == "ok") {

													var hikingPoints = result['data'];

													//markerCluster2 = L.markerClusterGroup();

													for (let i = 0; i < hikingPoints.length; i++) {

														var greenMarker = L.ExtraMarkers.icon({
															icon: 'fa-hiking',
															markerColor: 'green-dark',
															prefix: 'fa',
														});

														var tidiedHiking = hikingPoints[i].name.replace(/ /g,"_");

														let lat = hikingPoints[i].coordinates.latitude;
														let lng = hikingPoints[i].coordinates.longitude;


														let m = L.marker([lat, lng], {icon: greenMarker}).bindPopup(
															"<h6 align='center'>" + hikingPoints[i].name + "</h6><br/><img src='" + result['data'][i]['images'][0].sizes.medium.url + "' class='hikingImage'><br/>" + hikingPoints[i].snippet + "<br/>"
															+ "<a href =https://en.wikipedia.org/wiki/" + tidiedHiking + " target='_blank'><i class='fab fa-wikipedia-w fa-lg'></a>"
															/*
															+ "<table><tr><td>" +
															+ day1WeatherIcon + day1Forecast + "</td><td>"
															+ day2WeatherIcon + day2Forecast + "</td><td>"
															+ day3WeatherIcon + day3Forecast + "</td><td>"
															+ day4WeatherIcon + day4Forecast + "</td><td>"
															+ day5WeatherIcon + day5Forecast + "</td></tr></table>"
															*/
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


										$.ajax({
											url: "php/cuisineCluster.php",
											type: 'POST',
											dataType: "json",
											data: {"tidiedCountry": tidiedCountry},
											success: function(result) {

												//console.log(result);  

												if (result.status.name == "ok") {

													var cuisinePoints = result['data'];

													//markerCluster3 = L.markerClusterGroup();

													for (let i = 0; i < cuisinePoints.length; i++) {

														var pinkMarker = L.ExtraMarkers.icon({
															icon: 'fa-utensils',
															markerColor: 'pink',
															shape: 'penta',
															prefix: 'fa',
														});

														var tidiedCuisine = cuisinePoints[i].name.replace(/ /g,"_");

														let lat = cuisinePoints[i].coordinates.latitude;
														let lng = cuisinePoints[i].coordinates.longitude;

														let m = L.marker([lat, lng], {icon: pinkMarker}).bindPopup(
															"<h6 align='center'>" + cuisinePoints[i].name + "</h6><br/><img src='" + result['data'][i]['images'][0].sizes.medium.url + "' class='cuisineImage'><br/>" + cuisinePoints[i].snippet + "<br/>"
															+ "<a href =https://en.wikipedia.org/wiki/" + tidiedCuisine + " target='_blank'><i class='fab fa-wikipedia-w fa-lg'></a>"
															);

														markerCluster3.addLayer(m);
													}

													mymap.addLayer(markerCluster3);

												}
											},
											error: function(jqXHR, textStatus, errorThrown) {
												console.log(jqXHR);
											}
										});

										$.ajax({
											url: "php/sightCluster.php",
											type: 'POST',
											dataType: "json",
											data: {"tidiedCountry": tidiedCountry},
											success: function(result) {

												//console.log(result);  

												if (result.status.name == "ok") {

													var sightPoints = result['data'];

													//markerCluster4 = L.markerClusterGroup();

													for (let i = 0; i < sightPoints.length; i++) {

														var yellowMarker = L.ExtraMarkers.icon({
															icon: 'fa-eye',
															markerColor: 'yellow',
															prefix: 'fa',
														});

														var tidiedSight = sightPoints[i].name.replace(/ /g,"_");

														let lat = sightPoints[i].coordinates.latitude;
														let lng = sightPoints[i].coordinates.longitude;

														let m = L.marker([lat, lng], {icon: yellowMarker}).bindPopup(
															"<h6 align='center'>" + sightPoints[i].name + "</h6><br/><img src='" + result['data'][i]['images'][0].sizes.medium.url + "' class='sightImage'><br/>" + sightPoints[i].snippet + "<br/>"
															+ "<a href =https://en.wikipedia.org/wiki/" + tidiedSight + " target='_blank'><i class='fab fa-wikipedia-w fa-lg'></a>"
															/*
															+ "<table><tr><td>" +
															+ day1WeatherIcon + day1Forecast + "</td><td>"
															+ day2WeatherIcon + day2Forecast + "</td><td>"
															+ day3WeatherIcon + day3Forecast + "</td><td>"
															+ day4WeatherIcon + day4Forecast + "</td><td>"
															+ day5WeatherIcon + day5Forecast + "</td></tr></table>"
															*/
														);

														markerCluster4.addLayer(m);
													}

													mymap.addLayer(markerCluster4);

												}
											},
											error: function(jqXHR, textStatus, errorThrown) {
												console.log(jqXHR);
											}
										});


										//Images modal content

										$.ajax({
											url: "php/countryImage.php",
											type: 'POST',
											dataType: "json",
											data: {"tidiedCountry": tidiedCountry}, 
											success: function(result) {
			
												//console.log(result);
												
												if (result.status.name == "ok") {

													photo1 = result['data'][0].sizes.medium.url;
													photo2 = result['data'][1].sizes.medium.url;
													photo3 = result['data'][2].sizes.medium.url;
													photo4 = result['data'][3].sizes.medium.url;

													$('.d-block w-100 1I').html('<img src="' + photo1 + '" >');
													$('.d-block w-100 2I').html('<img src="' + photo2 + '" >');
													$('.d-block w-100 3I').html('<img src="' + photo3 + '" >');
			
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

							//Covid modal content

                            $.ajax({
								url: "php/covidApi.php",
								type: 'POST',
								dataType: "json",
								data: {"isoCode": isoCode}, 
								success: function(result) {

                                    console.log(result);

                                    if (result.status.name == "ok") {
										

                                        $('#confirmed').html(result['data'].latest_data.confirmed.toLocaleString("en"));
										$('#deaths').html(result['data'].latest_data.deaths.toLocaleString("en"));
										$('#recovered').html(result['data'].latest_data.recovered.toLocaleString("en"));
										$('#critical').html(result['data'].latest_data.critical.toLocaleString("en"));
										$('#deathrate').html(result['data'].latest_data.calculated.death_rate.toLocaleString("en"));
										$('#recoveryrate').html(result['data'].latest_data.calculated.recovery_rate.toLocaleString("en"));
										$('#casespermillion').html(result['data'].latest_data.calculated.cases_per_million_population.toLocaleString("en"));

                                    }

                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    console.log(jqXHR);
                                }
                            });

							//News modal content

							$.ajax({
								url: "php/newsApi.php",
								type: 'POST',
								dataType: "json",
								data: {"isoCode": isoCode}, 
								success: function(result) {

                                    //console.log(result);

                                    if (result.status.name == "ok") {
										
										//News 1

										$('#title1N').html('<a href ="' + result['data'][0].url + '" target="_blank">' + result['data'][0].title + '</a>');
										$('#description1N').html(result['data'][0].description);
										$('.d-block w-100 1N').html('<img src="' + result['data'][0].urlToImage + '" >');

										//News 2

										$('#title2N').html('<a href ="' + result['data'][1].url + '" target="_blank">' + result['data'][1].title + '</a>');
										$('#description2N').html(result['data'][1].description);
										$('.d-block w-100 2N').html('<img src="' + result['data'][1].urlToImage + '" >');

										//News 3

										$('#title3N').html('<a href ="' + result['data'][2].url + '" target="_blank">' + result['data'][2].title + '</a>');
										$('#description3N').html(result['data'][2].description);
										$('.d-block w-100 3N').html('<img src="' + result['data'][2].urlToImage + '" >');

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

