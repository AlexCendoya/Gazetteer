
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

	
	var marker, markerCluster1, markerCluster2, markerCluster3, markerCluster4

	//Layer control
	console.log(marker);
	console.log(markerCluster1);
	console.log(markerCluster2);
	
	var baseLayers = {
		"Satellite": Esri_WorldImagery,
		"Nocturnal satellite": NASAGIBS_ViirsEarthAtNight2012,
		"Geophysical": OpenTopoMap,
		"Streets": OpenStreetMap_Mapnik
	};

	/*

	var overLays = {
		"Your location": marker
		"Cities": markerCluster1,
		"Points of interest": markerCluster2
	};
			*/

	//overLays to be included
	L.control.layers(baseLayers, null).addTo(mymap);

	//Info Buttons

	var countryButton = L.easyButton('<i class="fas fa-info fa-lg"></i>', function(btn, mymap) {
		$('#myModal').modal('show');
	}, {position: 'bottomright'}).addTo(mymap);
	
	var covidButton = L.easyButton('<i class="fas fa-viruses fa-lg"></i>', function(btn, mymap) {
		$('#myModal2').modal('show');
	}, {position: 'bottomright'}).addTo(mymap);

	var weatherButton = L.easyButton('<i class="fas fa-cloud-sun fa-lg"></i>', function(btn, mymap) {
		$('#myModal3').modal('show');
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

													"<h5 align='center'>You are here!</h5><h6>" + suburb + " (" + cityName + ")</h6><hr/><table><tr><td><img src="
													+ localWeatherIcon + " ></td><td>"
													+ localTemperature + "°C</td></tr></table>"
													+ localWeather + ", " + localHumidity + "% humidity <br/>" 
													+ localTime + "<br/>" 
													+ "<a href =https://en.wikipedia.org/wiki/" + tidiedLocation + " target='_blank'><i class='fab fa-wikipedia-w fa-lg'></i></a>"

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

									//forecast day 1

									let day1MinTemp = result['data'][8].main.temp_min;
									let day1MaxTemp = result['data'][8].main.temp_max;
									let day1Forecast = result['data'][8]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][8]['weather'][0]['description'].slice(1);
									let day1WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][8]['weather'][0]['icon'] + "@2x.png";

									//console.log(day1MinTemp);
									//console.log(day1MaxTemp);
									//console.log(day1Forecast);
									//console.log(day1WeatherIcon);

									//forecast day 2

									let day2MinTemp = result['data'][16].main.temp_min;
									let day2MaxTemp = result['data'][16].main.temp_max;
									let day2Forecast = result['data'][16]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][16]['weather'][0]['description'].slice(1);
									let day2WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][16]['weather'][0]['icon'] + "@2x.png";

									//console.log(day2MinTemp);
									//console.log(day2MaxTemp);
									//console.log(day2Forecast);
									//console.log(day2WeatherIcon);

									//forecast day 3

									let day3MinTemp = result['data'][24].main.temp_min;
									let day3MaxTemp = result['data'][24].main.temp_max;
									let day3Forecast = result['data'][24]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][24]['weather'][0]['description'].slice(1);
									let day3WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][24]['weather'][0]['icon'] + "@2x.png";
									
									//console.log(day3MinTemp);
									//console.log(day3MaxTemp);
									//console.log(day3Forecast);
									//console.log(day3WeatherIcon);

									//forecast day 4

									let day4MinTemp = result['data'][32].main.temp_min;
									let day4MaxTemp = result['data'][32].main.temp_max;
									let day4Forecast = result['data'][32]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][32]['weather'][0]['description'].slice(1);
									let day4WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][32]['weather'][0]['icon'] + "@2x.png";

									//console.log(day4MinTemp);
									//console.log(day4MaxTemp);
									//console.log(day4Forecast);
									//console.log(day4WeatherIcon);

									//forecast day 5

									let day5MinTemp = result['data'][39].main.temp_min;
									let day5MaxTemp = result['data'][39].main.temp_max;
									let day5Forecast = result['data'][39]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][39]['weather'][0]['description'].slice(1);
									let day5WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][39]['weather'][0]['icon'] + "@2x.png";

									//console.log(day5MinTemp);
									//console.log(day5MaxTemp);
									//console.log(day5Forecast);
									//console.log(day5WeatherIcon);
									 
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

							$('.countryFlag').append("<img src='https://www.countryflags.io/" + isoCode + "/flat/64.png' />");


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

										$('.countryName').append(result.data1.official);
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

													markerCluster1 = L.markerClusterGroup();

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

														let day1MinTemp, day1MaxTemp, day1Forecast, day1WeatherIcon, day2MinTemp, day2MaxTemp, day2Forecast, day2WeatherIcon,
														day3MinTemp, day3MaxTemp, day3Forecast, day3WeatherIcon, day4MinTemp, day4MaxTemp, day4Forecast, day4WeatherIcon,
														day5MinTemp, day5MaxTemp, day5Forecast, day5WeatherIcon

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
								
																	//forecast day 1 for cities
								
																	day1MinTemp = result['data'][8].main.temp_min;
																	day1MaxTemp = result['data'][8].main.temp_max;
																	day1Forecast = result['data'][8]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][8]['weather'][0]['description'].slice(1);
																	day1WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][8]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day1MinTemp);
																	//console.log(day1MaxTemp);
																	//console.log(day1Forecast);
																	//console.log(day1WeatherIcon);
								
																	//forecast day 2 for cities
								
																	day2MinTemp = result['data'][16].main.temp_min;
																	day2MaxTemp = result['data'][16].main.temp_max;
																	day2Forecast = result['data'][16]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][16]['weather'][0]['description'].slice(1);
																	day2WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][16]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day2MinTemp);
																	//console.log(day2MaxTemp);
																	//console.log(day2Forecast);
																	//console.log(day2WeatherIcon);
								
																	//forecast day 3 for cities
								
																	day3MinTemp = result['data'][24].main.temp_min;
																	day3MaxTemp = result['data'][24].main.temp_max;
																	day3Forecast = result['data'][24]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][24]['weather'][0]['description'].slice(1);
																	day3WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][24]['weather'][0]['icon'] + "@2x.png";
																	
																	//console.log(day3MinTemp);
																	//console.log(day3MaxTemp);
																	//console.log(day3Forecast);
																	//console.log(day3WeatherIcon);
								
																	//forecast day 4 for cities
								
																	day4MinTemp = result['data'][32].main.temp_min;
																	day4MaxTemp = result['data'][32].main.temp_max;
																	day4Forecast = result['data'][32]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][32]['weather'][0]['description'].slice(1);
																	day4WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][32]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day4MinTemp);
																	//console.log(day4MaxTemp);
																	//console.log(day4Forecast);
																	//console.log(day4WeatherIcon);
								
																	//forecast day 5 for cities
								
																	day5MinTemp = result['data'][39].main.temp_min;
																	day5MaxTemp = result['data'][39].main.temp_max;
																	day5Forecast = result['data'][39]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][39]['weather'][0]['description'].slice(1);
																	day5WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][39]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day5MinTemp);
																	//console.log(day5MaxTemp);
																	//console.log(day5Forecast);
																	//console.log(day5WeatherIcon);
																	 
																}
								
															},
															error: function(jqXHR, textStatus, errorThrown) {
																console.log(jqXHR);
															}
								
								
														});

														let m = L.marker([lat, lng], {icon: blackMarker}).bindPopup(
															"<h6 align='center'>" + cityPoints[i].name + "</h6><br/><img src='" + result['data'][i]['images'][0].sizes.medium.url + "' class='cityImage'><br/>" + cityPoints[i].snippet + "<br/>" 
															+ "<a href =https://en.wikipedia.org/wiki/" + tidiedCity + " target='_blank'><i class='fab fa-wikipedia-w fa-lg'></a><table><tr><td>"
															+ day1WeatherIcon + day1Forecast + "</td><td>"
															+ day2WeatherIcon + day2Forecast + "</td><td>"
															+ day3WeatherIcon + day3Forecast + "</td><td>"
															+ day4WeatherIcon + day4Forecast + "</td><td>"
															+ day5WeatherIcon + day5Forecast + "</td></tr></table>"
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

													markerCluster2 = L.markerClusterGroup();

													for (let i = 0; i < hikingPoints.length; i++) {

														var greenMarker = L.ExtraMarkers.icon({
															icon: 'fa-hiking',
															markerColor: 'green-dark',
															prefix: 'fa',
														});

														var tidiedHiking = hikingPoints[i].name.replace(/ /g,"_");

														let lat = hikingPoints[i].coordinates.latitude;
														let lng = hikingPoints[i].coordinates.longitude;

														let day1MinTemp, day1MaxTemp, day1Forecast, day1WeatherIcon, day2MinTemp, day2MaxTemp, day2Forecast, day2WeatherIcon,
														day3MinTemp, day3MaxTemp, day3Forecast, day3WeatherIcon, day4MinTemp, day4MaxTemp, day4Forecast, day4WeatherIcon,
														day5MinTemp, day5MaxTemp, day5Forecast, day5WeatherIcon

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
								
																	//forecast day 1 for hiking
								
																	day1MinTemp = result['data'][8].main.temp_min;
																	day1MaxTemp = result['data'][8].main.temp_max;
																	day1Forecast = result['data'][8]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][8]['weather'][0]['description'].slice(1);
																	day1WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][8]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day1MinTemp);
																	//console.log(day1MaxTemp);
																	//console.log(day1Forecast);
																	//console.log(day1WeatherIcon);
								
																	//forecast day 2 for hiking
								
																	day2MinTemp = result['data'][16].main.temp_min;
																	day2MaxTemp = result['data'][16].main.temp_max;
																	day2Forecast = result['data'][16]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][16]['weather'][0]['description'].slice(1);
																	day2WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][16]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day2MinTemp);
																	//console.log(day2MaxTemp);
																	//console.log(day2Forecast);
																	//console.log(day2WeatherIcon);
								
																	//forecast day 3 for hiking
								
																	day3MinTemp = result['data'][24].main.temp_min;
																	day3MaxTemp = result['data'][24].main.temp_max;
																	day3Forecast = result['data'][24]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][24]['weather'][0]['description'].slice(1);
																	day3WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][24]['weather'][0]['icon'] + "@2x.png";
																	
																	//console.log(day3MinTemp);
																	//console.log(day3MaxTemp);
																	//console.log(day3Forecast);
																	//console.log(day3WeatherIcon);
								
																	//forecast day 4 for hiking
								
																	day4MinTemp = result['data'][32].main.temp_min;
																	day4MaxTemp = result['data'][32].main.temp_max;
																	day4Forecast = result['data'][32]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][32]['weather'][0]['description'].slice(1);
																	day4WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][32]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day4MinTemp);
																	//console.log(day4MaxTemp);
																	//console.log(day4Forecast);
																	//console.log(day4WeatherIcon);
								
																	//forecast day 5 for hiking
								
																	day5MinTemp = result['data'][39].main.temp_min;
																	day5MaxTemp = result['data'][39].main.temp_max;
																	day5Forecast = result['data'][39]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][39]['weather'][0]['description'].slice(1);
																	day5WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][39]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day5MinTemp);
																	//console.log(day5MaxTemp);
																	//console.log(day5Forecast);
																	//console.log(day5WeatherIcon);
																	 
																}
								
															},
															error: function(jqXHR, textStatus, errorThrown) {
																console.log(jqXHR);
															}
								
								
														});



														let m = L.marker([lat, lng], {icon: greenMarker}).bindPopup(
															"<h6 align='center'>" + hikingPoints[i].name + "</h6><br/><img src='" + result['data'][i]['images'][0].sizes.medium.url + "' class='hikingImage'><br/>" + hikingPoints[i].snippet + "<br/>"
															+ "<a href =https://en.wikipedia.org/wiki/" + tidiedHiking + " target='_blank'><i class='fab fa-wikipedia-w fa-lg'></a><table><tr><td>"
															+ day1WeatherIcon + day1Forecast + "</td><td>"
															+ day2WeatherIcon + day2Forecast + "</td><td>"
															+ day3WeatherIcon + day3Forecast + "</td><td>"
															+ day4WeatherIcon + day4Forecast + "</td><td>"
															+ day5WeatherIcon + day5Forecast + "</td></tr></table>"
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

													markerCluster3 = L.markerClusterGroup();

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

													markerCluster4 = L.markerClusterGroup();

													for (let i = 0; i < sightPoints.length; i++) {

														var yellowMarker = L.ExtraMarkers.icon({
															icon: 'fa-eye',
															markerColor: 'yellow',
															prefix: 'fa',
														});

														var tidiedSight = sightPoints[i].name.replace(/ /g,"_");

														let lat = sightPoints[i].coordinates.latitude;
														let lng = sightPoints[i].coordinates.longitude;

														let day1MinTemp, day1MaxTemp, day1Forecast, day1WeatherIcon, day2MinTemp, day2MaxTemp, day2Forecast, day2WeatherIcon,
														day3MinTemp, day3MaxTemp, day3Forecast, day3WeatherIcon, day4MinTemp, day4MaxTemp, day4Forecast, day4WeatherIcon,
														day5MinTemp, day5MaxTemp, day5Forecast, day5WeatherIcon

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
								
																	//forecast day 1 for sightseeing
								
																	day1MinTemp = result['data'][8].main.temp_min;
																	day1MaxTemp = result['data'][8].main.temp_max;
																	day1Forecast = result['data'][8]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][8]['weather'][0]['description'].slice(1);
																	day1WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][8]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day1MinTemp);
																	//console.log(day1MaxTemp);
																	//console.log(day1Forecast);
																	//console.log(day1WeatherIcon);
								
																	//forecast day 2 for sightseeing
								
																	day2MinTemp = result['data'][16].main.temp_min;
																	day2MaxTemp = result['data'][16].main.temp_max;
																	day2Forecast = result['data'][16]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][16]['weather'][0]['description'].slice(1);
																	day2WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][16]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day2MinTemp);
																	//console.log(day2MaxTemp);
																	//console.log(day2Forecast);
																	//console.log(day2WeatherIcon);
								
																	//forecast day 3 fro sightseeing
								
																	day3MinTemp = result['data'][24].main.temp_min;
																	day3MaxTemp = result['data'][24].main.temp_max;
																	day3Forecast = result['data'][24]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][24]['weather'][0]['description'].slice(1);
																	day3WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][24]['weather'][0]['icon'] + "@2x.png";
																	
																	//console.log(day3MinTemp);
																	//console.log(day3MaxTemp);
																	//console.log(day3Forecast);
																	//console.log(day3WeatherIcon);
								
																	//forecast day 4 for sightseeing
								
																	day4MinTemp = result['data'][32].main.temp_min;
																	day4MaxTemp = result['data'][32].main.temp_max;
																	day4Forecast = result['data'][32]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][32]['weather'][0]['description'].slice(1);
																	day4WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][32]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day4MinTemp);
																	//console.log(day4MaxTemp);
																	//console.log(day4Forecast);
																	//console.log(day4WeatherIcon);
								
																	//forecast day 5 for sightseeing
								
																	day5MinTemp = result['data'][39].main.temp_min;
																	day5MaxTemp = result['data'][39].main.temp_max;
																	day5Forecast = result['data'][39]['weather'][0]['description'].charAt(0).toUpperCase() + result['data'][39]['weather'][0]['description'].slice(1);
																	day5WeatherIcon = "https://openweathermap.org/img/wn/" + result['data'][39]['weather'][0]['icon'] + "@2x.png";
								
																	//console.log(day5MinTemp);
																	//console.log(day5MaxTemp);
																	//console.log(day5Forecast);
																	//console.log(day5WeatherIcon);
																	 
																}
								
															},
															error: function(jqXHR, textStatus, errorThrown) {
																console.log(jqXHR);
															}
								
								
														});



														let m = L.marker([lat, lng], {icon: yellowMarker}).bindPopup(
															"<h6 align='center'>" + sightPoints[i].name + "</h6><br/><img src='" + result['data'][i]['images'][0].sizes.medium.url + "' class='sightImage'><br/>" + sightPoints[i].snippet + "<br/>"
															+ "<a href =https://en.wikipedia.org/wiki/" + tidiedSight + " target='_blank'><i class='fab fa-wikipedia-w fa-lg'></a><table><tr><td>"
															+ day1WeatherIcon + day1Forecast + "</td><td>"
															+ day2WeatherIcon + day2Forecast + "</td><td>"
															+ day3WeatherIcon + day3Forecast + "</td><td>"
															+ day4WeatherIcon + day4Forecast + "</td><td>"
															+ day5WeatherIcon + day5Forecast + "</td></tr></table>"
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

                                    //console.log(result);

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

										console.log(result.data.source);
										console.log(result.data.author);
										console.log(result.data.title);
										console.log(result.data.description);
										console.log(result.data.url);
										console.log(result.data.urlToImage);

										//News 2

										//News 3

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

