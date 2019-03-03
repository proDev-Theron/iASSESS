$(document).ready(function() {

"use strict";


/* =================================
   LOADER                     
=================================== */
// makes sure the whole site is loaded
$(window).on('load', function() {

    // will first fade out the loading animation
    $(".loader-inner").fadeOut();
    // will fade out the whole DIV that covers the website.
    $(".loader").fadeOut("slow");

});


/* =================================
   NAVBAR COLLAPSE ON SCROLL
=================================== */
$(window).on('scroll', function(){
    var b = $(window).scrollTop();
    if( b > 60 ){
        $(".navbar").addClass("top-nav-collapse");
    } else {
        $(".navbar").removeClass("top-nav-collapse");
    }
});


/* =================================
   NAVBAR WITH TOP BAR
=================================== */
$('.nav-2').affix({
      offset: {
        top: $('.top-bar').height()
      }
});


/* ===========================================================
   PAGE SCROLLING FEATURE
============================================================== */
$('a.smooth-scroll').on('click', function(event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top + 20
    }, 1500, 'easeInOutExpo');
    event.preventDefault();
});


/* ===========================================================
   BACK TO TOP BUTTON
============================================================== */
var offset = 300,
//browser window scroll (in pixels) after which the "back to top" link opacity is reduced
offset_opacity = 1200,
//duration of the top scrolling animation (in ms)
scroll_top_duration = 700,
//grab the "back to top" link
$back_to_top = $('.top');

//hide or show the "back to top" link
$(window).on('scroll', function() {
    ( $(this).scrollTop() > offset ) ? $back_to_top.addClass('is-visible') : $back_to_top.removeClass('is-visible fade-out');
    if( $(this).scrollTop() > offset_opacity ) {
        $back_to_top.addClass('fade-out');
    }
});

//smooth scroll to top
$back_to_top.on('click', function(event){
    event.preventDefault();
    $('body,html').animate({
        scrollTop: 0
        }, scroll_top_duration
    );
});


/* ===========================================================
    WOW ANIMATIONS                   
============================================================== */
new WOW().init();


/* ===========================================================
   HIDE MOBILE MENU AFTER CLICKING 
============================================================== */
$('.navbar-nav>li>a:not(#dLabel)').on('click', function(){
    $('#navbar-collapse').removeClass("in").addClass("collapse"); 
});



/* ===========================================================
   MAGNIFIC POPUP
============================================================== */
$('.mp-singleimg').magnificPopup({
    type: 'image'
});

$('.mp-gallery').magnificPopup({
    type: 'image',
    gallery:{enabled:true},
});

$('.mp-iframe').magnificPopup({
    type: 'iframe'
});



/* ===========================================================
   FEATURES TAB
============================================================== */
$('.features-tab .tab-title').on('click', function(e) {
    if (!$(this).hasClass('current')) {
        $('.tab-title').removeClass('out');
        $('.tab-title.current').addClass('out');
        $('.features-tab .tab-title').removeClass('current');
        $(this).addClass('current');
    }
    e.preventDefault();
});


/* ===========================================================
   FEATURES TAB - SCROLLING TO THE TAB-TITLE ON MOBILE DEVICES
==============================================================  */
var mQ = window.matchMedia('(max-width: 767px)');
mQ.addListener(tabScrolling);
  
function tabScrolling(mQ) {    
    if (mQ.matches) {
        $('.features-tab .tab-title').on('click', function(event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $anchor.offset().top - 90
            }, 500, 'easeInOutExpo');
            event.preventDefault();
        });
    }    
}
  
tabScrolling(mQ);

	
/* ===========================================================
   GOOGLE MAPS
============================================================== */
/* active mouse scroll when the user clicks into the map*/
if( $('.map-container').length ) {
    $('.map-container').on('click', function () {
        $('.map-iframe').css("pointer-events", "auto");
    });

    $( ".map-container" ).on('mouseleave', function() {
      $('.map-iframe').css("pointer-events", "none");
    });
}


/* ==========================================
   FUNCTION FOR EMAIL ADDRESS VALIDATION
============================================= */
function isValidEmail(emailAddress) {
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
}


/* ==========================================
   FUNCTION FOR PHONE NUMBER VALIDATION
============================================= */
function isValidPhoneNumber(phoneNumber) {
    return phoneNumber.match(/[0-9-()+]{3,20}/);
}


/* ==========================================
   CONTACT FORM
============================================= */
$("#contactForm").on('submit', function(e) {
    
    e.preventDefault();
    var data = {
        name: $("#cfName").val(),
        email: $("#cfEmail").val(),
        subject: $("#cfSubject").val(),
        message: $("#cfMessage").val()
    };

    if ( isValidEmail(data['email']) && (data['message'].length > 1) && (data['name'].length > 1) && (data['subject'].length > 1) ) {
        $.ajax({
            type: "POST",
            url: "php/contact.php",
            data: data,
            success: function() {
                $('.success.cf').delay(500).fadeIn(1000);
                $('.failed.cf').fadeOut(500);
            }
        });
    } else {
        $('.failed.cf').delay(500).fadeIn(1000);
        $('.success.cf').fadeOut(500);
    }

    return false;
});


/* ===========================================================
   BOOTSTRAP FIX FOR IE10 in Windows 8 and Windows Phone 8  
============================================================== */
if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement('style');
    msViewportStyle.appendChild(
        document.createTextNode(
            '@-ms-viewport{width:auto!important}'
            )
        );
    document.querySelector('head').appendChild(msViewportStyle);
}



}); // End $(document).ready Function