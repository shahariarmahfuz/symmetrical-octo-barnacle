const axios = require("axios");

module.exports = {
    name: "gemma",
    description: "interact with Gemma",
    nashPrefix: false,
    version: "1.0.0",
    cooldowns: 5,
    aliases: ["gemma"],
    execute(api, event, args, prefix) {
        const { threadID, messageID, senderID } = event;
        let prompt = args.join(" ");
        if (!prompt) return api.sendMessage("Please enter a prompt.", threadID, messageID);

        if (!global.handle) {
            global.handle = {};
        }
        if (!global.handle.replies) {
            global.handle.replies = {};
        }

        api.sendMessage(
            "[ AI Gemma-7B ]\n\n" +
            "please wait...",
            threadID,
            (err, info) => {
                if (err) return;

                axios.get(`${global.NashBot.ZEN}api/gemma-7b-it?query=${encodeURIComponent(prompt)}`)
                    .then(response => {
                        const reply = response.data.response;
                        api.editMessage(
                            reply,
                            info.messageID
                        );
                        global.handle.replies[info.messageID] = {
                            cmdname: module.exports.name,
                            this_mid: info.messageID,
                            this_tid: info.threadID,
                            tid: threadID,
                            mid: messageID,
                        };
                    })
                    .catch(error => {
                        console.error("Error fetching data:", error.message);
                        api.editMessage("Failed to fetch data. Please try again later.", info.messageID);
                    });
            },
            messageID
        );
    },
};
