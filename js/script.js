//script.js
//This is for closing the navbar button when the user clicks 
//somewhere else  on the page
$(function (){ //same as document.addEventListener("DOMContentLoaded",..)
	$("#navbarToggle").blur(function (event) {
		var screenWidth = window.innerWidth;

		if(screenWidth <992) {
			$("#collapsable-nav").collapse('hide');
		}
	});
	$("navbarToggle").click(function (event) {
		$(event.target).focus();
	});
});

//This is for home page snippet
(function (global) {

	var dc = {};
	var homeHtml = "snippets/home-snippet.html";
	var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json";
	var categoriesTitleHtml = "snippets/categories-title-snippet.html";
	var categoryHtml = "snippets/category-snippet.html";

	//for the single category menu items
	var menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
	var menuItemsTitleHtml = "snippets/menu-items-title.html";
	var menuItemHtml = "snippets/menu-item.html";
	
	//convinence function for inserting innerHTML for 'select'
	var insertHtml = function(selector,html) {
		var targetElem = document.querySelector(selector);
		targetElem.innerHTML = html;
	};

	//show loading icon inside element identified by 'selector'

	var showLoading = function(selector) {
		var html = "<div class='text-center'>";
		html += "<p>          </p><p> Breathe in </p> <p> Breathe out </p><p> Breathe in </p><p>Breathe out </p> <p>...</p>"
		html +="<img src='images/ajax-loader.gif'></div>"
		insertHtml(selector,html);
	};


	// Return substitute of '{{propName}}'
	// with propValue in given 'string'

	var insertProperty = function(string, propName, propValue) {
		var propToReplace = "{{" + propName + "}}";
		string = string.replace (new RegExp(propToReplace, "g"), propValue);
		return string;
	}

	//Remove the class 'active' from home and switch to Menu button

	var switchMenuToActive = function () {
		//Remove 'active' from home button
		var classes = document.querySelector("#navHomeButton").className;
		classes = classes.replace(new RegExp("active", "g"),"");
		document.querySelector("#navHomeButton").className = classes;

		//Add 'active' to menu button if not already active
		classes = document.querySelector("#navMenuButton").className;
		if(classes.indexOf("active") == -1) {
			classes += " active";
			document.querySelector("#navMenuButton").className = classes;
		}
	};

	//On page load (before image or CSS)
	document.addEventListener("DOMContentLoaded", function(event) {

		//On first load, show home view
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(
			homeHtml,function(responseText) {
				document.querySelector("#main-content")
				.innerHTML = responseText;
			},	false
		);
	});

	// Loadd the menu cattegories view
	dc.loadMenuCategories = function() {
		showLoading ("#main-content");
		$ajaxUtils.sendGetRequest(allCategoriesUrl,buildAndShowCategoriesHTML,true);
	};

	//Load the menu items view
	// 'categoryShort' is a short_name for a category

	dc.loadMenuItems = function (categoryShort) {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest (menuItemsUrl + categoryShort,
			buildAndShowMenuItemsHTML);
	};

	//Builds HTML for the categories page based on the data from the server 
	function buildAndShowCategoriesHTML (categories) {
		// Load title snippet of categories page
		$ajaxUtils.sendGetRequest(
			categoriesTitleHtml, 
			function (categoriesTitleHtml) {
				//Retrieve single category snippet
				$ajaxUtils.sendGetRequest (
					categoryHtml, 
					function (categoryHtml) {
						var categoriesViewHtml = 
							buildCategoriesViewHtml(categories,
													categoriesTitleHtml,
													categoryHtml);
							insertHtml("#main-content",categoriesViewHtml);
						},
						false);
			},
		false);
	}	

	//Using categories data and snippets html build categories view 
	// HTML to be inserted into page

	function buildCategoriesViewHtml(categories, categoriesTitleHtml,
									categoryHtml) {
		var finalHtml = categoriesTitleHtml;
		finalHtml += "<section class='row'>";
		// loop over categories
		for(var i=0;i<categories.length;i++) {
			//Insert category values
			var html = categoryHtml;
			var name = "" +categories[i].name;
			var short_name = categories[i].short_name;

			html = insertProperty(html, "name", name);
			html = insertProperty(html, "short_name", short_name);
			finalHtml +=html;
		}
		finalHtml += "</section>";
		return finalHtml;
	}

	//builds html for the single category page based on the data from the server

	function buildAndShowMenuItemsHTML (categoryMenuItems) {
		//Load title snippet of menu items page
		$ajaxUtils.sendGetRequest(menuItemsTitleHtml,
			function(menuItemsTitleHtml) {
				//Retrieve single menu Item snippet
				$ajaxUtils.sendGetRequest (menuItemHtml,
					function (menuItemHtml) {
						var menuItemsViewHtml = 
							buildMenuItemsViewHtml (categoryMenuItems,
													menuItemsTitleHtml,
													menuItemHtml);
							insertHtml("#main-content",menuItemsViewHtml);
					},
					false);
			},
			false);
	}

	//Using category and menu items data and snippets html build menu
	//items view HTML  to be inserted to the page

	function buildMenuItemsViewHtml (categoryMenuItems,
									menuItemsTitleHtml,
									menuItemHtml) {

		menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,
							"name", 
							categoryMenuItems.category.name);

		menuItemsTitleHtml = insertProperty (menuItemsTitleHtml,
							"special_instructions",
							categoryMenuItems.category.special_instructions);

		var finalHtml = menuItemsTitleHtml;
		finalHtml += "<section class='row'>";

		//Loop over menu items
		var menuItems = categoryMenuItems.menu_items;
		var catShortName = categoryMenuItems.category.short_name;

		for(var i=0;i<menuItems.length; i++) {
			//Insert menu items here
			var html = menuItemHtml;
			html = insertProperty (html, "short_name", menuItems[i].short_name);

			html = insertProperty (html,"catShortName", catShortName);

			html = insertItemPrice(html, "price_small",menuItems[i].price_small);

			html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);

			html = insertItemPrice(html, "price_large", menuItems[i].price_large);

			html = insertItemPortionName (html, "large_portion_name", menuItems[i].large_portion_name);

			html = insertProperty (html, "name", menuItems[i].name);

			html = insertProperty (html, "description", menuItems[i].description);

			//Add clearfix after every second menu item 
			//just to separate the contents to be 2 in a row
			if(i%2 != 0) {
				html += "<div class='clearfix hidden-md-down'></div>";
			}

			finalHtml +=html;

		}

		finalHtml += "</section>";
		return finalHtml;
	}

	//Appends price with '$' if price exists

	function insertItemPrice (html,
							pricePropName,
							priceValue) {
		//if not specified, replace an empty string here
		if(!priceValue) {
			return insertProperty(html, pricePropName, "");
		}

		priceValue = "$" +priceValue.toFixed(2);
		html = insertProperty (html, pricePropName, priceValue);
		return html;
	}

	//Appends portion name in parents if it exits
	function insertItemPortionName (html, 
								portionPropName,
								portionValue) {
		//If not specified return original String
		if(!portionValue) {
			return insertProperty(html, portionPropName, "");
		}
		portionValue = "(" + portionValue + ")";
		html = insertProperty (html, portionPropName, portionValue);
		return html;
	}

	global.$dc = dc;

})(window);