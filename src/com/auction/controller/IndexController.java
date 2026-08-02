package com.auction.controller;

import java.io.File;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import jakarta.xml.bind.JAXBException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.auction.model.Auction;
import com.auction.model.Player;
import com.auction.service.AuctionService;
import com.auction.util.AuctionUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.auction.util.AuctionFunctions;

@Controller
public class IndexController 
{
	@Autowired
	AuctionService auctionService;

	public static String expiry_date = "2026-12-31";
	public static String current_date = "";
	public static String error_message = "";
	public static String plyrid = "", plyrnumber = "", plyrFullName = "", plyrTickerName = "", 
		plyrPhotoName = "", plyrNationality = "", plyrBasePrice = ""; 
	public static Auction session_auction;
	public static String session_selected_broadcaster;
	public static boolean is_this_updating = false;
	public static ObjectMapper objectMapper = new ObjectMapper();
	
	@RequestMapping(value = {"/","/initialise"}, method={RequestMethod.GET,RequestMethod.POST}) 
	public String initialisePage(ModelMap model) throws JAXBException, IOException, ParseException 
	{
		if(current_date == null || current_date.isEmpty()) {
			current_date = AuctionFunctions.getOnlineCurrentDate();
		}
		
		return "initialise";
	}
	@RequestMapping(value = {"/auction"}, method={RequestMethod.GET,RequestMethod.POST}) 
	public String auctionPage(ModelMap model,
			@RequestParam(value = "selectedBroadcaster", required = false, defaultValue = "") String selectedBroadcaster)
					throws Exception 
	{
		if(current_date == null || current_date.isEmpty()) {
			current_date = AuctionFunctions.getOnlineCurrentDate();
		}
		if(current_date == null || current_date.isEmpty()) {
			model.addAttribute("error_message","You must be connected to the internet online");
			return "error";
		} else if(new SimpleDateFormat("yyyy-MM-dd").parse(expiry_date).before(new SimpleDateFormat("yyyy-MM-dd").parse(current_date))) {
			model.addAttribute("error_message","This software has expired");
			return "error";
		}else {
			session_selected_broadcaster = selectedBroadcaster;
			if(new File(AuctionUtil.AUCTION_DIRECTORY + AuctionUtil.AUCTION_JSON).exists()) {
				session_auction = new ObjectMapper().readValue(new File(AuctionUtil.AUCTION_DIRECTORY + 
						AuctionUtil.AUCTION_JSON), Auction.class);
			}else {
				session_auction = new Auction();
				new File(AuctionUtil.AUCTION_DIRECTORY + AuctionUtil.AUCTION_JSON).createNewFile();
				new ObjectMapper().writeValue(new File(AuctionUtil.AUCTION_DIRECTORY + AuctionUtil.AUCTION_JSON), session_auction);
			}
			
			if(new File(AuctionUtil.AUCTION_DIRECTORY + AuctionUtil.AUCTION_JSON).exists()) {
				session_auction = new ObjectMapper().readValue(new File(AuctionUtil.AUCTION_DIRECTORY + 
						AuctionUtil.AUCTION_JSON), Auction.class);
				session_auction = AuctionFunctions.populateMatchVariables(auctionService, session_auction);
				session_auction.setTeamZoneList(AuctionFunctions.PlayerCountPerTeamZoneWise(session_auction.getTeam(), 
						session_auction.getPlayers(), session_auction.getPlayersList(),session_selected_broadcaster.toUpperCase()));

			}
			
			model.addAttribute("session_selected_broadcaster", session_selected_broadcaster);
			return "auction";
		}
	}
	
	@RequestMapping(value = {"/processAuctionProcedures"}, method={RequestMethod.GET,RequestMethod.POST})    
	public @ResponseBody String processAuctionProcedures(
			@RequestParam(value = "whatToProcess", required = false, defaultValue = "") String whatToProcess,
			@RequestParam(value = "valueToProcess", required = false, defaultValue = "") String valueToProcess)
					throws Exception
	{	
		switch (whatToProcess.toUpperCase()) {
		case AuctionUtil.SELECT_PLAYER: case AuctionUtil.PLAYER_SOLD: case AuctionUtil.PLAYER_UNSOLD: case AuctionUtil.PLAYER_REAUCTION:
		case AuctionUtil.UNDO_PLAYERS: case AuctionUtil.PLAYER_OVERWRITE: case AuctionUtil.PLAYER_RTM: case "PLAYER_RETAIN":
			switch(whatToProcess.toUpperCase()) {
			case AuctionUtil.SELECT_PLAYER:
				switch(session_selected_broadcaster.toUpperCase()) {
				case "WPL":

				    if (session_auction.getPlayers() == null || session_auction.getPlayers().size() <= 0) {
				        session_auction.setPlayers(new ArrayList<Player>());
				    }

				    // Split main values
				    String[] parts = valueToProcess.split(",");

				    // 0 → "12|45"
				    String[] playerIds = parts[0].split("\\|");

				    // 1 → "MALE"
				    String gender = parts[1];

				    // 2 → "GRADE A | PAIR-1"
				    String[] pairParts = parts[2].split("\\|");
				    String category = pairParts[0].trim();   // "GRADE A"
				    String pair = pairParts[1].trim();       // "PAIR-1"

				    // 3 → "300"
				    int price = Integer.valueOf(parts[3] + "000");

				    plyrid = ""; plyrnumber = ""; plyrFullName = ""; plyrTickerName = ""; plyrPhotoName = ""; plyrNationality = "";
				    for (String pid : playerIds) {
				        int playerId = Integer.valueOf(pid);
				        // Remove if already exists
				        session_auction.getPlayers()
				            .removeIf(plyr -> plyr.getPlayerId() == playerId);
				        // Fetch player
				        Player ply = auctionService.getAllPlayer().get(playerId - 1);
				        
				        plyrBasePrice = String.valueOf(ply.getBasePrice());
				        
				        if(plyrid.equalsIgnoreCase("") && plyrid.isEmpty()) {
				        	plyrid = String.valueOf(ply.getPlayerId());
				        }
				        else {
				        	plyrid = plyrid + "," + String.valueOf(ply.getPlayerId());
				        }
				        if(plyrnumber.equalsIgnoreCase("") && plyrnumber.isEmpty()) {
				        	plyrnumber = String.valueOf(ply.getPlayerNumber());
				        }
				        else {
				        	plyrnumber = plyrnumber + "," + String.valueOf(ply.getPlayerNumber());
				        }
				        
				        if(plyrFullName.equalsIgnoreCase("") && plyrFullName.isEmpty()) {
				        	plyrFullName = String.valueOf(ply.getFull_name());
				        }
				        else {
				        	plyrFullName = plyrFullName + "," + String.valueOf(ply.getFull_name());
				        }
				        
				        if(plyrTickerName.equalsIgnoreCase("") && plyrTickerName.isEmpty()) {
				        	plyrTickerName = String.valueOf(ply.getTicker_name());
				        }
				        else {
				        	plyrTickerName = plyrTickerName + "," + String.valueOf(ply.getTicker_name());
				        }
				        
				        if(plyrPhotoName.equalsIgnoreCase("") && plyrPhotoName.isEmpty()) {
				        	plyrPhotoName = String.valueOf(ply.getPhotoName());
				        }
				        else {
				        	plyrPhotoName = plyrPhotoName + "," + String.valueOf(ply.getPhotoName());
				        }
				        
				        if(plyrNationality.equalsIgnoreCase("") && plyrNationality.isEmpty()) {
				        	plyrNationality = String.valueOf(ply.getNationality());
				        }
				        else {
				        	plyrNationality = plyrNationality + "," + String.valueOf(ply.getNationality());
				        }
				    }
				 // Add player
			        session_auction.getPlayers().add(
			            new Player(0, plyrnumber, plyrFullName, plyrTickerName, category, plyrNationality, plyrPhotoName, 
			            	0, price, AuctionUtil.BID, "", plyrBasePrice, pair, gender, plyrid));

				    break;
				default:
					if(session_auction.getPlayers() == null || session_auction.getPlayers().size() <= 0)
						session_auction.setPlayers(new ArrayList<Player>());
					
					session_auction.getPlayers().removeIf(plyr -> plyr.getPlayerId() == Integer.valueOf(valueToProcess.split(",")[0]));
					
					Player ply = auctionService.getAllPlayer().get(Integer.valueOf(valueToProcess.split(",")[0])-1);
					
					
					session_auction.getPlayers().add(new Player(ply.getPlayerId(),ply.getPlayerNumber(),ply.getFull_name(),
							ply.getTicker_name(),ply.getCategory(), ply.getNationality(),ply.getPhotoName(), 0, 
							Integer.valueOf(valueToProcess.split(",")[1] + "000"),AuctionUtil.BID,ply.getDraft(),ply.getBasePrice(),ply.getPair(), ply.getGender(), ""));

					break;
				}
				break;
			
			case AuctionUtil.PLAYER_SOLD: case AuctionUtil.PLAYER_RTM: case "PLAYER_RETAIN":
				if(session_auction.getPlayers() != null && session_auction.getPlayers().size() > 0) {
					session_auction.getPlayers().get(session_auction.getPlayers().size() - 1).setTeamId(Integer.valueOf(valueToProcess.split(",")[1]));
					session_auction.getPlayers().get(session_auction.getPlayers().size() - 1).setSoldForPoints(Integer.valueOf(valueToProcess.split(",")[2] + "000"));
					switch(whatToProcess.toUpperCase()) {
					case AuctionUtil.PLAYER_SOLD:
						session_auction.getPlayers().get(session_auction.getPlayers().size() - 1).setSoldOrUnsold(AuctionUtil.SOLD);
						break;
					case AuctionUtil.PLAYER_RTM:
						session_auction.getPlayers().get(session_auction.getPlayers().size() - 1).setSoldOrUnsold(AuctionUtil.RTM);
						break;
					case "PLAYER_RETAIN":
						session_auction.getPlayers().get(session_auction.getPlayers().size() - 1).setSoldOrUnsold("RETAIN");
						break;
					}
				}
				break;
			case AuctionUtil.PLAYER_UNSOLD:
				if(valueToProcess.contains("Draft")) {
					session_auction.getPlayers().get(session_auction.getPlayers().size() - 1).setDraft(AuctionUtil.YES);
				}
				if(session_auction.getPlayers() != null && session_auction.getPlayers().size() > 0) {
					session_auction.getPlayers().get(session_auction.getPlayers().size() - 1).setSoldOrUnsold(AuctionUtil.UNSOLD);
				}
				break;
			case AuctionUtil.PLAYER_REAUCTION:
			    String[] selectedIds = valueToProcess.split(",");
			    if (session_auction.getPlayers() != null && session_auction.getPlayers().size() > 0) {
			        ArrayList<Player> reAuctionPlayers = new ArrayList<>();
			        ArrayList<Player> playersToRemove = new ArrayList<>();
			        for (String selectedId : selectedIds) {
			            for (Player plyr : session_auction.getPlayers()) {
			                boolean isMatch = false;
			                // WPL case
			                if (plyr.getPlayersId() != null && plyr.getPlayersId().equalsIgnoreCase(selectedId)) {
			                    isMatch = true;
			                }
			                else if (plyr.getPlayerId() == Integer.parseInt(selectedId)) {
			                    isMatch = true;
			                }
			                if (isMatch && AuctionUtil.UNSOLD.equalsIgnoreCase(plyr.getSoldOrUnsold())) {

			                    playersToRemove.add(plyr);   // mark for removal
			                    reAuctionPlayers.add(plyr); // store for re-auction
			                }
			            }
			        }
			        //remove from current auction
			        session_auction.getPlayers().removeAll(playersToRemove);
			        // reset and add back to auction pool
			        for (Player plyr : reAuctionPlayers) {
			            plyr.setSoldOrUnsold("");
			            plyr.setTeamId(0);
			            plyr.setSoldForPoints(0);
			        }
			        if (session_auction.getPlayersList() == null) {
			            session_auction.setPlayersList(new ArrayList<>());
			        }
			        session_auction.getPlayersList().addAll(reAuctionPlayers);
			    }
			    break;
				
			case AuctionUtil.UNDO_PLAYERS:
				if(session_auction.getPlayers() != null && session_auction.getPlayers().size() > 0) {
					session_auction.getPlayers().remove(session_auction.getPlayers().get(session_auction.getPlayers().size()-1));
				}
				break;
			
			case AuctionUtil.PLAYER_OVERWRITE:
				switch (session_selected_broadcaster.toUpperCase()) {
				case "WPL":
					if(session_auction.getPlayers() != null && session_auction.getPlayers().size() > 0) {
						for(Player plyr : session_auction.getPlayers()) {
							if(plyr.getPlayersId().equalsIgnoreCase(valueToProcess.split(",")[0] + "," + valueToProcess.split(",")[1])){
								plyr.setTeamId(Integer.valueOf(valueToProcess.split(",")[2]));
								plyr.setSoldOrUnsold(valueToProcess.split(",")[3]);
								plyr.setSoldForPoints(Integer.valueOf(valueToProcess.split(",")[4]));
							}
						}
					}
					break;

				default:
					if(session_auction.getPlayers() != null && session_auction.getPlayers().size() > 0) {
						for(Player plyr : session_auction.getPlayers()) {
							if(plyr.getPlayerId() == Integer.valueOf(valueToProcess.split(",")[0])){
								plyr.setTeamId(Integer.valueOf(valueToProcess.split(",")[1]));
								plyr.setSoldOrUnsold(valueToProcess.split(",")[2]);
								plyr.setSoldForPoints(Integer.valueOf(valueToProcess.split(",")[3]));
							}
						}
					}
					break;
				}
				
				break;
			}
			new ObjectMapper().writeValue(new File(AuctionUtil.AUCTION_DIRECTORY + AuctionUtil.AUCTION_JSON), 
					session_auction);
			session_auction = AuctionFunctions.populateMatchVariables(auctionService, session_auction);
			session_auction.setTeamZoneList(AuctionFunctions.PlayerCountPerTeamZoneWise(session_auction.getTeam(), 
					session_auction.getPlayers(), session_auction.getPlayersList(),session_selected_broadcaster.toUpperCase()));
			
			return objectMapper.writeValueAsString(session_auction);
		
		case AuctionUtil.LOAD_MATCH: 
			if(new File(AuctionUtil.AUCTION_DIRECTORY + AuctionUtil.AUCTION_JSON).exists()) {
				session_auction = new ObjectMapper().readValue(new File(AuctionUtil.AUCTION_DIRECTORY + 
						AuctionUtil.AUCTION_JSON), Auction.class);
				session_auction = AuctionFunctions.populateMatchVariables(auctionService, session_auction);

			}else {
				session_auction = AuctionFunctions.populateMatchVariables(auctionService, session_auction);

				new ObjectMapper().writeValue(new File(AuctionUtil.AUCTION_DIRECTORY + AuctionUtil.AUCTION_JSON), 
						session_auction);
			}
			session_auction.setTeamZoneList(AuctionFunctions.PlayerCountPerTeamZoneWise(session_auction.getTeam(), 
					session_auction.getPlayers(), session_auction.getPlayersList(),session_selected_broadcaster.toUpperCase()));
			return objectMapper.writeValueAsString(session_auction);
			
		default:
			return objectMapper.writeValueAsString(session_auction);
		}
	}
}