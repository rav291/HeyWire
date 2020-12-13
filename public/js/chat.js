const socket = io();

// socket.on('countUpdated', (count) => {
//     console.log('Count Updated ' + count);
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     socket.emit('increment');
// })

const $messageForm = document.querySelector('#message-form')
const $messageInput = document.querySelector('input')
const $messageButton = document.querySelector('#increment')
const $messages = document.querySelector('#messages')

const $messageTemplate = document.querySelector('#message-template').innerHTML
const $urlTemplate = document.querySelector('#url-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {

    // New message element 
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyle = getComputedStyle($newMessage);
    const getMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + getMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Container Height
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }


}

socket.on('locationMessage', (link) => {
    console.log(link.url);
    const html = Mustache.render($urlTemplate, {
        username: link.username,
        url: link.url,
        createdAt: moment(link.createdAt).format('h:mm A')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('messageUpdate', (message) => {
    console.log(message);
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html) // 
    autoScroll();

})

socket.on('roomData', ({ room, users }) => {

    const html = Mustache.render($sidebarTemplate, {    //This takes username field from idk where...
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageButton.setAttribute('disabled', 'disabled')

    const message = document.querySelector('input').value;

    socket.emit('message-sent', message, (error) => {

        $messageButton.removeAttribute('disabled', 'disabled')
        $messageInput.value = '';
        $messageInput.focus();

        if (error) {
            console.log(error);
        }
        else {
            console.log('Message Delivered!')
        }
    });
})

const $messageLocationButton = document.querySelector('#location');

$messageLocationButton.addEventListener('click', () => {

    $messageLocationButton.setAttribute('disabled', 'disabled');
    if (!navigator.geolocation)
        return 'Your Browser does not support geolocation';

    navigator.geolocation.getCurrentPosition(position => {

        let location = [];
        location.push(position.coords.latitude)
        location.push(position.coords.longitude)
        socket.emit('location', location, () => {
            console.log('Location Shared');
            $messageLocationButton.removeAttribute('disabled', 'disabled');
        });
    })
})

socket.emit('join', { username, room }, (error) => {

    if (error) {
        alert(error);
        location.href = '/'
    }

});
