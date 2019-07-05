var videoplayer = null;

$(function($) {
    videoplayer = new VideoPlayer({
        playerId: "video",
        playButtonId: "play",
        pauseButtonId: "pause",
        volControlId: "vol-control",
        volPlusButtonId: "plus",
        volMinusButtonId: "minus",
        reloadButtonId: "reload",
        stopButtonId: "stop",
        likeButtonId: "like",
        unlikeButtonId: "unlike",
        likeNumId: "like-num",
        unlikeNumId: "unlike-num",
        progressBarId: "progress",
        muteToggleButtonId: "mute-toggle",
        currentTimeId: "currentTime",
        totalTimeId: "totalTime"
    });
    videoplayer.init();


});

function strip(num, precision) {
    if (!precision) {
        precision = 12;
    }
    return +parseFloat(num.toPrecision(precision));
}

function isIE(){
    return /Edge\/|Trident\/|MSIE/.test(window.navigator.userAgent);
}