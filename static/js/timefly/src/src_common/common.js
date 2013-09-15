define(function(require, exports, module){
    var _ = require('underscore');
    var Backbone = require('backbone');

    var UserModel = Backbone.Model.extend({});
    var UserCollection = Backbone.Collection.extend({
        model: UserModel,
        parse: function(res){
            return res.data.items;
        }
    });

    var SideBar = Backbone.View.extend({


        boxs: [],

        render: function(){
            this.addBoxs();
            return this;
        },

        addBoxs: function(){
            if(!_.isArray(this.boxs) || _.size(this.boxs) <= 0) return;
            this.$el.empty();
            _.each(this.boxs, function(box){
                this.$el.append(box.render().el);
            }, this);
        }
    });

    var Content = Backbone.View.extend({

    });

    var Header = Backbone.View.extend({

    });

    var Footer = Backbone.View.extend({

    });

    var init = function(context, Componentes){
        var header = Componentes.header || new Header(),
            sideBar = Componentes.sideBar || new SideBar(),
            content = Componentes.content || new Content(),
            footer = Componentes.footer || new Footer();
        context.header.html(header.render().el);
        context.sideBar.html(sideBar.render().el);
        context.content.html(content.render().el);
        context.footer.html(footer.render().el)
    };

    module.exports = {
        Views:{
            SiderBar: SideBar,
            Content: Content,
            Header: Header,
            Footer: Footer
        },
        Models: {
            UserModel: UserModel
        },
        Collections: {
            UserCollection: UserCollection
        },
        init: init
    };
});