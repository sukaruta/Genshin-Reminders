const { MessageEmbed } = require("discord.js");

const OngoingReminders = require("../schemas/OngoingReminder");
const Reminders = require("../schemas/Reminder");

const countdown = (ms) => new Promise(resolve => 
    setTimeout(() => resolve(), ms)
  );

let runningReminders = new Map();

module.exports = {
    async initalizeAllOngoingReminders(client) {
        const ongoingReminders = await OngoingReminders.find();

        ongoingReminders.forEach( ongoingReminder => {
            if (!runningReminders.has(ongoingReminder._id)) 
                runningReminders
                    .set(ongoingReminder._id, async () => {
                        let durationInMs = ongoingReminder.triggerDate - Date.now();

                        let dividedDate = [];
            
                        while (durationInMs > 2147483647) {
                            durationInMs = durationInMs - 2147483647;
                            dividedDate.push(2147483647);
                        }
            
                        dividedDate.push(durationInMs);
            
                        while (dividedDate.length > 0) {
                            await countdown(dividedDate[0]);
                            dividedDate.shift();
                        }

                        triggerReminder(ongoingReminder);
                    });

                    runningReminders.get(ongoingReminder._id)();
        });

        async function triggerReminder(dueReminder) {
            const reminder = await Reminders.findById(dueReminder.reminder);
            const channel = await client.channels.fetch(dueReminder.triggerOnChannel);
    
            channel.send({
                content: `<@${reminder.createdBy}>`,
                embeds: [
                    new MessageEmbed()
                    .setTitle(reminder.title)
                    .setDescription(reminder.description)
                    .setColor(reminder.embedColor)
                    .setFooter({
                        text: reminder.embedFooter
                    })
                    .setThumbnail(reminder.embedThumbnail)
                ]
            })
    
            runningReminders.delete(dueReminder._id);
            await OngoingReminders.findByIdAndDelete(dueReminder._id);
        }
    },

    async addOngoingReminderDuringRuntime(ongoingReminder, client) {

        runningReminders.set(ongoingReminder._id, async () => {
            let durationInMs = ongoingReminder.triggerDate - Date.now();

            let dividedDate = [];

            while (durationInMs > 2147483647) {
                durationInMs = durationInMs - 2147483647;
                dividedDate.push(2147483647);
            }

            dividedDate.push(durationInMs);

            while (dividedDate.length > 0) {
                await countdown(dividedDate[0]);
                dividedDate.shift();
            }

            triggerReminder(ongoingReminder);
        });

        runningReminders.get(ongoingReminder._id)();

        async function triggerReminder(dueReminder) {
            const reminder = await Reminders.findById(dueReminder.reminder);
            const channel = await client.channels.fetch(dueReminder.triggerOnChannel);
    
            channel.send({
                content: `<@${reminder.createdBy}>`,
                embeds: [
                    new MessageEmbed()
                    .setTitle(reminder.title)
                    .setDescription(reminder.description)
                    .setColor(reminder.embedColor)
                    .setFooter({
                        text: reminder.embedFooter
                    })
                    .setThumbnail(reminder.embedThumbnail)
                ]
            })
    
            runningReminders.delete(dueReminder._id);
            await OngoingReminders.findByIdAndDelete(dueReminder._id);
        }
    }

    
}