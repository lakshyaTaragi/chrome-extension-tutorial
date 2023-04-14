import { getActiveTabURL } from "./utils.js";

let currentVideo = "";

const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlsElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);


    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);
};

// const viewBookmarks = () => {
//     let currentBookmarks = [];
//     chrome.storage.sync.get([currentVideo], (obj) => {
//         currentBookmarks = obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [];
//     });
const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";
    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; i++) {
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarksElement, bookmark);
        }
    } else {
        bookmarksElement.innerHTML = '<i class="row">No bookmarks to show.</i>';
    }
};

const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime,
    });
};

const onDelete = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);
    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime,
    // }, viewBookmarks);
    }, (response) => {
        console.log(response);
        viewBookmarks(response.data);
    });
    // });
    // refreshPopup();
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");

    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

const refreshPopup = () => {
    chrome.storage.sync.get([currentVideo], (obj) => {
        const currentVideoBookmarks = obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [];
        viewBookmarks(currentVideoBookmarks);
    });
};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    // const currentVideo = urlParameters.get("v");
    currentVideo = urlParameters.get("v");

    if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
        refreshPopup(currentVideo);
        // chrome.storage.sync.get([currentVideo], (obj) => {
        //     const currentVideoBookmarks = obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [];
        //     viewBookmarks(currentVideoBookmarks);
        // });
        // viewBookmarks();
    } else {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not a youtube video page.</div>'
    }

});