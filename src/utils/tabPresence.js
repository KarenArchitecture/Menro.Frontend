const CHANNEL_NAME = "menro-tab-presence";
const TAB_ID = crypto.randomUUID();

/**
 * باید یک‌بار و در سطح کل اپلیکیشن (main.jsx) صدا زده شود، تا این تب
 * بتواند به «ping» تب‌های دیگر جواب بدهد و حضورش را اعلام کند.
 */
export function registerTabPresence() {
  if (typeof BroadcastChannel === "undefined") return () => {};

  const channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = (event) => {
    if (event.data?.type === "ping" && event.data.tabId !== TAB_ID) {
      channel.postMessage({
        type: "pong",
        tabId: TAB_ID,
        replyTo: event.data.tabId,
      });
    }
  };

  return () => channel.close();
}

/**
 * بررسی می‌کند آیا تب دیگری از سایت (غیر از خودِ این تب) باز است یا نه.
 * Promise<boolean> برمی‌گرداند.
 */
export function checkOtherTabsOpen(timeoutMs = 150) {
  return new Promise((resolve) => {
    if (typeof BroadcastChannel === "undefined") {
      resolve(false);
      return;
    }

    const channel = new BroadcastChannel(CHANNEL_NAME);
    let resolved = false;

    channel.onmessage = (event) => {
      if (
        event.data?.type === "pong" &&
        event.data.replyTo === TAB_ID &&
        !resolved
      ) {
        resolved = true;
        channel.close();
        resolve(true);
      }
    };

    channel.postMessage({ type: "ping", tabId: TAB_ID });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        channel.close();
        resolve(false);
      }
    }, timeoutMs);
  });
}
