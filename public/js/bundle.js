(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */

var Router = window.ReactRouter;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var Home = require("./components/home");
var Exercises = require("./components/exercises");
var Workout= require("./components/workout");
var NotFound = require("./components/not_found");
var auth = require("./helpers/auth");

var App = React.createClass({displayName: "App",
	getInitialState: function(){
		return { auth: "authorizing" };
	},
	componentDidMount: function(){
		var that = this;
		auth.authorize(function(result){
			if(result) that.setState({ auth: "authorized" });
			else window.location.href = auth.loginPage;
		});
	},
	logout: function(){
		this.setState({ auth: "loggingOut" });
		auth.logout(function(){
			window.location.href = auth.loginPage;
		});
	},
	render: function () {
		if(this.state.auth === "authorizing") return React.createElement("h1", null, "Authorizing...");
		else if(this.state.auth === "loggingOut") return React.createElement("h1", null, "Logging out...")
		else if(this.state.auth === "authorized"){
			return (
				React.createElement("div", null, 
					React.createElement("header", null, 
						React.createElement("ul", null, 
							React.createElement("li", null, React.createElement(Link, {to: "home"}, "Home")), 
							React.createElement("li", null, React.createElement(Link, {to: "exercises"}, "Exercises")), 
							React.createElement("li", null, React.createElement(Link, {to: "workout"}, "New Workout")), 
							React.createElement("li", null, 
								React.createElement("a", {href: "#", onClick: this.logout}, "Logout")
							)
						), 
						React.createElement("div", null, 
							React.createElement("p", null, "user: ", auth.getUsername())
						)
					), 
					React.createElement(RouteHandler, null)
				)
			);
		}
	}
});

var routes = (
	React.createElement(Route, {name: "home", path: "/", handler: App}, 
		React.createElement(Route, {name: "exercises", handler: Exercises}), 
		React.createElement(Route, {name: "workout", handler: Workout}), 
		React.createElement(DefaultRoute, {handler: Home}), 
		React.createElement(NotFoundRoute, {handler: NotFound})
	)
);

Router.run(routes, function(Handler) {
	React.render(React.createElement(Handler, null), document.body);
});


},{"./components/exercises":2,"./components/home":3,"./components/not_found":4,"./components/workout":5,"./helpers/auth":7}],2:[function(require,module,exports){
/** @jsx React.DOM */

var api = require("../helpers/api");

var Exercises = React.createClass({displayName: "Exercises",
	getInitialState: function(){
		return {
			state: "loading_exercises",
			exercises: []
		}
	},
	componentDidMount: function(){
		api.get("/exercises", function(exercises){
			console.log(exercises);
		});
	},
	render: function(){
		return (
			React.createElement("h2", null, "Exercises")
		);
	}
});

module.exports = Exercises;

},{"../helpers/api":6}],3:[function(require,module,exports){
/** @jsx React.DOM */

var api = require("../helpers/api");

var Home = React.createClass({displayName: "Home",
	testGet: function(){
		api.get("/secret", function(result){
			console.log("get working", result);
		});
	},
	testPost: function(){
		api.post("/secret", { testData: "majom" }, function(result){
			console.log("post working", result);
		})
	},
	render: function(){
		return (
			React.createElement("div", null, 
				React.createElement("h2", null, "Home"), 
				React.createElement("button", {type: "text", onClick: this.testGet}, "Get"), 
				React.createElement("button", {type: "text", onClick: this.testPost}, "Post")
			)
		);
	}
});

module.exports = Home;


},{"../helpers/api":6}],4:[function(require,module,exports){
/** @jsx React.DOM */

var NotFound = React.createClass({displayName: "NotFound",
	render: function(){
		return (
			React.createElement("div", null, "Page is not found")
		);
	}
});

module.exports = NotFound;

},{}],5:[function(require,module,exports){
/** @jsx React.DOM */

var api = require("../helpers/api");

var Workout = React.createClass({displayName: "Workout",
	getInitialState: function(){
		return { exercises: false };
	},
	componentDidMount: function(){
		var that = this;
		api.get("/exercises", function(exercises){
			that.setState({
				exercises: exercises
			});
		});
	},
	addExercise: function(){
		if(!this.state.selectedExercise) return;
		var exercise = this.state.exercises[this.state.selectedExercise.name];
		if(exercise.preQuantities){
			var unit = "";
			if(exercise.preQuantities[0].unit) unit = "(" + exercise.preQuantities[0].unit + ")";
			exercise.preQuantities[0].value = prompt(exercise.preQuantities[0].name + "? " + unit);
		}
		var numberOfSets = prompt("Nubmer of sets?");
		var selectedExerciseList = [];
		for(var i = 0; i < numberOfSets; i++){
			selectedExerciseList.push(exercise);
		}
		if(this.state.selectedExerciseList)
			selectedExerciseList = this.state.selectedExerciseList.concat(selectedExerciseList);
		this.setState({
			exercises: this.state.exercises,
			selectedExercise: this.state.selectedExercise,
			selectedExerciseList: selectedExerciseList
		});
	},
	changeExercise: function(event){
		this.setState({
			exercises: this.state.exercises,
			selectedExercise: this.state.exercises[event.target.value]
		});
	},
	render: function(){
		if(this.state.exercises){
			var exerciseOptions = [];
			_.each(this.state.exercises, function(exercise){
				var option = (
					React.createElement("option", {value: exercise.name}, exercise.name)
				);
				exerciseOptions.push(option);
			});
			var selectedExercise = null;
			if(this.state.selectedExercise){
				selectedExercise = (
					React.createElement("div", null, this.state.selectedExercise.name)
				);
			}
			var selectedExerciseList = [];
			_.each(this.state.selectedExerciseList, function(exercise){
				var element;
				if(exercise.preQuantities){
					element = (
						React.createElement("p", null, exercise.name, " ", exercise.preQuantities[0].value, " ", exercise.preQuantities[0].unit)
					);
				}
				else{
					element = (
						React.createElement("p", null, exercise.name)
					);
				}
				selectedExerciseList.push(element);
			});
			return (
				React.createElement("div", null, 
					React.createElement("h2", null, "New Workout"), 
					selectedExercise, 
					React.createElement("select", {onChange: this.changeExercise}, 
						exerciseOptions
					), 
					React.createElement("button", {onClick: this.addExercise}, "Add exercise"), 
					selectedExerciseList
				)
			);
		}
		else{
			return (
				React.createElement("h2", null, "Loading...")
			);
		}
	}
});

module.exports = Workout;

},{"../helpers/api":6}],6:[function(require,module,exports){
var auth = require("./auth");

module.exports = {
	log: function(text){
		console.log(text);
	},
	get: function(url, success){
		$.ajax({
			url: url,
			type: 'GET',
			headers: {
				"x-auth-token": auth.getToken(),
				"x-auth-username": auth.getUsername()
			},
			success: function(result) {
				success(result);
			}.bind(this),
			error: function(xhr, status, err) {
				console.log(status);
				if(xhr.status >= 400) window.location.href = auth.loginPage;
			}.bind(this)
		});
	},
	post: function(url, data, success){
		$.ajax({
			url: url,
			type: 'POST',
			data: data,
			headers: {
				"x-auth-token": auth.getToken(),
				"x-auth-username": auth.getUsername()
			},
			success: function(result) {
				success(result);
			}.bind(this),
			error: function(xhr, status, err) {
				console.log(status);
				if(xhr.status >= 400) window.location.href = auth.loginPage;
			}.bind(this)
		});
	}
};

},{"./auth":7}],7:[function(require,module,exports){
var auth = {
	loginPage: "/login.html",
	logout: function(callback){
		$.ajax({
			url: "/logout",
			type: 'POST',
			data: {
				username: this.getUsername()
			},
			success: function(result) {
				delete localStorage.token;
				delete localStorage.username;
				callback();
			}.bind(this),
			error: function(xhr, status, err) {
				console.log("error while loggint out");
				delete localStorage.token;
				delete localStorage.username;
				callback();
			}.bind(this)
		});
	},
	authorize: function(callback){
		if(!this.getToken()) {
			callback(false);
			return;
		}

		$.ajax({
			url: "/authorize",
			type: 'GET',
			headers: {
				"x-auth-token": this.getToken(),
				"x-auth-username": this.getUsername()
			},
			success: function(result) {
				callback(true);
			}.bind(this),
			error: function(xhr, status, err) {
				callback(false);
			}.bind(this)
		});
	},
	getToken: function(){
		return localStorage.token;
	},
	getUsername: function(){
		return localStorage.username;
	},
	loggedIn: function(){
		return this.getToken();
	},
	onChange: function(){}
};

module.exports = auth;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzpcXGRldlxcd2ViXFxmaXRcXHNyY1xcc2NyaXB0c1xcbWFpbi5qcyIsIkM6XFxkZXZcXHdlYlxcZml0XFxzcmNcXHNjcmlwdHNcXGNvbXBvbmVudHNcXGV4ZXJjaXNlcy5qcyIsIkM6XFxkZXZcXHdlYlxcZml0XFxzcmNcXHNjcmlwdHNcXGNvbXBvbmVudHNcXGhvbWUuanMiLCJDOlxcZGV2XFx3ZWJcXGZpdFxcc3JjXFxzY3JpcHRzXFxjb21wb25lbnRzXFxub3RfZm91bmQuanMiLCJDOlxcZGV2XFx3ZWJcXGZpdFxcc3JjXFxzY3JpcHRzXFxjb21wb25lbnRzXFx3b3Jrb3V0LmpzIiwiQzpcXGRldlxcd2ViXFxmaXRcXHNyY1xcc2NyaXB0c1xcaGVscGVyc1xcYXBpLmpzIiwiQzpcXGRldlxcd2ViXFxmaXRcXHNyY1xcc2NyaXB0c1xcaGVscGVyc1xcYXV0aC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLHFCQUFxQjs7QUFFckIsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUNoQyxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDekMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN2QixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3pCLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDdkMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDeEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDbEQsSUFBSSxPQUFPLEVBQUUsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENB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Q0FDRCxRQUFRLEVBQUUsVUFBVTtFQUNuQixPQUFPLFlBQVksQ0FBQyxLQUFLLENBQUM7RUFDMUI7Q0FDRCxXQUFXLEVBQUUsVUFBVTtFQUN0QixPQUFPLFlBQVksQ0FBQyxRQUFRLENBQUM7RUFDN0I7Q0FDRCxRQUFRLEVBQUUsVUFBVTtFQUNuQixPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztFQUN2QjtDQUNELFFBQVEsRUFBRSxVQUFVLEVBQUU7QUFDdkIsQ0FBQyxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cclxuXHJcbnZhciBSb3V0ZXIgPSB3aW5kb3cuUmVhY3RSb3V0ZXI7XHJcbnZhciBEZWZhdWx0Um91dGUgPSBSb3V0ZXIuRGVmYXVsdFJvdXRlO1xyXG52YXIgTm90Rm91bmRSb3V0ZSA9IFJvdXRlci5Ob3RGb3VuZFJvdXRlO1xyXG52YXIgTGluayA9IFJvdXRlci5MaW5rO1xyXG52YXIgUm91dGUgPSBSb3V0ZXIuUm91dGU7XHJcbnZhciBSb3V0ZUhhbmRsZXIgPSBSb3V0ZXIuUm91dGVIYW5kbGVyO1xyXG52YXIgSG9tZSA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHMvaG9tZVwiKTtcclxudmFyIEV4ZXJjaXNlcyA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHMvZXhlcmNpc2VzXCIpO1xyXG52YXIgV29ya291dD0gcmVxdWlyZShcIi4vY29tcG9uZW50cy93b3Jrb3V0XCIpO1xyXG52YXIgTm90Rm91bmQgPSByZXF1aXJlKFwiLi9jb21wb25lbnRzL25vdF9mb3VuZFwiKTtcclxudmFyIGF1dGggPSByZXF1aXJlKFwiLi9oZWxwZXJzL2F1dGhcIik7XHJcblxyXG52YXIgQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB7IGF1dGg6IFwiYXV0aG9yaXppbmdcIiB9O1xyXG5cdH0sXHJcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgdGhhdCA9IHRoaXM7XHJcblx0XHRhdXRoLmF1dGhvcml6ZShmdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0XHRpZihyZXN1bHQpIHRoYXQuc2V0U3RhdGUoeyBhdXRoOiBcImF1dGhvcml6ZWRcIiB9KTtcclxuXHRcdFx0ZWxzZSB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGF1dGgubG9naW5QYWdlO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHRsb2dvdXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLnNldFN0YXRlKHsgYXV0aDogXCJsb2dnaW5nT3V0XCIgfSk7XHJcblx0XHRhdXRoLmxvZ291dChmdW5jdGlvbigpe1xyXG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGF1dGgubG9naW5QYWdlO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmKHRoaXMuc3RhdGUuYXV0aCA9PT0gXCJhdXRob3JpemluZ1wiKSByZXR1cm4gPGgxPkF1dGhvcml6aW5nLi4uPC9oMT47XHJcblx0XHRlbHNlIGlmKHRoaXMuc3RhdGUuYXV0aCA9PT0gXCJsb2dnaW5nT3V0XCIpIHJldHVybiA8aDE+TG9nZ2luZyBvdXQuLi48L2gxPlxyXG5cdFx0ZWxzZSBpZih0aGlzLnN0YXRlLmF1dGggPT09IFwiYXV0aG9yaXplZFwiKXtcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHQ8ZGl2PlxyXG5cdFx0XHRcdFx0PGhlYWRlcj5cclxuXHRcdFx0XHRcdFx0PHVsPlxyXG5cdFx0XHRcdFx0XHRcdDxsaT48TGluayB0bz1cImhvbWVcIj5Ib21lPC9MaW5rPjwvbGk+XHJcblx0XHRcdFx0XHRcdFx0PGxpPjxMaW5rIHRvPVwiZXhlcmNpc2VzXCI+RXhlcmNpc2VzPC9MaW5rPjwvbGk+XHJcblx0XHRcdFx0XHRcdFx0PGxpPjxMaW5rIHRvPVwid29ya291dFwiPk5ldyBXb3Jrb3V0PC9MaW5rPjwvbGk+XHJcblx0XHRcdFx0XHRcdFx0PGxpPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGEgaHJlZj1cIiNcIiBvbkNsaWNrPXt0aGlzLmxvZ291dH0+TG9nb3V0PC9hPlxyXG5cdFx0XHRcdFx0XHRcdDwvbGk+XHJcblx0XHRcdFx0XHRcdDwvdWw+XHJcblx0XHRcdFx0XHRcdDxkaXY+XHJcblx0XHRcdFx0XHRcdFx0PHA+dXNlcjoge2F1dGguZ2V0VXNlcm5hbWUoKX08L3A+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PC9oZWFkZXI+XHJcblx0XHRcdFx0XHQ8Um91dGVIYW5kbGVyLz5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxudmFyIHJvdXRlcyA9IChcclxuXHQ8Um91dGUgbmFtZT1cImhvbWVcIiBwYXRoPVwiL1wiIGhhbmRsZXI9e0FwcH0+XHJcblx0XHQ8Um91dGUgbmFtZT1cImV4ZXJjaXNlc1wiIGhhbmRsZXI9e0V4ZXJjaXNlc30vPlxyXG5cdFx0PFJvdXRlIG5hbWU9XCJ3b3Jrb3V0XCIgaGFuZGxlcj17V29ya291dH0vPlxyXG5cdFx0PERlZmF1bHRSb3V0ZSBoYW5kbGVyPXtIb21lfS8+XHJcblx0XHQ8Tm90Rm91bmRSb3V0ZSBoYW5kbGVyPXtOb3RGb3VuZH0vPlxyXG5cdDwvUm91dGU+XHJcbik7XHJcblxyXG5Sb3V0ZXIucnVuKHJvdXRlcywgZnVuY3Rpb24oSGFuZGxlcikge1xyXG5cdFJlYWN0LnJlbmRlcig8SGFuZGxlci8+LCBkb2N1bWVudC5ib2R5KTtcclxufSk7XHJcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIGFwaSA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2FwaVwiKTtcclxuXHJcbnZhciBFeGVyY2lzZXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3RhdGU6IFwibG9hZGluZ19leGVyY2lzZXNcIixcclxuXHRcdFx0ZXhlcmNpc2VzOiBbXVxyXG5cdFx0fVxyXG5cdH0sXHJcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRhcGkuZ2V0KFwiL2V4ZXJjaXNlc1wiLCBmdW5jdGlvbihleGVyY2lzZXMpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyhleGVyY2lzZXMpO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQ8aDI+RXhlcmNpc2VzPC9oMj5cclxuXHRcdCk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXhlcmNpc2VzOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIGFwaSA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2FwaVwiKTtcclxuXHJcbnZhciBIb21lID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cdHRlc3RHZXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRhcGkuZ2V0KFwiL3NlY3JldFwiLCBmdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcImdldCB3b3JraW5nXCIsIHJlc3VsdCk7XHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdHRlc3RQb3N0OiBmdW5jdGlvbigpe1xyXG5cdFx0YXBpLnBvc3QoXCIvc2VjcmV0XCIsIHsgdGVzdERhdGE6IFwibWFqb21cIiB9LCBmdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcInBvc3Qgd29ya2luZ1wiLCByZXN1bHQpO1xyXG5cdFx0fSlcclxuXHR9LFxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdDxkaXY+XHJcblx0XHRcdFx0PGgyPkhvbWU8L2gyPlxyXG5cdFx0XHRcdDxidXR0b24gdHlwZT1cInRleHRcIiBvbkNsaWNrPXt0aGlzLnRlc3RHZXR9PkdldDwvYnV0dG9uPlxyXG5cdFx0XHRcdDxidXR0b24gdHlwZT1cInRleHRcIiBvbkNsaWNrPXt0aGlzLnRlc3RQb3N0fT5Qb3N0PC9idXR0b24+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0KTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIb21lO1xyXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cclxuXHJcbnZhciBOb3RGb3VuZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQ8ZGl2PlBhZ2UgaXMgbm90IGZvdW5kPC9kaXY+XHJcblx0XHQpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5vdEZvdW5kOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIGFwaSA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2FwaVwiKTtcclxuXHJcbnZhciBXb3Jrb3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB7IGV4ZXJjaXNlczogZmFsc2UgfTtcclxuXHR9LFxyXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdFx0YXBpLmdldChcIi9leGVyY2lzZXNcIiwgZnVuY3Rpb24oZXhlcmNpc2VzKXtcclxuXHRcdFx0dGhhdC5zZXRTdGF0ZSh7XHJcblx0XHRcdFx0ZXhlcmNpc2VzOiBleGVyY2lzZXNcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdGFkZEV4ZXJjaXNlOiBmdW5jdGlvbigpe1xyXG5cdFx0aWYoIXRoaXMuc3RhdGUuc2VsZWN0ZWRFeGVyY2lzZSkgcmV0dXJuO1xyXG5cdFx0dmFyIGV4ZXJjaXNlID0gdGhpcy5zdGF0ZS5leGVyY2lzZXNbdGhpcy5zdGF0ZS5zZWxlY3RlZEV4ZXJjaXNlLm5hbWVdO1xyXG5cdFx0aWYoZXhlcmNpc2UucHJlUXVhbnRpdGllcyl7XHJcblx0XHRcdHZhciB1bml0ID0gXCJcIjtcclxuXHRcdFx0aWYoZXhlcmNpc2UucHJlUXVhbnRpdGllc1swXS51bml0KSB1bml0ID0gXCIoXCIgKyBleGVyY2lzZS5wcmVRdWFudGl0aWVzWzBdLnVuaXQgKyBcIilcIjtcclxuXHRcdFx0ZXhlcmNpc2UucHJlUXVhbnRpdGllc1swXS52YWx1ZSA9IHByb21wdChleGVyY2lzZS5wcmVRdWFudGl0aWVzWzBdLm5hbWUgKyBcIj8gXCIgKyB1bml0KTtcclxuXHRcdH1cclxuXHRcdHZhciBudW1iZXJPZlNldHMgPSBwcm9tcHQoXCJOdWJtZXIgb2Ygc2V0cz9cIik7XHJcblx0XHR2YXIgc2VsZWN0ZWRFeGVyY2lzZUxpc3QgPSBbXTtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBudW1iZXJPZlNldHM7IGkrKyl7XHJcblx0XHRcdHNlbGVjdGVkRXhlcmNpc2VMaXN0LnB1c2goZXhlcmNpc2UpO1xyXG5cdFx0fVxyXG5cdFx0aWYodGhpcy5zdGF0ZS5zZWxlY3RlZEV4ZXJjaXNlTGlzdClcclxuXHRcdFx0c2VsZWN0ZWRFeGVyY2lzZUxpc3QgPSB0aGlzLnN0YXRlLnNlbGVjdGVkRXhlcmNpc2VMaXN0LmNvbmNhdChzZWxlY3RlZEV4ZXJjaXNlTGlzdCk7XHJcblx0XHR0aGlzLnNldFN0YXRlKHtcclxuXHRcdFx0ZXhlcmNpc2VzOiB0aGlzLnN0YXRlLmV4ZXJjaXNlcyxcclxuXHRcdFx0c2VsZWN0ZWRFeGVyY2lzZTogdGhpcy5zdGF0ZS5zZWxlY3RlZEV4ZXJjaXNlLFxyXG5cdFx0XHRzZWxlY3RlZEV4ZXJjaXNlTGlzdDogc2VsZWN0ZWRFeGVyY2lzZUxpc3RcclxuXHRcdH0pO1xyXG5cdH0sXHJcblx0Y2hhbmdlRXhlcmNpc2U6IGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdHRoaXMuc2V0U3RhdGUoe1xyXG5cdFx0XHRleGVyY2lzZXM6IHRoaXMuc3RhdGUuZXhlcmNpc2VzLFxyXG5cdFx0XHRzZWxlY3RlZEV4ZXJjaXNlOiB0aGlzLnN0YXRlLmV4ZXJjaXNlc1tldmVudC50YXJnZXQudmFsdWVdXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdGlmKHRoaXMuc3RhdGUuZXhlcmNpc2VzKXtcclxuXHRcdFx0dmFyIGV4ZXJjaXNlT3B0aW9ucyA9IFtdO1xyXG5cdFx0XHRfLmVhY2godGhpcy5zdGF0ZS5leGVyY2lzZXMsIGZ1bmN0aW9uKGV4ZXJjaXNlKXtcclxuXHRcdFx0XHR2YXIgb3B0aW9uID0gKFxyXG5cdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT17ZXhlcmNpc2UubmFtZX0+e2V4ZXJjaXNlLm5hbWV9PC9vcHRpb24+XHJcblx0XHRcdFx0KTtcclxuXHRcdFx0XHRleGVyY2lzZU9wdGlvbnMucHVzaChvcHRpb24pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0dmFyIHNlbGVjdGVkRXhlcmNpc2UgPSBudWxsO1xyXG5cdFx0XHRpZih0aGlzLnN0YXRlLnNlbGVjdGVkRXhlcmNpc2Upe1xyXG5cdFx0XHRcdHNlbGVjdGVkRXhlcmNpc2UgPSAoXHJcblx0XHRcdFx0XHQ8ZGl2Pnt0aGlzLnN0YXRlLnNlbGVjdGVkRXhlcmNpc2UubmFtZX08L2Rpdj5cclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhciBzZWxlY3RlZEV4ZXJjaXNlTGlzdCA9IFtdO1xyXG5cdFx0XHRfLmVhY2godGhpcy5zdGF0ZS5zZWxlY3RlZEV4ZXJjaXNlTGlzdCwgZnVuY3Rpb24oZXhlcmNpc2Upe1xyXG5cdFx0XHRcdHZhciBlbGVtZW50O1xyXG5cdFx0XHRcdGlmKGV4ZXJjaXNlLnByZVF1YW50aXRpZXMpe1xyXG5cdFx0XHRcdFx0ZWxlbWVudCA9IChcclxuXHRcdFx0XHRcdFx0PHA+e2V4ZXJjaXNlLm5hbWV9IHtleGVyY2lzZS5wcmVRdWFudGl0aWVzWzBdLnZhbHVlfSB7ZXhlcmNpc2UucHJlUXVhbnRpdGllc1swXS51bml0fTwvcD5cclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRlbGVtZW50ID0gKFxyXG5cdFx0XHRcdFx0XHQ8cD57ZXhlcmNpc2UubmFtZX08L3A+XHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRzZWxlY3RlZEV4ZXJjaXNlTGlzdC5wdXNoKGVsZW1lbnQpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHQ8ZGl2PlxyXG5cdFx0XHRcdFx0PGgyPk5ldyBXb3Jrb3V0PC9oMj5cclxuXHRcdFx0XHRcdHtzZWxlY3RlZEV4ZXJjaXNlfVxyXG5cdFx0XHRcdFx0PHNlbGVjdCBvbkNoYW5nZT17dGhpcy5jaGFuZ2VFeGVyY2lzZX0+XHJcblx0XHRcdFx0XHRcdHtleGVyY2lzZU9wdGlvbnN9XHJcblx0XHRcdFx0XHQ8L3NlbGVjdD5cclxuXHRcdFx0XHRcdDxidXR0b24gb25DbGljaz17dGhpcy5hZGRFeGVyY2lzZX0+QWRkIGV4ZXJjaXNlPC9idXR0b24+XHJcblx0XHRcdFx0XHR7c2VsZWN0ZWRFeGVyY2lzZUxpc3R9XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHRyZXR1cm4gKFxyXG5cdFx0XHRcdDxoMj5Mb2FkaW5nLi4uPC9oMj5cclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBXb3Jrb3V0OyIsInZhciBhdXRoID0gcmVxdWlyZShcIi4vYXV0aFwiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGxvZzogZnVuY3Rpb24odGV4dCl7XHJcblx0XHRjb25zb2xlLmxvZyh0ZXh0KTtcclxuXHR9LFxyXG5cdGdldDogZnVuY3Rpb24odXJsLCBzdWNjZXNzKXtcclxuXHRcdCQuYWpheCh7XHJcblx0XHRcdHVybDogdXJsLFxyXG5cdFx0XHR0eXBlOiAnR0VUJyxcclxuXHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdFwieC1hdXRoLXRva2VuXCI6IGF1dGguZ2V0VG9rZW4oKSxcclxuXHRcdFx0XHRcIngtYXV0aC11c2VybmFtZVwiOiBhdXRoLmdldFVzZXJuYW1lKClcclxuXHRcdFx0fSxcclxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzdWx0KSB7XHJcblx0XHRcdFx0c3VjY2VzcyhyZXN1bHQpO1xyXG5cdFx0XHR9LmJpbmQodGhpcyksXHJcblx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coc3RhdHVzKTtcclxuXHRcdFx0XHRpZih4aHIuc3RhdHVzID49IDQwMCkgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBhdXRoLmxvZ2luUGFnZTtcclxuXHRcdFx0fS5iaW5kKHRoaXMpXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdHBvc3Q6IGZ1bmN0aW9uKHVybCwgZGF0YSwgc3VjY2Vzcyl7XHJcblx0XHQkLmFqYXgoe1xyXG5cdFx0XHR1cmw6IHVybCxcclxuXHRcdFx0dHlwZTogJ1BPU1QnLFxyXG5cdFx0XHRkYXRhOiBkYXRhLFxyXG5cdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0XCJ4LWF1dGgtdG9rZW5cIjogYXV0aC5nZXRUb2tlbigpLFxyXG5cdFx0XHRcdFwieC1hdXRoLXVzZXJuYW1lXCI6IGF1dGguZ2V0VXNlcm5hbWUoKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXN1bHQpIHtcclxuXHRcdFx0XHRzdWNjZXNzKHJlc3VsdCk7XHJcblx0XHRcdH0uYmluZCh0aGlzKSxcclxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhzdGF0dXMpO1xyXG5cdFx0XHRcdGlmKHhoci5zdGF0dXMgPj0gNDAwKSB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGF1dGgubG9naW5QYWdlO1xyXG5cdFx0XHR9LmJpbmQodGhpcylcclxuXHRcdH0pO1xyXG5cdH1cclxufTsiLCJ2YXIgYXV0aCA9IHtcclxuXHRsb2dpblBhZ2U6IFwiL2xvZ2luLmh0bWxcIixcclxuXHRsb2dvdXQ6IGZ1bmN0aW9uKGNhbGxiYWNrKXtcclxuXHRcdCQuYWpheCh7XHJcblx0XHRcdHVybDogXCIvbG9nb3V0XCIsXHJcblx0XHRcdHR5cGU6ICdQT1NUJyxcclxuXHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdHVzZXJuYW1lOiB0aGlzLmdldFVzZXJuYW1lKClcclxuXHRcdFx0fSxcclxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzdWx0KSB7XHJcblx0XHRcdFx0ZGVsZXRlIGxvY2FsU3RvcmFnZS50b2tlbjtcclxuXHRcdFx0XHRkZWxldGUgbG9jYWxTdG9yYWdlLnVzZXJuYW1lO1xyXG5cdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdH0uYmluZCh0aGlzKSxcclxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcImVycm9yIHdoaWxlIGxvZ2dpbnQgb3V0XCIpO1xyXG5cdFx0XHRcdGRlbGV0ZSBsb2NhbFN0b3JhZ2UudG9rZW47XHJcblx0XHRcdFx0ZGVsZXRlIGxvY2FsU3RvcmFnZS51c2VybmFtZTtcclxuXHRcdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0XHR9LmJpbmQodGhpcylcclxuXHRcdH0pO1xyXG5cdH0sXHJcblx0YXV0aG9yaXplOiBmdW5jdGlvbihjYWxsYmFjayl7XHJcblx0XHRpZighdGhpcy5nZXRUb2tlbigpKSB7XHJcblx0XHRcdGNhbGxiYWNrKGZhbHNlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQuYWpheCh7XHJcblx0XHRcdHVybDogXCIvYXV0aG9yaXplXCIsXHJcblx0XHRcdHR5cGU6ICdHRVQnLFxyXG5cdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0XCJ4LWF1dGgtdG9rZW5cIjogdGhpcy5nZXRUb2tlbigpLFxyXG5cdFx0XHRcdFwieC1hdXRoLXVzZXJuYW1lXCI6IHRoaXMuZ2V0VXNlcm5hbWUoKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXN1bHQpIHtcclxuXHRcdFx0XHRjYWxsYmFjayh0cnVlKTtcclxuXHRcdFx0fS5iaW5kKHRoaXMpLFxyXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xyXG5cdFx0XHRcdGNhbGxiYWNrKGZhbHNlKTtcclxuXHRcdFx0fS5iaW5kKHRoaXMpXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdGdldFRva2VuOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGxvY2FsU3RvcmFnZS50b2tlbjtcclxuXHR9LFxyXG5cdGdldFVzZXJuYW1lOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGxvY2FsU3RvcmFnZS51c2VybmFtZTtcclxuXHR9LFxyXG5cdGxvZ2dlZEluOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VG9rZW4oKTtcclxuXHR9LFxyXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbigpe31cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYXV0aDsiXX0=
