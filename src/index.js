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
const webhook = new WebhookClient({ url: config.webhook })

app.post('/post', async (req, res) => {
    const data = req.body
	
	if (config.debug) console.log(data)
	
	let EventName = data.event.split(": ")[1]
	let EventAction = data.event.split(": ")[0]
	const attributes = data.attributes[0]
	
	const embed = new EmbedBuilder()
	    .setTitle(`${EventName} ${EventAction}`)
	    .setTimestamp()
		
	let content = null	
	
	switch(EventAction) {
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
	
	if(EventAction !== "event") {
		if (language[EventName] && language[EventName][EventAction]) {
		    let text = language[EventName][EventAction]
			
			if (text.title.length < 1) text = {
				title: `${EventName} ${EventAction}`,
				description: `${EventAction === "created" ? "A new" : "The"} ${EventName.toLowerCase()} with the identifier \`${attributes.name || attributes.description || attributes.host || attributes.username}\` has been ${EventAction}.`
			}
		
			embed
                .setTitle(text.title)
				.setDescription(text.description.replace("{0}", attributes.name || attributes.description || attributes.host || attributes.username))
				
	    } else embed.setDescription(`${EventAction === "created" ? "A new" : "The"} ${EventName.toLowerCase()} with the identifier \`${attributes.name || attributes.description || attributes.host || attributes.username}\` has been ${EventAction}.`)
	} else {
		if (EventName.split("\\").length > 1) {
			EventAction = EventName.split("\\")[1]
			EventName = EventName.split("\\")[0]
			
			embed
			    .setTitle(`${EventName} ${EventAction}`)
				.setDescription(language[EventName][EventAction] || "No language text was found!")
			
		} else if (EventName === "ActivityLogged") {
			embed
			    .setTitle(`${attributes.actor ? attributes.actor.username : "Unknown"} Activity`)
			    .setDescription(language.event.ActivityLogged[attributes.event] || attributes.event)
		}
	}
	
	if (config.debug) content = "### Raw Data\n" + codeBlock("json", JSON.stringify(data.attributes, null, 2).substring(0, 4096))
	
	webhook.send({
		content,
		embeds: [embed],
		threadId: config.threadId || null
	})
});

app.listen(config.port, () => {
    console.log(`PelicanToDiscord server is online!`)
})
