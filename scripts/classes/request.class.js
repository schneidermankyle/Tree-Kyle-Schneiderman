var Request = function(connection) {

    var settings = {
        allowedActions: ['create', 'save', 'delete', 'clear', 'generate']
    },
    members = {
        connection: false
    },
    patterns = {
        string: /(^[a-zA-Z -(0-9)]+$)/,
        int: /(^[0-9]+$)/
    },
    actions = {
        create: function(data){
            // check data first
            if (!validate('string', data.name) || !validate('int', data.id))
                return false;

           members.connection.query('INSERT INTO `factories` (`name`, `lower`, `upper`, `node`) VALUES(?, "1", "1000", ?) ', [data.name, data.id], function(err, rows, fields){
               if (err) throw false;
               return true;
            });
    },
    delete: function(data) {
            if (!validate('int', data.id) || !validate('int', data.value))
                return false;

            if (data.type !== 'value') {
                members.connection.query('DELETE FROM `factories` WHERE `id` = ?', [data.id], function(err, rows, fields){
                    if (err) throw err;
                });
            } else {
                members.connection.query("SELECT `generated_values` FROM `factories` WHERE `id`=?", [data.id], function(err, rows, fields) {
                    if(err) throw err;

                    var match = (rows[0]['generated_values'].indexOf(data.value) < String(data.value).length) ? data.value+', ' : ', '+data.value,
                        values = rows[0]['generated_values'].replace(match, '');

                    members.connection.query('UPDATE `factories` SET `generated_values` = ? WHERE `id`= ?', [values, data.id], function (err, rows){
                       if (err) throw err;
                   });

                });
            }
        },
        clear: function(data) {
            if (!validate('int', data.id))
                return false;

            members.connection.query('UPDATE `factories` SET `generated_values` = null WHERE `id` = ?', [data.id], function(err, rows, fields){
                if (err) throw err;
            });
        },
        save: function(data) {
            if (!validate('int', data.id))
                return false;

            var string = '',
                parameters = [];

            if (data.name !== undefined ) {
                if (!validate('string', data.name))
                    return false;
                string = '`name` = ?';
                parameters = [data.name, data.id];
            } else {
                if (!validate('int', [data.lower, data.upper]))
                    return false;
                string = '`lower` = ?, `upper` = ?';
                parameters = [data.lower, data.upper, data.id];
            }

            members.connection.query('UPDATE `factories` SET ' + string + ' WHERE `id` = ?', parameters, function(err, rows, fields){
                if (err) throw err;
            });
        },
        generate: function(data) {
            if (!validate('int', [data.id, data.total]))
                return false;
            // we need to get our range
            members.connection.query('SELECT `lower`, `upper` FROM `factories` WHERE `id` = ? LIMIT 1', [data.id], function(err, rows, fields) {
                if (err) throw err;

                var values = generateValues(data.total, rows[0].lower, rows[0].upper);
                members.connection.query('UPDATE `factories` SET `generated_values` = ? WHERE `id` = ?', [values, data.id], function(err, rows, fields) {
                    if (err) throw err;
                });

            });
        }
    };

    /**
     * Generates a set of values between two bounds
     *
     * @param {string} type the type of validation instance
     * @param {string} data the data to be validated instance
     * @api private
     */
    var validate = function(type, data) {
        if (typeof(data) === undefined)
            return false;

        var flag = false;

        if (typeof(data) === 'string') {
            if (data.match(patterns[type]) === null)
                flag = true;
        } else if (typeof(data) === 'array') {
            data.forEach(function(element){
                if (element.match(patterns[type]) === null)
                    flag = true;
            });
        }


        return !flag;
    };

    /**
     * Generates a set of values between two bounds
     *
     * @param {int} count the number of ints to produce instance
     * @param {int} lower lower bounds instance
     * @param {int} upper upper bounds instance
     * @api private
     */
    var generateValues = function(count, lower, upper) {
        if (isNaN(parseInt(count)) || isNaN(parseInt(lower)) || isNaN(parseInt(upper)) || lower > upper)
            return false;
        
        var values = '';

        for (var i = 1; i <= count; i++) {
            values += Math.floor(Math.random() * (upper-lower+1) + lower);
            if (i < count)
                values += ', ';
        }

        return values;
    };

    /**
     * Our request constructor, also serves as our call to action
     *
     * @param {object} connection mysql connection instance
     * @api public
     */
    var __construct = function(connection) {
        members.connection = connection;
    };

    /**
     * takes in a string of values and returns formated html
     * or object tree
     *
     * @param {string} values string of values instance
     * @param {int} parent int id of parent instance
     * @param {string} format return type instance
     * @api private
     */
    var FormatValues = function(values, parent, format = 'html') {
        var arrayView = [],
            html = '',
            htmlEnd = '';

            if (values) {
                html += '<ul>';
                htmlEnd = '</ul>' + htmlEnd;
            }
            values.split(', ').forEach(function(value){
                arrayView.push(value);
                html += '<li data-action="render" data-id="'+parent+'" data-type="value" data-value='+value+'>'+value+'</li>';
            });

        var returnString = (format === 'html') ? html+htmlEnd : arrayView;
        return returnString;
    };

    /**
     * Processes the current request
     *
     * @param {object} data request data instance
     * @api public
     */
    this.Process = function(data) {
        if (typeof(data.action) !== 'string' || settings.allowedActions.indexOf(data.action) < 0)
            return false

        
        actions[data.action](data);
        return true;
    }

    /**
     * Returns formatted structure as a object for clientside rendering
     *
     * @param {string} format return type instance
     * @api public
     */
    this.GetStructure = function(format = 'html', callback) {
        var objectView = {},
            html = '',
            htmlEnd = '';

        members.connection.query("SELECT * FROM `nodes`", function (err, rows, fields){
            if (err) throw err;

           anotherTest = rows.forEach(function(node){
                objectView[node.name] = node;

                html += '<li class="root"><span class="name" data-action="render" data-id="'+node.id+'" data-type="node"><i class="fa fa-server"></i>'+node.name+'</span>';
                htmlEnd = '</li>' + htmlEnd;

                members.connection.query("SELECT * FROM `factories` WHERE `node` = ?", [node.id], function(err, rows, fields) {
                    if (err) throw err;

                   rows.forEach(function(factory){
                        objectView[node.name][factory.name] = factory;
                        
                    var string = '',
                        stringEnd = ''; 

                        string += '<ul><li><span class="name" data-action="render" data-id="'+factory.id+'" data-type="factory" data-min="'+factory.lower+'" data-max="'+factory.upper+'"><i class="fa fa-user"></i>'+factory.name+'  ('+factory.lower+'-'+factory.upper+')</span>';
                        stringEnd = '</li></ul>' + stringEnd;

                        if (factory['generated_values'] !== null) {
                            objectView[node.name][factory.name]['values'] = FormatValues(factory['generated_values'], factory.id, 'array');
                            string += FormatValues(factory['generated_values'], factory.id);
                        }
                        
                        html += string+stringEnd;
                    });
                    

                    var returnString = (format === 'html') ? html + htmlEnd : objectView;
                    
                    callback(returnString);

                });

            });

        
        });
        
    };

    return __construct(connection);
};

module.exports = Request;