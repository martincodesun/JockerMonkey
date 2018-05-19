

'use strict';

var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();

var dappAddress = "n1emUoYaQbTixYd7cCRL3usFHLyqeN9XANZ";

var SHOW_NUM_PER_PAGE = 10;

var Pagination = function() {
    this.clickCallBack = null;
    this.list_index = [];
    this.page_size = SHOW_NUM_PER_PAGE;
    this.showGoInput = true;
    this.showGoButton = true;

    this.intervalGood = null;
    this.sNumGood = null;
    this.intervalBad = null;
    this.sNumBad = null;
    this.intervalComment = null;
    this.sNumComment = null;
};

Pagination.prototype = {
    // 初始化
    init: function(totalNum, clickCallBack) {
        this.clickCallBack = clickCallBack;
        for(var i = 1; i <= totalNum; i++) {
            this.list_index.push(i);
        }
    },

    // 显示分页插件
    showPagination: function() {
        var self = this;
        $('#pagination').pagination({
            dataSource: this.list_index,
            pageSize: this.page_size,
            showGoInput: true,
            showGoButton: true,
            callback: function(data, pagination) {
                var click_page_num = pagination.pageNumber;
                var list_offset = data[0];
                self.onChoosePageEvent(click_page_num, list_offset);
            }
        })
    },

    // 选择页事件
    onChoosePageEvent: function(click_page_num, list_offset) {
        //这里执行更新页面逻辑
        var self = this;
        self.clickCallBack(click_page_num);
    },
}

var JockShow = function() {
    this.paginationObj = new Pagination();
    this.comment_jock_id = "";
    this.curClickCommentJQ = null;
    this.addComment = {
        "commentName": "",
        "content": "",
        "commentTime": "",
    };
}
JockShow.prototype = {

    init: function() {
        this.queryTotalNum();
        this.bindClickComment();
        this.bindCommentEvent();
        this.bindClickGood();
        this.bindClickBad();
        this.bindClickShang();
    },
    
    queryTotalNum: function() {
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "getPunsterTxt_list_size",
                    "args" : ""
                }
            },
            "method": "neb_call"
        }, "*");
    },

    queryJockListByPageNum: function(page_num) {
        var req_args = [];
        req_args.push(SHOW_NUM_PER_PAGE);
        req_args.push(page_num);
        if (page_num != 1) {
            $("#jock_list").hide();
            $("#no_jock_warning").hide();
            $("#loading_data_list").show();
        }
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_punsterTxt_list_by_page",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },

    listenWindowMessage: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            // e.detail contains the transferred data
            if(e.data && e.data.data && e.data.data.neb_call) {
                // 收到返回数据
                if(e.data.data.neb_call.result) {
                    // 解析数据
                    var obj = JSON.parse(e.data.data.neb_call.result);
                    if (obj.type == "query_punsterTxt_list_by_page") {
                        self.parseJockList(obj);
                    } else if (obj.type == "getPunsterTxt_list_size") {
                        self.parseJockNumInfo(obj);
                    } else if (obj.type == "query_commentItem_list_by_punsterTxtId") {
                        self.parseCommentList(obj);
                    }
                    else {
                        console.log("no need attation");
                    }
                    console.log(obj);
                } else {
                    console.log("Get Data From Constract Faield");
                }
            }
        });
    },

    parseJockNumInfo: function(num_obj) {
        var self = this;
        var jock_num = num_obj.num;
        if (jock_num > 0) {
            var jock_num = num_obj.num;
            // 初始化分页组件
            self.paginationObj.init(jock_num, self.onChangePageEvent.bind(self));
            self.paginationObj.showPagination();
        } else {
            $("#loading_data").hide();
            $("#main_data").show();
            $("#loading_data_list").hide();
            $("#no_jock_warning").show();
            console.log("暂无段子");
        }
    },

    parseJockList: function(jock_list_obj) {
        console.log(JSON.stringify(jock_list_obj));
        if (jock_list_obj.data && jock_list_obj.data.length > 0) {
            var jock_list = template(document.getElementById('jock_list_t').innerHTML);
            var jock_list_html = jock_list({list: jock_list_obj.data});
            $("#jock_list").empty();
            $("#jock_list").append(jock_list_html);
        }
        $("#loading_data").hide();
        $("#main_data").show();
        $("#loading_data_list").hide();
        $("#no_jock_warning").hide();
        $("#jock_list").show();
        
        
    },

    parseCommentList: function(comment_obj) {
        console.log(JSON.stringify(comment_obj));
        $("#comment_list").empty();
        if (comment_obj.data && comment_obj.data.length > 0) {
            var comment_list = template(document.getElementById('comment_list_t').innerHTML);
            var comment_list_html = comment_list({list: comment_obj.data});
            
            $("#comment_list").append(comment_list_html);
            $("#no_comment_warning").hide();
        } else {
            $("#no_comment_warning").show();
        }
        $("#loading_comment").hide();
        $("#comment_list").show();
        
    },

    onChangePageEvent: function(click_page_num) {
        var self = this;
        console.log("click_page_num = " + click_page_num);
        self.queryJockListByPageNum(click_page_num);
    },

    bindClickComment:function() {
        var self = this;
        $("#jock_list").on("click", ".tag_comment", function() {
            // 点击评论按钮
            var jock_item = $(this).closest("li");
            var jock_id = jock_item.attr("data_id");

            $("#loginModal").show();
            $("#loginModal").modal('show'); 
            $("#no_comment_warning").hide();
            self.curClickCommentJQ = $(this).closest("span");;

            // 查找数据
            self.comment_jock_id = jock_id;

            self.queryCommentListByPageNum(jock_id);
        });
    },

    queryCommentListByPageNum: function(jock_id) {
        var req_args = [];
        req_args.push(jock_id);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_commentItem_list_by_punsterTxtId",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
        $("#comment_list").hide();
        $("#loading_comment").show();
    },

    bindClickGood: function() {
        var self = this;
        $("#jock_list").on("click", ".tag_good", function() {
            // 点击赞按钮
            var clickObj = $(this).closest("span");
            var jock_item = $(this).closest("li");
            var user_id = jock_item.attr("data_from");
            var jock_id = jock_item.attr("data_id");
            var req_args = [];
            var req_data = {
                "from": "12",
                "punsterTxtId": jock_id
            };
            req_args.push(req_data);

            self.sNumGood = nebPay.call(dappAddress, 0, "add_goodItem_to_list", JSON.stringify(req_args), {    //使用nebpay的call接口去调用合约,
                // listener: self.cbPush        //设置listener, 处理交易返回信息
            });
    
            self.intervalGood = setInterval(function () {
                self.funcIntervalGood($(clickObj));
            }, 5000);
        });
    },

    funcIntervalGood: function(clickObj) {
        var self = this;
        nebPay.queryPayInfo(self.sNumGood)   //search transaction result from server (result upload to server by app)
            .then(function (resp) {
                var respObject = JSON.parse(resp);
                if(respObject.code === 0){
                    var sPan = clickObj.closest("span");
                    var sChild = sPan.find("span");
                    var curGoodNum = parseInt(sChild.text());
                    curGoodNum++;
                    clickObj.closest("span").find("span").text(curGoodNum);
                    window.clearInterval(self.intervalGood);
                }
            })
            .catch(function (err) {
                console.log(err);
            });
    },

    bindClickBad: function() {
        var self = this;
        $("#jock_list").on("click", ".tag_bad", function() {
            var clickObj = $(this).closest("span");
            // 点击踩按钮
            var jock_item = $(this).closest("li");
            var user_id = jock_item.attr("data_from");
            var jock_id = jock_item.attr("data_id");
            var req_args = [];
            var req_data = {
                "punsterTxtId": jock_id
            };
            req_args.push(req_data);

            self.sNumBad = nebPay.call(dappAddress, 0, "add_badItem_to_list", JSON.stringify(req_args), {    //使用nebpay的call接口去调用合约,
                // listener: self.cbPush        //设置listener, 处理交易返回信息
            });
    
            self.intervalBad = setInterval(function () {
                self.funcIntervalBad($(clickObj));
            }, 5000);
        });
    },

    funcIntervalBad: function(clickObj) {
        var self = this;
        nebPay.queryPayInfo(self.sNumBad)   //search transaction result from server (result upload to server by app)
            .then(function (resp) {
                var respObject = JSON.parse(resp);
                if(respObject.code === 0){
                    // 更新数字
                    var sPan = clickObj.closest("span");
                    var sChild = sPan.find("span");
                    var curBadNum = parseInt(sChild.text());
                    curBadNum++;
                    clickObj.closest("span").find("span").text(curBadNum);
                    window.clearInterval(self.intervalBad);
                }
            })
            .catch(function (err) {
                console.log(err);
            });
    },

    bindClickShang: function() {
        var self = this;
        $("#jock_list").on("click", ".tag_give", function() {
            var clickObj = this;
            // 点击踩按钮
            var jock_item = $(this).closest("li");
            var user_id = jock_item.attr("data_from");

            nebPay.pay(user_id, 0.01, {
                qrcode: {
                    showQRCode: false
                },
                goods: {
                    name: "reward",
                    desc: "reward for your jock"
                },
                //callback: cbSendTx
                listener: self.rewardRlt
            });
    
            self.intervalBad = setInterval(function () {
                self.funcIntervalBad($(clickObj));
            }, 5000);
        });
    },

    rewardRlt: function(resp) {
    },

    bindCommentEvent: function() {
         var self = this;
        $("#comment_submit").click(function() {
            var commentTitle = $("#comment_title").val();
            var commentContent = $("#comment_content").val();
            var warning_note = "";
            if(commentTitle == "") {
                warning_note = "标题不能为空";
                $("#comment_warning").html("<strong>注意: </strong>" + warning_note);
                $("#comment_warning").show();
                // 弹框
                return;
            }
            if(commentContent == "") {
                warning_note = "评论内容不能为空";
                $("#comment_warning").html("<strong>注意: </strong>" + warning_note);
                $("#comment_warning").show();
                // 弹框
                return;
            }
            // 存储
            var func = "add_commentItem_to_list";
            var req_arg_item = {
                "from": "12",
                "commentName": commentTitle,
                "content": commentContent,
                "punsterTxtId": self.comment_jock_id,
                "commentTime": self.getNowFormatDate(),
            };
            self.addComment.commentName = commentTitle;
            self.addComment.content = commentContent;
            var req_args = [];
            req_args.push(req_arg_item);

            self.sNumComment = nebPay.call(dappAddress, 0, func, JSON.stringify(req_args), {    //使用nebpay的call接口去调用合约,
                // listener: self.cbPush        //设置listener, 处理交易返回信息
            });
    
            self.intervalComment = setInterval(function () {
                self.funcIntervalComment();
            }, 5000);
    
        });
    },

    funcIntervalComment: function() {
        var self = this;
        nebPay.queryPayInfo(self.sNumComment)   //search transaction result from server (result upload to server by app)
            .then(function (resp) {
                var respObject = JSON.parse(resp);
                if(respObject.code === 0){
                    // 增加评论个数
                    var curCommentNum = parseInt(self.curClickCommentJQ.find("span").text());
                    curCommentNum++;
                    self.curClickCommentJQ.find("span").text(curCommentNum);

                    // 添加评论到列表中
                    $("#no_comment_warning").hide();
                    self.addComment.commentTime = self.getNowFormatDate();
                    var comment_list = template(document.getElementById('comment_list_t').innerHTML);
                    var data = [];
                    data.push(self.addComment);
                    var comment_list_html = comment_list({list: data});
                    $("#comment_list").prepend(comment_list_html);
                    window.clearInterval(self.intervalComment);
                }
            })
            .catch(function (err) {
                console.log(err);
            });
    },

    getNowFormatDate: function() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                + " " + date.getHours() + seperator2 + date.getMinutes()
                + seperator2 + date.getSeconds();
        return currentdate;
    },
}

var jockShowObj;

function checkNebpay() {
    console.log("check nebpay")
    try{
        var NebPay = require("nebpay");
    }catch(e){
        //alert ("Extension wallet is not installed, please install it first.")
        console.log("no nebpay");
        $("#noExtension").removeClass("hide")
    }

    // 环境ok，拉取数据
    jockShowObj = new JockShow();
    jockShowObj.listenWindowMessage();
    jockShowObj.init();
    
}



function initPage() {
    $("#main_data").hide();
    $("#loading_data").show();
    $("#no_jock_warning").hide();
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        setTimeout(checkNebpay,1000);
    });
}

initPage();
    