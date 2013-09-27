define(function(require, exports, module){
    var libs = require('libs');
    var $ = require('$');
    var _ = require('underscore');
    var Backbone = require('backbone');

    // Models
    var BaseModel = Backbone.Model.extend({});

    // Collections
    var BaseCollection = Backbone.Collection.extend({
        model: BaseModel,
        parse: function(res){
            return res.data.items;
        }
    });

    // Views
    var Item = Backbone.View.extend({
        render: function(){
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var ItemsContainer = Backbone.View.extend({

        itemContainer: null,

        initialize: function(){
            if(this.collection){
                this.collection.bind("add", this.addItem, this)
            }else
                console.warn("No collection!");
            this.ItemView = this.ItemView || this.options.ItemView;
        },

        render: function(){
            this.$el.html(this.template());
            return this;
        },

        addItems: function(){
            if(this.itemContainer)
                this.$(this.itemContainer).empty();
            else
                this.$el.empty();
            if(!this.ItemView) {
                console.warn("No ItemView!");
                return;
            }
            this.collection.each(function(model){
                this.addItem(model);
            }, this);
        },

        addItem: function(model){
            if(!this.ItemView) {
                console.warn("No ItemView!");
                return;
            }
            var itemView = new this.ItemView({model: model});
            itemView.$el.hide();
            if(this.itemContainer)
                this.$(this.itemContainer).prepend(itemView.render().el);
            else
                this.$el.prepend(itemView.render().el);
            itemView.$el.fadeIn();
        }
    });

    var ObjectBox = Backbone.View.extend({
        className: "box",

        render: function(){
            this.$el.html(this.template(!this.model? {}:this.model.toJSON()));
            return this;
        }
    });

    var ArrayBox = ItemsContainer.extend({
        className: "box"
    });

    var Content = ItemsContainer.extend({
        className: "box",
        base_template: _.template(require("./templates/common_content.tpl")),

        render: function(){
            this.renderMainContent();
            this.renderSubContent();
            return this;
        },

        renderMainContent: function(){
            this.$el.html(this.base_template({
                title: this.title || this.options.title,
                sub_title: this.sub_title || this.options.sub_title
            }));
        },

        renderSubContent: function(){
            if(this.template)
                this.$el.append(this.template(this.options.data))
        }
    });

    var Header = Backbone.View.extend({
        template: _.template(require("./templates/common_header.tpl")),
        events: {
            "click .add-new-todo": "addNewTodo",
            "click #login-btn": "doLogin",
            "click #reg-btn": "doReg"
        },

        doLogin: function(){
            this.$("#login-form").ajaxSubmit($.proxy(function(res){
                if(res.response == 'ok'){
                    this.user = res.data.user;
                    this.render();
                }else{
                    libs.Noty.NotyWithRes(res);
                }
            }, this));
        },

        doReg: function(){

        },

        addNewTodo: function(){
            var addTodoModalTemplate = require("./templates/modals/add_todo_modal.tpl");
            var AddTodoModalView = libs.JQueryUI.Dialog.extend({
                template: _.template(addTodoModalTemplate),

                ok: function(){
                    this.$("#todo-form").ajaxSubmit($.proxy(function(res){
                        if(this.options.contentCollection){
                            this.options.contentCollection.add(res.data);
                        }
                        this.close();
                    }, this));
                },

                extraRender: function(){
                    $.datepicker.setDefaults({
                        autoSize:true,
                        showAnim:"slideDown",
                        closeText: '关闭',
                        prevText: '&#x3C;上月',
                        nextText: '下月&#x3E;',
                        currentText: '今天',
                        monthNames: ['一月','二月','三月','四月','五月','六月',
                        '七月','八月','九月','十月','十一月','十二月'],
                        monthNamesShort: ['一月','二月','三月','四月','五月','六月',
                        '七月','八月','九月','十月','十一月','十二月'],
                        dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
                        dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
                        dayNamesMin: ['日','一','二','三','四','五','六'],
                        weekHeader: '周',
                        dateFormat: 'yy-mm-dd',
                        firstDay: 1,
                        isRTL: false,
                        showMonthAfterYear: true,
                        yearSuffix: '年'
                    });
                    $("#id_todo_start").datepicker({
                        defaultDate: "+1w",
                        minDate:"+0d",
                        changeYear: true,
                        onClose: function( selectedDate ) {
                            $( "#id_todo_end" ).datepicker( "option", "minDate", selectedDate );
                        }
                    });
                    $("#id_todo_end").datepicker({
                        defaultDate: "+1w",
                        changeYear: true,
                        minDate:"+0d",
                        onClose: function( selectedDate ) {
                            $( "#id_todo_start" ).datepicker( "option", "maxDate", selectedDate );
                        }
                    });
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

    module.exports = {
        Models:{
            BaseModel: BaseModel
        },
        Collections: {
            BaseCollection: BaseCollection
        },
        Views: {
            Item: Item,
            ItemsContainer: ItemsContainer,
            ObjectBox: ObjectBox,
            ArrayBox: ArrayBox,
            Content: Content,
            Header: Header,
            Footer: Footer
        }
    }
});