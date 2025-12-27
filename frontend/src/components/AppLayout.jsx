const getActiveViewFromPath = (pathname) => {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/calendar")) return "calendar";
  if (pathname.startsWith("/equipment")) return "equipment";
  if (pathname.startsWith("/teams")) return "teams";
  if (pathname.startsWith("/reports")) return "reports";
  return null;
};

export default getActiveViewFromPath;
