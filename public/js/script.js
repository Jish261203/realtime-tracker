const socket = io();

const map = L.map("map").setView([0, 0], 20);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution: "Jishnay Nair",
}).addTo(map);

if (navigator.geolocation) {
	navigator.geolocation.watchPosition(
		(position) => {
			const { latitude, longitude } = position.coords;
			socket.emit("send-locations", { latitude, longitude });
		},
		(error) => {
			console.error(error);
		},
		{
			enableHighAccuracy: true,
			maximumAge: 0,
			timeout: 5000,
		}
	);
}

const markers = {};

socket.on("receive-location", (data) => {
	const { id, latitude, longitude } = data;
	map.setView([latitude, longitude]);

	if (markers[id]) {
		markers[id].setLatLng([latitude, longitude]);
	} else {
		markers[id] = L.marker([latitude, longitude]).addTo(map);
	}
});

socket.on("user-disconnected", (id) => {
	if (markers[id]) {
		map.removeLayer(markers[id]);
		delete markers[id];
	}
});
