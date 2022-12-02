const moment = require("moment/moment");
const userTimeLimit = require("../models/userTimeLimit_schema");

async function checkTimeLimit(user, game) {
  let hasAccess = Boolean;
  const { id } = user;
  const cooldown = await userTimeLimit.findById(id);

  if (cooldown === null) return (hasAccess = true);

  const userInfo = cooldown.games.find(({ gameName }) => gameName === game);

  if (userInfo === undefined) return (hasAccess = true);

  const { createdAt } = userInfo;
  const currentTime = moment().format();
  const time = timeDiffInHours(currentTime, createdAt);

  if (time >= 12) return (hasAccess = true);
  else {
    const timeCooldown = displayTimeLeft(currentTime, createdAt);
    hasAccess = false;
    return {
      time: timeCooldown,
      hasAccess: hasAccess,
    };
  }
}

const setTimeLimit = async (user, game) => {
  const { id, username } = user;
  const userInfo = await userTimeLimit.findById(id);
  const currentTime = moment().format();

  if (!userInfo) {
    await userTimeLimit({
      _id: id,
      username: username,
      createdAt: currentTime,
      games: [
        {
          gameName: game,
          createdAt: currentTime,
        },
      ],
    }).save();
  } else {
    const gameTimeLimit = await userTimeLimit.findOneAndUpdate(
      { "games.gameName": game, _id: id },
      {
        $set: {
          "games.$.createdAt": currentTime,
        },
      },
      { new: true }
    );

    if (gameTimeLimit === null) {
      userInfo.games.push({
        gameName: game,
        createdAt: currentTime,
      });

      userInfo.save();
    }
  }
};

function timeDiffInHours(currentTime, createdAt) {
  const currTime = moment(currentTime);
  const created = moment(createdAt);
  return currTime.diff(created, "hours");
}

const displayTimeLeft = (currentTime, createdAt) => {
  const currTime = moment(currentTime);
  const created = moment(createdAt);

  return moment
    .utc(moment(currTime, "HH:mm:ss").diff(moment(created, "HH:mm:ss")))
    .format("HH:mm:ss");
};

module.exports = {
  checkTimeLimit,
  setTimeLimit,
};
