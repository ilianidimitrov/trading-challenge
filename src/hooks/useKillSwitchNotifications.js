import { useEffect, useRef } from "react";
import { checkDiscipline } from "../utils/discipline";

function requestPermission() {
  if (!("Notification" in window)) return Promise.resolve("unsupported");
  if (Notification.permission === "granted") return Promise.resolve("granted");
  if (Notification.permission === "denied") return Promise.resolve("denied");
  return Notification.requestPermission();
}

function sendNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/favicon.svg",
      tag: "kill-switch",
      requireInteraction: true,
    });
  } catch {
  }
}

export function useKillSwitchNotifications(trades, balance) {
  const prevCanTrade = useRef(true);
  const askedPermission = useRef(false);

  useEffect(() => {
    const discipline = checkDiscipline(trades, balance);

    if (!discipline.canTrade && prevCanTrade.current) {
      const alert = discipline.alerts.find(a => a.level === "danger");
      const text = alert?.text || "Kill switch активен. Пауза за деня.";

      if (!askedPermission.current && Notification.permission === "default") {
        askedPermission.current = true;
        requestPermission().then(() => {
          sendNotification("⛔ Binance Challenge — Kill Switch", text);
        });
      } else {
        sendNotification("⛔ Binance Challenge — Kill Switch", text);
      }
    }

    prevCanTrade.current = discipline.canTrade;
  }, [trades, balance]);
}

export async function enableNotifications() {
  return requestPermission();
}
