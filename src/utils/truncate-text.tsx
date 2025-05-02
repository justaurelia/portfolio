export  const truncateText = (text:string, lines:number) => {
   const splitText = text.split("\n");
   const truncatedText = splitText.slice(0, lines).join("\n");
   const remainingText = splitText.slice(lines).join("\n");
   return { truncatedText, remainingText };
};
