const axios = require("axios");

module.exports = {
    name: "mistral",
    description: "Mistral-SABA-24B AI",
    nashPrefix: false,
    version: "1.0.0",
    cooldowns: 5,
    aliases: ["mistral"],
    usage: "[prompt]",
    example: "mistral what is the capital of France?",
    category: "AI",
    execute: async (api, event, args, prefix) => {
        const { threadID, messageID } = event;
        let prompt = args.join(" ");

        if (!prompt) {
            return api.sendMessage({
                body: "Please enter a prompt. Example: `" + prefix + (module.exports.name || "") + " " + (module.exports.example ? module.exports.example.split(" ").slice(1).join(" ") : "") + "`"
            }, threadID, messageID);
        }

        try {
            const info = await api.sendMessage({body: "[ Mistral-SABA-24B ]\n\nPlease wait..."}, threadID, messageID);

            const response = await axios.get(`${global.NashBot.ZEN}api/mistral-saba-24b?query=${encodeURIComponent(prompt)}`);
            const reply = response.data.response;

            api.editMessage(reply, info.messageID);

        } catch (error) {
            console.error("Error fetching data:", error.message);
            api.sendMessage({body: "Failed to fetch data. Please try again later.\n\nError: " + error.message}, threadID, messageID);
        }
    },
};
