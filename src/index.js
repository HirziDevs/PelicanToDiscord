const { WebhookClient, EmbedBuilder } = require('discord.js')
const parseString = require("./handlers/parseString");
const config = require("./handlers/configuration");
const bodyParser = require('body-parser');
const cliColor = require("cli-color");
const express = require('express');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', async (req, res) => {
	res.send("PelicanToDiscord server is online!")
});

try {
	require(`../lang/${config.language}.json`)
} catch (error) {
	console.error(`No language file was found for "${config.language}"! Using english language...`, error)
	config.language = "en"

	try {
		require(`../lang/en.json`)
	} catch (error) {
		console.error("No english language was found!", error)
		process.exit()
	}
}

const language = require(`../lang/${config.language}.json`)
const webhook = new WebhookClient({ url: config.discord.webhook })

app.post('/post', async (req, res) => {
	const data = req.body

	if (config.debug) console.log(data)

	let EventName = data.event.split(": ")[1]
	let EventAction = data.event.split(": ")[0]
	let attributes = data.attributes[0]

	const embed = new EmbedBuilder()
		.setTitle(`${EventName} ${EventAction}`)
		.setTimestamp()

	let content = null

	switch (EventAction) {
		case "created":
			embed.setColor("57F287")
			break;
		case "deleted":
			embed.setColor("ED4245")
			break;
		case "updated":
			embed.setColor("FEE75C")
			break;
		case "event":
			embed.setColor("5865F2")
			break;
	}

	try {
		if (EventAction === "event") {
			if (EventName.split("\\").length > 1) {
				EventAction = EventName.split("\\")[1]
				EventName = EventName.split("\\")[0]

				let EventLanguage = language.event[EventName]
				if (EventLanguage) {
					EventLanguage = EventLanguage[EventAction]

					embed
						.setTitle(`${EventName} ${EventAction}`)
						.setDescription(parseString(EventLanguage, attributes))
				} else {
					return console.log(attributes)
				}
			} else if (EventName === "ActivityLogged") {
				embed
					.setTitle(`User \`${attributes.model.actor ? attributes.model.actor.username : "Unknown"}\` Activity`)
					.setDescription(parseString(language.event.ActivityLogged[attributes.model.event], attributes))

				if (config.Show_IP_Address && attributes.model.ip) embed.addFields({
					name: "IP Address",
					value: attributes.model.ip
				})
			}
		} else {
			embed
				.setTitle(language[EventName][EventAction].title)
				.setDescription(parseString(language[EventName][EventAction].description, attributes))

		}

		webhook.send({
			content,
			embeds: [embed],
			threadId: config.discord.threadId || null
		})
	} catch (error) {
		console.error({
			Event: {
				name: EventName,
				action: EventAction
			},
		}, attributes, error)
	}
});

app.listen(config.port, () => {
	console.log(cliColor.cyanBright("[PelicanToDiscord] ") + cliColor.green("PelicanToDiscord server is online!"));
})