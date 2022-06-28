const { SlashCommandBuilder } = require("@discordjs/builders");
const OngoingReminder = require("../schemas/OngoingReminder");
const { Types } = require("mongoose");
const parseDuration = require("parse-duration");
const Reminder = require("../schemas/Reminder");

const { 
    MessageEmbed, 
    MessageCollector, 
    MessageActionRow, 
    MessageButton } = require("discord.js");
const { addOngoingReminderDuringRuntime } = require("../functions/runAllReminders");



module.exports = {
    data: new SlashCommandBuilder()
            .setName("reminder")
            .setDescription("Allows usage of reminder focused features."),

    cooldown: 10,
    async msgExecute(message, args, client) {

        switch (args[1].toLowerCase()) {
            case "create":
                createReminder();
                break;
            case "activate":
                activateReminder();
                break;
            case "preview":
                sendReminderPreview();
                break;
            case "delete":
                deleteReminder();
                break;
        }

        async function createReminder() {
            let validColors = [
                'DEFAULT',
                'WHITE',
                'AQUA',
                'GREEN',
                'BLUE',
                'YELLOW',
                'PURPLE',
                'LUMINOUS_VIVID_PINK',
                'FUCHSIA',
                'GOLD',
                'ORANGE',
                'RED',
                'GREY',
                'DARKER_GREY',
                'NAVY',
                'DARK_AQUA',
                'DARK_GREEN',
                'DARK_BLUE',
                'DARK_PURPLE',
                'DARK_VIVID_PINK',
                'DARK_GOLD',
                'DARK_ORANGE',
                'DARK_RED',
                'DARK_GREY',
                'LIGHT_GREY',
                'DARK_NAVY',
                'BLURPLE',
                'GREYPLE',
                'DARK_BUT_NOT_BLACK',
                'NOT_QUITE_BLACK',
                'RANDOM'
            ]

            let reminderOptions = {};

            reminderOptions.creationDate = new Date();
            reminderOptions.createdBy = `${message.author.id}`

            const collector = new MessageCollector(message.channel, 
                {
                    filter: msg => msg.author.id == message.author.id,
                    time: 60000
                });

                let questions = [
                    "What will be this reminder's name? **Required** \n (Make sure it is less than 15 characters)",
                    "Write the description of this reminder? \n `DEFAULT` if none.",
                    "What color will this reminder be? \n `DEFAULT` if none.",
                    "What will the footer of this reminder say? \n `DEFAULT` if none.",
                    "What image will this reminder use? \n  `DEFAULT` if none. \n (Must be an image url)",
                    "Will this reminder contain any fields? \n `DEFAULT` if none. \n (Must follow proper JSON format having a `name` and `value` property.)  \n https://www.w3schools.com/whatis/whatis_json.asp"
                ];

                let stage = 0;

                message.reply(questions[stage]);
                
                collector.on("collect", (msg) => {
                    if (msg.content === "_cancel_") return collector.stop("processCancelled");

                    switch (stage) {
                        case 0:
                            if (msg.content.length > 20) return msg.reply("Too many letters! Make sure your title only has 15 or less letters in it.");
                            reminderOptions.title = msg.content;
                            stage++;
                            msg.reply(questions[stage]);
                            break;

                        case 1:
                            if (msg.content.length >= 2000) return msg.reply("Too many letters! Descriptions can't be longer than 2000 letters.");
                            if (msg.content.toUpperCase() === "DEFAULT") {
                                stage++;
                               return msg.reply(questions[stage]);
                            };
                            reminderOptions.description = msg.content;
                            stage++;
                            msg.reply(questions[stage]);
                            break;

                        case 2:
                            if (!validColors.includes(msg.content.toUpperCase().replace(" ", "_"))) return msg.reply("Color invalid! Please make sure you spelt it correctly.");
                            if (msg.content.toUpperCase() === "DEFAULT") {
                                stage++;
                               return msg.reply(questions[stage]);
                            }
                            reminderOptions.embedColor = msg.content.toUpperCase();
                            stage++;
                            msg.reply(questions[stage]);
                            break;

                        case 3:
                            if (msg.content.length > 20) return msg.reply("Too many letters! Make sure your footer only has 15 or less letters in it.");
                            if (msg.content.toUpperCase() === "DEFAULT") {
                                stage++;
                               return msg.reply(questions[stage]);
                            };
                            reminderOptions.embedFooter = msg.content;
                            stage++;
                            msg.reply(questions[stage]);
                            break;

                        case 4:
                            let urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
                            if (msg.content.toUpperCase() === "DEFAULT") {
                                stage++
                                return msg.reply(questions[stage]);
                            }
                            if (!urlRegExp.test(msg.content)) return msg.reply("This does not look like a url! Please try again.");
                            reminderOptions.embedThumbnail = msg.content;
                            stage++
                            msg.reply(questions[stage]);
                            break;
                        
                        case 5:
                            let fieldData;
                            if (msg.content.toUpperCase() === "DEFAULT") return collector.stop("processComplete");
                            
                            try {
                                fieldData = JSON.parse(`[${msg.content}]`);
                            } catch (err) {
                                return msg.reply(`Failed to parse JSON data. \n \`\`\`js\n ${err} \n\`\`\``);
                            }

                            for (let field of fieldData) {
                                if (!field.name && typeof field.name !== "string") return msg.reply("1. Field names must strictly be named as \"name\". \n 2. Field names must be a type of \"string\".");
                                if (!field.value && typeof field.value !== "string") return msg.reply("1. Field values must strictly be named as \"value\". \n 2. Field values must be a type of \"string\".");

                                if (field.name.length > 256) return msg.reply("Field names can only be 256 characters long.");
                                if (field.value.length > 1024) return msg.reply("Field values can only be 1024 characters long.");
                            }
                            
                            reminderOptions.embedFields = fieldData;
                            collector.stop("processComplete");
                            break;
                    }
                });

                collector.on("end", async (_, reason) => {
                    switch (reason) {

                        case "processComplete":
                            const reminder = await Reminder.create(reminderOptions);

                            let embed = new MessageEmbed()
                            .setTitle(`${reminderOptions.title} (Reminder Id: ${reminder._id})`)
                            .setDescription(reminder.description)
                            .setColor(reminderOptions.embedColor)
                            .setFooter({text: `${reminder.embedFooter}`})
                            .setThumbnail(reminder.embedThumbnail);

                            if (reminderOptions.embedFields) {
                                for (field of reminderOptions.embedFields) {
                                    embed.addField(field.name, field.value);
                                }
                            }

                            message.reply({
                                content: `Reminder created! ✅`,
                                embeds: [
                                    embed
                                ]
                            })
                            break;

                        case "processCancelled":
                            message.reply("Creation cancelled.")
                            break;

                        case "time":
                                message.reply("You took too long to respond.");
                                break;

                        
                    }

                })
        }

       async function activateReminder() {
            let reminderId = args[2];
            let humanDuration = args[3];
            let channel = args[4];

            if (!reminderId) return message.reply("You must provide the Id of the reminder template you wish to activate.");

            if (!humanDuration) return message.reply("You must provide a date upon which this reminder will trigger.");

            if (!channel) return message.reply("You did not specify which text channel this reminder will be notified to you.");

            let durationInMs = parseDuration(humanDuration);

            if (durationInMs > Number.MAX_SAFE_INTEGER) return message.reply("Reminder date too large.");

            if (durationInMs > 3.1536E+10) return message.reply("Reminder date cannot be longer than a year.");

            let reminder = await Reminder.findOne({ createdBy: message.author.id, _id: reminderId });

            if (!reminder) return message.reply(`You do not have a reminder template with the id \`${reminderId}\` `);

            let triggerDate = new Date(Date.now() + durationInMs);
            
            const activatedReminder = await OngoingReminder.create({
                reminder: new Types.ObjectId(reminder._id),
                triggerDate: triggerDate,
                triggerOnChannel: channel,
                activatedBy: message.author.id
            });

            addOngoingReminderDuringRuntime(activatedReminder, client);

            message.reply("Reminder activated!");

            return;

        }

        async function sendReminderPreview() {
            args.shift();
            args.shift();
            let listofReminderIds = args;

            if (listofReminderIds.length > 5) return message.reply("Cannot preview more than 5 reminders at once.");

            let filteredReminders = [];

            for (let _id of listofReminderIds) {
                let reminder = await Reminder.findById(_id);

                if (reminder) filteredReminders.push(reminder);
            }

            if (!filteredReminders || filteredReminders.length == 0) 
                return message.reply(`You don't have reminder templates with the Ids \n \`${listofReminderIds.map(id => `${id} \n`)}\``);

            let embedArray = [];

            for (let reminder of filteredReminders) {
                let embed = new MessageEmbed()
                .setTitle(`${reminder.title} (Reminder Id: ${reminder._id})`)
                .setDescription(reminder.description)
                .setColor(reminder.embedColor)
                .setFooter({
                    text: reminder.embedFooter
                })
                .setThumbnail(reminder.embedThumbnail);

                if (reminder.embedFields) {
                    for (let field of reminder.embedFields) embed.addField(field.name, field.value);
                }

                embedArray.push(embed);
            }

            message.reply({
                content: "Here are the reminders you requested to preview",
                embeds: embedArray
            });

            return;

        }

        async function deleteReminder() {
            let reminderId = args[2];

            if (!reminderId) return message.reply("You must provide the reminder template's Id.");

            let userReminder = await Reminder.findOne({
                createdBy: message.author.id,
                _id: reminderId
            })

            if (!userReminder) return message.reply(`You have not created a reminder template with an id of ${reminderId}`);

            const msg = await message.reply({
                content: "Are you sure you want to delete this reminder?",
                embeds: [
                    new MessageEmbed()
                    .setTitle(`${userReminder.title} (Reminder Id: ${userReminder._id})`)
                    .setDescription(userReminder.description)
                    .setColor(userReminder.embedColor)
                    .setFooter({text: `${userReminder.embedFooter}`})
                    .setFields({ name: "" })
                    .setThumbnail(userReminder.embedThumbnail)
                ],
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                        .setEmoji("✔️")
                        .setLabel("Yes")
                        .setStyle("DANGER")
                        .setCustomId("agree"),
                    
                    new MessageButton()
                        .setEmoji("❌")
                        .setLabel("No")
                        .setStyle("SUCCESS")
                        .setCustomId("disagree")
                    )
                ]
            });

            const collector = msg.createMessageComponentCollector({
                filter: buttonInteraction => buttonInteraction.user.id === message.author.id,
                max: 1,
                time: 30000
            });

            collector.on("collect", async (i) => {
                switch (i.customId) {
                    case "agree":
                        await Reminder.findOneAndDelete({ _id: reminderId });
                        i.message.edit({
                            embeds: [
                                new MessageEmbed()
                                .setTitle("Reminder deleted.")
                            ]
                        });

                        i.reply("Reminder template deleted.");
                        break;
                    
                    case "disagree":
                        i.reply("Interaction cancelled.");
                        break;
                }
            });

            collector.on("end", _ => {
                        msg.edit({
                            components: [
                                new MessageActionRow().addComponents(
                                    new MessageButton()
                                    .setEmoji("✔️")
                                    .setLabel("Yes")
                                    .setStyle("DANGER")
                                    .setCustomId("agree")
                                    .setDisabled(true),
                                
                                new MessageButton()
                                    .setEmoji("❌")
                                    .setLabel("No")
                                    .setStyle("SUCCESS")
                                    .setCustomId("disagree")
                                    .setDisabled(true)
                                )
                            ]
                        });

                        return;
                
            })

            return;
        }
    }
}