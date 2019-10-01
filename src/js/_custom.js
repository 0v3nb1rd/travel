document.addEventListener("DOMContentLoaded", function() {

// $(function() {
		// Custom JS
	$('.logo-letter').each(function() {
		var ths = $(this);
		ths.html(ths.html().replace('Man', '<span>Man</span>'));
	});

	$('.search').click(function() {
		$('.search-field').stop().slideToggle();
		$('.search-field input[type=text]').focus();
	});
	$(document).keyup(function(e) {
		if(e.keyCode == 27) {
			$('.search-field').slideUp();
		}
	}).click(function() {
		$('.search-field').slideUp();
	});
	$('.search-wrap').click(function(e) {
		e.stopPropagation();
	});

	$(".hamburger").click(function(){
    $(this).toggleClass("is-active");
	});
	
	// Mobile menu slider
	$('.top-line').after('<div class="mobile-menu d-lg-none">');
	$('.top-menu').clone().appendTo('.mobile-menu');
	$('.mobile-menu-button').click(function() {
		$('.mobile-menu').stop().slideToggle();
	});

	//Card anumate 
	$('.card').hover(function() {
    $(this).find('.card__description').stop().animate({
      height: "toggle",
      opacity: "toggle"
    }, 300);
	});
	
});