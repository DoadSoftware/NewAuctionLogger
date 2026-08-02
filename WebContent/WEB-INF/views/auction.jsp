<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1">
  <title>Auction</title>

	<script src="<c:url value='/webjars/jquery/3.7.1/jquery.min.js'/>"></script>
	<script src="<c:url value='/webjars/bootstrap/5.3.8/js/bootstrap.bundle.min.js'/>"></script>
	<script src="<c:url value='/webjars/select2/4.1.0/dist/js/select2.min.js'/>"></script>
	<script src="<c:url value='/resources/javascript/index.js'/>"></script>
	
	<link rel="stylesheet" href="<c:url value='/webjars/bootstrap/5.3.8/css/bootstrap.min.css'/>"/>
	<link rel="stylesheet" href="<c:url value='/webjars/select2/4.1.0/dist/css/select2.min.css'/>"/>

  <style>
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow-x: auto;
      background-color: #eeeaff;
      font-family: Arial, sans-serif;
      background-image: url('<c:url value="/resources/Images/img.png"/>');
      background-size: cover; 
      background-position: center center;
      background-repeat: no-repeat;
      animation: zoomIn 1s ease-in-out;
    }

    .container {
      width: 100%;
      padding: 15px;
      margin: 0 auto;
    }

    .btn-sm {
	  width: 100%;
	  background-color: #2E008B;
	  color: #fff;
	  padding: 10px;
	  font-size: 14px;
	  border-radius: 10px;
	  word-wrap: break-word; /* Ensure long text breaks */
	  white-space: normal; /* Allow text to wrap normally */
	  border: none;
	  font-weight: 300;
	  text-align: center;
	  box-shadow: 0 5px 10px rgba(46, 0, 139, 0.4);
	  transition: all 0.3s ease;
	  cursor: pointer;
	}


    .btn-sm:hover {
      background-color: #4711b4;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(46, 0, 139, 0.5);
    }

    #auction_div, #select_event_div {
      width: 100%;
      max-width: 100%;
      padding: 10px;
      overflow-x: auto;
      background-image: url('<c:url value="/resources/Images/image.png"/>');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      color: #000;
      border-radius: 12px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    #auction_div table, #select_event_div table {
      width: 100%;
      max-width: 100%;
      table-layout: auto;
      word-wrap: break-word;
    }

    .row, .col-sm-12 {
      margin: 0;
      padding: 0;
    }

    a, h4, table {
      font-size: larger;
      font-weight: bolder;
    }

    .wordart-3d {
      color: #fff;
      text-transform: uppercase;
      text-shadow:
        1px 1px 0 #000,
        1px 1px 0 #333,
        1px 1px 0 #666,
        1px 1px 0 #999,
        1px 1px 0 #ccc;
      padding: 10px 20px;
      border-radius: 8px;
      display: inline-block;
      transition: transform 0.2s ease;
    }

    .wordart-3d:hover {
      transform: scale(1.1);
      cursor: pointer;
    }

    @keyframes zoomIn {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Responsive buttons layout */
    #start_pause_match_time_div .row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    #start_pause_match_time_div .col-sm-2 {
      flex: 1 1 45%;
      min-width: 150px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body onload="afterPageLoad('AUCTION');">
<form:form name="auction_form" autocomplete="off" action="auction" method="POST" enctype="multipart/form-data">
  <div class="content py-5" style="background-color: #EAE8FF; color: #2E008B">
    <div class="container">
      <div class="row">
        <div class="col-12"> <!-- Make the entire div take 100% of the width -->
          <span class="anchor"></span>
          <div class="card card-outline-secondary">
            <div class="card-header">
              <!-- Empty header -->
            </div>
            <div class="card-body">
              <div class="panel-group" id="match_configuration">
                <div class="panel panel-default">
                  <div class="panel-heading">
                    <h4 class="panel-title">
                      <a class="wordart-3d" data-toggle="collapse" data-parent="#match_configuration" href="#load_setup_match">Configuration</a>
                    </h4>
                  </div>
                  <div id="load_setup_match" class="panel-collapse collapse">
                    <div class="panel-body">
                      <div id="start_pause_match_time_div" style="margin-bottom:5px;">
                        <div class="row">
                          <div class="col-2 col-sm-1">
                            <button style="background-color:#2E008B;color:#FEFEFE;" class="btn btn-sm" type="button"
                                    name="select_player" id="select_player" onclick="processUserSelection(this);">
                              <i class="fas fa-tools"></i> SELECT PLAYER
                            </button>
                          </div>
                          <div class="col-2 col-sm-1">
                            <button style="background-color:#2E008B;color:#FEFEFE;" class="btn btn-sm" type="button"
                                    name="player_auction" id="player_auction" onclick="processUserSelection(this);">
                              <i class="fas fa-tools"></i> PLAYER AUCTION
                            </button>
                          </div>
                          <div class="col-2 col-sm-1">
                            <button style="background-color:#2E008B;color:#FEFEFE;" class="btn btn-sm" type="button"
                                    name="player_reauction" id="player_reauction" onclick="processUserSelection(this);">
                              <i class="fas fa-tools"></i> RESET UNSOLD PLAYER
                            </button>
                          </div>
                          <div class="col-2 col-sm-1">
                            <button style="background-color:#2E008B;color:#FEFEFE;" class="btn btn-sm" type="button"
                                    name="player_overwrite" id="player_overwrite" onclick="processUserSelection(this);">
                              <i class="fas fa-tools"></i> OVERWRITE 
                            </button>
                          </div>
                          <div class="col-2 col-sm-1">
                            <button style="background-color:#2E008B;color:#FEFEFE;" class="btn btn-sm" type="button"
                                    name="undo_player_data" id="undo_player_data" onclick="processUserSelection(this);">
                              <i class="fas fa-tools"></i> UNDO
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group row row-bottom-margin ml-2" style="margin-bottom:5px;">
                <!-- Full-width div for dynamic content -->
                <div id="select_event_div" style="display:none;"></div>
                <div id="auction_div" style="display:none;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Hidden input for selected broadcaster -->
  <input type="hidden" name="selectedBroadcaster" id="selectedBroadcaster" value="${session_selected_broadcaster}"/>
</form:form>
</body>
</html>
