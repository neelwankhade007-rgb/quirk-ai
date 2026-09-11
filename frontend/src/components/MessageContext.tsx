interface MessageContentProps {
  text: string;
}

function MessageContent({ text }: MessageContentProps) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        const isAction =
          part.startsWith("**") && part.endsWith("**");

        if (isAction) {
          const nextPart = parts[index + 1];

          return (
            <span key={index}>
              <em>{part.slice(2, -2)}</em>

              {nextPart && !nextPart.startsWith("\n") && (
                <br />
              )}
            </span>
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