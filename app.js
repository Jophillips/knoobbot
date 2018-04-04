const Discord = require('discord.js');
var tmi = require('tmi.js');
var fs = require('fs');

const settings = require('./botSettings');

const client = new Discord.Client();

var options = {
	options: {
		debug: true
	},

	connection: {
		cluster: "aws",
		reconnect: true
	},

	identity: {
		username: settings.username,
		password: settings.tokent
	},

	channels: [settings.twitchchannel]
};

var tclient = new tmi.client(options);

tclient.connect();

var request = require("request");
const token = settings.token;
const dknoobles = settings.defaultKnoobles;
const prefix = settings.prefix;
const version = "1.0.0";

let points = JSON.parse(fs.readFileSync("./knoobles.json", "utf8"));
let twitchlink = JSON.parse(fs.readFileSync("./twitchlink.json", "utf8"));

var dice1;
var dice2;
var dice3;
var dice4;
var dice5;
var dice6;

client.on('ready', () => {
	console.log(`I am ready! ${version}`);
	dice1 = client.emojis.find("name", "dice1");
	dice2 = client.emojis.find("name", "dice2");
	dice3 = client.emojis.find("name", "dice3");
	dice4 = client.emojis.find("name", "dice4");
	dice5 = client.emojis.find("name", "dice5");
	dice6 = client.emojis.find("name", "dice6");
});

client.on("guildMemberAdd", (member) => {
	console.log(`New User "${member.user.username}" has joined "${member.guild.name}"`);
	var id = member.id;
	var name = member.user.username;
	var serverid = member.guild.id;
	if (!points[id]) points[id] = {
		points: dknoobles,
		totalbet: 0,
		name: name
	};
	let userData = points[id];

	fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
		if (err) {
			console.error(err);
		}
		console.log("User joined, saved his file");
	});
});

client.on('message', message => {
	if (message.channel.name == undefined) {
		return;
	}
	const modRole = message.guild.roles.find("name", settings.modRole);
	const subRole = message.guild.roles.find("name", settings.subRole);

	var id = message.author.id;
	var oldid = id;
	var name = message.author.username;
	var oldname = name;
	var serverid = message.guild.id;

	if (!points[id]) points[id] = {
		points: dknoobles,
		totalbet: 0,
		name: name
	};

	let userData = points[id];

	if (userData.totalbet === undefined) {
		points[id] = {
			points: userData.points,
			totalbet: 0,
			name: userData.name
		};
	}

	if (userData.points < 0) {
		userData.points = 0;
	}

	if (!subRole) {
		console.log("No sub role");
		userData.points++;
	} else {
		if (!message.member.roles.has(subRole.id)) {
			userData.points++;
			userData.points++;
		} else {
			userData.points++;
			userData.points++;
			userData.points++;
			userData.points++;
			userData.points++;
		}
	}


	fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
		if (err) console.error(err)
	});

	if (message.author.bot) return;

	if (!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	switch (command) {
		case "knoobles":
			if (args.length > 0) {
				//check if first argument is transfer, help, add, list, set, or remove
				if (args[0].toLowerCase() === "list") {
					return;
				}
				if (args[0].toLowerCase() === "set") {
					if (!modRole) return console.log("No Mod role!");
					if (!message.member.roles.has(modRole.id)) {
						return message.channel.send(`<@${id}> You cannot use this command!`);
					}

					if (message.mentions.members.size === 0) {
						return message.channel.send(`<@${id}> Please mention a user to set their knoobles.`);
					}

					const member = message.mentions.members.first();
					id = member.id;
					name = member.user.username;

					userData = points[id];
					if (args[1] != null) {
						if (!isNaN(args[1])) {
							var setAmount = args[1];
							if (setAmount < 0) {
								message.channel.send(`<@${oldid}> Amount must be greater or equal to zero!`);
							}
							userData.points = setAmount - 0;
							message.channel.send(`<@${oldid}> Set <@${id}>'s Knoobles to ${setAmount}!`);
							fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
								if (err) {
									console.error(err);
								}
							});
						} else {
							return message.channel.send(`<@${oldid}> Proper command syntax '${prefix}knoobles set <amount> <@user>'`);
						}
					} else {
						return message.channel.send(`<@${oldid}> Proper syntax '!knoobles set <amount> <@user>'`);
					}
					return;
				}

				if (args[0].toLowerCase() === "remove") {
					if (!modRole) return console.log("No mod role");
					if (!message.member.roles.has(modRole.id)) {
						return message.channel.send(`<@${id}> You cannot use this command!`);

					}
					if (message.mentions.members.size === 0) {
						return message.channel.send(`<@${id}> Please mention a user to remove knoobles from.`);
					}

					const member = message.mentions.members.first();
					id = member.id;
					name = member.user.username;
					userData = points[id];
					if (args[1] != null) {
						if (!isNaN(args[1])) {
							var addAmount = args[1];
							if (addAmount <= 0) {
								message.channel.send(`<@${oldid}> Amount must be greater than zero!`);
							}
							userData.points -= addAmount - 0;
							message.channel.send(`<@${oldid}> removed ${addAmount} Knoobles from <@${id}>'s account!`);
							fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
								if (err) {
									console.error(err);
								}
							});
						} else {
							return message.channel.send(`<@${oldid}> Proper command syntax '${prefix}knoobles remove <amount> <@user>'`);
						}
					} else {
						return message.channel.send(`<@${oldid}> Proper syntax '!knoobles add <amount> <@user>'`);
					}
					return;
				}

				if (args[0].toLowerCase() === "add") {
					if (!modRole) return console.log("No mod role");
					if (!message.member.roles.has(modRole.id)) {
						return message.channel.send(`<@${id}> You cannot use this command!`);

					}
					if (message.mentions.members.size === 0) {
						return message.channel.send(`<@${id}> Please mention a user to give knoobles to.`);
					}

					const member = message.mentions.members.first();
					id = member.id;
					name = member.user.username;
					userData = points[id];
					if (args[1] != null) {
						if (!isNaN(args[1])) {
							var addAmount = args[1];
							if (addAmount <= 0) {
								message.channel.send(`<@${oldid}> Amount must be greater than zero!`);
							}
							userData.points += addAmount - 0;
							message.channel.send(`<@${oldid}> added ${addAmount} Knoobles to <@${id}>'s account!`);
							fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
								if (err) {
									console.error(err);
								}
							});
						} else {
							return message.channel.send(`<@${oldid}> Proper command syntax '${prefix}knoobles add <amount> <@user>'`);
						}
					} else {
						return message.channel.send(`<@${oldid}> Proper syntax '!knoobles add <amount> <@user>'`);
					}
					return;
				}

				if (args[0].toLowerCase() === "help") {
					message.channel.send('<@' + id + '>' + '```!knoobles - Check your Knoobles balance.\r\n!knoobles <@user> - Check Knoobles balance of another user.\r\n!knoobles transfer <amount> <@user> - To transfer Knoobles to another user.\r\n!knoobles add <amount> <@user> - To add Knoobles to a users account.\r\n!knoobles remove <amount> <@user> - To remove Knoobles from a users account.\r\n!knoobles set <amount> <@user> - To set a users Knoobles.```');
					return;
				}

				if (args[0].toLowerCase() === "transfer") {
					//if(second argument is not null)
					if (args[1] != null) {
						//check if second argument is an integer
						if (!isNaN(args[1])) {
							var transferAmount = args[1];
							if (transferAmount <= 0) {
								message.channel.send(`<@${id}> Amount must be greater than zero!`);
								return;
							}
							userData = points[id];
							if (userData.points >= transferAmount) {
								userData.points -= transferAmount - 0;
								var transfereeNewBal = userData.points;
								fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
									if (err) {
										console.error(err);
									}
								});
								let member = message.mentions.members.first();
								if (member === undefined) {
									message.channel.send(`<@${id}> Undefined user!`);
									return;
								}
								id = member.id;
								name = member.user.username;

								if (!points[id]) points[id] = {
									points: dknoobles,
									name: name
								};

								userData = points[id];
								userData.points += transferAmount - 0;
								tranferredToNewBal = userData.points;
								fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
									if (err) {
										console.error(err);
									}
								});
								message.channel.send(`<@${oldid}>(${transfereeNewBal}) Transferred ${transferAmount} Knoobles to <@${id}>(${tranferredToNewBal})`);

							} else {
								message.channel.send(`<@${id}> You do not have enough knoobles to do that!`);
							}

						} else {
							message.channel.send(`<@${id}> Proper command syntax '${prefix}knoobles transfer <amount> <@user>'`);
							return;
						}
					}

					return;
				}

				//if arg is not from above, then check if arg is a mentioned member
				let member = message.mentions.members.first();
				if (member === undefined) {
					message.channel.send(`<@${id}> Undefined user!`);
					return;
				}

				//set id and name to mentioned user
				id = member.id;
				name = member.user.username;

				if (!points[id]) points[id] = {
					points: dknoobles,
					name: name
				};

				fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
					if (err) console.error(err)
				});

				userData = points[id];

				message.channel.send(`<@${oldid}> <@${id}>'s Knoobles: ${userData.points}`);
			} else {
				message.channel.send(`<@${id}> Knoobles: ${userData.points}`);
			}
			break;

		case "dice":
			dice1 = client.emojis.find("name", "dice1");
			dice2 = client.emojis.find("name", "dice2");
			dice3 = client.emojis.find("name", "dice3");
			dice4 = client.emojis.find("name", "dice4");
			dice5 = client.emojis.find("name", "dice5");
			dice6 = client.emojis.find("name", "dice6");

			if (args[0] != null) {
				if (!isNaN(args[0])) {

					var diceAmount = args[0];
					if (diceAmount < 10) {
						return message.channel.send(`<@${id}> Amount must be 10 or greater!`);
					}
					userData = points[id];

					if (userData.points < diceAmount) {
						return message.channel.send(`<@${id}> You do not have enough knoobles to do that!`);
					}

					userData.totalbet += diceAmount - 0;
					console.log(userData.points + " Before");
					userData.points -= diceAmount - 0;

					console.log(userData.points + " After");

					let addict = message.guild.roles.get("412496257370554368");

					if (userData.totalbet >= 10000) {
						if (addict) {
							if (!message.member.roles.has(addict.id)) {
								message.channel.send(`<@${id}> Congrats. Since you have gambled more than 10,000 Knoobles you received the :heavy_dollar_sign:Addict:heavy_dollar_sign: role!`);
								message.member.addRole(addict).catch(console.error);
							}
						} else {
							console.log("addict role missing");
						}
					}

					var botRoll = Math.floor(Math.random() * 6) + 1;
					var playerRoll = Math.floor(Math.random() * 6) + 1;

					var botDie;
					var playerDie;

					switch (botRoll) {
						case 1:
							if (dice1 === null) {
								botDie = botRoll;
								break;
							}
							botDie = dice1;
							break;

						case 2:
							if (dice2 === null) {
								botDie = botRoll;
								break;
							}
							botDie = dice2;
							break

						case 3:
							if (dice3 === null) {
								botDie = botRoll;
								break;
							}
							botDie = dice3;
							break;

						case 4:
							if (dice4 === null) {
								botDie = botRoll;
								break;
							}
							botDie = dice4;
							break;

						case 5:
							if (dice5 === null) {
								botDie = botRoll;
								break;
							}
							botDie = dice5;
							break;

						case 6:
							if (dice6 === null) {
								botDie = botRoll;
								break;
							}
							botDie = dice6;
							break;
					}

					switch (playerRoll) {
						case 1:
							if (dice1 === null) {
								playerDie = playerRoll;
								break;
							}
							playerDie = dice1;
							break;

						case 2:
							if (dice2 === null) {
								playerDie = playerRoll;
								break;
							}
							playerDie = dice2;
							break

						case 3:
							if (dice3 === null) {
								playerDie = playerRoll;
								break;
							}
							playerDie = dice3;
							break;

						case 4:
							if (dice4 === null) {
								playerDie = playerRoll;
								break;
							}
							playerDie = dice4;
							break;

						case 5:
							if (dice5 === null) {
								playerDie = playerRoll;
								break;
							}
							playerDie = dice5;
							break;

						case 6:
							if (dice6 === null) {
								playerDie = playerRoll;
								break;
							}
							playerDie = dice6;
							break;
					}

					if (botRoll > playerRoll) {
						message.channel.send(`<@${id}> I rolled a ${botDie} and you rolled a ${playerDie}. You lose.`);
						userData.points -= diceAmount - 0;
					}

					if (playerRoll > botRoll) {
						message.channel.send(`<@${id}> I rolled a ${botDie} and you rolled a ${playerDie}. You Win ${diceAmount * 2} Knoobles!`);
						userData.points += diceAmount * 2;
					}

					if (playerRoll === botRoll) {
						message.channel.send(`<@${id}>I rolled a ${botDie} and you rolled a ${playerDie}. We tied!`);
					}

					fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
						if (err) console.error(err)
					});

				} else {
					message.channel.send(`<@${id}> Amount must be valid integer!`);
				}
			} else {
				message.channel.send(`<@${id}> Proper syntax '!dice <amount>'`);
			}
			break;

		case "8ball":
			request({
				uri: "http://juckfeffro.xyz/apis/fun/8ball.php",
			}, function(error, response, body) {
				message.channel.send(`<@${id}> ${body}`);
			});

			break;

		case "version":
			message.channel.send(`<@${id}> Version: ${version}`);
			break;

		case "betcheck":
			if (args.length < 1) {
				if (userData.totalbet === undefined) {
					points[id] = {
						points: userData.points,
						totalbet: 0,
						name: userData.name
					};
				}

				fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
					if (err) console.error(err)
				});

				return message.channel.send(`<@${id}> Total Knoobles Bet: ${userData.totalbet}`);
			} else {
				let member = message.mentions.members.first();
				if (member === undefined) {
					return message.channel.send(`<@${id}> Undefined User!`);
				}

				id = member.id;
				name = member.user.username;
				userData = points[id];

				if (userData.totalbet === undefined) {
					points[id] = {
						points: userData.points,
						totalbet: 0,
						name: userData.name
					};
				}

				message.channel.send(`<@${oldid}> <@${id}>'s Total Knoobles Bet: ${userData.totalbet}`);

				fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
					if (err) console.error(err)
				});

			}

			break;

		default:
			break;
	}

});

tclient.on('whisper', function(channel, user, message, self) {
	var discord = message.toLowerCase().includes("!discordid");
	var words = message.split(' ');
	if (discord) {
		if (words[1] != null) {
			if (!twitchlink[user.username]) twitchlink[user.username] = {
				discordid: words[1]
			};

			fs.writeFile("./twitchlink.json", JSON.stringify(twitchlink, 0, 4), (err) => {
				if (err) console.error(err)
			});

			tclient.say("knooblord", `/w ${user.username} Discord ID set to ${words[1]}!`);
		} else {
			tclient.say("knooblord", `/w ${user.username} To set your Discord ID, type !discordid <id>.`);
		}
	}
	//console.log(user.username + ": " + message);
});

tclient.on('message', function(channel, user, message, self) {
	var discord = message.toLowerCase().includes("!discordid");
	var words = message.split(' ');
	if (discord) {
		if (words[1] != null) {
			if (!twitchlink[user.username]) twitchlink[user.username] = {
				discordid: words[1]
			};

			fs.writeFile("./twitchlink.json", JSON.stringify(twitchlink, 0, 4), (err) => {
				if (err) console.error(err)
			});

			tclient.say("knooblord", `/w ${user.username} Discord ID set to ${words[1]}!`);
		} else {
			tclient.say("knooblord", `/w ${user.username} To set your Discord ID, type !discordid <id>.`);
		}
	}

	let twitchData = twitchlink[user.username];

	if (twitchData != null) {
		var discordid = twitchData["discordid"];
		if (!points[discordid]) points[discordid] = {
			points: dknoobles,
			totalbet: 0
		};
		let userData = points[discordid];
		//console.log(userData);
		if (user.subscriber) {
			userData.points++;
			userData.points++;
			userData.points++;
			userData.points++;
			userData.points++;
		} else {
			userData.points++;
			userData.points++;
		}
		//console.log(discordid);

		fs.writeFile("./knoobles.json", JSON.stringify(points, 0, 4), (err) => {
			if (err) console.error(err)
		});
	}
});

client.login(token);