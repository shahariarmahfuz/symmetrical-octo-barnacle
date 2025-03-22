const axios = require("axios");

module.exports = {
    name: "image",
    description: "Generate images from text using AI",
    nashPrefix: false,
    version: "1.0.0",
    cooldowns: 5,
    aliases: ["img", "aiimage"],
    usage: "[prompt]",
    example: "image a cat wearing sunglasses",
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
            api.sendMessage({body: "Please wait..."}, threadID, messageID);

            const response = await axios.get(`${global.NashBot.Zen}api/text2image?prompt=${encodeURIComponent(prompt)}`, {
                responseType: 'stream'
            });

            api.sendMessage({
                attachment: response.data
            }, threadID, (err) => {
                if (err) {
                    console.error("Error sending image:", err);
                    api.sendMessage({body: "Failed to send image. Please try again later.\n\nError: " + err.message}, threadID, messageID);
                }
            });

        } catch (error) {
            console.error("Error fetching data:", error);
            api.sendMessage({body: "Failed to fetch image. Please try again later.\n\nError: " + error.message}, threadID, messageID);
        }
    },
};