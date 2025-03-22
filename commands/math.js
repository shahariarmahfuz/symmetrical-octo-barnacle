const axios = require("axios");

module.exports = {
    name: "math",
    description: "Solve math problems using AI",
    nashPrefix: false,
    version: "1.0.0",
    cooldowns: 5,
    aliases: ["solve"],
    usage: "[math problem]",
    example: "math 2+2",
    category: "AI",
    execute: async (api, event, args, prefix) => {
        const { threadID, messageID } = event;
        let problem = args.join(" ");

        if (!problem) {
            return api.sendMessage({
                body: "Please enter a math problem. Example: `" + prefix + (module.exports.name || "") + " " + (module.exports.example ? module.exports.example.split(" ").slice(1).join(" ") : "") + "`"
            }, threadID, messageID);
        }

        try {
            const info = await api.sendMessage({body: "[ Math Solver ]\n\nSolving..."}, threadID, messageID);

            const response = await axios.get(`${global.NashBot.ZEN}api/mistral-saba-24b?query=${encodeURIComponent("Solve: " + problem)}`);
            const answer = response.data.response;

            api.editMessage(`🧮 Math Problem: ${problem}\n📖 Solution: ${answer}`, info.messageID);

        } catch (error) {
            console.error("Error fetching data:", error.message);
            api.sendMessage({body: "Failed to solve the math problem. Please try again later.\n\nError: " + error.message}, threadID, messageID);
        }
    },
};
