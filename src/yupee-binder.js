/*
 * yupee-binder.js
 * Copyright 2026 Alexandre Brillant
 */

/* 
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
* Create simple Form system for adding various fields. Each field is automatically
* synchronized with a litteral object
*
* @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
* @version 1.0
*/

( ( $$ ) => {

    class FieldGroup {

        #root;
        #result;

        /**
         * @param {*} container The HTML component
         * @param {*} result An optional Object for storing/reading the values
         */
        constructor( container, data = {}, className = "yupee-binder-group" ) {
            this.#result = data
            this.#root = document.createElement( "DIV" );
            this.#root.className = className;
            container.appendChild( this.#root );
        }

        #buildField( { label, name, format, required, defaultValue, validator, formatter } ) {
            const field = document.createElement( "DIV" );
            field.className = "yupee-binder-field";
            let labelField = null;

            if ( label ) {
                const labelField = document.createElement( "LABEL" );
                labelField.textContent = label;
                field.appendChild( labelField );
            }

            let ui = null;
            const that = this;

            if ( format == Binder.BOOLEAN ) {
                ui = document.createElement( "INPUT" );
                ui.required = required;
                ui.name = name;
                ui.type = "checkbox";
                ui.checked = defaultValue;
                ui.addEventListener( "change", (e) => {
                    that.#write( e.target, e.target.name, e.target.checked, validator, formatter );
                } );
            } else 
            if ( format == Binder.TEXT_BLOC ) {
                ui = document.createElement( "TEXTAREA" );
                ui.required = required;
                ui.name = name;
                ui.value = defaultValue;
                ui.addEventListener( "input", ( e ) => {
                    that.#write( e.target, e.target.name, e.target.value, validator, formatter );
                } );
            } else 
            if ( format == Binder.LIST ) {
                ui = document.createElement( "SELECT" );
                ui.required = required;
                ui.name = name;
                if ( Array.isArray( defaultValue ) ) {
                    if ( defaultValue.length > 0 ) {
                        const selection = defaultValue[ 0 ];
                        defaultValue.forEach( ( value ) => {
                            const option = document.createElement( "OPTION" );
                            option.value = value;
                            option.textContent = value;
                            option.selected = ( value == selection );
                            ui.appendChild( option );
                        } );
                    }
                }
                ui.addEventListener( "change", (e) => {
                    that.#write( e.target, e.target.name, e.target.value, validator, formatter );
                } );
            } else    
            // Default TEXT_LINE
            {
                ui = document.createElement( "INPUT" );
                ui.required = required;
                ui.name = name;
                ui.type = "text";
                ui.value = defaultValue;

                ui.addEventListener( "input", ( e ) => {
                    that.#write( e.target, e.target.name, e.target.value, validator, formatter );
                } );
            }

            field.appendChild( ui );
            return { container:field, label:labelField, field:ui };
        }

        createField( { label, name, format = Binder.TEXT_LINE, required = false, defaultValue, validator, formatter } ) {    
            if ( typeof defaultValue == "undefined" ) {
                // Try the current object
                defaultValue = this.#result[ name ];
            }
            if ( defaultValue ) {
                if ( Array.isArray( defaultValue ) && defaultValue.length > 0 ) {
                    this.#result[ name ] = defaultValue[ 0 ];
                } else {
                    this.#result[ name ] = defaultValue;
                }
            }
            const all = this.#buildField( { label, name, format, required, defaultValue, validator, formatter } );
            this.#bindingListener && this.#bindingListener( { name, ...all } );
            this.#root.appendChild( all.container );
            return all;
        }

        result() { return this.#result };

        #updateListener

        /** Listener each time a value is updated */
        onUpdate(updateListener) {
            this.#updateListener=updateListener;
        }

        #bindingListener

        /** Listener each time a field is built */
        onBinding(bindingListener) {
            this.#bindingListener = bindingListener;
        }

        #errorListener

        /** Called each time the validator rejects a value */
        onError(errorListener ) {
            this.#errorListener = errorListener;
        }

        #write( field, name, value, validator, formatter ) {
            if ( !validator || ( typeof validator == "function" && validator( value ) ) ) {
                this.#result[ name ] = typeof formatter == "function" ? formatter( value ) : value;
                if ( this.#updateListener ) {
                    this.#updateListener( { name, value } );
                }
            } else {
                this.#errorListener && this.#errorListener( { field, name, value } );
            }
        }
    }

    class Binder {
        // On line field
        static TEXT_LINE = 0;
        // Multi line field
        static TEXT_BLOC = 1;
        // Checkbox
        static BOOLEAN = 2;        
        // Select
        static LIST = 3;

        createGroup( container, data, className ) {
            return new FieldGroup( container, data, className );
        }
    }

    $$.binder = {
        TEXT_LINE:Binder.TEXT_LINE,
        TEXT_BLOC:Binder.TEXT_BLOC,
        BOOLEAN:Binder.BOOLEAN,
        LIST:Binder.LIST,
        createGroup:( ...args ) => new Binder().createGroup( ...args )
    }

} )( typeof $$ == "undefined" ? window : $$ );

