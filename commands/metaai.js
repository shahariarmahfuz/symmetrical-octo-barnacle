const axios = require("axios");

module.exports = {
    name: "metaai",
    description: "Interact with Meta AI (Llama)",
    nashPrefix: false,
    version: "1.0.0",
    cooldowns: 5,
    aliases: [],
    usage: "[prompt]",
    example: "metaai Tell me a story.",
    category: "AI",
    execute: async (api, event, args, prefix) => {
        const { threadID, messageID } = event;
        let prompt = args.join(" ");

        if (!prompt) {
            api.sendMessage({
                body: "Please enter a prompt. Example: `" + prefix + (module.exports.name || "") + " " + (module.exports.example ? module.exports.example.split(" ").slice(1).join(" ") : "") + "`"
            }, threadID, messageID);
            return;
        }

        try {
            const info = await api.sendMessage({body: "[ Meta AI (Llama) ]\n\nPlease wait..."}, threadID, messageID);
            const response = await axios.get(`${global.NashBot.ZEN}api/metaai?prompt=${encodeURIComponent(prompt)}`);
            let reply = response.data;
            api.editMessage(reply, info.messageID);
        } catch (error) {
            api.sendMessage({body: "Failed to fetch data. Please try again later.\n\nError: " + error.message}, threadID, messageID);
        }
    },
};