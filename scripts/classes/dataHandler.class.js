function DataHandler(){
    
    /**
     * Private member settings and member variables
     *
     * @api private
     */
    var settings = {
            allowedActions: ['delete', 'clear', 'name', 'generate', 'create', 'save'],
            allowedInputs: ['name', 'lower', 'upper', 'total'],
            allowedTotal: 15
        },
        patterns = {
            name: /(^[a-zA-Z -(0-9)]+$)/,
            lower: /(^[0-9]+$)/,
            upper: /(^[0-9]+$)/,
            total: /(^[0-9]+$)/,
            int: /(^[0-9]+$)/
        },
        data = {},
        errors = {
            action: 'Error, request action is not allowed',
            value: 'Error, an illegal value was passed in',
            id: 'Error an illegal id was passed in',
            data: 'Error, no data was set when attempting to set data',
            default: 'An unknown error has occured'
        },
        members = {
            error: false,
            flag: false
        };
        
    /**
     * Flags an error and returns false
     *
     * @param {string} error instance
     * @api public
     */
    var setError = function(error) {
        members.error = (errors[error]) ? errors[error] : errors['default'];
        members.flag = true;

        return false;
    };

    /**
     * Verifies that we have at least mostly valid input
     *
     * @param {string} action instance
     * @api public
     */
    var verifyAction = function(action) {
        if (typeof(action) !== 'string' || settings.allowedActions.indexOf(action) < 0)
            return setError('action');

        return true;
    };

    /**
     * Verifies that we have a valid input
     *
     * @param {string} type instance
     * @param {string} value instance
     * @api public
     */ 
    var verifyInput = function(type, value) {
        
        if (type === undefined || value === undefined || settings.allowedInputs.indexOf(type) < 0 || value.match(patterns[type]) === null)
            return setError('value');

        return true;
    };
    

    /**
     * Returns currently saved data
     *
     * @api public
     */
    this.GetData = function(){
        return data;
    };

    /**
     * Sets a data key and value to be sent to server
     *
     * @api public
     */
    this.Set = function(dataSet, value = false){
        if (dataSet === undefined || (typeof(dataSet) !== 'string' && typeof(dataSet) !== 'object') )
            return setError('data');

        if (typeof(dataSet) === 'string') {
            return data[dataSet] = value;
        } else if (typeof(dataSet) === 'object') {
            for (var element in dataSet) {
                data[element] = dataSet[element];
            }
        }
        
    }

    /**
     * Sorts through data to ensure data is valid and
     * stores for later use.
     *
     * @param {object} clicked event instance
     * @api public
     */
    this.IsClean = function(clicked){
        members.flag = false;
        data = {};

        data.action = (verifyAction($(clicked.currentTarget).data('action'))) ? $(clicked.currentTarget).data('action') : false;

        $(clicked.currentTarget).parents('.list-group-item').find('input').each(function(key, value){
            var name = $(value)[0].name,
                inputValue = $(value)[0].value;

            data[name] = (verifyInput(name, inputValue)) ? inputValue : false;
            
        });

        if (members.flag)
            return false;

        return true;
    };
}