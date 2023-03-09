"use strict";
// seuraavat estävät jshintin narinat leafletin objekteista
/* globals L */

// Alustetaan data, joka on jokaisella sivun latauskerralla erilainen.
window.addEventListener("load", function(e) {
	fetch('https://appro.mit.jyu.fi/cgi-bin/tiea2120/randomize_json.cgi')
	    .then(response => response.json())
	    .then(function(data) {
            console.log(data);
            // tänne oma koodi
			let outside;
			
			
			// Luodaan kartta
			let mymap = new L.map('map', {
				crs: L.TileLayer.MML.get3067Proj()
			   }).setView([62.118587, 25.654917], 7.5);
		   L.tileLayer.mml_wmts({ layer: "maastokartta", key : "8c118a1f-99c2-4e8a-8849-54dc255f3205" }).addTo(mymap);


				let rastit = data.rastit;
				let palloArr = [];
				let polylinesArr = [];
					
					// Käydään kaikki rastit läpi ja etsitään
					//niiden lat ja lon arvot joiden perusteella
					// lisätään karttaan oikeisiin sijainteihin pallot
					for (let rasti in rastit) {
						
						let pallolat = rastit[rasti].lat;
						let pallolon = rastit[rasti].lon;
						let circle = L.circle(
							[pallolat, pallolon], {
								color: "red",
								fillColor: "#fo3",
								fillOpacity: 0.3,
								radius: 150,
								class: "pallot",
								interactive: true
							}
						).addTo(mymap);
						circle.bindTooltip(rastit[rasti].koodi, {permanent: true, width: "1px", className: "pallolabel", direction: "center"}); 
						palloArr.push(circle);
						
						
						
					}
				
			
				
				
			// Rastiobjekti 
			
				 
		   // ---------------------------------------------------------------
		   // ---------------------------------------------------------------
		   // ---------------------------------------------------------------
			let marker;
		   palloArr.forEach(pallo => {
			pallo.addEventListener("click", function(e) {
				if (marker == undefined) {
				
				console.log(e.target);
				e.target.setStyle({fillColor: "red"});
				e.target.setStyle({fillOpacity: "1.0"});
				console.log(e.target._latlng.lat);
				let lat = e.target._latlng.lat;
				let lon = e.target._latlng.lng;
				marker = L.marker([lat, lon], {
					class: "markkerit"
				}).addTo(mymap);
				marker.className = "markerit";
				} else {
					mymap.removeLayer(marker);
				
				console.log(e.target);
				e.target.setStyle({fillColor: "red"});
				e.target.setStyle({fillOpacity: "1.0"});
				console.log(e.target._latlng.lat);
				let lat = e.target._latlng.lat;
				let lon = e.target._latlng.lng;
				marker = L.marker([lat, lon], {
					class: "markkerit",
					draggable: true

				}).addTo(mymap);
				marker.className = "markerit";
				
				marker.addEventListener("dragstart", function(e) {
					console.log("Drag start");
					console.log(e.target);
				});
				marker.addEventListener("dragover", function(e) {
					console.log("Drag over");
				});
				marker.addEventListener("dragend", function(e) {
					console.log("Drag end");
					console.log(e.target.getLatLng());
					console.log(pallo._latlng);
					let position = e.target.getLatLng();
					pallo.setLatLng(new L.LatLng(position.lat, position.lng));
					console.log(pallo._tooltip._content);
					let pallonKoodi = pallo._tooltip._content;
					console.log(data.rastit);

					for (let rasti in data.rastit) {
						if (rastit[rasti].koodi == pallonKoodi) {
							rastit[rasti].lat = position.lat;
							rastit[rasti].lon = position.lng;
							console.log(rastit[rasti]);
							console.log(data.joukkueet);
							console.log(data.rastit);
						}
					}

					tsekkaaKartalla();

					
				});

				}
				
				console.log(document.getElementsByClassName("markerit"));
			});
		
		   });

		   function tsekkaaKartalla() {
			let kartallaalue = document.getElementById("kartalla");
			for ( let pol of polylinesArr) {
				console.log(pol);
				mymap.removeLayer(pol);
			}

			for (let vedetyt of kartallaalue.children) {
				console.log(vedetyt);
			
				piirraPolylineja(vedetyt);
			}

		   }
		   
		   //Funktio joka generoi randomin ideen
		   function randomId(p) {
			   return Math.random().toString(36).replace('0.',p || '');
		   }

		  


			function getDistanceFromLatLonInKm(koor1, koor2) {
			let lat1 = koor1[0];
			let lon1 = koor1[1];
			let lat2 = koor2[0];
			let lon2 = koor2[1];
			 let R = 6371; // Radius of the earth in km
			 let dLat = deg2rad(lat2-lat1);  // deg2rad below
			 let dLon = deg2rad(lon2-lon1); 
			 let a = 
			   Math.sin(dLat/2) * Math.sin(dLat/2) +
			   Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			   Math.sin(dLon/2) * Math.sin(dLon/2)
			   ; 
			 let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			 let d = R * c; // Matka kilometreinä
			 return d;
		   }
		   
		   function deg2rad(deg) {
			 return deg * (Math.PI/180);
		   }
 
		   joukkuelista();
			
		   // Joukkuelistaus 
		   function joukkuelista () {
			let rastitObj = {};
			for ( let rasti in rastit) {
				let rLat = rastit[rasti].lat;
				let rLon = rastit[rasti].lon;
				let koordinaat = [];
				koordinaat.push(rLat);
				koordinaat.push(rLon);
					rastitObj[rasti] = koordinaat;
			}
			let divi = document.getElementById("joukkueet");
			let ul = document.createElement("ul");
			ul.setAttribute("id", "jul");
			divi.appendChild(ul);
			let joukkueet = data.joukkueet;
			
			for (let joukkue of joukkueet) {
				let arra = [];
				let joukkueNiminode;
				let rastileimaukset = joukkue.rastileimaukset;
					for (let leimaus of rastileimaukset) {
						
						arra.push(rastitObj[leimaus.rasti]);
						} 
				let koordinaatit = arra;
			
				let matka=0;
				if (koordinaatit.length === 0) {
					matka = 0;

				} else if (koordinaatit.length > 0) {

					for (let k of koordinaatit) {
						if ( k === undefined) {
							
							koordinaatit.splice(k);
						}						
					}
						for ( let i = 0; i < koordinaatit.length-1; i++) {
							matka += getDistanceFromLatLonInKm(koordinaatit[i], koordinaatit[i+1]);
							matka = Math.round(matka * 10) / 10;
						}
						

				}
				 
							
				let li = document.createElement("li");
				let joukkuenimi = document.createTextNode(joukkue.nimi + " ("+ matka + " km)");
				li.style.backgroundColor = rainbow(joukkueet.length, joukkueet.indexOf(joukkue));
				li.classList.add("joukkueet");

				li.setAttribute("draggable","true");
				li.setAttribute("id", randomId('j_'));
				li.appendChild(joukkuenimi);
				ul.appendChild(li);
				
			}
		   }
		   rastilistaus();

		   


		   // Sarjalistaus 
		   function rastilistaus () {
			let divi2 = document.getElementById("sarjat");
			let ul = document.createElement("ul");
			ul.setAttribute("id", "rul");
			divi2.appendChild(ul);
			let rastit = data.rastit;
			let sortedRastit = [];
			for (let key in data.rastit) {
			sortedRastit.push([key, data.rastit[key].koodi]);
			}
			sortedRastit.sort(function(a,b){
				return a[1].localeCompare(b[1]);
			});
			
			for (let rasti of sortedRastit) {
				let rastinimi = document.createTextNode(rasti[1]);
				let li = document.createElement("li");
				li.style.backgroundColor = rainbow(sortedRastit.length, sortedRastit.indexOf(rasti));
				li.setAttribute("draggable","true");
				li.classList.add("rastit");
				
				li.setAttribute("id",randomId('r_'));
				li.appendChild(rastinimi);
				ul.appendChild(li);
			}
			
			}
			
		   // ---------------------------------------------------------------
		   // ---------------------------------------------------------------
		   // ---------------------------------------------------------------
		   

	

		   let itemit = document.querySelectorAll(".rastit");

		   itemit.forEach((item, index) => {
			
			
			item.addEventListener("dragstart", function(e) {
				item.classList.add("dragging");
				console.log(index);
				e.dataTransfer.setData("text/plain", item.textContent);
				e.dataTransfer.setData("iddata", item.getAttribute("id"));
				e.dataTransfer.setData("indexdata", index);
			});
			item.addEventListener("dragend", () => {
				item.classList.remove("dragging");
			});

		   });

		   let sarjadrop = document.getElementById("rul");
			sarjadrop.addEventListener("dragover", function(e) {
				e.preventDefault();
				let data = e.dataTransfer.getData("iddata");
				
				if (e.dataTransfer.types.includes("iddata")) {
					e.dataTransfer.dropEffect = "move";
				} else {
					e.dataTransfer.dropEffect = "none";
				}
			});

			let dropp = document.getElementById("kartalla");
			dropp.addEventListener("dragover", function(q) {
				q.preventDefault();
				if (q.dataTransfer.types.includes("iddata")) {
					q.dataTransfer.dropEffect = "move";
					
				} else {
					q.dataTransfer.dropEffect = "none";
				}
			});

			sarjadrop.addEventListener("drop", function(e) {
				e.preventDefault();
				let data = e.dataTransfer.getData("iddata");
				let indexdata = e.dataTransfer.getData("indexdata");
				let vedettysarja = document.getElementById(data);
				vedettysarja.style.position = "inherit";
				
				

				if (data &&  data.startsWith("r")) {
					try {
						let siblings = [...sarjadrop.children];
						let nextSibling = siblings.find(sibling => {
							return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2 && e.clientX <= sibling.offsetLeft + sibling.offsetWidth /2;
						});
						console.log(nextSibling);
						console.log(e.clientY);
						console.log((nextSibling.offsetTop + nextSibling.offsetHeight /2));
						
						console.log(nextSibling);

						sarjadrop.insertBefore(document.getElementById(data), nextSibling);
					} catch(error) {
						console.log(data);
					}
				}
			});

			dropp.addEventListener("drop", function(d) {
				d.preventDefault();
				let data = d.dataTransfer.getData("iddata");
				if ( data ) {
					try {
						d.target.appendChild(document.getElementById(data));
						
					}
					catch(error) {
						console.log(data);
					}
				}
			});


		   // ---------------------------------------------------------------
		   // ---------------------------------------------------------------
		   // ---------------------------------------------------------------

		   let joukkueet = data.joukkueet;
	
		   let joukkueitemit = document.querySelectorAll(".joukkueet");
		   joukkueitemit.forEach((item, index) => {

			


			item.addEventListener("dragstart", function(e) {
				// Laitetaan joukkueen nimi yhdeksi siirrettäväksi dataksi jotta
				// ikkunasta ulos tiputtaessa tiputetaan oikea tieto
				e.dataTransfer.setData("text/plain", item.textContent);
				// Laitetaan id siirrettäväksi dataksi "kartalla" alueelle tiputusta varten
				e.dataTransfer.setData("iddata", item.getAttribute("id"));
				e.dataTransfer.setData("indexdata", index);

			});

			
		   });

	
		   let joukkuedrop = document.getElementById("jul");
			joukkuedrop.addEventListener("dragover", function(e) {
				e.preventDefault();
				if (e.dataTransfer.types.includes("iddata")) {
					e.dataTransfer.dropEffect = "move";
				} else {
					e.dataTransfer.dropEffect = "none";
				}
			});

			let drop = document.getElementById("kartalla");
			drop.addEventListener("dragover", function(e) {
				e.preventDefault();
				if (e.dataTransfer.types.includes("iddata")) {
					e.dataTransfer.dropEffect = "move";
				} else {
					e.dataTransfer.dropEffect = "none";
				}
			});

			joukkuedrop.addEventListener("drop", function(e) {
				e.preventDefault();

				
				let data = e.dataTransfer.getData("iddata");
				console.log(data);

				let vedetty = document.getElementById(data);

				
				console.log(vedetty);
				let vedettyid = vedetty.getAttribute("id");
				polylinesArr.forEach(function (polly) {
					if (polly.options.id === vedettyid) {
						mymap.removeLayer(polly);
					}
				});

				vedetty.style.position = "inherit";
				if (data && data.startsWith("j")) {
					try {
						
						let siblings = [...joukkuedrop.children];
						console.log(siblings);
						let nextSibling = siblings.find(sibling => {
							return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
						});
						console.log(nextSibling);
						console.log(e.clientY);
						console.log((siblings[1].offsetTop + siblings[1].offsetHeight / 2));

						joukkuedrop.insertBefore(vedetty, nextSibling);
						
					} catch(error) {
						console.log(data);
					}
				}
			});

			let pituus = joukkueet.length;
			

			drop.addEventListener("drop", function(e) {
				e.preventDefault();

			

						let data = e.dataTransfer.getData("iddata");
						console.log(data);
						let vedetty = document.getElementById(data);
						vedetty.style.position = "absolute";
						vedetty.style.left = e.offsetX + "px";
						vedetty.style.top = e.offsetY + "px";
						console.log(vedetty.textContent);
						piirraPolylineja(vedetty);
				
				if (data) {
					try {
						e.target.appendChild(document.getElementById(data));
					} catch(error) {
						console.log(data);
					}
				}
				
			});

			
			function piirraPolylineja(vedetty) {
				let rastitObj = {};
				for ( let rasti in rastit) {
					let rLat = rastit[rasti].lat;
					let rLon = rastit[rasti].lon;
					let koordinaat = [];
					koordinaat.push(rLat);
					koordinaat.push(rLon);
						rastitObj[rasti] = koordinaat;
				}
				let arr = [];
				for (let joukkue of joukkueet) {
					if (vedetty.textContent.includes(joukkue.nimi)) {
						console.log(joukkue);
						let rastileimaukset = joukkue.rastileimaukset;
								for (let leimaus of rastileimaukset) {
									arr.push(rastitObj[leimaus.rasti]);
								} let koordinaatit = arr;
								console.log(arr);
								for (let k of koordinaatit) {
									if (k == undefined) {
										koordinaatit.splice(koordinaatit.indexOf(k), 1);
									}
								}
								let collor = vedetty.style.backgroundColor;
								let polyline = L.polyline([koordinaatit], 
									{id: vedetty.getAttribute("id"),
									 color: collor}).addTo(mymap);
									 polylinesArr.push(polyline);
									 console.log(polylinesArr);
								console.log(polylinesArr[0]);
								console.log(polylinesArr[0].options.id);
					}	
				}
				
			}

		   // ---------------------------------------------------------------
		   // ---------------------------------------------------------------
		   // ---------------------------------------------------------------

		 
		   function rainbow(numOfSteps, step) {
			// This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
			// Adam Cole, 2011-Sept-14
			// HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
			let r, g, b;
			let h = step / numOfSteps;
			let i = ~~(h * 6);
			let f = h * 6 - i;
			let q = 1 - f;
			switch(i % 6){
				case 0: r = 1; g = f; b = 0; break;
				case 1: r = q; g = 1; b = 0; break;
				case 2: r = 0; g = 1; b = f; break;
				case 3: r = 0; g = q; b = 1; break;
				case 4: r = f; g = 0; b = 1; break;
				case 5: r = 1; g = 0; b = q; break;
			}
			let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
			return (c);
		}


	    });
});


