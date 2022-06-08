//获取应用实例
import { translate } from 'utils/api'

const app = getApp();
//引入插件：微信同声传译
const plugin = requirePlugin('WechatSI');
//获取全局唯一的语音识别管理器recordRecoManager
const manager = plugin.getRecordRecognitionManager();

// pages/home/home.js
var i = 0;
//var counter = 0;
var isVoice = 1;
var voiceContent = '';

const record_manager = wx.getRecorderManager();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 语音输入
    recordState: false, //录音状态
    historyState: false, //查看历史状态
    content:'',//内容
    serveLang: 'ch', 
    voiceState: false, // 语音栏是否显示
    showField: false, // 输入栏是否显示
    // 语音输出
    src:'',
    // 原版
    message_in : [],
    message_out: [],
    input_tem: null,
    output_tem: '',
    recording: false,
    authed: false,
    result: null,
    // 翻译
    trans_qes: null,
    trans_ans: null,
    //test area
    // 选项卡当前选中的ID
    currentId: '1',
    tabData: [{
      id: '1',
      name: '中文',
    }, {
      id: '2',
      name: 'English',
    }]
  },
    // test area 
    handleChange(e) {
      this.setData({
        // 通过自定义属性获取按钮的id，进而更新当前的选中状态，进而影响类名的变化
        currentId: e.target.dataset.id
      })
      
      if(this.data.currentId == 1){
        this.setData({serveLang: 'ch'});
      }
      else{
        this.setData({serveLang: 'en'});
      }
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 原版
    // this.get_record_auth()
    //识别语音
    this.initRecord();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  // 手动输入内容
  conInput: function (e) {
    this.setData({
      content:e.detail.value,
    })
  },
  //识别语音 -- 初始化
  initRecord: function () {
    const that = this;
    // 有新的识别内容返回，则会调用此事件
    manager.onRecognize = function (res) {
      console.log(res)
    }
    // 正常开始录音识别时会调用此事件
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    // 识别错误事件
    manager.onError = function (res) {
      console.error("error msg", res)
    }
    //识别结束事件
    manager.onStop = function (res) {
      console.log('..............结束录音')
      console.log('录音临时文件地址 -->' + res.tempFilePath); 
      console.log('录音总时长 -->' + res.duration + 'ms'); 
      console.log('文件大小 --> ' + res.fileSize + 'B');
      console.log('语音内容 --> ' + res.result);
      if (res.result == '') {
        wx.showModal({
          title: '提示',
          content: '听不清楚，请重新说一遍！',
          showCancel: false,
          success: function (res) {}
        })
        return;
      }
      var text = res.result;
      that.setData({
        content: text
      })
      text = text.replace(/。/g,"?");
      text = text.replace("limitations","limitation");
      that.voiceSubmit(text);
    }
  },

  //语音  --按住说话
  touchStart: function (e) {
    this.setData({
      recordState: true  //录音状态
    })
    // 语音开始识别
    manager.start({
      lang: 'zh_CN',// 识别的语言，目前支持zh_CN en_US zh_HK sichuanhua
    })
  },
  //语音  --松开结束
  touchEnd: function (e) {
    this.setData({
      recordState: false
    })
    // 语音结束识别
    manager.stop();
  },
  viewHistory: function(){
    this.setData({
      historyState: true
    })
  },
  hideHistory: function(){
    this.setData({
      historyState: false
    })
  },
  // 发音
  text_audio:function(content){
    var that = this;
    var currLang = that.data.serveLang;
    if(currLang == 'ch'){
      plugin.textToSpeech({
        lang: "zh_CN",//选择中英文
        tts: true, //是否对翻译结果进行语音合成，默认为false，不进行语音合成
        content: content,//要转为语音的文字
        success: function (res) {
          console.log("succ tts", res);
          that.setData({
            src: res.filename//将文字转为语音后的路径地址
          })
          that.text_audio_status();//调用此方法来监听语音播放情况
        },
        fail: function (res) {
          console.log("fail tts", res)
        }
      })
      console.log("ch");
    }
    if(currLang == 'en'){
      plugin.textToSpeech({
        lang: "en_US",//选择中英文
        tts: true, //是否对翻译结果进行语音合成，默认为false，不进行语音合成
        content: content,//要转为语音的文字
        success: function (res) {
          console.log("succ tts", res);
          that.setData({
            src: res.filename//将文字转为语音后的路径地址
          })
          that.text_audio_status();//调用此方法来监听语音播放情况
        },
        fail: function (res) {
          console.log("fail tts", res)
        }
      })
      console.log("en");
    }
    
    /*
    plugin.textToSpeech({
      lang: "zh_CN",
      tts: true, //是否对翻译结果进行语音合成，默认为false，不进行语音合成
      content: content,//要转为语音的文字
      success: function (res) {
        console.log("succ tts", res);
        that.setData({
          src: res.filename//将文字转为语音后的路径地址
        })
        that.text_audio_status();//调用此方法来监听语音播放情况
      },
      fail: function (res) {
        console.log("fail tts", res)
      }
    })
    */
  },
  //用来监听文字转语音的播放情况
  text_audio_status:function(){
    var that = this;
    //判断语音路径是否存在
      if (that.data.src == '') {
        console.log(暂无语音);
        return;
      }
      const innerAudioContext = wx.createInnerAudioContext();//创建音频实例
      innerAudioContext.src = that.data.src; //设置音频地址
      innerAudioContext.play(); //播放音频
      innerAudioContext.onPlay(() => {
        console.log('监听开始播放');
      });
      innerAudioContext.onEnded(() => {
        console.log('监听播报结束，可在结束中进行相应的处理逻辑');
        innerAudioContext.stop();
        //播放停止，销毁该实例,不然会出现多个语音重复执行的情况
        console.log('销毁innerAudioContext实例')
        innerAudioContext.destroy();
      })
      innerAudioContext.onError(() => {
        console.log('监听语音播放异常')
        innerAudioContext.destroy()//销毁播放实例
      })
  },
  // This function is useless
  getdata: function(question){
    var that = this;
    wx.request({
      url: 'http://192.168.1.101:8080/getdata',
      data:{
        question: question
      },
      success:function(res){
        that.setData({
          result: res.data
        })
        console.log(res.data);
      },
      fail:function(res){
        console.log(".....fail.....");
      }
    })
  },
  postdata: function(question){
    var that = this;
    /*
    if(question == "打开输入框"){
      console.log("^^^^^^^^^^^^^^^^^^^^^^");
    }*/
    /*
    var qt = 0;
    switch(question){
      case "what is intelligent agent technology?":
      case "What is intelligent agent technology?":
        qt = 1;
        console.log("question type: " + qt);
        break;
      case "what is intelligent transportation system?":
      case "What is intelligent transportation system?":
        qt = 2;
        console.log("question type: " + qt);
        break;
      case "what is smart health?":
      case "What is intelligent health?":
        qt = 3;
        console.log("question type: " + qt);
        break;
      case "what is internet of things?":
      case "What is the Internet of things?":
        qt = 4;
        console.log("question type: " + qt);
        break;
      case "what is wearable technology?":
      case "What is wearable technology?":
        qt = 5;
        console.log("question type: " + qt);
        break;
      case "what is intelligent education?":
      case "What is intelligent education?":
        qt = 6;
        console.log("question type: " + qt);
        break;
      case "what is smart education?":
      case "What is smart education?":
        qt = 7;
        console.log("question type: " + qt);
        break;
      case "what is smart city?":
      case "What is a smart city?":
        qt = 8;
        console.log("question type: " + qt);
        break;
      case "what is smart campus?":
      case "What is a smart campus?":
        qt = 9;
        console.log("question type: " + qt);
        break;
      case "what is smart house?":
      case "What is a smart house?":
      case "What is intelligent residence?":
        qt = 10;
        console.log("question type: " + qt);
        break;
      case "what are robot rights?":
      case "What are robot rights?":
        qt = 11;
        console.log("question type: " + qt);
        break;
      case "what is 6G?":
      case "What is 6G?":
        qt = 12;
        console.log("question type: " + qt);
        break;
      default:
        qt = 0;
        console.log("question type: " + qt);
        break;
    }
    */
    wx.request({
      // cmd 中 ipconfig/all 查询IPv4地址
      // url: 'http://localhost:8080/postdata', 原版
      // url: 'http://127.0.0.1:8080/postdata', 本机
      // url: 'http://172.30.55.25:8080/postdata', 机房Wifi
      // url: 'http://10.146.65.105:8080/postdata', 宿舍
      // url: 'http://192.168.3.50:8080/postdata', 家中
      // url: 'http://192.168.1.9:8080/postdata', 单位
      // url: 'http://172.30.39.179:8080/postdata',T6 wifi
      // url: 'http://172.30.45.226:8080/postdata',T8 101 wifi
      url: 'http://192.168.43.13:8080/postdata', //localhost替换成同一wifi环境下的IPv4地址，随时会变
      //192.168.0.106:8080
      //127.0.0.1:8080
      data:{
        question: question
      },
      success:function(answer) {
        /*
        if(counter == 1 && that.data.message_in[that.data.message_in.length - 1] == "1"){
          that.data.message_out.push("I am speaking English now!");
          that.setData({
            message_out: that.data.message_out,
          })
          that.setData({
            serveLang: 'en',
          })
          that.setData({
            voiceState: true,
          })
          that.text_audio("I am speaking English now!");
        }
        else if(counter == 1 && that.data.message_in[that.data.message_in.length - 1] == "2"){
          that.data.message_out.push("将使用中文为您服务!");
          that.setData({
            message_out: that.data.message_out,
          })
          that.setData({
            serveLang: 'ch',
          })
          that.setData({
            voiceState: true,
          })
          that.text_audio("将使用中文为您服务!");
        }
        
        else{
          
          switch(qt){
            case 1:
              answer.data = "Intelligent agent technology (IAT) can be considered as AI exemplification in the volatile and mobile environment."
              break;
            case 2:
              answer.data = "Intelligent transportation system (ITS) is an advanced application designed to provide innovative services related to different transportation modes and traffic management so that users can be better informed, safer, coordinate, and use transportation networks more intelligently."
              break;
            case 3:
              answer.data = "Smart Health is aimed to provide better monitoring, diagnostic tools, and patients treatment, and devices to improve the quality of life for everyone."
              break;
            case 4:
              answer.data = "The internet of things (IoT) refers to a network of physical objects capable of collecting and sharing electronic information."
              break;
            case 5:
              answer.data = "Wearable technology (WT), also known as a wearable device, is an electronic device that can be worn as an accessory, embedded in clothes, implanted in the user’s body, or even tattooed onto our skin."
              break;
            case 6:
              answer.data = "Intelligent education is a term describing education and learning in the new AI era and the digital age which has attracted the attention of many researchers."
              break;
            case 7:
              answer.data = "The goal of smart education (and smart learning) is to train smart learners by adopting the latest IT, communication, and AI technologies to meet the work and life needs of the twenty-first century."
              break;
            case 8:
              answer.data = "In a simple explanation, a smart city is a place with the integration of latest 5G, Internet-of-Things (IoT), and AI technology, where networks and services are more flexible, efficient, and sustainable with the use of information, digital, and telecommunication technologies to improve operations and provide an entirely new horizon of living and working environment for its inhabitants."
              break;
            case 9:
              answer.data = "Smart Campus is a term used to describe educational institutions that use next-generation technologies woven seamlessly within a well-architected infrastructure."
              break;
            case 10:
              answer.data = "A smart house is an accommodation that has highly advanced, automated systems to control and monitor functions of a house such as lighting, temperature control, multi-media, security, window and door operations, air quality, or any other necessity task performed by a resident."
              break;
            case 11:
              answer.data = "Robot rights are the notions that humans ought to take moral responsibility for intelligent robots they created."
              break;
            case 12:
              answer.data = "6G is shorthand for the sixth generation of wireless networks, the successor to 5G cellular technology."
              break;
            default:
              break;
          }
          */
          if(that.data.serveLang == 'en'){
            that.data.message_out.push(answer.data);
            that.setData({
              message_out: that.data.message_out,
            });
            // 回答发音
            if(isVoice == 1){
              that.text_audio(answer.data);
              console.log(answer.data);
            }
            console.log("out: " + that.data.message_out);
          }
          else if(that.data.serveLang == 'ch'){
            translate(answer.data, { from: 'auto', to: 'zh' }).then(res => {
              //调用 api.js 里面的 Promise
              that.setData({ 'trans_aws': res.trans_result[0].dst})
              that.data.message_out.push(that.data.trans_aws);
              that.setData({
                message_out: that.data.message_out,
              })
              // 回答发音
              if(isVoice == 1){
                that.text_audio(res.trans_result[0].dst);
                console.log(res.trans_result[0].dst);
              }
            })
          }
        //}
      },
      fail:function(answer){
        console.log("...fail...")
      }
    })
    i++;
  },

  voiceSubmit: function(voice){
    //console.log("The voice cal: " + voice);
    var msgIn = voice;
    this.data.message_in.push(voice);
    this.setData({
      message_in : this.data.message_in,
      input_tem: '',
    });
    if(msgIn.indexOf("input box") != -1 || msgIn.indexOf("text box") != -1  || msgIn.indexOf("input field") != -1  || msgIn.indexOf("text field") != -1 || msgIn.indexOf("输入框") != -1 || msgIn.indexOf("打字") != -1  || msgIn.indexOf("输入栏") != -1){
      if(this.data.serveLang == 'ch'){
        this.data.message_out.push("已为您打开输入栏");
        this.setData({
          message_out: this.data.message_out,
        })
        this.text_audio("已为您打开输入栏");
        this.setData({
          showField: true,
        })
      }
      if(this.data.serveLang == 'en'){
        this.data.message_out.push("opened up the text field for you");
        this.setData({
          message_out: this.data.message_out,
        })
        this.text_audio("opened up the text field for you");
        this.setData({
          showField: true,
        })
      }
    }
    else{
      if(this.data.serveLang == 'en'){
        var isEnglish = true;
        for(var k=0;k<voice.length;k++){
          if(voice.charCodeAt(k) > 255){
            this.data.message_out.push("Please speak English!");
            this.setData({
              message_out: this.data.message_out
            })
            this.text_audio("Please speak English!");
            isEnglish = false;
            break;
          }
        }
        if(isEnglish){
          // .toLowerCse()转小写因为大写首字母 + the 无法查询
          voice = voice.toLowerCase();
          this.postdata(voice);
        }
      }
      if(this.data.serveLang == 'ch'){
        var isChinese = false;
        for(var k=0;k< voice.length;k++){
          if(voice.charCodeAt(k) > 255){
            isChinese = true;
            break;
          }
        }
        if(isChinese){
          translate(voice, { from: 'auto', to: 'en' }).then(res => {
          // 调用 api.js 里面的 Promise
          this.setData({ 'trans_qes': res.trans_result })
          // 这是翻译后的语句 console.log(res.trans_result[0].dst)
          // .toLowerCse()转小写因为大写首字母 + the 无法查询
          res.trans_result[0].dst = res.trans_result[0].dst.toLowerCase();
          console.log("********************");
          console.log(res.trans_result[0].dst);
          this.postdata(res.trans_result[0].dst);
          })
        }
        else{
          this.data.message_out.push("请讲中文！");
          this.setData({
            message_out: this.data.message_out
          })
          this.text_audio("请讲中文！");
        }
      }
    }
  },

  formSubmit(e) {
    var msgIn = e.detail.value["question"];
    this.data.message_in.push(msgIn);
    console.log("in: " + this.data.message_in);
      this.setData({
        message_in : this.data.message_in,
        input_tem: '',
      });

      if(this.data.serveLang == 'ch'){
        /*
        if(e.detail.value["question"] == '1'){
          this.postdata(e.detail.value["question"]);
        }
        else if(e.detail.value["question"] == '2'){
          this.data.message_out.push("已经在使用中文！");
          this.setData({
            message_out : this.data.message_out,
          });
          this.text_audio("已经在使用中文！");
        }
        else{
          */
          var isChinese = false;
          for(var k = 0; k < msgIn.length; k++){
            if(msgIn.charCodeAt(k) > 255){
              isChinese = true;
              break;  
            }
          }
          if(isChinese){
            //翻译
            translate(msgIn, { from: 'auto', to: 'en' }).then(res => {
              // 调用 api.js 里面的 Promise
              this.setData({ 'trans_qes': res.trans_result })
              // 这是翻译后的语句 console.log(res.trans_result[0].dst)
              // .toLowerCse()转小写因为大写首字母 + the 无法查询
              res.trans_result[0].dst = res.trans_result[0].dst.toLowerCase();
              // console.log(res.trans_result[0].dst);
              this.postdata(res.trans_result[0].dst);
            })
          }
          else{
            this.data.message_out.push("请说中文!");
              this.setData({
                message_out: this.data.message_out,
              })
              this.text_audio("请说中文！");
          } 
        //} 
      }
      if(this.data.serveLang == 'en'){
        /*
        if(e.detail.value["question"] == '1'){
          this.data.message_out.push("Using English already！");
          this.setData({
            message_out : this.data.message_out,
          });
          this.text_audio("Using English already！");
        }
        */
        //else{
          var isEnglish = true;
          for(var k = 0; k < msgIn.length; k++){
            if(msgIn.charCodeAt(k) > 255){
              this.data.message_out.push("Please speak English!");
              this.setData({
                message_out: this.data.message_out,
              })
              this.text_audio("Please speak English!");
              isEnglish = false;
              break;  
            }
          }
          if(isEnglish){
            // .toLowerCse()转小写因为大写首字母 + the 无法查询
            msgIn = msgIn.toLowerCase();
            // console.log(res.trans_result[0].dst);
            this.postdata(msgIn);
          }
        //}
      }
    
    /*
    if(counter == 0){
      if(e.detail.value["question"] == '1' || e.detail.value["question"] == '2'){
        counter++;
        this.postdata(e.detail.value["question"]);
      }
      else{
        this.data.message_out.push("Please type 1 or 2\n请输入1 或者 2");

        // Test
        this.text_audio("Please type 1 or 2\n请输入1 或者 2");

        this.setData({
          message_out: this.data.message_out,
        })
      }  
    }*/
  },
  // 原版语音函数
  /*
  start_record: function(){
    const options={
      sampleRate: 16000,
      numberOfChannels:1,
      encodeBitRate:48000,
      format: 'PCM',
    };
    record_manager.start(options);
    this.setData({
      recording: true,
    });
  },
  stop_record: function(){
    record_manager.stop();
    this.setData({recording: false});
    this.bind_stop();
  },
  bind_stop: function(){
    var that = this;
    record_manager.onStop(res=>{
      var tf = res.tempFilePath;
      const fs = wx.getFileSystemManager();
      fs.readFile({
        filePath: tf,
        success(res){
          const buffer = res.data;
          that.audio_rec(buffer);
        }
      })
    })
  },
  audio_rec(data){
    var that = this;
    wx.showLoading({
      title: 'Recognizing',
    })
    wx.cloud.callFunction({
      name:'audio_rec',
      data: {data}
    }).then(res=>{
      if(res.errMsg=="cloud.callFunction:ok" && res.result.err_no == 0){
        var result_list = res.result.result;
        var question = result_list[0] + "?";
        that.data.message_in.push(question);
        that.setData({
          message_in : that.data.message_in,
          input_tem: '',
        });
        that.postdata(question);
        wx.hideLoading();
      }
      else{
        wx.showToast({
          title: '识别失败',
          icon: 'none',
        })
      }
    }).catch(err=>{
      console.log("err",err)
      wx.showToast({
        title: '识别失败',
        icon: 'none',
      })
    })
  },
  //小程序手机录音授权
  get_record_auth: function(){
    var that = this;
    wx.getSetting().then(res=>{
      if(res.authSetting['scope.record']){
        that.setData({authed: true})
      }
      else{
        wx.authorize({
          scope: 'scope.record',
        }).then(res=>{
          that.setData({authed:true})
        }).catch(res=>{
          that.cancel_auth()
        })
      }
    })
  },
  cancel_auth: function(){
    var that = this;
    wx.showModal({
      title: "提示",
      content: "未授权无法录音",
      cancelText: "不录音",
      confirmText: "去授权",
      success:res=>{
        if(res.confirm){
          wx.openSetting({
            success(res){
              if(res.authSetting['scope_record']){
                that.setData({
                  authed: true,
                })
              }
            }
          })
        }
      }
    })
  },
  */
})