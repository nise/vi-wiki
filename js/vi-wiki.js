
/*

toDo:
- render more then one video
- add video Title
- basisfunktion für die kommunikation mit dem media-wiki
- abstract syntax tree: zugriff auf elemente des wiki markups
- bug: make resizable, set size in markup


niceToHave
- css/style: play btn


- three handle slider
- play-time balken

*/



var main = null;


var ViWiki = $.inherit({

	/* ... */
  __constructor : function() {
  	this.initViWiki();
  	//this.options = $.extend(this.options, options); 
	},

	defaultDuration : 10, // in seconds
	editToken : undefined, 

	/* - */ 
	initViWiki : function (){   
		
		// get MediaWiki edit token for further operations
		this.setEditToken()
		// initiate vi-two     	
  	main = new Main({
  	 	id:'moss',  
  	 	videoWidth: 560, 
  	 	videoHeight:316,  
  	 	theme:'simpledark', 
  	 	childtheme:'vi-wiki-basic'
  	 });
		//var metadataa = new Metadata(this.getMetadataById(stream));
		var xlink = new XLink({target_selector:'#screen'});
		main.parse('#markup', 'wiki'); 
		main.addWidget(xlink);						
	
		// adjustment
		this.setWidth(420);

		// dialog settings
		$('.vi2-btn-box')
		.text('+')
		.tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text('Add Hyperlink');} })
		.click(function() {
			main.player.pause();
			addLinkDialog.dialog('open');
			return false;
		});

		var addLinkDialog = $('<div></div>');
		this.getDialogData( addLinkDialog );
	
		//
		$('.timetag').bind('click', function(e){
			//alert($(this).data('x'));
			alert('ssss');//$(this).data('x'));
			return false;
		});

		$("#container").parent().resizable({ 
			aspectRatio: true, 
			autoHide: true, 
			containment: "parent",
			// alsoResize: "#container, .vi2-video-seek",
			resize: function(event, ui) {  
				setWidth($(this).width());
			},
			minWidth: 400,
			minHeight: 200,
			aspectRatio: 4/3,
		}); 		
		
							
	},


	/* bad hack to adjust video and controls for different dimensions. */
	setWidth : function ( width ){
		$('#container').css('width', (width-0)+'px');
		$('.vi2-video-player.vi-wiki-basic').css('width', width+'px');
		$('.vi-wiki-basic .timelines').css('width', (width - 100)+'px'); // width - x
		$('video').css('width', (width-2)+'px');
		$('video').css('height', 'auto');
		$('video').css('min-height', (width*9/16)+'px');
	},	


        	
	/* gets edit token of registered wiki user */
 	setEditToken : function() {
 		var _this = this;
    $.getJSON(
        mw.util.wikiScript( 'api' ),
        {
            action: 'query',
            prop: 'info',
            intoken: 'edit',
            titles: 'Main Page',
            indexpageids: '',
            format: 'json'
        },
        function( data ) { 
            if ( data.query.pages && data.query.pageids ) {
                var pageid = data.query.pageids[0];
                wgEditToken = data.query.pages[pageid].edittoken;
                _this.editToken = wgEditToken;
            }
        }
    )
	},
    
   
  default_str_link_label : 'your label',
  default_num_duration : 10, // seconds
    	
	/**/
	getDialogData : function ( dialog ) {
		var _this = this;
		var overlay_tmp = '';
	
		$.get(mw.util.wikiScript( 'api' )+"?format=xml&action=query&titles="+mw.config.get( 'wgPageName' )+"&prop=revisions&rvprop=content", function (data, status) {
  	  page_code = $(data).find('rev').first().text();
  	  // strip hypervideo markup (works only with the first tag)
  	  var t = $('<div></div>').html(page_code).find('hypervideo').text()
   	 // load template to dialog
			$.ajax({
				url: "/ihi/mediawiki119/extensions/ViWiki/templates.tpl", 
				dataType:'html', 
				type:'get',
				success:  function ( data ){  
			
    			// prepare Dialog
    			$( dialog )
						.html($(data).html())
						.dialog({
							autoOpen: false,
							title: 'Add Hyperlink',
							height: 300,
							width: 350,
			//			modal: true,
							buttons: {
								"Add Link": function() {
									// validate fields
									var validate = _this.validateFields( '#linktarget', 'text') && _this.validateFields('#linklabel', 'text');
									if ( ! validate) { return; }
									// concatinate wiki markup
									var link = '[[ ';
									link += $(dialog).find('#linktarget').val() +' | '+ $(dialog).find('#linklabel').val() + ' ] ';
									link += $(dialog).find('#linkstart').val() + ' | ' + $(dialog).find('#linkduration').val() + ' | ';
									link += $(dialog).find('#xpos').val() + '% | ' + $(dialog).find('#ypos').val() + '% ]';
									// append markup into the right hypervideo section
									// get section, split code, append link, merge, save
									page_code += ' \n '+link; // alert($('body').find('hypervideo').after // before // whatever // xxx ())
									// save markup
										//updateWikiMarkup();
									// close dialog
									$( dialog ).dialog( "close" );
							},
							//"Delete Link" : function { $( this ).dialog( "close" ); },
							Cancel: function() {
								
								$( dialog ).dialog( "close" );
							}
						},
						close: function() {
							$(overlay_tmp).remove();
							main.player.switchToMode('play');
							//main.player.play();
							//allFields.val( "" ).removeClass( "ui-state-error" );
						},
						open: function(event, ui){
							// add link template to overlay
							var link_tmp = $
							var linktype = 'standard';
							overlay_tmp = $('<a></a>')
									.html(_this.default_str_link_label)
									.attr('id', 'ov-add')
									.addClass('overlay ov-add')
									.addClass('hyperlink-'+linktype)
									.draggable({
										//containment: "#overlay",
										drag: function(event, ui) { 
											var x = Math.round( $(this).position().left * 100 / $('#overlay').width() );
											var y = Math.round( $(this).position().top * 100 / $('#overlay').height() );
											$(dialog).find('#xpos').val( x ); 	
											$(dialog).find('#ypos').val( y );
									}	
								});
							// default overlay position	
							overlay_tmp.css({left: 100, top: 100, position:'absolute'});
							$('#overlay').append(overlay_tmp);
							$(dialog).find('#xpos').val(100);
							$(dialog).find('#ypos').val(100);
							
							// add range slider to timeline
							main.player.switchToMode('edit');
							main.player.pause();
								
							$('.vi2-video-seek').bind('slide', function(event, ui) { 
								main.player.pause();
								$(dialog).find('#linkstart').val( ui.values[ 0 ] );
								$(dialog).find('#linkduration').val( ui.values[ 1 ] );
								//return false;
							});
							
							
							// put current playback time to form
							$(dialog).find('#linkstart').val( Math.round( 1000 * main.player.currentTime() ) / 1000 );//first().text(t);
							
							// put default duration to form
							$(dialog).find('#linkduration').val( _this.default_num_duration );
							
							
							// listen on label changes
							$(dialog).find('#linklabel')
								.val(_this.default_str_link_label)
								.keyup(function(){
									$(overlay_tmp).text($(this).val());	
								});
							
						}			
					}); 			
				}
			});
		});
	},


	/* trash */
	buildForm : function (){
		var input1 = $('<input type=text />')
			.focus(function(){
				input2.width('20');
			});
	
		var input2 = $('<input type=text />')
			.focus(function(){
				input1.width('20');
			});
	
		var el = $('<span></span>').append(input1).append(input2);

	return el;
	},


	/* checks input of textfields regarding the specified data type. It highlights incorrect fields */
	validateFields : function ( selector, type ){
		var val = $(selector).val();
		var isNumber = function(o) {
  		return ! isNaN (o-0)  && o != null;
		}
		switch(type){
			case "text" : 
				if( val.length >= 2 && !isNumber( val ) ){ $(selector).removeClass('highlight'); return true; } 
				break;
			case "number" :
				if( isNumber( val ) ){ $(selector).removeClass('highlight'); return true; }
				break;
			case "external_link" :
				// some regex test here
				return true;
				break;
			case "internal_link" :
				// some regex test here
				return true;
				break;
			default :
				return false;				
		}
		$(selector).addClass('highlight');
	
		return false;
	},









	/*  -- */	  		
	updateWikiMarkup : function ( summary, content ) { 
		var _this = this;
    $.ajax({
        url: mw.util.wikiScript( 'api' ),
        data: {
            format: 'json',
            action: 'edit',
            title: mw.config.get( 'wgPageName' ),
            section: 'new',
            //sectiontitle: 'dddd',
            summary: summary,
            text: content,
            token: _this.editToken
        },
        dataType: 'json',
        type: 'POST',
        success: function( data ) {
            if ( data && data.edit && data.edit.result == 'Success' ) {   alert('ss')
                window.location.reload(); // reload page if edit was successful
            } else if ( data && data.error ) {
                alert( 'Error: API returned error code ' + data.error.code + ': ' + data.error.info );
            } else {
                alert( 'Error: Unknown result from API.' );
            }
        },
        error: function( xhr ) {
            alert( 'Error: Request failed.' );
        }
	});
	}

}); // end class VI-WIKI
    



