$(document).ready(function(){
    // include required classes
    include(['menu', 'dataHandler']);

    var menu = new Menu(),
        data = new DataHandler(),
        socket = io();

    // We will create one event listener on the body that will listen for a few key elements.
    $('body').on('click', '*[data-type]', function(e){
        var type = $(this).data('type'),
            action = $(this).data('action'),
            targetMenuItem = $(this).parents('.list-group-item');

       // We need to decide the action to be taken.
        if (["node","factory","value"].indexOf(type) >= 0) {
            // This is a tree item
            menu.Render(e)
        } else if (type === 'menuItem') {
            // This is a menu item
            if (!$(this).hasClass('no-hover'))
                menu.RenderMenuItem(e);
        } else if (type === 'button') {
            // We have to determine the action to be completed
            if (action) {
                if (action === 'close') {
                    menu.HideMenuItem(e);
                } else {
                    // process the request
                    if (!data.IsClean(e)) {
                        menu.DisplayError(e);
                        return false;
                    }
                    
                    // Finish setting data, close menu and send the request
                    data.Set(menu.GetData());
                    menu.closeMenu();
                    socket.emit('request', data.GetData());
                }
            }
        } else if (type === 'cover') {
            menu.closeMenu();
        }


    });

    
    socket.on('return', function(data){
        $('#view').html(data);
    });

});