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
		return {
			exercises: null,
			selectedExercise: null,
			exercisesForWorkout: []
		};
	},
	componentDidMount: function(){
		var that = this;
		api.get("/exercises", function(exercises){
			that.setState({
				exercises: exercises,
				selectedExercise: exercises[0]
			});
		});
	},
	addExercise: function(){
		var weight = prompt("Weight? (kg)", 0);
		var sets = prompt("Number of sets?", 1);
		var selectedExerciseList = [];
		for(var i = 0; i < sets; i++){
			selectedExerciseList.push({
				name: this.state.selectedExercise,
				weight: weight,
				key: this.state.exercisesForWorkout.length
			});
		}
		var newState = React.addons.update(this.state, {
			exercisesForWorkout: {
				$push: selectedExerciseList
			}
		});
		this.setState(newState);
	},
	changeExercise: function(event){
		this.setState({
			exercises: this.state.exercises,
			selectedExercise: event.target.value
		});
	},
	removeExerciseFromWorkout: function(){
		console.log("xxx");
	},
	render: function(){
		if(this.state.exercises){
			var exerciseOptions = [],
				exerciseKey = 0;
			_.each(this.state.exercises, function(exercise){
				var option = (
					React.createElement("option", {key: Math.random(), value: exercise}, exercise)
				);
				exerciseOptions.push(option);
			});
			var exercisesForWorkout = [];
			_.each(this.state.exercisesForWorkout, function(exercise){
				var element;
				element = (
					React.createElement("div", {key: exerciseKey++}, 
						React.createElement("span", null, exercise.name, " ", exercise.weight, " kg"), React.createElement("button", {onClick: this.removeExerciseFromWorkout}, "remove")
					)
				);
				exercisesForWorkout.push(element);
			});
			return (
				React.createElement("div", null, 
					React.createElement("h2", null, "New Workout"), 
					React.createElement("div", null, this.state.selectedExercise), 
					React.createElement("select", {onChange: this.changeExercise}, 
						exerciseOptions
					), 
					React.createElement("button", {onClick: this.addExercise}, "Add exercise"), 
					exercisesForWorkout
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzpcXGRldlxcY3NhdGlcXGZpdFxcc3JjXFxzY3JpcHRzXFxtYWluLmpzIiwiQzpcXGRldlxcY3NhdGlcXGZpdFxcc3JjXFxzY3JpcHRzXFxjb21wb25lbnRzXFxleGVyY2lzZXMuanMiLCJDOlxcZGV2XFxjc2F0aVxcZml0XFxzcmNcXHNjcmlwdHNcXGNvbXBvbmVudHNcXGhvbWUuanMiLCJDOlxcZGV2XFxjc2F0aVxcZml0XFxzcmNcXHNjcmlwdHNcXGNvbXBvbmVudHNcXG5vdF9mb3VuZC5qcyIsIkM6XFxkZXZcXGNzYXRpXFxmaXRcXHNyY1xcc2NyaXB0c1xcY29tcG9uZW50c1xcd29ya291dC5qcyIsIkM6XFxkZXZcXGNzYXRpXFxmaXRcXHNyY1xcc2NyaXB0c1xcaGVscGVyc1xcYXBpLmpzIiwiQzpcXGRldlxcY3NhdGlcXGZpdFxcc3JjXFxzY3JpcHRzXFxoZWxwZXJzXFxhdXRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEscUJBQXFCOztBQUVyQixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0FBQ2hDLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDdkMsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUN6QyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3ZCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDekIsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN2QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN4QyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNsRCxJQUFJLE9BQU8sRUFBRSxPQUFPLENBQUMs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SSxDQUFDO0dBQ1osQ0FBQyxDQUFDO0VBQ0g7Q0FDRCxTQUFTLEVBQUUsU0FBUyxRQUFRLENBQUM7RUFDNUIsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtHQUNwQixRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDaEIsT0FBTztBQUNWLEdBQUc7O0VBRUQsQ0FBQyxDQUFDLElBQUksQ0FBQztHQUNOLEdBQUcsRUFBRSxZQUFZO0dBQ2pCLElBQUksRUFBRSxLQUFLO0dBQ1gsT0FBTyxFQUFFO0lBQ1IsY0FBYyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7SUFDL0IsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtJQUNyQztHQUNELE9BQU8sRUFBRSxTQUFTLE1BQU0sRUFBRTtJQUN6QixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDZixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7R0FDWixLQUFLLEVBQUUsU0FBUyxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNqQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0dBQ1osQ0FBQyxDQUFDO0VBQ0g7Q0FDRCxRQUFRLEVBQUUsVUFBVTtFQUNuQixPQUFPLFlBQVksQ0FBQyxLQUFLLENBQUM7RUFDMUI7Q0FDRCxXQUFXLEVBQUUsVUFBVTtFQUN0QixPQUFPLFlBQVksQ0FBQyxRQUFRLENBQUM7RUFDN0I7Q0FDRCxRQUFRLEVBQUUsVUFBVTtFQUNuQixPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztFQUN2QjtDQUNELFFBQVEsRUFBRSxVQUFVLEVBQUU7QUFDdkIsQ0FBQyxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cclxuXHJcbnZhciBSb3V0ZXIgPSB3aW5kb3cuUmVhY3RSb3V0ZXI7XHJcbnZhciBEZWZhdWx0Um91dGUgPSBSb3V0ZXIuRGVmYXVsdFJvdXRlO1xyXG52YXIgTm90Rm91bmRSb3V0ZSA9IFJvdXRlci5Ob3RGb3VuZFJvdXRlO1xyXG52YXIgTGluayA9IFJvdXRlci5MaW5rO1xyXG52YXIgUm91dGUgPSBSb3V0ZXIuUm91dGU7XHJcbnZhciBSb3V0ZUhhbmRsZXIgPSBSb3V0ZXIuUm91dGVIYW5kbGVyO1xyXG52YXIgSG9tZSA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHMvaG9tZVwiKTtcclxudmFyIEV4ZXJjaXNlcyA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHMvZXhlcmNpc2VzXCIpO1xyXG52YXIgV29ya291dD0gcmVxdWlyZShcIi4vY29tcG9uZW50cy93b3Jrb3V0XCIpO1xyXG52YXIgTm90Rm91bmQgPSByZXF1aXJlKFwiLi9jb21wb25lbnRzL25vdF9mb3VuZFwiKTtcclxudmFyIGF1dGggPSByZXF1aXJlKFwiLi9oZWxwZXJzL2F1dGhcIik7XHJcblxyXG52YXIgQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB7IGF1dGg6IFwiYXV0aG9yaXppbmdcIiB9O1xyXG5cdH0sXHJcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgdGhhdCA9IHRoaXM7XHJcblx0XHRhdXRoLmF1dGhvcml6ZShmdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0XHRpZihyZXN1bHQpIHRoYXQuc2V0U3RhdGUoeyBhdXRoOiBcImF1dGhvcml6ZWRcIiB9KTtcclxuXHRcdFx0ZWxzZSB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGF1dGgubG9naW5QYWdlO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHRsb2dvdXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLnNldFN0YXRlKHsgYXV0aDogXCJsb2dnaW5nT3V0XCIgfSk7XHJcblx0XHRhdXRoLmxvZ291dChmdW5jdGlvbigpe1xyXG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGF1dGgubG9naW5QYWdlO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmKHRoaXMuc3RhdGUuYXV0aCA9PT0gXCJhdXRob3JpemluZ1wiKSByZXR1cm4gPGgxPkF1dGhvcml6aW5nLi4uPC9oMT47XHJcblx0XHRlbHNlIGlmKHRoaXMuc3RhdGUuYXV0aCA9PT0gXCJsb2dnaW5nT3V0XCIpIHJldHVybiA8aDE+TG9nZ2luZyBvdXQuLi48L2gxPlxyXG5cdFx0ZWxzZSBpZih0aGlzLnN0YXRlLmF1dGggPT09IFwiYXV0aG9yaXplZFwiKXtcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHQ8ZGl2PlxyXG5cdFx0XHRcdFx0PGhlYWRlcj5cclxuXHRcdFx0XHRcdFx0PHVsPlxyXG5cdFx0XHRcdFx0XHRcdDxsaT48TGluayB0bz1cImhvbWVcIj5Ib21lPC9MaW5rPjwvbGk+XHJcblx0XHRcdFx0XHRcdFx0PGxpPjxMaW5rIHRvPVwiZXhlcmNpc2VzXCI+RXhlcmNpc2VzPC9MaW5rPjwvbGk+XHJcblx0XHRcdFx0XHRcdFx0PGxpPjxMaW5rIHRvPVwid29ya291dFwiPk5ldyBXb3Jrb3V0PC9MaW5rPjwvbGk+XHJcblx0XHRcdFx0XHRcdFx0PGxpPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGEgaHJlZj1cIiNcIiBvbkNsaWNrPXt0aGlzLmxvZ291dH0+TG9nb3V0PC9hPlxyXG5cdFx0XHRcdFx0XHRcdDwvbGk+XHJcblx0XHRcdFx0XHRcdDwvdWw+XHJcblx0XHRcdFx0XHRcdDxkaXY+XHJcblx0XHRcdFx0XHRcdFx0PHA+dXNlcjoge2F1dGguZ2V0VXNlcm5hbWUoKX08L3A+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PC9oZWFkZXI+XHJcblx0XHRcdFx0XHQ8Um91dGVIYW5kbGVyLz5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxudmFyIHJvdXRlcyA9IChcclxuXHQ8Um91dGUgbmFtZT1cImhvbWVcIiBwYXRoPVwiL1wiIGhhbmRsZXI9e0FwcH0+XHJcblx0XHQ8Um91dGUgbmFtZT1cImV4ZXJjaXNlc1wiIGhhbmRsZXI9e0V4ZXJjaXNlc30vPlxyXG5cdFx0PFJvdXRlIG5hbWU9XCJ3b3Jrb3V0XCIgaGFuZGxlcj17V29ya291dH0vPlxyXG5cdFx0PERlZmF1bHRSb3V0ZSBoYW5kbGVyPXtIb21lfS8+XHJcblx0XHQ8Tm90Rm91bmRSb3V0ZSBoYW5kbGVyPXtOb3RGb3VuZH0vPlxyXG5cdDwvUm91dGU+XHJcbik7XHJcblxyXG5Sb3V0ZXIucnVuKHJvdXRlcywgZnVuY3Rpb24oSGFuZGxlcikge1xyXG5cdFJlYWN0LnJlbmRlcig8SGFuZGxlci8+LCBkb2N1bWVudC5ib2R5KTtcclxufSk7XHJcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIGFwaSA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2FwaVwiKTtcclxuXHJcbnZhciBFeGVyY2lzZXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3RhdGU6IFwibG9hZGluZ19leGVyY2lzZXNcIixcclxuXHRcdFx0ZXhlcmNpc2VzOiBbXVxyXG5cdFx0fVxyXG5cdH0sXHJcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRhcGkuZ2V0KFwiL2V4ZXJjaXNlc1wiLCBmdW5jdGlvbihleGVyY2lzZXMpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyhleGVyY2lzZXMpO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQ8aDI+RXhlcmNpc2VzPC9oMj5cclxuXHRcdCk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXhlcmNpc2VzOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIGFwaSA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2FwaVwiKTtcclxuXHJcbnZhciBIb21lID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cdHRlc3RHZXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRhcGkuZ2V0KFwiL3NlY3JldFwiLCBmdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcImdldCB3b3JraW5nXCIsIHJlc3VsdCk7XHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdHRlc3RQb3N0OiBmdW5jdGlvbigpe1xyXG5cdFx0YXBpLnBvc3QoXCIvc2VjcmV0XCIsIHsgdGVzdERhdGE6IFwibWFqb21cIiB9LCBmdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcInBvc3Qgd29ya2luZ1wiLCByZXN1bHQpO1xyXG5cdFx0fSlcclxuXHR9LFxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdDxkaXY+XHJcblx0XHRcdFx0PGgyPkhvbWU8L2gyPlxyXG5cdFx0XHRcdDxidXR0b24gdHlwZT1cInRleHRcIiBvbkNsaWNrPXt0aGlzLnRlc3RHZXR9PkdldDwvYnV0dG9uPlxyXG5cdFx0XHRcdDxidXR0b24gdHlwZT1cInRleHRcIiBvbkNsaWNrPXt0aGlzLnRlc3RQb3N0fT5Qb3N0PC9idXR0b24+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0KTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIb21lO1xyXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cclxuXHJcbnZhciBOb3RGb3VuZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQ8ZGl2PlBhZ2UgaXMgbm90IGZvdW5kPC9kaXY+XHJcblx0XHQpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5vdEZvdW5kOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIGFwaSA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL2FwaVwiKTtcclxuXHJcbnZhciBXb3Jrb3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGV4ZXJjaXNlczogbnVsbCxcclxuXHRcdFx0c2VsZWN0ZWRFeGVyY2lzZTogbnVsbCxcclxuXHRcdFx0ZXhlcmNpc2VzRm9yV29ya291dDogW11cclxuXHRcdH07XHJcblx0fSxcclxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciB0aGF0ID0gdGhpcztcclxuXHRcdGFwaS5nZXQoXCIvZXhlcmNpc2VzXCIsIGZ1bmN0aW9uKGV4ZXJjaXNlcyl7XHJcblx0XHRcdHRoYXQuc2V0U3RhdGUoe1xyXG5cdFx0XHRcdGV4ZXJjaXNlczogZXhlcmNpc2VzLFxyXG5cdFx0XHRcdHNlbGVjdGVkRXhlcmNpc2U6IGV4ZXJjaXNlc1swXVxyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH0sXHJcblx0YWRkRXhlcmNpc2U6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgd2VpZ2h0ID0gcHJvbXB0KFwiV2VpZ2h0PyAoa2cpXCIsIDApO1xyXG5cdFx0dmFyIHNldHMgPSBwcm9tcHQoXCJOdW1iZXIgb2Ygc2V0cz9cIiwgMSk7XHJcblx0XHR2YXIgc2VsZWN0ZWRFeGVyY2lzZUxpc3QgPSBbXTtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzZXRzOyBpKyspe1xyXG5cdFx0XHRzZWxlY3RlZEV4ZXJjaXNlTGlzdC5wdXNoKHtcclxuXHRcdFx0XHRuYW1lOiB0aGlzLnN0YXRlLnNlbGVjdGVkRXhlcmNpc2UsXHJcblx0XHRcdFx0d2VpZ2h0OiB3ZWlnaHQsXHJcblx0XHRcdFx0a2V5OiB0aGlzLnN0YXRlLmV4ZXJjaXNlc0ZvcldvcmtvdXQubGVuZ3RoXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG5ld1N0YXRlID0gUmVhY3QuYWRkb25zLnVwZGF0ZSh0aGlzLnN0YXRlLCB7XHJcblx0XHRcdGV4ZXJjaXNlc0ZvcldvcmtvdXQ6IHtcclxuXHRcdFx0XHQkcHVzaDogc2VsZWN0ZWRFeGVyY2lzZUxpc3RcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHR0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcclxuXHR9LFxyXG5cdGNoYW5nZUV4ZXJjaXNlOiBmdW5jdGlvbihldmVudCl7XHJcblx0XHR0aGlzLnNldFN0YXRlKHtcclxuXHRcdFx0ZXhlcmNpc2VzOiB0aGlzLnN0YXRlLmV4ZXJjaXNlcyxcclxuXHRcdFx0c2VsZWN0ZWRFeGVyY2lzZTogZXZlbnQudGFyZ2V0LnZhbHVlXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdHJlbW92ZUV4ZXJjaXNlRnJvbVdvcmtvdXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRjb25zb2xlLmxvZyhcInh4eFwiKTtcclxuXHR9LFxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdGlmKHRoaXMuc3RhdGUuZXhlcmNpc2VzKXtcclxuXHRcdFx0dmFyIGV4ZXJjaXNlT3B0aW9ucyA9IFtdLFxyXG5cdFx0XHRcdGV4ZXJjaXNlS2V5ID0gMDtcclxuXHRcdFx0Xy5lYWNoKHRoaXMuc3RhdGUuZXhlcmNpc2VzLCBmdW5jdGlvbihleGVyY2lzZSl7XHJcblx0XHRcdFx0dmFyIG9wdGlvbiA9IChcclxuXHRcdFx0XHRcdDxvcHRpb24ga2V5PXtNYXRoLnJhbmRvbSgpfSB2YWx1ZT17ZXhlcmNpc2V9PntleGVyY2lzZX08L29wdGlvbj5cclxuXHRcdFx0XHQpO1xyXG5cdFx0XHRcdGV4ZXJjaXNlT3B0aW9ucy5wdXNoKG9wdGlvbik7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR2YXIgZXhlcmNpc2VzRm9yV29ya291dCA9IFtdO1xyXG5cdFx0XHRfLmVhY2godGhpcy5zdGF0ZS5leGVyY2lzZXNGb3JXb3Jrb3V0LCBmdW5jdGlvbihleGVyY2lzZSl7XHJcblx0XHRcdFx0dmFyIGVsZW1lbnQ7XHJcblx0XHRcdFx0ZWxlbWVudCA9IChcclxuXHRcdFx0XHRcdDxkaXYga2V5PXtleGVyY2lzZUtleSsrfT5cclxuXHRcdFx0XHRcdFx0PHNwYW4+e2V4ZXJjaXNlLm5hbWV9IHtleGVyY2lzZS53ZWlnaHR9IGtnPC9zcGFuPjxidXR0b24gb25DbGljaz17dGhpcy5yZW1vdmVFeGVyY2lzZUZyb21Xb3Jrb3V0fT5yZW1vdmU8L2J1dHRvbj5cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdFx0ZXhlcmNpc2VzRm9yV29ya291dC5wdXNoKGVsZW1lbnQpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHQ8ZGl2PlxyXG5cdFx0XHRcdFx0PGgyPk5ldyBXb3Jrb3V0PC9oMj5cclxuXHRcdFx0XHRcdDxkaXY+e3RoaXMuc3RhdGUuc2VsZWN0ZWRFeGVyY2lzZX08L2Rpdj5cclxuXHRcdFx0XHRcdDxzZWxlY3Qgb25DaGFuZ2U9e3RoaXMuY2hhbmdlRXhlcmNpc2V9PlxyXG5cdFx0XHRcdFx0XHR7ZXhlcmNpc2VPcHRpb25zfVxyXG5cdFx0XHRcdFx0PC9zZWxlY3Q+XHJcblx0XHRcdFx0XHQ8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuYWRkRXhlcmNpc2V9PkFkZCBleGVyY2lzZTwvYnV0dG9uPlxyXG5cdFx0XHRcdFx0e2V4ZXJjaXNlc0ZvcldvcmtvdXR9XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHRyZXR1cm4gKFxyXG5cdFx0XHRcdDxoMj5Mb2FkaW5nLi4uPC9oMj5cclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBXb3Jrb3V0OyIsInZhciBhdXRoID0gcmVxdWlyZShcIi4vYXV0aFwiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGxvZzogZnVuY3Rpb24odGV4dCl7XHJcblx0XHRjb25zb2xlLmxvZyh0ZXh0KTtcclxuXHR9LFxyXG5cdGdldDogZnVuY3Rpb24odXJsLCBzdWNjZXNzKXtcclxuXHRcdCQuYWpheCh7XHJcblx0XHRcdHVybDogdXJsLFxyXG5cdFx0XHR0eXBlOiAnR0VUJyxcclxuXHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdFwieC1hdXRoLXRva2VuXCI6IGF1dGguZ2V0VG9rZW4oKSxcclxuXHRcdFx0XHRcIngtYXV0aC11c2VybmFtZVwiOiBhdXRoLmdldFVzZXJuYW1lKClcclxuXHRcdFx0fSxcclxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzdWx0KSB7XHJcblx0XHRcdFx0c3VjY2VzcyhyZXN1bHQpO1xyXG5cdFx0XHR9LmJpbmQodGhpcyksXHJcblx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coc3RhdHVzKTtcclxuXHRcdFx0XHRpZih4aHIuc3RhdHVzID49IDQwMCkgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBhdXRoLmxvZ2luUGFnZTtcclxuXHRcdFx0fS5iaW5kKHRoaXMpXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdHBvc3Q6IGZ1bmN0aW9uKHVybCwgZGF0YSwgc3VjY2Vzcyl7XHJcblx0XHQkLmFqYXgoe1xyXG5cdFx0XHR1cmw6IHVybCxcclxuXHRcdFx0dHlwZTogJ1BPU1QnLFxyXG5cdFx0XHRkYXRhOiBkYXRhLFxyXG5cdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0XCJ4LWF1dGgtdG9rZW5cIjogYXV0aC5nZXRUb2tlbigpLFxyXG5cdFx0XHRcdFwieC1hdXRoLXVzZXJuYW1lXCI6IGF1dGguZ2V0VXNlcm5hbWUoKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXN1bHQpIHtcclxuXHRcdFx0XHRzdWNjZXNzKHJlc3VsdCk7XHJcblx0XHRcdH0uYmluZCh0aGlzKSxcclxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhzdGF0dXMpO1xyXG5cdFx0XHRcdGlmKHhoci5zdGF0dXMgPj0gNDAwKSB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGF1dGgubG9naW5QYWdlO1xyXG5cdFx0XHR9LmJpbmQodGhpcylcclxuXHRcdH0pO1xyXG5cdH1cclxufTsiLCJ2YXIgYXV0aCA9IHtcclxuXHRsb2dpblBhZ2U6IFwiL2xvZ2luLmh0bWxcIixcclxuXHRsb2dvdXQ6IGZ1bmN0aW9uKGNhbGxiYWNrKXtcclxuXHRcdCQuYWpheCh7XHJcblx0XHRcdHVybDogXCIvbG9nb3V0XCIsXHJcblx0XHRcdHR5cGU6ICdQT1NUJyxcclxuXHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdHVzZXJuYW1lOiB0aGlzLmdldFVzZXJuYW1lKClcclxuXHRcdFx0fSxcclxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzdWx0KSB7XHJcblx0XHRcdFx0ZGVsZXRlIGxvY2FsU3RvcmFnZS50b2tlbjtcclxuXHRcdFx0XHRkZWxldGUgbG9jYWxTdG9yYWdlLnVzZXJuYW1lO1xyXG5cdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdH0uYmluZCh0aGlzKSxcclxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcImVycm9yIHdoaWxlIGxvZ2dpbnQgb3V0XCIpO1xyXG5cdFx0XHRcdGRlbGV0ZSBsb2NhbFN0b3JhZ2UudG9rZW47XHJcblx0XHRcdFx0ZGVsZXRlIGxvY2FsU3RvcmFnZS51c2VybmFtZTtcclxuXHRcdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0XHR9LmJpbmQodGhpcylcclxuXHRcdH0pO1xyXG5cdH0sXHJcblx0YXV0aG9yaXplOiBmdW5jdGlvbihjYWxsYmFjayl7XHJcblx0XHRpZighdGhpcy5nZXRUb2tlbigpKSB7XHJcblx0XHRcdGNhbGxiYWNrKGZhbHNlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQuYWpheCh7XHJcblx0XHRcdHVybDogXCIvYXV0aG9yaXplXCIsXHJcblx0XHRcdHR5cGU6ICdHRVQnLFxyXG5cdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0XCJ4LWF1dGgtdG9rZW5cIjogdGhpcy5nZXRUb2tlbigpLFxyXG5cdFx0XHRcdFwieC1hdXRoLXVzZXJuYW1lXCI6IHRoaXMuZ2V0VXNlcm5hbWUoKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXN1bHQpIHtcclxuXHRcdFx0XHRjYWxsYmFjayh0cnVlKTtcclxuXHRcdFx0fS5iaW5kKHRoaXMpLFxyXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xyXG5cdFx0XHRcdGNhbGxiYWNrKGZhbHNlKTtcclxuXHRcdFx0fS5iaW5kKHRoaXMpXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdGdldFRva2VuOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGxvY2FsU3RvcmFnZS50b2tlbjtcclxuXHR9LFxyXG5cdGdldFVzZXJuYW1lOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGxvY2FsU3RvcmFnZS51c2VybmFtZTtcclxuXHR9LFxyXG5cdGxvZ2dlZEluOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VG9rZW4oKTtcclxuXHR9LFxyXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbigpe31cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYXV0aDsiXX0=
