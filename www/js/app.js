// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

//FIX resolution on iE
(function() {
	if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
	var msViewportStyle = document.createElement("style");
	msViewportStyle.appendChild(
		document.createTextNode("@-ms-viewport{width:auto!important}")
	);
	document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
	}
})();


var app = angular.module('starter', ['ionic']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
  	if(!window.cordova){
  		return;
  	}
	var admobid = {};
	if( /(android)/i.test(navigator.userAgent) ) {
		admobid = {
			banner: 'ca-app-pub-9306461054994106/8419773176',
			interstitial: 'ca-app-pub-9306461054994106/9896506375',
		};
	} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
		admobid = {
			banner: 'ca-app-pub-9306461054994106/3989573573',
			interstitial: 'ca-app-pub-9306461054994106/5466306778',
		};
	} else {
		admobid = {
			banner: 'ca-app-pub-9306461054994106/2770192371',
			interstitial: 'ca-app-pub-9306461054994106/4246925578',
		};
	}
	if(AdMob){
		AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:false} );
		AdMob.createBanner( {adId: admobid.banner,position: AdMob.AD_POSITION.BOTTOM_CENTER,autoShow: true,adSize:AdMob.AD_SIZE.FULL_BANNER} );
		document.addEventListener('onAdLoaded', function(data){});
        document.addEventListener('onAdPresent', function(data){});
        document.addEventListener('onAdLeaveApp', function(data){});
        document.addEventListener('onAdDismiss', function(data){});
	}


  });
});

app.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element) {
          element.on('load', function() {
          	console.log('imgloaded')
            // Set visibility: true + remove spinner overlay
              element.removeClass('spinner-hide');
              element.addClass('spinner-show');
              element.parent().find('span').remove();
          });
          scope.$watch('ngSrc', function() {
            // Set visibility: false + inject temporary spinner overlay
              element.addClass('spinner-hide');
              // element.parent().append('<span class="spinner"></span>');
          });
        }
    };
});

app.controller('DataController', ['$scope', 'JsonReaderService', function ($scope, JsonReaderService) {
	var arr1 = [{id:1},{id:2},{id:3},{id:4},{id:5}];
	var arr2 = [{id:1},{id:2},{id:3},{id:42},{id:5}];


	function difference(array1, array2){
		var diff = [];
		var has = false;
		for (var i = 0; i < array1.length; i++) {
			has = false;
			for (var j = 0; j < array2.length; j++) {
				if(array2[j].id === array1[i].id)
				{
					has = true;
				}
			};
			if(!has){
				diff.push(array1[i]);
			}
		};
		return diff;
	}
	console.log('diff', difference(arr2, arr1));
	$scope.pokemons = [];
	$scope.currentQuestion = {};
	$scope.darked = true;
	$scope.waiting = true;
	$scope.resultAnsware = 'Who is She?';
	$scope.pageTitle = ' ';
	$scope.isCorrect = false;
	$scope.inGame = false;
	$scope.generations = [[1,26,0]];
	$scope.scores = [];
	$scope.currentGens = [0];
	$scope.globalIds = [];
	$scope.block = false;
	$scope.currentRound = 0;
	$scope.interval = 0;
	$scope.maxTime = 5;
	$scope.gameStatus = 0;
	$scope.currentResult = '-';
	$scope.rounds = [0,0,0,0];
	$scope.results = ['Casual Music Listener!','Biggest Fan!','Celebrity Expert!'];
	$scope.resultsDesc = ['You love music, and you don’t care about the popstars behind it.'+
	'You care about the songs itself, and you might have one or two popstars you really know and love!',
	'You know all the words to the top songs, and you are crazy about some of these popstars!'+
	'You are not on top of every artist out there, but you are definitely a loyal fan to those you like!' ,
	'You know how to match the names with the famous faces!'+
	'It’s no surprise, because you love to listen to music.'+
	'You love to know more about the popstars behind the music!'];
	$scope.preloadSrc = [];
	$scope.isPause = false;

	$scope.pause = function() {
		$scope.isPause = true;
		if($scope.inGame){
			clearInterval($scope.interval);
		}
	}
	// $scope.pause();
	$scope.unPause = function() {
		$scope.isPause = false;
		if($scope.inGame){
			$scope.startInterval();
		}
	}
	setTimeout(function(){
		GameAPI.GameBreak.request($scope.pause, $scope.unPause);
	},500);

	for (var i = 0; i < $scope.generations.length; i++) {
		tempHigh = getSafeCookie('highscores'+i);
		if(tempHigh && parseInt(tempHigh) >= 0 ){
			$scope.scores.push(parseInt(tempHigh));
		}else{
			$scope.scores.push(0);
			setSafeCookie('highscores'+i,0);
		}
	}
	$scope.updateRound = function() {
		$scope.clickQuestion('timeEnd');
	}
	$scope.updateHighscore = function() {
		var totHighs = 0;
		for (var i = 0; i < $scope.generations.length; i++) {
			if($scope.generations[i][2] <= $scope.highscore)
			{
				totHighs ++;
			}
		}
		$scope.highscore = 0;
		for (var i = 0; i < $scope.scores.length; i++) {
			$scope.highscore += $scope.scores[i];
		}

		var newTotHighs = 0;
		for (var i = 0; i < $scope.generations.length; i++) {
			if($scope.generations[i][2] <= $scope.highscore)
			{
				newTotHighs ++;
			}
		}
		if(newTotHighs > totHighs){
			$scope.unlock = true;
		}
		console.log(totHighs, newTotHighs);
	}
	$scope.updateHighscore();

	$scope.resetStatus = function() {
		$scope.lastPokemonId = 0;
		$scope.currentRound = 0;
		$scope.time = $scope.maxTime;
		$scope.block = false;
		$scope.points = 0;
		$scope.ableMore = true;
		$scope.unlock = false;
		$scope.newHigh = false;
		$scope.rounds = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		clearInterval($scope.interval);
	}
	$scope.resetStatus();

	$scope.restart = function() {
		TweenLite.to(".result", 0, {css:{opacity:0}});
		$scope.updateIDs();
		$scope.resetStatus();
		// $scope.randomQuestion();
		// $scope.initQuiz();
		$scope.gameStatus = 1;
		$scope.hideEnd();
		$scope.showGame();
	}


	$scope.randomQuestion = function() {

		$scope.time = $scope.maxTime;
		$scope.resultAnsware = 'Who is?';
		$scope.currentResult = '-';
		$scope.block = false;
		$scope.darked = true;
		$scope.waiting = true;
		$scope.currentQuestion.options = [];

		if($scope.currentRound > $scope.globalIds.length - 1){
			$scope.currentRound = 0;
		}
		var currentPokemon = $scope.globalIds[$scope.currentRound] - 1;
		$scope.currentQuestion.correctPokemon = $scope.pokemons[currentPokemon];
		$scope.lastPokemonId = currentPokemon;
		$scope.currentQuestion.options = [];

		while($scope.currentQuestion.options.length < 3){
			var tempRandom = Math.floor($scope.globalIds.length * Math.random()) + $scope.generations[$scope.currentGens[0]][0] - 1;
			var tempName = $scope.pokemons[tempRandom].name;
			if(tempName !== $scope.currentQuestion.correctPokemon.name){
				var pass = true;
				for (var i = 0; i < $scope.currentQuestion.options.length; i++) {
					if($scope.currentQuestion.options[i] === tempName){
						pass = false;
						break;
					}
					console.log(tempName, $scope.currentQuestion.options[i])
				}
				if(pass){
					$scope.currentQuestion.options.push(tempName);
				}
			}
		}
		$scope.currentQuestion.options.push($scope.currentQuestion.correctPokemon.name)
		$scope.currentQuestion.options = shuffle($scope.currentQuestion.options);


		TweenLite.to(".result", 0, {css:{opacity:1}});
		TweenLite.from(".result", 0.5, {delay:0.2, css:{opacity:0}});

		var ruleImgAfter = CSSRulePlugin.getRule(".image-container:after");
		TweenLite.to(ruleImgAfter, 0, {cssRule:{borderColor:"#FFF", scale:1, opacity:0.7}});
		TweenLite.from(ruleImgAfter, 0.3, {delay:0.2, cssRule:{scale:0.7}, ease:'easeOutBack'});

		var ruleImgBefore = CSSRulePlugin.getRule(".image-container:before");
		TweenLite.to(ruleImgBefore, 0, {cssRule:{borderColor:"#FFF",scale:1, opacity:0.5}});
		TweenLite.from(ruleImgBefore, 0.3, {delay:0.2, cssRule:{scale:0.6}, ease:'easeOutBack'});

		TweenLite.to(".img-resize", 0, {css:{opacity:1}});
		TweenLite.to(".pokemon-container", 0, {css:{scale:1}});

		TweenLite.to(".pokemon-container", 0.3, {css:{backgroundColor:"#FFF"}});
		TweenLite.from(".pokemon-container", 0.3, {delay:0.2, css:{scale:0.8}});
		TweenLite.from(".img-resize", 0.3, {delay:0.3,css:{opacity:0}});
		TweenLite.from(".img-resize", 0.3, {delay:0.3,css:{scale:0.5}, ease:'easeOutBack'});
		// TweenLite.to(".time-bar", 0.2, {css:{width:'100%'}});
		TweenLite.to(".time-bar", 0.2, {css:{scaleX:1}});

		$scope.startInterval();
	}
	$scope.hideEnd = function(force) {
		TweenLite.to(".result", 0, {css:{opacity:0}});
		TweenLite.to(".end-game-modal", 0.3, {css:{opacity:0, y:0}});
		TweenLite.to(".app-name", 0.3, {css:{opacity:0, y:-10}});
	}
	$scope.hideGame = function(force) {
		TweenLite.to(".top-UI", force?0:0.3, {delay:force?0:0.1, css:{opacity:0}});
		TweenLite.to(".pokemon-container", force?0:0.3, {delay:force?0:0.2,css:{opacity:0}});
		TweenLite.to(".image-container", force?0:0.3, {delay:force?0:0.3,css:{opacity:0}});
		TweenLite.to(".round-container", force?0:0.3, {delay:force?0:0.4,css:{opacity:0, y:10}});
		TweenLite.to(".result", force?0:0.3, {delay:force?0:0.5,css:{opacity:0, y:10}});
		TweenLite.to(".buttons-container", force?0:0.3, {delay:force?0:0.6,css:{opacity:0, y:10}});
	}
	$scope.showGame = function() {
		$scope.hideGame(true);
		$scope.gameStatus = 1;
		TweenLite.to(".result", 0, {css:{opacity:0}});
		setTimeout(function(){
			$scope.$apply(function(){
				TweenLite.to(".top-UI", 0.3, {delay:0.1, css:{opacity:1}});
				TweenLite.to(".pokemon-container", 0.3, {delay:0.2,css:{opacity:1}});
				TweenLite.to(".image-container", 0.3, {delay:0.3,css:{opacity:1}});
				TweenLite.to(".round-container", 0.3, {delay:0.4,css:{opacity:1, y:0}});
				TweenLite.to(".result", 0.3, {delay:0.5,css:{opacity:1, y:0}});
				TweenLite.to(".buttons-container", 0.3, {delay:0.6,css:{opacity:1, y:0}});
				$scope.initQuiz();
			})
		}, 500);
	}

	$scope.backToInit = function() {
		$scope.hideGame();
		$scope.hideEnd();
		$scope.inGame = false;
		setTimeout(function(){
			$scope.$apply(function(){
				$scope.showInit();
				$scope.pageTitle = ' ';
				$scope.resetStatus();
			})
		}, 700);
	}
	$scope.showInit = function() {
		$scope.gameStatus = 0;
	}
	$scope.showEnd = function() {
		$scope.pageTitle = 'Congratulations!';
		$scope.gameStatus = 2;
		TweenLite.to(".result", 0, {css:{opacity:0}});
		TweenLite.to(".app-name", 0, {css:{opacity:1, y:0}});
		TweenLite.from(".app-name", 0.3, {css:{opacity:0, y:-10}});
		TweenLite.to(".end-game-modal", 0, {css:{opacity:1, y:0}});
		TweenLite.from(".end-game-modal", 0.3, {css:{opacity:0, y:0}});
	}

	$scope.checkGen = function(targetId, add, able) {
		if(!able){
			return;
		}
		$scope.currentGens = [targetId];
		$scope.updateIDs();
		$scope.initQuiz();
	}
	$scope.getLevelInfo = function(id) {
		// console.log($scope.generations[id][2])
		if($scope.generations[id][2] <= $scope.highscore){
			return 'HIGHSCORE '+$scope.scores[id];
		}else{
			return 'TO UNLOCK: '+$scope.generations[id][2];
		}
	}
	$scope.updateIDs = function() {
		var tempMin = 0;
		var tempMax = 0;
		$scope.globalIds = [];
		for (var i = 0; i < $scope.currentGens.length; i++) {
			tempMin = $scope.generations[$scope.currentGens[i]][0];
			tempMax = $scope.generations[$scope.currentGens[i]][1];
			for (var j = tempMin; j <= tempMax; j++) {
				$scope.globalIds.push(j);
			}
		}
		$scope.globalIds = shuffle($scope.globalIds);
	}
	$scope.initQuiz = function() {
		$scope.pageTitle = '';
		$scope.inGame = true;
		$scope.gameStatus = 1;

		$scope.preloadSrc = [];
		for (var i = 0; i < $scope.rounds.length; i++) {
			var currentPokemon = $scope.globalIds[i] - 1;
			$scope.preloadSrc.push($scope.pokemons[currentPokemon].url);
		}
		console.log($scope.preloadSrc)
		$scope.randomQuestion();
		$scope.currentRound = 0;
	}

	$scope.startInterval = function() {
		TweenLite.to(".time", 0, {css:{backgroundColor:"#e5868a"}});
		TweenLite.to(".time", 0.3, {delay:0.3, css:{backgroundColor:"#FFF"}});
		clearInterval($scope.interval);
		$scope.interval = setInterval(function(){
			$scope.$apply(function(){
				$scope.time --;
				if($scope.time > 0){
					TweenLite.to(".time-bar", 1, {css:{scaleX:($scope.time - 1) / ($scope.maxTime - 1)}, ease:'easeNoneLinear'});
				}
				// TweenLite.to(".time-bar", 1, {css:{width:($scope.time - 1) / ($scope.maxTime - 1) * 100+ '%'}, ease:'easeNoneLinear'});
				TweenLite.to(".time", 0.2, {css:{scale:0.8}});
				TweenLite.to(".time", 0.2, {delay:0.2, css:{scale:1}});
				if($scope.time <= 0){
					clearInterval($scope.interval);
					$scope.updateRound();
				}
			})
		},1000);
	}
	$scope.more30 = function() {
		$scope.ableMore = false;
		$scope.time += 30;
		if(window.cordova && AdMob){
			AdMob.showInterstitial();
		}
		$scope.pause();
	}
	$scope.endGame = function() {
		// console.log($scope.currentGens[0], $scope.points)
		var temp = $scope.points/$scope.rounds.length;
		var idResult = 0;
		// $scope.results
		console.log($scope.points, $scope.rounds.length, $scope.results[Math.floor(temp * $scope.results.length)]);
		// $scope.finalResult = $scope.points+' / '+$scope.rounds.length;
		// $scope.points = $scope.results[Math.floor(temp * $scope.results.length)];

		$scope.finalResult = $scope.points+' / '+$scope.rounds.length;
		$scope.resultTitle = $scope.results[Math.floor(temp * ($scope.results.length-1))];
		$scope.resultDesc = $scope.resultsDesc[Math.floor(temp * ($scope.resultsDesc.length-1))];
		// if($scope.scores[$scope.currentGens[0]] < $scope.points){
		// 	$scope.scores[$scope.currentGens[0]] = $scope.points;
		// 	$scope.newHigh = true;
		// }
		// $scope.saveScore();
		$scope.hideGame();
		clearInterval($scope.interval);
		setTimeout(function(){
			$scope.$apply(function(){
				$scope.showEnd();
			})
		},1000);
	}
	$scope.clickQuestion = function(target) {
		$scope.lastClicked = target;
		if($scope.block){
			return
		}
		$scope.block = true;
		var colorTemp = '#59f5d6';
		if($scope.currentQuestion.correctPokemon.name === target){
			$scope.isCorrect = true;
			$scope.resultAnsware = 'GREAT';
			$scope.points ++;
			$scope.currentResult = '+5';
			$scope.rounds[$scope.currentRound] = 1;
		}else{
			colorTemp = '#63487d';
			$scope.isCorrect = false;
			$scope.resultAnsware = 'WRONG';
			// $scope.points -= 5;
			if($scope.points < 0){
				$scope.points = 0;
			}
			$scope.currentResult = '-5';
			$scope.rounds[$scope.currentRound] = -1;
		}
		if(target === 'timeEnd'){
			$scope.resultAnsware = "TIME'S UP";
			TweenLite.to(".time", 0.2, {delay:0.4, css:{backgroundColor:"#e5868a"}});
		}
		$scope.darked = false;
		$scope.waiting = false;


		var ruleImgAfter = CSSRulePlugin.getRule(".image-container:after");
		TweenLite.to(ruleImgAfter, 0.2, {cssRule:{borderColor:colorTemp}});
		TweenLite.to(ruleImgAfter, 0.5, {delay:0.6, cssRule:{opacity:0}});

		var ruleImgBefore = CSSRulePlugin.getRule(".image-container:before");
		TweenLite.to(ruleImgBefore, 0.2, {cssRule:{borderColor:colorTemp}});
		TweenLite.to(ruleImgBefore, 0.5, {delay:0.7, cssRule:{opacity:0}});

		TweenLite.to(".result", 0, {css:{opacity:0}});
		TweenLite.from(".result", 0.3, {delay:0.5, css:{opacity:0}});
		TweenLite.from(".result", 0.1, {css:{y:15}});
		// TweenLite.from(".result", 0.5, {ease:"easeOutBack",css:{transform:"translateY(15px)"}});

		TweenLite.to(".pokemon-container", 0.3, {css:{backgroundColor:colorTemp}});
		TweenLite.to(".pokemon-container", 0.1, {delay:0.9,css:{ scale:0.8}});

		clearInterval($scope.interval);
		setTimeout(function(){
			$scope.$apply(function(){
				$scope.currentRound ++;
				if($scope.currentRound >= $scope.rounds.length){
					$scope.endGame();
				}else{
					$scope.randomQuestion();
				}
        	})
		}, 1000);
	}

	$scope.saveScore = function(){
		for (var i = 0; i < $scope.scores.length; i++) {
			setSafeCookie('highscores'+i,$scope.scores[i]);
		}
		$scope.updateHighscore();
	}

	JsonReaderService('celebs')
		.success(function (data) {
			$scope.pokemons = data.pokemons;
			$scope.pokemons.sort(function(a, b){return a.id-b.id});
			$scope.generations = [[1,$scope.pokemons.length,0]];
			$scope.updateIDs();
			// $scope.initQuiz();
		});
}]);

app.factory('JsonReaderService', ['$http', function ($http) {
	return function (filename) {
		return $http.get('./json/'+filename+'.json');
	};
}]);


function setSafeCookie(key, value) {
	window.localStorage.setItem(key, value);
}

function getSafeCookie(key, callback) {
	var value = window.localStorage.getItem(key);
	return value;
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
	}
	return array;
}
