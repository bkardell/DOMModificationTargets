define([], function () {
    var mixin = function (target, source) {
        target = target || {};
        for (var prop in source) {
            if (typeof source[prop] === 'object') {
                target[prop] = mixin(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    };
        
    var map = {
        option: {
            depth: 1,
            prefix: '<select multiple="multiple">',
            suffix: '</select>'
        },
        optgroup: {
            depth: 1,
            prefix: '<select multiple="multiple">',
            suffix: '</select>'
        },
        legend: {
            depth: 1,
            prefix: '<fieldset>',
            suffix: '</fieldset>'
        },
        tr: {
            depth: 2,
            prefix: '<table><tbody>',
            suffix: '</tbody></table>'
        },
        col: {
            depth: 2,
            prefix: '<table><tbody></tbody><colgroup>',
            suffix: '</colgroup></table>'
        },
        _default: {
            depth: 0,
            prefix: '',
            suffix: ''
        }
    };

    map.thead = map.tbody = map.tfoot = map.colgroup = map.caption = {
        depth: 1,
        prefix: '<table>',
        suffix: '</table>'
    };

    map.td = map.th = {
        depth: 3,
        prefix: '<table><tbody><tr>',
        suffix: '</tr></tbody></table>'
    };


    var getWrap = function (tagName) {
        return (map[tagName]) ? map[tagName] : {
            prefix: '',
            suffix: ''
        };
    };

    var getFromDepth = function (el, depth) {
        if (depth <= 0) {
            return el.children;
        }
        return getFromDepth(el.firstChild, --depth);
    };

    var Mutatable = function (arg) {
        this.collection = asArray('select', arg);
        return this;
    };

    var baseClassMutator = function (method) {
        var args = Array.prototype.slice.call(arguments[1]);
        this.collection.forEach(function (el) {
            el.classList[method].apply(el.classList, args);
        });
    };


    mixin(
        Mutatable.prototype, {
            append: function (elsOrMarkup) {
                this.collection.forEach(function (el) {
                    el.appendChild(toFragment(elsOrMarkup));
                });
                return this;
            },
            replaceWith: function (elsOrMarkup) {
                this.collection.forEach(function (el) {
                    el.parentNode.replaceChild(toFragment(elsOrMarkup), el);
                });
                return this;
            },
            prepend: function (elsOrMarkup) {
                this.collection.forEach(function (el) {
                    el.insertBefore(toFragment(elsOrMarkup), el.firstChild);
                });
                return this;
            },
            replaceContent: function (elsOrMarkup) {
                this.collection.forEach(function (el) {
                    el.innerHTML = '';
                    el.appendChild(toFragment(elsOrMarkup));
                });
            },
            remove: function () {
                this.collection.forEach(function (el) {
                    el.parentNode.removeChild(el);
                });
                return this;
            },
            addClass: function () {
                baseClassMutator.call(this, 'add', arguments);
                return this;
            },
            removeClass: function () {
                baseClassMutatior.call(this, 'remove', arguments);
                return this;
            },
            toggle: function () {
                baseClassMutatior.call(this, 'toggle', arguments);
                return this;
            },
            setAttribute: function (k, v) {
                this.collection.forEach(function (el) {
                    el.setAttribute(k, v);
                });
                return this;
            },
            removeAttribute: function (k) {
                this.collection.forEach(function (el) {
                    el.removeAttribute(k);
                });
                return this;
            }
        }
    );



    var fromString = {
        parse: function (markup) {
            var wrapper;
            var temp = document.createElement('div');
            var tagName;
            var re = {
                single: (/^<(\w+)\s*\/?>(?:<\/\1>|)$/),
                tagName: /<([\w:]+)/
            };
            var parsed = re.single.exec(markup);
            if (parsed) {
                return [document.createElement(parsed[1])];
            }
            parsed = re.tagName.exec(markup);
            if (!parsed) {
                return [document.createTextNode(markup)];
            }
            tagName = parsed[1];
            wrapper = getWrap(tagName);
            temp.innerHTML = wrapper.prefix + markup + wrapper.suffix;
            return getFromDepth(temp, wrapper.depth || 0);
        },
        select: function (q) {
            return document.querySelectorAll(q);
        }
    };

    var asArray = function (fromStringMethod, arg) {
        var c = arg;
        if (!Array.isArray(arg)) {
            // Could be a nodelist, element or string..., would be better if we could use instanceof
            // but IE8 is why we can't have nice things.
            if ((typeof arg === 'string') || arg.tagName) {
                c = (typeof arg === 'string') ? fromString[fromStringMethod](arg) : [arg];
            }
            // freeze it...
            c = Array.prototype.slice.call(c);
        }
        return c;
    };

    var toFragment = function (elsOrMarkup) {
        var c = asArray('parse', elsOrMarkup),
            f = document.createDocumentFragment();

        for (var i = 0; i < c.length; i++) {
            f.appendChild(c[i]);
        }
        return f;
    };


    return Mutatable;
});
