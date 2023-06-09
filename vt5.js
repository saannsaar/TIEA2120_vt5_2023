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
			let rastiObj = {};
			for (let rasti in rastit) {
				rastiObj[rasti] = rastit[rasti].koodi;
			}
			
				 
		   // ---------------------------------------------------------------
		   // ---------------------------------------------------------------
		   // ---------------------------------------------------------------
			let marker;
		   palloArr.forEach(pallo => {
			pallo.addEventListener("click", function(e) {
				for (let pallo of palloArr) {
					console.log(pallo);
					if (pallo.options.fillColor == "red") {
						pallo.setStyle({fillColor: "#fo3"});
						pallo.setStyle({fillOpacity: "0.3"});
					}
				}
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
					console.log(document.getElementsByClassName("joukkueet"));

					let joukkueLit = document.getElementsByClassName("joukkueet");
					let rastitObj = {};
					for ( let rasti in rastit) {
						let rLat = rastit[rasti].lat;
						let rLon = rastit[rasti].lon;
						let koordinaat = [];
						koordinaat.push(rLat);
						koordinaat.push(rLon);
							rastitObj[rasti] = koordinaat;
					}
					for ( let joukkis of joukkueLit) {
					    for (let j of data.joukkueet) {
							if (joukkis.firstChild.textContent.includes(j.nimi)) {
								joukkis.firstChild.textContent = "";
								let arra = [];
								let rastileimaukset = j.rastileimaukset;
									for (let leimaus of rastileimaukset) {
										arra.push(rastitObj[leimaus.rasti]);
									} 
								let koordinaatit = arra;
								joukkis.firstChild.textContent = j.nimi + " (" + laskeMatka(koordinaatit) + ")";
							}
						}
					}

					
					mymap.removeLayer(marker);
					for (let pallo of palloArr) {
						console.log(pallo);
						if (pallo.options.fillColor == "red") {
							pallo.setStyle({fillColor: "#fo3"});
							pallo.setStyle({fillOpacity: "0.3"});
						}
					}

					
				});

				}
				
				console.log(document.getElementsByClassName("markerit"));
			});
		
		   });

		   function tsekkaaKartalla() {
			console.log("TÄÄLLÄ");
			let kartallaalue = document.getElementById("kartalla");
			for ( let pol of polylinesArr) {
				console.log(pol);
				mymap.removeLayer(pol);
			}

			for (let vedetyt of kartallaalue.children) {
				console.log(vedetyt);
				let vari = vedetyt.style.backgroundColor;
				let nimi = vedetyt.textContent;
				piirraPolylineja(nimi, vari);
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
			let rastiObj = {};
			for (let rasti in rastit) {
				rastiObj[rasti] = rastit[rasti].koodi;
			}
			console.log(rastiObj);
			let divi = document.getElementById("joukkueet");
			let ul = document.createElement("ul");
			ul.setAttribute("id", "jul");
			divi.appendChild(ul);
			let joukkueet = data.joukkueet;
			
			for (let joukkue of joukkueet) {
				let arra = [];
				let joukkueNiminode;
				
			
				
				let li = document.createElement("li");

				let detailsJ = document.createElement("details");
				let summaryJ = document.createElement("summary");
				let ulJ = document.createElement("ul");
				let rastileimaukset = joukkue.rastileimaukset;
				
				
				let jarjestetytRastit = Array.from(rastileimaukset).sort((a,b) => a.aika.localeCompare(b.aika));
					
						jarjestetytRastit.forEach((leimaus, index) => {
							let liJ = document.createElement("li");
							let rastinnimi = document.createTextNode(rastiObj[leimaus.rasti]);
							
							liJ.appendChild(rastinnimi);
							liJ.setAttribute("draggable","true");
							// liJ.setAttribute("name", leimaus);
							liJ.setAttribute("id", randomId('li_'));
							liJ.classList.add("lirastit");
							ulJ.appendChild(liJ);
							arra.push(rastitObj[leimaus.rasti]);
						});
						
				let koordinaatit = arra;
				
				let joukkuenimi = document.createTextNode(joukkue.nimi + " ("+ laskeMatka(koordinaatit) + " km)");
				detailsJ.style.backgroundColor = rainbow(joukkueet.length, joukkueet.indexOf(joukkue));
				detailsJ.classList.add("joukkueet");

				detailsJ.setAttribute("draggable","true");
				detailsJ.setAttribute("id", randomId('j_'));
				summaryJ.appendChild(joukkuenimi);

				detailsJ.appendChild(summaryJ);
				detailsJ.appendChild(ulJ);

				
				ul.appendChild(detailsJ);
				
			}
		   }

		   let liRastit = document.querySelectorAll(".lirastit");
		 
		   liRastit.forEach(li => {
			li.addEventListener("dragstart", function(e){
				li.parentNode.parentNode.removeAttribute("draggable");
				console.log(li.parentNode);
				e.dataTransfer.setData("id", li.getAttribute("id"));
				e.dataTransfer.setData("teksti", li.textContent);
				console.log("LI DRAG ALKOI!");
				console.log(li.getAttribute("id"));
			
				liDrag(li.parentNode);
			});

		});

		function liDrag(vetoalue) {
			vetoalue.addEventListener("dragover", function(e) {
				e.preventDefault();
				console.log("DRAGGGGG");

				let data = e.dataTransfer.getData("id");
				console.log(document.getElementById(data));
				if (e.dataTransfer.types.includes("id")) {
					console.log("DATA LÖYTY");
					e.dataTransfer.dropEffect = "move";
				} else {
					e.dataTransfer.dropEffect = "none";
				}
					
				
			});
			vetoalue.addEventListener("drop", function(e) {
			
				e.preventDefault();

				console.log("LI DRAG END");
				console.log(vetoalue.parentNode.firstChild.textContent);
				let joukkueennimi = vetoalue.parentNode.firstChild.textContent;
				
				let data = e.dataTransfer.getData("id");

				// TÄSTÄ ETEENPÄIN ONGELMIA
				console.log(document.getElementById(data));
				console.log(data);
				
				console.log(e.dataTransfer.getData("teksti"));
				if (data ) {
					try {
						let siblings = [...vetoalue.children];
						let nextSibling = siblings.find(sibling => {
							return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2 && e.clientX <= sibling.offsetLeft + sibling.offsetWidth /2;
						});
						console.log(nextSibling);
						console.log(e.clientY);
						console.log((nextSibling.offsetTop + nextSibling.offsetHeight /2));
						
						console.log(nextSibling);
	
						vetoalue.insertBefore(document.getElementById(data), nextSibling);
						console.log(joukkueennimi);
						jarjestarastit(joukkueennimi, vetoalue);
						vetoalue.parentNode.setAttribute("draggable", "true");
					} catch(error) {
						console.log(data);
					}
				}
			});
		
		}
				
		

		   function jarjestarastit(joukkueennimi, rastiListaUl) {
			for (let jouk of data.joukkueet) {
				
				if (joukkueennimi.includes(jouk.nimi)) {
					console.log(jouk);
					console.log(jouk.rastileimaukset);
					jouk.rastileimaukset = [];

					for (let r of rastiListaUl.children) {
						console.log(r.textContent); 

					} 
				}
			}
		   }
		  

		   function laskeMatka(koordinaatit) {

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
			return matka;
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
				console.log("JOUKKUE DRAG ALKOI");
				console.log(item);
				console.log(item.getAttribute("id"));
				e.dataTransfer.setData("text/plain", item.textContent);
				e.dataTransfer.setData("parent", item.parentElement);
				// Laitetaan id siirrettäväksi dataksi "kartalla" alueelle tiputusta varten
				e.dataTransfer.setData("iddata", item.getAttribute("id"));
				e.dataTransfer.setData("indexdata", index);
				joukkueenDroppaus();
			});
		   });

	    
	function joukkueenDroppaus() {

	
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
					console.log("DATA LÖYTY");
					e.dataTransfer.dropEffect = "move";
				} else {
					e.dataTransfer.dropEffect = "none";
				}
			});

			joukkuedrop.addEventListener("drop", function(e) {
				e.preventDefault();
				let data = e.dataTransfer.getData("iddata");

				let parentvedetty = e.dataTransfer.getData("parent");
				

				let vedetty = document.getElementById(data);
				
				console.log(vedetty.parentElement);
				
				let vedettyid = data;
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
			
			// Kartalla alueelle droppaus tapahtumakäsittelijä
			drop.addEventListener("drop", function(e) {
				e.preventDefault();

						let parentvedetty = e.dataTransfer.getData("parent");
						console.log(parentvedetty);
						let joukkuedetails = document.getElementsByTagName("details");
						 
						
						
						let data = e.dataTransfer.getData("iddata");
						console.log(e.dataTransfer.getData("text/plain"));
						let vedetty = document.getElementById(data);
						let vari = vedetty.style.backgroundColor;
						let vedettyNimi = document.getElementById(data).textContent;
						vedetty.style.position = "absolute";
						vedetty.style.left = e.offsetX + "px";
						vedetty.style.top = e.offsetY + "px";
						console.log(vedetty.textContent);
						piirraPolylineja(vedettyNimi, vari);
				
				if (data) {
					try {
						vedetty.style.backgroundColor = vari;
						e.target.appendChild(vedetty);
					} catch(error) {
						console.log(data);
					}
				}
				
			});
		}

			// funktio joukkueiden kulkeman matkan piirtämiselle
			function piirraPolylineja(vedetty, vari) {
				console.log(vari);
				let rastitObj = {};
				for ( let rasti in rastit) {
					let rLat = rastit[rasti].lat;
					let rLon = rastit[rasti].lon;
					let koordinaat = [];
					koordinaat.push(rLat);
					koordinaat.push(rLon);
						rastitObj[rasti] = koordinaat;
				}
				console.log(rastitObj);
				let arr = [];
				let joukkueetElementit = document.getElementsByClassName("joukkueet");
				
				for (let j of joukkueetElementit) {
					if (j.textContent == vedetty) {
						console.log(j.textContent);
						
						let rastiUlit = j.children[1].children;
						console.log(j.children[1].children);
						console.log(j);
						for (let rastiUl of rastiUlit) {
							console.log(rastiUl.textContent);
							let koodi = Object.keys(rastiObj).find(key => rastiObj[key] === rastiUl.textContent);
							arr.push(rastitObj[koodi]);

						} let koordinaatit = arr;
						console.log(koordinaatit);
						for (let k of koordinaatit) {
							if (k == undefined) {
								koordinaatit.splice(koordinaatit.indexOf(k), 1);
							}
						}
						let collor = vari;
						let polyline = L.polyline([koordinaatit], 
							{
							 color: vari}).addTo(mymap);

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


