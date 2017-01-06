(function($){

// Write your code here

// TURN ON/OFF Color Correction
var toggleStatus = document.getElementById('js-status-indicator');

noUiSlider.create(toggleStatus, {
	orientation: "horizontal",
	start: 0,
	range: {
		'min': [0, 1],
		'max': 1
	},
	format: wNumb({
		decimals: 0
	})
})

toggleStatus.noUiSlider.on('update', function( values, handle ){
	if ( values[handle] === '1' ) {
		toggleStatus.classList.add('off');
	} else {
		toggleStatus.classList.remove('off');
	}
});

})(jQuery);