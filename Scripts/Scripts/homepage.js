$(document).ready(function (e) {
    var pp = getUrlVars()["pp"];
    if (pp == 'true') {
        markup = '<div class="db"></div>';
        $('body').append(markup);
        $('.db').css({ 'z-index': 9999, width: '100%', height: '6318px', opacity: '.3', background: '#fff url(fischer.jpg) center top no-repeat', position: 'absolute', left: 0, top: 0 });
        $('.db').draggable();
    }

});
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
