"use strict";

var PunsterTxt = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;//id=from+'_'+时间戳
        this.title = obj.title;
        this.content = obj.content;
        this.punsterName = obj.punsterName;
        this.publishTime = obj.publishTime;
        this.goodNum = obj.goodNum;
        this.badNum = obj.badNum;
        this.commentNum = obj.commentNum;
        this.from = obj.from;
	} else {
	    this.id = "";
        this.title = "";
        this.content = "";
        this.punsterName = "";
        this.publishTime =  "";
        this.goodNum = 0;
        this.badNum = 0;
        this.commentNum = 0;
        this.from = "";
	}
};
var CommentItem = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;//id=from+'_'+时间戳
        this.punsterTxtId = obj.punsterTxtId;
        this.content = obj.content;
        this.commentName = obj.commentName;
        this.commentTime = obj.commentTime;
        this.from = obj.from;
	} else {
        this.id = "";
        this.punsterTxtId = "";
        this.content = "";
        this.commentName = "";
        this.commentTime = "";
        this.from = "";
	}
};
var GoodItem = function(text) {//点赞记录信息
	if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;//id=from+'_'+时间戳
        this.punsterTxtId = obj.punsterTxtId;
        this.recordTime = obj.recordTime;
        this.from = obj.from;
	} else {
        this.id = "";
        this.punsterTxtId = "";
        this.recordTime = "";
        this.from = "";
	}
};
var BadItem = function(text) {//嘘Ta记录信息
	if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;//id=from+'_'+时间戳
        this.punsterTxtId = obj.punsterTxtId;
        this.recordTime = obj.recordTime;
        this.from = obj.from;
	} else {
        this.id = "";
        this.punsterTxtId = "";
        this.recordTime = "";
        this.from = "";
	}
};

PunsterTxt.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
CommentItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
GoodItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
BadItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var PunsterDapp = function() {
    // 1. 先创建GoldSunStorage对象（用于存储数据）
    // 2. 定义数据结构，该行代码作用：为PunsterDapp创建一个属性punsterTxt_list，该属性是一个list结构，list中存储的是PunsterTxt对象
    //段子列表
    LocalContractStorage.defineMapProperty(this, "punsterTxt_list", {
        parse: function (text) {
            return new PunsterTxt(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // 定义一个参数，记录punsterTxt_list的长度
    LocalContractStorage.defineProperty(this, "punsterTxt_list_size");
    // 定义一个存储string的list
    LocalContractStorage.defineMapProperty(this, "punsterTxt_list_array");
    //评论列表
    LocalContractStorage.defineMapProperty(this, "commentItem_list", {
        parse: function (text) {
            return new CommentItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // 定义一个参数，记录commentItem_list的长度
    LocalContractStorage.defineProperty(this, "commentItem_list_size");
    // 定义一个存储string的list
    LocalContractStorage.defineMapProperty(this, "commentItem_list_array");
    //点赞列表
    LocalContractStorage.defineMapProperty(this, "goodItem_list", {
        parse: function (text) {
            return new GoodItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // 定义一个参数，记录goodItem_list的长度
    LocalContractStorage.defineProperty(this, "goodItem_list_size");
    // 定义一个存储string的list
    LocalContractStorage.defineMapProperty(this, "goodItem_list_array");
    //嘘Ta列表
    LocalContractStorage.defineMapProperty(this, "badItem_list", {
        parse: function (text) {
            return new BadItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // 定义一个参数，记录badItem_list的长度
    LocalContractStorage.defineProperty(this, "badItem_list_size");
    // 定义一个存储string的list
    LocalContractStorage.defineMapProperty(this, "badItem_list_array");
}
PunsterDapp.prototype = {
    // 初始化方法，在使用ApiSample之前，务必要调用一次(而且只能调用一次)，所有的初始化逻辑都放到这里
    init: function() {
        if (this.punsterTxt_list_size == null) {
            this.punsterTxt_list_size = 0;
        }
        if (this.commentItem_list_size == null) {
            this.commentItem_list_size = 0;
        }
        if (this.goodItem_list_size == null) {
            this.goodItem_list_size = 0;
        }
        if (this.badItem_list_size == null) {
            this.badItem_list_size = 0;
        }
    },
    // 添加一个段子到list中
    add_punsterTxt_to_list: function(text) {
        var addResult = {
            success : false,
            message : "",
            type : "add_punsterTxt_to_list"
        };
        var obj = text;
        obj.from = Blockchain.transaction.from;
        var timestamp = new Date().getTime();//当前时间戳，精确到毫秒，如：1280977330748
        obj.id = obj.from + "_" + timestamp;//id=from+'_'+时间戳
        obj.title = obj.title.trim();
        obj.content = obj.content.trim();
        obj.punsterName = obj.punsterName.trim();
        obj.publishTime = obj.publishTime;

        if(obj.title===""|| obj.content===""||obj.punsterName===""){
            addResult.success = false;
            addResult.message = "empty title / content / punsterName.";
            return addResult;
        }
        if (obj.title.length > 256 || obj.punsterName.length > 64){
            addResult.success = false;
            addResult.message = "title / punsterName  exceed limit length. title'length is 256. punsterName's length is 64.";
            return addResult;
        }
        var punsterTxt = new PunsterTxt();
        punsterTxt.id = obj.id;
        punsterTxt.title = obj.title;
        punsterTxt.content = obj.content;
        punsterTxt.punsterName = obj.punsterName;
        punsterTxt.publishTime = obj.publishTime;
        punsterTxt.from = obj.from;
        punsterTxt.goodNum = 0;
        punsterTxt.badNum = 0;
        punsterTxt.commentNum = 0;

        var index = this.punsterTxt_list_size;
        this.punsterTxt_list_array.put(index,punsterTxt.id);
        this.punsterTxt_list.put(punsterTxt.id, punsterTxt);
        this.punsterTxt_list_size +=1;
        addResult.success = true;
        addResult.message = "You successfully add a Duanzi!";
        return addResult;
    },
    getPunsterTxt_list_size : function(){
        var result = {
            type: "getPunsterTxt_list_size",
            num: this.punsterTxt_list_size,
        };
        return result;
    },
    // 根据id从list中查找段子
    query_punsterTxt_by_id: function(key) {
        var result = {
            success : false,
            type: "query_punsterTxt_by_id",
            punsterTxt : ""
        };
        key = key.trim();
        if ( key === "" ) {
            result.success = false;
            result.punsterTxt = "";
            return result;
        }
        var punsterTxt = this.punsterTxt_list.get(key);
        if(punsterTxt){
            result.success = true;
            result.punsterTxt = punsterTxt;
        }else{
            result.success = false;
            result.punsterTxt = "";
        }
        return result;
    },
    //按插入顺序倒序分页查询段子列表，pagesize：每页大小，page：页号，第一页为1
    query_punsterTxt_list_by_page : function(pagesize,page){
        var result = {
            success : false,
            type : "query_punsterTxt_list_by_page",
            message : "",
            maxPage : 1,
            page : 1,
            pagesize : 1,
            data : []
        };
        if(this.punsterTxt_list_size <= 0){
            result.success = false;
            result.message = "no data";
            return result;
        }
        pagesize = parseInt(pagesize);
        page = parseInt(page);
        if(pagesize < 1){
            result.success = false;
            result.message = "pagesize is not valid";
            return result;
        }
        if(pagesize > this.punsterTxt_list_size){
            pagesize = this.punsterTxt_list_size;
        }
        if(page < 1){
            page = 1;
        }
        var maxPage = Math.ceil(this.punsterTxt_list_size/pagesize);
        if(page > maxPage){
            result.success = false;
            result.message = "page is not valid";
            return result;
        }
        result.maxPage = maxPage;
        result.page = page;
        result.pagesize = pagesize;
        var offset = this.punsterTxt_list_size-1-(page-1)*pagesize;
        var number = offset-pagesize+1;
        if(number < 0){
          number = 0;
        }
        var key;
        var punsterTxt;
        for(var i=offset;i>=number;i--){
            key = this.punsterTxt_list_array.get(i);
            punsterTxt = this.punsterTxt_list.get(key);
            result.data.push(punsterTxt);
        }
        result.success = true;
        return result;
    },
    query_punsterTxt_list_by_page222 : function(pagesize,page){
        var result = this.query_list_by_page(this.punsterTxt_list,this.punsterTxt_list_array,this.punsterTxt_list_size,pagesize,page);
        result["type"] = "query_punsterTxt_list_by_page222";
        return result;
    },
    //添加一个段子的一条评论到list中
    add_commentItem_to_list: function(text) {
        var addResult = {
            success : false,
            message : "",
            type : "add_commentItem_to_list"
        };
        var obj = text;
        obj.punsterTxtId = obj.punsterTxtId.trim();
        var result = this.query_punsterTxt_by_id(obj.punsterTxtId);
        if(result.success){
            obj.from = Blockchain.transaction.from;
            var timestamp = new Date().getTime();//当前时间戳，精确到毫秒，如：1280977330748
            obj.id = obj.from + "_" + timestamp;//id=from+'_'+时间戳
            obj.content = obj.content.trim();
            obj.commentName = obj.commentName.trim();
            obj.commentTime = obj.commentTime;
            if(obj.content===""|| obj.commentName===""){
                addResult.success = false;
                addResult.message = "empty content / commentName.";
                return addResult;
            }
            if (obj.commentName.length > 64 || obj.content.length > 256){
                addResult.success = false;
                addResult.message = "content / commentName  exceed limit length. content'length is 256. commentName's length is 64.";
                return addResult;
            }
            var commentItem = new CommentItem();
            commentItem.id = obj.id;
            commentItem.punsterTxtId = obj.punsterTxtId;
            commentItem.content = obj.content;
            commentItem.commentName = obj.commentName;
            commentItem.commentTime = obj.commentTime;
            commentItem.from = obj.from;
            var index = this.commentItem_list_size;
            this.commentItem_list_array.put(index,commentItem.id);
            this.commentItem_list.put(commentItem.id, commentItem);
            this.commentItem_list_size +=1;
            //将段子的评论数量+1
            var punsterTxt = result.punsterTxt;
            var commentNum = punsterTxt.commentNum;
            punsterTxt.commentNum = commentNum + 1;
            this.punsterTxt_list.put(punsterTxt.id, punsterTxt);
            addResult.success = true;
            addResult.message = "You successfully add ths Duanzi's comment!";
            return addResult;
        }else{
            addResult.success = false;
            addResult.message = "Can not find the Duanzi!";
            return addResult;
        }
    },
    commentItem_list_size : function(){
        return this.commentItem_list_size;
    },
    //根据段子Id查询该段子的评论列表(按插入顺序倒序)
    query_commentItem_list_by_punsterTxtId : function(punsterTxtId){
        var result = {
            success : false,
            type : "query_commentItem_list_by_punsterTxtId",
            message : "",
            data : []
        };
        punsterTxtId = punsterTxtId.trim();
        if ( punsterTxtId === "" ) {
            result.success = false;
            result.message = "empty punsterTxtId";
            return result;
        }
        if(this.commentItem_list_size<=0){
            result.success = false;
            result.message = "no data";
            return result;
        }
        var qResult = this.query_punsterTxt_by_id(punsterTxtId);
        if(qResult.success){
            var number = this.commentItem_list_size-1;
            var commentItem;
            var key;
            for(var i=number;i>=0;i--){
                key = this.commentItem_list_array.get(i);
                commentItem = this.commentItem_list.get(key);
                if(commentItem&&commentItem.punsterTxtId==punsterTxtId){
                    result.data.push(commentItem);
                }
            }
            if(result.data.length>0){
                result.success = true;
            }else{
                result.success = false;
                result.message = "no data";
            }
        }else{
            result.success = false;
            result.message = "no data";
        }
        return result;
    },
    //添加一个段子的一条点赞记录到list中
    add_goodItem_to_list: function(text) {
        var addResult = {
            success : false,
            message : "",
            type : "add_goodItem_to_list"
        };
        var obj = text;
        obj.punsterTxtId = obj.punsterTxtId.trim();
        var result = this.query_punsterTxt_by_id(obj.punsterTxtId);
        if(result.success){
            obj.from = Blockchain.transaction.from;
            var timestamp = new Date().getTime();//当前时间戳，精确到毫秒，如：1280977330748
            obj.id = obj.from + "_" + timestamp;//id=from+'_'+时间戳
            obj.recordTime = new Date();
            var goodItem = new GoodItem();
            goodItem.id = obj.id;
            goodItem.punsterTxtId = obj.punsterTxtId;
            goodItem.recordTime = obj.recordTime;
            goodItem.from = obj.from;
            var index = this.goodItem_list_size;
            this.goodItem_list_array.put(index,goodItem.id);
            this.goodItem_list.put(goodItem.id, goodItem);
            this.goodItem_list_size +=1;
            //将段子的点赞数量+1
            var punsterTxt = result.punsterTxt;
            var goodNum = punsterTxt.goodNum;
            punsterTxt.goodNum = goodNum + 1;
            this.punsterTxt_list.put(punsterTxt.id, punsterTxt);
            addResult.success = true;
            addResult.message = "You successfully add ths Duanzi's Zan!";
            return addResult;
        }else{
            addResult.success = false;
            addResult.message = "Can not find the Duanzi!";
            return addResult;
        }
    },
    goodItem_list_size : function(){
        return this.goodItem_list_size;
    },
    //添加一个段子的一条嘘Ta记录到list中
    add_badItem_to_list: function(text) {
        var addResult = {
            success : false,
            message : "",
            type : "add_badItem_to_list"
        };
        var obj = text;
        obj.punsterTxtId = obj.punsterTxtId.trim();
        var result = this.query_punsterTxt_by_id(obj.punsterTxtId);
        if(result.success){
            obj.from = Blockchain.transaction.from;
            var timestamp = new Date().getTime();//当前时间戳，精确到毫秒，如：1280977330748
            obj.id = obj.from + "_" + timestamp;//id=from+'_'+时间戳
            obj.recordTime = new Date();
            var badItem = new BadItem();
            badItem.id = obj.id;
            badItem.punsterTxtId = obj.punsterTxtId;
            badItem.recordTime = obj.recordTime;
            badItem.from = obj.from;
            var index = this.badItem_list_size;
            this.badItem_list_array.put(index,badItem.id);
            this.badItem_list.put(badItem.id, badItem);
            this.badItem_list_size +=1;
            //将段子的嘘Ta数量+1
            var punsterTxt = result.punsterTxt;
            var badNum = punsterTxt.badNum;
            punsterTxt.badNum = badNum + 1;
            this.punsterTxt_list.put(punsterTxt.id, punsterTxt);
            addResult.success = true;
            addResult.message = "You successfully add ths Duanzi's XuTa!";
            return addResult;
        }else{
            addResult.success = false;
            addResult.message = "Can not find the Duanzi!";
            return addResult;
        }
    },
    badItem_list_size : function(){
        return this.badItem_list_size;
    },
    /**
     * 按插入顺序倒序分页查询列表
     * list_name:存储对象的列表
     * array_name:存储对象列表顺序和key的数组
     * list_size:存储对象的列表长度
     * pagesize：每页大小
     * page：页号，第一页为1
    */
    query_list_by_page : function(list_name,array_name,list_size,pagesize,page){
        var result = {
            success : false,
            message : "",
            maxPage : 1,
            page : 1,
            pagesize : 1,
            data : []
        };
        list_size = parseInt(list_size);
        if(list_size <= 0){
            result.success = false;
            result.message = "no data";
            return result;
        }
        pagesize = parseInt(pagesize);
        page = parseInt(page);
        if(pagesize < 1){
            result.success = false;
            result.message = "pagesize is not valid";
            return result;
        }
        if(pagesize > list_size){
            pagesize = list_size;
        }
        if(page < 1){
            page = 1;
        }
        var maxPage = Math.ceil(list_size/pagesize);
        if(page > maxPage){
            result.success = false;
            result.message = "page is not valid";
            return result;
        }
        result.maxPage = maxPage;
        result.page = page;
        result.pagesize = pagesize;
        var offset = list_size-1-(page-1)*pagesize;
        var number = offset-pagesize+1;
        if(number < 0){
          number = 0;
        }
        var key;
        var object;
        for(var i=offset;i>=number;i--){
            key = array_name.get(i);
            object = list_name.get(key);
            result.data.push(object);
        }
        result.success = true;
        return result;
    },
};

// window.PunsterDapp = PunsterDapp;
module.exports = PunsterDapp;