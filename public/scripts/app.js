const searchHotel = () => {
	// logic
	let input = document.querySelector('#searchInput');
	// extract value to be searched and make it uppercase
	let query = input.value.toUpperCase();
	// extract all hotel cards which later can be made invisible
	let hotelCards = document.querySelectorAll('.hotel-card');
	// extract all hotel names to perform the search on
	let hotelNames = document.querySelectorAll('.hotel-name');
	for (let i = 0; i < hotelNames.length; ++i) {
		// capitalize the hotel names
		let name = hotelNames[i].innerText.toUpperCase();
		// use find function to get the substring value
		if (name.indexOf(query) != -1) {
			hotelCards[i].style.display = 'block';
		} else {
			hotelCards[i].style.display = 'none';
		}
	}
};

// high
//Highrise
