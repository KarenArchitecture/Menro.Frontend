import { useEffect, useState } from "react";

// This hook dynamically fetches a stylesheet from a URL and injects it into the page.
// It is the key to loading page-specific CSS without conflicts.
const usePageStyles = (stylesheetUrl) => {
  const [cssContent, setCssContent] = useState("");

  useEffect(() => {
    // Fetch the content of the CSS file as plain text
    fetch(stylesheetUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((text) => {
        setCssContent(text);
      })
      .catch((error) => {
        console.error("Error fetching the stylesheet:", error);
      });
  }, [stylesheetUrl]);

  useEffect(() => {
    // This effect runs only when the cssContent has been successfully fetched
    if (!cssContent) return;

    const styleElement = document.createElement("style");
    styleElement.id = "page-specific-style";
    styleElement.innerHTML = cssContent;
    document.head.appendChild(styleElement);

    // This cleanup function runs when the component unmounts, removing the styles
    return () => {
      const styleTag = document.getElementById("page-specific-style");
      if (styleTag) {
        document.head.removeChild(styleTag);
      }
    };
  }, [cssContent]);
};

export default usePageStyles;
