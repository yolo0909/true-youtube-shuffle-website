var player;
var videoData;
const apiKey = 'AIzaSyC7vBJwnBIV1qP7uQnTBXvqKzrND8nej-8'
var playlistId = ''

function getPlaylistIdFromUrl(){
  // get playlist id from url
  const myKeyValues = window.location.search
  console.log(myKeyValues)
  const urlParams = new URLSearchParams(myKeyValues)
  let playlistId = urlParams.get('playlistId')
  console.log(playlistId)
  if(playlistId === null){
    playlistId = ''
  }
  return playlistId
}

function onYouTubeIframeAPIReady(){
  console.log('youtube api loaded')
  player = new YT.Player('player', {
    height: '600',
    width: '600',
    videoId: 'XAKL4SR2geQ',
    playerVars : {
      'autoplay' : 1,
      'controls' : 1,
      'players-inline' : 1,
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  }) 
}

function onPlayerReady(event){
  console.log('player ready')
  main()
}

function onPlayerStateChange(event){
  console.log('player state changed')
  if (event.data == YT.PlayerState.ENDED){
    console.log('video ended')
    loadVideo(randomVideo())
  }
}

async function gatherPlaylistVideos(playlistId){
  // use youtube data api to get playlist videos

  var nextPageToken = ''
  var videos = []

  while (true){

    var query = "https://www.googleapis.com/youtube/v3/playlistItems?" 

    if (nextPageToken){
      query += "pageToken=" + nextPageToken + "&"
    }

    query += "playlistId=" + playlistId + "&key=" + apiKey +  "&part=snippet&maxResults=50"
    console.log(query)
    const response = await fetch(query)
    const data = await response.json()
    videos = videos.concat(data.items)
    nextPageToken = data.nextPageToken
    if (!nextPageToken){
      break;
    }
  }
  
  // parse relevant video data
  var videoData = []
  for (let i = 0; i < videos.length; i++){
    videoData.push(
      {
        id : i,
        title : videos[i].snippet.title,
        thumbnail : videos[i].snippet.thumbnails.default.url,
        videoId : videos[i].snippet.resourceId.videoId,
      }
    )
  }

  console.log(videoData)
  return videoData;
}

async function loadVideo(video){
  //change video-playing class and jump to it

  oldVideoPlaying = document.querySelector('.video-playing')
  if (oldVideoPlaying){
    oldVideoPlaying.classList.remove('video-playing')
  }
  
  let playing = document.getElementById(video.id)
  playing.parentElement.setAttribute('class', 'video-playing')
  playing.scrollIntoView();
  
  //load video
  let videoId = video.videoId
  console.log(videoId)
  player.loadVideoById(videoId)
}

function randomVideo(){
  var randomVideo = videoData[Math.floor(Math.random() * videoData.length)]
  console.log(randomVideo)
  return randomVideo;   
}

function handlePlaylistItemClicked(e){
  console.log(e.target)
  console.log(videoData[e.target.id])
  loadVideo(videoData[e.target.id])
  return;
}


async function createPlaylist(playlist){

  // create video playlist list

  const oldListOfVideos = document.querySelector('#playlist')
  const newListOfVideos = document.createElement('ul')
  for(let i = 0; i < playlist.length; i++){
  
    let video = playlist[i]
    console.log(video + " " + video.id)

    const node = document.createElement('li')

    const thumbnail = document.createElement('img')
    thumbnail.src = video.thumbnail
    const title = document.createElement('p')
    title.textContent = video.title

    const button = document.createElement('button')
    button.setAttribute('id', video.id)
    button.setAttribute('class', 'playlist-item')

    button.appendChild(thumbnail)
    button.appendChild(title)

    node.appendChild(button)
    newListOfVideos.appendChild(node)
  }
  oldListOfVideos.replaceWith(newListOfVideos)

  let playlistItems = document.querySelectorAll('.playlist-item')  
  for(let i = 0; i < playlistItems.length; i++){
    playlistItems[i].addEventListener('click', handlePlaylistItemClicked)
  }
}


console.log('exists')
const main = async () => {
  playlistId = await getPlaylistIdFromUrl()
  videoData = await gatherPlaylistVideos(playlistId) 
  createPlaylist(videoData)
  const videoId = await randomVideo(videoData)
  loadVideo(videoId)
}

