interface MessageContentProps {
  text: string;
}

function MessageContent({ text }: MessageContentProps) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        const isAction = part.startsWith("**") && part.endsWith("**") && part.length >= 4;
        const isBold = part.startsWith("*") && part.endsWith("*") && !isAction && part.length >= 2;

        if (isAction) {
          const nextPart = parts[index + 1];

          return (
            <span key={index}>
              <em className="message-action text-textSecondary">{part.slice(2, -2)}</em>

              {nextPart && !nextPart.startsWith("\n") && (
                <br />
              )}
            </span>
          );
        }

        if (isBold) {
          return (
            <strong key={index}>{part.slice(1, -1)}</strong>
          );
        }

        return (
          <span key={index}>
            {part.split(/\n+/).map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {line}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}

export default MessageContent;