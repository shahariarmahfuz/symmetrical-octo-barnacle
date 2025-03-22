const fs = require("fs");
const path = require("path");

process.on("unhandledRejection", () => {});
process.on("uncaughtException", () => {});

module.exports = {
  name: "joinNoti",
  version: "1.0.0",
  description: "Join notifications",
  author: "joshuaApostol",
  async onEvent({ api, event }) {
    try {
      const { logMessageType, logMessageData, threadID } = event;
      const currentUserID = await api.getCurrentUserID();
      const threadInfo = await api.getThreadInfo(threadID).catch(() => null);

      if (!threadInfo || !Array.isArray(threadInfo.participantIDs)) return;
      if (!threadInfo.participantIDs.includes(currentUserID)) return;

      if (logMessageType === "log:subscribe") {
        const { addedParticipants } = logMessageData;
        const participantsList = addedParticipants.map(i => i.fullName).join(", ");
        
        const userWelcome = `Welcome ${participantsList} let's enjoy and learning together.`;

        const welcomeFolder = path.join(__dirname, "welcome");
        fs.readdir(welcomeFolder, (err, files) => {
          if (err || !files || !Array.isArray(files)) return;

          const videoFiles = files.filter(file =>
            [".mp4", ".mov", ".avi", ".mkv"].includes(path.extname(file).toLowerCase())
          );

          if (videoFiles.length > 0) {
            const randomVideo = videoFiles[Math.floor(Math.random() * videoFiles.length)];
            const videoStream = fs.createReadStream(path.join(welcomeFolder, randomVideo));

            api.sendMessage({ body: userWelcome, attachment: videoStream }, threadID).catch(() => {});
          } else {
            api.sendMessage(userWelcome, threadID).catch(() => {});
          }
        });
      }
    } catch (err) {}
  },
};
