import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";

// Subscribe
export const subscribeToChannel = async (req, res) => {
  const subscriberId = req.user._id;
  const channelId = req.params.channelId;

  if (subscriberId.equals(channelId)) {
    return res.status(400).json({ message: "Cannot subscribe to yourself" });
  }

  const existing = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (existing) {
    return res.status(400).json({ message: "Already subscribed" });
  }

  await Subscription.create({
    subscriber: subscriberId,
    channel: channelId,
  });

  await User.findByIdAndUpdate(channelId, {
    $inc: { subscribersCount: 1 },
  });

  res.json({ message: "Subscribed" });
};

// Unsubscribe
export const unsubscribeFromChannel = async (req, res) => {
  const subscriberId = req.user._id;
  const channelId = req.params.channelId;

  await Subscription.findOneAndDelete({
    subscriber: subscriberId,
    channel: channelId,
  });

  await User.findByIdAndUpdate(channelId, {
    $inc: { subscribersCount: -1 },
  });

  res.json({ message: "Unsubscribed" });
};