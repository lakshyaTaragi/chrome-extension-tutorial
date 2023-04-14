(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];
    let loadedOnce = false;

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            console.log("flag = ", loadedOnce);
            newVideoLoaded();
            if (!loadedOnce) {
                loadedOnce = true;
            }
        } else if (type === "PLAY") {
            youtubePlayer.currentTime = value;
        } else if (type === "DELETE") {
            deleteBookmark(value, response);
            // console.log("delete @", value);
            // // currentVideoBookmarks = currentVideoBookmarks.filter((bm) => bm.time != value);
            // console.log("before: ", currentVideoBookmarks.length);
            // currentVideoBookmarks = currentVideoBookmarks.filter((bm) => {
            //     if(bm.time == value){
            //         console.log("deleting #", bm.time);
            //     }
            //     return bm.time != value;
            // });
            // console.log("after: ", currentVideoBookmarks.length);
            // chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
            // response(currentVideoBookmarks);
        }
    });

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            });
        });
    };

    const newVideoLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        currentVideoBookmarks = await fetchBookmarks();
        console.log("loaded bookmarks: ", currentVideoBookmarks);
        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
            youtubeLeftControls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    };

    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };

        currentVideoBookmarks = await fetchBookmarks();
        console.log("add @", currentTime);
        console.log("before: ", currentVideoBookmarks.length);
        // currentVideoBookmarks.push(newBookmark);
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify(
                [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
            )
        });
        // chrome.storage.sync.set({
        //     [currentVideo]: JSON.stringify([currentVideoBookmarks].sort())
        // });
        console.log("after: ", currentVideoBookmarks.length);
    };

    const deleteBookmark = async (value, response) => {
        currentVideoBookmarks = await fetchBookmarks();
        console.log("add @", value);
        console.log("before: ", currentVideoBookmarks.length);
        
        // currentVideoBookmarks = currentVideoBookmarks.filter((bm) => bm.time != value);
        currentVideoBookmarks = currentVideoBookmarks.filter((bm) => {
            if(bm.time == value){
                console.log("deleting #", bm.time);
            }
            return bm.time != value;
        });
        console.log("after: ", currentVideoBookmarks.length);
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
        // response(currentVideoBookmarks);
    };

})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substr(11, 8);
}