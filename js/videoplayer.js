/**
 * @file Video player class
 * @author Liang Xiong (xionglwh@cn.ibm.com)
 */


/**
 * Constructs a html5 video player as well as custom control buttons in one object.
 * provide the ablities to control video player by those custom control buttons.
 * @constructor 
 * @param {object} videoElements
 *   the object contains html5 video object id as well as control buttons id, e.g.:
 *   {
 *      playerId: 'playerId',
 *      playButtonId: 'playButtonId',
 *      pauseButtonId: 'pauseButtonId',
 *      volControlId: 'volControlId',
 *      volPlusButtonId: "plus",
 *      volMinusButtonId: "minus",
 *      progressBarId: "progressBarId",
 *      reloadButtonId: "reloadButtonId",
 *      stopButtonId: "stop",
 *      likeButtonId: "likeButtonId",
 *      unlikeButtonId: "unlikeButtonId",
 *      likeNumId: "likeNumId",
 *      unlikeNumId: "unlikeNumId",
 *      muteToggleButtonId: "muteToggleButtonId",
 *      currentTimeId: "currentTimeId",
 *      totalTimeId: "totalTimeId"
 *   }
 */
function VideoPlayer(videoElements) {
    this.player = $("#" + videoElements.playerId)[0];
    this.playButton = $("#" + videoElements.playButtonId);
    this.pauseButton = $("#" + videoElements.pauseButtonId);
    this.stopButton = $("#" + videoElements.stopButtonId);
    this.volControl = $("#" + videoElements.volControlId)[0];
    this.volPlusButton = $("#" + videoElements.volPlusButtonId);
    this.volMinusButton = $("#" + videoElements.volMinusButtonId);
    this.reloadButton = $("#" + videoElements.reloadButtonId);

    this.likeButton = $("#" + videoElements.likeButtonId);
    this.unlikeButton = $("#" + videoElements.unlikeButtonId);
    this.likeNum = $("#" + videoElements.likeNumId);
    this.unlikeNum = $("#" + videoElements.unlikeNumId);

    this.progressBar = $("#" + videoElements.progressBarId)[0];
    this.muteToggleButton = $("#" + videoElements.muteToggleButtonId);
    this.totalTimeLabel = $("#" + videoElements.totalTimeId);
    this.currentTimeLabel = $("#" + videoElements.currentTimeId);
    this.volumeStep = 0.1;
    this.playlist = [];
    this.currentPlayback = {};

    this.init = function () {

        this.progressBar.value = 0;
        this.volControl.value = this.player.volume * 100;

        var self = this;

        this.player.oncanplay = function () {
            self.readyToPlay();
            self.totalTimeLabel.html(self.secondsToTime(self.player.duration));
        };

        this.volControl.onchange = function () {
            self.changeVolume(self.volControl.value / 100);
        };

        this.player.ontimeupdate = function () {
            self.currentTimeLabel.html(self.secondsToTime(self.player.currentTime));
            videoStore.setCurrentTimeOfVideo(self.currentPlayback.videoId, self.player.currentTime);
            if (self.player.ended) {
                self.player.load();
                self.readyToPlay();
                videoStore.setCurrentTimeOfVideo(self.currentPlayback.videoId, 0);
                self.loadProgress(true);
            }
        };

        this.playButton.on("click", this.play.bind(this));
        this.reloadButton.on("click", this.reload.bind(this));

        this.pauseButton.on("click", this.pause.bind(this));
        this.stopButton.on("click", this.stop.bind(this));
        this.volPlusButton.on("click", this.increaseVolume.bind(this));
        this.volMinusButton.on("click", this.decreaseVolume.bind(this));
        this.muteToggleButton.on("click", this.toggleMute.bind(this));
        this.likeButton.on("click", this.likeVideo.bind(this));
        this.unlikeButton.on("click", this.unlikeVideo.bind(this));
        $(this.progressBar).on("click", this.seek.bind(this));
        $(".playback").on("click", { player: this }, function (event) {
            event.data.player.launchPlayback(this);
        });


        $(".playlist article").each(function (index, playback) {
            var playbackObj = {
                source: playback.dataset.videolink,
                videoId: playback.dataset.videoid
            };
            self.playlist.push(playbackObj);
        });

        this.currentPlayback = this.playlist[0];

        this.refreshMuteButton();
        this.refreshVolumeButtons();
        this.loadProgress();
        this.loadFavorite();


        var interval = 10;
        /* IE has ease effect for progress element */
        if (isIE()) {
            interval = 100;
        }
        setInterval(function () {
            self.updateProgress();
        }, interval);

    };


    this.play = function () {
        if (this.player.paused) {
            this.player.play();
            this.readyToPause();
        }
    };

    this.reload = function () {
        this.player.src = this.currentPlayback.source;
        this.player.load();
        this.play();
    };

    this.pause = function () {
        if (!this.player.paused) {
            this.player.pause();
            this.readyToPlay();
        }
    };

    this.stop = function(){
        if (!this.player.paused) {
            this.player.pause();
            this.loadProgress(true);
            this.readyToPlay();
        }
    };

    this.seek = function(e){
        this.player.currentTime = e.offsetX / this.progressBar.offsetWidth * this.player.duration;
    };

    this.launchPlayback = function (playback) {
        if ($(playback).hasClass("active")) {
            return;
        }
        $(".playback").removeClass("active");
        $(playback).addClass("active");
        var playbackObj = {
            source: playback.dataset.videolink,
            videoId: playback.dataset.videoid
        };
        this.currentPlayback = playbackObj;
        this.restoreVoteButtons();
        this.loadProgress();
        this.loadFavorite();
    };

    this.increaseVolume = function () {
        if (this.player.volume < 1) {
            this.player.volume = strip(this.player.volume + this.volumeStep);
            this.volControl.value = this.player.volume * 100;
        }
        this.refreshVolumeButtons();
    };

    this.decreaseVolume = function () {
        if (this.player.volume > 0) {
            console.log(this.player.volume);
            this.player.volume = strip(this.player.volume - this.volumeStep);
            this.volControl.value = this.player.volume * 100;
        }
        this.refreshVolumeButtons();

    };

    this.refreshVolumeButtons = function () {
        if (this.player.volume === 0) {
            this.volPlusButton.removeClass('disabled');
            this.volPlusButton.attr("disabled", false);
            this.volMinusButton.addClass('disabled');
            this.volMinusButton.attr("disabled", true);
        } else if (this.player.volume === 1) {
            this.volMinusButton.removeClass('disabled');
            this.volMinusButton.attr("disabled", false);
            this.volPlusButton.addClass('disabled');
            this.volPlusButton.attr("disabled", true);
        }else{
            this.volMinusButton.removeClass('disabled');
            this.volMinusButton.attr("disabled", false);
            this.volPlusButton.removeClass('disabled');
            this.volPlusButton.attr("disabled", false);
        }
    };

    this.loadProgress = function (reset) {
        if (reset) {
            this.player.src = this.currentPlayback.source;
        } else {
            var currentTime = videoStore.getCurrentTimeOfVideo(this.currentPlayback.videoId);
            this.player.src = this.currentPlayback.source + "#t=" + currentTime;
            if (isIE()) {
                var self = this;
                var intervalId = setInterval(function () {
                    if(self.player.readyState === 3){
                        self.player.currentTime = currentTime;
                        clearInterval(intervalId);
                    }
                }, 10);
            }
        }
    };

    this.loadFavorite = function () {
        this.likeNum.html(videoStore.getLikeNumOfVideo(this.currentPlayback.videoId));
        this.unlikeNum.html(videoStore.getUnlikeNumOfVideo(this.currentPlayback.videoId));
    };

    this.changeVolume = function (volume) {
        this.player.volume = volume;
        this.refreshVolumeButtons();
    };

    this.toggleMute = function () {
        this.player.muted = !this.player.muted;
        this.refreshMuteButton();
    };

    this.restoreVoteButtons = function(){
        var likeIcon = $("i", this.likeButton);
        likeIcon.removeClass("fas");
        likeIcon.addClass("far");
        var unlikeIcon = $("i", this.unlikeButton);
        unlikeIcon.removeClass("fas");
        unlikeIcon.addClass("far");
    }

    this.likeVideo = function () {
        var likeIcon = $("i", this.likeButton);
        var likeNum = videoStore.getLikeNumOfVideo(this.currentPlayback.videoId);
        if (likeIcon.hasClass("far")) {
            ++likeNum;
            likeIcon.removeClass("far");
            likeIcon.addClass("fas");
        } else if (likeIcon.hasClass("fas")) {
            --likeNum;
            likeIcon.addClass("far");
            likeIcon.removeClass("fas");
        }
        videoStore.setLikeNumOfVideo(this.currentPlayback.videoId, likeNum);
        this.likeNum.html(videoStore.getLikeNumOfVideo(this.currentPlayback.videoId));
    };

    this.unlikeVideo = function () {
        var unlikeIcon = $("i", this.unlikeButton);
        var unlikeNum = videoStore.getUnlikeNumOfVideo(this.currentPlayback.videoId);

        if (unlikeIcon.hasClass("far")) {
            ++unlikeNum;
            unlikeIcon.removeClass("far");
            unlikeIcon.addClass("fas");
        } else if (unlikeIcon.hasClass("fas")) {
            --unlikeNum;
            unlikeIcon.addClass("far");
            unlikeIcon.removeClass("fas");
        }
        videoStore.setUnlikeNumOfVideo(this.currentPlayback.videoId, unlikeNum);
        this.unlikeNum.html(videoStore.getUnlikeNumOfVideo(this.currentPlayback.videoId));
    };

    this.refreshMuteButton = function () {
        if (this.player.muted) {
            $("i", this.muteToggleButton).removeClass('fa-volume-down');
            $("i", this.muteToggleButton).addClass('fa-volume-mute');
        } else {
            $("i", this.muteToggleButton).addClass('fa-volume-down');
            $("i", this.muteToggleButton).removeClass('fa-volume-mute');
        }
    };


    this.updateProgress = function () {
        if (this.player.currentTime === 0) {
            this.progressBar.value = 0;
            if(isIE()){
                this.currentTimeLabel.html(this.secondsToTime(this.player.currentTime));
                videoStore.setCurrentTimeOfVideo(this.currentPlayback.videoId, this.player.currentTime);
            }
        } else {
            percent = this.player.currentTime / this.player.duration;
            this.progressBar.value = percent * 100;
        }
    };

    this.readyToPlay = function () {
        if (this.player.paused) {
            this.playButton.removeClass('disabled');
            this.playButton.attr("disabled", false);
            this.pauseButton.addClass('disabled');
            this.pauseButton.attr("disabled", true);
            this.stopButton.addClass('disabled');
            this.stopButton.attr("disabled", true);
        }
    };

    this.readyToPause = function () {
        this.playButton.addClass('disabled');
        this.playButton.attr("disabled", true);
        this.pauseButton.removeClass('disabled');
        this.pauseButton.attr("disabled", false);
        this.stopButton.removeClass('disabled');
        this.stopButton.attr("disabled", false);
    };

    this.secondsToTime = function (seconds) {
        var sec_num = parseInt(seconds, 10);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return hours + ':' + minutes + ':' + seconds;
    }
};