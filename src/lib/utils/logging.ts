export const sendGtagEvent = (
  event: string,
  params?: { [key: string]: string | number }
) => {
  // if (process.env.NODE_ENV === 'production') {
  gtag("event", `customEvent-${event}`, params);
  // }
};
