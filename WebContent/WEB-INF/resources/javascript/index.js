var session_auction;
let Category = false;
function secondsTimeSpanToHMS(s) {
  var h = Math.floor(s / 3600); //Get whole hours
  s -= h * 3600;
  var m = Math.floor(s / 60); //Get remaining minutes
  s -= m * 60;
  return h + ":" + (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s); //zero padding on minutes and seconds
} 
function processMatchTime() {
	if(clock_data) {
		if(clock_data.matchTimeStatus.toLowerCase() == 'start') {
			clock_data.matchTotalSeconds = clock_data.matchTotalSeconds + 1;
			processAuctionProcedures('LOG_TIME',clock_data.matchTotalSeconds);
		}
		if(document.getElementById('match_time_hdr')) {
			document.getElementById('match_time_hdr').innerHTML = 'MATCH TIME : ' + 
				secondsTimeSpanToHMS(clock_data.matchTotalSeconds);
		}
	}
}
function processWaitingButtonSpinner(whatToProcess) 
{
	switch (whatToProcess) {
	case 'START_WAIT_TIMER': 
		$('.spinner-border').show();
		$(':button').prop('disabled', true);
		break;	case 'END_WAIT_TIMER': 
		$('.spinner-border').hide();
		$(':button').prop('disabled', false);
		break;
	}
}
function afterPageLoad(whichPageHasLoaded)
{
	switch (whichPageHasLoaded) {
	case 'AUCTION':
		//$('#selectPlayers').select2();
		processAuctionProcedures('LOAD_MATCH',null);
		break;
	}
}
function initialiseForm(whatToProcess, dataToProcess)
{
	switch (whatToProcess) {
	case 'TIME':
		break;
	case 'MATCH':
		break;
	}
}
function uploadFormDataToSessionObjects(whatToProcess)
{
	var formData = new FormData();
	var url_path;

	$('input, select, textarea').each(
		function(index){  
			if($(this).is("select")) {
				formData.append($(this).attr('id'),$('#' + $(this).attr('id') + ' option:selected').val());  
			} else {
				formData.append($(this).attr('id'),$(this).val());  
			}	
		}
	);
	
	url_path = 'upload_match_setup_data';
	
	$.ajax({    
		headers: {'X-CSRF-TOKEN': $('meta[name="_csrf"]').attr('content')},
        url : url_path,     
        data : formData,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',     
        success : function(data) {

        },    
        error : function(e) {    
       	 	console.log('Error occured in uploadFormDataToSessionObjects with error description = ' + e);     
        }    
    });		
	
}
function processUserSelection(whichInput)
{	
	switch ($(whichInput).attr('name')) {
	case'selectPair':
		addItemsToList('PAIR_PLAYER_SELECTION',session_auction);
		break;
	case 'selectGender':
		switch ($('#selectGender :selected').val()) {
			case 'MALE':
				addItemsToList('MALE_PLAYER_SELECTION',session_auction);
				break;
			case 'FEMALE':
				addItemsToList('FEMALE_PLAYER_SELECTION',session_auction);
				break;	
			}
		break;	
	case 'load_scene_btn':
	  	document.initialise_form.submit();
		break;
	case 'selectedBroadcaster':
		switch ($('#selectedBroadcaster :selected').val()) {
		case 'HANDBALL':
			break;
		}
		break;
	case 'cancel_btn': 
		document.getElementById('select_event_div').style.display = 'none';
		processWaitingButtonSpinner('END_WAIT_TIMER');
		break;
	case 'player_overwrite_btn':
		processWaitingButtonSpinner('START_WAIT_TIMER');
		processAuctionProcedures('PLAYER_OVERWRITE',null);
		break;
	case 'player_select_btn':
		processWaitingButtonSpinner('START_WAIT_TIMER');
		processAuctionProcedures('SELECT_PLAYER',null);
		break;
	case 'player_sold_btn':
		processWaitingButtonSpinner('START_WAIT_TIMER');
		processAuctionProcedures('PLAYER_SOLD',null);
		break;
	case 'player_rtm_btn':
		processWaitingButtonSpinner('START_WAIT_TIMER');
		processAuctionProcedures('PLAYER_RTM',null);
		break;
	case 'player_unsold_btn':
		processWaitingButtonSpinner('START_WAIT_TIMER');
		processAuctionProcedures('PLAYER_UNSOLD',null);
		break;
	case 'player_retain_btn':
		processWaitingButtonSpinner('START_WAIT_TIMER');
		processAuctionProcedures('PLAYER_RETAIN',null);
		break;
	case 'player_reauction':
	    addItemsToList('LOAD_UNSOLD_PLAYERS', session_auction);
	    document.getElementById('select_event_div').style.display = '';
	    break;
	case 'player_overwrite':
		addItemsToList('LOAD_PLAYER_OVERWRITE',session_auction);
		document.getElementById('select_event_div').style.display = '';
		break;
	case 'undo_player_data':
		processAuctionProcedures('UNDO_PLAYERS',null);
		break;
	default:
		switch ($(whichInput).attr('id')) {
		case 'player_auction': case 'select_player':
			addItemsToList('LOAD_' + $(whichInput).attr('id').toUpperCase(),session_auction);
			document.getElementById('select_event_div').style.display = '';
		}
		break;
	}
	
}
function processAuctionProcedures(whatToProcess, whichInput)
{
	var value_to_process; 
	
	switch(whatToProcess) {
	case 'SELECT_PLAYER':
		switch ($('#selectedBroadcaster').val().toUpperCase()) {
		case 'WPL':
			value_to_process = $('#selectPairPlayer option:selected').val() + ',' + $('#selectGender option:selected').val() + ',' + $('#selectPair option:selected').val() + ',' + $('#player_base_rupess').val();
			value_to_process = encodeURIComponent(value_to_process);
			break;
		default:
			value_to_process = $('#selectPlayers option:selected').val() + ',' + $('#player_base_rupess').val();
			break;
		}
		break;
	case 'PLAYER_REAUCTION':
	    value_to_process = whichInput;  
	    break;
	case 'PLAYER_SOLD': case 'PLAYER_UNSOLD': case 'PLAYER_RTM': case 'PLAYER_RETAIN':
			value_to_process = $('#selectPlayers option:selected').val() + ',' + $('#selectTeams option:selected').val() + ',' + $('#player_sold_points').val();
		break;
	case 'PLAYER_OVERWRITE':
		value_to_process = $('#selectPlayers option:selected').val() + ',' + $('#selectTeams option:selected').val()
				+ ',' + $('#selectsoldOrUnsold option:selected').val() + ',' + $('#select_Amount').val();
		break;
	}

	$.ajax({    
        type : 'Get',     
        url : 'processAuctionProcedures.html',     
        data : {
			    whatToProcess: whatToProcess,
			    valueToProcess: value_to_process
			}, 
        dataType : 'json',
        success : function(data) {
			session_auction = data;
        	switch(whatToProcess) {
			case 'LOAD_MATCH':
				addItemsToList('LOAD_MATCH',data);
				document.getElementById('auction_div').style.display = '';
				document.getElementById('select_event_div').style.display = 'none';
				break;
			case 'SELECT_PLAYER':
				addItemsToList('LOAD_MATCH',data);
				document.getElementById('select_event_div').style.display = 'none';
				break;
			case 'PLAYER_SOLD': case 'PLAYER_UNSOLD': case 'PLAYER_RTM': case 'PLAYER_RETAIN':
				addItemsToList('LOAD_PLAYER_AUCTION',data);
				addItemsToList('LOAD_MATCH',data);
				document.getElementById('select_event_div').style.display = 'none';
				break;
			case 'UNDO_PLAYERS':
				alert('Removed Successfully');
				addItemsToList('LOAD_MATCH',data);
				break;
			case 'PLAYER_OVERWRITE':
				addItemsToList('LOAD_PLAYER_OVERWRITE',data);
				addItemsToList('LOAD_MATCH',data);
				document.getElementById('select_event_div').style.display = 'none';
				break;
        	}
    		processWaitingButtonSpinner('END_WAIT_TIMER');
	    },    
	    error : function(e) {    
	  	 	console.log('Error occured in ' + whatToProcess + ' with error description = ' + e);     
	    }    
	});
}

function addItemsToList(whatToProcess, dataToProcess)
{
	var div,row,header_text,option,table,tbody,ply,plye,par;
	
	
	switch (whatToProcess) {
	case 'LOAD_MATCH':
	    $('#auction_div').empty();
	    var style = document.createElement('style');
	    style.innerHTML = `
	        .table {
	            width: 100%;
	            margin: 15px 0;
	            border-collapse: collapse;
	            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	            border-radius: 8px;
	            overflow-x: hidden;
	        }
	        .table th, .table td {
	            padding: 8px 10px;
	            text-align: left;
	            border-bottom: 1px solid #ddd;
	            word-wrap: break-word;
	            white-space: normal;
	            font-size: 13px;
	            line-height: 1.3;
	        }
	        .table th {
	            background-color: #ff5733;
	            color: white;
	            font-weight: bold;
	            text-transform: uppercase;
	        }
	        .table tr:hover {
	            background-color: #ffe6e6;
	        }
	        .table label {
	            font-size: 13px;
	            font-weight: normal;
	            color: #333;
	            display: block;
	            margin-bottom: 4px;
	        }
	        #auction_div table:first-of-type {
	            margin-bottom: 15px;
	            background-color: #00FFFF;
	        }
	        #auction_div table:nth-of-type(2) {
	            background-color: #ADD8E6;
	        }
	        #auction_div table:nth-of-type(3) {
	            background-color: #f8bbd0;
	        }
	        #auction_div table:nth-of-type(4) {
	            background-color: #fff9c4 !important;
	        }
	        #auction_div {
	            padding: 15px;
	            background-color: #f7f7f7;
	            border-radius: 10px;
	            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	            max-width: 100%;
	            overflow-x: hidden;
	        }
	        #auction_div label {
	            font-size: 14px;
	            font-weight: bold;
	            color: #007BFF;
	        }
	        .table td:empty {
	            background-color: #f9f9f9;
	        }
			.zone-table th {
			    background-color: #9ACD32 !important;
			    color: white !important;
			    font-weight: bold;
			    text-transform: uppercase;
			}
			.zone-table td {
			    background-color: #fff;
			    color: #333;
			    font-size: 13px;
			}
			.zone-table tbody tr:hover td {
			    background-color: #e0f7fa !important;
			    color: #000 !important;
			}
			.zone-table thead tr:hover th {
			    background-color: #007BFF !important;
			    color: white !important;
			}
	        @media (max-width: 768px) {
	            .table th, .table td {
	                font-size: 12px;
	                padding: 6px 8px;
	            }
	            #auction_div {
	                padding: 10px;
	            }
	            .table, .zone-table {
	                font-size: 12px;
	            }
	        }
	    `;
	
	    document.head.appendChild(style);
	
	    if (dataToProcess) {
	        let table, tbody, row, text;

	        table = document.createElement('table');
	        table.setAttribute('class', 'table table-bordered');
	        tbody = document.createElement('tbody');
	        for (var i = 0; i < 1; i++) {
	            row = tbody.insertRow(tbody.rows.length);
	            for (var j = 0; j <= 1; j++) {
	                text = document.createElement('label');
	                text.style.color = 'black';
	                switch (j) {
	                    case 0:
	                        text.innerHTML = 'SELECTED PLAYER';
	                        break;
	                    case 1:
	                        if (session_auction.players.length > 0) {
	                          text.innerHTML = `
								  <span style="font-size: 1.8em; font-weight: 900; color: #ff5722; vertical-align: middle; margin-right: 8px;">
								    ${dataToProcess.players[session_auction.players.length - 1].playerNumber}
								  </span>&nbsp;&nbsp;&nbsp;&nbsp;
								  <span style="font-size: 1.2em; font-weight: 900; color: #333;">
								    ${dataToProcess.players[session_auction.players.length - 1].full_name}
								  </span>
								`;
	                        }
	                        break;
	                }
	                row.insertCell(j).appendChild(text);
	            }
	        }
	        table.appendChild(tbody);
	        document.getElementById('auction_div').appendChild(table);

	       table = document.createElement('table');
	        table.setAttribute('class', 'table table-bordered');
	        tbody = document.createElement('tbody');
	        row = tbody.insertRow(tbody.rows.length);
	        row.insertCell(0).innerHTML = '<strong>TEAMS</strong>';
	        row.insertCell(1).innerHTML = '<strong>RTM</strong>';
	        row.insertCell(2).innerHTML = '<strong>SQUAD SIZE</strong>';
	        row.insertCell(3).innerHTML = '<strong>PLAYERS</strong>';
	        let headerCell = row.getElementsByTagName('td');
	        for (let cell of headerCell) {
	            cell.style.backgroundColor = '#ee6c4d';  
	            cell.style.color = 'white';
	            cell.style.fontSize ='16px';  
	        }
	        for (var i = 0; i < dataToProcess.team.length; i++) {
	            row = tbody.insertRow(tbody.rows.length);
	            for (var j = 0; j <= 3; j++) {
	                text = document.createElement('label');
	                text.style.color = 'black';
	                switch (j) {
	                    case 0:
	                        text.innerHTML = dataToProcess.team[i].teamName1;
	                        break;
	                    case 2:
	                        text.innerHTML = dataToProcess.teamZoneList[i].players;
	                        break;
	                    case 1:
	                        text.innerHTML = Math.max(0, (dataToProcess.team[i].teamTotalRTM || 0) - (dataToProcess.teamZoneList[i].rtm || 0));
	                        break;
	                    case 3:
	                        for (var k = 0; k < dataToProcess.players.length; k++) {
	                            if (dataToProcess.players[k].teamId == dataToProcess.team[i].teamId) {
	                                if (text.innerHTML) {
	                                    text.innerHTML = text.innerHTML + ', ' + dataToProcess.players[k].full_name;
	                                } else {
	                                    text.innerHTML = dataToProcess.players[k].full_name;
	                                }
	                            }
	                        }
	                        break;
	                }
	                row.insertCell(j).appendChild(text);
	            }
	        }
	        table.appendChild(tbody);
	        document.getElementById('auction_div').appendChild(table);
	        Category = ["central zone", "east zone", "north zone", "south zone", "west zone", "u19"]
					.includes(dataToProcess.playersList[0].category.toLowerCase());
			let flexContainer = document.createElement('div');
			flexContainer.style.display = 'flex';
			flexContainer.style.justifyContent = 'space-between';
			flexContainer.style.gap = '20px';
			flexContainer.style.flexWrap = 'wrap';

			if (Category) {
			    let zoneTable = document.createElement('table');
			    zoneTable.setAttribute('class', 'table table-bordered table-hover zone-table');
			    zoneTable.setAttribute('style', 'font-size: 1.55rem; background-color: #e0f7fa; width: 100%; max-width: 100%;');
			    let styleZone = document.createElement('style');
			    styleZone.innerHTML = `
			        .table-hover tbody tr:hover {
			            background-color: #fff9c4 !important;
			        }
			        .table-hover tbody tr:hover td {
			            background-color: #fff9c4 !important;
			            color: black !important;
			        }
			        @media (min-width: 768px) {
			            .auction-flex-container > table {
			                width: 48% !important;
			            }
			        }
			    `;
			    document.head.appendChild(styleZone);
			}

			// ========== Purse and Team Table ==========
			let purseTable = document.createElement('table');
			purseTable.setAttribute('class', 'table table-bordered');
			purseTable.setAttribute('style', 'width: 100%; max-width: 100%;');
			
			tbody = document.createElement('tbody');
			row = tbody.insertRow(tbody.rows.length);
			row.innerHTML = `
			    <td><strong>TEAM</strong></td>
			    <td><strong>TOTAL PURSE</strong></td>
			    <td><strong>REMAINING</strong></td>
			    ${Category ? `<td><strong>EXPECTED</strong></td>` : ''}
			`;
			for (let cell of row.cells) {
			    cell.style.backgroundColor = '#219ebc';
			    cell.style.color = 'white';
			    cell.style.fontWeight = '900';
			    cell.style.fontSize = '16px';
			}
			
			if (dataToProcess.teamZoneList && dataToProcess.teamZoneList.length > 0) {

			    for (let i = 0; i < dataToProcess.teamZoneList.length; i++) {

			        let zone = dataToProcess.teamZoneList[i];

			        row = tbody.insertRow(tbody.rows.length);

			        row.style.fontSize = "16px";
			        row.style.fontWeight = "800";
			        row.style.color = "black";

			        row.insertCell(0).innerHTML = zone.teamName1;

			        row.insertCell(1).innerHTML = zone.teamTotalPurse;

			        row.insertCell(2).innerHTML = zone.purseRemaing;

			        if (Category) {
			            row.insertCell(3).innerHTML = zone.expectedPurse;
			        }
			    }

			} else {
			    console.error("teamZoneList is missing.", dataToProcess);
			}

			purseTable.appendChild(tbody);
			flexContainer.appendChild(purseTable);

			flexContainer.classList.add("auction-flex-container");
			document.getElementById('auction_div').appendChild(flexContainer);
	    }
		break;
	case 'LOAD_UNSOLD_PLAYERS': {

		    $('#select_event_div').empty();

		    let mainContainer = document.createElement('div');
		    mainContainer.style.display = 'flex';
		    mainContainer.style.alignItems = 'flex-start';
		    mainContainer.style.gap = '20px';
		    mainContainer.style.margin = '20px 0';
		
		    let tableWrapper = document.createElement('div');
		    tableWrapper.style.width = '50%';
		    tableWrapper.style.maxHeight = '300px';
		    tableWrapper.style.overflowY = 'auto';
		
		    let unsoldTable = document.createElement('table');
		    unsoldTable.setAttribute('class', 'table table-bordered');
		
		    let unsoldTbody = document.createElement('tbody');
		
		    let selectAllRow = unsoldTbody.insertRow();
		
		    let selectAllCheckbox = document.createElement('input');
		    selectAllCheckbox.type = 'checkbox';
		    selectAllCheckbox.onclick = function () {
		        document.querySelectorAll('.unsoldCheckbox')
		            .forEach(cb => cb.checked = this.checked);
		    };
		
		    let selectAllLabel = document.createElement('label');
		    selectAllLabel.innerHTML = ' Select All ';
		
		    selectAllRow.insertCell(0).appendChild(selectAllCheckbox);
		    selectAllRow.insertCell(1).appendChild(selectAllLabel);
		
		    let unsoldPlayers = session_auction.players
		        .filter(p => p.soldOrUnsold === 'UNSOLD')
		        .sort((a, b) => {
		            let idA = a.playersId ? parseInt(a.playersId.split(',')[0]) : a.playerId;
		            let idB = b.playersId ? parseInt(b.playersId.split(',')[0]) : b.playerId;
		            return idA - idB;
		        });
		
		    unsoldPlayers.forEach(function(plyr) {
		
		        let row = unsoldTbody.insertRow();
		
		        let checkbox = document.createElement('input');
		        checkbox.type = 'checkbox';
		        checkbox.className = 'unsoldCheckbox';
		        checkbox.value = plyr.playersId ? plyr.playersId : plyr.playerId;
		
		        row.insertCell(0).appendChild(checkbox);
		
		        let label = document.createElement('label');
		        label.innerHTML = plyr.playerNumber + ' - ' + plyr.full_name;
		        label.style.marginLeft = '5px';
		
		        row.insertCell(1).appendChild(label);
		    });
		
		    unsoldTable.appendChild(unsoldTbody);
		    tableWrapper.appendChild(unsoldTable);
		
		    let buttonContainer = document.createElement('div');
		    buttonContainer.style.display = 'flex';
		    buttonContainer.style.flexDirection = 'column';
		    buttonContainer.style.gap = '10px';
		
		    let resetBtn = document.createElement('input');
		    resetBtn.type = 'button';
		    resetBtn.value = 'Reset Selected Players';
		    resetBtn.style.backgroundColor = 'green';
		    resetBtn.style.color = 'white';
		    resetBtn.style.fontWeight = 'bold';
		    resetBtn.style.padding = '8px 12px';
		
		    resetBtn.onclick = function () {
		        let selectedPlayers = [];
		
		        document.querySelectorAll('.unsoldCheckbox:checked')
		            .forEach(cb => selectedPlayers.push(cb.value));
		
		        if (selectedPlayers.length === 0) {
		            alert("Please select at least one player");
		            return;
		        }
		
		        processAuctionProcedures('PLAYER_REAUCTION', selectedPlayers.join(','));
		    };
		
		    let cancelBtn = document.createElement('input');
		    cancelBtn.type = 'button';
		    cancelBtn.value = 'Cancel';
		    cancelBtn.style.backgroundColor = 'red';
		    cancelBtn.style.color = 'white';
		    cancelBtn.style.padding = '8px 12px';
		
		    cancelBtn.onclick = function () {
		        document.getElementById('select_event_div').style.display = 'none';
		    };
		
		    buttonContainer.appendChild(resetBtn);
		    buttonContainer.appendChild(cancelBtn);
		
		    mainContainer.appendChild(tableWrapper);
		    mainContainer.appendChild(buttonContainer);
		
		    document.getElementById('select_event_div').appendChild(mainContainer);

    break;
}
	
	case 'LOAD_PLAYER_OVERWRITE':
		$('#select_event_div').empty();
		table1 = document.createElement('table');
		table1.setAttribute('class', 'table table-bordered');
				
		tbody = document.createElement('tbody');
		row = tbody.insertRow(tbody.rows.length);
		
		let selection = document.createElement('select');
		selection.id = 'selectPlayers';
		selection.name = selection.id;
		
		session_auction.players.reverse();
		
		switch ($('#selectedBroadcaster').val().toUpperCase()) {
		case 'WPL':
			session_auction.players.forEach(function(plyr){
				option = document.createElement('option');
				option.value = plyr.playersId;
				option.text = plyr.playerNumber + ' - ' 
					+ plyr.full_name + ' - ' 
					+ plyr.category;
				selection.appendChild(option);
			});
			break;
		default:
			session_auction.players.forEach(function(plyr){
				option = document.createElement('option');
				option.value = plyr.playerId;
				option.text = session_auction.playersList[plyr.playerId-1].playerNumber + ' - ' 
					+ session_auction.playersList[plyr.playerId-1].full_name + ' - ' 
					+ session_auction.playersList[plyr.playerId-1].category;
				selection.appendChild(option);
			});
			break;
		}
		
		header_text = document.createElement('label');
		header_text.innerHTML = 'Players:'
		header_text.style.fontWeight = "bold";  
		header_text.style.fontSize = "16px";    
		header_text.style.color = "#2E008B"; 
		header_text.htmlFor = selection.id;
		selection.setAttribute('onchange',"processUserSelection(this)");
		row.insertCell(0).appendChild(header_text).appendChild(selection);
		
		let slcts = document.createElement('select');
		slcts.id = 'selectTeams';
		slcts.name = slcts.id;
		
		slcts.style.fontWeight = "bold";
		slcts.style.fontSize = "16px";
		
		option = document.createElement('option');
		option.value = '';
	    option.text = '';
	    slcts.appendChild(option);
		
		session_auction.team.forEach(function(team,index,arr1){
			option = document.createElement('option');
			option.value = team.teamId;
			option.text = team.teamName1;
			slcts.appendChild(option);
		});
		
		header_text = document.createElement('label');
		header_text.innerHTML = 'Teams: '
		header_text.htmlFor = slcts.id;
		header_text.style.fontWeight = "bold";
		header_text.style.fontSize = "16px";
		slcts.setAttribute('onchange',"processUserSelection(this)");
		row.insertCell(1).appendChild(header_text).appendChild(slcts);
		
		let homeInput = document.createElement('input');
		homeInput.type = 'text';
		homeInput.id = 'select_Amount';
		homeInput.name = homeInput.id;
		homeInput.style = 'width:35%; height:50px; text-align:center; font-size:24px;';
		homeInput.value = '0';
		
		header_text = document.createElement('label');
		header_text.innerHTML = 'PRICE: ';
		header_text.htmlFor = homeInput.id;
		row.insertCell(2).appendChild(header_text).appendChild(homeInput);

		let sold = document.createElement('select');
		sold.id = 'selectsoldOrUnsold';
		sold.name = selection.id;
		
		session_auction.players.reverse();
		
		["SOLD","UNSOLD","RTM","RETAIN"].forEach(function(plyr){
			option = document.createElement('option');
			option.value = plyr;
			option.text = plyr;
			sold.appendChild(option);
		});
		
		header_text = document.createElement('label');
		header_text.innerHTML = 'sold Or Unsold:'
		header_text.style.fontWeight = "bold";  
		header_text.style.fontSize = "16px";    
		header_text.style.color = "#2E008B"; 
		header_text.htmlFor = sold.id;
		sold.setAttribute('onchange',"processUserSelection(this)");
		row.insertCell(3).appendChild(header_text).appendChild(sold);
		
		switch ($('#selectedBroadcaster').val().toUpperCase()) {
		case 'WPL':
		    selection.addEventListener('change', function() {
		        let selectedId = String(this.value).trim();	
		        let sets = session_auction.players.find(p => String(p.playersId || p.playerId) === selectedId
		        );
		        if (sets) {
		            $('#select_Amount').val(sets.soldForPoints || 0);
		            $('#select_Amount').trigger('change');
		        } else {
		            console.warn("No matching player found");
		            $('#select_Amount').val(0);
		        }
		    });
		    break;
		default:
			selection.addEventListener('change', function() {
			    var set = session_auction.players.find(set => set.playerId === parseInt(this.value, 10));
			    if (set) {
			        $('#select_Amount').val(set.soldForPoints);
			    }
			    $('#select_Amount').trigger('change');
			});
			break;
		}
		option = document.createElement('input');
	    option.type = 'button';
		option.name = 'player_overwrite_btn';
		option.value = 'Player OverWrite';
		option.style.fontWeight = "bold";
		option.style.fontSize = "16px";
	    option.id = option.name;
	    option.setAttribute('onclick','processUserSelection(this);');
	    
	    div = document.createElement('div');
	    div.append(option);
	    row.insertCell(4).appendChild(div);

		option = document.createElement('input');
		option.type = 'button';
		option.name = 'cancel_btn';
		option.id = option.name;
		option.value = 'Cancel';
		option.style.fontWeight = "bold";
		option.style.fontSize = "16px";
		option.style.backgroundColor = "red"; 
		option.style.color = "white"; 
		option.setAttribute('onclick','processUserSelection(this)');

	    div = document.createElement('div');
	    div.append(option);
	    
	    row.insertCell(5).appendChild(div);
	    
		table1.appendChild(tbody);
		document.getElementById('select_event_div').appendChild(table1);
		selection.selectedIndex = 0;
		selection.dispatchEvent(new Event('change'));
		break;
	case "LOAD_SELECT_PLAYER":
		$('#select_event_div').empty();

		table = document.createElement('table');
		table.setAttribute('class', 'table table-bordered');
				
		tbody = document.createElement('tbody');
		row = tbody.insertRow(tbody.rows.length);
		
		/*let ply = document.createElement('select');
		ply.id = 'selectPlayers';
		ply.name = ply.id;
		ply.style.fontWeight = "800";  
		ply.style.fontSize = "16px";  
		
		option = document.createElement('option');
		option.value = '';
		option.text = '';
		ply.appendChild(option);
		session_auction.playersList.forEach(function(plyr){
		    option = document.createElement('option');
		    option.value = plyr.playerId;
		    option.text = plyr.playerNumber + ' - ' + plyr.full_name + ' - ' + plyr.category;
		    ply.appendChild(option);
		});
		
		header_text = document.createElement('label');
		header_text.innerHTML = 'Players: '
		header_text.htmlFor = ply.id;
		ply.setAttribute('onchange', "processUserSelection(this)");
		ply.setAttribute('onchange', `
		    const selectedPlayerId = this.value;
		    const selectedPlayer = session_auction.playersList.find(plyr => plyr.playerId == selectedPlayerId);
		    if (selectedPlayer) {
					document.getElementById('player_base_rupess').value = selectedPlayer.basePrice;	
		    }
		`);
				
		row.insertCell(0).appendChild(header_text).appendChild(ply);*/

	switch ($('#selectedBroadcaster').val().toUpperCase()) {
		case 'WPL':
			ply = document.createElement('select');
			ply.id = 'selectGender';
			ply.name = ply.id;
			ply.style.fontWeight = "800";  
			ply.style.fontSize = "16px";  
			
			option = document.createElement('option');
			option.value = '';
			option.text = 'SELECT GENDER';
			ply.appendChild(option);
			
			option = document.createElement('option');
			option.value = 'MALE';
			option.text = 'MALE';
			ply.appendChild(option);
			
			option = document.createElement('option');
			option.value = 'FEMALE';
			option.text = 'FEMALE';
			ply.appendChild(option);
			
			ply.setAttribute('onchange',"processUserSelection(this)");
			row.insertCell(0).appendChild(ply);
			
			$(ply).select2();
			
			selects = document.createElement('select');
		    row.insertCell(1).appendChild(selects);
		    
		    selects = document.createElement('select');
		    row.insertCell(2).appendChild(selects);
    
    		option = document.createElement('input');
    		row.insertCell(3).appendChild(option);
		
			option = document.createElement('input');
		    option.type = 'button';
			option.name = 'player_select_btn';
			option.style.fontWeight = "800";  
			option.style.fontSize = "16px";  
			option.style.backgroundColor = "blue"; 
			option.style.color = "white"; 
			option.value = 'Select Player';
		    option.id = option.name;
		    option.setAttribute('onclick','processUserSelection(this);');
		    
		    div = document.createElement('div');
		    div.append(option);
		    row.insertCell(4).appendChild(div);
		    
			option = document.createElement('input');
			option.type = 'button';
			option.style.fontWeight = "800";  
			option.style.fontSize = "16px";  
			option.name = 'cancel_btn';
			option.style.backgroundColor = "red"; 
			option.style.color = "white"; 
			option.id = option.name;
			option.value = 'Cancel';
			option.setAttribute('onclick','processUserSelection(this)');
	
		    div = document.createElement('div');
		    div.append(option);
		    
		    row.insertCell(5).appendChild(div);
	    
			break;
		default:
			plye = document.createElement('select');
			plye.id = 'selectPlayers';
			plye.name = plye.id;
			plye.style.fontWeight = "800";  
			plye.style.fontSize = "16px";  
			
			getAvailablePlayers().forEach(function(plyr,index,arr1){
				option = document.createElement('option');
				option.value = plyr.playerId;
				option.text = plyr.playerNumber + ' - ' + plyr.full_name + ' - ' + plyr.category;
				plye.appendChild(option);
			});
			
			header_text = document.createElement('label');
			header_text.innerHTML = 'Players: '
			header_text.htmlFor = plye.id;
			plye.setAttribute('onchange', `
			    const selectedPlayerId = this.value;
			    const selectedPlayer = session_auction.playersList.find(plyr => plyr.playerId == selectedPlayerId);
			    if (selectedPlayer) {
						document.getElementById('player_base_rupess').value = selectedPlayer.basePrice;	
			    }
			`);
					
			row.insertCell(0).appendChild(header_text).appendChild(plye);
			
			header_text.style.fontWeight = "bold";
			header_text.style.fontSize = "16px";
			$(plye).select2();
			
			option = document.createElement('input');
			option.type = "text";
			header_text = document.createElement('label');
			header_text.innerHTML = 'Base Rupess ';
			option.id = 'player_base_rupess';
			option.value = '300';
			header_text.htmlFor = option.id;
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
			header_text.style.fontWeight = "bold";
			header_text.style.fontSize = "16px";
			row.insertCell(1).appendChild(header_text).appendChild(option);
		
			option = document.createElement('input');
		    option.type = 'button';
			option.name = 'player_select_btn';
			option.style.fontWeight = "800";  
			option.style.fontSize = "16px";  
			option.style.backgroundColor = "blue"; 
			option.style.color = "white"; 
			option.value = 'Select Player';
		    option.id = option.name;
		    option.setAttribute('onclick','processUserSelection(this);');
		    
		    div = document.createElement('div');
		    div.append(option);
		    row.insertCell(2).appendChild(div);
		    
			option = document.createElement('input');
			option.type = 'button';
			option.style.fontWeight = "800";  
			option.style.fontSize = "16px";  
			option.name = 'cancel_btn';
			option.style.backgroundColor = "red"; 
			option.style.color = "white"; 
			option.id = option.name;
			option.value = 'Cancel';
			option.setAttribute('onclick','processUserSelection(this)');
	
		    div = document.createElement('div');
		    div.append(option);
		    
		    row.insertCell(3).appendChild(div);
			break;	
		}
	    
		table.appendChild(tbody);
		document.getElementById('select_event_div').appendChild(table);
		
		switch ($('#selectedBroadcaster').val().toUpperCase()) {
		case 'WPL':
			ply.selectedIndex = 0;
			ply.dispatchEvent(new Event('change'));
			break;
		default:
			plye.selectedIndex = 0;
			plye.dispatchEvent(new Event('change'));
			break;
		}
		break;
	case 'PAIR_PLAYER_SELECTION':
	    let tb = document.querySelector('#select_event_div table');
	    let rw = tb.rows[0];
	
	    if (rw.cells[2]) {
	        rw.deleteCell(2);
	    }
	    let st = document.createElement('select');
	    st.id = 'selectPairPlayer';
	    st.name = st.id;
	    st.style.fontWeight = "bold";
	    st.style.fontSize = "16px";
	
	    let selectedValue = $('#selectPair :selected').val();
	    let [category, pair] = selectedValue.split('|').map(v => v.trim());
	    let gender = $('#selectGender :selected').val();
	
	    let ids = [];
		let names = [];
		let plyerBasePrice = [];
		dataToProcess.playersList.forEach(function(plyr) {
		    if (plyr.gender.toUpperCase() === gender.toUpperCase() &&
		        plyr.category.toUpperCase() === category.toUpperCase() &&
		        plyr.pair.toUpperCase() === pair.toUpperCase()
		    ) {
		        ids.push(plyr.playerId);
		        names.push(plyr.full_name);
		        plyerBasePrice.push(plyr.basePrice);
		    }
		});
		
		if (ids.length > 0) {
		    let opt = document.createElement('option');
		    opt.value = ids.join('|');
		    opt.text = names.join(' & ');
		    st.appendChild(opt);
		}
	    rw.insertCell(2).appendChild(st);
	
	    $(st).select2();
	    
	    if (rw.cells[3]) {
	        rw.deleteCell(3);
	    }
	    option = document.createElement('input');
		option.type = "text";
		header_text = document.createElement('label');
		header_text.innerHTML = 'Base Rupess ';
		option.id = 'player_base_rupess';
		option.value = plyerBasePrice[0];
		header_text.htmlFor = option.id;
		option.style.fontWeight = "bold";
		option.style.fontSize = "16px";
		header_text.style.fontWeight = "bold";
		header_text.style.fontSize = "16px";
		rw.insertCell(3).appendChild(header_text).appendChild(option);

    	break;
	case 'FEMALE_PLAYER_SELECTION':
		let tbles = document.querySelector('#select_event_div table');
	    let ros = tbles.rows[0];
	    if (ros.cells[1]) {
	        ros.deleteCell(1);
	    }
	    let slct = document.createElement('select');
	    slct.id = 'selectPair';
	    slct.name = slct.id;
	    slct.style.fontWeight = "bold";
	    slct.style.fontSize = "16px";
	    
	    option = document.createElement('option');
		option.value = '';
		option.text = 'SELECT GRADE & PAIR';
		slct.appendChild(option);
	
	    for (let i = 1; i <= 8; i++) {
	        let options = document.createElement('option');
	        options.value = 'GRADE A | PAIR-' + i;
	        options.text = 'GRADE A PAIR-' + i;
	        slct.appendChild(options);
	    }
	
	    slct.setAttribute('onchange',"processUserSelection(this)");
	    ros.insertCell(1).appendChild(slct);
	
	    $(slct).select2();
		break;
	case 'MALE_PLAYER_SELECTION':
	    let tables = document.querySelector('#select_event_div table');
	    let rows = tables.rows[0];
	    if (rows.cells[1]) {
	        rows.deleteCell(1);
	    }
	    let select = document.createElement('select');
	    select.id = 'selectPair';
	    select.name = select.id;
	    select.style.fontWeight = "bold";
	    select.style.fontSize = "16px";
	    
	    option = document.createElement('option');
		option.value = '';
		option.text = 'SELECT GRADE & PAIR';
		select.appendChild(option);
	
	    for (let i = 1; i <= 8; i++) {
	        let option = document.createElement('option');
	        option.value = 'GRADE A | PAIR-' + i;
	        option.text = 'GRADE A PAIR-' + i;
	        select.appendChild(option);
	    }
	    for (let i = 1; i <= 8; i++) {
	        let option = document.createElement('option');
	        option.value = 'GRADE B | PAIR-' + i;
	        option.text = 'GRADE B PAIR-' + i;
	        select.appendChild(option);
	    }
	
	    select.setAttribute('onchange',"processUserSelection(this)");
	    rows.insertCell(1).appendChild(select);
	
	    $(select).select2();
    	break;
    	
	case "LOAD_PLAYER_AUCTION":
		
		$('#select_event_div').empty();

		table = document.createElement('table');
		table.setAttribute('class', 'table table-bordered');
				
		tbody = document.createElement('tbody');
		row = tbody.insertRow(tbody.rows.length);
		
		switch ($('#selectedBroadcaster').val().toUpperCase()) {
		case 'WPL':
			
			let slcet = document.createElement('select');
			slcet.id = 'selectTeams';
			slcet.name = slcet.id;
			slcet.style.fontWeight = "bold";
			slcet.style.fontSize = "16px";
			
			option = document.createElement('option');
			option.value = '';
		    option.text = '';
		    option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
		    slcet.appendChild(option);
			
			session_auction.team.forEach(function(team,index,arr1){
				option = document.createElement('option');
				option.value = team.teamId;
				option.text = team.teamName1;
				
				option.style.fontWeight = "bold";
				option.style.fontSize = "16px";
				slcet.appendChild(option);
			});
			
			header_text = document.createElement('label');
			header_text.innerHTML = 'Teams: '
			header_text.htmlFor = slcet.id;
			header_text.style.fontWeight = "bold";
			header_text.style.fontSize = "16px";
			slcet.setAttribute('onchange',"processUserSelection(this)");
			row.insertCell(0).appendChild(header_text).appendChild(slcet);
			
			option = document.createElement('input');
			option.type = "text";
			header_text = document.createElement('label');
			header_text.innerHTML = 'Sold Price ';
			option.id = 'player_sold_points';
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
			header_text.style.fontWeight = "bold";
			header_text.style.fontSize = "16px";
			option.value = '0';
			
			header_text.htmlFor = option.id;
			row.insertCell(1).appendChild(header_text).appendChild(option);
			
			option = document.createElement('input');
		    option.type = 'button';
			option.name = 'player_sold_btn';
			option.value = 'Player Sold';
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
		    option.id = option.name;
		    option.setAttribute('onclick','processUserSelection(this);');
		    
		    div = document.createElement('div');
		    div.append(option);
		    row.insertCell(2).appendChild(div);
		    
		    option = document.createElement('input');
		    option.type = 'button';
		    option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
			option.name = 'player_rtm_btn';
			option.value = 'Player RTM';
		    option.id = option.name;
		    option.setAttribute('onclick','processUserSelection(this);');
		    
		    div = document.createElement('div');
		    div.append(option);
		    row.insertCell(3).appendChild(div);
		    
		    option = document.createElement('input');
		    option.type = 'button';
			option.name = 'player_unsold_btn';
			option.value = 'Player Unsold';
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
		    option.id = option.name;
		    option.setAttribute('onclick','processUserSelection(this);');
		    
		    div = document.createElement('div');
		    div.append(option);
		    row.insertCell(4).appendChild(div);
		    
		    option = document.createElement('input');
		    option.type = 'button';
			option.name = 'player_retain_btn';
			option.value = 'Player Retain';
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
		    option.id = option.name;
		    option.setAttribute('onclick','processUserSelection(this);');
		    
		    div = document.createElement('div');
		    div.append(option);
		    row.insertCell(5).appendChild(div);
	
			option = document.createElement('input');
			option.type = 'button';
			option.name = 'cancel_btn';
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
			option.style.backgroundColor = "red"; 
			option.style.color = "white"; 
			option.id = option.name;
			option.value = 'Cancel';
			option.setAttribute('onclick','processUserSelection(this)');
	
		    div = document.createElement('div');
		    div.append(option);
		    
		    row.insertCell(6).appendChild(div);
		    
			table.appendChild(tbody);
			document.getElementById('select_event_div').appendChild(table);
			removeSelectDuplicates('selectPlayers');
			break;
		
		default:
			let selct = document.createElement('select');
			selct.id = 'selectPlayers';
			selct.name = selct.id;
			selct.style.fontWeight = "bold";
			selct.style.fontSize = "16px";
			
			session_auction.playersList.forEach(function(plyr,index,arr1){
				if(session_auction.players[session_auction.players.length-1].soldOrUnsold == 'BID' && 
						session_auction.players[session_auction.players.length-1].playerId == plyr.playerId){
						option = document.createElement('option');
						option.value = plyr.playerId;
						option.text = plyr.playerNumber + ' - ' + plyr.full_name + ' - ' + plyr.category;
						selct.appendChild(option);
					}
			});
			
			session_auction.playersList.forEach(function(plyr,index,arr1){
				option = document.createElement('option');
				option.value = plyr.playerId;
				option.text = plyr.playerNumber + ' - ' + plyr.full_name + ' - ' + plyr.category;
				selct.appendChild(option);
			});
			
			header_text = document.createElement('label');
			header_text.innerHTML = 'Players: '
			header_text.htmlFor = selct.id;
			header_text.style.fontWeight = "bold";
			header_text.style.fontSize = "16px";
			selct.setAttribute('onchange',"processUserSelection(this)");
			row.insertCell(0).appendChild(header_text).appendChild(selct);
			
			let slect = document.createElement('select');
			slect.id = 'selectTeams';
			slect.name = slect.id;
			slect.style.fontWeight = "bold";
			slect.style.fontSize = "16px";
			
			option = document.createElement('option');
			option.value = '';
		    option.text = '';
		    option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
		    slect.appendChild(option);
			
			session_auction.team.forEach(function(team,index,arr1){
				option = document.createElement('option');
				option.value = team.teamId;
				option.text = team.teamName1;
				
				option.style.fontWeight = "bold";
				option.style.fontSize = "16px";
				slect.appendChild(option);
			});
			
			header_text = document.createElement('label');
			header_text.innerHTML = 'Teams: '
			header_text.htmlFor = slect.id;
			header_text.style.fontWeight = "bold";
			header_text.style.fontSize = "16px";
			slect.setAttribute('onchange',"processUserSelection(this)");
			row.insertCell(1).appendChild(header_text).appendChild(slect);
			
			option = document.createElement('input');
			option.type = "text";
			header_text = document.createElement('label');
			header_text.innerHTML = 'Sold Price ';
			option.id = 'player_sold_points';
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
			header_text.style.fontWeight = "bold";
			header_text.style.fontSize = "16px";
			option.value = '0';
			
			header_text.htmlFor = option.id;
			row.insertCell(2).appendChild(header_text).appendChild(option);
			
			option = document.createElement('input');
		    option.type = 'button';
			option.name = 'player_sold_btn';
			option.value = 'Player Sold';
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
		    option.id = option.name;
		    option.setAttribute('onclick','processUserSelection(this);');
		    
		    div = document.createElement('div');
		    div.append(option);
		    row.insertCell(3).appendChild(div);
		    
		    option = document.createElement('input');
		    option.type = 'button';
		    option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
			option.name = 'player_rtm_btn';
			option.value = 'Player RTM';
		    option.id = option.name;
		    option.setAttribute('onclick','processUserSelection(this);');
		    
		    div = document.createElement('div');
		    div.append(option);
		    row.insertCell(4).appendChild(div);
		    
		    option = document.createElement('input');
		    option.type = 'button';
			option.name = 'player_unsold_btn';
			option.value = 'Player Unsold';
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
		    option.id = option.name;
		    option.setAttribute('onclick','processUserSelection(this);');
		    
		    div = document.createElement('div');
		    div.append(option);
		    row.insertCell(5).appendChild(div);
		    
		    option = document.createElement('input');
		    option.type = 'button';
			option.name = 'player_retain_btn';
			option.value = 'Player Retain';
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
		    option.id = option.name;
		    option.setAttribute('onclick','processUserSelection(this);');
		    
		    div = document.createElement('div');
		    div.append(option);
		    row.insertCell(6).appendChild(div);
	
			option = document.createElement('input');
			option.type = 'button';
			option.name = 'cancel_btn';
			option.style.fontWeight = "bold";
			option.style.fontSize = "16px";
			option.style.backgroundColor = "red"; 
			option.style.color = "white"; 
			option.id = option.name;
			option.value = 'Cancel';
			option.setAttribute('onclick','processUserSelection(this)');
	
		    div = document.createElement('div');
		    div.append(option);
		    
		    row.insertCell(7).appendChild(div);
		    
			table.appendChild(tbody);
			document.getElementById('select_event_div').appendChild(table);
			removeSelectDuplicates('selectPlayers');
			break;
		}
		break;		
	}
}
function removeSelectDuplicates(select_id)
{
	var this_list = {};
	$("select[id='" + select_id + "'] > option").each(function () {
	    if(this_list[this.text]) {
	        $(this).remove();
	    } else {
	        this_list[this.text] = this.value;
	    }
	});
}
function checkEmpty(inputBox,textToShow) {

	var name = $(inputBox).attr('id');
	
	document.getElementById(name + '-validation').innerHTML = '';
	document.getElementById(name + '-validation').style.display = 'none';
	$(inputBox).css('border','');
	if(document.getElementById(name).value.trim() == '') {
		$(inputBox).css('border','#E11E26 2px solid');
		document.getElementById(name + '-validation').innerHTML = textToShow + ' required';
		document.getElementById(name + '-validation').style.display = '';
		document.getElementById(name).focus({preventScroll:false});
		return false;
	}
	return true;	
}	

function getAvailablePlayers() {
    if (!session_auction || !Array.isArray(session_auction.playersList)) {
        return [];
    }

    let excludedIds = new Set();
    const players = session_auction.players || [];

    if (players.length) {
        players.forEach(p => {
            const status = (p.soldOrUnsold || "").toUpperCase();

            if (status === "BID") return;

            if (["RTM", "SOLD", "UNSOLD", "RETAIN"].includes(status)) {
                if (p.playersId) {
                    p.playersId.split(',').forEach(id => excludedIds.add(id.trim()));
                } else {
                    excludedIds.add(String(p.playerId));
                }
            }
        });
    }

    return session_auction.playersList.filter(p => {
        const isExcluded = excludedIds.has(String(p.playerId));

        const isLive = players.some(ap => {
            const status = (ap.status || "").toUpperCase();

            if (status !== "BID") return false;

            if (ap.playersId) {
                return ap.playersId.split(',').map(id => id.trim()).includes(String(p.playerId));
            }

            return String(ap.playerId) === String(p.playerId);
        });

        return !isExcluded || isLive;
    });
}
