define(function(require, exports, module){
    var libs = require('libs');
    var $ = require('$')
    var _ = require('underscore');
    var Backbone = require('backbone');

    var BaseModel = Backbone.Model.extend({});
    var BaseCollection = Backbone.Collection.extend({
        model: BaseModel,
        parse: function(res){
            return res.data.items;
        }
    });

    var SideBar = Backbone.View.extend({

        boxs: [],

        readyCount: 0,

        isReady: function(callback, args){
            this.addBoxs();
            this.timer = setInterval($.proxy(function(){
                console.info("interval:" + this.boxs.length);
                if(this.boxs.length == this.readyCount){
//                    callback.call(null, args||[]);
                    clearInterval(this.timer);
                }
            }, this), 1000)
        },

        render: function(){
            return this;
        },

        addBoxs: function(){
            console.info("add box")
            if(!_.isArray(this.boxs) || _.size(this.boxs) <= 0) return;
            this.$el.empty();
            _.each(this.boxs, function(box){
                console.info(box);
                if(box.collection){
                    box.collection.fetch({
                        success: $.proxy(function(){
                            this.$el.append(box.render().el);
                            this.readyCount ++;
                        }, this),
                        reset: true
                    });
                }
            }, this);
        }
    });

    var Item = Backbone.View.extend({
        render: function(){
            this.$el.html(this.template(this.model.toJSON()));
        }
    });

    var Content = Backbone.View.extend({
        className: "box",
        itemContainer: null,
        base_template: _.template(require("./templates/common_content.tpl")),

        initialize: function(){
            if(this.collection)
                this.collection.bind("reset", this.addItems, this);
            this.ItemView = this.ItemView || this.options.ItemView;
            this.data = this.options.data || {};
        },

        render: function(){
            if(!this.collection)
                this.renderMainContent();
            return this;
        },

        renderMainContent: function(){
            this.$el.html(this.base_template({
                title: this.title || this.options.title,
                sub_title: this.sub_title || this.options.sub_title
            }));
        },

        renderSubContent: function(){
            this.renderMainContent();
            if(this.template)
                this.$el.append(this.template(this.data))
        },

        addItems: function(){
            this.renderSubContent();
            if(!this.ItemView) {
                console.error("No ItemView");
                return;
            }
            this.collection.each(function(model){
                this.addItem(model);
            }, this);
        },

        addItem: function(model){
            var itemView = new this.ItemView({model: model});
            if(this.itemContainer)
                this.$(this.itemContainer).append(itemView.render().el);
            else
                this.$el.append(itemView.render().el);
        }
    });

    var Header = Backbone.View.extend({
        template: _.template(require("./templates/common_header.tpl")),
        events: {
            "click .add-new-todo": "addNewTodo"
        },

        addNewTodo: function(){
            var addTodoModalTemplate = require("./templates/modals/add_todo_modal.tpl");
            var AddTodoModalView = libs.JQueryUI.Dialog.extend({
                template: _.template(addTodoModalTemplate),

                ok: function(){
                    this.$("#todo-form").ajaxSubmit($.proxy(function(){
                        if(this.options.contentCollection){
                            console.info("refetch")
                            this.options.contentCollection.fetch({reset: true});
                        }
                        this.close();
                    }, this));
                }
            });
            var addTodoModal = new AddTodoModalView({
                contentCollection: this.options.contentCollection
            });
            addTodoModal.open({
                height: 410,
                width: 310,
                modal: true,
                title:"制定一个新的计划",
                resizable: false
            });
        },

        initialize: function(){
            if(!this.options.user)
                console.warn("you should pass a user obj when init header");
            else
                this.user = this.options.user
        },

        render: function(){
            this.$el.html(this.template({user: this.user}));
            return this;
        }
    });

    var Footer = Backbone.View.extend({

    });

    var initSideBar = function(context, sideBar){
        console.info("init side bar")
        sideBar.isReady(function(){
            console.info("callback")
            context.sideBar.html(sideBar.render().el);
        });
    };

    var initHeader = function(context, header){
        context.header.html(header.render().el);
    };

    var initContent = function(context, content){
        if(content.collection){
            content.collection.fetch({
                success: function(){
                    context.content.html(content.render().el);
                },
                reset: true
            });
        }else{
            context.content.html(content.render().el);
        }
    };

    var initFooter = function(context, footer){
        context.footer.html(footer.render().el);
    };

    module.exports = {
        Views:{
            SideBar: SideBar,
            Content: Content,
            Header: Header,
            Footer: Footer,
            Item: Item
        },
        Models: {
            BaseModel: BaseModel
        },
        Collections: {
            BaseCollection: BaseCollection
        },

        init: function(context, options) {
            initHeader(context, options.header || new Header({
                user: context.user,
                contentCollection: options.content.collection
            }));
            initSideBar(context, options.sidebar || new SideBar());
            initContent(context, options.content || new Content());
            initFooter(context, options.footer || new Footer());
        }
    };
});