/**
 * A class used for managing context menus within application
 */
function Menu() {
   
    /**
     * Private settings
     */
    var settings = {
            insertionPoint: 'body'
        },
        errors = {
            id: 'There was an error retreiving the id of a node or factory.',
            type: 'There was an error determining what exactly was clicked.',
            lost: 'No menu was found to destroy',
            default: 'An unknown error has occured, please contact your administrator'
        },
        members = {
            event: false,
            type: false,
            error: false,
            menu: false,
            cover: false
        },
        data = {},
        templates = {
            menu: '<div class="menu"><div class="list-group"></div></div>',
            generate: '<div class="list-group-item" data-type="menuItem">Generate values<div class="slider child"><input type="range" name="total" min="0" max="15" onchange="rangevalue.value=value" data-validate="values" /><output id="rangevalue">8</output><button class="btn1" data-type="button" data-action="generate">Generate</button><button class="btn2" data-type="button" data-action="close" style="float: right;">cancel</button></div></div>',
            name: '<div class="list-group-item" data-type="menuItem">Set Name<div class="form-group child"><input name="name" type="text" class="form-control" placeholder="name" data-validate="name" /><button class="btn1" data-type="button" data-action="save">Save</button><button class="btn2" data-type="button" data-action="close" style="float: right;">cancel</button></div></div>',
            range: '<div class="list-group-item" data-type="menuItem">Set range<div class="form-group child"><label for="min-value">Min</label><input name="lower" type="text" class="form-control" id="min-value" value="1" data-validate="min"></div><div class="form-group child"><label for="max-value">Max</label><input name="upper" type="text" class="form-control" id="max-value" value="1000" data-validate="max"><button class="btn1" data-type="button" data-action="save">Save</button><button class="btn2" data-type="button" data-action="close" style="float: right;">cancel</button></div></div>',
            create: '<div class="list-group-item" data-type="menuItem">Create Factory<div class="form-group child"><input type="text" name="name" class="form-control" placeholder="name" data-validate="name" /><button class="btn1" data-type="button" data-action="create">Create</button><button class="btn2" data-type="button" data-action="close" style="float: right;">cancel</button></div></div>',
            delete: '<div class="list-group-item" data-type="button" data-action="delete">Delete</div>',
            clear: '<div class="list-group-item" data-type="button" data-action="clear">Clear Values</div>',
            cover: '<div class="cover" data-type="cover" data-type="menuItem"></div>'
        },
        menuTypes = {
            node: ['create'],
            factory: ['generate', 'name', 'range', 'delete', 'clear'],
            value: ['delete']
        };

        
    /**
     * Stores an error in memory
     *
     * @param {string} errorType instance
     * @api private
     */
    var setError = function(errorType) {
        if (errorType !== undefined && typeof(errorType) === 'string')
            members.error = errors[errorType];

        return false;
    }

    /**
     * Get's current position to render menu
     *
     * @api private
     */
    var getPosition = function(){
        return {x: members.event.pageX+40, y: members.event.pageY-20}
    };

    /**
     * Get's currently built menu from memory and
     * renders it to element
     *
     * @api private
     */
    var renderMenu = function() {
        if (!members.menu || members.menu === undefined)
            return setError('default');

        var position = getPosition();
        
        members.menu.appendTo(settings.insertionPoint).css({top: position.y, left: position.x}).stop().fadeIn();
        members.cover.appendTo('body');
    };

    /**
     * Recalls menu type from memory then creates
     * context menu and sets it to memory for rendering
     *
     * @api private
     */
    var buildMenu = function() {
        if (members.type) {
            members.menu = $(templates.menu);

            menuTypes[members.type].forEach(function(element){
                members.menu.append(templates[element]);
            });

            members.cover = $(templates.cover);

            return true;
        } return setError('type'); 
    };

    /**
     * Destroys menu now
     *
     * @api Private
     */
    var destroyMenu = function() {
        members.menu.remove();
        members.cover.remove();
        members.menu = false;
        members.cover = false;
    };

    /**
     * Renders context menu
     *
     * @param {object} target instance
     * @api public
     */
    this.Render = function(clicked) {
        if (members.menu)
            destroyMenu();

        members.type = ($(clicked.currentTarget).data('type') !== undefined) ? $(clicked.currentTarget).data('type') : false;

        if (typeof(clicked) === undefined || !clicked || isNaN(parseInt($(clicked.currentTarget).data('id'))))
            return setError('id');

        $.each($(clicked.currentTarget).data(), function(key, value){
            var prefix = (key === 'action') ? 'parent' : '';

            data[prefix+key] = value;
        });

        members.event = clicked;

        if (members.type) {
            if (buildMenu())
                renderMenu();
        }
    };

    /**
     * Public accessor for getting data for menu target
     *
     * @api public
     */
    this.GetData = function() {
        if (data === undefined)
            return false;


        return data;
    };



    /**
     * Public accessor for destroyMenu
     * adds fadeout
     *
     * @api public
     */
    this.closeMenu = function() {
        if (!members.menu || members.menu === undefined)
            return setError('lost');

        members.menu.stop().fadeOut(300, function(){
            destroyMenu();
        });
    };

    /**
     * opens sub menu items
     *
     * @param {object} clicked instance
     * @api public
     */
    this.RenderMenuItem = function(clicked) {
        // if has child, animate child
        var child = ($(clicked.currentTarget).children('.child')) ? $(clicked.currentTarget).children('.child') : false;

        if (!child || child === undefined) 
            return false;
        
        child.stop().slideDown().parent('.list-group-item').addClass('no-hover');
        return true;
    };

    /**
     * hides sub menu items
     *
     * @param {object} clicked instance
     * @api public
     */
    this.HideMenuItem = function(clicked) {
        if (!clicked || clicked === undefined)
            return false;
        
        var listItem = $(clicked.currentTarget).parents('.list-group-item');

        listItem.find('.child').stop().slideUp(300, function(){
            listItem.removeClass('no-hover');
        });
        
        return true;
    };

    /**
     * Sets error class to troubled menu item
     *
     * @param {object} clicked event instance
     * @api public
     */
    this.DisplayError = function(clicked) {
        $(clicked.currentTarget).parents('.list-group-item').addClass('error');
    };


    /**
     * Clears error class from troubled menu item
     *
     * @param {object} clicked event instance
     * @api public
     */
    this.ClearErrors = function(clicked) {
        console.log($(clicked.currentTarget).parents('.list-group-item'));
        $(clicked.currentTarget).parents('.list-group-item').removeClass('error');
    };

    /**
     * Returns a string containing current error
     * If no error is set, returns false
     * 
     * @api public
     */
    this.GetErrors = function() {
        if (!members.error)
            return false;

        return members.error;
    };

}