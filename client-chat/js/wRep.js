//------------jQuery no-conflict	(function($){//------------wRep Class	var wRep = {    connection: null,    room: null,    nickname: null,    ip: null,    WG_MUC: "http://jabber.org/protocol/muc",    joined: null,    participants: null,    host: global_hostwRep,    workgroup: global_workgroupwRep,    wRepServer: "inspiron", //---Server		chatBar:	'<div class="wRep-chat-wrapper"><div class="wRep-chat-bottom">'+				'<div class="wRep-chat-half"><div id="wRep-status" class="wRep-chat-inner gray">'+				'<img src="http://login..com/client-chat/img/online.png" /> Live Support '+				'</div></div><div class="wRep-chat-quarter">'+				'<div class="wRep-chat-inner red wRep-tip" title="Powered by WebRep">'+				'<a href="http://.com" target="_blank">'+				'<img src="http://login..com/client-chat/img/domain.png" />'+				'</a></div></div><div class="wRep-chat-quarter">'+				'<div class="wRep-chat-inner gray wRep-tip" title="Chat Window">'+				'<span id="wRep-chat-icon" class="wRep-hidden">'+				'<img src="http://login..com/client-chat/img/chat-b.png" /></span></div></div>'+				'<div class="wRep-clr">'+				'<div id="wRep-userip"></div><ul id="wRep-jidactive"></ul></div></div>',									chatPanel:	'<div class="wRep-chat-top"><div class="wRep-chat-header">'+				'<h6><img src="http://login.domain.com/client-chat/img/webRep.png" alt="" /> Web Rep</h6>'+				'<div class="wRep-chat-dock">'+				'<span id="wRep-end" class="wRep-chat-winOpt" title="END Chat">'+				'<img src="http://login.domain.com/client-chat/img/close.png" /></span>'+				'<span id="wRep-hide" class="wRep-chat-winOpt" title="Hide Chat">'+				'<img src="http://login.domain.com/client-chat/img/minus.png" /></span></div></div>'+				'<ul id="wRep-chat-area">'+				'<li><div class="wRep-chat-messages"></div>'+				'<div class="wRep-chat-cro"><div class="wRep-chat-btn">History</div></div>'+				'<input type="text" class="wRep-chat-input" placeholder="write..."></li></ul></div>',					contactForm:	'<div class="wRep-chat-top"><div class="wRep-chat-header">'+				'<h6><img src="http://login.domain.com/client-chat/img/webRep.png" alt="" /> Web Rep</h6>'+				'<div class="wRep-chat-dock"><span id="wRep-end" class="wRep-chat-winOpt" title="END Chat">'+				'<img src="http://login.domain.com/client-chat/img/close.png" /></span>'+				'<span id="wRep-hide" class="wRep-chat-winOpt" title="Hide Chat">'+				'<img src="http://login.domain.com/client-chat/img/minus.png" /></span></div></div>'+				'<ul id="wRep-chat-area"><li>'+				'<form id="wRep-contact-form" method="post" action="http://login.domain.com/contact-form.php">'+				'<h5>Service is OFFLINE</h5><input type="hidden" name="wRep-contact-" value="'+				global_workgroupwRep +'" /><label>Name</label>'+				'<input type="text" name="wRep-contact-name" /><br/><label>Email</label>'+				'<input type="text" name="wRep-contact-email" /><br/><label>Message</label>'+				'<textarea name="wRep-contact-msg"></textarea><br/><input id="wRep-submit" type="submit" value="Submit"><br/>'+				'<span class="wRep-error"></span></form></li></ul></div>',	blockMsg:	'<div class="wRep-chat-block"><h5>IP Blocked</h5></div>',	log: function(msg) {	$('#wRep-status').empty().append(msg);	},				addDate : function() {				var d = new Date();		return d.toUTCString();	},	    set_cookies: function() {        setCookie('wRep_jid', wRep.connection.jid, {path: '/'});        setCookie('wRep_sid', wRep.connection.sid, {path: '/'});        setCookie('wRep_rid', wRep.connection.rid, {path: '/'});    },        del_cookies: function() {        deleteCookie('wRep_jid', {path: '/'});        deleteCookie('wRep_sid', {path: '/'});        deleteCookie('wRep_rid', {path: '/'});        deleteCookie('wRep_room', {path: '/'});		deleteCookie('wRep_rep', {path: '/'});    },		connect_status: function(status) {		if (status === Strophe.Status.CONNECTED) {			wRep.log('<img src="http://login.domain.com/client-chat/img/online.png" /> Live Support');			$(document).trigger('connected');		} else if (status === Strophe.Status.DISCONNECTED) {			$(document).trigger('disconnected');        } else if (status === Strophe.Status.ATTACHED) {			wRep.log('<img src="http://login.domain.com/client-chat/img/online.png" /> Live Support');			$(document).trigger('attached');		}	},    jid_to_id: function (jid) {        return Strophe.getBareJidFromJid(jid)            .replace(/@/g, "-")            .replace(/\./g, "-");    },	    on_presence: function (presence) {        var from = $(presence).attr('from');		var room = Strophe.getBareJidFromJid(from);		wRep.room = room;				jid_id = wRep.jid_to_id(from);		$('#wRep-chat-area li').data('jid', from);		        if (room === wRep.room) {			var nick = Strophe.getResourceFromJid(from);            if ($(presence).attr('type') === 'error' && !wRep.joined) {                // error joining room; reset app                wRep.connection.disconnect();            } else if (!wRep.participants[nick] && $(presence).attr('type') !== 'unavailable') {                // add to participant list                var user_jid = $(presence).find('item').attr('jid');                wRep.participants[nick] = user_jid || true;                if (wRep.joined) {                    $(document).trigger('user_joined', nick);                }            } else if (wRep.participants[nick] && $(presence).attr('type') === 'unavailable') {                $(document).trigger('user_left', nick);            }            if ($(presence).attr('type') !== 'error' && !wRep.joined) {                    $(document).trigger("room_joined");            }		}        return true;    },    on_message: function (message) {        var from = $(message).attr('from');		var type= $(message).attr('type');				if(!type) {			var invite_node = $(message).find('invite');			if($(invite_node).length > 0){				wRep.connection.send($pres({to: from +'/'+ wRep.nickname}));				wRep.rep = $('#wRep-jidactive li:first').text();				setCookie('wRep_rep', wRep.rep, {path: '/'});				$('div.wRep-chat-cro').text("LIVE CRO: "+ wRep.rep);			}		} else if(type == "chat") {			var composing = $(message).find('composing');			if (composing.length > 0) {				$('#wRep-chat-area > li').append("<div class='wRep-chat-event'>" +					wRep.rep +" is typing...</div>");			}			var body = $(message).find("html > body");			if (body.length === 0) {				body = $(message).find('body');				if (body.length > 0) {					body = body.text()				} else {					body = null;				}			} else {            body = body.contents();            var span = $("<span></span>");            body.each(function () {                if (document.importNode) {                    $(document.importNode(this, true)).appendTo(span);                } else {                    // IE workaround                    span.append(this.xml);                }            });            body = span;        	}			if (body) {				$('div.wRep-chat-event').remove();			}		}        return true;    },	    on_public_message: function (message) {        var from = $(message).attr('from');        var room = Strophe.getBareJidFromJid(from);        var nick = Strophe.getResourceFromJid(from);	wRep.room = room;	setCookie('wRep_room', wRep.room, {path: '/'});	if(nick != wRep.nickname){		$('#wRep-chat-area li').data('jid', nick);	}        // make sure message is from the right place        if (room === wRep.room) {            // is message from a user or the room itself?            var notice = !nick;            // messages from ourself will be styled differently            var nick_class = "";            if (nick === wRep.nickname) {                nick_class += "-me";            }            var body = $(message).children('body').text();			if(body.length > 0) {				var delayed = $(message).children("delay").length > 0  ||					$(message).children("x[xmlns='jabber:x:delay']").length > 0;					if (!notice) {					var delay_css = delayed ? " delayed" : "";					var action = body.match(/\/me (.*)$/);					if (!action) {						wRep.add_message("<div class='wRep-chat-text" + nick_class + delay_css + 						"'>" + body + "</div><br class='wRep-clr' />");						$('div.wRep-chat-event').remove();						} else {						wRep.add_message("<div class='wRep-chat-text action " + delay_css + "'>" +								"* " + nick + " " + action[1] + "</div>");					}				} else {	//                wRep.add_message("<div class='notice'>*** " + body +"</div>");				}			}        }        return true;    },    add_message: function (msg) {        // detect if we are scrolled all the way down		if($('div.wRep-chat-messages').length > 0){			var chat = $('div.wRep-chat-messages').get(0);			$(chat).append(msg);			chat.scrollTop = chat.scrollHeight;		}    },    scroll_chat: function (jid_id) {		if($('div.wRep-chat-messages').length > 0){			var div = $('#div.wRep-chat-messages').get(0);			div.scrollTop = div.scrollHeight;		}    },		on_servicestatus: function(status){//		wRep.connection.rawInput = console.log;//		wRep.connection.rawOutput = console.log;		var $activeStatus = $(status).find('status');				if($($activeStatus).text() == 'online') {			wRep.connection.sendIQ($iq({type:'get', to:'pubsub.'+ wRep.host}).c('pubsub', {xmlns:'http://jabber.org/protocol/pubsub'}).c('items', {node:'visitorQueues'}).c('item', {id:wRep.workgroup +'-active'}).tree(), on_activeQueue);		} else {			wRep.log('<img src="http://login.domain.com/client-chat/img/offline.png" /> Offline');			$(document).trigger('disconnect');		}				function on_activeQueue(queues){			var activeQueue = $($(queues).find('queue').children()).map(function(index, elem) {				return $(elem).text();			}).get();						wRep.connection.sendIQ($iq({type:'get', to:'pubsub.'+ wRep.host}).c('pubsub', {xmlns:'http://jabber.org/protocol/pubsub'}).c('items', {node:'webVisitors'}).c('item', {id:wRep.workgroup +'-allReps'}).tree(), on_allReps)			function on_allReps(reps){				var $iqRoot = $('<XMLDocument />');				$iqRoot.append($('<iq type="get" to="pubsub.'+ wRep.host +'">')				.append($('<pubsub xmlns="http://jabber.org/protocol/pubsub">').append(				'<items node="allRepsVisits">')));				var $iqnode = $iqRoot.find('iq');				var $itemsnode = $iqnode.find('items');					$(activeQueue).each(function(index, element) {					$($(reps).find(element).children()).each(function() {                       	$('<item id="'+ $(this).text() +'">').appendTo($itemsnode);                     });				});				var allRepVisits_get = wRep.text_to_xml($iqRoot.html())				wRep.connection.sendIQ(allRepVisits_get, on_chatCount);			}		}				function on_chatCount(count){			if($(count).find('item').length > 0 && $(count).find('item') != null){				($(count).find('item')).each(function(){					var $jidID = $(this).attr('id');					var $countClass = $(this).text();					$('#wRep-jidactive').append("<li class='"+ $countClass +"'>"+ $jidID +"</li>");				});								var mylist = $('#wRep-jidactive');				var listitems = mylist.children('li').get();				listitems.sort(function(a, b) {				   var compA = $(a).attr('class');				   if(compA <= 9){						compA = '0'+ compA;   					}				   var compB = $(b).attr('class');				   if(compB <= 9){						compB = '0'+ compB;  					}				   return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;				});				$.each(listitems, function(idx, itm) { mylist.append(itm); });				$('div.wRep-chat-top').remove();				$('div.wRep-chat-wrapper').prepend(wRep.chatPanel);				if(global_dragwRep){					$('div.wRep-chat-top').drags();				}				$(document).trigger('connect_success');			} else {				wRep.log('<img src="http://login.domain.com/client-chat/img/offline.png" /> Offline');				$(document).trigger('disconnect');			}					}	},	    text_to_xml: function (text) {        var doc = null;        if (window['DOMParser']) {            var parser = new DOMParser();            doc = parser.parseFromString(text, 'text/xml');        } else if (window['ActiveXObject']) {            var doc = new ActiveXObject("MSXML2.DOMDocument");            doc.async = false;            doc.loadXML(text);        } else {            throw {                type: 'iqError',                message: 'No DOMParser object found.'            };        }        var elem = doc.documentElement;        if ($(elem).filter('parsererror').length > 0) {            return null;        }        return elem;    },			timer : setTimeout(function(){		$('#wRep-chat-icon').click();	}, global_timewRep + 1000)};//--- window load function$(window).load(function(){	$('body').append(wRep.chatBar);	if(!global_autopopwRep){		clearTimeout(popTimer);	} else {		popTimer('#wRep-chat-icon');	}});//--- End window load functionvar cookie_data = {	jid: getCookie('wRep_jid'),	sid: getCookie('wRep_sid'),	rid: getCookie('wRep_rid'),	roomid: getCookie('wRep_room'),	rep: getCookie('wRep_rep')}$(document).on('click', '#wRep-chat-icon', function(event){	event.preventDefault();	clearTimeout(popTimer);	if(wRep.connection == null){		$(document).trigger('attach');	}	if($(this).hasClass('wRep-hidden')){		$(this).toggleClass('wRep-hidden wRep-visible');		$('div.wRep-chat-top').show();		$('input.wRep-chat-input').focus();	} else if($(this).hasClass('wRep-visible')){		$(this).toggleClass('wRep-visible wRep-hidden');		$('div.wRep-chat-top').hide();	}});$(document).on('click', '#wRep-hide', function(){	$('#wRep-chat-icon').toggleClass('wRep-visible wRep-hidden');	$('div.wRep-chat-top').hide();});$(document).on('click', '#wRep-end', function(){	$('div.wRep-chat-top').slideUp(function(){		if(wRep.connection != null){			$(document).trigger('disconnect');		}		$('div.wRep-chat-top').remove();	});	$('#wRep-chat-icon').toggleClass('wRep-visible wRep-hidden');	$("#wRep-jidactive").empty();});//--- compose chat msg$(document).on('keypress', '.wRep-chat-input', function (ev) {	if (ev.which === 13) {		ev.preventDefault();		var body = $(this).val();		var match = body.match(/^\/(.*?)(?: (.*))?$/);		var args = null;		if (match) {			if (match[1] === "msg") {				args = match[2].match(/^(.*?) (.*)$/);				if (wRep.participants[args[1]]) {					wRep.connection.send($msg({to: wRep.room + "/" + args[1], type: "chat"}).c('body').t(body));					wRep.add_message("<div class='message private'>@@ &lt;<span class='nick self'>" +							wRep.nickname +"</span>&gt; <span class='body'>" + args[2] + "</span> @@</div>");				} else {					wRep.add_message("<div class='notice error'>Error: User not in room.</div>");				}			} else if (match[1] === "me" || match[1] === "action") {				wRep.connection.send($msg({to: wRep.room, type: "groupchat"}).c('body').t('/me ' + match[2]));			} else if (match[1] === "topic") {				wRep.connection.send($msg({to: wRep.room, type: "groupchat"}).c('subject').text(match[2]));			} else if (match[1] === "kick") {				wRep.connection.sendIQ($iq({to: wRep.room, type: "set"}).c('query', {xmlns: wRep.WG_MUC + "#admin"})						.c('item', {nick: match[2], role: "none"}));			} else if (match[1] === "ban") {wRep.connection.sendIQ($iq({to: wRep.room, type: "set"})						.c('query', {xmlns: wRep.WG_MUC + "#admin"})						.c('item', {jid: wRep.participants[match[2]], affiliation: "outcast"}));			} else if (match[1] === "op") {				wRep.connection.sendIQ($iq({to: wRep.room,type: "set"}).c('query', {xmlns: wRep.WG_MUC + "#admin"})						.c('item', {jid: wRep.participants[match[2]], affiliation: "admin"}));			} else if (match[1] === "deop") {				wRep.connection.sendIQ($iq({to: wRep.room, type: "set"}).c('query', {xmlns: wRep.WG_MUC + "#admin"})						.c('item', {jid: wRep.participants[match[2]], affiliation: "none"}));			} else {				wRep.add_message(					"<div class='notice error'>Error: Command not recognized.</div>");			}		} else {			wRep.connection.send($msg({to: wRep.room , type: "groupchat"}).c('body').t(body));			$(this).val('');			$(this).parent().data('composing', false);		}	   }  else {		var composing = $(this).parent().data('composing');		if (!composing) {			room_comp = $('#wRep-chat-area li').data('jid');			var notify = $msg({to: wRep.room +'/'+ room_comp, "type":"chat"}).c('composing', {xmlns: "http://jabber.org/protocol/chatstates"});			wRep.connection.send(notify);			$(this).parent().data('composing', true);		}	   }});$(document).on('room_joined', function() {    wRep.joined = true;    wRep.add_message("<div class='wRep-chat-text'>Welcome! How may i help you.</div><br class='wRep-clr' />");	var infostring = browserName +' '+ fullVersion +' -- '+ navigator.platform;	var urlText = window.location.protocol + "//" + window.location.host + window.location.pathname;		wRep.connection.send($msg({to: wRep.room, type: "groupchat"}).c('brwsrinfo').t(infostring).up().c('url').t(urlText).up().c('ip').t(wRep.ip));});$(document).on('user_left', function (ev, nick) {    wRep.add_message("<div class='notice'>*** " + wRep.nickname +" left.</div>");});$(document).on('connect', function() {	wRep.connection = new Strophe.Connection(wRep.wRepServer);	wRep.connection.connect(wRep.host, null, wRep.connect_status);});$(document).on('attach', function() {	$('#wRep-chat-icon').replaceWith('<span id="wRep-loading-icon"><img src="http://login.domain.com/client-chat/img/loading.gif" /></span');	$.getJSON("http://login.domain.com/user_ip.php?jsoncallback=?", function(data){		wRep.ip =  data.user_ip;		if(wRep.ip == 'Blocked'){			$('div.wRep-chat-wrapper').html(wRep.blockMsg).fadeOut(5000);			$('#wRep-loading-icon').replaceWith('<span id="wRep-chat-icon"><img src="http://login.domain.com/client-chat/img/chat-b.png" /></span>');		} else {			if((cookie_data != null) && (cookie_data != '') && (cookie_data.sid != null)){				wRep.connection = new Strophe.Connection(wRep.wRepServer);				wRep.connection.attach(cookie_data.jid, cookie_data.sid, cookie_data.rid, wRep.connect_status);			} else {				$(document).trigger('connect');			}		}	});});$(document).on('connected', function() {	var status_get = $iq({type:'get', to:'pubsub.'+ wRep.host}).c('items', {xmlns:'http://jabber.org/protocol/pubsub'}).c('items', {node:'webVisitors'}).c('item', {id:wRep.workgroup +'-status'}).tree();	wRep.connection.sendIQ(status_get, wRep.on_servicestatus);});$(document).on('connect_success', function() {    wRep.joined = false;    wRep.participants = {};	wRep.nickname = Strophe.getResourceFromJid(wRep.connection.jid);	wRep.connection.send($pres());    wRep.connection.addHandler(wRep.on_presence, null, "presence");    wRep.connection.addHandler(wRep.on_message, null, "message", null);    wRep.connection.addHandler(wRep.on_public_message, null, "message", "groupchat");		$('#wRep-loading-icon').replaceWith('<span id="wRep-chat-icon"><img src="http://login.domain.com/client-chat/img/chat-b.png" /></span>');	var $rep = $('#wRep-jidactive li:first').text();	wRep.connection.send($msg({to:$rep +'@'+ wRep.host}).c('body').c('offer').t(wRep.workgroup).tree());});$(document).on('attached', function() {	wRep.connection.rawInput = console.log;	wRep.connection.rawOutput = console.log;	wRep.joined = false;    wRep.participants = {};	wRep.nickname = Strophe.getResourceFromJid(wRep.connection.jid);	wRep.rep = cookie_data.rep;	$('div.wRep-chat-wrapper').prepend(wRep.chatPanel);	if(global_dragwRep){		$('div.wRep-chat-top').drags();	}	$('div.wRep-chat-cro').text("LIVE CRO: "+ wRep.rep);	wRep.connection.send($pres({to: cookie_data.roomid +"/"+ wRep.nickname, type: 'unavailable'})	.c('x', {xmlns: wRep.WG_MUC}).tree());    wRep.connection.addHandler(wRep.on_presence, null, "presence");    wRep.connection.addHandler(wRep.on_message, null, "message", null);    wRep.connection.addHandler(wRep.on_public_message, null, "message", "groupchat");    wRep.connection.send($pres({to: cookie_data.roomid +"/"+ wRep.nickname}).c('x', {xmlns: wRep.WG_MUC}).tree());    $('#wRep-loading-icon').replaceWith('<span id="wRep-chat-icon"><img src="http://login.domain.com/client-chat/img/chat-b.png" /></span>');});$(document).on('disconnected', function() {	wRep.connection.disconnect();	wRep.connection = null;	wRep.del_cookies();});$(document).on('disconnect', function() {	$(document).off('disconnected');	wRep.del_cookies();	wRep.connection.send($pres({type: 'unavailable'}).tree(), function(){		wRep.room = null;		wRep.nickname = null;		wRep.joined = null;		wRep.participants = null;	});	wRep.connection.sync = true;	wRep.connection.flush();	wRep.connection.disconnect();	wRep.connection = null;	$('div.wRep-chat-top').remove();	$('div.wRep-chat-wrapper').prepend(wRep.contactForm);	$('#wRep-loading-icon').replaceWith('<span id="wRep-chat-icon"><img src="http://login.domain.com/client-chat/img/chat-b.png" /></span>');	if(global_dragwRep){		$('div.wRep-chat-top').drags();	}});$(window).on('unload', function() {    if(wRep.connection != null){		wRep.connection.pause();		wRep.set_cookies();    } else {		wRep.del_cookies();    }});//--- submit contact form$(document).on('submit', '#wRep-contact-form', function(event){	event.preventDefault();	var form = $(this).attr('id');	var $a = document.forms[form]['wRep-contact-'].value;	var $x = document.forms[form]['wRep-contact-name'].value;	var $y = document.forms[form]['wRep-contact-email'].value;	var $z = document.forms[form]['wRep-contact-msg'].value; 	ValidateForm(form);	if(ValidateForm(form) == true) {		$('#wRep-submit').fadeOut('slow');		var data_string = '='+$a+'&name='+$x+'&email='+$y+'&msg='+$z;		$.getJSON("http://login.domain.com/contact-form.php?"+ data_string +"&jsoncallback=?", function(data){			if(data.msg != 'error') {					$('#wRep-contact-form').html(data.msg);			} else {				$('#wRep-submit').fadeIn('slow');				$('span.wRep-error').html('Oops something goes worng, Try again!');			}		});	}	return false;});//-----------Tool Tip$(document).on({	mouseenter: function(){	if($(this).attr('title')) {		var $tip = $(this).attr('title');		$(this).attr('title', '');		var $offSet = $(this).offset();		$('body').prepend('<div id="wRep-toolTip"><span class="wRep-toolTip">'+		$tip +'</span><div class="wRep-arrowDown"></div></div>');		$('#wRep-toolTip').fadeIn();		var $tipHeight = $('#wRep-toolTip').outerHeight();		var $tipWidth = $('#wRep-toolTip').outerWidth()/2;		var $eleWidth = $(this).outerWidth()/2;		$('#wRep-toolTip').css({'left': ($offSet.left-($tipWidth-$eleWidth))+'px', 'top': $offSet.top-($tipHeight+5)+'px'});	}}, mouseleave: function(){	if($('#wRep-toolTip')) {		var $title = $('#wRep-toolTip').text();		$('#wRep-toolTip').remove();		$(this).attr('title', $title);	}}}, '.wRep-chat-wrapper .wRep-tip');//-----------End of Tool Tip//---function form validationfunction ValidateForm(eleFormID) {   var success = true;	if($(document.forms[eleFormID]['wRep-contact-name']).length > 0){		var $x = document.forms[eleFormID]['wRep-contact-name'];		if($x.value == null || $x.value == ''){			$($x).focus();			$($x).css({'border':'1px solid #ff9900'});			$('span.wRep-error').empty().append('Please provied name');			return false;			success = false;		}	}	if($(document.forms[eleFormID]['wRep-contact-email']).length > 0){		var $y = document.forms[eleFormID]['wRep-contact-email'];		var atpos=$y.value.indexOf("@");		var dotpos=$y.value.lastIndexOf(".");		if($y.value == null || $y.value == ''){			$($y).focus();			$($y).css({'border':'1px solid #ff9900'});			$('span.wRep-error').empty().append('Please provide Email');			return false;			success = false;		} else if (atpos<1 || dotpos<atpos+2 || dotpos+2>=$y.length){			$($y).focus();			$($y).css({'border':'1px solid #ff9900'});			$('span.wRep-error').empty().append('Not valid Email');			return false;			success = false;		}	}	if(success = true){    	$("#"+ eleFormID +" textarea").each(function(){            if($(this).val() == null || $(this).val() == ''){                $(this).css({'border':'1px solid #ff9900'});				$('span.error').empty().append('Please fill the required field(s)');                success = false;            }    	});	}    return success;}//--- function dragable$.fn.drags = function(opt) {	opt = $.extend({handle:"div.wRep-chat-header",cursor:"move"}, opt);	if(opt.handle === "") {		var $el = this;	} else {		var $el = this.find(opt.handle);	}	return $el.css('cursor', opt.cursor).on("mousedown", function(e) {		if(opt.handle === "") {			var $drag = $(this).addClass('draggable');		} else {			var $drag = $(this).addClass('active-handle').parent().addClass('draggable');		}		var z_idx = $drag.css('z-index'),			drg_h = $drag.outerHeight(),			drg_w = $drag.outerWidth(),			pos_y = $drag.offset().top + drg_h - e.pageY,			pos_x = $drag.offset().left + drg_w - e.pageX;		$drag.css('z-index', 1000).parents().on("mousemove", function(e) {			$('.draggable').offset({				top:e.pageY + pos_y - drg_h,				left:e.pageX + pos_x - drg_w			}).on("mouseup", function() {				$(this).removeClass('draggable').css('z-index', z_idx);			});		});		e.preventDefault(); // disable selection	}).on("mouseup", function() {		if(opt.handle === "") {			$(this).removeClass('draggable');		} else {			$(this).removeClass('active-handle').parent().removeClass('draggable');		}	});}//--- browser detectvar nVer = navigator.appVersion;var nAgt = navigator.userAgent;var browserName  = navigator.appName;var fullVersion  = ''+parseFloat(navigator.appVersion); var nameOffset,verOffset;// In Opera, the true version is after "Opera" or after "Version"if ((verOffset=nAgt.indexOf("Opera"))!=-1) { browserName = "Opera"; fullVersion = nAgt.substring(verOffset+6); if ((verOffset=nAgt.indexOf("Version"))!=-1)    fullVersion = nAgt.substring(verOffset+8);}// In MSIE, the true version is after "MSIE" in userAgentelse if ((verOffset=nAgt.indexOf("MSIE"))!=-1) { browserName = "Microsoft Internet Explorer"; fullVersion = nAgt.substring(verOffset+5);}// In Chrome, the true version is after "Chrome" else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) { browserName = "Chrome"; fullVersion = nAgt.substring(verOffset+7);}// In Safari, the true version is after "Safari" or after "Version" else if ((verOffset=nAgt.indexOf("Safari"))!=-1) { browserName = "Safari"; fullVersion = nAgt.substring(verOffset+7); if ((verOffset=nAgt.indexOf("Version"))!=-1)    fullVersion = nAgt.substring(verOffset+8);}// In Firefox, the true version is after "Firefox" else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) { browserName = "Firefox"; fullVersion = nAgt.substring(verOffset+8);}// In most other browsers, "name/version" is at the end of userAgent else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < (verOffset=nAgt.lastIndexOf('/')) ) { browserName = nAgt.substring(nameOffset,verOffset); fullVersion = nAgt.substring(verOffset+1); if (browserName.toLowerCase()==browserName.toUpperCase()) {  browserName = navigator.appName; }}// --- cookie functionfunction setCookie(name,value,days) {    if (days) {        var date = new Date();        date.setTime(date.getTime()+(days*24*60*60*1000));        var expires = "; expires="+date.toUTCString();    }    else var expires = "";    document.cookie = name+"="+value+expires+"; path=/";}function getCookie(name) {    var nameEQ = name + "=";    var ca = document.cookie.split(';');    for(var i=0;i < ca.length;i++) {        var c = ca[i];        while (c.charAt(0)==' ') c = c.substring(1,c.length);        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);    }    return null;}function deleteCookie(name) {    setCookie(name,"",-1);}function popTimer(ele){	setTimeout(function(){		$(ele).click();	}, global_timewRep + 1000)}})(jQuery);//--- end jquery no.conflict