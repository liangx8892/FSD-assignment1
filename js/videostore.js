var videoStore = {
    VIDEO_PREFIX : 'VIDEO',
    getCurrentTimeOfVideo : function(videoid){
        var currentTime = 0;
        var videoData = this.getVideoData(videoid);
        if(videoData.currentTime){
            currentTime = videoData.currentTime;
        }
        return currentTime;
    },

    setCurrentTimeOfVideo : function(videoid, currentTime){
        var videoData = this.getVideoData(videoid);
        videoData.currentTime = currentTime;
        localStorage.setItem(this.VIDEO_PREFIX+videoid, JSON.stringify(videoData));
    },

    getLikeNumOfVideo : function(videoid){
        var likeNum = 0;
        var videoData = this.getVideoData(videoid);
        if(videoData.likeNum){
            likeNum = videoData.likeNum;
        }
        return likeNum;
    },

    setLikeNumOfVideo : function(videoid, likeNum){
        var videoData = this.getVideoData(videoid);
        videoData.likeNum = likeNum;
        localStorage.setItem(this.VIDEO_PREFIX+videoid, JSON.stringify(videoData));
    },

    getUnlikeNumOfVideo : function(videoid){
        var unlikeNum = 0;
        var videoData = this.getVideoData(videoid);
        if(videoData.unlikeNum){
            unlikeNum = videoData.unlikeNum;
        }
        return unlikeNum;
    },

    setUnlikeNumOfVideo : function(videoid, unlikeNum){
        var videoData = this.getVideoData(videoid);
        videoData.unlikeNum = unlikeNum;
        localStorage.setItem(this.VIDEO_PREFIX+videoid, JSON.stringify(videoData));
    },

    getVideoData : function(videoid){
        var videoData = {};
        var videoDataString = localStorage.getItem(this.VIDEO_PREFIX+videoid);
        if(videoDataString){
            videoData = JSON.parse(videoDataString);
        }
        return videoData;
    }
};