(function($){

// TURN ON/OFF Color Correction

// Pour le rendre actif, Voir documentation: http://semantic-ui.com/modules/checkbox.html#/definition



$('#js-status-indicator').checkbox({
	
	onChecked: function() {
		console.log("checked");
		$('#js-status-indicator-label').text('activée')
	},
	onUnchecked: function() {
		console.log("unchecked");
		$('#js-status-indicator-label').text('désactivée')
	},
}).checkbox('check'); // utilise "uncheck" pour la mettre en mode "désactivé".


// $('#js-current-page-title').text(PAGETITLE)  <--- doit recevoir le contenu de la balise TITLE de la page courante.


// Slider that sets intensity
  $('#js-intensity-slider').range({
    min: 0,
    max: 10,
    start: 5,
    onChange: function(value) {

      console.log(value);
    }
  });

// FIN
})(jQuery);