

'use strict';

var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();

var dappAddress = "n1pRvDrDTDaLFTUkvSiBuBBSLsUEwMokMEQ";
var InputJock = function() {
    this.intervalQuery = null;
    this.serialNumber = null;
}
InputJock.prototype = {

    init: function() {
        var self = this;
        $("#submit").click(function() {
            self.commitJock();
        });
    },

    commitJock: function() {
        var self = this;
        var punster_name = $("#punster_name").val();
        var jock_title = $("#jock_title").val();
        var jock_content = $("#jock_content").val();
        var warning_note = "";
        if(punster_name == "") {
            warning_note = "您的昵称不能为空";
            $("#jock_warning").html("<strong>注意: </strong>" + warning_note);
            $("#jock_warning").show();
            // 弹框
            return;
        }
        if (jock_title == "") {
            warning_note = "请选择您的性别";
            $("#jock_warning").html("<strong>注意: </strong>" + warning_note);
            $("#jock_warning").show();
            // 弹框
            return;
        }
        if (jock_content == "") {
            warning_note = "请填写您的生日";
            $("#jock_warning").html("<strong>注意: </strong>" + warning_note);
            $("#jock_warning").show();
            // 弹框
            return;
        }
        // 提交
        var func = "add_punsterTxt_to_list";
        var req_arg_item = {
            "punsterName": punster_name,
            "title": jock_title,
            "content": jock_content,
            "publishTime": self.getNowFormatDate(),
            "goodNum": 0,
            "badNum": 0,
            "commentNum":0,
        };
        var req_args = [];
        req_args.push(req_arg_item);

        self.serialNumber = nebPay.call(dappAddress, 0, func, JSON.stringify(req_args), {    //使用nebpay的call接口去调用合约,
            listener: self.cbPush        //设置listener, 处理交易返回信息
        });

        self.intervalQuery = setInterval(function () {
            self.funcIntervalQuery();
        }, 15000);

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

    cbPush: function(resp) {
    },

    funcIntervalQuery: function() {
        var self = this;
        nebPay.queryPayInfo(self.serialNumber)   //search transaction result from server (result upload to server by app)
            .then(function (resp) {
                var respObject = JSON.parse(resp);
                // 条件有问题，暂时不限制
                // if(respObject.code === 0){
                //     // 跳转到首页
                    
                //     $("#loading").hide();
                //     window.setTimeout(function() {
                        
                //     }, 10000);
                    
                // }
                window.clearInterval(self.intervalQuery);
                window.location.href = "https://martincodesun.github.io/JockerMonkey/index.html";
            })
            .catch(function (err) {
                console.log(err);
            });
    }
}

var inputJockObj;

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
    inputJockObj = new InputJock();
    inputJockObj.init();
}



function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#jock_warning").hide();
        setTimeout(checkNebpay,1000);
    });
}

initPage();
    